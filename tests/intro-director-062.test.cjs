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
 const a=P.pose(45.999).hand,b=P.pose(46).hand;assert.ok((b.x-a.x)/.001>1.1,'The hand was nearly stationary at release, making the ball accelerate away later');
 for(const f of [0,46,54,61,76,128,150]){const calls=[],c={save(){},restore(){},translate(){},scale(){},rotate(){},drawImage(...args){calls.push(args);},beginPath(){},ellipse(){},fill(){},stroke(){},moveTo(){},lineTo(){}};const closed={},opened={},half={};P.draw(c,{balls:{0:closed,9:half,10:opened},minccino:{width:1,height:1},white:{}},{body:{},upper:{},forearm:{},hand:{}},P.pose(f));const balls=calls.filter(a=>[closed,opened,half].includes(a[0]));assert.equal(balls.length,1,'Motion cues must not duplicate the actual Ball');const call=balls[0];assert.ok(22*call[7]/call[3]>=6.5,'Transparent crop shrank the visible closed sphere');}
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
