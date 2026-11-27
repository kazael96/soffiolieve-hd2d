'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const source=fs.readFileSync(require.resolve('../src/game.js'),'utf8'),start=source.indexOf('function syncBattleActorFraming(){'),end=source.indexOf('\nfunction drawArena(){',start);
assert(start>=0&&end>start);const helper=source.slice(start,end);
function host(){const c=require('./helpers/finale-moves-host.cjs').setup(),calls=[];c.session=new c.GEN5.Session([{name:'Emboar',level:50,moves:[205,360]}],[{name:'Emboar',level:50,moves:[205,360]}],{seed:[1,2,3,4]});c.partner=c.session.snapshot();c.enemy=c.session.snapshot('p2');c.visualState={p1:{},p2:{}};c.BattleGround={setActorFraming(input){calls.push(input);return{recorded:true};}};vm.runInContext(helper,c,{filename:'game.js:syncBattleActorFraming'});return{c,calls};}
test('the actual arena framing hook binds native session/slots/graphics/banks instead of fixture species labels',()=>{
 const {c,calls}=host();assert.equal(c.syncBattleActorFraming().recorded,true);const call=calls[0];assert.equal(call.owner,c.session);
 for(const side of['p1','p2']){const a=call.actors[side];assert.equal(a.nativeMon,c.session.battle[side].active[0]);assert.equal(a.slot,side+'a');assert.equal(a.graphic,500);assert.equal(a.bank,c.ROM_SPRITE_ANIM.cache['500-'+(side==='p1'?'back':'front')]);assert.equal(a.back,side==='p1');assert.equal(a.visible,true);assert.equal(a.substitute,false);}
});
test('the framing hook observes each current replay state and in-place bank preparation',()=>{
 const {c,calls}=host(),bank=c.ROM_SPRITE_ANIM.cache['500-front'];bank.ready=false;c.syncBattleActorFraming();assert.equal(calls[0].actors.p2.bank.ready,false);
 bank.ready=true;c.visualState.p2.substitute=true;c.visualState.p1.hidden=true;c.syncBattleActorFraming();assert.equal(calls[1].actors.p2.bank,bank);assert.equal(calls[1].actors.p2.bank.ready,true);assert.equal(calls[1].actors.p2.substitute,true);assert.equal(calls[1].actors.p1.hidden,true);assert.equal(calls[1].actors.p1.visible,false);
});
test('the actual draw registers framing before the immutable presentation candidate is sampled',()=>{
 const arena=source.slice(source.indexOf('function drawArena(){'),source.indexOf('\nfunction frame(now){'));assert(arena.indexOf('syncBattleActorFraming()')<arena.indexOf('beginArenaFrame()'));
 const {c,calls}=host();c.session=null;assert.equal(c.syncBattleActorFraming(),undefined);assert.equal(calls.length,0);
});
