/* Authored052 HD-2D anatomy, fitted to reviewed native front/back composites. */
(()=>{
 const C=ChapterMoves,rows={
  526:[.025,0,0,.2,.07,.025,6,.67,[.06,-.59],[.28,-.3],[.02,-.88],.24],
  534:[.075,.48,0,.16,.14,.055,8,.86,[.13,-.7],[.45,-.46],[0,-.93],.31],
  584:[.045,0,.6,0,.025,.025,5,.48,[.17,-.66],[.34,-.55],[-.18,-.7],.46],
  589:[.055,.78,0,0,.09,.035,10,.91,[.18,-.56],[.47,-.36],[.02,-.97],.32],
  601:[0,0,0,0,.025,.025,8,.43,[0,-.55],[.35,-.52],[0,-.84],.25],
  612:[.16,.72,1.1,.3,.14,.065,16,.94,[.27,-.77],[.36,-.42],[.37,-.73],.55],
  617:[.095,0,1.1,0,.07,.035,24,.92,[.18,-.79],[.31,-.54],[-.26,-.61],.62],
  620:[.09,1.45,1.15,.3,.105,.045,24,.97,[.18,-.77],[.49,-.51],[-.3,-.45],.75],
  629:[.1,.64,.13,.22,.065,.065,12,.7,[.18,-.64],[.41,-.48],[0,-.87],.6],
  631:[.12,.67,.8,.23,.12,.055,12,.85,[.39,-.45],[.39,-.33],[.09,-.76],.41],
  632:[.07,0,0,.52,.07,.025,28,.81,[.34,-.37],[.34,-.35],[-.19,-.43],.36],
  633:[.14,0,.37,.32,.11,.06,16,.78,[.26,-.65],[.2,-.32],[0,-.9],.55],
  634:[.12,0,.67,.28,.12,.055,18,.91,[.17,-.74],[.29,-.4],[-.22,-.86],.47]
 };
 for(const [id,v]of Object.entries(rows)){const [head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil]=v;C.rigs[id]={name:GEN5.species.find(p=>p.id===+id).en,head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil,ground:[0,0],body:[0,-.5]};}
 const recipes={500:'psybeam',143:'flyDive',264:'counterPalm',370:'counterPalm',542:'gust',525:'tailSlam',90:'groundStamp',322:'focus',194:'seal',441:'sludgeJet',478:'seal',472:'seal',243:'counterPalm',311:'energyBall',41:'needle',476:'powder',147:'powder',508:'gearGrind',85:'electricWave',382:'ambush',386:'furySlash',399:'psywave',407:'bodyRam',458:'bodyRam'};
 const tails={497:[-.3,-.18],503:[-.37,-.35],553:[-.33,-.18],559:[-.28,-.34],560:[-.3,-.25],604:[-.27,-.14],611:[-.3,-.18],612:[-.33,-.19],621:[-.36,-.12],633:[-.28,-.3],634:[-.36,-.29]};
 const parts={
  526:{front:{head:[10,11,12],feet:[17,16,18,19]},back:{head:[8],feet:[14,15,12,13]}},
  534:{front:{head:[0,1,2],left:[14,10],right:[11,12],feet:[5,6,7,8]},back:{head:[0,1],left:[13,4,5],right:[10,6],feet:[7,8,9]}},
  584:{front:{head:[2],tail:[6],left:[0],right:[1]},back:{head:[2],tail:[6],left:[0]}},
  589:{front:{head:[12,13,11],left:[19],right:[20]},back:{head:[11,10],left:[18],right:[19]}},
  601:{front:{gearL:[0,1],gearR:[2],ring:[16,17]},back:{gearL:[0],gearR:[1],ring:[10,11]}},
  612:{front:{head:[0],left:[10,9],right:[12,11],feet:[6,5,8,7],tail:[16,15,14]},back:{head:[0],left:[11,12],right:[8],feet:[7,9],tail:[10]}},
  617:{front:{head:[0],tail:[5,6]},back:{head:[0],tail:[4,5]}},
  620:{front:{head:[0],left:[3],right:[4,5],feet:[6,7],tail:[8,9,10]},back:{head:[0],left:[3],right:[4,5],feet:[6,7],tail:[8,9,10]}},
  629:{front:{head:[0,1],left:[8],right:[7],feet:[11,12],shell:[4,5,6]},back:{head:[0,1],left:[6],right:[5],feet:[9,10],shell:[3,4,7,8]}},
  631:{front:{head:[0,2],left:[7,6],right:[9,8],tail:[4],feet:[11,12,13]},back:{head:[0,3],left:[4,8],right:[5],tail:[2],feet:[6,9,10]}},
  632:{front:{head:[0,8,9,3],feet:[11,4,6,7,5,10]},back:{head:[0,8,9],feet:[7,6,5,12,11,10,4,3]}},
  633:{front:{head:[0,1],feet:[3,4],tail:[5]},back:{head:[0,1],feet:[2,3],tail:[5]}},
  634:{front:{headLeft:[1,3,5],headRight:[0,2,7],wings:[10,11],tail:[8,9]},back:{headLeft:[1,2,8],headRight:[0,3,7],wings:[5,6],tail:[10,11]}}
 };
 function install(){
  const select=C.select,sample=C.sample,part=SpeciesMoves.part;
  C.select=(sid,id,context={})=>{
   const p=select(sid,id,context);if(!p)return p;
   const preparing=[143,264].includes(id)&&context.preparing;
   const attachment=id===525?'tailPoint':id===508||[194,322,478,472].includes(id)?'body':p.species===631&&GEN5.moves.find(m=>m.id===id)?.type==='Fuoco'?'mouth':p.species===534&&[88,157,264,317,359,370,441,444,479].includes(id)?'hand':p.species===620&&[264,370,395,396,409,411].includes(id)?'hand':p.species===589&&id===529?'leaf':p.species===632&&['furySlash','leafBlade','crunch'].includes(p.kind)?'mouth':p.species===601?'body':p.attachment;
   if(id===525){const rig=C.rigs[p.species]||DemoMoves.rigs[p.species],point=tails[p.species]||window.FinaleMotion?.tails?.[p.species];if(!point)throw Error('Punto della coda non definito: '+p.species);rig.tailPoint=point;}
   if(['body','ground'].includes(attachment)){const rig=C.rigs[p.graphic]||C.rigs[p.species]||DemoMoves.rigs[p.species];if(rig)rig[attachment]??=attachment==='body'?[0,-.5]:[0,0];}
   return {...p,attachment,...(preparing?{preparing:true,target:'self',damage:false}:{})};
  };
  C.sample=(p,f,side='p1',miss=false)=>{
   const a=sample(p,f,side,miss),r=C.rigs[p.graphic]||C.rigs[p.species],w=a.wind,t=a.t,surge=Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.2)/.65)))*w;
   if(rows[p.species]){
    const beat=Math.sin(t*Math.PI*r.step);
    if(p.species===526){a.arms=0;a.head*=.3;a.crouch*=.3;a.feet+=.13*beat*surge;}
    if(p.species===534){a.arms+=.16*Math.sin(t*Math.PI*2)*w;a.head*=.65;a.crouch*=.7;}
    if(p.species===584){a.feet=0;a.arms=0;a.head*=.5;a.lift+=.04*w;a.breath+=.045*Math.sin(t*Math.PI*4)*w;}
    if(p.species===589){a.feet=0;a.head*=.5;a.arms+=.24*Math.sin(t*Math.PI*4)*w;a.lift+=.025*w;}
    if(p.species===601){a.feet=0;a.arms=0;a.head=0;a.gears=(a.gears||0)+.65*Math.sin(t*Math.PI*6)*w;a.lift+=.025*w;}
    if(p.species===612){a.tail+=.28*Math.sin(t*Math.PI*3)*w;a.arms+=.15*surge;if(p.id===530){a.feet=0;a.head+=.2*Math.sin(t*Math.PI*6)*w;}}
    if(p.species===617){a.arms=0;a.feet=0;a.tail+=.48*Math.sin(t*Math.PI*4)*w;a.lift+=.055*w;}
    if(p.species===620){a.arms+=.34*Math.sin(t*Math.PI*(p.id===370?8:4))*w;a.tail+=.25*Math.sin(t*Math.PI*3)*w;a.feet+=.2*beat*surge;}
    if(p.species===629){a.head+=.06*surge;a.arms+=.28*Math.sin(t*Math.PI*6)*w;a.crouch*=.7;}
    if(p.species===631){a.head+=.1*surge;a.tail+=.16*Math.sin(t*Math.PI*3)*w;a.breath+=.06*surge;}
    if(p.species===632){a.arms=0;a.head+=.04*surge;a.feet+=.42*beat*surge;a.crouch*=.3;}
    if(p.species===633){a.arms=0;a.head+=.1*Math.sin(t*Math.PI*3)*w;a.tail+=.24*Math.sin(t*Math.PI*2)*w;}
    if(p.species===634){a.arms=0;a.twins=.22*Math.sin(t*Math.PI*(p.id===458?4:2))*w;a.head+=.08*surge;a.tail+=.2*Math.sin(t*Math.PI*3)*w;}
   }
   if(p.id===500){a.glare=Math.max(a.glare,.8*w);a.breath+=.06*surge;}
   if([143,264].includes(p.id)&&p.preparing){a.reach=0;a.lift=p.id===143?.1*w:0;a.glare=Math.max(a.glare,.55*w);}
   if(p.id===525){a.tail+=.8*Math.sin(t*Math.PI*2)*w;a.head*=.4;a.reach*=.45;}
   if(p.id===508){a.gears=(a.gears||0)+1.2*Math.sin(t*Math.PI*8)*w;a.reach=0;}
   return a;
  };
  SpeciesMoves.part=(track,back,a)=>{
   const map=a&&parts[a.graphic||a.species]?.[back?'back':'front'];if(!map)return part(track,back,a);
   const role=Object.keys(map).find(k=>map[k].includes(track));if(!role)return null;
   const data=window.ROM_SPRITE_ANIM?.cache[(a.graphic||a.species)+'-'+(back?'back':'front')]?.data,pf=data?.parent?.[0]?.frames?.[0],rows=data?.maps?.[pf?.[0]||0],row=rows?.find(r=>r[0]===track),joint=rows?.find(r=>r[0]===map[role][0]);
   const rotation=role==='head'?a.head*a.dir*.28:role==='headLeft'?(a.head+(a.twins||0))*a.dir*.28:role==='headRight'?(a.head-(a.twins||0))*a.dir*.28:role==='tail'?a.tail*a.dir*.15:role==='left'?a.arms*.18:role==='right'?-a.arms*.18:role==='wings'?a.arms*(track%2?1:-1)*.09:role==='feet'?a.feet*(track%2?1:-1)*.16:role==='gearL'?(a.gears||0)*.5:role==='gearR'?-(a.gears||0)*.5:role==='ring'?(a.gears||0)*.12:a.lean*a.dir*.22;
   return {rotation,pivotX:joint&&row?joint[1]-row[1]:0,pivotY:joint&&row?joint[2]-row[2]:0};
  };
 }
 window.LeagueMotion={rows,recipes,parts,install};
})();
