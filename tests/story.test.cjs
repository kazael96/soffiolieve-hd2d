const {test}=require('node:test'),assert=require('node:assert/strict');
const Story=require('../src/story-state.js');
test('all three choices preserve the original rival order and elemental matchups',()=>{
 for(const [starter,belle,komor] of [['Snivy','Oshawott','Tepig'],['Tepig','Snivy','Oshawott'],['Oshawott','Tepig','Snivy']]){
  const s=Story.fresh();assert.equal(Story.advance(s,'route'),false);assert.equal(Story.choose(s,starter),true);
  assert.equal(s.phase,'belle');assert.equal(Story.choose(s,'Tepig'),false);
  assert.equal(Story.rivalStarter(starter,'Belle'),belle);assert.equal(Story.rivalStarter(starter,'Komor'),komor);
  for(const phase of Story.phases.slice(1,-1)){assert.equal(s.phase,phase);assert.equal(Story.advance(s,phase),true);assert.equal(Story.advance(s,phase),false);}
  assert.equal(s.phase,'arrival');assert.equal(Story.advance(s,'route'),false);
 }
});
test('story saves are separate from the removed custom chapter',()=>{
 const values=new Map([['soffiolieve-journey-v1','{"version":1,"complete":true}']]);const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 assert.equal(Story.read(storage).phase,'gift');const s=Story.fresh();Story.choose(s,'Snivy');
 s.party=[{name:'Snivy',nickname:'',level:5,xp:135,hp:20,status:'',pp:[{id:33,left:35}]}];
 Story.register(s,'Snivy',true);
 assert.equal(Story.write(storage,s),true);assert.deepEqual(Story.read(storage),s);assert.ok(values.has('soffiolieve-journey-v1'));
});
test('corrupt saves, unknown scenes and impossible starter state cannot resume',()=>{
 assert.equal(Story.normalize({version:1,phase:'arrival',scene:'town',starter:'Snivy',party:[]}),null);
 assert.equal(Story.normalize({...Story.fresh(),scene:'missing'}),null);
 assert.equal(Story.read({getItem:()=>'{bad'}).phase,'gift');assert.equal(Story.read(null).phase,'gift');
 assert.equal(Story.write(null,Story.fresh()),false);
});
test('money persists, is bounded and older opening saves retain their progress',()=>{
 const s=Story.fresh();assert.equal(s.money,3000);s.money=3500;assert.equal(Story.normalize(s).money,3500);
 s.money=-10;assert.equal(Story.normalize(s).money,0);s.money=10000000;assert.equal(Story.normalize(s).money,9999999);
 delete s.money;assert.equal(Story.normalize(s).money,3000);assert.equal(Story.normalize(s).phase,'gift');
});

test('Pokedex keeps seen and caught distinct, deduplicates and upgrades older saves',()=>{
 const s=Story.fresh();assert.equal(Story.register(s,'Patrat'),false);assert.deepEqual(s.dex,{seen:['Patrat'],caught:[]});
 assert.equal(Story.register(s,'Patrat',true),true);assert.equal(Story.register(s,'Patrat',true),false);
 assert.equal(Story.register(s,'Missing',true),false);Story.register(s,'Lillipup');
 const restored=Story.normalize(s);assert.deepEqual(restored.dex,{seen:['Patrat','Lillipup'],caught:['Patrat']});
 s.party=[{name:'Snivy',level:5,hp:20,pp:[]}];s.starter='Snivy';s.phase='route';delete s.dex;
 assert.deepEqual(Story.normalize(s).dex,{seen:['Snivy','Oshawott','Tepig'],caught:['Snivy']});
 s.dex={seen:['Missing','Lillipup','Lillipup'],caught:['Patrat','Patrat']};
 assert.deepEqual(Story.normalize(s).dex,{seen:['Lillipup','Snivy','Patrat'],caught:['Patrat','Snivy']});
});
test('encounter metadata and personality survive saves while malformed history is discarded',()=>{
 const s=Story.fresh(),met={date:'2026-10-26T12:00:00.000Z',zone:391,level:5};s.party=[{name:'Snivy',level:5,hp:20,pp:[],personality:0xffffffff,met}];
 const restored=Story.normalize(s);assert.deepEqual(restored.party[0].met,met);assert.equal(restored.party[0].personality,0xffffffff);
 s.party[0].met.date='invalid';s.party[0].personality=-1;const invalid=Story.normalize(s);assert.equal('met' in invalid.party[0],false);assert.equal('personality' in invalid.party[0],false);
});
