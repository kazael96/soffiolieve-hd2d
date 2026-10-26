const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../src/battle-ui.js'),'utf8');
function environment(escape=true){
 const logs=[],music=[],battle={log:[],ended:false,win(){this.ended=true;this.winner='Alcide';this.log.push('|win|Alcide');}};
 const c={console,busy:false,finished:false,storyBattle:'wild',escapedBattle:false,labBattle:false,trainer:false,partner:{},enemy:{},
  session:{battle,flee:()=>escape,act:()=>battle.win()},Journey:{recordParticipant(){}},
  AudioEngine:{setScene:name=>music.push(name)},MoveFX:{cancel(){}},
  updateBattle(){},captureVisualContext(){},snapshotPartner(){c.finished=battle.ended;},syncVisualVolatiles(){},showOpeningTrainerHint:async()=>{},
  log:text=>logs.push(text),GEN5:{translate:line=>line.startsWith('|win|')?'Alcide vince la lotta!':null},
  BATTLE_EVENTS:require('../src/battle-events.js'),$:()=>({hidden:false}),setTimeout:f=>f()};
 c.window=c;vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf('function nativeBattleMessage('),source.indexOf('const STATUS_NAMES=')),c);
 vm.runInContext(source.slice(source.indexOf('async function turn('),source.indexOf('function renderParty(')),c);
 vm.runInContext(source.slice(source.indexOf('async function playBattleEvents('),source.indexOf("$('animationSpeed').onclick")),c);
 return {c,logs,music};
}
test('a successful escape ends the battle without a victory message or victory music',async()=>{
 const {c,logs,music}=environment();await c.turn(null,'run');
 assert.equal(c.finished,true);assert.equal(c.escapedBattle,true);
 assert.deepEqual(logs,['Sei fuggito senza problemi!']);assert.deepEqual(music,[]);assert.equal(c.busy,false);
});
test('a failed escape keeps the battle active, and a real victory keeps its result',async()=>{
 const {c,logs,music}=environment(false);await c.turn(null,'run');
 assert.equal(c.finished,false);assert.equal(c.escapedBattle,false);assert.deepEqual(logs,['Non sei riuscito a fuggire!']);
 await c.turn(0);assert.equal(c.finished,true);assert.equal(c.escapedBattle,false);
 assert.deepEqual(music,['victoryWild']);assert.ok(logs.includes('Hai vinto la lotta!'));
});

test('healing a reserve does not replace the active Pokemon HP panel',async()=>{
 const {c}=environment();c.partner={hp:20,max:26};
 await c.playBattleEvents(['|-heal|p1: Patrat|18/18|[from] item: Potion']);
 assert.equal(c.partner.hp,20);assert.equal(c.partner.max,26);
});
