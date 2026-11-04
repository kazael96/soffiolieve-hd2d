/* Adventure coverage through level35. Each new species has body dimensions, emission points
 * and motion timings; native move effects/sounds continue underneath these poses. */
(()=>{
 const C=ChapterMoves,previousSelect=C.select,previousSample=C.sample,previousDraw=C.draw;
 const fitted={
  508:[.08,0,.82,.28,.09,.045,14,.78,[.35,-.67],[.29,-.13],[-.34,-.35],.54],
  521:[.09,1.24,.66,.16,.07,.04,16,.9,[.15,-.85],[.32,-.52],[-.26,-.28],.62],
  529:[.12,1.12,.16,.2,.14,.12,18,.74,[.19,-.53],[.44,-.54],[-.25,-.25],.73],
  530:[.08,1.31,.14,.22,.17,.07,14,.88,[.21,-.68],[.43,-.58],[-.27,-.28],.51],
  549:[.05,.78,.23,.13,.035,.055,10,.58,[.06,-.66],[.34,-.45],[.02,-.97],.69],
  555:[.17,1.38,0,.18,.18,.15,10,.91,[.21,-.55],[.41,-.29],[-.2,-.51],.45],
  564:[.14,.67,.27,.13,.065,.055,12,.62,[.3,-.37],[.38,-.31],[-.25,-.37],.42],
  566:[.22,1.02,.96,.31,.12,.09,20,.83,[.28,-.62],[.35,-.45],[-.31,-.39],.75],
  575:[.07,.64,0,.14,.04,.055,10,.54,[.07,-.76],[.27,-.5],[0,-.91],.64],
  581:[.1,1.32,.51,.23,.09,.05,16,.95,[.17,-.9],[.4,-.49],[-.26,-.24],.6],
  582:[.09,.21,.26,0,.04,.03,10,.44,[.05,-.5],[.17,-.32],[0,-.94],.73],
  583:[.065,.24,.31,0,.045,.025,8,.48,[.03,-.67],[.21,-.4],[0,-.98],.59],
  585:[.17,0,.21,.39,.09,.085,22,.9,[.23,-.7],[.29,-.13],[.03,-.95],.78],
  586:[.1,0,.42,.35,.085,.045,18,.96,[.23,-.73],[.26,-.12],[.02,-.98],.5],
  588:[.16,.28,0,.18,.09,.1,14,.69,[.16,-.48],[.24,-.28],[.02,-.94],.66],
  590:[.04,0,0,.09,.055,.08,6,.42,[.04,-.4],[.1,-.16],[0,-.81],.59],
  592:[.08,.93,.74,0,.045,.025,10,.56,[.05,-.77],[.38,-.32],[-.27,-.2],.48],
  595:[.1,.18,.12,.48,.085,.1,28,.71,[.26,-.39],[.34,-.27],[-.3,-.32],.87],
  597:[0,0,0,0,.065,.04,6,.38,[.01,-.52],[.22,-.43],[0,-.89],.32],
  599:[0,.16,0,0,.045,.025,12,.47,[.05,-.5],[.25,-.38],[-.27,-.77],.3],
  602:[.12,0,1.28,0,.08,.025,18,.72,[.4,-.4],[.04,-.42],[-.34,-.4],.68],
  523:[.085,0,.72,.39,.12,.06,20,.94,[.34,-.8],[.33,-.23],[-.3,-.57],.64],
  545:[.07,.12,.7,.46,.14,.045,24,.89,[.28,-.7],[.34,-.42],[-.34,-.64],.49],
  552:[.17,.48,.86,.29,.13,.085,16,.87,[.32,-.79],[.37,-.55],[-.31,-.3],.7],
  561:[.035,1.27,.14,0,.055,.025,18,.67,[.11,-.56],[.48,-.51],[0,-.94],.56],
  572:[.14,.81,1.08,.22,.095,.08,16,.8,[.17,-.67],[.27,-.49],[-.3,-.33],.81],
  573:[.1,.68,1.29,.17,.075,.065,14,.77,[.19,-.7],[.28,-.5],[-.33,-.28],.75],
  574:[.09,.58,0,.13,.045,.07,8,.5,[.11,-.74],[.25,-.45],[0,-.9],.72],
  580:[.16,1.04,.43,.25,.11,.075,18,.83,[.35,-.73],[.38,-.55],[-.22,-.31],.68],
  587:[.14,1.16,.91,.2,.08,.065,20,.93,[.2,-.65],[.39,-.47],[-.3,-.31],.78],
  550:[.12,.25,1.1,0,.08,.035,16,.83,[.36,-.52],[.25,-.44],[-.29,-.31],.55],
  554:[.2,.68,0,.27,.14,.12,12,.66,[.22,-.6],[.3,-.5],[-.2,-.5],.72],
  559:[.17,.83,.38,.29,.1,.07,14,.78,[.2,-.72],[.33,-.44],[-.21,-.34],.77],
  568:[.06,1.08,0,.13,.055,.11,8,.71,[.14,-.55],[.42,-.44],[-.18,-.25],.58],
  512:[.12,1.03,.83,.21,.11,.07,12,.86,[.18,-.81],[.36,-.5],[-.19,-.87],.74],
  514:[.17,.92,.9,.18,.14,.075,10,.79,[.2,-.78],[.3,-.45],[-.26,-.32],.69],
  516:[.1,1.1,1.02,.24,.08,.06,14,.9,[.16,-.83],[.33,-.54],[-.21,-.28],.77],
  557:[.07,.72,0,.36,.045,.12,18,.53,[.28,-.29],[.34,-.23],[-.1,-.72],.43],
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
  C.rigs[id]={name:GEN5.species.find(p=>p.id===+id).en,head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,ground:[0,0],recoil};
 }
 C.rigs[699]=C.rigs[550];
 const recipes={7:'firePalm',278:'restore',263:'bodyRam',491:'sludgeJet',91:'burrow',124:'sludgeJet',139:'smoke',254:'grow',256:'restore',280:'karate',371:'ambush',390:'poisonTrap',424:'flameBite',453:'waterRush',110:'shellGuard',148:'electricWave',185:'ambush',397:'harden',446:'rockVolley',
  1:'counterPalm',2:'karate',3:'palmFlurry',10:'furySlash',15:'leafBlade',16:'gust',20:'squeeze',21:'tailSlam',22:'vineWhip',24:'doubleKick',28:'sandKick',29:'headRam',33:'bodyRam',35:'squeeze',36:'bodyRam',39:'tailPound',40:'needle',43:'meanLook',44:'crunch',45:'roar',48:'soundWave',52:'flameJet',55:'waterPulse',60:'psybeam',61:'bubbles',67:'lowKick',68:'counterPalm',69:'throw',71:'drain',72:'drain',73:'seed',74:'grow',75:'leafBlade',77:'powder',78:'powder',79:'powder',81:'silk',86:'electricWave',88:'rockVolley',93:'psywave',95:'hypnosis',98:'quick',99:'rally',103:'soundWave',106:'harden',109:'psybeam',111:'curl',116:'focus',117:'bide',122:'tongue',123:'smoke',133:'focus',145:'bubbles',149:'psywave',154:'furySlash',162:'superFang',165:'struggle',168:'thief',178:'powder',182:'shellGuard',189:'mud',197:'watch',205:'roll',206:'leafBlade',207:'roar',209:'flameRush',210:'furySlash',213:'charm',228:'ambush',233:'throw',235:'restore',236:'restore',242:'crunch',249:'counterPalm',252:'counterPalm',253:'chorus',259:'roar',268:'charge',269:'roar',270:'encourage',274:'encourage',279:'counterPalm',281:'yawn',286:'seal',287:'restore',290:'bodyRam',292:'palmFlurry',314:'airCut',316:'watch',320:'chant',328:'sandKick',334:'harden',341:'mud',342:'tailSlam',345:'leafBlade',346:'shellGuard',350:'rockVolley',351:'electricWave',352:'waterPulse',355:'roost',358:'counterPalm',372:'ambush',373:'seal',381:'chant',392:'aquaRing',402:'seed',408:'psybeam',428:'headRam',447:'vineWhip',450:'crunch',468:'swordDance',479:'rockVolley',480:'throw',481:'fireRing',485:'psywave',488:'flameRush',490:'lowKick',494:'encourage',495:'bow',496:'chorus',498:'counterPalm',503:'waterPulse',510:'fireRing',514:'retaliate',522:'soundWave',526:'rally',531:'heartDive',534:'shellSlash',536:'leafVortex'
 };
 const colors={Erba:'#abdb75',Fuoco:'#ffad6a',Acqua:'#8bdded',Elettro:'#ffec86',Veleno:'#b98bd5',Psico:'#f5b5e6',Coleottero:'#c3db77',Roccia:'#c5b48f',Terra:'#cbb182',Lotta:'#eeb887',Buio:'#b3a1d5',Volante:'#cde9ef'};
 Object.assign(recipes,{348:'leafBlade',535:'flameRush',158:'crunch',244:'focus',46:'roar',163:'furySlash',374:'throw',171:'hypnosis',403:'airCut',23:'tailSlam',521:'electricWave',157:'rockVolley',347:'focus',339:'rally',330:'mud',34:'bodyRam',203:'shellGuard',474:'sludgeJet',97:'quick',202:'drain',204:'charm',366:'gust',401:'tailSlam',37:'bodyRam',187:'rally',188:'sludgeJet',224:'needle',226:'encourage',357:'watch',18:'gust',113:'shellGuard',115:'shellGuard',321:'encourage',227:'encourage',129:'needle',47:'soundWave',541:'tailSlam',331:'seed',313:'charm',473:'psybeam',260:'encourage',432:'gust',17:'airCut',332:'airCut',297:'powder',84:'electricWave',104:'quick',486:'electricWave',512:'quick'});
 recipes[312]='restore';
 Object.assign(recipes,{19:'flyDive',64:'headRam',101:'psywave',105:'restore',119:'watch',126:'flameJet',136:'doubleKick',141:'drain',151:'harden',174:'focus',175:'flail',179:'flail',184:'meanLook',196:'iceWind',201:'sandKick',212:'meanLook',223:'counterPalm',225:'psybeam',229:'roll',230:'powder',232:'furySlash',240:'aquaRing',246:'rockVolley',248:'psybeam',275:'root',293:'camouflage',298:'dance',300:'mud',310:'ambush',324:'psybeam',333:'iceShard',359:'counterPalm',360:'gyro',362:'waterPulse',365:'airCut',377:'seal',380:'sludgeJet',394:'flameRush',404:'furySlash',405:'soundWave',412:'energyBall',419:'iceShard',422:'flameBite',423:'flameBite',429:'psybeam',435:'electricWave',445:'charm',451:'electricWave',466:'spiritWind',469:'shellGuard',475:'harden',483:'dance',487:'waterPulse',489:'coil',497:'soundWave',501:'shellGuard',523:'groundStamp',527:'web',537:'roll',11:'gearGrind',26:'doubleKick',32:'hornDrill',53:'flameJet',89:'groundStamp',136:'doubleKick',221:'firePalm',240:'aquaRing',398:'sludgeJet',430:'psybeam',544:'gearGrind'});
 Object.assign(recipes,{13:'airCut',26:'jumpKick',31:'headRam',42:'needle',54:'shellGuard',58:'psybeam',92:'poisonTrap',136:'jumpKick',169:'web',499:'smoke',505:'healingWave',11:'gearGrip'});
 Object.assign(recipes,{258:'hailCall',241:'sunCall',240:'rainCall',201:'sandCall',216:'bodyRam',218:'bodyRam',219:'shellGuard'});
 const pairs={};
 for(const [name,row]of Object.entries(TRAINING_DATA.progression)){
  pairs[name]=Training.moves(name);
  for(const id of pairs[name]){
   if(SpeciesMoves.select(row.id,id))continue;
   const m=GEN5.moves.find(m=>m.id===id),kind=row.id===586&&id===224?'hornJab':recipes[id];if(!kind)throw Error('Coreografia non definita: '+name+' / '+id);
   if(!(C.rigs[row.id]||DemoMoves.rigs[row.id]))throw Error('Anatomia non definita: '+name);
   const self=id===312||id===174&&row.id!==592||[7,10,12].includes(m.target),frames=kind==='quick'?86:kind==='flyDive'?152:kind==='throw'?152:['powder','dance','energyBall'].includes(kind)?142:126;
   const attachment=kind==='hornJab'?'leaf':[519,520,521,527,528,561,566,580,581,587].includes(row.id)&&['gust','airCut','flyDive'].includes(kind)?'hand':['groundStamp','root'].includes(kind)?'ground':/leaf|seed|vine|powder|silk|energyBall/.test(kind)?'leaf':/Palm|palm|Slash|Blade|Kick|kick|throw|thief|gear|gyro/.test(kind)?'hand':'mouth';
   C.profiles[row.id+'-'+id]={species:row.id,id,name:m.name,kind,chapter:true,training:true,nativeEffects:true,key:'training-'+row.id+'-'+id,frames,impact:Math.round(frames*.48),attachment,target:self?'self':'foe',damage:m.category!==0,color:colors[m.type]||({Ghiaccio:'#b5ecff',Spettro:'#b9a1ed',Acciaio:'#d2dfe0'}[m.type])||'#e5edf4'};
  }
 }
 C.select=(sid,id,context={})=>{
  const base=window.PokemonVisuals?.speciesId(sid)||(+sid===699?550:+sid),found=previousSelect(base,id,context);if(!found)return found;
  const p=sid!==base?{...found,graphic:sid}:found;if(!p.training)return p;
  if(id===117)return {...p,phase:context.phase===1?1:0,storing:!!context.storing,target:context.phase===1?'foe':'self',frames:context.phase===1?160:126,impact:context.phase===1?49:60};
  if(id===19)return {...p,preparing:!!context.preparing,phase:context.phase||0,target:context.preparing?'self':'foe',damage:!context.preparing};
  if(id===13&&context.preparing)return {...p,target:'self',damage:false};
  return p;
 };
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 C.sample=function(p,f,side='p1',miss=false){
  if(!p.training)return previousSample(p,f,side,miss);
  const a=DemoMoves.sample(p,f,side,miss),r=C.rigs[p.species]||DemoMoves.rigs[p.species],t=a.t,w=a.wind,beat=Math.sin(t*Math.PI*r.step),surge=ease((t-.2)/.25)*(1-ease((t-.57)/.35)),k=p.kind;a.graphic=p.graphic||p.species;
  if(p.id===503){a.head-=r.head*.35*surge;a.lean-=r.lean*.25*surge;a.breath+=.025*Math.sin(t*Math.PI*3)*w;a.arms+=r.arms*.12*Math.sin(t*Math.PI*4)*w;}
  if(['burrow','sludgeJet','poisonTrap','flameBite','waterRush','grow','firePalm'].includes(k)){a.head=r.head*w;a.tail=r.tail*Math.sin(t*Math.PI*5)*w;a.arms=r.arms*Math.sin(t*Math.PI*2)*w;a.crouch=r.crouch*w;a.lean=r.lean*w;a.reach=r.reach*surge;a.breath=(k==='grow'?.09:.035)*Math.sin(Math.PI*t)*w;if(k==='burrow'){a.head=-r.head*w;a.crouch*=1.7;a.feet=r.feet*Math.sin(t*Math.PI*12)*w;}if(k==='waterRush')a.lift=.06*w;}
  if(['gust','airCut','roost'].includes(k)){a.arms=r.arms*Math.sin(t*Math.PI*8)*w;a.lift=k==='roost'?0:.1*w;a.head=-r.head*w;a.crouch=k==='roost'?r.crouch*w:0;}
  if(['quick','thief','lowKick','doubleKick','jumpKick','hornJab','karate','palmFlurry','throw','heartDive'].includes(k)){
   a.reach=r.reach*surge*(miss?.65:1);a.lean=r.lean*w;a.head=r.head*w;a.crouch=r.crouch*w;a.feet=r.feet*beat*surge;a.arms=r.arms*Math.sin(t*Math.PI*(k==='palmFlurry'?8:2))*w;a.tail=-r.tail*w;
   if(['lowKick','doubleKick'].includes(k)){a.feet=(k==='doubleKick'?.7:.5)*Math.sin((t-.2)*Math.PI*(k==='doubleKick'?4:2))*w;a.arms=-r.arms*.5*w;}
   if(k==='jumpKick'){a.feet=.62*Math.sin((t-.2)*Math.PI*2)*w;a.lift=.14*surge;a.arms=-r.arms*.4*w;}
   if(k==='hornJab'){a.head=-r.head*1.6*w;a.crouch=r.crouch*.6*w;a.lean=r.lean*1.4*w;}
   if(k==='throw'){a.reach*=.66;a.arms=r.arms*Math.sin((t-.2)*Math.PI*2)*w;a.lean=-r.lean*w;}
  }
  if(['electricWave','charge','needle','powder','silk','mud','charm','psywave','psybeam','chant','seal','yawn','soundWave','chorus','bubbles','vineWhip','tongue'].includes(k)){
   a.head=-r.head*w;a.arms=r.arms*.55*Math.sin(t*Math.PI*2)*w;a.tail=r.tail*.55*Math.sin(t*Math.PI*4)*w;a.lean=-r.lean*w;a.breath=.05*Math.sin(t*Math.PI*4)*w;
   if(['powder','silk'].includes(k)){a.lean=r.lean*Math.sin(t*Math.PI*4)*w;a.tail=r.tail*Math.sin(t*Math.PI*6)*w;}
   if(['psywave','psybeam','seal','charm'].includes(k))a.glare=w;
  }
  if(['harden','restore','aquaRing'].includes(k)){a.crouch=k==='harden'?r.crouch*w:-.035*w;a.head=-r.head*w;a.arms=-r.arms*.3*w;a.breath=.05*w;a.glare=k==='harden'?w:0;}
  if(['hailCall','sunCall','rainCall','sandCall'].includes(k)){a.head=-r.head*w;a.arms=-r.arms*.65*Math.sin(t*Math.PI)*w;a.tail=r.tail*.35*Math.sin(t*Math.PI*3)*w;a.crouch=-r.crouch*.35*w;a.lean=-r.lean*.5*w;a.breath=.055*Math.sin(t*Math.PI*3)*w;a.glare=k==='sunCall'?w:0;a.reach=0;}
  if(k==='bide'){a.crouch=r.crouch*w;a.head=-r.head*w;a.arms=-r.arms*.45*w;a.tail=-r.tail*.3*w;a.breath=.025*Math.sin(f*.2)*w;if(p.phase===1){a.reach=.22*surge;a.arms=r.arms*surge;}}
  if(p.species===523){a.feet+=.25*Math.sin(t*Math.PI*16)*surge;a.tail+=.22*Math.sin(t*Math.PI*3)*w;if(['electricWave','charge'].includes(k)){a.head=-.18*w;a.glare=w;a.reach=0;}}
  if(p.species===545){a.feet+=.22*Math.sin(t*Math.PI*20)*surge;a.tail+=.18*Math.sin(t*Math.PI*3)*w;if(k==='needle'){a.head=-.15*w;a.reach=.28*surge;}}
  if(p.species===552){a.arms+=.2*Math.sin(t*Math.PI*3)*w;a.tail-=.16*w;if(k==='crunch'){a.head+=.14*Math.sin(t*Math.PI*4)*w;a.crouch+=.04*w;}}
  if(p.species===561){a.arms+=.35*Math.sin(t*Math.PI*6)*w;a.lift+=.08*w;a.feet=0;if(/psy|hypno|focus|watch/.test(k)){a.glare=w;a.arms+=.32*w;}}
  if([572,573].includes(p.species)){a.tail+=Math.sin(t*Math.PI*(p.id===541?14:6))*(p.species===573?.5:.37)*w;a.feet+=.12*beat*surge;if(p.id===47){a.head=-.23*w;a.breath=.055*Math.sin(t*Math.PI*8)*w;}if(p.id===321){a.arms+=.4*Math.sin(t*Math.PI*12)*w;}}
  if(p.species===574){a.head+=.05*Math.sin(t*Math.PI*2)*w;a.arms+=.21*Math.sin(t*Math.PI*2)*w;a.glare=/psy|hypno|watch|focus/.test(k)?w:a.glare;}
  if(p.species===580){a.arms+=.38*Math.sin(t*Math.PI*10)*w;a.tail+=.17*Math.sin(t*Math.PI*4)*w;if(['gust','airCut','quick'].includes(k))a.lift+=.13*w;}
  if(p.species===587){a.tail+=.3*Math.sin(t*Math.PI*4)*w;if(['quick','airCut','gust'].includes(k)){a.arms+=.5*w;a.lift+=.18*w;}if(['electricWave','charge'].includes(k)){a.arms+=.38*w;a.glare=w;a.reach=0;}}
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
  if(p.species===557){a.crouch+=.04*w;a.feet+=.11*Math.sin(t*Math.PI*12)*surge;a.arms+=.35*Math.sin(t*Math.PI*4)*w;a.head*=.5;}
  if([512,514,516].includes(p.species)){a.tail+=r.tail*.16*Math.sin(t*Math.PI*4)*w;a.arms+=r.arms*.12*Math.sin(t*Math.PI*2)*w;}
  if(['energyBall','iceShard','iceWind','spiritWind','web','healingWave'].includes(k)){a.head=-r.head*w;a.lean=-r.lean*w;a.arms=r.arms*.45*Math.sin(t*Math.PI*2)*w;a.tail=r.tail*.5*Math.sin(t*Math.PI*4)*w;a.crouch=r.crouch*.6*w;a.breath=.05*w;a.glare=['energyBall','spiritWind'].includes(k)?w:0;}
  if(k==='groundStamp'){a.crouch=r.crouch*w;a.lean=-r.lean*w;a.feet=r.feet*Math.sin(t*Math.PI*6)*w;a.head=r.head*w;a.arms=-r.arms*.3*w;a.lift=.065*Math.max(0,Math.sin((t-.2)*Math.PI*4))*w;}
  if(['dance','camouflage','root','gyro','gearGrind','gearGrip','hornDrill'].includes(k)){a.head=r.head*Math.sin(t*Math.PI*2)*w;a.arms=r.arms*Math.sin(t*Math.PI*4)*w;a.tail=r.tail*Math.sin(t*Math.PI*6)*w;a.lean=r.lean*Math.sin(t*Math.PI*4)*w;a.crouch=r.crouch*w;a.breath=.045*w;if(k==='root'){a.feet=0;a.reach=0;a.crouch*=1.4;}if(['gyro','hornDrill'].includes(k)){a.roll=a.dir*Math.PI*2*ease((t-.2)/.55)*w;a.reach=r.reach*surge*(miss?.6:1);}if(['gearGrind','gearGrip'].includes(k)){a.reach=r.reach*.7*surge*(miss?.6:1);a.gears=Math.sin(t*Math.PI*(k==='gearGrip'?2:8))*w;}}
  if(k==='flyDive'){a.arms=r.arms*Math.sin(t*Math.PI*10)*w;a.head=-r.head*w;a.tail=-r.tail*w;a.lift=(p.preparing?.38:.34)*Math.sin(Math.PI*t)*w;a.reach=p.preparing?0:r.reach*surge*(miss?.65:1);a.lean=r.lean*(p.preparing?-1:1)*w;a.feet=-r.feet*w;}
  if(p.species===508){a.tail+=.18*Math.sin(t*Math.PI*3)*w;a.feet+=.12*beat*surge;a.head+=.035*w;if(/Bite|crunch/.test(k))a.jaw=.25*surge;}
  if(p.species===521){a.arms+=.24*Math.sin(t*Math.PI*6)*w;a.tail+=.1*Math.sin(t*Math.PI*3)*w;if(['gust','airCut','flyDive'].includes(k))a.lift+=.07*w;}
  if([529,530].includes(p.species)){a.arms+=r.arms*.22*Math.sin(t*Math.PI*(p.id===232?6:2))*w;a.crouch+=.025*w;if(k==='burrow'){a.arms+=.35*Math.sin(t*Math.PI*14)*w;a.head=-.14*w;}if(p.id===32){a.head=-.2*w;a.lean+=.16*Math.sin(t*Math.PI*4)*w;}}
  if(p.species===549){a.arms+=.3*Math.sin(t*Math.PI*(k==='dance'?12:4))*w;a.lean+=.025*Math.sin(t*Math.PI*4)*w;if(k==='dance')a.lift=.035*w;}
  if(p.species===555){a.arms+=.4*Math.sin(t*Math.PI*(k==='counterPalm'?4:2))*w;a.crouch+=.045*w;a.breath+=.035*w;if(k==='groundStamp')a.lift+=.08*surge;}
  if(p.species===564){a.arms+=.22*Math.sin(t*Math.PI*6)*w;a.tail+=.12*Math.sin(t*Math.PI*4)*w;if(k==='shellGuard'){a.arms=-.38*w;a.head=.12*w;a.crouch=.08*w;}}
  if(p.species===566){a.tail+=.26*Math.sin(t*Math.PI*4)*w;a.feet+=.16*beat*surge;a.arms+=.2*Math.sin(t*Math.PI*8)*w;}
  if(p.species===575){a.arms+=.24*Math.sin(t*Math.PI*2)*w;a.head+=.03*Math.sin(t*Math.PI*4)*w;if(/psy|hypno|focus/.test(k))a.glare=w;}
  if(p.species===581){a.arms+=.4*Math.sin(t*Math.PI*8)*w;a.head+=.04*Math.sin(t*Math.PI*2)*w;if(['gust','airCut','flyDive'].includes(k))a.lift+=.1*w;}
  if([582,583].includes(p.species)){a.feet=0;a.lift+=.045*Math.sin(t*Math.PI*2)*w;a.tail+=.12*Math.sin(t*Math.PI*3)*w;if(k==='iceShard')a.head+=.055*Math.sin(t*Math.PI*6)*w;}
  if([585,586].includes(p.species)){a.feet+=.18*beat*surge;a.head+=.065*Math.sin(t*Math.PI*2)*w;a.tail+=.14*Math.sin(t*Math.PI*4)*w;if(p.id===224||p.id===26){a.head-=.16*w;a.lean+=.055*w;}if(k==='doubleKick')a.lift+=.1*surge;}
  if(p.species===588){a.head+=.09*Math.sin(t*Math.PI*3)*w;a.feet+=.1*beat*surge;if(k==='furySlash')a.arms+=.25*Math.sin(t*Math.PI*6)*w;}
  if(p.species===590){a.lean+=.035*Math.sin(t*Math.PI*4)*w;a.crouch+=.025*w;if(['powder','sludgeJet'].includes(k))a.head=-.07*w;}
  if(p.species===592){a.arms+=.38*Math.sin(t*Math.PI*4)*w;a.tail+=.3*Math.sin(t*Math.PI*6)*w;a.lift+=.055*Math.sin(t*Math.PI*2)*w;a.feet=0;}
  if(p.species===595){a.feet+=.2*Math.sin(t*Math.PI*18)*w;a.head+=.04*w;if(['electricWave','web'].includes(k)){a.reach=0;a.crouch+=.035*w;a.glare=w;}}
  if(p.species===597){a.feet=0;a.arms=0;a.lean+=.08*Math.sin(t*Math.PI*4)*w;if(k==='roll')a.tail=0;}
  if(p.species===599){a.feet=0;a.arms=0;a.gears=(k==='gearGrip'?Math.sin(t*Math.PI*2):Math.sin(t*Math.PI*8)*(k==='gearGrind'?1:.4))*w;a.lean+=.03*Math.sin(t*Math.PI*4)*w;}
  if(p.species===602){a.feet=0;a.arms=0;a.tail+=.4*Math.sin(t*Math.PI*6)*w;a.lift+=.035*Math.sin(t*Math.PI*2)*w;if(k==='electricWave'){a.reach=0;a.glare=w;}}
  return a;
 };
 C.draw=function(c,W,H,x,f,layer){
  const p=x.profile;if(!p.training)return previousDraw(c,W,H,x,f,layer);
  DemoMoves.draw(c,W,H,x,f,layer);if(layer!=='front')return;
  const a=C.sample(p,f,x.side,x.miss),l=BattleGround.layout(W,H),from=l[x.side],to=l[x.targetSide],body=SpeciesMoves.pose(p,f,x.side,x.side,x.miss,l),o=DemoMoves.attachment(p,a,from,body,x.side),h=from.height*body.scale,k=p.kind;
  if(p.id===503){const target={x:to.x+(x.miss?a.dir*to.height*.8:0),y:to.y-to.height*.5};c.save();c.strokeStyle='#e1eff0';c.lineWidth=Math.max(1,h*.012);for(let i=0;i<6;i++){const q=(f-p.impact+28-i*5)/52;if(q<0||q>1)continue;c.globalAlpha=Math.sin(Math.PI*q)*a.wind*.55;const xx=o.x+(target.x-o.x)*q,yy=o.y+(target.y-o.y)*q-h*.18*q;c.beginPath();c.ellipse(xx,yy,h*(.018+q*.035),h*(.025+q*.05),q*2,0,Math.PI*2);c.stroke();}c.restore();}
  if(['hailCall','sunCall','rainCall','sandCall'].includes(k)){c.save();c.strokeStyle=p.color;c.fillStyle=p.color;c.lineWidth=Math.max(1.5,h*.012);c.globalAlpha=a.wind*.8;const sky={x:from.x,y:from.y-h*1.4};c.beginPath();c.moveTo(o.x,o.y);c.quadraticCurveTo(from.x+h*.18*a.dir,sky.y,sky.x,sky.y);c.stroke();for(let i=0;i<9;i++){const q=((f*.019+i*.127)%1),xx=sky.x+(i-4)*h*.16,yy=sky.y+q*h*1.4;c.beginPath();if(k==='sunCall'){const angle=i*Math.PI*2/9;c.moveTo(sky.x+Math.cos(angle)*h*.11,sky.y+Math.sin(angle)*h*.11);c.lineTo(sky.x+Math.cos(angle)*h*(.17+.17*a.wind),sky.y+Math.sin(angle)*h*(.17+.17*a.wind));c.stroke();}else if(k==='rainCall'){c.moveTo(xx,yy);c.lineTo(xx-h*.025,yy+h*.12);c.stroke();}else if(k==='hailCall'){c.moveTo(xx,yy-h*.03);c.lineTo(xx+h*.025,yy);c.lineTo(xx,yy+h*.03);c.lineTo(xx-h*.025,yy);c.closePath();c.fill();}else{c.ellipse(xx+Math.sin(q*6+i)*h*.1,yy,h*.035,h*.014,0,0,Math.PI*2);c.fill();}}c.restore();}
  if(['groundStamp','root','energyBall','iceShard','iceWind','spiritWind','web','healingWave'].includes(k)){
   const target={x:to.x+(x.miss?a.dir*to.height*.8:0),y:to.y-to.height*.5},travel=(f-p.impact+32)/49;
   c.save();c.strokeStyle=p.color;c.fillStyle=p.color;c.lineWidth=Math.max(2,h*.018);c.globalAlpha=a.wind;
   if(k==='groundStamp')for(let i=0;i<3;i++){const q=(f-p.impact+8-i*7)/38;if(q<0||q>1)continue;c.globalAlpha=(1-q)*a.wind;c.beginPath();c.ellipse(from.x,from.y+2,h*(.15+q*.9),h*(.035+q*.15),0,0,Math.PI*2);c.stroke();}
   else if(k==='root'){for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(from.x+i*h*.12,from.y);c.quadraticCurveTo(from.x+i*h*.2,from.y-h*.12*a.wind,from.x+i*h*.32*a.wind,from.y+2);c.stroke();}}
   else if(k==='web'&&travel>0&&travel<1){const xx=o.x+(target.x-o.x)*travel,yy=o.y+(target.y-o.y)*travel;c.beginPath();c.moveTo(o.x,o.y);c.lineTo(xx,yy);c.stroke();for(let i=0;i<4;i++){const angle=i*Math.PI/2;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+Math.cos(angle)*h*.19*a.wind,yy+Math.sin(angle)*h*.19*a.wind);c.stroke();}}
   else for(let i=0;i<(k==='energyBall'?1:5);i++){const q=(f-p.impact+32-i*6)/49;if(q<0||q>1)continue;const xx=o.x+(target.x-o.x)*q,yy=o.y+(target.y-o.y)*q;c.globalAlpha=Math.sin(Math.PI*q)*a.wind;c.beginPath();if(k==='iceShard'){const size=h*.045;c.moveTo(xx,yy-size*1.8);c.lineTo(xx+size,yy);c.lineTo(xx,yy+size*1.8);c.lineTo(xx-size,yy);c.closePath();c.fill();}else{const size=h*(k==='energyBall'?.12:.035+q*.09);c.ellipse(xx,yy,size,size*(k==='iceWind'?.4:1),q*4,0,Math.PI*2);k==='energyBall'?c.fill():c.stroke();}}
   c.restore();
  }
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
 // Groups identified from the exported original front/back part sheets. Related
 // eye/mask/petal tiles rotate around a common joint, avoiding detached pieces.
 const partMaps={
  508:{front:{head:[0,1,2,3,4,5,6,7],tail:[9,10],feet:[11,12,13]},back:{head:[0,1,2,3,4],tail:[6,7],feet:[8,9]}},
  521:{front:{head:[18,19,20,21,22,23,24,25],left:[29],tail:[30],feet:[31,32,33,34]},back:{head:[12,13,14,15],left:[18],tail:[19],feet:[20,21,22,23]}},
  529:{front:{head:[0,4],left:[5,6,7,8],right:[9,10,11,12],feet:[2,3]},back:{left:[5],right:[6],feet:[3,4]}},
  530:{front:{head:[9],left:[0],right:[7],feet:[12,13,14,15]},back:{head:[9],left:[0],right:[7],feet:[12,13,14,15]}},
  549:{front:{head:[17,18,19,20,21,22,27,28,29],left:[23,25],right:[24,26],feet:[31,32,33]},back:{head:[11,18,19,20],left:[12,14,16],right:[13,15,17],feet:[21]}},
  555:{front:{head:[0,5],left:[1],right:[2],feet:[3,4]},back:{head:[0,5],left:[1],right:[2],feet:[3,4]}},
  564:{front:{head:[0,9],left:[3],right:[4],feet:[5,6]},back:{head:[0],left:[2],right:[3],feet:[1,4]}},
  566:{front:{head:[0,1],left:[2],right:[3],tail:[6],feet:[4,5]},back:{head:[0,3],left:[1],right:[2],tail:[6],feet:[4,5]}},
  575:{front:{head:[0,6,7,8],left:[2],right:[3],feet:[4,5]},back:{head:[2,7,8,9],left:[3],right:[4],feet:[5,6]}},
  581:{front:{head:[0,1,8],left:[7],right:[2],feet:[3,4,5,6]},back:{head:[0,1,9],left:[2],right:[10],tail:[3,4],feet:[5,6,7,8]}},
  582:{front:{head:[3,4,5,6],tail:[1,2]},back:{head:[3,4,5,6],tail:[1,2]}},
  583:{front:{head:[6,7,8,9,10],tail:[11]},back:{head:[6,7,8,9,10],tail:[11]}},
  585:{front:{head:[0,1,2,3,4],tail:[10],feet:[6,7,8,9]},back:{head:[0,1,2,3],tail:[10],feet:[6,7,8,9]}},
  586:{front:{head:[0,1,2,13],tail:[8],feet:[4,5,6,7,9,10,11,12]},back:{head:[0,1,2,13],tail:[8],feet:[4,5,6,7,9,10,11,12]}},
  588:{front:{head:[6,7,8,9],feet:[10,11]},back:{feet:[5,6,7]}},
  590:{front:{head:[1],feet:[2,3]},back:{head:[1],feet:[2,3]}},
  592:{front:{head:[0,1,2],left:[3,6,8],right:[5,4,9],tail:[7,10]},back:{head:[0,1],left:[3,4,7],right:[5,6,9],tail:[2,8]}},
  595:{front:{head:[6],feet:[2,3,4,5]},back:{head:[6],feet:[3,4,5]}},
  597:{front:{shell:[5]},back:{shell:[5]}},
  599:{front:{gearL:[0,2,4],gearR:[1,3,5,6]},back:{gearL:[0,2],gearR:[1,3]}},
  602:{front:{tail:[2],head:[1]},back:{tail:[0]}}
 };
 const previousPart=SpeciesMoves.part;
 SpeciesMoves.part=(track,back,a)=>{
  const map=a&&partMaps[a.species]?.[back?'back':'front'];if(!map)return previousPart(track,back,a);
  const role=Object.keys(map).find(k=>map[k].includes(track));if(!role)return null;
  const cache=window.ROM_SPRITE_ANIM?.cache[(a.graphic||a.species)+'-'+(back?'back':'front')],data=cache?.data,pf=data?.parent?.[0]?.frames?.[0],rows=data?.maps?.[pf?.[0]||0],row=rows?.find(r=>r[0]===track),joint=rows?.find(r=>r[0]===map[role][0]);
  const pivotX=joint&&row?joint[1]-row[1]:0,pivotY=joint&&row?joint[2]-row[2]+(role==='head'?4:0):0,rotation=role==='head'?a.head*a.dir*.3:role==='tail'?a.tail*a.dir*.15:role==='left'?a.arms*.2:role==='right'?-a.arms*.2:role==='feet'?a.feet*(track%2?1:-1)*.22:role==='shell'?a.lean*a.dir*.5:(a.gears||a.arms||0)*(role==='gearL'?1:-1)*.45;
  return {rotation,pivotX,pivotY};
 };
 window.TrainingMoves={pairs,fitted,recipes,partMaps};
})();
