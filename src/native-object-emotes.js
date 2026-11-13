/* Original16px object markers, native7-tick bounce followed by30-tick hold.
 * Their offset is in camera space, as in IRBI021bb698, not world vertical.
 */
(function(root){
 const data=root.NATIVE_OBJECT_EMOTES,names={};
 for(const [kind,record]of Object.entries(data.models)){const name='Marcatore originale '+kind;names[kind]=name;root.OPENING_SPRITES[name]=[record.src];}
 const kind=code=>data.movements[code];
 function resources(sequence){return [...new Set(sequence.map(([code])=>kind(code)).filter(k=>k!==undefined))].map(k=>({name:names[k]}));}
 function sounds(sequence){return [...new Set(sequence.map(([code])=>data.models[kind(code)]?.sound).filter(Number.isInteger))];}
 function visual(body,code,elapsed,view={}){
  const k=kind(code),tick=Math.floor(elapsed*30+1e-8);if(k===undefined||!body||body.hidden||tick<0||tick>=data.frames)return null;
  const [sin,cos]=view.pitch||[.423,.906],yaw=view.yaw||0,offset=data.offset+(tick===0?0:data.bounce[Math.min(tick-1,data.bounce.length-1)]||0);
  return {name:names[k],frame:0,x:body.x-offset*sin*Math.sin(yaw),z:body.y-offset*sin*Math.cos(yaw),height:(body.height||0)+offset*cos,worldWidth:1,worldHeight:1,noShadow:true,nativeBillboard:true};
 }
 root.NativeObjectEmotes={kind,resources,sounds,visual,frames:data.frames,sound:code=>data.models[kind(code)]?.sound};
})(typeof window==='undefined'?globalThis:window);
