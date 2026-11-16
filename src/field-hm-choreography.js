/* Individually authored scores; interpolation and native physics are shared.
 * Field joint maps are deliberately separate from the battle articulation. */
(function(root){
 'use strict';
 const channels=['lean','head','arms','feet','tail','crouch','stretch','squash','jets','wings','sideHeads'];
 const catalogs={15:root.FieldHMCutChoreographies,19:root.FieldHMFlyChoreographies,57:root.FieldHMSurfChoreographies};
 const anatomyCatalogs=()=>[root.FieldHMCutAnatomy,root.FieldHMFlyAnatomy,root.FieldHMSurfAnatomy];
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x),nativeRows=new WeakMap();
 function freeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.values(value).forEach(freeze);return Object.freeze(value);}
 for(const [move,catalog]of Object.entries(catalogs)){
  if(!catalog)throw Error('Catalogo coreografie MN mancante: '+move);
  for(const [graphic,score]of Object.entries(catalog)){
   if(!score.id||!score.title||!Array.isArray(score.beats)||score.beats.length<3)throw Error('Descrizione coreografia incompleta: '+graphic+':'+move);
   for(const phase of +move===15?['cut']:+move===19?['depart','arrive','cruise']:['board','swim','idle','land']){
    const frames=score[phase];if(!Array.isArray(frames)||frames.length<4||frames[0][0]!==0||frames.at(-1)[0]!==1)throw Error('Fasi coreografia incomplete: '+graphic+':'+phase);
    let previous=-1;for(const [time,pose]of frames){if(!Number.isFinite(time)||time<=previous||time<0||time>1)throw Error('Tempo coreografia non valido');previous=time;for(const [key,value]of Object.entries(pose))if(!channels.includes(key)||!Number.isFinite(value))throw Error('Giunto coreografia non valido: '+key);}
   }
   freeze(score);
  }
  freeze(catalog);
 }
 function get(graphic,move){const score=catalogs[move]?.[graphic];if(!score)throw Error('Coreografia MN assente: '+graphic+':'+move);return score;}
 function sample(score,phase,progress){const frames=score[phase];if(!frames)throw Error('Fase MN assente: '+score.id+':'+phase);const t=clamp(progress);let i=1;while(i<frames.length-1&&frames[i][0]<t)i++;const [from,a]=frames[i-1],[to,b]=frames[i],u=ease(clamp((t-from)/(to-from))),pose={};for(const key of channels)pose[key]=(a[key]||0)+((b[key]||0)-(a[key]||0))*u;return pose;}
 function anatomy(graphic){for(const catalog of anatomyCatalogs())if(catalog?.[graphic])return catalog[graphic];return null;}
 function rows(data){let cached=nativeRows.get(data);if(!cached){const frame=root.ROM_SPRITE_ANIM?.frame?.(data.parent?.[0],0)||data.parent?.[0]?.frames?.[0],active=data.maps?.[frame?.[0]]||data.maps?.[0]||[];cached=new Map(active.map(row=>[row[0],row]));nativeRows.set(data,cached);}return cached;}
 function part(track,back,a,data){
  const map=anatomy(a.graphic)?.[back?'back':'front'];if(!map)throw Error('Anatomia MN assente: '+a.graphic+':'+(back?'back':'front'));
  const role=Object.keys(map).find(key=>Array.isArray(map[key])&&map[key].includes(track));if(!role||role==='body'||role==='shell')return null;
  const index=map[role].indexOf(track),r=rows(data),row=r.get(track),joint=r.get(map[role].find(id=>r.has(id)));
  const wings=([635,644].includes(+a.species)?0:a.arms*.18)+(a.wings||0);
  const rotation=role==='head'?a.head*a.dir*.28:role==='headLeft'?(a.head+a.sideHeads)*a.dir*.25:role==='headRight'?(a.head-a.sideHeads)*a.dir*.25:role==='left'?a.arms*.18:role==='right'?-a.arms*.18:role==='wingLeft'?wings:role==='wingRight'?-wings:role==='footLeft'?a.feet*.16:role==='footRight'?-a.feet*.16:role==='feet'?a.feet*.16:role==='tail'?a.tail*a.dir*.14:role==='mane'?a.head*a.dir*.12:role==='ears'?a.head*a.dir*.1:0;
  const bounds=root.ROM_SPRITE_ANIM?.cache[a.graphic+'-'+(back?'back':'front')]?.groundBounds,pairedRocketFeet=+a.species===623&&role==='feet';return {rotation:pairedRocketFeet?0:rotation,y:pairedRocketFeet&&bounds?-Math.max(0,-a.feet)*(bounds[3]-bounds[1])*.03:0,pivotX:joint&&row?joint[1]-row[1]:0,pivotY:joint&&row?joint[2]-row[2]+(role==='head'?4:0):0};
 }
 function supportedChannels(graphic,back=false){const map=anatomy(graphic)?.[back?'back':'front'];if(!map)throw Error('Anatomia MN mancante: '+graphic);const keys=new Set(['lean','crouch','stretch','squash']);for(const [role,ids]of Object.entries(map)){if(!Array.isArray(ids)||!ids.length)continue;if(['head','headLeft','headRight','ears','mane'].includes(role))keys.add('head');if(['headLeft','headRight'].includes(role))keys.add('sideHeads');if(['left','right'].includes(role))keys.add('arms');if(['wingLeft','wingRight'].includes(role)){keys.add('wings');if(![635,644].includes(+String(graphic).split('-')[0]))keys.add('arms');}if(['feet','footLeft','footRight'].includes(role))keys.add('feet');if(role==='tail')keys.add('tail');}return [...keys];}
 for(const catalog of anatomyCatalogs())if(catalog)freeze(catalog);
 root.FieldHMChoreography={get,sample,anatomy,part,supportedChannels,channels};
 if(typeof module!=='undefined')module.exports=root.FieldHMChoreography;
})(typeof window==='undefined'?globalThis:window);
