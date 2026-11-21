/* Individually authored scores; interpolation and native physics are shared.
 * Field joint maps are deliberately separate from the battle articulation. */
(function(root){
 'use strict';
 const surfHeadPosture064={"501":{"front":[-6,8],"back":[4,2]},"502":{"front":[-6,10],"back":[5,3]},"531":{"front":[-8,12],"back":[5,3]},"613":{"front":[-8,4],"back":[7,3]},"515":{"front":[-6,8],"back":[6,2]},"516":{"front":[-6,8],"back":[6,2]}};
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
  const bounds=root.ROM_SPRITE_ANIM?.cache[a.graphic+'-'+(back?'back':'front')]?.groundBounds,pairedRocketFeet=+a.species===623&&role==='feet',headPosture=+a.fieldMove===57&&role==='head'?surfHeadPosture064[a.graphic]?.[back?'back':'front']:null,postureWeight=[501,502,531,613].includes(+a.graphic)?clamp(a.surfPosture??1):1;return {rotation:pairedRocketFeet?0:rotation,x:(headPosture?.[0]||0)*postureWeight,y:(pairedRocketFeet&&bounds?-Math.max(0,-a.feet)*(bounds[3]-bounds[1])*.03:0)+(headPosture?.[1]||0)*postureWeight+(+a.fieldMove===57&&+a.graphic===613&&!back&&track===6?3*postureWeight:0),pivotX:joint&&row?joint[1]-row[1]:0,pivotY:joint&&row?joint[2]-row[2]+(role==='head'?4:0):0};
 }
 // Opaque native tips, from actual source tracks. Rear coordinates are independently read.
 const cutTips064={"495":{"front":[9,21.5,-14.5],"back":[8,-23.5,-13.5]},"496":{"front":[4,14.5,-3.5],"back":[5,-16.5,5.5]},"497":{"front":[9,-10.5,-12.5],"back":[9,-23.5,-19.5]},"502":{"front":[34,-8.5,-1.5],"back":[26,-16.5,4.5]},"503":{"front":[15,0.5,1.5],"back":[11,1.5,-1.5]},"504":{"front":[3,-1.5,1.5],"back":[3,-3.5,0.5]},"505":{"front":[5,-6.5,-8.5],"back":[5,6.5,-10.5]},"509":{"front":[13,-1.5,-11.5],"back":[15,-0.5,13.5]},"510":{"front":[41,-12.5,27.5],"back":[39,5.5,30.5]},"511":{"front":[7,-13.5,3.5],"back":[5,-13.5,-2.5]},"512":{"front":[8,-17.5,9.5],"back":[7,-17.5,3.5]},"513":{"front":[2,-12.5,7.5],"back":[2,12.5,8.5]},"514":{"front":[3,-19.5,5.5],"back":[3,25.5,5.5]},"515":{"front":[6,-14.5,9.5],"back":[7,-16.5,6.5]},"516":{"front":[15,-26.5,1.5],"back":[15,-23.5,1.5]},"529":{"front":[6,5.5,-17.5],"back":[5,16.5,-28.5]},"530":{"front":[16,28.5,36.5],"back":[16,27.5,34.5]},"540":{"front":[6,-15.5,-5.5],"back":[3,16.5,-6.5]},"541":{"front":[3,-9.5,2.5],"back":[0,15.5,4.5]},"542":{"front":[6,-20.5,15.5],"back":[4,21.5,17.5]},"545":{"front":[56,-25.5,-20.5],"back":[49,20.5,-20.5]},"548":{"front":[6,-3.5,-18.5],"back":[6,3.5,-16.5]},"549":{"front":[23,-21.5,-1.5],"back":[14,-14.5,12.5]},"550":{"front":[6,4.5,-6.5],"back":[6,-11.5,-6.5]},"551":{"front":[5,-13.5,0.5],"back":[1,21.5,-2.5]},"552":{"front":[1,-9.5,3.5],"back":[2,10.5,3.5]},"553":{"front":[1,28.5,14.5],"back":[9,6.5,4.5]},"557":{"front":[1,-9.5,7.5],"back":[1,12.5,7.5]},"558":{"front":[2,-6.5,14.5],"back":[0,19.5,7.5]},"566":{"front":[1,-21.5,9.5],"back":[1,24.5,6.5]},"567":{"front":[2,-20.5,-33.5],"back":[4,-19.5,-30.5]},"571":{"front":[21,-16.5,10.5],"back":[15,9.5,-20.5]},"586":{"front":[0,-11.5,-26.5],"back":[0,-7.5,-29.5]},"587":{"front":[3,-10.5,-6.5],"back":[4,5.5,7.5]},"588":{"front":[7,0.5,-42.5],"back":[4,-6.5,-42.5]},"589":{"front":[19,-24.5,29.5],"back":[18,34.5,14.5]},"595":{"front":[6,-12.5,0.5],"back":[6,14.5,-19.5]},"596":{"front":[0,-14.5,-1.5],"back":[0,13.5,-2.5]},"598":{"front":[11,13.5,28.5],"back":[11,10.5,30.5]},"604":{"front":[24,-45.5,-7.5],"back":[24,-23.5,-15.5]},"610":{"front":[0,-15.5,-1.5],"back":[0,16.5,2.5]},"611":{"front":[2,-18.5,3.5],"back":[0,30.5,5.5]},"612":{"front":[0,-13.5,-4.5],"back":[0,13.5,-2.5]},"613":{"front":[6,2.5,-5.5],"back":[5,-1.5,-5.5]},"614":{"front":[8,-18.5,-10.5],"back":[8,-16.5,-7.5]},"621":{"front":[7,-26.5,10.5],"back":[8,28.5,13.5]},"624":{"front":[3,-18.5,0.5],"back":[3,2.5,7.5]},"625":{"front":[0,-2.5,-13.5],"back":[0,2.5,-12.5]},"626":{"front":[1,-5.5,-21.5],"back":[0,-7.5,-14.5]},"629":{"front":[0,-7.5,-2.5],"back":[0,8.5,-2.5]},"630":{"front":[2,-23.5,-5.5],"back":[0,10.5,-1.5]},"631":{"front":[7,-17.5,8.5],"back":[8,2.5,7.5]},"632":{"front":[11,-12.5,-3.5],"back":[12,12.5,-2.5]},"643":{"front":[12,-26.5,-35.5],"back":[14,-29.5,-6.5]},"644":{"front":[4,-31.5,29.5],"back":[3,-4.5,35.5]},"699":{"front":[6,4.5,-6.5],"back":[6,-5.5,-9.5]},"704":{"front":[2,16.5,-32.5],"back":[1,13.5,-35.5]},"705":{"front":[1,-12.5,-33.5],"back":[2,-10.5,-34.5]},"706":{"front":[0,-10.5,-26.5],"back":[0,-9.5,-28.5]}};
 function nativePoint064(q,f){const a=f[2]*Math.PI*2/65536,x=q[0]*f[3]/4096,y=q[1]*f[4]/4096;return [f[5]+x*Math.cos(a)-y*Math.sin(a),f[6]+x*Math.sin(a)+y*Math.cos(a)];}
 function cutAnchor(graphic,back,pose,data){
  const tip=cutTips064[graphic]?.[back?'back':'front'];if(!tip)throw Error('Contatto Taglio nativo assente: '+graphic);
  const pf=root.ROM_SPRITE_ANIM.frame(data.parent[0],0),r=data.maps[pf[0]].find(row=>row[0]===tip[0]);if(!r)throw Error('Arto Taglio nativo assente: '+graphic);const f=root.ROM_SPRITE_ANIM.frame(data.animations[tip[0]],0),joint=part(tip[0],back,pose,data);let q=nativePoint064(tip.slice(1),f),rotation=(pf[2]+f[2])*Math.PI*2/65536;
  if(joint){const px=joint.pivotX||0,py=joint.pivotY||0,x=(q[0]-px)*(joint.scaleX??1),y=(q[1]-py)*(joint.scaleY??1),a=joint.rotation||0;q=[px+(joint.x||0)+x*Math.cos(a)-y*Math.sin(a),py+(joint.y||0)+x*Math.sin(a)+y*Math.cos(a)];rotation+=a;}
  q=nativePoint064([q[0]+r[1],q[1]+r[2]],pf);return {x:q[0],y:q[1],rotation,track:tip[0]};
 }
 function riderAnchor(graphic,back,contact,data){
  if(!anatomy(graphic)?.[back?'back':'front']?.body?.includes(contact[0]))throw Error('Contatto cavaliere non appartiene al torso: '+graphic);
  const pf=root.ROM_SPRITE_ANIM.frame(data.parent[0],0),r=data.maps[pf[0]].find(row=>row[0]===contact[0]);if(!r)throw Error('Torso cavaliere nativo assente: '+graphic);
  const f=root.ROM_SPRITE_ANIM.frame(data.animations[contact[0]],0),q=nativePoint064(contact.slice(1),f),point=nativePoint064([q[0]+r[1],q[1]+r[2]],pf);return {x:point[0],y:point[1],track:contact[0]};
 }
 function supportedChannels(graphic,back=false){const map=anatomy(graphic)?.[back?'back':'front'];if(!map)throw Error('Anatomia MN mancante: '+graphic);const keys=new Set(['lean','crouch','stretch','squash']);for(const [role,ids]of Object.entries(map)){if(!Array.isArray(ids)||!ids.length)continue;if(['head','headLeft','headRight','ears','mane'].includes(role))keys.add('head');if(['headLeft','headRight'].includes(role))keys.add('sideHeads');if(['left','right'].includes(role))keys.add('arms');if(['wingLeft','wingRight'].includes(role)){keys.add('wings');if(![635,644].includes(+String(graphic).split('-')[0]))keys.add('arms');}if(['feet','footLeft','footRight'].includes(role))keys.add('feet');if(role==='tail')keys.add('tail');}return [...keys];}
 for(const catalog of anatomyCatalogs())if(catalog)freeze(catalog);
 root.FieldHMChoreography={get,sample,anatomy,part,cutAnchor,riderAnchor,supportedChannels,channels};
 if(typeof module!=='undefined')module.exports=root.FieldHMChoreography;
})(typeof window==='undefined'?globalThis:window);
