const {test}=require('node:test'),assert=require('node:assert/strict');
const Q=require('./qa-gust064.js');
const record=(id,frame=101)=>({token:{id,frame}});
const body=(side,extra={})=>({success:true,graphic:'521-female',side,back:side==='p1',contextMatches:true,x:300,y:200,size:1,grounded:true,effectiveTick:0,...extra});
test('protected evidence waits for successful bodies, exact production ACK and complete arena',()=>{
 const output=[],g=Q.captureGate({graphic:'521-female',onCapture:f=>output.push(f)}),failed=record(1);
 assert.equal(g.observe(failed,body('p1',{success:false})),false);g.observe(failed,body('p2'));g.acknowledge(failed,{frame:101,key:true});g.complete();assert.equal(output.length,0);
 // A production retry may issue a different token for the same held frame.
 const retry=record(2);g.observe(retry,body('p1'));g.observe(retry,body('p2'));assert.equal(output.length,0);
 assert.equal(g.acknowledge(retry,false),false);assert.equal(output.length,0);
 g.acknowledge(retry,{frame:101,key:true,nextKey:106});assert.equal(output.length,0);g.complete();assert.equal(output.length,1);assert.equal(output[0].tokenId,2);assert.deepEqual(g.frames,[101]);
});
test('wrong body, side, context, missing ACK and stale token cannot certify a PNG',()=>{
 for(const invalid of [{graphic:521},{contextMatches:false},{back:false},{success:false},{x:NaN}]){
  const output=[],g=Q.captureGate({graphic:'521-female',onCapture:f=>output.push(f)}),r=record(10);g.observe(r,body('p1',invalid));g.observe(r,body('p2'));g.acknowledge(r,{frame:101,key:true});g.complete();assert.equal(output.length,0,JSON.stringify(invalid));
 }
 const output=[],g=Q.captureGate({graphic:'521-female',onCapture:f=>output.push(f)}),r=record(20);g.observe(r,body('p1'));g.observe(r,body('p2'));assert.equal(g.acknowledge(record(20),{frame:101,key:true}),false);g.complete();assert.equal(output.length,0);
});
test('capture is once per protected frame; nonprotected and mismatching ACK frames are rejected',()=>{
 const output=[],g=Q.captureGate({graphic:'521-female',onCapture:f=>output.push(f)});
 for(const [id,frame,ackFrame]of [[1,100,100],[2,101,106],[3,101,101],[4,101,101]]){const r=record(id,frame);g.observe(r,body('p1'));g.observe(r,body('p2'));g.acknowledge(r,{frame:ackFrame,key:true});g.complete();}
 assert.equal(output.length,1);assert.equal(output[0].tokenId,3);
});
test('rates select exact bounded subsets and reject ambiguous or unsupported requests',()=>{
 assert.deepEqual(Q.rates(''),[1,2,4]);assert.deepEqual(Q.rates('?battleRates064=2'),[2]);assert.deepEqual(Q.rates('?battleRates064=4,1'),[4,1]);
 for(const s of ['', '0','3','2,2','2,','1,2,4,8'])assert.throws(()=>Q.rates('?battleRates064='+s));
});
test('native constructor receives only seeded options; failed setup restores every delegated hook',async()=>{
 let received,finishes=0,cancels=0,rate,arena=function originalArena(){};
 class NativeSession{constructor(...args){received=args;}}
 const GEN5={Session:NativeSession},MoveFX={play(){},presentedArenaFrame(){},cancel(){cancels++;}},ROM_SPRITE_ANIM={draw(){}},original={play:MoveFX.play,presented:MoveFX.presentedArenaFrame,draw:ROM_SPRITE_ANIM.draw,arena};
 const first={team:1},second={team:2},options={format:'gen5',unrelated:123};
 await assert.rejects(Q.run({GEN5,MoveFX,ROM_SPRITE_ANIM,GameSpeed:{set:n=>{rate=n;}},check:(ok,msg)=>{if(!ok)throw Error(msg);},until:async()=>{},getArenaDraw:()=>arena,setArenaDraw:fn=>{arena=fn;},search:'?battleRates064=2',finish(){finishes++;},async start(){new GEN5.Session(first,second,options);throw Error('native setup rejection');}}),/native setup rejection/);
 assert.equal(received[0],first);assert.equal(received[1],second);assert.deepEqual(received[2],{...options,seed:[1,2,3,4]});assert.deepEqual(options,{format:'gen5',unrelated:123});
 assert.equal(GEN5.Session,NativeSession);assert.equal(MoveFX.play,original.play);assert.equal(MoveFX.presentedArenaFrame,original.presented);assert.equal(ROM_SPRITE_ANIM.draw,original.draw);assert.equal(arena,original.arena);assert.equal(rate,1);assert.equal(finishes,2);assert.equal(cancels,2);
});
