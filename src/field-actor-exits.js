/* HD-2D departures: logical deletion never directly removes a visible person. */
(function(root){
 const people=new Set(['Komor','Belle','Aralia','Mamma','Padre','N','Ghecis','Zania','Spighetto','Chicco','Maisello']);
 const identity=n=>!(n.name==='Ghecis'&&n.fieldZone===152)&&people.has(n.name)&&!(n.name==='Padre'&&n.fieldZone!==392)?n.name:(n.fieldZone||0)+':'+n.uid+':'+n.name;
 const outdoor=z=>[389,317,397,319,6,321,16].includes(z);
 const copy=n=>Object.fromEntries(['name','uid','model','fieldZone','x','y','height','frame','direction','flip'].map(k=>[k,n[k]]));
 function route(from,to,blocked){
  const start=[Math.round(from.x-.5),Math.round(from.y-.5)],end=[Math.round(to.x-.5),Math.round(to.y-.5)],key=p=>p.join(','),distance=p=>Math.abs(p[0]-end[0])+Math.abs(p[1]-end[1]),previous=new Map([[key(start),null]]),cost=new Map([[key(start),0]]),heap=[];
  const less=(a,b)=>a.f<b.f||a.f===b.f&&a.h<b.h;
  const push=node=>{heap.push(node);for(let i=heap.length-1;i>0;){const p=(i-1)>>1;if(!less(heap[i],heap[p]))break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}};
  const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){heap[0]=last;for(let i=0;;){let child=i*2+1;if(child>=heap.length)break;if(child+1<heap.length&&less(heap[child+1],heap[child]))child++;if(!less(heap[child],heap[i]))break;[heap[i],heap[child]]=[heap[child],heap[i]];i=child;}}return first;};
  push({p:start,g:0,h:distance(start),f:distance(start)});let best=start,bestDistance=distance(start),visited=0;
  while(heap.length&&visited<12000){const node=pop(),p=node.p;if(node.g!==cost.get(key(p)))continue;visited++;if(node.h<bestDistance){best=p;bestDistance=node.h;}if(node.h===0){best=p;break;}
   for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]]){const q=[p[0]+dx,p[1]+dy],id=key(q),g=node.g+1;if(g>=(cost.get(id)??Infinity)||Math.abs(q[0]-start[0])>110||Math.abs(q[1]-start[1])>160||blocked(q[0]+.5,q[1]+.5))continue;cost.set(id,g);previous.set(id,p);const h=distance(q);push({p:q,g,h,f:g+h});}
  }
  const path=[];for(let p=best;p&&key(p)!==key(start);p=previous.get(key(p)))path.push({x:p[0]+.5,y:p[1]+.5});return path.reverse();
 }
 function plan(n,zone,blocked){
  const portal=(x,y,dx,dy,kind='door')=>({kind,anchor:{x,y},points:[{x,y},{x:x+dx*2.8,y:y+dy*2.8}],clip:kind==='stairs'?[0,1,0,-.04]:[-dx,0,-dy,dx*x+dy*y+(dy<0?1.3:0)]});
  const arrival=(x,y,destinationZone,targetUid,destination)=>({kind:'arrival',points:route(n,{x,y},blocked),anchor:{x,y},clip:null,background:true,destinationZone,targetUid,destination,itineraryVersion:1});
  // Reach the next story position and wait there, even if its native map has
  // not become the player's active map yet. Arrival is not a disappearance.
  if(zone===317){
   if(n.name==='Aralia')return arrival(12.5,-93.5,397,6,'center-front');
   if(n.name==='Komor')return n.uid===250?arrival(8.5,-71.5,317,3,'route-comparison'):arrival(1.5,-93.5,397,10,'plaza');
   if(n.name==='Belle'){
    if(n.uid===240)return arrival(6.5,-75.5,317,4,'route-comparison');
    const p=portal(12.5,-94.5,0,-1);p.points=[...route(n,{x:11.5,y:-93.5},blocked),{x:12.5,y:-93.5},p.anchor,p.points[1]];p.background=true;p.destination='center-interior';p.itineraryVersion=1;return p;
   }
  }
  if(zone===319){if(n.name==='Mamma'){const p=portal(-22.5,-104.5,1,0);p.points=[...route(n,{x:-23.5,y:-104.5},blocked),p.anchor,p.points[1]];p.background=true;return p;}if(n.name==='Belle')return arrival(20.5,-171.5,6,251,'dreamyard-gate');}
  if(zone===6){const p=portal(n.name==='Zania'?5.5:4.5,n.name==='Zania'?-157.5:-165.5,0,-1);p.points=[...route(n,{x:p.anchor.x,y:p.anchor.y+1},blocked),p.anchor,p.points[1]];return p;}
  if(zone===321){
   if(n.name==='Komor'&&n.uid===21)return arrival(-103.5,-197.5,321,22,'cave-front');
   const cave=n.name!=='Belle'&&n.uid!==4&&n.uid!==8;
   const p=cave?portal(-104.5,-197.5,-1,0):portal(-105.5,-153.5,-1,0);
   p.points=[...route(n,{x:p.anchor.x+1,y:p.anchor.y},blocked),p.anchor,p.points[1]];p.background=true;p.destination=cave?'wellspring-entry':'nacrene-gate';p.itineraryVersion=1;return p;
  }
  if(zone===324){const p=portal(14.5,-10.5,1,0);p.points=[...route(n,{x:13.5,y:-10.5},blocked),p.anchor,p.points[1]];p.background=true;p.destination=n.name==='Komor'?'route3-dark-grass':'route3-exit';p.itineraryVersion=1;return p;}
  if(zone===16){if(n.name==='Komor')return arrival(-149.5,-164.5,16,7,'museum-wait');const points=[...route(n,{x:-174.5,y:-169.5},blocked),{x:-192.5,y:-169.5}];return {kind:'path',points,clip:null,background:true,destination:'pinwheel-forest',itineraryVersion:1};}
  if(zone===9)return portal(-7.5,-13.5,0,0,'stairs');
  if(zone===15)return arrival(-6.5,-13.5,15,5,'school-wait');
  if(zone===152){if(n.name==='Belle')return arrival(15.5,11.5,152,1,'dreamyard-search');if(n.name==='Zania')return {kind:'path',points:[...route(n,{x:-7.5,y:10.5},blocked),{x:-36,y:10.5}],clip:null,background:true,destination:'fennel-house'};const points=[...route(n,{x:11.5,y:-5.5},blocked),{x:11.5,y:-25.5}];return {kind:'path',points,clip:null};}
  if(zone===391)return portal(-6.5,-13.5,0,0,'stairs');
  if(zone===390||zone===392)return portal(Math.max(-11.5,Math.min(-9.5,n.x)),-5.5,0,1);
  if(zone===396)return portal(Math.max(-13.5,Math.min(-11.5,n.x)),-4.5,0,1);
  if(zone===398){const p=portal(-9.5,3.5,0,1);p.points=[...route(n,{x:-9.5,y:2.5},blocked),p.anchor,p.points[1]];return p;}
  if(zone===397){
   if(n.name==='Aralia'){const p=portal(12.5,-94.5,0,-1);p.points=[...route(n,{x:12.5,y:-93.5},blocked),p.anchor,p.points[1]];return p;}
   const gate=['N','Ghecis','Komor'].includes(n.name)||[98,99,204].includes(n.model);
   const doors=gate?[[-15.5,-104.5,-1,0]]:[[-12.5,-91.5,0,-1],[1.5,-105.5,0,-1],[-6.5,-105.5,0,-1],[10.5,-103.5,0,-1]];
   const d=doors.sort((a,b)=>Math.hypot(n.x-a[0],n.y-a[1])-Math.hypot(n.x-b[0],n.y-b[1]))[0],p=portal(...d);
   p.points=[...route(n,{x:d[0]-d[2],y:d[1]-d[3]},blocked),p.anchor,p.points[1]];p.background=true;return p;
  }
  if(zone===389){
   // Lab entrance, or a coherent return to the character's own house.
   if(Math.hypot(n.x+6.5,n.y+11.5)<2.2)return portal(-6.5,-11.5,0,-1);
   let home=null;if(n.name==='Mamma')home={x:-1.5,y:-3.5};else if(n.name==='Belle'&&n.y>2)home={x:-7.5,y:5.5};
   if(home){const p=portal(home.x,home.y,0,-1),approach={x:home.x,y:home.y+1};p.points=[...route(n,approach,blocked),home,p.points[1]];return p;}
  }
  // The connected outdoor field remains rendered. Walk north along valid cells;
  // at the field boundary retain the visual until genuinely hidden or offscreen.
  const points=route(n,{x:4.5,y:-82.5},blocked);return {kind:'path',points,clip:null};
 }
 function savedRecord(r){
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=4096&&Math.abs(p.y)<=4096;
  const a=r?.actor;let p=r?.plan,stage=r?.stage||'walk',index=r?.index??0;
  if(!point(a)||typeof a.name!=='string'||!a.name.length||a.name.length>80||!Number.isInteger(a.uid)||!Number.isInteger(r.zone))return null;
  // The documented old Aralia routes are rebuilt from her valid saved pose;
  // their obsolete path/index must not prevent that compatibility migration.
  if(r.zone===317&&a.name==='Aralia'&&p&&!p.itineraryVersion&&(['path','resident'].includes(p.kind)||p.destination==='lab')){p={kind:'path',points:[],clip:null,...(p.destination==='lab'?{destination:'lab'}:{})};index=0;stage='walk';}
  if(!p||!['path','door','stairs','resident','arrival'].includes(p.kind)||!Array.isArray(p.points)||p.points.length>4096||!p.points.every(point))return null;
  if(['door','stairs','arrival'].includes(p.kind)&&!point(p.anchor))return null;
  if(p.clip!=null&&(!Array.isArray(p.clip)||p.clip.length!==4||!p.clip.every(Number.isFinite)))return null;
  if(p.kind==='arrival'&&(!Number.isInteger(p.destinationZone)||!Number.isInteger(p.targetUid)))return null;
  if(!['walk','resident','rejoin','hold','descend','opening'].includes(stage)||!Number.isInteger(index)||index<0||index>p.points.length)return null;
  const actor=copy(a);actor.fieldZone=Number.isInteger(a.fieldZone)?a.fieldZone:r.zone;actor.height=Number.isFinite(a.height)?a.height:0;actor.frame=Number.isInteger(a.frame)&&a.frame>=0&&a.frame<512?a.frame:0;actor.direction=[0,1,2,3].includes(a.direction)?a.direction:1;
  return {key:identity(actor),actor,zone:r.zone,plan:p,index,stage,age:Number.isFinite(r.age)&&r.age>=0?r.age:0,travel:Number.isFinite(r.travel)&&r.travel>=0?r.travel:0,opened:r.opened===true};
 }
 class Controller{
  constructor({blocked=()=>false,obstructed=()=>false,pose=()=>{},portal=async()=>null,finishPortal=()=>{},sample=()=>null}={}){Object.assign(this,{blocked,obstructed,pose,portal,finishPortal,sample});this.records=new Map();this.retired=[];}
  depart(n,zone,{covered=false,resident=false}={}){
   if(n.model===208||n.hidden||covered)return false;const key=identity(n),existing=this.records.get(key);if(existing){if(!resident&&['resident','rejoin'].includes(existing.stage)){Object.assign(existing,{zone,plan:plan(existing.actor,zone,this.blocked),index:0,age:0,travel:0,zero:0,stage:'walk',target:null,opened:false});existing.actor.exitProbe=true;delete existing.actor.exitClip;}return true;}
   const actor=copy(n),p=resident?{kind:'resident',points:[],clip:null}:plan(n,zone,this.blocked);actor.exitProbe=!resident;
   this.records.set(key,{key,actor,zone,plan:p,index:0,age:0,travel:0,zero:0,stage:resident?'resident':'walk',sampleSequence:-1});return true;
  }
  visible(base,player){
   // There is one visual identity for each named story character, even when
   // adjacent native maps contain two logical records for that same person.
   for(const r of this.records.values())r.target=null;
   const selected=new Map();for(const n of base){const key=identity(n),old=selected.get(key),d=v=>Math.hypot(v.x-player.x,v.y-player.y);if(!old||d(n)<d(old))selected.set(key,n);}
   for(const [key,n]of selected){const r=this.records.get(key);if(r){r.target=n;
    if(r.plan.kind==='arrival'){
     const next=base.find(v=>!v.hidden&&identity(v)===key&&v.fieldZone===r.plan.destinationZone&&v.uid===r.plan.targetUid);if(next){r.target=next;selected.set(key,next);}
     if(r.stage==='resident'&&r.target.fieldZone===r.plan.destinationZone&&r.target.uid===r.plan.targetUid&&Math.hypot(r.actor.x-r.target.x,r.actor.y-r.target.y)<.001){this.records.delete(key);r.resolve?.();}
    }else if(r.stage==='resident'&&Math.hypot(r.actor.x-n.x,r.actor.y-n.y)<.001)this.records.delete(key);else r.stage='rejoin';}}
   return [...selected].filter(([key])=>!this.records.has(key)).map(([,n])=>n).concat([...this.records.values()].map(r=>r.actor));
  }
  tick(dt){
   dt=Math.min(.1,Math.max(0,dt));for(const [key,r]of this.records){const a=r.actor;r.age+=dt;
    if(r.stage==='resident')continue;
    if(r.stage==='rejoin'){
     const b=r.target;if(!b){r.stage='walk';continue;}const d=Math.hypot(b.x-a.x,b.y-a.y),step=3.75*dt;
     if(d<.001){this.records.delete(key);r.resolve?.();continue;}
     const goal=Math.floor(b.x)+','+Math.floor(b.y);if(r.rejoinGoal!==goal){r.rejoinGoal=goal;r.rejoinPath=route(a,b,this.blocked);r.rejoinIndex=0;}
     const point=r.rejoinPath?.[r.rejoinIndex]||(d<=1.1&&!this.blocked(b.x,b.y)?b:null);if(!point)continue;
     const distance=Math.hypot(point.x-a.x,point.y-a.y),dx=distance?(point.x-a.x)/distance:0,dy=distance?(point.y-a.y)/distance:0,travel=Math.min(distance,step);a.x+=dx*travel;a.y+=dy*travel;if(distance<=step)r.rejoinIndex++;
     a.height=b.height||0;delete a.exitClip;this.pose(a,Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0,1+Math.floor(r.age*8)%2);continue;
    }
    const sample=this.sample(a);if(!sample)r.zero=0;else if(sample.sequence!==r.sampleSequence){r.sampleSequence=sample.sequence;r.zero=sample.visible?0:r.zero+1;}
    const canRetire=r.plan.kind==='path'?r.travel>=1.5:r.stage==='hold';
    if(canRetire&&r.zero>=2){this.records.delete(key);this.finishPortal(r);r.resolve?.();this.retired.push({name:a.name,zone:r.zone,reason:'rendered-invisible',x:a.x,y:a.y,height:a.height||0,sequence:r.sampleSequence});if(this.retired.length>40)this.retired.shift();continue;}
    r.unverified=r.stage==='hold'&&!sample?(r.unverified||0)+dt:0;if(r.plan.kind!=='path'&&r.unverified>5)throw Error('Verifica visibilità uscita non disponibile: '+a.name);
    if(r.error)throw Error(r.error);
    if(r.stage==='walk'){
     const point=r.plan.points[r.index];if(point){const dx=point.x-a.x,dy=point.y-a.y,d=Math.hypot(dx,dy),step=3.75*dt;
      if(d>0&&this.obstructed(r,{x:a.x+dx/d*Math.min(d,step),y:a.y+dy/d*Math.min(d,step)})){this.pose(a,a.direction);continue;}
      if(['door','stairs'].includes(r.plan.kind)&&r.index===r.plan.points.length-1&&!r.opened){r.stage='opening';Promise.resolve(this.portal(r)).then(handle=>{if(this.records.get(key)!==r){this.finishPortal({...r,handle});return;}r.handle=handle;r.opened=true;r.stage='walk';},error=>{r.error=String(error);r.stage='hold';});continue;}
      if(r.opened)a.exitClip=r.plan.clip;
      if(d<=step){a.x=point.x;a.y=point.y;r.travel+=d;r.index++;}else{a.x+=dx/d*step;a.y+=dy/d*step;r.travel+=step;}
      if(d>1e-8)this.pose(a,Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0,1+Math.floor(r.age*8)%2);else this.pose(a,a.direction);
     }else {r.stage=r.plan.kind==='arrival'?'resident':r.plan.kind==='stairs'?'descend':'hold';if(r.plan.kind==='arrival'){a.fieldZone=r.plan.destinationZone;a.uid=r.plan.targetUid;a.exitProbe=false;this.pose(a,r.plan.destination==='center-front'?1:a.direction);}else this.pose(a,a.direction);}
    }
    if(r.stage==='descend'){a.exitClip=r.plan.clip;a.noShadow=true;a.height=Math.max(-2.5,(a.height||0)-dt*1.8);if(a.height===-2.5)r.stage='hold';}
    // A result is valid only for the exact rendered pose. Never interpret a
    // missing texture, a pending probe or an error as an invisible actor.
   }
  }
  preserve(old,next,{covered=false,sameField=false}={}){if(covered||!sameField)return;const targets=new Map(next.filter(n=>!n.hidden).map(n=>[identity(n),n]));for(const n of old){const target=targets.get(identity(n));if(!target||Math.hypot(n.x-target.x,n.y-target.y)>.01)this.depart(n,n.fieldZone,{resident:true});}}
  occupied(x,y,except=null){return [...this.records.values()].some(r=>r.key!==(except&&identity(except))&&(r.actor.height||0)>=0&&Math.abs(r.actor.x-x)<.55&&Math.abs(r.actor.y-y)<.55);}
  wait(n){const r=this.records.get(identity(n));if(!r||r.plan.background||r.plan.kind==='path'||r.plan.kind==='resident')return Promise.resolve();if(!r.promise)r.promise=new Promise(resolve=>r.resolve=resolve);return r.promise;}
  clear(){for(const r of this.records.values()){this.finishPortal(r);r.resolve?.();}this.records.clear();}
  save(){return [...this.records.values()].map(r=>({key:r.key,actor:copy(r.actor),zone:r.zone,plan:r.plan,index:r.index,age:r.age,travel:r.travel,stage:r.stage==='opening'?'walk':r.stage,opened:r.opened}));}
  restore(records,zone,progress={}){if(!Array.isArray(records))return;for(const row of records.slice(0,256)){let r=savedRecord(row);if(!r||!(r.zone===zone||outdoor(r.zone)&&outdoor(zone)))continue;
   const lateFriends=(progress.flags||[]).includes(515)||(progress.vars?.[16508]||0)>=2;
   if(r.zone===317&&!r.plan.itineraryVersion&&(r.actor.name==='Aralia'&&['path','resident'].includes(r.plan.kind)||r.actor.name==='Aralia'&&r.plan.destination==='lab'||['Komor','Belle'].includes(r.actor.name)&&(['path'].includes(r.plan.kind)||lateFriends&&r.plan.kind==='resident'))){
    const actor={...r.actor};if(lateFriends&&actor.name!=='Aralia')actor.uid=actor.name==='Komor'?3:4;
    // A pre-0.37 portal save can already be behind the old laboratory door,
    // outside the walkable field. Recover its threshold before the first draw.
    if(actor.name==='Aralia'&&r.plan.destination==='lab'&&this.blocked(actor.x,actor.y)){actor.x=-6.5;actor.y=-10.5;}
    r={...r,actor,plan:plan(actor,r.zone,this.blocked),stage:'walk',index:0,age:0,travel:0,opened:false};
   }
   const stage=r.plan.kind==='resident'?'resident':['rejoin','opening'].includes(r.stage)?'walk':r.stage,actor={...r.actor,exitProbe:stage!=='resident'};
   if(r.opened){actor.exitClip=r.plan.clip;actor.noShadow=(actor.height||0)<0;}
   // Door models/handles belong to this renderer instance, not the save file.
   // Keep the portal cut but reopen its model before resuming a saved passage.
   const opened=r.opened&&!(stage==='walk'&&r.plan.kind==='door');
   this.records.set(r.key,{...r,actor,zero:0,sampleSequence:-1,opened,stage});}}
 }
 const api={Controller,identity,plan,route};root.FieldActorExits=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
