const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../src/battle-diorama.js'),'utf8');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
test('a native season change rebuilds the same battle context and releases its old GPU materials',async()=>{const f=environment({count:1});let season=0;f.c.OpelucidBattles={revision:()=>season,has:()=>false,isGround:()=>false};await f.prepare(0);const buffers=[...f.liveBuffers];assert.equal(f.uploads,1);await f.prepare(0);assert.equal(f.uploads,1);season=3;f.c.OPENING_ASSETS.textures.material0={src:'winter-material'};await f.prepare(0);assert.equal(f.uploads,2);assert.ok(buffers.every(b=>!f.liveBuffers.has(b)));assert.deepEqual(f.requests,['material0','winter-material']);assert.equal(f.D.cacheStats().entries,1);});
function environment({count=40,size=16,shared=false,ambient=false,image,failUpload=0,failShader=0,failLink=false,failProgram=false}={}){
 let sequence=0,lost=false,uploads=0,closes=0,releases=0,pins=0,shaderCount=0,linkCount=0,programCount=0;
 const liveBuffers=new Set(),liveTextures=new Set(),liveShaders=new Set(),livePrograms=new Set(),removedBuffers=[],removedTextures=[],drawn=[],requests=[],canvases=[];
 const make=(kind,set)=>{const value={kind,id:++sequence};set.add(value);return value;};
 const gl=new Proxy({
  createBuffer:()=>make('buffer',liveBuffers),createTexture:()=>make('texture',liveTextures),createShader:()=>{const value=make('shader',liveShaders);value.failed=++shaderCount===failShader;return value;},createProgram:()=>++programCount===1&&failProgram?null:make('program',livePrograms),getShaderParameter:value=>!value.failed,getShaderInfoLog:()=> 'injected shader compilation failure',linkProgram:()=>linkCount++,getProgramParameter:()=>!failLink||linkCount!==1,getProgramInfoLog:()=> 'injected program link failure',deleteShader:value=>liveShaders.delete(value),deleteProgram:value=>livePrograms.delete(value),getUniformLocation:(_,n)=>n,getAttribLocation:()=>0,isContextLost:()=>lost,
  deleteBuffer(value){if(liveBuffers.delete(value))removedBuffers.push(value);},deleteTexture(value){if(liveTextures.delete(value))removedTextures.push(value);},
  bindBuffer(_,value){assert.ok(liveBuffers.has(value),'a deleted buffer was reused');this.buffer=value;},bufferData(_,v){this.buffer.bytes=v.byteLength;},
  bindTexture(_,value){assert.ok(liveTextures.has(value),'a deleted texture was reused');this.texture=value;},texImage2D(){uploads++;if(uploads===failUpload)throw Error('injected GPU upload failure');},drawArrays(){drawn.push(this.buffer.id);}
 },{get:(o,k)=>k in o?o[k]:()=>{}});
 const gradient=()=>({addColorStop(){}}),drawing=new Proxy({createRadialGradient:gradient,createLinearGradient:gradient},{get:(o,k)=>k in o?o[k]:()=>{}});
 const canvas=()=>{const events={},c={width:1,height:1,events,getContext:k=>k==='webgl'?gl:drawing,addEventListener:(name,callback)=>events[name]=callback};canvases.push(c);return c;};
 const triangle=[-1,0,-10,0,0,1,1,1,0,1,0,1,0,-10,16,0,1,1,1,0,1,0,0,1,-10,8,16,1,1,1,0,1,0];
 const textures={},models={},contexts={};for(let i=0;i<count;i++){const name=shared?'shared':'material'+i;contexts['case'+i]={cutoff:-5};textures[name]={src:name};models['pinwheel-battle-case'+i]={groups:[{texture:name,verts:triangle}]};}
 const c={console,document:{createElement:canvas},OPENING_ASSETS:{textures,models},ROM_SCENE:{textures:{}},GEN5:{species:[{en:'Patrat',id:504}]},RuntimeAssets:{image:async name=>{requests.push(name);return image?image(name):{width:size,height:size,close(){closes++;}};}},PinwheelBattles:{contexts,has:id=>id in contexts,instances:id=>[{model:'pinwheel-battle-'+id,x:0,y:0,z:0,rotation:0}],ambient:id=>ambient&&id in contexts?[{species:'Patrat',id:504,x:0,z:-15,height:.5}]:null},ROM_SPRITE_ANIM:{load:()=>({ready:true,promise:Promise.resolve(true)}),pin:()=>{pins++;let released=false;return()=>{if(!released){released=true;releases++;}};}}};
 c.window=c;vm.runInNewContext(source,c);const D=c.BattleDiorama;
 return{c,D,gl,liveBuffers,liveTextures,liveShaders,livePrograms,removedBuffers,removedTextures,requests,drawn,canvases,get uploads(){return uploads;},get closes(){return closes;},get pins(){return pins;},get releases(){return releases;},prepare:i=>D.prepare({id:'case'+i,terrain:'path'}),paint:i=>D.paint({id:'case'+i,terrain:'path'},[canvas(),canvas(),canvas()],390,490),lose(){lost=true;canvases.find(c=>c.events.webglcontextlost).events.webglcontextlost({preventDefault(){}});},restore(){lost=false;canvases.find(c=>c.events.webglcontextrestored).events.webglcontextrestored();}};
}

