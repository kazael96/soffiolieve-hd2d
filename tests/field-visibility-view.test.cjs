const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('an actual exit probe can be read back for the same camera, yaw and elevation',()=>{
 const c={innerWidth:390,innerHeight:844,window:null};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../src/world3d.js'),'utf8')+'\nwindow.Renderer=VillageRenderer;',c);
 const r=Object.assign(Object.create(c.Renderer.prototype),{gl:{},canvas:{width:390,height:844},scene:{},images:{'test-0':{}},visibility:new WeakMap(),visibilitySequence:0,center:[0,0],scale:30,zoom:1.4,yaw:0,elevation:0,cameraMoving:false});
 const actor={x:1000,y:1000,height:0,frame:0,flip:false};r.probeActor({name:'test',x:actor.x,z:actor.y,height:0,frame:0,source:actor});
 const proof=r.actorVisibility(actor);assert.ok(proof,'the renderer rejected its own fresh probe');assert.equal(proof.visible,false);assert.ok(proof.sequence>0);
 r.yaw=.5;assert.equal(r.actorVisibility(actor),null);r.yaw=0;r.elevation=1;assert.equal(r.actorVisibility(actor),null);r.elevation=0;assert.equal(r.actorVisibility(actor),proof);r.cameraPitch=[.5,.866];assert.equal(r.actorVisibility(actor),null);delete r.cameraPitch;r.cameraDistance=80;assert.equal(r.actorVisibility(actor),null);delete r.cameraDistance;assert.equal(r.actorVisibility(actor),proof);
});
