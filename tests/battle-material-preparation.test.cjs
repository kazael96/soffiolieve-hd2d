const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){
 const waiting=new Map(),requests=[],buffers=new Set(),textures=new Set(),gl=new Proxy({createBuffer(){const b={};buffers.add(b);return b;},deleteBuffer:b=>buffers.delete(b),createTexture(){const t={};textures.add(t);return t;},deleteTexture:t=>textures.delete(t),createShader:()=>({}),createProgram:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,isContextLost:()=>false},{get:(o,k)=>k in o?o[k]:()=>{}});
 const c={document:{createElement:()=>({getContext:()=>gl,addEventListener(){}})},OPENING_ASSETS:{models:{'pinwheel-battle-fixture':{groups:['a','b','a','c'].map(texture=>({texture,verts:[0,0,-20,0,0,1,1,1,0,1,0,1,0,-20,0,0,1,1,1,0,1,0,0,0,-21,0,0,1,1,1,0,1,0]}))}},textures:Object.fromEntries(['a','b','c'].map(n=>[n,{src:n}]))},ROM_SCENE:{textures:{}},PinwheelBattles:{ambient:()=>null,has:id=>id==='fixture',contexts:{fixture:{}},instances:()=>[{model:'pinwheel-battle-fixture',x:0,y:0,z:0,rotation:0}]},RuntimeAssets:{image:src=>{requests.push(src);let resolve,reject;const p=new Promise((a,b)=>{resolve=a;reject=b});waiting.set(src,{resolve:()=>resolve({width:16,height:16}),reject});return p;}}};c.window=c;vm.runInNewContext(fs.readFileSync(require.resolve('../src/battle-diorama.js'),'utf8'),c);return{D:c.BattleDiorama,requests,waiting,buffers,textures};
}
const next=()=>new Promise(resolve=>setImmediate(resolve));
test('native battle materials start together and duplicate groups share one request',async()=>{
 const f=fixture(),task=f.D.prepare({id:'fixture',terrain:'grass'});await next();const requested=[...f.requests];for(const entry of f.waiting.values())entry.resolve();
 // Complete either implementation before reporting a baseline assertion.
 for(let i=0;i<4;i++){await next();for(const entry of f.waiting.values())entry.resolve();}await task;
 assert.deepEqual(requested,['a','b','c'],'independent images must enter the shared bounded resource pool before the first image completes');assert.equal(f.requests.length,3);assert.equal(f.buffers.size,4);assert.equal(f.textures.size,3);assert.equal(f.D.cacheStats().pending,0);
});
test('one failed parallel material releases partial resources, ignores old completions and permits retry',async()=>{
 const f=fixture(),task=f.D.prepare({id:'fixture',terrain:'grass'});await next();const rejection=assert.rejects(task,/injected material failure/);f.waiting.get('a').resolve();f.waiting.get('b')?.reject(Error('injected material failure'));if(!f.waiting.has('b')){await next();f.waiting.get('b').reject(Error('injected material failure'));}await rejection;for(const entry of f.waiting.values())entry.resolve();await next();assert.equal(f.D.cacheStats().entries,0);assert.equal(f.buffers.size,0);assert.equal(f.textures.size,0);
 const retry=f.D.prepare({id:'fixture',terrain:'grass'});for(let i=0;i<4;i++){await next();for(const entry of f.waiting.values())entry.resolve();}assert.equal(await retry,true);assert.equal(f.D.cacheStats().pending,0);assert.equal(f.textures.size,3);
});
