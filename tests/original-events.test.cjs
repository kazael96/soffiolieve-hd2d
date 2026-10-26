const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {FieldEventVM,messagePages,cmp}=require('../src/field-event-vm.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../src/original-events.js'),'utf8'),context);
const data=context.window.ORIGINAL_EVENTS;

test('Every extracted branch and movement pointer resolves; no guessed instructions',()=>{
 let instructions=0;
 for(const [bank,p] of Object.entries(data.scripts)){
  assert.match(p.sourceSha256,/^[a-f0-9]{64}$/);
  for(const entry of p.supportedEntries)assert.ok(p.code[p.entries[entry]],`${bank} entry ${entry}`);
  for(const [at,c] of Object.entries(p.code)){
   instructions++;
   if(['VMJump','VMCall'].includes(c.name))assert.ok(p.code[c.args[0]],`${bank}:${at}`);
   if(c.name==='VMJumpIf')assert.ok(p.code[c.args[1]],`${bank}:${at}`);
   if(!['VMHalt','VMReturn','VMJump','RTEndGlobal'].includes(c.name))assert.ok(p.code[c.end],`${bank}:${at} next`);
   if(c.name==='ActorCmdExec')assert.equal(p.movements[c.args[1]].at(-1)[0],254);
  }
 }
 assert.equal(instructions,1813);
 const route=data.scripts[634].code;
 assert.equal(route[158].name,'CallCaptureDemo');
 assert.equal(route[158].args.length,0,'IRBI handler reads no operand');
 assert.equal(route[route[158].end].name,'EVCameraInit','Camera command must not be consumed as an argument');
});

test('Original Italian location and event text are retained, including placeholders and paging',()=>{
 assert.match(data.texts[349][6],/Quattroventi/);
 assert.match(data.texts[430][0],/\{0100:0\}/);
 assert.match(data.texts[430][2],/Eccomi! Scusateee!/);
 assert.match(data.texts[435][5],/soprannome/);
 const pages=messagePages(data.texts[430][0],{0:'Alcide'});
 assert.equal(pages[0],'Komor: Ehi, Alcide!');
 assert.equal(pages[1],'Non vedo l\'ora che la Prof.ssa Aralia mi\ndia il mio primo Pokémon!');
});

function machine(code,host={command:async()=>false}){
 const instructions=Object.fromEntries(code.map(([name,args=[]],i)=>[i,{name,args,op:i,end:i+1}]));
 const state={vars:{},flags:[]};return new FieldEventVM({scripts:{1:{entries:[0],supportedEntries:[0],code:instructions}}},state,host);
}

test('VM preserves constant versus indirect assignment, comparisons, calls and flags',async()=>{
 const m=machine([
  ['WorkSetConst',[0x4000,0x4001]],['WorkSetConst',[0x4001,7]],['WorkSet',[0x4002,0x4001]],
  ['StackPush',[0x4002]],['StackPushConst',[8]],['StackCmp',[1]],['VMJumpIf',[255,9]],
  ['FlagSet',[99]],['VMHalt'],['VMCall',[12]],['FlagSet',[1]],['VMHalt'],['FlagSet',[2]],['VMReturn']
 ]);
 await m.run(1,0);assert.equal(m.state.vars[0x4000],0x4001);assert.equal(m.state.vars[0x4002],7);assert.deepEqual(m.state.flags,[2,1]);
 assert.equal(cmp(0,1,2),true);assert.equal(cmp(3,2,2),true);assert.equal(cmp(4,2,2),true);assert.equal(cmp(5,2,2),false);
});

test('An unsupported engine effect stops playback instead of silently simplifying it',async()=>{
 for(const result of [false,undefined]){
  const m=machine([['OriginalEffect'],['FlagSet',[1]],['VMHalt']],{command:async()=>result});
  await assert.rejects(m.run(1,0),/Unsupported IRBI instruction/);assert.deepEqual(m.state.flags,[]);assert.equal(m.running,false);
 }
});

test('Async engine commands complete before the original next instruction',async()=>{
 let release;const gate=new Promise(r=>release=r);
 const m=machine([['OriginalEffect'],['FlagSet',[1]],['VMHalt']],{command:async()=>{await gate;return true;}});
 const pending=m.run(1,0);assert.deepEqual(m.state.flags,[]);await assert.rejects(m.run(1,0),/already running/);
 release();await pending;assert.deepEqual(m.state.flags,[1]);
});

test('The original bedroom intro emits its complete message order and simultaneous movements',async()=>{
 const messages=[],movements=[];
 const m=new FieldEventVM(data,{vars:{},flags:[]},{playerName:()=> 'Alcide',command:async(c,a)=>{
  if(c.name==='MsgActorEx')messages.push(a[1]);
  if(c.name==='ActorCmdExec')movements.push([a[0],a[1]]);
  return true; // Trace-only host: deliberately no claim of rendering coverage.
 }});
 await m.run(782,4);
 assert.deepEqual(messages,[0,1,2,3,4,5,6,7]);assert.equal(m.state.vars[16513],1);
 assert.ok(movements.some(([actor])=>actor===255));assert.ok(movements.some(([actor])=>actor===1));
 assert.ok(m.state.flags.includes(2434));assert.ok(!m.state.flags.includes(501));
});

test('Stack condition branches on false, independently of numeric comparison branches',async()=>{
 for(const condition of [0,1]){const m=machine([['StackPushConst',[condition]],['VMJumpIf',[255,4]],['FlagSet',[10]],['VMHalt'],['FlagSet',[20]],['VMHalt']]);await m.run(1,0);assert.deepEqual(m.state.flags,condition?[10]:[20]);}
});
