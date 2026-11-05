const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src'),read=name=>{const raw=fs.readFileSync(path.join(root,name+'.js'),'utf8');return JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));},routes=read('opelucid-gym-routes'),tables=read('opelucid-rails'),data=read('opelucid-gym-data'),table=tables[114];
const c={PINWHEEL_RAILS:tables};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'native-rails.js'),'utf8'),c);const rails=c.NativeRails,make=require('../src/opelucid-ice-rails.js').create,makePuzzle=require('../src/opelucid-gym-task.js').create;
function setup(route=routes.entries[0],checkpoint){
 const start=rails.position(114,route.line,route.front??0),native=checkpoint?.native||{zone:114,fieldHeight:start.height},hero=checkpoint?.hero||{x:start.x-16,y:start.z-16},puzzle=makePuzzle({data,state:()=>native});puzzle.snapshot;
 if(!checkpoint&&route.gate!==undefined){const rule=data.rampStateRules[route.gate];native.brycenPuzzle.states[rule[0]]=rule[1];}
 const ice=make({routes,table,rails,puzzle,state:()=>native,hero:()=>hero});return {native,hero,puzzle,ice};
}
for(const speed of [1,2,4])test('all eight directional gates follow connected native curves at ×'+speed+' without leaving their physical heights',async()=>{
 for(const route of routes.entries){const f=setup(route),p=f.ice.startGate(route.gate,2,route.direction);assert.ok(p);let frames=0;
  while(f.ice.busy&&frames++<3000){f.ice.tick(speed/60);const r=f.ice.snapshot;if(r){const expected=rails.position(114,r.line,r.front);assert.ok(Math.hypot(f.hero.x+16-expected.x,f.hero.y+16-expected.z)<1e-6);assert.ok(Math.abs(f.native.fieldHeight-expected.height)<1e-6);}}
  assert.ok(frames<3000);assert.equal(await p,true);const last=route.lines.at(-1),end=rails.position(114,last,table.lines[last].length);assert.ok(Math.hypot(f.hero.x+16-end.x,f.hero.y+16-end.z)<1e-6);assert.equal(f.native.brycenIceRide,undefined);
 }
});
test('opposite platform state, wrong direction and another floor cannot activate a ramp',()=>{
 for(const route of routes.entries){const f=setup(route);assert.equal(f.ice.startGate(route.gate,2,route.direction^1),false);assert.equal(f.ice.startGate(route.gate,1,route.direction),false);const rule=data.rampStateRules[route.gate];f.native.brycenPuzzle.states[rule[0]]=1-rule[1];assert.equal(f.ice.startGate(route.gate,2,route.direction),false);f.native.brycenPuzzle.states[rule[0]]=rule[1];f.native.fieldHeight+=3;assert.equal(f.ice.startGate(route.gate,2,route.direction),false);assert.equal(f.ice.busy,false);}
});
test('checkpoint in a curved slide resumes at the exact position and leaving releases its promise',async()=>{
 const route=routes.entries[0],f=setup(route),first=f.ice.startGate(route.gate,2,route.direction);f.ice.tick(1.8);const checkpoint=JSON.parse(JSON.stringify({native:f.native,hero:f.hero}));assert.equal(checkpoint.native.brycenIceRide.line,1);f.ice.cancel();assert.equal(await first,false);
 const resumed=setup(route,checkpoint),position={...resumed.hero};assert.equal(resumed.ice.restore(),true);assert.deepEqual(resumed.hero,position);const done=resumed.ice.wait();while(resumed.ice.busy)resumed.ice.tick(1/30);assert.equal(await done,true);
 const g=setup(route),pending=g.ice.startGate(route.gate,2,route.direction);g.native.zone=113;g.hero.x=900;g.ice.tick(.1);assert.equal(await pending,false);assert.equal(g.hero.x,900);
});
test('automatic bridge and return components preserve all41 native lines; bad checkpoints cannot lock input',async()=>{
 const lines=[...routes.entries,...routes.automatic].flatMap(r=>r.lines);assert.equal(lines.length,41);assert.equal(new Set(lines).size,41);
 for(const route of routes.automatic){const f=setup(route),a=rails.position(114,route.line,0),b=rails.position(114,route.line,.1),direction=Math.abs(b.x-a.x)>Math.abs(b.z-a.z)?b.x>a.x?3:2:b.z>a.z?1:0,done=f.ice.startAutomatic(route.line,direction);assert.ok(done);while(f.ice.busy)f.ice.tick(1/15);assert.equal(await done,true);}
 const f=setup();f.native.brycenIceRide={version:1,key:'gate:0',line:999,front:0,phase:'travel',x:f.hero.x,y:f.hero.y,height:0};assert.equal(f.ice.restore(),false);assert.equal(f.native.brycenIceRide,undefined);assert.equal(f.ice.busy,false);
});
