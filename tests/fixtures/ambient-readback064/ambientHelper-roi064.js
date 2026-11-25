 const ambientReadbackOwners=new WeakMap();
 const ambientReadbackDrawText="function draw(c,id,back,x,y,size,tick,grounded=false,speciesPose){const key=id+'-'+(back?'back':'front');drawing.add(key);try{const s=load(key);if(!s.ready)return false;let b=grounded?s.groundBounds:s.bounds,scale=80*size/Math.max(1,b[3]-b[1]);c.save();c.imageSmoothingEnabled=false;c.translate(x,y);c.scale(scale,scale);c.translate(-(b[0]+b[2])/2,-b[3]);renderParts(c,s.data,s.image,speciesPose?(Number.isFinite(speciesPose.nativeTick)?speciesPose.nativeTick:0):tick,speciesPose,back);c.restore();pruneLayers();return true;}finally{drawing.delete(key);}}",ambientReadbackWingDrawText="function(context,id,back,x,y,size,tick,grounded=false,a){if(id==='521')id=521;const wing=a?.unfezantPaintedWing;if(![521,'521-female'].includes(id)||!wing||wing.native)return original.draw(context,id,back,x,y,size,tick,grounded,a);if(!graphicReady(id))throw Error('Unfezant Gust resources require complete preparation');const bank=R.cache[id+'-'+(back?'back':'front')];if(!bank?.ready)throw Error('Unfezant Gust native bank is unavailable');const bounds=grounded?bank.groundBounds:bank.bounds,scale=80*size/Math.max(1,bounds[3]-bounds[1]);stats.taggedDraws++;const paint=near=>{const joint=near?(back?[12,-44]:[0,-45]):(back?[-3,-42]:[-10,-44]),bitmap=surface(back,near,wing);context.save();context.imageSmoothingEnabled=false;context.translate(x,y);context.scale(scale,scale);context.translate(-(bounds[0]+bounds[2])/2,-bounds[3]);context.drawImage(bitmap,joint[0]-64,joint[1]-64);context.restore();};paint(false);const pose={...a,unfezantGraphic:id,unfezantRenderPass:'body'};original.draw(context,id,back,x,y,size,tick,grounded,pose);paint(true);original.draw(context,id,back,x,y,size,tick,grounded,{...pose,unfezantRenderPass:'foreground'});if(back){context.save();context.beginPath();context.rect(-10000,-10000,20000,y+scale*(-48-bounds[3])+10000);context.clip();original.draw(context,id,back,x,y,size,tick,grounded,{...pose,unfezantRenderPass:'face'});context.restore();}return true;}",ambientReadbackBoundsText="function bounds(data,tick=0){let xs=[],ys=[];for(let {r,f,o,pf} of parts(data,tick))for(let x of [o[0],o[0]+o[2]])for(let y of [o[1],o[1]+o[3]]){let q=point(x,y,f);q=point(q[0]+r[1],q[1]+r[2],pf);xs.push(q[0]);ys.push(q[1])}return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]}";
 function bindAmbientReadback(actor){
  const r=window.ROM_SPRITE_ANIM,s=window.SpeciesMoves,c=actor.frameContext,clip=c.clip;
  const owner={r,s,draw:r?.draw,bounds:r?.bounds,parts:r?.parts,frame:r?.frame,alpha:r?.alphaBounds,part:s?.part,poisoned:false,clip:null};
  const drawText=typeof owner.draw==='function'?Function.prototype.toString.call(owner.draw):'';owner.wing=drawText===ambientReadbackWingDrawText?window.UnfezantMoves:null;
  owner.recognized=(drawText===ambientReadbackDrawText||!!owner.wing)&&typeof owner.bounds==='function'&&Function.prototype.toString.call(owner.bounds)===ambientReadbackBoundsText;
  if(typeof clip==='function'){owner.clip=function(...args){owner.poisoned=true;return Reflect.apply(clip,this,args);};c.clip=owner.clip;}
  ambientReadbackOwners.set(actor,owner);
 }
 function ambientReadbackBounds(actor,tick,nativeDrawn){
  const {size,foot,body}=ambientCanvas,c=actor.frameContext,r=window.ROM_SPRITE_ANIM,s=window.SpeciesMoves,o=ambientReadbackOwners.get(actor);
  let rect=[0,0,size,size];
  try{
   const m=c.getTransform(),bank=r?.cache?.[actor.id+'-front'],gb=bank?.groundBounds;
   if(nativeDrawn&&(actor.id===504||actor.id===506)&&size===256&&actor.frame.width===256&&actor.frame.height===256&&actor.source.width===256&&actor.source.height===256&&
      o?.recognized&&(!o.wing||window.UnfezantMoves===o.wing)&&!o.poisoned&&o.clip&&c.clip===o.clip&&r===o.r&&s===o.s&&r.draw===o.draw&&r.bounds===o.bounds&&r.parts===o.parts&&r.frame===o.frame&&r.alphaBounds===o.alpha&&s?.part===o.part&&
      bank?.ready&&bank.data&&Array.isArray(gb)&&gb.length===4&&gb.every(Number.isFinite)&&gb[3]>gb[1]&&
      m.a===1&&m.b===0&&m.c===0&&m.d===1&&m.e===0&&m.f===0&&c.filter==='none'&&c.shadowBlur===0&&c.shadowOffsetX===0&&c.shadowOffsetY===0&&c.globalCompositeOperation==='source-over'){
    const b=r.bounds(bank.data,tick),scale=body/Math.max(1,gb[3]-gb[1]),cx=(gb[0]+gb[2])/2;
    if(b.length===4&&b.every(Number.isFinite)&&b[2]>=b[0]&&b[3]>=b[1]){
     const l=Math.max(0,Math.floor(size/2+(b[0]-cx)*scale)-2),t=Math.max(0,Math.floor(foot+(b[1]-gb[3])*scale)-2);
     const right=Math.min(size,Math.ceil(size/2+(b[2]-cx)*scale)+2),bottom=Math.min(size,Math.ceil(foot+(b[3]-gb[3])*scale)+2);
     if(right>l&&bottom>t)rect=[l,t,right-l,bottom-t];
    }
   }
  }catch{}
  const [l,t,w,h]=rect,b=r?.alphaBounds(c.getImageData(l,t,w,h).data,w,h);
  return b?.map((v,i)=>v+(i%2?t:l));
 }

