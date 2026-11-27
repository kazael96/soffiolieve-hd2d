const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {setup}=require('./helpers/finale-moves-host.cjs');
test('status presentation keeps Tail Whip distracted and Odor Sleuth alert for evolved species',()=>{
 const c=setup();for(const [species,move,kind]of [[499,39,'distracted'],[507,316,'alert'],[504,43,'intimidated'],[505,86,'alert'],[495,148,'distracted']])for(const side of ['p1','p2']){
  const p=c.SpeciesMoves.select(species,move);assert.ok(p);const a=c.BattleReactions.sample(p,p.impact+12,side,506);assert.ok(a);assert.equal(a.kind,kind,`${species}/${move}`);assert.equal(a.recoil,0);assert.equal(a.rotation,0);assert.equal(Math.abs(c.BattleReactions.pose(a,{[side]:{height:180,w:1000,h:650}},side).x),0);
 }
});
test('every offered nondamaging move avoids physical defender displacement, field and self moves have no victim',()=>{
 const c=setup();let tested=0,field=0;for(const [name,ids]of Object.entries(c.TrainingMoves.pairs))for(const id of ids){const native=c.GEN5.moves.find(m=>m.id===id);if(native.category!==0)continue;const p=c.SpeciesMoves.select(c.TRAINING_DATA.progression[name].id,id);for(const side of ['p1','p2'])for(const defender of [495,623]){
  const a=c.BattleReactions.sample(p,p.impact+12,side,defender);if([7,10,11,12].includes(native.target)||p.target==='self'){assert.equal(a,null,`${name}/${id} target ${native.target}`);field++;}else if(a){assert.equal(a.recoil,0,`${name}/${id}`);assert.equal(a.rotation,0,`${name}/${id}`);tested++;}
  assert.equal(c.BattleReactions.sample(p,p.impact+12,side,defender,true),null);
 }}assert.ok(tested>1000);assert.ok(field>1000);
});
test('actual MoveFX dispatcher preserves status gestures without introducing hit recoil',async()=>{
 const c=setup();Object.assign(c,{console,performance,setTimeout,clearTimeout,Image:class{},arena:{width:1000,height:650},BattleGround:{layout:()=>({p1:{x:250,y:500,height:180,w:1000,h:650},p2:{x:700,y:300,height:150,w:1000,h:650}})},ROM_MOVE_FX:{moves:Object.fromEntries([39,86,148,446].map(id=>[id,{id,variants:[{commands:[]}]}])),spas:{}}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/move-fx.js'),'utf8'),c);
 for(const [id,attacker]of [[39,499],[86,505],[148,495],[446,524]])for(const side of ['p1','p2']){
  const target=side==='p1'?'p2':'p1',cryIds={[side]:attacker,[target]:506};await c.MoveFX.preview(id,side,0,{cryIds});c.MoveFX.setPreviewFrame(c.MoveFX.active.profile.impact+12);const a=c.MoveFX.speciesPose(target,506),pose=c.MoveFX.pose(target);assert.equal(Math.abs(pose.x),0);if(id===446)assert.equal(a,null);else{assert.ok(a);assert.equal(a.recoil,0);assert.ok(['alert','distracted'].includes(a.kind));}await c.MoveFX.preview(id,side,0,{cryIds,miss:true});c.MoveFX.setPreviewFrame(c.MoveFX.active.profile.impact+12);assert.equal(c.MoveFX.speciesPose(target,506),null);
 }c.MoveFX.cancel();
});
