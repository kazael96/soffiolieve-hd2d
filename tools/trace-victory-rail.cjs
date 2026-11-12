/* Offline route exporter. Keeps every continuous walking step and native slide;
 * does not advance events, supply visibility proofs, or certify renderer input. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function trace(entry,exit){
 const c={},hashes={};c.window=c;vm.createContext(c);
 for(const name of ['league-rails','league-events','native-rails','league-slide','league-player-slide']){const text=fs.readFileSync(path.join(root,'src',name+'.js'),'utf8');hashes[name]=crypto.createHash('sha256').update(text).digest('hex');vm.runInContext(text,c);}
 c.PINWHEEL_RAILS=c.LEAGUE_RAILS;
 const warps=c.LEAGUE_EVENTS.zones[214].warps,source=warps[entry],target=warps[exit];
 if(!source||!target)throw Error('Unknown native rail portal');
 const first=c.NativeRails.landing(214,source),portal=c.NativeRails.warp(214,target),landing=c.NativeRails.landing(214,target),step=.125;
 const portals=warps.map((w,index)=>({index,w,p:c.NativeRails.warp(214,w),landing:c.NativeRails.landing(214,w)}));
 const crosses=(cur,dx,dy,v)=>{if(cur.line!==v.p.line)return false;const before=(cur.x-v.p.x+16)*v.p.out.x+(cur.y-v.p.z+16)*v.p.out.z,lateral=Math.abs((cur.x-v.p.x+16)*v.p.out.z-(cur.y-v.p.z+16)*v.p.out.x),span=v.p.span??(v.w.b===2?v.w.width:v.w.height);return (dx*v.p.out.x+dy*v.p.out.z)/step>.1&&before>=-3.5&&before<.5&&before+dx*v.p.out.x+dy*v.p.out.z>=-(v.landing.distance-.08)&&lateral<span*.5+.15;};
 const actors=c.LEAGUE_EVENTS.zones[214].actors.map(a=>c.NativeRails.actor(214,a)).map(a=>({x:a.x+.5-16,y:a.z+.5-16,height:a.y/65536}));
 const occupied=(x,y,h)=>actors.some(a=>Math.abs(a.x-x)<.55&&Math.abs(a.y-y)<.55&&Math.abs(a.height-h)<1.25);
 const open=(x,y,h,line)=>!occupied(x,y,h)&&[[-.18,-.18],[.18,.18]].every(([dx,dy])=>c.NativeRails.locate(214,x+dx,y+dy,{height:h,line}));
 const initial={x:first.x,y:first.z,height:first.rail.height,line:first.rail.line};
 const queue=[{start:initial,actions:[]}],known=new Set(),key=p=>[p.x.toFixed(6),p.y.toFixed(6),p.height.toFixed(6),p.line].join(':');let visited=0;
 for(let component=0;component<queue.length;component++){
  if(component>=80)throw Error('Rail component budget exceeded');
  const {start,actions}=queue[component],nodes=[{...start,parent:-1}],seen=new Set([key(start)]),slides=new Map();
  const walk=i=>{const points=[];for(;i>=0;i=nodes[i].parent){const p=nodes[i];points.push([p.x,p.y,p.height,p.line]);}return {kind:'walk',points:points.reverse()};};
  for(let i=0;i<nodes.length;i++){
   if(i>=50000)throw Error('Walking component budget exceeded');visited++;
   const cur=nodes[i],hint={height:cur.height,line:cur.line};
   if(cur.line===portal.line&&Math.abs(cur.height-portal.height)<1.8){
    const before=(cur.x-portal.x+16)*portal.out.x+(cur.y-portal.z+16)*portal.out.z,lateral=Math.abs((cur.x-portal.x+16)*portal.out.z-(cur.y-portal.z+16)*portal.out.x),span=portal.span??(target.b===2?target.width:target.height);
    for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]])if(dx*portal.out.x+dy*portal.out.z>.1&&before>=-3.5&&before<.5&&before+dx*portal.out.x+dy*portal.out.z>=-(landing.distance-.08)&&lateral<span*.5+.15){return {version:1,zone:214,entry,exit,hashes,visited,actorPolicy:'all native roles conservatively blocked, including mutually exclusive flagged roles; dynamic player not included',actions:[...actions,walk(i),{kind:'portal',index:exit,move:[dx,dy],height:cur.height,line:cur.line}]};}
   }
   const slide=c.LeaguePlayerSlide.candidate(cur,0,1);
   if(slide){const end=c.LeaguePlayerSlide.finish(slide),at=c.NativeRails.locate(214,end.x,end.y,{height:end.height,line:slide.plan.landing.line});if(at&&open(end.x,end.y,end.height,at.line)){const next={...end,line:at.line},id=key(next);if(!slides.has(id))slides.set(id,{start:next,actions:[...actions,walk(i),{kind:'slide',record:slide}]});}}
   for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){
    if(portals.some(v=>v.index!==exit&&crosses(cur,dx,dy,v)))continue;
    const x=cur.x+dx,y=cur.y+dy;if(!open(x,y,cur.height,cur.line)||!open(cur.x+dx/2,cur.y+dy/2,cur.height,cur.line))continue;
    const at=c.NativeRails.locate(214,x,y,hint);if(!at)continue;const next={x,y,height:at.height,line:at.line},id=key(next);if(seen.has(id))continue;seen.add(id);nodes.push({...next,parent:i});
   }
  }
  for(const [id,next]of slides)if(!known.has(id)){known.add(id);queue.push(next);}
 }
 throw Error('No continuous rail route '+entry+' -> '+exit);
}
module.exports={trace};
if(require.main===module){const [entry,exit,out]=process.argv.slice(2);if(!out||!/^\d+$/.test(entry)||!/^\d+$/.test(exit))throw Error('Usage: node tools/trace-victory-rail.cjs ENTRY EXIT OUTPUT.json');const result=trace(+entry,+exit);fs.writeFileSync(path.resolve(out),JSON.stringify(result)+'\n');console.log(JSON.stringify({entry:result.entry,exit:result.exit,visited:result.visited,actions:result.actions.map(a=>({kind:a.kind,points:a.points?.length,landing:a.record?.plan.landing}))}));}
