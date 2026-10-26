/* Party, save and menu services shared with the original field-event host. */
(() => {
  let storage;try{storage=localStorage;}catch{storage=null;}
  const state=StoryState.read(storage),preferences=JourneyState.read(storage).state;
  const outdoor={...ROM_SCENE,instances:[...ROM_SCENE.instances,...OPENING_ASSETS.scenes.north.instances],permissionGrids:[...ROM_SCENE.permissionGrids,...OPENING_ASSETS.scenes.north.permissionGrids]};
  let processing=false,continuation=null,lead=0,battleSlots=[],participants=new Set(),lastSave='';
  const encounterState=new RouteEncounter(OPENING_ENCOUNTER_RULES.rate);
  const phaseIndex=()=>StoryState.phases.indexOf(state.phase);
  function pack(m,xp=0){return {name:m.name,nickname:m.nickname||'',level:m.level,xp,hp:m.hp,status:m.status||'',ivs:m.ivs,evs:m.evs,nature:m.nature,gender:m.gender,abilityId:m.abilityId,happiness:m.happiness,pp:m.moves.map(m=>({id:m.id,left:m.left}))};}
  function unpack(p){const m=makeMon(p.name,p.level,p);if(p.hp!==null)m.hp=Math.min(m.max,p.hp);m.status=p.status;for(const move of m.moves){const old=p.pp.find(x=>x.id===move.id);if(old)move.left=Math.min(move.pp,old.left);}return m;}
  function displayPartner(){partner=state.party.length?unpack(state.party[lead]||state.party[0]):makeMon('Snivy',5);document.querySelector('.companion').hidden=!state.starter;refresh();}
  function update(){
    $('questSummary').textContent=$('storyObjective').textContent=StoryState.objectives[state.phase];
    $('storyBag').textContent=`Poké Ball: ${state.pokeballs} · Pozioni: ${potions}`+(phaseIndex()>=4?' · Interpoké':'')+(phaseIndex()>=6?' · Pokédex':'')+(phaseIndex()>=7?' · Mappa Città':'');
    $('world').dataset.chapter=state.phase;$('world').dataset.scene=state.scene;
    document.querySelector('.place').firstChild.textContent=state.scene==='town'?(player.y<-80?'QUATTROVENTI':player.y<-16?'PERCORSO 1':'SOFFIOLIEVE'):'SOFFIOLIEVE';
    $('openLab').disabled=!state.starter;
  }
  function save(force=false){
    if(battling||window.NativeStory?.locked)return;window.NativeStory?.captureActors();Object.assign(state,{player:{...player},facing,potions});const encoded=JSON.stringify(state);
    if(force||encoded!==lastSave){const ok=StoryState.write(storage,state);$('saveStatus').textContent=ok?'Viaggio salvato su questo dispositivo':'Salvataggio non disponibile su questo browser';if(ok)lastSave=encoded;}
    Object.assign(preferences,{zoom:renderer.zoom,cinema:renderer.cinema});JourneyState.write(storage,preferences);
  }
  function setScene(name,x,y){state.scene=name;renderer.scene=name==='town'?outdoor:OPENING_ASSETS.scenes[name==='bedroom'&&state.original?.roomMess?'bedroomMess':name];player={x,y};facing=3;resetInput();encounterState.distance=0;cooldown=3;renderer.center=[name==='town'?x*.7:-10,name==='town'?y+1.5:-10];actors();update();save();}
  function say(speaker,text,done=null,title=speaker){
    resetInput();continuation=done;$('speakerName').textContent=speaker;$('dialogueTitle').textContent=title;$('dialogueText').textContent=text;
    const portrait=['Belle','Komor','Aralia','Mamma','Padre','Viandante'].includes(speaker);$('dialoguePortrait').hidden=!portrait;if(portrait){$('dialoguePortrait').src=`assets/${['Padre','Viandante'].includes(speaker)?'opening':'characters'}/${speaker}-3.png`;$('dialoguePortrait').alt=speaker;}
    $('dialogueBattle').hidden=true;$('starterChoices').hidden=true;$('dialogueContinue').hidden=false;$('dialogueContinue').textContent='Continua';$('dialogue').showModal();
  }
  function closeDialogue(){const next=continuation;continuation=null;$('dialogue').close();resetInput();if(next)next();}
  $('dialogueContinue').onclick=closeDialogue;
  $('dialogue').addEventListener('cancel',event=>{event.preventDefault();if(!$('dialogueContinue').hidden)closeDialogue();});
  function advance(expected){StoryState.advance(state,expected);actors();update();save(true);}
  function heal(){state.party=state.party.map(p=>({...p,...pack(makeMon(p.name,p.level,p),p.xp)}));displayPartner();save();}
  function actors() { window.NativeStory?.syncActors(); }
  function talk() { window.NativeStory?.interact(); }
  function interact() { window.NativeStory?.interact(); }
  function hint() { return ''; }
  function monConfig(m){return {...m,moves:m.moves.map(x=>x.id),pp:m.moves};}
  function configs(){battleSlots=state.party.map((p,i)=>i).filter(i=>state.party[i].hp!==0);if(battleSlots.includes(lead))battleSlots=[lead,...battleSlots.filter(i=>i!==lead)];participants=new Set([battleSlots[0]]);return battleSlots.map(i=>{const m=unpack(state.party[i]);return monConfig(m);});}
  function attachBattle(s,kind){if(kind!=='tutorial')for(let i=0;i<s.battle.p1.pokemon.length;i++)s.battle.p1.pokemon[i].storyId=battleSlots[i];}
  function recordParticipant(s){const id=s.active().storyId;if(id!==undefined)participants.add(id);}
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
        if(index<4){await progressText(204,5,[words[0],GEN5.moves.find(m=>m.id===p.pp[index].id).name]);p.pp[index]={id,left:move.pp};await progressText(204,6,words);return;}
      }
      await progressText(204,7,words);
      if(await NativeStory.choice(['SÌ','NO'])===0){await progressText(204,8,words);return;}
    }
  }
  async function gainXP(s,kind){
    const foe=s.active('p2'),receivers=[...participants].filter(i=>state.party[i]?.hp>0);
    for(const id of receivers){const p=state.party[id],data=OPENING_DATA[p.name],foeData=OPENING_DATA[foe.species.name],base=foeData?.yield||0,old=unpack(p);
      p.evs??={hp:0,atk:0,def:0,spe:0,spa:0,spd:0};
      for(const [stat,n] of Object.entries(foeData?.evYield||{})){const total=Object.values(p.evs).reduce((a,b)=>a+b,0);p.evs[stat]+=Math.min(n,255-p.evs[stat],510-total);}
      const power=v=>Math.floor(Math.round(Math.sqrt(v)*4096)/4096*v*v);
      const xp=Math.floor(Math.floor(Math.floor(base*foe.level/5)*(kind==='wild'?1:1.5))/Math.max(1,receivers.length)*power(2*foe.level+10)/power(foe.level+p.level+10))+1;
      p.xp+=xp;await progressText(15,42,[p.nickname||p.name,xp]);
      const species=GEN5.species.find(m=>m.en===p.name);
      while(p.level<100&&p.xp>=data.growth[p.level+1]){
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
    if(captured)state.party.push(pack(captured,OPENING_DATA[captured.name].growth[captured.level]));else if(!escaped&&s.battle.winner==='Alcide')await gainXP(s,kind);
    lead=Math.max(0,state.party.findIndex(p=>p.hp>0));displayPartner();
    if(window.NativeStory?.battleDone(s,kind))return;
    if(state.party.every(p=>p.hp===0)){heal();window.NativeStory?.blackout();}
    update();
    }finally{processing=false;save(true);}
  }
  function step(dt,moved){}
  function encounter(dt,moved,distance=0){
    if(state.phase!=='route'||!moved||battling)return;
    const onRoute=window.NativeStory?.state.zone===OPENING_ENCOUNTER_RULES.zone;
    const g=onRoute?outdoor.permissionGrids.find(g=>player.x>=g.x-16&&player.x<g.x+16&&player.y>=g.z-16&&player.y<g.z+16):null;
    const tile=g?8+(Math.floor(player.y-g.z)+16)*256+(Math.floor(player.x-g.x)+16)*8:0;
    if(encounterState.advance(distance,!!g&&g.bytes[tile]===4,n=>Math.floor(Math.random()*n))){
      let roll=Math.random()*100;
      const e=OPENING_ENCOUNTERS.find(slot=>(roll-=slot.weight)<0)||OPENING_ENCOUNTERS.at(-1);
      startBattle(false,{story:'wild',p1:configs(),p2:[monConfig(newStoryMon(e.name,e.level))]});
    }
  }
  function openJournal(){if(battling||menuOpen()||window.NativeStory?.locked)return;resetInput();update();save();$('journal').showModal();}
  function openTeam(){if(battling||menuOpen()||window.NativeStory?.locked||!state.starter)return;resetInput();$('partyList').replaceChildren();state.party.forEach((p,i)=>{const b=document.createElement('button');b.textContent=`${p.nickname||p.name} · Lv. ${p.level} · ${p.hp}/${makeMon(p.name,p.level,p).max} PS${i===lead?' · In testa':''}`;b.disabled=p.hp===0;b.onclick=()=>{lead=i;displayPartner();$('partyDialog').close();};$('partyList').append(b);});$('partyDialog').showModal();}
  $('openJournal').onclick=openJournal;$('closeJournal').onclick=()=>$('journal').close();$('saveNow').onclick=()=>save(true);
  $('touchPreference').checked=preferences.touch;$('focusPreference').checked=!preferences.cinema;renderer.zoom=preferences.zoom;renderer.cinema=preferences.cinema;$('zoomValue').value=Math.round(renderer.zoom*100)+'%';document.body.classList.toggle('touch-enabled',preferences.touch);
  $('touchPreference').onchange=()=>{preferences.touch=$('touchPreference').checked;document.body.classList.toggle('touch-enabled',preferences.touch);resetInput();save(true);};$('focusPreference').onchange=()=>{renderer.cinema=!$('focusPreference').checked;save(true);};
  $('resetJourney').onclick=()=>{$('resetConfirmation').hidden=false;$('cancelReset').focus();};$('cancelReset').onclick=()=>{$('resetConfirmation').hidden=true;};
  $('confirmReset').onclick=()=>{storage?.removeItem(StoryState.KEY);location.reload();};
  for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',resetInput);
  window.Journey={get processing(){return processing;},state,outdoor,save,heal,openJournal,openTeam,talk,interact,hint,step,configs,attachBattle,recordParticipant,afterBattle,pack,unpack,setScene,update,displayPartner,encounter};
  potions=state.potions;renderer.scene=state.scene==='town'?outdoor:OPENING_ASSETS.scenes[state.scene==='bedroom'&&state.original?.roomMess?'bedroomMess':state.scene];player={...state.player};facing=state.facing;
  if(blocked(player.x-.18,player.y-.18)||blocked(player.x+.18,player.y+.18)){const p={biancaRoom:[-10.5,-9.5],komorHome:[-10.5,-6.5],komorRoom:[-10.5,-9.5],bedroom:[-10.5,-10.5],home:[-10.5,-6.5],bianca:[-10.5,-6.5],lab:[-12.5,-5.5],town:[-2,0]}[state.scene];player={x:p[0],y:p[1]};}
  renderer.center=state.scene==='town'?[player.x*.7,player.y+1.5]:[-10,-10];displayPartner();actors();update();
  addEventListener('pagehide',()=>save());document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});setInterval(()=>save(),5000);
})();
