const {test} = require('node:test');
const assert = require('node:assert/strict');
const Journey = require('../src/journey-state.js');
const memory = () => {const values=new Map();return {getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};};
test('legacy exploration imports without fictional story progress and preserves the old record', () => {
  const storage=memory();
  const legacy={...Journey.fresh(),version:1,visits:{Belle:true,Komor:true},complete:true,starter:'Oshawott',player:{x:2,y:-4},hp:12};
  const original=JSON.stringify(legacy);
  storage.setItem(Journey.LEGACY_KEY,original);
  const {state,restored}=Journey.read(storage);
  assert.equal(restored,true);assert.equal(state.version,2);assert.equal(state.starter,'Oshawott');
  assert.deepEqual(state.player,legacy.player);assert.equal(state.hp,12);
  assert.equal('visits' in state,false);assert.equal('complete' in state,false);
  assert.equal(Journey.write(storage,state),true);
  assert.equal(storage.getItem(Journey.LEGACY_KEY),original);
  state.starter='Tepig';Journey.write(storage,state);
  assert.equal(Journey.read(storage).state.starter,'Tepig');
});
test('save round trip keeps position, starter, HP, PP and preferences', () => {
  const storage=memory(),s=Journey.fresh();
  Object.assign(s,{player:{x:2.1,y:-4},facing:9,starter:'Tepig',hp:12,status:'par',pp:[{id:33,left:8}],potions:1,zoom:1.7,cinema:false,touch:true});
  assert.equal(Journey.write(storage,s),true);
  const result=Journey.read(storage);assert.equal(result.restored,true);assert.deepEqual(result.state,s);
});
test('empty, corrupt, unavailable and future saves recover safely', () => {
  assert.equal(Journey.read(memory()).restored,false);
  assert.equal(Journey.read({getItem:()=>'{bad'}).error,'invalid');
  assert.equal(Journey.read({getItem:()=>'{"version":42}'}).error,'invalid');
  assert.equal(Journey.read(null).error,'unavailable');
  assert.equal(Journey.write({setItem(){throw Error('quota')}},Journey.fresh()),false);
});
test('malformed saved values are bounded and removed story fields cannot return', () => {
  const s=Journey.normalize({version:1,starter:'<script>',player:{x:Infinity,y:-100},hp:-2,
    status:'anything',facing:99,complete:true,visits:{Belle:'yes',Komor:true},zoom:20,
    pp:[null,{id:33,left:-7},{id:'x',left:1}],potions:10});
  assert.equal(s.starter,'Snivy');assert.equal(s.player.x,-2);assert.equal(s.player.y,-25.3);
  assert.equal('complete' in s,false);assert.equal('visits' in s,false);assert.equal(s.facing,3);assert.equal(s.hp,0);
  assert.equal(s.zoom,2);assert.equal(s.potions,3);assert.deepEqual(s.pp,[{id:33,left:0}]);
});
