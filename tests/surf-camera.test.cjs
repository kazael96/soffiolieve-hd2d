const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(process.env.SURF_CAMERA_SOURCE||path.join(__dirname,'../src/game.js'),'utf8'),draw=source.slice(source.indexOf('function drawWorld('),source.indexOf('function toast('));
for(const[W,H]of [[1280,720],[390,844],[844,390]])test('Surf camera follows physical X and Z independently at '+W+'x'+H,()=>{
 const elements=new Map(),c={W,H,t:1,facing:9,moving:false,keys:{},npcs:[],canvas:{dataset:{}},ctx:{clearRect(){}},ellipse(){},player:{x:-590.5,y:-547.5},ROM_SCENE:{}};c.window=c;
 c.$=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);};c.SceneCamera={tracks:()=>true,followFactor:()=>1};c.Journey={hint:()=>''};
 c.NativeStory={state:{zone:113,fieldHeight:-1.5},visualActors:()=>[],departures:{records:new Map(),retired:[]}};
 c.SurfField={mounted:()=>true,actor:()=>({name:'AlcideSurf',height:-1.32})};let drawn;
 c.renderer={scene:{chapter050:true},center:[0,0],elevation:0,ready:true,groundHeight:()=>-1.5,draw:(time,actors)=>drawn=actors};
 vm.createContext(c);vm.runInContext(draw+';drawWorld();',c);assert.equal(c.renderer.center[0],-590.5);assert.equal(c.renderer.center[1],-546);assert.equal(c.renderer.elevation,-1.5);assert.equal(drawn.at(-1).name,'AlcideSurf');assert.equal(drawn.at(-1).z,-547.5);
});
