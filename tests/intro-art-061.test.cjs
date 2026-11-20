const test=require('node:test'),assert=require('node:assert/strict'),P=require('../src/intro-pokeball.js'),H=require('../src/intro-history.js');
test('Aralia keeps her planted feet in the same place throughout anticipation, throw and catch',()=>{
 const positions=Array.from({length:325},(_,i)=>{const a=P.pose(i/2).actor;return a.x+96*a.scale;});
 assert.ok(Math.max(...positions)-Math.min(...positions)<1,'The old intro slid the whole actor across the platform without a step');
});
test('Aralia changes complete drawn poses instead of forcing a static arm over her head',()=>{
 const cells=new Set();for(let f=0;f<=162;f+=.25){const a=P.pose(f).actor;cells.add(a.cell);assert.equal(a.arm,0);assert.equal(a.forearm,0);assert.equal(a.lean,0);}assert.equal(cells.size,12);
});

test('the new city reveal advances through fine scanline bands rather than large rectangular tiles',()=>{
 assert.equal(typeof H.revealBand,'function');
 let previous=-Infinity;
 for(let n=0;n<=100;n++){const band=H.revealBand(n/100,.5);assert.ok(band.front>=previous);previous=band.front;}
 assert.ok(H.revealBand(0,0).front<=-8);assert.ok(H.revealBand(1,1).front>=256);
 assert.ok(H.revealBand(.5,0).front>H.revealBand(.5,1).front);
});
test('free ball velocity inherits the last authored contact displacement and settles at opening and catch',()=>{
 const a=P.pose(40).hand,b=P.pose(46).hand,expected={x:(b.x-a.x)/6,y:(b.y-a.y)/6},epsilon=.0001;
 const start=P.pose(46).ball,after=P.pose(46+epsilon).ball;assert.ok(Math.hypot((after.x-start.x)/epsilon-expected.x,(after.y-start.y)/epsilon-expected.y)<.002);
 for(const f of [76,150]){const before=P.pose(f-epsilon).ball,end=P.pose(f).ball;assert.ok(Math.hypot(end.x-before.x,end.y-before.y)/epsilon<.002,'Ball fails to settle at '+f);}
 assert.ok(P.pose(61).ball.y<43);assert.equal(P.pose(162).actor.head,0);assert.ok(Math.abs(P.pose(162).actor.coat)<1e-12);
});

// A small actual pixel surface for the production rect/stamp painter, not a copied town.
const {document2d}=require('./helpers/pixel-canvas.cjs');

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
  const result=await H.prepare();assert.equal(replacements,1);assert.equal(draws,3);assert.equal(rawSnapshots,2,'Both DS eras must bypass bloom, sunlight and vignette');assert.equal(disposed,false,'Private view must remain available for the coordinated camera move');assert.equal(H.activeViews,1);result.evolution.dispose();assert.equal(disposed,true);assert.equal(H.activeViews,0);assert.equal(H.preparing,false);assert.notEqual(globalThis.ROM_SCENE,result);assert.equal(globalThis.ROM_SCENE.clearColor,undefined);assert.deepEqual(Object.keys(result).filter(k=>['platinum','black','hd2d'].includes(k)),['platinum','black','hd2d']);
 }finally{for(const name of names)globalThis[name]=old[name];}
});

