const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {FieldEventVM}=require('../src/field-event-vm.js'),data=require('./fixtures/drayden-graphic-init.json');
const source=fs.readFileSync(path.join(__dirname,'../src/original-story.js'),'utf8'),start=source.indexOf('  function putActor(record){'),end=source.indexOf('\n  function syncActors()',start);
function context(zone,graphics=true){
 const required=[],c={native:{zone,vars:{16416:209}},npcs:[],names:{180:'Aristide',92:'Iris'},frames:[0,3,6,9],world:(x,z)=>({x:x-15.5,y:z-15.5}),NpcWalk:{create:()=>({})},pose:()=>{}};
 c.window=c;c.fieldActors=()=>c.npcs;c.renderer={requireActors:actors=>required.push(actors.map(a=>({model:a.model,name:a.name})))};vm.createContext(c);
 const file=path.join(__dirname,'../src/league-graphics.js');if(graphics&&fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),c);
 vm.runInContext(source.slice(start,end),c);return {c,required};
}
const record=()=>({id:4,model:162,rail:0,x:27,z:2,y:786432,script:1,direction:1});
test('the real actor constructor prepares the graphic selected by the native Black Gym initializer, including stale house variables',async()=>{
 const state={vars:{},flags:[]},machine=new FieldEventVM(data,state,{command:async(c,args,raw,m)=>{
  if(c.name==='NativeOpcode406')return true; // Puzzle initialization is a separate integration test.
  if(c.name==='NativeOpcode224'){m.set(args[0],21);return true;}return false;
 }});
 await machine.run(242,1);assert.equal(state.vars[16416],180);
 const {c,required}=context(121),raw=record(),actor=c.putActor(raw);
 assert.equal(actor.model,state.vars[16416],'A stale house selector must not request raw graphic162 or miner209 before native init');
 assert.equal(required.at(-1)[0].model,180);assert.equal(actor.name,'Aristide');assert.equal(actor.uid,4);assert.equal(actor.height,12);assert.equal(actor.x,11.5);assert.equal(actor.y,-13.5);assert.equal(raw.model,162);
});
test('context bindings preserve the old Black house and leave unrelated selector records alone',()=>{
 for(const graphics of [false,true]){const {c}=context(343,graphics);assert.equal(c.putActor(record()).model,209);}
 const {c}=context(64);assert.equal(c.putActor(record()).model,162,'Do not rename every162 actor globally');
});
test('every owned native indoor scene keeps black beyond its cutaway, without changing outdoor skies or earlier chapters',()=>{const c={};c.window=c;vm.createContext(c);for(const file of ['league-scenes','league-graphics'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file+'.js'),'utf8'),c);let count=0;for(const [zone,metadata]of Object.entries(c.LEAGUE_SCENES)){const scene={zone:+zone,clearColor:[.22,.39,.39]};const indoor=metadata.outdoor===false;assert.equal(c.LeagueGraphics.applyScene(scene),indoor,'Indoor ownership differs '+zone);assert.deepEqual(Array.from(scene.clearColor),indoor?[0,0,0]:[.22,.39,.39]);count+=Number(indoor);}assert.equal(count,16);for(const zone of [113,122,343,999]){const scene={zone,clearColor:[.2,.3,.4]};assert.equal(c.LeagueGraphics.applyScene(scene),false);assert.deepEqual(scene.clearColor,[.2,.3,.4]);}});
