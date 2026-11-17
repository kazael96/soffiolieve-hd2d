const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),build=require('../scripts/build-browser-qa.cjs');
const vm=require('node:vm');
const {restartSaveSnapshot,assertRestartCancellation}=require('../scripts/test-introduction-headless.cjs');
test('restart cancellation comparison permits only natural clock progress and actor serialization order',()=>{
 const saved={playerName:'Luca',playerGender:'M',player:{x:1,y:2},trainer:{playSeconds:10,id:7},party:[{id:1,hp:20},{id:2,hp:30}],original:{flags:[1,2],vars:{5:6},actors:{391:[{uid:0,x:1,y:1,extra:{b:2,a:1}},{uid:1,x:2,y:1}]}}},after=structuredClone(saved);after.trainer.playSeconds=11;after.original.actors[391].reverse();after.original.actors[391][1].extra={a:1,b:2};
 const snapshot=state=>({raw:JSON.stringify(state),rawBeforeSave:JSON.stringify(state),name:'Luca',gender:'M',position:{x:1,y:2},rate:1,atMs:1000}),before=snapshot(saved),next={...snapshot(after),atMs:2000};assert.equal(assertRestartCancellation(before,next).semanticEqual,true);assert.equal(saved.trainer.playSeconds,10,'Comparison must not mutate its input');assert.equal(restartSaveSnapshot(next.raw).playSeconds,11);assert.throws(()=>assertRestartCancellation(before,{...next,rawBeforeSave:null}),/storage/);const corrupt=structuredClone(after);corrupt.party[0].hp--;assert.throws(()=>assertRestartCancellation(before,{...next,rawBeforeSave:JSON.stringify(corrupt)}),/persisted/);
 for(const mutate of [s=>s.player.x++,s=>s.original.actors[391][0].x++,s=>s.party[0].hp--,s=>s.playerName='Other',s=>s.playerGender='F',s=>s.party.reverse(),s=>s.original.flags.reverse(),s=>s.original.vars[5]++,s=>s.original.actors[391].push(structuredClone(s.original.actors[391][0])),s=>s.original.actors[391][0].extra={changed:true},s=>s.trainer.id++,s=>s.original.playSeconds=99]){const bad=structuredClone(after);mutate(bad);assert.throws(()=>assertRestartCancellation(before,{...snapshot(bad),atMs:2000}));}
 assert.throws(()=>assertRestartCancellation(before,{...next,position:{x:2,y:2}}));assert.throws(()=>assertRestartCancellation(before,{...next,name:'Other'}));assert.throws(()=>assertRestartCancellation(before,{...next,gender:'F'}));assert.throws(()=>assertRestartCancellation(before,{...next,rate:4}));const reset=structuredClone(after);reset.trainer.playSeconds=9;assert.throws(()=>assertRestartCancellation(before,{...snapshot(reset),atMs:2000}),/reset/);const jump=structuredClone(after);jump.trainer.playSeconds=100;assert.throws(()=>assertRestartCancellation(before,{...snapshot(jump),atMs:2000}),/elapsed/);
});
function fixture(t){const parent=path.resolve(os.tmpdir()),dir=fs.mkdtempSync(path.join(parent,'soffiolieve-qa-'));t.after(()=>{assert.equal(path.dirname(path.resolve(dir)),parent);assert.ok(path.basename(dir).startsWith('soffiolieve-qa-'));fs.rmSync(dir,{recursive:true,force:true});});const site=path.join(dir,'site');fs.mkdirSync(site);const html='<html lang="it"><head><script>window.SpeciesStudioMode=["snivy"].some(x=>false);</script></head><body></body></html>';fs.writeFileSync(path.join(site,'index.html'),html);return {dir,site,html};}
test('browser QA detaches save storage before app initialization and preserves the published index',t=>{const f=fixture(t),out=path.join(f.dir,'qa');build(f.site,out);const html=fs.readFileSync(path.join(out,'index.html'),'utf8');assert.ok(html.includes('window.SpeciesStudioMode=true;'));assert.ok(html.indexOf('DeepQAEarlyErrors')<html.indexOf('window.SpeciesStudioMode'));assert.ok(html.includes('/__qa/browser-qa.js'));assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),f.html);assert.ok(fs.existsSync(path.join(out,'browser-qa.js')));});
test('browser QA refuses to write test controls into the published site',t=>{const f=fixture(t);assert.throws(()=>build(f.site,path.join(f.site,'qa')),/outside/);assert.equal(fs.readdirSync(f.site).length,1);});

