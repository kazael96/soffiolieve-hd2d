/* Native map/controller integration; browser rendering is a separate proof. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
async function setup({finale=false}={}){const c=environment({icirrus:true,finale,sourceRoot:path.resolve(__dirname,'../src')});await c.IcirrusChapter.ensure();const n=c.NativeStory.state,j=c.Journey;Object.assign(n,{intro:true,initialized:true,badges:[0,1,2,3,4,5],flags:[575,576,579,658,676,678,780]});n.vars[16535]=2;j.state.starter='Snivy';j.state.phase='icirrus';j.state.party=['Servine','Dewott'].map(name=>j.pack(c.makeMon(name,35),c.OPENING_DATA[name].growth[35]));j.state.party[1].pp[0]={id:57,left:0};j.displayPartner();return c;}
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

test('party swaps keep the actual selected Surf Pokémon and its sex/form across save loading',async()=>{
 const c=await setup(),n=c.NativeStory.state,selected=c.Journey.state.party[1];n.surf=true;n.surfUserIndex=1;
 assert.equal(c.Journey.moveParty(0,1),true);assert.equal(n.surfUserIndex,0);assert.equal(c.Journey.state.party[n.surfUserIndex],selected);
 assert.ok(c.Journey.save(true));const loaded=c.StoryState.read(c.localStorage);assert.equal(loaded.original.surfUserIndex,0);assert.equal(loaded.party[0].name,'Dewott');
 assert.equal(c.Journey.moveParty(0,1),true);assert.equal(n.surfUserIndex,1);assert.equal(c.Journey.state.party[n.surfUserIndex],selected);
});

test('later chapter ownership of Icirrus fields cannot bypass swimming collision permissions',async()=>{
 const c=await setup({finale:true}),p=shore(c);await drain(c,c.NativeStory.changeZone(113,p.x+783.5,p.y+751.5,p.height));c.facing=p.dir*3;
 assert.equal(c.renderer.scene.chapter051,true,'Exercise the later shared-map owner');
 assert.equal(c.blocked(p.water.x,p.water.y,{surf:true}),true,'Walking must not bypass the native water flag');
 c.NativeStory.state.surf=true;c.NativeStory.state.surfUserIndex=1;Object.assign(c.player,p.water);c.NativeStory.state.fieldHeight=p.water.height;
 assert.equal(c.blocked(p.water.x,p.water.y,{surf:true}),false,'The native water tile supports swimming');
 assert.equal(c.blocked(p.x,p.y,{surf:true}),true,'Only a shore transition can dismount onto land');assert.equal(c.blocked(p.x,p.y),false,'NPC land paths remain unchanged');
});

test('all currently teachable native HM species/forms have a world profile, including female and blue-striped graphics',async()=>{
 const c=await setup({finale:true}),fs=require('node:fs'),vm=require('node:vm');for(const file of ['field-hm-cut-choreographies.js','field-hm-fly-choreographies.js','field-hm-surf-choreographies.js','field-hm-cut-anatomy.js','field-hm-fly-anatomy.js','field-hm-surf-anatomy.js','field-hm-choreography.js','field-hm-profiles.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),c);
 const expected=new Set();for(const [name,items]of Object.entries(c.TRAINING_DATA.compatibility))for(const [item,move]of [[420,15],[421,19],[422,57]])if(items.includes(item)){
  const id=c.TRAINING_DATA.progression[name]?.id;assert.ok(id,'Native species '+name);const mon={id,name};if(name==='Basculin-Blue-Striped')mon.id=699;
  const profile=c.FieldHMProfiles.profile(mon,move);assert.ok(profile,'Missing '+name+':'+move);expected.add(profile.graphic+':'+move);
  if([521,592,593].includes(id)){const female=c.FieldHMProfiles.profile({...mon,gender:'F'},move);assert.ok(female,'Missing female '+name+':'+move);expected.add(female.graphic+':'+move);}
 }
 assert.equal(expected.size,105);assert.deepEqual([...c.FieldHMProfiles.profiles.keys()].sort(),[...expected].sort());
});
module.exports={setup,shore};

test('all original Surf directions put the visible feet on the native support surface',async()=>{
 const c=await setup();await c.SurfField.prepareAssets();c.NativeStory.state.surf=true;c.NativeStory.state.fieldHeight=-1.5;
 for(const [direction,padding]of [[0,.1875],[1,.25],[2,.25],[3,.25]]){const pose=c.SurfField.actor(direction*3);assert.ok(Math.abs(pose.height+padding-(-1.5+.08792))<1e-6,'Original sprite/model contact '+direction);}
});

test('Fly rider preparation loads only the native sprite catalog, deferring Surf geometry',async()=>{
 const c=await setup();let chapterLoads=0,modelLoads=0;const ensure=c.IcirrusChapter.ensure,load=c.StarterScene.loadGLB;c.IcirrusChapter.ensure=async(...args)=>{chapterLoads++;return ensure(...args);};c.StarterScene.loadGLB=async(...args)=>{modelLoads++;return load(...args);};
 await c.SurfField.prepareRiderAssets();assert.ok(c.SURF_FIELD_ASSETS.sprites.AlcideSurf.length>=12);assert.equal(chapterLoads,0);assert.equal(modelLoads,0);await c.SurfField.prepareAssets();assert.equal(chapterLoads,1);assert.equal(modelLoads,2);await c.SurfField.prepareAssets();assert.equal(modelLoads,2,'Warm rider preparation must not reload the water models');
});

test('busy Surf checkpoint repairs a released swimmer bank before acknowledging further motion',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),selected={name:'Dewott',gender:'M',pp:[{id:57,left:0}]},party=[{name:'Servine'},selected];
 const plan={zone:113,direction:3,cells:1,landing:false,phase:'move',wait:16,travel:.3,from:{x:1.5,y:2.5,height:2},to:{x:2.5,y:2.5,height:2.25}};
 const native={zone:113,surf:true,surfUserIndex:1,fieldHeight:2.075,surfMotion:structuredClone(plan)},hero={x:1.8,y:2.5};
 let ready=true,drawn=false,releaseAssets,gateCalls=0,prepareCalls=0,cutIns=0,starts=0,saves=0;
 const assets=new Promise(resolve=>{releaseAssets=resolve;}),preparations=[],savePositions=[];
 const world={active:null,swimmer:()=>party[native.surfUserIndex],surfReady:()=>ready,
  present(){if(!native.surf){ready=false;drawn=false;}},
  surfBudget:(motion,dt)=>({dt:ready&&drawn?dt:0,complete:ready&&drawn}),
  prepare:async(mon,move)=>{prepareCalls++;preparations.push([mon,move]);await assets;ready=true;},
  acknowledgeDraw(){assert.equal(ready,true);drawn=true;}};
 const c={console,TextDecoder,player:hero,facing:9,FieldHMWorld:world,
  Journey:{state:{party,original:native,playerGender:'F',playerName:'Anita'},save(){saves++;savePositions.push({...hero,height:native.fieldHeight});return true;}},
  NativeStory:{state:native,music:1013,occupied:()=>false,visualActors:()=>[]},AudioEngine:{setScene(){}},
  OPENING_ASSETS:{models:{},textures:{}},OPENING_SPRITES:{},SURF_FIELD_ASSETS:{models:{},textures:{},sprites:{},urls:{sea_ride:'native-ride',shibuki01:'native-spray'}},
  IcirrusChapter:{ensure:async()=>{},surfaceAt:(zone,x,y,height)=>({flags:2,height:x===plan.to.x?plan.to.height:99})},
  StarterScene:{loadGLB:async()=>({})},renderer:{groundHeight:()=>2,resourceGate(key,operation){assert.equal(key,'surf-pokemon');gateCalls++;return operation();}},
  ROM_SPRITE_ANIM:{prepare:async()=>{cutIns++;}}};
 c.window=c;vm.createContext(c);for(const file of ['surf-field-motion.js','surf-field.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),c,{filename:file});
 c.SurfField.play=async()=>{cutIns++;};const start=c.SurfField.start;c.SurfField.start=(...args)=>{starts++;return start(...args);};
 // This is the checkpoint window from the actual controller: cancel briefly
 // unmounts the rider, present releases its bank, then a valid save returns.
 const checkpoint={native:structuredClone(native),hero:{...hero}};c.SurfField.motion.cancel();world.present();assert.equal(ready,false);
 Object.assign(native,structuredClone(checkpoint.native));Object.assign(hero,checkpoint.hero);assert.equal(c.SurfField.motion.restore(),true);assert.equal(c.SurfField.busy,true);
 const waiting=JSON.stringify({native,hero}),flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
 for(let i=0;i<5;i++)c.SurfField.tick(1/30);await flush();
 assert.equal(gateCalls,1,'A restored busy motion must queue its missing swimmer through the existing resource gate');assert.equal(prepareCalls,1);assert.equal(preparations[0][0],selected);assert.equal(preparations[0][1],57);
 assert.equal(JSON.stringify({native,hero}),waiting,'No motion or terrain resync may change the saved pose while its bank is absent');
 for(let i=0;i<5;i++)c.SurfField.tick(1/30);await flush();assert.equal(gateCalls,1,'Repeated ticks share one pending repair');
 releaseAssets();await flush();assert.equal(ready,true);assert.equal(c.SurfField.busy,true);c.SurfField.tick(1/30);
 assert.equal(JSON.stringify({native,hero}),waiting,'Prepared assets alone do not acknowledge a displayed swimmer pose');
 world.acknowledgeDraw();c.SurfField.tick(1/30);assert.ok(native.surfMotion.travel>.3);assert.ok(hero.x>checkpoint.hero.x);
 for(let i=0;i<20&&c.SurfField.busy;i++)c.SurfField.tick(1/30);
 assert.equal(c.SurfField.busy,false);assert.equal(native.surf,true);assert.equal(native.surfUserIndex,1);assert.equal(party[1],selected);assert.equal(c.Journey.state.playerGender,'F');assert.equal(c.Journey.state.playerName,'Anita');
 assert.deepEqual(hero,{x:plan.to.x,y:plan.to.y});assert.equal(native.fieldHeight,plan.to.height);assert.equal(gateCalls,1);assert.equal(prepareCalls,1);assert.equal(cutIns,0);assert.equal(starts,0);assert.equal(saves,1);assert.deepEqual(savePositions,[{x:plan.to.x,y:plan.to.y,height:plan.to.height}]);
});
