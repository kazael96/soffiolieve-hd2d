/* Same narrow RGBA/preparation fixture as the source-rig unit test. Does not
 * emulate transformed battle pixels or PCM. The composed test loads the real
 * MoveFX/GameSpeed and exact battle-UI command function on top of this host. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.resolve(__dirname,'../../src/unfezant-moves.js'),'utf8'),reference=require('../fixtures/unfezant-gust064-reference.json'),png=require('./native-png.cjs');
const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../../_site');
function host({install=true,priorPrepare}={}){
 const c=require('./finale-moves-host.cjs').setup(),images=[],canvases=[],nativeCalls=[],nativeDraws=[],imageDraws=[],control={failImageOnce:false,failNativeOnce:false,decodeGate:null,nativeGate:null};
 c.Image=class Image{constructor(){images.push(this);}set src(value){this.source=value;if(!value)return;const decoded=png(Buffer.from(value.split(',')[1],'base64'));this.width=this.naturalWidth=decoded.width;this.height=this.naturalHeight=decoded.pixels.length/(4*decoded.width);this.data=decoded.pixels;this.complete=true;const fail=control.failImageOnce;control.failImageOnce=false;queueMicrotask(()=>fail?this.onerror?.():this.onload?.());}decode(){return control.decodeGate?.promise||Promise.resolve();}};
 c.document={createElement(tag){assert.equal(tag,'canvas');const canvas={width:0,height:0};let pixels;const data=()=>{if(!pixels||pixels.length!==canvas.width*canvas.height*4)pixels=new Uint8ClampedArray(canvas.width*canvas.height*4);return pixels;};const ctx={canvas,ops:[],setTransform(...a){this.ops=[['reset',...a]];},clearRect(){data().fill(0);this.ops.push(['clear']);},save(){},restore(){},translate(){},transform(){},scale(){},beginPath(){},rect(){},clip(){},drawImage(image,...args){imageDraws.push(image);this.ops.push(['image',image]);if(image.data&&args.length===2&&args[0]===0&&args[1]===0)data().set(image.data);},getImageData(){return{data:data().slice()};}};canvas.getContext=()=>ctx;canvases.push(canvas);return canvas;}};
 const R=c.ROM_SPRITE_ANIM;
 R.prepare=async keys=>{nativeCalls.push(Array.from(keys));await control.nativeGate?.promise;if(control.failNativeOnce){control.failNativeOnce=false;throw Error('Injected native bank failure');}for(const key of keys){const data=JSON.parse(fs.readFileSync(path.join(site,'assets/animated',key+'.json'),'utf8')),ref=reference.banks.find(r=>r.bank===key);R.cache[key]={ready:true,data,bounds:R.bounds(data),groundBounds:ref.groundBounds.slice()};}return true;};
 R.draw=(...args)=>{nativeDraws.push(args);return true;};if(priorPrepare)c.SpeciesMoves.prepare=priorPrepare;
 if(install&&process.env.UNFEZANT064_BASELINE!=='1')vm.runInContext(source,c,{filename:'unfezant-moves.js'});
 return{c,images,canvases,nativeCalls,nativeDraws,imageDraws,control,profile:graphic=>c.SpeciesMoves.select(graphic||521,16,{})};
}
module.exports={host};
