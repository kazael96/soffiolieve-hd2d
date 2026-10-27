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
  if(p.id===52){const inhale=ease(t/.25)*(1-ease((t-.28)/.16)),exhale=ease((t-.28)/.12)*(1-ease((t-.66)/.18));a.breath=inhale*.08-exhale*.04;a.crouch=-inhale*.055+exhale*.045;a.head=-.11*inhale+.12*exhale;a.ears=-.12*exhale;a.tail=.18*wind;a.lean=-.055*exhale;}
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
  const dx=back?15:-21,dy=back?-1:-2,angle=a.head*a.dir,h=b[3]-b[1];
  return{x:(r[1]+dx*Math.cos(angle)-dy*Math.sin(angle)+a.sniff*.5*a.dir-(b[0]+b[2])/2)/h,y:(r[2]+dx*Math.sin(angle)+dy*Math.cos(angle)+a.sniff*.65-b[3])/h};
 }
 function draw(c,W,H,x,f,layer){
  const p=x.profile,a=sample(p,f,x.side,x.miss),layout=root.BattleGround.layout(W,H),from=layout[x.side],to=layout[x.targetSide],body=root.SpeciesMoves.pose(p,f,x.side,x.side,x.miss,layout),s=Math.min(W/1000,H/650),h=from.height*body.scale;
  const anchor=(u,v)=>{const px=u*h*(body.scaleX||1),py=v*h*(body.scaleY||1),r=body.rotation;return{x:from.x+body.x*s+px*Math.cos(r)-py*Math.sin(r),y:from.y+body.y*s+px*Math.sin(r)+py*Math.cos(r)}};
  const nose=muzzle(x.side,a),o=anchor(nose.x,nose.y),target={x:to.x+(x.miss?a.dir*to.height*.9:0),y:to.y-to.height*.48};
  if(layer!=='front')return;c.save();c.lineCap='round';
  if(p.id===33&&!x.miss){const q=1-Math.abs(f-p.impact)/8;if(q>0){c.globalAlpha=q;c.strokeStyle='#ffdfac';c.lineWidth=Math.max(2,to.height*.025);for(let n=0;n<8;n++){let r=n*Math.PI/4;c.beginPath();c.moveTo(target.x+Math.cos(r)*to.height*.1,target.y+Math.sin(r)*to.height*.1);c.lineTo(target.x+Math.cos(r)*to.height*.28,target.y+Math.sin(r)*to.height*.28);c.stroke();}}}
  if(p.id===39&&a.t>.24&&a.t<.77){const q=Math.sin((a.t-.24)/.53*Math.PI),tail=anchor(-a.dir*.34,-.38);c.globalAlpha=q*.5;c.strokeStyle='#fae5bc';c.lineWidth=Math.max(1,h*.013);for(let n=0;n<2;n++){c.beginPath();c.ellipse(tail.x,tail.y,h*(.22+n*.09),h*.24,a.tail*.25,-1.1,1.1);c.stroke();}}
  if(p.id===52){
   // A small burst of embers, not a continuous Flamethrower beam.
   for(let n=0;n<9;n++){const launch=34+n*2.6,travel=27,u=(f-launch)/travel;if(u<0||u>1.15)continue;const k=clamp(u),spread=Math.sin(k*Math.PI)*(n%3-1)*to.height*.12,px=mix(o.x,target.x,k),py=mix(o.y,target.y,k)+spread-Math.sin(k*Math.PI)*h*.13,r=Math.max(2,mix(h*.025,to.height*.045,k)*(1-Math.max(0,u-1)*6));c.globalAlpha=Math.min(1,(1.15-u)*5);c.shadowColor='#ff792f';c.shadowBlur=r*2;c.fillStyle='#d74b29';c.beginPath();c.ellipse(px,py,r*1.45,r*1.8,-a.dir*.5,0,Math.PI*2);c.fill();c.fillStyle='#ffad3c';c.beginPath();c.ellipse(px-a.dir*r*.2,py,r,r*1.3,0,0,Math.PI*2);c.fill();c.fillStyle='#ffe79b';c.fillRect(px-r*.35,py-r*.5,r*.7,r);}
   if(!x.miss&&f>=p.impact&&f<p.impact+19){let q=1-(f-p.impact)/19;c.shadowBlur=0;c.globalAlpha=q;for(let n=0;n<7;n++){let angle=n*Math.PI*2/7,r=(1-q)*to.height*.35;c.fillStyle=n%2?'#ffd16c':'#e65d31';c.fillRect(target.x+Math.cos(angle)*r,target.y+Math.sin(angle)*r,Math.max(2,q*to.height*.035),Math.max(2,q*to.height*.05));}}
  }
  if(p.id===316&&a.t>.18&&a.t<.8){
   // Scent cues travel towards the nostrils. They do not strike or damage a target.
   for(let n=0;n<3;n++){let u=(a.t*4+n/3)%1,fade=Math.sin(u*Math.PI)*a.wind,near={x:mix(o.x+a.dir*h*.7,o.x,u),y:mix(o.y-h*.12,o.y,u)};c.globalAlpha=fade*.5;c.strokeStyle='#e6d5ae';c.lineWidth=Math.max(1,h*.012);c.beginPath();c.ellipse(near.x,near.y,h*.065*(1-u*.5),h*.1*(1-u*.5),-.25*a.dir,-1.5,1.5);c.stroke();}
   if(!x.miss&&f>p.impact-6&&f<p.impact+21){const q=1-Math.abs(f-p.impact-7)/14;c.globalAlpha=Math.max(0,q)*.55;c.strokeStyle='#d8c8a3';c.lineWidth=2;c.beginPath();c.ellipse(target.x,target.y,to.height*.44,to.height*.54,0,0,Math.PI*2);c.stroke();}
  }
  c.restore();
 }
 const api={profiles,tracks,sample,part,muzzle,draw};root.TepigMoves=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
