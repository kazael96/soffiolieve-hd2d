/* Emboar500: native sprite cells with authored HD-2D Rollout/Gyro Ball.
 * Native anatomical ownership is corrected for this species. Other move
 * samples, mechanics, native sounds and profile frame/impact values delegate.
 * Alpha hulls derive from the two original native tick-zero atlases; flames
 * and the bristled tail do not serve as weight-bearing support.
 */
(function(root){
 'use strict';
 if(root.EmboarMoves){root.EmboarMoves.install();return;}
 let installedOn=null;
 function install(){
 const S=root.SpeciesMoves,C=root.ChapterMoves,D=root.DemoMoves;
 if(installedOn===S)return true;
 if(!S?.part||!S?.pose||!C?.sample||!D?.sample)return false;
 const beforePart=S.part,beforeC=C.sample,beforeD=D.sample,beforePose=S.pose;
 const hulls={"front":[[13,[[-7,-47],[19,-73],[20,-73],[21,-72],[22,-67],[23,-55],[23,-54],[21,-52],[5,-38],[3,-38],[-3,-40],[-7,-42]]],[0,[[-11,-58],[-10,-61],[-8,-66],[-6,-69],[-3,-72],[-1,-72],[9,-71],[12,-58],[12,-54],[10,-52],[7,-51],[-9,-51],[-10,-52],[-11,-55]]],[12,[[-18,-58],[-17,-61],[-12,-71],[-11,-72],[-10,-72],[-9,-71],[-6,-63],[-3,-47],[-3,-43],[-4,-42],[-6,-41],[-12,-39],[-14,-39],[-18,-50]]],[10,[[6,-40],[12,-44],[14,-45],[16,-45],[17,-42],[17,-39],[13,-35],[11,-35],[7,-37],[6,-38]]],[9,[[-20,-44],[-19,-46],[-17,-46],[-11,-40],[-11,-39],[-15,-35],[-16,-35],[-17,-36],[-20,-40]]],[3,[[14,-51],[15,-53],[16,-54],[19,-54],[34,-52],[35,-51],[40,-45],[40,-38],[39,-32],[38,-28],[36,-24],[32,-20],[30,-19],[26,-19],[24,-20],[22,-22],[20,-25],[19,-27],[14,-46]]],[2,[[-37,-39],[-35,-48],[-34,-51],[-33,-53],[-32,-54],[-15,-54],[-13,-52],[-13,-43],[-21,-26],[-23,-24],[-29,-20],[-32,-20],[-34,-21],[-35,-22],[-36,-24],[-37,-27]]],[8,[[-25,-22],[-20,-44],[-19,-46],[-17,-46],[16,-45],[20,-40],[23,-34],[24,-30],[25,-19],[25,-16],[23,-16],[-10,-18],[-22,-19],[-25,-20]]],[7,[[9,-12],[10,-13],[16,-18],[19,-18],[24,-16],[25,-15],[25,-7],[24,0],[19,0],[15,-2],[14,-3],[9,-11]]],[5,[[5,-16],[6,-17],[18,-24],[20,-24],[22,-22],[23,-20],[25,-15],[25,-10],[24,-9],[11,-9],[6,-13],[5,-14]]],[6,[[-23,-7],[-21,-17],[-19,-18],[-16,-18],[-8,-13],[-8,-11],[-9,-8],[-10,-7],[-14,-5],[-17,-4],[-21,-4],[-23,-5]]],[4,[[-21,-17],[-20,-20],[-18,-24],[-17,-25],[-10,-25],[-8,-24],[-7,-22],[-6,-18],[-6,-14],[-8,-12],[-14,-12],[-18,-13],[-21,-14]]],[1,[[-19,-52],[-17,-54],[-13,-56],[-9,-57],[10,-57],[16,-55],[18,-53],[19,-50],[20,-38],[20,-20],[15,-16],[13,-15],[10,-14],[4,-13],[-3,-13],[-12,-14],[-15,-15],[-17,-16],[-18,-19],[-19,-25]]],[11,[[1,-18],[2,-19],[28,-21],[39,-21],[43,-18],[43,-17],[41,-8],[35,-6],[33,-6],[2,-16],[1,-17]]]],"back":[[10,[[-35,-12],[-33,-17],[-9,-22],[-7,-22],[-6,-21],[-6,-19],[-11,-14],[-23,-5],[-27,-3],[-29,-3],[-31,-4],[-34,-6],[-35,-11]]],[3,[[15,-38],[19,-43],[29,-46],[30,-46],[31,-45],[38,-33],[40,-29],[42,-24],[42,-21],[40,-19],[35,-16],[33,-16],[25,-24],[15,-36]]],[2,[[15,-51],[17,-53],[19,-53],[22,-51],[24,-49],[25,-47],[27,-41],[27,-36],[26,-35],[22,-35],[20,-36],[19,-37],[16,-41],[15,-43]]],[12,[[4,-54],[16,-70],[17,-71],[18,-71],[19,-70],[23,-63],[23,-59],[22,-50],[13,-49],[11,-49],[4,-53]]],[9,[[-22,-24],[-19,-33],[-17,-38],[-13,-46],[-8,-51],[7,-51],[16,-45],[20,-39],[26,-23],[26,-21],[19,-20],[17,-20],[-22,-21]]],[7,[[12,-9],[21,-13],[26,-13],[28,-3],[28,-2],[27,-1],[24,0],[16,0],[15,-1],[12,-6]]],[5,[[6,-14],[7,-16],[9,-19],[10,-20],[15,-23],[17,-24],[21,-24],[25,-16],[26,-13],[26,-10],[25,-7],[24,-6],[21,-5],[13,-5],[6,-12]]],[0,[[-3,-58],[-1,-71],[11,-71],[12,-70],[13,-68],[18,-55],[18,-53],[6,-53],[-3,-55]]],[11,[[-13,-68],[-11,-68],[-3,-65],[-2,-64],[1,-59],[1,-56],[0,-52],[-10,-50],[-12,-50],[-13,-54]]],[1,[[-18,-26],[-17,-30],[-12,-48],[-9,-54],[-7,-56],[-4,-57],[8,-57],[13,-56],[18,-54],[19,-53],[20,-45],[20,-19],[19,-17],[17,-14],[16,-13],[14,-12],[5,-11],[-3,-11],[-7,-12],[-12,-15],[-13,-16],[-18,-24]]],[8,[[-19,-13],[-18,-13],[-7,-12],[-7,-10],[-9,-6],[-11,-4],[-16,-4],[-18,-5],[-19,-7]]],[6,[[-20,-18],[-18,-26],[-16,-27],[-13,-27],[-10,-25],[-6,-21],[-5,-18],[-5,-15],[-6,-12],[-7,-10],[-9,-8],[-18,-8],[-19,-9],[-20,-13]]],[4,[[-33,-37],[-32,-41],[-30,-47],[-29,-48],[-10,-55],[-7,-55],[-5,-53],[-5,-48],[-19,-24],[-20,-23],[-24,-20],[-27,-19],[-29,-19],[-30,-20],[-32,-25],[-33,-29]]]]};
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 function curve(f,points){if(f<=points[0][0])return points[0][1];for(let n=1;n<points.length;n++)if(f<=points[n][0]){const [x,a]=points[n-1],[y,b]=points[n];return a+(b-a)*smooth((f-x)/(y-x));}return points.at(-1)[1];}
 const anatomy={
  front:{head:[0,12,13],headJoint:[-1,-50],armA:[2],armB:[3],armAJoint:[-15,-48],armBJoint:[16,-49],legA:[4,6],legB:[5,7],legAJoint:[-10,-19],legBJoint:[13,-21],tail:[11],tailJoint:[2,-18]},
  back:{head:[0,11,12],headJoint:[6,-50],armA:[4],armB:[2,3],armAJoint:[-8,-51],armBJoint:[17,-48],legA:[6,8],legB:[5,7],legAJoint:[-10,-21],legBJoint:[14,-17],tail:[10],tailJoint:[-7,-21]}
 };
 function author(a,p,f,miss){
  if(p.species!==500||![205,360].includes(p.id))return a;
  const i=p.impact,end=p.frames;
  const gyro=p.id===360,start=gyro?36:38,finish=gyro?88:84,returnStart=gyro?102:98,returnEnd=gyro?119:116;
  a.emboarGather=curve(f,[[0,0],[i-35,0],[start,1],[finish,1],[returnStart,0],[end,0]]);
  a.roll=f>=finish?0:a.dir*Math.PI*(gyro?4:2)*smooth((f-start)/(finish-start));
  const contactReach=miss?.48:a.dir===1?.88:.76,settleReach=miss?.40:a.dir===1?.70:.64;
  a.reach=curve(f,[[0,0],[i-35,-.025],[start,0],[i,contactReach],[i+3,contactReach],[finish,settleReach],[returnStart,settleReach],[returnEnd,0],[end,0]]);
  a.emboarReturnHop=f>returnStart&&f<returnEnd?Math.sin(Math.PI*(f-returnStart)/(returnEnd-returnStart)):0;
  const rebound=!miss&&f>i+3&&f<finish?Math.sin(Math.PI*(f-i-3)/(finish-i-3)):0;
  a.lift=.10*a.emboarReturnHop+(gyro?.05:.07)*rebound;
  a.head=0;a.arms=0;a.feet=0;a.tail=0;a.crouch=0;a.lean=0;
  return a;
 }
 C.sample=(p,f,side,miss)=>author(beforeC(p,f,side,miss),p,f,miss);
 D.sample=(p,f,side,miss)=>author(beforeD(p,f,side,miss),p,f,miss);
 S.part=function(track,back,a){
  if(a?.species!==500)return beforePart(track,back,a);
  const map=anatomy[back?'back':'front'];
  const data=root.ROM_SPRITE_ANIM?.cache['500-'+(back?'back':'front')]?.data;
  const row=data?.maps?.[data.parent[0].frames[0][0]]?.find(r=>r[0]===track);
  if(!row)return null;
  const q=a.emboarGather,hop=a.emboarReturnHop||0,dir=back?1:-1;
  const at=(joint,rotation,x=0,y=0)=>({rotation,pivotX:joint[0]-row[1],pivotY:joint[1]-row[2],x,y});
  if(Number.isFinite(q)){
   if(map.head.includes(track))return at(map.headJoint,dir*(.10*q+.03*hop),0,6*q+.5*hop);
   if(map.armA.includes(track))return at(map.armAJoint,-1.02*q-.08*hop);
   if(map.armB.includes(track))return at(map.armBJoint,1.02*q+.08*hop);
   if(map.legA.includes(track))return at(map.legAJoint,-1.62*q-.28*hop);
   if(map.legB.includes(track))return at(map.legBJoint,1.62*q+.28*hop);
   if(map.tail.includes(track))return at(map.tailJoint,dir*(.48*q+.05*hop));
   return null;
  }
  if(map.head.includes(track))return at(map.headJoint,a.head*a.dir*.3);
  if(map.armA.includes(track))return at(map.armAJoint,a.arms*.2);
  if(map.armB.includes(track))return at(map.armBJoint,-a.arms*.2);
  if(map.legA.includes(track))return at(map.legAJoint,a.feet*.22);
  if(map.legB.includes(track))return at(map.legBJoint,-a.feet*.22);
  if(map.tail.includes(track))return at(map.tailJoint,a.tail*a.dir*.15);
  return null;
 };
 S.pose=function(p,f,side,attacker,miss,layout){
  if(p.species!==500||![205,360].includes(p.id)||side!==attacker)return beforePose(p,f,side,attacker,miss,layout);
  const a=S.sample(p,f,attacker,miss),back=attacker==='p1',view=back?'back':'front',bank=root.ROM_SPRITE_ANIM?.cache['500-'+view],b=bank?.groundBounds;
  if(!b||!hulls)throw Error('Private Emboar ground geometry unavailable');
  const from=layout[attacker],to=layout[attacker==='p1'?'p2':'p1'],unit=Math.min(from.w/1000,from.h/650),scale=1+(to.height/from.height-1)*Math.max(0,a.reach),pixel=from.height*scale/(b[3]-b[1]),cx=(b[0]+b[2])/2;
  const theta=a.roll,cos=Math.cos(theta),sin=Math.sin(theta),rows=bank.data.maps[bank.data.parent[0].frames[0][0]];
  let bottom=-Infinity,supportTrack=null;
  for(const [track,points]of hulls[view]){
   // Flames and the bristled tail cannot support the rolling torso's weight.
   if((back?[10,11,12]:[11,12,13]).includes(track))continue;
   const row=rows.find(r=>r[0]===track),q=S.part(track,back,a),px=row[1]+(q?.pivotX||0),py=row[2]+(q?.pivotY||0),co=Math.cos(q?.rotation||0),si=Math.sin(q?.rotation||0);
   for(const [xx,yy]of points){
    const dx=(xx-px)*(q?.scaleX??1),dy=(yy-py)*(q?.scaleY??1),x=(px+dx*co-dy*si+(q?.x||0)-cx)*pixel,y=(py+dx*si+dy*co+(q?.y||0)-b[3])*pixel;
    const projected=x*sin+y*cos;if(projected>bottom){bottom=projected;supportTrack=track;}
   }
  }
  // Register rotation to the native torso centre. The support height uses the
  // actual articulated alpha hull, never the empty corners of a standing box.
  const centerX=(-1-cx)*pixel,centerY=((back?-29:-28)-b[3])*pixel;
  return{x:((to.x-from.x)*a.reach+centerX-(centerX*cos-centerY*sin))/unit,y:((to.y-from.y)*a.reach-from.height*a.lift-bottom)/unit,groundX:(to.x-from.x)*a.reach/unit,groundY:(to.y-from.y)*a.reach/unit,groundLift:from.height*a.lift/unit,supportTrack,scale,rotation:theta,scaleX:1,scaleY:1,alpha:1,pauseAnimation:true,speciesPose:a};
 };
 installedOn=S;return true;
 }
 const api={install,scope:'Authored500/205and360 motion; native500part ownership; other samples/mechanics/audio timing retained'};
 root.EmboarMoves=api;install();
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
