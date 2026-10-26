/* Exercise the actual story controller against real release maps and Gen V battles. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const site=path.resolve(process.argv[2]||'_site');
function environment(){
 const elements=new Map(),records=new Map();
 function element(id=''){if(elements.has(id))return elements.get(id);const e={id,style:{},dataset:{},children:[],hidden:false,open:false,checked:false,firstChild:{},classList:{toggle(){},remove(){}},append(...v){this.children.push(...v);},replaceChildren(...v){this.children=[...v];},setAttribute(){},remove(){},showModal(){this.open=true;},close(){this.open=false;},addEventListener(){},focus(){}};if(id)elements.set(id,e);return e;}
 const c={console,Math,Buffer,structuredClone,TextEncoder,TextDecoder,setTimeout:(f)=>{queueMicrotask(f);return 0;},clearTimeout,setInterval(){},clearInterval(){},addEventListener(){},performance,
  localStorage:{getItem:k=>records.get(k),setItem:(k,v)=>records.set(k,v)},$:element,npcs:[],player:{x:-2,y:0},facing:3,potions:0,battling:false,cooldown:0,partner:null,resetInput(){},refresh(){},toast(){},rival:'Belle',
  document:{hidden:false,body:{classList:{toggle(){}},append(){}},querySelector:s=>element(s),querySelectorAll:()=>[],addEventListener(){},createElement:()=>element(),createTextNode:s=>s},
  menuOpen:()=>[...elements.values()].some(e=>e.open)};c.window=c;vm.createContext(c);
 for(const file of ['assets/scene.js','opening-assets.js','opening-data.js','opening-trainers.js','opening-battle-rules.js','encounter-data.js','encounter-rules.js','opening-sprites.js','assets/battle-data.js','battle-sim.js','engine.js','journey-state.js','story-state.js','pokedex-assets.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),c,{filename:file});
 c.renderer={ready:true,scene:c.ROM_SCENE,zoom:1.4,cinema:true,center:[0,0]};
 const source=fs.readFileSync(path.join(site,'game.js'),'utf8');vm.runInContext(source.slice(source.indexOf('function blocked('),source.indexOf('function drawWorld')),c);
 c.startBattle=(trainer,config)=>{c.lastBattle={trainer,config};};
 vm.runInContext(fs.readFileSync(path.join(site,'story.js'),'utf8'),c,{filename:'story.js'});
 c.Pokedex={entry:async(name,options)=>{c.dexEntries??=[];c.dexEntries.push({name,options});}};
 c.StarterSelection={choose:async({text})=>{assert.match(text(18,'Snivy'),/Snivy/);return c.testStarter||0;}};
 c.AudioEngine={setScene(){},playSound:async()=>{},cry:async()=>{}};
 c.playCatchingTutorial=async()=>c.NativeStory.battleDone(null,'tutorial');
 for(const file of ['original-events.js','field-event-vm.js','phone-assets.js','npc-walk.js','original-story.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),c,{filename:file});
 c.continue=()=>element('dialogueContinue').onclick();
 c.simulate=(winner)=>{
  const {config}=c.lastBattle;if(config.trainerId){assert.equal(config.noBlackout,true);const t=c.OPENING_TRAINERS[config.trainerId];assert.equal(config.p2[0].name,c.StoryState.rivalStarter(c.Journey.state.starter,config.story));assert.equal(config.p2[0].ivs.hp,0);assert.equal(config.p2[0].nature,t.party[0].nature);}const s=new c.GEN5.Session(config.p1,config.p2,{enemyName:config.story,seed:[1,2,3,4]});c.configureOpeningBattle(s,config);c.Journey.attachBattle(s,config.story);
  if(winner==='play')for(let i=0;i<50&&!s.battle.ended;i++)s.act('move 1');else s.battle.win(winner);
  assert.ok(s.battle.ended);c.Journey.afterBattle(s,config.story,null,false);return s;
 };
 c.elements=elements;return c;
}

async function drain(c,promise,starter=0,outcome='play'){
 c.testStarter=starter;let done=false,error;Promise.resolve(promise).then(()=>done=true,e=>{done=true;error=e;});
 const messages=[];
 for(let frame=0;!done&&frame<30000;frame++){
  await Promise.resolve();c.Journey.step(1/30,false);
  if(c.lastBattle){const b=c.lastBattle;c.lastBattle=null;if(b.config.story!=='tutorial'){c.lastBattle=b;c.simulate(outcome);c.lastBattle=null;}}
  const d=c.$('dialogue');if(d.open){messages.push(c.$('dialogueText').textContent);
   if(!c.$('starterChoices').hidden){const choices=c.$('starterChoices').children;const i=choices[0]?.textContent==='Snivy'?starter:0;
    // Decline the optional nickname, accept the Pokédex and comparison.
    const text=c.$('dialogueText').textContent||'';const button=choices[text.includes('soprannome')?1:i];
    if(button?.onclick)button.onclick();else throw Error('Unexpected input '+text);
   }else if(!c.$('dialogueContinue').hidden)c.continue();
  }
 }
 if(error)throw error;assert.ok(done,'Original scene did not terminate');
 assert.equal(c.$('world').dataset.eventError,undefined,c.$('world').dataset.eventError);return messages;
}
(async()=>{
 {
  const c=environment(),j=c.Journey,n=c.NativeStory;n.state.intro=true;n.state.pokedex=true;j.state.starter='Snivy';j.state.phase='route';j.state.party=[j.pack(c.newStoryMon('Snivy',5),135)];c.StoryState.register(j.state,'Snivy',true);
  for(let i=0;i<2;i++){
   const s=new c.GEN5.Session(j.configs(),[{name:'Patrat',level:3}],{seed:[1,2,3,4]});j.attachBattle(s,'wild');
   assert.ok(j.state.dex.seen.includes('Patrat'));const caught=c.newStoryMon('Patrat',3);caught.hp=3;s.battle.win('p1');
   const pages=await drain(c,j.afterBattle(s,'wild',caught,false));assert.ok(pages.some(t=>t.includes('soprannome')));assert.equal(j.state.party.at(-1).hp,3);
  }
  assert.equal(c.dexEntries.length,1);assert.equal(c.dexEntries[0].name,'Patrat');assert.equal(c.dexEntries[0].options.registration,true);
  assert.equal(j.state.party.length,3);assert.equal(j.state.party[0].xp,135,'Captures give no experience in Gen V');
  assert.deepEqual(Array.from(j.state.dex.caught),['Snivy','Patrat']);
  const s=new c.GEN5.Session([{name:'Minccino',level:7}],[{name:'Lillipup',level:2}]);j.attachBattle(s,'tutorial');assert.ok(!j.state.dex.seen.includes('Lillipup'));
  console.log('PASS first capture registration, duplicate catch, original nickname prompt and tutorial exclusion');
 }
 {
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;let count=0;
  const allowed=[[0],[3],[2],[1],[0,1,2,3],[2,3],[0,1]],vectors=[[0,-1],[0,1],[-1,0],[1,0]];
  for(const [zone,data] of Object.entries(c.ORIGINAL_EVENTS.zones))for(const b of data.background){
   if(b.condition>=2||b.script>=2000)continue;
   assert.ok(c.ORIGINAL_EVENTS.scripts[data.script].supportedEntries.includes(b.script-1),'Background script extracted '+zone+':'+b.script);
   n.state.zone=+zone;c.npcs.splice(0);const [ox,oz]=[317,389].includes(+zone)?[784,752]:[16,16];
   for(let dir=0;dir<4;dir++){
    const [dx,dz]=vectors[dir];c.player={x:b.x+.5-ox-dx,y:b.z+.5-oz-dz};c.facing=[0,3,6,9][dir];
    if(!allowed[b.direction].includes(dir)){assert.equal(j.hint(),'','Wrong side '+zone+':'+b.script+':'+dir);continue;}
    assert.equal(j.hint(),'E · Interagisci');const pages=await drain(c,n.interact());assert.ok(pages.length,'Original background text '+zone+':'+b.script);count++;
   }
  }
  assert.equal(count,62);console.log('PASS 62 original sign/furniture interactions and forbidden approach directions');
 }
 {
  const c=environment(),j=c.Journey,other=c.JourneyState.fresh();other.touch=true;other.cinema=false;c.JourneyState.write(c.localStorage,other);
  j.save(true);assert.equal(c.JourneyState.read(c.localStorage).state.touch,true,'Unchanged tab must not overwrite another tab settings');
  c.renderer.zoom=1.8;j.save(true);const settings=c.JourneyState.read(c.localStorage).state;
  assert.equal(settings.zoom,1.8);assert.equal(settings.touch,true);assert.equal(settings.cinema,false,'Only the changed preference is written');
  c.$('touchPreference').checked=true;c.$('touchPreference').onchange();assert.equal(c.JourneyState.read(c.localStorage).state.touch,true);
  c.$('touchPreference').checked=false;c.$('touchPreference').onchange();assert.equal(c.JourneyState.read(c.localStorage).state.touch,false);
  console.log('PASS exploration preferences persist without background-tab overwrites');
 }
 {
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;
  const key=(box,value,target)=>box.onkeydown({key:value,target,preventDefault(){},stopPropagation(){}});
  let answer=n.choice(['SÌ','NO']),box=c.$('starterChoices');key(box,'ArrowDown',box.children[0]);key(box,'Enter');assert.equal(await answer,1);assert.equal(box.onkeydown,null);
  answer=n.choice(['Azione','Fulmisguardo','Annulla']);key(box,'Escape',box.children[0]);assert.equal(await answer,2);
  j.state.party=[j.pack(c.newStoryMon('Snivy',5),135),j.pack(c.newStoryMon('Patrat',3),27)];
  let named=n.nickname(1);box.children[0].value='Vedetta';key(box,'Enter',box.children[0]);assert.equal(await named,0);assert.equal(j.state.party[1].nickname,'Vedetta');assert.equal(j.state.party[0].nickname,'');
  named=n.nickname(1);box.children[0].value='Scarta';key(box,'Escape',box.children[0]);assert.equal(await named,1);assert.equal(j.state.party[1].nickname,'Vedetta');
  console.log('PASS keyboard choices, cancellation and nicknames target the correct party slot');
 }
 {
  const c=environment(),n=c.NativeStory;
  c.startBattle=async()=>{throw Error('Test battle setup failure');};
  for(const [name,args] of [['CallTrainerBattle',[59]],['CallCaptureDemo',[]]]){
   await assert.rejects(n.vm.host.command({name},args,args,n.vm),/Test battle setup failure/);
   assert.equal(n.battleDone(null,'tutorial'),false,'Failed battle must release the pending event callback');
  }
  c.startBattle=async()=>{};c.playCatchingTutorial=async()=>{throw Error('Test tutorial animation failure');};
  await assert.rejects(n.vm.host.command({name:'CallCaptureDemo'},[],[],n.vm),/Test tutorial animation failure/);
  assert.equal(n.battleDone(null,'tutorial'),false);
  console.log('PASS asynchronous battle failures propagate without leaving a waiting field event');
 }
 {
  const c=environment(),j=c.Journey,n=c.NativeStory;n.state.intro=true;
  const moves=[{category:'Physical'},{category:'Status'}],score=(turn,hp,roll)=>Array.from(c.openingMoveScores(moves,turn,hp,100,()=>roll));
  assert.deepEqual(score(1,100,255),[101,100],'Original rivals attack on turn one');
  assert.deepEqual(score(2,51,255),[100,100]);assert.deepEqual(score(2,50,255),[100,101]);
  assert.deepEqual(score(2,25,255),[100,102]);assert.deepEqual(score(2,25,0),[100,100]);

  for(const name of ['Snivy','Tepig','Oshawott','Patrat','Lillipup'])for(const nature of ['Adamant','Modest','Timid']){
   const ivs={hp:0,atk:31,def:12,spe:23,spa:7,spd:29},evs={hp:5,atk:16,def:0,spe:9,spa:4,spd:1};
   const mon=c.makeMon(name,12,{ivs,evs,nature});
   const s=new c.GEN5.Session([{name,level:12,ivs,evs,nature}],[{name:'Patrat',level:2}],{seed:[1,2,3,4]});
   assert.equal(mon.max,s.active().maxhp,name+' max HP');
   for(const stat of ['atk','def','spe','spa','spd'])assert.equal(mon.stats[stat],s.active().storedStats[stat],name+' '+nature+' '+stat);
  }
  const tutorial=c.ORIGINAL_EVENTS.captureTutorial;
  const demo=new c.GEN5.Session([tutorial.player],[tutorial.enemy],{seed:[1,2,3,4]}),events=[];
  await c.runOpeningCaptureTutorial(demo,{message:async text=>events.push(text),move:async(id,side)=>events.push([id,side]),refresh:async()=>{},pause:async ms=>assert.equal(ms,2000),ball:async()=>events.push('ball')});
  assert.equal(demo.active('p2').hp,Math.floor(demo.active('p2').maxhp/6));
  assert.equal(demo.active().boosts.def,-1);assert.equal(demo.battle.ended,true);
  assert.deepEqual(events.filter(Array.isArray),[[1,'p1'],[43,'p2']]);
  assert.ok(events.includes('La Difesa di Minccino diminuisce!'));
  assert.ok(events.includes('La Prof.ssa Aralia usa una Poké Ball!'));
  assert.ok(events.indexOf('ball')>events.findIndex(x=>typeof x==='string'&&x.startsWith('Usa la Poké Ball')));
  const mon=c.newStoryMon('Snivy',12,()=>.1);mon.nickname='Foglia';
  j.state.starter='Snivy';j.state.phase='route';j.state.party=[j.pack(mon,c.OPENING_DATA.Snivy.growth[13]-1)];
  const before=JSON.parse(JSON.stringify(j.state.party[0]));
  const s=new c.GEN5.Session(j.configs(),[{name:'Lillipup',level:4}],{seed:[1,2,3,4]});j.attachBattle(s,'wild');s.battle.win('p1');
  await drain(c,j.afterBattle(s,'wild',null,false));
  const grown=j.state.party[0];assert.equal(grown.level,13);assert.equal(grown.pp[0].id,74,'Choose which move is replaced');
  assert.deepEqual(Array.from(grown.pp.slice(1),x=>x.id),before.pp.slice(1).map(x=>x.id),'Other moves remain unchanged');
  assert.equal(grown.evs.atk,1,'Original Lillipup EV yield');assert.equal(grown.nickname,'Foglia');
  grown.hp=1;grown.pp[0].left=0;j.heal();j.save(true);
  const restored=JSON.parse(JSON.stringify(c.StoryState.read(c.localStorage).party[0]));
  for(const key of ['ivs','nature','gender','abilityId','nickname'])assert.deepEqual(restored[key],before[key],key+' survives healing/save');
  assert.equal(restored.hp,c.makeMon(restored.name,restored.level,restored).max);
  assert.equal(restored.pp[0].left,c.GEN5.moves.find(m=>m.id===74).pp);
  console.log('PASS individual stats, EVs, chosen move replacement, healing and persistence');
 }
 {
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;
  Object.assign(n.state.vars,{16513:2,16517:1,16504:1,16505:1,16512:2,16508:1});j.state.phase='route';
  const directions=[[0,-1],[0,1],[-1,0],[1,0]],dirs={1:1,2:0,3:3,4:2};let count=0;
  for(const [zone,data] of Object.entries(c.ORIGINAL_EVENTS.zones))for(const w of data.warps){
   if(!c.ORIGINAL_EVENTS.zones[w.zone])continue;
   await n.changeZone(+zone,5,6);j.step(1,false);
   const [ox,oz]=[389,317].includes(+zone)?[784,752]:[16,16],dir=dirs[w.a],[dx,dz]=directions[dir];
   const cx=w.x/16-ox,cz=w.z/16-oz;
   c.player={x:cx-dx*.9,y:cz-dz*.9};
   assert.equal(n.tryWarp(-dx,-dz,c.player.x-dx*.3,c.player.y-dz*.3),false,'Wrong direction '+zone);
   const transition=n.tryWarp(dx,dz,c.player.x+dx*.3,c.player.y+dz*.3);assert.ok(transition,'Entrance '+zone+' -> '+w.zone);
   await drain(c,transition);assert.equal(n.state.zone,w.zone);
   const dest=c.ORIGINAL_EVENTS.zones[w.zone].warps[w.warp],out=directions[dirs[dest.a]],origin=[389,317].includes(w.zone)?[784,752]:[16,16];
   assert.equal(c.player.x,dest.x/16-origin[0]-out[0]);assert.equal(c.player.y,dest.z/16-origin[1]-out[1]);
   assert.equal(c.blocked(c.player.x-.18,c.player.y-.18)||c.blocked(c.player.x+.18,c.player.y+.18),false,'Arrival must be walkable '+w.zone);
   assert.equal(n.tryWarp(out[0],out[1],c.player.x+out[0]*.4,c.player.y+out[1]*.4),false,'Arrival cooldown');count++;
  }
  assert.equal(count,14);console.log('PASS all 14 original door/stair transitions, direction, collision and re-entry cooldown');
 }
 {
  const c=environment(),n=c.NativeStory,j=c.Journey;n.state.intro=true;n.state.zone=317;
  j.state.starter='Snivy';j.state.phase='route';j.state.party=[j.pack(c.makeMon('Snivy',5),0)];
  c.Math=Object.create(Math);c.Math.random=()=>0;c.cooldown=999;
  let grass;
  for(const g of j.outdoor.permissionGrids)for(let z=0;z<32;z++)for(let x=0;x<32;x++)if(g.bytes[8+(z*32+x)*8]===4)grass={x:g.x-16+x+.5,y:g.z-16+z+.5};
  assert.ok(grass);c.player=grass;
  j.encounter(.01,true,1);assert.equal(c.lastBattle?.config.story,'wild','First moving step can encounter despite old clock cooldown');
  c.lastBattle=null;n.state.zone=390;j.encounter(10,true,20);assert.equal(c.lastBattle,null,'Indoor coordinates cannot reuse outdoor grass');
  n.state.zone=317;n.state.vars[16508]=2;c.player={x:6.5,y:-80.5};let calls=0;j.encounter=()=>calls++;
  j.step(1/30,true,1);assert.equal(n.state.arrived,true);assert.equal(calls,0,'Arrival event takes priority over random encounters');c.continue();
  console.log('PASS original encounter rate integration, indoor exclusion and scene priority');
 }
 for(const [starter,name] of ['Snivy','Tepig','Oshawott'].entries())for(const outcome of ['p1','p2','play']){
  const c=environment(),n=c.NativeStory,j=c.Journey;
  await drain(c,n.run(4,782),starter,outcome);assert.equal(n.state.vars[16513],1);assert.equal(c.npcs.find(n=>n.name==='Belle').hidden,undefined);
  await drain(c,n.run(8,782),starter,outcome);assert.equal(j.state.starter,name);assert.equal(n.state.vars[16513],2);assert.equal(n.state.roomMess,true);assert.equal(j.state.phase,'mother');
  c.player={x:-7.2,y:-13.5};j.step(1,false);
  assert.equal(c.blocked(c.player.x+.18,c.player.y+.18),false,'Approach to original stairs is walkable');
  const stairs=n.tryWarp(1,0,-7.1,-13.5);assert.ok(stairs,'Solid stair tile must transition before collision');
  await drain(c,stairs,starter,outcome);assert.equal(n.state.zone,390);assert.equal(n.state.vars[16517],1);assert.equal(n.state.phone,true);
  await n.changeZone(392,5,9);await drain(c,n.run(2,784),starter,outcome);assert.equal(n.state.vars[16504],1);
  await n.changeZone(396,4,11);await drain(c,n.run(0,792),starter,outcome);assert.equal(n.state.vars[16505],1);assert.equal(n.state.pokedex,true);
  await n.changeZone(389,777,741);await drain(c,n.run(11,778),starter,outcome);assert.equal(n.state.vars[16512],2);assert.equal(n.state.map,true);
  c.player={x:4.5,y:-12.5};await drain(c,n.run(13,778),starter,outcome);assert.equal(n.state.vars[16508],1);assert.equal(j.state.pokeballs,5);assert.equal(j.state.phase,'route');
  await drain(c,n.run(1,634),starter,outcome);assert.equal(c.potions,1);await drain(c,n.run(1,634),starter,outcome);assert.equal(c.potions,1,'One potion only');
  c.player={x:6.5,y:-73.5};await drain(c,n.run(4,634),starter,outcome);assert.equal(n.state.vars[16508],2);assert.equal(j.state.phase,'route','Comparison is not arrival');
  c.player={x:6.5,y:-80.5};j.step(1/30,true);c.continue();j.save(true);assert.equal(j.state.phase,'arrival');
  const saved=c.StoryState.read(c.localStorage);assert.equal(saved.original.arrived,true);assert.equal(saved.starter,name);assert.equal(saved.original.vars[16508],2);
  if(outcome==='p1')assert.equal(saved.money,4000);if(outcome==='p2')assert.equal(saved.money,3000);
  console.log('PASS original scenes',name,outcome);
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
