const test=require('node:test'),assert=require('node:assert/strict'),{create,normalize}=require('../src/finale-completion.js');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function nativePreparation(){
 const c={window:{}};for(const name of ['finale-completion-data','native-return-location-data'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+name+'.js'),'utf8'),c);
 return{data:c.window.FINALE_COMPLETION,VM:require('../src/field-event-vm.js').FieldEventVM,returnLocation:require('../src/native-return-location.js').create(c.window.NATIVE_RETURN_LOCATIONS)};
}
function fixture(){
 const native={zone:278,vars:{16566:5},flags:[]},calls=[],disk=[];
 const options={native,save(){disk.push(structuredClone(native));return true;},async credits(){calls.push('credits');},async departure(id){calls.push(id);},async prepare(){calls.push('prepare');native.flags.push(2400);},async end(){calls.push('end');},complete(){calls.push('complete');}};
 return{native,calls,disk,options};
}
test('first ending runs Black credits, film7, native preparation and END with durable boundaries',async()=>{
 const f=fixture();await create(f.options).run();assert.deepEqual(f.calls,['credits',7,'prepare','end','complete']);assert.deepEqual(f.disk.map(n=>n.firstEnding.stage),['credits','departure','prepare','end','complete']);assert.equal(f.native.vars[16566],5);assert.ok(!f.native.flags.includes(2427));
});
test('write failure retries persistence without rerunning preparation or granting second completion',async()=>{
 const f=fixture();let failures=0;f.options.save=()=>{if(f.native.firstEnding.stage==='end'&&failures++<2)return false;return true;};f.options.recover=async()=>{};await create(f.options).run();assert.equal(f.calls.filter(x=>x==='prepare').length,1);assert.equal(failures,3);assert.ok(!f.native.flags.includes(2427));
});
test('reload at every durable boundary resumes only remaining components',async()=>{
 const initial=fixture();await create(initial.options).run();for(const saved of initial.disk){const f=fixture();Object.assign(f.native,structuredClone(saved));await create(f.options).run();const remaining={credits:['credits',7,'prepare','end','complete'],departure:[7,'prepare','end','complete'],prepare:['prepare','end','complete'],end:['end','complete'],complete:['complete']};assert.deepEqual(f.calls,remaining[saved.firstEnding.stage]);}
});
test('concurrent callers share a single ending and a component error keeps its retry stage',async()=>{
 const f=fixture();let release;f.options.credits=()=>new Promise(resolve=>release=resolve);const flow=create(f.options),a=flow.run(),b=flow.run();assert.equal(a,b);await new Promise(resolve=>setImmediate(resolve));release();await a;assert.equal(f.calls.filter(x=>x===7).length,1);
 const g=fixture();g.options.departure=async()=>{throw Error('asset unavailable');};await assert.rejects(create(g.options).run(),/asset unavailable/);assert.equal(g.native.firstEnding.stage,'departure');assert.deepEqual(g.calls,['credits']);
});
test('a failed write is never reported as success and completed preparation stays retryable',async()=>{
 const f=fixture();f.options.save=()=>f.native.firstEnding.stage!=='end';await assert.rejects(create(f.options).run(),/Salvataggio/);assert.equal(f.native.firstEnding.stage,'end');f.options.save=()=>true;await create(f.options).run();assert.equal(f.calls.filter(x=>x==='prepare').length,1);
});
test('normalization rejects corrupt and premature checkpoints without altering story progress',async()=>{
 for(const patch of [{stage:'postgame',version:1},{stage:'end',version:1},{stage:'credits',version:2}]){const f=fixture();f.native.firstEnding=patch;assert.equal(normalize(f.native),null);assert.equal(f.native.vars[16566],5);assert.deepEqual(f.native.flags,[]);}
 const f=fixture();f.native.vars[16566]=4;await assert.rejects(create(f.options).run(),/fase originale/);assert.equal(f.native.firstEnding,undefined);
});
test('verified866:1 prepares the first-ending flags and home position without running its second-completion branch',async()=>{
 const f=fixture();Object.assign(f.native,{flags:[185,599,2428,815,780,736],completionBits:4});
 const party=[{name:'Serperior',hp:100,status:''}],before=structuredClone(f.native),result=await require('../src/finale-completion.js').prepare({...nativePreparation(),native:f.native,healParty:async()=>party});
 assert.equal(result,party);assert.equal(f.native.zone,before.zone);assert.deepEqual(f.native.endingPosition,{type:1,zone:391,warp:-1,facing:1,x:5,height:0,z:6});assert.equal(f.native.returnContext,1);assert.equal(f.native.completionBits,5);assert.ok(f.native.flags.includes(2400));assert.ok(!f.native.flags.includes(2427));assert.ok(!f.native.flags.includes(185));assert.equal(f.native.vars[16546],3);assert.equal(f.native.vars[16594],1);assert.equal(f.native.roomMess,false);
 await assert.rejects(require('../src/finale-completion.js').prepare({...nativePreparation(),native:f.native,healParty:async()=>party}),/già applicata/);
});
test('an interrupted native preparation publishes no partial flags, position, healing or second-completion bits',async()=>{
 const f=fixture(),before=structuredClone(f.native);await assert.rejects(require('../src/finale-completion.js').prepare({...nativePreparation(),native:f.native,healParty:async()=>{throw Error('invalid party');}}),/invalid party/);assert.deepEqual(f.native,before);
});
