/* Real native map/controller data; this harness does not render pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
async function setup(){const c=environment({finale:true,sourceRoot:path.resolve(__dirname,'../src')}),n=c.NativeStory.state,j=c.Journey;Object.assign(n,{intro:true,initialized:true,badges:[0,1,2,3,4,5,6,7],flags:[2480,2481,2482,2483,2484,2485,2486,2487,2488,2489,2491]});j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Unfezant',50,{moves:[19],gender:'F'}),c.OPENING_DATA.Unfezant.growth[50]),j.pack(c.makeMon('Servine',35),c.OPENING_DATA.Servine.growth[35])];j.state.party[0].pp[0].left=0;j.displayPartner();c.MistraltonFly.play=async()=>{};
 for(const zone of Object.values(c.ORIGINAL_EVENTS.zones))for(const trigger of [...(zone.triggers||[]),...(zone.onEnter||[])])n.vars[trigger.var]=100;
 return c;
}
test('Fly reaches the three late main-story cities at original coordinates and Icirrus height without consuming PP',async()=>{
 const c=await setup(),n=c.NativeStory.state;await drain(c,c.NativeStory.changeZone(96,187,414));
 for(const zone of [113,120,136]){const d=c.MISTRALTON_FLY_DATA.destinations.find(d=>d.zone===zone);assert.ok(d);assert.ok(await drain(c,c.NativeStory.useFly(0,zone)));assert.equal(n.zone,zone);assert.equal(c.NativeStory.locked,false);assert.equal(c.blocked(c.player.x,c.player.y),false,'Native Fly landing must be walkable '+zone);assert.equal(c.Journey.state.party[0].pp[0].left,0);assert.equal(c.Journey.state.party[0].gender,'F');if(zone===113)assert.ok(Math.abs(n.fieldHeight-3)<.001,'Native height selects the 3-tile surface; original triangles retain their sub-tile interpolation');
  assert.ok(c.Journey.save(true));const loaded=c.StoryState.read(c.localStorage);assert.equal(loaded.original.zone,zone);assert.equal(loaded.player.x,c.player.x,'Fly save preserves exact X');assert.equal(loaded.player.y,c.player.y,'Fly save preserves exact Z');assert.equal(loaded.facing,c.facing);assert.equal(loaded.original.fieldHeight,n.fieldHeight);assert.ok(loaded.original.flags.includes(d.flag));assert.equal(loaded.party[0].pp[0].left,0);
 }
 assert.ok(!n.flags.includes(2490),'No postgame destination is unlocked');
});
test('an actual late-city entry records its native visited flag even if the player never opens the map there',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.flags=n.flags.filter(f=>![2488,2489,2491].includes(f));n.badges=[];
 await drain(c,c.NativeStory.changeZone(136,19,49));assert.ok(n.flags.includes(2491));assert.ok(!n.flags.includes(2489));await drain(c,c.NativeStory.changeZone(389,15,13));assert.ok(c.MistraltonFly.destinations(c.Journey.state).some(d=>d.zone===136));assert.ok(!n.flags.includes(2490));
});
