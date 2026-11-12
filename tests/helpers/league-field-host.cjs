/* Actual field host and native data; renderer/audio output are explicitly mocked. */
const path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../../_site');const {environment,drain}=require('../check-story-runtime.cjs');process.argv[2]=old;
async function setup(){
 const c=environment({league:true,sourceRoot:path.resolve(__dirname,'../../src')}),n=c.NativeStory.state;
 Object.assign(n,{intro:true,initialized:true,flags:[],vars:{16553:1},badges:[0,1,2,3,4,5,6],actors:{},actorFlags:{},trainerWins:Object.keys(c.LEAGUE_DATA.trainers).map(Number)});
 c.Journey.state.starter='Snivy';c.Journey.state.phase='opelucid';
 await drain(c,c.NativeStory.changeZone(121,27,49));return c;
}
module.exports={setup,environment,drain};
