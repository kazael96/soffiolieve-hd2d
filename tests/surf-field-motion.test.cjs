const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/surf-field-motion.js'),'utf8'),c);
function setup({special=false,prepare=async()=>{},occupied=()=>false}={}){
 const n={zone:113,fieldHeight:7,bicycle:true},p={x:.5,y:.5},party=[{hp:0,pp:[{id:57,left:0}]}],samples=[],saves=[];
 const surface=(zone,x,y,h)=>{samples.push(h);const col=Math.floor(x);return {height:col>=2?6:7,flags:col>=1?2:0,behavior:special&&col===1?65:0};};
 const task=c.SurfFieldMotion.create({state:()=>n,hero:()=>p,surface,party:()=>party,direction:()=>3,prepare,occupied,save:()=>saves.push(JSON.parse(JSON.stringify({n,p})))});
 return {n,p,party,samples,saves,task};
}
for(const speed of [1,2,4])test('Surf enters and automatically lands with persistent native heights at x'+speed,async()=>{
 const {n,p,task,saves,samples}=setup();assert.ok(await task.start());assert.equal(n.bicycle,false);assert.equal(n.surf,true);assert.equal(task.busy,true);
 const before=p.x;task.tick(1/60);assert.equal(p.x,before,'Native wait precedes movement');
 for(let i=0;i<200&&task.busy;i++)task.tick(speed/60);assert.equal(p.x,1.5);assert.equal(n.fieldHeight,7);assert.equal(task.busy,false);assert.ok(saves.length>=2);assert.ok(samples.every(h=>h===7));
 assert.equal(task.tryLanding(-1,0),true);for(let i=0;i<200&&task.busy;i++)task.tick(speed/60);assert.equal(p.x,.5);assert.equal(n.surf,false);assert.equal(task.blocked(1.5,.5),true,'Water cannot be walked onto');
});
test('Surf move search excludes eggs but does not impose HP, PP or badge restrictions',async()=>{
 const {party,task,n}=setup();assert.equal(task.user(),0);assert.ok(await task.start());task.cancel();party[0].egg=true;assert.equal(task.user(),-1);assert.equal(await task.start(),false);assert.equal(n.surf,false);
});
test('native shore65 crosses two cells and probes the target near physical height',async()=>{
 const {task,n,p}=setup({special:true});assert.equal(task.coast().cells,2);assert.ok(await task.start());for(let i=0;i<200&&task.busy;i++)task.tick(1/60);assert.equal(p.x,2.5);assert.equal(n.fieldHeight,6);
});
test('an occupied shore or arrival never starts a transition',async()=>{
 const {task}=setup({special:true,occupied:x=>x===2.5});assert.equal(task.coast(),null);assert.equal(await task.start(),false);
});
test('cancelled or replaced resource preparation cannot mount in another scene',async()=>{
 let ready;const {task,n}=setup({prepare:()=>new Promise(resolve=>ready=resolve)}),pending=task.start();assert.equal(task.preparing,true);n.zone=115;task.cancel();ready();assert.equal(await pending,false);assert.equal(n.surf,undefined);assert.equal(task.busy,false);
});
test('saving halfway through a shoreline crossing resumes without jumping',async()=>{
 const original=setup();await original.task.start();for(let i=0;i<24;i++)original.task.tick(1/60);assert.ok(original.p.x>.5&&original.p.x<1.5);const copy=setup();Object.assign(copy.n,JSON.parse(JSON.stringify(original.n)));Object.assign(copy.p,original.p);assert.ok(copy.task.restore());assert.equal(copy.p.x,original.p.x);for(let i=0;i<100&&copy.task.busy;i++)copy.task.tick(1/60);assert.equal(copy.p.x,1.5);assert.equal(copy.n.surf,true);
});
test('a foreign-map or malformed shoreline task is rejected',async()=>{
 const {task,n}=setup();await task.start();n.surfMotion.travel=NaN;assert.equal(task.restore(),false);assert.equal(n.surfMotion,undefined);
});

test('Surf remembers the selected swimmer across a saved crossing and clears it on landing',async()=>{
 const a=setup();a.party.push({name:'Second swimmer',pp:[{id:57,left:0}]});
 assert.ok(await a.task.start(1));assert.equal(a.n.surfUserIndex,1);
 const b=setup();b.party.push(a.party[1]);Object.assign(b.n,JSON.parse(JSON.stringify(a.n)));assert.ok(b.task.restore());assert.equal(b.n.surfUserIndex,1);
 for(let i=0;i<100&&b.task.busy;i++)b.task.tick(1/60);
 assert.ok(b.task.tryLanding(-1,0));for(let i=0;i<100&&b.task.busy;i++)b.task.tick(1/60);
 assert.equal(b.n.surf,false);assert.equal(b.n.surfUserIndex,undefined);
});

test('a party replacement during resource preparation cannot silently change the swimmer',async()=>{
 let ready,prepared;const a=setup({prepare:mon=>{prepared=mon;return new Promise(resolve=>ready=resolve);}}),chosen=a.party[0],pending=a.task.start(0);
 assert.equal(prepared,chosen);a.party[0]={pp:[{id:57,left:0}]};ready();assert.equal(await pending,false);assert.notEqual(a.n.surf,true);assert.equal(a.n.surfUserIndex,undefined);
});

test('old mounted saves choose a swimmer without adding HP, PP or badge restrictions',()=>{
 const a=setup();a.p.x=1.5;a.n.surf=true;assert.ok(a.task.restore());assert.equal(a.n.surfUserIndex,0);
 a.n.surfUserIndex=99;assert.ok(a.task.restore());assert.equal(a.n.surfUserIndex,0);
 a.n.surf=false;a.task.restore();assert.equal(a.n.surfUserIndex,undefined);
});

test('shore landing keeps the swimmer through recall and resumes that visual phase after saving',async()=>{
 const a=setup();await a.task.start();while(a.task.busy)a.task.tick(1/60);a.task.tryLanding(-1,0);
 while(a.n.surfMotion.phase!=='recall')a.task.tick(1/60);
 assert.equal(a.p.x,.5);assert.equal(a.n.surf,true);assert.equal(a.n.surfUserIndex,0);a.task.tick(4/60);
 const b=setup();Object.assign(b.n,JSON.parse(JSON.stringify(a.n)));Object.assign(b.p,a.p);assert.ok(b.task.restore());assert.equal(b.n.surfMotion.phase,'recall');
 while(b.task.busy)b.task.tick(1/60);assert.equal(b.n.surf,false);assert.equal(b.n.surfUserIndex,undefined);assert.equal(b.p.x,.5);
});
