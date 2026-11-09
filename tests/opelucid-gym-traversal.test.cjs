const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),route=require('./fixtures/brycen-input-route.json');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||'../fidelity-build-051-opelucid-next';const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
async function setup(rate){
 const c=environment({opelucid:true,sourceRoot:path.resolve('src')}),n=c.NativeStory.state;Object.assign(n,{intro:true,initialized:true,flags:[576,577,579,678],badges:[0,1,2,3,4,5],trainerWins:Object.keys(c.OPELUCID_DATA.trainers).map(Number)});
 c.Journey.state.starter='Snivy';c.Journey.state.party=[c.Journey.pack(c.makeMon('Serperior',39),c.OPENING_DATA.Serperior.growth[39])];c.Journey.displayPartner();await drain(c,c.NativeStory.changeZone(114,...route.initial));
 const clock={performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){}};clock.window=clock;vm.createContext(clock);vm.runInContext(fs.readFileSync('src/game-speed.js','utf8'),clock);clock.GameSpeed.set(rate);
 // Exercise the actual game's collision/movement/frame function and actual
 // speed subdivision. Rendering and wall-clock fades are outside this host.
 c.GameSpeed={steps:clock.GameSpeed.steps,rate};let input={},time=0;c.controls={state:()=>input};c.requestAnimationFrame=()=>0;c.last=0;c.t=0;c.canvas=c.$('world');c.drawWorld=()=>{};c.drawArena=()=>{};c.renderer.status=message=>{throw Error(message);};
 const game=fs.readFileSync('src/game.js','utf8'),start=game.indexOf('function frame('),end=game.indexOf('refresh();requestAnimationFrame(frame);',start);vm.runInContext(game.slice(start,end),c);
 return {c,n,async tick(key){input=key&&!c.NativeStory.locked?{[key]:true}:{};c.frame(time+=1000/60);for(let i=0;i<12;i++)await Promise.resolve();assert.equal(c.$('world').dataset.runtimeError,undefined);assert.equal(c.$('world').dataset.eventError,undefined);assert.equal(c.lastBattle,undefined,'Traversal must not manufacture battle outcomes');}};
}
for(const rate of [1,2,4])test('actual field frames traverse all eight Brycen ramps and all three switches continuously at ×'+rate,async()=>{
 const f=await setup(rate),events=[];for(const step of route.steps){let frames=0;const reached=()=>{const at=step.event&&/^(gate|auto)/.test(step.event)?Math.hypot(f.c.player.x-step.x+15.5,f.c.player.y-step.z+15.5)<.06:Math.abs(f.c.player.x-step.x+15.5)<.16&&Math.abs(f.c.player.y-step.z+15.5)<.16;return at&&!f.c.NativeStory.locked&&!f.c.OpelucidGym.busy&&(f.n.brycenPuzzle.states[0]|f.n.brycenPuzzle.states[1]<<1|f.n.brycenPuzzle.states[2]<<2)===step.state;};
  while(!reached()&&frames++<1200)await f.tick(step.key);
  assert.ok(reached(),JSON.stringify({step,player:f.c.player,height:f.n.fieldHeight,locked:f.c.NativeStory.locked,railHint:f.n.railCurrent,ride:f.n.brycenIceRide,slide:f.n.brycenIceSlide,trace:f.c.NativeStory.vm.trace.slice(-8)}));
  assert.ok(Math.abs(f.n.fieldHeight-step.height)<.05);assert.deepEqual(Array.from(f.n.brycenPuzzle.states),[step.state&1,(step.state>>1)&1,(step.state>>2)&1]);if(step.event)events.push(step.event);
 }
 assert.deepEqual(events.filter(e=>e.startsWith('gate')).sort(),Array.from({length:8},(_,i)=>'gate'+i));assert.deepEqual(events.filter(e=>e.startsWith('switch')),['switch0','switch1','switch2']);assert.equal(f.n.zone,114);assert.ok(Math.abs(f.n.fieldHeight-7.0016937255859375)<.01);
 for(const [key,x,z,automatic]of [['ArrowRight',18,15],['ArrowDown',18,22],['ArrowLeft',15,61,true]]){
  let frames=0;const reached=()=>Math.abs(f.c.player.x-x+15.5)<(automatic?.06:.16)&&Math.abs(f.c.player.y-z+15.5)<(automatic?.06:.16)&&!f.c.NativeStory.locked&&!f.c.OpelucidGym.busy;
  while(!reached()&&frames++<1200)await f.tick(key);
  assert.ok(reached(),'Return '+JSON.stringify({key,x,z,player:f.c.player,height:f.n.fieldHeight,ride:f.n.brycenIceRide,slide:f.n.brycenIceSlide}));
 }
 assert.ok(Math.abs(f.n.fieldHeight)<.01,'The return rail must reach the entrance floor');
});
