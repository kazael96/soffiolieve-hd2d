const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function environment(){
 const c={console,Promise,structuredClone,player:{x:2.5,y:9.5},facing:0,resetInput(){},Journey:{save(){}},NativeStory:{state:{zone:97,clayHeight:50,flags:[]},locked:false,visualActors:()=>[],occupied:()=>false},AudioEngine:{playSound(){},stopSound(){}},OPENING_ASSETS:{models:{},textures:{},scenes:Object.fromEntries([97,98,195,196,197].map(zone=>['zone'+zone,{zone,instances:[]}]))},StarterScene:{loadGLB:async()=>({animationSets:[]})}};
 c.window=c;vm.createContext(c);for(const f of ['mistralton-scenes','mistralton-gym-data','mistralton-puzzle-data'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c,{filename:f});c.MistraltonChapter={grids:zone=>c.MISTRALTON_SCENES[zone].permissionGrids};for(const f of ['mistralton-gym','mistralton-ice','mistralton-puzzles'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c,{filename:f});return c;
}
test('the public Gym singleton exposes the running ride and unlocks only when its actual motion ends',async()=>{
 const c=environment(),g=c.MistraltonGym;assert.equal(g.busy,false);const task=g.moveLift(0);for(let i=0;i<12;i++)await Promise.resolve();assert.equal(g.busy,true,'browser callers must see the live ride');assert.equal(g.ride.index,0);assert.equal(g.ride.hero,true);for(let i=0;i<1000&&g.busy;i++)g.tick(1/30);await task;assert.equal(g.busy,false);assert.equal(g.ride,null);assert.equal(c.NativeStory.state.clayHeight,40);
});
test('the public Ice singleton exposes momentum rather than a frozen false snapshot',()=>{
 const c=environment(),ice=c.MistraltonIce;c.NativeStory.state.zone=192;c.player={x:-8.5,y:7.5};ice.tick(0,true);assert.equal(ice.busy,true);assert.equal(ice.sliding,true);assert.ok(ice.slide);ice.reset();assert.equal(ice.busy,false);assert.equal(ice.sliding,false);assert.equal(ice.slide,null);
});
test('the public Puzzle singleton exposes physical crystal motion and its own ice lock',()=>{
 const c=environment(),p=c.MistraltonPuzzles;c.NativeStory.state.zone=195;const b=p.crystals()[0];c.player={x:b.x,y:b.z+1};assert.equal(p.tryStep(0,-1),true);assert.equal(p.busy,true);assert.equal(p.motion.index,0);p.tick(2);assert.equal(p.busy,false);assert.equal(p.motion,null);c.NativeStory.state.zone=192;c.player={x:-8.5,y:7.5};p.enter(192);p.tick(0,true);assert.equal(p.ice.sliding,true);assert.equal(p.busy,true,'field lock must include actual ice controller state');p.reset();assert.equal(p.busy,false);
});
