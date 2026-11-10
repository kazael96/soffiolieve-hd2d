/* IRBI field-event host. Narrative and movement programs are extracted, not rewritten. */
(() => {
  const journey=window.Journey,state=journey.state;
  const centerZones=new Set([398,8,20,41,65,99,109,115,122,146]);
  if(window.ACCUMULA_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],ACCUMULA_EVENTS[k]);OPENING_TRAINERS[64]=ACCUMULA_EVENTS.trainer;}
  if(window.ROUTE2_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],ROUTE2_EVENTS[k]);Object.assign(OPENING_TRAINERS,ROUTE2_TRAINERS);Object.assign(ORIGINAL_EVENTS.itemNames,ROUTE2_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,ROUTE2_DATA.itemDescriptions);}
  if(window.STRIATON_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],STRIATON_EVENTS[k]);Object.assign(OPENING_TRAINERS,STRIATON_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,STRIATON_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,STRIATON_DATA.itemDescriptions);}
  if(window.ROUTE3_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],ROUTE3_EVENTS[k]);Object.assign(OPENING_TRAINERS,ROUTE3_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,ROUTE3_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,ROUTE3_DATA.itemDescriptions);}
  if(window.PINWHEEL_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],PINWHEEL_EVENTS[k]);Object.assign(OPENING_TRAINERS,PINWHEEL_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,PINWHEEL_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,PINWHEEL_DATA.itemDescriptions);}
  if(window.CASTELIA_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],CASTELIA_EVENTS[k]);Object.assign(OPENING_TRAINERS,CASTELIA_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,CASTELIA_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,CASTELIA_DATA.itemDescriptions);}
  if(window.NIMBASA_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],NIMBASA_EVENTS[k]);Object.assign(OPENING_TRAINERS,NIMBASA_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,NIMBASA_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,NIMBASA_DATA.itemDescriptions);}
  if(window.DRIFTVEIL_EVENTS){for(const k of ['scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],DRIFTVEIL_EVENTS[k]);for(const z of DriftveilChapter.zones)ORIGINAL_EVENTS.zones[z]=DRIFTVEIL_EVENTS.zones[z];Object.assign(OPENING_TRAINERS,DRIFTVEIL_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,DRIFTVEIL_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,DRIFTVEIL_DATA.itemDescriptions);}
  if(window.MISTRALTON_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],MISTRALTON_EVENTS[k]);Object.assign(OPENING_TRAINERS,MISTRALTON_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,MISTRALTON_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,MISTRALTON_DATA.itemDescriptions);}
  if(window.ICIRRUS_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],ICIRRUS_EVENTS[k]);Object.assign(OPENING_TRAINERS,ICIRRUS_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,ICIRRUS_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,ICIRRUS_DATA.itemDescriptions);}
  if(window.OPELUCID_EVENTS){for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],OPELUCID_EVENTS[k]);Object.assign(OPENING_TRAINERS,OPELUCID_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,OPELUCID_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,OPELUCID_DATA.itemDescriptions);}
  if(window.LEAGUE_EVENTS){if(!window.LEAGUE_DATA)throw Error('Dati della tappa Lega non disponibili');for(const k of ['zones','scripts','texts'])Object.assign(ORIGINAL_EVENTS[k],LEAGUE_EVENTS[k]);Object.assign(OPENING_TRAINERS,LEAGUE_DATA.trainers);Object.assign(ORIGINAL_EVENTS.itemNames,LEAGUE_DATA.itemNames);if(window.MENU_ASSETS)Object.assign(MENU_ASSETS.itemDescriptions,LEAGUE_DATA.itemDescriptions);}
  const sceneZones={bedroom:391,home:390,bianca:392,biancaRoom:393,komorHome:394,komorRoom:395,lab:396,town:389};
  const zoneScenes=Object.fromEntries(Object.entries(sceneZones).map(([k,v])=>[v,k]));zoneScenes[317]='town';
  zoneScenes[6]='town';zoneScenes[8]='zone8';sceneZones.zone8=8;zoneScenes[397]='town';zoneScenes[319]='town';for(const zone of [398,399,400,401,402,403,404,405,320]){sceneZones['zone'+zone]=zone;zoneScenes[zone]='zone'+zone;}
  for(const z of [7,9,10,15,152,322,323,324,27,20]){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  zoneScenes[321]=zoneScenes[16]=zoneScenes[154]='town';
  for(const z of [17,18,19,155,250,251,252,249,28,41]){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  if(window.CasteliaChapter)for(const z of CasteliaChapter.zones){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  if(window.NimbasaChapter)for(const z of NimbasaChapter.zones){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  if(window.DriftveilChapter)for(const z of DriftveilChapter.zones){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  if(window.MistraltonChapter)for(const z of MistraltonChapter.zones){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  if(window.IcirrusChapter)for(const z of IcirrusChapter.zones){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  if(window.OpelucidChapter)for(const z of OpelucidChapter.zones){zoneScenes[z]='zone'+z;sceneZones['zone'+z]=z;}
  const native=state.original||(state.original={vars:{},flags:[],zone:sceneZones[state.scene],intro:false});
  if(window.STRIATON_DATA&&!native.chapter040){native.chapter040=true;for(const flag of [530,532,533,534,539,540,541,757,820,707])if(!native.flags.includes(flag))native.flags.push(flag);}
  if(window.ROUTE3_DATA&&!native.chapter042){native.chapter042=true;for(const flag of [517,572,625,562,614,751,1328])if(!native.flags.includes(flag))native.flags.push(flag);}
  if(window.PINWHEEL_DATA&&!native.chapter043){native.chapter043=true;for(const flag of [547,623,648,548,552,551,636,841,641])if(!native.flags.includes(flag))native.flags.push(flag);}
  if(window.CASTELIA_DATA&&!native.chapter046){native.chapter046=true;for(const flag of [702,703,796,797,798,799,800,843])if(!native.flags.includes(flag))native.flags.push(flag);}
  if(window.NIMBASA_DATA&&!native.chapter047){native.chapter047=true;for(const flag of [561,639])if(!native.flags.includes(flag))native.flags.push(flag);}
  if(window.DRIFTVEIL_DATA&&!native.chapter048){native.chapter048=true;for(const flag of [566,567,568,699,735,815,555,557,536,537])if(!native.flags.includes(flag))native.flags.push(flag);}
  if(window.MISTRALTON_DATA&&!native.chapter049){native.chapter049=true;for(const flag of [544,545,546,582,584,655,804,805,706,839])if(!native.flags.includes(flag))native.flags.push(flag);if((native.vars[16527]||0)<1&&!native.flags.includes(558))native.flags.push(558);}
  if(window.ICIRRUS_DATA&&!native.chapter050){native.chapter050=true;for(const flag of [575,576,579,658,676,678,780])if(!native.flags.includes(flag))native.flags.push(flag);}
  // IRBI common866 subroutine36..568 sets these hidden-actor flags. Apply
  // only on entry from an older chapter: clearing them later is plot state.
  if(window.OPELUCID_DATA&&!native.chapter051){native.chapter051=true;for(const flag of [577,578,587,588,589,603,604,605,606,607,613,659,688,838])if(!native.flags.includes(flag))native.flags.push(flag);}
  // IRBI common init866 sets662; only Skyla's gym program220 clears it.
  if(window.MISTRALTON_DATA&&!native.badges?.includes(5)&&!native.flags.includes(662))native.flags.push(662);
  const fieldModels=window.FIELD_MODEL_ASSETS?new FieldModels.Controller(renderer,FIELD_MODEL_ASSETS,id=>AudioEngine.playSound(id)):null;
  const names={180:'Aristide',91:'Silvestro',90:'Anemone',104:'Gasparago',182:'Triade',192:'Violante',88:'Camelia',89:'Rafan',97:'Nardo',92:'Iris',86:'Aloé',87:'Artemisio',76:'Cirillo',74:'Zania',85:'Spighetto',178:'Chicco',179:'Maisello',126:'Munna',127:'Musharna',7:'Komor',134:'Belle',105:'Aralia',147:'Mamma',24:'Padre',208:'Regalo',18:'Viandante',103:'N',100:'Ghecis'};
  const frames=[0,3,6,9],directions=[[0,-1],[0,1],[-1,0],[1,0]];
  let phoneLayout=null;
  let motions=[],pendingBattle=null,currentActor=null,pendingMessage=null,sceneChanging=false,failed=null,ambientTime=0,settleWaiters=[];
  const dragonFlight=window.OpelucidDragonFlight?.create({zone:()=>native.zone,presented:n=>renderer.hasPresentedActor?.(n)===true,time:()=>typeof t==='number'?t:0,pose,path:(from,to)=>window.OpelucidContinuity.path(from,to,native.zone),sample:n=>renderer.actorVisibility?.(n),moving:n=>motions.some(task=>actor(task.id)===n)});
  let fieldCovered=false,fadeRevision=0,actorZone=native.zone,actorsInitialized=false,triadCoverMode=null;
  const departures=new FieldActorExits.Controller({blocked:(x,y)=>blocked(x,y),obstructed:(record,p)=>record.plan.destination==='center-interior'&&fieldActors().some(n=>{return n.name==='Aralia'&&Math.abs(n.x-p.x)<.65&&Math.abs(n.y-p.y)<.65;}),pose, sample:n=>renderer.actorVisibility?.(n)||null,portal:async record=>{if(record.plan.kind!=='door')return null;const p=record.plan.anchor;if(native.door?.open&&Math.hypot(native.door.x-origin()[0]-p.x,native.door.z-origin()[1]-p.y)<3)return null;if(!fieldModels?.find(1,p.x,p.y))return null;const id=fieldModels.create(1,p.x,p.y);await fieldModels.play(id,0);await fieldModels.wait(id);return id;},finishPortal:record=>{if(record.handle!=null&&fieldModels?.handles.has(record.handle))void fieldModels.play(record.handle,1).then(()=>fieldModels.wait(record.handle)).then(()=>fieldModels.release(record.handle));}});
  window.MistraltonContinuity?.configure({native,departures,actors:()=>npcs,blockedAt:window.MistraltonChapter?.blockedAt,isCovered:()=>fieldCovered,recheck:()=>{lastTile='';},resourceGeneration:()=>renderer.resourceEpoch,prepareNpcFall,npcFallSound:id=>AudioEngine.playSound(id)});
  departures.restore(native.departures,native.zone,native);
  const warmedBanks=new Set();
  let tutorialWarm=null;
  function warmTutorial(){if(native.zone!==317||value(16508)>=1||tutorialWarm||!window.BattleEnvironment||!window.ROM_SPRITE_ANIM)return;tutorialWarm=Promise.all([window.BattleScreen?.prepare?.(),BattleEnvironment.prepare(Object.freeze({id:'route1',label:'Percorso 1',terrain:'grass'})),ROM_SPRITE_ANIM.prepare([{id:572,back:true},{id:504,back:false}]),window.NativeCapture?.preload(),window.MoveFX?.preload(1),window.AudioEngine?.preloadMove(1,{p1:572,p2:504})]).catch(()=>{tutorialWarm=null;});}
  function warmBank(bank){if(warmedBanks.has(bank)||!AudioEngine.enabled)return;warmedBanks.add(bank);const code=Object.values(ORIGINAL_EVENTS.scripts[bank]?.code||{}),sounds=code.filter(c=>['SEPlay','MEPlay'].includes(c.name)&&c.args[0]<0x4000).map(c=>({kind:'sfx',id:c.args[0]}));void AudioEngine.preloadEvents?.(sounds).catch(()=>warmedBanks.delete(bank));}
  let eventRunning=false,surfService=false,pcService=false,queued=null,reservedLiftArrival=null,pendingCancel=null,cameraTask=null,fadeTask=Promise.resolve(),soundTask=Promise.resolve(),lastTile='',warpCooldown=0;
  const scriptSounds=new Set();
  function stopScriptSounds(){for(const id of scriptSounds)AudioEngine.stopSound?.(id);scriptSounds.clear();}
  const vm=new FieldEventVM(ORIGINAL_EVENTS,native,{
    playerName:()=>state.playerName||'Alcide',speciesName:id=>GEN5.species.find(s=>s.id===id)?.en||String(id),party:i=>state.party[i],command
  });
  const data=()=>ORIGINAL_EVENTS.zones[native.zone];
  const origin=()=>(window.OpelucidChapter?.globalZones.includes(native.zone)||window.IcirrusChapter?.globalZones.includes(native.zone)||window.MistraltonChapter?.globalZones.includes(native.zone))?[784,752]:[389,317,397,319,6,321,16,154,326,62,329,96].includes(native.zone)?[784,752]:[16,16];
  const world=(x,z)=>({x:x+.5-origin()[0],y:z+.5-origin()[1]});
  // City WB exits encode the corner and span, alongside rail-position unions.
  const warpPoint=(w,zone=native.zone)=>({x:w.x/16+((window.LEAGUE_EVENTS?.zones[zone]||window.OPELUCID_EVENTS?.zones[zone]||window.ICIRRUS_EVENTS?.zones[zone]||window.MISTRALTON_EVENTS?.zones[zone]||window.CASTELIA_EVENTS?.zones[zone]||window.NIMBASA_EVENTS?.zones[zone]||window.DRIFTVEIL_EVENTS?.zones[zone])?(w.width-1)/2:0),z:w.z/16+((window.LEAGUE_EVENTS?.zones[zone]||window.OPELUCID_EVENTS?.zones[zone]||window.ICIRRUS_EVENTS?.zones[zone]||window.MISTRALTON_EVENTS?.zones[zone]||window.CASTELIA_EVENTS?.zones[zone]||window.NIMBASA_EVENTS?.zones[zone]||window.DRIFTVEIL_EVENTS?.zones[zone])?(w.height-1)/2:0)});
  const grid=()=>({x:Math.floor(player.x+origin()[0]),z:Math.floor(player.y+origin()[1])});
  const has=flag=>native.flags.includes(flag),value=id=>vm.value(id);
  const actor=id=>id===255?player:npcs.find(n=>n.uid===id);
  const fieldMotion=window.IcirrusFieldMotion?.create({state:()=>native,actor,sound:id=>AudioEngine.playSound(id)});
  const fieldFall=window.OpelucidFieldFall?.create({state:()=>native,actor,ground:(x,y)=>renderer.groundHeight(x,y),sound:id=>AudioEngine.playSound(id)});
  const quicksand=window.OpelucidQuicksand?.create({state:()=>native,hero:()=>player,ground:(x,y)=>renderer.groundHeight(x,y)});
  const slide=window.LeagueSlide?.create({state:()=>native,pose,sound:id=>AudioEngine.playSound(id),stop:id=>AudioEngine.stopSound?.(id)});
  async function prepareNpcFall(body,ids){await warmFieldSounds(ids);if(native.zone!==body.fieldZone)return;const prepare=async()=>{const required=[...fieldActors(),body];await renderer.requireActors?.(required);if(renderer.resourcePlan&&renderer.hasResources&&!renderer.hasResources(renderer.resourcePlan(required)))throw renderer.loadingError||Error('Grafica della discesa non pronta');};if(renderer.resourceGate)await renderer.resourceGate('npc-sand-'+body.name,prepare);else await prepare();}
  async function warmFieldSounds(ids){if(!AudioEngine.enabled)return;const tracks=[];try{const load=async()=>{for(const track of tracks)track.stop();tracks.length=0;for(const id of ids){const record=window.FIELD_AUDIO?.[id];if(!record)throw Error('Suono originale di campo mancante: '+id);const track=AudioEngine.createCinematic(record.src);tracks.push(track);await track.prepare();}};if(renderer.resourceGate)await renderer.resourceGate('native-field-sounds-'+ids.join('-'),load);else await load();}finally{for(const track of tracks)track.stop();}}
  function pose(n,dir,step=0){
    if(!n.nativeSlide&&!(n.fieldZone===213&&[211,213].includes(n.model))&&native.zone!==97&&n.fieldZone===native.zone&&((window.OpelucidChapter?.zones.includes(native.zone)||window.IcirrusChapter?.zones.includes(native.zone)||window.MistraltonChapter?.zones.includes(native.zone))||[389,317,397,319,6,321,16,7,152,324,17,18,19,154,155,250,251,252,249,28,41,62,63,64,91,329,253,96,99].includes(n.fieldZone))&&renderer.groundHeight)n.height=renderer.groundHeight(n.x,n.y,n.railHeight??((renderer.scene.chapter050||renderer.scene.chapter051)?n.height:undefined));
    n.height=window.MistraltonGym?.actorHeight(n,n.height)??n.height;
    n.direction=dir;const fieldFrame=window.MistraltonPuzzles?.actorFrame?.(n);if(fieldFrame!==null&&fieldFrame!==undefined){n.frame=fieldFrame;n.flip=false;return;}const count=OPENING_SPRITES[n.name]?.length||window.ROM_SPRITES?.[n.name]?.length;
    if(count===1){n.frame=0;n.flip=false;}
    else if(count===7||count===9){n.frame=[0,2,4,4][dir]+(step===1?1:step===2?(dir<2?1:2):0);n.flip=dir===3||(dir<2&&step===2);}
    else {n.frame=frames[dir]+step;n.flip=false;}
  }
  function face(id,dir){const n=actor(id);if(!n)return;if(id===255)facing=frames[dir];else pose(n,dir);}
  function putActor(record){
    const graphic=window.LeagueGraphics?.model(native.zone,record.model)??record.model;
    if(graphic!==record.model)record={...record,model:graphic};
    if(native.zone===343&&record.model===162)record={...record,model:209};
    if(record.rail&&!record.railOriginal&&window.NativeRails?.has(native.zone))record=NativeRails.actor(native.zone,record);
    const n={...world(record.x,record.z),...(record.railOriginal?{railOriginal:record.railOriginal,railHeight:record.y/65536}:{}),fieldZone:native.zone,uid:record.id,model:record.model,name:names[record.model]||'Original'+record.model,script:record.script,direction:record.direction,frame:frames[record.direction],height:record.model===208?.5:(record.y||0)/65536};
    if(native.zone===199&&record.model<162)n.height=window.IcirrusChapter?.surfaceAt(native.zone,n.x,n.y,n.height)?.height??n.height;
    n.wander=NpcWalk.create(record,{x:n.x,y:n.y});if(([185,8198,8199].includes(record.model)||[29,114].includes(native.zone)&&record.model===0)){n.noShadow=true;n.gimmick=true;if(native.zone===114&&record.model===0)n.collisionOnly=true;}pose(n,record.direction);npcs.push(n);window.MistraltonContinuity?.introduced(n,npcs);renderer.requireActors?.(fieldActors());return n;
  }
  function syncActors(){
    const previousActors=[...npcs];npcs.splice(0);for(const n of data().actors){
      if(native.zone===64&&n.model===162)continue; // Optional repeat ferris-wheel dates are outside this chapter.
      if(n.flag&&has(n.flag)&&!(native.zone===63&&[0,4].includes(n.id)))continue;if(native.zone===321&&[23,24].includes(n.id))continue;if(native.zone===16&&value(16530)<3&&[6,8].includes(n.id))continue;if(native.zone===317&&n.x<773)continue;
      if(native.zone===397&&value(16507)<3&&[521,523,524,525,637,638,1106,1114].includes(n.flag))continue;
      if(native.zone===397&&[1106,1114].includes(n.flag))continue;
      if(native.zone===319&&[8195].includes(n.model))continue;
      if(native.zone===6&&[13,14].includes(n.id))continue;
      // Curtain records are logical moving mechanisms; meshes are in the scene.
      if(native.zone===152&&(n.model===8195||n.id===8&&native.dreamyardTreeCut))continue;
      if(native.zone===319&&native.routeItems?.includes(n.id))continue;
      if(centerZones.has(native.zone)&&[657].includes(n.flag))continue;
      // Post-game actors use initial hidden flags from the new-game state.
      if([736,681,682,683,684,685,656,675,817,1230,1143].includes(n.flag))continue;
      putActor(n);
    }
    const saved=native.actors?.[native.zone]||[];
    for(const n of npcs){const previous=saved.find(p=>p.uid===n.uid),record=data().actors.find(p=>p.id===n.uid);if(previous&&(!record.flag||!(native.actorFlags?.[native.zone]||[]).includes(record.flag)))Object.assign(n,structuredClone(previous));}
    slide?.adopt(previousActors,npcs);
    if(native.zone===199)for(const n of npcs)if(n.model<162)n.height=window.IcirrusChapter?.surfaceAt(native.zone,n.x,n.y,n.height)?.height??n.height;

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
    if(window.MistraltonChapter?.groups.some(g=>g.includes(native.zone)))for(const adjacent of MistraltonChapter.members(native.zone).filter(z=>z!==native.zone))for(const record of ORIGINAL_EVENTS.zones[adjacent].actors){if(record.flag&&has(record.flag))continue;const n=putActor(record);Object.assign(n,{fieldZone:adjacent,projection:true});}
    if(actorsInitialized&&actorZone===native.zone&&((window.OpelucidChapter?.zones.includes(native.zone)||window.IcirrusChapter?.zones.includes(native.zone)||window.MistraltonChapter?.zones.includes(native.zone))||[16,17,19,154,155,28,29,30,31,32,33,34,35,38,40,51,56,326,327,328,90,62,65,63,64,91,329,253,96,99].includes(native.zone)))for(const old of previousActors)if(!old.hidden&&!old.gimmick&&!npcs.some(n=>n.uid===old.uid))departures.depart(old,native.zone,{covered:fieldCovered});
    if(actorsInitialized)departures.preserve(previousActors,npcs,{covered:fieldCovered,sameField:actorZone===native.zone||window.MistraltonChapter?.sameField(actorZone,native.zone)||[389,317,397,319,6,321,16,154,326,62,329,96].includes(actorZone)&&[389,317,397,319,6,321,16,154,326,62,329,96].includes(native.zone)});actorZone=native.zone;actorsInitialized=true;
  }
  function derivePhase(){
    window.MistraltonFly?.migrate(state);
    state.phase=native.zone===114?'brycenGym':native.icirrus?'icirrus':[198,199,200,201,202,203,204].includes(native.zone)?'twistMountain':native.zone===108?'skylaGym':[338,339,340,341,342].includes(native.zone)?'celestial':native.zone===337?'route7':native.mistralton?'mistralton':[195,196,197].includes(native.zone)?'chargestone':[331,194].includes(native.zone)?'route6':native.driftveil?'driftveil':native.nimbasa?'nimbasa':native.route4?'route4':native.zone===28||native.castelia?'castelia':[249,250,251,252].includes(native.zone)?'skyarrow':[154,155].includes(native.zone)?'pinwheel':[17,18,19].includes(native.zone)||value(16530)>=3?'nacreneGym':native.zone===16||native.nacrene?'nacrene':native.zone===324?'wellspring':native.route3?'route3':value(16532)>=5?'dreamyardDone':value(16532)>=1?'dreamyard':native.striaton?'striaton':native.route2?'route2':value(16506)>=3?'nextRoute':value(16506)>=2?'plasma':value(16507)===1?'centerHeal':value(16507)===2?'centerTour':value(16507)===3&&value(16506)>=1?'plasma':native.arrived?'arrival':value(16508)>=1?'route':value(16512)===3?'tutorial':value(16512)===2?'routeStart':value(16505)===1?'map':value(16504)===1?'lab':value(16517)===1?'biancaHouse':value(16513)===2?'mother':state.starter?'belle':'gift';
    journey.update();
  }
  function initialize(){
    if(native.initialized)return;
    native.flags=[...new Set([...(native.flags||[]),501,679])];native.zone=391;native.initialized=true;
    player=world(5,6);facing=3;
  }
  function clearDepartures(){
    const carry=departures.save().filter(r=>window.MistraltonContinuity?.carry(r)||['route4-gate','nimbasa-gate-wait'].includes(r.plan.destination)&&!has(697)||r.plan.destination==='driftveil-approach'&&value(16527)<1||r.plan.destination==='cold-storage-front'&&value(16527)===1);
    departures.clear();departures.restore(carry,native.zone,native);
  }
  function advanceRoute4Friend(){
    const r=departures.records.get('Komor');
    if(!r||r.plan.destination!=='route4-gate'||r.stage!=='resident')return;
    if(native.zone===326){const sample=renderer.actorVisibility?.(r.actor);if(sample&&sample.sequence!==r.sampleSequence){r.sampleSequence=sample.sequence;r.zero=sample.visible?0:r.zero+1;}if((r.zero||0)<2)return;}
    Object.assign(r.actor,{x:-10.5,y:1.3,height:0,fieldZone:90,uid:3,exitProbe:false,exitClip:[0,0,-1,-1.5]});
    r.zone=90;r.plan={kind:'arrival',points:[{x:-10.5,y:-1.5},{x:-10.5,y:-7.5}],anchor:{x:-10.5,y:-7.5},clip:[0,0,-1,-1.5],background:true,destinationZone:90,targetUid:3,destination:'nimbasa-gate-wait',itineraryVersion:1};r.index=0;r.stage='walk';r.opened=true;r.zero=0;
  }
  function advanceDriftveilFriend(){
    const r=departures.records.get('Komor');if(!r||r.plan.destination!=='driftveil-approach'||r.zone!==329||r.stage!=='resident')return;
    if(native.zone===329){const sample=renderer.actorVisibility?.(r.actor);if(sample&&sample.sequence!==r.sampleSequence){r.sampleSequence=sample.sequence;r.zero=sample.visible?0:r.zero+1;}if((r.zero||0)<2)return;}
    const start={x:-536.5,y:-319.5},goal={x:-581.5,y:-319.5},blockedThere=(x,y)=>{const g=DRIFTVEIL_SCENES[96].permissionGrids.find(g=>x>=g.x-16&&x<g.x+16&&y>=g.z-16&&y<g.z+16);if(!g)return true;return !!(g.bytes[8+((Math.floor(y-g.z)+16)*32+Math.floor(x-g.x)+16)*8+2]&1);};
    Object.assign(r.actor,{...start,height:1,fieldZone:96,uid:13,exitProbe:false,exitClip:[-1,0,0,-537.5]});
    r.zone=96;r.plan={kind:'arrival',points:[{x:-537.5,y:-319.5},...FieldActorExits.route({x:-537.5,y:-319.5},goal,blockedThere)],anchor:goal,clip:[-1,0,0,-537.5],background:true,destinationZone:96,targetUid:13,destination:'driftveil-approach',itineraryVersion:1};r.index=0;r.stage='walk';r.opened=true;r.zero=0;
  }
  function captureActors(){native.departures=departures.save();native.actors??={};native.actorFlags??={};native.actorFlags[native.zone]=[...native.flags];native.actors[native.zone]=structuredClone(npcs.filter(n=>!n.projection));}
  function delay(frames){return window.GameSpeed?.wait(Math.max(0,frames)*1000/30)||new Promise(resolve=>setTimeout(resolve,Math.max(0,frames)*1000/30));}
  function applyRoom(){if(state.scene==='bedroom')renderer.scene=OPENING_ASSETS.scenes[native.roomMess?'bedroomMess':'bedroom'];}
  function cameraTo(target,frames,view=null){
    const start=[...(renderer.storyCamera||renderer.center)];
    let resolve;const promise=new Promise(r=>resolve=r);cameraTask={start,target,elapsed:0,duration:frames/30,promise,resolve,view};
  }
  function fade(to,frames=8,color='#000'){
    let cover=$('fieldFade');if(!cover){cover=document.createElement('div');cover.id='fieldFade';cover.style.cssText='position:fixed;inset:0;z-index:80;pointer-events:none;opacity:0';document.body.append(cover);}
    const revision=++fadeRevision;if(to===0)fieldCovered=false;cover.style.background=color;cover.style.transition=`opacity ${frames/30/(window.GameSpeed?.rate||1)}s linear`;cover.style.opacity=String(to);fadeTask=delay(frames).then(()=>{if(revision!==fadeRevision)return;cover.style.transition='none';cover.style.opacity=String(to);fieldCovered=to===1;if(fieldCovered){window.MistraltonContinuity?.coveredTransition();clearDepartures();}});return fadeTask;
  }
  function showPage(text,speaker='',{advanceAfter=null}={}){
    const d=$('dialogue');$('speakerName').textContent=speaker;$('dialogueTitle').textContent='';$('dialogueText').textContent=text;
    $('dialoguePortrait').hidden=true;$('dialogueBattle').hidden=true;$('starterChoices').hidden=true;$('dialogueContinue').hidden=false;
    const printing=window.NativeSettings?.message($('dialogueText'),text);
    $('dialogueContinue').textContent='▼';if(!d.open)d.showModal();phoneLayout?.();resetInput();
    let advanceReady=!advanceAfter;if(advanceAfter)void Promise.resolve(advanceAfter).catch(()=>{}).then(()=>advanceReady=true);
    return new Promise(resolve=>{pendingMessage=()=>{if(printing&&!printing.done){printing.finish();return;}if(!advanceReady)return;printing?.cancel();pendingMessage=null;d.close();resolve();};$('dialogueContinue').onclick=pendingMessage;});
  }
  async function message(bank,index,machine=vm,options){
    const text=ORIGINAL_EVENTS.texts[bank]?.[index];if(text===undefined)throw Error(`Missing original message ${bank}:${index}`);
    $('dialogue').dataset.source=bank+':'+index;
    for(const page of messagePages(text,machine.words))await showPage(page,'',options);
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
    // The first battle is imminent; prepare its UI while the player chooses.
    void Promise.resolve(window.BattleScreen?.prepare?.()).catch(()=>{});
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
    native.healZone=centerZones.has(native.zone)?native.zone:398;if(native.zone===398&&value(16507)===1)vm.set(16507,2);return true;
  }
  async function cityService(script){
    if(eventRunning||sceneChanging||journey.processing||failed)return;
    eventRunning=true;resetInput();
    try{
      if(script===10090){pcService=true;try{await window.NativeUI.pc();}finally{pcService=false;}}
      else if(script===2100){await healAtCenter();if(native.zone===398&&value(16507)===2)await vm.run(796,6);}
      else if(script===2101){await message(346,13);await message(346,24);
      }else if(script===10100||script===10105){await showPage(ORIGINAL_EVENTS.texts[346][24]);}
      else if(script===10397){await showPage('Non ci sono Doni Segreti da ricevere.');}
      else await showPage('Questo servizio non è disponibile nella demo.');
      derivePhase();captureActors();
    }catch(error){failed=error;$('world').dataset.eventError=error.message;console.error(error);}
    finally{eventRunning=false;journey.save(true);}
  }
  async function nickname(index=0){
    const pokemon=typeof index==='object'?index:state.party[index];if(!pokemon)throw Error('Pokémon da rinominare non disponibile');
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
      const [code,repeats]=item;let dir=null,distance=0,duration=0,nativeVector=null;
      if(code>=0&&code<=3){dir=code;duration=1/30;}
      else if(code>=4&&code<=7){dir=code-4;distance=1;duration=32/30;}
      else if(code>=8&&code<=11){dir=code-8;distance=1;duration=16/30;}
      else if(code>=12&&code<=15){dir=code-12;distance=1;duration=8/30;}
      else if(code>=16&&code<=19){dir=code-16;distance=1;duration=4/30;}
      else if(code>=20&&code<=23){dir=code-20;distance=1;duration=2/30;}
      else if(code>=24&&code<=27){dir=code-24;duration=32/30;}
      else if(code>=40&&code<=43){dir=code-40;duration=2/30;}
      else if(code>=163&&code<=166){dir=code-163;distance=1;duration=6/30;}
      else if(code>=28&&code<=31){dir=code-28;duration=16/30;}
      else if(code>=48&&code<=51){dir=code-48;duration=8/30;}
      else if(code>=32&&code<=35){dir=code-32;duration=8/30;}
      else if(code>=36&&code<=39){dir=code-36;duration=4/30;}
      else if(code>=76&&code<=79){dir=code-76;distance=1;duration=6/30;}
      else if(code>=172&&code<=180){const nativeMotion=window.OPELUCID_FIELD_MOTION?.movements[code];if(!nativeMotion)throw Error('Missing native vector movement '+code);if(code===180&&[211,213].includes(n.model)&&!n.nativeDragonFlight){n.nativeDragonFlight=true;n.noShadow=true;n.nativeAnimationStart=typeof t==='number'?t:0;}duration=nativeMotion.ticks/30;dir=nativeMotion.direction;nativeVector=nativeMotion.vectorTilePerTick.map(v=>v*nativeMotion.ticks);}
      else if(code===171){const effect=window.MistraltonPuzzles?.movement?.(n,code,task.elapsed+dt);if(!effect)throw Error('Unsupported original object movement '+code);duration=effect.duration;n.frame=effect.frame;n.flip=false;}
      else if(code===61){duration=2/30;}
      else if(code===63){duration=8/30;}
      else if(code===69){duration=1/30;if(!task.departure){departures.depart(n,native.zone,{covered:fieldCovered});n.hidden=true;task.departure=true;}const record=departures.records.get(FieldActorExits.identity(n));if(record&&!record.plan.background&&record.plan.kind!=='path'&&record.plan.kind!=='resident')continue;}
      else if(code===70){duration=1/30;n.hidden=false;} // IRBI021989e8 clears actor visibility bit4; ninja appearances are covered above.
      else if(code===75||code===159){duration=16/30;n.emote=code===75?'!':'?';}
      else if([100,181,182,183].includes(code)){
        const base=OPENING_GESTURES[n.name],gesture=code===182||code===183?base?.variants?.[code]:base;if(!gesture)throw Error('Missing original gesture for '+n.name);
        duration=gesture.steps.reduce((sum,step)=>sum+step[1],0)/30;
        let elapsed=task.elapsed*30;n.flip=false;
        for(const [frame,hold] of gesture.steps){n.frame=frame;if(elapsed<hold)break;elapsed-=hold;}
      }
      else if(code===62){duration=4/30;}
      else if(code===31){duration=8/30;}
      else if(code===65||code===66){duration=1/30;n.nativeMovementMode=code;}
      else if(code===71||code===72){duration=1/30;}
      else throw Error('Unsupported original movement '+code);
      if(!task.start){task.start={x:n.x,y:n.y,height:n.height||0};if(dir!==null)face(task.id,dir);}
      task.elapsed+=dt;let f=Math.min(1,task.elapsed/duration);if(code>=76&&code<=79){const at=Math.min(5,Math.floor(f*6)),part=f*6-at,points=[0,2,5,8,10,13,16];f=(points[at]+part*(points[at+1]-points[at]))/16;}
      if(nativeVector){n.x=task.start.x+nativeVector[0]*f;n.y=task.start.y+nativeVector[2]*f;n.height=task.start.height+nativeVector[1]*f;}
      if(distance){const [dx,dy]=directions[dir];n.x=task.start.x+dx*f*distance;n.y=task.start.y+dy*f*distance;if(task.id===255)moving=true;else pose(n,dir,[1,0,2,0][Math.floor(task.elapsed*30/(duration*30/2))%4]);}
      if(code>=28&&code<=31&&task.id!==255)pose(n,dir,[1,0,2,0][Math.floor(f*4)%4]);if(code>=48&&code<=51)n.jumpLift=Math.sin(Math.PI*f)*.25;
      if(task.elapsed>=duration){if(!fieldFall?.busy(task.id))n.jumpLift=0;if(task.id!==255){pose(n,n.direction);n.emote=null;}task.elapsed=0;task.start=null;if(++task.count>=Math.max(1,repeats)){task.index++;task.count=0;}}
    }
  }
  function fieldActors(){const actors=npcs.filter(n=>!n.hidden),visible=window.MistraltonContinuity?.visibleActors(actors)||actors;return departures.visible(visible,player).filter(n=>n.exitPlan?.chapter049||n.continuityPlan?.chapter049||window.MistraltonChapter?.zones.includes(n.fieldZone)||(window.IcirrusChapter?.zones.includes(n.fieldZone)||window.OpelucidChapter?.zones.includes(n.fieldZone))?(window.MistraltonContinuity?.sameField(n.fieldZone,native.zone)??n.fieldZone===native.zone):!(window.NimbasaChapter?.zones.includes(n.fieldZone)||window.DriftveilChapter?.zones.includes(n.fieldZone))||n.fieldZone===native.zone);}
  function sameFieldHeight(n){return !window.OpelucidChapter?.zones.includes(native.zone)||Math.abs((n.railHeight??n.height??0)-(native.zone===114?native.fieldHeight??0:native.railCurrent?.height??native.fieldHeight??0))<1.8;}
  function occupied(x,y){return fieldActors().some(n=>sameFieldHeight(n)&&(!n.gimmick||n.collisionOnly)&&((window.LeagueGym?.sameLevel(n)??true)&&(window.OpelucidGym?.sameLevel(n)??true)&&(window.IcirrusGym?.sameLevel(n)??true)&&(window.MistraltonGym?.sameLevel(n)??true))&&((n.height||0)>=0||native.zone===97)&&(native.zone===114||!window.NativeRails?.has(native.zone)||Math.abs((n.railHeight??n.height??0)-(native.railCurrent?.height??native.fieldHeight??0))<1.8)&&NpcWalk.occupies(n,x,y));}
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
    if(eventRunning||failed)return;
    const narrative=bank===data().script&&(window.OpelucidContinuity?.arrivalEvent(native.zone,entry+1)||data().onEnter?.some(e=>e.entry===entry&&value(e.var)===e.value)||data().triggers?.some(e=>e.script===entry+1&&value(e.var)===e.value));
    if(narrative&&(window.MistraltonContinuity?.prepareEvent(native.zone,entry+1,npcs)===false||[192,193].includes(native.zone)&&window.MistraltonContinuity?.waitingFor(native.zone,['Komor']))){native.pendingZoneEntry={zone:native.zone,bank,entry};lastTile='';journey.save(true);return;}
    delete native.pendingZoneEntry;window.Bicycle?.dismount();eventRunning=true;resetInput();const before=structuredClone(state);
    try{warmBank(bank);await settleAmbient();if(window.OpelucidChapter?.zones.includes(native.zone))await renderer.prepareScene?.();captureActors();journey.save(true);
      await vm.run(bank,entry);native.intro=true;
      if(bank===778&&entry===13&&queued===1){
        queued=null;const friends=npcs.filter(n=>n.uid===250||n.uid===240);native.zone=317;native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);delete native.actors?.[317];
        syncActors();npcs.push(...friends);await vm.run(634,0);
      }
      // IRBI reserves a one-based entry in the destination map. Finish the
      // current VM first; keep its promise/input lock through the arrival.
      for(let chain=0;queued!==null;chain++){
        if(chain>=5)throw Error('Original reserved-script chain exceeded its limit');
        const next=queued;queued=null;if(!Number.isInteger(next)||next<1)throw Error('Invalid original reserved script '+next);
        if(native.zone===205&&next===4&&window.OpelucidContinuity?.prepareEvent(205,4)===false){await fade(0,8);break;}
        if(window.OpelucidContinuity?.arrivalEvent(native.zone,next)&&window.OpelucidContinuity.prepareEvent(native.zone,next)===false){native.pendingZoneEntry={zone:native.zone,bank:data().script,entry:next-1};lastTile='';await fade(0,8);break;}await vm.run(data().script,next-1);
      }
      if(bank===778&&native.zone===396&&value(16505)===0)await vm.run(792,0);
      if(native.zone===398&&value(16507)===0)await vm.run(796,0);
      if(native.zone===398&&value(16507)===2)await vm.run(796,6);
      if(native.blackoutQueued){native.blackoutQueued=false;journey.heal();renderer.storyCamera=null;await changeZone(centerZones.has(native.healZone)?native.healZone:398,7,13);}
      for(let chain=0;chain<5;chain++){if(![9,10].includes(native.zone))break;const next=data().onEnter?.find(e=>value(e.var)===e.value);if(!next||data().script===bank&&next.entry===entry)break;bank=data().script;entry=next.entry;await vm.run(bank,entry);}
      derivePhase();captureActors();if((window.OpelucidChapter?.zones.includes(native.zone)||window.IcirrusChapter?.zones.includes(native.zone)||window.MistraltonChapter?.zones.includes(native.zone))||native.zone===317||window.PINWHEEL_EVENTS&&[16,17,18,19,154,155,28,29,30,31,32,33,34,35,38,40,41,51,56,326,327,328,90,62,65,63,64,91,329,253,96,99].includes(native.zone))syncActors();await renderer.prepareScene?.();captureActors();eventRunning=false;journey.save(true);
    }catch(error){
      queued=null;reservedLiftArrival=null;failed=error;console.error(error);$('world').dataset.eventError=error.message;
      // Keep the last complete scene on disk. A reload retries the interrupted event.
      state.checkpoint=before;await showPage('La scena originale non può proseguire: '+error.message);
    }finally{eventRunning=false;if(failed){slide?.reset();window.LeagueCamera?.reset(renderer);stopScriptSounds();}if(triadCoverMode&&!failed){triadCoverMode=null;await fade(0,4);}
    }
  }
  async function command(c,a,v,m){
    const textBank=m.bank===862?283:ORIGINAL_EVENTS.zones[Object.keys(ORIGINAL_EVENTS.zones).find(z=>ORIGINAL_EVENTS.zones[z].script===m.bank)]?.text;
    if(reservedLiftArrival===native.zone&&['NativeOpcode401','NativeOpcode402'].includes(c.name)){
      // 394/395 initialize the destination platform under opaque cover. Reveal
      // that prepared pose before its continuous 55→50 or−5→0 arrival motion.
      await renderer.prepareScene?.();await fade(0,8);reservedLiftArrival=null;
    }
    if(window.LeagueGym&&await LeagueGym.command(c.name,a,v,m))return true;
    if(window.OpelucidGym&&await OpelucidGym.command(c.name,a,v,m))return true;
    if(window.MistraltonGym&&await MistraltonGym.command(c.name,a,v,m))return true;
    if(window.MistraltonPuzzles&&await MistraltonPuzzles.command(c.name,a,v,m))return true;
    switch(c.name){
      case 'ActorPauseAll':case 'ActorUnlockAll':case 'RTFinishSubEvents':case 'FieldClose':case 'FieldOpen':case 'InputWaitLast':case 'MsgWaitAdvance':case 'MsgActorClose':case 'MsgSystemClose':case 'MsgWinCloseAll':case 'MsgWinCloseNo':case 'MsgPlaceSignClose':break;
      case 'MsgActor':case 'MsgActorEx':await message(a[0]===1024?textBank:v[0],v[1],m);break;
      // IRBI021b0d74 reads and discards the first version's message at0d86;
      // the second message is stored at0d92 and passed to021b0aac at0db6.
      case 'MsgActorVersioned':case 'ActorMsgVersioned':await message(a[0]===1024?textBank:v[0],v[2],m);break;
      case 'MsgActorGendered':await message(a[0]===1024?textBank:v[0],v[1],m);break;
      case 'MsgInfo':case 'MsgSystem':case 'MsgPlaceSign':await message(textBank,v[0],m);break;
      // IRBI74 displays its message while PVPlay is already running. The
      // adjacent PVWait/MsgWaitAdvance keep it open through the full cry.
      case 'NativeOpcode74':await message(textBank,v[0],m,{advanceAfter:soundTask});break;
      case 'MsgAt':await message(textBank,v[0],m);break;
      case 'MsgAtClose':case 'MsgCloseImmediate':break;
      case 'YesNoWin':m.set(a[0],await choice(['SÌ','NO']));break;
      case 'CallPoke3Select':m.set(a[0],await chooseStarter());break;
      case 'CallPokeNameInput':m.set(a[0],await nickname(v[1]));break;
      case 'PokePartyGetParam':m.set(a[0],state.party[v[1]].nickname?1:0);break;
      case 'PokePartyAdd':{const name=m.host.speciesName(v[1]);if(state.party.length>=6){m.set(a[0],0);break;}if(!state.starter)state.starter=name;state.party.push(journey.record(newStoryMon(name,v[3]),OPENING_DATA[name].growth[v[3]]));StoryState.register(state,name,true);journey.displayPartner();m.set(a[0],1);break;}
      case 'StriatonWord86':m.words[a[0]]=['Normale','Lotta','Volante','Veleno','Terra','Roccia','Coleottero','Spettro','Acciaio','Fuoco','Acqua','Erba','Elettro','Psico','Ghiaccio','Drago','Buio'][v[1]]||String(v[1]);break;
      case 'BadgeCheck':m.set(a[0],native.badges?.includes(v[1])?1:0);break;
      case 'BadgeSet':native.badges??=[];if(!native.badges.includes(v[0]))native.badges.push(v[0]);break;
      case 'BadgeRegisterParty':native.badgeTeams??={};native.badgeTeams[v[0]]=state.party.map(p=>p.name);break;
      case 'TrainerSetDefeated':native.trainerWins??=[];if(!native.trainerWins.includes(v[0]))native.trainerWins.push(v[0]);break;
      case 'GymCurtainInit':native.gymCurtains=v[0];break;
      case 'NativeOpcode196':if(queued!==null&&[97,98].includes(v[0])){await fade(1,8);reservedLiftArrival=v[0];}native.clayHeight=v[2]<<16>>16;await changeZone(v[0],v[1],v[3]);facing=frames[v[4]]??facing;break;
      case 'NativeOpcode223':{const list=v[0]===1?state.dex.caught:state.dex.seen;m.set(a[2],list.some(name=>GEN5.dex.species.get(name).num===v[1])?1:0);break;}
      case 'NativeOpcode221':{const list=v[0]===1?state.dex.caught:state.dex.seen;m.set(a[1],new Set(list.map(name=>GEN5.dex.species.get(name).num)).size);break;}
      case 'NativeOpcode466':native.pokedexForms=true;break;
      case 'NativeOpcode123':{const p=world(v[1],v[3]);await fieldMotion.jump(v[0],[p.x,v[2]<<16>>16,p.y]);break;}
      case 'NativeOpcode583':{
        await warmFieldSounds([1665,1666]);const body=actor(v[0]);if(!body)throw Error('Personaggio della caduta non disponibile');
        const prepare=async()=>{const required=[...fieldActors(),body];await renderer.requireActors?.(required);if(renderer.resourcePlan&&renderer.hasResources&&!renderer.hasResources(renderer.resourcePlan(required)))throw renderer.loadingError||Error('Grafica del personaggio in arrivo non pronta');};
        if(renderer.resourceGate)await renderer.resourceGate('native-falling-actor-'+v[0],prepare);else await prepare();if(body.name==='Komor'&&native.zone===165)window.OpelucidReturns?.claimDrop({native,departures});fieldFall.drop(v[0],world(v[1],v[2]),v[3]);body.nativeSandArrival=true;break;
      }
      case 'NativeOpcode193':{
        const p=grid(),pit=data().triggers.find(record=>record.type===0&&record.var===16384&&record.value===0&&p.x>=record.x&&p.x<record.x+record.width&&p.z>=record.z&&p.z<record.z+record.height);
        if(!quicksand||!pit||!OpelucidQuicksand.zones.includes(native.zone)||!zoneScenes[v[0]])throw Error('Caduta nelle sabbie mobili non disponibile');
        await warmFieldSounds([1952,1665,1666]);
        if(!await quicksand.pull(world(pit.x+Math.floor(pit.width/2),pit.z+Math.floor(pit.height/2))))throw Error('Risucchio nelle sabbie mobili interrotto');
        void AudioEngine.playSound(1952);await Promise.all([quicksand.sink(),fade(1,30)]);
        await changeZone(v[0],v[1],v[2]);fieldFall.drop(255,{x:player.x,y:player.y},Math.round(facing/3));const landing=fieldFall.wait(255);await fade(0,8);
        if(!await landing)throw Error('Atterraggio nelle sabbie mobili interrotto');break;
      }
      case 'NativeOpcode417':{const body=actor(v[0]);if(body?.name!=='Nardo')throw Error('Partenza originale non disponibile per questo personaggio');await OpelucidDeparture.play(()=>OpelucidContinuity.flyToNextEvent(body,native.zone));break;}
      case 'NativeOpcode252':{const p=state.party[v[1]];m.set(a[0],!p||p.egg?0:p.happiness??GEN5.dex.species.get(p.name).baseHappiness??70);break;}
      case 'NativeOpcode269':{if(![1,2].includes(v[1])){m.set(a[0],0);break;}const index=state.party.findIndex(p=>!p.egg&&(v[1]===1||p.hp>0));m.set(a[0],index<0?state.party.length:index);break;}
      case 'NativeOpcode254':m.set(a[0],state.party[v[1]]?GEN5.dex.species.get(state.party[v[1]].name).num:0);break;
      case 'NativeOpcode263':{const selected=window.NativeUI?.chooseParty?await NativeUI.chooseParty():await choice([...state.party.map(p=>p.nickname||p.name),'Annulla']),valid=Number.isInteger(selected)&&selected>=0&&selected<state.party.length;m.set(a[0],valid?1:0);if(valid)m.set(a[1],selected);break;}
      case 'NativeOpcode277':m.set(a[0],state.party[v[2]]?.pp.some(x=>x.id===v[1])?1:0);break;
      case 'NativeOpcode566':{const p=state.party[v[1]];if(!p||!MISTRALTON_DATA.hiddenPowerCompatibility[p.name]){m.set(a[0],65535);break;}const iv=p.ivs||{},stats=['hp','atk','def','spe','spa','spd'],bits=stats.reduce((n,k,i)=>n+(((iv[k]??31)&1)<<i),0);m.set(a[0],Math.floor(bits*15/63)+1);break;}
      case 'WordSetTypeName':m.words[a[0]]=['Normale','Lotta','Volante','Veleno','Terra','Roccia','Coleottero','Spettro','Acciaio','Fuoco','Acqua','Erba','Elettro','Psico','Ghiaccio','Drago','Buio'][v[1]]||String(v[1]);break;
      case 'NativeOpcode34':m.set(a[0],0);break;
      case 'NativeOpcode120':m.set(a[0],window.Bicycle?.mounted()?1:0);break;
      case 'NativeOpcode595':AudioEngine.setFieldMusicVolume(FieldMusicFade.start(native,v[0],v[1]));break;
      case 'NativeOpcode596':AudioEngine.setFieldMusicVolume(FieldMusicFade.start(native,127,v[0]));break;
      case 'NativeOpcode340':await DriftveilCinematics.play(v[0]);break;
      case 'NativeOpcode467':native.nPortrait=true;break;
      case 'NativeOpcode468':native.nPortrait=false;break;
      case 'NativeOpcode383':native.rollerTrainerState=v;break;
      case 'NativeOpcode384':DriftveilGym.activate(v[0]);break;
      case 'NativeOpcode385':native.rollerTrainerClear=v[0];break;
      case 'NativeOpcode608':await DriftveilGym.prepare();break;
      case 'NativeOpcode43':m.set(a[0],Math.imul(v[0],v[1])&0xffff);break;
      case 'NativeOpcode562':m.set(a[1],0);break;
      case 'NativeOpcode317':native.nimbasaScenePresentation=true;break;
      case 'NativeOpcode318':native.nimbasaScenePresentation=false;break;
      case 'NativeOpcode587':native.nimbasaCameraDuration=v[0];break;
      case 'NativeOpcode399':native.casteliaGymSwitches??=Array(8).fill(0);a.forEach((id,i)=>m.set(id,native.casteliaGymSwitches[i]?1:0));break;
      case 'NativeOpcode6':break; // IRBI 021591A8 resolves a work address; it does not clear it.
      case 'NativeOpcode396':CasteliaGym.activate(v[0]);break;
      case 'NativeOpcode397':native.casteliaPoleFeedback=v[0];break;
      case 'NativeOpcode398':{const child=new FieldEventVM(ORIGINAL_EVENTS,native,m.host);await child.run(58,2+v[0]);break;}
      // IRBI0215b250 ->0215a400 ->0201433c clears the selected trainer bit.
      case 'NativeOpcode150':native.trainerWins=(native.trainerWins||[]).filter(id=>id!==v[0]);break;
      case 'NativeOpcode151':m.set(a[1],native.trainerWins?.includes(v[0])?1:0);break;
      case 'NativeOpcode205':m.set(a[0],FieldSeason.phase(native));break;
      case 'NativeOpcode207':m.set(a[0],new Date().getDay());break;
      case 'NativeOpcode208':m.set(a[0],new Date().getMonth()+1);m.set(a[1],new Date().getDate());break;
      case 'NativeOpcode210':m.set(a[0],window.FieldSeason?.current(native)??new Date().getMonth()%4);break;
      case 'NativeOpcode301':native.casteliaObjectStates??={};native.casteliaObjectStates[v.slice(0,3).join(':')]=v[3];break;
      case 'NativeOpcode308':native.casteliaPedestrians=true;break;
      case 'NativeOpcode64':native.moneyWindow=true;break;
      case 'NativeOpcode65':native.moneyWindow=false;break;
      case 'NativeOpcode66':break; // Redraw of the DS money window; the browser reads current money.
      case 'NativeOpcode250':state.money=Math.max(0,state.money-v[0]);journey.update();break;
      case 'NativeOpcode251':m.set(a[0],state.money>=v[1]?1:0);break;
      case 'NativeOpcode496':native.itemReceipts??=[];native.itemReceipts.push({kind:v[0],item:v[1]});break;
      case 'NativeOpcode588':m.set(a[0],0);break; // No secondary field layer in the browser.
      case 'NativeOpcode117':native.itemPresentation=v[0];break;
      case 'NativeOpcode285':await showPage('Il collegamento wireless non è disponibile nella demo.');break;
      case 'GymCurtainSwitch':case 'GymCurtainFeedback':case 'GymCurtainReset':native.gymSwitch=v[0];break;
      case 'NativeOpcode386':native.libraryOpening=!!v[0];break;
      case 'NativeOpcode389':native.libraryOpening=true;break;
      // IRBI021af16c stops the sound players owned by the field-script mask.
      case 'NativeOpcode167':stopScriptSounds();break;
      case 'NativeOpcode490':native.libraryPatches??={};native.libraryPatches[v[1]+':'+v[3]]={kind:v[0],height:v[2]};break;
      case 'NativeOpcode182':m.set(a[2],journey.consumeItem(v[0],v[1])?1:0);break;
      case 'NativeOpcode258':m.set(a[0],0);break; // Egg predicate; the demo has no eggs or breeding service.
      case 'NativeOpcode544':{
        // IRBI0216bc44/0216bd10: unsupported species leave the slot alone;
        // supported event searches initialize it to0 and return0 if absent.
        // Event-origin metadata and these optional encounters are outside the
        // current main-story roster. Do not manufacture a positive result.
        if([243,244,245,251,492,647,648,649].includes(v[0])){m.set(a[2],0);const name=GEN5.species.find(s=>s.id===v[0])?.en;if(name&&state.party.some(p=>p.name===name))throw Error('Dati di origine del Pokémon evento non disponibili per questa sequenza opzionale');}
        m.set(a[3],0);break;
      }
      case 'NativeOpcode283':{const p=GEN5.species.find(p=>p.en===state.party[v[2]]?.name);m.set(a[0],p?.types[0]??0);m.set(a[1],p?.types[1]??p?.types[0]??0);break;}
      case 'CGearScene':native.cgear=true;break;
      case 'CGearNotice':await showPage('Il C-Gear è stato attivato. Le funzioni wireless non sono disponibili nella demo.');break;
      case 'NativeOpcode224':case 'NativeConstant21':m.set(a[0],21);break; // IRBI 0215a950: Black version discriminator.
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
      case 'ActorCmdExec':{const n=actor(v[0]),sequence=ORIGINAL_EVENTS.scripts[m.bank].movements[a[1]];
        if(m.bank===426&&v[0]===2&&a[1]===1456&&dragonFlight?.enabled(actor(251))){await dragonFlight.board(n,actor(251));break;}
        // Native ninja appearances/removals must remain covered in the wider
        // HD-2D field, including Icirrus and Tubeline, as in Chargestone.
        if(n?.model===182&&sequence.some(([op])=>op===184||op===185)){
          await warmFieldSounds([1975]);void AudioEngine.playSound(1975);
          if(sequence.some(([op])=>op===185)){if(triadCoverMode!=='hide'){await fade(1,4);triadCoverMode='hide';}n.hidden=true;move(v[0],sequence.filter(([op])=>op!==185&&op!==69));}
          else{if(triadCoverMode==='reveal'){await renderer.prepareScene?.();await fade(0,4);triadCoverMode=null;}move(v[0],sequence.filter(([op])=>op!==184));}
        }else if(!n||!window.MistraltonContinuity?.startExitMotion(n,native.zone,a[1]))move(v[0],sequence);break;}

      case 'ActorCmdWait':await Promise.all(motions.map(t=>t.promise));break;
      case 'ActorSetGPos':{const n=actor(v[0]),before=n&&{...n},dragon=n&&dragonFlight?.isDragon(n);if(n){const target={...world(v[1],v[3]),...(dragon?{height:v[2]<<16>>16}:{})};if(dragon&&!fieldCovered&&dragonFlight.enabled(n))await dragonFlight.relocate(n,target);else Object.assign(n,target);}face(v[0],v[4]);if(n&&!dragon&&v[0]!==255&&renderer.hasPresentedActor?.(n))departures.preserve([before],[n],{covered:fieldCovered,sameField:true});break;}
      case 'ActorSetEyeToEye':{const n=actor(currentActor);if(n){const dx=player.x-n.x,dy=player.y-n.y;face(currentActor,Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0);}break;}
      case 'ActorAdd':{const record=data().actors.find(n=>n.id===v[0]);if(record&&!actor(v[0])){if(record.model===182&&triadCoverMode!=='reveal'){await fade(1,4);triadCoverMode='reveal';}const n=putActor(record),arriving=native.zone===329&&v[0]===14;if(arriving)Object.assign(n,{x:-404.5,y:-313.5,exitClip:[-1,0,0,-406.4]});await renderer.prepareScene?.();if(arriving){move(n.uid,[[10,17]]);await Promise.all(motions.filter(t=>t.id===n.uid).map(t=>t.promise));delete n.exitClip;}}if(m.bank===304&&v[0]===19)await fade(0,4,'#fff');break;}
      case 'ActorDelete':{if(m.bank===304&&v[0]===17)await fade(1,4,'#fff');const n=actor(v[0]);if(n){if(native.zone===90)n.leavingGate=true;if(native.zone===62&&n.name==='Belle')native.flags=native.flags.filter(f=>f!==561);const flight=dragonFlight?.depart(n);if(flight)await flight;else departures.depart(n,native.zone,{covered:fieldCovered});n.hidden=true;if(!flight)await departures.wait(n);const index=npcs.indexOf(n);if(index>=0)npcs.splice(index,1);}if(triadCoverMode==='hide'&&!npcs.some(n=>n.model===182)){await fade(0,4);triadCoverMode=null;}break;}
      case 'ActorNew':if(!actor(v[3])){
        const arriving=native.zone===62&&v[3]===251&&v[4]===134,n=putActor({id:v[3],model:v[4],x:v[0],z:v[1],direction:v[2],script:2000,...(arriving?{y:65536}:{})});
        // The HD-2D camera sees the DS spawn tile. Enter through the southern
        // doorway, fully clipped before crossing its plane, then resume IRBI.
        if(arriving)Object.assign(n,{x:-353.5,y:-270.5,exitClip:[0,0,-1,-272.5]});
        await renderer.prepareScene?.();if(arriving){move(n.uid,[[8,4],[11,1]]);await Promise.all(motions.filter(t=>t.id===n.uid).map(t=>t.promise));delete n.exitClip;}
      }break;
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
        if(v[0]===10456){const item=value(32776),count=value(32777);if(!ORIGINAL_EVENTS.itemNames[item])throw Error('Unknown gift item '+item);const added=journey.addItem(item,count);m.set(32778,added?1:0);await showPage(added?'Hai ricevuto '+ORIGINAL_EVENTS.itemNames[item]+'!':'La Borsa è piena.');break;}
        if([10394,10395,10396].includes(v[0])){native.healZone=centerZones.has(native.zone)?native.zone:398;break;}
        if(v[0]===10110){if(window.MistraltonServices)await MistraltonServices.open({journey,native,stock:value(32768),type:value(32769),choice,showPage,playSound:id=>AudioEngine.playSound(id)});else await healAtCenter();break;}
        if(v[0]===2814)window.MistraltonServices?.install(ORIGINAL_EVENTS);
        if(![2800,2801,2805,2806,2807,2814].includes(v[0]))throw Error('Global script outside opening '+v[0]);
        const child=new FieldEventVM(ORIGINAL_EVENTS,native,m.host);child.words=m.words;await child.run(862,v[0]-2800);break;
      }
      case 'NativeOpcode582':m.set(a[0],0);break; // No Geonet registration in this offline chapter.
      case 'ItemCheckSpace':m.set(a[2],journey.itemCount(v[0])+v[1]<=999?1:0);break;
      case 'ItemAdd':{
        const item=v[0],count=v[1];if(item===4)state.pokeballs+=count;else if(item===17)potions+=count;
        else if(item===442)native.map=true;else if([621,626].includes(item))native.phone=true;else if(window.LEAGUE_DATA?.itemNames[item]||window.OPELUCID_DATA?.itemNames[item]||window.ICIRRUS_DATA?.itemNames[item]||window.MISTRALTON_DATA?.itemNames[item]||window.DRIFTVEIL_DATA?.itemNames[item]||window.NIMBASA_DATA?.itemNames[item]||window.CASTELIA_DATA?.itemNames[item]||window.PINWHEEL_DATA?.itemNames[item]||window.ROUTE3_DATA?.itemNames[item]||window.STRIATON_DATA?.itemNames[item])journey.addItem(item,count);else throw Error('Item outside opening '+item);
        m.set(a[2],1);journey.update();break;
      }
      case 'ItemGetPocket':m.set(a[1],window.LEAGUE_DATA?.itemPockets?.[v[0]]??window.OPELUCID_DATA?.itemPockets?.[v[0]]??window.ICIRRUS_DATA?.itemPockets?.[v[0]]??window.MISTRALTON_DATA?.itemPockets?.[v[0]]??([442,621,626,437,471,579].includes(v[0])?4:[373,410,420,394,397,399,403,413,619].includes(v[0])?2:[150,155,188].includes(v[0])?3:[17,18,21,22,25,26,27,28,30,38,52,591].includes(v[0])?1:0));break;
      case 'WordSetItemName':case 'WordSetItemNameWithArticle':case 'WordSetItemNameEx':{
        const item=ORIGINAL_EVENTS.itemNames[v[1]];if(!item)throw Error('Item name '+v[1]);
        const plural=c.name==='WordSetItemNameEx'&&v[2]>1,article=c.name==='WordSetItemNameWithArticle'||c.name==='WordSetItemNameEx'&&v[3];
        m.words[a[0]]=plural?(v[1]===17?'Pozioni':item):article?(v[1]===621||v[1]===626?"un ":'una ')+item:item;break;
      }
      case 'WordSetTMMoveName':{const id=({...window.NATIVE_MACHINE_TEXT?.moves,...window.PINWHEEL_DATA?.machines,...window.CASTELIA_DATA?.machines,...window.NIMBASA_DATA?.machines,...window.DRIFTVEIL_DATA?.machines,...window.MISTRALTON_DATA?.machines,...window.ICIRRUS_DATA?.machines,...window.OPELUCID_DATA?.machines,...window.LEAGUE_DATA?.machines,373:168,410:526,420:15})[v[1]];if(!id)throw Error('Machine outside chapter '+v[1]);m.words[a[0]]=GEN5.moves.find(move=>move.id===id).name;break;}
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
      case 'MapReplaceSetEvent':if(window.OPELUCID_MAP_VARIANTS&&v[0]===OPELUCID_MAP_VARIANTS.event){native.vars[OPELUCID_MAP_VARIANTS.work]=v[1]?OPELUCID_MAP_VARIANTS.value:0;}else if(m.bank===638){native.route2MapEvent=v[0];}else if(m.bank>=778){native.roomMess=true;applyRoom();}else native.mapEvents={...(native.mapEvents||{}),[native.zone]:v[0]};break;
      case 'EnableRunningShoes':native.runningShoes=true;break;
      case 'MapReplaceIsEventSet':m.set(a[1],native.roomMess?1:0);break;
      case 'EVCameraInit':window.LeagueCamera?.reset(renderer);renderer.storyCamera=[...renderer.center];break;
      case 'EVCameraEnd':case 'EVCameraRebind':if(native.zone===214&&slide?.returnPromise)await slide.returnPromise;if(cameraTask?.view){cameraTask.resolve();cameraTask=null;}window.LeagueCamera?.reset(renderer);renderer.storyCamera=null;break;
      case 'EVCameraUnbind':renderer.storyCamera??=[...renderer.center];break;
      case 'EVCameraMoveTo':cameraTo([v[3]/65536-origin()[0],v[5]/65536-origin()[1]],v[6],native.zone===214&&slide&&window.LeagueCamera?LeagueCamera.begin(renderer,{pitchTurn16:v[0],yawTurn16:v[1],targetFx:[v[3],v[4],v[5]],distanceFx:v[2]}):null);break;
      case 'NativeOpcode122':{const body=actor(v[0]);if(!slide||native.zone!==214||!body)throw Error('Scivolata originale non disponibile');await prepareNpcFall(body,[1773]);if(native.zone===214&&actor(v[0])===body)await slide.start(body);break;}
      case 'NativeOpcode326':{const preset=window.LEAGUE_CAMERA_PRESETS?.presets?.[v[0]];if(!preset||!window.LeagueCamera)throw Error('Camera originale del portale non disponibile');const [ox,oz]=origin();cameraTo([preset.targetFx[0]/65536-ox,preset.targetFx[2]/65536-oz],v[1],LeagueCamera.begin(renderer,preset));break;}
      case 'EVCameraMoveToDefault':case 'EVCameraReturn':if(native.zone===214&&m.bank===428&&slide?.completedBody&&!slide.returnPromise)slide.returnToRole(slide.completedBody);cameraTo(SceneCamera.anchor(state.scene,renderer.scene,native.zone,player),v[0],window.LeagueCamera?.returning(renderer));break;
      case 'EVCameraWait':if(cameraTask)await cameraTask.promise;break;
      case 'FadeEx':fade(v[1]===0?1:0,v[3]*8,v[0]===3?'#fff':'#000');break;
      case 'FadeExWait':case 'CallLeagueLiftWarp':await fadeTask;break;
      case 'NativeOpcode437':case 'CMD_1ad':case 'CMD_1af':fade(0);break;
      case 'NativeOpcode438':case 'CMD_1ae':fade(1);break;
      case 'BGMPlay':native.music=v[0];AudioEngine.setScene(v[0]);break;
      case 'BGMChangeMap':native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);break;
      case 'SEPlay':case 'MEPlay':scriptSounds.add(v[0]);soundTask=AudioEngine.playSound(v[0]);break;
      case 'SEWait':case 'MEWait':await soundTask;break;
      case 'PVPlay':soundTask=AudioEngine.cry(v[0]);break;
      case 'PVWait':await soundTask;break;
      case 'BMCreateHandleByGPos':{const [ox,oz]=origin();m.set(a[0],fieldModels?fieldModels.create(v[1],v[2]-ox,v[3]-oz):v[1]);native.door={x:v[2],z:v[3],type:v[1],open:false};break;}
      // IRBI021b2b08 finds the loaded model and disables its two render modes.
      // An absent match is an original no-op, not a missing-resource fallback.
      case 'NativeOpcode299':{const [ox,oz]=origin();fieldModels?.hide(v[0],v[1]-ox,v[2]-oz);break;}
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
    if(![1,2,3,4,5,6].includes(id))throw Error('Call outside opening '+id);
    const call=id===5?window.OPELUCID_PHONE:id===6?window.ICIRRUS_PHONE:id===4?NIMBASA_PHONE:id===3?CASTELIA_PHONE:id===2?ROUTE2_PHONE:PHONE_ASSETS,portraits={...PHONE_ASSETS.portraits,...(window.ROUTE2_PHONE?.portraits||{})};
    if(!call)throw Error('Dati Interpoké non disponibili: '+id);
    const texts=[5,6].includes(id)?call.text:id===4?NIMBASA_PHONE.text:id===3?CASTELIA_PHONE.text:id===2?ROUTE2_DATA.phoneText:ORIGINAL_EVENTS.phoneTexts;
    const names=['Alcide','Komor','Belle','Aralia','Mamma'],panel=document.createElement('section');panel.id='phoneScene';panel.setAttribute('aria-label','Interpoké');
    const pictures=call.participants.filter(person=>person<5).map(person=>{
      const name=names[person],tile=document.createElement('figure'),image=document.createElement('img'),label=document.createElement('figcaption');
      image.src=portraits[name][0];image.alt=name;label.textContent=name;tile.append(image,label);panel.append(tile);return {name,tile,image};
    });
    if(window.RuntimeAssets)await Promise.all([...new Set(pictures.flatMap(p=>portraits[p.name]))].map(src=>RuntimeAssets.image(src)));
    panel.dataset.participants=String(pictures.length);document.body.append(panel);$('world').dataset.phone=String(id);await fade(0);
    // Reserve the actual message window, including touch controls and rotation.
    const fitPortraits=()=>{const dialog=$('dialogue');if(!dialog.open)return;const css=getComputedStyle(panel),rows=Math.ceil(pictures.length/2),space=dialog.getBoundingClientRect().top-parseFloat(css.paddingTop)-8-(rows-1)*parseFloat(css.rowGap);panel.style.gridTemplateRows=`repeat(${rows},minmax(0,${Math.max(0,Math.min(192,space/rows))}px))`;};
    phoneLayout=fitPortraits;const layoutObserver=new ResizeObserver(fitPortraits);layoutObserver.observe($('dialogue'));
    // Moving the touch controls into a modal changes its bottom/class without
    // resizing the message canvas. Refit before paint on those changes too.
    const placementObserver=new MutationObserver(fitPortraits);placementObserver.observe($('dialogue'),{attributes:true,attributeFilter:['class','style','open']});addEventListener('resize',fitPortraits);
    let talker=-1,frame=0;const clock=setInterval(()=>{frame++;pictures.forEach((p,i)=>{const blink=frame%28===26?1:frame%28===27?2:0;const mouth=i===talker?[0,1,2,1][frame%4]:0;p.image.src=portraits[p.name][blink*3+mouth];p.tile.classList.toggle('speaking',i===talker);});},1000/15);
    try{
      for(const [op,face,param] of call.commands){
        if(op===0)break;
        if(op===1){talker=face;for(const page of messagePages(texts[param],m.words))await showPage(page,pictures[face].name);}
        else if(op===2)await delay(param);else if(op===3)soundTask=AudioEngine.playSound(param);else if(op===4)await soundTask;else throw Error('Unknown phone command '+op);
      }
    }finally{phoneLayout=null;clearInterval(clock);layoutObserver.disconnect();placementObserver.disconnect();removeEventListener('resize',fitPortraits);panel.remove();delete $('world').dataset.phone;}
  }
  async function changeZone(zone,x,z,entryHeight){
    window.LeagueCamera?.reset(renderer);
    slide?.reset();
    quicksand?.reset();
    fieldFall?.reset();
    dragonFlight?.reset();
    if(!zoneScenes[zone])throw Error('Zone outside opening '+zone);
    const restoreField=!fieldCovered;if(restoreField)await fade(1,8);clearDepartures();fieldModels?.clear();
    if(SceneCamera.tracks(OPENING_ASSETS.scenes[zoneScenes[zone]])){if(cameraTask){cameraTask.resolve();cameraTask=null;}renderer.storyCamera=null;}
    captureActors();window.FieldSeason?.transition(native,{covered:fieldCovered,outdoor:!!OPENING_ASSETS.scenes[zoneScenes[zone]].outdoor,fromOutdoor:!!renderer.scene.outdoor,busy:!!window.LeagueGym?.busy||[...departures.records.values()].some(r=>r.stage!=='resident'||['cedric-next-research','komor-twist-exit'].includes(r.plan.destination))});if(window.OpelucidChapter?.zones.includes(zone))await OpelucidChapter.ensure(zone);else if(window.IcirrusChapter?.zones.includes(zone))await IcirrusChapter.ensure();await window.IcirrusSeasons?.prepare(window.IcirrusChapter?.ready?199:zone,{images:false});native.zone=zone;FieldEventVM.resetMapState(native);if(native.railCurrent?.zone!==zone)delete native.railCurrent;if(window.OpelucidChapter?.zones.includes(zone)||window.IcirrusChapter?.zones.includes(zone))native.fieldHeight=Number.isFinite(entryHeight)?entryHeight:0;delete native.pendingZoneEntry;window.MistraltonGym?.enter(zone,native.clayHeight);window.MistraltonPuzzles?.enter(zone);native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);const p=world(x,z);journey.setScene(zoneScenes[zone],p.x,p.y);native.fieldHeight=renderer.groundHeight(p.x,p.y,native.fieldHeight);window.IcirrusGym?.enter(zone);window.OpelucidGym?.enter(zone);window.LeagueGym?.enter(zone);window.DragonspiralJump?.enter();window.SurfField?.enter();syncActors();window.MistraltonContinuity?.enterZone(zone,{covered:fieldCovered});warpCooldown=.8;lastTile='';applyRoom();
    const initFlags=native.flags.join(',');for(const init of data().init||[]){if(init.entry>=10000){await command({name:'RTCallGlobal'},[init.entry+1],[init.entry+1],vm);continue;}const loader=new FieldEventVM(ORIGINAL_EVENTS,native,vm.host);await loader.run(data().script,init.entry);}
    if((window.OpelucidChapter?.zones.includes(zone)||window.IcirrusChapter?.zones.includes(zone))&&native.flags.join(',')!==initFlags)syncActors();
    if(zone===319)native.route2=true;if(zone===321)native.route3=true;if(zone===16)native.nacrene=true;if(zone===28)native.castelia=true;if(zone===326)native.route4=true;if(zone===62)native.nimbasa=true;if(zone===96)native.driftveil=true;if(zone===107)native.mistralton=true;if(zone===113)native.icirrus=true;derivePhase();
    captureActors();await renderer.prepareScene?.();if(restoreField)await fade(0,8);
  }
  const warpDirections={1:1,2:0,3:3,4:2};
  const warps=(zone=native.zone)=>window.MistraltonPuzzles?.warps(zone,ORIGINAL_EVENTS.zones[zone]?.warps||[])||ORIGINAL_EVENTS.zones[zone]?.warps||[];
  async function enterWarp(w){
    if(w.rail||warps(w.zone)[w.warp]?.rail)return enterRailWarp(w);
    const caveEntry=([194,107].includes(native.zone)&&w.zone===195||native.zone===321&&w.zone===324)?{zone:native.zone,warp:warps().findIndex(r=>r.zone===w.zone&&r.warp===w.warp&&r.x===w.x&&r.z===w.z)}:null;
    sceneChanging=true;resetInput();
    try{
      const dw=warps(w.zone)[w.warp];if(!dw)throw Error('Destinazione non disponibile');const out=warpDirections[dw.a],inward=out^1;
      await settleAmbient();
      const [ox,oz]=origin(),sourceX=w.x/16-ox,sourceZ=w.z/16-oz;
      if(fieldModels?.find(1,sourceX,sourceZ)){
        const handle=fieldModels.create(1,sourceX,sourceZ);await fieldModels.play(handle,0);
        // IRBI pre-warp starts passage alongside opening; no additional door wait.
        move(255,[[8+warpDirections[w.a],1]]);await Promise.all(motions.filter(t=>t.id===255).map(t=>t.promise));
      }
      await fade(1,8);const point=warpPoint(dw,w.zone);await changeZone(w.zone,Math.floor(point.x),Math.floor(point.z),(dw.y<<16>>16)/16);face(255,inward);
      const [dx,dz]=origin(),doorX=dw.x/16-dx,doorZ=dw.z/16-dz;
      const door=fieldModels?.find(1,doorX,doorZ)?fieldModels.create(1,doorX,doorZ):null;
      if(door!==null){await fieldModels.play(door,0);await fieldModels.wait(door);}
      move(255,[[8+inward,1]]);await fade(0,8);await Promise.all(motions.filter(t=>t.id===255).map(t=>t.promise));
      if(door!==null){await fieldModels.play(door,1);await fieldModels.wait(door);fieldModels.release(door);}
      sceneChanging=false;warpCooldown=.8;if(caveEntry&&caveEntry.warp>=0)native.escapeRopeEntry=caveEntry;
      if(w.zone===319){journey.save(true);return;}
      const next=data().onEnter?.find(e=>value(e.var)===e.value);
      if(next&&ORIGINAL_EVENTS.scripts[data().script].supportedEntries.includes(next.entry))await run(next.entry);
      else journey.save(true);
    }catch(error){sceneChanging=false;failed=error;$('world').dataset.eventError=error.message;console.error(error);await showPage(error.message);}
  }
  async function enterRailWarp(w){
    sceneChanging=true;resetInput();
    try{
      const dw=warps(w.zone)[w.warp];if(!dw)throw Error('Destinazione non disponibile');
      await settleAmbient();await fade(1,8);
      let p,out,landing;
      if(dw.rail){p=NativeRails.warp(w.zone,dw);out=p.out;landing=NativeRails.landing(w.zone,dw);native.railCurrent={zone:w.zone,line:p.line,height:p.height};}
      else{p=warpPoint(dw,w.zone);const [x,z]=directions[warpDirections[dw.a]];out={x,z};delete native.railCurrent;}
      await changeZone(w.zone,p.x-.5,p.z-.5,dw.rail?p.height:(dw.y<<16>>16)/16);
      if(landing){player.x=landing.x;player.y=landing.z;}else{player.x-=out.x;player.y-=out.z;}const dir=Math.abs(out.x)>Math.abs(out.z)?out.x>0?2:3:out.z>0?0:1;face(255,dir);
      if(dw.rail){const at=NativeRails.locate(w.zone,player.x,player.y,native.railCurrent);if(at)native.railCurrent={zone:w.zone,...at};}
      renderer.center=[player.x,player.y+1.5];renderer.elevation=renderer.scene.railZone?renderer.groundHeight(player.x,player.y):0;
      await fade(0,8);sceneChanging=false;warpCooldown=.8;derivePhase();captureActors();
      const next=data().onEnter?.find(e=>value(e.var)===e.value);
      if(next&&ORIGINAL_EVENTS.scripts[data().script].supportedEntries.includes(next.entry))await run(next.entry);else journey.save(true);
    }catch(error){sceneChanging=false;failed=error;$('world').dataset.eventError=error.message;console.error(error);await showPage('Il passaggio non è riuscito. Ricarica la partita dal salvataggio precedente.');}
  }
  async function useEscapeRope(){
    const entry=native.escapeRopeEntry,door=entry&&warps(entry.zone)[entry.warp];
    const cave=native.zone===324?324:[195,196,197].includes(native.zone)?195:null,exterior=cave===324?[321]:[194,107];
    if(eventRunning||sceneChanging||failed||battling||journey.processing||window.MistraltonPuzzles?.busy||!cave||!exterior.includes(entry?.zone)||door?.zone!==cave||!journey.itemCount(78))return false;
    sceneChanging=true;resetInput();
    try{await settleAmbient();await fade(1,8);const point=warpPoint(door,entry.zone),inward=warpDirections[door.a]^1;await changeZone(entry.zone,Math.floor(point.x),Math.floor(point.z));face(255,inward);move(255,[[8+inward,1]]);await fade(0,8);await Promise.all(motions.filter(t=>t.id===255).map(t=>t.promise));journey.consumeItem(78);warpCooldown=.8;sceneChanging=false;journey.save(true);return true;}
    finally{sceneChanging=false;resetInput();}
  }
  async function useFly(index,destination){
    const fly=window.MistraltonFly,unavailable=()=>eventRunning||sceneChanging||failed||battling||journey.processing||window.MistraltonPuzzles?.busy||window.MistraltonGym?.busy||window.DriftveilGym?.busy||!fly?.canUse(state,index);
    if(unavailable())return false;
    if(destination===undefined)destination=await TownMap.open({fly:true});
    if(destination==null||unavailable())return false;
    const target=fly.destinations(state).find(d=>d.zone===(typeof destination==='number'?destination:destination.zone));
    if(!target||!zoneScenes[target.zone])return false;
    const mon=journey.unpack(state.party[index]);sceneChanging=true;resetInput();
    try{
      await settleAmbient();await fly.play(mon);await fade(1,8);window.Bicycle?.dismount();
      const [x,y,z]=target.fly,rail=window.NativeRails?.has(target.zone),point=rail?NativeRails.position(target.zone,x,y,z):null;
      if(point)native.railCurrent={zone:target.zone,line:x,height:point.height};else delete native.railCurrent;
      await changeZone(target.zone,point?point.x-.5:x,point?point.z-.5:z);face(255,1);
      if(point){const at=NativeRails.locate(target.zone,player.x,player.y,native.railCurrent);if(at)native.railCurrent={zone:target.zone,...at};}
      renderer.center=[player.x,player.y+1.5];renderer.elevation=renderer.scene.railZone?renderer.groundHeight(player.x,player.y):0;
      await fade(0,8);sceneChanging=false;warpCooldown=.8;captureActors();journey.save(true);return true;
    }finally{sceneChanging=false;resetInput();}
  }
  async function chapterBoundary(){if(eventRunning)return;eventRunning=true;resetInput();try{await showPage(window.IcirrusChapter?.zones.includes(native.zone)?'Hai raggiunto Mistralopoli. Le prossime sfide proseguiranno nella tappa successiva.':window.MistraltonChapter?.zones.includes(native.zone)?'Puoi completare il Deposito Frigo, la palestra di Rafan e attraversare il Percorso 6 e la Cava Pietrelettrica fino a Ponentopoli. Questo accesso proseguirà in una tappa successiva.':window.DriftveilChapter?.zones.includes(native.zone)?'Puoi proseguire attraverso la palestra di Camelia e il Percorso 5 fino a Libecciopoli. Musical, impianti sportivi, lotte a rotazione e gli eventi dopo l’arrivo proseguiranno in un capitolo successivo.':window.NimbasaChapter?.zones.includes(native.zone)?'Puoi proseguire verso la palestra di Camelia, il Percorso 5 e Libecciopoli.':window.CasteliaChapter?.zones.includes(native.zone)?'Questa parte della città o del viaggio proseguirà nel prossimo capitolo. Puoi continuare gli eventi di Austropoli, la palestra e la sfida di Belle al varco per il Percorso 4.':native.zone===16?'Le altre case di Zefiropoli non fanno parte di questo capitolo.':'Questa parte del viaggio sarà disponibile nel prossimo capitolo.');}finally{eventRunning=false;}}
  async function enterFieldBoundary(zone,x,y){
    sceneChanging=true;resetInput();const previousFacing=facing;
    try{await settleAmbient();await fade(1,6);await changeZone(zone,x+783.5,y+751.5);facing=previousFacing;await fade(0,6);sceneChanging=false;warpCooldown=.8;captureActors();journey.save(true);const next=data().onEnter?.find(e=>value(e.var)===e.value);if(next)await run(next.entry);}
    catch(error){sceneChanging=false;failed=error;$('world').dataset.eventError=error.message;console.error(error);await showPage(error.message);}
  }
  function tryWarp(dx,dz,x,z){
    if(eventRunning||sceneChanging||journey.processing||warpCooldown||failed)return false;
    const dir=Math.abs(dx)>Math.abs(dz)?dx>0?3:2:dz>0?1:0,[ux,uz]=directions[dir];
    if((window.OpelucidChapter?.globalZones.includes(native.zone)||window.IcirrusChapter?.globalZones.includes(native.zone)||window.MistraltonChapter?.globalZones.includes(native.zone))){const next=MistraltonChapter.fieldAt(x,z);if((native.zone===96&&next===331||native.zone===331&&next===96)&&!MistraltonChapter.blockedAt(next,x,z))return enterFieldBoundary(next,x,z);}
    if(window.IcirrusChapter?.globalZones.includes(native.zone)){const next=IcirrusChapter.fieldAt(x,z);if(next!==null&&next!==native.zone&&IcirrusChapter.crosses(native.zone,next)&&!IcirrusChapter.blockedAt(next,x,z))return enterFieldBoundary(next,x,z);}
    const visualNeighbor=window.IcirrusChapter?.visualFieldAt?.(native.zone,x,z);if(visualNeighbor!=null&&!ORIGINAL_EVENTS.zones[visualNeighbor]){warpCooldown=.8;return chapterBoundary();}
    if(window.NativeRails?.has(native.zone)){
      for(const w of warps()){if(!w.rail)continue;const p=NativeRails.warp(native.zone,w);if(renderer.scene.chapter050){const at=NativeRails.locate(native.zone,player.x,player.y,native.railCurrent?.zone===native.zone?native.railCurrent:{height:native.fieldHeight??0});if(!at||at.line!==p.line)continue;}const portal=p,cx=portal.x-origin()[0],cz=portal.z-origin()[1],before=(player.x-cx)*p.out.x+(player.y-cz)*p.out.z,after=(x-cx)*p.out.x+(z-cz)*p.out.z,lateral=Math.abs((player.x-cx)*p.out.z-(player.y-cz)*p.out.x),span=p.span??(w.b===2?w.width:w.height);
        if(dx*p.out.x+dz*p.out.z>.1&&before>=-3.5&&before<.5&&lateral<span*.5+.15){if(!ORIGINAL_EVENTS.zones[w.zone]){if(after< -1.25)continue;warpCooldown=.8;return chapterBoundary();}const threshold=-(NativeRails.landing(native.zone,w).distance-.08);if(after<threshold)continue;return enterRailWarp(w);}
      }
    }
    if(!window.PINWHEEL_ASSETS&&native.zone===16&&dir===2&&x< -175.5&&player.x>=-175.5){warpCooldown=.8;return chapterBoundary();}
    for(const w of warps()){
      if(w.rail)continue;
      if(native.zone===199&&window.IcirrusSeasons?.portalOpen(w)===false)continue;
      if(native.zone===90&&w.zone===62&&value(16578)===0)continue;
      if(native.zone===18&&w.zone===19&&value(16522)!==7)continue;
      // IRBI121 upper return pad: transition5/a0 is entered from any side,
      // unlike a directional door. Keep its native elevation so approaching
      // the same X/Z on a lower deck cannot start a teleport through the floor.
      if(native.zone===121&&w.a===0&&w.transition===5){
        const point=warpPoint(w),[ox,oz]=origin(),cx=point.x-ox,cz=point.z-oz;
        if(!(dx||dz)||Math.abs((native.fieldHeight??0)-(w.y<<16>>16)/16)>.25||Math.abs(x-cx)>.45||Math.abs(z-cz)>.45)continue;
        return enterWarp(w);
      }
      if(warpDirections[w.a]!==dir)continue;
      const point=warpPoint(w),cx=point.x-origin()[0],cz=point.z-origin()[1];
      const before=(player.x-cx)*ux+(player.y-cz)*uz,after=(x-cx)*ux+(z-cz)*uz,lateral=Math.abs((player.x-cx)*uz-(player.y-cz)*ux);
      // The door/stair tile may be solid. Its boundary is an event checked
      // before collision, exactly when the player attempts to enter it.
      if(before>=-1.05&&before<.5&&after>=-.68&&lateral*2<(dir>=2?w.height:w.width)){if(!ORIGINAL_EVENTS.zones[w.zone]){warpCooldown=.8;return chapterBoundary();}return enterWarp(w);}
    }
    return false;
  }
  async function routeTrainer(n){
    if(eventRunning||sceneChanging||journey.processing||failed||!n)return;
    const id=n.script-(n.script>=5000?5000:3000),trainer=OPENING_TRAINERS[id];if(!trainer)return;
    eventRunning=true;resetInput();
    const say=async key=>{for(const page of messagePages(trainer.messages[key]||'',{}))if(page)await showPage(page,trainer.name);};
    try{await settleAmbient();captureActors();journey.save(true);
      if(native.trainerWins?.includes(id)){await say(2);if([150,546].includes(id)){journey.heal();await showPage('I tuoi Pokémon sono di nuovo in piena forma!');}return;}
      if(trainer.battleStyle===1&&state.party.filter(p=>p.hp>0).length<2){await showPage('Per una lotta in doppio servono almeno due Pokémon in grado di lottare.');return;}
      n.emote='!';await delay(8);n.emote=null;const dir=Math.abs(player.x-n.x)>Math.abs(player.y-n.y)?player.x>n.x?3:2:player.y>n.y?1:0;face(n.uid,dir);const [dx,dy]=directions[dir],distance=Math.max(Math.abs(player.x-n.x),Math.abs(player.y-n.y)),lateral=Math.abs((player.x-n.x)*dy-(player.y-n.y)*dx),steps=lateral<.35?Math.max(0,Math.floor(distance)-1):0;if(steps){move(n.uid,[[8+dir,steps]]);await Promise.all(motions.filter(t=>t.id===n.uid).map(t=>t.promise));}await say(0);
      const completed=new Promise(resolve=>pendingBattle=resolve);rival=trainer.name;
      try{await startBattle(true,{story:trainer.name,trainerId:id,aiFlags:trainer.aiFlags,doubles:trainer.battleStyle===1,p1:journey.configs(),p2:structuredClone(trainer.party).map(p=>({...p,item:GEN5.items.find(i=>i.id===p.heldItem)?.key||p.item||''}))});await completed;}finally{pendingBattle=null;}
      if(native.won){native.trainerWins??=[];if(!native.trainerWins.includes(id))native.trainerWins.push(id);if([150,546].includes(id)){journey.heal();await showPage('I tuoi Pokémon sono di nuovo in piena forma!');}}
      else{journey.heal();await changeZone(centerZones.has(native.healZone)?native.healZone:398,7,13);}
    }catch(error){failed=error;console.error(error);$('world').dataset.eventError=error.message;await showPage(error.message);}
    finally{eventRunning=false;n.emote=null;derivePhase();captureActors();if(!failed)journey.save(true);}
  }
  async function routeItem(n){
    if(eventRunning||!n)return;const item=window.OPELUCID_DATA?.items?.[n.script]||window.ICIRRUS_DATA?.items?.[n.script]||window.MISTRALTON_DATA?.items?.[n.script]||window.DRIFTVEIL_DATA?.items?.[n.script]||window.NIMBASA_DATA?.items?.[n.script]||window.CASTELIA_DATA?.items?.[n.script]||window.PINWHEEL_DATA?.items?.[n.script]||window.ROUTE3_DATA?.items?.[n.script]||window.STRIATON_DATA?.items?.[n.script]||window.ROUTE2_DATA?.items?.[n.script];if(!item)return;
    eventRunning=true;try{if(!journey.addItem(item.id,item.count)){await showPage('La Borsa è piena.');return;}if(native.zone===319){native.routeItems??=[];native.routeItems.push(n.uid);}native.collectedItems??={};native.collectedItems[native.zone]??=[];native.collectedItems[native.zone].push(n.uid);const record=data().actors.find(a=>a.id===n.uid);if(record?.flag&&!has(record.flag))native.flags.push(record.flag);n.hidden=true;await showPage('Hai trovato '+ORIGINAL_EVENTS.itemNames[item.id]+'!');captureActors();journey.save(true);}finally{eventRunning=false;}
  }
  function target(){
    const p=grid(),[dx,dz]=directions[frames.indexOf(facing)],front={x:p.x+dx,z:p.z+dz};
    const visible=fieldActors().filter(n=>n.fieldZone===native.zone&&sameFieldHeight(n)&&Number.isFinite(n.script)&&(window.LeagueGym?.sameLevel(n)??true)&&(window.OpelucidGym?.sameLevel(n)??true)&&(window.MistraltonGym?.sameLevel(n)??true));
    if(window.NativeRails?.has(native.zone)){
      const n=visible.filter(n=>!n.gimmick&&Math.abs((n.railHeight??n.height)-(native.zone===114?native.fieldHeight??0:native.railCurrent?.height??n.height))<1.8).map(n=>({n,along:(n.x-player.x)*dx+(n.y-player.y)*dz,lateral:Math.abs((n.x-player.x)*dz-(n.y-player.y)*dx)})).filter(p=>p.along>.1&&p.along<1.9&&p.lateral<.9).sort((a,b)=>a.along-b.along)[0]?.n;
      if(n)return {kind:'actor',n,script:n.script};
    }
    const find=(tile,reach)=>visible.find(n=>{const at=NpcWalk.cell(n);return Math.abs(at.x-player.x)<reach&&Math.abs(at.y-player.y)<reach&&Math.floor(at.x+origin()[0])===tile.x&&Math.floor(at.y+origin()[1])===tile.z;});
    let n=find(front,1.6);
    if(n)return {kind:'actor',n,script:n.script};
    // IRBI's counter tile is behaviour 0xD4. A wall or merely distant actor
    // does not permit talking through it. The nurse stands one tile beyond it.
    const wx=front.x+.5-origin()[0],wz=front.z+.5-origin()[1],g=renderer.scene.permissionGrids.find(g=>wx>=g.x-16&&wx<g.x+16&&wz>=g.z-16&&wz<g.z+16);
    if(g){const i=8+((Math.floor(wz-g.z)+16)*32+Math.floor(wx-g.x)+16)*8;if(g.bytes[i]===0xd6&&frames.indexOf(facing)===0&&centerZones.has(native.zone))return {kind:'pc',script:10090};if(g.bytes[i]===0xd4){n=find({x:front.x+dx,z:front.z+dz},2.6);if(n)return {kind:'actor',n,script:n.script};}}
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
  async function useSurf(index=null,{prompt=true}={}){
    if(eventRunning||sceneChanging||failed||window.SurfField?.busy)return false;eventRunning=true;surfService=true;resetInput();
    try{if(SurfField.mounted()){await showPage('Stai già usando Surf.');return false;}if(!SurfField.canStart(index)){await showPage('Non si può usare qui.');return false;}
      if(prompt){AudioEngine.playSound(1351);await showPage("L'acqua ha un colore azzurro intenso.\nVuoi usare la mossa Surf?");if(await choice(['SÌ','NO'])!==0)return false;}
      const user=SurfField.motion.user(index),p=state.party[user];await showPage((p.nickname||p.name)+' usa Surf!');await SurfField.play(journey.unpack(p));
      const result=await SurfField.start(user);if(result){await renderer.prepareScene();while(SurfField.busy)await delay(1);}return result;
    }finally{surfService=false;eventRunning=false;resetInput();journey.save(true);}
  }
  async function neighborMessage(bank,index){if(eventRunning)return;eventRunning=true;resetInput();try{await message(bank,index);}finally{eventRunning=false;}}
  function interact(){if(eventRunning||sceneChanging||vm.running||failed||window.DragonspiralJump?.busy||(window.LeagueGym?.busy||window.OpelucidGym?.busy)||window.IcirrusGym?.busy||window.MistraltonPuzzles?.busy||window.MistraltonGym?.busy||window.DriftveilGym?.busy)return;if(window.MistraltonPuzzles?.interact())return;if(window.MistraltonGym?.interact())return;if(window.DriftveilGym?.interact())return;const t=target();if(!t&&window.SurfField?.canStart())return useSurf();if(t){currentActor=t.n?.uid;const status=window.OpelucidContinuity?.statusMessage(t.n);if(status)return neighborMessage(status.bank,status.message);if(native.zone===96&&t.n?.name==='Komor'&&t.n.uid===253&&t.script===2000){vm.words[0]=state.playerName||'Alcide';return neighborMessage(101,5);}if(native.zone===397&&t.n?.name==='Komor'&&t.script===2000)return neighborMessage(436,value(16506)>=3?30:value(16507)<3?5:6);if(native.zone===6&&t.n?.name==='Belle'&&t.script===2000)return neighborMessage(351,10);if(native.zone===152&&t.n?.model===108)return cutTree(t.n);if(native.zone===319&&t.n?.model===108)return showPage('Questo albero può essere tagliato con la mossa Taglio.');if(([319,7,152,321,322,324,18,154,155,29,326,63,329,97,191,192,193,331,195,196,197,108,337,339,340,341,200,201,202,203,114].includes(native.zone)||window.OpelucidChapter?.zones.includes(native.zone))&&(t.script>=3000&&t.script<4000||t.script>=5000&&t.script<6000))return routeTrainer(t.n);if(native.zone===62&&t.n?.name==='Belle'||native.zone===96&&t.n?.uid===28&&t.script===21)return chapterBoundary();if(t.script<2000){if(!ORIGINAL_EVENTS.scripts[data().script]?.supportedEntries.includes(t.script-1))return showPage('Sei arrivato a Levantopoli. Le prossime sfide saranno disponibili nel capitolo successivo.');return run(t.script-1);}if(native.zone===323&&t.script===2201)return daycareService();if(centerZones.has(native.zone))return cityService(t.script);if(t.script>=7000&&t.script<8000)return routeItem(t.n);}}
  function step(dt,moved,distance=0){if(window.FieldMusicFade)AudioEngine.setFieldMusicVolume?.(FieldMusicFade.tick(native,dt));window.DriftveilGym?.tick(dt);if(native.zone===29)window.CasteliaGym?.tick(dt,player,moved);
    if(window.SpeciesStudioMode||failed)return;
    if(window.NativeRails?.has(native.zone)){const hint=native.zone===114?{height:native.fieldHeight??0}:native.railCurrent?.zone===native.zone?native.railCurrent:(renderer.scene.chapter050||renderer.scene.chapter051)?{height:native.fieldHeight??0}:{},at=NativeRails.locate(native.zone,player.x,player.y,hint);if(at)native.railCurrent={zone:native.zone,...at};else if(native.zone===121)delete native.railCurrent;}
    if(state.trainer&&!document.hidden)state.trainer.playSeconds=Math.min(3599999,state.trainer.playSeconds+dt);
    if(renderer.scene.chapter050&&!window.IcirrusGym?.busy){const at=window.IcirrusChapter?.surfaceAt(native.zone,player.x,player.y,native.fieldHeight??0);const rail=renderer.scene.railZone&&NativeRails.locate(native.zone,player.x,player.y,native.railCurrent?.zone===native.zone?native.railCurrent:{height:native.fieldHeight??0});if(rail)native.fieldHeight=rail.height;else if(at)native.fieldHeight=at.height;}
    if(renderer.scene.chapter051&&!(window.LeagueGym?.busy||window.OpelucidGym?.busy)){const at=window.OpelucidChapter?.surfaceAt(native.zone,player.x,player.y,native.fieldHeight??0);if(at)native.fieldHeight=at.height;}
    warmTutorial();warmBank(data().script);fieldModels?.tick(dt);
    try{dragonFlight?.observe();departures.tick(dt);window.MistraltonContinuity?.tick(dt);advanceRoute4Friend();advanceDriftveilFriend();tickMotions(dt);slide?.tick(dt);dragonFlight?.tick(dt);if(cameraTask){const c=cameraTask;c.elapsed+=dt;const f=Math.min(1,c.elapsed/c.duration);renderer.storyCamera=c.start.map((n,i)=>n+(c.target[i]-n)*f);c.view?.(f);if(f===1){cameraTask=null;c.resolve();}}}catch(error){failed=error;console.error(error);showPage(error.message);}
    window.DragonspiralJump?.tick(dt);window.SurfField?.tick(dt);window.IcirrusGym?.tick(dt);window.OpelucidGym?.tick(dt,moved);window.LeagueGym?.tick(dt);fieldMotion?.tick(dt);fieldFall?.tick(dt);quicksand?.tick(dt);window.MistraltonGym?.tick(dt);window.MistraltonPuzzles?.tick(dt,moved);
    const held=!!window.DragonspiralJump?.busy||!!(window.LeagueGym?.busy||window.OpelucidGym?.busy)||!!window.SurfField?.busy||!!window.IcirrusGym?.busy||!!window.MistraltonPuzzles?.busy||!!window.MistraltonGym?.busy||!!window.DriftveilGym?.busy||eventRunning||sceneChanging||journey.processing||battling||menuOpen()||failed;
    tickAmbient(dt,!held&&native.intro);warpCooldown=Math.max(0,warpCooldown-dt);if(held)return;if(moved&&distance>0)journey.daycareSteps(distance);
    const deferred=window.OpelucidContinuity?.deferredEvent(native.zone);if(deferred&&window.OpelucidContinuity.prepareEvent(native.zone,deferred)){run(deferred-1);return;}
    if(!native.intro&&renderer.ready){run(4,782);return;}
    const pending=native.pendingZoneEntry;if(pending){const valid=pending.zone===native.zone&&pending.bank===data().script&&Number.isInteger(pending.entry)&&ORIGINAL_EVENTS.scripts[pending.bank]?.supportedEntries.includes(pending.entry)&&(window.OpelucidContinuity?.arrivalEvent(native.zone,pending.entry+1)||data().onEnter?.some(e=>e.entry===pending.entry&&value(e.var)===e.value)||data().triggers?.some(e=>e.script===pending.entry+1&&value(e.var)===e.value));if(!valid)delete native.pendingZoneEntry;else if((![192,193].includes(native.zone)||!window.MistraltonContinuity?.waitingFor(native.zone,['Komor']))&&window.MistraltonContinuity?.prepareEvent(native.zone,pending.entry+1,npcs)!==false){run(pending.entry,pending.bank);return;}}

    if(window.MistraltonChapter){const next=MistraltonChapter.zoneAt(native.zone,player);if(next!==native.zone){native.zone=next;native.music=MISTRALTON_FIELD.music(next)||data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();lastTile='';journey.save(true);return;}}
    const p=grid(),key=native.zone+':'+p.x+':'+p.z;
    journey.update();if(key!==lastTile){lastTile=key;
    if(native.zone===317&&p.z<=671){native.zone=397;native.arrived=true;native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}
    if([16,154].includes(native.zone)&&window.PINWHEEL_ASSETS){const at=PINWHEEL_ASSETS.scenes[154].permissionGrids.some(g=>player.x>=g.x-16&&player.x<g.x+16&&player.y>=g.z-16&&player.y<g.z+16);const next=at?154:16;if(next!==native.zone){native.zone=next;native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}}
    if([6,321].includes(native.zone)&&window.ROUTE3_ASSETS){const at=ROUTE3_ASSETS.scenes[321].permissionGrids.some(g=>player.x>=g.x-16&&player.x<g.x+16&&player.y>=g.z-16&&player.y<g.z+16);const next=at?321:6;if(next!==native.zone){native.zone=next;if(next===321)native.route3=true;native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}}
    if(native.zone===319&&p.z<=608){native.zone=6;native.striaton=true;native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}
    if(native.zone===6&&p.z>=609){native.zone=319;native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);syncActors();derivePhase();journey.save(true);return;}
    if(native.zone===397&&p.z>=672){native.zone=317;native.music=window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||data().music;AudioEngine.setScene(native.music);syncActors();journey.save(true);return;}
    // Native type6 uses the separate header-gated query2162780/2162830.
    // It is not an unconditional footstep script (Cold Storage contains2000).
    for(const trigger of data().triggers)if(trigger.type!==6&&!((native.zone===114||native.zone===121&&!trigger.rail)&&Math.abs((native.fieldHeight??0)-trigger.y/16)>.25)&&!(native.zone===62&&[2,24].includes(trigger.script))&&value(trigger.var)===trigger.value&&(trigger.rail?NativeRails.trigger(native.zone,trigger,player.x,player.y,native.railCurrent):p.x>=trigger.x&&p.x<trigger.x+trigger.width&&p.z>=trigger.z&&p.z<trigger.z+trigger.height)){
      const surface=window.OpelucidChapter?.surfaceAt(native.zone,player.x,player.y,native.fieldHeight??0);if(window.OpelucidQuicksand?.trigger(native.zone,trigger,player,{behavior:surface?.behavior,running:!!keys.Shift,mounted:window.Bicycle?.mounted()})===false)continue;
      if(native.zone===6&&!ORIGINAL_EVENTS.scripts[data().script].supportedEntries.includes(trigger.script-1))return; // Next city chapter stays outside this arrival milestone.
      // The DS places friends instantly; our visible walk must finish first.
      // Recheck a stationary player without locking input while they arrive.
      if(native.zone===317&&trigger.script===5){const bodies=fieldActors();if(![3,4].every(id=>{const n=actor(id);return n&&!n.hidden&&bodies.includes(n);})){lastTile='';return;}}
      if(native.zone===90&&trigger.script===4&&departures.records.has('Komor')||native.zone===96&&trigger.script===8&&departures.records.has('Komor')){lastTile='';return;}
      if(window.MistraltonContinuity?.prepareEvent(native.zone,trigger.script,npcs)===false){lastTile='';return;}run(trigger.script-1);return;}}
    if(([319,7,152,321,322,324,18,154,155,29,326,63,329,97,191,192,193,331,195,196,197,108,337,339,340,341,200,201,202,203,114].includes(native.zone)||window.OpelucidChapter?.zones.includes(native.zone))){const seen=fieldActors().find(n=>{const r=data().actors.find(a=>a.id===n.uid);if(!r||r.type!==1||!sameFieldHeight(n)||!(window.MistraltonGym?.sameLevel(n)??true)||native.trainerWins?.includes(n.script-(n.script>=5000?5000:3000)))return false;const [dx,dy]=directions[n.direction],along=(player.x-n.x)*dx+(player.y-n.y)*dy,lateral=Math.abs((player.x-n.x)*dy-(player.y-n.y)*dx);if(along<.5||along>r.p0+.3||lateral>.35)return false;for(let d=.5;d<along;d+=.5)if(blocked(n.x+dx*d,n.y+dy*d))return false;return true;});if(seen){routeTrainer(seen);return;}}
    journey.encounter(dt,moved,distance);
  }
  function battleDone(s,kind){native.won=s?.battle.winner==='Alcide';if(pendingBattle){const done=pendingBattle;pendingBattle=null;done();return true;}return false;}
  initialize();syncActors();applyRoom();
  window.NativeStory={get libraryOffset(){return native.zone===18?Math.max(0,(actor(3)?.x??-4.5)+4.5):0;},curtainOffset:stage=>(actor(stage+3)?.x??-6.5)+6.5,departures,visualActors:fieldActors,routeTrainer,showPage,choice,nickname,daycareService,vm,state:native,syncActors,battleDone,interact,captureActors,run,changeZone,tryWarp,occupied,blackout:()=>centerZones.has(native.healZone)?changeZone(native.healZone,7,13):changeZone(390,5,8),get music(){return window.SurfField?.music()||(window.Bicycle?.mounted()?1012:window.ICIRRUS_FIELD?.music?.(native.zone)||window.MISTRALTON_FIELD?.music?.(native.zone)||window.DRIFTVEIL_FIELD?.music?.(native.zone)||window.NIMBASA_FIELD?.music(native.zone)||native.music||data().music);},get fieldCheckpointAllowed(){return (pcService||!!window.DragonspiralJump?.busy||!!(window.LeagueGym?.checkpointable||window.OpelucidGym?.checkpointable)||!!window.IcirrusGym?.busy||!!window.SurfField?.checkpointable)&&(!eventRunning||surfService||pcService)&&!sceneChanging&&!vm.running&&!failed&&!journey.processing;},get locked(){return !!window.DragonspiralJump?.busy||!!(window.LeagueGym?.busy||window.OpelucidGym?.busy)||!!window.SurfField?.busy||!!window.IcirrusGym?.busy||!!window.MistraltonPuzzles?.busy||!!window.MistraltonGym?.busy||!!window.DriftveilGym?.busy||eventRunning||sceneChanging||!!failed||journey.processing;}};
  NativeStory.useEscapeRope=useEscapeRope;
  NativeStory.useFly=useFly;NativeStory.useSurf=useSurf;
  window.SurfField?.restore();window.IcirrusGym?.restore();window.OpelucidGym?.restore();window.LeagueGym?.restore();window.DragonspiralJump?.restore();window.MistraltonGym?.restore();window.MistraltonPuzzles?.restore();window.MistraltonContinuity?.enterZone(native.zone,{covered:fieldCovered});
  journey.interact=interact;journey.hint=()=>vm.running?'':target()?'E · Interagisci':'';journey.step=step;
  Object.defineProperty(journey,'locked',{get:()=>NativeStory.locked});
  $('dialogue').addEventListener('cancel',e=>{e.preventDefault();if(pendingMessage)pendingMessage();else pendingCancel?.();});
})();
