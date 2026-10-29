/* The original city programs run against real maps and the actual battle engine. */
const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{
 {
  const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),root=path.resolve(process.argv[2]||'_site'),ctx={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'field-audio.js'),'utf8'),ctx);const record=ctx.window.FIELD_AUDIO[1019],layers=[record,...record.layers];
  assert.equal(record.mixSource.archive,'a/1/4/7');assert.equal(layers.map(x=>x.trackMask).join(','),'64639,768,128');
  const hashes=new Set();for(const layer of layers){const b=fs.readFileSync(path.join(root,layer.src));assert.equal(b.toString('ascii',0,4),'fLaC');assert.equal(b[4]&127,0);const format=b.readBigUInt64BE(18),rate=Number(format>>44n),samples=Number(format&0xfffffffffn);assert.equal(rate,32768);assert.ok(Math.abs(samples/rate-layer.loop[1])<1/rate);hashes.add(require('node:crypto').createHash('sha256').update(b).digest('hex'));}
  assert.equal(hashes.size,3);assert.equal(layers.map(x=>x.loop.join(':')).every(x=>x===record.loop.join(':')),true);
  console.log('PASS original city mixer masks, nonidentical FLAC streams and sample-aligned loops');
 }
 for(let starter=0;starter<3;starter++){
  const c=environment(),n=c.NativeStory,j=c.Journey,name=['Snivy','Tepig','Oshawott'][starter];
  n.state.intro=true;n.state.arrived=true;j.state.starter=name;j.state.party=[j.pack(c.newStoryMon(name,7),300)];
  Object.assign(n.state.vars,{16508:2,16513:2,16505:1,16512:3});
  await n.changeZone(397,796,659);c.facing=0;
  await drain(c,n.run(7,794),starter,'p1');
  assert.equal(n.state.zone,398);assert.equal(n.state.vars[16507],1);assert.equal(j.state.phase,'centerHeal');
  j.state.party[0].hp=1;j.state.party[0].status='psn';
  await drain(c,n.run(4,796),starter,'p1');
  assert.equal(n.state.vars[16507],3);assert.equal(n.state.vars[16506],1);assert.equal(j.state.party[0].status,'');
  assert.equal(j.state.party[0].hp,j.unpack(j.state.party[0]).max);
  await n.changeZone(397,796,659);await drain(c,n.run(12,794),starter,'p1');
  assert.equal(n.state.vars[16506],2);assert.equal(j.state.phase,'plasma');
  c.player={x:6.5,y:-94.5};const before=j.state.money;
  await drain(c,n.run(9,794),starter,'p1');
  assert.equal(n.state.vars[16506],3);assert.equal(j.state.phase,'nextRoute');
  assert.equal(j.state.money,before+700);assert.ok(j.state.dex.seen.includes('Purrloin'));
  assert.equal(j.save(true),true);const saved=c.StoryState.read(c.localStorage),d=environment({save:saved});
  assert.equal(d.NativeStory.state.vars[16506],3);assert.equal(d.Journey.state.phase,'nextRoute');
  assert.equal(d.NativeStory.state.zone,397);assert.equal(d.player.y,c.player.y);
  assert.equal(c.$('world').dataset.eventError,undefined);
  console.log('PASS Quattroventi original guide, healing, tour, Plasma, N, rewards and reload: '+name);
 }
 for(const outcome of ['p2','play']){
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;n.state.arrived=true;
  j.state.starter='Tepig';j.state.party=[j.pack(c.newStoryMon('Tepig',7),300)];Object.assign(n.state.vars,{16506:2,16507:3});
  n.state.flags=n.state.flags.filter(f=>![522,523,524,525,528].includes(f));await n.changeZone(397,790,657);c.testSpeed=4;
  await drain(c,n.run(9,794),1,outcome);assert.equal(n.state.vars[16506],3);assert.equal(j.state.phase,'nextRoute');
  if(outcome==='p2'){assert.equal(n.state.zone,398);assert.equal(j.state.party[0].hp,j.unpack(j.state.party[0]).max);assert.equal(j.state.money,2944);}
  console.log('PASS N '+outcome+' at x4, story completion and blackout recovery');
 }
 {
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;n.state.arrived=true;
  j.state.starter='Snivy';j.state.party=[j.pack(c.newStoryMon('Snivy',7),300)];
  Object.assign(n.state.vars,{16506:3,16507:3});n.state.flags.push(520,521,522,523,524,525,528,637);
  const dirs={1:1,2:0,3:3,4:2},vectors=[[0,-1],[0,1],[-1,0],[1,0]];let count=0;
  for(const zone of [397,398,399,400,401,402,403,404,405,320,319,6,8])for(const w of c.ORIGINAL_EVENTS.zones[zone].warps){
   if(!c.ORIGINAL_EVENTS.zones[w.zone])continue;
   await n.changeZone(zone,[397,319,6].includes(zone)?(zone===319?760:796):7,[397,319,6].includes(zone)?(zone===319?647:zone===6?600:659):8);j.step(1,false);
   const [ox,oz]=[397,319,6].includes(zone)?[784,752]:[16,16],[dx,dz]=vectors[dirs[w.a]];
   c.player={x:w.x/16-ox-dx*.9,y:w.z/16-oz-dz*.9};
   const p=n.tryWarp(dx,dz,c.player.x+dx*.3,c.player.y+dz*.3);assert.ok(p,'New door '+zone+' -> '+w.zone);
   await drain(c,p);assert.equal(n.state.zone,w.zone);
   assert.equal(c.blocked(c.player.x-.18,c.player.y-.18)||c.blocked(c.player.x+.18,c.player.y+.18),false,'Walkable destination '+zone+' -> '+w.zone+' '+JSON.stringify(c.player));count++;
  }
  assert.equal(count,22);assert.equal(n.state.route2,true);assert.equal(j.state.phase,'route2');
  console.log('PASS all '+count+' new doors, stairs, gate and Route 2 landing');
 }
 {
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;n.state.arrived=true;j.state.starter='Snivy';j.state.party=[j.pack(c.newStoryMon('Snivy',7),300)];
  Object.assign(n.state.vars,{16506:3,16507:3});
  let entries=0;
  for(const zone of [399,400,401,402,403,404,405,320]){
   await n.changeZone(zone,6,8);const d=c.ORIGINAL_EVENTS.zones[zone],p=c.ORIGINAL_EVENTS.scripts[d.script];
   for(const entry of p.supportedEntries){await drain(c,n.run(entry,d.script));entries++;}
  }
  assert.equal(c.$('world').dataset.eventError,undefined);assert.equal(n.state.musicTracks[1],true);assert.equal(n.state.musicTracks[2],true);
  console.log('PASS '+entries+' optional original house/gate entries, gift, type game and musicians');
 }
 for(const speed of [1,2,4]){
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;j.state.starter='Snivy';j.state.party=[j.pack(c.newStoryMon('Snivy',7),300)];c.testSpeed=speed;j.encounter=()=>{};
  Object.assign(n.state.vars,{16508:1,16512:3,16513:2,16505:1});n.state.flags.push(508);await n.changeZone(317,788,724);
  for(const [name,uid,x]of [['Aralia',2,4.5],['Komor',250,3.5],['Belle',240,5.5]])n.departures.depart({name,uid,model:{Aralia:105,Komor:7,Belle:134}[name],fieldZone:317,x,y:-30.5,height:0,frame:0,direction:0},317);
  for(let frame=0;frame<900;frame++){n.visualActors();j.step(1/30,false);} // physical arrival, not an offscreen deletion
  const people=n.visualActors();for(const [name,x,y]of [['Aralia',12.5,-93.5],['Komor',8.5,-71.5],['Belle',6.5,-75.5]]){const a=people.filter(a=>a.name===name);assert.equal(a.length,1,name+' duplicated');assert.equal(a[0].x,x);assert.equal(a[0].y,y);assert.equal(n.departures.retired.some(r=>r.name===name),false);}
  assert.equal(j.save(true),true);const saved=c.StoryState.read(c.localStorage),loaded=environment({save:saved});loaded.Journey.encounter=()=>{};assert.equal(loaded.NativeStory.visualActors().filter(a=>a.name==='Aralia').length,1,'waiting Aralia survives reload');
  loaded.player={x:6.5,y:-80.5};loaded.Journey.step(1/30,true);assert.equal(loaded.NativeStory.state.zone,397);const waiting=loaded.NativeStory.visualActors().filter(a=>a.name==='Aralia');assert.equal(waiting.length,1);assert.equal(waiting[0].x,12.5);assert.equal(waiting[0].y,-93.5);assert.equal(waiting[0].script,8,'arriving on the native city map adopts the original event');
  loaded.player={x:12.5,y:-92.5};loaded.facing=0;await drain(loaded,loaded.NativeStory.interact());assert.equal(loaded.NativeStory.state.zone,398);assert.equal(loaded.NativeStory.state.vars[16507],1);
  console.log('PASS physical arrivals, no duplicate/spontaneous disappearance, reload and real Aralia interaction x'+speed);
 }
 for(const stage of [1,3])for(const speed of [1,2,4]){
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;j.state.starter='Tepig';j.state.party=[j.pack(c.newStoryMon('Tepig',7),300)];Object.assign(n.state.vars,{16507:stage,16506:stage===3?3:0});c.testSpeed=speed;
  if(stage===3)n.state.flags.push(511,518,520,521,528);
  await n.changeZone(398,7,12);c.facing=0;j.state.party[0].hp=1;j.state.party[0].status='psn';for(const m of j.state.party[0].pp)m.left=0;
  assert.equal(c.blocked(-8.5,-4.5),true,'original counter is solid');assert.match(j.hint(),/Interagisci/);const service=n.interact();assert.ok(service?.then,'A must reach the nurse across the counter');await drain(c,service);assert.equal(j.state.party[0].hp,j.unpack(j.state.party[0]).max);assert.equal(j.state.party[0].status,'');assert.ok(j.state.party[0].pp.every(m=>m.left>0));assert.equal(n.state.vars[16507],3);
  assert.equal(j.save(true),true);const saved=c.StoryState.read(c.localStorage),again=environment({save:saved});again.player={x:-8.5,y:-3.5};again.facing=0;assert.ok(again.Journey.hint(),'nurse remains interactive after reload');await drain(again,again.NativeStory.interact());assert.equal(again.$('world').dataset.eventError,undefined);
  console.log('PASS nurse through counter, HP/status/PP recovery, tour/resume and repeat healing: stage'+stage+' x'+speed);
 }
 {
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;j.state.starter='Snivy';j.state.party=[j.pack(c.newStoryMon('Snivy',7),300)];Object.assign(n.state.vars,{16507:3,16506:3});n.state.flags.push(511,518,520,521,528);await n.changeZone(398,7,12);c.facing=0;j.state.party[0].hp=1;
  const service=n.interact();let chose=false;for(let i=0;i<100&&!chose;i++){await Promise.resolve();j.step(1/30,false);if(c.$('dialogue').open){if(!c.$('starterChoices').hidden){c.$('starterChoices').children[1].onclick();chose=true;}else c.continue();}}
  assert.ok(chose);await drain(c,service);assert.equal(j.state.party[0].hp,1,'NO must not heal');assert.equal(n.locked,false);
  for(const [x,z,facing]of [[7,13,0],[6,12,0],[7,12,3]]){c.player={x:x+.5-16,y:z+.5-16};c.facing=facing;assert.equal(n.interact(),undefined,'no diagonal/too-distant/backward interaction');}
  console.log('PASS nurse refusal, no interaction through ordinary tiles, diagonal targets or wrong facing');
 }
})().catch(e=>{console.error(e);process.exitCode=1});
