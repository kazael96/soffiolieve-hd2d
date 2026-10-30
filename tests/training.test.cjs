const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function context(){const c={structuredClone};c.window=c;vm.createContext(c);for(const f of ['training-data','training','story-state'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);return c;}
test('bridge saves preserve the current deck and discard malformed hints without deleting the party',()=>{
 const c=context(),s=c.StoryState.fresh();c.StoryState.choose(s,'Snivy');s.phase='skyarrow';s.scene='zone249';s.player={x:97,y:259};s.party=[{name:'Servine',level:20,hp:20,pp:[{id:33,left:20}]}];s.original={zone:249,flags:[],vars:{},railCurrent:{zone:249,height:31.125,line:3,front:4,side:0}};
 const good=c.StoryState.normalize(s);assert.ok(good);assert.equal(good.original.railCurrent.height,31.125);assert.equal(good.player.y,259);assert.equal(good.party[0].name,'Servine');
 for(const hint of [{zone:249,height:Infinity,line:3},{zone:249,height:2,line:-1},{zone:28,height:2,line:3}]){s.original.railCurrent=hint;const result=c.StoryState.normalize(s);assert.ok(result);assert.equal(result.original.railCurrent,undefined);assert.equal(result.party[0].name,'Servine');}
});
test('battle and step experience share the level25 boundary without regressing older saves',()=>{
 const c=context(),t=c.Training,g=c.TRAINING_DATA.pokemonData.Snivy.growth;
 for(const level of [5,14,15,16,24,25]){
  const p={level,xp:g[level]},a=t.xp(p,1e9,g);assert.equal(a.total,g[25]);assert.equal(a.earned,g[25]-g[level]);assert.equal(t.cap(p),25);
 }
 for(const level of [26,50,100]){
  const p={level,xp:g[level]+123},a=t.xp(p,9999,g);assert.equal(t.cap(p),level);assert.equal(a.total,p.xp);assert.equal(a.earned,0);
 }
 assert.equal(t.limit(),25);assert.equal(t.xp({level:25,xp:g[25]},100,g).earned,0);
 assert.equal(t.xp({level:15,xp:g[15]},-1,g).earned,0);
});
test('native evolution thresholds and ability slots distinguish Herdier from Lillipup',()=>{
 const c=context(),t=c.Training;
 for(const [name,level,target]of [['Snivy',17,'Servine'],['Tepig',17,'Pignite'],['Oshawott',17,'Dewott'],['Lillipup',16,'Herdier'],['Patrat',20,'Watchog'],['Purrloin',20,'Liepard'],['Pidove',21,'Tranquill'],['Roggenrola',25,'Boldore'],['Timburr',25,'Gurdurr'],['Tympole',25,'Palpitoad']]){
  assert.equal(t.evolution({name,level:level-1}),null,name+' too early');assert.equal(t.evolution({name,level}).target,target);
  assert.equal(t.evolution({name,level,heldItem:229}),null,'Everstone');
 }
 assert.equal(t.ability({name:'Lillipup',abilityId:72},'Herdier'),22);
 assert.equal(t.ability({name:'Lillipup',abilityId:53},'Herdier'),146);
 assert.equal(t.ability({name:'Lillipup',abilityId:50},'Herdier'),113);
 assert.equal(t.ability({name:'Lillipup'},'Herdier'),22,'legacy default');
 assert.equal(t.evolution({name:'Servine',level:25}),null);
 assert.equal(t.evolution({name:'Boldore',level:25}),null,'no automatic trade evolution');
 assert.equal(t.evolution({name:'Munna',level:25}),null,'no automatic stone evolution');
});
test('evolved starters round-trip without deleting the game, including daycare',()=>{
 const c=context(),s=c.StoryState;
 for(const [base,evolved]of [['Snivy','Servine'],['Tepig','Pignite'],['Oshawott','Dewott']]){
  const state={...s.fresh(),phase:'nacrene',starter:base,party:[{name:evolved,level:25,xp:12345,pp:[{id:33,left:5}]}],original:{zone:16,flags:[],vars:{16530:2}}};
  const clean=s.normalize(state);assert.ok(clean);assert.equal(clean.party[0].name,evolved);assert.equal(clean.starter,base);assert.equal(clean.original.vars[16530],2);
  state.party=[{name:'Patrat',level:15,pp:[]}];state.original.daycare={pokemon:{name:evolved,level:25,pp:[{id:33,left:5}]},level:17,distance:.5};
  assert.equal(s.normalize(state).original.daycare.pokemon.name,evolved);
  state.original.daycare.pokemon.name=base==='Snivy'?'Pignite':'Servine';assert.equal(s.normalize(state),null,'wrong starter family');
 }
});
test('every ROM-derived training record has finite growth and learnset/ability data',()=>{
 const d=context().TRAINING_DATA;
 for(const [name,p]of Object.entries(d.progression)){
  assert.equal(d.pokemonData[name].growth.length,101,name);assert.ok(d.pokemonData[name].growth.every(Number.isFinite));
  assert.ok(p.moves.length,name);assert.ok(p.moves.every(m=>m.level<=25&&m.level>=1));assert.ok(p.abilities[0]>0,name);
 }
});
test('all training species have summary, search, habitat and native menu resources',()=>{
 const c=context();c.MENU_ASSETS={pokemonIcons:{}};
 for(const f of ['pokedex-assets','dex-effects-assets','dex-search-assets','training-menu'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);
 for(const [name,p]of Object.entries(c.TRAINING_DATA.progression)){
  assert.equal(c.POKEDEX_ASSETS.species[name].id,p.id);assert.ok(c.DEX_SEARCH_ASSETS.species[p.id],name+' search');
  const habitat=c.DEX_EFFECTS_ASSETS.habitat;assert.equal(habitat.species[p.id].seasons.length,4,name+' habitat');
  for(const season of habitat.species[p.id].seasons)for(const area of season.areas)assert.ok(habitat.areas[area.row],name+' habitat mask');
  assert.ok(fs.existsSync('src/assets/pokedex/foot-'+p.id+'.png'));for(const type of c.POKEDEX_ASSETS.species[name].types)assert.ok(fs.existsSync('src/assets/pokedex/type-'+type+'.png'));
  if(c.TRAINING_MENU.icons[p.id])for(const cell of c.TRAINING_MENU.icons[p.id].cells)assert.ok(fs.existsSync('src/'+cell.src));
 }
 for(const id of [496,499,502,505,507,510,520,525,533,536])assert.ok(c.TRAINING_MENU.icons[id],'evolved menu icon '+id);
});
