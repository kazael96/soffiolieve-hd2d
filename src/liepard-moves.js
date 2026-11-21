/* Liepard510/Scratch10: authored forepaw strike and low pounce.
 * Native ROM cells retain identity; this motion is an HD-2D adaptation.
 * Every other species/move delegates unchanged to the preceding dispatcher. */
(function(root){
 'use strict';
 if(root.LiepardMoves){root.LiepardMoves.install();return;}
 let installedOn=null;
 function install(){
 const C=root.ChapterMoves,S=root.SpeciesMoves; if(installedOn===S)return true; if(!C?.sample||!S?.part)return false; const previousSample=C.sample,previousPart=S.part;
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 function keyframe(f,points){if(f<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++)if(f<=points[i][0]){const [x0,y0]=points[i-1],[x1,y1]=points[i];return y0+(y1-y0)*smooth((f-x0)/(x1-x0));}return points.at(-1)[1];}
 const anatomy={
  front:{foreA:[41],foreB:[42],hindSupport:[43,44],head:[36,37,38],tail:[45],headJoint:[-16,-29]},
  back:{foreA:[39],foreB:[38],hindSupport:[40,41],head:[34,35],tail:[42],headJoint:[12,-28]}
 };
 C.sample=function(p,f,side,miss){
  const a=previousSample(p,f,side,miss);if(p.species!==510||p.id!==10)return a;
  const impact=p.impact,end=p.frames,active=keyframe(f,[[0,0],[impact-32,1],[impact+17,1],[end,0]]);
  a.liepardClawPose={
   foreA:keyframe(f,[[0,0],[impact-33,0],[impact-17,.38],[impact-5,1.18],[impact,.93],[impact+8,.18],[impact+23,0],[end,0]]),
   foreB:keyframe(f,[[0,0],[impact-28,0],[impact-6,.12],[impact+8,-.06],[impact+23,0],[end,0]]),
   head:keyframe(f,[[0,0],[impact-27,.055],[impact-5,-.075],[impact+9,.025],[impact+29,0],[end,0]]),
   tail:keyframe(f,[[0,0],[impact-24,-.16],[impact-4,.19],[impact+15,-.055],[impact+35,0],[end,0]])
  };
  // Forepaw supplies the strike, without the generic eight-cycle whole-body wobble.
  a.lean=keyframe(f,[[0,0],[impact-29,-.035],[impact-5,.025],[impact+9,-.02],[impact+30,0],[end,0]]);
  a.crouch=keyframe(f,[[0,0],[impact-25,.055],[impact-5,.02],[impact+7,.045],[impact+28,0],[end,0]]);
  const arc=(start,finish)=>f>start&&f<finish?Math.sin(Math.PI*(f-start)/(finish-start)):0,forwardArc=arc(impact-27,impact+9),returnArc=arc(impact+23,end-14);
  a.reach=keyframe(f,[[0,0],[impact-30,-.025],[impact-6,miss?.47:.74],[impact+22,miss?.47:.74],[end-14,0],[end,0]]);
  a.lift=.12*forwardArc+.09*returnArc;
  a.crouch=keyframe(f,[[0,0],[impact-31,.075],[impact-13,0],[impact+9,.065],[impact+23,0],[end-14,.045],[end,0]]);
  a.liepardClawPose.hind=.18*forwardArc+.12*returnArc;
  a.feet=0;a.arms=0;a.head=0;a.tail=0;
  return a;
 };
 S.part=function(track,back,a){
  if(a?.species!==510||!a.liepardClawPose)return previousPart(track,back,a);
  const map=anatomy[back?'back':'front'],pose=a.liepardClawPose,dir=back?1:-1;
  if(map.foreA.includes(track))return{rotation:-dir*pose.foreA,pivotX:0,pivotY:0};
  if(map.foreB.includes(track))return{rotation:-dir*pose.foreB,pivotX:0,pivotY:0};
  if(map.hindSupport.includes(track))return{rotation:dir*pose.hind*(map.hindSupport.indexOf(track)?-.6:1),pivotX:0,pivotY:0};
  if(map.head.includes(track)){
   const data=root.ROM_SPRITE_ANIM.cache['510-'+(back?'back':'front')].data,rows=data.maps[data.parent[0].frames[0][0]],row=rows.find(r=>r[0]===track);
   return{rotation:pose.head*dir,pivotX:map.headJoint[0]-row[1],pivotY:map.headJoint[1]-row[2]};
  }
  if(map.tail.includes(track))return{rotation:pose.tail*dir};
  // Torso and supporting hindlimbs keep their original native placement.
  return null;
 };
  installedOn=S;return true;
 }
 root.LiepardMoves={install,scope:'Liepard510/Scratch10 only; native mechanics/effects/audio timings retained'};
 install();
 if(typeof module!=='undefined')module.exports=root.LiepardMoves;
})(typeof window!=='undefined'?window:globalThis);
