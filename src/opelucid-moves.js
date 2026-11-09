/* Authored051 anatomy from the native front/back composites. Visual QA is separate. */
(()=>{
 const C=ChapterMoves,rows={
  553:[.13,1.12,1.15,.25,.13,.065,16,.89,[.34,-.78],[.41,-.5],[-.3,-.3],.39],
  556:[.07,1.3,0,.12,.05,.065,8,.57,[.04,-.55],[.38,-.5],[.02,-.96],.59],
  558:[.045,.62,0,.48,.055,.035,14,.64,[.23,-.27],[.36,-.22],[0,-.9],.22],
  563:[.025,1.5,0,0,.04,.025,6,.49,[.02,-.78],[.49,-.57],[.02,-.88],.33],
  576:[.075,.64,0,.055,.045,.035,8,.53,[.02,-.79],[.25,-.45],[.01,-.95],.52],
  593:[.035,1.05,.72,0,.035,.04,6,.45,[.12,-.67],[.39,-.31],[.01,-.85],.46],
  598:[.025,1.42,0,0,.035,.025,6,.43,[0,-.29],[.29,-.8],[-.3,-.8],.27],
  606:[.045,.96,0,.08,.04,.045,8,.52,[.06,-.63],[.29,-.41],[0,-.92],.55],
  608:[.025,.85,.18,0,.03,.025,6,.44,[.04,-.45],[.38,-.45],[.01,-.95],.48],
  611:[.17,.66,.9,.22,.13,.07,16,.88,[.3,-.67],[.32,-.4],[.38,-.65],.66],
  619:[.085,1.35,.5,.35,.105,.055,22,.95,[.18,-.7],[.44,-.55],[-.22,-.3],.71],
  621:[.14,.88,.85,.22,.14,.065,14,.92,[.32,-.79],[.42,-.48],[-.34,-.68],.41],
  623:[.025,1.4,0,.26,.14,.045,8,.78,[.07,-.76],[.46,-.57],[.03,-.5],.23],
  624:[.105,1.05,0,.22,.095,.065,18,.86,[.08,-.58],[.36,-.43],[.02,-.92],.63],
  626:[.22,0,.32,.4,.15,.08,18,.96,[.28,-.55],[.29,-.14],[.42,-.65],.32]
 };
 for(const [id,v]of Object.entries(rows)){const [head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil]=v;C.rigs[id]={name:GEN5.species.find(p=>p.id===+id).en,head,arms,tail,feet,lean,crouch,step,reach,mouth,hand,leaf,recoil,ground:[0,0],body:[0,-.5]};}
 C.rigs['593-female']={...C.rigs[593],name:'Jellicent-Female',arms:1.13,tail:.83,crouch:.045,mouth:[.08,-.62],hand:[.4,-.3],leaf:[.01,-.87],recoil:.5};
 const recipes={30:'hornJab',56:'hydroJet',76:'energyBall',80:'dance',96:'focus',138:'drainStrong',153:'fireRing',156:'restore',267:'energyBall',285:'seal',288:'focus',302:'counterPalm',304:'soundWave',315:'flameJet',317:'rockVolley',319:'soundWave',363:'seed',367:'focus',369:'bodyRam',389:'ambush',395:'counterPalm',406:'psybeam',409:'counterPalm',413:'flyDive',416:'gigaRush',417:'focus',431:'bodyRam',437:'leafStorm',438:'vineWhip',439:'rockVolley',442:'headRam',477:'psywave',484:'bodyRam',524:'iceWind',529:'hornDrill',543:'headRam'};
 const parts={
  553:{front:{head:[0],left:[1],right:[2],feet:[3,4,7,8],tail:[5,6]},back:{head:[0],left:[1],right:[2],feet:[5,6],tail:[7,8]}},
  556:{front:{head:[0],left:[5,8],right:[12],feet:[11]},back:{head:[0],left:[1,2],right:[4,5,8],feet:[7]}},
  558:{front:{head:[0],left:[1],right:[2],feet:[4,5,6,7,8],shell:[3]},back:{right:[0],shell:[1],feet:[2,3,4,5]}},
  563:{front:{left:[7,10,13],right:[9,12,14]},back:{head:[0],left:[1,4],right:[2,5]}},
  576:{front:{head:[17,18,19],left:[20],right:[21]},back:{head:[17,18,19],left:[20],right:[21]}},
  593:{front:{head:[2],left:[3,6],right:[4,8],tail:[5]},back:{head:[0],left:[1,2],right:[4,5],tail:[3]}},
  598:{front:{shell:[7],left:[6,11],right:[8,10,12,13]},back:{shell:[5],left:[6,9],right:[7,8,10,11]}},
  606:{front:{head:[1],left:[2,5],right:[3,6],feet:[7,8]},back:{head:[0],left:[1,3],right:[2,5],feet:[6,7]}},
  608:{front:{head:[0],left:[1,2],right:[3]},back:{head:[0],left:[1,2],right:[3]}},
  611:{front:{head:[0,1,2],left:[5],right:[6],tail:[7,8],feet:[9,10]},back:{head:[0,1,2],left:[5],right:[6],tail:[7],feet:[8,9]}},
  619:{front:{head:[0],left:[2,3,6],right:[4,5,8],feet:[7,9],tail:[10]},back:{head:[0],left:[2,3,6],right:[4,5,8],feet:[7,9],tail:[10]}},
  621:{front:{head:[0,1],left:[5,6],right:[7,8],wings:[2,4],feet:[9,10,11,12],tail:[13]},back:{head:[1,2],left:[6],right:[3],wings:[0,4],feet:[7,8],tail:[9]}},
  623:{front:{head:[0],left:[2,4,6],right:[5,7],feet:[3]},back:{head:[0],left:[3,5],right:[4,6],feet:[2]}},
  624:{front:{head:[0],left:[3],right:[2],feet:[4,5,6,7,8]},back:{head:[0],left:[3],right:[4],feet:[5,6,7,8]}},
  626:{front:{head:[0,1,2,3,4],feet:[6,7,8,9,11],tail:[10]},back:{head:[0,1,2],feet:[4,5,6,7],tail:[8]}}
 };
 parts['593-female']=parts[593];
 function install(){
  const select=C.select,sample=C.sample,part=SpeciesMoves.part;
  C.select=(sid,id,context={})=>{const p=select(sid,id,context);if(!p)return p;if([153,484].includes(id)){const r=C.rigs[p.graphic]||C.rigs[p.species]||DemoMoves.rigs[p.species];if(r)r.body??=[0,-.5];}const overrides={...(id===76&&context.preparing?{preparing:true,target:'self',damage:false}:{}),...([153,484].includes(id)?{attachment:'body'}:{}),...([302,395,409].includes(id)?{attachment:'hand'}:{}),...(id===439||id===543||p.species===608&&GEN5.moves.find(m=>m.id===id)?.type==='Fuoco'?{attachment:'leaf'}:{}),...(p.species===606&&/psy|electric|seal/.test(p.kind)?{attachment:'hand'}:{})};return Object.keys(overrides).length?{...p,...overrides}:p;};
  C.sample=(p,f,side='p1',miss=false)=>{
   const a=sample(p,f,side,miss),r=C.rigs[p.graphic]||C.rigs[p.species];if(!rows[p.species])return a;const w=a.wind,t=a.t,beat=Math.sin(t*Math.PI*r.step),surge=Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.2)/.65)))*w;
   if(p.species===553){a.jaw+=.22*surge;a.tail+=.28*Math.sin(t*Math.PI*3)*w;a.arms+=.2*surge;}
   if(p.species===556){a.arms+=.4*Math.sin(t*Math.PI*6)*w;a.feet*=.4;a.head*=.55;}
   if(p.species===558){a.head*=.45;a.crouch*=.45;a.feet+=.3*beat*surge;a.arms+=.22*surge;}
   if(p.species===563){a.head*=.4;a.feet=0;a.arms+=.45*Math.sin(t*Math.PI*4)*w;a.lift+=.035*w;}
   if(p.species===576){a.arms+=.26*Math.sin(t*Math.PI*2)*w;a.feet*=.25;a.glare=Math.max(a.glare,.65*w);}
   if(p.species===593){a.arms+=.35*Math.sin(t*Math.PI*4)*w;a.tail+=.25*Math.sin(t*Math.PI*3)*w;a.feet=0;a.lift+=.045*w;}
   if(p.species===598){a.head=0;a.feet=0;a.crouch*=.3;a.arms+=.4*Math.sin(t*Math.PI*4)*w;}
   if(p.species===606){a.arms+=.27*Math.sin(t*Math.PI*3)*w;a.head*=.45;a.glare=Math.max(a.glare,.8*w);}
   if(p.species===608){a.head*=.4;a.feet=0;a.arms+=.2*Math.sin(t*Math.PI*4)*w;a.lift+=.025*w;}
   if(p.species===611){if(p.id===530){a.feet=0;a.head+=.23*Math.sin(t*Math.PI*6)*w;}a.head+=.08*surge;a.tail+=.25*Math.sin(t*Math.PI*3)*w;a.arms+=.15*surge;}
   if(p.species===619){if(p.id===512){const q=Math.max(0,Math.min(1,(t-.2)/.55));a.roll=a.dir*Math.PI*2*q*q*(3-2*q);a.lift+=.16*surge;}a.arms+=.4*Math.sin(t*Math.PI*(p.id===395?2:4))*w;a.feet+=.2*beat*surge;a.lean+=.035*Math.sin(t*Math.PI*4)*w;}
   if(p.species===621){a.arms+=.22*Math.sin(t*Math.PI*3)*w;a.tail+=.18*Math.sin(t*Math.PI*2)*w;a.head+=.045*surge;}
   if(p.species===623){if(p.kind==='flyDive'){a.arms=-r.arms*.22*w;a.feet=-r.feet*.4*w;}a.head*=.3;a.arms+=.35*Math.sin(t*Math.PI*2)*w;a.crouch*=.5;a.feet+=.12*beat*surge;}
   if(p.species===624){a.arms+=.28*Math.sin(t*Math.PI*4)*w;a.feet+=.15*beat*surge;a.lean+=.04*Math.sin(t*Math.PI*2)*w;}
   if(p.species===626){a.arms=0;a.head+=.12*surge;a.feet+=.22*beat*surge;a.tail+=.14*Math.sin(t*Math.PI*3)*w;}
   if(p.id===153){a.reach=0;a.crouch=-.12*Math.sin(t*Math.PI)*w;a.breath=.15*Math.sin(t*Math.PI)*w;}
   return a;
  };
  SpeciesMoves.part=(track,back,a)=>{const map=a&&parts[a.graphic||a.species]?.[back?'back':'front'];if(!map)return part(track,back,a);const role=Object.keys(map).find(k=>map[k].includes(track));if(!role)return null;const data=window.ROM_SPRITE_ANIM?.cache[(a.graphic||a.species)+'-'+(back?'back':'front')]?.data,pf=data?.parent?.[0]?.frames?.[0],rows=data?.maps?.[pf?.[0]||0],row=rows?.find(r=>r[0]===track),joint=rows?.find(r=>r[0]===map[role][0]);return {rotation:role==='head'?a.head*a.dir*.28:role==='tail'?a.tail*a.dir*.15:role==='left'?a.arms*.18:role==='right'?-a.arms*.18:role==='wings'?a.arms*(track%2?1:-1)*.09:role==='feet'?a.feet*(track%2?1:-1)*.18:a.lean*a.dir*.3,pivotX:joint&&row?joint[1]-row[1]:0,pivotY:joint&&row?joint[2]-row[2]:0};};
 }
 window.OpelucidMotion={rows,recipes,parts,install};
})();
