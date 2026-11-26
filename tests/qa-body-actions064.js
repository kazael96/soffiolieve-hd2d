/* Isolated real-command observer: never shipped in the public game. */
(function(root){
 'use strict';
 const clone=value=>JSON.parse(JSON.stringify(value));
 function rates(search=''){const raw=new URLSearchParams(search).get('battleRates064');if(raw===null)return[1,2,4];if(!/^[124](?:,[124])*$/.test(raw))throw Error('Invalid battleRates064');const out=raw.split(',').map(Number);if(new Set(out).size!==out.length)throw Error('Repeated battleRates064');return out;}
 const windows=Object.freeze({
  tail:Object.freeze([{label:'start',from:0,to:.16},{label:'release',from:.18,to:.31},{label:'peak',from:.33,to:.51},{label:'recovery',from:.83,to:1}].map(Object.freeze)),
  tynamo:Object.freeze([{label:'start',from:0,to:.18},{label:'impact',from:.35,to:.61},{label:'end',from:.82,to:1}].map(Object.freeze))
 });
 // Tokens belong to one invocation of the original arena draw. Offscreen
 // native passes can be composited by that draw; success alone is insufficient.
 function captureGate({graphic,attacker,phases,onCapture}){
  const rows=new Map(),captured=new Set();
  function observe(token,body){
   if(!token||body?.success!==true||String(body.graphic)!==String(graphic)||!['p1','p2'].includes(body.side)||body.back!==(body.side==='p1')||body.contextMatches!==true||!Number.isFinite(body.x)||!Number.isFinite(body.y)||!Number.isFinite(body.size)||body.size<=0||body.visible!==true)return false;
   let row=rows.get(token);if(!row){row={bodies:{}};rows.set(token,row);}row.bodies[body.side]=body;return true;
  }
  function complete(token,{success=false,activeMatches=false,visible=false,audit=null}={}){
   const row=rows.get(token);rows.delete(token);if(!row||!success||!activeMatches||!visible||!row.bodies.p1||!row.bodies.p2)return false;
   const frame=row.bodies[attacker].frame,duration=row.bodies[attacker].duration;if(!Number.isFinite(frame)||!Number.isFinite(duration)||duration<=0||frame<0||frame>duration)return false;
   const phase=phases.find(p=>!captured.has(p.label)&&frame/duration>=p.from&&frame/duration<=p.to);if(!phase)return false;
   captured.add(phase.label);onCapture({phase:phase.label,window:[phase.from*duration,phase.to*duration],approximateFrame:frame,normalizedFrame:frame/duration,actionFrame:frame,actionFrameSource:row.bodies[attacker].frameSource??null,bodies:row.bodies,audit:typeof audit==='function'?audit():audit,completedOriginalArena:true,exactProtectedFrame:false});return true;
  }
  return{observe,complete,get phases(){return[...captured];}};
 }
 function specifications(kind){return kind==='tail'?[500,503].map(species=>({species,id:39,name:species===500?'Emboar':'Samurott',seed:[1,2,3,4]})):[33,86,209,451].map(id=>({species:602,id,name:'Tynamo',seed:id===86?[1,2,3,5]:[1,2,3,4]}));}
 function stats(session){return Object.fromEntries(['p1','p2'].map(side=>{const mon=session.active(side);return[side,{hp:mon.hp,pp:mon.moveSlots[0].pp,def:mon.boosts.def,status:mon.status}];}));}
 function validateTurn(kind,spec,before,after,played,nativeLog,check){
  check(played.length===2&&['p1','p2'].every(side=>played.some(row=>row.side===side&&row.id===spec.id)),'064 body native actions omitted or duplicated');
  check(!nativeLog.some(line=>line.startsWith('|-miss|')||line.startsWith('|cant|')),'064 body selected native seed unexpectedly missed or prevented action');
  for(const side of['p1','p2']){
   check(after[side].pp===before[side].pp-1,'064 body native PP differs '+side);
   if(kind==='tail'){check(after[side].hp===before[side].hp,'064 tail changed native HP '+side);check(after[side].def===before[side].def-1,'064 tail defense did not fall '+side);}
   else if(spec.id===86){check(after[side].hp===before[side].hp&&after[side].status==='par','064 Tynamo native paralysis differs '+side);}
   else check(after[side].hp<before[side].hp,'064 Tynamo native damage absent '+side);
  }
 }
 async function run(kind,e){
  const {GEN5,MoveFX,ROM_SPRITE_ANIM:R,GameSpeed,check,until}=e,NativeSession=GEN5.Session,play=MoveFX.play,sprite=R.draw,arenaDraw=e.getArenaDraw(),selectedRates=rates(e.search),turns=[],actions=[],phases=windows[kind],BG=e.BattleGround||root.BattleGround;
  let current=null,arenaToken=null,spec=null,speed=1,serial=0;
  const finish=()=>{try{e.finish();}finally{MoveFX.cancel();}};
  function audit(surface){
   const info=e.getArenaInfo?.()||{width:surface?.width,height:surface?.height,visible:!root.document?.hidden},visible=info.visible===true&&!root.document?.hidden;
   const layout=Number.isFinite(info.width)&&Number.isFinite(info.height)&&BG?.layout?BG.layout(info.width,info.height):null;
   // Keep numeric layout only; camera/view objects are unnecessary evidence.
   const ground=layout?Object.fromEntries(['p1','p2'].map(side=>[side,Object.fromEntries(['x','y','height','size','w','h'].map(key=>[key,layout[side]?.[key]??null]))])):null;
   return{visible,width:info.width,height:info.height,framingStatus:BG?.framingStatus?clone(BG.framingStatus):null,commonFactor:BG?.framingStatus?.factor??null,layout:ground};
  }
  try{
   GEN5.Session=class extends NativeSession{constructor(p1,p2,options){super(p1,p2,{...options,seed:spec.seed.slice()});}};
   MoveFX.play=async function(id,side,options={}){
    const row={ordinal:actions.length+1,id,side,species:spec.species,speed,miss:!!options.miss,frames:[],profile:null};actions.push(row);
    row.gate=captureGate({graphic:spec.species,attacker:side,phases,onCapture:frame=>{row.frames.push(frame);e.capture('064 '+kind+' '+row.ordinal+' '+spec.species+' '+id+' '+side+' x'+speed+' '+frame.phase,{...frame,moveId:id,species:spec.species,side,speed,actualNativeDraw:true});}});current=row;
    try{return await play.apply(this,arguments);}finally{if(current===row)current=null;delete row.gate;}
   };
   R.draw=function(c,id,back,x,y,size,tick,grounded,a){
    const result=sprite.apply(this,arguments),row=current,active=MoveFX.active,side=back?'p1':'p2';
    if(row&&active&&arenaToken){
     const p=active.profile,duration=p?.frames,frame=side===row.side&&Number.isFinite(a?.t)?a.t*duration:null,tail=kind!=='tail'||side!==row.side||a?.nativeTailWhip===spec.species&&a.nativeTick===0&&a.nativeParentMap===0;
     row.profile={species:p?.species,id:p?.id,kind:p?.kind,frames:duration};
     const contextMatches=active.side===row.side&&active.moveId===spec.id&&row.id===spec.id&&p?.species===spec.species&&p?.id===spec.id&&String(active.cryIds?.[side])===String(id)&&tail&&(kind!=='tail'||p.kind==='nativeTailWhipStatus064');
     row.gate.observe(arenaToken,{success:result===true,graphic:id,side,back,x,y,size,grounded:!!grounded,visible:(c.globalAlpha??1)>0,contextMatches,frame,frameSource:frame===null?null:'attacker-pose.t*profile.frames',duration,effectiveTick:a?(Number.isFinite(a.nativeTick)?a.nativeTick:0):tick,pose:a?{species:a.species,t:a.t??null,nativeTailWhip:a.nativeTailWhip??null,nativeTick:a.nativeTick??null,nativeParentMap:a.nativeParentMap??null,tail:a.tail??null}:null});
     arenaToken.surface=c.canvas;
    }
    return result;
   };
   e.setArenaDraw(function(...args){
    const row=current,active=MoveFX.active,token={id:++serial};arenaToken=token;let success=false;
    try{const value=arenaDraw.apply(this,args);success=true;return value;}
    finally{arenaToken=null;if(row&&row===current){const info=e.getArenaInfo?.()||{visible:!root.document?.hidden};row.gate.complete(token,{success,activeMatches:active===MoveFX.active,visible:info.visible===true&&!root.document?.hidden,audit:()=>audit(token.surface)});}}
   });
   for(speed of selectedRates)for(spec of specifications(kind)){
    finish();GameSpeed.set(speed);const from=actions.length,team=[{name:spec.name,level:54,moves:[spec.id]}];await e.start(team,team);
    await until(()=>!e.busy(),'064 '+kind+' actual commands ready');const session=e.session(),before={turn:session.battle.turn,stats:stats(session),log:session.battle.log.length};await e.command(spec.id);
    await until(()=>session.battle.turn===before.turn+1&&!e.busy(),'064 '+kind+' actual native turn and visual completion',90000);
    const played=actions.slice(from),nativeLog=session.battle.log.slice(before.log),after=stats(session);validateTurn(kind,spec,before.stats,after,played,nativeLog,check);
    for(const row of played){check(!row.miss&&row.profile?.species===spec.species&&row.profile?.id===spec.id,'064 body actual profile differs');check(phases.every(p=>row.frames.some(f=>f.phase===p.label)),'064 '+kind+' missing completed actual draw windows '+row.side+' '+row.frames.map(f=>f.phase));if(kind==='tynamo')for(const frame of row.frames)check(frame.audit?.framingStatus?.supported===true&&frame.audit.commonFactor>0&&frame.audit.commonFactor<=1&&frame.audit.layout,'064 Tynamo framing audit unsupported');}
    turns.push({species:spec.species,moveId:spec.id,speed,seed:spec.seed.slice(),input:'Actual LOTTA and move DOM buttons',before,after,turn:session.battle.turn,played,nativeLog});
   }
   return{sourcePins:e.sourcePins,query:e.search,selectedRates,windows:phases,turns,realGEN5Turns:true,suppliedBattleOutcomes:false,protectedPresentationKeys:false,scope:'Approximate frame windows from successful original native draws and completed visible original arena draws. Native turns seeded only at construction; no forced rendering, outcomes or public data modifications. No audible or physical Android certification.'};
  }finally{GEN5.Session=NativeSession;MoveFX.play=play;R.draw=sprite;current=null;arenaToken=null;e.setArenaDraw(arenaDraw);try{finish();}finally{GameSpeed.set(1);}}
 }
 const api={rates,windows,captureGate,specifications,validateTurn,runTail:e=>run('tail',e),runTynamo:e=>run('tynamo',e)};root.QABodyActions064=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
