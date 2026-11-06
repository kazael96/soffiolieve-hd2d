const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('an actual exit probe can be read back for the same camera, yaw and elevation',()=>{
 const c={innerWidth:390,innerHeight:844,window:null};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../src/world3d.js'),'utf8')+'\nwindow.Renderer=VillageRenderer;',c);
 const r=Object.assign(Object.create(c.Renderer.prototype),{gl:{},canvas:{width:390,height:844},scene:{},images:{'test-0':{}},visibility:new WeakMap(),visibilitySequence:0,center:[0,0],scale:30,zoom:1.4,yaw:0,elevation:0,cameraMoving:false});
 const actor={x:1000,y:1000,height:0,frame:0,flip:false};r.probeActor({name:'test',x:actor.x,z:actor.y,height:0,frame:0,source:actor});
 const proof=r.actorVisibility(actor);assert.ok(proof,'the renderer rejected its own fresh probe');assert.equal(proof.visible,false);assert.ok(proof.sequence>0);
 r.yaw=.5;assert.equal(r.actorVisibility(actor),null);r.yaw=0;r.elevation=1;assert.equal(r.actorVisibility(actor),null);r.elevation=0;assert.equal(r.actorVisibility(actor),proof);r.cameraPitch=[.5,.866];assert.equal(r.actorVisibility(actor),null);delete r.cameraPitch;r.cameraDistance=80;assert.equal(r.actorVisibility(actor),null);delete r.cameraDistance;assert.equal(r.actorVisibility(actor),proof);
});
test('a large native billboard partly crossing the viewport is probed at its true size',()=>{
 const c={innerWidth:390,innerHeight:844,window:null};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../src/world3d.js'),'utf8')+'\nwindow.Renderer=VillageRenderer;',c);
 const gl={FRAMEBUFFER_COMPLETE:1,NO_ERROR:0,bindFramebuffer(){},checkFramebufferStatus:()=>1,clearColor(){},clear(){},disable(){},depthMask(){},uniform1f(){},enable(){},getError:()=>0,readPixels(x,y,w,h,format,type,bytes){bytes.set([255,0,255,255]);}};
 const r=Object.assign(Object.create(c.Renderer.prototype),{gl,loc:{},canvas:{width:390,height:844},scene:{},images:{'dragon-0':{}},visibility:new WeakMap(),visibilitySequence:0,center:[0,0],scale:30,zoom:1.4,yaw:0,elevation:0,cameraMoving:false}),n={x:8,y:0,height:0,frame:0,flip:false,worldWidth:4,worldHeight:4};let dimensions;
 r.plane=(x,y,z,w,h)=>dimensions=[w,h];r.probeActor({name:'dragon',x:8,z:0,height:0,frame:0,worldWidth:4,worldHeight:4,source:n});assert.deepEqual(dimensions,[4,4]);assert.equal(r.actorVisibility(n)?.visible,true);n.worldWidth=2;assert.equal(r.actorVisibility(n),null,'a changed footprint invalidates the old visibility proof');
});
