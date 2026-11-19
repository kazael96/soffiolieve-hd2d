const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),S=require('../src/story-state.js');
const source=fs.readFileSync(require.resolve('../src/save-slots.js'),'utf8'),SESSION='soffiolieve-save-slot-v1';
function memory(map=new Map()){return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),map};}
function boot(local=memory(),session=memory()){
 const c={sessionStorage:session,StoryState:S};c.window=c;vm.createContext(c);vm.runInContext(source,c);return {c,slots:c.SaveSlots,storage:c.SaveSlots.wrap(local),local,session};
}
test('three adventures survive independent writes, reopening and deletion; slot1 preserves legacy bytes',()=>{
 const local=memory(),session=memory(),old={...S.fresh(),playerName:'ABCDEFGHIJ',money:1200,introductionComplete:true};
 local.setItem(S.KEY,JSON.stringify(old));const first=boot(local,session);assert.equal(first.slots.active,1);assert.equal(S.read(first.storage).playerName,old.playerName);assert.equal(local.getItem(S.KEY),JSON.stringify(old));
 for(const slot of [2,3]){assert.equal(first.slots.select(slot),true);const b=boot(local,session);assert.equal(b.slots.active,slot);assert.equal(b.slots.consumeMenu(),true);assert.equal(b.slots.consumeMenu(),false);const s=S.read(b.storage);s.playerName='Partita'+slot;s.playerGender=slot===2?'F':'M';s.money=slot*1000;s.player={x:slot,y:-slot};assert.equal(S.write(b.storage,s),true);}
 for(const slot of [1,2,3]){first.slots.select(slot);const b=boot(local,session),s=S.read(b.storage);assert.equal(s.playerName,slot===1?old.playerName:'Partita'+slot);assert.equal(s.money,slot===1?1200:slot*1000);if(slot!==1)assert.deepEqual(s.player,{x:slot,y:-slot});}
 first.slots.select(2);const b=boot(local,session);S.read(b.storage);const one=local.getItem(S.KEY),three=local.getItem(b.slots.key(3));assert.equal(S.erase(b.storage),true);assert.equal(local.getItem(b.slots.key()),null);assert.equal(local.getItem(S.KEY),one);assert.equal(local.getItem(b.slots.key(3)),three);
});
test('slot choice is per tab, frozen for current gameplay and never writes local progress',()=>{
 const local=memory(),b=boot(local);const before=JSON.stringify([...local.map]);assert.equal(b.slots.select(3),true);assert.equal(b.slots.active,1);assert.equal(b.slots.key(),S.KEY);assert.equal(JSON.stringify([...local.map]),before);assert.equal(boot(local).slots.active,1);assert.equal(boot(local,b.session).slots.active,3);
});
test('invalid indices and malformed session tokens cannot address arbitrary storage keys',()=>{
 for(const slot of [0,4,-1,1.5,'2',null,NaN]){const b=boot();assert.equal(b.slots.select(slot),false);assert.throws(()=>b.slots.key(slot));assert.equal(b.session.map.size,0);}
 for(const raw of ['broken','null','{}','{"slot":4}','{"slot":"2"}']){const s=memory();s.setItem(SESSION,raw);assert.equal(boot(memory(),s).slots.active,1);}
});
test('unreadable initial save stays protected if the storage permission later recovers',()=>{
 const local=memory();local.setItem(S.KEY,'original');let denied=true;const read=local.getItem;local.getItem=k=>{if(denied&&k===S.KEY)throw Error('denied');return read(k);};const b=boot(local);S.read(b.storage);denied=false;assert.equal(S.write(b.storage,S.fresh()),false);assert.equal(S.erase(b.storage),false);assert.equal(b.slots.blocked,true);assert.equal(local.getItem(S.KEY),'original');
});
test('stale tab cannot overwrite or erase a changed save; unrelated slots and preferences stay writable',()=>{
 const local=memory(),a=boot(local),b=boot(local);S.read(a.storage);S.read(b.storage);const newer={...S.fresh(),playerName:'Nuovo'};assert.equal(S.write(a.storage,newer),true);const raw=local.getItem(S.KEY);assert.equal(S.write(b.storage,S.fresh()),false);assert.equal(S.erase(b.storage),false);assert.equal(b.slots.problem,'changed');assert.equal(local.getItem(S.KEY),raw);
 b.storage.setItem('settings','4');assert.equal(local.getItem('settings'),'4');a.slots.select(2);const other=boot(local,a.session);S.read(other.storage);assert.equal(S.write(other.storage,S.fresh()),true);assert.equal(local.getItem(S.KEY),raw);
});
test('quota failure and silent deletion failure never report successful persistence',()=>{
 const local=memory(),b=boot(local);S.read(b.storage);local.setItem=()=>{throw Error('quota');};assert.equal(S.write(b.storage,S.fresh()),false);assert.equal(local.getItem(S.KEY),null);
 const l=memory();l.setItem(S.KEY,JSON.stringify(S.fresh()));const c=boot(l);S.read(c.storage);l.removeItem=()=>{};assert.equal(S.erase(c.storage),false);assert.ok(l.getItem(S.KEY));
});
test('denied session selection preserves active slot and all three local records',()=>{
 const local=memory(),session={getItem(){return null;},setItem(){throw Error('denied');}},b=boot(local,session);for(const n of [1,2,3])local.setItem(b.slots.key(n),'original'+n);const before=JSON.stringify([...local.map]);assert.equal(b.slots.select(2),false);assert.equal(b.slots.active,1);assert.equal(JSON.stringify([...local.map]),before);
});
test('title reads chosen slot only, damaged records remain isolated, restart handoff belongs to that slot',()=>{
 const b=boot();b.slots.select(3);const c=boot(b.local,b.session);vm.runInContext(fs.readFileSync(require.resolve('../src/game-start.js'),'utf8'),c.c);
 c.local.setItem(S.KEY,'broken');c.local.setItem(c.slots.key(),JSON.stringify({...S.fresh(),playerName:'Terza'}));assert.equal(c.c.GameStart.read(c.local).state.playerName,'Terza');assert.equal(c.c.GameStart.read(c.local,1).kind,'damaged');assert.equal(c.c.GameStart.prepareRestart(),true);assert.equal(c.session.getItem('soffiolieve-start-new-once'),'3');assert.equal(c.c.GameStart.consumeRestart(),true);assert.equal(c.c.GameStart.consumeRestart(),false);assert.equal(c.local.getItem(S.KEY),'broken');
});
