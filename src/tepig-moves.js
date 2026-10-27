/* Tepig's authored HD-2D rig: original composite parts, species-specific poses. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
 const profiles=Object.freeze(Object.fromEntries([[33,'Azione',90,41],[39,'Colpocoda',108,51],[52,'Braciere',120,65],[316,'Segugio',132,75]].map(([id,name,frames,impact])=>[id,Object.freeze({species:498,id,name,frames,impact,key:'tepig-'+id})])));
 const tracks=Object.freeze({front:{head:[0],body:[1],ears:[2,3],feet:[4,5,6],tail:[7,8]},back:{head:[0],body:[1],ears:[2,3],feet:[4,5,6],tail:[7,8]}});
 function sample(p,f,side='p1',miss=false){
  const t=clamp(f/p.frames),dir=side==='p1'?1:-1,recover=1-ease((t-.77)/.23),wind=ease(t/.2)*recover,hit=ease((t-.26)/.17)*recover;
  const a={species:498,t,dir,miss,wind,hit,lean:0,crouch:0,reach:0,lift:0,head:0,tail:0,arms:0,feet:0,ears:0,breath:0,sniff:0,glare:0};
  if(p.id===33){a.crouch=.11*Math.sin(Math.PI*clamp(t/.31));a.reach=t<.22?-.055*ease(t/.22):t<.46?mix(-.055,miss?.57:.86,ease((t-.22)/.24)):mix(miss?.57:.86,0,ease((t-.46)/.43));a.lift=.035*Math.sin(Math.PI*clamp((t-.22)/.48));a.lean=.08*hit;a.head=.14*wind;a.ears=-.25*wind;a.tail=-.28*wind;a.feet=.3*Math.sin(t*Math.PI*12)*hit;}
  if(p.id===39){const wag=Math.sin((t-.2)*Math.PI*8)*wind;a.tail=1.05*wag;a.lean=-.065*wag;a.head=.08*wag;a.ears=.13*wag;a.crouch=.035*wind;a.feet=.05*wag;}
  if(p.id===52){const inhale=ease(t/.24)*(1-ease((t-.27)/.13)),exhale=ease((t-.29)/.08)*(1-ease((t-.62)/.19)),pulse=Math.sin(clamp((f-37)/24)*Math.PI*6)*Math.sin(clamp((f-37)/24)*Math.PI);a.breath=inhale*.1-exhale*.055;a.crouch=-inhale*.06+exhale*.065;a.head=-.17*inhale+.19*exhale+.045*pulse;a.ears=-.22*exhale;a.tail=.22*wind;a.lean=-.085*exhale-.018*pulse;}
  if(p.id===316){const sniff=(.5+.5*Math.sin((t-.18)*Math.PI*12))*ease((t-.15)/.12)*(1-ease((t-.7)/.15));a.sniff=sniff;a.head=.23*wind+.075*sniff;a.ears=.24*wind-.1*sniff;a.lean=.045*wind;a.crouch=.025*sniff;a.tail=.12*Math.sin(t*Math.PI*3)*wind;}
  return a;
 }
 function part(track,back,a){let role=Object.keys(tracks[back?'back':'front']).find(k=>tracks[back?'back':'front'][k].includes(track)),sign=track%2?1:-1;
  if(role==='head')return{rotation:a.head*a.dir,x:a.sniff*.5*a.dir,y:a.sniff*.65};
  // The tail cord and ball have the same original pivot: transform them together.
  if(role==='tail')return{rotation:a.tail*a.dir};
  if(role==='ears')return{rotation:(a.ears+sign*a.sniff*.09)*a.dir};
  if(role==='feet'){const pivot=(back?{4:[1,-4],5:[-2,-11],6:[-12,-12]}:{4:[0,-4],5:[-1,-3],6:[0,-11]})[track];return{rotation:a.feet*sign,pivotX:pivot[0],pivotY:pivot[1]};}
  if(role==='body')return{scaleX:1+a.breath,scaleY:1+a.breath*.35};return null;
 }
 function muzzle(side,a){
  const back=side==='p1',state=root.ROM_SPRITE_ANIM?.cache['498-'+(back?'back':'front')],b=state?.groundBounds,r=state?.data?.maps?.[0]?.find(v=>v[0]===0);
  if(!b||!r)return{x:a.dir*.38,y:-.45};
  const dx=back?14:-16,dy=back?-5:-4,angle=a.head*a.dir,h=b[3]-b[1];
  return{x:(r[1]+dx*Math.cos(angle)-dy*Math.sin(angle)+a.sniff*.5*a.dir-(b[0]+b[2])/2)/h,y:(r[2]+dx*Math.sin(angle)+dy*Math.cos(angle)+a.sniff*.65-b[3])/h};
 }
 function emberParticles(f,origin,target,height){
  const particles=[];
  for(let n=0;n<12;n++){const burst=Math.floor(n/4),launch=38+burst*7+(n%4)*.7,travel=27+(n%4)*1.1,age=f-launch,u=age/travel;if(age<0||u>1.18)continue;const start=origin(launch),k=clamp(u),spread=(n%4-1.5)*height*.055*Math.sin(k*Math.PI),px=mix(start.x,target.x,k),py=mix(start.y,target.y,k)+spread-height*.09*Math.sin(k*Math.PI),dx=target.x-start.x,dy=target.y-start.y;
   particles.push({n,launch,age,u,x:px,y:py,angle:Math.atan2(dy,dx),size:height*(.045+(n%3)*.009)*(1-Math.max(0,u-1)*5),alpha:Math.min(1,age/2,(1.18-u)*6)});
  }return particles;
 }
 function draw(c,W,H,x,f,layer){
  const p=x.profile,a=sample(p,f,x.side,x.miss),layout=root.BattleGround.layout(W,H),from=layout[x.side],to=layout[x.targetSide],body=root.SpeciesMoves.pose(p,f,x.side,x.side,x.miss,layout),s=Math.min(W/1000,H/650),h=from.height*body.scale;
  const anchor=(u,v)=>{const px=u*h*(body.scaleX||1),py=v*h*(body.scaleY||1),r=body.rotation;return{x:from.x+body.x*s+px*Math.cos(r)-py*Math.sin(r),y:from.y+body.y*s+px*Math.sin(r)+py*Math.cos(r)}};
  const nose=muzzle(x.side,a),o=anchor(nose.x,nose.y),target={x:to.x+(x.miss?a.dir*to.height*.9:0),y:to.y-to.height*.48};
  if(layer!=='front')return;c.save();c.lineCap='round';
  if(p.id===33&&!x.miss){const q=1-Math.abs(f-p.impact)/8;if(q>0){c.globalAlpha=q;c.strokeStyle='#ffdfac';c.lineWidth=Math.max(2,to.height*.025);for(let n=0;n<8;n++){let r=n*Math.PI/4;c.beginPath();c.moveTo(target.x+Math.cos(r)*to.height*.1,target.y+Math.sin(r)*to.height*.1);c.lineTo(target.x+Math.cos(r)*to.height*.28,target.y+Math.sin(r)*to.height*.28);c.stroke();}}}
  if(p.id===39&&a.t>.24&&a.t<.77){const q=Math.sin((a.t-.24)/.53*Math.PI),tail=anchor(-a.dir*.34,-.38);c.globalAlpha=q*.5;c.strokeStyle='#fae5bc';c.lineWidth=Math.max(1,h*.013);for(let n=0;n<2;n++){c.beginPath();c.ellipse(tail.x,tail.y,h*(.22+n*.09),h*.24,a.tail*.25,-1.1,1.1);c.stroke();}}
  if(p.id===52){
   // Each burst keeps the muzzle position at emission: moving the head cannot drag flying embers.
   const origin=tick=>{const v=sample(p,tick,x.side,x.miss),b=root.SpeciesMoves.pose(p,tick,x.side,x.side,x.miss,layout),m=muzzle(x.side,v),px=m.x*from.height*b.scale*b.scaleX,py=m.y*from.height*b.scale*b.scaleY;return{x:from.x+b.x*s+px*Math.cos(b.rotation)-py*Math.sin(b.rotation),y:from.y+b.y*s+px*Math.sin(b.rotation)+py*Math.cos(b.rotation)}};
   if(f>33&&f<63){const q=Math.sin((f-33)/30*Math.PI),r=h*.18,g=c.createRadialGradient(o.x,o.y,0,o.x,o.y,r);g.addColorStop(0,'rgba(255,175,57,'+q*.3+')');g.addColorStop(1,'rgba(255,112,30,0)');c.fillStyle=g;c.fillRect(o.x-r,o.y-r,r*2,r*2);}
   for(const e of emberParticles(f,origin,target,to.height)){
    const r=Math.max(1,e.size),flicker=Math.sin(e.age*1.7+e.n)*.2;c.save();c.translate(e.x,e.y);c.rotate(e.angle+Math.sin(e.age*.9+e.n)*.15);c.globalAlpha=Math.max(0,e.alpha);c.shadowColor='#ff872b';c.shadowBlur=r*1.8;
    const flame=(length,width)=>{c.beginPath();c.moveTo(r*.9,0);c.lineTo(r*.25,-width);c.lineTo(-length*.4,-width*.7);c.lineTo(-length,-width*(.15+flicker));c.lineTo(-length*.65,width*.4);c.lineTo(-length*.9,width*.85);c.lineTo(-length*.2,width);c.closePath();c.fill();};
    c.fillStyle='#bd3c27';flame(r*2.8,r*1.5);c.fillStyle='#ff842b';flame(r*2.2,r*1.05);c.shadowBlur=0;c.fillStyle='#ffe99c';flame(r*1.3,r*.45);
    c.globalAlpha*=.6;c.fillStyle='#ffc45c';c.fillRect(-r*(3+e.n%2),Math.sin(e.age)*r,r*.45,r*.45);c.restore();
   }
   if(!x.miss&&f>=p.impact&&f<p.impact+30){const age=f-p.impact,q=1-age/30;c.shadowBlur=0;
    if(age<7){c.globalAlpha=(1-age/7)*.75;c.fillStyle='#fff0ba';c.beginPath();c.ellipse(target.x,target.y,to.height*.15,to.height*.19,0,0,Math.PI*2);c.fill();}
    for(let n=0;n<14;n++){const angle=n*2.399,dist=age*to.height*.014*(.7+n%3*.2),px=target.x+Math.cos(angle)*dist,py=target.y+Math.sin(angle)*dist-age*to.height*.006;c.globalAlpha=q;c.fillStyle=n%3?'#ffad39':'#dd552b';c.fillRect(px,py,Math.max(1,q*to.height*.035),Math.max(2,q*to.height*.055));}
    for(let n=0;n<3;n++){c.globalAlpha=q*.15;c.fillStyle='#6c6861';c.beginPath();c.ellipse(target.x+(n-1)*to.height*.11,target.y-age*to.height*.013,to.height*(.06+age*.0018),to.height*(.08+age*.002),0,0,Math.PI*2);c.fill();}
   }
  }
  if(p.id===316&&a.t>.18&&a.t<.8){
   // Scent cues travel towards the nostrils. They do not strike or damage a target.
   for(let n=0;n<3;n++){let u=(a.t*4+n/3)%1,fade=Math.sin(u*Math.PI)*a.wind,near={x:mix(o.x+a.dir*h*.7,o.x,u),y:mix(o.y-h*.12,o.y,u)};c.globalAlpha=fade*.5;c.strokeStyle='#e6d5ae';c.lineWidth=Math.max(1,h*.012);c.beginPath();c.ellipse(near.x,near.y,h*.065*(1-u*.5),h*.1*(1-u*.5),-.25*a.dir,-1.5,1.5);c.stroke();}
   if(!x.miss&&f>p.impact-6&&f<p.impact+21){const q=1-Math.abs(f-p.impact-7)/14;c.globalAlpha=Math.max(0,q)*.55;c.strokeStyle='#d8c8a3';c.lineWidth=2;c.beginPath();c.ellipse(target.x,target.y,to.height*.44,to.height*.54,0,0,Math.PI*2);c.stroke();}
  }
  c.restore();
 }
 const api={profiles,tracks,sample,part,muzzle,draw,emberParticles};root.TepigMoves=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
