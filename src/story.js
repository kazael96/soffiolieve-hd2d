/* Ordered opening events. Dialogs are summaries; environments come from IRBI. */
(() => {
  let storage;try{storage=localStorage;}catch{storage=null;}
  const state=StoryState.read(storage),preferences=JourneyState.read(storage).state;
  const outdoor={...ROM_SCENE,instances:[...ROM_SCENE.instances,...OPENING_ASSETS.scenes.north.instances],permissionGrids:[...ROM_SCENE.permissionGrids,...OPENING_ASSETS.scenes.north.permissionGrids]};
  let continuation=null,walking=0,lead=0,battleSlots=[],participants=new Set(),lastSave='';
  const phaseIndex=()=>StoryState.phases.indexOf(state.phase);
  function pack(m,xp=0){return {name:m.name,level:m.level,xp,hp:m.hp,status:m.status||'',pp:m.moves.map(m=>({id:m.id,left:m.left}))};}
  function unpack(p){const m=makeMon(p.name,p.level);if(p.hp!==null)m.hp=Math.min(m.max,p.hp);m.status=p.status;for(const move of m.moves){const old=p.pp.find(x=>x.id===move.id);if(old)move.left=Math.min(move.pp,old.left);}return m;}
  function displayPartner(){partner=state.party.length?unpack(state.party[lead]||state.party[0]):makeMon('Snivy',5);document.querySelector('.companion').hidden=!state.starter;refresh();}
  function update(){
    $('questSummary').textContent=$('storyObjective').textContent=StoryState.objectives[state.phase];
    $('storyBag').textContent=`Poké Ball: ${state.pokeballs} · Pozioni: ${potions}`+(phaseIndex()>=4?' · Interpoké':'')+(phaseIndex()>=6?' · Pokédex':'')+(phaseIndex()>=7?' · Mappa Città':'');
    $('world').dataset.chapter=state.phase;$('world').dataset.scene=state.scene;
    document.querySelector('.place').firstChild.textContent=state.scene==='town'?(player.y<-80?'ACCUMULA':player.y<-16?'PERCORSO 1':'SOFFIOLIEVE'):'SOFFIOLIEVE';
    $('openLab').disabled=!state.starter;
  }
  function save(force=false){
    if(battling)return;Object.assign(state,{player:{...player},facing,potions});const encoded=JSON.stringify(state);
    if(force||encoded!==lastSave){const ok=StoryState.write(storage,state);$('saveStatus').textContent=ok?'Viaggio salvato su questo dispositivo':'Salvataggio non disponibile su questo browser';if(ok)lastSave=encoded;}
    Object.assign(preferences,{zoom:renderer.zoom,cinema:renderer.cinema});JourneyState.write(storage,preferences);
  }
  function setScene(name,x,y){state.scene=name;renderer.scene=name==='town'?outdoor:OPENING_ASSETS.scenes[name];player={x,y};facing=3;resetInput();walking=0;cooldown=3;renderer.center=[name==='town'?x*.7:-10,name==='town'?y+1.5:-10];actors();update();save();}
  function say(speaker,text,done=null,title=speaker){
    resetInput();continuation=done;$('speakerName').textContent=speaker;$('dialogueTitle').textContent=title;$('dialogueText').textContent=text;
    const portrait=['Belle','Komor','Aralia','Mamma','Padre','Viandante'].includes(speaker);$('dialoguePortrait').hidden=!portrait;if(portrait){$('dialoguePortrait').src=`assets/${['Padre','Viandante'].includes(speaker)?'opening':'characters'}/${speaker}-3.png`;$('dialoguePortrait').alt=speaker;}
    $('dialogueBattle').hidden=true;$('starterChoices').hidden=true;$('dialogueContinue').hidden=false;$('dialogueContinue').textContent='Continua';$('dialogue').showModal();
  }
  function closeDialogue(){const next=continuation;continuation=null;$('dialogue').close();resetInput();if(next)next();}
  $('dialogueContinue').onclick=closeDialogue;
  $('dialogue').addEventListener('cancel',event=>{event.preventDefault();if(!$('dialogueContinue').hidden)closeDialogue();});
  function advance(expected){StoryState.advance(state,expected);actors();update();save(true);}
  function heal(){state.party=state.party.map(p=>pack(makeMon(p.name,p.level),p.xp));displayPartner();save();}
  function actors(){
    npcs.splice(0);const add=(name,x,y)=>npcs.push({name,x,y,frame:3});
    if(state.scene==='bedroom'&&state.phase==='gift')npcs.push({name:'Regalo',x:-10.5,y:-7.5,height:.5,frame:0,noninteractive:true});
    if(state.scene==='bedroom'&&phaseIndex()<3){add('Belle',-10.5,-8.5);add('Komor',-7.5,-13.5);}
    if(state.scene==='home')add('Mamma',-9.5,-9.5);
    if(state.scene==='bianca'){add('Belle',-10.5,-9.5);add('Padre',-7.5,-11.5);}
    if(state.scene==='lab'){add('Aralia',-10.5,-10);if(state.phase==='lab'){add('Belle',-12.5,-7);add('Komor',-8.5,-7);}}
    if(state.scene==='town'){
      if(state.phase==='map')add('Mamma',-6.5,-9);
      if(state.phase==='routeStart'){add('Belle',0,-14.5);add('Komor',2,-14.5);}
      if(state.phase==='tutorial')add('Aralia',1,-21);
      if(state.phase==='route'){add('Belle',6,-74);add('Komor',8,-76);if(!state.routePotion)add('Viandante',2.5,-39.5);}
    }
  }
  const doors={bedroom:[[-6.5,-13.5,'Scale','home',-12.5,-13.5]],home:[[-13.5,-13.5,'Camera di Alcide','bedroom',-7.5,-13.5],[-10.5,-5.5,'Esci di casa','town',-1.5,-2.5]],bianca:[[-10.5,-5.5,'Esci','town',-7.5,6.5]],lab:[[-12.5,-4.5,'Esci dal laboratorio','town',-6.5,-10.5]],town:[[-1.5,-3.5,'Casa tua','home',-10.5,-6.5],[-7.5,5.5,'Casa di Belle','bianca',-10.5,-6.5],[-6.5,-11.5,'Laboratorio di Aralia','lab',-12.5,-5.5]]};
  function targets(){
    const result=npcs.filter(n=>!n.noninteractive).map(n=>({...n,kind:'npc',label:n.name}));for(const [x,y,label,scene,tx,ty] of doors[state.scene])result.push({x,y,label,kind:'door',scene,tx,ty});
    if(state.scene==='bedroom'&&state.phase==='gift')result.unshift({x:-10.5,y:-7.5,label:'Regalo di Aralia',kind:'gift'});
    return result.filter(n=>Math.hypot(n.x-player.x,n.y-player.y)<2.1).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));
  }
  function hint(){const n=targets()[0];return n?'E · '+n.label:'';}
  function chooseStarter(){
    say('Regalo di Aralia','Nel pacco ci sono tre Pokémon. Belle e Komor ti lasciano scegliere per primo.',null,'Il tuo primo Pokémon');$('dialogueContinue').hidden=true;$('starterChoices').hidden=false;$('starterChoices').replaceChildren();
    for(const [name,id,type] of [['Snivy',495,'Erba'],['Tepig',498,'Fuoco'],['Oshawott',501,'Acqua']]){
      const button=document.createElement('button'),image=document.createElement('img');image.src=`assets/pokemon/${id}-front.png`;image.alt='';button.append(image,document.createTextNode(`${name} · ${type}`));
      button.onclick=()=>{if(!StoryState.choose(state,name))return;state.party=[pack(makeMon(name,5),OPENING_DATA[name].growth[5])];lead=0;displayPartner();$('dialogue').close();actors();update();save(true);say('Belle',`Io scelgo ${StoryState.rivalStarter(name,'Belle')}! Proviamo subito una lotta.`,()=>rivalBattle('Belle'));};$('starterChoices').append(button);
    }
  }
  function rivalBattle(name){rival=name;startBattle(true,{story:name,p1:configs(),p2:[{name:StoryState.rivalStarter(state.starter,name),level:5}]});}
  function talk(name){
    if(state.scene==='bedroom'){
      if(state.phase==='gift')return chooseStarter();
      if(state.phase==='belle')return say('Belle','Siamo pronti per la nostra prima lotta!',()=>rivalBattle('Belle'));
      if(state.phase==='komor')return say('Komor','Ho curato i Pokémon. Adesso proviamo noi due.',()=>{heal();rivalBattle('Komor');});
    }
    if(name==='Mamma'&&state.scene==='home'){heal();if(state.phase==='mother')return say('Mamma','La stanza è tutta in disordine! Ci penso io. I vostri Pokémon sono di nuovo in forma. Tieni questo Interpoké, così potremo sentirci durante il viaggio.',()=>advance('mother'));return say('Mamma','Riposatevi un po’. Potete sempre tornare a casa.');}
    if(state.scene==='bianca'&&state.phase==='biancaHouse')return say('Padre','Sei ancora troppo giovane per partire. Il mondo è grande e mi preoccupo per te.',()=>say('Belle','Voglio conoscere il mondo insieme al mio Pokémon. Ho deciso di partire. Ci vediamo al laboratorio di Aralia!',()=>advance('biancaHouse')),'La partenza di Belle');
    if(state.scene==='lab'&&state.phase==='lab')return say('Aralia','Voglio affidarvi un Pokédex. Registrate i Pokémon che incontrerete e scoprite Unima insieme ai vostri compagni.',()=>say('Aralia','Vi aspetterò sul Percorso 1 per mostrarvi come catturare un Pokémon.',()=>advance('lab')),'Il Pokédex');
    if(name==='Mamma'&&state.phase==='map')return say('Mamma','Questa Mappa Città vi aiuterà a orientarvi. Buon viaggio, tutti e tre!',()=>advance('map'),'La Mappa Città');
    if(state.phase==='routeStart')return say('Belle','Facciamo insieme il nostro primo passo sul Percorso 1!',()=>{advance('routeStart');setScene('town',3.5,-18);say('Komor','Aralia ci sta aspettando poco più avanti.');});
    if(name==='Aralia'&&state.phase==='tutorial')return say('Aralia','Per catturare un Pokémon selvatico, indeboliscilo e poi lancia una Poké Ball. Guarda il mio Minccino.',tutorial);
    if(name==='Viandante'&&state.phase==='route'&&!state.routePotion)return say('Viandante','Porta con te questa Pozione. Ti sarà utile quando il tuo Pokémon avrà perso PS.',()=>{state.routePotion=true;potions++;actors();update();save(true);},'Una Pozione per il viaggio');
    if(state.phase==='route'&&['Belle','Komor'].includes(name))return finishRoute();
    say(name,StoryState.objectives[state.phase]);
  }
  function interact(){
    const n=targets()[0];if(!n)return toast(StoryState.objectives[state.phase]);if(n.kind==='gift')return chooseStarter();if(n.kind==='npc')return talk(n.name);
    if(state.scene==='bedroom'&&phaseIndex()<3)return say('Komor','Prima scegliamo i Pokémon e proviamo le nostre prime lotte.');
    if(state.scene==='home'&&n.scene==='town'&&state.phase==='mother')return talk('Mamma');
    if(n.scene==='lab'&&phaseIndex()<5)return say('Komor','Passa prima da Belle a casa sua.');
    setScene(n.scene,n.tx,n.ty);if(state.scene==='bianca'&&state.phase==='biancaHouse')talk('Belle');if(state.scene==='lab'&&state.phase==='lab')talk('Aralia');
  }
  async function tutorial(){await startBattle(false,{story:'tutorial',p1:[{name:'Minccino',level:7}],p2:[{name:'Patrat',level:2}]});await playCatchingTutorial();}
  function finishRoute(){say('Belle',`Hai ${state.party.length} Pokémon! Io e Komor ne abbiamo due a testa. ${state.party.length>2?'Hai vinto la nostra piccola gara!':'È bello partire insieme.'}`,()=>say('Aralia','Vi aspetto davanti al Centro Pokémon di Accumula. Proseguite verso nord.',()=>{advance('route');setScene('town',player.x,-81);say('Accumula','Sei arrivato ad Accumula. La demo termina qui, prima degli eventi in città.',null,'Fine della demo');}),'Il confronto sul Percorso 1');}
  function configs(){battleSlots=state.party.map((p,i)=>i).filter(i=>state.party[i].hp!==0);if(battleSlots.includes(lead))battleSlots=[lead,...battleSlots.filter(i=>i!==lead)];participants=new Set([battleSlots[0]]);return battleSlots.map(i=>{const m=unpack(state.party[i]);return {name:m.name,level:m.level,hp:m.hp,status:m.status,pp:m.moves};});}
  function attachBattle(s,kind){if(kind!=='tutorial')for(let i=0;i<s.battle.p1.pokemon.length;i++)s.battle.p1.pokemon[i].storyId=battleSlots[i];}
  function recordParticipant(s){const id=s.active().storyId;if(id!==undefined)participants.add(id);}
  function gainXP(s,kind){
    const foe=s.active('p2'),receivers=[...participants].filter(i=>state.party[i]?.hp>0);
    for(const id of receivers){const p=state.party[id],data=OPENING_DATA[p.name],base=OPENING_DATA[foe.species.name]?.yield||0;
      const power=v=>Math.floor(Math.round(Math.sqrt(v)*4096)/4096*v*v);
      const xp=Math.floor(Math.floor(Math.floor(base*foe.level/5)*(kind==='wild'?1:1.5))/Math.max(1,receivers.length)*power(2*foe.level+10)/power(foe.level+p.level+10))+1;
      p.xp+=xp;const old=unpack(p);while(p.level<100&&p.xp>=data.growth[p.level+1])p.level++;
      if(p.level!==old.level){const next=makeMon(p.name,p.level);p.hp=Math.min(next.max,old.hp+next.max-old.max);p.pp=next.moves.map(m=>({id:m.id,left:old.moves.find(x=>x.id===m.id)?.left??m.pp}));toast(`${p.name} raggiunge il livello ${p.level}!`);}
    }
  }
  function afterBattle(s,kind,captured,escaped){
    if(kind==='tutorial'){if(state.phase!=='tutorial')return;displayPartner();advance('tutorial');state.pokeballs=5;say('Aralia','Ecco cinque Poké Ball. Ora provate voi!',()=>say('Belle','Facciamo una gara: vediamo chi arriva ad Accumula con più Pokémon!'));save(true);return;}
    for(const m of s.battle.p1.pokemon){const id=m.storyId;if(id!==undefined)state.party[id]={...state.party[id],hp:m.hp,status:m.status,pp:m.moveSlots.map(move=>({id:GEN5.byMoveKey[move.id]?.id||0,left:move.pp}))};}
    if(captured)state.party.push(pack(captured,OPENING_DATA[captured.name].growth[captured.level]));else if(!escaped&&s.battle.winner==='Alcide')gainXP(s,kind);
    lead=Math.max(0,state.party.findIndex(p=>p.hp>0));displayPartner();
    if(kind==='Belle'){advance('belle');heal();say('Komor','Che disordine! Prima curo i Pokémon, poi sarà il mio turno.');}
    else if(kind==='Komor'){advance('komor');say('Belle','Scendiamo a chiedere scusa a tua mamma per il disordine.');}
    else if(state.party.every(p=>p.hp===0)){heal();setScene('home',-10.5,-7);say('Mamma','I tuoi Pokémon avevano bisogno di riposo. Ora stanno bene.');}
    actors();update();save(true);
  }
  function step(dt,moved){
    if(battling||menuOpen())return;update();if(state.scene!=='town')return;
    if(phaseIndex()<8&&player.y<-15){player.y=-15;if(state.phase==='routeStart')talk('Belle');else toast(StoryState.objectives[state.phase]);return;}
    if(state.phase==='tutorial'&&player.y<-23){player.y=-23;talk('Aralia');return;}
    if(state.phase==='route'&&player.y<-78){finishRoute();return;}
    if(state.phase==='arrival'){player.y=Math.max(-83,player.y);return;}
    if(state.phase==='route'&&moved&&cooldown===0){
      const g=outdoor.permissionGrids.find(g=>player.x>=g.x-16&&player.x<g.x+16&&player.y>=g.z-16&&player.y<g.z+16),tile=g?8+(Math.floor(player.y-g.z)+16)*256+(Math.floor(player.x-g.x)+16)*8:0;
      // ROM terrain class 4 is encounter grass; class 3 is ordinary grass.
      if(g&&g.bytes[tile]===4){walking+=dt*(keys.Shift?6.5:3.5);if(walking>=1){walking%=1;if(Math.random()<.08){let roll=Math.random()*100;const encounter=OPENING_ENCOUNTERS.find(slot=>(roll-=slot.weight)<0)||OPENING_ENCOUNTERS.at(-1);startBattle(false,{story:'wild',p1:configs(),p2:[{name:encounter.name,level:encounter.level}]});}}}else walking=0;
    }
  }
  function openJournal(){if(battling||menuOpen())return;resetInput();update();save();$('journal').showModal();}
  function openTeam(){if(battling||menuOpen()||!state.starter)return;resetInput();$('partyList').replaceChildren();state.party.forEach((p,i)=>{const b=document.createElement('button');b.textContent=`${p.name} · Lv. ${p.level} · ${p.hp}/${makeMon(p.name,p.level).max} PS${i===lead?' · In testa':''}`;b.disabled=p.hp===0;b.onclick=()=>{lead=i;displayPartner();$('partyDialog').close();};$('partyList').append(b);});$('partyDialog').showModal();}
  $('openJournal').onclick=openJournal;$('closeJournal').onclick=()=>$('journal').close();$('saveNow').onclick=()=>save(true);
  $('touchPreference').checked=preferences.touch;$('focusPreference').checked=!preferences.cinema;renderer.zoom=preferences.zoom;renderer.cinema=preferences.cinema;$('zoomValue').value=Math.round(renderer.zoom*100)+'%';document.body.classList.toggle('touch-enabled',preferences.touch);
  $('touchPreference').onchange=()=>{preferences.touch=$('touchPreference').checked;document.body.classList.toggle('touch-enabled',preferences.touch);resetInput();save(true);};$('focusPreference').onchange=()=>{renderer.cinema=!$('focusPreference').checked;save(true);};
  $('resetJourney').onclick=()=>{$('resetConfirmation').hidden=false;$('cancelReset').focus();};$('cancelReset').onclick=()=>{$('resetConfirmation').hidden=true;};
  $('confirmReset').onclick=()=>{Object.assign(state,StoryState.fresh());lead=0;potions=0;displayPartner();setScene('bedroom',-10.5,-10.5);$('resetConfirmation').hidden=true;$('journal').close();save(true);};
  for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',resetInput);
  window.Journey={state,outdoor,save,heal,openJournal,openTeam,talk,interact,hint,step,configs,attachBattle,recordParticipant,afterBattle,pack};
  potions=state.potions;renderer.scene=state.scene==='town'?outdoor:OPENING_ASSETS.scenes[state.scene];player={...state.player};facing=state.facing;
  if(blocked(player.x-.18,player.y-.18)||blocked(player.x+.18,player.y+.18)){const p={bedroom:[-10.5,-10.5],home:[-10.5,-6.5],bianca:[-10.5,-6.5],lab:[-12.5,-5.5],town:[-2,0]}[state.scene];player={x:p[0],y:p[1]};}
  renderer.center=state.scene==='town'?[player.x*.7,player.y+1.5]:[-10,-10];displayPartner();actors();update();
  addEventListener('pagehide',()=>save());document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});setInterval(()=>save(),5000);
})();