test('the full Gym GPU case receives the same expected input route as the field-frame regression',t=>{
 const f=fixture(t),out=path.join(f.dir,'qa');build(f.site,out);const script=fs.readFileSync(path.join(out,'browser-qa.js'),'utf8'),route=JSON.parse(script.match(/const brycenInput051=([\s\S]*?);\s*case049\('qaGymFull051'/)[1]);
 assert.deepEqual(route,require('./fixtures/brycen-input-route.json'));assert.equal(script.includes('/*QA_BRYCEN_INPUT*/null'),false);assert.ok(script.includes("case049('qaGymFull051'"));assert.equal(fs.existsSync(path.join(f.site,'browser-qa.js')),false);
 const html=fs.readFileSync(path.join(out,'index.html'),'utf8'),revision=html.match(/data-qa-fixture="([^"]+)"/)[1];assert.ok(html.includes('/__qa/browser-qa.js?v='+revision),'The transformed input reference must invalidate the browser script cache too');
});
test('an unrecognized startup format fails instead of running tests against real player storage',t=>{const f=fixture(t);fs.writeFileSync(path.join(f.site,'index.html'),'<html><head></head><body></body></html>');const out=path.join(f.dir,'qa');assert.throws(()=>build(f.site,out),/isolation/);assert.equal(fs.existsSync(out),false);});

test('the input health monitor is delivered before the QA driver and never inserted into the release',t=>{
 const f=fixture(t),out=path.join(f.dir,'qa');build(f.site,out);
 const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
 assert.ok(html.indexOf('/__qa/qa-input-health.js')<html.indexOf('/__qa/browser-qa.js'));
 assert.equal(fs.readFileSync(path.join(out,'qa-input-health.js'),'utf8'),fs.readFileSync(path.join(__dirname,'qa-input-health.js'),'utf8'));
 assert.equal(fs.existsSync(path.join(f.site,'qa-input-health.js')),false);
 assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),f.html);
});

test('the explicit Gym052 preview stays inside the QA index, filters future areas, and installs audio after prior catalogs',t=>{
 const f=fixture(t),out=path.join(f.dir,'qa'),preview=require('../scripts/gym-preview052.cjs');
 const html=f.html.replace('</head>','<script src="opelucid-bootstrap.js?v=build"></script><script src="opelucid-audio.js?v=build"></script><script src="training-moves.js?v=build"></script><script src="opelucid-badge-assets.js?v=build"></script><script src="opelucid-battles.js?v=build"></script><script src="opelucid-menu.js?v=build"></script></head>');fs.writeFileSync(path.join(f.site,'index.html'),html);
 const source=fs.readFileSync(path.join(__dirname,'../scripts/gym-preview052.cjs'),'utf8'),names=[...source.matchAll(/'(league-[a-z-]+|trainer-intro-music(?:-data)?)'/g)].map(m=>m[1]);
 for(const name of new Set(names))fs.writeFileSync(path.join(f.site,name+'.js'),'/* isolated file fixture */');
 build(f.site,out,{preview:'leagueGym'});const result=fs.readFileSync(path.join(out,'index.html'),'utf8');
 assert.ok(result.indexOf('src="league-gym-install.js"')<result.indexOf('src="opelucid-bootstrap.js'));
 assert.ok(result.indexOf('src="league-audio.js"')>result.indexOf('src="opelucid-audio.js'));
 assert.ok(result.includes('LEAGUE_SCENES={121:LEAGUE_SCENES[121]}'));assert.ok(result.includes('zoneFamily:{121:"drayden"}'));
 assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),html);
 build(f.site,path.join(f.dir,'fields'),{preview:'leagueFields'});const fields=fs.readFileSync(path.join(f.dir,'fields/index.html'),'utf8');assert.ok(fields.includes('052 native field components'));assert.ok(!fields.includes('LEAGUE_SCENES={121:'));assert.ok(fields.includes('src="league-camera-data.js"'));assert.ok(fields.includes('src="league-camera.js"'));assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),html);
 assert.throws(()=>build(f.site,path.join(f.dir,'bad'),{preview:'arbitrary'}),/Unsupported/);
 fs.unlinkSync(path.join(f.site,'league-gym-install.js'));assert.throws(()=>preview.inject(html,f.site),/Missing Gym052/);
});

