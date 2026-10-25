/* Exercise the actual story controller against real release maps and Gen V battles. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const site=path.resolve(process.argv[2]||'_site');
function environment(){
 const elements=new Map(),records=new Map();
 function element(id=''){if(elements.has(id))return elements.get(id);const e={id,style:{},dataset:{},children:[],hidden:false,open:false,checked:false,firstChild:{},classList:{toggle(){},remove(){}},append(...v){this.children.push(...v);},replaceChildren(){this.children=[];},showModal(){this.open=true;},close(){this.open=false;},addEventListener(){},focus(){}};if(id)elements.set(id,e);return e;}
 const c={console,Math,Buffer,TextEncoder,TextDecoder,setTimeout,clearTimeout,setInterval(){},addEventListener(){},performance,
  localStorage:{getItem:k=>records.get(k),setItem:(k,v)=>records.set(k,v)},$:element,npcs:[],player:{x:-2,y:0},facing:3,potions:0,battling:false,cooldown:0,partner:null,resetInput(){},refresh(){},toast(){},rival:'Belle',
  document:{hidden:false,body:{classList:{toggle(){}}},querySelector:s=>element(s),querySelectorAll:()=>[],addEventListener(){},createElement:()=>element(),createTextNode:s=>s},
  menuOpen:()=>[...elements.values()].some(e=>e.open)};c.window=c;vm.createContext(c);
 for(const file of ['assets/scene.js','opening-assets.js','opening-data.js','assets/battle-data.js','battle-sim.js','engine.js','journey-state.js','story-state.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),c,{filename:file});
 c.renderer={scene:c.ROM_SCENE,zoom:1.4,cinema:true,center:[0,0]};
 const source=fs.readFileSync(path.join(site,'game.js'),'utf8');vm.runInContext(source.slice(source.indexOf('function blocked('),source.indexOf('function drawWorld')),c);
 c.startBattle=(trainer,config)=>{c.lastBattle={trainer,config};};
 vm.runInContext(fs.readFileSync(path.join(site,'story.js'),'utf8'),c,{filename:'story.js'});
 c.continue=()=>element('dialogueContinue').onclick();
 c.simulate=(winner)=>{
  const {config}=c.lastBattle;const s=new c.GEN5.Session(config.p1,config.p2,{enemyName:config.story,seed:[1,2,3,4]});c.Journey.attachBattle(s,config.story);
  if(winner==='play')for(let i=0;i<50&&!s.battle.ended;i++)s.act('move 1');else s.battle.win(winner);
  assert.ok(s.battle.ended);c.Journey.afterBattle(s,config.story,null,false);return s;
 };
 return c;
}
for(const name of ['Snivy','Tepig','Oshawott'])for(const outcome of ['p1','p2','play']){
 const c=environment(),j=c.Journey;c.Journey.interact();
 const button=c.$('starterChoices').children.find(b=>b.children.some(t=>typeof t==='string'&&t.startsWith(name)));assert.ok(button);button.onclick();c.continue();
 assert.equal(c.lastBattle.config.story,'Belle');assert.equal(c.lastBattle.config.p1[0].level,5);assert.equal(c.lastBattle.config.p2[0].level,5);
 c.simulate(outcome);assert.equal(j.state.phase,'komor');assert.ok(j.state.party[0].hp>0);c.continue();
 j.talk('Komor');c.continue();assert.equal(c.lastBattle.config.story,'Komor');c.simulate(outcome);assert.equal(j.state.phase,'mother');c.continue();
 c.player={x:-7.5,y:-13.5};j.interact();assert.equal(j.state.scene,'home');assert.equal(c.blocked(c.player.x,c.player.y),false);
 j.talk('Mamma');c.continue();assert.equal(j.state.phase,'biancaHouse');assert.ok(j.state.party[0].hp>0);
 c.player={x:-10.5,y:-5.5};j.interact();assert.equal(j.state.scene,'town');c.player={x:-7.5,y:6.5};j.interact();assert.equal(j.state.scene,'bianca');c.continue();c.continue();assert.equal(j.state.phase,'lab');
 c.player={x:-10.5,y:-5.5};j.interact();c.player={x:-6.5,y:-10.5};j.interact();assert.equal(j.state.scene,'lab');c.continue();c.continue();assert.equal(j.state.phase,'map');
 c.player={x:-12.5,y:-4.5};j.interact();j.talk('Mamma');c.continue();assert.equal(j.state.phase,'routeStart');j.talk('Belle');c.continue();c.continue();assert.equal(j.state.phase,'tutorial');
 assert.equal(c.blocked(c.player.x-.18,c.player.y-.18),false,'Route entry spawn');
 j.afterBattle(null,'tutorial');assert.equal(j.state.pokeballs,5);c.continue();c.continue();assert.equal(j.state.phase,'route');
 j.talk('Viandante');c.continue();assert.equal(c.potions,1);j.talk('Viandante');c.continue();assert.equal(c.potions,1,'Potion must not duplicate');
 j.talk('Belle');c.continue();c.continue();assert.equal(j.state.phase,'arrival');c.continue();j.save(true);
 const saved=c.StoryState.read(c.localStorage);assert.equal(saved.phase,'arrival');assert.equal(saved.starter,name);assert.equal(saved.pokeballs,5);
}
console.log('PASS: nine complete story flows (three starters × win/loss/real simulated battles), item gates, room transitions and saved arrival.');

(async()=>{
 for(const caught of [true,false]){
  const c=environment();Object.assign(c.Journey.state,{phase:'route',scene:'town',starter:'Snivy',pokeballs:5,party:[{name:'Snivy',level:7,xp:236,hp:24,status:'',pp:[]}]});
  const config=c.Journey.configs();c.session=new c.GEN5.Session(config,[{name:'Patrat',level:2}],{seed:[2,3,4,5]});c.Journey.attachBattle(c.session,'wild');
  Object.assign(c,{busy:false,finished:false,storyBattle:'wild',capturedMon:null,updateBattle(){},captureVisualContext(){},log(){},animationPause:async()=>{},playBattleEvents:async()=>{},snapshotPartner(){c.partner=c.session.snapshot();c.enemy=c.session.snapshot('p2');c.finished=c.session.battle.ended;}});
  const source=fs.readFileSync(path.join(site,'battle-ui.js'),'utf8');vm.runInContext(source.slice(source.indexOf('async function throwStoryBall'),source.indexOf("$('catchBall').onclick")),c);
  const random=c.session.battle.random.bind(c.session.battle);let rolls=0;c.session.battle.random=(...args)=>{if(args.length===1&&args[0]===65536&&rolls++<3)return caught?0:65535;return random(...args);};
  const turn=c.session.battle.turn;await c.throwStoryBall();assert.equal(c.Journey.state.pokeballs,4);
  if(caught){assert.equal(c.capturedMon.name,'Patrat');assert.equal(c.finished,true);c.Journey.afterBattle(c.session,'wild',c.capturedMon,false);assert.equal(c.Journey.state.party.length,2);assert.equal(c.Journey.state.party[1].name,'Patrat');}
  else{assert.equal(c.capturedMon,null);assert.equal(c.session.battle.turn,turn+1,'A failed throw must grant the opponent a turn');assert.equal(c.busy,false);}
 }
 console.log('PASS: actual Poké Ball handler, successful capture, failed throw/opponent turn, party and inventory.');
})().catch(error=>{console.error(error);process.exitCode=1;});
