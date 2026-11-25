'use strict';
// CPU Skia Canvas from the already bundled runtime. Only original decoded RGBA
// is adapted to the Canvas drawImage input type; no synthetic anatomy/bounds.
const moduleRoot=process.env.SOFFIOLIEVE_CANVAS_MODULE||'@napi-rs/canvas';
const native=require(moduleRoot);
function document2d(){const converted=new WeakMap();return{createElement(tag){if(tag!=='canvas')throw Error('Preparation expects Canvas');const canvas=native.createCanvas(1,1),context=canvas.getContext('2d'),draw=context.drawImage;
 context.drawImage=function(image,...args){let source=image;if(image.data&&typeof image.getContext!=='function'){if(!converted.has(image)){const c=native.createCanvas(image.width,image.height),ctx=c.getContext('2d'),rgba=new Uint8ClampedArray(image.data);ctx.putImageData(new native.ImageData(rgba,image.width,image.height),0,0);converted.set(image,c);}source=converted.get(image);}return draw.call(this,source,...args);};return canvas;}};}
function install(context){const old=context.document,next=document2d();context.document={...old,createElement(tag){return tag==='canvas'?next.createElement(tag):old.createElement(tag);}};return context.document;}
module.exports={document2d,install,backend:'@napi-rs/canvas CPU Skia; no browser/GPU',moduleRoot};
