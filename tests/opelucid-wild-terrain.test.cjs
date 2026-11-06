const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment}=require('./check-story-runtime.cjs');process.argv[2]=old;
test('the actual Journey encounter controller reaches native grass, sand, cave and marsh slots and honors the disabled winter table',async()=>{
 const c=environment({opelucid:true,sourceRoot:path.resolve(__dirname,'../src')});const n=c.NativeStory.state;n.fieldSeason=0;n.repelRemaining=0;c.Journey.state.phase='icirrus';c.Journey.state.starter='Snivy';c.Journey.state.party=[c.Journey.pack(c.makeMon('Serperior',39),c.OPENING_DATA.Serperior.growth[39])];c.Journey.displayPartner();c.Math=Object.create(Math);c.Math.random=()=>0;
 for(const [zone,behavior]of [[205,5],[207,22],[157,12],[161,35],[345,28]]){
  await c.OpelucidChapter.ensure(zone);n.zone=zone;c.renderer.scene=c.OpelucidChapter.scene(zone);let position;
  for(const g of c.renderer.scene.permissionGrids)for(let z=0;z<32;z++)for(let x=0;x<32;x++){const at=8+(z*32+x)*8;if(g.bytes[at]===behavior&&(g.bytes[at+2]&4))position={x:g.x+x-15.5,y:g.z+z-15.5};}
  assert.ok(position,'Native terrain fixture missing '+zone+'/'+behavior);Object.assign(c.player,position);c.lastBattle=null;c.Journey.encounter(1/30,true,1);assert.equal(c.lastBattle?.config.story,'wild','No native wild battle '+zone+'/'+behavior);assert.ok(c.IcirrusEncounters.table(zone).slots.some(s=>s.name===c.lastBattle.config.p2[0].name));
 }
 c.lastBattle=null;n.fieldSeason=3;c.Math.random=()=>{throw Error('Winter land encounter must not roll');};c.Journey.encounter(1/30,true,20);assert.equal(c.lastBattle,null);
});
