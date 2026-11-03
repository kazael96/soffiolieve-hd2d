const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{const c=environment({nimbasa:true,sourceRoot:process.env.QA_SOURCE_ROOT}),n=c.NativeStory,j=c.Journey;await c.NimbasaChapter.ensure();n.state.intro=true;n.state.initialized=true;j.state.phase='castelia';j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Servine',25),c.OPENING_DATA.Servine.growth[25])];
 for(const zone of Object.values(c.NIMBASA_EVENTS.zones)){for(const t of [...zone.triggers,...zone.onEnter])n.state.vars[t.var]=100;}
 let count=0;
 for(const [id,zone]of [...Object.entries(c.NIMBASA_EVENTS.zones),['51',c.ORIGINAL_EVENTS.zones[51]]])for(const w of zone.warps){if(!c.ORIGINAL_EVENTS.zones[w.zone])continue;
  await n.changeZone(+id,15,15);j.step(1,false);let p,out,d=.9;
  if(w.rail){const q=c.NativeRails.warp(+id,w);p={x:q.x-16,y:q.z-16};out={x:q.out.x,y:q.out.z};d=c.NativeRails.landing(+id,w).distance+.05;}
  else{p={x:w.x/16+(w.width-1)/2-(c.NimbasaChapter.globalZones.includes(+id)?784:16),y:w.z/16+(w.height-1)/2-(c.NimbasaChapter.globalZones.includes(+id)?752:16)};out=({1:{x:0,y:1},2:{x:0,y:-1},3:{x:1,y:0},4:{x:-1,y:0}})[w.a];}
  c.player={x:p.x-out.x*d,y:p.y-out.y*d};const step=w.rail?.2:.3;
  const task=n.tryWarp(out.x,out.y,c.player.x+out.x*step,c.player.y+out.y*step);assert.ok(task&&typeof task.then==='function',`warp did not start ${id}->${w.zone}: `+JSON.stringify({locked:n.locked,menu:c.menuOpen(),processing:j.processing,zone:n.state.zone,player:c.player,out,p,d,step,vm:n.vm.running,error:c.$('world').dataset.eventError}));await drain(c,task,0,'p1');assert.equal(n.state.zone,w.zone,`warp destination ${id}->${w.zone}`);count++;
 }
 console.log('PASS Route4/Nimbasa navigation: '+count+' native warp transitions.');
})().catch(e=>{console.error(e);process.exitCode=1;});
