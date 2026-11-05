/* Original animation records, icon palettes and static portraits; GPU QA is separate. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src'),proof=JSON.parse(fs.readFileSync(path.join(root,'assets/animated/provenance-050.json'))),c={MENU_ASSETS:{pokemonIcons:{}},PARTY_DETAIL_ASSETS:{itemMap:{}}};c.window=c;
vm.createContext(c);for(const name of ['pokemon-anim','icirrus-menu'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),c);
const api=c.window.ROM_SPRITE_ANIM;
test('all24 newly selected species have native front/back atlases with verified extraction hashes',()=>{
 assert.equal(proof.species.length,24);assert.equal(proof.records.length,96);
 for(const record of proof.records){const bytes=fs.readFileSync(path.join(root,'..',record.asset));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256,record.asset);}
 for(const id of proof.species)for(const side of ['front','back']){
  const file=path.join(root,'assets/pokemon',id+'-'+side+'.png'),png=fs.readFileSync(file);assert.equal(png.toString('ascii',1,4),'PNG');assert.equal(png.readUInt32BE(16),96);assert.equal(png.readUInt32BE(20),96);
 }
});
test('native composite playback retains valid parts and finite bounds through two animation loops on both sides',()=>{
 for(const id of proof.species)for(const side of ['front','back']){
  const data=JSON.parse(fs.readFileSync(path.join(root,'assets/animated',id+'-'+side+'.json'))),duration=data.parent[0].frames.reduce((n,f)=>n+Math.max(1,f[1]),0);
  for(let tick=0;tick<duration*2;tick++){
   const parts=api.parts(data,tick),bounds=api.bounds(data,tick);assert.ok(parts.length,id+' '+side+' '+tick);assert.ok(bounds.every(Number.isFinite));assert.ok(bounds[2]>bounds[0]&&bounds[3]>bounds[1]);
   for(const part of parts){assert.ok(data.images[part.o[4]],id+' missing atlas part');assert.ok(part.f.every(Number.isFinite));}
  }
 }
});
test('Solosis and Duosion gel backing stays behind the body and face in actual renderer order',()=>{
 for(const id of [577,578])for(const side of ['front','back']){
  const d=JSON.parse(fs.readFileSync(path.join(root,'assets/animated',id+'-'+side+'.json'))),parts=api.parts(d,0),tracks=[...new Set(parts.map(p=>p.r[0]))];
  assert.equal(tracks[0],1,'The opaque backing must be drawn first');assert.ok(tracks.indexOf(0)>0,'The body must draw over its backing');
 }
});
test('new menu cells use visually reviewed original palettes and retain animated icon frames',()=>{
 const icons=c.window.ICIRRUS_MENU.icons;assert.equal(Object.keys(icons).length,24);
 for(const id of proof.species){const icon=icons[id];assert.ok(icon,id);assert.ok(icon.cells.length>=2);assert.equal(icon.source.archive,'a/0/0/7');for(const cell of icon.cells)assert.ok(fs.existsSync(path.join(root,cell.src)));}
 for(const [id,palette]of [[497,1],[500,0],[503,2],[569,1],[577,1],[578,1],[610,1],[618,2]])assert.equal(icons[id].source.paletteSlot,palette,id);
 for(const item of Object.values(c.window.ICIRRUS_MENU.items))assert.ok(fs.existsSync(path.join(root,item.src)));
});
