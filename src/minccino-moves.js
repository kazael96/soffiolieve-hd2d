/* Minccino572/Sing47: native mouth cells and an authored planted song.
 * Other moves remain delegated until their complete poses pass visual review. */
(function(root){
 'use strict';
 if(root.MinccinoMoves){root.MinccinoMoves.install();return;}
 let installedOn=null;
 // PRIVATE572/3: original cells and OAM order, planted SPA163-mediated paw beat.
 const slapRig=(function(){
const maps={front:{head:[0,1,2,3,4],torso:[5],feet:[6,7],near:8,far:9,tail:[10,11],neck:[3,-13],hip:[1,-3],tailJoint:[5,-8],nearSign:1,farSign:-1},back:{head:[0,1,2,3],torso:[6],feet:[10,11],near:5,far:4,tail:[7,8,9],neck:[-1,-15],hip:[1,-3],tailJoint:[-1,-5],nearSign:-1,farSign:1}};
const I=()=>[1,0,0,1,0,0],T=(x,y)=>[1,0,0,1,x,y],R=a=>[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0];
function mul(a,b){return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
const around=(p,a)=>mul(T(...p),mul(R(a),T(-p[0],-p[1]))),point=(m,p)=>[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];
function curve(f,keys){if(f<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(f<=keys[i][0]){const[x,a]=keys[i-1],[y,b]=keys[i];let t=(f-x)/(y-x);t=t*t*(3-2*t);return a+(b-a)*t;}return keys.at(-1)[1];}
function sample(bank,view,f,{hitIndex,hitCount,miss=false,species=572,move=3}={}){
 if(species!==572||move!==3)throw Error('Private pilot supports only Minccino572/Doppiasberla3');
 if(miss&&hitCount===0&&hitIndex===0)hitCount=1;
 if(!maps[view]||!Number.isInteger(hitCount)||hitCount<1||hitCount>5||!Number.isInteger(hitIndex)||hitIndex<0||hitIndex>=hitCount||!Number.isFinite(f))throw Error('Invalid native hit/view context');
 f=Math.max(0,Math.min(126,f));const m=maps[view],rowByTrack=new Map(bank.batches.map(g=>[g[0].r[0],g[0].r]));
 for(const track of[...m.head,...m.torso,...m.feet,m.near,m.far,...m.tail])if(!rowByTrack.has(track))throw Error('Original native0 part ownership changed');
 const first=hitIndex===0,last=miss||hitIndex===hitCount-1,farBeat=hitIndex%2===1,direction=view==='back'?1:-1;
 let base=first?curve(f,[[0,0],[20,.18],[126,.18]]):.18;if(last)base*=curve(f,[[0,1],[92,1],[126,0]]);
 const nearStroke=curve(f,[[0,0],[20,.44],[42,.44],[56,.10],[64,-.30],[78,-.12],[96,0],[126,0]]),farStroke=curve(f,[[0,0],[24,.34],[44,.46],[58,.05],[66,-.22],[80,-.09],[96,0],[126,0]]);
 const strokeScale=miss?.52:1,nearAngle=m.nearSign*(base+(!farBeat?nearStroke*strokeScale:0)),farAngle=m.farSign*(base+(farBeat?farStroke*strokeScale:0));
 const torsoAngle=direction*(farBeat?-1:1)*curve(f,[[0,0],[24,-.018],[44,-.018],[58,.027],[70,.012],[88,0],[126,0]]);
 const headWorld=direction*curve(f,[[0,0],[24,-.020],[44,-.020],[62,.012],[84,0],[126,0]]),tailRelative=-direction*curve(f,[[0,0],[24,.035],[44,.035],[64,-.020],[88,0],[126,0]]);
 const torso=around(m.hip,torsoAngle),head=mul(torso,around(m.neck,headWorld-torsoAngle)),tail=mul(torso,around(m.tailJoint,tailRelative)),global={},parts={};
 for(const track of m.torso)global[track]=torso;
 for(const track of m.head)global[track]=head;
 for(const track of m.tail)global[track]=tail;
 for(const[track,a]of[[m.near,nearAngle],[m.far,farAngle]])global[track]=mul(torso,around(rowByTrack.get(track).slice(1,3),a));
 for(const[track,row]of rowByTrack){const g=global[track]||I(),local=mul(T(-row[1],-row[2]),mul(g,T(row[1],row[2])));parts[track]=m.feet.includes(track)?null:{rotation:Math.atan2(local[1],local[0]),x:local[4],y:local[5]};}
 return{frame:f,view,hitIndex,hitCount,first,last,miss,activePaw:farBeat?'far':'near',nearAngle,farAngle,torsoAngle,headWorld,tailRelative,parts,global,footTracks:m.feet,root:{x:0,y:0,scale:1,scaleX:1,scaleY:1,rotation:0,groundX:0,groundY:0,groundLift:0},nativeTick:0,
  scope:'Original native cells/ordering only; rigid anchored hierarchy, planted source feet. Original targetSPA163 is not rendered or altered by this source-only score.'};
}

return{sample,maps};})();

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
  const previousChapterSample=C.sample,previousDemoSample=D.sample,previousPart=S.part,previousAttachment=D.attachment,previousChapterSelect=C.select,previousDemoSelect=D.select,previousDemoDraw=D.draw;
  const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  function curve(f,points){if(f<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++)if(f<=points[i][0]){const[x,a]=points[i-1],[y,b]=points[i];return a+(b-a)*smooth((f-x)/(y-x));}return points.at(-1)[1];}
  const maps={front:{head:[0,1,2,3,4],armsA:[8],armsB:[9],feet:[6,7],tail:[10,11],headJoint:[3,-13],tailJoint:[5,-8]},back:{head:[0,1,2,3],armsA:[4],armsB:[5],feet:[10,11],tail:[7,8,9],headJoint:[-1,-15],tailJoint:[-1,-5]}};

  function withActualHitContext(p,context={}){
   if(p?.species!==572||p.id!==3||p.frames!==126)return p;
   // Scope is acquired at selection, never recalculated to hide a later owner loss.
   // With no game session this remains an explicit reference-preview profile.
   try{const owner=typeof session==='undefined'?null:session;if(owner){if(owner.double||owner.multi||owner.battle?.gameType!=='singles')return p;const view=root.BattlePresentationOwners?.read?.();if(!view?.layoutSupported||!view.available||['p1','p2'].some(side=>!view.roles?.[side]||view.roles[side].altered))return p;}}catch{return p;}
   const n=context.hitCount,i=context.hitIndex;
   if(!Number.isInteger(n)||n<0||n>5||!Number.isInteger(i)||i<0||(n===0?i!==0:i>=n))return p;
   return{...p,minccinoNativeSlap064:'private-native-paw-SPA163',nativeSlapContext064:{hitIndex:i,hitCount:n}};
  }
  C.select=function(sid,id,context){return withActualHitContext(previousChapterSelect.call(this,sid,id,context),context);};
  D.select=function(sid,id,context){return withActualHitContext(previousDemoSelect.call(this,sid,id,context),context);};
  function nativeSlap(a,p,f,side,miss){
   if(p.minccinoNativeSlap064!=='private-native-paw-SPA163')return a;
   const view=side==='p1'?'back':'front',bank=root.ROM_SPRITE_ANIM?.cache['572-'+view],data=bank?.data;
   if(!bank?.ready||!data?.maps?.[0])throw Error('Private native Double Slap bank is not prepared');
   const context=p.nativeSlapContext064;
   if(!miss&&context.hitCount===0)throw Error('Zero native hits require a real failed attempt');
   const score=slapRig.sample({batches:data.maps[0].map(r=>[{r}])},view,f,{...context,miss:!!miss});
   // Body root remains planted. Original target SPA163 is solely responsible
   // for target contact; no invented projectile or disembodied opaque hand.
   for(const key of ['head','tail','arms','feet','lean','lift','crouch','reach','breath','hip','ears','cheeks','jaw','coil'])a[key]=0;
   delete a.roll;delete a.nativeCells;a.nativeTick=0;a.nativeParentMap=0;
   a.minccinoSlap064={parts:score.parts,hitIndex:context.hitIndex,hitCount:context.hitCount,activePaw:score.activePaw,first:score.first,last:score.last,miss:!!miss,controllerPoseOnly:true,renderAcknowledgement:false};
   return a;
  }
  function author(a,p,f,side='p1',miss=false){
   if(p.species===572&&p.id===3)return nativeSlap(a,p,f,side,miss);
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
  D.sample=function(p,f,side,miss){return author(previousDemoSample(p,f,side,miss),p,f,side,miss);};
  C.sample=function(p,f,side,miss){return author(previousChapterSample(p,f,side,miss),p,f,side,miss);};
  // SPA163 is the contact mark. Generic damage rays otherwise appear
  // aroundframe44, before native contact60, and mask its original symbol.
  D.draw=function(c,W,H,x,f,layer){
   if((x?.nativeSlapController064===true||x?.preview&&x.nativeSlapController064==='reference-preview')&&x?.profile?.species===572&&x.profile.id===3&&x.profile.minccinoNativeSlap064==='private-native-paw-SPA163'&&x.profile.kind==='palmFlurry'&&x.profile.frames===126&&x.profile.nativeEffects===true&&x.profile.damage===true&&x.profile.key==='training-572-3'&&x.profile.chapter===true&&x.profile.training===true&&x.profile.impact===60&&x.profile.target==='foe'&&x.profile.attachment==='hand'&&x.profile.nativeSlapContext064&&Object.keys(x.profile.nativeSlapContext064).sort().join(',')==='hitCount,hitIndex'&&Number.isInteger(x.profile.nativeSlapContext064.hitCount)&&x.profile.nativeSlapContext064.hitCount>=0&&x.profile.nativeSlapContext064.hitCount<=5&&Number.isInteger(x.profile.nativeSlapContext064.hitIndex)&&x.profile.nativeSlapContext064.hitIndex>=0&&(x.profile.nativeSlapContext064.hitCount===0?x.profile.nativeSlapContext064.hitIndex===0&&x.miss===true:x.profile.nativeSlapContext064.hitIndex<x.profile.nativeSlapContext064.hitCount))return;
   return previousDemoDraw.call(this,c,W,H,x,f,layer);
  };
  D.attachment=function(p,a,from,body,side){return p?.species===572&&p.id===47?mouthOrigin(a,from,body,side):previousAttachment(p,a,from,body,side);};
  S.part=function(track,back,a){
   if(a?.species===572&&a.minccinoSlap064)return a.minccinoSlap064.parts[track]??null;
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
 root.MinccinoMoves={install,mouthReferences,mouthCells,scope:'PRIVATE: unchanged572/47 plus bounded native572/3paw gesture with actual hit context; SPA163/mechanics/audio/timeline unchanged; not visually approved or installed'};
 install();
 if(typeof module!=='undefined')module.exports=root.MinccinoMoves;
})(typeof window!=='undefined'?window:globalThis);
