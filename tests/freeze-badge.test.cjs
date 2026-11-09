const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../src');
test('Silvestro male/female receipt effects9/48 are installed before the native field host',()=>{
 const c={};c.window=c;vm.createContext(c);
 for(const file of ['field-effect-assets.js','mistralton-badge-assets.js','icirrus-badge-assets.js','opelucid-badge-assets.js'])if(fs.existsSync(path.join(root,file)))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
 for(const id of [2,4,6,7,8,9,43,45,46,47,48,50,51])assert.ok(c.FIELD_EFFECT_ASSETS.effects[id],'Original field effect unavailable: '+id);
 for(const [id,name]of [[9,'freezeBadgeM'],[48,'freezeBadgeF']]){
  const a=c.FIELD_EFFECT_ASSETS,e=a.effects[id];assert.equal(e.item,name);assert.equal(e.label,'Medaglia Stalattite');assert.equal(e.frames,361);assert.equal(e.particles,false);assert.equal(e.descriptor[4],16);
  const file=path.join(root,a.models[name].url),raw=fs.readFileSync(file),doc=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)));assert.ok(doc.animations?.length,'Receipt has no native animation');
  for(const image of doc.images||[])if(image.uri)assert.ok(fs.existsSync(path.join(path.dirname(file),image.uri)),'Missing receipt image '+image.uri);
 }
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),tag='<script src="opelucid-badge-assets.js"></script>';assert.ok(html.includes(tag));assert.ok(html.indexOf(tag)>html.indexOf('field-effect-assets.js'));assert.ok(html.indexOf(tag)<html.indexOf('original-story.js'));
});
test('every field receipt referenced by a decoded chapter051 program has renderable resources',()=>{
 const c={};c.window=c;vm.createContext(c);for(const file of ['field-effect-assets.js','mistralton-badge-assets.js','icirrus-badge-assets.js','opelucid-badge-assets.js','opelucid-events.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
 let checked=0;for(const [script,program]of Object.entries(c.OPELUCID_EVENTS.scripts))for(const [at,command]of Object.entries(program.code))if(command.name==='PlayFieldEffect'){
  const id=command.args[0],effect=c.FIELD_EFFECT_ASSETS.effects[id];assert.ok(effect,'Native program'+script+':'+at+' requests unavailable field effect'+id);for(const name of [effect.background,effect.item])assert.ok(fs.existsSync(path.join(root,c.FIELD_EFFECT_ASSETS.models[name].url)),'Missing original receipt model '+name);checked++;
 }assert.ok(checked>0,'No native receipt call was inspected');
});
