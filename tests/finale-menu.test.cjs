/* Execute the actual ordered menu catalogs from the production entry page. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('the production party and item menus contain the native icons for all newly introduced finale records',()=>{
 const root=path.resolve(__dirname,'../src'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),c={PARTY_DETAIL_ASSETS:{itemMap:{}}};c.window=c;vm.createContext(c);
 for(const file of ['league-data.js','finale-data.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
 for(const [,file]of html.matchAll(/<script src="([^"?]+\.js)(?:\?[^\"]*)?"/g))if(file==='menu-assets.js'||file.endsWith('-menu.js'))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
 const before=new Set(Object.values(c.LEAGUE_DATA.progression).map(p=>p.id)),added=Object.values(c.FINALE_DATA.progression).filter(p=>!before.has(p.id));assert.equal(added.length,10);
 for(const p of added){const icon=c.MENU_ASSETS.pokemonIcons[p.id];assert.ok(icon,'Blank native party icon: '+p.id);assert.equal(icon.source.char,p.id*2+7);assert.equal(icon.cells.length,3);for(const cell of icon.cells){const png=fs.readFileSync(path.join(root,cell.src));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),cell.size[0]);assert.equal(png.readUInt32BE(20),cell.size[1]);}}
 for(const id of [1,23,24,29])assert.ok(c.PARTY_DETAIL_ASSETS.itemMap[id],'Missing native finale item icon '+id);
});
