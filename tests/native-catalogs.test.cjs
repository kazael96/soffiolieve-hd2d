const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../src');

test('the player identity catalog references every new native bitmap with its exact content revision',()=>{
 const scope={};scope.window=scope;vm.runInNewContext(fs.readFileSync(path.join(root,'player-assets.js'),'utf8'),scope);
 const seen=new Set(),crypto=require('node:crypto');
 function visit(value){
  if(typeof value==='string'&&value.startsWith('assets/player-identity/')&&/\.png(?:\?|$)/.test(value)){
   const [name,query]=value.split('?'),file=path.join(root,name),bytes=fs.readFileSync(file);assert.equal(bytes.subarray(1,4).toString(),'PNG',name);assert.ok(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0,name);
   assert.equal(new URLSearchParams(query).get('v'),crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),name);seen.add(name);
  }else if(value&&typeof value==='object')for(const child of Object.values(value))visit(child);
 }
 visit({sprites:scope.PLAYER_ASSETS.sprites,portraits:scope.PLAYER_ASSETS.portraits,intro:scope.PLAYER_ASSETS.intro});
 const actual=fs.readdirSync(path.join(root,'assets/player-identity')).filter(name=>name.endsWith('.png')).map(name=>'assets/player-identity/'+name).sort();
 assert.equal(actual.length,58);assert.deepEqual([...seen].sort(),actual);
 assert.ok(scope.PLAYER_ASSETS.texts.bank44.length>=27);assert.ok(scope.PLAYER_ASSETS.texts.bank44[26].includes('Pokémon'));
});
test('every new native interface bitmap exists and retains its exported dimensions',()=>{
 const catalogs=['naming-assets.js','options-assets.js','trainer-card-assets.js','party-detail-assets.js','party-popup-assets.js','summary-detail-assets.js','dex-browser-assets.js','dex-modes-assets.js','dex-search-assets.js','common-dialogue-assets.js'];
 let checked=0;
 function visit(value){if(!value||typeof value!=='object')return;const reference=value.src||value.path;if(typeof reference==='string'&&reference.startsWith('assets/')&&reference.endsWith('.png')){const file=path.join(root,reference);assert.ok(fs.existsSync(file),reference);const bytes=fs.readFileSync(file);assert.equal(bytes.subarray(1,4).toString(),'PNG',reference);if(value.size){assert.equal(bytes.readUInt32BE(16),value.size[0],reference+' width');assert.equal(bytes.readUInt32BE(20),value.size[1],reference+' height');}checked++;}for(const child of Object.values(value))if(typeof child==='object')visit(child);}
 for(const file of catalogs){const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),scope);visit(Object.values(scope.window)[0]);}
 visit(JSON.parse(fs.readFileSync(path.join(root,'assets/field-bag/provenance.json'),'utf8')));
 visit(JSON.parse(fs.readFileSync(path.join(root,'assets/battle-ui/provenance.json'),'utf8')));
 visit(JSON.parse(fs.readFileSync(path.join(root,'assets/save-ui/provenance.json'),'utf8')));
 visit(JSON.parse(fs.readFileSync(path.join(root,'assets/battle-party/provenance.json'),'utf8')));
 assert.ok(checked>200,'The check covers all converted interface catalogs');
});
