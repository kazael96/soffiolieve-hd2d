const {test} = require('node:test');
const assert = require('node:assert/strict');
const Journey = require('../src/journey-state.js');
const memory = () => {const values=new Map();return {getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};};
test('the chapter ends only at Aralia after both friends, in either order', () => {
  for(const order of [['Belle','Komor'],['Komor','Belle']]){
    const s=Journey.fresh();Journey.meet(s,'Aralia');assert.equal(s.complete,false);
    for(const name of order)Journey.meet(s,name);
    assert.equal(s.complete,false);assert.match(Journey.objective(s),/Aralia/);
    Journey.meet(s,'Aralia');assert.equal(s.complete,true);
    Journey.meet(s,'Belle');assert.equal(s.complete,true);
  }
});
test('save round trip keeps position, starter, HP, PP and preferences', () => {
  const storage=memory(),s=Journey.fresh();
  Object.assign(s,{player:{x:2.1,y:-4},facing:9,starter:'Tepig',hp:12,status:'par',pp:[{id:33,left:8}],potions:1,zoom:1.7,cinema:false,touch:true});
  Journey.meet(s,'Belle');assert.equal(Journey.write(storage,s),true);
  const result=Journey.read(storage);assert.equal(result.restored,true);assert.deepEqual(result.state,s);
});
test('empty, corrupt, unavailable and future saves recover safely', () => {
  assert.equal(Journey.read(memory()).restored,false);
  assert.equal(Journey.read({getItem:()=>'{bad'}).error,'invalid');
  assert.equal(Journey.read({getItem:()=>'{"version":42}'}).error,'invalid');
  assert.equal(Journey.read(null).error,'unavailable');
  assert.equal(Journey.write({setItem(){throw Error('quota')}},Journey.fresh()),false);
});
test('malformed saved values cannot unlock the chapter or inject arbitrary content', () => {
  const s=Journey.normalize({version:1,starter:'<script>',player:{x:Infinity,y:-100},hp:-2,
    status:'anything',facing:99,complete:true,visits:{Belle:'yes',Komor:true},zoom:20,
    pp:[null,{id:33,left:-7},{id:'x',left:1}],potions:10});
  assert.equal(s.starter,'Snivy');assert.equal(s.player.x,-2);assert.equal(s.player.y,-25.3);
  assert.equal(s.complete,false);assert.equal(s.facing,3);assert.equal(s.hp,0);
  assert.equal(s.zoom,2);assert.equal(s.potions,3);assert.deepEqual(s.pp,[{id:33,left:0}]);
});
