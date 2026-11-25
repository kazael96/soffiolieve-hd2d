'use strict';
const {repo,sourceRoot,sourcePath,site,fixturePath,readSourceBytes,readFixtureBytes}=require('./helpers/minccino-slap-paths064.cjs');
// Production-source protocol regression. Synthetic actor/arena inputs, no renderer or real PCM claim.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(sourcePath('move-fx.js'),'utf8');
const d={Image:class{set src(v){}},window:null};d.window=d;vm.createContext(d);
for(const file of ['assets/move-fx-data.js','assets/native-audio-bank.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),d,{filename:file});
for(const file of ['native-visual.js','species-moves.js','move-fx.js'])vm.runInContext(fs.readFileSync(sourcePath(file),'utf8'),d,{filename:file});
const reference={move:d.ROM_MOVE_FX.moves[3],spa:d.ROM_MOVE_FX.spas[163]},nativeProfile={species:572,id:3,frames:126,impact:60},contract={nativeAudioPlans:[{default:d.NATIVE_AUDIO_BANK.moves[3][0]}],timelines:['p1','p2'].map(side=>({side,nativeWaitGroups:false,mappedAudio:JSON.parse(JSON.stringify(d.SpeciesMoves.timeline(d.MoveFX.timeline(reference.move,0,0,side,{}),nativeProfile).audio))}))};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
async function settle(){for(let i=0;i<18;i++)await Promise.resolve();}
function host(){let serial=0,wait=null,audioWait=null,now=0;const timers=new Map(),audio={cancel:0,begin:0,prepared:0,acknowledgements:0},bodies={p1:{species:{num:572}},p2:{species:{num:510}}},owners={layoutSupported:true,available:true,roles:{p1:{graphic:572,bankReady:true,altered:false},p2:{graphic:510,bankReady:true,altered:false}}};
 const c={console,Promise,Map,Set,WeakMap,Object,Number,Math,Error,Image:class{set src(v){}get complete(){return true;}},setTimeout:()=>0,clearTimeout(){},document:{hidden:false,addEventListener(){}},GameSpeed:{now:()=>now,rate:1,flush(){},schedule(fn){const id=++serial;timers.set(id,fn);return id;},cancel(id){timers.delete(id);}},ROM_MOVE_FX:{moves:{3:reference.move,10:{id:10,variants:[{commands:[]}],spas:[]}},spas:{163:reference.spa}},NATIVE_AUDIO_BANK:{moves:{3:contract.nativeAudioPlans.map(p=>p.default)}},ROM_SPRITE_ANIM:{cache:{}},AudioEngine:{cancelMove(){audio.cancel++;},beginMove(){audio.begin++;},preloadMove(){return wait?.promise||Promise.resolve();},async preparePresentation(events,options){assert.deepEqual(JSON.parse(JSON.stringify(events)),contract.timelines.find(q=>!q.nativeWaitGroups&&q.side===options.side).mappedAudio);assert.equal(options.profileSpecies,572);assert.equal(options.profileMarker,'private-native-paw-SPA163');assert.equal(options.nativeWaitGroups,false);assert.notEqual(options.side,options.targetSide);audio.prepared++;if(audioWait)await audioWait.promise;return{canPresent:()=>true,acknowledge(){audio.acknowledgements++;},pause(){},resume(){},cancel(){audio.cancel++;},async finish(){}};}},SpeciesMoves:{select(id,move,context={}){return{species:+id,id:move,key:'training-'+id+'-'+move,kind:'palmFlurry',chapter:true,training:true,damage:true,attachment:'hand',frames:126,impact:60,target:'foe',nativeEffects:true,...(+id===572&&move===3?{minccinoNativeSlap064:'private-native-paw-SPA163',nativeSlapContext064:{hitIndex:context.hitIndex,hitCount:context.hitCount}}:{})};},timeline:d.SpeciesMoves.timeline,sample(p,f,side,miss){return{controllerPoseOnly:true,side,frame:f,hitIndex:p.nativeSlapContext064?.hitIndex,miss};},pose(p,f){return{frame:f};},draw(){}},session:{battle:{gameType:'singles'},active:side=>bodies[side]}};
 c.window=c;for(const [side,id]of [['p1',572],['p2',510]])c.ROM_SPRITE_ANIM.cache[id+'-'+(side==='p1'?'back':'front')]={ready:true,data:{},image:{}};c.BattlePresentationOwners={read:()=>({...owners,nativeSpecies:{p1:bodies.p1.species.num,p2:bodies.p2.species.num}})};vm.createContext(c);for(const file of [path.join(repo,'src/native-visual.js'),path.join(repo,'src/battle-presentation.js')])vm.runInContext(fs.readFileSync(file,'utf8'),c);vm.runInContext(source,c);const options=(hitIndex=0,extra={})=>({cryIds:{p1:572,p2:510},targetSide:'p2',context:{hitIndex,hitCount:3},hold:hitIndex<2,...extra});
 return{c,M:c.MoveFX,timers,audio,bodies,owners,options,audioGate(){audioWait=deferred();return audioWait;},releaseAudioGate(){audioWait=null;},gate(){wait=deferred();return wait;},releaseGate(){wait=null;},async complete(){await settle();const action=c.MoveFX.active;assert.ok(action&&!action.preview,'New action must actually be active before completion');if(action.presentationClock){for(let i=0;i<256&&c.MoveFX.active===action&&!action.preview;i++){now+=1000;const record=c.MoveFX.beginArenaFrame();if(record){c.MoveFX.markArenaActor('p1',572);c.MoveFX.markArenaActor('p2',510);c.MoveFX.presentedArenaFrame(record,true);}await settle();}assert.ok(c.MoveFX.active!==action||action.preview,'All actual clock protocol keys complete');}else{const fn=timers.get(action.timer);assert.equal(typeof fn,'function');timers.delete(action.timer);fn();await settle();}},async first(){const job=c.MoveFX.play(3,'p1',options());await this.complete();await job;assert.equal(c.MoveFX.active.preview,true);assert.equal(c.MoveFX.active.nativeSlapCompletedHold064,true);return c.MoveFX.active;}};
}
// Selection above is an explicit marked-profile protocol input. These tests
// exercise actual MoveFX acquisition and asynchronous handoff, not pixels/audio.
for(const phase of ['preload','audio'])for(const changed of ['session','actor','target'])test('first protected hit rejects same-species '+changed+' replacement during '+phase,async()=>{
 const h=host(),gate=phase==='preload'?h.gate():h.audioGate();let outcome;
 const job=h.M.play(3,'p1',h.options()).then(()=>outcome={kind:'resolved'},error=>outcome={kind:'rejected',message:String(error.message)});
 await settle();if(phase==='audio')assert.equal(h.audio.prepared,1,'Must enter the real second asynchronous preparation');
 if(changed==='session')h.c.session={...h.c.session};
 if(changed==='actor')h.bodies.p1={species:{num:572}};
 if(changed==='target')h.bodies.p2={species:{num:510}};
 gate.resolve();if(phase==='preload')h.releaseGate();else h.releaseAudioGate();
 await settle();const observed=outcome,active=h.M.active;
 h.M.cancel();await job;
 assert.equal(observed?.kind,'rejected','Owner identity acquired before IO cannot silently transfer to same-species replacement');
 assert.match(observed.message,/owner|ownership|identity/i);assert.equal(active,null);
});
test('first protected hit accepts a cold bank that becomes ready during preparation',async()=>{
 const h=host(),gate=h.gate();h.c.ROM_SPRITE_ANIM.cache['510-front'].ready=false;
 const job=h.M.play(3,'p1',h.options());await settle();h.c.ROM_SPRITE_ANIM.cache['510-front'].ready=true;
 gate.resolve();h.releaseGate();await settle();assert(h.M.active?.presentationClock,'Acquisition identity must not require a ready bank before preparation');
 h.M.cancel();await job;
});
for(const phase of ['preload','audio'])test('an obsolete '+phase+' completion cannot reject or cancel the newer action',async()=>{
 const h=host(),gate=phase==='preload'?h.gate():h.audioGate(),old=h.M.play(3,'p1',h.options());await settle();
 if(phase==='preload')h.releaseGate();else h.releaseAudioGate();
 h.c.session={...h.c.session};const next=h.M.play(3,'p1',h.options());await settle();const newest=h.M.active;assert(newest?.presentationClock);
 gate.resolve();await settle();await old;assert.equal(h.M.active,newest);h.M.cancel();await next;
});