function cutCaptureFixture055({contactProgress=.56,contactActor=true,bitmapFailure=false,encodeFailure=false,eventFailure=false}={}){
 const script=fs.readFileSync(path.join(__dirname,'browser-qa.js'),'utf8'),start=script.indexOf(' function fieldHMFrameSnapshots055('),end=script.indexOf(' if(window.FieldHMWorld)for(const speed',start);
 assert.ok(start>=0&&end>start,'Execute the real Cut QA capture, including its renderer observer');
 const shots=[],speeds=[],snapshots=[],closed=[],tree={model:108,hidden:false},actor={fieldHM:true,texture:{},x:4,z:7,height:2};let forcedDraws=0,marker='initial',actorEnabled=true;
 const field={active:null,retained:{},present(){return actorEnabled?[actor]:[];}},renderer={canvas:{},gl:{getError:()=>0},draw(){field.present(renderer);this.canvas.marker=marker;}};
 const originalDraw=renderer.draw,originalPresent=field.present;
 const story={state:{dreamyardTreeCut:false},interact(){
  field.active={move:15,phase:'cut',elapsed:.33*2.4,duration:2.4,committed:false};marker='normal-preparation';renderer.draw();
  field.active.elapsed=contactProgress*2.4;field.active.committed=true;tree.hidden=true;actorEnabled=contactActor;marker='normal-contact';renderer.draw();
  story.state.dreamyardTreeCut=true;field.active=eventFailure?field.active:null;marker='recalled';return eventFailure?Promise.reject(Error('native event failed')):Promise.resolve();
 }};
 const context={renderer,FieldHMWorld:field,NativeStory:story,npcs:[tree],facing:0,performance,createImageBitmap(canvas){const snap={width:1280,height:720,marker:canvas.marker,close:()=>closed.push(snap.marker)};snapshots.push(snap);return new Promise((resolve,reject)=>queueMicrotask(()=>bitmapFailure&&snap.marker==='normal-contact'?reject(Error('bitmap snapshot failed')):resolve(snap)));},document:{createElement:()=>{const canvas={};canvas.getContext=()=>({drawImage:bitmap=>{canvas.marker=bitmap.marker;}});return canvas;}},GameSpeed:{set:v=>speeds.push(v)},OPENING_DATA:{Servine:{growth:{35:0}}},Journey:{state:{},pack:mon=>mon,displayPartner(){},addItem:()=>true,teachMachine:()=>Promise.resolve()},makeMon:()=>({pp:[10,20,30]}),seed049:async()=>{},fieldHMAudio054:async()=>{},enter049:async()=>{},auto049:async task=>await task,check:(ok,message)=>assert.ok(ok,message),shot:(label,canvas)=>{if(label.includes('prepara')||label.includes('contatto')){assert.equal(field.active,null,'Encoding must not run in the native action or its draw');if(encodeFailure)throw Error('PNG encoding failed');}shots.push({label,marker:canvas.marker});},drawWorld(){forcedDraws++;renderer.canvas.marker='forced-'+marker;}};
 vm.runInNewContext(script.slice(start,end)+'\nglobalThis.runCutCapture055=cutAction054;',context,{filename:'browser-qa.js:Cut-render-capture'});
 return {run:()=>context.runCutCapture055(4),shots,speeds,snapshots,closed,field,renderer,originalDraw,originalPresent,get forcedDraws(){return forcedDraws;}};
}

