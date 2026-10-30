const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Ground=require('../src/battle-ground.js');
async function scene(id,terrain='grass'){
 const uploads=[],gl=new Proxy({createBuffer:()=>({}),createTexture:()=>({}),createShader:()=>({}),createProgram:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,isContextLost:()=>false,bufferData:(_,v)=>uploads.push(Array.from(v))},{get:(o,k)=>k in o?o[k]:()=>{}});
 const drawing={createRadialGradient:()=>({addColorStop(){}}),fillRect(){}};
 const canvas=()=>({getContext:k=>k==='webgl'?gl:drawing,addEventListener(){}});
 const triangle=z=>[-1,0,z,0,0,1,1,1,0,1,0,1,5,z,0,0,1,1,1,0,1,0,1,0,z,0,0,1,1,1,0,1,0];
 const origin=id==='wellspring'?[4.5,-7.5]:id==='route3Dark'?[-58,-166.5]:[-68.5,-168.5];
 const floor={groups:[{texture:'grass',verts:triangle(0).map((v,i)=>i%11===1?0:v)}]};
 const c={document:{createElement:canvas},RuntimeAssets:{image:async()=>({width:16,height:16})},GEN5:{species:[['Pidove',519],['Blitzle',522],['Patrat',504],['Roggenrola',524],['Woobat',527]].map(([en,id])=>({en,id}))},ROM_SPRITE_ANIM:{load:()=>({promise:Promise.resolve()})},OPENING_ASSETS:{textures:{forest:{src:'forest'},grass:{src:'grass'}},models:{forest:{groups:[{texture:'forest',verts:[...triangle(-2),...triangle(-30)]}]},'route3-route-floor':floor,'route3-dark-floor':floor,'route3-battle-floor':floor}},ROM_SCENE:{textures:{}},ROUTE3_ASSETS:{scenes:{321:{instances:[{model:'forest',x:origin[0],y:0,z:origin[1],rotation:0}]},324:{instances:[{model:'forest',x:origin[0],y:0,z:origin[1],rotation:0}]}}}};
 c.window=c;vm.runInNewContext(fs.readFileSync(require.resolve('../src/battle-diorama.js'),'utf8'),c);await c.BattleDiorama.prepare({id,terrain});return {D:c.BattleDiorama,uploads};
}
test('native foreground trees stay out of Route 3 battle clearing while distant geometry remains',async()=>{
 for(const id of ['route3','route3Dark','wellspring']){const {uploads}=await scene(id),forest=uploads.filter(v=>v.some((x,i)=>i%11===1&&x===5));assert.ok(forest.length,'Far forest must remain');for(const v of forest)for(let i=2;i<v.length;i+=11)assert.ok(v[i]<=(id==='wellspring'?-13.5:-24),'Near tree crossed the battle clearing in '+id);}
});
test('new ambient Pokemon avoid all single and double combatant silhouettes and each other',async()=>{
 for(const [id,terrain]of [['route3','path'],['route3','grass'],['route3Dark','grass'],['wellspring','cave']]){
  const {D,uploads}=await scene(id,terrain),{size,body}=D.ambientCanvas;
  const quads=uploads.filter(v=>v.length===66&&Math.abs(v[9]-.4)<1e-6&&Math.abs(v[10]-.9)<1e-6);
  assert.equal(quads.length,id==='wellspring'?2:3);
  const actors=quads.map(v=>({x:(v[0]+v[11])/2,z:v[2],height:(v[23]-v[1])*body/size}));
  for(const[w,h]of [[1280,475],[390,490],[390,507],[844,234]]){const context={id,terrain},view=D.camera(context,w/h),normal=Ground.layout(w,h,context,view),fighters=[];
   for(const side of ['p1','p2']){fighters.push(normal[side]);for(let i=0;i<2;i++)fighters.push({x:w*(side==='p1'?(i?.43:.19):(i?.79:.56)),y:h*(side==='p1'?(i?.84:.77):(i?.57:.61)),height:normal[side].height*.76});}
   const observers=actors.map(a=>{const p=Ground.project(view,[a.x,.02,a.z],w,h),height=h*a.height/(2*view.lens[1]*p.depth);return {left:p.x-height*1.35,right:p.x+height*1.35,top:p.y-height*1.3,bottom:p.y};});
   const hit=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   for(const a of observers){assert.ok(a.left>0&&a.right<w&&a.top>0&&a.bottom<h,id+' observer clipped');for(const f of fighters)assert.equal(hit(a,{left:f.x-f.height*.7-2,right:f.x+f.height*.7+2,top:f.y-f.height-2,bottom:f.y+2}),false,id+' observer overlaps a fighter at '+w+'x'+h);}
   for(let i=0;i<observers.length;i++)for(let j=0;j<i;j++)assert.equal(hit(observers[i],observers[j]),false,id+' observers overlap each other');
  }
 }
});
