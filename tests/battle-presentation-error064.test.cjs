'use strict';
const fs=require('node:fs'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const source=fs.readFileSync(require.resolve('../src/battle-ui.js'),'utf8');
function host(fail=true){
 const c=require('./helpers/finale-moves-host.cjs').setup(),calls={act:0,volatileSync:0,cancel:0,updates:[]},logs=[];
 c.session=new c.GEN5.Session([{name:'Snivy',level:10,moves:[33]}],[{name:'Lillipup',level:10,moves:[33]}],{seed:[1,2,3,4]});
 const act=c.session.act.bind(c.session);c.session.act=(...args)=>{calls.act++;return act(...args);};
 Object.assign(c,{busy:false,finished:false,storyBattle:'wild',trainer:false,labBattle:false,escapedBattle:false,visualState:{p1:{},p2:{}},window:c,
  Journey:{recordParticipant(){}},GameSpeed:{wait:async()=>{}},AudioEngine:{setScene(){}},NativeBattleText:{},captureVisualContext(){},log:text=>logs.push(text),
  playBattleEvents:async()=>{if(fail)throw Error('Injected audio resource failure after native turn');},showOpeningTrainerHint:async()=>{},
  MoveFX:{cancel(){calls.cancel++;}},$:()=>({hidden:false}),updateBattle(){calls.updates.push({busy:c.busy,partnerHP:c.partner.hp,enemyHP:c.enemy.hp});}});
 for(const name of['battleVisualMon','snapshotPartner','syncVisualVolatiles']){
  const line=source.split(/\r?\n/).find(s=>s.startsWith('function '+name+'('));assert(line);vm.runInContext(line,c,{filename:'battle-ui.js:'+name});
 }
 c.snapshotPartner();const sync=c.syncVisualVolatiles;c.syncVisualVolatiles=()=>{calls.volatileSync++;sync();};
 const line=source.split(/\r?\n/).find(s=>s.startsWith('async function turn('));assert(line);vm.runInContext(line,c,{filename:'battle-ui.js:turn'});
 return{c,calls,logs};
}
test('a presentation failure after the actual native turn cannot leave old HP/PP or an unfinished UI snapshot',async()=>{
 const {c,calls,logs}=host(),initial={hp:c.partner.hp,pp:c.partner.moves[0].left,turn:c.session.battle.turn};
 await c.turn(0);assert.equal(calls.act,1,'Recovering a presentation must not replay a native turn');
 assert.equal(c.session.battle.turn,initial.turn+1);assert.equal(c.partner.hp,c.session.snapshot().hp);assert.equal(c.enemy.hp,c.session.snapshot('p2').hp);
 assert.equal(c.partner.moves[0].left,initial.pp-1);assert.equal(c.partner.moves[0].left,c.session.active().moveSlots[0].pp);
 assert(c.partner.hp<initial.hp,'Real opponent should have inflicted damage');assert.equal(calls.volatileSync,1);
 assert.equal(c.busy,false);assert.equal(calls.cancel,1);assert.equal(calls.updates.at(-1).partnerHP,c.partner.hp);assert(logs.some(s=>s.includes('Injected audio')));
});
test('an invalid command before native resolution releases input without changing native HP/PP or replaying the command',async()=>{
 const {c,calls}=host(),before={hp:c.partner.hp,pp:c.partner.moves[0].left,turn:c.session.battle.turn};
 await c.turn(99);assert.equal(calls.act,1);assert.deepEqual({hp:c.partner.hp,pp:c.partner.moves[0].left,turn:c.session.battle.turn},before);assert.equal(c.busy,false);assert.equal(calls.cancel,1);
});
test('successful native presentation retains one turn and one PP consumption',async()=>{
 const {c,calls}=host(false),pp=c.partner.moves[0].left,turn=c.session.battle.turn;
 await c.turn(0);assert.equal(calls.act,1);assert.equal(c.session.battle.turn,turn+1);assert.equal(c.partner.moves[0].left,pp-1);assert.equal(c.partner.hp,c.session.snapshot().hp);assert.equal(c.busy,false);
});