test('Cut QA captures preparation/contact before a completed native event can recall its actor',async()=>{
 const f=cutCaptureFixture055(),result=await f.run();
 assert.equal(result.captures.preparation.progress,.33);assert.equal(result.captures.contact.progress,.56);
 assert.equal(result.captures.contact.committed,true);assert.equal(result.captures.contact.treeHidden,true);assert.equal(result.captures.contact.actualRendererFrame,true);assert.equal(result.captures.contact.fieldHMActor,true);
 assert.equal(f.shots.find(s=>s.label.includes('prepara')).marker,'normal-preparation');assert.equal(f.shots.find(s=>s.label.includes('contatto')).marker,'normal-contact');
 assert.deepEqual(f.snapshots.map(s=>s.marker),['normal-preparation','normal-contact']);assert.deepEqual(f.closed,['normal-preparation','normal-contact']);assert.equal(result.captures.contact.snapshot.deferredEncoding,true);assert.equal(result.captures.contact.snapshot.encodedAfterAction,true);assert.ok(result.captures.contact.snapshot.requestMs>=0&&result.captures.contact.snapshot.encodeMs>=0);
 assert.equal(f.forcedDraws,2,'Only the before/outcome pictures may force a draw');assert.deepEqual(f.speeds,[4]);
 assert.equal(f.renderer.draw,f.originalDraw);assert.equal(f.field.present,f.originalPresent);
});

test('Cut QA fails when normal rendering skips the contact window and restores its observers',async()=>{
 const f=cutCaptureFixture055({contactProgress:.68});await assert.rejects(f.run(),/missed preparation\/contact windows/);
 assert.equal(f.shots.some(s=>s.label.includes('contatto')),false);assert.equal(f.forcedDraws,1);assert.equal(f.renderer.draw,f.originalDraw);assert.equal(f.field.present,f.originalPresent);assert.deepEqual(f.speeds,[4]);
 assert.deepEqual(f.closed,['normal-preparation']);
});

test('Cut QA cannot reuse a previous field actor when the contact draw has none',async()=>{
 const f=cutCaptureFixture055({contactActor:false});await assert.rejects(f.run(),/missed preparation\/contact windows/);
 assert.equal(f.shots.some(s=>s.label.includes('contatto')),false);assert.equal(f.renderer.draw,f.originalDraw);assert.equal(f.field.present,f.originalPresent);
 assert.deepEqual(f.closed,['normal-preparation']);
});

test('Cut QA reports asynchronous bitmap failure and closes the snapshots that did resolve',async()=>{
 const f=cutCaptureFixture055({bitmapFailure:true});await assert.rejects(f.run(),/bitmap snapshot failed/);assert.deepEqual(f.closed,['normal-preparation']);assert.equal(f.renderer.draw,f.originalDraw);assert.equal(f.field.present,f.originalPresent);
});

test('Cut QA closes every frozen frame even if deferred PNG encoding fails',async()=>{
 const f=cutCaptureFixture055({encodeFailure:true});await assert.rejects(f.run(),/PNG encoding failed/);assert.deepEqual(f.closed,['normal-preparation','normal-contact']);assert.equal(f.renderer.draw,f.originalDraw);assert.equal(f.field.present,f.originalPresent);
});

test('Cut QA disposes captured frames without encoding when its native event fails',async()=>{
 const f=cutCaptureFixture055({eventFailure:true});await assert.rejects(f.run(),/native event failed/);assert.deepEqual(f.closed,['normal-preparation','normal-contact']);assert.equal(f.shots.some(s=>s.label.includes('prepara')||s.label.includes('contatto')),false);assert.equal(f.renderer.draw,f.originalDraw);assert.equal(f.field.present,f.originalPresent);
});

function referenceCleanup056(world){
 const text=fs.readFileSync(path.join(__dirname,'browser-qa.js'),'utf8'),start=text.indexOf(' async function clearSuppliedHMReference056('),end=text.indexOf(' async function worldHMMatrix054(',start),context={FieldHMWorld:world,check:(ok,message)=>assert.ok(ok,message)};
 assert.ok(start>=0&&end>start);vm.runInNewContext(text.slice(start,end)+'\nglobalThis.cancelReference=clearSuppliedHMReference056;',context);return context.cancelReference;
}
test('supplied HM pose cleanup cancels its unfinished action without ticking or acknowledging a render',async()=>{
 let reject;const calls=[],finished=new Promise((resolve,failure)=>reject=failure),clear=referenceCleanup056({clear(){calls.push('clear');reject(Error('Azione MN annullata'));},tick(){throw Error('Reference cleanup must not advance physics');},rendered(){throw Error('Reference cleanup must not supply a frame');}});
 await clear({finished});assert.deepEqual(calls,['clear']);
});
test('supplied HM pose cleanup rejects unexpected failure and cannot certify an actual completed outcome',async()=>{
 let reject;const finished=new Promise((resolve,failure)=>reject=failure),clear=referenceCleanup056({clear(){reject(Error('sprite resource failed'));}});await assert.rejects(clear({finished}),/sprite resource failed/);
 await assert.rejects(referenceCleanup056({clear(){}})({finished:Promise.resolve()}),/must cancel without certifying an outcome/);
});

