/* Original Patrat composite, with authored species-specific HD-2D choreography. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
 const profile=(id,name,frames,impact,kind='attack',phase=0)=>Object.freeze({species:504,id,name,frames,impact,kind,phase,key:'patrat-'+id+(id===117?'-'+kind:'')});
 const bide=Object.freeze({prepare:profile(117,'Pazienza',192,48,'prepare'),store:profile(117,'Pazienza',96,46,'store'),release:profile(117,'Pazienza',144,67,'release',1)});
 const profiles=Object.freeze({33:profile(33,'Azione',96,44),43:profile(43,'Fulmisguardo',108,49,'status'),44:profile(44,'Morso',126,60),117:bide.prepare});
 const tracks=Object.freeze({front:{head:[0],teeth:[1],body:[2],raisedArm:[3,4],arm:[5],legs:[6,7],feet:[8,9],tail:[10,11]},back:{head:[0],body:[1],raisedArm:[3,2],arm:[4],legs:[5,6],feet:[7,8],tail:[9,10]}});
 function select(id,context={}){return +id===117?(context.phase===1?bide.release:context.storing?bide.store:bide.prepare):profiles[id]||null;}
 function sample(p,f,side='p1',miss=false){
  const t=clamp(f/p.frames),dir=side==='p1'?1:-1,wind=ease(t/.22)*(1-ease((t-.77)/.23)),hit=ease((t-.25)/.18)*(1-ease((t-.73)/.27));
  const a={species:504,t,dir,miss,wind,hit,lean:0,crouch:0,reach:0,lift:0,head:0,arms:0,feet:0,tail:0,jaw:0,glare:0,aura:0,phase:p.phase,kind:p.kind};
  if(p.id===33){const run=ease((t-.2)/.1)*(1-ease((t-.6)/.15));a.reach=t<.21?-.065*ease(t/.21):t<.46?mix(-.065,miss?.56:.86,ease((t-.21)/.25)):mix(miss?.56:.86,0,ease((t-.46)/.43));a.crouch=.13*Math.sin(Math.PI*clamp(t/.31));a.lift=.045*Math.sin(Math.PI*clamp((t-.21)/.45));a.lean=.18*hit;a.head=.06*wind;a.arms=-.22*wind;a.feet=.27*Math.sin(t*Math.PI*12)*run;a.tail=-.3*wind;}
  if(p.id===43){a.lean=-.035*wind;a.head=-.12*wind;a.arms=-.12*wind;a.tail=-.24*wind;a.crouch=-.035*wind;a.jaw=.12*wind;a.glare=ease((t-.24)/.16)*(1-ease((t-.63)/.19));}
  if(p.id===44){a.reach=t<.2?-.04*ease(t/.2):t<.47?mix(-.04,miss?.53:.8,ease((t-.2)/.27)):mix(miss?.53:.8,0,ease((t-.51)/.38));a.crouch=.08*wind;a.lean=.12*hit;a.head=.1*wind;a.arms=.16*wind;a.tail=-.2*wind;a.feet=.16*Math.sin(t*Math.PI*8)*hit;a.jaw=1.45*ease((t-.19)/.16)*(1-ease((t-.45)/.1));}
  if(p.id===117){
   if(p.kind==='release'){const burst=ease((t-.24)/.15)*(1-ease((t-.62)/.22));a.crouch=.11*Math.sin(Math.PI*clamp(t/.36));a.reach=.16*Math.sin(Math.PI*clamp((t-.25)/.48));a.lean=.14*burst;a.head=.16*burst;a.arms=.46*burst;a.tail=-.32*wind;a.aura=wind*(1-ease((t-.6)/.2));}
   else{const pulse=Math.sin(f*.25);a.crouch=(p.kind==='store'?.075:.11)*wind;a.head=(.075+.018*pulse)*wind;a.arms=-.2*wind;a.tail=(-.18+.035*pulse)*wind;a.jaw=.15*wind;a.aura=wind*(.65+.2*pulse);}
  }return a;
 }
 function part(track,back,a){const m=tracks[back?'back':'front'],role=Object.keys(m).find(k=>m[k].includes(track)),head={pivotX:2,pivotY:6,rotation:a.head*a.dir};
  if(role==='head')return head;
  if(role==='teeth')return{...head,x:-Math.sin(head.rotation)*a.jaw,y:Math.cos(head.rotation)*a.jaw};
  if(role==='body')return{scaleX:1+a.crouch*.1,scaleY:1-a.crouch*.1};
  if(role==='raisedArm'){const hand=track===(back?2:4);return{rotation:a.arms*a.dir,pivotX:hand?(back?8:12):0,pivotY:hand?12:0};}
  if(role==='arm')return{rotation:-a.arms*a.dir,pivotX:-3,pivotY:7};
  if(role==='legs')return{rotation:a.feet*(track===m.legs[0]?1:-1)};
  if(role==='feet'){const left=track===m.feet[0],pivot=back?(left?[0,-7]:[-3,-7]):(left?[1,-3]:[-5,-6]);return{rotation:a.feet*(left?1:-1),pivotX:pivot[0],pivotY:pivot[1]};}
  if(role==='tail')return{rotation:a.tail*a.dir,pivotX:0,pivotY:0};return null;
 }
 function headPoint(side,a,local){const back=side==='p1',state=root.ROM_SPRITE_ANIM?.cache['504-'+(back?'back':'front')],b=state?.groundBounds,r=state?.data?.maps?.[0]?.find(v=>v[0]===0);if(!b||!r)return{x:a.dir*.25,y:-.72};const px=local[0]-2,py=local[1]-6,angle=a.head*a.dir,h=b[3]-b[1];return{x:(r[1]+2+px*Math.cos(angle)-py*Math.sin(angle)-(b[0]+b[2])/2)/h,y:(r[2]+6+px*Math.sin(angle)+py*Math.cos(angle)-b[3])/h};}
 function bideEvent(events,index){const e=events[index];if(!e||!/(?:^|\s)Bide$/.test(e.args?.[0]||'')||e.args.includes('[silent]'))return null;if(e.kind==='-activate')return{phase:0,storing:true,miss:false};if(e.kind!=='-end')return null;let miss=false;for(let i=index+1;i<events.length;i++){if(['move','turn','cant'].includes(events[i].kind))break;if(['-fail','-immune','-miss','-notarget'].includes(events[i].kind))miss=true;}return{phase:1,storing:false,miss};}
 const stances=new Set();
 function setStance(side,on,id=504){on&&+id===504?stances.add(side):stances.delete(side);}
 function clearStances(){stances.clear();}
 function idlePose(side,id){return root.NativeSettings?.state?.animations!==false&&+id===504&&stances.has(side)?sample(bide.store,26+(performance.now()*.06)%40,side):null;}
 function applyStance(side,pose,attacking=false){const a=!attacking&&idlePose(side,504);return a?{...pose,scaleY:(pose.scaleY??1)*(1-a.crouch),scaleX:(pose.scaleX??1)*(1+a.crouch*.4),pauseAnimation:true}:pose;}
 function draw(c,W,H,x,f,layer){
  const p=x.profile,a=sample(p,f,x.side,x.miss),layout=root.BattleGround.layout(W,H),from=layout[x.side],to=layout[x.targetSide],s=Math.min(W/1000,H/650),th=to.height;
  const attach=(tick,u,v)=>{const q=root.SpeciesMoves.pose(p,tick,x.side,x.side,x.miss,layout),h=from.height*q.scale,px=u*h*q.scaleX,py=v*h*q.scaleY;return{x:from.x+q.x*s+px*Math.cos(q.rotation)-py*Math.sin(q.rotation),y:from.y+q.y*s+px*Math.sin(q.rotation)+py*Math.cos(q.rotation)}};
  const target={x:to.x,y:to.y-th*(x.miss?1.8:.55)};c.save();c.lineCap='round';
  if(p.id===117&&p.kind!=='release'&&a.aura>0){const center=attach(f,0,-.45);c.globalAlpha=a.aura*.42;c.strokeStyle='#dc9c62';c.lineWidth=Math.max(1,from.height*.012);if(layer==='back')for(let n=0;n<3;n++){const u=(f/58+n/3)%1,r=from.height*(.28+u*.17);c.globalAlpha=a.aura*(1-u)*.55;c.beginPath();c.ellipse(center.x,center.y,r,r*1.15,0,0,Math.PI*2);c.stroke();}if(layer==='front'){for(let n=0;n<9;n++){const u=(f/45+n/9)%1,angle=n*2.4,r=from.height*(.55-u*.35);c.fillStyle='#ffe4a0';c.globalAlpha=a.aura*Math.sin(u*Math.PI);c.fillRect(center.x+Math.cos(angle)*r,center.y+Math.sin(angle)*r,Math.max(1,from.height*.018),Math.max(1,from.height*.018));}}}
  if(layer!=='front'){c.restore();return;}
  if(p.id===43&&a.glare>0){const points=x.side==='p1'?[[12,-5]]:[[-6,-5],[5,-7]];c.globalAlpha=a.glare;for(const local of points){const eye=headPoint(x.side,a,local),o=attach(f,eye.x,eye.y),r=from.height*.055;c.shadowColor='#ffc658';c.shadowBlur=r;c.strokeStyle='#fff1ad';c.lineWidth=Math.max(1,r*.25);c.beginPath();c.moveTo(o.x-r,o.y);c.lineTo(o.x+r,o.y);c.moveTo(o.x,o.y-r*.6);c.lineTo(o.x,o.y+r*.6);c.stroke();}}
  if(p.id===44){const point=headPoint(x.side,a,x.side==='p1'?[13,1]:[-5,3]),mouth=attach(f,point.x,point.y),open=a.jaw/1.45;if(open>.15){c.globalAlpha=open*.65;c.strokeStyle='#f3ddb0';c.lineWidth=Math.max(1,from.height*.012);c.beginPath();c.arc(mouth.x,mouth.y,from.height*(.035+.025*open),-.9,1.1);c.stroke();}}
  if([33,44].includes(p.id)&&!x.miss){const q=1-Math.abs(f-p.impact)/9;if(q>0){c.globalAlpha=q;c.strokeStyle=p.id===44?'#f9edcb':'#ffe3a6';c.lineWidth=Math.max(2,th*.022);for(let n=0;n<8;n++){const angle=n*Math.PI/4;c.beginPath();c.moveTo(target.x+Math.cos(angle)*th*.09,target.y+Math.sin(angle)*th*.09);c.lineTo(target.x+Math.cos(angle)*th*.24,target.y+Math.sin(angle)*th*.24);c.stroke();}if(p.id===44){c.fillStyle='#fff1d7';for(const n of [-1,1]){c.beginPath();c.moveTo(target.x+n*th*.09,target.y-th*.1);c.lineTo(target.x+n*th*.025,target.y);c.lineTo(target.x+n*th*.14,target.y-th*.02);c.closePath();c.fill();}}}}
  if(p.id===117&&p.kind==='release'){
   const u=clamp((f-28)/(p.impact-28));if(!x.miss&&f>=28&&f<p.impact+13){const start=attach(28,0,-.43),q=1-ease((f-p.impact)/13),cx=mix(start.x,target.x,u),cy=mix(start.y,target.y,u);c.globalAlpha=q*.7;c.strokeStyle='#f5c277';c.lineWidth=Math.max(2,th*.025);for(let n=0;n<3;n++){const r=th*(.12+n*.055);c.beginPath();c.ellipse(cx-a.dir*n*th*.12,cy,r*.5,r,0,0,Math.PI*2);c.stroke();}}
   if(x.miss&&f>=28&&f<76){const q=1-(f-28)/48,start=attach(f,0,-.43);c.globalAlpha=q*.45;c.strokeStyle='#c9ad82';c.lineWidth=Math.max(1,from.height*.012);c.beginPath();c.ellipse(start.x,start.y,from.height*.2*q,from.height*.25*q,0,0,Math.PI*2);c.stroke();}
   if(!x.miss&&f>=p.impact&&f<p.impact+26){const age=f-p.impact,q=1-age/26;c.globalAlpha=q;c.strokeStyle='#ffe4a0';c.lineWidth=Math.max(1,th*.024);c.beginPath();c.ellipse(target.x,target.y,th*(.1+age*.012),th*(.15+age*.012),0,0,Math.PI*2);c.stroke();for(let n=0;n<10;n++){const angle=n*2.4,r=age*th*.017;c.fillStyle='#ffd793';c.fillRect(target.x+Math.cos(angle)*r,target.y+Math.sin(angle)*r,Math.max(1,q*th*.025),Math.max(1,q*th*.025));}}
  }c.restore();
 }
 const api={profiles,bide,tracks,select,sample,part,headPoint,bideEvent,draw,setStance,clearStances,idlePose,applyStance};root.PatratMoves=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

