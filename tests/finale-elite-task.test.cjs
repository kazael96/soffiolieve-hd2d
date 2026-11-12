const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function fixture(){const c={Math,Map,Set,Promise,Number,Error};c.window=c;vm.createContext(c);for(const name of ['starter-scene','finale-elite-four-animation','finale-elite-controls','finale-elite-sound','finale-elite-task'])vm.runInContext(fs.readFileSync(path.join(process.env.SOFFIOLIEVE_ELITE_SOURCE||'src',name+'.js'),'utf8'),c);return c;}
test('all four native entrances share clock, exact destination and sound order at1/2/4 speeds',async()=>{
 const c=fixture();for(let room=1;room<=4;room++)for(const speed of [1,2,4]){
  const n={zone:139+room,fieldHeight:0},hero={x:-.5,y:9.5},sounds=[],stops=[],frames=[],seen=[];let direction=-1;
  const task=c.FinaleEliteTask.create({state:()=>n,hero:()=>hero,face:d=>direction=d,play:id=>sounds.push(id),stop:id=>stops.push(id),show:r=>seen.push(r.model.member),hide:()=>seen.push('restore'),update:r=>frames.push(r.frame)});
  const promise=task.begin(room);await Promise.resolve();assert.equal(task.hidden,true);assert.equal(seen[0],(room-1)*6+3);
  for(let i=0;i<800&&task.busy;i++)task.tick(speed/30);
  assert.equal(await promise,true);const control=c.FINALE_ELITE_CONTROLS.rooms[n.zone];assert.deepEqual(sounds,Array.from(control.events.filter(e=>e.action==='play'),e=>e.id));
  assert.equal(task.hidden,false);assert.equal(task.busy,false);assert.equal(frames.at(-1),control.frames-1);assert.equal(hero.x,control.destination[0]-15.5);assert.equal(hero.y,control.destination[2]-15.5);assert.equal(direction,control.facing);assert.equal(seen.at(-1),'restore');
 }
});
test('preparation failure, cancellation and obsolete async completion preserve the visible hero and cannot resume a replaced scene',async()=>{
 const c=fixture(),n={zone:140},hero={x:-.5,y:9.5};let release,shown=0;
 const task=c.FinaleEliteTask.create({state:()=>n,hero:()=>hero,prepare:()=>new Promise(done=>release=done),show:()=>shown++});
 const pending=task.begin(1);task.tick(60);task.tick(Symbol());assert.equal(task.hidden,false);assert.equal(shown,0);
 task.cancel();n.zone=141;release();assert.equal(await pending,false);assert.equal(shown,0);assert.deepEqual(hero,{x:-.5,y:9.5});
 const bad=c.FinaleEliteTask.create({state:()=>n,hero:()=>hero,prepare:async()=>{throw Error('offline');}});await assert.rejects(bad.begin(2),/offline/);assert.equal(bad.busy,false);assert.equal(bad.hidden,false);
});
test('native camera curves remain finite through every frame including positive pitch and three viewport lenses',()=>{
 const c=fixture();let matrices=0;for(const e of Object.values(c.FINALE_ELITE_FOUR_ANIMATION.entrances))for(const sample of e.camera.samples)for(const [w,h]of [[1280,720],[390,844],[844,390]]){
  const m=c.FinaleEliteTask.cameraMatrix(sample,w,h);assert.equal(m.length,16);assert.ok(m.every(Number.isFinite));matrices++;
 }assert.equal(matrices,(441+528+691+301)*3);
});
test('a task update failure reaches its waiting event and releases the hidden hero instead of leaving a stuck promise',async()=>{
 const c=fixture(),n={zone:140},hero={x:-.5,y:9.5},cleanup=[];let hidden=false;
 const task=c.FinaleEliteTask.create({state:()=>n,hero:()=>hero,show:()=>hidden=true,coverFailure:()=>cleanup.push('covered'),hide:()=>{cleanup.push('hero restored');hidden=false;},update:r=>{if(r.frame>0)throw Error('native update failed');}});
 const promise=task.begin(1);await Promise.resolve();assert.equal(hidden,true);assert.doesNotThrow(()=>task.tick(1/30));await assert.rejects(promise,/native update failed/);assert.equal(hidden,false);assert.equal(task.busy,false);assert.deepEqual(cleanup,['covered','hero restored']);
});
test('a continuous browser step visibly reaches the native cell before swapping to the original3D hero',async()=>{
 const c=fixture(),n={zone:140},hero={x:-.5,y:9.99},shown=[];
 const task=c.FinaleEliteTask.create({state:()=>n,hero:()=>hero,entryPosition:()=>({x:-.5,y:9.5}),show:()=>shown.push({...hero})});
 const promise=task.begin(1);await Promise.resolve();assert.equal(task.hidden,false);assert.equal(task.snapshot.phase,'align');task.tick(.07);assert.ok(hero.y<9.99&&hero.y>9.5);assert.equal(shown.length,0);assert.equal(task.actor().direction,0);
 task.tick(.07);assert.equal(hero.y,9.5);assert.equal(task.hidden,true);assert.deepEqual(shown,[{x:-.5,y:9.5}]);assert.equal(task.snapshot.frame,0);task.tick(441/30);assert.equal(await promise,true);assert.equal(task.actor(),null);
});
test('a wrong entrance position is rejected without teleporting or hiding the protagonist',async()=>{
 const c=fixture(),n={zone:140},hero={x:8,y:9.5};let shown=false;const task=c.FinaleEliteTask.create({state:()=>n,hero:()=>hero,entryPosition:()=>({x:-.5,y:9.5}),show:()=>shown=true});await assert.rejects(task.begin(1),/casella originale/);assert.equal(shown,false);assert.equal(task.busy,false);assert.deepEqual(hero,{x:8,y:9.5});
});
