/* Real field VM and preparation. Film/credits/END output is explicitly mocked;
 * supplied prerequisites do not certify battles, rendering or the campaign. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,create:host,drain}=require('./helpers/finale-field-host.cjs');
test('an ending checkpoint does not freeze an already scheduled field music ramp',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 await drain(c,c.NativeStory.changeZone(278,10,10));
 for(const key of ['FinaleCredits','FinaleEnd','FinaleSave'])c[key]={create:()=>({})};
 c.FinaleCompletion={create:()=>({run:()=>new Promise(()=>{})})};
 n.firstEnding={version:1,stage:'credits'};
 c.FieldMusicFade.start(n,0,30);
 c.Journey.step(1/30,false);
 assert.equal(n.fieldMusicVolume,123);
});
test('original556:5628 completes342 mode0 and writes phase6 without replaying battles or granting postgame',async()=>{
 const c=await setup(),n=c.NativeStory.state,calls=[];const music=[];c.AudioEngine.setScene=async id=>music.push(id);n.music=1076;n.fieldMusicVolume=127;
 await drain(c,c.NativeStory.changeZone(278,10,10));music.length=0;n.vars[16566]=5;n.flags=n.flags.filter(f=>![2400,2427].includes(f));
 const beforeWins=JSON.stringify(n.trainerWins),beforeXP=c.Journey.state.party.map(p=>p.xp);
 c.FinaleCredits={create:()=>({play:async()=>calls.push('credits')})};c.FinaleEnd={create:()=>({play:async()=>calls.push('end')})};c.FinaleCinematics={play:async id=>calls.push(id)};
 c.FinaleSave={create:()=>({play:async write=>{calls.push('save205');return write();}})};
 const create=c.FinaleCompletion.create;c.FinaleCompletion.create=options=>create({...options,complete:async()=>calls.push('complete')});
 await drain(c,c.NativeStory.vm.run(556,5628,{offset:true}));
 assert.deepEqual(music,[1001],'Native342 stops the previous field song before full movie soundtracks claim music');assert.deepEqual(calls,['credits',7,'save205','end','complete']);assert.equal(n.vars[16566],6);assert.equal(n.firstEnding.stage,'complete');assert.ok(n.flags.includes(2400));assert.ok(!n.flags.includes(2427));assert.equal(n.returnContext,1);assert.equal(n.endingPosition.zone,391);assert.equal(n.zone,278);assert.equal(JSON.stringify(n.trainerWins),beforeWins);assert.deepEqual(c.Journey.state.party.map(p=>p.xp),beforeXP);assert.equal(c.NativeStory.vm.running,false);
 for(let i=0;i<30;i++)c.Journey.step(1/30,false);assert.deepEqual(calls,['credits',7,'save205','end','complete']);
 assert.equal(c.Journey.save(true),true);const saved=JSON.parse(c.localStorage.getItem(c.StoryState.KEY));assert.equal(saved.original.vars[16566],6);assert.equal(saved.original.firstEnding.stage,'complete');
});
test('actual saved native ending resumes after reload without invoking earlier presentation stages',async()=>{
 const base=await setup();await drain(base,base.NativeStory.changeZone(278,10,10));base.NativeStory.state.vars[16566]=5;
 base.NativeStory.state.flags=base.NativeStory.state.flags.filter(f=>![2400,2427].includes(f));
 const seed=structuredClone(base.Journey.state);
 for(const stage of ['departure','prepare','end','complete']){
  const saved=structuredClone(seed),n=saved.original;n.firstEnding={version:1,stage};
  if(['end','complete'].includes(stage)){n.flags.push(2400);n.completionBits=1;n.returnContext=1;n.endingPosition={type:1,zone:391,warp:-1,facing:1,x:5,height:0,z:6};}
  const c=host({save:saved}),calls=[];let pending;
  c.FinaleCredits={create:()=>({play:async()=>calls.push('credits')})};c.FinaleCinematics={play:async id=>calls.push(id)};c.FinaleEnd={create:()=>({play:async()=>calls.push('end')})};c.FinaleSave={create:()=>({play:async write=>{calls.push('save205');return write();}})};
  const create=c.FinaleCompletion.create;c.FinaleCompletion.create=options=>{const flow=create({...options,complete:async()=>calls.push('complete')});return{run(){pending=flow.run();return pending;}};};
  c.Journey.step(1/30,false);assert.ok(pending,'Reload starts the durable ending, not a map trigger');await drain(c,pending);await Promise.resolve();
  const expected={departure:[7,'save205','end','complete'],prepare:['save205','end','complete'],end:['save205','end','complete'],complete:['complete']};assert.deepEqual(calls,expected[stage]);assert.equal(c.NativeStory.state.vars[16566],6);assert.ok(!c.NativeStory.state.flags.includes(2427));
  const persisted=JSON.parse(c.localStorage.getItem(c.StoryState.KEY));assert.equal(persisted.original.firstEnding.stage,'complete');assert.equal(persisted.original.vars[16566],6);
 }
});
