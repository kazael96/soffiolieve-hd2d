/* Native map/controller integration; browser rendering is a separate proof. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
async function setup(){const c=environment({icirrus:true,sourceRoot:path.resolve(__dirname,'../src')});await c.IcirrusChapter.ensure();const n=c.NativeStory.state,j=c.Journey;Object.assign(n,{intro:true,initialized:true,badges:[0,1,2,3,4,5],flags:[575,576,579,658,676,678,780]});n.vars[16535]=2;j.state.starter='Snivy';j.state.phase='icirrus';j.state.party=['Servine','Dewott'].map(name=>j.pack(c.makeMon(name,35),c.OPENING_DATA[name].growth[35]));j.state.party[1].pp[0]={id:57,left:0};j.displayPartner();return c;}
function shore(c,z=113){for(const g of c.ICIRRUS_SCENES[z].permissionGrids)for(let y=0;y<32;y++)for(let x=0;x<32;x++){
 const px=g.x+x-15.5,py=g.z+y-15.5,land=c.IcirrusChapter.surfaceAt(z,px,py,0);if(!land||(land.flags&3))continue;
 for(const[dir,[dx,dy]]of [[0,[0,-1]],[1,[0,1]],[2,[-1,0]],[3,[1,0]]]){const front=c.IcirrusChapter.surfaceAt(z,px+dx,py+dy,land.height),cells=[65,68].includes(front?.behavior)?2:1,at=c.IcirrusChapter.surfaceAt(z,px+dx*cells,py+dy*cells,land.height);if(at&&(at.flags&3)===2)return {x:px,y:py,height:land.height,dir,cells,water:{x:px+dx*cells,y:py+dy*cells,height:at.height}};}
}throw Error('No real native shore '+z);}
test('real Icirrus shore supports A, native dialogue, water movement, landing and save',async()=>{
 const c=await setup(),p=shore(c);await drain(c,c.NativeStory.changeZone(113,p.x+783.5,p.y+751.5,p.height));c.facing=p.dir*3;
 assert.equal(c.blocked(p.water.x,p.water.y,{surf:true}),true,'Walking cannot enter water');assert.equal(c.SurfField.canStart(1),true);
 let checkpoint=false;const step=c.Journey.step;c.Journey.step=(...args)=>{step(...args);if(c.NativeStory.state.surfMotion?.travel>.3){assert.equal(c.NativeStory.locked,true);checkpoint=c.Journey.save(true);}};
 await drain(c,c.NativeStory.interact(),0,'p1',()=>!c.NativeStory.locked);assert.equal(checkpoint,true,'Natural autosave is allowed during the owned Surf transition');c.Journey.step=step;assert.equal(c.SurfField.mounted(),true);assert.ok(Math.hypot(c.player.x-p.water.x,c.player.y-p.water.y)<.01);assert.equal(c.NativeStory.music,1013);assert.equal(c.Journey.state.party[1].pp[0].left,0);
 assert.equal(c.blocked(c.player.x,c.player.y,{surf:true}),false);assert.equal(c.blocked(p.x,p.y),false,'NPC footpaths on land stay walkable while the player uses Surf');assert.equal(c.Journey.save(true),true);const saved=c.StoryState.read(c.localStorage);assert.equal(saved.original.surf,true);assert.equal(saved.original.fieldHeight,p.water.height);
 const[dx,dy]=[[0,-1],[0,1],[-1,0],[1,0]][p.dir];assert.equal(c.SurfField.tryStep(-dx,-dy),true);for(let i=0;i<100&&c.SurfField.busy;i++)c.Journey.step(1/60,false);assert.equal(c.SurfField.mounted(),false);assert.ok(Math.hypot(c.player.x-p.x,c.player.y-p.y)<.01);assert.notEqual(c.NativeStory.music,1013);
});
test('Surf native tables do not fall back to land encounters on water without encounters',async()=>{
 const c=await setup();await c.SurfField.prepareAssets();c.NativeStory.state.surf=true;c.NativeStory.state.zone=191;assert.equal(c.SurfField.encounters().rate,0);assert.equal(c.SurfField.encounters().slots.length,0);
 c.renderer.scene=c.OPENING_ASSETS.scenes.zone191;const g=c.renderer.scene.permissionGrids.find(g=>g.bytes.some((v,i)=>i>=10&&(i-10)%8===0&&(v&3)===2));assert.ok(g);const at=g.bytes.findIndex((v,i)=>i>=10&&(i-10)%8===0&&(v&3)===2),cell=(at-10)/8;c.player={x:g.x+cell%32-15.5,y:g.z+Math.floor(cell/32)-15.5};c.Math=Object.create(Math);c.Math.random=()=>0;c.cooldown=0;c.lastBattle=null;c.Journey.encounter(1,true,50);assert.equal(c.lastBattle,null,'Even a zero random roll cannot create a rate0 water encounter');
 c.NativeStory.state.zone=113;const table=c.SurfField.encounters();assert.equal(table.rate,3);assert.ok(table.slots.every(s=>s.name==='Stunfisk'&&s.min===15&&s.max===35));
});
test('old saves stay compatible and malformed shoreline tasks do not invalidate the party',async()=>{
 const c=await setup();c.NativeStory.state.surfMotion={zone:999,from:{x:NaN},phase:'move'};c.Journey.save(true);const loaded=c.StoryState.read(c.localStorage);assert.equal(loaded.party.length,2);assert.equal(loaded.original.surfMotion,undefined);
});
module.exports={setup,shore};

test('all original Surf directions put the visible feet on the native support surface',async()=>{
 const c=await setup();await c.SurfField.prepareAssets();c.NativeStory.state.surf=true;c.NativeStory.state.fieldHeight=-1.5;
 for(const [direction,padding]of [[0,.1875],[1,.25],[2,.25],[3,.25]]){const pose=c.SurfField.actor(direction*3);assert.ok(Math.abs(pose.height+padding-(-1.5+.08792))<1e-6,'Original sprite/model contact '+direction);}
});
