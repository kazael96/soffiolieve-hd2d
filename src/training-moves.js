/* Level25 coverage. Each new species has its own body dimensions, emission points
 * and motion timings; native move effects/sounds continue underneath these poses. */
(()=>{
 const C=ChapterMoves,previousSelect=C.select,previousSample=C.sample,previousDraw=C.draw;
 const fitted={
  // head, arms, tail, feet, lean, crouch, step, reach, mouth, hand, leaf, recoil
  496:[-.14,.36,.94,.11,-.09,.045,8,.72,[.18,-.86],[.12,-.61],[-.24,-.34],.83],
  499:[.12,.92,.25,.2,.15,.095,12,.75,[.23,-.76],[.28,-.48],[-.22,-.26],.7],
  502:[.09,.87,.35,.21,.12,.065,10,.82,[.17,-.8],[.25,-.47],[-.17,-.25],.8],
  505:[-.12,.48,.78,.16,.08,.06,12,.79,[.17,-.83],[.18,-.55],[-.21,-.27],.92],
  507:[.11,0,.53,.32,.08,.075,16,.88,[.34,-.71],[.27,-.18],[-.3,-.39],.65],
  510:[-.1,.24,.91,.19,-.075,.06,14,.87,[.3,-.7],[.31,-.31],[-.28,-.38],.74],
  520:[.1,.98,.48,.17,.08,.055,12,.82,[.28,-.74],[.31,-.51],[-.25,-.25],.7],
  525:[0,.15,0,.11,.17,.025,6,.61,[.06,-.57],[.3,-.22],[0,-.91],.4],
  528:[.08,1.18,.58,0,.075,.035,16,.86,[.2,-.51],[.4,-.54],[-.24,-.4],.65],
  531:[.16,.61,.37,.17,.055,.085,8,.64,[.15,-.75],[.25,-.48],[-.2,-.29],.78],
  533:[.1,.96,0,.17,.11,.065,8,.68,[.14,-.72],[.33,-.5],[-.28,-.65],.7],
  536:[0,.42,.19,.32,.09,.1,10,.73,[.22,-.56],[.31,-.32],[-.22,-.21],.7],
  538:[.07,1.02,0,.16,.09,.07,8,.7,[.13,-.83],[.34,-.54],[-.17,-.28],.55],
  539:[.09,1.08,0,.29,.13,.05,12,.85,[.14,-.85],[.32,-.57],[-.17,-.24],.64],
  540:[.2,.08,.43,.24,.07,.11,16,.63,[.28,-.49],[.19,-.17],[-.17,-.78],.72],
  541:[.12,0,.22,.08,.04,.13,4,.35,[.15,-.55],[.18,-.29],[-.27,-.7],.55],
  542:[.13,1.2,.37,.22,.12,.055,10,.88,[.17,-.87],[.34,-.59],[-.22,-.42],.7],
  543:[.12,.06,.4,.36,.08,.1,20,.71,[.32,-.5],[.21,-.16],[-.31,-.31],.62],
  544:[0,0,.15,.08,.14,.025,6,.59,[.23,-.6],[.2,-.23],[-.19,-.46],.4],
  546:[.12,.1,.2,.09,.04,.085,6,.46,[.12,-.43],[.25,-.3],[-.23,-.63],.58],
  547:[.15,.5,.56,.2,.09,.065,10,.66,[.13,-.59],[.26,-.4],[-.26,-.78],.65],
  548:[.12,.06,0,.14,.055,.075,8,.51,[.15,-.59],[.18,-.32],[0,-.91],.62],
  551:[.13,.15,.6,.25,.1,.095,14,.81,[.36,-.52],[.25,-.23],[-.32,-.28],.72]
 };
 for(const [id,v]of Object.entries(fitted)){
  const [head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil]=v;
  C.rigs[id]={name:GEN5.species.find(p=>p.id===+id).en,head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil};
 }
 const recipes={
  1:'counterPalm',2:'karate',3:'palmFlurry',10:'furySlash',15:'leafBlade',16:'gust',20:'squeeze',21:'tailSlam',22:'vineWhip',24:'doubleKick',28:'sandKick',29:'headRam',33:'bodyRam',35:'squeeze',36:'bodyRam',39:'tailPound',40:'needle',43:'meanLook',44:'crunch',45:'roar',48:'soundWave',52:'flameJet',55:'waterPulse',60:'psybeam',61:'bubbles',67:'lowKick',68:'counterPalm',69:'throw',71:'drain',72:'drain',73:'seed',74:'grow',75:'leafBlade',77:'powder',78:'powder',79:'powder',81:'silk',86:'electricWave',88:'rockVolley',93:'psywave',95:'hypnosis',98:'quick',99:'rally',103:'soundWave',106:'harden',109:'psybeam',111:'curl',116:'focus',117:'bide',122:'tongue',123:'smoke',133:'focus',145:'bubbles',149:'psywave',154:'furySlash',162:'superFang',165:'struggle',168:'thief',178:'powder',182:'shellGuard',189:'mud',197:'watch',205:'roll',206:'leafBlade',207:'roar',209:'flameRush',210:'furySlash',213:'charm',228:'ambush',233:'throw',235:'restore',236:'restore',242:'crunch',249:'counterPalm',252:'counterPalm',253:'chorus',259:'roar',268:'charge',269:'roar',270:'encourage',274:'encourage',279:'counterPalm',281:'yawn',286:'seal',287:'restore',290:'bodyRam',292:'palmFlurry',314:'airCut',316:'watch',320:'chant',328:'sandKick',334:'harden',341:'mud',342:'tailSlam',345:'leafBlade',346:'shellGuard',350:'rockVolley',351:'electricWave',352:'waterPulse',355:'roost',358:'counterPalm',372:'ambush',373:'seal',381:'chant',392:'aquaRing',402:'seed',408:'psybeam',428:'headRam',447:'vineWhip',450:'crunch',468:'swordDance',479:'rockVolley',480:'throw',481:'fireRing',485:'psywave',488:'flameRush',490:'lowKick',494:'encourage',495:'bow',496:'chorus',498:'counterPalm',503:'waterPulse',510:'fireRing',514:'retaliate',522:'soundWave',526:'rally',531:'heartDive',534:'shellSlash',536:'leafVortex'
 };
 const colors={Erba:'#abdb75',Fuoco:'#ffad6a',Acqua:'#8bdded',Elettro:'#ffec86',Veleno:'#b98bd5',Psico:'#f5b5e6',Coleottero:'#c3db77',Roccia:'#c5b48f',Terra:'#cbb182',Lotta:'#eeb887',Buio:'#b3a1d5',Volante:'#cde9ef'};
 const pairs={};
 for(const [name,row]of Object.entries(TRAINING_DATA.progression)){
  pairs[name]=Training.moves(name);
  for(const id of pairs[name]){
   if(SpeciesMoves.select(row.id,id))continue;
   const m=GEN5.moves.find(m=>m.id===id),kind=recipes[id];if(!kind)throw Error('Coreografia non definita: '+name+' / '+id);
   if(!(C.rigs[row.id]||DemoMoves.rigs[row.id]))throw Error('Anatomia non definita: '+name);
   const self=[7,10,12].includes(m.target),frames=kind==='quick'?86:kind==='throw'?152:kind==='powder'?142:126;
   C.profiles[row.id+'-'+id]={species:row.id,id,name:m.name,kind,chapter:true,training:true,nativeEffects:true,key:'training-'+row.id+'-'+id,frames,impact:Math.round(frames*.48),attachment:/leaf|seed|vine|powder|silk/.test(kind)?'leaf':/Palm|palm|Slash|Blade|Kick|kick|throw|thief/.test(kind)?'hand':'mouth',target:self?'self':'foe',damage:m.category!==0,color:colors[m.type]||'#e5edf4'};
  }
 }
 C.select=(sid,id,context={})=>{
  const p=previousSelect(sid,id,context);if(!p?.training)return p;
  if(id===117)return {...p,phase:context.phase===1?1:0,storing:!!context.storing,target:context.phase===1?'foe':'self',frames:context.phase===1?160:126,impact:context.phase===1?49:60};
  return p;
 };
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 C.sample=function(p,f,side='p1',miss=false){
  if(!p.training)return previousSample(p,f,side,miss);
  const a=DemoMoves.sample(p,f,side,miss),r=C.rigs[p.species]||DemoMoves.rigs[p.species],t=a.t,w=a.wind,beat=Math.sin(t*Math.PI*r.step),surge=ease((t-.2)/.25)*(1-ease((t-.57)/.35)),k=p.kind;
  if(['gust','airCut','roost'].includes(k)){a.arms=r.arms*Math.sin(t*Math.PI*8)*w;a.lift=k==='roost'?0:.1*w;a.head=-r.head*w;a.crouch=k==='roost'?r.crouch*w:0;}
  if(['quick','thief','lowKick','doubleKick','karate','palmFlurry','throw','heartDive'].includes(k)){
   a.reach=r.reach*surge*(miss?.65:1);a.lean=r.lean*w;a.head=r.head*w;a.crouch=r.crouch*w;a.feet=r.feet*beat*surge;a.arms=r.arms*Math.sin(t*Math.PI*(k==='palmFlurry'?8:2))*w;a.tail=-r.tail*w;
   if(['lowKick','doubleKick'].includes(k)){a.feet=(k==='doubleKick'?.7:.5)*Math.sin((t-.2)*Math.PI*(k==='doubleKick'?4:2))*w;a.arms=-r.arms*.5*w;}
   if(k==='throw'){a.reach*=.66;a.arms=r.arms*Math.sin((t-.2)*Math.PI*2)*w;a.lean=-r.lean*w;}
  }
  if(['electricWave','charge','needle','powder','silk','mud','charm','psywave','psybeam','chant','seal','yawn','soundWave','chorus','bubbles','vineWhip','tongue'].includes(k)){
   a.head=-r.head*w;a.arms=r.arms*.55*Math.sin(t*Math.PI*2)*w;a.tail=r.tail*.55*Math.sin(t*Math.PI*4)*w;a.lean=-r.lean*w;a.breath=.05*Math.sin(t*Math.PI*4)*w;
   if(['powder','silk'].includes(k)){a.lean=r.lean*Math.sin(t*Math.PI*4)*w;a.tail=r.tail*Math.sin(t*Math.PI*6)*w;}
   if(['psywave','psybeam','seal','charm'].includes(k))a.glare=w;
  }
  if(['harden','restore','aquaRing'].includes(k)){a.crouch=k==='harden'?r.crouch*w:-.035*w;a.head=-r.head*w;a.arms=-r.arms*.3*w;a.breath=.05*w;a.glare=k==='harden'?w:0;}
  if(k==='bide'){a.crouch=r.crouch*w;a.head=-r.head*w;a.arms=-r.arms*.45*w;a.tail=-r.tail*.3*w;a.breath=.025*Math.sin(f*.2)*w;if(p.phase===1){a.reach=.22*surge;a.arms=r.arms*surge;}}
  if(p.species===496){a.tail+=.23*Math.sin(t*Math.PI*4)*w;a.lean+=.025*Math.sin(t*Math.PI*2)*w;}
  if(p.species===499&&p.damage){a.crouch+=.025*w;a.arms+=.15*Math.sin(t*Math.PI*2)*w;}
  if(p.species===502&&/Slash|Palm|palm/.test(k)){a.arms+=.24*Math.sin(t*Math.PI*4)*w;a.hip=.055*Math.sin(t*Math.PI*2)*w;}
  if(p.species===507){a.feet+=.11*beat*surge;a.head+=.035*w;}
  if(p.species===525||p.species===544){a.lean+=.12*Math.sin(t*Math.PI*2)*w;a.crouch*=.4;}
  if(p.species===528){a.arms+=.45*Math.sin(t*Math.PI*10)*w;a.lift+=.065*w;}
  if(p.species===533&&p.damage)a.arms+=.2*Math.sin(t*Math.PI*2)*w;
  if([540,543].includes(p.species))a.feet+=r.feet*beat*w;
  if(p.species===541)a.crouch+=.035*w;
  if(p.species===542)a.arms+=.3*Math.sin(t*Math.PI*4)*w;
  return a;
 };
 C.draw=function(c,W,H,x,f,layer){
  const p=x.profile;if(!p.training)return previousDraw(c,W,H,x,f,layer);
  DemoMoves.draw(c,W,H,x,f,layer);if(layer!=='front')return;
  const a=C.sample(p,f,x.side,x.miss),l=BattleGround.layout(W,H),from=l[x.side],to=l[x.targetSide],body=SpeciesMoves.pose(p,f,x.side,x.side,x.miss,l),o=DemoMoves.attachment(p,a,from,body,x.side),h=from.height*body.scale,k=p.kind;
  if(!['powder','silk','mud','needle','charm','aquaRing','restore','roost','psybeam','psywave','bubbles','soundWave','chorus','electricWave','rockVolley','vineWhip','tongue'].includes(k))return;
  c.save();c.lineWidth=Math.max(2,h*.018);c.strokeStyle=p.color;c.fillStyle=p.color;
  const target={x:to.x+(x.miss?a.dir*to.height*.8:0),y:to.y-to.height*.5};
  if(['restore','roost','aquaRing'].includes(k)){c.globalAlpha=a.wind*.7;for(let i=0;i<3;i++){c.beginPath();c.ellipse(from.x,from.y-h*(.2+i*.22),h*(.23+.03*Math.sin(f*.1+i)),h*.07,f*.015,0,Math.PI*2);c.stroke();}}
  else if(['silk','vineWhip','tongue'].includes(k)){
   const q=ease((f-p.impact+28)/30)*(1-ease((f-p.impact-5)/25));c.globalAlpha=a.wind;c.beginPath();c.moveTo(o.x,o.y);c.quadraticCurveTo((o.x+target.x)/2,o.y-h*.2,o.x+(target.x-o.x)*q,o.y+(target.y-o.y)*q);c.stroke();
  }else for(let i=0;i<7;i++){
   const q=(f-p.impact+34-i*5)/56;if(q<0||q>1)continue;
   const xx=o.x+(target.x-o.x)*q,yy=o.y+(target.y-o.y)*q+Math.sin(q*8+i)*h*(k==='powder'?.12:.025);c.globalAlpha=Math.sin(Math.PI*q)*a.wind;
   c.beginPath();c.ellipse(xx,yy,h*(['psywave','soundWave','chorus','electricWave'].includes(k)?.045+q*.16:.025),h*(k==='needle'?.065:.025),a.dir*q*3,0,Math.PI*2);['mud','needle','powder'].includes(k)?c.fill():c.stroke();
  }
  c.restore();
 };
 window.TrainingMoves={pairs,fitted,recipes};
})();
