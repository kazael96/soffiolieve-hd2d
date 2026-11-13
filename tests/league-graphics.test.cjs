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

test('the League Center front closure hides below-floor pieces while leaving standing actors and furniture above the native edge',()=>{
 const c={};c.window=c;vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/league-graphics.js'),'utf8'),c);const vertices=c.LeagueGraphics.frontClosure({zone:146});assert.equal(vertices.length,66);
 const positions=Array.from({length:6},(_,i)=>Array.from(vertices.slice(i*11,i*11+3))),min=a=>Math.min(...positions.map(p=>p[a])),max=a=>Math.max(...positions.map(p=>p[a]));
 assert.equal(min(0),-16.25);assert.equal(max(0),-.75);assert.equal(max(1),-.125);assert.equal(min(2),3);assert.equal(max(2),3);
 const eye=[-8.5,27,57],atEdge=p=>{const f=(3-eye[2])/(p[2]-eye[2]);return eye.map((n,i)=>n+(p[i]-n)*f);},covers=p=>{const q=atEdge(p);return q[0]>=min(0)&&q[0]<=max(0)&&q[1]>=min(1)&&q[1]<=max(1);};
 assert.equal(covers([-3.75,-1.875,1.5]),true,'the native basement fragment must be behind the room front');assert.equal(covers([-5.5,.75,2]),false,'the cashier must remain above the closure');
 assert.equal(c.LeagueGraphics.frontClosure({zone:140}),null);assert.equal(c.LeagueGraphics.frontClosure({zone:272}),null);
 assert.equal(c.LeagueGraphics.frontClosure({zone:146},-1.875),null,'a player actually below the main floor must retain the lower stair view');
});
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
test('native indoor cutaways and compact League gates receive scoped backdrops without changing other outdoor scenes',()=>{const c={};c.window=c;vm.createContext(c);for(const file of ['league-scenes','league-graphics'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file+'.js'),'utf8'),c);let count=0;for(const [key,metadata]of Object.entries(c.LEAGUE_SCENES)){const zone=+key,scene={zone,clearColor:[.22,.39,.39]},indoor=metadata.outdoor===false,gate=zone>=356&&zone<=364||[136,214].includes(zone),changed=c.LeagueGraphics.applyScene(scene);assert.equal(changed,indoor||gate,'Backdrop ownership differs '+zone);if(indoor){assert.deepEqual(Array.from(scene.clearColor),[0,0,0]);assert.equal(scene.clearAlpha,1);assert.equal(scene.backdrop,undefined);count++;}else if(gate){assert.deepEqual(Array.from(scene.clearColor),[0,0,0]);assert.equal(scene.clearAlpha,0);assert.equal(scene.backdrop,zone===361?'league-abyss':[136,214].includes(zone)?'league-victory':'league-highlands');}else{assert.deepEqual(Array.from(scene.clearColor),[.22,.39,.39]);assert.equal(scene.clearAlpha,undefined);assert.equal(scene.backdrop,undefined);}}assert.equal(count,16);for(const zone of [113,122,343,355,999]){const scene={zone,clearColor:[.2,.3,.4]};assert.equal(c.LeagueGraphics.applyScene(scene),false);assert.deepEqual(scene.clearColor,[.2,.3,.4]);assert.equal(scene.backdrop,undefined);}});
