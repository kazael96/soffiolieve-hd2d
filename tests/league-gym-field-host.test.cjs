/* Actual OriginalStory dispatch/field ticks; camera math runs, GPU/audio output are isolated. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
const source=path.resolve(__dirname,'../src'),nativeData=require('./fixtures/drayden-native-task.json'),buttons=require('./fixtures/drayden-button-scripts.json');
async function setup(){
 const c=environment({opelucid:true,sourceRoot:source});await c.OpelucidChapter.ensure();const n=c.NativeStory.state;Object.assign(n,{zone:121,intro:true,initialized:true,fieldHeight:6});c.ORIGINAL_EVENTS.zones[121]={zone:121,script:242,text:126,music:1018,actors:[],triggers:[],background:[],warps:[],init:[],onEnter:[]};c.ORIGINAL_EVENTS.scripts[242]=structuredClone(buttons.scripts[242]);c.player={x:12.5,y:15};c.renderer.scene={zone:121,chapter051:true,verticalMap:true,instances:[],permissionGrids:[]};c.LEAGUE_GYM_DATA=structuredClone(nativeData);
 for(const name of ['league-gym-task','league-gym-jump','league-gym'])vm.runInContext(fs.readFileSync(path.join(source,name+'.js'),'utf8'),c,{filename:name+'.js'});
 c.LeagueGym=c.LeagueGymController.create({data:c.LEAGUE_GYM_DATA,state:()=>n,hero:()=>c.player,sound(){},stopSound(){},visualFactory:()=>({prepare:async()=>true,release(){},apply(){}})});return c;
}
test('all six native programs run through the real field host, including camera waits and speed-scaled physics',async()=>{
 for(const speed of [1,2,4])for(let entry=2;entry<8;entry++){
  const c=await setup();c.testSpeed=speed;await drain(c,c.NativeStory.run(entry,242));assert.equal(c.LeagueGym.busy,false);assert.equal(c.NativeStory.vm.running,false);assert.equal(c.Journey.locked,false);assert.equal(c.NativeStory.state.fieldHeight,4);assert.equal(c.player.x,12.5+(entry%2===0?1:-1));assert.equal(c.player.y,15);assert.equal(c.renderer.storyCamera,null);
 }
});
test('the real field input lock and collision dispatch include an active dragon hop',async()=>{
 const c=await setup(),pending=c.LeagueGym.command('NativeOpcode408',[2]);assert.equal(c.NativeStory.locked,true);assert.equal(c.blocked(c.player.x,c.player.y),true);let ticks=0;while(c.LeagueGym.busy&&ticks++<20)c.Journey.step(1/30,false);await pending;assert.equal(c.LeagueGym.busy,false);assert.equal(c.NativeStory.locked,false);assert.equal(c.NativeStory.state.fieldHeight,4);
});

test('stepping from a dragon ribbon onto a WB floor clears the old rail hint before actor height checks',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.railCurrent={zone:121,line:47,height:12};n.fieldHeight=0;
 c.NativeRails={...c.NativeRails,has:z=>z===121,locate:()=>null};c.OpelucidChapter.surfaceAt=()=>({height:0,flags:128});
 c.Journey.step(1/30,false);assert.equal(n.fieldHeight,0);assert.equal(n.railCurrent,undefined);
});
