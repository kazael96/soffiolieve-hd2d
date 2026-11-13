const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{matrix}=require('../src/native-field-projection.js');
test('original16-unit model vertices match the real field projection at three viewports, pitches and rotations',()=>{
 for(const [w,h]of [[1280,720],[390,844],[844,390]])for(const pitch of [[.423,.906],[.9,Math.sqrt(.19)]])for(const yaw of [0,.7]){
  const r={canvas:{width:w,height:h},center:[.5,24.5],elevation:2,cameraPitch:pitch,cameraDistance:65,zoom:1.4,yaw},anchor={x:.5,y:25.5,height:2},m=matrix(r,anchor);
  for(const p of [[0,0,0],[16,32,-16],[-16,80,16]]){const world=[anchor.x+p[0]/16,anchor.height+p[1]/16,anchor.y+p[2]/16],dx=world[0]-r.center[0],dz=world[2]-r.center[1],py=world[1]-r.elevation,vx=dx*Math.cos(yaw)-dz*Math.sin(yaw),vz=dx*Math.sin(yaw)+dz*Math.cos(yaw),depth=py*pitch[0]+vz*pitch[1],q=1-depth/65,scale=Math.min(w/30,h/21)*1.4,actual=[0,1,2,3].map(i=>m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i]);
   assert.ok(Math.abs(actual[0]/actual[3]-vx*2*scale/w/q)<1e-10);assert.ok(Math.abs(actual[1]/actual[3]-(pitch[1]*py-pitch[0]*vz)*2*scale/h/q)<1e-10);assert.ok(Math.abs(actual[2]+depth/180)<1e-10);assert.ok(Math.abs(actual[3]-q)<1e-10);
  }
 }
 assert.throws(()=>matrix({canvas:{width:0,height:0}},{x:0,y:0,height:0}),/Proiezione/);
});
test('StarterScene accepts an explicit field projection without needing an invented movie camera',()=>{
 const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/starter-scene.js'),'utf8'),c);const captured=[],gl=new Proxy({uniformMatrix4fv:(location,transpose,value)=>captured.push([...value])},{get:(t,k)=>k in t?t[k]:()=>{}}),scene={canvas:{width:640,height:480},assets:{transparent:true,curves:{stone:[[0,0,0,0,0,20]]},perspective:{sin:.423,cos:.906,near:.1,far:1024}},gl,locations:{},drawModel(){}};
 const projection=[1,0,0,0,0,1,0,0,0,0,1,0,.25,.5,0,1];c.StarterScene.Scene.prototype.draw.call(scene,'stone',10,{projection});assert.deepEqual(captured[0],projection);assert.throws(()=>c.StarterScene.Scene.prototype.draw.call(scene,'stone',10,{projection:[1]}),/Proiezione/);
});
