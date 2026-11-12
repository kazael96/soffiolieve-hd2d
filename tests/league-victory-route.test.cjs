/* Metadata traces + actual slide/portal controllers; walking samples are applied
 * after collision checks. This is not a renderer or keyboard traversal. */
const test=require('node:test'),assert=require('node:assert/strict');
const {trace}=require('../tools/trace-victory-rail.cjs');
const {setup,drain}=require('./helpers/league-field-host.cjs');
for(const [entry,exit,destination]of [[14,15,215],[16,6,220],[13,3,223],[5,9,227],[18,10,136]])test('Victory Road continuous trace '+entry+' → '+exit+' runs native slide and portal controllers',async()=>{
 const route=trace(entry,exit),c=await setup(),n=c.NativeStory.state;
 c.Journey.state.party=[c.Journey.pack(c.makeMon('Snivy',5),c.OPENING_DATA.Snivy.growth[5])];
 n.flags=[758];n.vars[16591]=1;
 const first=route.actions[0].points[0];
 await drain(c,c.NativeStory.changeZone(214,first[0]+15.5,first[1]+15.5,first[2]));
 n.railCurrent={zone:214,line:first[3],height:first[2]};
 for(let i=0;i<30;i++)c.Journey.step(1/30,false);
 for(const action of route.actions){
  if(action.kind==='walk')for(const [x,y,height,line]of action.points){
   assert.ok(Math.hypot(x-c.player.x,y-c.player.y)<.126,'walking trace is discontinuous');
   for(const [dx,dy]of [[-.18,-.18],[.18,.18]])assert.equal(c.blocked(x+dx,y+dy),false,'actual collision rejects rail step');
   Object.assign(c.player,{x,y});n.fieldHeight=height;n.railCurrent={zone:214,line,height};
  }
  else if(action.kind==='slide'){
   assert.equal(c.LeaguePlayerSlideMotion.tryStep(0,1),true,'actual player slide rejected the traced edge');
   await c.LeaguePlayerSlideMotion.pending;
   assert.equal(c.LeaguePlayerSlide.validate(n.playerSlide),true);
   let ticks=0;while(n.playerSlide&&ticks++<300)c.Journey.step(1/30,false);
   assert.ok(ticks<300,'slide did not finish');
   const end=c.LeaguePlayerSlide.finish(action.record);
   assert.ok(Math.hypot(c.player.x-end.x,c.player.y-end.y,n.fieldHeight-end.height)<1e-7,'slide differs from planned landing');
   assert.equal(c.Journey.save(true),true);
  }
  else if(action.kind==='portal'){
   const [dx,dy]=action.move,result=c.NativeStory.tryWarp(dx,dy,c.player.x+dx,c.player.y+dy);
   assert.ok(result,'portal rejected traced approach');await drain(c,result);
   assert.equal(n.zone,destination);assert.equal(c.$('world').dataset.eventError,undefined);
  }
 }
});
