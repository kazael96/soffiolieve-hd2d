/* Native Center146 roles and scripts through the field interaction controller.
 * DOM/audio are mocked here; visual layout is covered by the headless suite. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {environment,drain}=require('./helpers/league-field-host.cjs');
async function setup(){const c=environment({league:true,sourceRoot:path.resolve(__dirname,'../src')}),n=c.NativeStory.state,j=c.Journey;await c.OpelucidChapter.ensure(146);n.intro=true;n.initialized=true;n.badges=[0,1,2,3,4,5,6,7];j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Serperior',43),c.OPENING_DATA.Serperior.growth[43])];await drain(c,c.NativeStory.changeZone(146,7,13));return c;}
function face(c,uid){const a=c.npcs.find(a=>a.uid===uid);assert.ok(a,'missing role'+uid);Object.assign(c.player,uid===2?{x:a.x,y:a.y+2}:{x:a.x-2,y:a.y});c.facing=uid===2?0:9;assert.equal(c.blocked(c.player.x,c.player.y),false,'service fixture must stand on a walkable counter approach');c.NativeStory.state.fieldHeight=a.height;return a;}
test('first League migration initializes native hidden roles once and preserves later cleared flags on reload',async()=>{
 const c=environment({league:true,sourceRoot:path.resolve(__dirname,'../src')}),n=c.NativeStory.state;for(const flag of [594,657,669,759,816])assert.ok(n.flags.includes(flag),'missing original initial flag'+flag);
 const a=await setup();assert.equal(a.npcs.some(p=>p.model===98),false,'Castle transport grunt appeared before the Castle event');
 a.NativeStory.state.flags=a.NativeStory.state.flags.filter(f=>![669,759].includes(f));assert.equal(a.Journey.save(true),true);const saved=a.StoryState.read(a.localStorage),next=environment({league:true,sourceRoot:path.resolve(__dirname,'../src'),save:saved});
 assert.equal(next.NativeStory.state.flags.includes(669),false);assert.equal(next.NativeStory.state.flags.includes(759),false);
});
test('League nurse accepts A, restores HP/status/PP, records blackout destination and supports declining',async()=>{
 const c=await setup(),n=c.NativeStory.state,j=c.Journey,p=j.state.party[0];p.hp=1;p.status='psn';for(const m of p.pp)m.left=0;face(c,2);c.testChoices=[1];await drain(c,c.NativeStory.interact());assert.equal(p.hp,1);assert.equal(p.status,'psn');assert.ok(p.pp.every(m=>m.left===0));
 c.testChoices=[0];await drain(c,c.NativeStory.interact());const healed=j.state.party[0];assert.equal(healed.hp,j.unpack(healed).max);assert.equal(healed.status,'');assert.ok(healed.pp.every(m=>m.left>0));assert.equal(n.healZone,146);assert.equal(c.NativeStory.locked,false);assert.equal(c.StoryState.read(c.localStorage).original.healZone,146);
});
test('League second clerk opens native stock9 and cancellation preserves the injured party and money',async()=>{
 const c=await setup(),j=c.Journey,n=c.NativeStory.state;j.state.money=12345;j.state.party[0].hp=1;const before=JSON.stringify(j.state.party);face(c,3);c.testChoices=[2];await drain(c,c.NativeStory.interact());assert.equal(j.state.money,12345);assert.equal(JSON.stringify(j.state.party),before);assert.equal(c.NativeStory.locked,false);
 assert.ok(c.LEAGUE_DATA.market.fixedStocks[9]!==undefined,'native second-clerk stock9 was not exported');assert.deepEqual(Array.from(c.MistraltonServices.stock(9)),Array.from(c.LEAGUE_DATA.market.stocks[c.LEAGUE_DATA.market.fixedStocks[9]]));
});
test('League ordinary clerk buys from badge stock and saves the exact native price once',async()=>{
 const c=await setup(),j=c.Journey,n=c.NativeStory.state,id=4,before=j.itemCount(id);j.state.money=10000;face(c,1);c.testChoices=[0,0,0,0,2];await drain(c,c.NativeStory.interact());assert.equal(j.itemCount(id),before+1);assert.equal(j.state.money,10000-c.LEAGUE_DATA.itemPrices[id]);assert.equal(c.NativeStory.locked,false);assert.equal(c.StoryState.read(c.localStorage).money,j.state.money);
});
test('the second native clerk sells the second-page Luxury Ball and a held copy survives a storage roundtrip',async()=>{
 const c=await setup(),j=c.Journey,before=j.itemCount(11);j.state.money=10000;face(c,3);c.testChoices=[0,6,1,0,0,2];await drain(c,c.NativeStory.interact());assert.equal(j.itemCount(11),before+1);assert.equal(j.state.money,10000-c.LEAGUE_DATA.itemPrices[11]);assert.equal(j.giveItem(11,0),true);const saved=c.StoryState.read(c.localStorage);assert.equal(saved.party[0].heldItem,11);assert.equal(saved.money,j.state.money);assert.equal(c.NativeStory.locked,false);
});
