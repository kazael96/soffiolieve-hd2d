'use strict';
const assert=require('node:assert/strict');
function observeStageFraming(c){
 const stage=c.LiepardMoves?.staging064;if(!stage)return;const prepare=stage.prepare,ids=new WeakMap();let serial=0;const id=x=>x&&typeof x==='object'?(ids.has(x)?ids.get(x):(ids.set(x,++serial),serial)):null;c.protocolTrace.stageFraming=[];
 stage.prepare=function(p,layout,side,miss,...rest){
  const banks=['p1','p2'].map(role=>{const native=c.session?.battle?.[role]?.active?.[0],key=native?.species?.num+'-'+(role==='p1'?'back':'front'),bank=c.ROM_SPRITE_ANIM.cache[key];return{role,key,bank,data:bank?.data,image:bank?.image};}),ready=banks.every(x=>x.bank?.ready&&x.data&&x.image),current=c.BattleGround.layout(c.arena.width,c.arena.height),status=c.BattleGround.framingStatus;
  const record={side,miss:!!miss,width:c.arena.width,height:c.arena.height,banksReady:ready,layoutId:id(layout),currentLayoutId:id(current),supported:!!status.supported,status:status.status,factor:status.factor,fullFactor:status.fullSilhouetteSeparation?.factor,halo:status.fullSilhouetteSeparation?.nativePixelHaloPerBody,fullChanged:status.fullSilhouetteSeparation?.changed,fullScope:status.fullSilhouetteSeparation?.scope,fullRelative:status.fullSilhouetteSeparation?.relativeFactor,fullComponentPairs:status.fullSilhouetteSeparation?.componentPairs,banks:banks.map(x=>({role:x.role,key:x.key,bankId:id(x.bank),dataId:id(x.data),imageId:id(x.image)}))};c.protocolTrace.stageFraming.push(record);
  if(ready){assert.equal(record.supported,true,'actual Game must re-register current bank owners before geometry');assert([120,126].includes(record.fullComponentPairs),'full native component support required');if(record.fullChanged===true)assert.equal(record.halo,1,'changed fullsilhouette physical support uses1px');else{assert.equal(record.fullChanged,false);assert.equal(record.fullRelative,1);assert.equal(record.fullScope,'Full rest silhouette plus1nativepixel halo per body already separated; current layout preserved.');}assert(Number.isFinite(record.fullFactor)&&record.fullFactor>0);assert.equal(layout,current,'stage geometry must consume currently registered layout');}
  return prepare.call(this,p,layout,side,miss,...rest);
 };
}

module.exports={observeStageFraming};
