'use strict';
// Lightweight owner/status fixture: real C11 stage source, adapter preparation spy.
// Its lease is an explicit protocol input. The separate real-stage group uses M.play's genuine lease.
const path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),L=require('./strict-loader.cjs');
const folder=L.target,source=L.text(path.join(folder,'liepard-moves.js')),p={species:510,id:10,key:'training-510-10',kind:'furySlash'},o={side:'p1',cryIds:{p1:510,p2:572}};
function fixture({tdz=false,predecessor=async()=>true}={}){
 let box=null,reenter=false,installed=0,options,statusCalls=0,preparedCalls=0;
 const native={battle:{gameType:'singles',p1:{active:[{species:{num:510}}]},p2:{active:[{species:{num:572}}]}},active(side){return this.battle[side].active[0];}};
 const c={console,Promise,performance,setTimeout,clearTimeout,SpeciesMoves:{part:()=>null,pose:()=>({}),prepare:predecessor},ChapterMoves:{sample:()=>({})},DemoMoves:{attachment:()=>({original:true})},ROM_SPRITE_ANIM:{cache:{}},BattleGround:{shadow(){}},MoveFX:{generation:1},lateSession:native,lateArena:{width:390,height:490}};
 if(!tdz)c.session=native;c.window=c;
 function element(tag){return{tagName:tag.toUpperCase(),id:'',className:'',children:[],textContent:'',append(...nodes){this.children.push(...nodes);},remove(){if(box===this)box=null;}};}
 c.BattlePresentationOwners={read:()=>({layoutSupported:true,available:true,nativeSpecies:{p1:510,p2:572},roles:{p1:{graphic:510,altered:false,bankReady:true},p2:{graphic:572,altered:false,bankReady:true}}})};
 c.document={getElementById:id=>id==='loading'?box:null,createElement:element,body:{append(node){if(node.id==='loading')box=node;if(reenter)c.renderer.status('Risorse non disponibili. Controlla la connessione e riprova.');}}};
 c.renderer={ready:true,status(message){statusCalls++;if(!box){box=element('div');box.id='loading';}const text=element('p');text.textContent=message;box.children=[text];if(reenter){const foreign=element('p');foreign.textContent='Risorse non disponibili. Controlla la connessione e riprova.';box.children=[foreign];}}};
 vm.createContext(c);
 if(tdz){
  // Load the exact raw program from inside a real lexical TDZ. The wrapper is fixture code,
  // not appended to the candidate and never represented as raw-source compilation.
  c.loadExactCandidate=()=>L.run(c,path.join(folder,'liepard-moves.js'));
  vm.runInContext('loadExactCandidate();let arena=lateArena;let session=lateSession;',c,{filename:'FIXTURE_ONLY/late-lexical-TDZ'});
 }else{L.run(c,path.join(folder,'liepard-moves.js'));c.arena=c.lateArena;}
 return{c,get box(){return box;},get options(){return options;},get installed(){return installed;},get preparedCalls(){return preparedCalls;},get statusCalls(){return statusCalls;},setReentrant(v){reenter=v;},spy(){c.LiepardLayoutAdapter064.install=a=>{installed++;options=a;return{prepareInitial:async()=>{preparedCalls++;return{hit:{},miss:{}};}};};},prepare(){
  const marked=c.LiepardMoves.acquireProfile064(p,o);assert.notEqual(marked,p,'supported initial acquisition must opt in');
  const owner=tdz?c.lateSession:c.session;
  return c.SpeciesMoves.prepare(marked,{...o,nativeScratchLease064:{owner,battle:owner.battle,actors:{p1:owner.battle.p1.active[0],p2:owner.battle.p2.active[0]},generation:c.MoveFX.generation}});
 }};
}
module.exports={fixture,folder,source,p,o};
