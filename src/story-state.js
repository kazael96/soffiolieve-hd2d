/* Original opening order. A save records completed events, never open dialogs. */
(function(root){
  const KEY='soffiolieve-black-opening-v2';
  function migrateNpcNames(native){
    const rename=actor=>{const next=actor?.model===104&&actor.name==='Rutilo'?'Gasparago':actor?.model===180&&actor.name==='Original180'?'Aristide':null;if(next)actor.name=next;return next;};
    for(const actors of Object.values(native.actors||{}))if(Array.isArray(actors))for(const actor of actors)rename(actor);
    if(Array.isArray(native.departures))for(const record of native.departures){const before=record?.actor?.name,next=rename(record?.actor);if(next&&(record.key===before||record.key===record.actor.fieldZone+':'+record.actor.uid+':'+before))record.key=next;}
    if(native.opelucidArrivals&&typeof native.opelucidArrivals==='object')for(const key of Object.keys(native.opelucidArrivals)){if(native.opelucidArrivals[key]==='Rutilo')native.opelucidArrivals[key]='Gasparago';else if(['120:6','123:0'].includes(key)&&native.opelucidArrivals[key]==='Original180')native.opelucidArrivals[key]='Aristide';}
  }
  const phases=['gift','belle','komor','mother','biancaHouse','lab','map','routeStart','tutorial','route','arrival','centerHeal','centerTour','plasma','nextRoute','route2','striaton','dreamyard','dreamyardDone','route3','wellspring','nacrene','nacreneGym','pinwheel','skyarrow','castelia','route4','nimbasa','driftveil','route6','chargestone','mistralton','route7','celestial','skylaGym','twistMountain','icirrus','brycenGym','dragonspiral','relicCastle','route8','tubeline','route9','opelucid'];
  const starters=['Snivy','Tepig','Oshawott'];
  const scenes=['bedroom','home','bianca','biancaRoom','komorHome','komorRoom','lab','town',...['398','399','400','401','402','403','404','405','320','8','7','9','10','15','152','322','323','324','27','20','17','18','19','154','155','250','251','252','249','28','29','30','31','32','33','34','35','38','40','41','51','56','326','327','328','90','62','65','63','64','91','329','253','96','99','97','98','191','192','193','194','195','196','197','331','107','108','109','110','111','112','337','338','339','340','341','342','343','344','198','199','200','201','202','203','204','113','115','116','117','118','119'].map(z=>'zone'+z)];
  const objectives={gift:'Apri il regalo di Aralia nella tua camera.',belle:'Affronta Belle nella tua prima lotta.',komor:'Ora tocca alla lotta con Komor.',mother:'Scendi al piano terra e parla con Mamma.',biancaHouse:'Raggiungi Belle a casa sua, a sud-ovest.',lab:'Incontra Aralia nel laboratorio.',map:'Parla con Mamma fuori dal laboratorio.',routeStart:'Raggiungi Belle e Komor all’uscita nord.',tutorial:'Segui Aralia sul Percorso 1.',route:'Attraversa il Percorso 1 verso Quattroventi.',arrival:'Sei arrivato a Quattroventi. Fine della demo.'};
  Object.assign(objectives,{arrival:'Parla con Aralia davanti al Centro Pokémon di Quattroventi.',centerHeal:'Affida la tua squadra all’infermiera.',centerTour:'Segui Aralia nella visita al Centro Pokémon.',plasma:'Scopri cosa accade nella piazza di Quattroventi.',nextRoute:'Attraversa il varco a ovest verso il Percorso 2.',route2:'Attraversa il Percorso 2 e raggiungi Levantopoli.',striaton:'Sei arrivato a Levantopoli. Esplora la città e il Centro Pokémon.'});
  Object.assign(objectives,{route3:'Attraversa il Percorso 3 e raggiungi Zefiropoli.',wellspring:'Aiuta Komor a recuperare il Pokémon rubato nella Grotta Minerale.',nacrene:'Sei arrivato a Zefiropoli. Puoi visitare il Centro Pokémon.',striaton:'Sfida la palestra di Levantopoli. Puoi prepararti alla scuola e al Cantiere dei Sogni.',dreamyard:'Aiuta Zania nella ricerca del Fumonirico al Cantiere dei Sogni.',dreamyardDone:'Hai completato la palestra e la ricerca di Zania.'});
  Object.assign(objectives,{nacreneGym:'Visita il museo e affronta la palestra di Aloé.',pinwheel:'Recupera il Teschio rubato nel Bosco Girandola.',skyarrow:'Attraversa il Ponte Freccialuce verso Austropoli.',castelia:'Esplora Austropoli, aiuta Belle e affronta la palestra di Artemisio.'});
  Object.assign(objectives,{route4:'Attraversa il Percorso 4 e raggiungi Sciroccopoli.',nimbasa:'Esplora Sciroccopoli e aiuta il proprietario della Pensione Pokémon.'});
  Object.assign(objectives,{nimbasa:'Affronta N al luna park e la palestra di Camelia, poi raggiungi il Percorso 5.',driftveil:'Sei arrivato a Libecciopoli. Esplora la città e visita il Centro Pokémon.'});
  Object.assign(objectives,{driftveil:'Aiuta Komor al Deposito Frigo, poi affronta Rafan.',route6:'Attraversa il Percorso 6 e raggiungi la Cava Pietrelettrica.',chargestone:'Attraversa la Cava Pietrelettrica verso Ponentopoli.',mistralton:'Sei arrivato a Ponentopoli. Visita il Centro Pokémon.'});
  Object.assign(objectives,{mistralton:'Incontra Anemone a Ponentopoli e raggiungila alla Torre Cielo.',route7:'Percorri il Percorso 7 verso la Torre Cielo.',celestial:'Sali sulla Torre Cielo e suona la campana.',skylaGym:'Raggiungi Anemone nella palestra di Ponentopoli.',twistMountain:'Attraversa Monte Vite verso Mistralopoli.',icirrus:'Sei arrivato a Mistralopoli. Esplora la città e il Centro Pokémon.'});
  objectives.brycenGym='Affronta il percorso di ghiaccio e sfida Silvestro.';
  function fresh(){return {version:2,playerName:'Alcide',phase:'gift',scene:'bedroom',player:{x:-10.5,y:-9.5},facing:3,starter:null,party:[],dex:{seen:[],caught:[]},pokeballs:0,potions:0,money:3000,routePotion:false};}
  function advance(s,expected){if(s.phase!==expected)return false;s.phase=phases[phases.indexOf(expected)+1]||expected;return true;}
  function choose(s,name){if(s.phase!=='gift'||!starters.includes(name))return false;s.starter=name;s.phase='belle';return true;}
  function rivalStarter(name,rival){return (rival==='Belle'?{Snivy:'Oshawott',Tepig:'Snivy',Oshawott:'Tepig'}:{Snivy:'Tepig',Tepig:'Oshawott',Oshawott:'Snivy'})[name];}
  function traits(p){
    const mail=root.MistraltonMail?.sanitizeMail?.(p.mail,p.heldItem),result=mail?{mail}:{};for(const name of ['ivs','evs'])if(p[name])result[name]=Object.fromEntries(['hp','atk','def','spe','spa','spd'].map(k=>[k,Math.max(0,Math.min(name==='ivs'?31:255,Math.floor(p[name][k])||0))]));
    if(typeof p.nature==='string')result.nature=p.nature.slice(0,12);
    if(['M','F','N'].includes(p.gender))result.gender=p.gender;
    if(Number.isInteger(p.abilityId))result.abilityId=Math.max(1,Math.min(164,p.abilityId));
    if(Number.isInteger(p.happiness))result.happiness=Math.max(0,Math.min(255,p.happiness));
    if(Number.isInteger(p.personality)&&p.personality>=0&&p.personality<=0xffffffff)result.personality=p.personality;
    if(Number.isInteger(p.form)&&p.form>=0&&p.form<4)result.form=p.form;
    if(p.met&&Number.isFinite(Date.parse(p.met.date))&&Number.isInteger(p.met.zone)&&Number.isInteger(p.met.level))result.met={date:new Date(p.met.date).toISOString(),zone:p.met.zone,level:Math.max(1,Math.min(100,p.met.level))};
    return result;
  }
  function cleanPokemon(p,names=speciesNames()){if(!p||!names.includes(p.name))return null;return {name:p.name,nickname:typeof p.nickname==='string'?p.nickname.slice(0,10):'',...([0,2,3,4,6,8,9,12,13,14,17,18,19,20,21,22,24,25,26,27,28,30,38,39,50,51,52,57,58,60,76,77,78,79,81,82,83,84,85,92,93,150,155,157,158,188,91,217,222,223,228,231,233,239,247,255,296,504,540,591,137,138,139,140,141,142,143,144,145].includes(p.heldItem)?{heldItem:p.heldItem}:{}),...traits(p),level:Math.max(2,Math.min(100,Math.floor(p.level)||5)),xp:Math.max(0,Math.floor(p.xp)||0),hp:Number.isInteger(p.hp)?Math.max(0,Math.min(999,p.hp)):null,status:['par','brn','psn','tox','slp','frz'].includes(p.status)?p.status:'',pp:Array.isArray(p.pp)?p.pp.filter(m=>Number.isInteger(m?.id)&&Number.isInteger(m?.left)).map(m=>({id:m.id,left:Math.max(0,Math.min(99,m.left))})).slice(0,4):[]};}
  function normalize(v){
    if(!v||v.version!==2||!phases.includes(v.phase)||!(scenes.includes(v.scene)||Number.isInteger(v.original?.zone)&&root.OPELUCID_SCENES?.[v.original?.zone]&&v.scene==='zone'+v.original.zone))return null;
    if(v.phase!=='gift'&&!starters.includes(v.starter))return null;
    const s=fresh();s.phase=v.phase;s.scene=v.scene;s.starter=starters.includes(v.starter)?v.starter:null;
    if(Number.isFinite(v.player?.x)&&Number.isFinite(v.player?.y))s.player={x:Math.max([329,96,191,331,194,107,337,198,113].includes(v.original?.zone)?-768:[326,62].includes(v.original?.zone)?-512:-240,Math.min(v.original?.zone===253?256:v.original?.zone===249?192:96,v.player.x)),y:Math.max([337,198,113].includes(v.original?.zone)?-768:[326,62,329,96,191,331,194,107].includes(v.original?.zone)?-512:-256,Math.min(v.original?.zone===249?336:96,v.player.y))};
    s.facing=[0,3,6,9].includes(v.facing)?v.facing:3;
    const names=speciesNames();
    s.party=Array.isArray(v.party)?v.party.map(p=>cleanPokemon(p,names)).filter(Boolean).slice(0,6):[];
    const store=root.PokemonStorage||(typeof require==='function'?require('./pokemon-storage.js'):null);if(v.storage&&store)s.storage=store.normalize(v.storage,p=>cleanPokemon(p,names));
    if(v.starterReleased===true&&s.starter)s.starterReleased=true;
    const isStarter=name=>root.Training?root.Training.starterFamily(name,s.starter):name===s.starter;
    if(s.phase!=='gift'&&(!s.party.length||!s.starterReleased&&!s.party.some(p=>isStarter(p.name))&&!s.storage?.boxes.some(box=>box.some(p=>p&&isStarter(p.name)))&&!(isStarter(v.original?.daycare?.pokemon?.name)&&Number.isInteger(v.original.daycare.pokemon.level)&&Array.isArray(v.original.daycare.pokemon.pp))))return null;
    const valid=list=>Array.isArray(list)?[...new Set(list.filter(n=>[...names,'Purrloin'].includes(n)))]:[];
    s.dex={seen:Array.isArray(v.dex?.seen)?[...new Set(v.dex.seen.filter(n=>names.includes(n)||Object.hasOwn(root.TRAINING_DATA?.progression||{},n)))]:[],caught:valid(v.dex?.caught)};
    if(v.dex?.appearances&&typeof v.dex.appearances==='object'){s.dex.appearances={};for(const [name,a]of Object.entries(v.dex.appearances).slice(0,700))if(names.includes(name)&&a&&typeof a==='object')s.dex.appearances[name]={...(['M','F','N'].includes(a.gender)?{gender:a.gender}:{}),...(Number.isInteger(a.form)&&a.form>=0&&a.form<4?{form:a.form}:{})};}
    for(const p of s.party)register(s,p.name,true,p);
    if(!v.dex&&s.starter&&phases.indexOf(s.phase)>=phases.indexOf('mother'))for(const rival of ['Belle','Komor'])register(s,rivalStarter(s.starter,rival));
    s.dex.seen=[...new Set([...s.dex.seen,...s.dex.caught])];
    s.pokeballs=Math.max(0,Math.min(999,Math.floor(v.pokeballs)||0));s.potions=Math.max(0,Math.min(999,Math.floor(v.potions)||0));s.routePotion=v.routePotion===true;
    s.playerName=typeof v.playerName==='string'?v.playerName.slice(0,10):'Alcide';
    if(v.trainer&&root.TrainerProfile){const profile=root.TrainerProfile.normalize(v.trainer);if(profile)s.trainer=profile;}
    s.money=Number.isFinite(v.money)?Math.max(0,Math.min(9999999,Math.floor(v.money))):3000;
    if(v.original&&Number.isInteger(v.original.zone)&&([6,7,8,9,10,15,16,17,18,19,20,27,28,29,30,31,32,33,34,35,38,40,41,51,56,152,154,155,249,250,251,252,317,319,320,321,322,323,324,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,326,327,328,90,62,65,63,64,91,329,253,96,99,97,98,191,192,193,194,195,196,197,331,107,108,109,110,111,112,337,338,339,340,341,342,343,344,198,199,200,201,202,203,204,113,115,116,117,118,119].includes(v.original.zone)||root.OPELUCID_SCENES?.[v.original.zone])){s.original=structuredClone(v.original);s.original.flags=(s.original.flags||[]).filter(Number.isInteger);s.original.vars=Object.fromEntries(Object.entries(s.original.vars||{}).filter(([k,n])=>Number.isInteger(+k)&&Number.isInteger(n)));}
    if(s.original){const n=s.original;migrateNpcNames(n);if(n.fieldSeason!==undefined&&(!Number.isInteger(n.fieldSeason)||n.fieldSeason<0||n.fieldSeason>3))delete n.fieldSeason;if(n.surf!==undefined)n.surf=n.surf===true;if(n.surfMotion){const r=n.surfMotion;if(r.zone!==n.zone||![0,1,2,3].includes(r.direction)||![1,2].includes(r.cells)||!['wait','move'].includes(r.phase)||!Number.isFinite(r.wait)||r.wait<0||r.wait>60||!Number.isFinite(r.travel)||r.travel<0||r.travel>1||![r.from,r.to].every(p=>p&&[p.x,p.y,p.height].every(v=>Number.isFinite(v)&&Math.abs(v)<4096)))delete n.surfMotion;}}
    if(s.original){s.original.bicycle=s.original.bicycle===true&&Number(s.original.extraItems?.[450])>0;}
    if(s.original){s.original.rollerSwitches=Array.from({length:4},(_,i)=>s.original.rollerSwitches?.[i]===1?1:0);s.original.rollerFrames=Array.from({length:4},(_,i)=>Number.isFinite(s.original.rollerFrames?.[i])?Math.max(0,Math.min(360,s.original.rollerFrames[i])):i===0?40:0);}
    if(s.original){const n=s.original,number=(v,fallback,min,max)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;n.clayHeight=number(n.clayHeight,50,-64,55);n.clayLifts=Array.from({length:6},(_,i)=>n.clayLifts?.[i]===1?1:0);n.clayBarrier=n.clayBarrier===1?1:0;n.clayBarrierFrame=number(n.clayBarrierFrame,n.clayBarrier?300:0,0,300);n.clayActors=Object.fromEntries(Object.entries(n.clayActors||{}).filter(([k,v])=>Number.isInteger(+k)&&+k>=0&&+k<=255&&Number.isFinite(v)&&v>=-64&&v<=55));if(n.clayRide){const r=n.clayRide,good=['lift','main','ante'].includes(r.kind)&&[97,98].includes(r.zone)&&r.zone===n.zone&&[r.from,r.to,r.current].every(v=>Number.isFinite(v)&&v>=-64&&v<=55)&&Number.isFinite(r.speed)&&r.speed>0&&r.speed<=100&&Number.isFinite(r.elapsed)&&r.elapsed>=0&&r.elapsed<100;if(!good)delete n.clayRide;else{r.motorAge=number(r.motorAge,0,0,12);if(r.kind==='lift'&&(!Number.isInteger(r.index)||r.index<0||r.index>5))delete n.clayRide;}}}
    if(root.OPELUCID_SCENES?.[v.original?.zone]&&Number.isFinite(v.player?.x)&&Number.isFinite(v.player?.y)){const grids=root.OPELUCID_SCENES[v.original.zone].permissionGrids;if(grids?.length)s.player={x:Math.max(Math.min(...grids.map(g=>g.x))-24,Math.min(Math.max(...grids.map(g=>g.x))+24,v.player.x)),y:Math.max(Math.min(...grids.map(g=>g.z))-24,Math.min(Math.max(...grids.map(g=>g.z))+24,v.player.y))};}
    if(s.original?.railCurrent){const r=s.original.railCurrent;if((![28,30,249,338,339,340,341].includes(r.zone)&&!root.OPELUCID_RAILS?.[r.zone])||r.zone!==s.original.zone||!Number.isFinite(r.height)||Math.abs(r.height)>512||!Number.isInteger(r.line)||r.line<0||r.line>511)delete s.original.railCurrent;else s.original.railCurrent={zone:r.zone,height:r.height,line:r.line,...(Number.isFinite(r.front)?{front:r.front}:{}),...(Number.isFinite(r.side)?{side:r.side}:{})};}
    root.DragonspiralJump?.normalize(s.original);root.OpelucidGymSave?.normalize(s.original);
    if(s.original?.daycare){const care=s.original.daycare,p=care.pokemon;
      if(p&&names.includes(p.name)&&Number.isInteger(p.level)&&p.level>=2&&p.level<=100&&Array.isArray(p.pp)){
       const clean=normalize({...fresh(),phase:'route',starter:s.starter,party:[{name:s.starter,level:5},p]});care.pokemon=clean.party[1];care.level=Math.max(2,Math.min(p.level,Math.floor(care.level)||p.level));care.distance=Number.isFinite(care.distance)?Math.max(0,Math.min(.999999,care.distance)):0;
      }else {s.original.daycareRecovery=care;delete s.original.daycare;}
    }
    return s;
  }
  function speciesNames(){return [...new Set([...starters,'Patrat','Lillipup','Purrloin','Pansage','Pansear','Panpour','Munna','Musharna','Pidove','Blitzle','Roggenrola','Woobat','Tympole','Timburr',...Object.entries(root.TRAINING_DATA?.progression||{}).filter(([,p])=>p.obtainable).map(([name])=>name)])];}
  function register(s,name,caught=false,appearance){
    name=root.TRAINING_DATA?.progression?.[name]?.dexName||name;
    if(!speciesNames().includes(name)&&(caught||!root.TRAINING_DATA?.progression?.[name]))return false;
    s.dex??={seen:[],caught:[]};if(!s.dex.seen.includes(name))s.dex.seen.push(name);
    if(appearance&&typeof appearance==='object'){const valid={...(['M','F','N'].includes(appearance.gender)?{gender:appearance.gender}:{}),...(Number.isInteger(appearance.form)&&appearance.form>=0&&appearance.form<4?{form:appearance.form}:{})};if(Object.keys(valid).length){s.dex.appearances??={};if(!s.dex.appearances[name])s.dex.appearances[name]=valid;}}
    const first=caught&&!s.dex.caught.includes(name);if(first)s.dex.caught.push(name);return first;
  }
  function read(storage){try{const raw=storage.getItem(KEY);if(!raw)return fresh();return normalize(JSON.parse(raw))||fresh();}catch{return fresh();}}
  function write(storage,state){try{const normalized=normalize(state);if(!normalized)return false;storage.setItem(KEY,JSON.stringify(normalized));return true;}catch{return false;}}
  function erase(storage){try{if(!storage)return false;storage.removeItem(KEY);return storage.getItem(KEY)==null;}catch{return false;}}
  const api={cleanPokemon,erase,KEY,phases,starters,scenes,objectives,fresh,advance,choose,rivalStarter,register,normalize,read,write};root.StoryState=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
