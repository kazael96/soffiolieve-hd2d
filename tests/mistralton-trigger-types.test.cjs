const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const oldSite=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');
const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=oldSite;
for(const speed of [1,2,4])test('Cold Storage type6 cell never invokes bank382 entry1999 at×'+speed,async()=>{
 const c=environment({mistralton:true,sourceRoot:path.resolve(__dirname,'../src')}),n=c.NativeStory;await c.MistraltonChapter.ensure();
 Object.assign(n.state,{intro:true,initialized:true,pokedex:true,driftveil:true,badges:[0,1,2,3],healZone:99});Object.assign(n.state.vars,{16527:1,16528:1});
 c.Journey.state.phase='driftveil';c.Journey.state.starter='Snivy';c.Journey.state.party=[c.Journey.pack(c.makeMon('Servine',31),c.OPENING_DATA.Servine.growth[31])];c.Journey.displayPartner();
 await drain(c,n.changeZone(191,169,475));
 for(let i=0;i<90;i++){for(let k=0;k<speed;k++)c.Journey.step(1/30,false);await Promise.resolve();}
 assert.equal(c.$('world').dataset.eventError,undefined);
 assert.equal(n.locked,false);assert.equal(n.state.vars[16528],1);
});
