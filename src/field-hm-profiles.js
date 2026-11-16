/* Authored HD-2D field choreography, using original Pokémon part sheets.
 * Dimensions/contacts are world-sprite staging, not Pokédex measurements.
 * Native HM availability and mechanics remain with the story controllers. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 const profiles=new Map();
 const immersion={501:.28,502:.30,503:.32,507:.38,508:.38,515:.30,516:.32,531:.30,535:.20,536:.28,537:.32,550:.25,699:.25,564:.25,565:.30,580:.24,581:.28,592:.36,"592-female":.36,593:.38,"593-female":.38,594:.22,612:.32,613:.30,614:.38,618:.14,621:.34,626:.40,635:0};
 function rows(move,kind,table){for(const [graphic,height,seat,cadence,reach]of table){const species=typeof graphic==='string'?+graphic.split('-')[0]:graphic===699?550:graphic>=704&&graphic<=706?586:graphic;profiles.set(graphic+':'+move,Object.freeze({graphic,species,move,kind,height,seat,cadence,reach,immersion:move===57?immersion[graphic]:0}));}}
 // Contact is the fitted back/shoulder point, expressed above the opaque foot.
 rows(57,'paddle',[[501,1.65,.74,2.4,.15],[502,1.85,.76,2.6,.18],[503,2.35,.64,1.8,.25],[507,1.8,.65,2.5,.15],[508,2.2,.65,2.1,.22],[515,1.75,.7,2.8,.18],[516,2,.72,2.4,.2],[531,1.9,.72,1.7,.15],[536,1.65,.72,2.3,.14],[537,2.2,.72,1.8,.2],[564,1.7,.65,1.8,.12],[565,2.25,.67,1.6,.23],[613,1.65,.73,2.3,.13],[614,2.5,.71,1.8,.28],[612,2.5,.68,1.9,.24],[621,2.35,.7,1.7,.24],[626,2.3,.66,1.8,.22]]);
 rows(57,'tailSwim',[[535,1.35,.72,3.1,.12],[550,1.65,.65,3.3,.15],[699,1.65,.65,3.3,.15],[594,1.85,.67,2.2,.15],[618,1.45,.55,2.1,.12]]);
 rows(57,'waterBird',[[580,1.6,.66,2.5,.13],[581,2.2,.63,1.7,.21]]);
 rows(57,'bellSwim',[[592,1.8,.73,1.4,.13],['592-female',1.8,.73,1.4,.13],[593,2.5,.7,1.15,.22],['593-female',2.5,.7,1.15,.22]]);
 rows(57,'levitateSwim',[[635,2.65,.62,1.5,.25]]);
 rows(19,'wingFlight',[[519,1.65,.62,3.5,.12],[520,1.95,.62,3,.16],[521,2.25,.6,2.7,.2],['521-female',2.15,.63,2.8,.19],[527,1.8,.66,3.6,.14],[528,2.1,.65,3.2,.18],[561,2.35,.62,2.1,.19],[567,2.45,.63,2.4,.22],[580,1.75,.65,3.3,.13],[581,2.4,.62,2.3,.2],[629,1.85,.65,3,.14],[630,2.4,.64,2.3,.22],[635,2.75,.6,2.2,.24],[643,3,.61,2.1,.3],[644,3,.6,2,.3]]);
 rows(19,'rocketFlight',[[623,3,.64,1.4,.26]]);
 // Cut uses the species' actual cutting anatomy, not a generic body lunge.
 rows(15,'leafCut',[[495,1.45,.6,2,.24],[496,1.85,.6,1.8,.3],[497,2.5,.6,1.4,.4],[540,1.2,.6,2.4,.18],[541,1.35,.6,1.8,.2],[542,2.2,.6,2.1,.35],[548,1.25,.6,2,.2],[549,1.9,.6,1.9,.3],[598,1.8,.6,1.5,.36]]);
 rows(15,'shellCut',[[501,1.55,.6,2.4,.25],[502,1.8,.6,2.5,.32],[503,2.3,.6,1.8,.38],[557,1.4,.6,2,.22],[558,2.2,.6,1.5,.3],[588,1.3,.6,2.4,.22],[589,2.1,.6,1.8,.38]]);
 rows(15,'clawCut',[[504,1.4,.6,2.5,.23],[505,1.9,.6,2.1,.3],[509,1.55,.6,2.8,.25],[510,2,.6,2.4,.32],[511,1.5,.6,2.4,.25],[512,2,.6,2.1,.33],[513,1.5,.6,2.5,.25],[514,2,.6,2,.33],[515,1.5,.6,2.5,.25],[516,2,.6,2.2,.33],[529,1.5,.6,2.7,.32],[530,2.2,.6,2.2,.42],[551,1.45,.6,2.2,.26],[552,1.9,.6,2,.33],[553,2.5,.6,1.8,.4],[566,1.5,.6,2.8,.25],[567,2.4,.6,2.1,.34],[571,2.3,.6,2.2,.38],[587,1.4,.6,2.8,.22],[613,1.55,.6,2.4,.25],[614,2.5,.6,1.7,.4],[621,2.35,.6,1.8,.38],[631,2.1,.6,1.9,.35],[643,3,.6,1.5,.42],[644,3,.6,1.4,.42]]);
 rows(15,'mandibleCut',[[545,2.3,.6,1.8,.33],[595,1.1,.6,3.2,.18],[596,1.8,.6,2.6,.28],[632,1.45,.6,2.8,.26]]);
 rows(15,'finCut',[[550,1.6,.6,3,.27],[699,1.6,.6,3,.27],[604,2.4,.6,2,.35]]);
 rows(15,'hornCut',[[586,2.35,.6,1.8,.38],[704,2.35,.6,1.8,.38],[705,2.35,.6,1.8,.38],[706,2.35,.6,1.8,.38],[610,1.55,.6,2.4,.27],[611,2.05,.6,2,.34],[612,2.6,.6,1.7,.42],[624,1.65,.6,2.5,.3],[625,2.35,.6,2,.4],[626,2.35,.6,1.6,.38]]);
 rows(15,'beakCut',[[629,1.8,.6,2.5,.26],[630,2.3,.6,2,.34]]);
 function profile(mon,move){const graphic=root.PokemonVisuals?.graphic(mon)??mon.graphic??mon.id;return profiles.get(graphic+':'+move)||null;}
 for(const [key,p]of profiles)profiles.set(key,Object.freeze({...p,choreography:root.FieldHMChoreography.get(p.graphic,p.move)}));
 function fit(p,out){out.bodyScaleX=1+out.stretch+out.crouch*.32;out.bodyScaleY=1+out.squash-out.crouch;out.seat=out.height*p.seat*out.bodyScaleY;return out;}
 function sample(p,time,{phase='cruise',progress=0,direction=1,moving=true,cycle=null}={}){
  if(!p)throw Error('Profilo MN sul campo mancante');
  const t=clamp(progress),u=cycle===null?((time*p.cadence)%1+1)%1:clamp(cycle);
  const actualPhase=p.move===15?'cut':p.move===19?(['depart','arrive'].includes(phase)?phase:'cruise'):['board','land','idle','swim'].includes(phase)?phase:moving?'swim':'idle';
  const pose=root.FieldHMChoreography.sample(p.choreography,actualPhase,['cruise','swim','idle'].includes(actualPhase)?u:t);
  if(p.move===19&&actualPhase!=='cruise'){const airborne=actualPhase==='depart'?ease(clamp((t-.35)/.15)):1-ease(clamp((t-.5)/.15)),weight=.65*airborne,cruise=root.FieldHMChoreography.sample(p.choreography,'cruise',u);for(const key of ['arms','wings','tail','sideHeads'])pose[key]=pose[key]*(1-weight)+cruise[key]*weight;}
  const out={graphic:p.graphic,species:p.species,direction,back:direction===0,flip:direction===3,height:p.height,seat:p.height*p.seat,bob:0,reach:0,scale:1,phase:actualPhase,...pose};
  fit(p,out);
  if(p.move===57){out.bob=-p.height*p.immersion+.015*Math.sin(u*Math.PI*2);if(p.kind==='levitateSwim')out.bob+=.25;}
  out.seat=out.height*p.seat*out.bodyScaleY;
  if(p.move===15){out.reach=p.reach*Math.sin(Math.PI*t);out.contact=t>=.47&&t<=.61;}
  out.choreography=p.choreography.id;return out;
 }
 const api={profiles,profile,sample,fit};root.FieldHMProfiles=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
