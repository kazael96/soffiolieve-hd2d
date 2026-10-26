/* IRBI movement codes 3/4/5. Overlay21: init 0219a150/160/170,
 * update 0219a1b8, waits 021d4e8c, direction sets 021d5038..5048.
 * Overlay10 02163b8c bounds each axis around the event's original position;
 * -1 means unlimited. ACMD12..15 walk one cell in eight field updates.
 * The host supplies map/actor collision and converts field updates to 30 Hz.
 */
(function(root){
  const dirs=[[0,-1],[0,1],[-1,0],[1,0]],sets={3:[0,1,2,3],4:[0,1],5:[2,3]},waits=[16,32,48,64];
  function create(record,position){
    return sets[record.movement]?{code:record.movement,home:{...position},width:record.width,height:record.height,phase:0,wait:0,frame:0}:null;
  }
  function cell(n){return n.wander?.to||n;}
  function occupies(n,x,y,radius=.55){
    if(n.hidden)return false;
    return [n,n.wander?.from,n.wander?.to].some(p=>p&&Math.abs(p.x-x)<radius&&Math.abs(p.y-y)<radius);
  }
  function update(n,{start,blocked,pose,random=Math.random}){
    const w=n.wander;if(!w||n.hidden)return;
    if(w.phase!==4&&!start)return;
    if(w.phase===0){pose(n,n.direction);w.phase=1;return;}
    if(w.phase===1){w.wait=waits[Math.floor(random()*waits.length)];w.phase=2;}
    if(w.phase===2){if(--w.wait>0)return;w.phase=3;}
    if(w.phase===3){
      const choices=sets[w.code],dir=choices[Math.floor(random()*choices.length)],[dx,dy]=dirs[dir],to={x:n.x+dx,y:n.y+dy};
      pose(n,dir);
      if((w.width!==-1&&Math.abs(to.x-w.home.x)>w.width)||(w.height!==-1&&Math.abs(to.y-w.home.y)>w.height)||blocked(n,to)){w.phase=0;return;}
      w.from={x:n.x,y:n.y};w.to=to;w.frame=0;w.phase=4;
    }
    if(w.phase===4){
      const f=++w.frame/8;n.x=w.from.x+(w.to.x-w.from.x)*f;n.y=w.from.y+(w.to.y-w.from.y)*f;
      pose(n,n.direction,w.frame<4?1:w.frame<8?2:0);
      if(w.frame===8){delete w.from;delete w.to;w.phase=0;}
    }
  }
  const api={create,cell,occupies,update};
  if(typeof module!=='undefined')module.exports=api;else root.NpcWalk=api;
})(typeof window!=='undefined'?window:globalThis);
