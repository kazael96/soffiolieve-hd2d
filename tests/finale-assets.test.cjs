const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function load(name,c={}){c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),c);return c;}
const prior=load('league-data').LEAGUE_DATA,current=load('finale-data').FINALE_DATA,oldIds=new Set(Object.values(prior.progression).map(p=>p.id)),ids=[...new Set(Object.values(current.progression).map(p=>p.id))].filter(id=>!oldIds.has(id));
test('first-ending catalog preserves all previous species/machines and separates postgame parties',()=>{
 assert.equal(Object.keys(current.progression).length,147);assert.equal(ids.length,10);
 for(const name of Object.keys(prior.progression))assert.ok(current.progression[name],name);for(const [item,move]of Object.entries(prior.machines))assert.equal(current.machines[item],move,item);
 for(const id of [407,563,564,565,566]){assert.equal(current.trainers[id],undefined);assert.ok(current.referenceOnlyTrainers[id]);}
 for(const id of [228,229,230,231])assert.equal(Math.max(...current.trainers[id].party.map(p=>p.level)),50);
 assert.equal(Math.max(...current.trainers[587].party.map(p=>p.level)),52);assert.equal(Math.max(...current.trainers[232].party.map(p=>p.level)),54);
 assert.equal(current.trainers[587].party[0].name,'Zekrom');assert.equal(current.progression.Reshiram.obtainable,true);assert.equal(current.progression.Zekrom.obtainable,false);assert.equal(current.progression.Mandibuzz.obtainable,true);assert.equal(current.progression.Hydreigon.obtainable,false);
});
test('ten cries preserve original PCM bytes, formats, native speed and volume',()=>{
 const c=load('finale-audio',{FIELD_AUDIO:{legacy:1},ROM_AUDIO_CATALOG:{cries:{legacy:1}}});assert.equal(Object.keys(c.FINALE_AUDIO.cries).length,10);
 for(const sid of ids){const r=c.FINALE_AUDIO.cries[sid],b=fs.readFileSync(path.join(root,r.file));assert.equal(hash(b),r.wavSha256);assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WAVE');let format,data;
  for(let offset=12;offset+8<=b.length;){const size=b.readUInt32LE(offset+4),kind=b.subarray(offset,offset+4).toString();if(kind==='fmt ')format=b.subarray(offset+8,offset+8+size);if(kind==='data')data=b.subarray(offset+8,offset+8+size);offset+=8+size+(size%2);}
  assert.ok(format&&data);assert.equal(format.readUInt16LE(0),1);assert.equal(format.readUInt16LE(2),1);assert.equal(format.readUInt16LE(14),16);assert.equal(format.readUInt32LE(4),r.sampleRate);assert.equal(data.length,r.samples*2);assert.ok(data.some(v=>v!==0));assert.ok(r.nativeSpeed>0&&r.baseVolume>0);assert.equal(c.ROM_AUDIO_CATALOG.cries[sid],r);
 }assert.equal(c.FIELD_AUDIO.legacy,1);assert.equal(c.ROM_AUDIO_CATALOG.cries.legacy,1);
});
test('all native composites and96pixel portraits match their byte provenance on both sides',()=>{
 const sprites=JSON.parse(fs.readFileSync(path.join(root,'assets/animated/provenance-053.json'),'utf8')),portraits=JSON.parse(fs.readFileSync(path.join(root,'assets/pokemon/provenance-053.json'),'utf8'));
 assert.equal(sprites.records.length,40);assert.equal(portraits.records.length,20);
 for(const r of sprites.records)assert.equal(hash(fs.readFileSync(path.join(root,'assets/animated',r.asset))),r.sha256,r.asset);
 for(const sid of ids)for(const side of ['front','back']){const file='src/assets/pokemon/'+sid+'-'+side+'.png',r=portraits.records.find(r=>r.asset===file);assert.ok(r,file);const b=fs.readFileSync(path.resolve(root,'..',file));assert.equal(hash(b),r.sha256);assert.equal(b.readUInt32BE(16),96);assert.equal(b.readUInt32BE(20),96);}
});
test('native menu palettes retain three cells and six original icon sequences without changing prior item icons',()=>{
 const c=load('finale-menu',{MENU_ASSETS:{pokemonIcons:{legacy:1}},PARTY_DETAIL_ASSETS:{itemMap:{legacy:1}}}),palettes=require('../tools/finale-menu-palettes.json');assert.equal(Object.keys(c.FINALE_MENU.icons).length,10);
 for(const sid of ids){const r=c.FINALE_MENU.icons[sid];assert.equal(r.source.archive,'a/0/0/7');assert.equal(r.source.char,sid*2+7);assert.equal(r.source.paletteSlot,palettes[sid]);assert.equal(r.cells.length,3);assert.equal(r.animations.length,6);for(const animation of r.animations)for(const [cell,duration]of animation.frames){assert.ok(cell>=0&&cell<r.cells.length);assert.ok(duration>0);}for(const cell of r.cells)assert.ok(fs.existsSync(path.join(root,cell.src)));}
 const previous=load('league-menu',{MENU_ASSETS:{pokemonIcons:{}},PARTY_DETAIL_ASSETS:{itemMap:{}}});for(const [id,r]of Object.entries(c.FINALE_MENU.items))assert.equal(r.src,previous.LEAGUE_MENU.items[id].src);
 assert.equal(c.MENU_ASSETS.pokemonIcons.legacy,1);assert.equal(c.PARTY_DETAIL_ASSETS.itemMap.legacy,1);
});
