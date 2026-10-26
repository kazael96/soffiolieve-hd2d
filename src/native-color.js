/* Nintendo DS RGB555 arithmetic, applied before expansion to browser RGBA8. */
(function(root){
 const clamp=value=>Math.max(0,Math.min(16,Math.trunc(value)));
 const to5=value=>Math.max(0,Math.min(31,Math.round(value*31/255)));
 const to8=value=>Math.floor(value*255/31);
 function component(front,back,eva,evb){return to8(Math.min(31,(to5(front)*clamp(eva)+to5(back)*clamp(evb))>>4));}
 function blend(front,back,eva,evb=16-eva){
  if(front.length!==back.length||front.length%4)throw Error('RGB555 layer dimensions differ');
  const result=new Uint8ClampedArray(front.length);
  for(let i=0;i<front.length;i+=4){for(let c=0;c<3;c++)result[i+c]=front[i+3]?component(front[i+c],back[i+c],eva,evb):back[i+c];result[i+3]=front[i+3]?255:0;}
  return result;
 }
 function interpolate(from,to,factor){if(from.length!==to.length||from.length%4)throw Error('RGB555 layer dimensions differ');factor=Math.max(0,Math.min(4096,Math.trunc(factor)));const result=new Uint8ClampedArray(from.length);for(let i=0;i<from.length;i+=4){for(let c=0;c<3;c++){const a=to5(from[i+c]),b=to5(to[i+c]);result[i+c]=to8(a+(((b-a)*factor)>>12));}result[i+3]=from[i+3];}return result;}
 function darken(pixels,value){value=clamp(value);const result=new Uint8ClampedArray(pixels.length);for(let i=0;i<pixels.length;i+=4){for(let c=0;c<3;c++)result[i+c]=to8((to5(pixels[i+c])*value)>>4);result[i+3]=pixels[i+3];}return result;}
 const api={component,blend,interpolate,darken};root.NativeColor=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
