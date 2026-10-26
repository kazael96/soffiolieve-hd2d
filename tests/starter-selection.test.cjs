const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../src'),c={};c.window=c;vm.createContext(c);
for(const file of ['starter-assets.js','starter-scene.js','starter-selection.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
test('IRBI starter resources have both original scenes and resolve all model textures',()=>{
  assert.equal(c.STARTER_ASSETS.materialAlpha.letter.messe_a.length,130);assert.equal(c.STARTER_ASSETS.materialAlpha.letter.messe_a[0],31);assert.equal(c.STARTER_ASSETS.materialAlpha.letter.messe_a[129],0);
  assert.equal(c.STARTER_ASSETS.materialAlpha.ball.spot_light.length,160);assert.equal(c.STARTER_ASSETS.materialAlpha.ball.spot_light[0],0);assert.equal(Math.max(...c.STARTER_ASSETS.materialAlpha.ball.spot_light),31);
  assert.equal(c.STARTER_ASSETS.curves.letter.length,130);assert.equal(c.STARTER_ASSETS.curves.selection.length,250);
  assert.deepEqual(Array.from(c.STARTER_ASSETS.cameraFrames[0]),[80,98,140,258,200]);
  for(const url of Object.values(c.STARTER_ASSETS.models)){
    const raw=fs.readFileSync(path.join(root,url));assert.equal(raw.readUInt32LE(0),0x46546c67);assert.equal(raw.readUInt32LE(8),raw.length);
    const doc=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)));assert.ok(doc.animations.length);
    for(const image of doc.images)assert.ok(fs.existsSync(path.join(root,path.dirname(url),image.uri)));
    for(const skin of doc.skins)assert.ok(skin.joints.length<=24);
  }
});
test('native starter jumps preserve the extracted positions, scale and two-stage arc',()=>{
  for(let i=0;i<3;i++){
    const pose=c.StarterSelection.pokePose,m=c.STARTER_ASSETS.pokeMoves[i];
    assert.equal(pose(i,0).x,m[0]);assert.equal(pose(i,0).y,m[1]);assert.equal(pose(i,0).scale,.5);
    assert.equal(pose(i,4).x,m[2]);assert.equal(pose(i,4).y,m[3]);assert.equal(pose(i,4).scale,.75);
    assert.equal(pose(i,10).x,m[2]);assert.equal(pose(i,10).y,m[3]);
    assert.equal(pose(i,16).x,128);assert.equal(pose(i,16).y,94);assert.equal(pose(i,16).scale,1);
    assert.ok(pose(i,2).y<Math.min(m[1],m[3]));assert.ok(pose(i,14).y<Math.min(m[3],m[5]));
  }
});
test('GLB interpolation and original camera remain finite across every recorded frame',()=>{
  const {sample,interpolate,camera}=c.StarterScene;
  assert.deepEqual(Array.from(sample({times:[0,1],values:[[0,2],[10,4]],path:'translation'},.5)),[5,3]);
  const q=interpolate([0,0,0,1],[0,1,0,0],.5,true);assert.ok(Math.abs(Math.hypot(...q)-1)<1e-10);
  for(const curve of Object.values(c.STARTER_ASSETS.curves))for(let i=0;i<curve.length;i++)assert.ok(camera(curve,i).every(Number.isFinite));
  const view=camera(c.STARTER_ASSETS.curves.selection,39);
  for(const [x,y,z] of c.STARTER_ASSETS.ballPositions){const clip=[0,1,2,3].map(i=>view[i]*x+view[4+i]*y+view[8+i]*z+view[12+i]);assert.ok(clip[3]>0);assert.ok(Math.abs(clip[0]/clip[3])<1);assert.ok(Math.abs(clip[1]/clip[3])<1);}
});
