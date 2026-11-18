const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('../src/scene-camera.js');
const game=fs.readFileSync(require.resolve('../src/game.js'),'utf8'),draw=game.slice(game.indexOf('function drawWorld(){'),game.indexOf('function toast('));
function field({zone=319,x=-30.5,z=-110.5,width=390,height=844,scene={},storyCamera}={}){
 const c={console,Math,W:width,H:height,innerWidth:width,innerHeight:height,t:0,facing:3,moving:false,keys:{},npcs:[],player:{x,y:z},canvas:{dataset:{}},ctx:{clearRect(){}},ellipse(){},$:()=>({}),SceneCamera:C,OPENING_ASSETS:{},ROM_SCENE:{}};c.window=c;
 c.NativeStory={state:{zone},visualActors:()=>[],departures:{records:new Map(),retired:[]}};c.Journey={outdoor:scene,hint:()=>''};
 vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../src/world3d.js'),'utf8')+';window.Renderer=VillageRenderer',c);
 c.renderer=Object.assign(Object.create(c.Renderer.prototype),{scene,center:C.anchor('town',scene,zone,c.player),cameraPitch:[.423,.906],zoom:1.4,scale:Math.min(width/30,height/21)*1.4,ready:true,elevation:0,groundHeight:()=>0,draw(time,actors){this.lastActors=actors;},storyCamera});
 vm.runInContext(draw,c);return c;
}
test('the actual field renderer centers early outdoor positions in all three viewports and at each game speed',()=>{
 for(const [width,height]of [[1280,720],[390,844],[844,390]])for(const speed of [1,2,4])for(const [zone,x,z]of [[389,-10.5,-3.5],[397,12.5,-94.5],[319,-30.5,-110.5],[6,-35.5,-170.5],[321,-80.5,-180.5],[154,-190.5,-170.5]]){
  const c=field({zone,x,z,width,height});
  for(let i=1;i<=3;i++){c.t=i*speed/30;vm.runInContext('drawWorld()',c);const p=c.renderer.screen(x,z,.04);assert.ok(Math.abs(p[0]-width/2)<1e-8,`Off-center ${zone} ${width}x${height} x${speed}: ${p[0]}`);assert.equal(c.renderer.center[0],x);}
 }
});
test('a distant native entry uses the same centered target before and after the first field draw',()=>{
 const c=field();assert.deepEqual(Array.from(c.renderer.center),[-30.5,-109]);vm.runInContext('drawWorld()',c);assert.equal(c.renderer.center[0],-30.5);
 const scene={chapter040:true};assert.deepEqual(C.anchor('zone152',scene,152,{x:7.5,y:11.5}),[7.5,13]);
});
test('explicit story framing and the fixed camera inside early rooms remain authoritative',()=>{
 const c=field({storyCamera:[-8,-12]});c.renderer.center=[-8,-12];vm.runInContext('drawWorld()',c);assert.deepEqual(Array.from(c.renderer.center),[-8,-12]);
 const room={permissionGrids:[{}]},d=field({zone:320,x:-7.5,z:-11.5,scene:room});d.Journey.outdoor={};d.renderer.center=[-10,-10];vm.runInContext('drawWorld()',d);assert.deepEqual(Array.from(d.renderer.center),[-10,-10]);
 assert.deepEqual(C.anchor('bedroom',{},391,{x:-10.5,y:-9.5}),[-10,-10]);
});
