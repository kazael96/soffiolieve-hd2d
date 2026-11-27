/* Fixture-only mixed-opponent Tail Whip commands. No public game mutations. */
(function(root){
 'use strict';
 const phases=Object.freeze([{label:'start',from:0,to:.16},{label:'release',from:.18,to:.31},{label:'peak',from:.33,to:.51},{label:'recovery',from:.83,to:1}].map(Object.freeze));
 function rates(search=''){const p=new URLSearchParams(search),values=p.getAll('battleRates064');if(!values.length)return[1,2,4];if(values.length!==1||!/^[124](?:,[124])*$/.test(values[0]))throw Error('Invalid battleRates064');const out=values[0].split(',').map(Number);if(new Set(out).size!==out.length)throw Error('Repeated battleRates064');return out;}
 function specifications(){const out=[];for(const [species,name,foe,foeName,foeMove]of[[500,'Emboar',498,'Tepig',39],[503,'Samurott',495,'Snivy',43]])for(const side of['p1','p2']){const actor={species,name,id:39},counter={species:foe,name:foeName,id:foeMove};out.push({species,side,seed:[1,2,3,4],p1:side==='p1'?actor:counter,p2:side==='p2'?actor:counter});}return out;}
 function captureGate({graphics,attacker,onCapture}){
  const rows=new Map(),captured=new Set();
  function observe(record,arena,body){
   if(!record?.token||!arena||body?.success!==true||!['p1','p2'].includes(body.side)||String(body.graphic)!==String(graphics[body.side])||body.back!==(body.side==='p1')||body.contextMatches!==true||body.protectedKey!==true||body.visible!==true||body.frame!==record.token.frame||!Number.isFinite(body.x)||!Number.isFinite(body.y)||!Number.isFinite(body.size)||body.size<=0)return false;
   let row=rows.get(record);if(!row){row={arena,bodies:{},ack:null};rows.set(record,row);}if(row.arena!==arena)return false;row.bodies[body.side]=body;return true;
  }
  function acknowledge(record,arena,ack){const row=rows.get(record);if(!row||row.arena!==arena||!ack?.key||ack.frame!==record.token.frame)return false;row.ack=ack;return true;}
  function complete(arena,{success=false,activeMatches=false,visible=false,audit=null}={}){
   let accepted=false;
   for(const [record,row]of rows){if(row.arena!==arena)continue;rows.delete(record);if(!success||!activeMatches||!visible||!row.ack||!row.bodies.p1||!row.bodies.p2)continue;
    const frame=record.token.frame,duration=row.bodies[attacker].duration;if(!Number.isFinite(duration)||duration<=0||frame<0||frame>duration)continue;const phase=phases.find(p=>!captured.has(p.label)&&frame/duration>=p.from&&frame/duration<=p.to);if(!phase)continue;
    captured.add(phase.label);accepted=true;onCapture({phase:phase.label,window:[phase.from*duration,phase.to*duration],frame,normalizedFrame:frame/duration,tokenId:record.token.id,bodies:row.bodies,ack:row.ack,audit:typeof audit==='function'?audit():audit,completedOriginalArena:true,exactProtectedFrame:true});
   }
   return accepted;
  }
  return{observe,acknowledge,complete,get phases(){return[...captured];}};
 }
 function stats(session){return Object.fromEntries(['p1','p2'].map(side=>{const p=session.active(side);return[side,{hp:p.hp,pp:p.moveSlots[0].pp,def:p.boosts.def}];}));}
 function validateTurn(spec,before,after,played,nativeLog,check){
  check(played.length===2&&['p1','p2'].every(side=>played.some(r=>r.side===side&&r.id===spec[side].id&&r.species===spec[side].species)),'064 mixed Tail native actions omitted or duplicated');
  check(!nativeLog.some(line=>line.startsWith('|-miss|')||line.startsWith('|cant|')),'064 mixed Tail selected native seed missed or prevented an action');
  for(const side of['p1','p2']){check(after[side].hp===before[side].hp,'064 mixed Tail changed native HP '+side);check(after[side].pp===before[side].pp-1,'064 mixed Tail native PP differs '+side);check(after[side].def===before[side].def-1,'064 mixed Tail native defense differs '+side);}
 }
 async function run(e){
  const{GEN5,MoveFX,ROM_SPRITE_ANIM:R,GameSpeed,check,until}=e,NativeSession=GEN5.Session,play=MoveFX.play,sprite=R.draw,presented=MoveFX.presentedArenaFrame,arenaDraw=e.getArenaDraw(),selectedRates=rates(e.search),turns=[],actions=[];
  let spec=null,current=null,arenaScope=null,speed=1,serial=0;
  const finish=()=>{try{e.finish();}finally{MoveFX.cancel();}};
  const audit=()=>{const info=e.getArenaInfo?.()||{visible:!root.document?.hidden};return{...info,visible:info.visible===true&&!root.document?.hidden};};
  try{
   GEN5.Session=class extends NativeSession{constructor(p1,p2,options){super(p1,p2,{...options,seed:spec.seed.slice()});}};
   MoveFX.play=async function(id,side,options={}){
    const actor=spec[side],custom=id===39&&side===spec.side&&[500,503].includes(actor.species),row={ordinal:actions.length+1,id,side,species:actor.species,speed,miss:!!options.miss,customTail:custom,coverage:custom?'guarded500503Tail39':'existing-counteractor-action-only',frames:[],profile:null};actions.push(row);
    if(custom)row.gate=captureGate({graphics:{p1:spec.p1.species,p2:spec.p2.species},attacker:side,onCapture:frame=>{row.frames.push(frame);e.capture('064 mixedTail '+row.ordinal+' '+actor.species+' '+side+' foe'+spec[side==='p1'?'p2':'p1'].species+' x'+speed+' '+frame.phase,{...frame,species:actor.species,moveId:id,side,speed,actualNativeDraw:true});}});current=row;
    try{return await play.apply(this,arguments);}finally{if(current===row)current=null;delete row.gate;}
   };
   R.draw=function(c,id,back,x,y,size,tick,grounded,a){
    const result=sprite.apply(this,arguments),row=current,active=MoveFX.active,side=back?'p1':'p2';
    if(row&&active){const p=active.profile;row.profile={species:p?.species,id:p?.id,kind:p?.kind,marker:p?.tailWhip064};
     if(row.gate&&arenaScope){const record=active.presentationRecord,clock=active.presentationClock,snapshot=clock?.snapshot?.(),frame=clock?.value,duration=p?.frames,isActor=side===row.side,bodyGuard=!isActor||a?.nativeTailWhip===row.species&&a.nativeTick===0&&a.nativeParentMap===0,contextMatches=active.side===row.side&&active.moveId===39&&p?.species===row.species&&p.id===39&&p.kind==='nativeTailWhipStatus064'&&p.tailWhip064==='native500503TailWhip064'&&bodyGuard&&String(active.cryIds?.[side])===String(id)&&record?.action===active;
      row.gate.observe(record,arenaScope,{success:result===true,graphic:id,side,back,x,y,size,grounded:!!grounded,visible:(c.globalAlpha??1)>0,contextMatches,protectedKey:Array.isArray(snapshot?.required)&&snapshot.required.includes(frame),frame,duration,effectiveTick:a?(Number.isFinite(a.nativeTick)?a.nativeTick:0):tick,pose:a?{species:a.species,t:a.t??null,nativeTailWhip:a.nativeTailWhip??null,nativeTick:a.nativeTick??null,nativeParentMap:a.nativeParentMap??null,reaction:!!a.reaction}:null});
     }
    }return result;
   };
   MoveFX.presentedArenaFrame=function(record,...args){const ack=presented.call(this,record,...args);if(current?.gate&&arenaScope)current.gate.acknowledge(record,arenaScope,ack);return ack;};
   e.setArenaDraw(function(...args){const row=current,active=MoveFX.active,scope={id:++serial};arenaScope=scope;let success=false;try{const value=arenaDraw.apply(this,args);success=true;return value;}finally{arenaScope=null;if(row?.gate&&row===current){const info=audit();row.gate.complete(scope,{success,activeMatches:active===MoveFX.active,visible:info.visible,audit:info});}}});
   for(speed of selectedRates)for(spec of specifications()){
    finish();GameSpeed.set(speed);const from=actions.length,team=side=>[{name:spec[side].name,level:54,moves:[spec[side].id]}];await e.start(team('p1'),team('p2'));await until(()=>!e.busy(),'064 mixed Tail actual commands ready');const session=e.session(),before={turn:session.battle.turn,stats:stats(session),log:session.battle.log.length};await e.command(spec.p1.id);await until(()=>session.battle.turn===before.turn+1&&!e.busy(),'064 mixed Tail native turn and visual completion',90000);
    const played=actions.slice(from),nativeLog=session.battle.log.slice(before.log),after=stats(session);validateTurn(spec,before.stats,after,played,nativeLog,check);const custom=played.filter(row=>row.customTail);check(custom.length===1,'064 mixed Tail omitted or duplicated guarded actor');
    for(const row of custom){check(!row.miss&&row.profile?.species===spec.species&&row.profile.id===39&&row.profile.kind==='nativeTailWhipStatus064'&&row.profile.marker==='native500503TailWhip064','064 mixed Tail guarded native profile differs');check(phases.every(p=>row.frames.some(f=>f.phase===p.label)),'064 mixed Tail missing acknowledged completed draw windows '+spec.species+' '+spec.side+' x'+speed+' '+row.frames.map(f=>f.phase));}
    turns.push({species:spec.species,customSide:spec.side,opponent:{...spec[spec.side==='p1'?'p2':'p1']},speed,seed:spec.seed.slice(),input:'Actual LOTTA and move DOM buttons',before,after,turn:session.battle.turn,played,nativeLog});
   }
   return{sourcePins:e.sourcePins,query:e.search,selectedRates,windows:phases,turns,realGEN5Turns:true,suppliedBattleOutcomes:false,protectedPresentationKeys:true,capturedCoverage:'Only guarded Emboar500/39 and Samurott503/39. Tepig498/39 and Snivy495/43 are existing counteractor actions, not new custom-profile coverage.',scope:'First required native production-clock key in each window, after both role-specific successful original native draws, exact original presentation ACK and completed visible original arena. No supplied pose, turn outcome or extra draw. No continuous playback, audible comparison or physical Android certification.'};
  }finally{GEN5.Session=NativeSession;MoveFX.play=play;R.draw=sprite;MoveFX.presentedArenaFrame=presented;current=null;arenaScope=null;e.setArenaDraw(arenaDraw);try{finish();}finally{GameSpeed.set(1);}}
 }
 const api={rates,phases,specifications,captureGate,stats,validateTurn,run};root.QATailMixed064=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
