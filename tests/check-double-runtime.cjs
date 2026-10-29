const assert=require('node:assert/strict'),{environment}=require('./check-story-runtime.cjs');
const c=environment(),G=c.GEN5;
function battle(multi=false){return new G.Session([{name:'Snivy',level:15,moves:[33,43]},{name:'Tepig',level:15,moves:[33]},{name:'Oshawott',level:15,moves:[55]},{name:'Patrat',level:15,moves:[33]}],[{name:'Purrloin',level:12,moves:[10]},{name:'Patrat',level:12,moves:[33]}],{doubles:true,seed:[1,2,3,4],...(multi?{ally:[{name:'Tepig',level:14,moves:[33]},{name:'Purrloin',level:12,moves:[10]}],secondFoe:[{name:'Patrat',level:12,moves:[33]}]}:{})});}
for(const multi of [false,true]){const s=battle(multi);assert.equal(s.battle.sides.length,multi?4:2);if(multi){assert.equal(s.battle.p3.active[0].getSlot(),'p3b');assert.equal(s.battle.p4.active[0].getSlot(),'p4b');}assert.equal(s.active('p1',1).species.name,'Tepig');
 for(let i=0;i<60&&!s.battle.ended;i++){
  const r=s.battle.p1.activeRequest;let choice;
  if(r?.forceSwitch){const used=new Set();choice=r.forceSwitch.map(f=>{const n=s.battle.p1.pokemon.findIndex((p,i)=>!p.isActive&&!p.fainted&&!used.has(i));if(!f||n<0)return 'pass';used.add(n);return 'switch '+(n+1);}).join(', ');}
  else choice=s.battle.p1.active.map((p,i)=>p?.hp?'move 1 '+s.targetChoices('p1',i,s.battle.dex.moves.get(p.moveSlots[0].id)).find(t=>t.loc>0).loc:'pass').join(', ');
  s.act(choice);
 }assert.ok(s.battle.ended);assert.equal(s.battle.winner,'Alcide');assert.equal(s.battle.p1.pokemon.length,4,'Ally never appended to player team');console.log('PASS actual Gen V',multi?'four-trainer partner':'two-on-two','resolution and team ownership');}
{
 const s=battle();assert.equal(s.targetChoices('p1',0,G.dex.moves.get('tackle')).length,3);assert.equal(s.targetChoices('p1',0,G.dex.moves.get('helpinghand'))[0].loc,-2);assert.equal(s.targetChoices('p1',0,G.dex.moves.get('growl')).length,0);
 for(let i=0;i<100;i++)assert.ok(+s.aiChoice('p2',i%2).split(' ')[2]>0,'AI damaging moves must not hit its own partner');
 s.active('p1').sethp(1);let used=[];s.onItemUsed=id=>used.push(id);const pp=s.active('p1',1).moveSlots[0].pp;s.act('item 17 1, move 1 1');assert.deepEqual(used,[17]);assert.equal(s.active('p1',1).moveSlots[0].pp,pp-1);assert.ok(s.battle.log.some(l=>l.includes('[from] item: Pozione')));assert.equal(s.battle.turn,2);console.log('PASS selectable ally/foe targets, spread moves, safe AI and item plus second command');
}
{
 const s=battle(true);s.battle.win('p3');assert.equal(s.battle.winner,'Alcide');const t=battle(true);t.battle.win('p4');assert.notEqual(t.battle.winner,'Alcide');console.log('PASS either partner winner maps to the correct narrative outcome');
}
{
 const s=battle();s.selectionSlot=1;s.focus.p1=1;assert.equal(s.snapshot().name,'Tepig');assert.equal(s.request().active.length,1);assert.equal(s.request().active[0].moves[0].id,'tackle');s.selectionSlot=0;s.focus.p1=0;s.act('switch 3, switch 4');assert.equal(s.battle.p1.active[0].species.name,'Oshawott');assert.equal(s.battle.p1.active[1].species.name,'Patrat');console.log('PASS independent selection, requests and two simultaneous switches');
}
{
 const fs=require('node:fs'),vm=require('node:vm');c.session=battle(true);c.turn=async()=>{};c.snapshotPartner=()=>{};c.combatant=()=>{};c.visualState={p1:{},p2:{}};c.visualBattleContext={};c.busy=false;c.finished=false;c.GameSpeed={now:()=>0};c.MoveFX={pose:()=>({}),speciesPose:()=>null,idleTick:()=>0};c.BattleGround={layout:(w,h)=>Object.fromEntries(['p1','p2'].map(s=>[s,{x:w*.3,y:h*.8,height:120,w,h}])),effect:()=>({})};const stances=new Map();c.PatratMoves={stanceSpecies:s=>stances.get(s)||0,setStance:(s,on,id)=>on?stances.set(s,id):stances.delete(s)};
 vm.runInContext(fs.readFileSync('src/battle-events.js','utf8'),c);vm.runInContext(fs.readFileSync('src/double-battles.js','utf8'),c);c.snapshotPartner();
 const ally=c.BATTLE_EVENTS.events(['|move|p3b: Tepig|Tackle|p4b: Patrat']);c.DoubleBattles.normalizeEvents(ally);c.DoubleBattles.focusEvent(ally[0]);assert.match(ally[0].actor,/^p1b:/);assert.equal(ally[0].side,'p1');assert.equal(c.partner.name,'Tepig');assert.equal(c.enemy.name,'Patrat');
 const foe=c.BATTLE_EVENTS.events(['|move|p4b: Patrat|Tackle|p1a: Snivy']);c.DoubleBattles.normalizeEvents(foe);c.DoubleBattles.focusEvent(foe[0]);assert.match(foe[0].actor,/^p2b:/);assert.equal(foe[0].side,'p2');assert.equal(c.partner.name,'Snivy');for(const side of ['p1','p2'])for(const p of c.DoubleBattles.slots(390,500)[side])assert.ok(p.x>0&&p.x<390&&p.y>0&&p.y<500);c.session.queued=['switch 3'];c.session.selectionSlot=1;assert.equal(c.DoubleBattles.isReserved(3),true);assert.equal(c.DoubleBattles.isReserved(4),false);console.log('PASS native p3b/p4b presentation, target identity, reserved switches and four mobile placements');
}
