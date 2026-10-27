/* Oshawott HD-2D choreography using the original front/back composite parts. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
 const profiles=Object.freeze(Object.fromEntries([[33,'Azione',96,44],[39,'Colpocoda',112,53],[55,'Pistolacqua',126,68]].map(([id,name,frames,impact])=>[id,Object.freeze({species:501,id,name,frames,impact,key:'oshawott-'+id})])));
 const tracks=Object.freeze({front:{head:[0],body:[1],tail:[2],arms:[3,4],feet:[5,6]},back:{head:[0],body:[1],arms:[2,3],tail:[4],feet:[5,6]}});
 function sample(p,f,side='p1',miss=false){
  const t=clamp(f/p.frames),dir=side==='p1'?1:-1,wind=ease(t/.21)*(1-ease((t-.77)/.23)),hit=ease((t-.25)/.18)*(1-ease((t-.74)/.26));
  const a={species:501,t,dir,miss,wind,hit,lean:0,crouch:0,reach:0,lift:0,head:0,tail:0,arms:0,feet:0,hip:0,breath:0,cheeks:0};
  if(p.id===33){const run=ease((t-.21)/.1)*(1-ease((t-.57)/.2));a.crouch=.12*Math.sin(Math.PI*clamp(t/.31));a.reach=t<.22?-.07*ease(t/.22):t<.46?mix(-.07,miss?.58:.84,ease((t-.22)/.24)):mix(miss?.58:.84,0,ease((t-.46)/.44));a.lift=.07*Math.sin(Math.PI*clamp((t-.22)/.46));a.head=.13*wind;a.lean=.17*hit;a.arms=.42*wind+.18*Math.sin(t*Math.PI*10)*run;a.feet=.24*Math.sin(t*Math.PI*10)*run;a.tail=.24*wind;}
  if(p.id===39){const wag=Math.sin((t-.18)*Math.PI*6)*wind;a.tail=.78*wag;a.hip=.1*wag;a.lean=-.065*wag;a.head=.07*wag;a.arms=.13*wag;a.crouch=.035*wind;}
  if(p.id===55){const inhale=ease(t/.25)*(1-ease((t-.29)/.12)),spout=ease((f-35)/8)*(1-ease((f-73)/18)),pulse=Math.sin((f-40)*.45)*spout;a.breath=.055*inhale-.035*spout;a.cheeks=.035*inhale;a.crouch=-.045*inhale+.055*spout;a.head=-.11*inhale+.09*spout+.014*pulse;a.lean=-.065*spout;a.arms=.32*spout+.07*inhale;a.tail=-.22*spout;a.hip=-.025*spout;}
  return a;
 }
 function part(track,back,a){const map=tracks[back?'back':'front'],role=Object.keys(map).find(k=>map[k].includes(track)),sign=track%2?1:-1;
  if(role==='head')return{pivotX:0,pivotY:8,rotation:a.head*a.dir,scaleX:1+a.cheeks,scaleY:1+a.cheeks*.2};
  if(role==='body')return{rotation:a.hip*a.dir,scaleX:1+a.breath,scaleY:1+a.breath*.4};
  if(role==='arms')return{rotation:a.arms*sign,pivotX:0,pivotY:0};
  if(role==='tail')return{rotation:a.tail*a.dir,pivotX:0,pivotY:back?-1:-2};
  if(role==='feet')return{rotation:a.feet*sign,pivotX:back&&track===5?-2:0,pivotY:track===5?-3:-4};return null;
 }
 function mouth(side,a){
  const back=side==='p1',state=root.ROM_SPRITE_ANIM?.cache['501-'+(back?'back':'front')],b=state?.groundBounds,r=state?.data?.maps?.[0]?.find(v=>v[0]===0);
  if(!b||!r)return{x:back?.31:-.05,y:-.59};
  // Front: below the nose. Back: the far cheek, where the mouth is occluded.
  const px=(back?13:-2)*(1+a.cheeks),py=((back?2:4)-8)*(1+a.cheeks*.2),angle=a.head*a.dir,h=b[3]-b[1];
  return{x:(r[1]+px*Math.cos(angle)-py*Math.sin(angle)-(b[0]+b[2])/2)/h,y:(r[2]+8+px*Math.sin(angle)+py*Math.cos(angle)-b[3])/h};
 }
 function waterPackets(f,origin,target,height){const list=[];
  for(let n=0;n<17;n++){const launch=40+n*1.8,age=f-launch,u=age/28;if(age<0||u>1)continue;const o=origin(launch),bend=Math.sin(u*Math.PI);list.push({n,launch,age,u,x:mix(o.x,target.x,u),y:mix(o.y,target.y,u)-height*.035*bend+Math.sin(age*.4+n)*height*.012*bend,r:height*(.033+.007*Math.sin(age*.8+n)),alpha:Math.min(1,age/2)});}
  return list;
 }
 function aim(to,miss){return{x:to.x,y:to.y-to.height*(miss?1.85:.55)};}
 function draw(c,W,H,x,f,layer){
  if(layer!=='front')return;const p=x.profile,a=sample(p,f,x.side,x.miss),layout=root.BattleGround.layout(W,H),from=layout[x.side],to=layout[x.targetSide],s=Math.min(W/1000,H/650),th=to.height;
  const attachment=(tick,u,v)=>{const b=root.SpeciesMoves.pose(p,tick,x.side,x.side,x.miss,layout),h=from.height*b.scale,px=u*h*b.scaleX,py=v*h*b.scaleY;return{x:from.x+b.x*s+px*Math.cos(b.rotation)-py*Math.sin(b.rotation),y:from.y+b.y*s+px*Math.sin(b.rotation)+py*Math.cos(b.rotation)}};
  const target=aim(to,x.miss);c.save();c.lineCap='round';c.lineJoin='round';
  if(p.id===33&&!x.miss){const q=1-Math.abs(f-p.impact)/8;if(q>0){c.globalAlpha=q;c.strokeStyle='#fff0c5';c.lineWidth=Math.max(2,th*.025);for(let n=0;n<8;n++){const angle=n*Math.PI/4;c.beginPath();c.moveTo(target.x+Math.cos(angle)*th*.1,target.y+Math.sin(angle)*th*.1);c.lineTo(target.x+Math.cos(angle)*th*.27,target.y+Math.sin(angle)*th*.27);c.stroke();}}}
  if(p.id===39&&a.t>.2&&a.t<.8){const tail=attachment(f,-a.dir*.23,-.23),q=Math.sin((a.t-.2)/.6*Math.PI);c.globalAlpha=q*.55;c.strokeStyle='#a8d9e4';c.lineWidth=Math.max(1,from.height*.012);for(let n=0;n<2;n++){c.beginPath();c.ellipse(tail.x,tail.y,from.height*(.17+n*.065),from.height*.12,a.tail*.2,.3,2.5);c.stroke();}}
  if(p.id===55){
   const origin=tick=>{const pose=sample(p,tick,x.side,x.miss),m=mouth(x.side,pose);return attachment(tick,m.x,m.y)},packets=waterPackets(f,origin,target,th);
   // One flowing outline avoids the repeated end caps of separate tube segments.
   if(packets.length){const path=()=>{c.beginPath();packets.forEach((e,i)=>i?c.lineTo(e.x,e.y):c.moveTo(e.x,e.y));if(packets.length===1)c.lineTo(packets[0].x+.1,packets[0].y);};c.globalAlpha=Math.max(...packets.map(e=>e.alpha));for(const [color,width]of [['#438fb9',.085],['#79dbf3',.062],['#d3f8ff',.025]]){c.strokeStyle=color;c.lineWidth=Math.max(1,th*width);path();c.stroke();}}
   for(const e of packets)if(e.n%2===0){const dx=Math.sin(e.age*.5+e.n)*th*.055,dy=Math.cos(e.age*.4+e.n)*th*.04;c.globalAlpha=e.alpha*.7;c.fillStyle=e.n%3?'#9ae7f8':'#f0feff';c.beginPath();c.ellipse(e.x+dx,e.y+dy,e.r*.45,e.r*.75,-a.dir*.5,0,Math.PI*2);c.fill();}
   if(f>=40&&f<72){const m=origin(f);c.globalAlpha=.7;c.fillStyle='#d6f8ff';c.beginPath();c.ellipse(m.x,m.y,from.height*.035,from.height*.027,0,0,Math.PI*2);c.fill();}
   if(!x.miss&&f>=p.impact&&f<p.impact+38){const age=f-p.impact,q=1-age/38;c.globalAlpha=q*.6;c.strokeStyle='#c6f5ff';c.lineWidth=Math.max(1,th*.018);c.beginPath();c.ellipse(target.x,target.y,th*(.09+age*.0045),th*(.12+age*.0055),0,0,Math.PI*2);c.stroke();
    for(let n=0;n<13;n++){const angle=n*2.4,speed=th*(.009+n%3*.003),dx=Math.cos(angle)*age*speed,dy=Math.sin(angle)*age*speed-age*th*.011+age*age*th*.00027,r=Math.max(1,th*.026*q);c.globalAlpha=q;c.fillStyle=n%3?'#8cdef6':'#effeff';c.beginPath();c.ellipse(target.x+dx,target.y+dy,r*.7,r*1.3,angle,0,Math.PI*2);c.fill();}
   }
  }c.restore();
 }
 const api={profiles,tracks,sample,part,mouth,waterPackets,draw,aim};root.OshawottMoves=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
