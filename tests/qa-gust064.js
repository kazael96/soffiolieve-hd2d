/* Isolated actual-command evidence. Never shipped in the game. */
(function(root){
 'use strict';
 const keys=Object.freeze([60,95,101,106,126]);
 function rates(search){const raw=new URLSearchParams(search).get('battleRates064');if(raw===null)return [1,2,4];if(!/^[124](?:,[124])*$/.test(raw))throw Error('Invalid battleRates064');const out=raw.split(',').map(Number);if(new Set(out).size!==out.length)throw Error('Repeated battleRates064');return out;}
 function captureGate({graphic,onCapture}){
  const rows=new Map(),captured=new Set();
  function observe(record,body){if(!record||!keys.includes(record.token?.frame)||body.success!==true||String(body.graphic)!==String(graphic)||!['p1','p2'].includes(body.side)||body.back!==(body.side==='p1')||body.contextMatches!==true||!Number.isFinite(body.x)||!Number.isFinite(body.y)||!Number.isFinite(body.size))return false;let row=rows.get(record);if(!row){row={record,bodies:{},ack:null};rows.set(record,row);}row.bodies[body.side]=body;return true;}
  function acknowledge(record,ack){const row=rows.get(record);if(!row||!ack||ack.frame!==record.token.frame||!ack.key)return false;row.ack=ack;return true;}
  function complete(){for(const [record,row]of rows){rows.delete(record);if(!row.ack||!row.bodies.p1||!row.bodies.p2||captured.has(row.ack.frame))continue;captured.add(row.ack.frame);onCapture({frame:row.ack.frame,tokenId:record.token.id,bodies:row.bodies,ack:row.ack});}}
  return {observe,acknowledge,complete,get frames(){return [...captured].sort((a,b)=>a-b);}};
 }
 async function run(e){
  const {GEN5,MoveFX,ROM_SPRITE_ANIM,GameSpeed,check,until}=e,NativeSession=GEN5.Session,play=MoveFX.play,sprite=ROM_SPRITE_ANIM.draw,presented=MoveFX.presentedArenaFrame,arenaDraw=e.getArenaDraw(),selectedRates=rates(e.search),turns=[],actions=[];let current=null,seed=[1,2,3,4],gender='M',speed=1;
  const finish=()=>{e.finish();MoveFX.cancel();};
  GEN5.Session=class extends NativeSession{constructor(p1,p2,options){super(p1,p2,{...options,seed:seed.slice()});}};
  MoveFX.play=async function(id,side,options={}){
   const graphic=gender==='F'?'521-female':521,row={ordinal:actions.length+1,id,side,gender,speed,graphic,miss:!!options.miss,frames:[],profile:null};actions.push(row);
   row.gate=captureGate({graphic,onCapture:frame=>{row.frames.push(frame);e.capture('064 Gust '+row.ordinal+' '+gender+' '+side+' x'+speed+' f'+frame.frame,{...frame,gender,side,speed,graphic,moveId:id,actualNativeDraw:true,arenaCompleted:true});}});current=row;
   try{return await play.apply(this,arguments);}finally{if(current===row)current=null;delete row.gate;}
  };
  ROM_SPRITE_ANIM.draw=function(c,id,back,x,y,size,tick,grounded,a){
   const result=sprite.apply(this,arguments),row=current,active=MoveFX.active,record=active?.presentationRecord,side=back?'p1':'p2';
   if(row&&active){row.profile={species:active.profile?.species,id:active.profile?.id};const expected=active.cryIds?.[side];row.gate.observe(record,{success:!!result,graphic:id,side,back,x,y,size,grounded:!!grounded,pose:!!a,reaction:!!a?.reaction,effectiveTick:a?(Number.isFinite(a.nativeTick)?a.nativeTick:0):tick,contextMatches:active.side===row.side&&active.moveId===16&&active.profile?.species===521&&active.profile?.id===16&&String(expected)===String(id)});}
   return result;
  };
  MoveFX.presentedArenaFrame=function(record,...args){const ack=presented.call(this,record,...args);if(current)current.gate.acknowledge(record,ack);return ack;};
  e.setArenaDraw(function(...args){const result=arenaDraw.apply(this,args);if(current)current.gate.complete();return result;});
  try{
   for(speed of selectedRates)for(gender of ['M','F']){
    finish();GameSpeed.set(speed);const from=actions.length,team=[{name:'Unfezant',level:54,gender,moves:[16]}];await e.start(team);
    await until(()=>!e.busy(),'064 Gust actual commands ready');const session=e.session(),before={turn:session.battle.turn,hp:['p1','p2'].map(side=>session.active(side).hp),log:session.battle.log.length};await e.command();
    await until(()=>session.battle.turn===before.turn+1&&!e.busy(),'064 Gust actual native turn and visual completion',90000);
    const played=actions.slice(from),nativeLog=session.battle.log.slice(before.log);check(played.length===2&&['p1','p2'].every(side=>played.some(row=>row.side===side&&row.id===16)),'064 Gust native actions omitted or duplicated');check(!nativeLog.some(line=>line.startsWith('|-miss|')),'064 Gust seeded native accuracy unexpectedly missed');
    for(const row of played){check(!row.miss&&row.profile?.species===521&&row.profile?.id===16,'064 Gust native move/profile differs');check(keys.every(key=>row.frames.some(frame=>frame.frame===key)),'064 Gust missing acknowledged real-rendered protected key: '+row.side+' '+gender+' x'+speed+' '+row.frames.map(f=>f.frame));}
    for(const [i,side]of ['p1','p2'].entries())check(session.active(side).hp<before.hp[i],'064 Gust native HP did not decrease '+side);
    turns.push({gender,speed,seed:seed.slice(),input:'Actual LOTTA and move DOM buttons',before,turn:session.battle.turn,played,nativeLog});
   }
   return {sourcePins:e.sourcePins,query:e.search,selectedRates,protectedKeys:keys,turns,realGEN5Turns:true,suppliedBattleOutcomes:false,scope:'Native command turns with both M/F front/back roles; snapshots only after successful original body draws, production-clock ACK and completed arena draw. No audible comparison or physical Android certification.'};
  }finally{GEN5.Session=NativeSession;MoveFX.play=play;ROM_SPRITE_ANIM.draw=sprite;MoveFX.presentedArenaFrame=presented;e.setArenaDraw(arenaDraw);current=null;finish();GameSpeed.set(1);}
 }
 const api={keys,rates,captureGate,run};root.QAGust064=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
