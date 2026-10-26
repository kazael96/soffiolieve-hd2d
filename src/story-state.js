/* Original opening order. A save records completed events, never open dialogs. */
(function(root){
  const KEY='soffiolieve-black-opening-v2';
  const phases=['gift','belle','komor','mother','biancaHouse','lab','map','routeStart','tutorial','route','arrival'];
  const starters=['Snivy','Tepig','Oshawott'];
  const scenes=['bedroom','home','bianca','biancaRoom','komorHome','komorRoom','lab','town'];
  const objectives={gift:'Apri il regalo di Aralia nella tua camera.',belle:'Affronta Belle nella tua prima lotta.',komor:'Ora tocca alla lotta con Komor.',mother:'Scendi al piano terra e parla con Mamma.',biancaHouse:'Raggiungi Belle a casa sua, a sud-ovest.',lab:'Incontra Aralia nel laboratorio.',map:'Parla con Mamma fuori dal laboratorio.',routeStart:'Raggiungi Belle e Komor all’uscita nord.',tutorial:'Segui Aralia sul Percorso 1.',route:'Attraversa il Percorso 1 verso Quattroventi.',arrival:'Sei arrivato a Quattroventi. Fine della demo.'};
  function fresh(){return {version:2,playerName:'Alcide',phase:'gift',scene:'bedroom',player:{x:-10.5,y:-9.5},facing:3,starter:null,party:[],pokeballs:0,potions:0,money:3000,routePotion:false};}
  function advance(s,expected){if(s.phase!==expected)return false;s.phase=phases[phases.indexOf(expected)+1]||expected;return true;}
  function choose(s,name){if(s.phase!=='gift'||!starters.includes(name))return false;s.starter=name;s.phase='belle';return true;}
  function rivalStarter(name,rival){return (rival==='Belle'?{Snivy:'Oshawott',Tepig:'Snivy',Oshawott:'Tepig'}:{Snivy:'Tepig',Tepig:'Oshawott',Oshawott:'Snivy'})[name];}
  function traits(p){
    const result={};for(const name of ['ivs','evs'])if(p[name])result[name]=Object.fromEntries(['hp','atk','def','spe','spa','spd'].map(k=>[k,Math.max(0,Math.min(name==='ivs'?31:255,Math.floor(p[name][k])||0))]));
    if(typeof p.nature==='string')result.nature=p.nature.slice(0,12);
    if(['M','F','N'].includes(p.gender))result.gender=p.gender;
    if(Number.isInteger(p.abilityId))result.abilityId=Math.max(1,Math.min(164,p.abilityId));
    if(Number.isInteger(p.happiness))result.happiness=Math.max(0,Math.min(255,p.happiness));
    return result;
  }
  function normalize(v){
    if(!v||v.version!==2||!phases.includes(v.phase)||!scenes.includes(v.scene))return null;
    if(v.phase!=='gift'&&!starters.includes(v.starter))return null;
    const s=fresh();s.phase=v.phase;s.scene=v.scene;s.starter=starters.includes(v.starter)?v.starter:null;
    if(Number.isFinite(v.player?.x)&&Number.isFinite(v.player?.y))s.player={x:Math.max(-31,Math.min(15,v.player.x)),y:Math.max(-83,Math.min(15,v.player.y))};
    s.facing=[0,3,6,9].includes(v.facing)?v.facing:3;
    const names=[...starters,'Patrat','Lillipup'];
    s.party=Array.isArray(v.party)?v.party.filter(p=>names.includes(p?.name)).slice(0,6).map(p=>({name:p.name,nickname:typeof p.nickname==='string'?p.nickname.slice(0,10):'',...traits(p),level:Math.max(2,Math.min(100,Math.floor(p.level)||5)),xp:Math.max(0,Math.floor(p.xp)||0),hp:Number.isInteger(p.hp)?Math.max(0,Math.min(999,p.hp)):null,status:['par','brn','psn','tox','slp','frz'].includes(p.status)?p.status:'',pp:Array.isArray(p.pp)?p.pp.filter(m=>Number.isInteger(m?.id)&&Number.isInteger(m?.left)).map(m=>({id:m.id,left:Math.max(0,Math.min(99,m.left))})).slice(0,4):[]})):[];
    if(s.phase!=='gift'&&(!s.party.length||s.party[0].name!==s.starter))return null;
    s.pokeballs=Math.max(0,Math.min(5,Math.floor(v.pokeballs)||0));s.potions=Math.max(0,Math.min(20,Math.floor(v.potions)||0));s.routePotion=v.routePotion===true;
    s.playerName=typeof v.playerName==='string'?v.playerName.slice(0,10):'Alcide';
    s.money=Number.isFinite(v.money)?Math.max(0,Math.min(9999999,Math.floor(v.money))):3000;
    if(v.original&&Number.isInteger(v.original.zone)&&[317,389,390,391,392,393,394,395,396].includes(v.original.zone)){s.original=structuredClone(v.original);s.original.flags=(s.original.flags||[]).filter(Number.isInteger);s.original.vars=Object.fromEntries(Object.entries(s.original.vars||{}).filter(([k,n])=>Number.isInteger(+k)&&Number.isInteger(n)));}
    return s;
  }
  function read(storage){try{const raw=storage.getItem(KEY);if(!raw)return fresh();return normalize(JSON.parse(raw))||fresh();}catch{return fresh();}}
  function write(storage,state){try{const normalized=normalize(state);if(!normalized)return false;storage.setItem(KEY,JSON.stringify(normalized));return true;}catch{return false;}}
  const api={KEY,phases,starters,scenes,objectives,fresh,advance,choose,rivalStarter,normalize,read,write};root.StoryState=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
