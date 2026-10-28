const {test}=require('node:test'),assert=require('node:assert/strict'),Story=require('../src/story-state.js');
test('older arrival saves resume the expanded chapter, city coordinates and shop quantities persist',()=>{
 const s=Story.fresh();s.starter='Snivy';s.phase='arrival';s.scene='town';s.party=[{name:'Snivy',level:7,hp:15,pp:[]}];s.player={x:2.5,y:-93.5};s.pokeballs=18;s.potions=25;s.original={zone:397,arrived:true,vars:{16506:3,16507:3},flags:[522,523]};
 const p=Story.normalize(s);assert.equal(p.phase,'arrival');assert.deepEqual(p.player,s.player);assert.equal(p.pokeballs,18);assert.equal(p.potions,25);assert.equal(p.original.zone,397);
 for(const scene of Story.scenes.filter(s=>s.startsWith('zone'))){s.scene=scene;assert.equal(Story.normalize(s).scene,scene);}
});
test('N remains seen and never becomes caught just through a trainer battle',()=>{
 const s=Story.fresh();assert.equal(Story.register(s,'Purrloin'),false);assert.deepEqual(s.dex.seen,['Purrloin']);assert.deepEqual(s.dex.caught,[]);
});
test('Purrloin has distinct grounded Scratch and Growl profiles on both sides and miss paths',()=>{
 const p=require('../src/purrloin-moves.js');for(const id of [10,45])for(const side of ['p1','p2'])for(const miss of [false,true]){
  const profile=p.profiles[id];for(const f of [0,profile.impact,profile.frames]){const pose=p.sample(profile,f,side,miss);for(const k of ['crouch','lean','reach','lift'])assert.ok(Number.isFinite(pose[k]));assert.equal(pose.species,509);if(f===profile.frames)assert.equal(pose.reach,0);}
 }assert.ok(p.sample(p.profiles[10],43).reach>0);assert.equal(p.sample(p.profiles[45],48).reach,0);assert.ok(p.sample(p.profiles[45],48).voice>0);
});
