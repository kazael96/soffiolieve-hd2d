const test=require('node:test'),assert=require('node:assert/strict'),camera=require('../src/scene-camera.js');
test('the raised Catlina room preserves sprite height in projection while keeping heads clear of the bed footprint',()=>{
 for(const degrees of [-6,0,20,40,52.56]){const a=degrees*Math.PI/180,p=[Math.sin(a),Math.cos(a)],vertices=camera.spritePlane({zone:143},2,2,p,true);
  assert.equal(vertices.length,4);for(const vertex of vertices){assert.equal(vertex[2],0,'a head must not lean backwards into the native bed');assert.ok(vertex.every(Number.isFinite));}
  for(const top of vertices.slice(2))assert.ok(Math.abs(top[1]*p[1]-2)<1e-10,'screen height must survive the upright adaptation');
  assert.deepEqual(vertices.slice(0,2),[[-1,0,0],[1,0,0]],'native feet remain anchored');
 }
 for(const scene of [{zone:140},{zone:146},{zone:278},{}])assert.equal(camera.spritePlane(scene,2,2,[.423,.906],true),null);
 assert.ok(camera.spritePlane({zone:143},2,2,[.423,.906],false),'scripted camera pans must not tilt the card back into the bed');
});
test('native emote quads reach the real renderer with parallel edges and exact camera-facing height',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),c={SceneCamera:camera,Float32Array};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/world3d.js'),'utf8')+';globalThis.Renderer=VillageRenderer;',c);
 for(const zone of [143,144,278])for(const yaw of [0,.7]){
  let vertices;const noop=()=>{},r={scene:{zone},cameraPitch:[.6,.8],yaw,loc:{},dynamic:{},bind:noop,texture:noop,gl:{uniform1f:noop,uniform4fv:noop,uniform3f:noop,uniform2f:noop,bindBuffer:noop,bufferData:(target,data)=>vertices=data,drawArrays:noop}};
  c.Renderer.prototype.plane.call(r,0,0,0,1,1,{w:16,h:16},false,false,null,true);
  const projected=index=>{const at=index*11,x=vertices[at],y=vertices[at+1],z=vertices[at+2],viewZ=x*Math.sin(yaw)+z*Math.cos(yaw);return y*.8-viewZ*.6;};
  assert.ok(Math.abs(projected(0))<1e-7);assert.ok(Math.abs(projected(1))<1e-7);assert.ok(Math.abs(projected(2)-1)<1e-7);assert.ok(Math.abs(projected(5)-1)<1e-7,'native marker cannot inherit the human card skew');
 }
});
