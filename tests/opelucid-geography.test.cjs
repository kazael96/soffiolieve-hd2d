/* Native support/rail records and geographic chunks; no browser traversal claim. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src'),read=n=>{const s=fs.readFileSync(path.join(root,n+'.js'),'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));},parts=read('opelucid-parts'),scenes=read('opelucid-scenes'),canonical=read('opelucid-assets'),surface=read('opelucid-surface-data'),prior=read('native-surface-data'),events=read('opelucid-events'),rails=read('opelucid-rails'),gym=read('opelucid-gym-data');
const c={atob:s=>Buffer.from(s,'base64').toString('binary'),PINWHEEL_RAILS:rails};c.window=c;vm.createContext(c);for(const n of ['native-surfaces','native-rails'])vm.runInContext(fs.readFileSync(path.join(root,n+'.js'),'utf8'),c);
const sampler=c.NativeSurfaces.create({...prior,grids:{...prior.grids,...surface.grids},scenes:{...prior.scenes,...surface.scenes}});
test('every native scene is assigned to one geographic family with intact models and textures',()=>{
 assert.equal(Object.keys(parts.families).length,10);assert.equal(Object.keys(scenes).length,48);assert.equal(parts.residentLimit,3);const assigned=[];
 for(const [name,f]of Object.entries(parts.families)){const s=fs.readFileSync(path.join(root,f.src),'utf8'),d=JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));assert.equal(d.family,name);assert.equal(Buffer.byteLength(s),f.catalogBytes);for(const z of f.zones){assigned.push(z);assert.equal(parts.zoneFamily[z],name);assert.deepEqual(d.scenes[z],canonical.scenes[z]);assert.equal(scenes[z].family,name);}
  for(const model of Object.values(d.models))for(const group of model.groups){assert.ok(group.verts.length%11===0);assert.ok(group.verts.every(Number.isFinite));if(group.texture)assert.ok(d.textures[group.texture],group.texture);}
  for(const texture of Object.values(d.textures))assert.ok(fs.existsSync(path.join(root,texture.src.split('?')[0])));
 }
 assert.equal(new Set(assigned).size,48);assert.equal(assigned.length,48);
});
test('new native grids retain old overlapping data and NG maps explicitly require rails',()=>{
 assert.equal(Object.keys(surface.grids).length,63);assert.equal(Object.values(surface.grids).reduce((sum,v)=>sum+v.length,0),66);
 for(const [id,layers]of Object.entries(surface.grids))if(prior.grids[id])assert.deepEqual(layers,prior.grids[id],id);
 assert.deepEqual([...new Set(surface.railMaps.map(r=>r.zone))],[209,211]);for(const r of surface.railMaps)assert.ok(rails[r.zone]);
 for(const z of [114,209,211])assert.equal(scenes[z].railZone,z);
});
test('Silvestro gym actors stand on native support at their independent event-record heights',()=>{
 let checked=0;for(const actor of events.zones[114].actors){if(!actor.model||actor.rail)continue;const x=actor.x-15.5,z=actor.z-15.5,expected=actor.y/65536,rail=c.NativeRails.locate(114,x,z,{height:expected}),plane=sampler.at(114,x,z,expected),ground=rail?.height??plane?.height;assert.ok(Number.isFinite(ground),actor.id+' missing support');assert.ok(Math.abs(ground-expected)<.01,actor.id+' '+ground+' vs '+expected);checked++;}assert.ok(checked>=4);
});
test('all logical gym states retain original duration and explicit bound/unmatched material status',()=>{
 let count=0,unbound=0;for(const model of Object.values(gym.models))for(const state of model.states){count++;const raw=fs.readFileSync(path.join(root,state.url)),d=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)).toString('utf8'));if(state.binding==='bound'){assert.equal(d.animations.length,1);assert.equal(state.animation,0);assert.equal(state.gltfLastFrame,state.nativeFrames-1);}else{unbound++;assert.equal(state.nativeMember,8);assert.equal(state.nativeFrames,10);assert.equal(state.animation,null);assert.deepEqual(state.nativeTargets,['ice_s_02_1']);assert.ok(!d.materials.some(m=>state.nativeTargets.includes(m.name)));assert.equal((d.animations||[]).length,0);}}
 assert.equal(count,6);assert.equal(unbound,1);assert.deepEqual(gym.instances.map(i=>i.worldOrigin[1]),[0,3,6,0,3,6]);
});
