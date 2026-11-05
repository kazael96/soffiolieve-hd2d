const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/field-music-fade.js'),'utf8'),c);const fade=c.window.FieldMusicFade;
for(const speed of [1,2,4])test('native music fade preserves frames, interruption and checkpoint at ×'+speed,()=>{
 const state={};fade.start(state,64,30);assert.equal(state.fieldMusicVolume,127);
 let elapsed=0;while(elapsed<15){const step=Math.min(speed/2,15-elapsed);fade.tick(state,step/30);elapsed+=step;}
 assert.equal(state.fieldMusicVolume,96);
 const saved=JSON.parse(JSON.stringify(state));fade.tick(state,15/30);fade.tick(saved,15/30);
 assert.equal(state.fieldMusicVolume,64);assert.deepEqual(saved,state);assert.equal(state.fieldMusicFade,undefined);
 fade.start(state,127,60);fade.tick(state,30/30);assert.equal(state.fieldMusicVolume,95);
 fade.start(state,0,30);fade.tick(state,30/30);assert.equal(state.fieldMusicVolume,0);
 fade.start(state,127,0);assert.equal(state.fieldMusicVolume,127);assert.equal(state.fieldMusicFade,undefined);
});
test('invalid saved fade cannot poison the audio bus or make field events wait',()=>{
 for(const bad of [{from:NaN,target:64,frames:30,elapsed:0},{from:127,target:64,frames:-1,elapsed:0},{from:127,target:64,frames:30,elapsed:Infinity}]){
  const state={fieldMusicVolume:96,fieldMusicFade:bad};assert.equal(fade.tick(state,1),96);assert.equal(state.fieldMusicFade,undefined);
 }
 assert.equal(fade.tick({fieldMusicVolume:-5},0),127);assert.throws(()=>fade.start({},128,10));
});

test('actual field595/596 dispatch controls music volume rather than camera state',async()=>{
 const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment}=require('./check-story-runtime.cjs');process.argv[2]=old;
 const env=environment({sourceRoot:path.resolve(__dirname,'../src')}),calls=[];env.FieldMusicFade=fade;env.AudioEngine.setFieldMusicVolume=v=>calls.push(v);
 const command=(name,args)=>env.NativeStory.vm.host.command({name},args,args,env.NativeStory.vm);
 await command('NativeOpcode595',[64,30]);const state=env.NativeStory.state;
 assert.equal(state.fieldMusicFade.target,64);assert.equal(state.fieldMusicFade.frames,30);assert.equal(state.chapterCameraZoom,undefined);
 fade.tick(state,1);await command('NativeOpcode596',[60]);assert.equal(state.fieldMusicFade.from,64);assert.equal(state.fieldMusicFade.target,127);assert.equal(state.fieldMusicFade.frames,60);assert.deepEqual(calls,[127,64]);
});

test('native volume multiplies user music level without changing effects, cries or preferences',async()=>{
 const {fixture}=require('./helpers/audio-engine-fixture.cjs'),f=fixture();
 f.api.setFieldMusicVolume(64);assert.equal(f.api.fieldMusicVolume,64,'Disabled audio still retains the logical fade');
 await f.api.enable();await f.drain();const music=f.gains[1],sfx=f.gains[2],cry=f.gains[3];
 assert.equal(music.gain.value,.45*64/127);assert.equal(sfx.gain.value,.7);assert.equal(cry.gain.value,.8);
 f.api.setFieldMusicVolume(32);assert.equal(music.gain.value,.45*32/127);
 f.elements.get('volume-music').oninput({target:{value:80}});assert.equal(music.gain.value,.8*32/127);
 f.api.setFieldMusicVolume(127);assert.equal(music.gain.value,.8);assert.equal(sfx.gain.value,.7);assert.equal(cry.gain.value,.8);
 assert.throws(()=>f.api.setFieldMusicVolume(NaN));assert.throws(()=>f.api.setFieldMusicVolume(128));
});
