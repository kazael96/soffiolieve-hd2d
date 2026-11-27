 function ambientPose(actor,tick){
  const {size,foot,body}=ambientCanvas,ctx=actor.frameContext;ctx.clearRect(0,0,size,size);
  const nativeDrawn=window.ROM_SPRITE_ANIM?.draw(ctx,actor.id,false,size/2,foot,body/80,tick,true);if(!nativeDrawn){const im=actor.original.image,b=window.ROM_SPRITE_ANIM?.imageBounds(im)||[0,0,im.width,im.height],width=body*(b[2]-b[0])/(b[3]-b[1]);ctx.drawImage(im,b[0],b[1],b[2]-b[0],b[3]-b[1],size/2-width/2,foot-body,width,body);}
  const bounds=ambientReadbackBounds(actor,tick,nativeDrawn),lift=Math.max(0,(bounds?.[3]||foot)-foot);actor.ctx.clearRect(0,0,size,size);actor.ctx.drawImage(actor.frame,0,-lift);actor.bounds=bounds?.map((v,i)=>v-(i%2?lift:0));actor.clipped=!!bounds&&(bounds[0]<=0||bounds[1]<=0||bounds[2]>=size||bounds[3]>=size);return {bounds:actor.bounds,clipped:actor.clipped,visibility:actor.visibility};
 }
