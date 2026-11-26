/* Original Nitro SPA textures and script spawn order. HD-2D projection is adapted.
 * This is deliberately not presented as a complete native battle-animation VM. */
(()=>{
 const data=window.ROM_MOVE_FX,images=new Map();let active=null,playbackSpeed=1,generation=0;
 const rand=(n)=>{let x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)},clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const rgb=v=>[(v&31)*255/31,(v>>5&31)*255/31,(v>>10&31)*255/31];
 function image(t){if(!t)return null;let im=images.get(t.name);if(!im){im=new Image();im.src='assets/move-fx/'+t.name;images.set(t.name,im)}return im}
 function life(e){return Math.min(240,Math.max(1,e.delay)+Math.max(1,e.emitterLife||1)+Math.max(1,e.life||20)+1+Math.max(0,e.child?.life||0))}
 function timeline(move,variant=0,depth=0,side='p1',context={}){
  const v=move?.variants[Math.min(variant,move.variants.length-1)],events=[],audio=[],visual=[],clact=[];let at=0,end=0,skipBytes=0;
  for(const [op,a] of v?.commands||[]){
   if(skipBytes>0){skipBytes-=2+a.length*4;continue}
   if(op===72){skipBytes=Math.max(0,a[0]);continue}
   if(op===59&&[19,39].includes(a[0])){let x=a[0]===19?(side==='p2'?1:0):(context.layout??0),y=a[2],condition=[x===y,x!==y,x<y,x>y,x<=y,x>=y][a[1]];if(condition)skipBytes=Math.max(0,a[3]);continue}
   if(op===77)break;
   if(op===74&&depth<4){let child=data.moves[a[0]];if(child&&child.id!==move.id){let t=timeline(child,0,depth+1,side,context);for(let e of t.events)events.push({...e,start:e.start+at,end:e.end+at});for(let e of t.audio)audio.push({...e,start:e.start+at});for(let e of t.visual||[])visual.push({...e,start:e.start+at,end:e.end+at});end=Math.max(end,at+t.frames);at=end;break}}
   if(op===11)for(let e of events)if(e.spa.id===a[0]&&e.end>at)e.end=at;
   if(window.NativeVisual?.supported.has(op)){if(context.nativeWaitGroups&&[0,1].includes(op))for(let previous of visual)if([0,1].includes(previous.op))previous.end=Math.min(previous.end,at);let event={op,args:a,start:at,end:at+window.NativeVisual.duration(op,a)};visual.push(event);end=Math.max(end,event.end);if(op===36)backgroundImage(a[0])}
   if(window.NativeCapture?.supported.has(op)){let event={op,args:a,start:at,end:at+window.NativeCapture.duration(op,a)};clact.push(event);end=Math.max(end,event.end)}
   if(op===54){let raw=[a[0],a[1],2,0,0,a[4],a[5],a[6],a[7]];audio.push({kind:'panControl',channel:a[0],start:at,raw,from:a[2],to:a[3]});end=Math.max(end,window.NativeAudio?.controlEnd(raw,at)??at)}
   if(op===52&&a[0]>0){let start=at+Math.max(0,a[3]||0);audio.push({kind:'sfx',id:a[0],channel:a[1],target:a[2],start,raw:a});end=Math.max(end,start+1)}
   if(op===55){audio.push({kind:'control',channel:a[0],start:at,raw:a});end=Math.max(end,window.NativeAudio?.controlEnd(a,at)??at)}
   if(op===67){let start=at+Math.max(0,a[6]||0);audio.push({kind:'cry',target:a[0],start,raw:a});end=Math.max(end,start+1)}

   if(op===57){at+=clamp(a[0],0,300);continue}
   if(op===56){if(context.nativeWaitGroups){const kind=a[0],waitVisual=visual.filter(e=>kind===0||kind===1&&[0,1,3].includes(e.op)||kind===3&&[18,19,21,22,23].includes(e.op)||kind===9&&[27,42].includes(e.op));at=Math.max(at+1,...waitVisual.map(e=>e.end),...((kind===0||kind===2)?events.map(e=>e.end):[]),...(kind===0?clact.map(e=>e.end):[]))}else at=Math.max(at,end);continue}
   if([7,8,9,10,12,13,14,15,16,17].includes(op)){
    const spa=data.spas[a[0]],sourceEmitter=spa?.emitters[a[1]];if(!sourceEmitter)continue;let params=[1,1,1,1];if([7,9,10].includes(op))params=a.slice(7,11).map(v=>v?v/4096:1);else if(op===8)params=a.slice(11,15).map(v=>v?v/4096:1);else if([12,13,14,15].includes(op)){let explicit=op===13||op===15;params=[op===14?.75:1,(a[explicit?10:8]||4096)/4096,op===14?.75:1,(a[explicit?11:9]||4096)/4096]}const e={...sourceEmitter,radius:sourceEmitter.radius*params[0],length:sourceEmitter.length*params[0],life:Math.floor(sourceEmitter.life*params[1]),scale:sourceEmitter.scale*params[2],radialVelocity:sourceEmitter.radialVelocity*params[3],axialVelocity:sourceEmitter.axialVelocity*params[3]};
    const target=[7,9,10].includes(op)?a[2]:[12,14].includes(op)?a[4]:11;
    const travel=[12,13,14,15].includes(op),trajectoryFrames=travel?Math.max(1,(a[op===13||op===15?8:6]||4096)>>12):0,length=Math.max(life(e),trajectoryFrames),event={op,args:a,spa,e,emitterIndex:a[1],sourceEmitter,start:at,end:at+length,target,travel,trajectoryFrames,spawnScale:1,offset:[0,0,0],scale:[1,1,1],opacity:1};
    // Target-attached commands carry three fx32 position and scale components.
    // Target codes are mapped to the corresponding HD-2D billboard anchor.
    if([7,9,10].includes(op)){event.offset=[0,(a[4]||0)/4096,0];event.scale=[1,1,1];event.opacity=1}
    else if(op===8){event.offset=a.slice(2,5).map(v=>v/4096);event.scale=[1,1,1];event.opacity=1}
    if(travel){event.offset=[0,(a[op===13||op===15?7:5]||0)/4096,0];event.scale=[1,1,1]}if(target===18&&!travel){events.push({...event,target:14},{...event,target:16})}else events.push(event);end=Math.max(end,event.end);
    image(spa.textures[e.texture]);for(let k of e.textureKeys||[])image(spa.textures[k]);if(e.child)image(spa.textures[e.child.texture]);
   }
   // Sprite deformation task opcodes. Retained as script events, projected onto billboards.
   if(!window.NativeVisual&&[18,19,21,22,23].includes(op)){let duration=12;events.push({pose:true,op,args:a,start:at,end:at+duration});end=Math.max(end,at+duration)}
  }
  // Native resource/sound-only scripts keep a short action window, without invented particles.
  if(context.nativeWaitGroups)end=Math.max(0,...events.map(e=>e.end),...visual.map(e=>e.end),...clact.map(e=>e.end));
  return{events,audio,visual,clact,frames:Math.max(28,end,at),nativeFrames:Math.max(28,end,at)};
 }

 // PRIVATE572/3 only: body-only handoff while the next real hit prepares.
 // A retained preview owns no old audio, timer, promise or draw ACK.
 const pendingSlapPreparations064=new Set();
 function slapPreparation064(){let resolve;const ticket={cancelled:false,promise:new Promise(done=>resolve=done),cancel(){if(ticket.cancelled)return;ticket.cancelled=true;resolve(null);}};pendingSlapPreparations064.add(ticket);return ticket;}
 function waitSlapPreparation064(task,ticket,token){if(!ticket)return task;const owned=Promise.resolve(task).then(value=>{if(ticket.cancelled||token!==generation){value?.cancel?.();return null;}return value;});return Promise.race([owned,ticket.promise]);}
 function slapOwner064(side,targetSide,cryIds){
  const owner=typeof session==='undefined'?null:session;
  if(!owner?.battle||owner.double||owner.multi||owner.battle.gameType!=='singles'||typeof owner.active!=='function'||!['p1','p2'].includes(side)||!['p1','p2'].includes(targetSide)||side===targetSide||Object.keys(cryIds||{}).sort().join(',')!=='p1,p2')return null;
  const reader=window.BattlePresentationOwners?.read;let presentation;try{presentation=reader?.();}catch{return null;}
  if(!presentation?.layoutSupported||!presentation.available)return null;
  const actors={},banks={};for(const role of ['p1','p2']){
   const native=owner.active(role),bank=window.ROM_SPRITE_ANIM?.cache[cryIds[role]+'-'+(role==='p1'?'back':'front')];
   const visible=presentation.roles?.[role];
   if(!native||!bank?.ready||!bank.data||!bank.image||!visible||visible.altered||!visible.bankReady||String(visible.graphic)!==String(cryIds[role])||presentation.nativeSpecies?.[role]!==native.species?.num||anatomicalId(visible.graphic)!==native.species?.num)return null;
   actors[role]=native;banks[role]={bank,data:bank.data,image:bank.image};
  }
  if(actors[side].species?.num!==572||String(cryIds[side])!=='572')return null;
  return{owner,reader,side,targetSide,actors,banks,cryIds:{...cryIds}};
 }
 // Capture only native/visual identities before IO. Bank readiness and bank
 // replacement belong to resource preparation, never to identity acquisition.
 function slapAcquisition064(side,targetSide,cryIds){
  const owner=typeof session==='undefined'?null:session,reader=window.BattlePresentationOwners?.read;
  if(!owner?.battle||owner.double||owner.multi||owner.battle.gameType!=='singles'||typeof owner.active!=='function'||!['p1','p2'].includes(side)||!['p1','p2'].includes(targetSide)||side===targetSide||Object.keys(cryIds||{}).sort().join(',')!=='p1,p2')return null;
  let view;try{view=reader?.();}catch{return null;}
  if(!view?.layoutSupported||!view.available)return null;
  const actors={},graphics={};for(const role of ['p1','p2']){
   const actor=owner.active(role),visual=view.roles?.[role];
   if(!actor||!visual||visual.altered||String(visual.graphic)!==String(cryIds[role])||view.nativeSpecies?.[role]!==actor.species?.num||anatomicalId(visual.graphic)!==actor.species?.num)return null;
   actors[role]=actor;graphics[role]=visual.graphic;
  }
  if(actors[side].species?.num!==572||String(cryIds[side])!=='572')return null;
  return{owner,reader,side,targetSide,actors,graphics,cryIds:{...cryIds}};
 }
 function sameSlapAcquisition064(a,b){return !!a&&!!b&&a.owner===b.owner&&a.reader===b.reader&&a.side===b.side&&a.targetSide===b.targetSide&&['p1','p2'].every(role=>a.actors[role]===b.actors[role]&&a.graphics[role]===b.graphics[role]&&a.cryIds[role]===b.cryIds[role]);}
 function checkSlapAcquisition064(stamp,side,targetSide,cryIds,audio=null){
  if(stamp&&!sameSlapAcquisition064(stamp,slapAcquisition064(side,targetSide,cryIds))){try{audio?.cancel();}finally{throw Error('Native Double Slap acquired owner changed during preparation');}}
 }
 function sameSlapOwner064(a,b){return !!a&&!!b&&a.owner===b.owner&&a.reader===b.reader&&a.side===b.side&&a.targetSide===b.targetSide&&['p1','p2'].every(role=>a.actors[role]===b.actors[role]&&a.cryIds[role]===b.cryIds[role]&&a.banks[role].bank===b.banks[role].bank&&a.banks[role].data===b.banks[role].data&&a.banks[role].image===b.banks[role].image);}
 function isSlap064(x){return x?.moveId===3&&x.profile?.species===572&&x.profile?.id===3&&x.profile.minccinoNativeSlap064==='private-native-paw-SPA163';}
 function completedSlapHold064(x){const h=x?.nativeSlapContext064;return isSlap064(x)&&!!x.nativeSlapOwner064&&!x.miss&&Number.isInteger(h?.hitCount)&&h.hitCount>=2&&h.hitCount<=5&&Number.isInteger(h.hitIndex)&&h.hitIndex>=0&&h.hitIndex<h.hitCount-1;}
 function slapContinuation064(id,side,options){
  const x=active,next=options.context,old=x?.nativeSlapContext064,target=options.targetSide||(side==='p1'?'p2':'p1');
  if(id!==3||options.effect||options.miss||options.hiddenSides?.length||!isSlap064(x)||!x.preview||x.preparationHold064!==undefined||x.nativeSlapCompletedHold064!==true||x.side!==side||x.targetSide!==target||x.miss||x.hiddenSides?.length||!Number.isInteger(next?.hitCount)||next.hitCount!==old?.hitCount||!Number.isInteger(next.hitIndex)||next.hitIndex!==old.hitIndex+1||next.hitIndex>=next.hitCount||!sameSlapOwner064(x.nativeSlapOwner064,slapOwner064(side,target,options.cryIds)))return null;
  return{...x,sequence:{...x.sequence,events:[],visual:[],clact:[],audio:[]},resolve(){},timer:null,presentationClock:null,presentationAudio:null,presentationRecord:null,presentationReject:null,presentationCompleting:false,preparationHold064:generation+1,nativeSlapCompletedHold064:false};
 }
 function guardColdSlap064(){const x=active;if(x?.preparationHold064!==undefined&&(x.preparationHold064!==generation||!sameSlapOwner064(x.nativeSlapOwner064,slapOwner064(x.side,x.targetSide,x.cryIds))))cancel();}
 // Native510/10 opt-in lease. Independent from Minccino acquisition/recovery.
 function nativeScratchProfile064(p){return p?.species===510&&p.id===10&&p.key==='training-510-10'&&p.kind==='furySlash'&&p.liepardNativeScratch064==='private-native-claw-SPA170';}
 function nativeScratchAcquisition064(side,targetSide,cryIds){
  const owner=typeof session==='undefined'?null:session,reader=window.BattlePresentationOwners?.read;
  if(!owner?.battle||owner.double||owner.multi||owner.battle.gameType!=='singles'||typeof owner.active!=='function'||!['p1','p2'].includes(side)||!['p1','p2'].includes(targetSide)||side===targetSide||Object.keys(cryIds||{}).sort().join(',')!=='p1,p2')return null;
  let view;try{view=reader?.();}catch{return null;}if(!view?.layoutSupported||!view.available)return null;
  const actors={},graphics={};for(const role of ['p1','p2']){const actor=owner.active(role),visual=view.roles?.[role];if(!actor||!visual||visual.altered||String(visual.graphic)!==String(cryIds[role])||view.nativeSpecies?.[role]!==actor.species?.num||anatomicalId(visual.graphic)!==actor.species?.num)return null;actors[role]=actor;graphics[role]=visual.graphic;}
  if(actors[side].species?.num!==510||actors[targetSide].species?.num!==572||String(cryIds[side])!=='510'||String(cryIds[targetSide])!=='572')return null;
  return{owner,battle:owner.battle,reader,side,targetSide,actors,graphics,cryIds:{...cryIds},generation};
 }
 function checkNativeScratchAcquisition064(acquired,side,targetSide,cryIds,audio){
  if(!acquired)return;const next=nativeScratchAcquisition064(side,targetSide,cryIds);
  if(!next||next.owner!==acquired.owner||next.battle!==acquired.battle||next.reader!==acquired.reader||next.generation!==acquired.generation||next.side!==acquired.side||next.targetSide!==acquired.targetSide||['p1','p2'].some(role=>next.actors[role]!==acquired.actors[role]||next.graphics[role]!==acquired.graphics[role]||String(next.cryIds[role])!==String(acquired.cryIds[role]))){try{audio?.cancel?.();}catch{}throw Error('Native Scratch acquired owner changed during preparation');}
 }
 function assertNativeScratchOwner064(action=active){
  if(!nativeScratchProfile064(action?.profile)||action!==active||!action.nativeScratchLease064||action.nativeScratchGeneration064!==generation)throw Error('Native Scratch active owner is unavailable');
  checkNativeScratchAcquisition064(action.nativeScratchLease064,action.side,action.targetSide,action.cryIds);return true;
 }
 function closeNativeScratchLayout064(action,ownerGeneration,reason){
  try{window.SpeciesMoves?.cancelLayoutPreparation?.(action,ownerGeneration,reason);}catch(error){if(action)action.nativeScratchCleanupError064=error;}
 }
 function failLayoutPreparation(action,ownerGeneration,error){
  if(action!==active||ownerGeneration!==generation||!nativeScratchProfile064(action?.profile)||!action?.presentationClock||typeof action.presentationReject!=='function')return false;
  failPresentation(action,error instanceof Error?error:new Error(String(error)));return true;
 }
 // CLOSED541 begin: independent pending/retained ownership, no native572/3 tag.
 const pendingTail541=new Set();
 function tailProfile541(p){return p?.species===572&&p.id===541&&p.nativeTail541064==='native572-tail541-oam-partition/v1';}
 function tailTicket541(){let reject;const ticket={promise:new Promise((_,bad)=>reject=bad),cancel(){reject(Error('Native541 preparation cancelled'));}};pendingTail541.add(ticket);return ticket;}
 function waitTail541(task,ticket){if(!ticket)return task;const owned=Promise.resolve(task).then(value=>{if(!pendingTail541.has(ticket)){try{value?.cancel?.();}catch{}throw Error('Native541 stale preparation');}return value;});return Promise.race([owned,ticket.promise]);}
 function checkTail541(p,{ready=true,cold=false}={},audio){if(!tailProfile541(p))return;try{window.MinccinoMoves.nativeTail541.assert(p,{ready,cold});}catch(error){try{audio?.cancel?.();}catch{}throw error;}}
 function tailContinuation541(id,side,options){
  const old=active;try{if(!window.MinccinoMoves?.nativeTail541?.canRetain(old,id,side,options))return null;}catch{return null;}
  return{...old,sequence:{...old.sequence,events:[],visual:[],clact:[],audio:[]},resolve(){},timer:null,presentationClock:null,presentationAudio:null,presentationRecord:null,presentationReject:null,presentationCompleting:false,nativeTailReject541:null,nativeTailRetainedFrom541:old,preparationHold541:generation+1,nativeTailCompletedHold541:false};
 }
 function completedTailHold541(x){const q=x?.profile?.nativeTailContext541;return tailProfile541(x?.profile)&&!x.miss&&Number.isInteger(q?.hitCount)&&q.hitCount>=2&&q.hitCount<=5&&Number.isInteger(q.hitIndex)&&q.hitIndex>=0&&q.hitIndex<q.hitCount-1;}
 function guardTail541(){const x=active;if(!tailProfile541(x?.profile))return true;try{checkTail541(x.profile);return true;}catch(error){x.nativeTailPendingTicket541?.cancel();if(x.presentationClock&&x.presentationReject)failPresentation(x,error);else if(active===x){active=null;try{x.presentationAudio?.cancel?.();}catch{}x.nativeTailReject541?.(error);}return false;}}
 // CLOSED541 end.

 function cancelAction064(visual=null){for(const ticket of pendingTail541)ticket.cancel();pendingTail541.clear();closeNativeScratchLayout064(active,generation,'CANCELLED');stopSlapAssetRecovery064(active);for(const ticket of pendingSlapPreparations064)ticket.cancel();pendingSlapPreparations064.clear();try{active?.presentationAudio?.cancel();}catch(error){failPresentation(active,error);visual=null;}if(visual)active?.presentationClock?.cancel();window.ParticleSPL?.clear();window.AudioEngine?.cancelMove();generation++;const old=active;if(old){if(window.GameSpeed)GameSpeed.cancel(old.timer);else clearTimeout(old.timer);if(tailProfile541(old.profile))old.nativeTailReject541?.(Error('Native541 action cancelled'));else old.resolve();}active=visual;window.GameSpeed?.flush();}
 function cancel(){cancelAction064();}
 function preload(moveId,effect){let m=effect||data?.moves[moveId],pending=[];for(let variant of m?.variants||[])for(let [op,a]of variant.commands)if(op===36){let im=backgroundImage(a[0]);if(!im.complete)pending.push(new Promise(resolve=>{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true})}))}for(let id of m?.spas||[])for(let t of data.spas[id]?.textures||[]){let im=image(t);if(!im.complete)pending.push(new Promise(resolve=>{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true})}))}return Promise.race([Promise.all(pending),new Promise(resolve=>setTimeout(resolve,1000))])}
 async function play(moveId,side='p1',options={}){
  const retained=slapContinuation064(moveId,side,options)||tailContinuation541(moveId,side,options);cancelAction064(retained);const token=generation,retainedWait=retained?.preparationHold064!==undefined?slapPreparation064():null;let tailWait=null;const waitOwned=task=>waitTail541(waitSlapPreparation064(task,retainedWait,token),tailWait);try{const move=options.effect||data?.moves[moveId];if(!move){if(active===retained&&retained)cancel();return;}const choice=window.BattleContext?.choose(move,options.context||{});if(choice&&options.variant===undefined)options.variant=choice.variant;
  let profile=window.SpeciesMoves?.select(options.cryIds?.[side],moveId,{...options.context,phase:choice?.phase??options.context?.phase??0});profile=window.LiepardMoves?.acquireProfile064?.(profile,{side,targetSide:options.targetSide||(side==='p1'?'p2':'p1'),cryIds:options.cryIds})??profile;profile=window.MinccinoMoves?.nativeTail541?.acquire(profile,{...options,side,targetSide:options.targetSide||(side==='p1'?'p2':'p1'),generation:token})??profile;if(tailProfile541(profile)){tailWait=tailTicket541();if(retained)retained.nativeTailPendingTicket541=tailWait;}let sequence=timeline(move,options.variant||0,0,side,options.context||{});if(profile)sequence=SpeciesMoves.timeline(sequence,profile);const speed=playbackSpeed;
  const acquisitionTarget=options.targetSide||(side==='p1'?'p2':'p1'),acquisition=profile?.minccinoNativeSlap064==='private-native-paw-SPA163'?slapAcquisition064(side,acquisitionTarget,options.cryIds):null;
  if(profile?.minccinoNativeSlap064==='private-native-paw-SPA163'&&!acquisition)throw Error('Native Double Slap initial acquisition ownership is unavailable');
  const scratchAcquisition=nativeScratchProfile064(profile)?nativeScratchAcquisition064(side,acquisitionTarget,options.cryIds):null;if(nativeScratchProfile064(profile)&&!scratchAcquisition)throw Error('Native Scratch initial acquisition ownership is unavailable');
  // Native slow/normal clips depend on the effective action speed. The player
  // can change the global rate while this cold preparation is still pending.
  let loadedRate;do{loadedRate=window.GameSpeed?.rate||1;try{await waitOwned(Promise.all([preload(moveId,options.effect),options.effect?window.NativeCapture?.preload(options.ball):null,options.effect?window.AudioEngine?.preloadEvents(sequence.audio,audioCryIds(options.cryIds)):window.AudioEngine?.preloadMove(moveId,audioCryIds(options.cryIds),options.variant||0,speed*loadedRate,side),profile?Promise.resolve(window.SpeciesMoves?.prepare?.(profile,{cryIds:options.cryIds,side,...(scratchAcquisition?{nativeScratchLease064:scratchAcquisition}: {})})).then(value=>{checkTail541(profile,{ready:false});return value;}):null,tailProfile541(profile)?window.MinccinoMoves.nativeTail541.prepare(profile):null]));}catch(error){if(tailProfile541(profile))throw error;if(token!==generation)return;throw error;}checkTail541(profile,{cold:true});if(token!==generation)return;checkSlapAcquisition064(acquisition,side,acquisitionTarget,options.cryIds);checkNativeScratchAcquisition064(scratchAcquisition,side,acquisitionTarget,options.cryIds);}while(loadedRate!==(window.GameSpeed?.rate||1));
  checkTail541(profile,{cold:true});guardColdSlap064();if(token!==generation)return;
  const presentationEligible=presentationEligibility(profile,{...options,side})==='ELIGIBLE';
  if(profile?.minccinoNativeSlap064!==undefined&&!presentationEligible)throw Error('Private native Double Slap presentation ownership/contract unavailable');
  if(nativeScratchProfile064(profile)&&!presentationEligible)throw Error('Native Scratch acquired presentation ownership/contract unavailable');
  if(tailProfile541(profile)&&!presentationEligible)throw Error('Native541 acquired presentation ownership/contract unavailable');
  if(presentationEligible&&typeof window.BattlePresentation?.plan!=='function')throw Error('Battle presentation clock is unavailable');
  let presentationPlan=presentationEligible?window.BattlePresentation.plan(profile,sequence):null,presentationAudio=null;
  if(profile?.minccinoNativeSlap064!==undefined&&!presentationPlan)throw Error('Private native Double Slap protected plan unavailable');
  if(nativeScratchProfile064(profile)&&!presentationPlan)throw Error('Native Scratch acquired protected plan unavailable');
  if(tailProfile541(profile)&&!presentationPlan)throw Error('Native541 acquired protected plan unavailable');
  if(presentationPlan){
   if(typeof window.AudioEngine?.preparePresentation!=='function')throw Error('Presentation audio bridge is unavailable');
   let preparedRate;do{
    preparedRate=window.GameSpeed?.rate||1;
    try{presentationAudio=await waitOwned(window.AudioEngine.preparePresentation(sequence.audio,{moveId,frames:sequence.frames,variant:options.variant||0,side,targetSide:profile.target==='self'?side:options.targetSide||(side==='p1'?'p2':'p1'),speed:speed*preparedRate,playbackSpeed:speed,cryIds:audioCryIds(options.cryIds),miss:options.miss,requiredKeys:presentationPlan.keys,...(profile.minccinoNativeSlap064!==undefined?{profileSpecies:572,profileKey:profile.key,profileKind:profile.kind,profileMarker:profile.minccinoNativeSlap064,nativeSlapContext064:{...profile.nativeSlapContext064},nativeWaitGroups:options.context?.nativeWaitGroups===true}:tailProfile541(profile)?{profileSpecies:572,profileKey:profile.key,profileKind:profile.kind,profileMarker:profile.nativeTail541064,nativeTailContext541:{...profile.nativeTailContext541},nativeWaitGroups:options.context?.nativeWaitGroups===true}:([495,498].includes(profile.species)&&profile.key===({495:'snivy-43',498:'tepig-39'}[profile.species])||profile.species===510&&profile.id===10&&profile.key==='training-510-10')?{profileSpecies:profile.species,profileKey:profile.key}:moveId===39?{profileKind:profile.kind,profileMarker:profile.tailWhip064}:profile.species===602?{profileKind:profile.kind,profileSpecies:602}:{})}));}catch(error){if(tailProfile541(profile))throw error;if(token!==generation)return;throw error;}
    if(token!==generation){presentationAudio?.cancel();if(tailProfile541(profile))throw Error('Native541 owner changed during audio');return;}
    checkSlapAcquisition064(acquisition,side,acquisitionTarget,options.cryIds,presentationAudio);checkNativeScratchAcquisition064(scratchAcquisition,side,acquisitionTarget,options.cryIds,presentationAudio);checkTail541(profile,{cold:true},presentationAudio);
    if(preparedRate!==(window.GameSpeed?.rate||1)){presentationAudio?.cancel();presentationAudio=null;}
   }while(!presentationAudio);
   for(const key of ['canPresent','acknowledge','pause','resume','cancel','finish'])if(typeof presentationAudio?.[key]!=='function'){presentationAudio?.cancel?.();throw Error('Incomplete presentation audio contract: '+key);}
   // Visual ownership can change while cold audio is loading. Never acquire
   // a controller whose raw-identity marks can no longer be drawn.
   if(presentationEligibility(profile,{...options,side})!=='ELIGIBLE'){presentationAudio.cancel();presentationAudio=null;if(profile.minccinoNativeSlap064!==undefined)throw Error('Private native Double Slap visual owner changed during audio preparation');if(nativeScratchProfile064(profile))throw Error('Native Scratch acquired visual owner changed during audio preparation');if(tailProfile541(profile))throw Error('Native541 acquired visual owner changed during audio preparation');presentationPlan=null;}
  }
  checkSlapAcquisition064(acquisition,side,acquisitionTarget,options.cryIds,presentationAudio);checkNativeScratchAcquisition064(scratchAcquisition,side,acquisitionTarget,options.cryIds,presentationAudio);checkTail541(profile,{cold:true},presentationAudio);
  return new Promise((resolve,reject)=>{const x=active={profile,nativeTailReject541:tailProfile541(profile)?reject:null,nativeScratchLease064:scratchAcquisition,nativeScratchGeneration064:token,cryIds:options.cryIds,moveId,side,targetSide:profile?.target==='self'?side:options.targetSide||(side==='p1'?'p2':'p1'),miss:!!options.miss,hiddenSides:options.hiddenSides||[],sequence,speed,start:(window.GameSpeed?.now()??performance.now()),resolve,nativeSlapController064:!!(presentationPlan&&profile?.minccinoNativeSlap064==='private-native-paw-SPA163'),...(profile?.minccinoNativeSlap064==='private-native-paw-SPA163'?{nativeSlapReject064:reject}:{}),nativeSlapOwner064:profile?.minccinoNativeSlap064==='private-native-paw-SPA163'?slapOwner064(side,options.targetSide||(side==='p1'?'p2':'p1'),options.cryIds):null,nativeSlapContext064:moveId===3?{hitIndex:options.context?.hitIndex,hitCount:options.context?.hitCount}:null};if(tailProfile541(profile)){try{window.MinccinoMoves.nativeTail541.bind(profile,x);}catch(error){if(active===x)active=null;presentationAudio?.cancel();reject(error);return;}}if(x.nativeSlapController064&&!x.nativeSlapOwner064){presentationAudio?.cancel();failSlapAssets064(x,Error('Native Double Slap initial native owner is unavailable'));return;}if(presentationPlan){x.presentationClock=window.BattlePresentation.create({...presentationPlan,now:presentationNow(x)});x.presentationAudio=presentationAudio;x.presentationHold=!!options.hold;x.presentationReject=reject;return;}window.AudioEngine?.beginMove(sequence.audio,{moveId,frames:sequence.frames,variant:options.variant||0,side,targetSide:x.targetSide,speed:speed*(window.GameSpeed?.rate||1),cryIds:audioCryIds(options.cryIds),miss:options.miss});x.timer=(window.GameSpeed?.schedule||setTimeout)(()=>{if(active===x){if(options.hold){x.preview=true;x.previewFrame=sequence.frames;x.nativeSlapCompletedHold064=completedSlapHold064(x)}else active=null;window.AudioEngine?.cancelMove();window.GameSpeed?.flush();resolve()}},sequence.frames/speed*1000/60+30)});
  }catch(error){if(retained&&active===retained&&generation===token)cancel();throw error;}finally{if(retainedWait)pendingSlapPreparations064.delete(retainedWait);if(tailWait)pendingTail541.delete(tailWait);}
 }
 function frame(){return active?(active.preview?active.previewFrame:active.presentationClock?active.presentationClock.value:((window.GameSpeed?.now()??performance.now())-active.start)*.06*active.speed):0}
 async function preview(moveId,side='p1',variant=0,options={}){cancel();const token=generation;await preload(moveId);if(token!==generation)return 0;const context=options.context||{phase:moveId===117?Math.max(0,(data.moves[moveId].phaseMap||[0,1]).indexOf(variant)):0};if(options.context&&window.BattleContext)variant=window.BattleContext.choose(data.moves[moveId],context).variant;let profile=window.SpeciesMoves?.select(options.cryIds?.[side],moveId,context),sequence=timeline(data.moves[moveId],variant,0,side,context);if(profile)sequence=SpeciesMoves.timeline(sequence,profile);try{if(profile)await window.SpeciesMoves?.prepare?.(profile,{cryIds:options.cryIds,side});}catch(error){if(token!==generation)return 0;throw error;}if(token!==generation)return 0;active={profile,cryIds:options.cryIds,hiddenSides:options.hiddenSides||[],miss:!!options.miss,moveId,side,targetSide:profile?.target==='self'?side:side==='p1'?'p2':'p1',sequence,nativeSlapController064:profile?.minccinoNativeSlap064==='private-native-paw-SPA163'?'reference-preview':false,preview:true,previewFrame:sequence.frames*.5,speed:1,resolve(){}};return sequence.frames}
 function nativeFrame(){const x=active,f=frame();if(!x?.profile?.nativeEffects)return f;const q=x.sequence,a=q.nativeAnchor||0,i=q.customImpact;return a>0&&f<=i?f/i*a:a+(f-i)/Math.max(1,q.frames-i)*(q.nativeFrames-a);}
 function point(side,W,H){if(active?.profile?.nativeEffects&&side===active.side){const l=BattleGround.layout(W,H),p=active.profile,a=SpeciesMoves.sample(p,frame(),side,active.miss),b=SpeciesMoves.pose(p,frame(),side,side,active.miss,l);return DemoMoves.attachment(p,a,l[side],b,side);}let s=Math.min(W/1000,H/650),p=BattleGround.effect(side,W,H),pose=window.NativeVisual?.sprite(active?.sequence.visual||[],frame(),side,active?.side,active?.targetSide);if(pose){p.x+=pose.x*s;p.y+=pose.y*s}if(active?.profile?.nativeEffects&&active.miss&&side===active.targetSide)p.x+=(active.side==='p1'?1:-1)*BattleGround.layout(W,H)[side].height*.9;return p}
 function keys(values,t,times){if(!values)return 1;let a=times?.[0]??.15,b=times?.[1]??.8;if(t<a)return values[0]+(values[1]-values[0])*t/Math.max(.001,a);if(t>b)return values[1]+(values[2]-values[1])*(t-b)/Math.max(.001,1-b);return values[1]}
 function emitterPoint(ev,t,from,to,s){if(ev.op===16){let a=ev.args,center=a[2]===1?from:to,period=Math.max(1,a[6]),phase=Math.max(0,t-Math.max(0,a[8]))/(period*(Math.max(0,a[7])+1))*Math.PI*2;return{x:center.x+Math.cos(phase)*a[3]/4096*4*s,y:center.y-a[5]/4096*4*s+Math.sin(phase)*a[4]/4096*1.5*s}}if(!ev.travel)return [9,14,15].includes(ev.target)?from:to;let a=ev.args,explicit=ev.op===13||ev.op===15,startCode=explicit?14:a[3],endCode=explicit?a[6]:a[4],start=[9,14,15].includes(startCode)?from:to,end=[9,14,15].includes(endCode)?from:to;if(explicit)start={x:from.x+a[3]/4096*4*s,y:from.y-a[4]/4096*4*s+a[5]/4096*1.5*s};let p=clamp(t/Math.max(1,ev.trajectoryFrames),0,1),u=(1-Math.cos(p*Math.PI))*.5,height=[1,4].includes(a[2])?0:(a[explicit?9:7]||0)/4096,wave=a[2]>=5?Math.sin(p*Math.PI*Math.max(1,a[explicit?12:10]||1)):Math.sin(p*Math.PI);return{x:start.x+(end.x-start.x)*u,y:start.y+(end.y-start.y)*u-height*wave*4*s}}
 function renderParticle(c,e,spa,appearance,motion,origin,s,transform){let tex=spa.textures[appearance.texture],im=image(tex);if(!im?.complete||!im.naturalWidth||appearance.scale<=0||motion.dead)return;let source=tint(im,tex,appearance.color),p=motion.p,flags=e.texturePositionFlags||0,tile=e.textureLoopFlags||0,tilesX=1<<(tile&3),tilesY=1<<(tile>>2&3);if(tilesX>1||tilesY>1){let key=tex.name+':'+appearance.color+':'+tilesX+':'+tilesY,atlas=tiled.get(key);if(!atlas){atlas=document.createElement('canvas');atlas.width=tex.w;atlas.height=tex.h;let cx=atlas.getContext('2d');for(let y=0;y<tilesY;y++)for(let x=0;x<tilesX;x++)cx.drawImage(source,x*tex.w/tilesX,y*tex.h/tilesY,tex.w/tilesX,tex.h/tilesY);tiled.set(key,atlas);if(tiled.size>256)tiled.delete(tiled.keys().next().value)}source=atlas}
  let size=clamp(appearance.scale*14*s,0,240*s),aspect=e.aspect||1,drawType=e.flags>>4&3,rotation=appearance.angle;if(drawType===1||drawType===3)rotation+=Math.atan2(-motion.v[1]+motion.v[2]*.375,motion.v[0]);let x=origin.x+(p[0]+e.position[0]+transform.offset[0]+e.offset[0]/4096)*4*s,y=origin.y-(p[1]+e.position[1]+transform.offset[1]+e.offset[1]/4096)*4*s+(p[2]+e.position[2]+transform.offset[2])*1.5*s;
  c.save();c.translate(x,y);c.rotate(rotation);c.globalAlpha=clamp(appearance.alpha*transform.opacity,0,1);c.scale(transform.scale[0]*(flags&1?-1:1),transform.scale[1]*(flags&2?-1:1));c.imageSmoothingEnabled=false;let w=size*2*aspect,h=size*2*tex.h/tex.w;if(drawType>=2&&!(e.flags&0x80000))h*=.45;c.drawImage(source,-w/2,-h/2,w,h);c.restore();
 }
 const tiled=new Map();
 const tints=new Map();function tint(im,tex,color){if(color===32767||color===undefined)return im;let key=tex.name+':'+color;if(tints.has(key))return tints.get(key);let cs=Array.isArray(color)?color:rgb(color),can=document.createElement('canvas');can.width=tex.w;can.height=tex.h;let cx=can.getContext('2d');cx.drawImage(im,0,0);let pixels=cx.getImageData(0,0,tex.w,tex.h);for(let i=0;i<pixels.data.length;i+=4)for(let j=0;j<3;j++)pixels.data[i+j]*=cs[j]/255;cx.putImageData(pixels,0,0);tints.set(key,can);if(tints.size>512)tints.delete(tints.keys().next().value);return can}
 // Authored HD-2D calibration ONLY for native572/3 targetSPA163.
 // One unit for quad, native offset and particle motion; keep the world
 // target origin, source aspect/alpha/rotation, emitters and timing intact.
 // PRIVATE572/3 only. Asset recovery never throws out of a render callback.
 let slapAssetRecovery064=null,slapAssetSerial064=0,slapAssetError064=null,slapLoadingBox064=null,slapLoadingText064=null,slapLoadingButton064=null,slapLoadingExpected064=null;
 const slapLoadingMessage064='Caricamento della lotta…';
 function calibratedSlap064(x){const p=x?.profile,h=p?.nativeSlapContext064;return isSlap064(x)&&(x.nativeSlapController064===true||x.preview&&x.nativeSlapController064==='reference-preview')&&x.preparationHold064===undefined&&x.nativeSlapCompletedHold064!==true&&p.key==='training-572-3'&&p.kind==='palmFlurry'&&p.chapter===true&&p.training===true&&p.frames===126&&p.impact===60&&p.target==='foe'&&p.attachment==='hand'&&p.nativeEffects===true&&p.damage===true&&x.targetSide===(x.side==='p1'?'p2':'p1')&&Number(x.cryIds?.[x.side])===572&&h&&Object.keys(h).sort().join(',')==='hitCount,hitIndex'&&Number.isInteger(h.hitCount)&&h.hitCount>=0&&h.hitCount<=5&&Number.isInteger(h.hitIndex)&&h.hitIndex>=0&&(h.hitCount===0?h.hitIndex===0&&x.miss===true:h.hitIndex<h.hitCount);}
 function ownsSlapLoading064(){return !!slapLoadingBox064&&window.document?.getElementById('loading')===slapLoadingBox064&&slapLoadingBox064.children?.length===2&&slapLoadingBox064.children[0]===slapLoadingText064&&slapLoadingBox064.children[1]===slapLoadingButton064&&slapLoadingText064.textContent===slapLoadingExpected064;}
 function clearSlapLoading064(){if(ownsSlapLoading064())slapLoadingBox064.remove();slapLoadingBox064=slapLoadingText064=slapLoadingButton064=slapLoadingExpected064=null;}
 function showSlapLoading064(r,phase='retrying',attempt=0){
  if(slapAssetRecovery064!==r||r.cancelled)return;const sameState=r.phase===phase&&r.attempt===attempt;r.phase=phase;r.attempt=attempt;if(sameState&&ownsSlapLoading064())return;
  const message=phase==='offline'?'Connessione assente. Il caricamento riprenderà automaticamente al ritorno della rete.':phase==='hidden'?'Il caricamento riprenderà automaticamente tornando al gioco.':phase==='manual'?'Risorse non disponibili. Controlla la connessione e riprova.':slapLoadingMessage064;
  const doc=window.document;if(!doc?.createElement||!doc.body?.append)return;
  if(!ownsSlapLoading064()){
   slapLoadingBox064=slapLoadingText064=slapLoadingButton064=slapLoadingExpected064=null;if(doc.getElementById('loading'))return;
   const box=doc.createElement('div'),text=doc.createElement('p'),button=doc.createElement('button');box.id='loading';box.className='resource-status';text.textContent=message;button.textContent='Riprova ora';button.onclick=()=>{if(slapAssetRecovery064===r&&!r.cancelled)void r.service.run(r.key,true);};box.append(text,button);
   slapLoadingBox064=box;slapLoadingText064=text;slapLoadingButton064=button;slapLoadingExpected064=message;doc.body.append(box);if(!ownsSlapLoading064()){slapLoadingBox064=slapLoadingText064=slapLoadingButton064=slapLoadingExpected064=null;return;}
  }
  slapLoadingText064.textContent=message;slapLoadingExpected064=message;slapLoadingBox064.dataset.recovery=phase;slapLoadingButton064.disabled=phase==='retrying';slapLoadingButton064.textContent=phase==='manual'?'Riprova caricamento':'Riprova ora';
 }
 function nativeSlapLease064(x){
  const stamp=x.nativeSlapOwner064;if(!stamp)return x.preview?{preview:true}:null;
  const owner=typeof session==='undefined'?null:session,reader=window.BattlePresentationOwners?.read;let visible;try{visible=reader?.();}catch{return null;}
  if(!owner||owner!==stamp.owner||owner.double||owner.multi||owner.battle?.gameType!=='singles'||reader!==stamp.reader||!visible?.layoutSupported||!visible.available)return null;
  for(const side of ['p1','p2']){const a=visible.roles?.[side],native=owner.active?.(side);if(native!==stamp.actors[side]||x.cryIds?.[side]!==stamp.cryIds[side]||!a||a.altered||String(a.graphic)!==String(x.cryIds[side])||visible.nativeSpecies?.[side]!==native?.species?.num||anatomicalId(a.graphic)!==native?.species?.num)return null;}
  return{owner,actors:stamp.actors,reader};
 }
 function slapBankOwners064(x){const stamp=x.nativeSlapOwner064;if(!stamp)return true;return ['p1','p2'].every(side=>{const b=window.ROM_SPRITE_ANIM?.cache[x.cryIds[side]+'-'+(side==='p1'?'back':'front')],old=stamp.banks[side];return b===old.bank&&b?.data===old.data&&b?.image===old.image;});}
 function validSlapBank064(b){const im=b?.image,w=im?.naturalWidth??im?.width,h=im?.naturalHeight??im?.height,g=b?.groundBounds;return !!(b?.ready&&b.data&&im&&im.complete!==false&&im.closed!==true&&Number.isFinite(w)&&w>0&&Number.isFinite(h)&&h>0&&g&&g.length===4&&g.every(Number.isFinite)&&g[2]>g[0]&&g[3]>g[1]);}
 function slapAssets064(x,W,H){
  const R=window.ROM_SPRITE_ANIM,keys=['p1','p2'].map(side=>x.cryIds?.[side]+'-'+(side==='p1'?'back':'front'));
  if(!Number.isFinite(W)||!Number.isFinite(H)||W<=0||H<=0)return{ready:false,reason:'Native Double Slap viewport is not prepared',keys};
  for(const key of keys)if(!validSlapBank064(R?.cache[key]))return{ready:false,reason:'Native Double Slap source bank is not prepared',keys};
  // A native zero-hit miss has no targetSPA. Body banks still need readiness,
  // but no target effect scale may block that animation.
  if(x.miss)return{ready:true,unit:1,keys};
  let height;try{height=window.BattleGround?.layout(W,H)?.[x.targetSide]?.height;}catch(error){return{ready:false,reason:String(error?.message||error),keys};}
  const bank=R.cache[x.cryIds[x.targetSide]+'-'+(x.targetSide==='p1'?'back':'front')],unit=height/(bank.groundBounds[3]-bank.groundBounds[1]);
  return Number.isFinite(height)&&height>0&&Number.isFinite(unit)&&unit>0?{ready:true,unit,keys}:{ready:false,reason:'Native Double Slap target scale is not prepared',keys};
 }
 function stopSlapAssetRecovery064(x){
  const r=slapAssetRecovery064;if(!r||x&&r.action!==x)return false;slapAssetRecovery064=null;r.cancelled=true;r.release(r.cancelValue);r.service.dispose();clearSlapLoading064();
  return true;
 }
 function failSlapAssets064(x,error){
  if(active!==x)return false;stopSlapAssetRecovery064(x);slapAssetError064=String(error?.stack||error);clearSlapLoading064();
  if(x.presentationClock&&typeof x.presentationReject==='function'){failPresentation(x,error);return true;}
  active=null;try{x.presentationClock?.cancel();}catch{}try{x.presentationAudio?.cancel();}catch{}try{if(window.GameSpeed)GameSpeed.cancel(x.timer);else clearTimeout(x.timer);}catch{}try{window.AudioEngine?.cancelMove();}catch{}try{window.ParticleSPL?.clear();}catch{}
  // Legacy/nonpresentation play owns an explicit rejection slot; preview has
  // no live native caller. Never resolve a failed native animation.
  if(typeof x.nativeSlapReject064==='function')x.nativeSlapReject064(error);return true;
 }
 function recoverSlapAssets064(x,W,H,reason){
  if(slapAssetRecovery064?.action===x){const r=slapAssetRecovery064;showSlapLoading064(r,r.phase,r.attempt);return;}
  if(!x.presentationClock||!x.presentationAudio||typeof window.RuntimeAssets?.Recovery!=='function'){failSlapAssets064(x,Error('Native Double Slap asset recovery needs its protected controller and Recovery service'));return;}
  pauseArenaFrame();
  if(active!==x)return;
  const R=window.ROM_SPRITE_ANIM,keys=['p1','p2'].map(side=>x.cryIds[side]+'-'+(side==='p1'?'back':'front'));
  const r={action:x,generation,key:'native-slap-assets064:'+generation+':'+(++slapAssetSerial064),service:new window.RuntimeAssets.Recovery(),captured:new Map(keys.map(key=>[key,R?.cache[key]])),cancelled:false,cancelValue:{cancelled:true},W,H};r.cancelPromise=new Promise(done=>r.release=done);slapAssetRecovery064=r;
  const owned=()=>!r.cancelled&&active===x&&generation===r.generation;
  const valid=()=>{if(!owned())return false;if(!nativeSlapLease064(x)){failSlapAssets064(x,Error('Native Double Slap actor owner changed during asset recovery'));return false;}return true;};
  const task=async()=>{
   if(!owned())return r.cancelValue;
   if(!nativeSlapLease064(x)){failSlapAssets064(x,Error('Native Double Slap actor owner changed during asset recovery'));return r.cancelValue;}
   if(typeof R?.prepare!=='function')throw Error('Native Double Slap source preparation is unavailable');
   // Native loader reuses ready cache entries even if corrupted. Drop only an
   // exact captured ready/nonpending actor bank; RuntimeAssets still owns the
   // shared image and no image.close or unrelated eviction is performed.
   for(const key of keys){const bank=R.cache[key];if(bank===r.captured.get(key)&&bank?.ready&&!bank.pending&&!validSlapBank064(bank))delete R.cache[key];}
   const loading=Promise.resolve().then(()=>owned()?R.prepare(keys,{gate:false}):r.cancelValue);const value=await Promise.race([loading,r.cancelPromise]);
   if(value===r.cancelValue||!owned())return r.cancelValue;
   if(!nativeSlapLease064(x)){failSlapAssets064(x,Error('Native Double Slap actor owner changed during source loading'));return r.cancelValue;}
   const a=typeof arena==='undefined'?window.arena:arena,state=slapAssets064(x,a?.width??W,a?.height??H);
   if(!state.ready)throw Error(state.reason);
   if(x.nativeSlapOwner064){const renewed=slapOwner064(x.side,x.targetSide,x.cryIds);if(!renewed){failSlapAssets064(x,Error('Native Double Slap renewed owner is unavailable'));return r.cancelValue;}x.nativeSlapOwner064=renewed;}
   if(slapAssetRecovery064===r&&owned()){slapAssetRecovery064=null;r.service.dispose();clearSlapLoading064();try{window.GameSpeed?.flush();}catch(error){failSlapAssets064(x,error);return r.cancelValue;}}
   return true;
  };
  r.service.register(r.key,task,{valid,report:(phase,attempt)=>showSlapLoading064(r,phase,attempt)});
  if(r.service.online()&&r.service.visible())void r.service.run(r.key,true);
 }
 function beforeArenaFrame(W,H){
  if(!guardTail541())return false;
  const scratch=active;if(nativeScratchProfile064(scratch?.profile)&&scratch.presentationClock){try{assertNativeScratchOwner064(scratch);}catch(error){failLayoutPreparation(scratch,scratch.nativeScratchGeneration064,error);return false;}}
  guardColdSlap064();const x=active;if(!calibratedSlap064(x)){if(slapAssetRecovery064&&slapAssetRecovery064.action!==x)stopSlapAssetRecovery064();return true;}
  try{
   if(!nativeSlapLease064(x)){failSlapAssets064(x,Error('Native Double Slap actor owner changed'));return false;}
   const state=slapAssets064(x,W,H);
   if(!state.ready||!slapBankOwners064(x)){recoverSlapAssets064(x,W,H,state.reason||'Native Double Slap prepared source owner changed');return false;}
   if(slapAssetRecovery064?.action===x){const r=slapAssetRecovery064;showSlapLoading064(r,r.phase,r.attempt);return false;}
   x.nativeSlapUnit064={W,H,unit:state.unit,generation,drawConsumed:false};return true;
  }catch(error){failSlapAssets064(x,error);return false;}
 }

 function nativeParticleUnit064(x,ev,W,H,fallback){
  if(!calibratedSlap064(x)||ev.spa!==data.spas[163]||ev.travel||ev.target!==11)return fallback;
  const unit=x.nativeSlapUnit064;
  if(!unit||unit.W!==W||unit.H!==H){failSlapAssets064(x,Error('Native Double Slap spatial preflight was not completed'));return null;}
  return unit.unit*.55;
 }

 function nativeParticleTarget064(x,ev,W,H,to){
  if(!calibratedSlap064(x)||ev.spa!==data.spas[163]||ev.travel||ev.target!==11)return to;
  // HD-2D contact on the torso; one shared origin for parents and children.
  return{...to,y:to.y+BattleGround.layout(W,H)[x.targetSide].height*.18};
 }

 function draw(c,W,H){if(!guardTail541())return false;guardColdSlap064();const x=active;if(calibratedSlap064(x)){const u=x.nativeSlapUnit064;if((!u||u.W!==W||u.H!==H||u.generation!==generation||u.drawConsumed)&&!beforeArenaFrame(W,H))return false;x.nativeSlapUnit064.drawConsumed=true;}const S=window.ParticleSPL;if(!x||!S)return;if(x.profile){SpeciesMoves.draw(c,W,H,x,frame(),'front');if(!x.profile.nativeEffects)return;}const f=nativeFrame(),s=Math.min(W/1000,H/650),from=point(x.side,W,H),to=point(x.targetSide,W,H);window.NativeCapture?.draw(c,x.sequence.clact||[],f,W,H,code=>{const attached=[9,14,15].includes(code),p=attached?from:to,side=attached?x.side:x.targetSide;return{x:p.x,y:p.y+BattleGround.layout(W,H)[side].height*.55}});let total=0;
  for(let n=0;n<x.sequence.events.length;n++){let ev=x.sequence.events[n];if(ev.pose||f<ev.start||f>ev.end)continue;let e=ev.e,attached=[9,14,15].includes(ev.target);if(x.miss&&!ev.travel&&!attached)continue;const particleUnit=nativeParticleUnit064(x,ev,W,H,s);if(particleUnit===null)return false;const particleTo=nativeParticleTarget064(x,ev,W,H,to);let ef=f-ev.start-e.delay,maxLife=e.life+1+(e.child?.life||0),interval=Math.max(1,e.interval||1),emitterLife=Math.max(1,e.emitterLife||1),rate=clamp(e.rate||0,0,48),first=Math.max(0,Math.ceil((ef-maxLife)/interval)),last=Math.min(Math.floor(ef/interval),Math.ceil(emitterLife/interval)-1),parents=[],children=[];
   for(let b=first;b<=last&&total<2500;b++){let count=Math.floor((b+1)*rate)-Math.floor(b*rate);for(let i=0;i<count&&total<2500;i++){let age=ef-b*interval,index=n*100003+b*97+i,seed=index*19+x.moveId,duration=S.life(e,seed),birth=b*interval;if(age<0)continue;let origin=emitterPoint(ev,e.flags&32768?ef:birth,from,particleTo,particleUnit),appearance=S.animation(e,Math.min(age,duration),duration,seed),motion=S.motion(e,Math.min(age,duration),seed);if(age<=duration&&!(e.flags&0x400000)){parents.push([e,appearance,motion,origin]);total++}
    for(let cb of S.children(e,duration,age)){if(total>=2500)break;let pa=S.animation(e,cb.birth,duration,seed),pm=S.motion(e,cb.birth,seed),childSeed=seed+cb.birth*8191+cb.index*67+1,child=S.child(e,pm,pa,cb.birth,childSeed),resource=child.resource,ca=S.animation(resource,cb.age,Math.max(1,resource.life),childSeed),cm=S.motion(resource,cb.age,childSeed,child.initialState),co=emitterPoint(ev,resource.flags&32768?ef:birth+cb.birth,from,particleTo,particleUnit);children.push([resource,ca,cm,co]);total++}
   }}let layers=e.flags&0x200000?[children,parents]:[parents,children];for(let layer of layers)for(let [resource,appearance,motion,origin]of layer)renderParticle(c,resource,ev.spa,appearance,motion,origin,particleUnit,ev);
  }
 }
 const anatomicalId=id=>window.PokemonVisuals?.speciesId(id)||Object.values(window.ROM_FORM_SPRITES||{}).find(f=>f.graphic===+id)?.species||+id;
 const audioCryIds=ids=>Object.fromEntries(Object.entries(ids||{}).map(([side,id])=>[side,anatomicalId(id)]));
 function reaction(side,id=active?.cryIds?.[side]){return active?.profile&&side===active.targetSide&&side!==active.side&&!active.hiddenSides?.includes(side)?window.BattleReactions?.sample(active.profile,frame(),side,id,active.miss):null;}
 function rawPose(side){const r=reaction(side);if(r)return BattleReactions.pose(r,BattleGround.layout(arena.width,arena.height),side);if(active?.profile&&side!==active.side)return{x:0,y:0,scale:1,alpha:1};if(active?.profile)return SpeciesMoves.pose(active.profile,frame(),side,active.side,active.miss,BattleGround.layout(arena.width,arena.height));if(window.NativeVisual)return window.NativeVisual.sprite(active?.sequence.visual||[],frame(),side,active?.side,active?.targetSide,!active?.hiddenSides?.includes(side));if(!active)return{x:0,y:0,alpha:1,scale:1};let f=frame(),x=0,y=0,scale=1;for(let e of active.sequence.events){if(!e.pose||f<e.start||f>e.end)continue;let a=e.args,target=a[0]===14?active.side:active.targetSide;if(side!==target||active.miss&&target===active.targetSide)continue;let p=(f-e.start)/(e.end-e.start),wave=Math.sin(p*Math.PI);if(e.op===18){x+=wave*(active.side==='p1'?1:-1)*clamp(Math.abs(a[2])/4096*14,4,40)}else if(e.op===21){x+=Math.sin(p*Math.PI*2*Math.max(1,a[4]))*clamp(Math.abs(a[2])/4096*8,2,14)}else if(e.op===19){y-=wave*16;scale+=wave*.05}else{y-=wave*5}}return{x,y,alpha:1,scale}}
 function pose(side){guardTail541();guardColdSlap064();const p=rawPose(side);return window.PatratMoves?.applyStance(side,p,active?.side===side)||p;}
 const backgrounds=new Map(),tintedBackgrounds=new Map();
 function backgroundImage(id){let im=backgrounds.get(id);if(!im){im=new Image();im.src='assets/battle-backgrounds/'+id+'.png';backgrounds.set(id,im)}return im}
 function visualState(){guardTail541();guardColdSlap064();if(active?.profile&&!active.profile.nativeEffects)return{camera:{x:0,y:0,zoom:1},background:{},hud:{}};let events=active?.sequence.visual||[],f=nativeFrame();return{camera:window.NativeVisual?.camera(events,f,active?.side,active?.targetSide)||{x:0,y:0,zoom:1},background:window.NativeVisual?.background(events,f,active?.side)||{},hud:window.NativeVisual?.hud(events,f,active?.side,active?.targetSide)}}
 function drawBackground(c,W,H){let b=visualState().background;if(!b.visible||b.id===null)return;let im=backgroundImage(b.id);if(!im.complete||!im.naturalWidth)return;let source=im;
  if(b.tint>0){let key=b.id+':'+b.color+':'+Math.round(b.tint*16),cache=tintedBackgrounds.get(key);if(!cache){cache=document.createElement('canvas');cache.width=im.naturalWidth;cache.height=im.naturalHeight;let cx=cache.getContext('2d');cx.drawImage(im,0,0);let cs=rgb(b.color);cx.globalCompositeOperation='source-atop';cx.fillStyle='rgba('+cs.join(',')+','+b.tint+')';cx.fillRect(0,0,cache.width,cache.height);tintedBackgrounds.set(key,cache)}source=cache}
  let scale=Math.max(W/256,H/192),tw=im.naturalWidth*scale,th=im.naturalHeight*scale,ox=(-b.x*scale%tw+tw)%tw,oy=(-b.y*scale%th+th)%th;c.save();c.imageSmoothingEnabled=false;for(let x=ox-tw;x<W;x+=tw)for(let y=oy-th;y<H;y+=th)c.drawImage(source,x,y,tw,th);c.restore();
 }

 const presentationArenaMarks=new WeakMap();
 function presentationNow(x){return (window.GameSpeed?.now()??performance.now())*x.speed;}
 function presentationEligibility(profile,options={}){
  const owners=(window.BattlePresentationOwners?.read?.()||{layoutSupported:false});
  if(!owners.layoutSupported)return 'UNSUPPORTED_NATIVE_LAYOUT';
  const openingStatus=profile&&(profile.species===495&&profile.id===43&&profile.key==='snivy-43'||profile.species===498&&profile.id===39&&profile.key==='tepig-39');
  const claw=profile?.species===510&&profile.id===10&&profile.key==='training-510-10';
  const native541=tailProfile541(profile);
  if(profile?.nativeTail541064!==undefined){const q=profile.nativeTailContext541,o=options.context;if(!native541||profile.key!=='training-572-541'||profile.kind!=='tailSlam'||profile.frames!==126||profile.impact!==60||profile.nativeEffects!==true||profile.chapter!==true||profile.training!==true||profile.damage!==true||profile.attachment!=='mouth'||profile.target!=='foe'||profile.graphic!==undefined&&profile.graphic!==572)return 'UNVERIFIED_NATIVE541_PROFILE';if(!q||q.hitCount!==o?.hitCount||q.hitIndex!==o?.hitIndex||!Number.isInteger(q.hitCount)||q.hitCount<0||q.hitCount>5||!Number.isInteger(q.hitIndex)||q.hitIndex<0||(q.hitCount===0?q.hitIndex!==0||options.miss!==true:q.hitIndex>=q.hitCount)||o?.nativeWaitGroups===true||(options.variant??0)!==0)return 'UNVERIFIED_NATIVE541_CONTEXT';if(data?.moves[541]?.sha256!=='c11cd14a3ff3a3c1bce27dfc77abad75c5f400522274d789a506637d3e4d7a16'||data.moves[541].variants?.length!==1||window.NATIVE_AUDIO_BANK?.moves[541]?.length!==1)return 'UNVERIFIED_NATIVE541_PROGRAM';checkTail541(profile);}
  const slap=profile?.species===572&&profile.id===3&&profile.minccinoNativeSlap064==='private-native-paw-SPA163';
  if(profile?.minccinoNativeSlap064!==undefined){
   const h=profile.nativeSlapContext064,o=options.context;
   if(!slap||profile.key!=='training-572-3'||profile.kind!=='palmFlurry'||profile.chapter!==true||profile.training!==true||profile.nativeEffects!==true||profile.frames!==126||profile.impact!==60||profile.attachment!=='hand'||profile.target!=='foe'||profile.damage!==true||profile.graphic!==undefined&&profile.graphic!==572)return 'UNVERIFIED_MINCCINO_NATIVE_SLAP_PROFILE';
   if(!h||Object.keys(h).sort().join(',')!=='hitCount,hitIndex'||!Number.isInteger(h.hitCount)||h.hitCount<0||h.hitCount>5||!Number.isInteger(h.hitIndex)||h.hitIndex<0||(h.hitCount===0?h.hitIndex!==0||options.miss!==true:h.hitIndex>=h.hitCount)||h.hitCount!==o?.hitCount||h.hitIndex!==o?.hitIndex||o?.nativeWaitGroups===true||(options.variant??0)!==0)return 'UNVERIFIED_MINCCINO_NATIVE_SLAP_CONTEXT';
   if(data?.moves[3]?.sha256!=='4cdbe7784b01412705173cf044f07e8b9cc533df5c8d45c593d12e588213a703'||data.moves[3].variants?.length!==1||window.NATIVE_AUDIO_BANK?.moves[3]?.length!==1)return 'UNVERIFIED_MINCCINO_NATIVE_SLAP_PROGRAM';
  }
  if(!profile||!([500,503,521,602].includes(profile.species)||openingStatus||claw||slap||native541))return 'UNSUPPORTED_PROFILE';
  if(claw&&(profile.frames!==126||profile.impact!==60||profile.nativeEffects!==true||profile.kind!=='furySlash'||profile.chapter!==true||profile.training!==true||profile.target!=='foe'||profile.attachment!=='hand'||profile.damage!==true))return 'UNVERIFIED_LIEPARD_PROFILE';
  if(claw&&(typeof window.LiepardMoves?.install!=='function'||window.SpeciesMoves?.sample?.(profile,55,options.side||'p1',false)?.liepardClawPose?.foreA!==1.18))return 'UNVERIFIED_LIEPARD_CLAW_RIG';
  if(claw&&(data?.moves[10]?.variants?.length!==1||window.NATIVE_AUDIO_BANK?.moves[10]?.length!==1))return 'UNVERIFIED_LIEPARD_VARIANT_LAYOUT';
  if(openingStatus&&(profile.frames!==(profile.species===495?100:108)||profile.impact!==(profile.species===495?46:51)||profile.nativeEffects!==undefined||Object.keys(profile).sort().join(',')!=='frames,id,impact,key,name,species'))return 'UNVERIFIED_OPENING_STATUS_PROFILE';
  if(openingStatus&&(data?.moves[profile.id]?.variants?.length!==1||window.NATIVE_AUDIO_BANK?.moves[profile.id]?.length!==1))return 'UNVERIFIED_OPENING_STATUS_VARIANT_LAYOUT';
  const tail=profile.id===39&&[500,503].includes(profile.species);
  const tynamo=profile.species===602&&[33,86,209,451].includes(profile.id);
  if(profile.species===602&&(!tynamo||profile.kind!==({33:'bodyRam',86:'electricWave',209:'flameRush',451:'electricWave'}[profile.id])||profile.training!==true||profile.chapter!==true||profile.target!=='foe'||profile.damage!==(profile.id!==86)||profile.graphic!==undefined&&profile.graphic!==602))return 'UNVERIFIED_TYNAMO_NATIVE_RECIPE';
  if(tynamo&&(data?.moves[profile.id]?.variants?.length!==1||window.NATIVE_AUDIO_BANK?.moves[profile.id]?.length!==1))return 'UNVERIFIED_TYNAMO_VARIANT_LAYOUT';
  if(tail&&(profile.kind!=='nativeTailWhipStatus064'||profile.tailWhip064!=='native500503TailWhip064'||profile.damage!==false||profile.target!=='foe'))return 'UNVERIFIED_TAILWHIP_STATUS_PROFILE';
  if(profile.species===503&&!tail)return 'UNSUPPORTED_PROFILE';
  if(!owners.available)return 'UNAVAILABLE_VISUAL_OWNERS';
  if(options.hiddenSides?.length)return 'UNVERIFIED_HIDDEN_SIDES';
  if(owners.nativeSpecies[options.side||'p1']!==profile.species)return 'UNVERIFIED_NATIVE_ACTOR';
  for(const role of ['p1','p2']){
   const record=owners.roles[role];
   if(record.altered)return 'UNVERIFIED_ALTERED_VISUAL_BODY';
   if(record.graphic===undefined||String(record.graphic)!==String(options.cryIds?.[role]))return 'UNVERIFIED_VISIBLE_GRAPHIC';
   if(!record.bankReady)return 'UNPREPARED_VISIBLE_BANK';
   if(profile.species===500&&!tail&&owners.nativeSpecies[role]!==500)return 'UNVERIFIED_500_MIRROR';
   // TailWhip articulates only its attacker and has attacker-local sounds.
   // Any unchanged native foe is valid; contact205/360 keep their mirror guard.
   if(tail&&anatomicalId(record.graphic)!==owners.nativeSpecies[role])return 'UNVERIFIED_TAILWHIP_NATIVE_GRAPHIC';
   if(tynamo&&anatomicalId(record.graphic)!==owners.nativeSpecies[role])return 'UNVERIFIED_TYNAMO_NATIVE_GRAPHIC';
   if(native541&&anatomicalId(record.graphic)!==owners.nativeSpecies[role])return 'UNVERIFIED_NATIVE541_GRAPHIC';
   if(slap&&anatomicalId(record.graphic)!==owners.nativeSpecies[role])return 'UNVERIFIED_MINCCINO_NATIVE_SLAP_GRAPHIC';
   if(openingStatus&&anatomicalId(record.graphic)!==owners.nativeSpecies[role])return 'UNVERIFIED_OPENING_STATUS_NATIVE_GRAPHIC';
   if(claw&&anatomicalId(record.graphic)!==owners.nativeSpecies[role])return 'UNVERIFIED_LIEPARD_NATIVE_GRAPHIC';
  }
  return 'ELIGIBLE';
 }
 function failPresentation(x,error){
  if(!x||active!==x)return;closeNativeScratchLayout064(x,generation,'FAILED');stopSlapAssetRecovery064(x);active=null;
  try{x.presentationClock?.cancel();}catch{}try{x.presentationAudio?.cancel();}catch{}
  try{window.GameSpeed?.flush();}catch{}x.presentationReject(error);
 }
 function beginArenaFrame(){
  if(!guardTail541())return null;const x=active;if(!x?.presentationClock||x.preview||x.presentationCompleting)return null;
  try{
  if(x.presentationAudio.canPresent?.()===false){pauseArenaFrame();return null;}
  const at=presentationNow(x);
  if(x.presentationPaused){x.presentationClock.resume(at);x.presentationAudio.resume(x.presentationClock.value);x.presentationPaused=false;}
  const token=x.presentationClock.begin(at);if(!token)return null;const record=Object.freeze({action:x,token});presentationArenaMarks.set(record,new Map());x.presentationRecord=record;return record;
  }catch(error){failPresentation(x,error);return null;}
 }
 function markArenaActor(side,id){const x=active,marks=presentationArenaMarks.get(x?.presentationRecord);if(marks)marks.set(side,String(id));}
 function pauseArenaFrame(){const x=active;if(!x?.presentationClock||x.preview||x.presentationPaused||x.presentationCompleting)return;try{const at=presentationNow(x);x.presentationClock.pause(at);x.presentationPaused=true;x.presentationAudio.pause(x.presentationClock.value);}catch(error){failPresentation(x,error);}}
 function presentedArenaFrame(record,drawable=true){
  const x=active;if(!record||record.action!==x||record!==x.presentationRecord||!x?.presentationClock||x.preview||x.presentationCompleting)return false;
  try{
  checkTail541(x.profile);const marks=presentationArenaMarks.get(record),sides=['p1','p2'].filter(side=>!x.hiddenSides?.includes(side));
  const actorsDrawn=sides.every(side=>x.cryIds?.[side]!==undefined&&marks?.get(side)===String(x.cryIds[side]));
  const ack=x.presentationClock.presented(record.token,presentationNow(x),{drawable:drawable&&actorsDrawn,visible:!window.document?.hidden});if(!ack)return false;
  x.presentationAudio.acknowledge(ack.frame,ack.nextKey);
  if(ack.complete){
   x.presentationCompleting=true;
   Promise.resolve().then(()=>x.presentationAudio.finish()).then(()=>{
    if(active!==x)return;checkTail541(x.profile);x.presentationAudio.cancel();if(x.presentationHold){x.preview=true;x.previewFrame=x.sequence.frames;x.nativeSlapCompletedHold064=completedSlapHold064(x);x.nativeTailCompletedHold541=completedTailHold541(x);}else active=null;
    try{window.GameSpeed?.flush();}catch(error){x.presentationReject(error);return;}x.resolve();
   }).catch(error=>failPresentation(x,error));
  }
  return ack;
  }catch(error){failPresentation(x,error);return false;}
 }
 window.document?.addEventListener?.('visibilitychange',()=>{if(window.document.hidden)pauseArenaFrame();});
 window.MoveFX={assertNativeScratchOwner064,failLayoutPreparation,beforeArenaFrame,visualReadinessStatus064(){return{pending:!!slapAssetRecovery064,error:slapAssetError064,gateKey:slapAssetRecovery064?.key||null,recovery:slapAssetRecovery064?{attempts:slapAssetRecovery064.service.attempts,phase:slapAssetRecovery064.phase,attempt:slapAssetRecovery064.attempt}:null};},presentationEligibility,beginArenaFrame,presentedArenaFrame,pauseArenaFrame,markArenaActor,presentationState(){const x=active;return x?.presentationClock?{clock:x.presentationClock.snapshot(),paused:!!x.presentationPaused,completing:!!x.presentationCompleting,audio:x.presentationAudio.status?.()}:null;},play,speciesPose(side,id){guardTail541();guardColdSlap064();const r=reaction(side,id);if(r)return r;return active?.profile&&active.side===side&&anatomicalId(id)===active.profile.species?SpeciesMoves.sample(active.profile,frame(),side,active.miss):window.PatratMoves?.idlePose(side,id)||null},drawSpecies(c,w,h,layer){guardColdSlap064();if(active?.profile)SpeciesMoves.draw(c,w,h,active,frame(),layer)},capture(options={}){const effect=window.NativeCapture.compile(window.CAPTURE_DATA,data.spas,options);return play(effect.id,'p1',{...options,effect,context:{nativeWaitGroups:true},hold:!!options.caught})},draw,pose,cancel,preload,visualState,drawBackground,preview,idleTick(side){guardColdSlap064();return active?.preview?window.NativeVisual?.idleTick(active.sequence.visual,frame(),side,active.side,active.targetSide):null},setPreviewFrame(f){if(active?.preview)active.previewFrame=clamp(+f,0,active.sequence.frames)},get speed(){return playbackSpeed},set speed(v){playbackSpeed=v===.5?.5:1},get active(){guardColdSlap064();return active},get generation(){return generation},get coverage(){return data?.coverage},timeline};
})();
