'use strict';
const {repo,sourceRoot,sourcePath,site,fixturePath,readSourceBytes,readFixtureBytes}=require('./helpers/minccino-slap-paths064.cjs');
// Actual UI helper source, explicit synthetic native dialogue/page transport.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const source=fs.readFileSync(sourcePath('battle-ui.js'),'utf8');
const from=source.indexOf('async function showOpeningTrainerHint(){'),to=source.indexOf('\nasync function playNativeMove(',from);assert(from>=0&&to>from);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function host(block=0){const waiting=deferred(),rows=[],hintCalls=[],pages=['first','second','third'],session={openingTrainer:{name:'Old trainer',messages:['old hint']},battle:{ended:false,p2:{pokemon:['old roster']}},trainerHints:new Set()},c={session,OpeningBattleRules:{hint(...args){hintCalls.push(args);return'old text';}},messagePages:()=>pages,NativeStory:{showPage(page,name){rows.push({page,name,owner:c.session});return rows.length===block?waiting.promise:Promise.resolve();}}};c.window=c;vm.createContext(c);vm.runInContext(source.slice(from,to),c,{filename:'battle-ui.js:actual-showOpeningTrainerHint'});return{c,session,rows,hintCalls,pages,waiting};}
for(const blockedPage of[1,2])test('old trainer hint stops after Session replacement at page '+blockedPage,async()=>{
 const h=host(blockedPage),job=h.c.showOpeningTrainerHint();await settle();assert.equal(h.rows.length,blockedPage);const fresh={openingTrainer:{name:'New trainer'},battle:{ended:false},trainerHints:new Set(['new state'])};h.c.session=fresh;h.waiting.resolve();await job;
 assert.equal(h.rows.length,blockedPage,'No old page may be sent through the new Session owner');assert(h.rows.every(row=>row.owner===h.session));assert.deepEqual([...fresh.trainerHints],['new state']);assert.equal(h.hintCalls.length,1);assert.equal(h.hintCalls[0][2],h.session.trainerHints);
});
test('same Session hint preserves every page, trainer and original hint arguments',async()=>{
 const h=host();await h.c.showOpeningTrainerHint();assert.deepEqual(h.rows.map(r=>r.page),h.pages);assert(h.rows.every(r=>r.owner===h.session&&r.name==='Old trainer'));assert.equal(h.hintCalls.length,1);assert.equal(h.hintCalls[0][0],h.session.openingTrainer.messages);assert.equal(h.hintCalls[0][1],h.session.battle.p2.pokemon);assert.equal(h.hintCalls[0][2],h.session.trainerHints);
});
test('same Session dialogue failure propagates once without emitting remaining pages',async()=>{
 const h=host(2),job=h.c.showOpeningTrainerHint(),rejected=assert.rejects(job,/deliberate dialogue failure/);await settle();assert.equal(h.rows.length,2);h.waiting.reject(Error('deliberate dialogue failure'));await rejected;assert.equal(h.rows.length,2);assert.equal(h.c.session,h.session);
});
