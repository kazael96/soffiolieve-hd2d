/* QA only: exhaustive timeline coverage without redrawing identical states. */
(function(root){
 const identity=[0,1,0,4096,4096,0,0];
 const duration=f=>Math.max(1,f[1]);
 function track(a){
  if(!a?.frames.length)a={frames:[identity],mode:1,loop:0};
  const f=a.frames,loop=Math.min(a.loop||0,f.length-1),start=f.slice(0,loop).reduce((s,x)=>s+duration(x),0);
  const list=a.mode===3||a.mode===4?f.concat(f.slice(a.mode===4?loop:0,-1).reverse()):f;
  const total=list.reduce((s,x)=>s+duration(x),0),repeats=a.mode===2||a.mode===4;
  const ids=[],values=new Map(),cells=[],keys=[];
  for(const row of list){const key=[row[0],...row.slice(2)].join(','),id=values.has(key)?values.get(key):values.size;values.set(key,id);cells[id]=row[0];keys[id]=key;for(let i=0;i<duration(row);i++)ids.push(id);}
  return {start:repeats?start:total-1,period:repeats?Math.max(1,total-start):1,
   cells,keys,
   state(t){return ids[repeats&&t>=total?start+(t-start)%Math.max(1,total-start):Math.min(t,total-1)];}};
 }
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 function plan(data){
  const parent=track(data.parent[0]),used=new Set();
  for(const pf of data.parent[0]?.frames||[identity])for(const r of data.maps[pf[0]]||data.maps[0]||[])used.add(r[0]);
  const animations=new Map([...used].map(i=>[i,track(data.animations[i])]));
  const tracks=[parent,...animations.values()],prefix=Math.max(...tracks.map(t=>t.start));
  const period=tracks.reduce((n,t)=>n/gcd(n,t.period)*t.period,1);
  if(!Number.isSafeInteger(prefix+period))throw Error('Ambient cycle exceeds exact integer range');
  const maps=parent.cells.map(cell=>(data.maps[cell]||data.maps[0]||[]).map(r=>animations.get(r[0])));
  return {parent,animations,maps,prefix,period,ticks:prefix+period};
 }
 async function scan(data,frame,visit,{yieldControl=()=>Promise.resolve(),progress=()=>{},batch=10000}={}){
  const p=plan(data),states=new Map();
  for(let tick=0;tick<p.ticks;tick++){
   const parent=p.parent.state(tick),signature=parent+'|'+p.maps[parent].map(t=>t.state(tick)).join(',');
   const previous=states.get(signature);if(previous)previous.count++;else states.set(signature,{tick,count:1});
   if(tick%batch===batch-1){progress(tick+1,p.ticks);await yieldControl();}
  }
  let clipped=0,empty=0,belowGround=0,n=0;
  for(const {tick,count}of states.values()){
   // Check the independent timeline compiler against the real Nitro decoder
   // for every rendered state, before reusing its pixel result.
   for(const [animation,t]of [[data.parent[0],p.parent],...[...p.animations].map(([i,t])=>[data.animations[i],t])]){
    const row=frame(animation,tick);if([row[0],...row.slice(2)].join(',')!==t.keys[t.state(tick)])throw Error('Ambient timeline disagrees with Nitro playback');
   }
   const result=await visit(tick);if(result.clipped)clipped+=count;if(result.empty)empty+=count;if(result.belowGround)belowGround+=count;if(++n%50===0)await yieldControl();
  }
  return {poses:p.ticks,uniquePoses:states.size,clipped,empty,belowGround,prefix:p.prefix,period:p.period,coverage:'Every integer tick, identical render states deduplicated'};
 }
 root.AmbientAudit={track,plan,scan};if(typeof module!=='undefined')module.exports=root.AmbientAudit;
})(typeof window!=='undefined'?window:globalThis);
