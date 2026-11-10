const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),C=require('../src/league-camera.js');
const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/league-camera-data.js'),'utf8'),c);const preset=c.window.LEAGUE_CAMERA_PRESETS.presets[6];
test('the gate preset retains original fixed-point target, angles and source hash',()=>{assert.equal(preset.sourceSha256,'28e9d56a494e54c8ab978001ddd8372197ce2a9e1dcb51e89e598b3d07ec2536');assert.deepEqual(Array.from(preset.targetFx),[1015808,135168,360448]);assert.equal(preset.pitchTurn16,5720);assert.equal(preset.distanceFx,970752);});
test('native camera motion is continuous and returns exactly to the low user view without altering zoom or lens',()=>{
 const pitch=[.423,.906],r={cameraPitch:pitch,yaw:.3,zoom:2.1,cameraDistance:73,elevation:0};const step=C.begin(r,preset);step(0);assert.ok(Math.abs(Math.atan2(...r.cameraPitch)-Math.atan2(...pitch))<1e-12);step(.5);const half=Math.atan2(...r.cameraPitch);step(1);assert.ok(half<Math.atan2(...r.cameraPitch));assert.ok(Math.abs(Math.atan2(...r.cameraPitch)-5720*Math.PI*2/65536)<1e-12);assert.equal(r.storyCameraHeight,2.0625);assert.equal(r.yaw,0);assert.equal(r.zoom,2.1);assert.equal(r.cameraDistance,73);const back=C.returning(r);back(.5);assert.ok(r.storyCameraHeight>0&&r.storyCameraHeight<2.0625);back(1);assert.equal(C.active(r),false);assert.equal(r.cameraPitch,pitch);assert.equal(r.yaw,.3);assert.equal(Object.hasOwn(r,'storyCameraHeight'),false);
});
test('scene/error cancellation restores missing properties and repeated presets keep the original field baseline',()=>{
 const r={zoom:1.4};C.begin(r,preset)(1);C.begin(r,preset)(1);C.reset(r);for(const k of ['cameraPitch','yaw','storyCameraHeight'])assert.equal(Object.hasOwn(r,k),false);assert.equal(C.returning(r),null);assert.throws(()=>C.begin(r,{targetFx:[NaN,0,0]}),/non valido/);
});
test('the real renderer keeps a nonzero native story yaw until the camera returns',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/world3d.js'),'utf8')+'\nwindow.Renderer=VillageRenderer;',c);const r=Object.assign(Object.create(c.window.Renderer.prototype),{scene:{zone:214},contextLost:true,zoom:1.4});
 C.begin(r,{...preset,yawTurn16:163})(1);r.draw(0,[]);assert.ok(Math.abs(r.yaw-163*Math.PI*2/65536)<1e-12);assert.equal(r.storyCameraYaw,r.yaw);C.returning(r)(1);r.draw(0,[]);assert.equal(r.yaw,0);assert.equal(Object.hasOwn(r,'storyCameraYaw'),false);
});
