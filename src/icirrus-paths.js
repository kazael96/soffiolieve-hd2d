/* Height-aware paths for overlapping Tower floors and the native spiral stairs. */
(function(root){
 function route(zone,from,to){
  if(![108,338,339,340,341,342].includes(zone)||!root.IcirrusChapter.ready)return null;
  const start=from.incomingPortal||from,startHeight=from.height||0,goalHeight=to.height??0;
  const key=n=>[n.x,n.y,Math.round(n.height*32)].join(':'),distance=n=>Math.hypot(n.x-to.x,n.y-to.y)+Math.abs(n.height-goalHeight);
  function choices(x,y,height){const values=[],surface=root.IcirrusChapter.surfaceAt(zone,x,y,height);if(surface&&!(surface.flags&1)&&Math.abs(surface.height-height)<=1.8)values.push({x,y,height:surface.height});
   const rail=root.NativeRails?.has(zone)&&root.NativeRails.locate(zone,x,y,{height});if(rail&&Math.abs(rail.height-height)<=1.8&&!values.some(v=>Math.abs(v.height-rail.height)<.01))values.push({x,y,height:rail.height});return values;
  }
  const seed={x:Math.round(start.x-.5)+.5,y:Math.round(start.y-.5)+.5,height:startHeight},open=[{...seed,g:0,f:distance(seed)}],cost=new Map([[key(seed),0]]),parents=new Map(),states=new Map([[key(seed),seed]]);let found=null,visited=0;
  while(open.length&&visited++<12000){let at=0;for(let i=1;i<open.length;i++)if(open[i].f<open[at].f)at=i;const current=open.splice(at,1)[0],id=key(current);if(current.g!==cost.get(id))continue;
   if(Math.hypot(current.x-to.x,current.y-to.y)<(zone===108?.1:1.3)&&Math.abs(current.height-goalHeight)<1.8){let valid=true;for(let i=1;i<=8;i++){const f=i/8,x=current.x+(to.x-current.x)*f,y=current.y+(to.y-current.y)*f,height=current.height+(goalHeight-current.height)*f;if(!choices(x,y,height).some(p=>Math.abs(p.height-height)<.7)){valid=false;break;}}if(valid){found=id;break;}}
   for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]])for(const next of choices(current.x+dx,current.y+dy,current.height)){
    if(zone===108){const a=root.IcirrusChapter.surfaceAt(zone,current.x,current.y,current.height),b=root.IcirrusChapter.surfaceAt(zone,next.x,next.y,next.height),direction=dx?(dx>0?3:2):(dy>0?1:0);if(root.IcirrusGymMotion.edgeBlocked(a?.behavior,b?.behavior,direction))continue;}
    if(zone!==108&&(Math.abs(next.x)>16||Math.abs(next.y)>16))continue;const nextId=key(next),g=current.g+1+Math.abs(next.height-current.height)*.2;if(g>=(cost.get(nextId)??Infinity))continue;
    cost.set(nextId,g);parents.set(nextId,id);states.set(nextId,next);open.push({...next,g,f:g+distance(next)});
   }
  }
  if(!found)throw Object.assign(Error('Scala nativa non raggiungibile alla quota richiesta: '+zone),{details:{zone,from,to,visited,closest:[...states.values()].sort((a,b)=>distance(a)-distance(b)).slice(0,3)}});
  const points=[];for(let id=found;id;id=parents.get(id))points.push(states.get(id));points.reverse();
  if(from.incomingPortal)points.unshift({...from.incomingPortal,height:startHeight});points.push({...to,height:goalHeight});return points;
 }
 root.IcirrusPaths={route};
})(typeof window==='undefined'?globalThis:window);
