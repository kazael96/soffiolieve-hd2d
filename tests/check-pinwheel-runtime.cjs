/* Native chapter VM replay. Battles are resolved explicitly; this is not a pixel/combat replay. */
const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{
 const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;n.state.initialized=true;j.state.phase='nacrene';j.state.starter='Snivy';j.state.party=['Servine','Pignite','Dewott'].map(name=>j.pack(c.makeMon(name,25),c.OPENING_DATA[name].growth[25]));Object.assign(n.state.vars,{16432:0,16530:2});
 assert.ok(!n.state.flags.includes(550),'prebadge forest blockers hidden');assert.ok(!n.state.flags.includes(549),'quest Plasma hidden');
 const zone=(id,x,z)=>n.changeZone(id,x,z),event=entry=>drain(c,n.run(entry),0,'p1');
 await zone(17,12,23);await event(15);await zone(18,9,29);await event(2);assert.equal(n.state.vars[16522],1);
 for(const [i,entry]of [18,12,5,10,26,30].entries()){await event(entry);assert.equal(n.state.vars[16522],i+2,'book stage '+entry);}
 await zone(19,4,19);await event(1);assert.ok(n.state.badges.includes(1));assert.equal(n.state.vars[16530],3);assert.ok(n.state.flags.includes(550));
 await zone(17,12,9);await event(16);await zone(16,640,581);await event(6);assert.equal(n.state.vars[16530],4);assert.equal(j.itemCount(471),1);
 await zone(154,592,584);await event(1);assert.equal(n.state.vars[16525],1);await zone(155,74,71);await event(9);assert.equal(n.state.vars[16525],2);await event(11);
 for(const [i,entry]of [12,16,18,20].entries()){await event(entry);assert.equal(n.state.vars[16554],i+1,'Plasma stage '+entry);}
 assert.equal(n.state.vars[16525],3);assert.equal(n.state.vars[16530],5);assert.equal(j.itemCount(579),0);assert.equal(j.itemCount(81),1,'Moon Stone reward must be item81, not X Defense58');
 await zone(155,74,70);const twins=n.visualActors().find(a=>a.script===5032),party=j.state.party;assert.ok(twins);j.state.party=party.slice(0,1);await drain(c,n.routeTrainer(twins));assert.ok(!(n.state.trainerWins||[]).includes(32));assert.ok(!c.lastBattle);j.state.party=party;await drain(c,n.routeTrainer(twins),0,'p1');assert.ok(n.state.trainerWins.includes(32));
 await zone(154,590,584);const noemi=n.visualActors().find(a=>a.script===3546);assert.ok(noemi,'Noemi missing');await drain(c,n.routeTrainer(noemi),0,'p1');assert.ok(n.state.trainerWins.includes(546));j.state.party[0].hp=1;j.state.party[0].status='psn';await drain(c,n.routeTrainer(noemi));assert.equal(j.state.party[0].hp,j.unpack(j.state.party[0]).max);assert.equal(j.state.party[0].status,'');
 const stars=j.itemCount(91);await event(2);assert.equal(j.itemCount(91),stars+1,'demonstration rock gift');await event(2);assert.equal(j.itemCount(91),stars+1,'same-day rock gift duplicated');
 await zone(251,8,5);await event(2);assert.equal(j.itemCount(217),1);await event(2);assert.equal(j.itemCount(217),1,'Quick Claw gift duplicated');assert.ok(j.giveItem(217,0));assert.equal(c.StoryState.normalize(j.state).party[0].heldItem,217);assert.equal(j.takeItem(0),217);
 for(const [id,x,z]of [[250,15,28],[251,2,4],[249,90,276],[252,8,10],[28,71,33],[41,7,13]])await zone(id,x,z);assert.equal(j.state.phase,'castelia');
 j.save(true);const restored=c.StoryState.read(c.localStorage);assert.equal(restored.original.vars[16525],3);assert.equal(restored.party[0].name,'Servine');assert.equal(restored.phase,'castelia');
 await event(4);const nurse=n.visualActors().find(a=>a.script===2100);assert.ok(nurse,'Castelia nurse missing');
 for(let i=0;i<2;i++){c.player={x:nurse.x,y:nurse.y+2};c.facing=0;j.state.party[0].hp=1;j.state.party[0].status='psn';for(const m of j.state.party[0].pp)m.left=0;await drain(c,n.interact());assert.ok(j.state.party[0].hp>1);assert.equal(j.state.party[0].status,'');assert.ok(j.state.party[0].pp.every(m=>m.left>0));}
 j.addItem(38,2);const pp=j.state.party[0].pp[0],max=c.GEN5.moves.find(m=>m.id===pp.id).pp;pp.left=0;assert.equal(j.useEther(0,0),true);assert.equal(pp.left,Math.min(max,10));assert.equal(j.itemCount(38),1);pp.left=max;assert.equal(j.useEther(0,0),false);assert.equal(j.itemCount(38),1);
 const session=new c.GEN5.Session(j.configs(),[{name:'Watchog',level:20}],{seed:[1,2,3,4]}),active=session.active();active.moveSlots[0].pp=0;assert.equal(c.BattleMedicine.apply(session.battle,38,active,0),true);assert.equal(active.moveSlots[0].pp,10);assert.equal(c.BattleMedicine.apply(session.battle,58,active),true);assert.equal(active.boosts.def,1,'GenV X Defense is one stage');active.boosts.def=6;assert.equal(c.BattleMedicine.canUse(58,active),false);
 const munna=j.pack(c.makeMon('Munna',20),c.OPENING_DATA.Munna.growth[20]);j.state.party.push(munna);j.consumeItem(81);j.addItem(58);assert.equal(await j.useMoonStone(j.state.party.length-1),false);assert.equal(munna.name,'Munna');assert.equal(j.itemCount(58),1);j.addItem(81);await drain(c,j.useMoonStone(j.state.party.length-1));assert.equal(munna.name,'Musharna');assert.equal(j.itemCount(81),0);assert.equal(j.itemCount(58),1);
 for(const [source,index,destination]of [[155,1,250],[250,0,155],[250,1,251],[251,0,250],[251,1,249],[249,0,251],[249,1,252],[252,1,28],[28,9,252],[28,10,41],[41,0,28]]){
  await zone(source,16,16);const warp=c.ORIGINAL_EVENTS.zones[source].warps[index];let p,out;
  if(warp.rail){p=c.NativeRails.warp(source,warp);out=p.out;const landing=c.NativeRails.landing(source,warp);c.player={x:landing.x,y:landing.z};n.state.railCurrent={zone:source,...landing.rail};}
  else{out=({1:{x:0,z:1},2:{x:0,z:-1},3:{x:1,z:0},4:{x:-1,z:0}})[warp.a];c.player={x:warp.x/16-16-out.x*.8,y:warp.z/16-16-out.z*.8};}
  for(let i=0;i<31;i++)j.step(1/30,false);const distance=warp.rail?.12:.3,task=n.tryWarp(out.x,out.z,c.player.x+out.x*distance,c.player.y+out.z*distance);assert.ok(task&&typeof task.then==='function','warp did not trigger '+source+'/'+index);await drain(c,task);assert.equal(n.state.zone,destination);
  if(c.NativeRails.has(destination)){assert.ok(c.NativeRails.locate(destination,c.player.x,c.player.y,n.state.railCurrent),'arrival outside rail '+destination);assert.ok(Number.isFinite(n.state.railCurrent.height));}
 }
 console.log('PASS native books, Aloé, theft, four Plasma stages, rewards, Noemi, counter nurse, Ether/X Defense/Moon Stone and 11 actual bidirectional warps');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
