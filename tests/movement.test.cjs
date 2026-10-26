const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const Input=require('../src/input.js');
const source=fs.readFileSync(path.join(__dirname,'../src/game.js'),'utf8');
const code=source.slice(source.indexOf('function frame(now)'),source.indexOf('}refresh();requestAnimationFrame(frame)')+1);
function frame(keys,{battling=false,modal=false,blocked=()=>false}={}){
  const state={Math,last:0,t:0,cooldown:0,moving:false,facing:3,keys:{},controls:{state:()=>keys},
    player:{x:-2,y:0},steps:0,battling,menuOpen:()=>modal,blocked,document:{querySelector:()=>modal?{}:null},renderer:{ready:true},worldDraws:0,drawWorld(){state.worldDraws++;},drawArena(){},
    window:{Journey:{step(dt,moved,distance){state.travel=distance;}}},requestAnimationFrame(){},startBattle(){throw Error('unexpected battle')}};
  vm.runInNewContext(code+';frame(40)',state);return state;
}
test('72 movement cases keep the correct facing, speed and normalized diagonals',()=>{
  let count=0;
  for(const kind of ['keyboard','arrows','touch','combined'])for(const run of [false,true])
    for(const [dx,dy] of [[0,0],[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]]){
      const input=Input.create();let pointer=0;
      for(const [active,code,key,arrow] of [[dx<0,'KeyA','a','ArrowLeft'],[dx>0,'KeyD','d','ArrowRight'],[dy<0,'KeyW','w','ArrowUp'],[dy>0,'KeyS','s','ArrowDown']]){
        if(!active)continue;
        if(kind==='keyboard'||kind==='combined')input.keyDown({code,key:run?key.toUpperCase():key});
        if(kind==='arrows')input.keyDown({code:arrow,key:arrow});
        if(kind==='touch'||kind==='combined')input.pointerDown(++pointer,arrow);
      }
      if(run){if(kind==='touch')input.pointerDown(99,'Shift');else input.keyDown({code:'ShiftLeft',key:'Shift'});}
      const state=frame(input.state());
      assert.equal(state.facing,dy<0?0:dy>0?3:dx<0?6:dx>0?9:3);
      assert.equal(state.moving,!!(dx||dy));
      assert.equal(state.travel,Math.hypot(state.player.x+2,state.player.y));
      assert.ok(Math.abs(Math.hypot(state.player.x+2,state.player.y)-(dx||dy?(run?6.5:3.5)*.04:0))<1e-12);
      count++;
    }
  assert.equal(count,72);
});
test('collisions stop walking animation, and modals/battles stop displacement',()=>{
  for(const options of [{blocked:()=>true},{modal:true},{battling:true}]){
    const state=frame({d:true},options);assert.equal(state.player.x,-2);assert.equal(state.player.y,0);assert.equal(state.moving,false);
  }
  assert.equal(frame({a:true,d:true}).moving,false);
  assert.equal(frame({}, {modal:true}).worldDraws,0,'Native menus preserve the paused field frame');
  assert.equal(frame({}, {battling:true}).worldDraws,0,'Battles do not redraw the hidden field');
  assert.equal(frame({}).worldDraws,1);
});
