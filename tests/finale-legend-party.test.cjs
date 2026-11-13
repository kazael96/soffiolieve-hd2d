/* Original command semantics. Battle outcomes below are explicit test inputs. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('legend selection requires own non-egg Reshiram and swaps the entire lead record without losing party order',async()=>{
 const c=await setup(),j=c.Journey,s=j.state;s.trainer={id:123};const own=j.record(c.makeMon('Reshiram',50));own.nickname='Luce';own.hp=17;own.pp[0].left=1;
 const foreign={...own,otId:124},egg={...own,egg:true},other=j.record(c.makeMon('Zekrom',50));s.party.push(foreign,egg,other,own);
 assert.equal(c.FinaleLegendParty.find(s),4);const first=s.party[0];assert.equal(c.FinaleLegendParty.lead(s),true);assert.equal(s.party[0],own);assert.equal(s.party[4],first);assert.equal(s.party[0].hp,17);assert.equal(s.party[0].pp[0].left,1);
 const packed=j.pack(j.unpack(own),own.xp);assert.equal(packed.otId,123);assert.equal(c.StoryState.cleanPokemon(packed).otId,123);
});
test('original capture event stores own Reshiram, offers the full-party exchange and starts Black N587; supplied N loss permits retry',async()=>{
 for(const full of [false,true]){
  const c=await setup(),n=c.NativeStory.state,j=c.Journey;n.vars[16566]=2;n.vars[16436]=4617;n.flags=n.flags.filter(f=>![660,661].includes(f));j.state.trainer={id:123};c.NativeReturnLocation.set(n,12);
  if(full)while(j.state.party.length<6)j.state.party.push(j.record(c.makeMon('Watchog',30)));
  const first=j.state.party[0];await drain(c,c.NativeStory.changeZone(278,16,40));const original=c.startBattle,battles=[];let aftermath;
  c.startBattle=async(trainer,config)=>{battles.push({trainer,config});if(trainer)return original(trainer,config);
   const s=new c.GEN5.Session(config.p1,config.p2,{enemyName:'Pokémon selvatico',seed:[1,2,3,4]});c.configureOpeningBattle(s,config);j.attachBattle(s,'wild');s.battle.win('p1');c.NativeStory.coverBattleReturn();assert.equal(c.$('fieldFade').style.opacity,'1');aftermath=j.afterBattle(s,'wild',Object.assign(c.makeMon('Reshiram',50),{ballId:1}),false);
  };
  await drain(c,c.NativeStory.run(7),0,'p2');await aftermath;
  assert.equal(battles.length,2);assert.equal(battles[0].trainer,false);assert.equal(battles[0].config.nativeWildFlags,273);assert.equal(battles[1].config.trainerId,587);assert.equal(battles[1].config.p2[0].name,'Zekrom');assert.equal(battles[1].config.p1[0].name,'Reshiram');
  assert.equal(n.vars[16566],3);assert.ok(n.flags.includes(307)&&n.flags.includes(661));assert.equal(n.zone,146);assert.equal(j.state.party[0].otId,123);assert.equal(j.state.party[0].name,'Reshiram');assert.equal(c.NativeStory.locked,false);
  if(full){assert.equal(j.state.party.length,6);const boxed=j.state.storage.boxes.flat().filter(Boolean);assert.equal(boxed.length,1);assert.equal(boxed[0].name,first.name);assert.equal(j.state.storage.boxes.flat().filter(p=>p?.name==='Reshiram').length,0);}else assert.equal(j.state.party.length,2);
 }
});
test('full party swaps selected member into the same Box slot and brings own Reshiram to the lead atomically',async()=>{
 const c=await setup(),j=c.Journey,s=j.state;s.trainer={id:123};while(s.party.length<6)s.party.push(j.record(c.makeMon('Watchog',30)));
 const catchResult=j.storage.capture(j.record(c.makeMon('Reshiram',50)));assert.equal(catchResult.ok,true);assert.equal(catchResult.party,undefined);const old=s.party[3];
 assert.equal(c.FinaleLegendParty.fromBox(s,j.storage,3),true);assert.equal(s.party.length,6);assert.equal(s.party[0].name,'Reshiram');assert.equal(s.party[0].otId,123);assert.equal(j.storage.get(catchResult).name,old.name);assert.equal(j.storage.get(catchResult).otId,old.otId);assert.equal(s.storage.boxes.flat().filter(p=>p?.name==='Reshiram').length,0);
 const snapshot=JSON.stringify(s);assert.throws(()=>c.FinaleLegendParty.fromBox(s,j.storage,6),/non valida/);assert.equal(JSON.stringify(s),snapshot);
});
test('the original forced legendary exchange archives held Mail before depositing the chosen Pokemon',async()=>{
 const c=await setup(),j=c.Journey,s=j.state;s.trainer={id:123};while(s.party.length<6)s.party.push(j.record(c.makeMon('Watchog',30)));const letter=c.MistraltonMail.createLetter(137,Array.from({length:3},()=>({group:0,phrase:0,words:[{group:5,word:3}]})),'Alcide');assert.ok(letter);s.party[3].heldItem=137;s.party[3].mail=letter;const caught=j.storage.capture(j.record(c.makeMon('Reshiram',50)));
 assert.equal(c.FinaleLegendParty.fromBox(s,j.storage,3),true);const archived=c.MistraltonMail.mailbox().filter(Boolean);assert.equal(archived.length,1);assert.equal(JSON.stringify(archived[0]),JSON.stringify({item:137,letter}));assert.equal(j.storage.get(caught).heldItem,0);assert.equal(j.storage.get(caught).mail,undefined);assert.equal(s.party[0].name,'Reshiram');
 const saved=c.StoryState.normalize(s);assert.ok(saved);assert.equal(JSON.stringify(saved.original.pcMail[0]),JSON.stringify({item:137,letter}));assert.equal(saved.original.pcMail.length,20);
});
test('full Mail storage or failed legendary swap preserves both Pokemon and the letter',async()=>{
 const c=await setup(),j=c.Journey,s=j.state;s.trainer={id:123};while(s.party.length<6)s.party.push(j.record(c.makeMon('Watchog',30)));const letter=c.MistraltonMail.createLetter(137,Array.from({length:3},()=>({group:0,phrase:0,words:[{group:5,word:3}]})),'Alcide');s.party[2].heldItem=137;s.party[2].mail=letter;j.storage.capture(j.record(c.makeMon('Reshiram',50)));s.original.pcMail=Array.from({length:20},()=>({item:137,letter:structuredClone(letter)}));const before=JSON.stringify(s);
 assert.throws(()=>c.FinaleLegendParty.fromBox(s,j.storage,2),error=>error.code==='MAILBOX_FULL');assert.equal(JSON.stringify(s),before);
 s.original.pcMail=Array(20).fill(null);const snapshot=JSON.stringify(s),move=j.storage.move;j.storage.move=()=>({ok:false,reason:'busy'});assert.throws(()=>c.FinaleLegendParty.fromBox(s,j.storage,2),/non riuscita/);j.storage.move=move;assert.equal(JSON.stringify(s),snapshot);
});
test('a full Mail box follows the original declined-exchange branch instead of locking the native event',async()=>{
 const c=await setup(),j=c.Journey,s=j.state,n=c.NativeStory.state;s.trainer={id:123};while(s.party.length<6)s.party.push(j.record(c.makeMon('Watchog',30)));const letter=c.MistraltonMail.createLetter(137,Array.from({length:3},()=>({group:0,phrase:0,words:[{group:5,word:3}]})),'Alcide');s.party[2].heldItem=137;s.party[2].mail=letter;j.storage.capture(j.record(c.makeMon('Reshiram',50)));n.pcMail=Array.from({length:20},()=>({item:137,letter:structuredClone(letter)}));const snapshot=()=>JSON.stringify({party:s.party,storage:s.storage,mail:n.pcMail}),before=snapshot(),m=c.NativeStory.vm;m.bank=556;m.pc=6625;
 await drain(c,m.host.command({name:'NativeOpcode581'},[2,2],[2,2],m));assert.equal(m.pc,6652);assert.equal(snapshot(),before);assert.equal(c.NativeStory.locked,false);
});
test('native VM counts all720 Box slots and actual free party capacity, including the final slot',async()=>{
 const c=await setup(),n=c.NativeStory.state,m=c.NativeStory.vm,b=9003;
 m.data.scripts[b]={entries:[0],code:{0:{name:'NativeOpcode289',op:289,args:[0x8010,5],end:6},6:{name:'PokePartyGetCount',op:259,args:[0x8011,5],end:12},12:{name:'VMHalt',op:2,args:[],end:14}}};
 await drain(c,m.run(b,0));assert.equal(n.vars[0x8010],720);assert.equal(n.vars[0x8011],5);
 c.Journey.state.storage=c.PokemonStorage.fresh();for(const box of c.Journey.state.storage.boxes)box.fill(c.Journey.state.party[0]);while(c.Journey.state.party.length<6)c.Journey.state.party.push(c.Journey.state.party[0]);
 await drain(c,m.run(b,0));assert.equal(n.vars[0x8010],0);assert.equal(n.vars[0x8011],0);c.Journey.state.storage.boxes[23][29]=null;await drain(c,m.run(b,0));assert.equal(n.vars[0x8010],1);
});
test('original throne encounter retains Reshiram after KO and blackouts return to registered League Center on loss',async()=>{
 for(const outcome of ['p1','p2']){const c=await setup(),n=c.NativeStory.state;n.vars[16566]=2;n.vars[16436]=4617;n.flags=n.flags.filter(f=>![660,661].includes(f));assert.equal(c.NativeReturnLocation.set(n,12),true);
  await drain(c,c.NativeStory.changeZone(278,16,40));await drain(c,c.NativeStory.run(7),0,outcome);
  if(outcome==='p1'){assert.equal(n.battleResult,1);assert.equal(n.vars[16566],2);assert.ok(c.npcs.some(a=>a.uid===4&&!a.hidden));assert.ok(!n.flags.includes(307));}
  else {assert.equal(n.battleResult,2);assert.equal(n.zone,146);assert.equal(n.blackoutQueued,false);assert.ok(c.Journey.state.party.every(p=>p.hp>0));}
  assert.equal(c.NativeStory.locked,false);
 }
});
