'use strict';
// Source-only Canvas2D recording: no browser/GPU, rendered pixels, native turn or audio claim.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {repo,sourceRoot,sourcePath,site,fixturePath,read}=require('./minccino-slap-paths064.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x)),decode=require(path.join(repo,'tests/helpers/native-png.cjs'));
// Git normalizes this JSON fixture; the PNG and native-data checks below stay raw.
const assets=new Map(),pins=new Map(),pngRaw=fs.readFileSync(fixturePath('png-pins.json')),pngMetadata=pngRaw.toString('utf8').replace(/\r\n/g,'\n');if(sha(pngMetadata)!=='0ec766ffae646912028cfd1ac703c7339a730c07903d5f7ff3570209ffd1ec7e')throw Error('Native PNG pin metadata changed');const assetManifest=JSON.parse(pngMetadata).files;
let verifiedBaseline=false;
function verifyBaseline(){if(verifiedBaseline)return;const contract=JSON.parse(fs.readFileSync(fixturePath('native-data-pins.json'),'utf8'));for(const[file,pin]of Object.entries(contract.files)){const raw=fs.readFileSync(path.join(site,file));if(sha(raw)!==pin)throw Error('Native data contract changed: '+file);}verifiedBaseline=true;}
function asset(file){if(!assets.has(file)){const raw=fs.readFileSync(path.join(site,file));if(sha(raw)!==assetManifest[file])throw Error('Original PNG asset mismatch: '+file);const d=decode(raw),h=d.pixels.length/d.width/4;assets.set(file,{width:d.width,height:h,data:d.pixels,__texture:file});pins.set(file,sha(raw));}return assets.get(file);}
const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
const pos=(m,x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
class Recorder{
 constructor(w,h){this.canvas={width:w,height:h};this.m=[1,0,0,1,0,0];this.rows=[];this.stack=[];this.globalAlpha=1;this.imageSmoothingEnabled=false;return new Proxy(this,{set(t,k,v){if(['globalAlpha','fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','shadowBlur','shadowColor','imageSmoothingEnabled'].includes(k))t.rows.push(['set',k,v]);t[k]=v;return true;}});}
 save(){this.stack.push({m:this.m.slice(),alpha:this.globalAlpha});this.rows.push(['save']);}
 restore(){const v=this.stack.pop();if(!v)throw Error('Unbalanced Canvas2D restore');this.m=v.m;this.globalAlpha=v.alpha;this.rows.push(['restore']);}
 transform(...a){this.m=mul(this.m,a);this.rows.push(['transform',...a]);}
 translate(x,y){this.m=mul(this.m,[1,0,0,1,x,y]);this.rows.push(['translate',x,y]);}
 rotate(a){this.m=mul(this.m,[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]);this.rows.push(['rotate',a]);}
 scale(x,y){this.m=mul(this.m,[x,0,0,y,0,0]);this.rows.push(['scale',x,y]);}
 drawImage(im,...args){if(args.length!==4)throw Error('Unexpected arena drawImage overload');const[x,y,w,h]=args,pixels=im.data||im.getContext('2d').getImageData(0,0,im.width,im.height).data;this.rows.push({op:'drawImage',texture:im.__texture,rgbaSHA256:sha(pixels),sourceSize:[im.width,im.height],rect:args,matrix:this.m.slice(),alpha:this.globalAlpha,corners:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(p=>pos(this.m,...p))});}
}
for(const name of['beginPath','closePath','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','arc','stroke','fill','fillRect','strokeRect'])Recorder.prototype[name]=function(...args){this.rows.push([name,...args]);};
function host(candidate=false){
 verifyBaseline();
 const c=require(path.join(repo,'tests/helpers/finale-moves-host.cjs')).setup({sourceRoot:path.join(repo,'src'),withoutMinccino:true});
 const baseDocument=require(path.join(repo,'tests/helpers/pixel-canvas.cjs')).document2d();let serial=0;
 c.document={hidden:false,addEventListener(){},createElement(tag){if(tag!=='canvas')throw Error('Unexpected element');const canvas=baseDocument.createElement(),ctx=canvas.getContext('2d'),draw=ctx.drawImage;ctx.drawImage=function(im,...a){canvas.__texture=im.__texture;return draw.call(this,im,...a);};return canvas;}};
 c.Image=class{constructor(){this.complete=true;}set src(file){Object.assign(this,asset(file));this.naturalWidth=this.width;this.naturalHeight=this.height;}addEventListener(){}};
 let now=0;c.performance={now:()=>now};c.GameSpeed={rate:1,now:()=>now,flush(){},cancel(){},schedule:()=>++serial};c.setTimeout=()=>++serial;c.clearTimeout=()=>{};
 c.BattleEnvironment={context:{id:'route1',terrain:'grass'}};c.visualState={p1:{},p2:{}};
 const load=file=>vm.runInContext(read(file),c,{filename:'src/'+file});
 for(const file of['assets/move-fx-data.js','assets/native-audio-bank.js','assets/visual-camera.js','native-visual.js','particle-spl.js','battle-presentation.js','battle-diorama.js','battle-ground.js'])load(file);
 const bg=read('battle-ground.js'),support=JSON.parse(bg.match(/const native602CompanionSupport=(.*);\n/)[1]),tail=JSON.parse(bg.match(/const nativeLongTailSupport=(.*);\n/)[1]);
 for(const id of[495,510,572])for(const view of['front','back']){const key=id+'-'+view,image=asset('assets/animated/'+key+'.png'),data=JSON.parse(read('assets/animated/'+key+'.json')),bounds=(id===495?support.species[id].views[view]:tail[key]).groundBounds.slice();c.ROM_SPRITE_ANIM.cache[key]={ready:true,data,image:{...image,naturalWidth:image.width,naturalHeight:image.height,complete:true},groundBounds:bounds,bounds:bounds.slice()};}
 const delegated=[],originalDemo=c.DemoMoves.draw;c.DemoMoves.draw=function(...a){delegated.push({species:a[3]?.profile?.species,id:a[3]?.profile?.id,frame:a[4],layer:a[5]});return originalDemo.apply(this,a);};
 for(const file of['minccino-moves.js','move-fx.js'])vm.runInContext(fs.readFileSync(sourcePath(file),'utf8'),c,{filename:'src/'+file});
 const game=read('game.js'),from=game.indexOf('window.BattlePresentationOwners='),to=game.indexOf('\nfunction syncBattleActorFraming',from);if(from<0||to<from)throw Error('Original owner reader absent');vm.runInContext(game.slice(from,to),c,{filename:'src/game.js:owner-reader'});
 const nativeProgram=plain(c.ROM_MOVE_FX.moves[3]),nativeSPA=plain(c.ROM_MOVE_FX.spas[163]),nativeFunctions={...c.ParticleSPL};
 const h={c,delegated,nativeProgram,nativeSPA,nativeFunctions,site,sourceRoot,async preview({side='p1',id=3,actor=572,target=495,miss=false,owner=false}={}){
  if(owner){const a={name:actor===572?'Minccino':actor===510?'Liepard':'Snivy',level:25,moves:[id]},t={name:target===495?'Snivy':'Liepard',level:25,moves:[33]};c.session=new c.GEN5.Session([side==='p1'?a:t],[side==='p2'?a:t],{seed:[1,2,3,4]});c.partner=c.session.snapshot('p1');c.enemy=c.session.snapshot('p2');}else{delete c.session;delete c.partner;delete c.enemy;}
  const cryIds={p1:side==='p1'?actor:target,p2:side==='p2'?actor:target},options={cryIds,miss,context:{hitIndex:0,hitCount:miss?0:2}};
  await c.MoveFX.preview(id,side,0,options);return c.MoveFX.active;
 },async owned(side,extra={}){
  await this.preview({side,owner:true});const cryIds={...c.MoveFX.active.cryIds},audioRows=[];
  // Declared recording audio bridge, no PCM or audible-playback claim.
  c.AudioEngine={cancelMove(){},preloadMove:async()=>{},async preparePresentation(events,options){audioRows.push({events:plain(events),options:plain(options)});return{canPresent:()=>true,acknowledge(...args){audioRows.push({op:'acknowledge',args});},pause(...args){audioRows.push({op:'pause',args});},resume(...args){audioRows.push({op:'resume',args});},cancel(){audioRows.push({op:'cancel'});},async finish(){audioRows.push({op:'finish'});}};}};
  const job=c.MoveFX.play(3,side,{cryIds,context:{hitIndex:0,hitCount:2},...extra});let failure;job.catch(e=>{failure=e;});
  for(let n=0;n<40&&!c.MoveFX.active?.presentationClock&&!failure;n++)await Promise.resolve();if(failure)throw failure;
  const action=c.MoveFX.active;if(!action?.presentationClock||!action.nativeSlapOwner064)throw Error('Original play did not register its real owner and source clock');
  // Clock API unit driver: synthetic visibility acknowledgements are NOT arena ACK evidence.
  while(action.presentationClock.value<64){now+=1000;const token=action.presentationClock.begin(now);if(!token)throw Error('Original clock stopped before required source sample');action.presentationClock.presented(token,now,{drawable:true,visible:true});}
  if(action.presentationClock.value!==64)throw Error('Expected original protected64 key');
  return{audioRows,job,failure:()=>failure,advance(ms=17){now+=ms;},dispose:async()=>{c.MoveFX.cancel();await job.catch(()=>{});}};
 },draw(frame,w=390,hh=490){c.MoveFX.setPreviewFrame(frame);delegated.length=0;const context=new Recorder(w,hh);c.MoveFX.draw(context,w,hh);if(context.stack.length)throw Error('Unbalanced source draw');return{rows:plain(context.rows),images:plain(context.rows.filter(r=>r.op==='drawImage')),delegated:plain(delegated),active:c.MoveFX.active};},assertUnchanged(assert){assert.deepEqual(plain(c.ROM_MOVE_FX.moves[3]),nativeProgram);assert.deepEqual(plain(c.ROM_MOVE_FX.spas[163]),nativeSPA);for(const[k,v]of Object.entries(nativeFunctions))assert.equal(c.ParticleSPL[k],v,'Original ParticleSPL function replaced: '+k);}};
 return h;
}
function assetProof(){return Object.fromEntries([...pins].sort(([a],[b])=>a.localeCompare(b)));}
module.exports={host,sha,plain,assetProof,site,repo,Recorder};
