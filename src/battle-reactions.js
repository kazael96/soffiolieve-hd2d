/* Defender choreography shares each species' verified anatomical rig. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const rigs={495:'SpeciesMoves',498:'TepigMoves',501:'OshawottMoves',504:'PatratMoves',506:'LillipupMoves'};
 function sample(p,f,side,id,miss=false){if(!p||miss||!rigs[id]||p.id===117&&p.phase!==1)return null;const age=f-p.impact,duration=[39,43,316].includes(p.id)?38:p.id===35?54:32;if(age<0||age>duration)return null;const u=age/duration,envelope=Math.sin(Math.PI*ease(u)),dir=side==='p1'?1:-1,kind=p.id===43?'intimidated':p.id===39?'distracted':p.id===316?'alert':p.id===52?'fire':p.id===55?'water':p.id===44?'bite':p.id===35?'constricted':p.id===22?'whip':p.id===117?'release':'impact',status=['intimidated','distracted','alert'].includes(kind),strength=({495:.9,498:.65,501:.8,504:1,506:.85})[id],q=envelope*strength;
 const a={species:+id,reaction:true,kind,dir,t:u,wind:q,hit:q,lean:0,crouch:0,reach:0,lift:0,head:0,tail:0,arms:0,feet:0,coil:0,glare:0,ears:0,sniff:0,breath:0,cheeks:0,hip:0,jaw:0};
 if(status){a.head=(kind==='alert'?Math.sin(u*Math.PI*3)*.1:kind==='distracted'?.1:-.12)*q;a.tail=-.18*q;a.ears=-.2*q;a.crouch=kind==='intimidated'?.045*q:0;}
 else{a.head=(kind==='bite'?.17:-.14)*q;a.arms=(kind==='fire'?.4:kind==='water'?.3:.16)*q;a.tail=-.24*q;a.ears=-.26*q;a.crouch=(kind==='constricted'?.12:.075)*q;a.feet=.09*Math.sin(u*Math.PI*2)*q;a.hip=-.05*q;a.cheeks=kind==='water'?.025*q:0;}
 a.recoil=status?0:(kind==='release'?.13:kind==='bite'?.04:.075)*q;a.rotation=status?0:-dir*(kind==='constricted'?.025:.07)*q;return a;}
 function pose(a,layout,side){if(!a)return null;const h=layout[side].height,s=Math.min(layout[side].w/1000,layout[side].h/650);return{x:-a.dir*a.recoil*h/s,y:0,groundY:0,rotation:a.rotation,scale:1,alpha:1,scaleX:1+a.crouch*.3,scaleY:1-a.crouch,pauseAnimation:true,reaction:a.kind};}
 const api={sample,pose,rigs};root.BattleReactions=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
