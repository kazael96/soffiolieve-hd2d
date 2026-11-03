/* Validate the complete new chapter's references, geometry and sprite cells. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const site=path.resolve(process.argv[2]||'_site'),c={};c.window=c;vm.createContext(c);
for(const n of ['driftveil-assets','driftveil-data','driftveil-gym-data','driftveil-cinematics-data','field-effect-assets','driftveil-ball'])vm.runInContext(fs.readFileSync(path.join(site,n+'.js'),'utf8'),c);
let pngs=0,models=0;
function read(p){p=decodeURIComponent(new URL(p,'https://assets.invalid/').pathname).slice(1);assert.ok(!p.includes('..'),'Unsafe resource path');return fs.readFileSync(path.join(site,p));}
function png(p){const b=read(p);assert.equal(b.subarray(1,4).toString(),'PNG',p);assert.ok(b.readUInt32BE(16)>0&&b.readUInt32BE(20)>0,p);pngs++;}
for(const t of Object.values(c.DRIFTVEIL_ASSETS.textures))png(t.src);
for(const list of Object.values(c.DRIFTVEIL_ASSETS.sprites))for(const p of list)png(p);
for(const [key,model]of Object.entries(c.DRIFTVEIL_ASSETS.models))for(const group of model.groups){assert.equal(group.verts.length%33,0,key);assert.ok(group.verts.every(Number.isFinite),key);if(group.texture)assert.ok(c.DRIFTVEIL_ASSETS.textures[group.texture],key+' texture');}
const glbs=[...Object.values(c.DRIFTVEIL_GYM_DATA.models),...Object.values(c.DRIFTVEIL_CINEMATICS.models),...['boltBadgeM','boltBadgeF'].map(n=>c.FIELD_EFFECT_ASSETS.models[n])];
for(const model of glbs){const b=read(model.url);assert.equal(b.readUInt32LE(0),0x46546c67);const d=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));for(const im of d.images)png(path.posix.join(path.posix.dirname(model.url),im.uri));models++;}
for(const id of [6,45])assert.equal(c.FIELD_EFFECT_ASSETS.effects[id].label,'Medaglia Volt');
for(const p of c.DRIFTVEIL_BALL.cells)png(p);
let atlases=0;
for(const id of new Set(Object.values(c.DRIFTVEIL_DATA.progression).map(p=>p.id)))for(const side of ['front','back']){
 const stem='assets/animated/'+id+'-'+side,b=read(stem+'.png'),a=JSON.parse(read(stem+'.json'));png(stem+'.png');const w=b.readUInt32BE(16),h=b.readUInt32BE(20);for(const r of a.images)assert.ok(r[0]>=0&&r[1]>=0&&r[0]+r[2]<=w&&r[1]+r[3]<=h,stem);for(const cell of a.cells)for(const o of cell)assert.ok(a.images[o[4]],stem);atlases++;
}
console.log('PASS Driftveil: '+pngs+' PNG references, '+models+' animated GLB models, '+atlases+' atlases, both original Volt Badge variants and Repeat Ball.');
