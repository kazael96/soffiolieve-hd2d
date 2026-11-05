/* Native decoded records/portraits; real GPU and authored choreography are separate. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src'),proof=JSON.parse(fs.readFileSync(path.join(root,'assets/animated/provenance-051.json'))),c={MENU_ASSETS:{pokemonIcons:{}},PARTY_DETAIL_ASSETS:{itemMap:{}}};c.window=c;vm.createContext(c);for(const name of ['pokemon-anim','opelucid-menu'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),c);const api=c.ROM_SPRITE_ANIM;
test('all fifteen native species and female Jellicent retain verified front/back atlas files',()=>{
 assert.equal(proof.species.length,15);assert.deepEqual(proof.femaleVariants,[593]);assert.equal(proof.records.length,64);for(const r of proof.records){const bytes=fs.readFileSync(path.join(root,'..',r.asset));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256,r.asset);}
 const portraits=JSON.parse(fs.readFileSync(path.join(root,'assets/pokemon/provenance-051.json')));assert.equal(portraits.records.length,32);for(const r of portraits.records){const bytes=fs.readFileSync(path.join(root,'..',r.asset));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256);assert.equal(bytes.readUInt32BE(16),96);assert.equal(bytes.readUInt32BE(20),96);}
});
test('native composites have valid parts and bounds for two complete loops on each side',()=>{
 for(const id of [...proof.species,'593-female'])for(const side of ['front','back']){const d=JSON.parse(fs.readFileSync(path.join(root,'assets/animated',id+'-'+side+'.json'))),duration=d.parent[0].frames.reduce((sum,f)=>sum+Math.max(1,f[1]),0);for(let tick=0;tick<duration*2;tick++){const parts=api.parts(d,tick),bounds=api.bounds(d,tick);assert.ok(parts.length,id+' '+side+' '+tick);assert.ok(bounds.every(Number.isFinite));assert.ok(bounds[2]>bounds[0]&&bounds[3]>bounds[1]);for(const p of parts){assert.ok(d.images[p.o[4]]);assert.ok(p.f.every(Number.isFinite));}}}
});
test('new native menu icon cells and item references exist with reviewed palettes',()=>{
 const menu=c.OPELUCID_MENU;assert.equal(Object.keys(menu.icons).length,15);for(const id of proof.species){const icon=menu.icons[id];assert.ok(icon,id);assert.ok(icon.cells.length>=2);assert.equal(icon.source.archive,'a/0/0/7');for(const cell of icon.cells)assert.ok(fs.existsSync(path.join(root,cell.src)));}
 for(const [id,palette]of [[553,0],[556,1],[558,2],[576,2],[593,0],[598,1],[606,2],[608,2],[611,1]])assert.equal(menu.icons[id].source.paletteSlot,palette,id);
 for(const item of Object.values(menu.items))assert.ok(fs.existsSync(path.join(root,item.src)));
});
