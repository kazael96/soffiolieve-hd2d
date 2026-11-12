/* Actual depth-probe bounds and cache; GL returns a visible sample in its ROI. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const reads=[],gl={FRAMEBUFFER_COMPLETE:1,NO_ERROR:0,bindFramebuffer(){},checkFramebufferStatus:()=>1,clearColor(){},clear(){},disable(){},enable(){},depthMask(){},uniform1f(){},getError:()=>0,readPixels:(x,y,w,h,format,type,p)=>{reads.push({x,y,w,h});p[0]=255;p[1]=0;p[2]=255;}};
 const c={innerWidth:1280,innerHeight:720,Math,Uint8Array,SceneCamera:require('../src/scene-camera.js')};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('src/world3d.js','utf8')+';window.Renderer=VillageRenderer;',c);
 const matrix=[.1,0,0,0,0,.1,0,0,0,0,.1,0,0,-1.8,0,1],angle=52.56*Math.PI/180;
 const r=Object.assign(Object.create(c.Renderer.prototype),{gl,canvas:{width:1280,height:720},scene:{zone:143},images:{'Catlina-3':{}},taskProjection:matrix,cameraPitch:[Math.sin(angle),Math.cos(angle)],yaw:0,elevation:0,center:[0,0],scale:50,zoom:1.4,visibility:new WeakMap(),visibilitySequence:0,loc:{},plane(){}});
 const n={x:-.5,y:-7.5,height:18,frame:3,flip:false},actor={name:'Catlina',x:n.x,z:n.y,height:n.height,frame:3,source:n};return {r,n,actor,reads};
}
test('native projection and upright sprite bounds produce a real depth-probe region around the raised actor',()=>{
 const {r,n,actor,reads}=setup();r.probeActor(actor);assert.equal(reads.length,1,'the native matrix must locate the body inside the viewport');const roi=reads[0];assert.ok(roi.x<640&&roi.x+roi.w>640);assert.ok(roi.h>=100);assert.equal(r.actorVisibility(n)?.visible,true);
});
test('restoring the ordinary camera properties after draw cannot invalidate a matching native projection, but changing its matrix does',()=>{
 const {r,n,actor}=setup();r.probeActor(actor);r.cameraPitch=[.423,.906];r.cameraMoving=true;assert.equal(r.actorVisibility(n)?.visible,true,'actual rendered native view still matches');r.taskProjection[12]+=.1;assert.equal(r.actorVisibility(n),null,'a genuinely changed native view needs a fresh probe');
});
