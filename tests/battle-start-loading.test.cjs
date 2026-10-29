const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function environment(){let resolve,reject;const loading=new Promise((a,b)=>{resolve=a;reject=b}),elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{hidden:true,style:{},dataset:{},innerHTML:''});return elements.get(id);};
 const c={console,renderer:{scene:{permissionGrids:[]}},player:{x:0,y:0},partner:{name:'Snivy',hp:20,level:8,moves:[]},potions:2,rival:'Belle',battling:false,busy:false,finished:false,visualState:{},BattleLocation:{capture:()=>Object.freeze({id:'bedroomMess'}),tile:()=> 'path'},BattleEnvironment:{set(){},prepare:()=>loading},Journey:{state:{scene:'bedroom'},outdoor:{permissionGrids:[]},save(){}},document:{getElementById:element},$:element,resetInput(){},configureOpeningBattle(){},log(){},updateBattle(){assert.ok(c.enemy);},snapshotPartner(){c.partner={name:'Snivy',spriteId:495,moves:[]};c.enemy={name:'Oshawott',spriteId:501,moves:[]};},GEN5:{Session:class{constructor(){this.battle={ended:false,log:[]};}logs(){return [];}}}};
 c.window=c;vm.createContext(c);const source=fs.readFileSync(require.resolve('../src/battle-ui.js'),'utf8');vm.runInContext(source.match(/async function startBattle[^\n]+/)[0],c);return{c,resolve,reject,element};
}
test('cold battle load initializes both combatants before yielding and reveals only the prepared field',async()=>{
 const {c,resolve,element}=environment(),pending=c.startBattle(true,{p1:[{}],p2:[{}]});assert.equal(c.battling,true);assert.equal(c.busy,true);assert.equal(c.enemy.name,'Oshawott');assert.equal(element('battle').hidden,true);resolve();await pending;assert.equal(element('battle').hidden,false);assert.equal(c.busy,false);
});
test('failed environment loading releases the battle lock instead of leaving a hidden active battle',async()=>{
 const {c,reject,element}=environment(),pending=c.startBattle(true,{p1:[{}],p2:[{}]});reject(Error('Texture missing'));await assert.rejects(pending,/Texture missing/);assert.equal(c.battling,false);assert.equal(c.busy,false);assert.equal(c.session,null);assert.equal(element('battle').hidden,true);
});
