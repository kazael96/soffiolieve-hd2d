const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||'../fidelity-build-051-opelucid-next';const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
test('after a Gym bridge the current floor keeps its invisible blockers physical despite an old lower rail hint',async()=>{
 const c=environment({opelucid:true,sourceRoot:path.resolve('src')}),n=c.NativeStory.state;Object.assign(n,{intro:true,initialized:true,flags:[576,577,579,678],badges:[0,1,2,3,4,5]});await drain(c,c.NativeStory.changeZone(114,17,62));
 n.fieldHeight=3;n.railCurrent={zone:114,line:5,height:0};const blocker=c.NativeStory.visualActors().find(a=>a.uid===5);assert.ok(blocker?.collisionOnly);assert.ok(Math.abs(blocker.height-3)<.01);assert.equal(c.NativeStory.occupied(blocker.x,blocker.y),true);
 const below=c.NativeStory.visualActors().find(a=>a.uid===2);assert.equal(c.NativeStory.occupied(below.x,below.y),false,'An actor on the lower floor must not block this floor');
});
