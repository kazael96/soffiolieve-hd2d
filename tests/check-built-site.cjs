/* Integration checks against the real, checksum-verified release assets. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const site=path.resolve(process.argv[2]||'_site');
const html=fs.readFileSync(path.join(site,'index.html'),'utf8');
for(const [,url] of html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^\"]+)?"/g)){
  assert.ok(fs.existsSync(path.join(site,url)),`Missing dependency: ${url}`);
}
const manifest=JSON.parse(fs.readFileSync(path.join(site,'build.json'),'utf8'));
for(const [name,hash] of Object.entries(manifest.files)){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(site,name))).digest('hex'),hash,name);
}
const raw=fs.readFileSync(path.join(site,'assets/scene.js'),'utf8');
const scene=JSON.parse(raw.slice(raw.indexOf('=')+1).replace(/;\s*$/,''));
const source=fs.readFileSync(path.join(site,'game.js'),'utf8');
const context={ROM_SCENE:scene};
vm.runInNewContext(source.slice(source.indexOf('function blocked('),source.indexOf('function drawWorld')),context);
const can=(x,y)=>!context.blocked(x-.18,y-.18)&&!context.blocked(x+.18,y+.18);
const actors=vm.runInNewContext(source.match(/const npcs=(\[.*?\]);/)[1],{});
// Flood the walkable grid from the spawn; every chapter character must be reachable.
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
console.log('PASS: all script/style dependencies, published hashes, character sprites and three reachable chapter encounters.');
