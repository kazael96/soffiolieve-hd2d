const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),StoryState=require('../src/story-state.js');
function host(){const records=new Map(),session=new Map(),c={StoryState,sessionStorage:{setItem:(k,v)=>session.set(k,v),getItem:k=>session.get(k)||null,removeItem:k=>session.delete(k)}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../src/game-start.js'),'utf8'),c);return {c,records,session,storage:{getItem:k=>records.has(k)?records.get(k):null,setItem:(k,v)=>records.set(k,v)}};}
test('title distinguishes missing, valid legacy, corrupt and unavailable saves without changing any bytes',()=>{
 const {c,records,storage}=host(),G=c.GameStart;
 assert.equal(G.read(storage).kind,'empty');
 const s=StoryState.fresh();delete s.playerGender;delete s.introductionComplete;s.playerName='ABCDEFGHIJ';
 const raw=JSON.stringify(s);records.set(StoryState.KEY,raw);
 const saved=G.read(storage);assert.equal(saved.kind,'saved');assert.equal(saved.state.playerName,'ABCDEFGHIJ');assert.equal(saved.state.introductionComplete,true);assert.equal(records.get(StoryState.KEY),raw);
 for(const bad of ['{broken','{}','null',JSON.stringify({...s,version:9}),JSON.stringify({...s,phase:'unknown'})]){records.set(StoryState.KEY,bad);assert.equal(G.read(storage).kind,'damaged');assert.equal(G.read(storage).hasData,true);assert.equal(records.get(StoryState.KEY),bad);}
 assert.equal(G.read({getItem(){throw Error('denied')}}).kind,'unavailable');assert.equal(G.read(null).kind,'unavailable');
});
test('continue summary preserves long trainer names, native badges, dex and play time',()=>{
 const {c}=host(),s={...StoryState.fresh(),playerName:'ABCDEFGHIJ',trainer:{playSeconds:3600*42+60*8+59},original:{badges:[0,1,2]},dex:{caught:['Snivy','Patrat']}};
 const before=JSON.stringify(s),data=c.GameStart.summary(s);assert.equal(data.name,'ABCDEFGHIJ');assert.equal(data.badges,3);assert.equal(data.caught,2);assert.equal(data.time,'42:08');assert.equal(JSON.stringify(s),before);
});
test('new-game restart handoff is one-use, session-only and does not erase saved progress',()=>{
 const {c,records,storage,session}=host();storage.setItem(StoryState.KEY,'precious progress');
 assert.equal(c.GameStart.prepareRestart(),true);assert.equal(session.size,1);assert.equal(records.get(StoryState.KEY),'precious progress');assert.equal(c.GameStart.consumeRestart(),true);assert.equal(c.GameStart.consumeRestart(),false);assert.equal(session.size,0);
 c.sessionStorage={setItem(){throw Error('denied')},getItem(){throw Error('denied')},removeItem(){throw Error('denied')}};
 assert.equal(c.GameStart.prepareRestart(),false);assert.equal(c.GameStart.consumeRestart(),false);assert.equal(records.get(StoryState.KEY),'precious progress');
});
test('boot lock prevents actual interval/pagehide save from overwriting an unselected continue slot',()=>{
 const source=fs.readFileSync(require.resolve('../src/story.js'),'utf8'),snippet=source.slice(source.indexOf('  function save('),source.indexOf('  function setScene('));
 const c={window:{GameStart:{pending:true}},restarting:false,processing:false};vm.createContext(c);vm.runInContext(snippet,c);assert.equal(c.save(true),false);assert.equal(c.save(),false);c.window.GameStart={pending:false,savingBlocked:true};assert.equal(c.save(true),false);
});
test('isolated species studio does not open title or touch real storage',async()=>{const {c}=host();c.SpeciesStudioMode=true;c.localStorage={getItem(){throw Error('must not read')}};assert.equal(await c.GameStart.start(),false);assert.equal(c.GameStart.pending,false);});
