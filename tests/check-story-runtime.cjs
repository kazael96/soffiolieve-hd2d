/* Exercise the actual story controller against real release maps and Gen V battles. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const site=path.resolve(process.argv[2]||'_site');
function environment(){
 const elements=new Map(),records=new Map();
 function element(id=''){if(elements.has(id))return elements.get(id);const e={id,style:{},dataset:{},children:[],hidden:false,open:false,checked:false,firstChild:{},classList:{toggle(){},remove(){}},append(...v){this.children.push(...v);},replaceChildren(...v){this.children=[...v];},setAttribute(){},remove(){},showModal(){this.open=true;},close(){this.open=false;},addEventListener(){},focus(){}};if(id)elements.set(id,e);return e;}
 const c={console,Math,Buffer,structuredClone,TextEncoder,TextDecoder,setTimeout:(f)=>{queueMicrotask(f);return 0;},clearTimeout,setInterval(){},clearInterval(){},addEventListener(){},performance,
  localStorage:{getItem:k=>records.get(k),setItem:(k,v)=>records.set(k,v)},$:element,npcs:[],player:{x:-2,y:0},facing:3,potions:0,battling:false,cooldown:0,partner:null,resetInput(){},refresh(){},toast(){},rival:'Belle',
  document:{hidden:false,body:{classList:{toggle(){}},append(){}},querySelector:s=>element(s),querySelectorAll:()=>[],addEventListener(){},createElement:()=>element(),createTextNode:s=>s},
  menuOpen:()=>[...elements.values()].some(e=>e.open)};c.window=c;vm.createContext(c);
 for(const file of ['assets/scene.js','opening-assets.js','opening-data.js','opening-sprites.js','assets/battle-data.js','battle-sim.js','engine.js','journey-state.js','story-state.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),c,{filename:file});
 c.renderer={ready:true,scene:c.ROM_SCENE,zoom:1.4,cinema:true,center:[0,0]};
 const source=fs.readFileSync(path.join(site,'game.js'),'utf8');vm.runInContext(source.slice(source.indexOf('function blocked('),source.indexOf('function drawWorld')),c);
 c.startBattle=(trainer,config)=>{c.lastBattle={trainer,config};};
 vm.runInContext(fs.readFileSync(path.join(site,'story.js'),'utf8'),c,{filename:'story.js'});
 c.AudioEngine={setScene(){},playSound:async()=>{},cry:async()=>{}};
 c.playCatchingTutorial=async()=>c.NativeStory.battleDone(null,'tutorial');
 for(const file of ['original-events.js','field-event-vm.js','phone-assets.js','original-story.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),c,{filename:file});
 c.continue=()=>element('dialogueContinue').onclick();
 c.simulate=(winner)=>{
  const {config}=c.lastBattle;const s=new c.GEN5.Session(config.p1,config.p2,{enemyName:config.story,seed:[1,2,3,4]});c.Journey.attachBattle(s,config.story);
  if(winner==='play')for(let i=0;i<50&&!s.battle.ended;i++)s.act('move 1');else s.battle.win(winner);
  assert.ok(s.battle.ended);c.Journey.afterBattle(s,config.story,null,false);return s;
 };
 c.elements=elements;return c;
}

async function drain(c,promise,starter=0,outcome='play'){
 let done=false,error;Promise.resolve(promise).then(()=>done=true,e=>{done=true;error=e;});
 const messages=[];
 for(let frame=0;!done&&frame<30000;frame++){
  await Promise.resolve();c.Journey.step(1/30,false);
  if(c.lastBattle){const b=c.lastBattle;c.lastBattle=null;if(b.config.story!=='tutorial'){c.lastBattle=b;c.simulate(outcome);c.lastBattle=null;}}
  const d=c.$('dialogue');if(d.open){messages.push(c.$('dialogueText').textContent);
   if(!c.$('starterChoices').hidden){const choices=c.$('starterChoices').children;const i=choices[0]?.textContent==='Snivy'?starter:0;
    // Decline the optional nickname, accept the Pokédex and comparison.
    const text=c.$('dialogueText').textContent||'';const button=choices[text.includes('soprannome')?1:i];
    if(button?.onclick)button.onclick();else throw Error('Unexpected input '+text);
   }else if(!c.$('dialogueContinue').hidden)c.continue();
  }
 }
 if(error)throw error;assert.ok(done,'Original scene did not terminate');
 assert.equal(c.$('world').dataset.eventError,undefined,c.$('world').dataset.eventError);return messages;
}
(async()=>{
 for(const [starter,name] of ['Snivy','Tepig','Oshawott'].entries())for(const outcome of ['p1','p2','play']){
  const c=environment(),n=c.NativeStory,j=c.Journey;
  await drain(c,n.run(4,782),starter,outcome);assert.equal(n.state.vars[16513],1);assert.equal(c.npcs.find(n=>n.name==='Belle').hidden,undefined);
  await drain(c,n.run(8,782),starter,outcome);assert.equal(j.state.starter,name);assert.equal(n.state.vars[16513],2);assert.equal(n.state.roomMess,true);assert.equal(j.state.phase,'mother');
  await n.changeZone(390,3,3);await drain(c,n.run(0,780),starter,outcome);assert.equal(n.state.vars[16517],1);assert.equal(n.state.phone,true);
  await n.changeZone(392,5,9);await drain(c,n.run(2,784),starter,outcome);assert.equal(n.state.vars[16504],1);
  await n.changeZone(396,4,11);await drain(c,n.run(0,792),starter,outcome);assert.equal(n.state.vars[16505],1);assert.equal(n.state.pokedex,true);
  await n.changeZone(389,777,741);await drain(c,n.run(11,778),starter,outcome);assert.equal(n.state.vars[16512],2);assert.equal(n.state.map,true);
  c.player={x:4.5,y:-12.5};await drain(c,n.run(13,778),starter,outcome);assert.equal(n.state.vars[16508],1);assert.equal(j.state.pokeballs,5);assert.equal(j.state.phase,'route');
  await drain(c,n.run(1,634),starter,outcome);assert.equal(c.potions,1);await drain(c,n.run(1,634),starter,outcome);assert.equal(c.potions,1,'One potion only');
  c.player={x:6.5,y:-73.5};await drain(c,n.run(4,634),starter,outcome);assert.equal(n.state.vars[16508],2);assert.equal(j.state.phase,'route','Comparison is not arrival');
  c.player={x:6.5,y:-80.5};j.step(1/30,true);c.continue();j.save(true);assert.equal(j.state.phase,'arrival');
  const saved=c.StoryState.read(c.localStorage);assert.equal(saved.original.arrived,true);assert.equal(saved.starter,name);assert.equal(saved.original.vars[16508],2);
  console.log('PASS original scenes',name,outcome);
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
