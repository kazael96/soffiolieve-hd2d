/* IRBI field-event host. Narrative and movement programs are extracted, not rewritten. */
(() => {
  const journey=window.Journey,state=journey.state;
  if(window.ACCUMULA_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],ACCUMULA_EVENTS[k]);OPENING_TRAINERS[64]=ACCUMULA_EVENTS.trainer;}
  if(window.ROUTE2_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],ROUTE2_EVENTS[k]);Object.assign(OPENING_TRAINERS,ROUTE2_TRAINERS);Object.assign(ORIGINAL_EVENTS.itemNames,ROUTE2_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,ROUTE2_DATA.itemDescriptions);}
  if(window.STRIATON_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],STRIATON_EVENTS[k]);Object.assign(OPENING_TRAINERS,STRIATON_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,STRIATON_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,STRIATON_DATA.itemDescriptions);}
  if(window.ROUTE3_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],ROUTE3_EVENTS[k]);Object.assign(OPENING_TRAINERS,ROUTE3_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,ROUTE3_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,ROUTE3_DATA.itemDescriptions);}
  const sceneZones={bedroom:391,home:390,bianca:392,biancaRoom:393,komorHome:394,komorRoom:395,lab:396,town:389};
  const zoneScenes=Object.fromEntries(Object.entries(sceneZones).map(([k,v])=>[v,k]));zoneScenes[317]='town';
  zoneScenes[6]='town';zoneScenes[8]='zone8';sceneZones.zone8=8;zoneScenes[397]='town';zoneScenes[319]='town';for(const zone of [398,399,400,401,402,403,404,405,320]){sceneZones['zone'+zone]=zone;zoneScenes[zone]='zone'+zone;}
  for(const z of [7,9,10,15,152,322,323,324,27,20]){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  zoneScenes[321]=zoneScenes[16]='town';
  const native=state.original||(state.original={vars:{},flags:[],zone:sceneZones[state.scene],intro:false});
  if(window.STRIATON_DATA&&!native.chapter040){native.chapter040=true;for(const flag of [530,532,533,534,539,540,541,757,820,707])if(!native.flags.includes(flag))native.flags.push(flag);}
  if(window.ROUTE3_DATA&&!native.chapter042){native.chapter042=true;for(const flag of [517,572,625,562,614,751,1328])if(!native.flags.includes(flag))native.flags.push(flag);}
  const fieldModels=window.FIELD_MODEL_ASSETS?new FieldModels.Controller(renderer,FIELD_MODEL_ASSETS,id=>AudioEngine.playSound(id)):null;
  const names={74:'Zania',85:'Spighetto',178:'Chicco',179:'Maisello',126:'Munna',127:'Musharna',7:'Komor',134:'Belle',105:'Aralia',147:'Mamma',24:'Padre',208:'Regalo',18:'Viandante',103:'N',100:'Ghecis'};
  const frames=[0,3,6,9],directions=[[0,-1],[0,1],[-1,0],[1,0]];
  let phoneLayout=null;
  let motions=[],pendingBattle=null,currentActor=null,pendingMessage=null,sceneChanging=false,failed=null,ambientTime=0,settleWaiters=[];
  let fieldCovered=false,fadeRevision=0,actorZone=native.zone,actorsInitialized=false;
  const departures=new FieldActorExits.Controller({blocked:(x,y)=>blocked(x,y),obstructed:(record,p)=>record.plan.destination==='center-interior'&&fieldActors().some(n=>{return n.name==='Aralia'&&Math.abs(n.x-p.x)<.65&&Math.abs(n.y-p.y)<.65;}),pose, sample:n=>renderer.actorVisibility?.(n)||null,portal:async record=>{if(record.plan.kind!=='door')return null;const p=record.plan.anchor;if(native.door?.open&&Math.hypot(native.door.x-origin()[0]-p.x,native.door.z-origin()[1]-p.y)<3)return null;if(!fieldModels?.find(1,p.x,p.y))return null;const id=fieldModels.create(1,p.x,p.y);await fieldModels.play(id,0);await fieldModels.wait(id);return id;},finishPortal:record=>{if(record.handle!=null&&fieldModels?.handles.has(record.handle))void fieldModels.play(record.handle,1).then(()=>fieldModels.wait(record.handle)).then(()=>fieldModels.release(record.handle));}});
  departures.restore(native.departures,native.zone,native);
  const warmedBanks=new Set();
  let tutorialWarm=null;
  function warmTutorial(){if(native.zone!==317||value(16508)>=1||tutorialWarm||!window.BattleEnvironment||!window.ROM_SPRITE_ANIM)return;tutorialWarm=Promise.all([BattleEnvironment.prepare(Object.freeze({id:'route1',label:'Percorso 1',terrain:'grass'})),ROM_SPRITE_ANIM.prepare([{id:572,back:true},{id:504,back:false}]),window.NativeCapture?.preload(),window.MoveFX?.preload(1),window.AudioEngine?.preloadMove(1,{p1:572,p2:504})]).catch(()=>{tutorialWarm=null;});}
  function warmBank(bank){if(warmedBanks.has(bank)||!AudioEngine.enabled)return;warmedBanks.add(bank);const code=Object.values(ORIGINAL_EVENTS.scripts[bank]?.code||{}),sounds=code.filter(c=>['SEPlay','MEPlay'].includes(c.name)&&c.args[0]<0x4000).map(c=>({kind:'sfx',id:c.args[0]}));void AudioEngine.preloadEvents?.(sounds).catch(()=>warmedBanks.delete(bank));}
  let eventRunning=false,queued=null,pendingCancel=null,cameraTask=null,fadeTask=Promise.resolve(),soundTask=Promise.resolve(),lastTile='',warpCooldown=0;
  const vm=new FieldEventVM(ORIGINAL_EVENTS,native,{
    playerName:()=>state.playerName||'Alcide',speciesName:id=>GEN5.species.find(s=>s.id===id)?.en||String(id),party:i=>state.party[i],command
  });
  const data=()=>ORIGINAL_EVENTS.zones[native.zone];
  const origin=()=>[389,317,397,319,6,321,16].includes(native.zone)?[784,752]:[16,16];
  const world=(x,z)=>({x:x+.5-origin()[0],y:z+.5-origin()[1]});
  const grid=()=>({x:Math.floor(player.x+origin()[0]),z:Math.floor(player.y+origin()[1])});
  const has=flag=>native.flags.includes(flag),value=id=>vm.value(id);
  const actor=id=>id===255?player:npcs.find(n=>n.uid===id);
  function pose(n,dir,step=0){
    if(([389,317,397,319,6,321,16,7,152,324].includes(n.fieldZone))&&renderer.groundHeight)n.height=renderer.groundHeight(n.x,n.y);
    n.direction=dir;const count=OPENING_SPRITES[n.name]?.length||window.ROM_SPRITES?.[n.name]?.length;
    if(count===1){n.frame=0;n.flip=false;}
    else if(count===7||count===9){n.frame=[0,2,4,4][dir]+(step===1?1:step===2?(dir<2?1:2):0);n.flip=dir===3||(dir<2&&step===2);}
    else {n.frame=frames[dir]+step;n.flip=false;}
  }
  function face(id,dir){const n=actor(id);if(!n)return;if(id===255)facing=frames[dir];else pose(n,dir);}
  function putActor(record){
    const n={...world(record.x,record.z),fieldZone:native.zone,uid:record.id,model:record.model,name:names[record.model]||'Original'+record.model,script:record.script,direction:record.direction,frame:frames[record.direction],height:record.model===208?.5:(record.y||0)/65536};
    n.wander=NpcWalk.create(record,{x:n.x,y:n.y});if(record.model===185){n.noShadow=true;n.gimmick=true;}pose(n,record.direction);npcs.push(n);return n;
  }
  function syncActors(){
    const previousActors=[...npcs];npcs.splice(0);for(const n of data().actors){
      if(n.flag&&has(n.flag))continue;if(native.zone===321&&[23,24].includes(n.id))continue;if(native.zone===16&&value(16530)<4&&[6,8].includes(n.id))continue;if(native.zone===317&&n.x<773)continue;
      if(native.zone===397&&value(16507)<3&&[521,523,524,525,637,638,1106,1114].includes(n.flag))continue;
      if(native.zone===397&&[1106,1114].includes(n.flag))continue;
      if(native.zone===319&&[8195].includes(n.model))continue;
      if(native.zone===6&&[13,14].includes(n.id))continue;
      // Curtain records are logical moving mechanisms; meshes are in the scene.
      if(native.zone===152&&(n.model===8195||n.id===8&&native.dreamyardTreeCut))continue;
      if(native.zone===319&&native.routeItems?.includes(n.id))continue;
      if([398,8,20].includes(native.zone)&&[657].includes(n.flag))continue;
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
    // Both towns and Route 1 share the same rendered field. Stage characters
    // at their next outdoor event before crossing the native map boundary.
    // These visual neighbours cannot run a script belonging to another map.
    if(native.zone===317){
      const adjacent=[];
      if(has(508)&&!has(520))adjacent.push(6);
      if(value(16508)>=2&&!has(528))adjacent.push(10);
      for(const id of adjacent){const record=ORIGINAL_EVENTS.zones[397].actors.find(n=>n.id===id);const n=putActor({...record,script:2000});Object.assign(n,{fieldZone:397,projection:true});}
    }
    if([319,6].includes(native.zone)&&value(16509)>=2&&value(16532)<2){const n=putActor({id:251,model:134,script:2000,x:804,z:580,direction:3});Object.assign(n,{fieldZone:6,projection:true});}
    if(actorsInitialized)departures.preserve(previousActors,npcs,{covered:fieldCovered,sameField:actorZone===native.zone||[389,317,397,319,6,321,16].includes(actorZone)&&[389,317,397,319,6,321,16].includes(native.zone)});actorZone=native.zone;actorsInitialized=true;
  }
  function derivePhase(){
    state.phase=native.zone===16||native.nacrene?'nacrene':native.zone===324?'wellspring':native.route3?'route3':value(16532)>=5?'dreamyardDone':value(16532)>=1?'dreamyard':native.striaton?'striaton':native.route2?'route2':value(16506)>=3?'nextRoute':value(16506)>=2?'plasma':value(16507)===1?'centerHeal':value(16507)===2?'centerTour':value(16507)===3&&value(16506)>=1?'plasma':native.arrived?'arrival':value(16508)>=1?'route':value(16512)===3?'tutorial':value(16512)===2?'routeStart':value(16505)===1?'map':value(16504)===1?'lab':value(16517)===1?'biancaHouse':value(16513)===2?'mother':state.starter?'belle':'gift';
    journey.update();
  }
  function initialize(){
    if(native.initialized)return;
    native.flags=[...new Set([...(native.flags||[]),501,679])];native.zone=391;native.initialized=true;
    player=world(5,6);facing=3;
  }
  function captureActors(){native.departures=departures.save();native.actors??={};native.actorFlags??={};native.actorFlags[native.zone]=[...native.flags];native.actors[native.zone]=structuredClone(npcs.filter(n=>!n.projection));}
  function delay(frames){return window.GameSpeed?.wait(Math.max(0,frames)*1000/30)||new Promise(resolve=>setTimeout(resolve,Math.max(0,frames)*1000/30));}
  function applyRoom(){if(state.scene==='bedroom')renderer.scene=OPENING_ASSETS.scenes[native.roomMess?'bedroomMess':'bedroom'];}
  function cameraTo(target,frames){
    const start=[...(renderer.storyCamera||renderer.center)];
    let resolve;const promise=new Promise(r=>resolve=r);cameraTask={start,target,elapsed:0,duration:frames/30,promise,resolve};
  }
  function fade(to,frames=8,color='#000'){
    let cover=$('fieldFade');if(!cover){cover=document.createElement('div');cover.id='fieldFade';cover.style.cssText='position:fixed;inset:0;z-index:80;pointer-events:none;opacity:0';document.body.append(cover);}
    const revision=++fadeRevision;if(to===0)fieldCovered=false;cover.style.background=color;cover.style.transition=`opacity ${frames/30/(window.GameSpeed?.rate||1)}s linear`;cover.style.opacity=String(to);fadeTask=delay(frames).then(()=>{if(revision!==fadeRevision)return;cover.style.transition='none';cover.style.opacity=String(to);fieldCovered=to===1;if(fieldCovered)departures.clear();});return fadeTask;
  }
  function showPage(text,speaker=''){
    const d=$('dialogue');$('speakerName').textContent=speaker;$('dialogueTitle').textContent='';$('dialogueText').textContent=text;
    $('dialoguePortrait').hidden=true;$('dialogueBattle').hidden=true;$('starterChoices').hidden=true;$('dialogueContinue').hidden=false;
    const printing=window.NativeSettings?.message($('dialogueText'),text);
    $('dialogueContinue').textContent='▼';if(!d.open)d.showModal();phoneLayout?.();resetInput();
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
  async function healAtCenter(){
    const say=async i=>{for(const page of messagePages(ORIGINAL_EVENTS.texts[346][i],vm.words))await showPage(page);};
    await say(2);if(await choice(['SÌ','NO'])!==0){await say(8);return false;}
    await say(6);journey.heal();await AudioEngine.playSound(1369);await say(7);await say(8);
    native.healZone=[8,20].includes(native.zone)?native.zone:398;if(native.zone===398&&value(16507)===1)vm.set(16507,2);return true;
  }
  async function cityService(script){
    if(eventRunning||sceneChanging||journey.processing||failed)return;
    eventRunning=true;resetInput();
    try{
      if(script===2100){await healAtCenter();if(native.zone===398&&value(16507)===2)await vm.run(796,6);}
      else if(script===2101){
        await showPage('Benvenuto al Pokémon-Market!');
        let buying=true;while(buying){const i=await choice(['Poké Ball — ₽200','Pozione — ₽300','Annulla']);if(i===2)break;
          const price=i===0?200:300,have=i===0?state.pokeballs:potions;
          if(state.money<price){await showPage('Non hai abbastanza denaro.');continue;}if(have>=999){await showPage('La Borsa non può contenerne altri.');continue;}
          if(await choice(['Acquista','Annulla'])!==0)continue;state.money-=price;if(i===0)state.pokeballs++;else potions++;journey.update();}
      }else if(script===10100||script===10105){await showPage(ORIGINAL_EVENTS.texts[346][24]);}
      else if(script===10397){await showPage('Non ci sono Doni Segreti da ricevere.');}
      else await showPage('Questo servizio non è disponibile nella demo.');
      derivePhase();captureActors();
    }catch(error){failed=error;$('world').dataset.eventError=error.message;console.error(error);}
    finally{eventRunning=false;journey.save(true);}
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
      else if(code>=28&&code<=31){dir=code-28;duration=16/30;}
      else if(code>=48&&code<=51){dir=code-48;duration=8/30;}
      else if(code>=32&&code<=35){dir=code-32;duration=8/30;}
      else if(code>=36&&code<=39){dir=code-36;duration=4/30;}
      else if(code>=76&&code<=79){dir=code-76;distance=1;duration=6/30;}
      else if(code===61){duration=2/30;}
      else if(code===63){duration=8/30;}
      else if(code===69){duration=1/30;if(!task.departure){departures.depart(n,native.zone,{covered:fieldCovered});n.hidden=true;task.departure=true;}const record=departures.records.get(FieldActorExits.identity(n));if(record&&!record.plan.background&&record.plan.kind!=='path'&&record.plan.kind!=='resident')continue;}
      else if(code===75||code===159){duration=16/30;n.emote=code===75?'!':'?';}
      else if(code===181||code===100){
        const gesture=OPENING_GESTURES[n.name];if(!gesture)throw Error('Missing original gesture for '+n.name);
        duration=gesture.steps.reduce((sum,step)=>sum+step[1],0)/30;
        let elapsed=task.elapsed*30;n.flip=false;
        for(const [frame,hold] of gesture.steps){n.frame=frame;if(elapsed<hold)break;elapsed-=hold;}
      }
      else if(code===62){duration=4/30;}
      else if(code===31){duration=8/30;}
      else if(code===65){duration=1/30;}
      else if(code===71||code===72){duration=1/30;}
      else throw Error('Unsupported original movement '+code);
      if(!task.start){task.start={x:n.x,y:n.y};if(dir!==null)face(task.id,dir);}
      task.elapsed+=dt;let f=Math.min(1,task.elapsed/duration);if(code>=76&&code<=79){const at=Math.min(5,Math.floor(f*6)),part=f*6-at,points=[0,2,5,8,10,13,16];f=(points[at]+part*(points[at+1]-points[at]))/16;}
      if(distance){const [dx,dy]=directions[dir];n.x=task.start.x+dx*f*distance;n.y=task.start.y+dy*f*distance;if(task.id===255)moving=true;else pose(n,dir,[1,0,2,0][Math.floor(task.elapsed*30/(duration*30/2))%4]);}
      if(code>=28&&code<=31&&task.id!==255)pose(n,dir,[1,0,2,0][Math.floor(f*4)%4]);if(code>=48&&code<=51)n.jumpLift=Math.sin(Math.PI*f)*.25;
      if(task.elapsed>=duration){n.jumpLift=0;if(task.id!==255){pose(n,n.direction);n.emote=null;}task.elapsed=0;task.start=null;if(++task.count>=Math.max(1,repeats)){task.index++;task.count=0;}}
    }
  }
  function fieldActors(){return departures.visible(npcs.filter(n=>!n.hidden),player);}
  function occupied(x,y){return fieldActors().some(n=>!n.gimmick&&(n.height||0)>=0&&NpcWalk.occupies(n,x,y));}
  function ambientMoving(){const bodies=fieldActors();return npcs.some(n=>bodies.includes(n)&&!n.hidden&&n.wander?.phase===4);}
  function settleAmbient(){return ambientMoving()?new Promise(resolve=>settleWaiters.push(resolve)):Promise.resolve();}
  function tickAmbient(dt,start){
    ambientTime+=dt;
    while(ambientTime>=1/30){ambientTime-=1/30;
      const bodies=fieldActors();for(const n of npcs){if(!bodies.includes(n))continue;NpcWalk.update(n,{start,pose,blocked:(who,p)=>blocked(p.x,p.y)||Math.abs(player.x-p.x)<.75&&Math.abs(player.y-p.y)<.75||bodies.some(other=>other!==who&&(other.height||0)>=0&&NpcWalk.occupies(other,p.x,p.y))});}
    }
    if(!ambientMoving()&&settleWaiters.length){const waiting=settleWaiters;settleWaiters=[];waiting.forEach(done=>done());}
  }
  async function run(entry,bank=data().script){
    if(eventRunning||failed)return;eventRunning=true;resetInput();const before=structuredClone(state);
    try{warmBank(bank);await settleAmbient();captureActors();journey.save(true);
      await vm.run(bank,entry);native.intro=true;
      if(bank===778&&entry===13&&queued===1){
        queued=null;const friends=npcs.filter(n=>n.uid===250||n.uid===240);native.zone=317;native.music=data().music;AudioEngine.setScene(native.music);delete native.actors?.[317];
        syncActors();npcs.push(...friends);await vm.run(634,0);
      }
      if(bank===778&&native.zone===396&&value(16505)===0)await vm.run(792,0);
      if(native.zone===398&&value(16507)===0)await vm.run(796,0);
      if(native.zone===398&&value(16507)===2)await vm.run(796,6);
      if(native.blackoutQueued){native.blackoutQueued=false;journey.heal();renderer.storyCamera=null;await changeZone([8,20].includes(native.healZone)?native.healZone:398,7,13);}
      for(let chain=0;chain<5;chain++){if(![9,10].includes(native.zone))break;const next=data().onEnter?.find(e=>value(e.var)===e.value);if(!next||data().script===bank&&next.entry===entry)break;bank=data().script;entry=next.entry;await vm.run(bank,entry);}
      derivePhase();captureActors();if(native.zone===317)syncActors();captureActors();eventRunning=false;journey.save(true);
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
      case 'MsgActor':case 'MsgActorEx':case 'MsgActorVersioned':case 'ActorMsgVersioned':await message(a[0]===1024?textBank:v[0],v[1],m);break;
      case 'MsgActorGendered':await message(a[0]===1024?textBank:v[0],v[1],m);break;
      case 'MsgInfo':case 'MsgSystem':case 'MsgPlaceSign':await message(textBank,v[0],m);break;
      case 'MsgAt':await message(textBank,v[0],m);break;
      case 'MsgAtClose':case 'MsgCloseImmediate':break;
      case 'YesNoWin':m.set(a[0],await choice(['SÌ','NO']));break;
      case 'CallPoke3Select':m.set(a[0],await chooseStarter());break;
      case 'CallPokeNameInput':m.set(a[0],await nickname(v[1]));break;
      case 'PokePartyGetParam':m.set(a[0],state.party[v[1]].nickname?1:0);break;
      case 'PokePartyAdd':{const name=m.host.speciesName(v[1]);if(state.party.length>=6){m.set(a[0],0);break;}if(!state.starter)state.starter=name;state.party.push(journey.record(newStoryMon(name,v[3]),OPENING_DATA[name].growth[v[3]]));StoryState.register(state,name,true);journey.displayPartner();m.set(a[0],1);break;}
      case 'StriatonWord86':m.words[a[0]]={9:'Fuoco',10:'Acqua',11:'Erba'}[v[1]]||String(v[1]);break;
      case 'BadgeCheck':m.set(a[0],native.badges?.includes(v[1])?1:0);break;
      case 'BadgeSet':native.badges??=[];if(!native.badges.includes(v[0]))native.badges.push(v[0]);break;
      case 'BadgeRegisterParty':native.badgeTeams??={};native.badgeTeams[v[0]]=state.party.map(p=>p.name);break;
      case 'TrainerSetDefeated':native.trainerWins??=[];if(!native.trainerWins.includes(v[0]))native.trainerWins.push(v[0]);break;
      case 'GymCurtainInit':native.gymCurtains=v[0];break;
      case 'GymCurtainSwitch':case 'GymCurtainFeedback':case 'GymCurtainReset':native.gymSwitch=v[0];break;
      case 'CGearScene':native.cgear=true;break;
      case 'CGearNotice':await showPage('Il C-Gear è stato attivato. Le funzioni wireless non sono disponibili nella demo.');break;
      case 'NativeConstant21':m.set(a[0],21);break;
      case 'NativeOpcode492':{const n=actor(v[0]);if(n){Object.assign(n,world(v[2],v[4]));pose(n,v[1]);}break;}
      case 'NativeOpcode475':native.route3Survey=v[0];break;
      case 'NativeOpcode139':break; // Native trainer intro is covered by the battle entry transition.
      case 'NativeOpcode159':native.music=v[0];AudioEngine.setScene(v[0]);break;
      case 'NativeOpcode134':{const completed=new Promise(resolve=>pendingBattle=resolve);try{await window.DoubleBattles.partner(v);await completed;}finally{pendingBattle=null;}break;}
      case 'NetworkStateGet':m.set(a[0],0);break;
      case 'CGearFeatureGet':m.set(a[1],0);break;
      case 'PokePartyRecoverAll':journey.heal();break;
      case 'PokePartyIsFullHP':m.set(a[0],state.party[v[1]].hp===journey.unpack(state.party[v[1]]).max?1:0);break;
      case 'PokePartyIsFullPP':m.set(a[0],journey.unpack(state.party[v[1]]).moves.every(move=>move.left===move.pp)?1:0);break;
      case 'PokePartyGetCount':m.set(a[0],v[1]===2?state.party.filter(p=>p.hp>0).length:state.party.length);break;
      case 'TrainerCardGetSex':m.set(a[0],0);break;
      case 'ActorCmdExec':move(v[0],ORIGINAL_EVENTS.scripts[m.bank].movements[a[1]]);break;
      case 'ActorCmdWait':await Promise.all(motions.map(t=>t.promise));break;
      case 'ActorSetGPos':{const n=actor(v[0]),before=n&&{...n};if(n)Object.assign(n,world(v[1],v[3]));face(v[0],v[4]);if(n&&v[0]!==255&&renderer.hasPresentedActor?.(n))departures.preserve([before],[n],{covered:fieldCovered,sameField:true});break;}
      case 'ActorSetEyeToEye':{const n=actor(currentActor);if(n){const dx=player.x-n.x,dy=player.y-n.y;face(currentActor,Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0);}break;}
      case 'ActorAdd':{const record=data().actors.find(n=>n.id===v[0]);if(record&&!actor(v[0]))putActor(record);if(m.bank===304&&v[0]===19)await fade(0,4,'#fff');break;}
      case 'ActorDelete':{if(m.bank===304&&v[0]===17)await fade(1,4,'#fff');const n=actor(v[0]);if(n){departures.depart(n,native.zone,{covered:fieldCovered});n.hidden=true;await departures.wait(n);const index=npcs.indexOf(n);if(index>=0)npcs.splice(index,1);}break;}
      case 'ActorNew':if(!actor(v[3]))putActor({id:v[3],model:v[4],x:v[0],z:v[1],direction:v[2],script:2000});break;
      case 'PlayerGetGPos':m.set(a[0],grid().x);m.set(a[1],grid().z);break;
      case 'PlayerGetDir':m.set(a[0],frames.indexOf(facing));break;
      case 'VMSleep':await delay(v[0]);break;
      case 'CallTrainerBattle':{
        const trainer=OPENING_TRAINERS[v[0]];if(!trainer)throw Error('Trainer outside opening '+v[0]);
        const kind=trainer.name;if(kind==='Belle'||kind==='Komor')state.phase=kind==='Belle'?'belle':'komor';rival=kind;journey.update();
        const completed=new Promise(resolve=>pendingBattle=resolve);
        try{await startBattle(true,{story:kind,trainerId:v[0],noBlackout:!!(v[2]&1),aiFlags:trainer.aiFlags,doubles:trainer.battleStyle===1,p1:journey.configs(),p2:structuredClone(trainer.party).map(p=>({...p,item:GEN5.items.find(i=>i.id===p.heldItem)?.key||p.item||''}))});await completed;}finally{pendingBattle=null;}break;
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
        if([10394,10395,10396].includes(v[0])){native.healZone=[8,20].includes(native.zone)?native.zone:398;break;}
        if(v[0]===10110){await healAtCenter();break;}
        if(![2800,2805].includes(v[0]))throw Error('Global script outside opening '+v[0]);
        const child=new FieldEventVM(ORIGINAL_EVENTS,native,m.host);child.words=m.words;await child.run(862,v[0]-2800);break;
      }
      case 'ItemCheckSpace':m.set(a[2],1);break;
      case 'ItemAdd':{
        const item=v[0],count=v[1];if(item===4)state.pokeballs+=count;else if(item===17)potions+=count;
        else if(item===442)native.map=true;else if([621,626].includes(item))native.phone=true;else if(window.ROUTE3_DATA?.itemNames[item]||window.STRIATON_DATA?.itemNames[item])journey.addItem(item,count);else throw Error('Item outside opening '+item);
        m.set(a[2],1);journey.update();break;
      }
      case 'ItemGetPocket':m.set(a[1],[442,621,626,437].includes(v[0])?4:[373,410,420].includes(v[0])?2:[150,155].includes(v[0])?3:[17,18,21,22,25,26,27,28,30].includes(v[0])?1:0);break;
      case 'WordSetItemName':case 'WordSetItemNameWithArticle':case 'WordSetItemNameEx':{
        const item=ORIGINAL_EVENTS.itemNames[v[1]];if(!item)throw Error('Item name '+v[1]);
        const plural=c.name==='WordSetItemNameEx'&&v[2]>1,article=c.name==='WordSetItemNameWithArticle'||c.name==='WordSetItemNameEx'&&v[3];
        m.words[a[0]]=plural?(v[1]===17?'Pozioni':item):article?(v[1]===621||v[1]===626?"un ":'una ')+item:item;break;
      }
      case 'WordSetTMMoveName':{const id={373:168,410:526,420:15}[v[1]];if(!id)throw Error('Machine outside chapter '+v[1]);m.words[a[0]]=GEN5.moves.find(move=>move.id===id).name;break;}
      case 'WordSetItemPocketName':m.words[a[0]]=ORIGINAL_EVENTS.pocketNames[v[1]];if(m.words[a[0]]===undefined)throw Error('Item pocket '+v[1]);break;
      case 'Random':m.set(a[0],Math.floor(Math.random()*v[1]));break;
      case 'MapChangeWarp':await changeZone(v[0],v[1],v[2]);break;
      case 'MapChangeFly':await changeZone(v[0],v[1],v[2]);face(255,v[3]);break;
      case 'CallBattleBlackout':native.blackoutQueued=true;m.pc=null;m.calls=[];break;
      case 'UnknownBW0248':native.music=v[0];AudioEngine.setScene(v[0]);break;
      case 'MenuCreate':m.menu={result:a[4],items:[]};break;
      case 'MenuAdd':m.menu.items.push({label:messagePages(ORIGINAL_EVENTS.texts[textBank][v[0]],m.words).join(' '),value:v[2]});break;
      case 'MenuShow':{const i=await choice(m.menu.items.map(x=>x.label));m.set(m.menu.result,m.menu.items[i].value);break;}
      case 'BGMTrackGet':m.set(a[0],native.musicTracks?.[v[1]]?1:0);break;
      case 'BGMTrackEnable':native.musicTracks??={};native.musicTracks[v[0]]=true;AudioEngine.setMusicTrack?.(v[0],true);break;
      case 'UnknownBW017E':await showPage('Quattroventi ← → Percorso 2');break;
      case 'MapReplaceSetEvent':if(m.bank===638){native.route2MapEvent=v[0];}else if(m.bank>=778){native.roomMess=true;applyRoom();}else native.mapEvents={...(native.mapEvents||{}),[native.zone]:v[0]};break;
      case 'EnableRunningShoes':native.runningShoes=true;break;
      case 'MapReplaceIsEventSet':m.set(a[1],native.roomMess?1:0);break;
      case 'EVCameraInit':renderer.storyCamera=[...renderer.center];break;
      case 'EVCameraEnd':case 'EVCameraRebind':renderer.storyCamera=null;break;
      case 'EVCameraUnbind':renderer.storyCamera??=[...renderer.center];break;
      case 'EVCameraMoveTo':cameraTo([v[3]/65536-origin()[0],v[5]/65536-origin()[1]],v[6]);break;
      case 'EVCameraMoveToDefault':case 'EVCameraReturn':cameraTo(state.scene==='town'?[([321,16].includes(native.zone)?player.x:player.x*.7),player.y+1.5]:renderer.scene.chapter042?[player.x,player.y+1.5]:[-10,-10],v[0]);break;
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
    if(![1,2].includes(id))throw Error('Call outside opening '+id);
    const call=id===2?ROUTE2_PHONE:PHONE_ASSETS,portraits={...PHONE_ASSETS.portraits,...(window.ROUTE2_PHONE?.portraits||{})};
    const names=['Alcide','Komor','Belle','Aralia','Mamma'],panel=document.createElement('section');panel.id='phoneScene';panel.setAttribute('aria-label','Interpoké');
    const pictures=call.participants.filter(person=>person<5).map(person=>{
      const name=names[person],tile=document.createElement('figure'),image=document.createElement('img'),label=document.createElement('figcaption');
      image.src=portraits[name][0];image.alt=name;label.textContent=name;tile.append(image,label);panel.append(tile);return {name,tile,image};
    });
    if(window.RuntimeAssets)await Promise.all([...new Set(pictures.flatMap(p=>portraits[p.name]))].map(src=>RuntimeAssets.image(src)));
    panel.dataset.participants=String(pictures.length);document.body.append(panel);$('world').dataset.phone=String(id);await fade(0);
    // Reserve the actual message window, including touch controls and rotation.
    const fitPortraits=()=>{const dialog=$('dialogue');if(!dialog.open)return;const css=getComputedStyle(panel),rows=Math.ceil(pictures.length/2),space=dialog.getBoundingClientRect().top-parseFloat(css.paddingTop)-8-(rows-1)*parseFloat(css.rowGap);panel.style.gridTemplateRows=`repeat(${rows},minmax(0,${Math.max(0,Math.min(192,space/rows))}px))`;};
    phoneLayout=fitPortraits;const layoutObserver=new ResizeObserver(fitPortraits);layoutObserver.observe($('dialogue'));addEventListener('resize',fitPortraits);
    let talker=-1,frame=0;const clock=setInterval(()=>{frame++;pictures.forEach((p,i)=>{const blink=frame%28===26?1:frame%28===27?2:0;const mouth=i===talker?[0,1,2,1][frame%4]:0;p.image.src=portraits[p.name][blink*3+mouth];p.tile.classList.toggle('speaking',i===talker);});},1000/15);
    try{
      for(const [op,face,param] of call.commands){
        if(op===0)break;
        if(op===1){talker=face;for(const page of messagePages((id===2?ROUTE2_DATA.phoneText:ORIGINAL_EVENTS.phoneTexts)[param],m.words))await showPage(page,pictures[face].name);}
        else if(op===2)await delay(param);else if(op===3)soundTask=AudioEngine.playSound(param);else if(op===4)await soundTask;else throw Error('Unknown phone command '+op);
      }
    }finally{phoneLayout=null;clearInterval(clock);layoutObserver.disconnect();removeEventListener('resize',fitPortraits);panel.remove();delete $('world').dataset.phone;}
  }
  async function changeZone(zone,x,z){
    if(!zoneScenes[zone])throw Error('Zone outside opening '+zone);
    const restoreField=!fieldCovered;if(restoreField)await fade(1,8);departures.clear();fieldModels?.clear();
    captureActors();native.zone=zone;native.music=data().music;AudioEngine.setScene(native.music);const p=world(x,z);journey.setScene(zoneScenes[zone],p.x,p.y);syncActors();warpCooldown=.8;lastTile='';applyRoom();
    for(const init of data().init||[]){if(init.entry>=10000){await command({name:'RTCallGlobal'},[init.entry+1],[init.entry+1],vm);continue;}const loader=new FieldEventVM(ORIGINAL_EVENTS,native,vm.host);await loader.run(data().script,init.entry);}
    if(zone===319)native.route2=true;if(zone===321)native.route3=true;if(zone===16)native.nacrene=true;derivePhase();
    captureActors();if(restoreField)await fade(0,8);
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
      if(w.zone===319){journey.save(true);return;}
      const next=data().onEnter?.find(e=>value(e.var)===e.value);
      if(next&&ORIGINAL_EVENTS.scripts[data().script].supportedEntries.includes(next.entry))await run(next.entry);
      else journey.save(true);
    }catch(error){sceneChanging=false;failed=error;$('world').dataset.eventError=error.message;console.error(error);await showPage(error.message);}
  }
  async function chapterBoundary(){if(eventRunning)return;eventRunning=true;resetInput();try{await showPage(native.zone===16?'Hai raggiunto Zefiropoli! Il Museo, la palestra e il Bosco Girandola saranno disponibili nel prossimo capitolo.':'Questa parte del viaggio sarà disponibile nel prossimo capitolo.');}finally{eventRunning=false;}}
  function tryWarp(dx,dz,x,z){
    if(eventRunning||sceneChanging||journey.processing||warpCooldown||failed)return false;
    const dir=Math.abs(dx)>Math.abs(dz)?dx>0?3:2:dz>0?1:0,[ux,uz]=directions[dir];
    if(native.zone===16&&dir===2&&x< -175.5&&player.x>=-175.5){warpCooldown=.8;return chapterBoundary();}
    for(const w of data().warps){
      if(warpDirections[w.a]!==dir)continue;
      const cx=w.x/16-origin()[0],cz=w.z/16-origin()[1];
      const before=(player.x-cx)*ux+(player.y-cz)*uz,after=(x-cx)*ux+(z-cz)*uz,lateral=Math.abs((player.x-cx)*uz-(player.y-cz)*ux);
      // The door/stair tile may be solid. Its boundary is an event checked
      // before collision, exactly when the player attempts to enter it.
      if(before>=-1.05&&before<.5&&after>=-.68&&lateral<w.width*.5){if(!ORIGINAL_EVENTS.zones[w.zone]){warpCooldown=.8;return chapterBoundary();}return enterWarp(w);}
    }
    return false;
  }
  async function routeTrainer(n){
    if(eventRunning||sceneChanging||journey.processing||failed||!n)return;
    const id=n.script-3000,trainer=OPENING_TRAINERS[id];if(!trainer)return;
    eventRunning=true;resetInput();
    const say=async key=>{for(const page of messagePages(trainer.messages[key]||'',{}))if(page)await showPage(page,trainer.name);};
    try{await settleAmbient();captureActors();journey.save(true);
      if(native.trainerWins?.includes(id)){await say(2);return;}
      n.emote='!';await delay(8);n.emote=null;const dir=Math.abs(player.x-n.x)>Math.abs(player.y-n.y)?player.x>n.x?3:2:player.y>n.y?1:0;face(n.uid,dir);const [dx,dy]=directions[dir],distance=Math.max(Math.abs(player.x-n.x),Math.abs(player.y-n.y)),lateral=Math.abs((player.x-n.x)*dy-(player.y-n.y)*dx),steps=lateral<.35?Math.max(0,Math.floor(distance)-1):0;if(steps){move(n.uid,[[8+dir,steps]]);await Promise.all(motions.filter(t=>t.id===n.uid).map(t=>t.promise));}await say(0);
      const completed=new Promise(resolve=>pendingBattle=resolve);rival=trainer.name;
      try{await startBattle(true,{story:trainer.name,trainerId:id,aiFlags:trainer.aiFlags,doubles:trainer.battleStyle===1,p1:journey.configs(),p2:structuredClone(trainer.party).map(p=>({...p,item:GEN5.items.find(i=>i.id===p.heldItem)?.key||p.item||''}))});await completed;}finally{pendingBattle=null;}
      if(native.won){native.trainerWins??=[];if(!native.trainerWins.includes(id))native.trainerWins.push(id);}
      else{journey.heal();await changeZone([8,20].includes(native.healZone)?native.healZone:398,7,13);}
    }catch(error){failed=error;console.error(error);$('world').dataset.eventError=error.message;await showPage(error.message);}
    finally{eventRunning=false;n.emote=null;derivePhase();captureActors();if(!failed)journey.save(true);}
  }
  async function routeItem(n){
    if(eventRunning||!n)return;const item=window.ROUTE3_DATA?.items?.[n.script]||window.STRIATON_DATA?.items?.[n.script]||window.ROUTE2_DATA?.items?.[n.script];if(!item)return;
    eventRunning=true;try{if(!journey.addItem(item.id,item.count)){await showPage('La Borsa è piena.');return;}if(native.zone===319){native.routeItems??=[];native.routeItems.push(n.uid);}native.collectedItems??={};native.collectedItems[native.zone]??=[];native.collectedItems[native.zone].push(n.uid);const record=data().actors.find(a=>a.id===n.uid);if(record?.flag&&!has(record.flag))native.flags.push(record.flag);n.hidden=true;await showPage('Hai trovato '+ORIGINAL_EVENTS.itemNames[item.id]+'!');captureActors();journey.save(true);}finally{eventRunning=false;}
  }
  function target(){
    const p=grid(),[dx,dz]=directions[frames.indexOf(facing)],front={x:p.x+dx,z:p.z+dz};
    const visible=fieldActors().filter(n=>n.fieldZone===native.zone&&Number.isFinite(n.script));
    const find=(tile,reach)=>visible.find(n=>{const at=NpcWalk.cell(n);return Math.abs(at.x-player.x)<reach&&Math.abs(at.y-player.y)<reach&&Math.floor(at.x+origin()[0])===tile.x&&Math.floor(at.y+origin()[1])===tile.z;});
    let n=find(front,1.6);
    if(n)return {kind:'actor',n,script:n.script};
    // IRBI's counter tile is behaviour 0xD4. A wall or merely distant actor
    // does not permit talking through it. The nurse stands one tile beyond it.
    const wx=front.x+.5-origin()[0],wz=front.z+.5-origin()[1],g=renderer.scene.permissionGrids.find(g=>wx>=g.x-16&&wx<g.x+16&&wz>=g.z-16&&wz<g.z+16);
    if(g){const i=8+((Math.floor(wz-g.z)+16)*32+Math.floor(wx-g.x)+16)*8;if(g.bytes[i]===0xd4){n=find({x:front.x+dx,z:front.z+dz},2.6);if(n)return {kind:'actor',n,script:n.script};}}
    // Background records use grid X/Z followed by vertical height. Directions
    // 0..3 are N/E/W/S; 4 is any, 5 horizontal and 6 vertical.
    const dir=frames.indexOf(facing),allowed=[[0],[3],[2],[1],[0,1,2,3],[2,3],[0,1]];
    const b=data().background.find(b=>b.condition<2&&b.x===front.x&&b.z===front.z&&allowed[b.direction]?.includes(dir));if(b)return {kind:'background',script:b.script};
    return null;
  }
  async function cutTree(n){if(eventRunning)return;eventRunning=true;try{if(!state.party.some(p=>p.pp.some(m=>m.id===15))){await showPage('Questo albero può essere tagliato con la mossa Taglio.');return;}await showPage('Vuoi usare Taglio?');if(await choice(['SÌ','NO'])!==0)return;await showPage('Il Pokémon usa Taglio!');await delay(12);native.dreamyardTreeCut=true;n.hidden=true;captureActors();}finally{eventRunning=false;journey.save(true);}}
  async function daycareService(){if(eventRunning)return;eventRunning=true;resetInput();try{
   if(native.daycareRecovery){await showPage('Il Pokémon affidato è conservato nel salvataggio, ma i suoi dati richiedono un recupero. La tua squadra non è stata modificata.');return;}
   const care=native.daycare;
   if(care){const p=care.pokemon,fee=100+100*Math.max(0,p.level-care.level);await showPage('Ci siamo presi cura di '+(p.nickname||p.name)+'. Ora è al livello '+p.level+'. Vuoi ritirarlo? Il costo è di '+fee+' ₽.');if(await choice(['SÌ','NO'])!==0)return;if(state.party.length>=6){await showPage('Non hai posto in squadra!');return;}if(state.money<fee){await showPage('Non hai abbastanza soldi.');return;}state.money-=fee;const healed=makeMon(p.name,p.level,p);state.party.push({...p,...journey.pack(healed,p.xp)});delete native.daycare;journey.displayPartner();await showPage('Ecco il tuo Pokémon!');
   }else{await showPage('Questa è la Pensione Pokémon. Vuoi affidarci un Pokémon?');if(await choice(['SÌ','NO'])!==0)return;const index=await choice([...state.party.map(p=>p.nickname||p.name),'Annulla']);if(index>=state.party.length)return;if(state.party.length<2||state.party.filter((p,i)=>i!==index&&p.hp>0).length===0){await showPage('Devi tenere con te almeno un Pokémon in grado di lottare.');return;}const p=state.party.splice(index,1)[0];native.daycare={pokemon:p,level:p.level,distance:0};journey.displayPartner();await showPage('Ci prenderemo cura di '+(p.nickname||p.name)+'. Torna a trovarci!');}
   }finally{eventRunning=false;journey.update();journey.save(true);}}
  async function neighborMessage(bank,index){if(eventRunning)return;eventRunning=true;resetInput();try{await message(bank,index);}finally{eventRunning=false;}}
  function interact(){if(eventRunning||sceneChanging||vm.running||failed)return;const t=target();if(t){currentActor=t.n?.uid;if(native.zone===397&&t.n?.name==='Komor'&&t.script===2000)return neighborMessage(436,value(16506)>=3?30:value(16507)<3?5:6);if(native.zone===6&&t.n?.name==='Belle'&&t.script===2000)return neighborMessage(351,10);if(native.zone===152&&t.n?.model===108)return cutTree(t.n);if(native.zone===319&&t.n?.model===108)return showPage('Questo albero può essere tagliato con la mossa Taglio.');if([319,7,152,321,322,324].includes(native.zone)&&t.script>=3000&&t.script<4000)return routeTrainer(t.n);if(t.script<2000){if(!ORIGINAL_EVENTS.scripts[data().script]?.supportedEntries.includes(t.script-1))return showPage('Sei arrivato a Levantopoli. Le prossime sfide saranno disponibili nel capitolo successivo.');return run(t.script-1);}if(native.zone===323&&t.script===2201)return daycareService();if([398,8,20].includes(native.zone))return cityService(t.script);if(t.script>=7000&&t.script<8000)return routeItem(t.n);}}
  function step(dt,moved,distance=0){
    if(window.SpeciesStudioMode||failed)return;
    if(state.trainer&&!document.hidden)state.trainer.playSeconds=Math.min(3599999,state.trainer.playSeconds+dt);
    warmTutorial();warmBank(data().script);fieldModels?.tick(dt);
    try{departures.tick(dt);tickMotions(dt);if(cameraTask){const c=cameraTask;c.elapsed+=dt;const f=Math.min(1,c.elapsed/c.duration);renderer.storyCamera=c.start.map((n,i)=>n+(c.target[i]-n)*f);if(f===1){cameraTask=null;c.resolve();}}}catch(error){failed=error;console.error(error);showPage(error.message);}
    const held=eventRunning||sceneChanging||journey.processing||battling||menuOpen()||failed;
    tickAmbient(dt,!held&&native.intro);warpCooldown=Math.max(0,warpCooldown-dt);if(held)return;if(moved&&distance>0)journey.daycareSteps(distance);
    if(!native.intro&&renderer.ready){run(4,782);return;}
    const p=grid(),key=native.zone+':'+p.x+':'+p.z;
    journey.update();if(key!==lastTile){lastTile=key;
    if(native.zone===317&&p.z<=671){native.zone=397;native.arrived=true;native.music=data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}
    if([6,321].includes(native.zone)&&window.ROUTE3_ASSETS){const at=ROUTE3_ASSETS.scenes[321].permissionGrids.some(g=>player.x>=g.x-16&&player.x<g.x+16&&player.y>=g.z-16&&player.y<g.z+16);const next=at?321:6;if(next!==native.zone){native.zone=next;if(next===321)native.route3=true;native.music=data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}}
    if(native.zone===319&&p.z<=608){native.zone=6;native.striaton=true;native.music=data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}
    if(native.zone===6&&p.z>=609){native.zone=319;native.music=data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}
    if(native.zone===397&&p.z>=672){native.zone=317;native.music=data().music;AudioEngine.setScene(native.music);syncActors();journey.save(true);return;}
    for(const trigger of data().triggers)if(value(trigger.var)===trigger.value&&p.x>=trigger.x&&p.x<trigger.x+trigger.width&&p.z>=trigger.z&&p.z<trigger.z+trigger.height){
      if(native.zone===6&&!ORIGINAL_EVENTS.scripts[data().script].supportedEntries.includes(trigger.script-1))return; // Next city chapter stays outside this arrival milestone.
      // The DS places friends instantly; our visible walk must finish first.
      // Recheck a stationary player without locking input while they arrive.
      if(native.zone===317&&trigger.script===5){const bodies=fieldActors();if(![3,4].every(id=>{const n=actor(id);return n&&!n.hidden&&bodies.includes(n);})){lastTile='';return;}}
      run(trigger.script-1);return;}}
    if([319,7,152,321,322,324].includes(native.zone)){const seen=fieldActors().find(n=>{const r=data().actors.find(a=>a.id===n.uid);if(!r||r.type!==1||native.trainerWins?.includes(n.script-3000))return false;const [dx,dy]=directions[n.direction],along=(player.x-n.x)*dx+(player.y-n.y)*dy,lateral=Math.abs((player.x-n.x)*dy-(player.y-n.y)*dx);if(along<.5||along>r.p0+.3||lateral>.35)return false;for(let d=.5;d<along;d+=.5)if(blocked(n.x+dx*d,n.y+dy*d))return false;return true;});if(seen){routeTrainer(seen);return;}}
    journey.encounter(dt,moved,distance);
  }
  function battleDone(s,kind){native.won=s?.battle.winner==='Alcide';if(pendingBattle){const done=pendingBattle;pendingBattle=null;done();return true;}return false;}
  initialize();syncActors();applyRoom();
  window.NativeStory={curtainOffset:stage=>(actor(stage+3)?.x??-6.5)+6.5,departures,visualActors:fieldActors,routeTrainer,showPage,choice,nickname,daycareService,vm,state:native,syncActors,battleDone,interact,captureActors,run,changeZone,tryWarp,occupied,blackout:()=>native.healZone===20?changeZone(20,7,13):native.healZone===8?changeZone(8,7,13):native.healZone===398?changeZone(398,7,13):changeZone(390,5,8),get music(){return native.music||data().music;},get locked(){return eventRunning||sceneChanging||!!failed||journey.processing;}};
  journey.interact=interact;journey.hint=()=>vm.running?'':target()?'E · Interagisci':'';journey.step=step;
  Object.defineProperty(journey,'locked',{get:()=>NativeStory.locked});
  $('dialogue').addEventListener('cancel',e=>{e.preventDefault();if(pendingMessage)pendingMessage();else pendingCancel?.();});
})();
