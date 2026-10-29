/* Integration checks against the real, checksum-verified release assets. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const site=path.resolve(process.argv[2]||'_site');
const html=fs.readFileSync(path.join(site,'index.html'),'utf8');
assert.equal(fs.readdirSync(site).some(name=>/^qa(?:[-.]|$)/i.test(name)),false,'Local QA fixtures must not be published');
assert.equal(fs.existsSync(path.join(site,'qa.html')),false,'Local QA pages must not be published');
assert.equal(fs.existsSync(path.join(site,'qa-battle.html')),false,'Local QA pages must not be published');
for(const name of fs.readdirSync(site).filter(n=>/\.(js|html|css)$/.test(n))){
  assert.doesNotMatch(fs.readFileSync(path.join(site,name),'utf8'),/Ã©|Ã¨|Â·|â†/,'Broken UTF-8 in '+name);
}
for(const [,url] of html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^\"]+)?"/g)){
  assert.ok(fs.existsSync(path.join(site,url)),`Missing dependency: ${url}`);
}
const manifest=JSON.parse(fs.readFileSync(path.join(site,'build.json'),'utf8'));
for(const [name,hash] of Object.entries(manifest.files)){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(site,name))).digest('hex'),hash,name);
}
for(const [name,hash] of Object.entries(manifest.assets||{}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(site,name))).digest('hex'),hash,name);
assert.equal((html.match(/<script src=/g)||[]).length,1,'One ordered script entry');
assert.equal(fs.readFileSync(path.join(site,'app.css'),'utf8'),manifest.startup.styles.map(f=>fs.readFileSync(path.join(site,f),'utf8').replace(/\r\n/g,'\n')).join('\n'),'Every original stylesheet included in order');
const bundle=fs.readFileSync(path.join(site,'app.js'),'utf8');
const entries=JSON.parse(bundle.slice(bundle.indexOf(' of ')+4,bundle.indexOf('){const tag=')));assert.deepEqual(entries.map(e=>e[0]),manifest.startup.scripts,'Script order changed');for(const [file,source]of entries)assert.equal(source,fs.readFileSync(path.join(site,file),'utf8').replace(/\r\n/g,'\n'),'Bundled script differs: '+file);
const raw=fs.readFileSync(path.join(site,'assets/scene.js'),'utf8');
const scene=JSON.parse(raw.slice(raw.indexOf('=')+1).replace(/;\s*$/,''));
const source=fs.readFileSync(path.join(site,'game.js'),'utf8');
const context={renderer:{scene}};context.window=context;
vm.runInNewContext(source.slice(source.indexOf('function blocked('),source.indexOf('function drawWorld')),context);
const can=(x,y)=>!context.blocked(x-.18,y-.18)&&!context.blocked(x+.18,y+.18);
const actors=vm.runInNewContext(source.match(/const npcs=(\[.*?\]);/)[1],{});
// Flood the walkable grid from the spawn; every exploration character must be reachable.
const queue=[[-2,0]],visited=new Set(['-2,0']);
for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];
  for(const [dx,dy] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
    const next=[x+dx,y+dy],key=next.join(',');
    if(!visited.has(key)&&can(...next)){visited.add(key);queue.push(next);}
  }
}
for(const actor of actors){
  assert.ok(queue.some(([x,y])=>Math.hypot(actor.x-x,actor.y-y)<2.2),`${actor.name} cannot be reached`);
  assert.ok(fs.existsSync(path.join(site,`assets/characters/${actor.name}-3.png`)));
}
for(let frame=0;frame<12;frame++)assert.ok(fs.existsSync(path.join(site,`assets/characters/Alcide-${frame}.png`)));
console.log('PASS: all script/style dependencies, published hashes, character sprites and reachable exploration characters.');

const assets={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(site,'opening-assets.js'),'utf8'),assets);
vm.runInNewContext(fs.readFileSync(path.join(site,'opening-sprites.js'),'utf8'),assets);
const opening=assets.window.OPENING_ASSETS;
for(const texture of Object.values(opening.textures))assert.ok(fs.existsSync(path.join(site,texture.src)),texture.src);
for(const frames of Object.values(assets.window.OPENING_SPRITES))for(const frame of frames)assert.ok(fs.existsSync(path.join(site,frame.split('?')[0])),frame);
for(const file of ['phone-assets.js','field-audio.js','battle-fields.js','starter-assets.js','pokedex-assets.js','townmap-assets.js'])vm.runInNewContext(fs.readFileSync(path.join(site,file),'utf8'),assets);
for(const frames of Object.values(assets.window.PHONE_ASSETS.portraits))for(const frame of frames)assert.ok(fs.existsSync(path.join(site,frame)),frame);
for(const record of Object.values(assets.window.FIELD_AUDIO))assert.ok(fs.existsSync(path.join(site,record.src)),record.src);
for(const record of Object.values(assets.window.BATTLE_FIELDS.textures))assert.ok(fs.existsSync(path.join(site,record.src)),record.src);
assert.equal(assets.window.BATTLE_FIELDS.scenes.room.fieldId,9);
assert.equal(assets.window.BATTLE_FIELDS.scenes.room.terrain,4);
assert.equal(assets.window.BATTLE_FIELDS.scenes.route.terrain,5);
function reachable(map,spawn,targets){
 context.renderer.scene=map;
 assert.ok(can(...spawn),'Blocked spawn '+spawn);
 const q=[spawn],seen=new Set([spawn.join(',')]);
 for(let i=0;i<q.length;i++)for(const [dx,dy] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
  const p=[q[i][0]+dx,q[i][1]+dy],key=p.join(',');if(!seen.has(key)&&can(...p)){seen.add(key);q.push(p);}
 }
 for(const target of targets)assert.ok(q.some(p=>Math.hypot(p[0]-target[0],p[1]-target[1])<2.1),'Unreachable interaction '+target);
 return q;
}
reachable(opening.scenes.bedroom,[-10.5,-10.5],[[-10.5,-7.5],[-6.5,-13.5]]);
reachable(opening.scenes.home,[-12.5,-13.5],[[-10.5,-5.5],[-9.5,-9.5]]);
reachable(opening.scenes.bianca,[-10.5,-6.5],[[-10.5,-9.5],[-10.5,-5.5]]);
reachable(opening.scenes.lab,[-12.5,-5.5],[[-10.5,-10],[-12.5,-4.5]]);
const outdoor={permissionGrids:[...scene.permissionGrids,...opening.scenes.north.permissionGrids]};
const route=reachable(outdoor,[-2,0],[[-7.5,5.5],[-6.5,-11.5],[1,-21],[6,-74],[2.5,-39.5]]);
assert.ok(route.some(p=>p[1]<-80),'Accumula entrance is inaccessible');
assert.ok(can(3.5,-18),'Blocked Route 1 transition');
console.log('PASS: original room assets, every required door/NPC and the full walking route to Accumula.');

for(const url of [...Object.values(assets.window.STARTER_ASSETS.models),...assets.window.STARTER_ASSETS.backgrounds,...assets.window.STARTER_ASSETS.sprites.flatMap(s=>Object.values(s))])assert.ok(fs.existsSync(path.join(site,url)),url);

for(const file of ['entry','font','caught',...Object.values(assets.window.POKEDEX_ASSETS.species).flatMap(p=>['foot-'+p.id,...p.types.map(t=>'type-'+t)])])assert.ok(fs.existsSync(path.join(site,'assets/pokedex/'+file+'.png')),file);
assert.ok(manifest.startup.styles.includes('pokedex.css')&&html.includes('app.css'), 'Pokedex stylesheet must be loaded in bundle');
assert.equal(assets.window.POKEDEX_ASSETS.species.Patrat.number,10);
assert.equal(assets.window.POKEDEX_ASSETS.species.Lillipup.number,12);
console.log('PASS original Pokedex entry graphics, font, footprint/type assets and regional numbers');

for(const file of ['map','info',...assets.window.TOWNMAP_ASSETS.cells.map((_,i)=>'cell-'+i)])assert.ok(fs.existsSync(path.join(site,'assets/townmap/'+file+'.png')),file);
assert.ok(manifest.startup.styles.includes('townmap.css')&&html.includes('app.css'),'Town map stylesheet must be loaded in bundle');
console.log('PASS original Unova map, information panel and all marker cells');