// 0.62 direction regressions share the existing introduction test group.
{
const test=require('node:test'),assert=require('node:assert/strict'),H=require('../src/intro-history.js'),P=require('../src/intro-pokeball.js');
const {document2d}=require('./helpers/pixel-canvas.cjs');
test('Nero2 is a separate seventh-era sequence on the same town, followed by a longer continuous move into HD2D',()=>{
 assert.deepEqual(H.eras.map(e=>e.id),['yellow','gold','emerald','platinum','black','black2','hd2d']);assert.deepEqual(H.eras[5].size,[256,192]);assert.equal(H.frame(297).id,'black2');assert.equal(H.frame(405).id,'hd2d');assert.equal(H.frame(432).done,true);assert.equal(H.frame(324).done,false);
 const start=H.frame(302),mid=H.frame(340),end=H.frame(378);assert.equal(start.mix,0);assert.ok(mid.mix>.49&&mid.mix<.51);assert.equal(end.id,'hd2d');
 for(const rate of [1,2,4]){const clock=H.clock(),seen=new Set();let now=0;seen.add(clock.tick(now).frame);for(let n=0;n<3000&&!clock.done;n++)seen.add(clock.tick(now+=n%3?16.7:240,{rate}).frame);for(const f of [297,302,314,330,340,346,362,378,405,432])assert.ok(seen.has(f),'Unshown camera keyframe '+f+' at x'+rate);assert.equal(clock.done,true);}
});
test('the final camera physically changes pitch, position and framing while the graphics follow the same progress',()=>{
 const box={minX:-15,maxX:15,minZ:-16,maxZ:16,minY:0,maxY:5};const first=H.evolutionCamera(box,0),last=H.evolutionCamera(box,1);assert.equal(first.angle,H.cameras.black2.angle);assert.equal(last.angle,H.cameras.hd2d.angle);assert.notDeepEqual(first.center,last.center);
 let angle=first.angle,graphics=0;for(let n=0;n<=20;n++){const p=H.evolutionCamera(box,n/20);assert.ok(p.angle<=angle&&p.graphics>=graphics);angle=p.angle;graphics=p.graphics;assert.equal(p.graphics,n/20);assert.ok(Number.isFinite(p.zoom)&&p.zoom>0);if(n>0&&n<20){assert.ok(p.angle>last.angle&&p.angle<first.angle);assert.notDeepEqual(p.center,first.center);assert.notDeepEqual(p.center,last.center);}}
 assert.equal(first.graphics,0);assert.equal(last.graphics,1);
});
test('the final montage draws one real evolving view instead of ghosting the two static city cards',()=>{
 let live=0,staticCards=0;const cards=H.eras.map(()=>({width:256,height:192}));cards.evolution={draw(progress){live++;assert.equal(progress,.5);return {width:768,height:576,live:true};}};
 const old=[globalThis.NativeText,globalThis.NAMING_ASSETS];globalThis.NativeText={draw(){}};globalThis.NAMING_ASSETS={font:{}};try{const c={canvas:{width:768},save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},drawImage(im){if(!im.live)staticCards++;}};H.draw(c,cards,{index:5,mix:.5},{});assert.equal(live,1);assert.equal(staticCards,0);}finally{[globalThis.NativeText,globalThis.NAMING_ASSETS]=old;}
});
test('a successful, cancelled or failed montage releases its private evolving view exactly once',async()=>{
 for(const mode of ['finish','cancel','error']){let tick,disposed=0;const cards=H.eras.map(()=>({width:256,height:192}));cards.evolution={dispose(){disposed++;},draw(){throw Error('Injected private context loss');}};const old=[globalThis.NativeText,globalThis.NAMING_ASSETS];globalThis.NativeText={draw(){}};globalThis.NAMING_ASSETS={font:{}};
  try{const c={canvas:{width:768},save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},drawImage(){}},run=H.play({canvas:{getContext:()=>c},cards,font:{},document:{hidden:false},request:f=>(tick=f,1),cancel(){},rate:()=>4});if(mode==='cancel'){run.cancel();run.cancel();tick(100);assert.equal(await run.promise,false);}else{if(mode==='finish')cards.evolution.draw=()=>({width:768,height:576});for(let n=0;n<1000&&tick;n++){const f=tick;tick=null;f(n*100);}if(mode==='error')await assert.rejects(run.promise,/private context loss/);else assert.equal(await run.promise,true);}assert.equal(disposed,1,mode+' leaked its private context');}
  finally{[globalThis.NativeText,globalThis.NAMING_ASSETS]=old;}
 }
});
test('Emerald paints a distinct native GBA town with warm tiled roofs and shaded green foliage',()=>{
 const doc=document2d(),hero={width:1,height:1,data:new Uint8ClampedArray(4)},image=H.retro(H.eras[2],hero,doc),data=image.getContext('2d').getImageData().data;
 const area=(x,y,w,h)=>{const colors=new Set();for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const at=(yy*image.width+xx)*4;colors.add([...data.subarray(at,at+3)].join(','));}return colors;};
 assert.deepEqual([image.width,image.height],[240,160]);assert.ok(area(35,5,64,17).has('173,107,74'),'Emerald needs its warm terracotta roof course palette');assert.ok(area(0,30,28,30).size>=6,'Rounded GBA foliage needs leaf, rim and ground shades');assert.ok(area(25,135,185,25).size>=8,'Coastal promenade, rail and sea should retain authored GBA detail');
});
test('the free Pokeball inherits a visible forward launch and remains legible at native scale',()=>{
 const a=P.pose(40).hand,b=P.pose(46).hand;assert.ok((b.x-a.x)/6>1.1,'The last authored contact interval must carry a visible forward impulse');
 for(const f of [0,46,54,61,76,128,150]){const calls=[],c={save(){},restore(){},translate(){},scale(){},rotate(){},drawImage(...args){calls.push(args);},beginPath(){},ellipse(){},fill(){},stroke(){},moveTo(){},lineTo(){}};const closed={},opened={},half={};P.draw(c,{balls:{0:closed,9:half,10:opened},minccino:{width:1,height:1},white:{}},{atlas:{}},P.pose(f));const balls=calls.filter(a=>[closed,opened,half].includes(a[0]));assert.equal(balls.length,1,'Motion cues must not duplicate the actual Ball');const call=balls[0];assert.ok(22*call[7]/call[3]>=6.5,'Transparent crop shrank the visible closed sphere');}
});
test('the Ball motion trail follows its real past path and fades before it opens',()=>{
 for(const f of [48,54,61,70]){const p=P.pose(f);assert.ok(p.trail.length>0&&p.trail.length<=4);for(const t of p.trail){assert.ok(t.frame<f&&t.frame>=46);const actual=P.pose(t.frame).ball;assert.ok(Math.hypot(t.x-actual.x,t.y-actual.y)<1e-8);}}
 for(const f of [0,46,76,128,162])assert.deepEqual(P.pose(f).trail,[]);
});
function privateHost({fail=false}={}){
 const names=['document','VillageRenderer','ROM_SCENE','OPENING_ASSETS'],old=Object.fromEntries(names.map(n=>[n,globalThis[n]])),doc=document2d(),create=doc.createElement;let allocated=0,instances=[],lost=false,disposed=0;
 doc.createElement=()=>{allocated++;const image=create(),c=image.getContext('2d');Object.assign(c,{save(){},restore(){},beginPath(){},ellipse(){},fill(){},clearRect(){}});return image;};
 globalThis.document=doc;globalThis.OPENING_ASSETS={models:{}};globalThis.ROM_SCENE={instances:[{model:'map0',x:0,y:0,z:0,rotation:0}],permissionGrids:[{x:0,z:0}],models:{map0:{groups:[{verts:[-15,0,-16,0,0,0,0,0,0,0,0,15,5,16,0,0,0,0,0,0,0,0]}]}}};
 globalThis.VillageRenderer=class{constructor(canvas){this.canvas=canvas;this.resourceEpoch=0;this.pending=Promise.resolve();this.ready=!fail;this.gl={FRAMEBUFFER:1,RGBA:2,UNSIGNED_BYTE:3,bindFramebuffer(){},readPixels(x,y,w,h,a,b,out){out.fill(128);},isContextLost:()=>lost,getError:()=>0,getExtension:()=>({loseContext(){lost=true;}})};instances.push(this);}set scene(s){this._scene=s;}get scene(){return this._scene;}resourcePlan(){return{};}hasResources(){return this.ready;}draw(){this.canvas.width=this.viewSize[0];this.canvas.height=this.viewSize[1];const c=this.canvas.getContext('2d');c.fillStyle='#88aa77';c.fillRect(0,0,...this.viewSize);}screen(){return[this.canvas.width/2,this.canvas.height*.7,this.canvas.height/30];}disposeGraphics(){disposed++;}};
 return{instances,allocations:()=>allocated,disposals:()=>disposed,lose:()=>{lost=true;},restore(){for(const n of names)globalThis[n]=old[n];}};
}
test('the actual private view reuses its renderer and surfaces across camera poses and propagates context loss',async()=>{
 const host=privateHost();let bundle;try{bundle=await H.prepare();assert.equal(H.preparing,false);assert.equal(H.activeViews,1);assert.equal(host.instances.length,1);const hero={width:1,height:1,data:new Uint8ClampedArray([70,110,80,255])},first=bundle.evolution.draw(0,hero),count=host.allocations(),epoch=host.instances[0].resourceEpoch;
  for(const fraction of [.15,.4,.65,.9,1]){assert.equal(bundle.evolution.draw(fraction,hero),first);const actual=bundle.evolution.lastView;assert.equal(actual.graphics,fraction);assert.equal(actual.epoch,epoch);assert.deepEqual(actual.viewport,[768,576]);assert.ok(actual.angle>=25&&actual.angle<=43);}
  assert.equal(host.allocations(),count,'Per-frame canvas allocation in a camera-only update');assert.equal(globalThis.ROM_SCENE.clearColor,undefined);host.lose();assert.throws(()=>bundle.evolution.draw(.5,hero),/Panorama/);bundle.evolution.dispose();bundle.evolution.dispose();assert.equal(host.disposals(),1);assert.equal(H.activeViews,0);
 }finally{bundle?.evolution.dispose();host.restore();}
});
test('failed initial private resources reject preparation and release their context and ownership',async()=>{
 const host=privateHost({fail:true});try{await assert.rejects(H.prepare(),/Panorama/);assert.equal(host.disposals(),1);assert.equal(H.activeViews,0);assert.equal(H.preparing,false);}finally{host.restore();}
});
test('normal rendering retains full postprocessing and only private views can opt into the evolving graphics',()=>{
 const fs=require('fs'),vm=require('vm'),path=require('path'),context={};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/world3d.js'),'utf8')+';this.Renderer=VillageRenderer;',context);
 for(const isolated of [false,true])for(const graphics of [undefined,.35]){const calls=[],uniforms=new Map(),cb=name=>()=>{calls.push(name);return ()=>{};};context.SceneCamera={applyFieldView:cb('fieldCamera')};context.MistraltonPuzzles={applyCamera:cb('puzzleCamera'),drawFloor:cb('puzzleFloor'),apply:cb('puzzleApply')};context.IcirrusGym={applyCamera:cb('cannonCamera'),apply:cb('ice')};context.FieldHMWorld={applyCamera:cb('hmCamera'),present:(r,t,a)=>a,rendered:cb('hmPresented')};context.FinaleElite={applyCamera:cb('eliteCamera'),projection:()=>{calls.push('eliteProjection');return null;},draw:cb('eliteDraw')};
  const gl=new Proxy({getUniformLocation:(p,k)=>k,uniform1f:(k,v)=>uniforms.set(k,v),getAttribLocation:()=>1},{get:(o,k)=>k in o?o[k]:()=>{}}),r={isolated,evolutionBlend:graphics,ready:true,scene:{zone:18,instances:[]},canvas:{width:768,height:576},center:[0,0],zoom:1,cinema:true,gl,attrs:[],loc:{},resize(){},hasResources:()=>true,resourcePlan:()=>({}),indoor:()=>false};context.Renderer.prototype.draw.call(r,0,[]);assert.equal(uniforms.get('uEvolutionBlend'),isolated&&graphics!==undefined?graphics:1);if(isolated)assert.deepEqual(calls,[],'A private intro view called active field/cinematic systems');else assert.ok(calls.includes('fieldCamera')&&calls.includes('hmPresented'));
 }
});

