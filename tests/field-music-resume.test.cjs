const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('native map restore installs the sequence only at silence and keeps its independent60-frame fade in',async()=>{
 const s=setup(),tracks=[],manager=s.c.FieldMusicResume.create({state:s.state,volume:v=>s.levels.push(v),scene:id=>tracks.push(id)});
 const done=manager.restore(1076,6,60);let settled=false;done.then(()=>settled=true);
 for(let i=0;i<5;i++){s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();}assert.deepEqual(tracks,[]);
 s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();for(let i=0;i<6;i++)await Promise.resolve();
 assert.deepEqual(tracks,[1076]);assert.equal(s.state.fieldMusicVolume,0);assert.equal(settled,false);
 for(let i=0;i<30;i++){s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();}assert.equal(s.state.fieldMusicVolume,63);assert.equal(settled,false);
 for(let i=0;i<30;i++){s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();}assert.equal(await done,true);assert.equal(s.state.fieldMusicVolume,127);assert.equal(manager.busy,false);
 const cancelled=manager.restore(1076,120,60);manager.reset();assert.equal(await cancelled,false);assert.equal(s.state.fieldMusicFade,undefined);
});
test('a map restore invalidated by a battle or a new map cannot replace the new owner music',async()=>{
 for(const duringInstall of [false,true]){
  const s=setup();let valid=true,release,errors=0;const tracks=[],manager=s.c.FieldMusicResume.create({state:s.state,volume:()=>{},scene:id=>{tracks.push(id);return new Promise(resolve=>release=resolve);},onError:()=>errors++});
  const done=manager.restore(1076,duringInstall?0:120,60,()=>valid);
  if(duringInstall)await Promise.resolve();valid=false;s.state.music=1138;manager.tick();assert.equal(await done,false);
  release?.();for(let i=0;i<6;i++)await Promise.resolve();assert.equal(s.state.music,1138);assert.equal(s.state.fieldMusicVolume,127);assert.equal(s.state.fieldMusicFade,undefined);assert.equal(manager.busy,false);assert.equal(errors,0);assert.deepEqual(tracks,duringInstall?[1076]:[]);
 }
});
function setup(){const c={};c.window=c;vm.createContext(c);for(const name of ['field-music-fade','field-music-resume'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),c);const state={},levels=[],resume=c.FieldMusicResume.create({state,volume:v=>levels.push(v)});return {c,state,levels,resume,tick(dt){c.FieldMusicFade.tick(state,dt);resume.tick();}};}
test('161-style request waits through native fade-out and returns the current field bus to full level at1/2/4',async()=>{
 for(const speed of [1,2,4]){const s=setup(),done=s.resume.request(6,0);let finished=false;done.then(()=>finished=true);for(let i=0;i<12/speed-1;i++)s.tick(speed/60);await Promise.resolve();assert.equal(finished,false);assert.ok(s.state.fieldMusicVolume<127);s.tick(speed/60);assert.equal(await done,true);assert.equal(s.state.fieldMusicVolume,127);assert.equal(s.resume.busy,false);}
});
test('162-style zero-out/60-in request starts without blocking the caller and maintains native discrete volume',async()=>{
 const s=setup(),done=s.resume.request(0,60);assert.equal(s.state.fieldMusicVolume,0);assert.equal(s.resume.busy,true);for(let i=0;i<30;i++)s.tick(1/30);assert.equal(s.state.fieldMusicVolume,63);assert.equal(s.resume.busy,true);for(let i=0;i<30;i++)s.tick(1/30);assert.equal(await done,true);assert.equal(s.state.fieldMusicVolume,127);assert.equal(s.resume.busy,false);
});
test('queued requests remain ordered and cancellation resolves waiters and restores the field bus',async()=>{
 const s=setup(),a=s.resume.request(4,2),b=s.resume.request(2,0);for(let i=0;i<6;i++)s.tick(1/30);assert.equal(await a,true);assert.equal(s.resume.busy,true);for(let i=0;i<2;i++)s.tick(1/30);assert.equal(await b,true);assert.equal(s.resume.busy,false);
 const pending=s.resume.request(60,60),queued=s.resume.request(1,1);s.tick(1/30);s.resume.reset();assert.equal(await pending,false);assert.equal(await queued,false);assert.equal(s.state.fieldMusicVolume,127);assert.equal(s.state.fieldMusicFade,undefined);assert.equal(s.resume.busy,false);assert.throws(()=>s.resume.request(-1,0),/Tempi/);
});
test('584 waits for the original fade before switching;601 schedules its fade and returns immediately',async()=>{
 const s=setup(),tracks=[],manager=s.c.FieldMusicResume.create({state:s.state,volume:v=>s.levels.push(v),scene:id=>tracks.push(id)});s.state.music=1076;
 const switched=manager.change(1002,6);for(let i=0;i<5;i++){s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();}assert.equal(s.state.music,1076);assert.deepEqual(tracks,[]);s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();await switched;assert.deepEqual(tracks,[1002]);assert.equal(s.state.music,1002);assert.equal(s.state.fieldMusicVolume,127);
 assert.equal(manager.stop(160),undefined);assert.equal(manager.busy,true);for(let i=0;i<80;i++){s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();}assert.equal(s.state.music,1002);assert.equal(s.state.fieldMusicVolume,64);for(let i=0;i<80;i++){s.c.FieldMusicFade.tick(s.state,1/30);manager.tick();}for(let i=0;i<8;i++)await Promise.resolve();assert.deepEqual(tracks,[1002,1001]);assert.equal(s.state.music,1001);assert.equal(manager.busy,false);
});
test('cancelled or failed musical installation cannot finish an obsolete native request',async()=>{
 const immediate=setup(),calls=[],early=immediate.c.FieldMusicResume.create({state:immediate.state,volume:()=>{},scene:id=>calls.push(id)}),obsolete=early.change(1002,0);early.reset();assert.equal(await obsolete,false);for(let i=0;i<5;i++)await Promise.resolve();assert.deepEqual(calls,[]);
 const s=setup();let release,errors=0;const manager=s.c.FieldMusicResume.create({state:s.state,volume:()=>{},scene:()=>new Promise(resolve=>release=resolve),onError:()=>errors++});s.state.music=1076;const pending=manager.change(1002,0);await Promise.resolve();manager.reset();assert.equal(await pending,false);release();for(let i=0;i<5;i++)await Promise.resolve();assert.equal(s.state.music,1076);assert.equal(errors,0);
 const broken=s.c.FieldMusicResume.create({state:s.state,volume:()=>{},scene:()=>{throw Error('audio offline');},onError:()=>errors++});await assert.rejects(broken.change(1002,0),/offline/);assert.equal(broken.busy,false);assert.equal(errors,1);
});
