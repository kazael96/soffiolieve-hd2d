'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('./helpers/audio-engine-fixture.cjs');
async function setup(rate=1){
 const f=fixture(),c=f.c,timers=new Map();let next=0;
 c.performance={now:()=>0};c.setTimeout=(fn,ms)=>({fn,ms});c.clearTimeout=()=>{};c.Image=class{};
 Object.assign(c.GameSpeed,{rate,now:()=>0,schedule(fn,ms){timers.set(++next,{fn,ms});return next;},cancel(id){timers.delete(id);},flush(){}});
 c.NATIVE_AUDIO_BANK={moves:{205:[{voices:[{order:0,end:100,keys:{normal:'normal',slow:'slow',p2normal:'p2normal',p2slow:'p2slow'}}]}]},clips:Object.fromEntries(['normal','slow','p2normal','p2slow'].map(k=>[k,{src:k+'.flac'}]))};
 c.ROM_MOVE_FX={moves:{205:{id:205,variants:[{commands:[[52,[1351,0,16,0]]]}]}},spas:{}};
 vm.runInContext(fs.readFileSync(require.resolve('../src/move-fx.js'),'utf8'),c,{filename:'move-fx.js'});
 await f.api.enable();return{...f,timers};
}
async function finish(f,p){await new Promise(setImmediate);assert.equal(f.timers.size,1,'Actual move must finish preparing and own one completion timer');[...f.timers.values()][0].fn();await p;}
for(const side of ['p1','p2'])test('cold actual native audio is audible at matching effective speed on '+side,async()=>{
 for(const playback of [.5,1])for(const rate of [1,2,4]){
  const f=await setup(rate);f.c.MoveFX.speed=playback;
  const playing=f.c.MoveFX.play(205,side,{});await finish(f,playing);
  const voices=f.fieldStarts(),expected=(side==='p2'?'p2':'')+(playback*rate===.5?'slow':'normal')+'.flac';
  assert.equal(voices.length,1,`${playback} at x${rate}: prepared clip must actually be selected and started`);
  assert.equal(voices[0].src,expected);assert.equal(f.reads.filter(src=>src===expected).length,1);assert.equal(f.api.errors.length,0);
 }
});
test('a rate changed during cold preparation is prepared before the native voice starts',async()=>{
 const f=await setup(1),gate=f.hold('slow.flac');f.c.MoveFX.speed=.5;
 const playing=f.c.MoveFX.play(205,'p1',{});await f.drain();assert(f.reads.includes('slow.flac'));assert.equal(f.fieldStarts().length,0);
 f.c.GameSpeed.rate=2;gate.resolve();await finish(f,playing);
 assert(f.reads.includes('normal.flac'));assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0].src,'normal.flac');
});
test('changing the slow preference while preparing does not change the captured action speed',async()=>{
 const f=await setup(1),gate=f.hold('slow.flac');f.c.MoveFX.speed=.5;
 const playing=f.c.MoveFX.play(205,'p1',{});await f.drain();f.c.MoveFX.speed=1;gate.resolve();await finish(f,playing);
 assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0].src,'slow.flac');
});
test('cancelling a cold preparation cannot resurrect a move or play its old audio',async()=>{
 const f=await setup(1),gate=f.hold('slow.flac');f.c.MoveFX.speed=.5;
 const playing=f.c.MoveFX.play(205,'p1',{});await f.drain();f.c.MoveFX.cancel();f.c.GameSpeed.rate=4;gate.resolve();await playing;
 assert.equal(f.c.MoveFX.active,null);assert.equal(f.timers.size,0);assert.equal(f.fieldStarts().length,0);
});
function authored(f,prepare){
 const c=f.c,p={species:521,id:16,frames:126,impact:60,nativeEffects:true};
 c.ROM_MOVE_FX.moves[16]={...c.ROM_MOVE_FX.moves[205],id:16};c.NATIVE_AUDIO_BANK.moves[16]=c.NATIVE_AUDIO_BANK.moves[205];
 vm.runInContext(fs.readFileSync(require.resolve('../src/species-moves.js'),'utf8'),c);
 c.SpeciesMoves.select=()=>p;c.SpeciesMoves.prepare=prepare;return p;
}
test('play prepares authored profile assets before exposing its first active frame',async()=>{
 const f=await setup();let release,calls=0;const gate=new Promise(resolve=>release=resolve),p=authored(f,async(profile,options)=>{calls++;assert.equal(profile,p);assert.equal(options.cryIds.p1,'521-female');assert.equal(options.side,'p1');await gate;});
 const playing=f.c.MoveFX.play(16,'p1',{cryIds:{p1:'521-female',p2:521}});
 try{await new Promise(setImmediate);assert.equal(calls,1);assert.equal(f.c.MoveFX.active,null);assert.equal(f.timers.size,0);release();await finish(f,playing);}finally{release();f.c.MoveFX.cancel();}
});
test('preview waits for the same authored readiness barrier',async()=>{
 const f=await setup();let release,calls=0;const gate=new Promise(resolve=>release=resolve);authored(f,async()=>{calls++;await gate;});
 const loading=f.c.MoveFX.preview(16,'p2',0,{cryIds:{p1:521,p2:521}});
 try{await new Promise(setImmediate);assert.equal(calls,1);assert.equal(f.c.MoveFX.active,null);release();assert.equal(await loading,126);assert.equal(f.c.MoveFX.active.preview,true);}finally{release();f.c.MoveFX.cancel();}
});
test('an authored source error rejects without a half-ready action and can be retried',async()=>{
 for(const mode of['play','preview']){
  const f=await setup();let calls=0;authored(f,async()=>{if(++calls===1)throw Error('Injected authored source unavailable');});
  const run=()=>mode==='play'?f.c.MoveFX.play(16,'p1',{cryIds:{p1:521,p2:521}}):f.c.MoveFX.preview(16,'p1',0,{cryIds:{p1:521,p2:521}}),failed=run().then(()=>({ok:true}),error=>({error}));
  try{await new Promise(setImmediate);assert.equal(calls,1);const result=await failed;assert.match(result.error?.message||'',/authored source unavailable/);assert.equal(f.c.MoveFX.active,null);assert.equal(f.timers.size,0);
   const retry=run();if(mode==='play')await finish(f,retry);else assert.equal(await retry,126);assert.equal(calls,2);
  }finally{f.c.MoveFX.cancel();}
 }
});
test('late authored preparation errors after cancellation do not revive or fail a newer action',async()=>{
 for(const mode of['play','preview']){
  const f=await setup();let reject,calls=0;const gate=new Promise((_,bad)=>reject=bad);authored(f,async()=>{calls++;await gate;});
  const loading=(mode==='play'?f.c.MoveFX.play(16,'p1',{cryIds:{p1:521,p2:521}}):f.c.MoveFX.preview(16,'p1',0,{cryIds:{p1:521,p2:521}})).then(value=>({value}),error=>({error}));
  try{await new Promise(setImmediate);assert.equal(calls,1);f.c.MoveFX.cancel();reject(Error('Stale authored load failure'));const result=await loading;assert.equal(result.error,undefined);assert.equal(f.c.MoveFX.active,null);assert.equal(f.timers.size,0);}finally{f.c.MoveFX.cancel();}
 }
});
