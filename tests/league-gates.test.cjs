/* Real native gate initializers and field-model controller, GPU isolated. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/league-field-host.cjs');
test('all eight badge gates restore their native open flag without leaving the closed model in the field',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 for(let zone=356;zone<=363;zone++){
  const flag=136+zone-356;n.flags=n.flags.filter(f=>f!==flag);await drain(c,c.NativeStory.changeZone(zone,15,11));const controller=c.renderer.fieldModels,closed=controller.find(1,-1,-9);assert.ok(closed,'Native gate missing '+zone);assert.equal(!!closed.hidden,false);assert.equal(controller.replaces(closed.instance),false);
  n.flags.push(flag);await drain(c,c.NativeStory.changeZone(zone,15,11));const opened=controller.find(1,-1,-9);assert.ok(opened.hidden,'Original open flag must hide the closed gate '+zone);assert.equal(controller.replaces(opened.instance),true);assert.equal(c.NativeStory.locked,false);
  n.flags=n.flags.filter(f=>f!==flag);await drain(c,c.NativeStory.changeZone(zone,15,11));assert.equal(!!controller.find(1,-1,-9).hidden,false,'A new closed scene cannot inherit another visit visibility');
 }
});
test('each original badge challenge accepts its own badge, animates the gate and arrives at the next declared stage',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.badges=[0,1,2,3,4,5,6,7];const visits=[];
 for(let zone=356;zone<=363;zone++){
  n.flags=n.flags.filter(f=>f!==136+zone-356);await drain(c,c.NativeStory.changeZone(zone,15,11));const oldZoom=c.renderer.zoom,oldPitch=c.renderer.cameraPitch,stops=c.soundStops?.length||0;await drain(c,c.NativeStory.run(1,c.LEAGUE_EVENTS.zones[zone].script));assert.equal(n.zone,zone+1);assert.ok(n.flags.includes(136+zone-356));assert.equal(c.NativeStory.locked,false);assert.equal(c.renderer.storyCamera,null);assert.equal(c.renderer.cameraPitch,oldPitch);assert.equal(c.renderer.zoom,oldZoom);assert.equal(c.renderer.storyCameraHeight,undefined);assert.ok(c.soundStops?.slice(stops).includes(1774),'Native167 must stop the prolonged opening sequence');visits.push(n.zone);
 }
 assert.deepEqual(visits,[357,358,359,360,361,362,363,364]);
});
test('having the other seven badges cannot open the gate for the missing badge',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 for(let badge=0;badge<8;badge++){const zone=356+badge,flag=136+badge;n.badges=[0,1,2,3,4,5,6,7].filter(b=>b!==badge);n.flags=n.flags.filter(f=>f!==flag);await drain(c,c.NativeStory.changeZone(zone,15,11));await drain(c,c.NativeStory.run(1,c.LEAGUE_EVENTS.zones[zone].script));assert.equal(n.zone,zone);assert.equal(n.flags.includes(flag),false);assert.equal(!!c.renderer.fieldModels.find(1,-1,-9).hidden,false);assert.equal(c.NativeStory.locked,false);}
});
test('returning through an opened gate cannot disable the next still-closed gate footstep trigger',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.flags.push(136);await drain(c,c.NativeStory.changeZone(356,15,13));assert.equal(n.vars[16384],1);assert.ok(c.renderer.fieldModels.find(1,-1,-9).hidden);n.flags=n.flags.filter(f=>f!==137);await drain(c,c.NativeStory.changeZone(357,15,13));assert.equal(n.vars[16384]||0,0,'Gate-local trigger suppression leaked from the previous map');assert.equal(!!c.renderer.fieldModels.find(1,-1,-9).hidden,false);
});
test('cold model preparation restores the opened gate without replaying its event and preserves a live animation',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.flags.push(136);await drain(c,c.NativeStory.changeZone(356,15,13));const control=c.renderer.fieldModels;control.clear();n.vars[16384]=0;const original=c.NativeStory.vm.run;c.NativeStory.vm.run=()=>{throw Error('Scene preparation must not replay a field event');};
 try{await control.prepareScene();assert.ok(control.find(1,-1,-9).hidden);assert.equal(n.vars[16384],1);control.clear();const id=control.create(1,-1,-9);await control.play(id,0);control.tick(.5);const target=control.find(1,-1,-9),frame=target.frame;await control.prepareScene();assert.equal(target.frame,frame);assert.equal(!!target.hidden,false);assert.equal(target.playing,true);control.release(id);await control.prepareScene();assert.ok(target.hidden);}finally{c.NativeStory.vm.run=original;}
});
test('temporary flags are cleared before native scene actors are selected',async()=>{
 const c=await setup(),n=c.NativeStory.state,header=c.ORIGINAL_EVENTS.zones[356];header.actors.push({...header.actors[0],id:27,script:2000,flag:99,x:19,z:12});n.flags.push(99);await drain(c,c.NativeStory.changeZone(356,15,13));assert.equal(n.flags.includes(99),false);assert.ok(c.NativeStory.visualActors().some(a=>a.uid===27),'The cleared temporary flag must not hide the new map actor');
});
