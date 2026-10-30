/* Original opening order. A save records completed events, never open dialogs. */
(function(root){
  const KEY='soffiolieve-black-opening-v2';
  const phases=['gift','belle','komor','mother','biancaHouse','lab','map','routeStart','tutorial','route','arrival','centerHeal','centerTour','plasma','nextRoute','route2','striaton','dreamyard','dreamyardDone','route3','wellspring','nacrene','nacreneGym','pinwheel','skyarrow','castelia'];
  const starters=['Snivy','Tepig','Oshawott'];
  const scenes=['bedroom','home','bianca','biancaRoom','komorHome','komorRoom','lab','town',...['398','399','400','401','402','403','404','405','320','8','7','9','10','15','152','322','323','324','27','20','17','18','19','154','155','250','251','252','249','28','41'].map(z=>'zone'+z)];
  const objectives={gift:'Apri il regalo di Aralia nella tua camera.',belle:'Affronta Belle nella tua prima lotta.',komor:'Ora tocca alla lotta con Komor.',mother:'Scendi al piano terra e parla con Mamma.',biancaHouse:'Raggiungi Belle a casa sua, a sud-ovest.',lab:'Incontra Aralia nel laboratorio.',map:'Parla con Mamma fuori dal laboratorio.',routeStart:'Raggiungi Belle e Komor all’uscita nord.',tutorial:'Segui Aralia sul Percorso 1.',route:'Attraversa il Percorso 1 verso Quattroventi.',arrival:'Sei arrivato a Quattroventi. Fine della demo.'};
  Object.assign(objectives,{arrival:'Parla con Aralia davanti al Centro Pokémon di Quattroventi.',centerHeal:'Affida la tua squadra all’infermiera.',centerTour:'Segui Aralia nella visita al Centro Pokémon.',plasma:'Scopri cosa accade nella piazza di Quattroventi.',nextRoute:'Attraversa il varco a ovest verso il Percorso 2.',route2:'Attraversa il Percorso 2 e raggiungi Levantopoli.',striaton:'Sei arrivato a Levantopoli. Esplora la città e il Centro Pokémon.'});
  Object.assign(objectives,{route3:'Attraversa il Percorso 3 e raggiungi Zefiropoli.',wellspring:'Aiuta Komor a recuperare il Pokémon rubato nella Grotta Minerale.',nacrene:'Sei arrivato a Zefiropoli. Puoi visitare il Centro Pokémon.',striaton:'Sfida la palestra di Levantopoli. Puoi prepararti alla scuola e al Cantiere dei Sogni.',dreamyard:'Aiuta Zania nella ricerca del Fumonirico al Cantiere dei Sogni.',dreamyardDone:'Hai completato la palestra e la ricerca di Zania.'});
  Object.assign(objectives,{nacreneGym:'Visita il museo e affronta la palestra di Aloé.',pinwheel:'Recupera il Teschio rubato nel Bosco Girandola.',skyarrow:'Attraversa il Ponte Freccialuce verso Austropoli.',castelia:'Hai raggiunto Austropoli. Puoi visitare il Centro Pokémon.'});
  function fresh(){return {version:2,playerName:'Alcide',phase:'gift',scene:'bedroom',player:{x:-10.5,y:-9.5},facing:3,starter:null,party:[],dex:{seen:[],caught:[]},pokeballs:0,potions:0,money:3000,routePotion:false};}
  function advance(s,expected){if(s.phase!==expected)return false;s.phase=phases[phases.indexOf(expected)+1]||expected;return true;}
  function choose(s,name){if(s.phase!=='gift'||!starters.includes(name))return false;s.starter=name;s.phase='belle';return true;}
  function rivalStarter(name,rival){return (rival==='Belle'?{Snivy:'Oshawott',Tepig:'Snivy',Oshawott:'Tepig'}:{Snivy:'Tepig',Tepig:'Oshawott',Oshawott:'Snivy'})[name];}
  function traits(p){
    const result={};for(const name of ['ivs','evs'])if(p[name])result[name]=Object.fromEntries(['hp','atk','def','spe','spa','spd'].map(k=>[k,Math.max(0,Math.min(name==='ivs'?31:255,Math.floor(p[name][k])||0))]));
    if(typeof p.nature==='string')result.nature=p.nature.slice(0,12);
    if(['M','F','N'].includes(p.gender))result.gender=p.gender;
    if(Number.isInteger(p.abilityId))result.abilityId=Math.max(1,Math.min(164,p.abilityId));
    if(Number.isInteger(p.happiness))result.happiness=Math.max(0,Math.min(255,p.happiness));
    if(Number.isInteger(p.personality)&&p.personality>=0&&p.personality<=0xffffffff)result.personality=p.personality;
    if(p.met&&Number.isFinite(Date.parse(p.met.date))&&Number.isInteger(p.met.zone)&&Number.isInteger(p.met.level))result.met={date:new Date(p.met.date).toISOString(),zone:p.met.zone,level:Math.max(1,Math.min(100,p.met.level))};
    return result;
  }
  function normalize(v){
    if(!v||v.version!==2||!phases.includes(v.phase)||!scenes.includes(v.scene))return null;
    if(v.phase!=='gift'&&!starters.includes(v.starter))return null;
    const s=fresh();s.phase=v.phase;s.scene=v.scene;s.starter=starters.includes(v.starter)?v.starter:null;
    if(Number.isFinite(v.player?.x)&&Number.isFinite(v.player?.y))s.player={x:Math.max(-240,Math.min(v.original?.zone===249?192:96,v.player.x)),y:Math.max(-256,Math.min(v.original?.zone===249?336:96,v.player.y))};
    s.facing=[0,3,6,9].includes(v.facing)?v.facing:3;
    const names=speciesNames();
    s.party=Array.isArray(v.party)?v.party.filter(p=>names.includes(p?.name)).slice(0,6).map(p=>({name:p.name,nickname:typeof p.nickname==='string'?p.nickname.slice(0,10):'',...([0,3,4,6,14,17,18,21,22,25,26,27,28,30,38,50,58,81,79,150,155,91,217,222,239,296].includes(p.heldItem)?{heldItem:p.heldItem}:{}),...traits(p),level:Math.max(2,Math.min(100,Math.floor(p.level)||5)),xp:Math.max(0,Math.floor(p.xp)||0),hp:Number.isInteger(p.hp)?Math.max(0,Math.min(999,p.hp)):null,status:['par','brn','psn','tox','slp','frz'].includes(p.status)?p.status:'',pp:Array.isArray(p.pp)?p.pp.filter(m=>Number.isInteger(m?.id)&&Number.isInteger(m?.left)).map(m=>({id:m.id,left:Math.max(0,Math.min(99,m.left))})).slice(0,4):[]})):[];
    const isStarter=name=>root.Training?root.Training.starterFamily(name,s.starter):name===s.starter;
    if(s.phase!=='gift'&&(!s.party.length||!s.party.some(p=>isStarter(p.name))&&!(isStarter(v.original?.daycare?.pokemon?.name)&&Number.isInteger(v.original.daycare.pokemon.level)&&Array.isArray(v.original.daycare.pokemon.pp))))return null;
    const valid=list=>Array.isArray(list)?[...new Set(list.filter(n=>[...names,'Purrloin'].includes(n)))]:[];
    s.dex={seen:valid(v.dex?.seen),caught:valid(v.dex?.caught)};
    for(const p of s.party)register(s,p.name,true);
    if(!v.dex&&s.starter&&phases.indexOf(s.phase)>=phases.indexOf('mother'))for(const rival of ['Belle','Komor'])register(s,rivalStarter(s.starter,rival));
    s.dex.seen=[...new Set([...s.dex.seen,...s.dex.caught])];
    s.pokeballs=Math.max(0,Math.min(999,Math.floor(v.pokeballs)||0));s.potions=Math.max(0,Math.min(999,Math.floor(v.potions)||0));s.routePotion=v.routePotion===true;
    s.playerName=typeof v.playerName==='string'?v.playerName.slice(0,10):'Alcide';
    if(v.trainer&&root.TrainerProfile){const profile=root.TrainerProfile.normalize(v.trainer);if(profile)s.trainer=profile;}
    s.money=Number.isFinite(v.money)?Math.max(0,Math.min(9999999,Math.floor(v.money))):3000;
    if(v.original&&Number.isInteger(v.original.zone)&&[6,7,8,9,10,15,16,17,18,19,20,27,28,41,152,154,155,249,250,251,252,317,319,320,321,322,323,324,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405].includes(v.original.zone)){s.original=structuredClone(v.original);s.original.flags=(s.original.flags||[]).filter(Number.isInteger);s.original.vars=Object.fromEntries(Object.entries(s.original.vars||{}).filter(([k,n])=>Number.isInteger(+k)&&Number.isInteger(n)));}
    if(s.original?.railCurrent){const r=s.original.railCurrent;if(![28,249].includes(r.zone)||r.zone!==s.original.zone||!Number.isFinite(r.height)||Math.abs(r.height)>512||!Number.isInteger(r.line)||r.line<0||r.line>511)delete s.original.railCurrent;else s.original.railCurrent={zone:r.zone,height:r.height,line:r.line,...(Number.isFinite(r.front)?{front:r.front}:{}),...(Number.isFinite(r.side)?{side:r.side}:{})};}
    if(s.original?.daycare){const care=s.original.daycare,p=care.pokemon;
      if(p&&names.includes(p.name)&&Number.isInteger(p.level)&&p.level>=2&&p.level<=100&&Array.isArray(p.pp)){
       const clean=normalize({...fresh(),phase:'route',starter:s.starter,party:[{name:s.starter,level:5},p]});care.pokemon=clean.party[1];care.level=Math.max(2,Math.min(p.level,Math.floor(care.level)||p.level));care.distance=Number.isFinite(care.distance)?Math.max(0,Math.min(.999999,care.distance)):0;
      }else {s.original.daycareRecovery=care;delete s.original.daycare;}
    }
    return s;
  }
  function speciesNames(){return [...new Set([...starters,'Patrat','Lillipup','Purrloin','Pansage','Pansear','Panpour','Munna','Musharna','Pidove','Blitzle','Roggenrola','Woobat','Tympole','Timburr',...Object.entries(root.TRAINING_DATA?.progression||{}).filter(([,p])=>p.obtainable).map(([name])=>name)])];}
  function register(s,name,caught=false){
    if(!speciesNames().includes(name))return false;
    s.dex??={seen:[],caught:[]};if(!s.dex.seen.includes(name))s.dex.seen.push(name);
    const first=caught&&!s.dex.caught.includes(name);if(first)s.dex.caught.push(name);return first;
  }
  function read(storage){try{const raw=storage.getItem(KEY);if(!raw)return fresh();return normalize(JSON.parse(raw))||fresh();}catch{return fresh();}}
  function write(storage,state){try{const normalized=normalize(state);if(!normalized)return false;storage.setItem(KEY,JSON.stringify(normalized));return true;}catch{return false;}}
  function erase(storage){try{if(!storage)return false;storage.removeItem(KEY);return storage.getItem(KEY)==null;}catch{return false;}}
  const api={erase,KEY,phases,starters,scenes,objectives,fresh,advance,choose,rivalStarter,register,normalize,read,write};root.StoryState=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
