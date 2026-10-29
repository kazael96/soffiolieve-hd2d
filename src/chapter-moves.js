/* Authored HD-2D gestures fitted to the monkey trio and Munna's anatomy. */
(function(root){
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},rigs={
  511:{name:'Pansage',head:-.17,arms:.7,tail:.8,feet:.21,lean:-.11,crouch:.075,step:12,reach:.72,mouth:[.14,-.61],hand:[.23,-.4],leaf:[0,-.9]},
  513:{name:'Pansear',head:.22,arms:.58,tail:.7,feet:.23,lean:.13,crouch:.09,step:14,reach:.79,mouth:[.19,-.6],hand:[.24,-.38],leaf:[-.24,-.35]},
  515:{name:'Panpour',head:.12,arms:.66,tail:.85,feet:.2,lean:.09,crouch:.065,step:10,reach:.76,mouth:[.16,-.59],hand:[.22,-.39],leaf:[-.24,-.32]},
  518:{name:'Musharna',head:.08,arms:0,tail:.12,feet:0,lean:-.04,crouch:.04,step:4,reach:.42,mouth:[.3,-.5],hand:[.15,-.15],leaf:[-.22,-.6]},
  517:{name:'Munna',head:.05,arms:0,tail:0,feet:.08,lean:.055,crouch:.055,step:6,reach:.5,mouth:[.32,-.39],hand:[.22,-.15],leaf:[-.2,-.46]}
 };
 const entries={511:[[10,'Graffio','furySlash'],[43,'Fulmisguardo','meanLook'],[122,'Leccata','tongue'],[22,'Frustata','vineWhip'],[154,'Sfuriate','furySlash'],[526,'Cuordileone','rally'],[15,'Taglio','leafBlade']],513:[[10,'Graffio','furySlash'],[43,'Fulmisguardo','meanLook'],[122,'Leccata','tongue'],[510,'Bruciatutto','fireRing'],[154,'Sfuriate','furySlash'],[526,'Cuordileone','rally'],[15,'Taglio','leafBlade']],515:[[10,'Graffio','furySlash'],[43,'Fulmisguardo','meanLook'],[122,'Leccata','tongue'],[55,'Pistolacqua','waterPulse'],[154,'Sfuriate','furySlash'],[526,'Cuordileone','rally'],[15,'Taglio','leafBlade']],517:[[149,'Psiconda','psywave'],[111,'Ricciolscudo','curl'],[381,'Fortuncanto','chant'],[281,'Sbadiglio','yawn'],[60,'Psicoraggio','psybeam'],[286,'Esclusiva','seal']]};
 entries[518]=entries[517].map(v=>[...v]);
 for(const id of Object.keys(entries))entries[id].push([165,'Scontro','struggle']);
 const profiles={};for(const [sid,list]of Object.entries(entries))for(const [id,name,kind]of list){const self=['rally','curl','chant','seal'].includes(kind);profiles[sid+'-'+id]={species:+sid,id,name,kind,chapter:true,nativeEffects:true,key:'chapter-'+sid+'-'+id,frames:kind==='tongue'?124:kind==='psybeam'?146:116,impact:kind==='psybeam'?76:57,attachment:id===22?'leaf':['furySlash','leafBlade','struggle'].includes(kind)?'hand':'mouth',target:self?'self':'foe',damage:!self&&!['meanLook','yawn'].includes(kind),color:+sid===511?'#a4e96c':+sid===513?'#ff9b64':+sid===515?'#8bddfa':'#f0b5f3'};}
 // Newly available machines, with the previous species' own anatomical rig.
 for(const sid of [495,501,504,509])profiles[sid+'-15']={species:sid,id:15,name:'Taglio',kind:'leafBlade',chapter:true,nativeEffects:true,key:'chapter-'+sid+'-15',frames:110,impact:52,attachment:sid===495?'leaf':'hand',target:'foe',damage:true,color:'#e5ffc2'};
 function sample(p,f,side='p1',miss=false){const a=root.DemoMoves.sample(p,f,side,miss),r=rigs[p.species]||root.DemoMoves.rigs[p.species],t=a.t,w=a.wind;
  if(p.kind==='tongue'){a.head=r.head*w;a.lean=r.lean*w;a.crouch=-.035*w;a.reach=.12*w;}
  if(p.kind==='vineWhip'){a.head=-r.head*w;a.tail=.8*Math.sin(t*Math.PI*2)*w;a.arms=.6*w;a.lean=-.12*Math.sin(t*Math.PI*2)*w;}
  if(['psywave','psybeam','chant','seal','yawn'].includes(p.kind)){a.head=-r.head*w;a.lean=r.lean*Math.sin(t*Math.PI*2)*w;a.crouch=p.kind==='yawn'?-.13*w:-.055*w;a.breath=.06*w;a.glare=['psybeam','seal'].includes(p.kind)?w:0;a.lift=p.kind==='yawn'?0:.055*w;}
  return a;
 }
 function draw(c,W,H,x,f,layer){root.DemoMoves.draw(c,W,H,x,f,layer);if(layer!=='front')return;const p=x.profile;if(!['tongue','vineWhip','psywave','psybeam','chant','seal','yawn'].includes(p.kind))return;const a=sample(p,f,x.side,x.miss),l=root.BattleGround.layout(W,H),from=l[x.side],to=l[x.targetSide],body=root.SpeciesMoves.pose(p,f,x.side,x.side,x.miss,l),o=root.DemoMoves.attachment(p,a,from,body,x.side),h=from.height*body.scale,u=ease((f-p.impact+30)/30)*(1-ease((f-p.impact-5)/28)),target={x:to.x+(x.miss?a.dir*to.height*.8:0),y:to.y-to.height*.5};
  c.save();c.globalAlpha=a.wind;c.strokeStyle=p.color;c.fillStyle=p.color;c.lineCap='round';
  if(p.kind==='tongue'||p.kind==='vineWhip'){c.strokeStyle=p.kind==='tongue'?'#ed9caf':'#63b947';c.lineWidth=Math.max(2,h*(p.kind==='tongue'?.045:.022));for(const n of p.kind==='vineWhip'?[-1,1]:[1]){c.beginPath();c.moveTo(o.x,o.y);c.quadraticCurveTo((o.x+target.x)/2,o.y-n*h*.4*u,o.x+(target.x-o.x)*u,o.y+(target.y-o.y)*u);c.stroke();}}
  else{for(let i=0;i<4;i++){const q=(f-p.impact+34-i*7)/55;if(q<0||q>1)continue;const self=p.target==='self',xx=self?from.x:o.x+(target.x-o.x)*q,yy=self?from.y-h*.5:o.y+(target.y-o.y)*q;c.globalAlpha=a.wind*Math.sin(Math.PI*q);c.lineWidth=Math.max(2,h*.017);c.beginPath();c.ellipse(xx,yy,h*(.04+q*.19),h*(.045+q*.2),q*4,0,Math.PI*2);p.kind==='yawn'?c.fill():c.stroke();}}
  c.restore();
 }
 root.ChapterMoves={rigs,profiles,select:(sid,id)=>profiles[sid+'-'+id]||null,sample,draw};if(typeof module!=='undefined')module.exports=root.ChapterMoves;
})(typeof window!=='undefined'?window:globalThis);
