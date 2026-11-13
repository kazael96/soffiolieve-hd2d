/* Native flags16: pause automatic cell playback, not object visibility.
 * overlay21:0219ff0c calls02050770 for playback;02050720 separately controls
 * visibility from actor flag4. Native73/74 set/clear16 via02198a24/38.
 */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('movement73 keeps Ghetsis visible and walking with stationary animation until74 resumes his steps',async()=>{
 const c=await setup(),m=c.NativeStory.vm,n={uid:250,name:'Ghecis',model:100,fieldZone:136,x:0,y:0,height:0,frame:0,direction:1};c.npcs.push(n);const observations=[];c.tickAudio=()=>{observations.push({paused:!!n.nativeAnimationPaused,frame:n.frame,x:n.x,y:n.y,hidden:n.hidden});};
 m.data.scripts[9010]={entries:[0],code:{0:{op:100,name:'ActorCmdExec',args:[250,20],end:8},8:{op:101,name:'ActorCmdWait',args:[],end:10},10:{op:2,name:'VMHalt',args:[],end:12}},movements:{20:[[73,1],[13,2],[74,1],[13,2],[254,0]]}};
 await drain(c,m.run(9010,0));assert.equal(n.hidden,undefined);assert.equal(n.nativeAnimationPaused,false);assert.equal(n.x,0);assert.equal(n.y,4);const paused=observations.filter(v=>v.paused&&v.y>0&&v.y<2);assert.ok(paused.length>=8);assert.ok(paused.every(v=>v.frame===3),'Direction changes remain effective but walking cells do not advance');assert.ok(observations.some(v=>!v.paused&&v.y>2&&[4,5].includes(v.frame)),'74 restores automatic walking cells');
});
