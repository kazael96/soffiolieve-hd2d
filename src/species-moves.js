/* Species-specific HD-2D choreography. ROM sprite parts and sounds are retained;
 * the poses and paths below are authored adaptations, not original DS animations. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,t)=>a+(b-a)*t;
 const profiles=Object.freeze(Object.fromEntries([
  [33,'Azione',84,38],[43,'Fulmisguardo',100,46],[22,'Frustata',108,51],[35,'Avvolgibotta',138,72]
 ].map(([id,name,frames,impact])=>[id,Object.freeze({species:495,id,name,frames,impact,key:'snivy-'+id})])));
 function select(species,id,context={}){const extra=root.ChapterMoves?.select(species,id,context)||root.DemoMoves?.select(species,id,context);if(extra)return extra;return +species===509?root.PurrloinMoves?.profiles[id]||null:+species===506?root.LillipupMoves?.profiles[id]||null:+species===504?root.PatratMoves?.select(id,context)||null:+species===501?root.OshawottMoves?.profiles[id]||null:+species===498?root.TepigMoves?.profiles[id]||null:+species===495?profiles[id]||null:null;}
 function sample(p,f,side='p1',miss=false){
  if(p.chapter)return root.ChapterMoves.sample(p,f,side,miss);
  if(p.nativeEffects)return root.DemoMoves.sample(p,f,side,miss);
  if(p.species===509)return root.PurrloinMoves.sample(p,f,side,miss);
  if(p.species===506)return root.LillipupMoves.sample(p,f,side,miss);
  if(p.species===504)return root.PatratMoves.sample(p,f,side,miss);
  if(p.species===501)return root.OshawottMoves.sample(p,f,side,miss);
  if(p.species===498)return root.TepigMoves.sample(p,f,side,miss);
  const t=clamp(f/p.frames),dir=side==='p1'?1:-1,recover=1-ease((t-.76)/.24),wind=ease(t/.22)*recover,hit=ease((t-.25)/.18)*recover;
  const a={species:495,t,dir,miss,wind,hit,lean:0,crouch:0,reach:0,lift:0,head:0,tail:0,arms:0,feet:0,coil:0,glare:0};
  if(p.id===33){a.crouch=.15*Math.sin(Math.PI*clamp(t/.32));a.reach=t<.23?-.08*ease(t/.23):t<.46?lerp(-.08,miss?.65:.83,ease((t-.23)/.23)):lerp(miss?.65:.83,0,ease((t-.46)/.42));a.lift=.12*Math.sin(Math.PI*clamp((t-.23)/.45));a.lean=-.22*hit;a.head=-.12*wind;a.tail=.42*wind;a.feet=.55*Math.sin(t*Math.PI*8)*hit;}
  if(p.id===43){a.lean=-.055*wind;a.head=-.23*wind;a.tail=.16*wind;a.crouch=-.035*wind;a.glare=ease((t-.25)/.15)*(1-ease((t-.64)/.18));}
  if(p.id===22){a.lean=Math.sin(t*Math.PI*2)*.14*wind;a.head=-.13*wind;a.tail=-.5*Math.sin(t*Math.PI*2)*wind;a.arms=.7*hit;a.crouch=.055*wind;}
  if(p.id===35){a.lean=.12*Math.sin(t*Math.PI*3)*wind;a.head=-.1*wind;a.tail=.65*Math.sin(t*Math.PI*2)*wind;a.arms=.45*wind;a.coil=ease((t-.28)/.24)*(1-ease((t-.75)/.2));a.crouch=.08*wind;}
  return a;
 }
 function pose(p,f,side,attacker,miss,layout){
  const a=sample(p,f,attacker,miss);if(side!==attacker){const q=!miss&&![39,316].includes(p.id)&&!(p.species===504&&(p.id===43||p.id===117&&p.phase!==1))?Math.sin(Math.PI*clamp((f-p.impact)/18)):0;return{x:a.dir*5*q,y:0,scale:1,alpha:1,rotation:p.id===35?.045*q:0};}
  const from=layout[attacker],to=layout[attacker==='p1'?'p2':'p1'],s=Math.min(from.w/1000,from.h/650);
  const out={x:(to.x-from.x)*a.reach/s,y:((to.y-from.y)*a.reach-from.height*a.lift)/s,groundY:(to.y-from.y)*a.reach/s,scale:lerp(1,to.height/from.height,Math.max(0,a.reach)),alpha:1,rotation:(a.roll||0)+a.lean*a.dir,scaleY:1-a.crouch,scaleX:1+a.crouch*.4,pauseAnimation:true,speciesPose:a};
  if(a.roll!==undefined){const b=root.ROM_SPRITE_ANIM?.cache[p.species+'-'+(attacker==='p1'?'back':'front')]?.groundBounds,aspect=b?(b[2]-b[0])/(b[3]-b[1]):.75,h=from.height*out.scale*out.scaleY,w=from.height*out.scale*out.scaleX*aspect,theta=a.roll;out.rotation=theta;out.x-=Math.sin(theta)*h*.5/s;out.y+=(Math.cos(theta)*h*.5-(Math.abs(Math.sin(theta))*w+Math.abs(Math.cos(theta))*h)*.5)/s;}
  return out;
 }
 // Track identities were checked against the original front/back Snivy composites.
 const tracks={front:{head:[0],body:[1],tail:[8,9],arms:[2,3],feet:[4,5]},back:{head:[0],body:[1],tail:[7,8],arms:[2,6],feet:[3,4]}};
 function part(track,back,a){if(!a)return null;if(root.ChapterMoves?.rigs[a.species])return null;if(a.species===572)return root.DemoMoves?.part(track,back,a)||null;if(a.species===509)return root.PurrloinMoves.part(track,back,a);if(a.species===506)return root.LillipupMoves.part(track,back,a);if(a.species===504)return root.PatratMoves.part(track,back,a);if(a.species===501)return root.OshawottMoves.part(track,back,a);if(a.species===498)return root.TepigMoves.part(track,back,a);const map=tracks[back?'back':'front'];let role=Object.keys(map).find(k=>map[k].includes(track)),sign=track%2?1:-1;
  if(role==='head')return{rotation:a.head*a.dir,y:-a.glare*.8};
  if(role==='tail')return{rotation:a.tail*a.dir,x:-a.wind*.8};
  if(role==='arms')return{rotation:a.arms*sign,y:-a.hit*.5};
  if(role==='feet')return{rotation:a.feet*sign};
  if(role==='body')return{rotation:a.lean*.25*a.dir};return null;
 }
 function timeline(sequence,p){if(p.species===504&&p.kind==='store'||p.id===117&&p.storing)return{...sequence,frames:p.frames,nativeFrames:sequence.frames,audio:[]};const sounds=sequence.audio.filter(e=>e.kind==='sfx'),anchor=(sounds.find(e=>e.target===16)||sounds[0])?.start||0;const map=t=>anchor>0&&t<=anchor?t/anchor*p.impact:p.impact+(t-anchor)/Math.max(1,sequence.frames-anchor)*(p.frames-p.impact);return{...sequence,frames:p.frames,nativeFrames:sequence.frames,nativeAnchor:anchor,customImpact:p.impact,audio:sequence.audio.map(e=>({...e,start:Math.max(0,Math.min(p.frames-1,map(e.start)))}))};}
 function draw(c,W,H,x,f,layer){
  if(x.profile.chapter)return root.ChapterMoves.draw(c,W,H,x,f,layer);
  if(x.profile.nativeEffects)return root.DemoMoves.draw(c,W,H,x,f,layer);
  if(x.profile.species===509)return root.PurrloinMoves.draw(c,W,H,x,f,layer);
  if(x.profile.species===506)return root.LillipupMoves.draw(c,W,H,x,f,layer);
  if(x.profile.species===504)return root.PatratMoves.draw(c,W,H,x,f,layer);
  if(x.profile.species===501)return root.OshawottMoves.draw(c,W,H,x,f,layer);
  if(x.profile.species===498)return root.TepigMoves.draw(c,W,H,x,f,layer);
  const p=x.profile,a=sample(p,f,x.side,x.miss),layout=root.BattleGround.layout(W,H),from=layout[x.side],to=layout[x.targetSide],body=pose(p,f,x.side,x.side,x.miss,layout),s=Math.min(W/1000,H/650),fh=from.height*body.scale,th=to.height;
  const anchor=(u,v)=>{let px=u*fh*(body.scaleX||1),py=v*fh*(body.scaleY||1),r=body.rotation;return{x:from.x+body.x*s+px*Math.cos(r)-py*Math.sin(r),y:from.y+body.y*s+px*Math.sin(r)+py*Math.cos(r)}};
  const target={x:to.x+(x.miss?a.dir*th*.85:0),y:to.y-th*.52};
  c.save();c.lineCap='round';c.lineJoin='round';
  const stroke=(path,width=3)=>{c.strokeStyle='#163c25';c.lineWidth=width+2;path();c.stroke();c.strokeStyle='#5aaf45';c.lineWidth=width;path();c.stroke();c.strokeStyle='#a2cf69';c.lineWidth=Math.max(1,width*.25);path();c.stroke();};
  if(p.id===22&&layer==='back'&&a.t>.19&&a.t<.88){const extend=ease((a.t-.19)/.25)*(1-ease((a.t-.65)/.23));for(let n of [-1,1]){let o=anchor(n*.12,-.52),end={x:lerp(o.x,target.x,extend),y:lerp(o.y,target.y+n*th*.12,extend)},bend=n*Math.sin(a.t*Math.PI*3)*fh*.65;stroke(()=>{c.beginPath();c.moveTo(o.x,o.y);c.bezierCurveTo(o.x+a.dir*fh*.6,o.y+bend,end.x-a.dir*th*.4,end.y+bend*.4,end.x,end.y);},Math.max(2,fh*.023));}}
  if(p.id===35&&a.t>.17&&a.t<.96){const ext=ease((a.t-.17)/.25),fade=1-ease((a.t-.79)/.17);c.globalAlpha=fade;for(let n=0;n<3;n++){const o=anchor((n%2?1:-1)*.12,-.5),cy=target.y+(n-1)*th*.22,r=th*(.48-a.coil*.13),h=th*.12;if(layer==='back')stroke(()=>{c.beginPath();c.moveTo(o.x,o.y);c.bezierCurveTo(o.x+a.dir*fh*.6,o.y-fh*.2,target.x-a.dir*r,cy,target.x-r*ext,cy);c.ellipse(target.x,cy,r*ext,h,0,Math.PI,Math.PI*2);},Math.max(2,fh*.018));if(layer==='front'&&!x.miss)stroke(()=>{c.beginPath();c.ellipse(target.x,cy,r*ext,h,0,0,Math.PI);},Math.max(2,fh*.018));}}
  if(layer==='front'&&p.id===43&&a.glare>0){const eye=anchor(a.dir*.14,-.82);c.globalAlpha=a.glare;c.shadowColor='#e9ff91';c.shadowBlur=8;for(let k of [-1,1]){const ex=eye.x+k*fh*.07;c.strokeStyle='#fff4b2';c.lineWidth=2;c.beginPath();c.moveTo(ex-fh*.08,eye.y);c.lineTo(ex+fh*.08,eye.y);c.moveTo(ex,eye.y-fh*.045);c.lineTo(ex,eye.y+fh*.045);c.stroke();}if(!x.miss){const q=ease((a.t-.32)/.25);c.shadowBlur=0;c.strokeStyle='rgba(230,243,156,.45)';c.lineWidth=1;for(let k of [-1,1]){c.beginPath();c.moveTo(eye.x,eye.y+k*fh*.03);c.lineTo(lerp(eye.x,target.x,q),lerp(eye.y,target.y+k*th*.14,q));c.stroke();}}}
  if(layer==='front'&&[33,22].includes(p.id)&&!x.miss){let q=1-Math.abs(f-p.impact)/9;if(q>0){c.globalAlpha=q;c.strokeStyle=p.id===22?'#e3ffc1':'#fff2b5';c.lineWidth=Math.max(2,th*.025);for(let i=0;i<8;i++){let r=i*Math.PI/4;c.beginPath();c.moveTo(target.x+Math.cos(r)*th*.12,target.y+Math.sin(r)*th*.12);c.lineTo(target.x+Math.cos(r)*th*.29,target.y+Math.sin(r)*th*.29);c.stroke();}}}
  c.restore();
 }
 const api={profiles,select,sample,pose,part,timeline,draw,tracks};root.SpeciesMoves=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
