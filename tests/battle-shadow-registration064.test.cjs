'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../src/game.js'),'utf8').split(/\r?\n/).find(s=>s.startsWith('function combatant('));
assert.ok(source,'Actual combatant renderer must exist');
function draw(pose){
 const calls=[],ctx={globalAlpha:1,save(){},restore(){},translate(){},rotate(){},scale(){}};
 const window={GameSpeed:{now:()=>0},MoveFX:{pose:()=>pose,idleTick:()=>0,active:{}},PokemonVisuals:{graphic:()=>500}};
 const support={x:100,y:180,size:2,height:160};
 const host={window,performance:{now:()=>0},visualState:{p1:{idleClock:0,idleUpdated:0}},arena:{width:500,height:325},partner:{name:'Emboar'},enemy:{name:'Snivy'},BattleGround:{shadow:(c,a,options)=>calls.push(options)},monster(){}};
 window.MoveFX.visualState=()=>({background:{hideGround:false}});
 vm.runInNewContext(source+';globalThis.drawCombatant=combatant;',host,{filename:'actual-game-combatant.js'});
 host.drawCombatant(ctx,'Emboar',support.x,support.y,support.size,true,'p1',support);
 assert.equal(calls.length,1);
 return calls[0];
}
test('a rolling body can register its shadow to the ground path independently of its rotated native anchor',()=>{
 const result=draw({x:60,y:90,groundY:20,groundX:12,groundLift:0,scale:1,alpha:1,pauseAnimation:true});
 assert.equal(result.offsetX,6,'Shadow follows rotated sprite anchor instead of ground trajectory');
 assert.equal(result.offsetY,10);assert.equal(result.lift,0);
});
test('the explicit airborne height controls shadow fading without using rotation compensation as jump height',()=>{
 const result=draw({x:-70,y:-90,groundY:0,groundX:0,groundLift:14,scale:1,alpha:1,pauseAnimation:true});
 assert.equal(result.offsetX,0,'An explicit zero ground position must be retained');
 assert.equal(result.lift,7,'Native anchor movement must not become false jump height');
 assert.equal(draw({x:5,y:5,groundLift:-10,alpha:1}).lift,0);
});
test('all poses without finite explicit overrides retain the previous shadow placement, fading and scale',()=>{
 let count=0;
 for(const x of [-80,0,30])for(const y of [-55,0,45])for(const groundY of [-15,0,20])for(const scale of [.7,1,1.3])for(const invalid of [undefined,NaN,Infinity]){
  const pose={x,y,groundY,scale,alpha:1,pauseAnimation:true,groundX:invalid,groundLift:invalid},result=draw(pose);
  assert.equal(result.offsetX,x*.5);assert.equal(result.offsetY,groundY*.5);
  assert.equal(result.lift,Math.max(0,(groundY-y)*.5));assert.equal(result.scale,Math.min(1,scale));
  count++;
 }
 assert.equal(count,243);
});