test('40 completed battle contexts retain three GPU sets and reload an evicted original scene',async()=>{
 const e=environment();for(let i=0;i<40;i++)await e.prepare(i);let s=e.D.cacheStats();assert.equal(s.entries,3);assert.equal(s.buffers,3);assert.equal(s.textures,3);assert.equal(s.evictions,37);assert.equal(s.overBudget,false);assert.equal(e.liveBuffers.size,3);assert.equal(e.liveTextures.size,3);
 const old=e.uploads;await e.prepare(0);assert.equal(e.uploads,old+1,'return to an evicted place must upload it again');assert.equal(e.paint(0),true);assert.ok(e.drawn.length);assert.equal(e.D.cacheStats().entries,3);assert.equal(e.closes,0,'GPU eviction must not close shared decoded images');
});

test('recent reuse changes LRU order and shared materials survive their first owner eviction',async()=>{
 const e=environment({shared:true});await e.prepare(0);await e.prepare(1);await e.prepare(2);await e.prepare(0);await e.prepare(3);assert.deepEqual(Array.from(e.D.cacheStats().ids).sort(),['case0','case2','case3']);assert.equal(e.uploads,1);assert.equal(e.removedTextures.length,0);await e.prepare(1);assert.equal(e.uploads,1);assert.equal(e.D.cacheStats().textures,1);assert.equal(e.liveTextures.size,1);assert.equal(e.closes,0);
});

test('the displayed context and every pending preparation remain pinned under pressure',async()=>{
 const loads=new Map(),e=environment({image:name=>{const d=deferred();loads.set(name,d);return d.promise;}});
 const active=e.prepare(0);loads.get('material0').resolve({width:16,height:16});await active;e.c.BattleEnvironment={context:{id:'case0'}};assert.equal(e.paint(0),true);const activeBuffer=[...e.liveBuffers][0];
 const pending=[1,2,3,4].map(i=>e.prepare(i));assert.equal(e.D.cacheStats().entries,5);assert.equal(e.D.cacheStats().pending,4);assert.equal(e.D.cacheStats().pinned,5);assert.equal(e.D.cacheStats().overBudget,true);
 for(let i=1;i<5;i++){loads.get('material'+i).resolve({width:16,height:16});await pending[i-1];assert.ok(e.liveBuffers.has(activeBuffer));}assert.equal(e.D.cacheStats().entries,3);assert.equal(e.D.cacheStats().overBudget,false);assert.equal(e.paint(0),true);
});

test('texture bytes enforce the budget independently from record count; oversized current work stays complete',async()=>{
 const e=environment({size:2048});await e.prepare(0);await e.prepare(1);assert.equal(e.D.cacheStats().entries,1);assert.equal(e.D.cacheStats().textures,1);assert.ok(e.D.cacheStats().bytes<=24*1024*1024);assert.equal(e.D.cacheStats().overBudget,false);
 const huge=environment({size:4096});await huge.prepare(0);assert.equal(huge.D.cacheStats().entries,1);assert.equal(huge.D.cacheStats().pinned,1);assert.equal(huge.D.cacheStats().overBudget,true);assert.equal(huge.paint(0),true,'a large active native scene must not be partially deleted');
});

test('partial GPU failure releases mesh and ambient resources, then an explicit retry succeeds',async()=>{
 const e=environment({ambient:true,failUpload:3});await assert.rejects(e.prepare(0),/injected GPU upload failure/);assert.equal(e.D.cacheStats().entries,0);assert.equal(e.liveBuffers.size,0);assert.equal(e.liveTextures.size,0);assert.equal(e.pins,1);assert.equal(e.releases,1);assert.equal(e.closes,0);
 await e.prepare(0);assert.equal(e.paint(0),true);assert.equal(e.D.cacheStats().textures,4);assert.equal(e.D.cacheStats().buffers,3);assert.equal(e.D.cacheStats().bytes,33*4+2*66*4+16*16*4*2+256*256*4+64*64*4);assert.equal(e.pins,2);assert.equal(e.releases,1);
});

