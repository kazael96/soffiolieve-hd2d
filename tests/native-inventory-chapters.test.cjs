const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync('src/native-ui.js','utf8');
test('field bag includes retained items from every loaded chapter without duplicate quantities',()=>{
 const start=source.indexOf('  function inventory('),end=source.indexOf('  let fieldBagReady',start),counts={4:3,13:2,10:1,15:4,146:1,406:1,394:1,409:1};
 const c={Journey:{state:{original:{}},itemCount:id=>counts[id]||0},MISTRALTON_DATA:{itemPockets:{13:0,394:2}},ICIRRUS_DATA:{itemPockets:{394:2}},OPELUCID_DATA:{itemPockets:{10:0,15:0,146:0,406:2}},LEAGUE_DATA:{itemPockets:{409:2,394:2}}};c.root=c;c.window=c;vm.createContext(c);vm.runInContext(source.slice(start,end)+';this.inventory=inventory;',c);
 assert.deepEqual(Array.from(c.inventory(0),i=>[i.id,i.count]),[[4,3],[13,2],[10,1],[15,4],[146,1]]);assert.deepEqual(Array.from(c.inventory(2),i=>i.id),[394,406,409]);
 delete c.MISTRALTON_DATA;assert.ok(c.inventory(0).some(i=>i.id===146));assert.deepEqual(Array.from(c.inventory(99)),[]);
});
test('a new chapter TM opens party selection and delegates to the existing teaching operation',async()=>{
 const start=source.indexOf('  function useItem('),end=source.indexOf('  function discard(',start);let selected,taught=0;
 const c={TRAINING_DATA:{machines:{406:524}},MISTRALTON_DATA:{machines:{}},Journey:{teachMachine:async(id,index)=>{assert.equal(id,406);assert.equal(index,0);taught++;return true;}},team:options=>{selected=options;},external:fn=>fn(),bag(){},notice(){}};c.root=c;c.window=c;vm.createContext(c);vm.runInContext(source.slice(start,end)+';this.use=useItem;',c);
 c.use(406,2);assert.ok(selected,'New TM must reach party selection');await selected.select(0);assert.equal(taught,1);
});
