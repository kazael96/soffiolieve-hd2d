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
  for(const zone of [397,398,399,400,401,402,403,404,405,320,319])for(const w of c.ORIGINAL_EVENTS.zones[zone].warps){
   if(!c.ORIGINAL_EVENTS.zones[w.zone])continue;
   await n.changeZone(zone,zone===397?796:7,zone===397?659:8);j.step(1,false);
   const [ox,oz]=[397,319].includes(zone)?[784,752]:[16,16],[dx,dz]=vectors[dirs[w.a]];
   c.player={x:w.x/16-ox-dx*.9,y:w.z/16-oz-dz*.9};
   const p=n.tryWarp(dx,dz,c.player.x+dx*.3,c.player.y+dz*.3);assert.ok(p,'New door '+zone+' -> '+w.zone);
   await drain(c,p);assert.equal(n.state.zone,w.zone);
   assert.equal(c.blocked(c.player.x-.18,c.player.y-.18)||c.blocked(c.player.x+.18,c.player.y+.18),false,'Walkable destination '+zone+' -> '+w.zone+' '+JSON.stringify(c.player));count++;
  }
  assert.equal(count,20);assert.equal(n.state.route2,true);assert.equal(j.state.phase,'route2');
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
})().catch(e=>{console.error(e);process.exitCode=1});
