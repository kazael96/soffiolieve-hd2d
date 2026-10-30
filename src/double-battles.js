/* HD-2D presentation and command collection for native double/partner battles. */
(()=>{
 const singleTurn=turn,singleSnapshot=snapshotPartner,baseLayout=BattleGround.layout,baseEffect=BattleGround.effect,baseCombatant=combatant,baseSpeciesPose=MoveFX.speciesPose,basePose=MoveFX.pose,baseIdleTick=MoveFX.idleTick;
 let views={},poses={},refs={p1:'p1a',p2:'p2a'},targets=[],override=null,extras=[],drawingRole=null,passive=false,automatic=false,stances={};
 const enabled=()=>!!session?.double;
 const ref=(side,slot)=>session.multi?(slot?(side==='p1'?'p3b':'p4b'):side+'a'):side+(slot?'b':'a');
 const owner=key=>/^p[13]/.test(key)?'p1':'p2';
 function mon(key){const match=/^(p[1-4])([ab])/.exec(key);return match&&session.battle[match[1]]?.active[session.multi?0:match[2]==='b'?1:0];}
 function snapshot(key){const old={...session.focus},side=owner(key),slot=session.multi?(/^p[34]/.test(key)?1:0):key.endsWith('b')?1:0;session.focus[side]=slot;const p=session.snapshot(side),m=mon(key);session.focus=old;return {...p,gender:m?.gender,nickname:m?.name!==m?.species.name?m?.name:''};}
 function rememberStances(){if(!enabled())return;for(const [role,key]of Object.entries(refs))if(views[key]){stances[key]=PatratMoves.stanceSpecies(role);poses[key]=visualState[role]||poses[key]||{};}}
 function restoreStances(){if(!enabled())return;for(const [role,key]of Object.entries(refs))PatratMoves.setStance(role,!!stances[key],stances[key]);}
 function storedStance(key,id){if(stances[key]!==id)return null;const tick=26+(GameSpeed.now()*.06)%40;return id===504?PatratMoves.sample(PatratMoves.bide.store,tick,owner(key)):id===532?ChapterMoves.sample(ChapterMoves.select(532,117,{storing:true}),tick,owner(key)):null;}
 function resetViews(){rememberStances();const previousViews=views,previousPoses=poses;views={};poses={};for(const side of ['p1','p2'])for(let slot=0;slot<2;slot++){const key=ref(side,slot);if(mon(key)){views[key]=snapshot(key);poses[key]=previousViews[key]?.spriteId===views[key].spriteId?previousPoses[key]||{}:{};}}refs={p1:ref('p1',session.selectionSlot),p2:ref('p2',0)};targets=[];restoreStances();}
 function display(){if(!enabled())return;for(const side of ['p1','p2']){const key=refs[side],p=views[key];if(!p)continue;visualState[side]=poses[key]||(poses[key]={});if(side==='p1')partner=p;else enemy=p;}}
 combatant=function(...args){const previous=drawingRole;drawingRole=args[6];try{return baseCombatant(...args);}finally{drawingRole=previous;}};
 MoveFX.speciesPose=(side,id)=>passive?storedStance(passive,id):baseSpeciesPose(drawingRole||side,id);
 MoveFX.idleTick=side=>passive?undefined:baseIdleTick(side);
 MoveFX.pose=side=>{if(!passive)return basePose(side);const a=storedStance(passive,views[passive]?.spriteId);return {x:0,y:0,scale:1,alpha:1,...(a?{scaleY:1-a.crouch,scaleX:1+a.crouch*.4,pauseAnimation:true}:{})};};
 BattleGround.effect=function(side,w,h,context){if(!enabled())return baseEffect(side,w,h,context);const p=BattleGround.layout(w,h)[side];return {x:p.x,y:p.y-p.height*.55};};
 function slots(w,h){const normal=baseLayout(w,h),out={};
  for(const side of ['p1','p2'])out[side]=[0,1].map(i=>{const base=normal[side],x=w*(side==='p1'?(i?.43:.19):(i?.79:.56)),y=h*(side==='p1'?(i?.84:.77):(i?.57:.61)),height=base.height*.76;
   const world=base.view?BattleGround.groundPoint(base.view,x,y,w,h,.02):undefined;return {...base,x,y,height,size:height/80,world,pixelsPerUnit:world?h/(2*base.view.lens[1]*BattleGround.project(base.view,world,w,h).depth):base.pixelsPerUnit};});return out;
 }
 function position(key,w,h){const side=owner(key),slot=session.multi?(/^p[34]/.test(key)?1:0):key.endsWith('b')?1:0;return slots(w,h)[side][slot];}
 BattleGround.layout=function(w,h,...args){if(!enabled())return baseLayout(w,h,...args);const result={};for(const side of ['p1','p2'])result[side]=override?.[side]||position(refs[side],w,h);return result;};
 function prepareInput(){if(!enabled()||busy||finished)return;rememberStances();const r=session.battle.p1.activeRequest;
  if(r?.active&&!session.battle.p1.active[session.selectionSlot]?.hp){const alive=session.battle.p1.active.findIndex(p=>p?.hp>0);if(alive>=0)session.selectionSlot=alive;}
  if(r?.forceSwitch){const pending=r.forceSwitch.findIndex((force,i)=>force&&!session.queued[i]);if(pending>=0)session.selectionSlot=pending;}
  if(r?.wait&&!automatic){automatic=true;setTimeout(()=>{automatic=false;if(enabled()&&!busy&&!finished)void turn('wait');},0);}
  session.focus={p1:session.selectionSlot,p2:0};refs={p1:ref('p1',session.selectionSlot),p2:ref('p2',0)};
  for(const key of Object.values(refs))if(mon(key)){views[key]=snapshot(key);poses[key]??={};}restoreStances();display();
 }
 snapshotPartner=function(){singleSnapshot();if(enabled()){if(!Object.keys(views).length||!busy){resetViews();prepareInput();}display();}};
 function normalizeEvents(events){if(!enabled())return;for(const e of events){e.nativeActor=e.actor;e.nativeTarget=e.args[1];}
  for(let i=0;i<events.length;i++){const e=events[i];if(e.kind==='move'){let following=events.slice(i+1),end=following.findIndex(e=>['move','cant','turn'].includes(e.kind));if(end>=0)following=following.slice(0,end);e.doubleTargets=[...new Set(following.filter(f=>['-damage','-unboost','-status','-boost','-heal','-start','-activate'].includes(f.kind)&&/^p[1-4][ab]:/.test(f.nativeActor||'')).map(f=>f.nativeActor.split(':')[0]).filter(k=>k!==e.nativeActor?.split(':')[0]))];}}
  for(const e of events){if(session.multi){const convert=s=>typeof s==='string'?s.replace(/p3[ab]:/g,'p1b:').replace(/p4[ab]:/g,'p2b:'):s;e.actor=convert(e.actor);e.args=e.args.map(convert);e.line=convert(e.line);if(e.kind==='win')e.actor=session.battle.winner;}}
 }
 function focusEvent(e){if(!enabled())return;rememberStances();const actor=e.nativeActor?.split(':')[0],target=e.nativeTarget?.split(':')[0];
  if(e.kind==='move'&&mon(actor)){
   refs={p1:ref('p1',0),p2:ref('p2',0)};const side=owner(actor);refs[side]=actor;targets=e.doubleTargets||[];
   if(mon(target)&&target!==actor)refs[side==='p1'?'p2':'p1']=target;
  }
  if(mon(actor)){
   let role=Object.keys(refs).find(side=>refs[side]===actor);if(!role){role=owner(actor);refs[role]=actor;}
   e.side=role;if(e.kind==='move'){const m=mon(actor);visualBattleContext[role]={item:m.item,types:m.getTypes(),screens:!!(m.side.sideConditions.reflect||m.side.sideConditions.lightscreen)};}if(e.kind==='switch'||e.kind==='drag'){views[actor]=snapshot(actor);poses[actor]={};}
   if(!views[actor])views[actor]=snapshot(actor);restoreStances();display();
  }
 }
 function moveMiss(following){return !following.some(e=>['-damage','-unboost','-boost','-status','-heal','-start'].includes(e.kind))&&following.some(e=>['-miss','-immune','-fail','-notarget'].includes(e.kind));}
 function targetSide(e){const key=e.nativeTarget?.split(':')[0];return Object.keys(refs).find(side=>refs[side]===key)||e.side;}
 async function chooseMove(index){const side=session.battle.p1,slot=session.selectionSlot,entry=side.activeRequest?.active?.[slot]?.moves?.[index];if(!entry||entry.disabled)return;
  const move=GEN5.dex.moves.get(entry.id),choices=session.targetChoices('p1',slot,move);let loc=choices[0]?.loc||0;
  if(choices.length>1){const selected=await BattleScreen.targets(choices.map(c=>({loc:c.loc,name:c.mon.species.name,level:c.mon.level,id:c.mon.species.num,label:c.mon.species.name+(c.loc>0?' avversario ':' alleato ')+Math.abs(c.loc)})));if(selected===null)return;loc=selected;}
  return submit('move '+(index+1)+(loc?' '+loc:''));
 }
 async function submit(choice){
  const s=session;if(!s?.double)return;const slot=s.selectionSlot;if(choice.startsWith('switch ')&&s.queued.some((c,i)=>i!==slot&&c===choice))return false;s.queued[slot]=choice;
  const r=s.battle.p1.activeRequest,needed=r.forceSwitch?r.forceSwitch.map((f,i)=>f?i:-1).filter(i=>i>=0):s.battle.p1.active.map((p,i)=>p?.hp>0?i:-1).filter(i=>i>=0);
  const next=needed.find(i=>!s.queued[i]);if(!s.multi&&next!==undefined){s.selectionSlot=next;prepareInput();singleSnapshot();BattleScreen.commands();updateBattle();return;}
  const complete=s.multi?choice:s.battle.p1.active.map((p,i)=>s.queued[i]||'pass').join(', ');s.queued=[];s.selectionSlot=0;s.focus={p1:0,p2:0};resetViews();display();await singleTurn(complete);prepareInput();singleSnapshot();updateBattle();
 }
 turn=async function(index,action){if(!enabled())return singleTurn(index,action);if(busy||finished)return;if(action==='potion'&&!session.multi){const id=session.potionItem||17,target=session.potionTarget||session.selectionSlot+1;if((session.queued||[]).filter(c=>c?.startsWith('item '+id+' ')).length>=Journey.itemCount(id))return;session.potionItem=null;session.potionTarget=null;return submit('item '+id+' '+target);}if(typeof index==='number')return chooseMove(index);if(typeof index==='string'&&index.startsWith('switch '))return submit(index);resetViews();await singleTurn(index,action);prepareInput();singleSnapshot();updateBattle();};
 function undo(){if(!enabled()||!session.queued.some(Boolean))return false;session.queued=[];session.selectionSlot=0;prepareInput();singleSnapshot();updateBattle();return true;}
 function drawIdle(c,w,h){if(!enabled())return;const focused=new Set(Object.values(refs)),active=MoveFX.active;
  for(const [key,p]of Object.entries(views)){if(focused.has(key)||p.hp<=0)continue;const at=position(key,w,h),side=owner(key);
   if(active&&targets.includes(key)&&active.profile){const role=active.targetSide,oldCry=active.cryIds?.[role],oldState=visualState[role];override={[role]:at};if(active.cryIds)active.cryIds[role]=p.spriteId;visualState[role]=poses[key]||{};try{combatant(c,p.name,at.x,at.y,at.size,side==='p1',role,at);}finally{visualState[role]=oldState;if(active.cryIds)active.cryIds[role]=oldCry;override=null;}}
   else {passive=key;const oldState=visualState[side];visualState[side]=poses[key]||{};override={[side]:at};try{combatant(c,p.name,at.x,at.y,at.size,side==='p1',side,at);}finally{visualState[side]=oldState;passive=false;override=null;}}
  }
 }
 function captureTarget(){if(!enabled())return true;const foes=Object.keys(views).filter(k=>owner(k)==='p2'&&mon(k)?.hp>0);if(foes.length!==1)return false;refs={p1:ref('p1',session.selectionSlot),p2:foes[0]};session.focus.p2=foes[0].endsWith('b')?1:0;display();return true;}
 function backFor(side){return enabled()?owner(refs[side])==='p1':side==='p1';}
 function cards(draw){for(const e of extras)e.hidden=!enabled();if(!enabled())return;
  if(!extras.length)for(const side of ['p1','p2']){const box=document.createElement('div');box.className='double-card '+(side==='p1'?'double-own':'double-foe');document.getElementById('battle').append(box);extras.push(box);}
  const other=Object.keys(views).filter(k=>!Object.values(refs).includes(k));for(let i=0;i<2;i++){const key=other[i];extras[i].hidden=!key;if(key)draw(extras[i],views[key],owner(key)==='p1');}
  document.getElementById('battle').classList.add('is-double');
 }
 async function partnerBattle(args){const [ally,first,second]=args,team=id=>structuredClone(OPENING_TRAINERS[id].party).map(p=>({...p,item:GEN5.items.find(i=>i.id===p.heldItem)?.key||''}));rival='Team Plasma';await startBattle(true,{story:'Team Plasma',trainerId:first,doubles:true,ally:team(ally),secondFoe:team(second),p1:Journey.configs(),p2:team(first)});session.partnerTrainers=[first,second];resetViews();display();updateBattle();}
 const originalStart=startBattle;startBattle=async function(...args){views={};poses={};stances={};for(const e of extras)e.hidden=true;document.getElementById('battle').classList.remove('is-double');await originalStart(...args);if(enabled()){session.onItemUsed=id=>Journey.consumeItem(id);resetViews();display();updateBattle();}};
 window.DoubleBattles={isReserved:index=>enabled()&&session.queued.some((c,i)=>i!==session.selectionSlot&&c==='switch '+index),combatantFor:side=>enabled()?mon(refs[side]):null,captureTarget,prepareInput,normalizeEvents,focusEvent,moveMiss,targetSide,drawIdle,backFor,cards,partner:partnerBattle,undo,slots};
})();
