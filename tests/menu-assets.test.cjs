const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('IRBI menu resources retain original button geometry, species icons and Italian text',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/menu-assets.js'),'utf8'),c);const a=c.window.MENU_ASSETS,files=new Set();
 function visit(o){if(typeof o==='string'&&o.startsWith('assets/menu/'))files.add(o);else if(o&&typeof o==='object')Object.values(o).forEach(visit);}visit(a);
 assert.ok(files.size>=100);for(const name of files){const b=fs.readFileSync(path.join(__dirname,'../src',name));assert.equal(b.readUInt32BE(0),0x89504e47);assert.ok(b.readUInt32BE(16)>0&&b.readUInt32BE(20)>0);}
 assert.deepEqual(JSON.parse(JSON.stringify(a.images.buttons6.size)),[256,512]);assert.equal(a.texts['34'][2],'POKÉMON');assert.equal(a.texts['55'][1],'Rimedi');assert.match(a.itemDescriptions['17'],/20 PS/);
 for(const id of [495,498,501,504,506])assert.equal(a.pokemonIcons[id].cells.length,3);
 assert.equal(a.groups.options,undefined,'Unverified telephone art must not be assigned to Options');
});
