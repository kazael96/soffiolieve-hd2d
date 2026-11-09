/* Physical paths along native curved ribbons, without rounding to square cells. */
(function(root){
 const cache=new Map(),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.height||0)-(b.height||0));
 const position=(z,line,front,side=0)=>{const p=root.NativeRails.position(z,line,front,side);return {x:p.x-16,y:p.z-16,height:p.height};};
 function segment(zone,a,b){const points=[],steps=Math.max(1,Math.ceil(distance(a,b)/.2));for(let i=1;i<=steps;i++){const f=i/steps,p={x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,height:a.height+(b.height-a.height)*f};if(!root.NativeRails.locate(zone,p.x,p.y,{height:p.height}))return null;points.push(p);}return points;}
 function graph(zone){const data=root.PINWHEEL_RAILS?.[zone];if(!data)return null;if(cache.get(zone)?.data===data)return cache.get(zone);const nodes=[];
  for(const [line,l]of data.lines.entries())for(let row=0;row<l.tiles.length;row++)for(let col=0;col<l.tiles.width;col++){if(l.tiles.values[row*l.tiles.width+col]&0x10000)continue;const side=col-Math.floor(l.tiles.width/2),p=position(zone,line,row+.5,side);if(root.NativeRails.locate(zone,p.x,p.y,{height:p.height,line}))nodes.push({...p,line,row,side,edges:[]});}
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];let path=null;
   if(a.line===b.line){if(Math.abs(a.row-b.row)+Math.abs(a.side-b.side)!==1)continue;path=[];const steps=5;for(let k=1;k<=steps;k++)path.push(position(zone,a.line,a.row+.5+(b.row-a.row)*k/steps,a.side+(b.side-a.side)*k/steps));}
   else{const la=data.lines[a.line],lb=data.lines[b.line],point=[la.a,la.b].find(p=>p===lb.a||p===lb.b);if(point===undefined||a.row!==(point===la.a?0:la.tiles.length-1)||b.row!==(point===lb.a?0:lb.tiles.length-1))continue;
    const p=data.points[point].position,join={x:p[0]-16,y:p[2]-16,height:p[1]},first=segment(zone,a,join),second=segment(zone,join,b);if(first&&second)path=[...first,...second];
   }
   if(!path||!path.every(p=>root.NativeRails.locate(zone,p.x,p.y,{height:p.height})))continue;
   const cost=path.reduce((sum,p,k)=>sum+distance(k?path[k-1]:a,p),0);a.edges.push({to:j,cost,path});b.edges.push({to:i,cost,path:[...path.slice(0,-1).reverse(),{x:a.x,y:a.y,height:a.height}]});
  }
  const jumps=[];
  for(const [line,l]of data.lines.entries())for(let row=1;row<l.tiles.length;row++){
   if(l.tiles.width!==1||(l.tiles.values[row]&65535)!==114)continue;
   const source=nodes.find(n=>n.line===line&&n.row===row-1&&n.side===0);if(!source)continue;
   const destinations=row+1<l.tiles.length?nodes.filter(n=>n.line===line&&n.row===row+1&&n.side===0):nodes.filter(n=>{const next=data.lines[n.line];return n.line!==line&&n.side===0&&(next.a===l.b&&n.row===0||next.b===l.b&&n.row===next.tiles.length-1);});
   for(const target of destinations){const path=[],frontEnd=target.line===line?row+1.5:l.length,steps=Math.ceil((frontEnd-row+.5)*5);
    for(let k=1;k<=steps;k++)path.push(position(zone,line,row-.5+(frontEnd-row+.5)*k/steps));
    if(target.line!==line){const next=data.lines[target.line],start=next.a===l.b?0:next.length,end=target.row+.5;for(let k=1;k<=3;k++)path.push(position(zone,target.line,start+(end-start)*k/3));}
    const lengths=[];let cost=0;for(let k=0;k<path.length;k++){cost+=distance(k?path[k-1]:source,path[k]);lengths.push(cost);}if(!cost)continue;
    for(let k=0;k<path.length;k++)path[k].jumpLift=k===path.length-1?0:Math.sin(Math.PI*lengths[k]/cost)*.65;
    source.edges.push({to:nodes.indexOf(target),cost,path,jump:{line,row}});jumps.push({line,row,from:{x:source.x,y:source.y,height:source.height},to:{x:target.x,y:target.y,height:target.height},path});
   }
  }
  const g={data,nodes,jumps};cache.set(zone,g);return g;
 }
 function route(zone,from,to){const g=graph(zone);if(!g)return null;const start={...from,...from.incomingPortal,height:from.height||0},goal={...to,height:to.height||0},cost=new Map(),parents=new Map(),open=[];
  for(const [id,p]of g.nodes.entries())if(distance(start,p)<=1.8){const path=segment(zone,start,p);if(path){const value=distance(start,p);cost.set(id,value);parents.set(id,{id:null,path});open.push({id,value,score:value+distance(p,goal)});}}
  let found=null,lastPath;
  while(open.length){let at=0;for(let i=1;i<open.length;i++)if(open[i].score<open[at].score)at=i;const current=open.splice(at,1)[0];if(current.value!==cost.get(current.id))continue;const p=g.nodes[current.id];
   if(distance(p,goal)<=1.8){const path=segment(zone,p,goal);if(path){found=current.id;lastPath=path;break;}}
   for(const edge of p.edges){const value=current.value+edge.cost;if(value>=(cost.get(edge.to)??Infinity))continue;cost.set(edge.to,value);parents.set(edge.to,{id:current.id,path:edge.path});open.push({id:edge.to,value,score:value+distance(g.nodes[edge.to],goal)});}
  }
  if(found===null)throw Error('Percorso sui binari nativi non raggiungibile: '+zone);
  const chunks=[lastPath];for(let id=found;id!==null;){const p=parents.get(id);chunks.push(p.path);id=p.id;}return [{...start},...chunks.reverse().flat()];
 }
 root.NativeRailPaths={route,jumpLinks:zone=>(graph(zone)?.jumps||[]).map(j=>({...j,from:{...j.from},to:{...j.to},path:j.path.map(p=>({...p}))}))};
})(typeof window==='undefined'?globalThis:window);
