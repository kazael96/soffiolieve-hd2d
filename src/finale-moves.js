/* Authored053 anatomy from the reviewed native composites and twenty limb sheets.
 * Original move particles/camera/audio remain owned by NativeMoveFX. */
(()=>{
 const C=ChapterMoves,rows={
  565:[.10,.90,.35,.18,.10,.05,12,.75,[.15,-.80],[.45,-.44],[0,-.65],.28],
  567:[.18,1.50,1.30,.35,.12,.05,24,.95,[.20,-.82],[.40,-.45],[-.29,-.45],.70],
  571:[.09,1.40,.80,.35,.13,.08,22,.97,[.07,-.81],[.40,-.50],[-.35,-.80],.65],
  579:[.02,1.70,0,0,.03,.02,6,.50,[0,-.50],[.45,-.45],[0,-.72],.45],
  609:[0,.90,.40,0,.03,.02,8,.42,[0,-.55],[.43,-.40],[0,-.95],.40],
  625:[.055,1.35,0,.20,.10,.045,16,.90,[.08,-.80],[.40,-.53],[.35,-.60],.35],
  630:[.12,1.50,.30,.20,.065,.045,14,.90,[.30,-.85],[.40,-.48],[-.25,-.24],.70],
  635:[.06,0,1.10,0,.10,.02,6,.78,[.05,-.85],[.45,-.60],[-.32,-.56],.45],
  643:[.04,1.10,.85,.18,.075,.035,8,.90,[.06,-.84],[.45,-.50],[-.35,-.60],.30],
  644:[.035,.70,1.10,.20,.08,.025,6,.88,[.03,-.85],[.40,-.50],[-.33,-.55],.25]
 };
 for(const [id,v]of Object.entries(rows)){const [head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil]=v;C.rigs[id]={name:GEN5.species.find(p=>p.id===+id).en,head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil,ground:[0,0],body:[0,-.5]};}
 C.rigs[609].flamePoint=[0,-.94];C.rigs[630].bonePoint=[.04,-.98];
 const recipes={12:'leafBlade',146:'counterPalm',161:'psybeam',192:'electricWave',198:'rockVolley',199:'watch',326:'psybeam',329:'iceWind',368:'gyro',384:'psywave',385:'shellGuard',515:'bodyRam',558:'energyBall',559:'electricWave'};
 const tails={567:[-.30,-.34],635:[-.23,-.22],643:[-.38,-.29],644:[-.34,-.33]};
 const parts={
  565:{front:{head:[0,6,7],left:[2,4],right:[3,5],footLeft:[9],footRight:[10],tail:[8]},back:{head:[0,4],left:[6,9,10],right:[3,5,7,8],footLeft:[12],footRight:[11],tail:[2]}},
  567:{front:{head:[0],left:[2],right:[3],footLeft:[5],footRight:[4],tail:[6]},back:{head:[0],left:[4],right:[3],footLeft:[5],footRight:[6],tail:[7]}},
  571:{front:{head:[14,15],mane:[16,17,18],left:[19,21,22],right:[23,25,24],footLeft:[12],footRight:[13,20]},back:{head:[11],mane:[12,13,14],left:[16,17],right:[15],footLeft:[10,19],footRight:[9,18]}},
  579:{front:{head:[0],left:[5,7,11,3],right:[8,10,12,9]},back:{head:[0],left:[5,6,9,3],right:[7,8,10,4]}},
  609:{front:{core:[0],flame:[1],left:[2,3,4,5,6,7],right:[8,9,10,11,12,13]},back:{core:[0,1],flame:[2],left:[3,4,5,6,7,8],right:[9,10,11,12,13,14]}},
  625:{front:{head:[0],left:[3,5],right:[2,4],footLeft:[6,9],footRight:[7,8]},back:{head:[0],left:[3,4],right:[2,5],footLeft:[6,9],footRight:[7,8]}},
  630:{front:{head:[0,1,2,3,4],left:[8,9],right:[10],footLeft:[13],footRight:[14],tail:[11,12]},back:{head:[0,1,2,3,4],left:[9,10],right:[11],footLeft:[8],footRight:[13],tail:[12]}},
  635:{front:{head:[0],headLeft:[3],headRight:[2],wingLeft:[4,5,6],wingRight:[7,8,9],tail:[10]},back:{head:[0],headLeft:[2],wingLeft:[3,4,5],wingRight:[6,7,8],tail:[9]}},
  643:{front:{head:[0,1,2,3],left:[11,12,13],right:[14,15,16],footLeft:[8],footRight:[9,10],tail:[17,18,19]},back:{head:[1,2,3,4,5],left:[0,13,14],right:[15,16,17],footLeft:[8,9],footRight:[10,11,12],tail:[18,19,20,21]}},
  644:{front:{head:[0,1],left:[4],right:[5],wingLeft:[10],wingRight:[11],footLeft:[8],footRight:[9],tail:[12]},back:{head:[0],left:[3,6],right:[2,5],wingLeft:[10],wingRight:[9],footLeft:[8],footRight:[7],tail:[11]}}
 };
 function install(){
  const select=C.select,sample=C.sample,part=SpeciesMoves.part;
  C.select=(sid,id,context={})=>{
   const p=select(sid,id,context);if(!p)return p;let attachment=p.attachment;
   if(p.species===579)attachment=[146,411].includes(id)?'hand':'body';
   if(p.species===609)attachment=GEN5.moves.find(m=>m.id===id)?.type==='Fuoco'?'flamePoint':'body';
   if(p.species===630&&id===198)attachment='bonePoint';
   if(p.species===635&&id!==525)attachment=['groundStamp','burrow'].includes(p.kind)?'ground':'mouth';
   if(p.species===625&&['leafBlade','furySlash','counterPalm','thief'].includes(p.kind))attachment='hand';
   if(id===558&&p.species===643||id===559&&p.species===644)attachment='body';
   return attachment===p.attachment?p:{...p,attachment};
  };
  C.sample=(p,f,side='p1',miss=false)=>{
   const a=sample(p,f,side,miss),r=C.rigs[p.graphic]||C.rigs[p.species],t=a.t,w=a.wind;
   if(!rows[p.species])return a;
   const surge=Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.18)/.65)))*w,beat=Math.sin(t*Math.PI*r.step);
   if(p.species===565){a.arms+=.15*Math.sin(t*Math.PI*4)*w;a.head*=.65;a.tail*=.4;a.crouch*=.6;if(['waterPulse','hydroJet','waterRush'].includes(p.kind))a.arms+=.38*surge;}
   if(p.species===567){a.arms+=.35*Math.sin(t*Math.PI*6)*w;a.tail+=.30*Math.sin(t*Math.PI*3)*w;a.feet+=.12*beat*surge;if(['gust','airCut','flyDive'].includes(p.kind))a.lift+=.12*surge;}
   if(p.species===571){a.arms+=.24*surge;a.mane=.40*Math.sin(t*Math.PI*3)*w;if(['ambush','furySlash','leafBlade'].includes(p.kind)){a.crouch+=.06*w;a.lean+=.08*surge;}}
   if(p.species===579){a.feet=0;a.head=0;a.lift+=.04*w;a.arms+=.28*Math.sin(t*Math.PI*4)*w;a.breath+=.035*w;if([384,385].includes(p.id)){a.arms+=.45*Math.sin(t*Math.PI*2)*w;a.glare=Math.max(a.glare,.65*w);}}
   if(p.species===609){a.feet=0;a.head=0;a.lift+=.035*w;a.arms*=.28;a.flame=.055*Math.sin(t*Math.PI*8)*w;a.breath+=.025*surge;}
   if(p.species===625){a.tail=0;a.arms+=.22*Math.sin(t*Math.PI*(p.id===12?2:4))*w;a.head*=.5;if(p.id===12){a.reach*=.65;a.lean+=.06*surge;}}
   if(p.species===630){a.arms+=.25*Math.sin(t*Math.PI*6)*w;a.head+=.07*surge;if(p.id===198){a.head+=.12*Math.sin(t*Math.PI*6)*w;a.arms*=.45;}}
   if(p.species===635){a.feet=0;a.arms=0;a.lift+=.07*w;a.sideHeads=.18*Math.sin(t*Math.PI*(p.id===161?6:3))*w;a.wings=.14*Math.sin(t*Math.PI*4)*w;a.tail+=.24*Math.sin(t*Math.PI*3)*w;}
   if(p.species===643){a.head*=.55;a.arms+=.13*Math.sin(t*Math.PI*4)*w;a.tail*=.3;if(p.id===558){a.reach*=.35;a.breath+=.08*surge;a.tail+=.09*Math.sin(t*Math.PI*10)*w;a.glare=Math.max(a.glare,.75*surge);}}
   if(p.species===644){a.head*=.45;a.arms*=.7;a.tail*=.3;if(p.id===559){a.reach*=.3;a.crouch+=.025*w;a.breath+=.055*surge;a.tail+=.07*Math.sin(t*Math.PI*12)*w;a.wings=.08*surge;a.glare=Math.max(a.glare,.85*surge);}}
   return a;
  };
  SpeciesMoves.part=(track,back,a)=>{
   const map=a&&parts[a.graphic||a.species]?.[back?'back':'front'];if(!map)return part(track,back,a);
   const role=Object.keys(map).find(k=>map[k].includes(track));if(!role)return null;
   const data=window.ROM_SPRITE_ANIM?.cache[(a.graphic||a.species)+'-'+(back?'back':'front')]?.data,pf=data?.parent?.[0]?.frames?.[0],rows=data?.maps?.[pf?.[0]||0],row=rows?.find(r=>r[0]===track),joint=rows?.find(r=>r[0]===map[role][0]);
   const rotation=role==='head'?a.head*a.dir*.24:role==='headLeft'?(a.head+(a.sideHeads||0))*a.dir*.25:role==='headRight'?(a.head-(a.sideHeads||0))*a.dir*.25:role==='left'?a.arms*.15:role==='right'?-a.arms*.15:role==='wingLeft'?(a.wings||0):role==='wingRight'?-(a.wings||0):role==='footLeft'?a.feet*.12:role==='footRight'?-a.feet*.12:role==='tail'?a.tail*a.dir*.10:role==='mane'?(a.mane||0)*a.dir*.12:role==='flame'?(a.flame||0)*a.dir:0;
   return {rotation,pivotX:joint&&row?joint[1]-row[1]:0,pivotY:joint&&row?joint[2]-row[2]:0};
  };
 }
 window.FinaleMotion={rows,recipes,tails,parts,install};
})();
