const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src'),c={window:{},atob,Uint8Array,DataView,Map,BigInt};vm.createContext(c);
for(const file of ['native-surface-data.js','native-surfaces.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const data=c.window.NATIVE_SURFACE_DATA,api=c.window.NativeSurfaces.create(data),fixture=require('./fixtures/icirrus-native-surfaces.json');

test('1027 original surface samples match independent native signed Q12 references',()=>{
 const hash=crypto.createHash('sha256').update(JSON.stringify({normals:data.normals,offsets:data.offsets})).digest('hex');
 assert.equal(hash,fixture.nativeTablesSHA256);assert.equal(fixture.cases.length,1027);
 for(const expected of fixture.cases){
  const row=api.sample(expected.member,expected.x,expected.z,expected.layer);
  assert.ok(row);for(const key of ['kind','normalIndex','offsetIndex','heightRaw','behavior','flags'])assert.equal(row[key],expected[key],JSON.stringify({...expected,key}));
 }
});
test('overlapping native floors select the nearest valid physical level, preserving lower bridges',()=>{
 let count=0;
 for(const sample of fixture.cases){
  const rows=api.surfaces(sample.member,sample.x,sample.z),valid=rows.filter(r=>r.behavior!==255);
  if(valid.length<2||Math.abs(valid[0].height-valid[1].height)<1)continue;
  count++;
  for(const row of valid)assert.equal(api.choose(rows,row.height).layer,row.layer,'The highest triangle must not replace the lower surface');
 }
 assert.ok(count>0,'The fixture must contain actual native overlapping floors');
});
test('surface origins shift physical heights and out-of-map positions do not fall back to zero',()=>{
 const sample=fixture.cases.find(s=>s.kind===2),row=api.sample(sample.member,sample.x,sample.z,sample.layer,7);
 assert.equal(row.heightRaw,sample.heightRaw+7*65536);
 for(const [x,z]of [[-1,0],[32,0],[0,32],[NaN,0],[0,Infinity]])assert.equal(api.sample(sample.member,x,z),null);
 assert.equal(api.sample(99999,0,0),null);assert.equal(api.at(99999,0,0),null);assert.equal(api.choose([],0),null);
 assert.equal(api.choose([{heightRaw:0}],NaN),null);
 for(const [zone,members]of Object.entries(data.scenes))for(const member of members){
  const direct=api.choose(api.surfaces(member.member,16.25,16.75,member.y),0),world=api.at(zone,member.x+.25,member.z+.75,0);
  assert.equal(world?.heightRaw,direct?.heightRaw,zone);
 }
});
test('the decoded surface cache is bounded and evicted grids decode on demand',()=>{
 const copy={...data,grids:{...data.grids}},first=Object.keys(data.grids)[0],grid=data.grids[first];
 for(let i=0;i<90;i++)copy.grids[10000+i]=grid;
 const bounded=c.window.NativeSurfaces.create(copy),expected=bounded.sample(first,.5,.5).heightRaw;
 for(let i=0;i<90;i++)assert.ok(bounded.sample(10000+i,.5,.5));
 assert.equal(bounded.cacheSize(),64);assert.equal(bounded.sample(first,.5,.5).heightRaw,expected);assert.equal(bounded.cacheSize(),64);
});
