'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const c=require('./helpers/finale-moves-host.cjs').setup();
const scenarios=[['status','Snivy',43,'Tepig',39],...[1,3,47,541].map(id=>['contact-'+id,'Liepard',10,'Minccino',id]),['snatch','Purrloin',289,'Snivy',74]];
function turn(spec,seed=[1,2,3,4]){const [name,p1,m1,p2,m2]=spec,team=(name,id)=>[{name,level:50,gender:'M',moves:[id]}],s=new c.GEN5.Session(team(p1,m1),team(p2,m2),{seed}),before=['p1','p2'].map(side=>s.active(side).hp);s.act('move 1');return{name,before,after:['p1','p2'].map(side=>({hp:s.active(side).hp,def:s.active(side).boosts.def,atk:s.active(side).boosts.atk,spa:s.active(side).boosts.spa})),log:[...s.battle.log]};}
test('all six fixed native seeds reproduce the real command expectations without substituting accuracy or damage',()=>{
 for(const spec of scenarios){const row=turn(spec);assert.deepEqual(turn(spec),row,'Native RNG replay must be deterministic');if(row.name==='status'){assert.deepEqual(row.after.map(m=>m.hp),row.before);assert.ok(row.after.every(m=>m.def===-1));}else if(row.name==='snatch'){assert.equal(row.after[0].atk,1);assert.equal(row.after[0].spa,1);assert.equal(row.after[1].atk,0);}else{assert.ok(row.after[1].hp<row.before[1]);if(row.name==='contact-47'){assert.equal(row.after[0].hp,row.before[0]);assert.ok(row.log.some(line=>line.startsWith('|-miss|p2a: Minccino')),'The native Sing miss is preserved');}else assert.ok(row.after[0].hp<row.before[0]);}}
});
test('the native simulator can genuinely miss Tail Slap; a seeded QA hit must not be an overridden result',()=>{
 const spec=scenarios.find(row=>row[0]==='contact-541');let missed=null;for(let n=2;n<=64&&!missed;n++){const row=turn(spec,[n,2,3,4]);if(row.log.some(line=>line.startsWith('|-miss|p2a: Minccino')))missed=row;}
 assert.ok(missed,'A real native accuracy failure must remain possible');assert.equal(missed.after[0].hp,missed.before[0]);assert.ok(turn(spec).after[0].hp<missed.before[0]);
});
