/* Actual native controller; this fixture mocks only rendering and audio output. */
const path=require('node:path');
const {environment,drain}=require('./league-field-host.cjs');
function create(options={}){const c=environment({...options,finale:true,sourceRoot:path.resolve(__dirname,'../../src')});
 // Visual output only. The separate controller tests exercise its actual lifecycle;
 // this original-event replay does not certify the stone pixels.
 c.stoneEffects=[];c.FinaleStone={active:false,async play(position){this.active=true;c.stoneEffects.push({kind:'play',position:{...position}});},close(){if(this.active)c.stoneEffects.push({kind:'close'});this.active=false;},cancel(){if(this.active)c.stoneEffects.push({kind:'cancel'});this.active=false;}};c.closeups=[];c.FinaleCloseup={active:false,async open(...args){this.active=true;c.closeups.push({kind:'open',args});},async close(){this.active=false;c.closeups.push({kind:'close'});},restart(){if(!this.active)throw Error('Closeup absent');c.closeups.push({kind:'speech'});},message(){},cancel(){this.active=false;}};c.releaseEffects=[];c.FinaleBallRelease={active:false,async flight(...args){this.active=true;c.releaseEffects.push({kind:'flight',args});},activate(...args){c.releaseEffects.push({kind:'activate',args});},async waitReady(){c.releaseEffects.push({kind:'frame5'});},async waitDone(){c.releaseEffects.push({kind:'frame46'});},cancel(){this.active=false;}};return c;}
async function setup(){
 const c=create(),n=c.NativeStory.state;
 Object.assign(n,{intro:true,initialized:true,flags:[...c.FINALE_INITIAL_STATE.initialActorFlags],vars:{16553:1},badges:[0,1,2,3,4,5,6,7],actors:{},actorFlags:{},trainerWins:[]});
 c.Journey.state.starter='Snivy';c.Journey.state.phase='opelucid';
 c.Journey.state.party=[c.Journey.pack(c.makeMon('Serperior',50),c.OPENING_DATA.Serperior.growth[50])];c.Journey.displayPartner();
 await drain(c,c.NativeStory.changeZone(136,8,12));return c;
}
module.exports={create,setup,drain};
