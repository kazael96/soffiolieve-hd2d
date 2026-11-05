/* Native extracted records; these assertions do not certify rendered gameplay. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src'),context={window:{}};vm.createContext(context);
for(const name of ['mistralton-data','icirrus-data','icirrus-events','icirrus-scenes'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),context);
const d=JSON.parse(JSON.stringify(context.window.ICIRRUS_DATA)),old=JSON.parse(JSON.stringify(context.window.MISTRALTON_DATA)),events=context.window.ICIRRUS_EVENTS;

test('native Anemone party and badge cap steps remain distinct',()=>{
 assert.deepEqual(d.trainers[25].party.map(p=>[p.name,p.level]),[['Swoobat',33],['Unfezant',33],['Swanna',35]]);
 assert.deepEqual(d.capSteps,[{badge:4,level:31},{badge:5,level:35},{badge:6,level:39}]);
 assert.equal(d.levelCap,39);assert.equal(d.trainers[131],undefined,'The next Gym is outside this chapter');
});
test('legacy species identities, growth tables, learnsets and machine access are preserved',()=>{
 for(const [name,row]of Object.entries(old.progression)){
  const next=d.progression[name];assert.ok(next,name);assert.equal(next.id,row.id,name);assert.deepEqual(next.abilities,row.abilities,name);
  assert.deepEqual(next.moves.filter(m=>m.level<=35),row.moves,name);
  assert.deepEqual(d.pokemonData[name],old.pokemonData[name],name);
  for(const item of old.compatibility[name])assert.ok(d.compatibility[name].includes(item),name+' '+item);
 }
 for(const [item,move]of Object.entries(old.machines))assert.equal(d.machines[item],move,item);
});
test('new evolutions include final starters and the already reachable Thunder Stone',()=>{
 for(const [base,target]of [['Servine','Serperior'],['Pignite','Emboar'],['Dewott','Samurott']]){
  assert.ok(d.evolutions[base].some(e=>e.target===target&&e.method===4&&e.parameter===36));assert.equal(d.progression[target].obtainable,true);
 }
 assert.ok(d.evolutions.Eelektrik.some(e=>e.target==='Eelektross'&&e.method===8&&e.parameter===83));
 assert.equal(d.progression.Eelektross.obtainable,true);assert.equal(d.progression.Axew.obtainable,false);assert.equal(d.progression.Golett.obtainable,false);
});
test('all four seasonal encounter records preserve weights, form bits and levels',()=>{
 for(const [zone,table]of Object.entries(d.encounters)){
  assert.equal(table.seasons.length,4,zone);
  for(const groups of table.seasons)for(const [kind,g]of Object.entries(groups)){
   assert.equal(g.slots.reduce((n,s)=>n+s.weight,0),100,zone+' '+kind);
   for(const s of g.slots){assert.equal(s.id,s.sourceRawSpecies&1023);assert.equal(s.form,s.sourceRawSpecies>>>10);assert.ok(s.min>=1&&s.min<=s.max&&s.max<=100);}
  }
 }
 assert.equal(d.encounters[113].seasons[3].normal,undefined,'Icirrus winter has no marsh ground encounters');
 assert.ok(d.encounters[113].seasons[0].normal.slots.some(s=>s.name==='Shelmet'));
 assert.ok(d.encounters[113].seasons[0].surf.slots.every(s=>s.name==='Stunfisk'));
});
test('reference-only phenomena and fishing do not become new capture sources',()=>{
 assert.deepEqual(d.referenceOnlyEncounterKinds,['shaking','rippleSurf','fishing','rippleFishing']);
 for(const sources of Object.values(d.encounterSources))for(const s of sources)assert.ok(['normal','dark','surf'].includes(s.kind));
 assert.equal(d.progression.Alomomola.obtainable,false,'Trainer Alomomola is not an ordinary Surf encounter');
 assert.equal(d.progression.Frillish.obtainable,true);
});
test('native machine identities, extended shop stock and chapter boundaries are explicit',()=>{
 assert.equal(d.machines[341],59);assert.equal(d.machines[389],512);assert.equal(d.machines[422],57);
 assert.equal(d.market.fixedStocks[7],13);assert.ok(d.market.stocks[13].length);
 assert.equal(d.machineSource.ramAddress,'0x209ea20');
 assert.equal(Object.keys(events.zones).length,27);assert.equal(events.zones[114],undefined);
 assert.equal(Object.keys(context.window.ICIRRUS_SCENES).length,27);
 for(const scene of Object.values(context.window.ICIRRUS_SCENES))assert.equal(scene.instances,undefined,'Scene geometry remains deferred');
});

test('all three final starter evolutions survive save normalization without losing legacy XP',()=>{
 const c={window:{TRAINING_DATA:structuredClone(d)}};vm.createContext(c);
 for(const name of ['training','story-state'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),c);
 const api=c.window.StoryState;
 for(const [starter,final]of [['Snivy','Serperior'],['Tepig','Emboar'],['Oshawott','Samurott']]){
  const save={...api.fresh(),phase:'mistralton',scene:'zone107',starter,party:[{name:final,level:45,xp:9000000,hp:70,pp:[{id:33,left:8}]}]};
  const clean=api.normalize(save);assert.ok(clean,'Final starter '+final+' cannot invalidate the save');
  assert.equal(clean.party[0].name,final);assert.equal(clean.party[0].level,45);assert.equal(clean.party[0].xp,9000000);
 }
});

test('new ordinary held items and the native trade Lum Berry survive save normalization',()=>{
 const c={window:{TRAINING_DATA:structuredClone(d)}};vm.createContext(c);
 for(const name of ['training','story-state'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),c);
 const api=c.window.StoryState;
 for(const id of [24,39,51,83,92,93,157,233,247,504]){
  const save={...api.fresh(),phase:'mistralton',scene:'zone107',starter:'Snivy',party:[{name:'Snivy',level:30,hp:70,heldItem:id,pp:[]}]};
  assert.equal(api.normalize(save).party[0].heldItem,id,'Ordinary native item '+id+' must not disappear');
 }
 assert.equal(d.itemNames[157],'Baccaprugna');assert.equal(d.itemPockets[157],3);
});

test('actual Journey give/take operations preserve the new ordinary items and do not duplicate them',()=>{
 const oldSite=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment}=require('./check-story-runtime.cjs');process.argv[2]=oldSite;
 const c=environment({sourceRoot:root,mistralton:true}),j=c.Journey;c.ICIRRUS_DATA=d;j.state.starter='Snivy';j.state.phase='mistralton';j.state.party=[j.pack(c.makeMon('Snivy',5))];
 for(const id of [24,39,51,83,92,93,157,233,247,504]){
  j.addItem(id,1);const before=j.itemCount(id);assert.equal(j.giveItem(id,0),true,'Give native ordinary item '+id);
  assert.equal(j.state.party[0].heldItem,id);assert.equal(j.itemCount(id),before-1);
  assert.equal(c.StoryState.normalize(j.state).party[0].heldItem,id);
  assert.equal(j.takeItem(0),id);assert.equal(j.itemCount(id),before);assert.equal(j.takeItem(0),0);
 }
});