test('private town resource plans ignore live identity, story actors and Surf while field plans retain them',()=>{
 const fs=require('fs'),vm=require('vm'),path=require('path'),context={};context.window=context;context.OPENING_ASSETS={models:{map0:{groups:[{texture:'town'}]}}};context.ROM_SCENE={models:{}};let gender='M',storyCalls=0,surfCalls=0;context.NativeStory={visualActors(){storyCalls++;return [{name:'Aralia'}];}};context.SurfField={resources(){surfCalls++;return {sprite:'SurfMon',models:['surf-model'],textures:['surf-texture']};}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/world3d.js'),'utf8')+';this.Renderer=VillageRenderer;',context);
 const renderer={isolated:true,scene:{instances:[{model:'map0'}]},spriteName:n=>n==='Alcide'?gender:n,spriteFrames:n=>[n==='Alcide'?gender+'.png':n+'.png']};
 const plan=()=>JSON.parse(JSON.stringify(context.Renderer.prototype.resourcePlan.call(renderer)));
 const male=plan();gender='F';assert.deepEqual(plan(),male);assert.deepEqual(male,{models:['map0'],textures:['town'],sprites:[]});assert.equal(storyCalls,0);assert.equal(surfCalls,0);
 renderer.isolated=false;const field=plan();assert.ok(field.models.includes('surf-model'));assert.ok(field.textures.includes('surf-texture'));assert.deepEqual(field.sprites.map(s=>s.key),['F-0','Aralia-0','SurfMon-0']);assert.equal(storyCalls,1);assert.equal(surfCalls,1);
});

}
