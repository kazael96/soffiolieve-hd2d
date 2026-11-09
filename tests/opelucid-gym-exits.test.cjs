const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=name=>{const s=fs.readFileSync('src/'+name+'.js','utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));},tables=read('opelucid-rails'),table=tables[114],data=read('opelucid-gym-data'),routes=read('opelucid-gym-routes');
// Independent reference from the paired native163 mode-boundary tiles, not
// the old full line length (whose last center cell is explicitly blocked).
for(const route of [...routes.entries,...routes.automatic]){
 const markers=route.lines.flatMap(id=>{const l=table.lines[id];return Array.from({length:l.tiles.length},(_,front)=>({line:id,front,attributes:l.tiles.values[front*l.tiles.width+Math.floor(l.tiles.width/2)]})).filter(p=>(p.attributes&65535)===163);});
 assert.equal(markers.length,2);route.exit={line:markers[1].line,front:markers[1].front};
}
const c={PINWHEEL_RAILS:tables};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('src/native-rails.js','utf8'),c);
const make=require('../src/opelucid-ice-rails.js').create,makePuzzle=require('../src/opelucid-gym-task.js').create;
for(const rate of [1,2,4])test('the actual Brycen rail controller exits at the native163 boundary before blocked padding at ×'+rate,async()=>{
 for(const route of routes.entries){const start=c.NativeRails.position(114,route.line,route.front),n={zone:114,fieldHeight:start.height},hero={x:start.x-16,y:start.z-16},puzzle=makePuzzle({data,state:()=>n});puzzle.snapshot;const rule=data.rampStateRules[route.gate];n.brycenPuzzle.states[rule[0]]=rule[1];const controller=make({routes,table,rails:c.NativeRails,puzzle,state:()=>n,hero:()=>hero}),done=controller.startGate(route.gate,2,route.direction);let frames=0;while(controller.busy&&frames++<5000)controller.tick(rate/60);assert.equal(await done,true);const p=c.NativeRails.position(114,route.exit.line,route.exit.front);assert.ok(Math.hypot(hero.x+16-p.x,hero.y+16-p.z)<1e-7,'Gate'+route.gate+' overshot its native exit');assert.equal(n.brycenIceRide,undefined);}
});
test('native first ramp exits on the11,58 arrest stone; every route has a solid exit followed by blocked rail padding',()=>{
 const first=routes.entries[0],p=c.NativeRails.position(114,first.exit.line,first.exit.front);assert.deepEqual([p.x,p.height,p.z],[11.5,0,58.5]);
 for(const route of [...routes.entries,...routes.automatic]){const l=table.lines[route.exit.line],center=Math.floor(l.tiles.width/2),at=f=>l.tiles.values[f*l.tiles.width+center];assert.equal(at(route.exit.front)&65535,163);assert.equal(at(route.exit.front)&0x10000,0);assert.ok(at(route.exit.front+1)&0x10000);}
});

test('an accepted bridge alignment saves and resumes its exact sloping approach without rejecting the height offset',async()=>{
 const native={zone:114,fieldHeight:2.9},hero={x:28.9-16,y:48.5-16},puzzle=makePuzzle({data,state:()=>native}),controller=make({routes,table,rails:c.NativeRails,puzzle,state:()=>native,hero:()=>hero});
 const pending=controller.startAutomatic(6,3);assert.ok(pending);const saved=JSON.parse(JSON.stringify({native,hero}));controller.cancel();await pending;
 const p=makePuzzle({data,state:()=>saved.native}),resumed=make({routes,table,rails:c.NativeRails,puzzle:p,state:()=>saved.native,hero:()=>saved.hero}),before={...saved.hero};assert.equal(resumed.restore(),true);assert.deepEqual(saved.hero,before);assert.equal(saved.native.fieldHeight,2.9);while(resumed.busy)resumed.tick(1/60);assert.ok(Math.abs(saved.hero.x-(45.5-16))<1e-7);assert.equal(saved.native.fieldHeight,3);
});
