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
