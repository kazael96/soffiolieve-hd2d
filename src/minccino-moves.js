/* Minccino572/Sing47: native mouth cells and an authored planted song.
 * Other moves remain delegated until their complete poses pass visual review. */
(function(root){
 'use strict';
 if(root.MinccinoMoves){root.MinccinoMoves.install();return;}
 let installedOn=null;
 // Native572-front track13, four ticks per cel. Only the mouth CEL is used;
 // the seventeen whole-body affine keys of native parentmap1 are not applied.
 const mouthCells=[1,1,1,1,2,3,3,3,2,1,1,1,1,1,1,1,1];
 const mouthReferences={front:{track:1,point:[-3.5,-18.5],visibility:'visible',basis:'Centre of native red pixel(-4,-19) in both open mouth cells2/3'},back:{track:2,point:[11,-18.5],visibility:'occluded',basis:'Hidden jaw inside right-facing native head silhouette; not a visible mouth pixel'}};
 function nativePoint(point,f){const angle=f[2]*Math.PI*2/65536,x=point[0]*f[3]/4096,y=point[1]*f[4]/4096;return[f[5]+x*Math.cos(angle)-y*Math.sin(angle),f[6]+x*Math.sin(angle)+y*Math.cos(angle)];}
 function mouthOrigin(a,from,body,side){
  const R=root.ROM_SPRITE_ANIM,S=root.SpeciesMoves,back=side==='p1',view=back?'back':'front',reference=mouthReferences[view],bank=R?.cache['572-'+view];if(!bank?.ready)throw Error('Native mouth attachment bank not ready');
  const data=bank.data,tick=a.nativeTick||0,pf0=R.frame(data.parent[0],tick),mapIndex=a.nativeParentMap??pf0[0],pf=Number.isInteger(a.nativeParentMap)?[mapIndex,...pf0.slice(1)]:pf0,row=data.maps[mapIndex].find(r=>r[0]===reference.track);if(!row)throw Error('Native mouth attachment track missing');
  let q=nativePoint([reference.point[0]-row[1],reference.point[1]-row[2]],R.frame(data.animations[row[0]],tick));
  const local=S.part(row[0],back,a)||{},px=local.pivotX||0,py=local.pivotY||0,xx=(q[0]-px)*(local.scaleX??1),yy=(q[1]-py)*(local.scaleY??1),angle=local.rotation||0;
  q=[row[1]+px+xx*Math.cos(angle)-yy*Math.sin(angle)+(local.x||0),row[2]+py+xx*Math.sin(angle)+yy*Math.cos(angle)+(local.y||0)];q=nativePoint(q,pf);
  const bounds=bank.groundBounds||bank.bounds,nativeScale=from.height*(body.scale??1)/(bounds[3]-bounds[1]),x=(q[0]-(bounds[0]+bounds[2])/2)*nativeScale*(body.scaleX??1),y=(q[1]-bounds[3])*nativeScale*(body.scaleY??1),rotation=body.rotation||0,screenScale=Math.min(from.w/1000,from.h/650);
  return{x:from.x+(body.x||0)*screenScale+x*Math.cos(rotation)-y*Math.sin(rotation),y:from.y+(body.y||0)*screenScale+x*Math.sin(rotation)+y*Math.cos(rotation)};
 }
 function install(){
  const S=root.SpeciesMoves,C=root.ChapterMoves,D=root.DemoMoves;
  if(installedOn===S)return true;
  if(!S?.part||!C?.sample||!D?.sample)return false;
  const previousChapterSample=C.sample,previousDemoSample=D.sample,previousPart=S.part,previousAttachment=D.attachment;
  const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  function curve(f,points){if(f<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++)if(f<=points[i][0]){const[x,a]=points[i-1],[y,b]=points[i];return a+(b-a)*smooth((f-x)/(y-x));}return points.at(-1)[1];}
  const maps={front:{head:[0,1,2,3,4],armsA:[8],armsB:[9],feet:[6,7],tail:[10,11],headJoint:[3,-13],tailJoint:[5,-8]},back:{head:[0,1,2,3],armsA:[4],armsB:[5],feet:[10,11],tail:[7,8,9],headJoint:[-1,-15],tailJoint:[-1,-5]}};
  function author(a,p,f,side='p1'){
   if(p.species!==572||p.id!==47)return a;
   const i=p.impact,end=p.frames,k=points=>curve(f,points),q={head:0,armA:0,armB:0,tail:0,foot:0};
   a.minccinoPose=q;a.head=0;a.tail=0;a.arms=0;a.feet=0;a.lean=0;a.lift=0;a.crouch=0;
   a.reach=0;a.breath=.012*Math.sin(Math.PI*clamp((f-12)/(end-26)))**2;a.crouch=-a.breath;
   const mouthTick=32*Math.sin(Math.PI*clamp(f/end))**2;
   delete a.nativeParentMap;a.nativeTick=0;
   if(side==='p1')delete a.nativeCells;
   else a.nativeCells={1:mouthCells[Math.min(mouthCells.length-1,Math.floor(mouthTick/4))]};
   q.head=k([[0,0],[i-26,-.065],[i-6,-.09],[i+12,-.045],[i+28,-.07],[end-15,0],[end,0]]);
   q.armA=k([[0,0],[i-30,.2],[i+28,.2],[end-15,0],[end,0]]);q.armB=q.armA*.85;
   q.tail=k([[0,0],[i-25,.07],[i+22,.07],[end-15,0],[end,0]]);
   return a;
  }
  // The root pose uses the lexical SpeciesMoves dispatcher, so both actual
  // chapter/demo routes are wrapped rather than only the public sample method.
  D.sample=function(p,f,side,miss){return author(previousDemoSample(p,f,side,miss),p,f,side);};
  C.sample=function(p,f,side,miss){return author(previousChapterSample(p,f,side,miss),p,f,side);};
  D.attachment=function(p,a,from,body,side){return p?.species===572&&p.id===47?mouthOrigin(a,from,body,side):previousAttachment(p,a,from,body,side);};
  S.part=function(track,back,a){
   if(a?.species!==572||!a.minccinoPose)return previousPart(track,back,a);
   const m=maps[back?'back':'front'],pose=a.minccinoPose,dir=back?1:-1,data=root.ROM_SPRITE_ANIM?.cache['572-'+(back?'back':'front')]?.data;
   if(!data)return null;
   const mapIndex=a.nativeParentMap??data.parent[0].frames[0][0],row=data.maps[mapIndex].find(v=>v[0]===track),localTrack=mapIndex===1?track-12:track;
   if(!row)return null;
   if(m.head.includes(localTrack))return{rotation:pose.head*dir,pivotX:m.headJoint[0]-row[1],pivotY:m.headJoint[1]-row[2]};
   if(m.tail.includes(localTrack))return{rotation:pose.tail*dir,pivotX:m.tailJoint[0]-row[1],pivotY:m.tailJoint[1]-row[2]};
   if(m.armsA.includes(localTrack))return{rotation:-dir*pose.armA};
   if(m.armsB.includes(localTrack))return{rotation:dir*pose.armB};
   if(m.feet.includes(localTrack))return{rotation:dir*pose.foot*(m.feet.indexOf(localTrack)?-.6:1)};
   return null;
  };
  installedOn=S;return true;
 }
 root.MinccinoMoves={install,mouthReferences,mouthCells,scope:'Only572/47; selective native mouth cells and anatomical mouth anchor; native mechanics/audio/timeline retained; contact moves withheld'};
 install();
 if(typeof module!=='undefined')module.exports=root.MinccinoMoves;
})(typeof window!=='undefined'?window:globalThis);
