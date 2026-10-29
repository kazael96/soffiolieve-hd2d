/* Party, save and menu services shared with the original field-event host. */
(() => {
  let storage;try{storage=window.SpeciesStudioMode?null:localStorage;}catch{storage=null;}
  const state=StoryState.read(storage),preferences=JourneyState.read(storage).state;
  if(window.TrainerProfile&&!state.trainer)state.trainer=TrainerProfile.create();
  const outdoor={...ROM_SCENE,instances:[...ROM_SCENE.instances,...OPENING_ASSETS.scenes.north.instances],permissionGrids:[...ROM_SCENE.permissionGrids,...OPENING_ASSETS.scenes.north.permissionGrids]};
  let restarting=false,processing=false,continuation=null,lead=0,battleSlots=[],participants=new Set(),lastSave='';
  const lastPreferences={zoom:preferences.zoom,cinema:preferences.cinema,touch:preferences.touch};
  const encounterState=new RouteEncounter(OPENING_ENCOUNTER_RULES.rate);
  const phaseIndex=()=>StoryState.phases.indexOf(state.phase);
  function pack(m,xp=0){return {name:m.name,...(m.met?{met:m.met}:{}),personality:m.personality??0,nickname:m.nickname||'',heldItem:m.heldItem||0,level:m.level,xp,hp:m.hp,status:m.status||'',ivs:m.ivs,evs:m.evs,nature:m.nature,gender:m.gender,abilityId:m.abilityId,happiness:m.happiness,pp:m.moves.map(m=>({id:m.id,left:m.left}))};}
  function record(m,xp=0){return {...pack(m,xp),met:{date:new Date().toISOString(),zone:state.original?.zone||391,level:m.level}};}
  function unpack(p){const m=makeMon(p.name,p.level,p);if(p.hp!==null)m.hp=Math.min(m.max,p.hp);m.status=p.status;for(const move of m.moves){const old=p.pp.find(x=>x.id===move.id);if(old)move.left=Math.min(move.pp,old.left);}return m;}
  function displayPartner(){partner=state.party.length?unpack(state.party[lead]||state.party[0]):makeMon('Snivy',5);document.querySelector('.companion').hidden=!state.starter;refresh();}
  function update(){
    $('questSummary').textContent=$('storyObjective').textContent=StoryState.objectives[state.phase];
    $('storyBag').textContent=`Denaro: $${state.money} · Poké Ball: ${state.pokeballs} · Pozioni: ${potions}`+(phaseIndex()>=4?' · Interpoké':'')+(phaseIndex()>=6?' · Pokédex':'')+(phaseIndex()>=7?' · Mappa Città':'');
    $('world').dataset.chapter=state.phase;$('world').dataset.scene=state.scene;
    document.querySelector('.place').firstChild.textContent=(({321:'PERCORSO 3',16:'ZEFIROPOLI',324:'GROTTA MINERALE',322:'SCUOLA MATERNA',323:'PENSIONE POKÉMON',27:'VARCO',20:'CENTRO POKÉMON'})[state.original?.zone])|| (state.original?.zone===6?'LEVANTOPOLI':state.original?.zone===319?'PERCORSO 2':state.scene==='town'?(player.y<-80?'QUATTROVENTI':player.y<-16?'PERCORSO 1':'SOFFIOLIEVE'):state.scene==='zone8'?'CENTRO POKÉMON':'SOFFIOLIEVE');
    $('openTownMap').hidden=!state.original?.map;
    $('openPokedex').hidden=!state.original?.pokedex;
    $('openLab').disabled=!state.starter;
  }
  function save(force=false){
    if(restarting||renderer.ready===false||renderer.contextLost||renderer.modelsRecovering||battling||window.NativeStory?.locked)return false;window.NativeStory?.captureActors();Object.assign(state,{player:{...player},facing,potions});const encoded=JSON.stringify(state);let saved=encoded===lastSave;
    if(force||encoded!==lastSave){saved=StoryState.write(storage,state);$('saveStatus').textContent=saved?'Viaggio salvato su questo dispositivo':'Salvataggio non disponibile su questo browser';if(saved)lastSave=encoded;}
    Object.assign(preferences,{zoom:renderer.zoom,cinema:renderer.cinema});
    const changed=Object.fromEntries(Object.keys(lastPreferences).filter(k=>preferences[k]!==lastPreferences[k]).map(k=>[k,preferences[k]]));
    if(Object.keys(changed).length){const latest=JourneyState.read(storage).state;Object.assign(latest,changed);if(JourneyState.write(storage,latest))Object.assign(lastPreferences,changed);}
    return saved;
  }
  function setScene(name,x,y){state.scene=name;renderer.scene=name==='town'?outdoor:OPENING_ASSETS.scenes[name==='bedroom'&&state.original?.roomMess?'bedroomMess':name];player={x,y};facing=3;resetInput();encounterState.distance=0;cooldown=3;renderer.center=[name==='town'?([321,16].includes(state.original?.zone)?x:x*.7):renderer.scene.chapter042?x:-10,name==='town'||renderer.scene.chapter042?y+1.5:-10];actors();update();save();}
  function say(speaker,text,done=null,title=speaker){
    resetInput();continuation=done;$('speakerName').textContent=speaker;$('dialogueTitle').textContent=title;$('dialogueText').textContent=text;
    const portrait=['Belle','Komor','Aralia','Mamma','Padre','Viandante'].includes(speaker);$('dialoguePortrait').hidden=!portrait;if(portrait){$('dialoguePortrait').src=`assets/${['Padre','Viandante'].includes(speaker)?'opening':'characters'}/${speaker}-3.png`;$('dialoguePortrait').alt=speaker;}
    $('dialogueBattle').hidden=true;$('starterChoices').hidden=true;$('dialogueContinue').hidden=false;$('dialogueContinue').textContent='Continua';$('dialogue').showModal();
  }
  function closeDialogue(){const next=continuation;continuation=null;$('dialogue').close();resetInput();if(next)next();}
  $('dialogueContinue').onclick=closeDialogue;
  $('dialogue').addEventListener('cancel',event=>{if(window.NativeStory)return;event.preventDefault();if(!$('dialogueContinue').hidden)closeDialogue();});
  function advance(expected){StoryState.advance(state,expected);actors();update();save(true);}
  function heal(){state.party=state.party.map(p=>({...p,...pack(makeMon(p.name,p.level,p),p.xp)}));displayPartner();save();}
  function actors() { window.NativeStory?.syncActors(); }
  function talk() { window.NativeStory?.interact(); }
  function interact() { window.NativeStory?.interact(); }
  function hint() { return ''; }
  function monConfig(m){return {...m,item:GEN5.items.find(item=>item.id===m.heldItem)?.key||'',moves:m.moves.map(x=>x.id),pp:m.moves};}
  function configs(){battleSlots=state.party.map((p,i)=>i).filter(i=>state.party[i].hp!==0);if(battleSlots.includes(lead))battleSlots=[lead,...battleSlots.filter(i=>i!==lead)];participants=new Set([battleSlots[0]]);return battleSlots.map(i=>{const m=unpack(state.party[i]);return monConfig(m);});}
  function attachBattle(s,kind){if(kind!=='tutorial'){for(const m of s.battle.p2.pokemon)StoryState.register(state,m.species.name);for(let i=0;i<s.battle.p1.pokemon.length;i++)s.battle.p1.pokemon[i].storyId=battleSlots[i];}}
  function recordParticipant(s){for(const p of s.battle.p1.active){const id=p?.storyId;if(id!==undefined)participants.add(id);}}
  async function progressText(bank,id,words){
    for(const page of messagePages(ORIGINAL_EVENTS.progressTexts[bank][id],words))await NativeStory.showPage(page.replace(/\{be(?:02|04|05)(?::[^}]*)?\}/g,''));
  }
  async function learnMove(p,id){
    if(p.pp.some(m=>m.id===id))return;
    const move=GEN5.moves.find(m=>m.id===id),words=[p.nickname||p.name,move.name];
    if(p.pp.length<4){p.pp.push({id,left:move.pp});await progressText(204,3,words);return;}
    for(;;){
      await progressText(204,4,words);
      if(await NativeStory.choice(['SÌ','NO'])===0){
        const index=await NativeStory.choice([...p.pp.map(m=>GEN5.moves.find(x=>x.id===m.id).name),'Annulla']);
        if(index<4){if(p.pp[index].id===15){await NativeStory.showPage('Le mosse MN non possono essere dimenticate.');continue;}await progressText(204,5,[words[0],GEN5.moves.find(m=>m.id===p.pp[index].id).name]);p.pp[index]={id,left:move.pp};await progressText(204,6,words);return;}
      }
      await progressText(204,7,words);
      if(await NativeStory.choice(['SÌ','NO'])===0){await progressText(204,8,words);return;}
    }
  }
  async function gainXP(s,kind,foe=s.active('p2')){
    const receivers=[...participants].filter(i=>state.party[i]?.hp>0);
    for(const id of receivers){const p=state.party[id],data=OPENING_DATA[p.name],foeData=OPENING_DATA[foe.species.name],base=foeData?.yield||0,old=unpack(p);
      p.evs??={hp:0,atk:0,def:0,spe:0,spa:0,spd:0};
      for(const [stat,n] of Object.entries(foeData?.evYield||{})){const total=Object.values(p.evs).reduce((a,b)=>a+b,0);p.evs[stat]+=Math.min(n,255-p.evs[stat],510-total);}
      const power=v=>Math.floor(Math.round(Math.sqrt(v)*4096)/4096*v*v);
      const xp=Math.floor(Math.floor(Math.floor(base*foe.level/5)*(kind==='wild'?1:1.5))/(Math.max(1,receivers.length)*(s.multi?2:1))*power(2*foe.level+10)/power(foe.level+p.level+10))+1;
      const cap=window.ROUTE2_DATA?Math.max(15,p.level):100;p.xp=Math.min(data.growth[cap],p.xp+xp);await progressText(15,42,[p.nickname||p.name,xp]);
      const species=GEN5.species.find(m=>m.en===p.name);
      while(p.level<cap&&p.xp>=data.growth[p.level+1]){
        p.level++;await progressText(15,60,[p.nickname||p.name,p.level]);
        for(const move of species.learnset.filter(m=>m.level===p.level))await learnMove(p,move.id);
      }
      const next=makeMon(p.name,p.level,p);p.hp=Math.min(next.max,old.hp+next.max-old.max);
    }
  }
  async function afterBattle(s,kind,captured,escaped){
    processing=true;encounterState.reset();try{
    if(kind==='tutorial'){displayPartner();window.NativeStory?.battleDone(s,kind);return;}
    for(const m of s.battle.p1.pokemon){const id=m.storyId;if(id!==undefined)state.party[id]={...state.party[id],hp:m.hp,status:m.status,pp:m.moveSlots.map(move=>({id:GEN5.byMoveKey[move.id]?.id||0,left:move.pp}))};}
    if(s.double&&(captured||escaped))for(const foe of s.battle.p2.pokemon.filter(p=>p.hp===0))await gainXP(s,kind,foe);
    if(captured){
      const first=StoryState.register(state,captured.name,true),index=state.party.length;state.party.push(record(captured,OPENING_DATA[captured.name].growth[captured.level]));
      if(first&&state.original?.pokedex){await progressText(15,66,[captured.name]);await Pokedex.entry(captured.name,{registration:true});}
      await NativeStory.showPage(messagePages(POKEDEX_ASSETS.labels.nickname,[captured.name]).join('\n'));
      if(await NativeStory.choice(['SÌ','NO'])===0)await NativeStory.nickname(index);
    }else if(!escaped&&s.battle.winner==='Alcide'){const defeated=[...s.battle.p2.pokemon,...(s.multi?s.battle.p4.pokemon:[])].filter(p=>p.hp===0);for(const foe of defeated.length?defeated:[s.active('p2')])await gainXP(s,kind,foe);}
    if(s.openingTrainer&&s.battle.winner==='Alcide'){
      for(const page of messagePages(s.openingTrainer.messages[1],[]))await NativeStory.showPage(page,s.openingTrainer.name);
      const reward=s.partnerTrainers?s.partnerTrainers.reduce((sum,id)=>sum+OpeningBattleRules.prize(OPENING_TRAINERS[id]),0):OpeningBattleRules.prize(s.openingTrainer);state.money=Math.min(9999999,state.money+reward);
      if(reward)await progressText(15,58,[state.playerName,reward]);
    }else if(!escaped&&!captured&&s.battle.winner!=='Alcide'&&!s.noBlackout){
      await progressText(15,54,[state.playerName]);const lost=OpeningBattleRules.loss(state.party,state.money);state.money-=lost;
      if(lost)await progressText(15,kind==='wild'?55:56,[state.playerName,lost]);await progressText(15,57,[state.playerName]);
    }
    lead=Math.max(0,state.party.findIndex(p=>p.hp>0));displayPartner();
    if(window.NativeStory?.battleDone(s,kind))return;
    if(state.party.every(p=>p.hp===0)){heal();window.NativeStory?.blackout();}
    update();
    }finally{processing=false;save(true);}
  }
  function step(dt,moved){}
  function encounter(dt,moved,distance=0){if(moved&&state.original?.repelRemaining)state.original.repelRemaining=Math.max(0,state.original.repelRemaining-distance);
    if(phaseIndex()<StoryState.phases.indexOf('route')||!moved||battling)return;
    const next=window.ROUTE3_DATA?.encounters?.[window.NativeStory?.state.zone],route2=window.ROUTE2_DATA&&window.NativeStory?.state.zone===319,dream=window.NativeStory?.state.zone===152,enc=next|| (dream?STRIATON_DATA.encounters:route2?ROUTE2_DATA.encounters:null);const onRoute=!!enc||window.NativeStory?.state.zone===OPENING_ENCOUNTER_RULES.zone;encounterState.rate=enc?enc.rate:OPENING_ENCOUNTER_RULES.rate;
    const g=onRoute?(dream||next?renderer.scene:outdoor).permissionGrids.find(g=>player.x>=g.x-16&&player.x<g.x+16&&player.y>=g.z-16&&player.y<g.z+16):null;
    const tile=g?8+(Math.floor(player.y-g.z)+16)*256+(Math.floor(player.x-g.x)+16)*8:0;
    const dark=next?.dark&&g?.bytes[tile]===6,table=dark?next.dark.slots:enc?enc.slots:OPENING_ENCOUNTERS;if(dark)encounterState.rate=next.dark.rate;
    if(encounterState.advance(distance,!!g&& (window.NativeStory?.state.zone===324?g.bytes[tile]===10:[4,6].includes(g.bytes[tile])),n=>Math.floor(Math.random()*n))){
      const pick=()=>{let roll=Math.random()*100;const e=table.find(slot=>(roll-=slot.weight)<0)||table.at(-1);return monConfig(newStoryMon(e.name,e.level??e.min+Math.floor(Math.random()*(e.max-e.min+1))));};
      // IRBI overlay21 021a935e..021a937a: two healthy party members;
      // GFL_RandomLC(65535)/656 < 40 enables the second dark-grass slot.
      const double=dark&&state.party.filter(p=>p.hp>0).length>=2&&Math.floor(Math.floor(Math.random()*65535)/656)<40;
      const foes=Array.from({length:double?2:1},pick).filter(m=>!(state.original.repelRemaining>0&&m.level<(state.party[lead]?.level||0)));
      if(foes.length)startBattle(false,{story:'wild',doubles:foes.length===2,p1:configs(),p2:foes});
    }
  }
  function openJournal(){if(window.NativeUI)return NativeUI.open();if(battling||menuOpen()||window.NativeStory?.locked)return;resetInput();update();save();$('journal').showModal();}
  function openTeam(){if(window.NativeUI)return NativeUI.team();if(battling||menuOpen()||window.NativeStory?.locked||!state.starter)return;resetInput();$('partyList').replaceChildren();state.party.forEach((p,i)=>{const b=document.createElement('button');b.textContent=`${p.nickname||p.name} · Lv. ${p.level} · ${p.hp}/${makeMon(p.name,p.level,p).max} PS${i===lead?' · In testa':''}`;b.disabled=p.hp===0;b.onclick=()=>{lead=i;displayPartner();$('partyDialog').close();};$('partyList').append(b);});$('partyDialog').showModal();}
  $('openTownMap').onclick=()=>TownMap.open().catch(error=>{console.error(error);toast('Mappa Città non disponibile. Riprova.');});
  $('openPokedex').onclick=()=>Pokedex.browse();
  $('openJournal').onclick=openJournal;$('closeJournal').onclick=()=>$('journal').close();$('saveNow').onclick=()=>save(true);
  $('touchPreference').checked=preferences.touch;$('focusPreference').checked=!preferences.cinema;renderer.zoom=preferences.zoom;renderer.cinema=preferences.cinema;$('zoomValue').value=Math.round(renderer.zoom*100)+'%';document.body.classList.toggle('touch-enabled',preferences.touch);
  $('touchPreference').onchange=()=>{preferences.touch=$('touchPreference').checked;document.body.classList.toggle('touch-enabled',preferences.touch);resetInput();save(true);};$('focusPreference').onchange=()=>{renderer.cinema=!$('focusPreference').checked;save(true);};
  $('resetJourney').onclick=()=>{$('resetConfirmation').hidden=false;$('cancelReset').focus();};$('cancelReset').onclick=()=>{$('resetConfirmation').hidden=true;};
  function restart(){restarting=true;if(!StoryState.erase(storage)){restarting=false;return false;}location.reload();return true;}
  $('confirmReset').onclick=()=>{if(!restart())toast('Impossibile cancellare il salvataggio. Riprova.');};
  for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',resetInput);
  function moveParty(from,to){if(battling||!state.party[from]||!state.party[to])return false;[state.party[from],state.party[to]]=[state.party[to],state.party[from]];lead=0;displayPartner();save(true);return true;}
  function itemCount(id){return id===4?state.pokeballs:id===17?potions:Math.max(0,Math.min(999,Math.floor(state.original?.extraItems?.[id])||0));}
  function addItem(id,count=1){if(!([3,4,17,26,50].includes(id)||window.STRIATON_DATA?.itemNames[id]||window.ROUTE3_DATA?.itemNames[id])||!Number.isInteger(count)||count<1||itemCount(id)+count>999)return false;if(id===4)state.pokeballs+=count;else if(id===17)potions+=count;else{state.original.extraItems??={};state.original.extraItems[id]=itemCount(id)+count;}return true;}
  function consumeItem(id,count=1){if(!Number.isInteger(count)||count<1||itemCount(id)<count)return false;if(id===4)state.pokeballs-=count;else if(id===17)potions-=count;else state.original.extraItems[id]=itemCount(id)-count;return true;}
  function usePotion(index,id=17){const p=state.party[index];if(battling||!p||![17,26].includes(id)||itemCount(id)<=0||p.hp<=0)return 0;const m=unpack(p),healed=Math.min(id===26?50:20,m.max-m.hp);if(healed<=0)return 0;p.hp=m.hp+healed;consumeItem(id);displayPartner();save(true);return healed;}
  async function useRareCandy(index){const p=state.party[index];if(battling||processing||!p||p.level>=15||!itemCount(50))return false;processing=true;try{const old=unpack(p);consumeItem(50);p.level++;p.xp=OPENING_DATA[p.name].growth[p.level];await progressText(15,60,[p.nickname||p.name,p.level]);const species=GEN5.species.find(s=>s.en===p.name);for(const move of species.learnset.filter(m=>m.level===p.level))await learnMove(p,move.id);const next=makeMon(p.name,p.level,p);p.hp=Math.min(next.max,old.hp+next.max-old.max);displayPartner();return true;}finally{processing=false;save(true);}}
  function giveItem(id,index){const p=state.party[index];if(battling||!p||!([3,4,14,17,18,21,22,25,26,27,28,30,50,58,79,150,155].includes(id))||!itemCount(id)||p.heldItem&&itemCount(p.heldItem)>=999)return false;consumeItem(id);if(p.heldItem)addItem(p.heldItem);p.heldItem=id;save(true);return true;}
  function takeItem(index){const p=state.party[index],id=p?.heldItem;if(battling||!id||!addItem(id))return 0;p.heldItem=0;save(true);return id;}
  function discardItem(id,count){if(battling||![3,4,14,17,18,21,22,25,26,27,28,30,50,58,79,150,155].includes(id)||!consumeItem(id,count))return false;save(true);return true;}
  async function useMoonStone(index){const p=state.party[index];if(battling||processing||p?.name!=='Munna'||!itemCount(58))return false;processing=true;try{await NativeStory.showPage('Cosa? Munna si sta evolvendo!');const previous=unpack(p);consumeItem(58);p.name='Musharna';const next=makeMon(p.name,p.level,p);p.hp=Math.min(next.max,previous.hp+next.max-previous.max);StoryState.register(state,p.name,true);displayPartner();await NativeStory.showPage('Congratulazioni! Munna si è evoluto in Musharna!');return true;}finally{processing=false;save(true);}}
  function useMedicine(index,id){const p=state.party[index];if(battling||!p||!itemCount(id))return false;if(p.hp===0&&id!==28)return false;const m=unpack(p),old=p.hp,status=p.status;if([25,30,155].includes(id)&&p.hp>0)p.hp=Math.min(m.max,p.hp+({25:200,30:50,155:10}[id]));else if((id===18&&['psn','tox'].includes(p.status))||(id===21||id===150)&&p.status==='slp')p.status='';else if(id===22&&p.status==='par')p.status='';else if(id===27)p.status='';else if(id===28&&p.hp===0)p.hp=Math.max(1,Math.floor(m.max/2));if(old===p.hp&&status===p.status)return false;consumeItem(id);displayPartner();save(true);return true;}
  function useRepel(){if(battling||!itemCount(79))return false;consumeItem(79);state.original.repelRemaining=100;save(true);return true;}
  async function teachMachine(id,index){const p=state.party[index],move={373:168,410:526,420:15}[id];if(battling||processing||!p||!move||!itemCount(id)||!((window.ROUTE3_DATA?.compatibility[p.name]||STRIATON_DATA.compatibility[p.name])?.includes(id)))return false;processing=true;try{await learnMove(p,move);return p.pp.some(m=>m.id===move);}finally{processing=false;save(true);}}
  function daycareSteps(distance){const care=state.original?.daycare;if(!care||!Number.isFinite(distance)||distance<=0)return;care.distance=(care.distance||0)+distance;const steps=Math.floor(care.distance);if(!steps)return;care.distance-=steps;const p=care.pokemon,data=OPENING_DATA[p.name];if(!data)return;const cap=Math.max(15,p.level),before=p.level;p.xp=Math.min(data.growth[cap],p.xp+steps);while(p.level<cap&&p.xp>=data.growth[p.level+1]){p.level++;const species=GEN5.species.find(s=>s.en===p.name);for(const move of species.learnset.filter(m=>m.level===p.level)){if(p.pp.some(m=>m.id===move.id))continue;if(p.pp.length>=4)p.pp.shift();p.pp.push({id:move.id,left:GEN5.moves.find(m=>m.id===move.id).pp});}}if(p.level!==before){const m=makeMon(p.name,p.level,p);p.hp=m.max;}}
  window.Journey={daycareSteps,useMoonStone,useMedicine,useRepel,teachMachine,restart,itemCount,addItem,consumeItem,useRareCandy,giveItem,takeItem,discardItem,moveParty,usePotion,get processing(){return processing;},state,outdoor,save,heal,openJournal,openTeam,talk,interact,hint,step,configs,attachBattle,recordParticipant,afterBattle,pack,record,unpack,setScene,update,displayPartner,encounter};
  potions=state.potions;renderer.scene=state.scene==='town'?outdoor:OPENING_ASSETS.scenes[state.scene==='bedroom'&&state.original?.roomMess?'bedroomMess':state.scene];player={...state.player};facing=state.facing;
  if(blocked(player.x-.18,player.y-.18)||blocked(player.x+.18,player.y+.18)){const p={zone322:[-8.5,-3.5],zone323:[-8.5,-3.5],zone324:[13.5,-10.5],zone27:[-2.5,-11.5],zone20:[-8.5,-3.5],zone8:[-8.5,-3.5],zone398:[-8.5,2.5],zone399:[-9.5,-7.5],zone400:[-6.5,-12.5],zone401:[-9.5,-7.5],zone402:[-6.5,-12.5],zone403:[-9.5,-7.5],zone404:[-6.5,-12.5],zone405:[-10.5,-6.5],zone320:[-8.5,-11.5],biancaRoom:[-10.5,-9.5],komorHome:[-10.5,-6.5],komorRoom:[-10.5,-9.5],bedroom:[-10.5,-10.5],home:[-10.5,-6.5],bianca:[-10.5,-6.5],lab:[-12.5,-5.5],zone7:[-3.5,26.5],zone9:[-8.5,-6.5],zone10:[-5.5,-12.5],zone15:[-8.5,-1.5],zone152:[-6.5,10.5],town:[-2,0]}[state.scene];player={x:p[0],y:p[1]};}
  renderer.center=state.scene==='town'?[player.x*.7,player.y+1.5]:[-10,-10];displayPartner();actors();update();
  addEventListener('pagehide',()=>save());document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});setInterval(()=>save(),5000);
})();
