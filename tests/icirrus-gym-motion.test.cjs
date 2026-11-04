const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c={window:{}};vm.createContext(c);for(const n of ['icirrus-gym-data','icirrus-gym-motion'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',n+'.js'),'utf8'),c);
const D=c.window.ICIRRUS_GYM_DATA,M=c.window.IcirrusGymMotion,api=M.create(D),clone=v=>JSON.parse(JSON.stringify(v));
test('all14 native cannon paths retain every fixed-point sample and a separate final reset',()=>{
 let routes=0,differentFinalY=0;
 for(let i=0;i<D.routes.length;i++)for(let column=0;column<4;column++){
  const r=D.routes[i][column];if(r.member<0){assert.equal(api.point(i,column,0),null);continue;}
  routes++;const p=D.paths[r.member];assert.equal(p.pointsQ16.length,p.frames);
  for(let frame=0;frame<p.frames;frame++)assert.deepEqual(clone(api.point(i,column,frame)),clone(p.pointsQ16[frame].map((v,k)=>D.origins[i][k]+v/65536-(k===1?0:16))));
  const last=api.point(i,column,p.frames-1),end=api.point(i,column,0,{settled:true});assert.ok(Math.abs(last[0]-end[0])<.00002&&Math.abs(last[2]-end[2])<.00002);
  if(Math.abs(last[1]-end[1])>.01){differentFinalY++;assert.equal(r.member,21);assert.equal(last[1],10.25);assert.equal(end[1],10);}
 }
 assert.equal(routes,14);assert.equal(differentFinalY,1);
});
test('native D-pad lookahead triggers only enabled cannon directions and respects the field dispatcher',()=>{
 const delta=[[0,-1],[0,1],[-1,0],[1,0]];let enabled=0;
 for(let i=0;i<10;i++)for(let direction=0;direction<4;direction++){
  const p=D.anchors[i],x=p[0]-16-delta[direction][0]*2+.5,z=p[2]-16-delta[direction][1]*2+.5,column=D.nativeDirectionToColumn[direction],r=D.routes[i][column];
  const found=api.activation(x,z,direction);if(r.member<0)assert.equal(found,null);else{enabled++;assert.equal(found.index,i);assert.equal(found.route.member,r.member);}
  assert.equal(api.activation(x,z,direction,{frontBlocked:true}),null);assert.equal(api.activation(x,z,direction,{backgroundEvent:true}),null);
 }
 assert.equal(enabled,14);assert.equal(api.activation(NaN,0,0),null);
});
test('native terrain81..88 blocks directional edges rather than entire tiles',()=>{
 const expected={81:[3],82:[2],83:[0],84:[1],85:[0,3],86:[0,2],87:[1,3],88:[1,2]},opposite=[1,0,3,2];
 for(const [behavior,blocked]of Object.entries(expected))for(let direction=0;direction<4;direction++){
  assert.equal(M.edgeBlocked(+behavior,0,direction),blocked.includes(direction));
  assert.equal(M.edgeBlocked(0,+behavior,direction),blocked.includes(opposite[direction]));
 }
 assert.equal(M.edgeBlocked(0,0,4),true);
});
test('camera angles use the short wrapped arc, signed integer interpolation and native Q12 lookup',()=>{
 assert.equal(M.angle(65000,1000,5,10),232);assert.equal(M.angle(1000,65000,5,10),232);
 assert.equal(M.scalar(10,-5,1,4),7);assert.equal(M.scalar(10,-5,4,4),-5);assert.equal(M.angle(65000,1000,10,10),1000);
 const target=[1,2,3],front=api.orbit(0,0,10,target),right=api.orbit(0,16384,10,target);
 assert.deepEqual(clone(front),[1,2,13]);assert.deepEqual(clone(right),[11,2,3]);
 assert.equal(D.sinCosQ12.length,4096);assert.deepEqual(clone(D.sinCosQ12[2048]),[0,-4096]);
 for(const profile of D.profiles){const eye=api.orbit(profile[0],profile[1],10,target);assert.ok(eye.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...eye.map((n,i)=>n-target[i]))-10)<1e-10);}
});
test('four native BMA alpha tracks accompany all four articulated animation sets',()=>{
 assert.equal(D.model.animations.length,4);
 for(let i=0;i<4;i++){const track=D.materialAnimations[i];assert.equal(track.frames,i<2?114:144);assert.ok(Object.keys(track.materials).length);for(const material of Object.values(track.materials)){assert.equal(material.alpha.length,track.frames);assert.ok(material.alpha.every(a=>a>=0&&a<=31));}}
 assert.deepEqual(clone(D.animationFrames.flightStart),[30,30,45,45]);
});
