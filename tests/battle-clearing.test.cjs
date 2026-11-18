const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),Ground=require('../src/battle-ground.js');
const {run}=require('./helpers/compiled-fixture.cjs');

async function nativeScene(id){
 const uploads=[],gl=new Proxy({createBuffer:()=>({}),createTexture:()=>({}),createShader:()=>({}),createProgram:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,isContextLost:()=>false,bindTexture(_,texture){this.texture=texture;},texImage2D(...args){this.texture.source=args.at(-1).src;},bufferData(_,verts){uploads.push({source:this.texture?.source,verts:Array.from(verts)});}},{get:(o,k)=>k in o?o[k]:()=>{}});
 const drawing=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}}),canvas=()=>({getContext:k=>k==='webgl'?gl:drawing,addEventListener(){}});
 const c=vm.createContext({document:{createElement:canvas},RuntimeAssets:{image:async src=>({src,width:16,height:16})},GEN5:{species:[['Patrat',504],['Lillipup',506],['Purrloin',509],['Munna',517]].map(([en,id])=>({en,id}))},ROM_SPRITE_ANIM:{load:()=>({promise:Promise.resolve()})},ROM_SCENE:{models:{},textures:{},instances:[]}});c.window=c;
 const load=file=>run(fs.readFileSync(require.resolve('../src/'+file),'utf8'),c,{filename:file});
 if(id==='route1'){const file=path.join(process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),'assets/scene.js');run(fs.readFileSync(file,'utf8'),c,{filename:file});}
 load('opening-assets.js');load('route2-assets.js');load('striaton-assets.js');
 for(const asset of [c.ROUTE2_ASSETS,c.STRIATON_ASSETS]){Object.assign(c.OPENING_ASSETS.models,asset.models);Object.assign(c.OPENING_ASSETS.textures,asset.textures);}
 load('battle-diorama.js');await c.BattleDiorama.prepare({id,terrain:'grass'});return{D:c.BattleDiorama,uploads};
}
const formats=[[1280,475],[390,490],[844,234]],near=-18;
function floorHeight(uploads,x,z){let height=-Infinity;for(const {verts:v}of uploads)for(let i=0;i<v.length;i+=33){const a=v.slice(i,i+3),b=v.slice(i+11,i+14),c=v.slice(i+22,i+25),den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-9)continue;const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,t=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den;if(u>=-1e-7&&t>=-1e-7&&u+t<=1+1e-7)height=Math.max(height,u*a[1]+t*b[1]+(1-u-t)*c[1]);}return height;}

for(const id of ['route1','route2','dreamyard']){
 test(id+': native foreground geometry stays behind the battle clearing, preserving the distant setting',async()=>{
  const {uploads}=await nativeScene(id),scenery=uploads.filter(g=>g.source?.startsWith('assets/')&&g.verts.some((v,i)=>i%11===1&&v>.6));assert.ok(scenery.length,'original scenery must remain');
  for(const {source,verts:v}of scenery)for(let i=2;i<v.length;i+=11)assert.ok(v[i]<=(id==='route1'?-26:near),source+' crosses the action area at z='+v[i]);
 });
 test(id+': both fighters and the background observers meet a level local surface in every format',async()=>{
  const {D,uploads}=await nativeScene(id),surfaces=uploads.filter(g=>g.source?.startsWith('assets/'));
  for(const terrain of ['grass','path'])for(const [w,h]of formats){const context={id,terrain},view=D.camera(context,w/h),layout=Ground.layout(w,h,context,view);for(const side of ['p1','p2']){const a=layout[side],y=floorHeight(surfaces,a.world[0],a.world[2]);assert.ok(Number.isFinite(y),'missing ground below '+id+' '+side+' '+w+'x'+h);assert.ok(y>=-.001&&y<=.01,'native ledge/prop still under '+id+' '+side+': '+y);assert.ok(a.world[1]-y>=0&&a.world[1]-y<=.021,'feet detached from the rendered ground');}}
  const observers=uploads.filter(g=>g.verts.length===66&&Math.abs(g.verts[9]-.4)<1e-6&&Math.abs(g.verts[10]-.9)<1e-6);assert.equal(observers.length,id==='route1'?2:3,'preserve the native species');for(const {verts:v}of observers){const x=(v[0]+v[11])/2,z=v[2],y=floorHeight(surfaces,x,z);assert.ok(y>=-.001&&y<=.01,'observer lacks a level contact surface');}
 });
 test(id+': background species remain separate from combatants and from each other after camera changes',async()=>{
  const {D,uploads}=await nativeScene(id),{size,body}=D.ambientCanvas,actors=uploads.filter(g=>g.verts.length===66&&Math.abs(g.verts[9]-.4)<1e-6&&Math.abs(g.verts[10]-.9)<1e-6).map(({verts:v})=>({x:(v[0]+v[11])/2,z:v[2],height:(v[23]-v[1])*body/size})),hit=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  for(const terrain of ['grass','path'])for(const [w,h]of formats){const context={id,terrain},view=D.camera(context,w/h),normal=Ground.layout(w,h,context,view),fighters=Object.values(normal),observers=actors.map(a=>{const p=Ground.project(view,[a.x,.02,a.z],w,h),height=h*a.height/(2*view.lens[1]*p.depth);return{left:p.x-height*1.35,right:p.x+height*1.35,top:p.y-height*1.3,bottom:p.y};});
   for(const side of ['p1','p2'])for(let i=0;i<2;i++)fighters.push({x:w*(side==='p1'?(i?.43:.19):(i?.79:.56)),y:h*(side==='p1'?(i?.84:.77):(i?.57:.61)),height:normal[side].height*.76});
   for(const a of observers){assert.ok(a.left>0&&a.right<w&&a.top>0&&a.bottom<h,'observer clipped');for(const f of fighters)assert.equal(hit(a,{left:f.x-f.height*.7-2,right:f.x+f.height*.7+2,top:f.y-f.height-2,bottom:f.y+2}),false,id+' observer overlaps a fighter at '+w+'x'+h);}
   for(let i=0;i<observers.length;i++)for(let j=0;j<i;j++)assert.equal(hit(observers[i],observers[j]),false,'observers overlap');
  }
 });
}
