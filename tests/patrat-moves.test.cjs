const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../src/patrat-moves.js'),S=require('../src/species-moves.js');
const layout={p1:{x:300,y:380,height:150,w:1000,h:475},p2:{x:640,y:285,height:110,w:1000,h:475}},all=[P.profiles[33],P.profiles[43],P.profiles[44],...Object.values(P.bide)];
test('Patrat coverage includes four level-10 pairs and three distinct Bide phases',()=>{
 assert.deepEqual(Object.keys(P.profiles).map(Number).sort((a,b)=>a-b),[33,43,44,117]);for(const p of Object.values(P.profiles)){assert.equal(S.select(504,p.id),p);assert.equal(S.select(572,p.id),null);assert.ok(Object.isFrozen(p));}
 assert.equal(S.select(504,117,{phase:1}),P.bide.release);assert.equal(S.select(504,117,{storing:true}),P.bide.store);assert.equal(P.bide.prepare.phase,0);assert.equal(P.bide.release.phase,1);
});
test('Patrat poses remain finite throughout all phases, return to rest and lean into contact',()=>{
 for(const p of all)for(const side of ['p1','p2']){const a=S.sample(p,p.impact,side);for(const back of [false,true])assert.ok(Object.values(P.tracks[back?'back':'front']).flat().some(i=>Math.abs(S.part(i,back,a)?.rotation||0)>.03));
  for(let f=0;f<=p.frames;f++)for(const miss of [true,false]){const q=S.pose(p,f,side,side,miss,layout);for(const k of ['x','y','groundY','scale','rotation'])assert.ok(Number.isFinite(q[k]));assert.ok(q.scale>0&&q.scaleX>0&&q.scaleY>0);}
  const q=S.pose(p,p.frames,side,side,false,layout);assert.ok(Math.abs(q.x)+Math.abs(q.y)+Math.abs(q.rotation)<1e-8);for(const i of Object.values(P.tracks.front).flat())assert.ok(Math.abs(S.part(i,false,S.sample(p,p.frames,side))?.rotation||0)<1e-8);
  if([33,44].includes(p.id))assert.ok(Math.sin(S.pose(p,p.impact,side,side,false,layout).rotation)*(side==='p1'?1:-1)>0);
 }
});
test('Patrat tail segments and raised hand follow their parent pivot; incisors follow the head',()=>{
 for(const p of all)for(const back of [true,false])for(let f=0;f<=p.frames;f+=3){const a=P.sample(p,f),m=P.tracks[back?'back':'front'];assert.deepEqual(P.part(m.tail[0],back,a),P.part(m.tail[1],back,a));assert.equal(P.part(m.raisedArm[0],back,a).rotation,P.part(m.raisedArm[1],back,a).rotation);}
 const open=P.sample(P.profiles[44],45),closed=P.sample(P.profiles[44],80);assert.equal(P.part(0,false,open).rotation,P.part(1,false,open).rotation);assert.ok(P.part(1,false,open).y>P.part(1,false,closed).y);assert.deepEqual([P.part(4,false,open).pivotX,P.part(4,false,open).pivotY],[12,12]);
});
test('Patrat status and Bide accumulation never recoil a target; misses suppress every impact',()=>{
 for(const p of all)for(let f=0;f<=p.frames;f++)for(const miss of [true,false])if(miss||p.id===43||p.id===117&&p.phase!==1){const q=S.pose(p,f,'p2','p1',miss,layout);assert.ok(Math.abs(q.x)===0);assert.ok(Math.abs(q.rotation)===0);}
 assert.ok(S.pose(P.bide.release,72,'p2','p1',false,layout).x>0);assert.ok(P.sample(P.profiles[44],60,'p1',true).reach<P.sample(P.profiles[44],60,'p1',false).reach);
});
test('Bide protocol selects storage and release, respects failure boundaries and ignores silent cleanup',()=>{
 const e=(kind,args)=>({kind,args});assert.deepEqual(P.bideEvent([e('-activate',['move: Bide'])],0),{phase:0,storing:true,miss:false});
 assert.deepEqual(P.bideEvent([e('-end',['move: Bide']),e('-damage',['0 fnt'])],0),{phase:1,storing:false,miss:false});
 assert.equal(P.bideEvent([e('-end',['move: Bide']),e('-fail',[])],0).miss,true);assert.equal(P.bideEvent([e('-end',['move: Bide']),e('move',[]),e('-fail',[])],0).miss,false);
 assert.equal(P.bideEvent([e('-end',['move: Bide','[silent]'])],0),null);assert.equal(P.bideEvent([e('-activate',['Snatch'])],0),null);
});
test('Bide holds Patrat between turns, yields to its own action, and clears without affecting another species',()=>{
 P.clearStances();P.setStance('p1',true,504);assert.equal(P.idlePose('p1',506),null);assert.equal(P.idlePose('p2',504),null);assert.equal(P.idlePose('p1',504).kind,'store');const base={x:4,y:0,scaleY:1,alpha:1};assert.ok(P.applyStance('p1',base).scaleY<1);assert.equal(P.applyStance('p1',base,true),base);
 const settings=global.NativeSettings;global.NativeSettings={state:{animations:false}};assert.equal(P.idlePose('p1',504),null);global.NativeSettings=settings;
 P.setStance('p1',false);assert.equal(P.idlePose('p1',504),null);P.setStance('p1',true,506);assert.equal(P.idlePose('p1',504),null);P.setStance('p2',true);P.clearStances();assert.equal(P.idlePose('p2',504),null);
});
test('Bide preparation leaves room for original pitch control; storage introduces no repeated sound',()=>{
 const sequence={frames:191,audio:[{kind:'sfx',target:14,start:24,id:1418},{kind:'control',start:24,raw:[1,0,0,1000,5000,20,100,0,0]}]};const prep=S.timeline(sequence,P.bide.prepare);assert.equal(prep.audio[0].start,48);assert.deepEqual(prep.audio[1].raw,sequence.audio[1].raw);assert.ok(prep.audio[1].start+20+101<prep.frames);assert.deepEqual(S.timeline(sequence,P.bide.store).audio,[]);
});
test('MoveFX selects Patrat phases from runtime context and the laboratory variant selector',async()=>{
 const window={},c={window,Image:class{},setTimeout,clearTimeout,performance};vm.createContext(c);for(const file of ['species-moves','patrat-moves','battle-context'])vm.runInContext(fs.readFileSync(require.resolve('../src/'+file+'.js'),'utf8'),c);c.SpeciesMoves=window.SpeciesMoves;
 window.ROM_MOVE_FX={moves:Object.fromEntries([33,43,44,117].map(id=>[id,{id,phaseMap:id===117?[0,1]:[0],variants:[{commands:[]},{commands:[]}]}])),spas:{}};vm.runInContext(fs.readFileSync(require.resolve('../src/move-fx.js'),'utf8'),c);
 for(const side of ['p1','p2'])for(const [context,kind]of [[{phase:0},'prepare'],[{storing:true},'store'],[{phase:1},'release']]){await window.MoveFX.preview(117,side,0,{cryIds:{p1:504,p2:504},context});assert.equal(window.MoveFX.active.profile.kind,kind);assert.equal(window.MoveFX.speciesPose(side,504).species,504);}
 await window.MoveFX.preview(117,'p1',1,{cryIds:{p1:504,p2:504}});assert.equal(window.MoveFX.active.profile.kind,'release');window.MoveFX.cancel();
});
test('battle adapter plays Bide start, holding and a failed release once, with stance cleanup',async()=>{
 const calls=[],stance=[],elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);};
 const c={window:null,console,performance,escapedBattle:false,partner:{spriteId:504},enemy:{spriteId:504},visualState:{p1:{},p2:{}},BATTLE_EVENTS:require('../src/battle-events.js'),GEN5:{byMoveKey:{bide:{id:117,name:'Pazienza'}},dex:{moves:{get:()=>({id:'bide',flags:{}})}}},$:element,nativeBattleMessage:()=>null,log(){},moveVisualContext:()=>({phase:0}),playNativeMove:async(id,side,options)=>calls.push({id,side,options}),animationPause:async()=>{},repaintCards(){},MoveFX:{},PatratMoves:{...P,setStance(side,on,id){stance.push([side,on,id]);P.setStance(side,on,id);}}};c.window=c;vm.createContext(c);const source=fs.readFileSync(require.resolve('../src/battle-ui.js'),'utf8');vm.runInContext(source.slice(source.indexOf('async function playBattleEvents('),source.indexOf("$('animationSpeed')")),c);
 await c.playBattleEvents(['|move|p1a: Patrat|Bide|p1a: Patrat','|-start|p1a: Patrat|move: Bide','|turn|2','|-activate|p1a: Patrat|move: Bide','|turn|3','|-end|p1a: Patrat|move: Bide','|-fail|p1a: Patrat','|-end|p1a: Patrat|move: Bide|[silent]']);
 assert.equal(calls.length,3);assert.equal(calls[0].options.context.phase,0);assert.equal(calls[1].options.context.storing,true);assert.equal(calls[2].options.context.phase,1);assert.equal(calls[2].options.miss,true);assert.equal(P.idlePose('p1',504),null);assert.equal(c.visualState.p1.attacking,false);assert.ok(stance.some(v=>v[1]));P.clearStances();
});
