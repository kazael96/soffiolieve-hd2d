/* Native geography and event host. No GPU and no claim of battle/continuity proof. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {setup}=require('./helpers/league-field-host.cjs');
const reference=require('./fixtures/drayden-field-input.json');
test('a cold entrance loads native Gym geography, actors, initializer, original puzzle and bounded resources together',async()=>{
 const c=await setup(),n=c.NativeStory.state;assert.equal(n.zone,121);assert.equal(n.fieldHeight,0);assert.equal(n.vars[16416],180);assert.equal(c.blocked(c.player.x,c.player.y),false);
 assert.equal(c.LeagueGym.task.snapshot.dragons.length,3);assert.equal(c.OPENING_ASSETS.scenes.zone121.instances.filter(i=>i.drayden!==undefined).length,16);
 assert.ok(c.NativeStory.visualActors().some(a=>a.model===180&&a.uid===4));assert.equal(c.OpelucidChapter.loader.stats().limit,3);assert.equal(c.elements.get('world').dataset.eventError,undefined);
});

test('the Gym interior background matches its dark native geometry instead of exposing the outdoor teal void',async()=>{
 const c=await setup();assert.deepEqual(Array.from(c.renderer.scene.clearColor||[]),[0,0,0]);
});

test('the retained input route still refers to the reviewed original map, surfaces, rails and puzzle',()=>{
 const fs=require('node:fs'),{sourceHash}=require('../tools/plan-league-gym-route.cjs');assert.equal(reference.sourceHashFormat,'sha256:utf8-lf');for(const [file,hash]of Object.entries(reference.sources))assert.equal(sourceHash(fs.readFileSync(path.join(__dirname,'../src',file))),hash,file);
});

test('actual game.frame traverses the Gym and automatically runs all five button events at x1/x2/x4',async()=>{
 const {replay}=require('../tools/replay-league-gym-route.cjs');
 for(const speed of [1,2,4]){const report=await replay(reference,speed);assert.equal(report.result,'PASS');assert.deepEqual(report.entries.map(e=>e.entry),[5,4,7,7,6]);assert.ok(report.frames>1500);assert.ok(Math.abs(report.height-12)<.01);}
});

test('the sparse browser route also survives fixed frame cadence without shortening a frame to hit each waypoint',async()=>{
 const {replay}=require('../tools/replay-league-gym-route.cjs'),report=await replay(reference,2,{fixedCadence:true,sparse:true});assert.equal(report.result,'PASS');assert.deepEqual(report.entries.map(e=>e.entry),[5,4,7,7,6]);assert.ok(report.frames>1500);
});

test('the real loop also reaches Aristide when each rendered frame contains several physical chunks',async()=>{
 const {replay}=require('../tools/replay-league-gym-route.cjs'),report=await replay(reference,2,{fixedCadence:true,sparse:true,frameSeconds:.05});assert.equal(report.result,'PASS');assert.deepEqual(report.entries.map(e=>e.entry),[5,4,7,7,6]);
});
