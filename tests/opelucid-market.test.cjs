const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){const c={};c.window=c;vm.createContext(c);for(const file of ['opelucid-data','mistralton-services'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);c.NativeStory={state:{zone:122}};c.OpelucidChapter={zones:[122]};return c;}
test('both native Opelucid clerks have complete catalogues, including fixed stock8 from overlay21 table14',()=>{
 const c=fixture(),d=c.OPELUCID_DATA;assert.deepEqual(Array.from(c.MistraltonServices.stock(8,[0,1,2,3,4,5,6])),[13,10,15,146,137,138,139,140,141,142,143]);
 for(const id of c.MistraltonServices.stock(8)){assert.ok(d.itemNames[id]);assert.ok(d.itemDescriptions[id]);assert.ok(d.itemPrices[id]>0);assert.ok(Number.isInteger(d.itemPockets[id]));}
 assert.ok(c.MistraltonServices.stock(255,[0,1,2,3,4,5,6]).includes(4));
});
test('the second clerk charges and delivers each newly reachable ball and Mail exactly once',()=>{
 const c=fixture(),d=c.OPELUCID_DATA,counts=new Map(),j={state:{money:10000,original:{badges:[0,1,2,3,4,5,6]}},itemCount:id=>counts.get(id)||0,addItem(id,n){counts.set(id,this.itemCount(id)+n);return true;},update(){},save(){}};
 for(const id of [10,15,146]){const before=j.state.money,result=c.MistraltonServices.purchase(j,id,1,8);assert.equal(result.ok,true);assert.equal(j.itemCount(id),1);assert.equal(j.state.money,before-d.itemPrices[id]);}
});

test('the native Center counter sells Timer Ball through the real script and keeps new held items in saves',async()=>{
 const path=require('node:path'),old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||'../fidelity-build-051-opelucid-next';const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
 const c=environment({opelucid:true,sourceRoot:path.resolve('src')}),n=c.NativeStory.state,j=c.Journey;
 Object.assign(n,{intro:true,initialized:true,badges:[0,1,2,3,4,5,6]});Object.assign(n.vars,{16541:2,16543:1,16548:1,16552:4,16530:6,16551:9});
 j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Serperior',39),c.OPENING_DATA.Serperior.growth[39])];j.state.money=10000;j.displayPartner();await drain(c,c.NativeStory.changeZone(122,9,18));
 let menus=0;c.testChoice=labels=>{if(labels.length===3&&labels.some(s=>/Vendi/.test(s)))return menus++?2:0;const wanted=labels.findIndex(s=>s.includes(c.OPELUCID_DATA.itemNames[10])&&s.includes('₽'));return wanted>=0?wanted:0;};
 c.facing=9;await drain(c,c.NativeStory.interact());assert.equal(n.zone,122);assert.equal(j.itemCount(10),1);assert.equal(j.state.money,10000-c.OPELUCID_DATA.itemPrices[10]);assert.equal(c.NativeStory.locked,false);
 assert.equal(j.giveItem(10,0),true);assert.equal(c.StoryState.normalize(JSON.parse(JSON.stringify(j.state))).party[0].heldItem,10);assert.equal(j.takeItem(0),10);
 assert.equal(j.addItem(15),true);assert.equal(j.giveItem(15,0),true);assert.equal(c.StoryState.normalize(JSON.parse(JSON.stringify(j.state))).party[0].heldItem,15);
});
