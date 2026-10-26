/* IRBI field-event host. Narrative and movement programs are extracted, not rewritten. */
(() => {
  const journey=window.Journey,state=journey.state;
  const sceneZones={bedroom:391,home:390,bianca:392,biancaRoom:393,komorHome:394,komorRoom:395,lab:396,town:389};
  const zoneScenes=Object.fromEntries(Object.entries(sceneZones).map(([k,v])=>[v,k]));zoneScenes[317]='town';
  const native=state.original||(state.original={vars:{},flags:[],zone:sceneZones[state.scene],intro:false});
  const fieldModels=window.FIELD_MODEL_ASSETS?new FieldModels.Controller(renderer,FIELD_MODEL_ASSETS,id=>AudioEngine.playSound(id)):null;
  const names={7:'Komor',134:'Belle',105:'Aralia',147:'Mamma',24:'Padre',208:'Regalo',18:'Viandante'};
  const frames=[0,3,6,9],directions=[[0,-1],[0,1],[-1,0],[1,0]];
  let motions=[],pendingBattle=null,currentActor=null,pendingMessage=null,sceneChanging=false,failed=null,ambientTime=0,settleWaiters=[];
  let eventRunning=false,queued=null,pendingCancel=null,cameraTask=null,fadeTask=Promise.resolve(),soundTask=Promise.resolve(),lastTile='',warpCooldown=0;
  const vm=new FieldEventVM(ORIGINAL_EVENTS,native,{
    playerName:()=>state.playerName||'Alcide',speciesName:id=>GEN5.species.find(s=>s.id===id)?.en||String(id),party:i=>state.party[i],command
  });
  const data=()=>ORIGINAL_EVENTS.zones[native.zone];
  const origin=()=>native.zone===389||native.zone===317?[784,752]:[16,16];
  const world=(x,z)=>({x:x+.5-origin()[0],y:z+.5-origin()[1]});
  const grid=()=>({x:Math.floor(player.x+origin()[0]),z:Math.floor(player.y+origin()[1])});
  const has=flag=>native.flags.includes(flag),value=id=>vm.value(id);
  const actor=id=>id===255?player:npcs.find(n=>n.uid===id);
  function pose(n,dir,step=0){
    n.direction=dir;const count=OPENING_SPRITES[n.name]?.length||ROM_SPRITES[n.name]?.length;
    if(count===1){n.frame=0;n.flip=false;}
    else if(count===7){n.frame=[0,2,4,4][dir]+(step===1?1:step===2?(dir<2?1:2):0);n.flip=dir===3||(dir<2&&step===2);}
    else {n.frame=frames[dir]+step;n.flip=false;}
  }
  function face(id,dir){const n=actor(id);if(!n)return;if(id===255)facing=frames[dir];else pose(n,dir);}
  function putActor(record){
    const n={...world(record.x,record.z),uid:record.id,model:record.model,name:names[record.model]||'Original'+record.model,script:record.script,direction:record.direction,frame:frames[record.direction],height:record.model===208?.5:0};
    n.wander=NpcWalk.create(record,{x:n.x,y:n.y});pose(n,record.direction);npcs.push(n);return n;
  }
  function syncActors(){
    npcs.splice(0);for(const n of data().actors){
      if(n.flag&&has(n.flag))continue;if(native.zone===317&&n.x<773)continue;
      // Post-game actors use initial hidden flags from the new-game state.
      if([736,681,682,683,684,685,656,675,817,1230,1143].includes(n.flag))continue;
      putActor(n);
    }
    const saved=native.actors?.[native.zone]||[];
    for(const n of npcs){const previous=saved.find(p=>p.uid===n.uid),record=data().actors.find(p=>p.id===n.uid);if(previous&&(!record.flag||!(native.actorFlags?.[native.zone]||[]).includes(record.flag)))Object.assign(n,structuredClone(previous));}

    if(native.zone===389){
      if(value(16511)===1){const n=actor(3);if(n)Object.assign(n,world(781,751));}
      if(value(16512)===2){putActor({id:250,model:7,script:2000,x:787,z:736,direction:0});putActor({id:240,model:134,script:2000,x:789,z:736,direction:1});}
    }
  }
  function derivePhase(){
    state.phase=native.arrived?'arrival':value(16508)>=1?'route':value(16512)===3?'tutorial':value(16512)===2?'routeStart':value(16505)===1?'map':value(16504)===1?'lab':value(16517)===1?'biancaHouse':value(16513)===2?'mother':state.starter?'belle':'gift';
    journey.update();
  }
  function initialize(){
    if(native.initialized)return;
    native.flags=[501,679];native.zone=391;native.initialized=true;
    player=world(5,6);facing=3;
  }
  function captureActors(){native.actors??={};native.actorFlags??={};native.actorFlags[native.zone]=[...native.flags];native.actors[native.zone]=structuredClone(npcs);}
  function delay(frames){return new Promise(resolve=>setTimeout(resolve,Math.max(0,frames)*1000/30));}
  function applyRoom(){if(state.scene==='bedroom')renderer.scene=OPENING_ASSETS.scenes[native.roomMess?'bedroomMess':'bedroom'];}
  function cameraTo(target,frames){
    const start=[...(renderer.storyCamera||renderer.center)];
    let resolve;const promise=new Promise(r=>resolve=r);cameraTask={start,target,elapsed:0,duration:frames/30,promise,resolve};
  }
  function fade(to,frames=8,color='#000'){
    let cover=$('fieldFade');if(!cover){cover=document.createElement('div');cover.id='fieldFade';cover.style.cssText='position:fixed;inset:0;z-index:80;pointer-events:none;opacity:0';document.body.append(cover);}
    cover.style.background=color;cover.style.transition=`opacity ${frames/30}s linear`;cover.style.opacity=String(to);fadeTask=delay(frames);return fadeTask;
  }
  function showPage(text,speaker=''){
    const d=$('dialogue');$('speakerName').textContent=speaker;$('dialogueTitle').textContent='';$('dialogueText').textContent=text;
    $('dialoguePortrait').hidden=true;$('dialogueBattle').hidden=true;$('starterChoices').hidden=true;$('dialogueContinue').hidden=false;
    const printing=window.NativeSettings?.message($('dialogueText'),text);
    $('dialogueContinue').textContent='▼';if(!d.open)d.showModal();resetInput();
    return new Promise(resolve=>{pendingMessage=()=>{if(printing&&!printing.done){printing.finish();return;}printing?.cancel();pendingMessage=null;d.close();resolve();};$('dialogueContinue').onclick=pendingMessage;});
  }
  async function message(bank,index,machine=vm){
    const text=ORIGINAL_EVENTS.texts[bank]?.[index];if(text===undefined)throw Error(`Missing original message ${bank}:${index}`);
    $('dialogue').dataset.source=bank+':'+index;
    for(const page of messagePages(text,machine.words))await showPage(page);
  }
  async function choice(labels){
    const d=$('dialogue'),box=$('starterChoices');resetInput();$('dialogueContinue').hidden=true;box.hidden=false;box.replaceChildren();if(!d.open)d.showModal();
    return new Promise(resolve=>{
      let selected=0,finished=false;const buttons=[];
      const finish=i=>{if(finished)return;finished=true;pendingCancel=null;box.onkeydown=null;d.close();resetInput();resolve(i);};
      pendingCancel=()=>{const cancel=labels.findLastIndex(s=>/^(NO|Annulla)$/i.test(s));if(cancel>=0)finish(cancel);};
      labels.forEach((label,i)=>{const b=document.createElement('button');b.textContent=label;b.type='button';if(['Snivy','Tepig','Oshawott'].includes(label)){const image=document.createElement('img');image.src='assets/pokemon/'+{Snivy:495,Tepig:498,Oshawott:501}[label]+'-front.png';image.alt='';b.append(image);}b.onclick=()=>finish(i);buttons.push(b);box.append(b);});
      box.onkeydown=e=>{
        if(e.ctrlKey||e.altKey||e.metaKey)return;
        const current=buttons.indexOf(e.target);if(current>=0)selected=current;
        if(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Enter',' ','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();}
        if(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)){selected=(selected+(['ArrowUp','ArrowLeft'].includes(e.key)?buttons.length-1:1))%buttons.length;buttons[selected].focus();void AudioEngine.playSound(1352);}
        else if(e.key==='Enter'||e.key===' ')finish(selected);
        else if(e.key==='Escape'){const cancel=labels.findLastIndex(s=>/^(NO|Annulla)$/i.test(s));if(cancel>=0)finish(cancel);}
      };
      buttons[0]?.focus();
    });
  }
  async function chooseStarter(){
    resetInput();
    const selected=await StarterSelection.choose({text:(index,name)=>{
      const words={...vm.words};if(name)words[1]=name;
      return messagePages(ORIGINAL_EVENTS.texts[430][index],words).join('\n');
    }});
    if(!Number.isInteger(selected)||selected<0||selected>2)throw Error('Invalid original starter selection');
    vm.words[1]=['Snivy','Tepig','Oshawott'][selected];return selected;
  }
  async function nickname(index=0){
    const pokemon=state.party[index];if(!pokemon)throw Error('Pokémon da rinominare non disponibile');
    if(window.NativeNaming){const result=await NativeNaming.open(pokemon);if(result===null)return 0;pokemon.nickname=result;journey.displayPartner();return 1;}
    const box=$('starterChoices'),input=document.createElement('input'),ok=document.createElement('button'),cancel=document.createElement('button'),d=$('dialogue');
    input.maxLength=10;input.value=pokemon.nickname||'';input.setAttribute('aria-label','Soprannome del Pokémon');ok.textContent='Conferma';cancel.textContent='Annulla';ok.type=cancel.type='button';
    box.replaceChildren(input,ok,cancel);box.hidden=false;$('dialogueContinue').hidden=true;$('dialogueText').textContent=messagePages(POKEDEX_ASSETS.labels.namePrompt,[pokemon.nickname||pokemon.name]).join('\n');d.showModal();input.focus();
    return new Promise(resolve=>{
      const finish=result=>{pendingCancel=null;box.onkeydown=null;d.close();resetInput();resolve(result);};pendingCancel=()=>finish(0);
      ok.onclick=()=>{const result=input.value.trim(),changed=!!result&&result!==(pokemon.nickname||pokemon.name);if(changed){pokemon.nickname=result;journey.displayPartner();}finish(changed?1:0);};cancel.onclick=()=>finish(0);
      box.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cancel.onclick();}else if(e.key==='Enter'&&e.target===input){e.preventDefault();e.stopPropagation();ok.onclick();}};
    });
  }
  function move(id,sequence){
    if(!actor(id))throw Error('Missing original actor '+id);
    const task={id,sequence:sequence.filter(a=>a[0]!==254).map(a=>[...a]),index:0,count:0,elapsed:0,resolve:null};
    task.promise=new Promise(resolve=>task.resolve=resolve);motions.push(task);
  }
  function tickMotions(dt){
    for(const task of [...motions]){
      const n=actor(task.id);if(!n){task.resolve();motions=motions.filter(t=>t!==task);continue;}
      const item=task.sequence[task.index];if(!item){task.resolve();motions=motions.filter(t=>t!==task);continue;}
      const [code,repeats]=item;let dir=null,distance=0,duration=0;
      if(code>=0&&code<=3){dir=code;duration=1/30;}
      else if(code>=8&&code<=11){dir=code-8;distance=1;duration=16/30;}
      else if(code>=12&&code<=15){dir=code-12;distance=1;duration=8/30;}
      else if(code>=16&&code<=19){dir=code-16;distance=1;duration=4/30;}
      else if(code>=32&&code<=35){dir=code-32;duration=8/30;}
      else if(code>=76&&code<=79){dir=code-76;distance=1;duration=6/30;}
      else if(code===61){duration=2/30;}
      else if(code===63){duration=8/30;}
      else if(code===69){duration=1/30;n.hidden=true;}
      else if(code===75||code===159){duration=16/30;n.emote=code===75?'!':'?';}
      else if(code===181||code===100){
        const gesture=OPENING_GESTURES[n.name];if(!gesture)throw Error('Missing original gesture for '+n.name);
        duration=gesture.steps.reduce((sum,step)=>sum+step[1],0)/30;
        let elapsed=task.elapsed*30;n.flip=false;
        for(const [frame,hold] of gesture.steps){n.frame=frame;if(elapsed<hold)break;elapsed-=hold;}
      }
      else if(code===62){duration=4/30;}
      else if(code===71||code===72){duration=1/30;}
      else throw Error('Unsupported original movement '+code);
      if(!task.start){task.start={x:n.x,y:n.y};if(dir!==null)face(task.id,dir);}
      task.elapsed+=dt;let f=Math.min(1,task.elapsed/duration);if(code>=76&&code<=79){const at=Math.min(5,Math.floor(f*6)),part=f*6-at,points=[0,2,5,8,10,13,16];f=(points[at]+part*(points[at+1]-points[at]))/16;}
      if(distance){const [dx,dy]=directions[dir];n.x=task.start.x+dx*f*distance;n.y=task.start.y+dy*f*distance;if(task.id===255)moving=true;else pose(n,dir,[1,0,2,0][Math.floor(task.elapsed*30/(duration*30/2))%4]);}
      if(task.elapsed>=duration){if(task.id!==255){pose(n,n.direction);n.emote=null;}task.elapsed=0;task.start=null;if(++task.count>=Math.max(1,repeats)){task.index++;task.count=0;}}
    }
  }
  function ambientMoving(){return npcs.some(n=>n.wander?.phase===4);}
  function settleAmbient(){return ambientMoving()?new Promise(resolve=>settleWaiters.push(resolve)):Promise.resolve();}
  function tickAmbient(dt,start){
    ambientTime+=dt;
    while(ambientTime>=1/30){ambientTime-=1/30;
      for(const n of npcs)NpcWalk.update(n,{start,pose,blocked:(who,p)=>blocked(p.x,p.y)||Math.abs(player.x-p.x)<.75&&Math.abs(player.y-p.y)<.75||npcs.some(other=>other!==who&&NpcWalk.occupies(other,p.x,p.y))});
    }
    if(!ambientMoving()&&settleWaiters.length){const waiting=settleWaiters;settleWaiters=[];waiting.forEach(done=>done());}
  }
  async function run(entry,bank=data().script){
    if(eventRunning||failed)return;eventRunning=true;resetInput();await settleAmbient();captureActors();journey.save(true);
    const before=structuredClone(state);
    try{
      await vm.run(bank,entry);native.intro=true;
      if(bank===778&&entry===13&&queued===1){
        queued=null;const friends=npcs.filter(n=>n.uid===250||n.uid===240);native.zone=317;native.music=data().music;AudioEngine.setScene(native.music);delete native.actors?.[317];
        syncActors();npcs.push(...friends);await vm.run(634,0);
      }
      if(bank===778&&native.zone===396&&value(16505)===0)await vm.run(792,0);
      derivePhase();captureActors();eventRunning=false;journey.save(true);
    }catch(error){
      failed=error;console.error(error);$('world').dataset.eventError=error.message;
      // Keep the last complete scene on disk. A reload retries the interrupted event.
      state.checkpoint=before;await showPage('La scena originale non può proseguire: '+error.message);
    }finally{eventRunning=false;
    }
  }
  async function command(c,a,v,m){
    const textBank=m.bank===862?283:ORIGINAL_EVENTS.zones[Object.keys(ORIGINAL_EVENTS.zones).find(z=>ORIGINAL_EVENTS.zones[z].script===m.bank)]?.text;
    switch(c.name){
      case 'ActorPauseAll':case 'ActorUnlockAll':case 'RTFinishSubEvents':case 'FieldClose':case 'FieldOpen':case 'InputWaitLast':case 'MsgWaitAdvance':case 'MsgActorClose':case 'MsgSystemClose':case 'MsgWinCloseAll':case 'MsgWinCloseNo':case 'MsgPlaceSignClose':break;
      case 'MsgActor':case 'MsgActorEx':case 'MsgActorVersioned':await message(a[0]===1024?textBank:v[0],v[1],m);break;
      case 'MsgActorGendered':await message(a[0]===1024?textBank:v[0],v[1],m);break;
      case 'MsgInfo':case 'MsgSystem':case 'MsgPlaceSign':await message(textBank,v[0],m);break;
      case 'YesNoWin':m.set(a[0],await choice(['SÌ','NO']));break;
      case 'CallPoke3Select':m.set(a[0],await chooseStarter());break;
      case 'CallPokeNameInput':m.set(a[0],await nickname(v[1]));break;
      case 'PokePartyGetParam':m.set(a[0],state.party[v[1]].nickname?1:0);break;
      case 'PokePartyAdd':{const name=m.host.speciesName(v[1]);state.starter=name;state.party=[journey.record(newStoryMon(name,v[3]),OPENING_DATA[name].growth[v[3]])];StoryState.register(state,name,true);journey.displayPartner();m.set(a[0],1);break;}
      case 'PokePartyRecoverAll':journey.heal();break;
      case 'PokePartyIsFullHP':m.set(a[0],state.party[v[1]].hp===journey.unpack(state.party[v[1]]).max?1:0);break;
      case 'PokePartyIsFullPP':m.set(a[0],journey.unpack(state.party[v[1]]).moves.every(move=>move.left===move.pp)?1:0);break;
      case 'PokePartyGetCount':m.set(a[0],state.party.length);break;
      case 'TrainerCardGetSex':m.set(a[0],0);break;
      case 'ActorCmdExec':move(v[0],ORIGINAL_EVENTS.scripts[m.bank].movements[a[1]]);break;
      case 'ActorCmdWait':await Promise.all(motions.map(t=>t.promise));break;
      case 'ActorSetGPos':{const n=actor(v[0]);if(n)Object.assign(n,world(v[1],v[3]));face(v[0],v[4]);break;}
      case 'ActorSetEyeToEye':{const n=actor(currentActor);if(n){const dx=player.x-n.x,dy=player.y-n.y;face(currentActor,Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0);}break;}
      case 'ActorAdd':{const record=data().actors.find(n=>n.id===v[0]);if(record&&!actor(v[0]))putActor(record);break;}
      case 'ActorDelete':{const index=npcs.findIndex(n=>n.uid===v[0]);if(index>=0)npcs.splice(index,1);break;}
      case 'ActorNew':if(!actor(v[3]))putActor({id:v[3],model:v[4],x:v[0],z:v[1],direction:v[2],script:2000});break;
      case 'PlayerGetGPos':m.set(a[0],grid().x);m.set(a[1],grid().z);break;
      case 'PlayerGetDir':m.set(a[0],frames.indexOf(facing));break;
      case 'VMSleep':await new Promise(resolve=>setTimeout(resolve,v[0]*1000/30));break;
      case 'CallTrainerBattle':{
        const trainer=OPENING_TRAINERS[v[0]];if(!trainer)throw Error('Trainer outside opening '+v[0]);
        const kind=trainer.name;state.phase=kind==='Belle'?'belle':'komor';rival=kind;journey.update();
        const completed=new Promise(resolve=>pendingBattle=resolve);
        try{await startBattle(true,{story:kind,trainerId:v[0],noBlackout:!!(v[2]&1),aiFlags:trainer.aiFlags,p1:journey.configs(),p2:structuredClone(trainer.party)});await completed;}finally{pendingBattle=null;}break;
      }
      case 'TrainerBattleIsVictory':m.set(a[0],native.won?1:0);break;
      case 'CallTrainerBattleEnd':break;
      case 'CallCaptureDemo':{
        const completed=new Promise(resolve=>pendingBattle=resolve);
        try{await startBattle(false,{story:'tutorial',p1:[{...newStoryMon('Minccino',7),...ORIGINAL_EVENTS.captureTutorial.player}],p2:[{...newStoryMon('Patrat',2),...ORIGINAL_EVENTS.captureTutorial.enemy}]});await playCatchingTutorial();await completed;}finally{pendingBattle=null;}break;
      }
      case 'RTReserveScript':queued=v[0];break;
      case 'RTGetTextFile':m.set(a[0],textBank);break;
      case 'RTCallGlobal':{
        if(![2800,2805].includes(v[0]))throw Error('Global script outside opening '+v[0]);
        const child=new FieldEventVM(ORIGINAL_EVENTS,native,m.host);child.words=m.words;await child.run(862,v[0]-2800);break;
      }
      case 'ItemCheckSpace':m.set(a[2],1);break;
      case 'ItemAdd':{
        const item=v[0],count=v[1];if(item===4)state.pokeballs+=count;else if(item===17)potions+=count;
        else if(item===442)native.map=true;else if([621,626].includes(item))native.phone=true;else throw Error('Item outside opening '+item);
        m.set(a[2],1);journey.update();break;
      }
      case 'ItemGetPocket':m.set(a[1],[442,621,626].includes(v[0])?4:v[0]===17?1:0);break;
      case 'WordSetItemName':case 'WordSetItemNameWithArticle':case 'WordSetItemNameEx':{
        const item=ORIGINAL_EVENTS.itemNames[v[1]];if(!item)throw Error('Item name '+v[1]);
        const plural=c.name==='WordSetItemNameEx'&&v[2]>1,article=c.name==='WordSetItemNameWithArticle'||c.name==='WordSetItemNameEx'&&v[3];
        m.words[a[0]]=plural?(v[1]===17?'Pozioni':item):article?(v[1]===621||v[1]===626?"un ":'una ')+item:item;break;
      }
      case 'WordSetItemPocketName':m.words[a[0]]=ORIGINAL_EVENTS.pocketNames[v[1]];if(m.words[a[0]]===undefined)throw Error('Item pocket '+v[1]);break;
      case 'Random':m.set(a[0],Math.floor(Math.random()*v[1]));break;
      case 'MapChangeWarp':await changeZone(v[0],v[1],v[2]);break;
      case 'MapReplaceSetEvent':native.roomMess=true;applyRoom();break;
      case 'MapReplaceIsEventSet':m.set(a[1],native.roomMess?1:0);break;
      case 'EVCameraInit':renderer.storyCamera=[...renderer.center];break;
      case 'EVCameraEnd':case 'EVCameraRebind':renderer.storyCamera=null;break;
      case 'EVCameraUnbind':renderer.storyCamera??=[...renderer.center];break;
      case 'EVCameraMoveTo':cameraTo([v[3]/65536-origin()[0],v[5]/65536-origin()[1]],v[6]);break;
      case 'EVCameraMoveToDefault':case 'EVCameraReturn':cameraTo(state.scene==='town'?[player.x*.7,player.y+1.5]:[-10,-10],v[0]);break;
      case 'EVCameraWait':if(cameraTask)await cameraTask.promise;break;
      case 'FadeEx':fade(v[1]===0?1:0,v[3]*8,v[0]===3?'#fff':'#000');break;
      case 'FadeExWait':case 'CallLeagueLiftWarp':await fadeTask;break;
      case 'CMD_1ad':case 'CMD_1af':fade(0);break;
      case 'CMD_1ae':fade(1);break;
      case 'BGMPlay':native.music=v[0];AudioEngine.setScene(v[0]);break;
      case 'BGMChangeMap':native.music=data().music;AudioEngine.setScene(native.music);break;
      case 'SEPlay':case 'MEPlay':soundTask=AudioEngine.playSound(v[0]);break;
      case 'SEWait':case 'MEWait':await soundTask;break;
      case 'PVPlay':soundTask=AudioEngine.cry(v[0]);break;
      case 'PVWait':await soundTask;break;
      case 'BMCreateHandleByGPos':{const [ox,oz]=origin();m.set(a[0],fieldModels?fieldModels.create(v[1],v[2]-ox,v[3]-oz):v[1]);native.door={x:v[2],z:v[3],type:v[1],open:false};break;}
      case 'BMHndAudioVisualAnmPlay':native.door.open=v[1]===0;if(fieldModels)await fieldModels.play(v[0],v[1]);break;
      case 'BMHndAnmWait':if(fieldModels)await fieldModels.wait(v[0]);else await delay(8);break;
      case 'BMReleaseHandle':fieldModels?.release(v[0]);native.door=null;break;
      case 'PlayFieldEffect':native.fieldEffect=v[0];if(window.FieldEffects)await FieldEffects.play(v[0]);break;
      case 'ActivateRelocator':native.pokedex=true;break;
      case 'UnknownBW021C':native.starterRecord=v[1];break;
      case 'UnknownBW024E':native.belleDeparture=true;break;
      case 'UnknownBW024F':native.belleDeparture=true;break;
      case 'UnknownBW0250':native.belleDeparture=false;break;
      case 'UnknownBW0252':native.sharedStep=true;break;
      case 'UnknownBW025F':native.routeEntryComplete=true;break;
      case 'UnknownBW0240':native.itemEffect=v[0];break;
      case 'func_ov036_021a6ec4':native.followActor=v[0];break;
      case 'func_ov036_021a7340':native.storyEffect=v;break;
      case 'CallWildBattleEnd':await fade(0,8);break;
      case 'CallXTransceiver':await phoneCall(v[0],m);break;
      default:return false;
    }
    return true;
  }
  async function phoneCall(id,m){
    if(id!==1)throw Error('Call outside opening '+id);
    const names=['Alcide','Komor','Belle','Aralia','Mamma'],panel=document.createElement('section');panel.id='phoneScene';panel.setAttribute('aria-label','Interpoké');
    const pictures=PHONE_ASSETS.participants.map(person=>{
      const name=names[person],tile=document.createElement('figure'),image=document.createElement('img'),label=document.createElement('figcaption');
      image.src=PHONE_ASSETS.portraits[name][0];image.alt=name;label.textContent=name;tile.append(image,label);panel.append(tile);return {name,tile,image};
    });
    document.body.append(panel);$('world').dataset.phone='1';await fade(0);
    let talker=-1,frame=0;const clock=setInterval(()=>{frame++;pictures.forEach((p,i)=>{const blink=frame%28===26?1:frame%28===27?2:0;const mouth=i===talker?[0,1,2,1][frame%4]:0;p.image.src=PHONE_ASSETS.portraits[p.name][blink*3+mouth];p.tile.classList.toggle('speaking',i===talker);});},1000/15);
    try{
      for(const [op,face,param] of PHONE_ASSETS.commands){
        if(op===0)break;
        if(op===1){talker=face;for(const page of messagePages(ORIGINAL_EVENTS.phoneTexts[param],m.words))await showPage(page,pictures[face].name);}
        else if(op===2)await delay(param);else if(op===3)soundTask=AudioEngine.playSound(param);else if(op===4)await soundTask;else throw Error('Unknown phone command '+op);
      }
    }finally{clearInterval(clock);panel.remove();delete $('world').dataset.phone;}
  }
  async function changeZone(zone,x,z){
    if(!zoneScenes[zone])throw Error('Zone outside opening '+zone);
    fieldModels?.clear();
    captureActors();native.zone=zone;native.music=data().music;AudioEngine.setScene(native.music);const p=world(x,z);journey.setScene(zoneScenes[zone],p.x,p.y);syncActors();warpCooldown=.8;lastTile='';applyRoom();
    for(const init of data().init||[]){const loader=new FieldEventVM(ORIGINAL_EVENTS,native,vm.host);await loader.run(data().script,init.entry);}
    captureActors();
  }
  const warpDirections={1:1,2:0,3:3,4:2};
  async function enterWarp(w){
    sceneChanging=true;resetInput();
    try{
      const dest=ORIGINAL_EVENTS.zones[w.zone],dw=dest.warps[w.warp],out=warpDirections[dw.a],inward=out^1;
      await settleAmbient();
      const [ox,oz]=origin(),sourceX=w.x/16-ox,sourceZ=w.z/16-oz;
      if(fieldModels?.find(1,sourceX,sourceZ)){
        const handle=fieldModels.create(1,sourceX,sourceZ);await fieldModels.play(handle,0);
        // IRBI pre-warp starts passage alongside opening; no additional door wait.
        move(255,[[8+warpDirections[w.a],1]]);await Promise.all(motions.filter(t=>t.id===255).map(t=>t.promise));
      }
      await fade(1,8);await changeZone(w.zone,Math.floor(dw.x/16),Math.floor(dw.z/16));face(255,inward);
      const [dx,dz]=origin(),doorX=dw.x/16-dx,doorZ=dw.z/16-dz;
      const door=fieldModels?.find(1,doorX,doorZ)?fieldModels.create(1,doorX,doorZ):null;
      if(door!==null){await fieldModels.play(door,0);await fieldModels.wait(door);}
      move(255,[[8+inward,1]]);await fade(0,8);await Promise.all(motions.filter(t=>t.id===255).map(t=>t.promise));
      if(door!==null){await fieldModels.play(door,1);await fieldModels.wait(door);fieldModels.release(door);}
      sceneChanging=false;warpCooldown=.8;
      const next=data().onEnter?.find(e=>value(e.var)===e.value);
      if(next&&ORIGINAL_EVENTS.scripts[data().script].supportedEntries.includes(next.entry))await run(next.entry);
      else journey.save(true);
    }catch(error){sceneChanging=false;failed=error;$('world').dataset.eventError=error.message;console.error(error);await showPage(error.message);}
  }
  function tryWarp(dx,dz,x,z){
    if(eventRunning||sceneChanging||journey.processing||warpCooldown||failed)return false;
    const dir=Math.abs(dx)>Math.abs(dz)?dx>0?3:2:dz>0?1:0,[ux,uz]=directions[dir];
    for(const w of data().warps){
      if(warpDirections[w.a]!==dir||!ORIGINAL_EVENTS.zones[w.zone])continue;
      const cx=w.x/16-origin()[0],cz=w.z/16-origin()[1];
      const before=(player.x-cx)*ux+(player.y-cz)*uz,after=(x-cx)*ux+(z-cz)*uz,lateral=Math.abs((player.x-cx)*uz-(player.y-cz)*ux);
      // The door/stair tile may be solid. Its boundary is an event checked
      // before collision, exactly when the player attempts to enter it.
      if(before>=-1.05&&before<.5&&after>=-.68&&lateral<w.width*.5)return enterWarp(w);
    }
    return false;
  }
  function target(){
    const p=grid(),[dx,dz]=directions[frames.indexOf(facing)],front={x:p.x+dx,z:p.z+dz};
    const n=npcs.find(n=>{const p=NpcWalk.cell(n);return !n.hidden&&Math.abs(p.x-player.x)<1.6&&Math.abs(p.y-player.y)<1.6&&Math.floor(p.x+origin()[0])===front.x&&Math.floor(p.y+origin()[1])===front.z;});
    if(n)return {kind:'actor',n,script:n.script};
    // Background records use grid X/Z followed by vertical height. Directions
    // 0..3 are N/E/W/S; 4 is any, 5 horizontal and 6 vertical.
    const dir=frames.indexOf(facing),allowed=[[0],[3],[2],[1],[0,1,2,3],[2,3],[0,1]];
    const b=data().background.find(b=>b.condition<2&&b.x===front.x&&b.z===front.z&&allowed[b.direction]?.includes(dir));if(b)return {kind:'background',script:b.script};
    return null;
  }
  function interact(){if(vm.running||failed)return;const t=target();if(t&&t.script<2000){currentActor=t.n?.uid;return run(t.script-1);}}
  function step(dt,moved,distance=0){
    if(state.trainer&&!document.hidden)state.trainer.playSeconds=Math.min(3599999,state.trainer.playSeconds+dt);
    fieldModels?.tick(dt);
    try{tickMotions(dt);if(cameraTask){const c=cameraTask;c.elapsed+=dt;const f=Math.min(1,c.elapsed/c.duration);renderer.storyCamera=c.start.map((n,i)=>n+(c.target[i]-n)*f);if(f===1){cameraTask=null;c.resolve();}}}catch(error){failed=error;console.error(error);showPage(error.message);}
    const held=eventRunning||sceneChanging||journey.processing||battling||menuOpen()||failed;
    tickAmbient(dt,!held&&native.intro);warpCooldown=Math.max(0,warpCooldown-dt);if(held)return;
    if(!native.intro&&renderer.ready){run(4,782);return;}
    const p=grid(),key=native.zone+':'+p.x+':'+p.z;
    journey.update();if(key!==lastTile){lastTile=key;
    if(native.zone===317&&p.z<=671&&!native.arrived){native.arrived=true;state.phase='arrival';journey.update();showPage('Quattroventi\nFine della demo.');return;}
    for(const trigger of data().triggers)if(value(trigger.var)===trigger.value&&p.x>=trigger.x&&p.x<trigger.x+trigger.width&&p.z>=trigger.z&&p.z<trigger.z+trigger.height){run(trigger.script-1);return;}}
    journey.encounter(dt,moved,distance);
  }
  function battleDone(s,kind){native.won=s?.battle.winner==='Alcide';if(pendingBattle){const done=pendingBattle;pendingBattle=null;done();return true;}return false;}
  initialize();syncActors();applyRoom();
  window.NativeStory={showPage,choice,nickname,vm,state:native,syncActors,battleDone,interact,captureActors,run,changeZone,tryWarp,occupied:(x,z)=>npcs.some(n=>NpcWalk.occupies(n,x,z)),blackout:()=>changeZone(390,5,8),get music(){return native.music||data().music;},get locked(){return eventRunning||sceneChanging||!!failed||journey.processing;}};
  journey.interact=interact;journey.hint=()=>vm.running?'':target()?'E · Interagisci':'';journey.step=step;
  Object.defineProperty(journey,'locked',{get:()=>NativeStory.locked});
  $('dialogue').addEventListener('cancel',e=>{e.preventDefault();if(pendingMessage)pendingMessage();else pendingCancel?.();});
})();

