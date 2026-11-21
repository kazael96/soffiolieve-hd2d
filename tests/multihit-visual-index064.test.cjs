const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');
const ui=fs.readFileSync(process.env.BATTLE_UI064_SOURCE||path.resolve(__dirname,'../src/battle-ui.js'),'utf8');
function host(){
 const elements=new Map(),calls=[],pauses=[],c={console,performance,structuredClone,setTimeout,clearTimeout};c.window=c;vm.createContext(c);
 for(const file of ['assets/battle-data.js','battle-sim.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),c,{filename:file});
 const element=id=>{if(!elements.has(id))elements.set(id,{dataset:{animationHistory:'[]'},hidden:false,textContent:''});return elements.get(id);};
 Object.assign(c,{$:element,partner:null,enemy:null,escapedBattle:false,visualState:{p1:{},p2:{}},visualBattleContext:{},log(){},nativeBattleMessage:()=>'',repaintCards(){},animationPause:async ms=>pauses.push(ms),GameSpeed:{now:()=>100},MoveFX:{async play(id,side,options){calls.push({id,side,hitIndex:options.context?.hitIndex,context:options.context});}},BattleContext:{choose:()=>({phase:0,variant:0})},ROM_MOVE_FX:{moves:new Proxy({},{get:(_,id)=>({id:+id})})},Journey:{state:{}},trainer:false,rival:''});
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../src/battle-events.js'),'utf8'),c,{filename:'battle-events.js'});
 const start=ui.indexOf('async function playBattleEvents('),end=ui.indexOf("\n$('animationSpeed')",start);assert.ok(start>=0&&end>start);
 const lines=ui.split(/\r?\n/),fn=prefix=>{const line=lines.find(s=>s.startsWith(prefix));assert.ok(line,prefix);return line;};
 vm.runInContext(ui.slice(start,end)+'\n'+fn('function captureVisualContext(')+'\n'+fn('function moveVisualMultihit(')+'\n'+fn('function moveVisualHitEvents(')+'\n'+fn('function moveVisualContext(')+'\n'+fn('async function playNativeMove('),c,{filename:'actual-battle-ui-functions.js'});
 return{c,calls,pauses};
}

for(const side of ['p1','p2'])test('actual Gen V five-hit turn emits one visual call per hit with separate indices on '+side,async()=>{
 const {c,calls}=host(),G=c.GEN5,skillLink=G.abilities.find(a=>a.key==='skilllink'||a.en==='Skill Link');assert.ok(skillLink,'Native Skill Link ability');let native=null,lines,beforeHP;
 // Use the simulator's real deterministic accuracy rolls. No supplied outcomes,
 // forced hit count, patched RNG, damage or event rows.
 for(let seed=1;seed<=12;seed++){
  const minccino={name:'Minccino',level:10,moves:[3],abilityId:skillLink.id},audino={name:'Audino',level:54,moves:[45]};
  const s=new G.Session([side==='p1'?minccino:audino],[side==='p2'?minccino:audino],{seed:[seed,2,3,4]});c.session=s;c.partner=s.snapshot();c.enemy=s.snapshot('p2');beforeHP={p1:c.partner.hp,p2:c.enemy.hp};c.captureVisualContext();const begin=s.battle.log.length;s.act('move 1');lines=s.battle.log.slice(begin);
  if(lines.some(line=>line.startsWith('|-hitcount|')&&line.endsWith('|5'))){native=s;break;}
 }
 assert.ok(native,'A real seeded five-hit turn must resolve');
 const before={log:native.battle.log.slice(),turn:native.battle.turn,hp:native.battle.getAllActive().map(p=>p.hp),pp:native.battle.getAllActive().map(p=>p.moveSlots.map(m=>m.pp))};
 const events=c.BATTLE_EVENTS.events(lines),moveIndex=events.findIndex(e=>e.kind==='move'&&c.GEN5.dex.moves.get(e.args[0]).id==='doubleslap');assert.ok(moveIndex>=0);
 const following=events.slice(moveIndex+1),stop=following.findIndex(e=>['move','cant','turn'].includes(e.kind)),segment=stop<0?following:following.slice(0,stop),damage=segment.filter(e=>e.kind==='-damage');assert.equal(damage.length,5);
 await c.playBattleEvents(lines);const actual=calls.filter(call=>call.id===3);assert.equal(actual.length,damage.length,'No extra/missing animation executions');assert.deepEqual(actual.map(call=>call.hitIndex),[0,1,2,3,4]);assert.ok(actual.every(call=>call.side===side));
 assert.equal(new Set(actual.map(call=>call.context)).size,5,'Contexts remain separate; later hits cannot rewrite first hit index');
 assert.deepEqual(native.battle.log.slice(),before.log);assert.equal(native.battle.turn,before.turn);assert.deepEqual(native.battle.getAllActive().map(p=>p.hp),before.hp);assert.deepEqual(native.battle.getAllActive().map(p=>p.moveSlots.map(m=>m.pp)),before.pp);
 const target=side==='p1'?'p2':'p1';assert.ok(beforeHP[target]>native.active(target).hp);assert.equal((target==='p1'?c.partner:c.enemy).hp,native.active(target).hp,'UI still applies the native HP progression');
});
