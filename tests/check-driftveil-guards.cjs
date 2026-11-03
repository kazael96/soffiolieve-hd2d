/* Resolve each real native guard battle, then board the same cart exactly once. */
const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{
 for(const [station,sw,flag,trainer]of [[3,1,116,67],[5,2,117,69]]){
  const c=environment({driftveil:true,sourceRoot:process.env.QA_SOURCE_ROOT}),n=c.NativeStory,j=c.Journey;await c.DriftveilChapter.ensure();Object.assign(n.state,{intro:true,initialized:true});j.state.phase='nimbasa';j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Servine',30),c.OPENING_DATA.Servine.growth[30])];const p=c.DRIFTVEIL_GYM_DATA.stations[station];await n.changeZone(63,p[0],p[1]);c.player={x:p[0]-15.5,y:p[1]-15.5};c.DriftveilGym.activate(sw);
  let task,events=0,trainerId;const run=n.run,start=c.startBattle;n.run=(...args)=>{events++;task=run(...args);return task;};c.startBattle=(isTrainer,config)=>{trainerId=config.trainerId;return start(isTrainer,config);};assert.equal(c.DriftveilGym.interact(),true);assert.equal(events,1);await drain(c,task,0,'p1');assert.equal(trainerId,trainer);assert.ok(n.state.flags.includes(flag));assert.equal(c.DriftveilGym.interact(),true);assert.equal(events,1,'Defeated guard replayed instead of boarding');assert.equal(c.DriftveilGym.busy,true);for(let i=0;i<600&&c.DriftveilGym.busy;i++)j.step(1/30,false);assert.equal(c.DriftveilGym.busy,false);console.log('PASS native guard '+trainer+' defeated once; same cart departs afterwards.');
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