function femaleHMFixture056({resourceFailure=false}={}){
 const text=fs.readFileSync(path.join(__dirname,'browser-qa.js'),'utf8'),start=text.indexOf(' async function prepareHMIdentity056('),end=text.indexOf(' if(window.FieldHMWorld&&window.PlayerIdentity)',start),calls=[],state={playerGender:'M',playerName:'Legacy',introductionComplete:false};
 const context={console,Journey:{state},PLAYER_ASSETS:{sprites:{Alcide:Array.from({length:12},(_,i)=>'male-'+i),AlcideSurf:Array.from({length:12},(_,i)=>'male-surf-'+i),Anita:Array.from({length:12},(_,i)=>'female-'+i),AnitaSurf:Array.from({length:12},(_,i)=>'female-surf-'+i)}},NativeStory:{visualActors:()=>[]},FieldHMWorld:{active:null,clear(){calls.push('clear');}},RuntimeAssets:{image:async source=>({source})},AudioEngine:{disable(){calls.push('audio-disabled');}},check:(ok,message)=>assert.ok(ok,message)};context.window=context;
 context.renderer={images:{},async requireActors(){calls.push('prepare-'+state.playerGender);if(resourceFailure&&state.playerGender==='F')throw Error('female resource failed');this.images[state.playerGender==='F'?'Anita-0':'Alcide-0']={};},async prepareScene(){calls.push('scene-'+state.playerGender);},hasResources:()=>true,resourcePlan:()=>({})};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/player-identity.js'),'utf8'),context);assert.ok(start>=0&&end>start);vm.runInContext(text.slice(start,end)+'\nglobalThis.prepareFemale=prepareHMIdentity056;globalThis.runFemale=femaleHM056;',context);return {context,calls,state,image:context.RuntimeAssets.image};
}
test('female HM QA prepares identity/resources before the native command and restores prior identity afterward',async()=>{
 const f=femaleHMFixture056(),result=await f.context.runFemale(19,async identity=>{await f.context.prepareFemale(identity);assert.equal(f.state.playerGender,'F');assert.equal(f.state.playerName,'Élisa');assert.ok(f.calls.includes('scene-F'));await f.context.RuntimeAssets.image('female-0');await f.context.RuntimeAssets.image('female-surf-0');return {actualA:true};});
 assert.equal(result.actualA,true);assert.equal(result.playerIdentity.actualIntroductionReplayed,false);assert.equal(result.playerIdentity.standingSprite,'Anita');assert.equal(result.playerIdentity.sittingSprite,'AnitaSurf');assert.deepEqual(f.state,{playerGender:'M',playerName:'Legacy',introductionComplete:false});assert.equal(f.context.RuntimeAssets.image,f.image);assert.ok(f.calls.includes('scene-M'));
});
test('female HM QA propagates a missing native resource and restores its loader and identity',async()=>{
 const f=femaleHMFixture056({resourceFailure:true});await assert.rejects(f.context.runFemale(19,identity=>f.context.prepareFemale(identity)),/female resource failed/);assert.deepEqual(f.state,{playerGender:'M',playerName:'Legacy',introductionComplete:false});assert.equal(f.context.RuntimeAssets.image,f.image);assert.ok(f.calls.includes('scene-M'));
});
test('female HM QA does not cancel another active native command to prepare its fixture',async()=>{
 const f=femaleHMFixture056();f.context.FieldHMWorld.active={move:19};await assert.rejects(f.context.runFemale(19,()=>{throw Error('must not start');}),/requires an idle field/);assert.deepEqual(f.calls,[]);assert.equal(f.context.RuntimeAssets.image,f.image);
});
