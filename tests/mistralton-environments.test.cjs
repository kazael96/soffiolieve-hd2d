const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=path.resolve(__dirname,'../src');
function environment(){const c={Date,console};c.window=c;c.PinwheelBattles={contexts:{legacy:{}},ambient:id=>id==='legacy'?[{species:'Patrat'}]:null};c.OPENING_ASSETS={models:{},textures:{}};vm.createContext(c);for(const name of ['mistralton-assets','mistralton-data','mistralton-field','mistralton-battles'])vm.runInContext(fs.readFileSync(path.join(source,name+'.js'),'utf8'),c,{filename:name});Object.assign(c.OPENING_ASSETS.models,c.MISTRALTON_ASSETS.models);Object.assign(c.OPENING_ASSETS.textures,c.MISTRALTON_ASSETS.textures);return c;}
test('all chapter places receive explicit physical contexts, including warehouse versus exterior and each cave floor',()=>{
 const c=environment(),field=c.MISTRALTON_FIELD;
 const cases=[[96,'path','driftveilTown','town'],[191,'path','coldStorageYardPath','path'],[191,'grass','coldStorageYardGrass','grass'],[191,'darkGrass','coldStorageYardDark','grass'],[192,'path','coldStorageWarehouse','interior'],[192,'ice','coldStorageIce','interior'],[193,'path','coldStorageRoom','interior'],[97,'path','clayGym','interior'],[98,'path','clayGymEntrance','interior'],[331,'path','route6Path','path'],[331,'grass','route6Grass','grass'],[331,'darkGrass','route6Dark','grass'],[194,'path','chargestoneEntrance','path'],[195,'path','chargestone1','cave'],[196,'path','chargestone2','cave'],[197,'path','chargestone3','cave'],[107,'path','mistraltonTown','town'],[109,'path','mistraltonCenter','interior']];
 for(const [zone,tile,id,terrain]of cases){const captured=field.context(zone,{x:0,y:0},tile);assert.equal(captured.id,id);assert.equal(captured.terrain,terrain);if(zone!==96)assert.ok(c.MistraltonBattles.has(id),id);}
 assert.equal(field.context(333,{x:0,y:0},'path'),null);assert.equal(field.context(62,{x:0,y:0},'path'),null);
});
test('seasonal Route6 music follows native month cycle while buildings retain native zone music',()=>{
 const {MISTRALTON_FIELD:f}=environment();for(let month=0;month<12;month++)for(const zone of [331,194])assert.equal(f.music(zone,month),1046+month%4);
 for(const [zone,id]of [[96,1030],[191,1030],[192,1079],[193,1079],[97,1063],[98,1063],[195,1078],[196,1078],[197,1078],[107,1031],[109,1060]])assert.equal(f.music(zone,7),id);
 assert.equal(f.music(333,0),null);
});
test('each reframed native set retains real textures and a complete fighting floor without changing exploration geometry',()=>{
 const c=environment(),before=JSON.stringify(c.MISTRALTON_ASSETS.scenes);assert.equal(Object.keys(c.MistraltonBattles.contexts).length,17);
 for(const [id,context]of Object.entries(c.MistraltonBattles.contexts)){
  const instances=c.MistraltonBattles.instances(id),plane=instances.at(-1),model=c.OPENING_ASSETS.models[plane.model];assert.ok(instances.length>1,id);assert.equal(plane.y,0);assert.equal(model.groups[0].texture,context.floor);assert.ok(c.MistraltonBattles.isGround(context.floor));assert.ok(Object.isFrozen(context));
  for(const ins of instances){for(const coordinate of ['x','y','z'])assert.ok(Number.isFinite(ins[coordinate]),id+':'+coordinate);const mesh=c.OPENING_ASSETS.models[ins.model];assert.ok(mesh,id+':'+ins.model);for(const group of mesh.groups){assert.ok(group.verts.every(Number.isFinite));if(!group.texture){assert.ok(group.verts.filter((_,i)=>[5,6,7].includes(i%11)).every(v=>v===0),'Untextured groups must be native black masks');continue;}const texture=c.OPENING_ASSETS.textures[group.texture];assert.ok(texture,id+':'+group.texture);assert.ok(fs.existsSync(path.join(source,texture.src)),texture.src);}}
  const vertices=model.groups[0].verts;assert.equal(Math.min(...vertices.filter((_,i)=>i%11===0)),-48);assert.equal(Math.max(...vertices.filter((_,i)=>i%11===0)),48);assert.equal(Math.min(...vertices.filter((_,i)=>i%11===2)),-64);assert.equal(Math.max(...vertices.filter((_,i)=>i%11===2)),24);
 }
 assert.equal(JSON.stringify(c.MISTRALTON_ASSETS.scenes),before);
});
test('ambient observers come only from ordinary catchable slots and remain beyond the fighting area',()=>{
 const c=environment();for(const [context,zone]of [['coldStorageYardPath',191],['coldStorageYardGrass',191],['route6Path',331],['route6Grass',331],['chargestone1',195],['chargestone2',196],['chargestone3',197]]){
  const actors=c.PinwheelBattles.ambient(context),ordinary=new Set(c.MISTRALTON_DATA.encounters[zone].slots.map(p=>p.name));assert.equal(new Set(actors.map(a=>a.species)).size,3);for(const a of actors){assert.ok(ordinary.has(a.species),a.species);assert.ok(a.z<=-18&&a.x<0);assert.ok(a.height>0&&a.height<.7);assert.ok(!['Drilbur','Audino','Cinccino'].includes(a.species));}
 }
 for(const id of ['coldStorageWarehouse','coldStorageIce','coldStorageRoom','clayGym','clayGymEntrance','chargestoneEntrance','mistraltonTown','mistraltonCenter'])assert.equal(c.PinwheelBattles.ambient(id).length,0,id);
 assert.equal(c.PinwheelBattles.ambient('legacy')[0].species,'Patrat');assert.equal(c.MistraltonBattles.instances('unknown'),null);
});
test('preparation waits for the native chapter and propagates asset errors without retaining a failed promise',async()=>{
 const c=environment();let calls=0;c.MistraltonChapter={ensure:async()=>{calls++;if(calls===1)throw Error('temporary native scene failure');}};
 await assert.rejects(c.MistraltonBattles.prepare('chargestone1'),/temporary native scene failure/);assert.equal(await c.MistraltonBattles.prepare('chargestone1'),true);assert.equal(calls,2);assert.equal(await c.MistraltonBattles.prepare('unknown'),false);
 delete c.OPENING_ASSETS.textures['mt-map-300-d6yuka_001'];await assert.rejects(c.MistraltonBattles.prepare('chargestone1'),/Terreno originale mancante/);
});
test('the entire observer canvas fits the native diorama camera at all three required aspect ratios',()=>{
 const c=environment();c.PinwheelBattles.has=id=>!!c.PinwheelBattles.contexts[id];vm.runInContext(fs.readFileSync(path.join(source,'battle-diorama.js'),'utf8'),c);
 for(const id of ['coldStorageYardGrass','route6Grass','chargestone1'])for(const [w,h]of [[1280,720],[390,844],[844,390]]){
  const view=c.BattleDiorama.camera({id},w/h),dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
  for(const actor of c.MistraltonBattles.ambient(id)){const quad=c.BattleDiorama.ambientQuad(actor);for(let i=0;i<quad.length;i+=11){const p=quad.slice(i,i+3).map((v,k)=>v-view.eye[k]),depth=dot(p,view.forward),x=.5+dot(p,view.right)/(2*view.lens[0]*depth),y=.5-dot(p,view.up)/(2*view.lens[1]*depth);assert.ok(x>=0&&x<=1,id+':'+actor.species+':'+w+' x='+x);assert.ok(y>=0&&y<=1,id+':'+actor.species+':'+h+' y='+y);}}
 }
});
