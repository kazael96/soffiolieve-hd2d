/* Native source checks. These do not certify the unfinished chapter runtime. */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function load(){const c={};c.window=c;vm.createContext(c);for(const name of ['training-data','pinwheel-data','castelia-data','nimbasa-data','driftveil-data','training'])vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),c);for(const k of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(c.TRAINING_DATA[k],c.PINWHEEL_DATA[k],c.CASTELIA_DATA[k],c.NIMBASA_DATA[k],c.DRIFTVEIL_DATA[k]);c.TRAINING_DATA.levelCap=c.DRIFTVEIL_DATA.levelCap;return c;}
test('requested level30 policy caps new experience and preserves older higher levels',()=>{
 const c=load(),g=c.TRAINING_DATA.pokemonData.Snivy.growth,t=c.Training;
 assert.equal(t.limit(),30);
 for(const level of [5,15,25,26,27,29,30]){const p={level,xp:g[level]},r=t.xp(p,1e9,g);assert.equal(r.total,g[30]);assert.equal(r.earned,g[30]-g[level]);}
 for(const level of [31,50,100]){const p={level,xp:g[level]+123};assert.equal(t.xp(p,1e9,g).total,p.xp);assert.equal(t.cap(p),level);}
});
test('new level evolutions retain native thresholds and ability slots',()=>{
 const c=load(),t=c.Training;
 for(const [name,level,target]of [['Blitzle',27,'Zebstrika'],['Sandile',29,'Krokorok'],['Whirlipede',30,'Scolipede']]){
  assert.equal(t.evolution({name,level:level-1}),null);assert.equal(t.evolution({name,level}).target,target);assert.equal(t.evolution({name,level,heldItem:229}),null);
  const from=c.TRAINING_DATA.progression[name].abilities,to=c.TRAINING_DATA.progression[target].abilities;from.forEach((a,i)=>assert.equal(t.ability({name,abilityId:a},target),to[i]||to[0]));
 }
 for(const name of ['Servine','Pignite','Dewott','Krokorok','Tranquill','Herdier'])assert.equal(t.evolution({name,level:30}),null,name);
});
test('level30 data preserves existing forms and contains no moves learned after the cap',()=>{
 const c=load(),d=c.DRIFTVEIL_DATA;
 for(const [name,p]of Object.entries({...c.TRAINING_DATA.progression,...c.PINWHEEL_DATA.progression,...c.CASTELIA_DATA.progression,...c.NIMBASA_DATA.progression})){
  assert.ok(d.progression[name],name);for(const m of p.moves)assert.ok(d.progression[name].moves.some(x=>x.id===m.id&&x.level===m.level),name+' lost '+m.id);
 }
 for(const [name,p]of Object.entries(d.progression)){assert.ok(p.moves.every(m=>m.level>=1&&m.level<=30),name);assert.equal(d.pokemonData[name].growth.length,101);assert.ok(d.pokemonData[name].growth.every(Number.isFinite));}
 assert.deepEqual(Array.from(d.progression['Basculin-Blue-Striped'].abilities),[69,91,104]);assert.equal(d.progression['Basculin-Blue-Striped'].obtainable,false);
});
test('Camelia uses the original Emolga/Emolga/Zebstrika team and awards native Volt Switch TM',()=>{
 const d=load().DRIFTVEIL_DATA,t=d.trainers[23];
 assert.deepEqual(Array.from(t.party,p=>[p.name,p.level]),[['Emolga',25],['Emolga',25],['Zebstrika',27]]);
 assert.ok(t.party.every(p=>p.moves.includes(521)));assert.equal(d.machines[399],521);assert.equal(d.itemNames[399],'MT72');
 assert.ok(d.compatibility.Emolga.includes(399));assert.ok(d.compatibility.Zebstrika.includes(399));assert.ok(!d.compatibility.Snivy.includes(399));
});
test('Route5 encounters match Black and bridge shadows do not invent ordinary grass encounters',()=>{
 const d=load().DRIFTVEIL_DATA,r=d.encounters[329],b=d.encounters[253];
 for(const g of [{slots:r.slots},r.dark,r.shaking,b.shaking])assert.equal(g.slots.reduce((s,x)=>s+x.weight,0),100);
 assert.deepEqual([...new Set(Array.from(r.slots,x=>x.name))].sort(),['Gothita','Liepard','Minccino','Trubbish']);
 assert.ok(!r.slots.some(x=>x.name==='Solosis'));assert.equal(b.rate,0);assert.equal(b.slots.length,0);assert.ok(b.shaking.slots.every(x=>x.name==='Ducklett'&&x.min>=22&&x.max<=25));
});
test('N, all three Komor variants and both partner opponents have native teams',()=>{
 const d=load().DRIFTVEIL_DATA;
 assert.deepEqual(Array.from(d.trainers[89].party,p=>[p.name,p.level]),[['Sandile',22],['Darumaka',22],['Scraggy',22],['Sigilyph',22]]);
 for(const [id,starter]of [[90,'Pignite'],[91,'Dewott'],[92,'Servine']]){const p=d.trainers[id].party;assert.equal(p.length,4);assert.equal(p[3].name,starter);assert.equal(p[3].level,26);}
 for(const id of [401,402]){assert.equal(d.trainers[id].party.length,1);assert.equal(d.trainers[id].party[0].name,'Herdier');assert.equal(d.trainers[id].party[0].level,26);}
});
