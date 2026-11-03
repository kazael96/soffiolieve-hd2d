const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function context(){const c={};c.window=c;vm.createContext(c);for(const f of ['training-data','driftveil-data','mistralton-data','pokemon-visuals','training'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c,{filename:f});for(const key of ['evolutions','progression','compatibility','machines','pokemonData'])Object.assign(c.TRAINING_DATA[key],c.MISTRALTON_DATA[key]);c.TRAINING_DATA.levelCap=35;return c;}
test('chapter049 preserves every earlier pair and adds legal native Fly and Bulldoze sources',()=>{
 const c=context(),d=c.MISTRALTON_DATA;
 for(const line of fs.readFileSync('docs/SPECIES-MOVES-048.md','utf8').split('\n').filter(l=>/^\| [^|]+ \| \d+ \|/.test(l))){const [,name,,moves]=line.split('|').map(s=>s.trim()),now=c.Training.moves(name);for(const id of moves.split(',').map(Number))assert.ok(now.includes(id),name+' lost '+id);}
 assert.equal(Object.keys(d.progression).length,85);assert.equal(d.machines[405],523);assert.equal(d.machines[421],19);
 assert.deepEqual(Object.entries(d.compatibility).filter(([,ids])=>ids.includes(421)).map(([name])=>name).sort(),['Ducklett','Pidove','Sigilyph','Swanna','Swoobat','Tranquill','Unfezant','Woobat']);
 for(const name of ['Excadrill','Darmanitan'])assert.ok(d.compatibility[name].includes(405),name+' Bulldoze');
 assert.ok(!d.compatibility.Archen.includes(421));assert.ok(!d.compatibility.Tynamo.includes(405));
 for(const [name,row]of Object.entries(d.progression)){assert.ok(row.moves.every(m=>m.level>=1&&m.level<=35),name);assert.equal(d.pokemonData[name].growth.length,101);}
});
test('native evolutions include31/32/34/35 and seasonal aliases keep their evolution form',()=>{
 const d=context().MISTRALTON_DATA;
 for(const [name,level,target]of [['Drilbur',31,'Excadrill'],['Tranquill',32,'Unfezant'],['Herdier',32,'Stoutland'],['Gothita',32,'Gothorita'],['Deerling',34,'Sawsbuck'],['Darumaka',35,'Darmanitan'],['Ducklett',35,'Swanna'],['Vanillite',35,'Vanillish']])assert.ok(d.evolutions[name].some(e=>e.method===4&&e.parameter===level&&e.target===target),name);
 for(const season of ['Summer','Autumn','Winter']){const name='Deerling-'+season;assert.equal(d.evolutions[name][0].target,'Sawsbuck-'+season);assert.equal(d.progression[name].form,d.progression['Sawsbuck-'+season].form);assert.deepEqual(d.compatibility[name],d.compatibility.Deerling);}
});
test('reachable Scald and Sky Drop TMs use native compatibility without inventing Sky Drop learners',()=>{
 const d=context().MISTRALTON_DATA;assert.equal(d.machines[382],503);assert.equal(d.machines[385],507);
 assert.deepEqual(Object.entries(d.compatibility).filter(([,ids])=>ids.includes(382)).map(([name])=>name).sort(),['Basculin','Basculin-Blue-Striped','Dewott','Ducklett','Frillish','Oshawott','Palpitoad','Panpour','Simipour','Swanna','Tirtouga','Tympole']);
 assert.deepEqual(Object.entries(d.compatibility).filter(([,ids])=>ids.includes(385)),[]);assert.equal(Object.keys(d.machines).length,26);
});
test('graphic identity retains female and seasonal originals without changing battle species',()=>{
 const c=context(),v=c.PokemonVisuals;c.ROM_FORM_SPRITES={darmanitanzen:{species:555,graphic:700}};assert.equal(v.speciesId(700),555,'preserve the existing form map');
 for(const [name,id]of [['Unfezant',521],['Frillish',592]]){assert.equal(v.graphic({name,id,gender:'F'}),id+'-female');assert.equal(v.graphic({name,id,gender:'M'}),id);assert.equal(v.menuId({name,id,gender:'F'}),id);assert.equal(v.speciesId(id+'-female'),id);}
 for(const [name,id,first]of [['Deerling',585,701],['Sawsbuck',586,704]])for(let form=0;form<4;form++){const mon={name,id,gender:'F',form},before=JSON.stringify(mon),graphic=form?first+form-1:id;assert.equal(v.graphic(mon),graphic);assert.equal(v.speciesId(graphic),id);assert.equal(v.menuId(mon),graphic);assert.equal(v.identity(mon).form,form);assert.equal(v.graphic({id:graphic}),graphic);assert.equal(JSON.stringify(mon),before);}
 assert.equal(v.graphic({name:'Deerling-Autumn'}),702);assert.equal(v.graphic({name:'Sawsbuck',season:'Winter'}),706);
});
test('Hidden Power consultation uses native bit9 without making its TM obtainable',()=>{
 const d=context().MISTRALTON_DATA;assert.equal(d.machines[337],undefined);assert.equal(Object.keys(d.hiddenPowerCompatibility).length,85);
 assert.deepEqual(Object.entries(d.hiddenPowerCompatibility).filter(([,can])=>!can).map(([name])=>name),['Tynamo']);assert.equal(d.hiddenPowerCompatibility['Deerling-Winter'],true);
});
test('new native items retain the original bag pocket instead of disappearing from the UI',()=>{
 const d=context().MISTRALTON_DATA;assert.equal(Object.keys(d.itemPockets).length,Object.keys(d.itemNames).length);
 for(const [id,pocket]of [[150,3],[405,2],[421,2],[450,4],[231,0],[540,0],[92,0]])if(d.itemNames[id])assert.equal(d.itemPockets[id],pocket,'native pocket '+id);
});
test('scoped original front/back gender and season files match their provenance and differ where required',()=>{
 const report=JSON.parse(fs.readFileSync('src/assets/animated/provenance-049.json','utf8'));assert.equal(report.records.length,116);
 for(const r of report.records){const bytes=fs.readFileSync(r.asset);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256,r.asset);if(r.asset.endsWith('.json')){const d=JSON.parse(bytes);assert.ok(d.cells.length&&d.maps.length&&d.animations.length);for(const cells of d.cells)for(const o of cells)assert.ok(d.images[o[4]],r.asset);}}
 for(const id of [521,592])for(const side of ['front','back'])assert.notDeepEqual(fs.readFileSync(`src/assets/animated/${id}-${side}.png`),fs.readFileSync(`src/assets/animated/${id}-female-${side}.png`));
 for(const id of [701,702,703,704,705,706])assert.ok(fs.existsSync(`src/assets/animated/${id}-back.json`));
});
test('new menu graphics use reviewed native palettes including all six seasonal icons',()=>{
 const c={MENU_ASSETS:{pokemonIcons:{}},PARTY_DETAIL_ASSETS:{itemMap:{}}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('src/mistralton-menu.js','utf8'),c);const m=c.MISTRALTON_MENU;
 assert.equal(Object.keys(m.icons).length,27);for(const [id,slot]of [[508,2],[590,0],[592,0],[597,1],[701,1],[702,0],[703,2],[704,1],[705,0],[706,1]])assert.equal(m.icons[id].source.paletteSlot,slot);
 for(const group of Object.values(m.icons))for(const cell of group.cells)assert.ok(fs.existsSync('src/'+cell.src));for(const id of [405,421])assert.ok(fs.existsSync('src/'+m.items[id].src));
});
