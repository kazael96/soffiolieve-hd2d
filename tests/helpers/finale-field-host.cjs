/* Actual native controller; this fixture mocks only rendering and audio output. */
const path=require('node:path');
const {environment,drain}=require('./league-field-host.cjs');
function create(options={}){return environment({...options,finale:true,sourceRoot:path.resolve(__dirname,'../../src')});}
async function setup(){
 const c=create(),n=c.NativeStory.state;
 Object.assign(n,{intro:true,initialized:true,flags:[...c.FINALE_INITIAL_STATE.initialActorFlags],vars:{16553:1},badges:[0,1,2,3,4,5,6,7],actors:{},actorFlags:{},trainerWins:[]});
 c.Journey.state.starter='Snivy';c.Journey.state.phase='opelucid';
 c.Journey.state.party=[c.Journey.pack(c.makeMon('Serperior',50),c.OPENING_DATA.Serperior.growth[50])];c.Journey.displayPartner();
 await drain(c,c.NativeStory.changeZone(136,8,12));return c;
}
module.exports={create,setup,drain};