test('ambient bank failure cannot silently replace the original animation and retry requests its bank again',async()=>{
 const e=environment({ambient:true});let attempts=0;e.c.ROM_SPRITE_ANIM.cache={};e.c.ROM_SPRITE_ANIM.load=(key,{retry}={})=>{const prior=e.c.ROM_SPRITE_ANIM.cache[key];if(prior?.error&&!retry)return prior;attempts++;const state={ready:false};state.promise=Promise.resolve().then(()=>{if(attempts===1)state.error='bank unavailable';else state.ready=true;return state.ready;});e.c.ROM_SPRITE_ANIM.cache[key]=state;if(attempts===2)assert.equal(retry,true);return state;};
 await assert.rejects(e.prepare(0),/Animazione originale/);assert.equal(e.D.cacheStats().entries,0);assert.equal(e.liveTextures.size,0);await e.prepare(0);assert.equal(attempts,2);assert.equal(e.paint(0),true);
});

test('real sprite LRU failure metadata retries after three failed attempts and public-state eviction',async()=>{
 const e=environment({ambient:true});let now=0,reads=0,online=false;e.c.Date={now:()=>now};e.c.RuntimeAssets.json=async()=>({opaqueBounds:[0,0,16,16],parent:[],animations:[],maps:[],cells:[]});e.c.RuntimeAssets.image=async src=>{if(src.startsWith('assets/animated/')){reads++;if(!online)throw Error('offline bank');}return{width:16,height:16};};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/pokemon-anim.js'),'utf8'),e.c);const sprites=e.c.ROM_SPRITE_ANIM;sprites.setCacheLimits({bankEntries:0,bankBytes:0});
 for(let i=0;i<3;i++){const state=sprites.load('504-front');assert.equal(await state.promise,false);assert.equal(sprites.cache['504-front'],undefined,'failed public bank should have been evicted');now+=3001;}assert.equal(reads,3);assert.equal(sprites.cacheStats().failures,1);
 online=true;await e.prepare(0);assert.equal(reads,4,'Diorama must explicitly retry returned failure metadata even without public cache state');assert.equal(sprites.cache['504-front']?.ready,true);assert.equal(e.paint(0),true);assert.equal(e.D.cacheStats().entries,1);
});

for(const [name,options,pattern]of [['vertex shader',{failShader:1},/compilation/],['fragment shader',{failShader:2},/compilation/],['program link',{failLink:true},/link/],['program allocation',{failProgram:true},/Memoria programma/]])test('failed '+name+' frees temporary GL handles and retries on the same canvas',async()=>{
 const e=environment(options);await assert.rejects(e.prepare(0),pattern);assert.equal(e.liveShaders.size,0);assert.equal(e.livePrograms.size,0);assert.equal(e.liveBuffers.size,0);assert.equal(e.liveTextures.size,0);assert.equal(e.D.cacheStats().entries,0);const canvas=e.canvases[0];
 await e.prepare(0);assert.equal(e.canvases[0],canvas);assert.equal(e.canvases.length,1,'shader retry should reuse the original canvas/context');assert.equal(e.liveShaders.size,0,'linked program no longer needs attached shader handles');assert.equal(e.livePrograms.size,1);assert.equal(e.paint(0),true);
});

test('context restoration ignores stale image completion and a late old failure cannot erase its replacement',async()=>{
 const old=deferred(),fresh=deferred();let n=0;const e=environment({image:()=>++n===1?old.promise:fresh.promise});
 const pending=e.prepare(0),observed=pending.then(()=>null,error=>error);assert.equal(n,1);e.lose();assert.equal(e.D.cacheStats().entries,0);e.restore();const replacement=e.prepare(0);assert.equal(n,2);fresh.resolve({width:16,height:16});await replacement;const currentUploads=e.uploads,currentBuffers=[...e.liveBuffers];old.resolve({width:16,height:16});assert.match(String(await observed),/ripristino grafico/);assert.equal(e.uploads,currentUploads,'stale decoding must never upload to the restored context');assert.deepEqual([...e.liveBuffers],currentBuffers);assert.equal(e.D.cacheStats().entries,1);assert.equal(e.D.cacheStats().textures,1);assert.equal(e.paint(0),true);assert.equal(e.closes,0);
});

test('late chapter preparation after a GPU reset cannot publish stale geometry',async()=>{
 const wait=deferred(),e=environment();e.c.MistraltonBattles={has:id=>id==='case0',prepare:()=>wait.promise,isGround:()=>false};const pending=e.prepare(0),observed=pending.then(()=>null,error=>error);await e.prepare(1);e.lose();e.restore();wait.resolve();assert.match(String(await observed),/ripristino grafico/);assert.equal(e.liveBuffers.size,0);assert.equal(e.D.cacheStats().entries,0);assert.equal(await e.prepare(0),true);assert.equal(e.D.cacheStats().entries,1);
});
