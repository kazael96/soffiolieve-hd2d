/* Anatomical HD-2D adaptations; original composite textures, native effects and SFX remain active. */
(function(root){
 const C=root.ChapterMoves,oldSample=C.sample,oldDraw=C.draw,oldSelect=C.select;
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
 Object.assign(C.rigs,{
  519:{name:'Pidove',head:.15,arms:.9,tail:.35,feet:.2,lean:.1,crouch:.08,step:12,reach:.78,mouth:[.27,-.7],hand:[.27,-.49],leaf:[-.24,-.23]},
  522:{name:'Blitzle',head:.14,arms:0,tail:.48,feet:.35,lean:.12,crouch:.1,step:18,reach:.87,mouth:[.24,-.73],hand:[.25,-.16],leaf:[-.27,-.4]},
  524:{name:'Roggenrola',head:0,arms:0,tail:0,feet:.16,lean:.14,crouch:.04,step:8,reach:.7,mouth:[.05,-.57],hand:[.19,-.08],leaf:[0,-.85]},
  527:{name:'Woobat',head:.1,arms:1.05,tail:0,feet:0,lean:.09,crouch:.045,step:14,reach:.76,mouth:[.18,-.45],hand:[.35,-.48],leaf:[0,-.77]},
  532:{name:'Timburr',head:.13,arms:.85,tail:0,feet:.22,lean:.13,crouch:.085,step:10,reach:.74,mouth:[.18,-.68],hand:[.3,-.46],leaf:[-.23,-.51]},
  535:{name:'Tympole',head:0,arms:0,tail:.85,feet:0,lean:.08,crouch:.12,step:8,reach:.58,mouth:[.26,-.43],hand:[.1,-.24],leaf:[-.3,-.36]}
 });
 const entries={
  519:[[16,'Raffica','gust'],[45,'Ruggito','roar'],[43,'Fulmisguardo','meanLook'],[98,'Att. Rapido','quick'],[314,'Aerasoio','airCut'],[526,'Cuordileone','rally']],
  522:[[98,'Att. Rapido','quick'],[39,'Colpocoda','tailPound'],[268,'Sottocarica','charge'],[351,'Ondashock','electricWave'],[86,'Tuononda','electricWave']],
  524:[[33,'Azione','bodyRam'],[106,'Rafforzatore','harden'],[28,'Turbosabbia','sandKick'],[29,'Bottintesta','headRam'],[350,'Cadutamassi','rockVolley']],
  527:[[93,'Confusione','psywave'],[316,'Segugio','watch'],[16,'Raffica','gust'],[372,'Garanzia','ambush'],[531,'Cuorestampo','heartDive'],[168,'Furto','thief']],
  532:[[1,'Botta','timberPalm'],[43,'Fulmisguardo','meanLook'],[116,'Focalenergia','focus'],[117,'Pazienza','bide'],[67,'Colpo Basso','lowKick']],
  535:[[145,'Bolla','bubbles'],[45,'Ruggito','roar'],[48,'Supersuono','soundWave'],[496,'Coro','chorus'],[61,'Bollaraggio','bubbles']]
 };
 for(const sid of [509,511,513,515])entries[sid]=[[168,'Furto','thief']];
 const status=new Set([39,43,45,86,106,116,268,316,526,48]);
 for(const [sid,list]of Object.entries(entries)){
  if(+sid>=519)list.push([165,'Scontro','struggle']);
  for(const [id,name,kind]of list){const self=[106,116,117,268,526].includes(id),frames=id===98?86:id===117?160:126;
   C.profiles[sid+'-'+id]={species:+sid,id,name,kind,chapter:true,nativeEffects:true,key:'route3-'+sid+'-'+id,frames,impact:Math.round(frames*.47),attachment:+sid===522&&id===39?'leaf':+sid===532?'hand':+sid===524?'leaf':'mouth',target:self?'self':'foe',damage:!status.has(id),color:+sid===522?'#ffea80':+sid===524?'#c1a77d':+sid===527?'#e0b1fa':+sid===535?'#8ce5ff':'#e9f2ff'};
  }
 }
 C.select=(sid,id,context={})=>{const p=oldSelect(sid,id,context);if(+sid===532&&+id===117&&p)return {...p,frames:context.phase===1?144:context.storing?96:192,impact:context.phase===1?67:context.storing?46:48,phase:context.phase===1?1:0,storing:!!context.storing,target:context.phase===1?'foe':'self'};return p;};
 C.sample=function(p,f,side='p1',miss=false){if(!p.key.startsWith('route3-'))return oldSample(p,f,side,miss);
  const a=root.DemoMoves.sample(p,f,side,miss),r=C.rigs[p.species]||root.DemoMoves.rigs[p.species],t=a.t,w=a.wind,beat=Math.sin(t*Math.PI*r.step),surge=ease((t-.2)/.24)*(1-ease((t-.54)/.36));
  if(['quick','thief','heartDive','timberPalm','lowKick'].includes(p.kind)){a.reach=r.reach*surge*(miss?.65:1);a.lean=r.lean*w;a.crouch=r.crouch*w;a.head=r.head*w;a.feet=r.feet*beat*surge;a.arms=r.arms*Math.sin(t*Math.PI*2)*w;a.tail=-r.tail*w;a.lift=p.kind==='heartDive'?.22*surge:p.species===519?.12*surge:.025*surge;}
  if(['gust','airCut'].includes(p.kind)){a.arms=r.arms*Math.sin(t*Math.PI*8)*w;a.lift=.12*w;a.lean=-r.lean*w;a.head=-r.head*w;a.tail=-r.tail*.6*w;}
  if(['electricWave','charge'].includes(p.kind)){a.head=-r.head*w;a.lean=-r.lean*w;a.tail=r.tail*Math.sin(t*Math.PI*4)*w;a.crouch=p.kind==='charge'?.1*w:.055*w;a.breath=.035*w;a.feet=.04*beat*w;}
  if(p.kind==='harden'){a.crouch=.065*w;a.lean=0;a.feet=-.1*w;a.glare=w;}
  if(p.kind==='rockVolley'){a.crouch=.1*w;a.lean=-.17*w;a.lift=.075*Math.max(0,Math.sin((t-.2)*Math.PI*4))*w;a.feet=r.feet*beat*w;}
  if(['bubbles','soundWave','chorus'].includes(p.kind)){a.breath=.09*Math.sin(t*Math.PI*4)*w;a.tail=r.tail*Math.sin(t*Math.PI*6)*w;a.crouch=-.07*w;a.lean=-.08*Math.sin(t*Math.PI*2)*w;a.head=-r.head*w;}
  if(p.kind==='bide'){a.crouch=.11*w;a.arms=-.45*w;a.head=-.08*w;a.breath=.025*Math.sin(f*.2)*w;if(p.phase===1){a.reach=.2*surge;a.arms=.9*surge;a.lean=.12*w;}}
  if(p.species===519){a.arms+=.28*Math.sin(t*Math.PI*6)*w;if(p.kind==='roar')a.head=-.2*w;}
  if(p.species===527){a.arms+=.6*Math.sin(t*Math.PI*10)*w;a.lift+=.06*w;if(p.kind==='psywave')a.glare=w;}
  if(p.species===524&&['bodyRam','headRam','struggle'].includes(p.kind)){a.lean=.27*Math.sin(t*Math.PI*2)*w;a.feet=.17*beat*w;}
  if(p.species===532&&p.kind==='lowKick'){a.feet=.55*surge;a.arms=-.6*w;a.lean=-.16*w;}
  return a;
 };
 C.draw=function(c,W,H,x,f,layer){const p=x.profile;if(!p.key.startsWith('route3-'))return oldDraw(c,W,H,x,f,layer);
  root.DemoMoves.draw(c,W,H,x,f,layer);if(layer!=='front')return;
  const a=C.sample(p,f,x.side,x.miss),l=root.BattleGround.layout(W,H),from=l[x.side],to=l[x.targetSide],body=root.SpeciesMoves.pose(p,f,x.side,x.side,x.miss,l),o=root.DemoMoves.attachment(p,a,from,body,x.side),h=from.height*body.scale;
  const travel=ease((f-p.impact+34)/38),tx=to.x+(x.miss?a.dir*to.height*.8:0),ty=to.y-to.height*.48;
  c.save();c.strokeStyle=p.color;c.fillStyle=p.color;c.lineWidth=Math.max(2,h*.015);c.lineCap='round';
  if(['gust','airCut','electricWave','bubbles','soundWave','chorus','rockVolley'].includes(p.kind))for(let i=0;i<7;i++){
   const q=(f-p.impact+38-i*5)/45;if(q<0||q>1)continue;const xx=o.x+(tx-o.x)*q,yy=o.y+(ty-o.y)*q+Math.sin(i*2.4)*h*.075;c.globalAlpha=Math.sin(Math.PI*q)*a.wind;c.beginPath();
   if(p.kind==='rockVolley'){const r=h*.04;c.moveTo(xx-r,yy);c.lineTo(xx-r*.4,yy-r);c.lineTo(xx+r*.7,yy-r*.6);c.lineTo(xx+r,yy+r*.5);c.lineTo(xx-r*.5,yy+r);c.closePath();c.fill();}
   else if(p.kind==='electricWave'){c.moveTo(xx-h*.09,yy-h*.08);c.lineTo(xx+h*.035,yy-h*.02);c.lineTo(xx-h*.025,yy+h*.03);c.lineTo(xx+h*.1,yy+h*.08);c.stroke();}
   else{c.ellipse(xx,yy,h*(p.kind==='bubbles'?.026:.07),h*(p.kind==='bubbles'?.026:.13),a.dir*.6,0,Math.PI*2);c.stroke();}
  }
  if(['charge','harden','bide'].includes(p.kind)){c.globalAlpha=a.wind*.6;c.beginPath();c.ellipse(from.x,from.y-h*.48,h*(.24+.025*Math.sin(f*.3)),h*.46,0,0,Math.PI*2);c.stroke();}
  if(p.kind==='heartDive'&&travel>0&&travel<1){c.globalAlpha=a.wind;c.font=Math.round(h*.15)+'px sans-serif';c.fillStyle='#f5a6cc';c.fillText('♥',o.x+(tx-o.x)*travel,o.y+(ty-o.y)*travel);}
  c.restore();
 };
 root.Route3Moves={entries,rigs:C.rigs};
})(typeof window!=='undefined'?window:globalThis);
