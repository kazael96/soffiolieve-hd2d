/* Original overlay203:021be0d4..021be1fe + ARM9 sine table/Q12 math.
 * Numerical vectors also recorded in native-film-projections.json externally.
 */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function setup(){const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/starter-scene.js'),'utf8'),c);return c.StarterScene;}
const cases=[[6,125,167,12288000,4096],[7,43,57,8388608,410],[8,43,57,8388608,410],[9,102,136,8388608,4096],[10,102,136,8388608,4096],[11,102,136,8388608,410],[12,102,136,8388608,410],[13,125,167,8388608,410],[14,125,167,8388608,410]];
test('native Q12 matrix preserves the distant sea/sky instead of inventing a finite far-plane cutoff',()=>{
 const api=setup(),q=[2949,0,0,0,0,3909,0,0,0,0,-410,-410,0,0,-82,0],p={nativeFrustumQ12:{left:-57,right:57,bottom:-43,top:43,near:410,far:8388608,wScale:410},nativeMatrixQ12:q},m=api.camera([[0,0,0,0,0,0]],0,4/3,p);assert.deepEqual(Array.from(m),q.map(v=>v/4096));
 const z=-4000,clipZ=m[10]*z+m[14],w=m[11]*z;assert.ok(clipZ<w&&clipZ>-w,'Native background beyond2048 remains inside the quantized clip volume');
 assert.throws(()=>api.camera([[0,0,0,0,0,0]],0,4/3,{...p,nativeMatrixQ12:q.map((v,i)=>i===2?NaN:v)}),/Matrice/);
});
test('recorded movie frustum uses native Q12 bounds and W scale; aspect word5461 is never a30-degree angle',()=>{
 const api=setup();for(const [id,top,right,far,wScale]of cases){const n=410,p={sin:.5,cos:Math.sqrt(.75),near:n/4096,far:far/4096,nativeFrustumQ12:{left:-right,right,bottom:-top,top,near:n,far,wScale}},m=api.camera([[0,0,0,0,0,0]],0,4/3,p),s=wScale/4096;
  assert.ok(Math.abs(m[0]-n/right*s)<1e-10,'Native horizontal FOV '+id);assert.ok(Math.abs(m[5]-n/top*s)<1e-10,'Native vertical FOV '+id);assert.equal(m[11],-s);assert.ok(m.every(Number.isFinite));assert.deepEqual(Array.from(api.camera([[0,0,0,0,0,0]],0,9/16,p)),Array.from(m),'Native movie stays contained at its recorded aspect');
  const clipX=m[0]*(right/4096),clipW=-m[11]*(n/4096);assert.ok(Math.abs(clipX/clipW-1)<1e-10);
 }
});
test('invalid recorded bounds fail explicitly while legacy starter perspective remains unchanged',()=>{
 const api=setup(),p={sin:.5,cos:Math.sqrt(.75),near:.1,far:2048},m=api.camera([[0,0,0,0,0,0]],0,4/3,p);assert.ok(Math.abs(m[5]-Math.sqrt(3))<1e-12);assert.equal(m[11],-1);
 for(const frustum of [{left:0,right:0,top:1,bottom:-1,near:1,far:2,wScale:4096},{left:-1,right:1,top:1,bottom:-1,near:0,far:2,wScale:4096},{left:-1,right:1,top:1,bottom:-1,near:1,far:2,wScale:NaN}])assert.throws(()=>api.camera([[0,0,0,0,0,0]],0,4/3,{...p,nativeFrustumQ12:frustum}),/Frustum/);
});
test('all nine installed native movie descriptors expose the corrected original frustum',()=>{
 const c={};c.window=c;vm.createContext(c);for(const name of ['finale-cinematics-data','opelucid-cinematics-data'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),c);
 for(const[id,top,right,far,wScale]of cases){const p=(c.FINALE_CINEMATICS.films[id]||c.OPELUCID_CINEMATICS.films[id]).perspective;assert.equal(p.nativeFrustumQ12?.top,top,'Native movie '+id);assert.equal(p.nativeFrustumQ12.right,right);assert.equal(p.nativeFrustumQ12.far,far);assert.equal(p.nativeFrustumQ12.wScale,wScale);assert.equal(p.nativeAspectQ12,5461);assert.equal(p.source.descriptorWords.length,9);assert.equal(p.nativeScreenMatricesQ12.length,2);}
});
