'use strict';
// Actual private/C9 Game render-control functions and actual renderer resourceGate
// + RuntimeAssets.Recovery. Canvas calls and body visibility are explicit protocol
// inputs, not browser/R.draw/pixel or PCM evidence.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {host,Recorder,site,sha,plain,assetProof}=require('./minccino-slap-recording064.cjs');
const {sourcePath,read}=require('./minccino-slap-paths064.cjs');
function dom(base){
 const doc={...base};
 class Node{constructor(tag){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.textContent='';this.parentNode=null;}append(...nodes){for(const n of nodes){n.remove();n.parentNode=this;this.children.push(n);}}replaceChildren(...nodes){for(const n of this.children)n.parentNode=null;this.children=[];this.append(...nodes);}remove(){if(this.parentNode){const a=this.parentNode.children,i=a.indexOf(this);if(i>=0)a.splice(i,1);this.parentNode=null;}}}
 doc.body=new Node('body');doc.createElement=tag=>tag==='canvas'?base.createElement(tag):new Node(tag);
 doc.getElementById=id=>{const find=n=>n.id===id?n:n.children.map(find).find(Boolean);return find(doc.body);};doc.querySelector=()=>null;return doc;
}
function make(candidate=true,options={}){
 const h=host(candidate,options),c=h.c,source=fs.readFileSync(sourcePath('game.js'),'utf8');
 c.document=dom(c.document);c.arena={width:390,height:490,dataset:{}};c.canvas={dataset:{}};c.ac=new Recorder(390,490);c.ac.isContextLost=()=>false;
 const eventBindings=new Map(),bind=(name,fn)=>{if(!eventBindings.has(name))eventBindings.set(name,new Set());eventBindings.get(name).add(fn);},unbind=(name,fn)=>eventBindings.get(name)?.delete(fn);c.addEventListener=bind;c.removeEventListener=unbind;c.document.addEventListener=bind;c.document.removeEventListener=unbind;
 const metrics={begin:0,completed:0,clear:0,bodies:0,rafError:[],status:[],prepare:[],ownerRead:0};
 const fill=c.ac.fillRect;c.ac.fillRect=function(...a){metrics.clear++;return fill.apply(this,a);};
 c.console={...console,error:e=>metrics.rafError.push(String(e))};c.location={reload(){throw Error('No reload allowed');}};
 c.renderer={ready:true,assetsReady:true,canvas:c.canvas,resourceGates:new Map(),gl:{isContextLost:()=>false},resumeSceneWaiters(){},status(message,retry,recovery){metrics.status.push(message);if(recovery)this.recovery.register(recovery.key,retry,{valid:recovery.valid});}};
 vm.runInContext(read('runtime-assets.js'),c,{filename:'C9/runtime-assets.js'});
 const OriginalRecovery=c.RuntimeAssets.Recovery;metrics.recoveryInstances=[];c.RuntimeAssets.Recovery=new Proxy(OriginalRecovery,{construct(target,args){const service=Reflect.construct(target,args);metrics.recoveryInstances.push(service);return service;}});
 c.renderer.recovery=new c.RuntimeAssets.Recovery({listen:false,setTimer:()=>1,clearTimer(){}});
 const rendererSource=read('world3d.js'),a=rendererSource.indexOf(' resourceGate(key,task){'),b=rendererSource.indexOf('\n async prepareScene()',a);if(a<0||b<a)throw Error('Original resourceGate not found');
 c.renderer.resourceGate=vm.runInContext('({'+rendererSource.slice(a,b)+'}).resourceGate',c,{filename:'C9/world3d.js:resourceGate'});
 const sa=rendererSource.indexOf(' status(message,retry=null,recovery=null){'),sb=rendererSource.indexOf('\n ',sa+2);if(sa<0||sb<sa)throw Error('Original status not found');const status=vm.runInContext('({'+rendererSource.slice(sa,sb)+'}).status',c,{filename:'C9/world3d.js:status'});c.renderer.status=function(...args){metrics.status.push(args[0]);return status.apply(this,args);};
 const from=source.indexOf('function syncBattleActorFraming(){'),to=source.indexOf('refresh();requestAnimationFrame(frame);',from);if(from<0||to<from)throw Error('Actual Game render loop absent');
 c.controls={state:()=>({})};c.GameSpeed.steps=()=>[];c.requestAnimationFrame=()=>{};c.refresh=()=>{};c.last=0;c.cooldown=0;c.t=0;c.battling=true;c.keys={};c.menuOpen=()=>false;
 const cards={playerCard:{style:{}},enemyCard:{style:{}}};c.$=id=>cards[id];c.BattleEnvironment.draw=()=>{};
 // Declared synthetic body-submission protocol input. It never calls or
 // replaces ROM_SPRITE_ANIM.draw and is not proof of actual native visibility.
 c.combatant=(_ac,_name,_x,_y,_size,_back,side)=>{metrics.bodies++;c.MoveFX.markArenaActor(side,c.MoveFX.active?.cryIds?.[side]);};
 vm.runInContext(source.slice(from,to),c,{filename:(candidate?'PRIVATE/v3':'C9')+'/game.js:actual-render-control'});
 const begin=c.MoveFX.beginArenaFrame,done=c.MoveFX.presentedArenaFrame;c.MoveFX.beginArenaFrame=function(...args){metrics.begin++;return begin.apply(this,args);};c.MoveFX.presentedArenaFrame=function(...args){metrics.completed++;return done.apply(this,args);};
 // Both delegates preserve original return values and exceptions.
 const oldReader=c.BattlePresentationOwners.read;c.BattlePresentationOwners=Object.freeze({read(){metrics.ownerRead++;return oldReader();}});
 const originalPrepare=c.ROM_SPRITE_ANIM.prepare;h.originalPrepare=originalPrepare;
 return Object.assign(h,{metrics,eventBindings,activeEventBindings:()=>[...eventBindings.values()].reduce((n,s)=>n+s.size,0),sourceSHA256:sha(source),frame:now=>c.frame(now),bank(side){const x=c.MoveFX.active;return c.ROM_SPRITE_ANIM.cache[x.cryIds[side]+'-'+(side==='p1'?'back':'front')];},prepareUsing(fn){c.ROM_SPRITE_ANIM.prepare=function(...args){metrics.prepare.push(args);return fn.apply(this,args);};},async flush(n=50){for(let i=0;i<n;i++)await Promise.resolve();}});
}
module.exports={make,sha,plain,assetProof};
