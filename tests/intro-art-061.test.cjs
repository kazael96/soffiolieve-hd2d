const test=require('node:test'),assert=require('node:assert/strict'),P=require('../src/intro-pokeball.js'),H=require('../src/intro-history.js');
test('Aralia keeps her planted feet in the same place throughout anticipation, throw and catch',()=>{
 const positions=Array.from({length:325},(_,i)=>{const a=P.pose(i/2).actor;return a.x+96*a.scale;});
 assert.ok(Math.max(...positions)-Math.min(...positions)<1,'The old intro slid the whole actor across the platform without a step');
});
test('the throwing shoulder stays in a natural forward arc instead of rotating the arm over the head',()=>{
 for(let f=0;f<=162;f+=.25){const a=P.pose(f).actor;assert.ok(a.arm> -2.65&&a.arm<.4,'Unnatural shoulder rotation at '+f);}
});
test('the new city reveal advances through fine scanline bands rather than large rectangular tiles',()=>{
 assert.equal(typeof H.revealBand,'function');
 let previous=-Infinity;
 for(let n=0;n<=100;n++){const band=H.revealBand(n/100,.5);assert.ok(band.front>=previous);previous=band.front;}
 assert.ok(H.revealBand(0,0).front<=-8);assert.ok(H.revealBand(1,1).front>=256);
 assert.ok(H.revealBand(.5,0).front>H.revealBand(.5,1).front);
});
test('ball velocity follows the rendered hand at release and catch and settles before opening',()=>{
 const derivative=(f,key,side)=>{const a=P.pose(f+side*.0001)[key],b=P.pose(f)[key];return {x:(a.x-b.x)/(side*.0001),y:(a.y-b.y)/(side*.0001)};};
 for(const [f,left,right]of [[46,'hand','ball'],[150,'ball','hand']]){
  const a=derivative(f,left,-1),b=derivative(f,right,1);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.002,'Velocity jump at '+f);
 }
 const opening=derivative(76,'ball',-1);assert.ok(Math.hypot(opening.x,opening.y)<.002);
 assert.ok(P.pose(61).ball.y<43);assert.equal(P.pose(162).actor.head,0);assert.ok(Math.abs(P.pose(162).actor.coat)<1e-12);
});
// A small actual pixel surface for the production rect/stamp painter, not a copied town.
function document2d(){
 return {createElement(){let canvas={width:0,height:0},pixels,context;const data=()=>{const length=canvas.width*canvas.height*4;if(pixels?.length!==length)pixels=new Uint8ClampedArray(length);return pixels;};
  context={get fillStyle(){return this.color;},set fillStyle(v){this.color=v;},fillRect(x,y,w,h){const color=this.color.slice(1),rgb=[0,2,4].map(i=>parseInt(color.slice(i,i+2),16)),d=data();for(let yy=Math.max(0,y);yy<Math.min(canvas.height,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(canvas.width,x+w);xx++){const at=(yy*canvas.width+xx)*4;d.set([...rgb,255],at);}},drawImage(image,...a){const raw=image.data||image.getContext('2d').getImageData().data,x=a[0]||0,y=a[1]||0,w=a[2]??image.width,h=a[3]??image.height,d=data();for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const dx=x+xx,dy=y+yy;if(dx<0||dy<0||dx>=canvas.width||dy>=canvas.height)continue;const at=(Math.floor(yy/h*image.height)*image.width+Math.floor(xx/w*image.width))*4;if(raw[at+3])d.set(raw.subarray(at,at+4),(dy*canvas.width+dx)*4);}},createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)};},getImageData(){return{data:data().slice()};},putImageData(v){pixels=new Uint8ClampedArray(v.data);}};canvas.getContext=()=>context;return canvas;
 }};
}
test('the actual retro town contains roof courses, shaded leaf clusters and coastal rail/water detail on each native grid',()=>{
 const doc=document2d(),hero={width:1,height:1,data:new Uint8ClampedArray([0,0,0,0])};
 const patch=(im,x,y,w,h)=>{const d=im.getContext('2d').getImageData().data,colors=new Set();let changes=0;for(let yy=Math.round(y*im.height/144);yy<Math.round((y+h)*im.height/144);yy++){let previous;for(let xx=Math.round(x*im.width/160);xx<Math.round((x+w)*im.width/160);xx++){const at=(yy*im.width+xx)*4,key=Array.from(d.subarray(at,at+3)).join(',');colors.add(key);if(previous&&previous!==key)changes++;previous=key;}}return{colors:colors.size,changes};};
 for(const era of H.eras.slice(0,3)){const image=H.retro(era,hero,doc);assert.deepEqual([image.width,image.height],era.size);const roof=patch(image,25,4,42,14),leaves=patch(image,0,30,14,20),coast=patch(image,20,117,120,27);assert.ok(roof.colors>=3&&roof.changes>70,era.id+' roof lost its tile courses');assert.ok(leaves.colors>=3&&leaves.changes>50,era.id+' lost its leaf clusters');assert.ok(coast.colors>=3&&coast.changes>150,era.id+' lost its raised promenade and ripples');
  if(era.id==='yellow'){const rgba=image.getContext('2d').getImageData().data,colors=new Set();for(let i=0;i<rgba.length;i+=4){assert.equal(rgba[i+3],255);colors.add(Array.from(rgba.subarray(i,i+3)).join(','));}assert.equal(colors.size,4,'Monochrome town must retain four native shades');}
 }
});
test('Sinnoh, Unova and HD2D have different actual pixel treatments and console perspective',()=>{
 const doc=document2d(),image={width:4,height:1,data:new Uint8ClampedArray([50,130,70,255,120,170,100,255,170,110,75,255,50,100,170,255])};
 const platinum=H.dsStyle(image,'platinum',doc),black=H.dsStyle(image,'black',doc);assert.notDeepEqual(platinum.getContext('2d').getImageData().data,black.getContext('2d').getImageData().data);assert.equal(H.dsStyle(image,'hd2d',doc),image);
 assert.ok(H.cameras.platinum.angle-H.cameras.black.angle>=14);assert.ok(H.cameras.black.angle-H.cameras.hd2d.angle>=25);assert.equal(H.cameras.platinum.cinema,false);assert.equal(H.cameras.black.cinema,false);assert.equal(H.cameras.hd2d.cinema,true);
});
test('the whole scanline front has fully settled at the boundary without residual tiles or a final pop',()=>{
 for(let n=0;n<192;n++){const b=H.revealBand(1,n/191);assert.ok(b.front-b.feather>=256);assert.ok(H.revealBand(0,n/191).front<0);}
 const captions=[],previous={text:globalThis.NativeText,assets:globalThis.NAMING_ASSETS};try{globalThis.NativeText={draw(c,f,text){captions.push(text);}};globalThis.NAMING_ASSETS={font:{}};let currentAlpha=1,stack=[],blended=0;const c={canvas:{width:768},set globalAlpha(v){currentAlpha=v;},get globalAlpha(){return currentAlpha;},save(){stack.push(currentAlpha);},restore(){currentAlpha=stack.pop();},setTransform(){},clearRect(){},fillRect(){},drawImage(...a){if(a.length===9){assert.ok(a[3]>0&&a[4]>0&&a[5]>=0&&a[5]+a[7]<=256);if(currentAlpha<1)blended+=a[7]*a[8];}}};
  H.draw(c,H.eras.map(()=>({width:256,height:192})),{index:3,mix:.55},{});assert.equal(captions.length,1);assert.ok(blended>0&&blended<256*192*.05,'Only a narrow fine feather edge may blend both towns');assert.deepEqual(stack,[]);
 }finally{globalThis.NativeText=previous.text;globalThis.NAMING_ASSETS=previous.assets;}
});
test('changing a snapshot style keeps the private prepared scene and never captures a queued or blank renderer',async()=>{
 const names=['document','VillageRenderer','ROM_SCENE','OPENING_ASSETS'],old=Object.fromEntries(names.map(k=>[k,globalThis[k]]));let replacements=0,draws=0,rawSnapshots=0,disposed=false;
 try{
  globalThis.document=document2d();globalThis.ROM_SCENE={instances:[{model:'map0',x:0,y:0,z:0,rotation:0}],permissionGrids:[{x:0,z:0}],models:{map0:{groups:[{verts:[-1,0,-1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0]}]}}};globalThis.OPENING_ASSETS={models:{}};
  globalThis.VillageRenderer=class {constructor(){this.resourceEpoch=0;this.ready=false;this.pending=Promise.resolve();this.framebuffer={private:true};this.gl={FRAMEBUFFER:1,RGBA:2,UNSIGNED_BYTE:3,bindFramebuffer(){},readPixels(x,y,w,h,format,type,out){assert.deepEqual([w,h],[256,192]);assert.equal(format,2);assert.equal(type,3);out.fill(255);rawSnapshots++;},isContextLost:()=>false,getError:()=>0,getExtension:()=>({loseContext(){}})};}set scene(value){this._scene=value;replacements++;this.ready=false;this.pending=Promise.resolve().then(()=>{this.ready=true;});}get scene(){return this._scene;}resourcePlan(){return{};}hasResources(){return this.ready;}draw(){assert.equal(this.ready,true,'Style assignment queued a new load instead of rendering');draws++;}screen(){return[128,128,8];}disposeGraphics(){disposed=true;}};
  const result=await H.prepare();assert.equal(replacements,1);assert.equal(draws,3);assert.equal(rawSnapshots,2,'Both DS eras must bypass bloom, sunlight and vignette');assert.equal(disposed,true);assert.equal(H.preparing,false);assert.notEqual(globalThis.ROM_SCENE,result);assert.equal(globalThis.ROM_SCENE.clearColor,undefined);assert.deepEqual(Object.keys(result).filter(k=>['platinum','black','hd2d'].includes(k)),['platinum','black','hd2d']);
 }finally{for(const name of names)globalThis[name]=old[name];}
});
