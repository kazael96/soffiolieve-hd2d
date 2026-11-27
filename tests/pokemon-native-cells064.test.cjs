const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..'),site=process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site'),source=path.join(repo,'src/pokemon-anim.js');
function load(file,frameSource){const c={};c.window=c;vm.createContext(c);let text=fs.readFileSync(file,'utf8');if(frameSource){const start=text.indexOf(' function frame('),end=text.indexOf('\n function transform',start);assert.ok(start>=0&&end>start);text=text.slice(0,start)+' '+frameSource+text.slice(end);}vm.runInContext(text,c);return c.ROM_SPRITE_ANIM;}
// The preserved historical renderer still owns the independent old parts/batches
// implementation. Give it ONLY the verified current time selector in memory so
// this CEL-override regression compares both decomposers at the same native time.
// The separate zero-duration suite retains the old temporal baseline and tests
// the new selector against positive-time schedules and original native data.
const current=load(source),baseline=load(path.join(__dirname,'fixtures/pokemon-anim064-before-native-cells.js'),current.frame.toString()),candidate=process.env.MOUTH_CELLS064_BASELINE?baseline:current,front=JSON.parse(fs.readFileSync(path.join(site,'assets/animated/572-front.json')));
const tuple=p=>({r:Array.from(p.r),f:Array.from(p.f),pf:Array.from(p.pf),o:Array.from(p.o),index:p.index});
test('native mouth cells1/2/3 replace only the selected cell and preserve every affine matrix',()=>{
 const initial=baseline.parts(front,0,0);for(const cell of [1,2,3]){
  const actual=candidate.parts(front,0,0,{1:cell}),mouth=actual.filter(p=>p.r[0]===1);assert.ok(mouth.length);assert.ok(mouth.every(p=>p.f[0]===cell),'Requested native mouth cell is actually selected');
  assert.deepEqual(Array.from(actual).filter(p=>p.r[0]!==1).map(tuple),Array.from(initial).filter(p=>p.r[0]!==1).map(tuple),'All nonmouth cells and transforms remain original');
  for(const p of mouth){assert.deepEqual(Array.from(p.f).slice(1),Array.from(initial.find(x=>x.r[0]===1).f).slice(1));assert.deepEqual(Array.from(p.pf),Array.from(initial[0].pf));assert.deepEqual(Array.from(p.r),Array.from(initial.find(x=>x.r[0]===1).r));}
 }
});
test('invalid explicit native cell is rejected rather than disappearing or silently reverting',()=>{
 for(const cell of [-1,1.5,99999,NaN])assert.throws(()=>candidate.parts(front,0,0,{1:cell}),/Invalid native cell override/);
});
test('default decomposition keeps exact native references and matrices across all150 graphics and both views under the same verified schedule',()=>{
 const graphics=require('./fixtures/native-cells064-graphics.json').graphics;assert.equal(graphics.length,150);let checks=0;
 for(const graphic of graphics)for(const view of ['front','back']){const data=JSON.parse(fs.readFileSync(path.join(site,'assets/animated',graphic+'-'+view+'.json')));for(const tick of [0,1,8,16,32,48,64]){const a=baseline.parts(data,tick),b=candidate.parts(data,tick);assert.equal(a.length,b.length);for(let i=0;i<a.length;i++){assert.equal(b[i].r,a[i].r);assert.equal(b[i].f,a[i].f);assert.equal(b[i].pf,a[i].pf);assert.equal(b[i].o,a[i].o);assert.equal(b[i].index,a[i].index);}assert.deepEqual(Array.from(candidate.batches(data,tick),x=>Array.from(x,tuple)),Array.from(baseline.batches(data,tick),x=>Array.from(x,tuple)));checks++;}}
 assert.equal(checks,2100);
});
