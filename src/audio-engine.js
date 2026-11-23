/* ROM audio: original SWAV cries, DS SSEQ/banks rendered by DualRip. */
(()=>{
 const catalog=window.ROM_AUDIO_CATALOG,data=window.ROM_AUDIO;
 let ctx,master,musicBus,sfxBus,cryBus,analyser,cryAnalyser,musicVoice,scene='town',generation=0,duckCount=0,fieldMusicVolume=127,cinematicMusicDepth=0;
 let enabled=false,levels={music:.45,sfx:.7,cry:.8},errors=[],voices=new Set(),cache=new Map(),effectGroup=null;
 let audioEpoch=0;const fieldSounds=new Map(),audioWaiters=new Set();
 const presentationAudio=createPresentationAudio();
 const cryId=id=>window.PokemonVisuals?.speciesId(id)||Object.values(window.ROM_FORM_SPRITES||{}).find(f=>f.graphic===+id)?.species||+id;
 async function awaitAudio(task){let cancel;const stopped=new Promise(resolve=>cancel=()=>resolve(null));audioWaiters.add(cancel);try{return await Promise.race([task,stopped]);}finally{audioWaiters.delete(cancel);}}
 const cryCache=new Map(),cryDataCache=new Map(),pannedCry=new WeakMap(),swapped=new WeakMap(),cinematicBuffers=new Set();
 function nativePlan(id,variant=0,side='p1'){let variants=window.NATIVE_AUDIO_BANK?.moves[id];let p=variants?.[Math.min(variant,variants.length-1)];return side==='p2'?p?.p2||p:p}
 function nativeClip(v,speed,side){let prefix=side==='p2'&&v.keys.p2normal?'p2':'',key=v.keys[prefix+(speed===.5?'slow':'normal')];return window.NATIVE_AUDIO_BANK?.clips[key]}
 async function readAudio(src){if(window.AudioPlayback?.bytes)return window.AudioPlayback.bytes(src);const response=await (window.AudioPlayback?.fetch||fetch)(src);if(!response.ok)throw Error('Audio non disponibile: '+src);return response.arrayBuffer();}
 async function cryData(id){id=cryId(id);if(cryDataCache.has(id))return cryDataCache.get(id);const record=catalog.cries[id];if(!record)return null;const promise=readAudio(record.file).then(raw=>{const d=new DataView(raw);let rate=0,offset=0,size=0;for(let p=12;p+8<=d.byteLength;){const n=d.getUint32(p+4,true),type=String.fromCharCode(...new Uint8Array(raw,p,4));if(type==='fmt '){if(d.getUint16(p+8,true)!==1||d.getUint16(p+10,true)!==1||d.getUint16(p+22,true)!==16)throw Error('Formato verso non PCM16 mono');rate=d.getUint32(p+12,true);}if(type==='data'){offset=p+8;size=n;}p+=8+n+(n&1);}if(!rate||!size||offset+size>d.byteLength)throw Error('Verso WAV invalido');const samples=new Float32Array(size/2);for(let i=0;i<samples.length;i++)samples[i]=d.getInt16(offset+i*2,true)/32768;return {samples,sampleRate:rate,speed:record.nativeSpeed||32768,volume:record.baseVolume??110};}).catch(error=>{cryDataCache.delete(id);throw error;});cryDataCache.set(id,promise);if(cryDataCache.size>16)cryDataCache.delete(cryDataCache.keys().next().value);return promise;}
 async function loadCry(id){id=cryId(id);if(cryCache.has(id))return cryCache.get(id);const promise=cryData(id).then(data=>{const buffer=ctx.createBuffer(1,data.samples.length,data.sampleRate);buffer.getChannelData(0).set(data.samples);return buffer;}).catch(error=>{cryCache.delete(id);throw error;});cryCache.set(id,promise);if(cryCache.size>16)cryCache.delete(cryCache.keys().next().value);return promise;}
 const readyCries=new Map();
 async function preloadCry(id){id=cryId(id);if(!catalog.cries[id])return;let b=await loadCry(id);readyCries.set(id,b);if(readyCries.size>16)readyCries.delete(readyCries.keys().next().value);return b}
 function cryBuffer(mono,reverse,side){let choices=pannedCry.get(mono);if(!choices){choices=new Map();pannedCry.set(mono,choices)}let key=side+':'+reverse;if(choices.has(key))return choices.get(key);let pan=side==='p1'?20:107,b=ctx.createBuffer(2,mono.length,mono.sampleRate),input=mono.getChannelData(0),left=b.getChannelData(0),right=b.getChannelData(1);for(let i=0;i<input.length;i++){let v=input[reverse?input.length-1-i:i];left[i]=v*(127-pan)/128;right[i]=v*pan/128}choices.set(key,b);return b}
 function swap(buffer){if(buffer.numberOfChannels<2)return buffer;if(swapped.has(buffer))return swapped.get(buffer);let b=ctx.createBuffer(2,buffer.length,buffer.sampleRate);b.getChannelData(0).set(buffer.getChannelData(1));b.getChannelData(1).set(buffer.getChannelData(0));swapped.set(buffer,b);return b}
 function cryVoices(id,mono,args,side,when,tempo=1){let parameters=window.NativeAudio.cryParameters(catalog.cries[id],args),b=cryBuffer(mono,parameters.reverse,side);el('audioControls').dataset.cry=String(id);el('audioControls').dataset.cryReverse=String(parameters.reverse);el('audioControls').dataset.crySpeed=parameters.voices[0].speed;return parameters.voices.map(p=>voice(b,cryBus,{kind:'cry',when,gain:p.volume,rate:p.rate*tempo}));}
 const labels={town:'Soffiolieve',wild:'Lotta selvatica',trainer:'Lotta allenatore',rival:'Lotta con il rivale',victoryWild:'Vittoria',victoryTrainer:'Vittoria allenatore'};
 const el=id=>document.getElementById(id);
 try{levels={...levels,...JSON.parse(localStorage.getItem('soffiolieve-audio-levels')||'{}')}}catch{}
 for(let k of Object.keys(levels))levels[k]=Math.max(0,Math.min(1,+levels[k]||0));
 function status(message){el('audioStatus').textContent=message;el('audioToggle').textContent=enabled?'Disattiva audio':'Attiva audio';el('audioToggle').setAttribute('aria-label',el('audioToggle').textContent);el('audioLabel').textContent=enabled?'â™« Audio':'â™« Audio spento';el('audioToggle').setAttribute('aria-pressed',String(enabled));el('audioControls').dataset.state=enabled?'on':'off';}
 function problem(error){errors.push(String(error));el('audioControls').dataset.errors=errors.length;status('Errore audio: '+error.message);}
 function initialize(){if(ctx)return;let C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Web Audio non disponibile');ctx=new C();master=ctx.createGain();setMono(window.NativeSettings?.state.sound==='mono');musicBus=ctx.createGain();sfxBus=ctx.createGain();cryBus=ctx.createGain();analyser=ctx.createAnalyser();analyser.fftSize=256;master.gain.value=.7;musicBus.gain.value=levels.music*fieldMusicVolume/127;sfxBus.gain.value=levels.sfx;cryBus.gain.value=levels.cry;for(let bus of [musicBus,sfxBus])bus.connect(master);cryAnalyser=ctx.createAnalyser();cryAnalyser.fftSize=256;cryBus.connect(cryAnalyser);cryAnalyser.connect(master);master.connect(analyser);analyser.connect(ctx.destination);let waveform=new Float32Array(256);setInterval(()=>{if(!ctx)return;analyser.getFloatTimeDomainData(waveform);let rms=Math.sqrt(waveform.reduce((s,x)=>s+x*x,0)/waveform.length);el('audioMeter').value=Math.min(1,rms*4);el('audioControls').dataset.voices=voices.size;el('audioControls').dataset.context=ctx.state},180);}
 function trimCache(){let samples=[...cache.values()].reduce((s,x)=>s+(x.buffer?x.buffer.length*x.buffer.numberOfChannels:0),0);for(let [key,item] of cache){if(cache.size<=64&&samples<32000000)break;if(!item.buffer||item.buffer===musicVoice?.source.buffer||cinematicBuffers.has(item.buffer))continue;samples-=item.buffer.length*item.buffer.numberOfChannels;cache.delete(key)}}
 async function load(src){if(cache.has(src)){let entry=cache.get(src);cache.delete(src);cache.set(src,entry);return entry.promise}let entry={};entry.promise=readAudio(src).then(b=>ctx.decodeAudioData(b)).then(buffer=>{entry.buffer=buffer;trimCache();return buffer}).catch(e=>{cache.delete(src);throw e});cache.set(src,entry);return entry.promise;}
 function fadeStop(voice,seconds=.04){if(!voice||voice.stopped)return;voice.stopped=true;let now=ctx.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(voice.gain.gain.value,now);voice.gain.gain.linearRampToValueAtTime(0,now+seconds);try{voice.source.stop(now+seconds+.01)}catch{};}
 function voice(buffer,bus,options={}){let source=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=buffer;source.playbackRate.value=options.rate??1;gain.gain.value=options.gain??1;pan.pan.value=options.pan||0;source.connect(gain);gain.connect(pan);pan.connect(bus);if(options.loop){source.loop=true;source.loopStart=options.loop[0];source.loopEnd=Math.min(buffer.duration,options.loop[1])}let item={source,gain,pan,kind:options.kind||'sfx',stopped:false};const cleanup=()=>{voices.delete(item);source.disconnect();gain.disconnect();pan.disconnect();};item.done=window.AudioPlayback?AudioPlayback.ended(source,ctx,cleanup,{loop:!!options.loop}):new Promise(resolve=>{source.onended=()=>{cleanup();resolve();}});voices.add(item);const offset=Number.isFinite(options.offset)?Math.max(0,Math.min(Math.max(0,buffer.duration-1/(buffer.sampleRate||32768)),options.offset)):0;item.startedAt=options.when??ctx.currentTime;source.start(item.startedAt,offset);return item;}
 function applyMusicLevel(immediate=false){if(!musicBus)return;const value=cinematicMusicDepth?0:levels.music*(duckCount ? .38 : 1)*fieldMusicVolume/127;if(immediate){musicBus.gain.cancelScheduledValues(ctx.currentTime);musicBus.gain.setValueAtTime(value,ctx.currentTime);}else musicBus.gain.setTargetAtTime(value,ctx.currentTime,.09)}
 function setFieldMusicVolume(value){if(!Number.isInteger(value)||value<0||value>127)throw Error('Volume musica nativo non valido');if(value===fieldMusicVolume)return;fieldMusicVolume=value;applyMusicLevel(true);}
 function setMusicTrack(flag,on=true){if(!musicVoice?.layers||!ctx)return;const item=musicVoice.layers.find(v=>v.flag===flag);if(!item)return;const now=ctx.currentTime;item.gain.gain.cancelScheduledValues(now);item.gain.gain.setValueAtTime(item.gain.gain.value,now);item.gain.gain.linearRampToValueAtTime(on?1:0,now+(musicVoice.fadeFrames||60)/60);}
 async function setScene(next){scene=next;if(!enabled||!ctx)return;let token=++generation,id=typeof next==='number'?next:catalog.music[next],record=window.FIELD_AUDIO?.[id]||data.sounds[id];
  if(id===1001||id===1002||record?.nativeSilence===true){/* Explicit original rest-only sequences require no PCM request. */const old=musicVoice;musicVoice=null;for(const layer of old?.layers||[])fadeStop(layer,.25);fadeStop(old,.25);el('audioControls').dataset.music=String(id);status('Musica sospesa');return;}
  if(!record){problem(Error('Musica non trovata: '+next));return}if(musicVoice?.id===id)return;
  const old=musicVoice;musicVoice=null;for(const layer of old?.layers||[])fadeStop(layer,.25);fadeStop(old,.25);status('Caricamento: '+(labels[next]||record?.name||next)+'â€¦');
  try{const buffers=await Promise.all([load(record.src),...(record.layers||[]).map(layer=>load(layer.src))]);if(token!==generation||!enabled)return;
   const when=ctx.currentTime+.03;musicVoice=voice(buffers[0],musicBus,{loop:record.loop,kind:'music',gain:0,when});musicVoice.id=id;musicVoice.fadeFrames=record.fadeFrames;musicVoice.gain.gain.linearRampToValueAtTime(1,when+.3);
   musicVoice.layers=(record.layers||[]).map((layer,i)=>{const v=voice(buffers[i+1],musicBus,{loop:layer.loop,kind:'music',gain:0,when});v.flag=layer.flag;v.gain.gain.linearRampToValueAtTime(window.NativeStory?.state.musicTracks?.[layer.flag]?1:0,when+.3);return v;});
   applyMusicLevel();el('audioControls').dataset.music=String(id);status('In riproduzione: '+(labels[next]||record?.name||next));
  }catch(error){if(token===generation)problem(error)}
 }
 async function enable(){const token=audioEpoch;try{initialize();await ctx.resume();if(token!==audioEpoch)return;enabled=true;await syncVisibility();if(token!==audioEpoch)return;master.gain.setValueAtTime(.7,ctx.currentTime);status('Audio attivo');await setScene(scene)}catch(e){if(token===audioEpoch){enabled=false;problem(e)}}}
 function disable(){enabled=false;generation++;audioEpoch++;for(const cancel of [...audioWaiters])cancel();for(const id of [...fieldSounds.keys()])stopSound(id);cancelMove();for(let v of [...voices])fadeStop(v,.04);musicVoice=null;master?.gain.setTargetAtTime(0,ctx?.currentTime||0,.03);el('audioControls').dataset.music='';status('Audio disattivato');}
 async function cry(id,options={}){id=cryId(id);if(!enabled||!ctx||!catalog.cries[id])return;const token=audioEpoch;let ducked=false;try{let buffer=await awaitAudio(preloadCry(id));if(!buffer||!enabled||token!==audioEpoch)return;duckCount++;ducked=true;applyMusicLevel();let active=cryVoices(id,buffer,options.parameters,options.side||'p2',ctx.currentTime,window.GameSpeed?.rate||1);await Promise.all(active.map(v=>v.done));}catch(e){if(token===audioEpoch&&enabled)problem(e)}finally{if(ducked)duckCount=Math.max(0,duckCount-1);applyMusicLevel()}}
 async function preloadMove(id,cryIds={},variant=0,speed=1,side='p1'){if(!enabled||!ctx)return;let plan=nativePlan(id,variant,side),src=plan?plan.voices.map(v=>nativeClip(v,speed,side)?.src).filter(Boolean):(catalog.moveSounds[id]?.play||[]).map(i=>data.sounds[i]?.src).filter(Boolean);await Promise.all([...new Set(src)].map(s=>load(s).catch(problem)).concat(Object.values(cryIds).map(cryId).filter(i=>catalog.cries[i]).map(i=>preloadCry(i).catch(problem))));}
 async function preloadEvents(events,cryIds={}){if(!enabled||!ctx)return;await Promise.all([...new Set(events.filter(e=>e.kind==='sfx').map(e=>(window.FIELD_AUDIO?.[e.id]||data.sounds[e.id])?.src).filter(Boolean))].map(src=>load(src).catch(problem)).concat(Object.values(cryIds).map(cryId).filter(id=>catalog.cries[id]).map(id=>preloadCry(id).catch(problem))));}
 function createPresentationAudio(){
  const pauseFadeSeconds=.002,owner={snapshot:()=>({context:ctx,sfxBus,cryBus,enabled,epoch:audioEpoch}),load};
  const sessions=new Set(),retiring=new Set(),pendingPreparations=new Set();let presentationGeneration=0;
  // The original control envelopes and stereo trajectories are already baked
  // into these finite native clips. Changed scripts/banks require a new review.
  const contracts={
   10:{frames:80,anchor:29,events:[{kind:'sfx',id:1423,channel:1,target:16,start:29,raw:[1423,1,16,5,0,120,0,0,0]}],voices:[[0,1423,1,16,29,80,true,'cac484e800f0f05c08d7','cac484e800f0f05c08d7','cac484e800f0f05c08d7','cac484e800f0f05c08d7']]},
   43:{frames:126,anchor:52,events:[
    {kind:'sfx',id:1449,channel:1,target:14,start:24,raw:[1449,1,14,0,0,115,0,0,0]},
    {kind:'sfx',id:1449,channel:2,target:14,start:39,raw:[1449,2,14,15,0,50,0,0,0]},
    {kind:'sfx',id:1836,channel:1,target:16,start:52,raw:[1836,1,16,0,-200,127,0,0,0]}
   ],voices:[
    [0,1449,1,14,24,52,true,'f6b57152ac96fdffad00','f6b57152ac96fdffad00','f6b57152ac96fdffad00','f6b57152ac96fdffad00'],
    [1,1449,2,14,39,126,true,'cb193c7dd275a62fc6a4','cb193c7dd275a62fc6a4','cb193c7dd275a62fc6a4','cb193c7dd275a62fc6a4'],
    [2,1836,1,16,52,126,true,'6845647bdc20f8937f00','6845647bdc20f8937f00','6845647bdc20f8937f00','6845647bdc20f8937f00']
   ]},
   33:{frames:72,anchor:24,events:[
    {kind:'sfx',id:1437,channel:1,target:16,start:24,raw:[1437,1,16,0,0,120,0,0,0]},
    {kind:'sfx',id:1424,channel:2,target:16,start:32,raw:[1424,2,16,8,-300,115,0,0,0]},
    {kind:'sfx',id:1424,channel:1,target:16,start:36,raw:[1424,1,16,12,-300,115,0,0,0]}
   ],voices:[
    [0,1437,1,16,24,36,true,'146e40305826aa9e51d9','146e40305826aa9e51d9','146e40305826aa9e51d9','146e40305826aa9e51d9'],
    [1,1424,2,16,32,72,true,'6512632a745b3c1104a3','6512632a745b3c1104a3','6512632a745b3c1104a3','6512632a745b3c1104a3'],
    [2,1424,1,16,36,72,true,'6512632a745b3c1104a3','6512632a745b3c1104a3','6512632a745b3c1104a3','6512632a745b3c1104a3']
   ]},
   86:{frames:205,anchor:53,events:[
    {kind:'sfx',id:1522,channel:1,target:16,start:53,raw:[1522,1,16,0,0,120,0,0,0]},
    {kind:'sfx',id:1458,channel:2,target:16,start:113,raw:[1458,2,16,60,0,120,0,0,0]}
   ],voices:[
    [0,1522,1,16,53,205,true,'f73176aae4d39e8b236b','f73176aae4d39e8b236b','f73176aae4d39e8b236b','f73176aae4d39e8b236b'],
    [1,1458,2,16,113,205,true,'ef3df4616d2339e998b1','ef3df4616d2339e998b1','ef3df4616d2339e998b1','ef3df4616d2339e998b1']
   ]},
   209:{frames:245,anchor:193,events:[
    {kind:'sfx',id:1458,channel:1,target:14,start:20,raw:[1458,1,14,20,0,120,0,0,0]},
    {kind:'sfx',id:1483,channel:2,target:14,start:0,raw:[1483,2,14,0,0,100,0,0,0]},
    {kind:'sfx',id:1376,channel:2,target:14,start:90,raw:[1376,2,14,90,0,0,0,0,0]},
    {kind:'sfx',id:1421,channel:1,target:14,start:140,raw:[1421,1,14,140,0,115,0,0,0]},
    {kind:'control',channel:2,start:0,raw:[2,0,0,-1000,2000,0,90,0,0]},
    {kind:'sfx',id:1505,channel:1,target:16,start:193,raw:[1505,1,16,20,0,120,0,0,0]},
    {kind:'sfx',id:1458,channel:2,target:16,start:193,raw:[1458,2,16,20,0,120,0,0,0]}
   ],voices:[
    [1,1483,2,14,0,90,true,'b860cd6841dbf78efb6b','394e1655d76a279eb7e4','b860cd6841dbf78efb6b','394e1655d76a279eb7e4'],
    [0,1458,1,14,20,140,true,'fb0995c4127af578000e','fb0995c4127af578000e','fb0995c4127af578000e','fb0995c4127af578000e'],
    [3,1421,1,14,140,193,true,'e4c86cf04189594e3baa','e4c86cf04189594e3baa','e4c86cf04189594e3baa','e4c86cf04189594e3baa'],
    [5,1505,1,16,193,245,true,'ea006f17a29deefbda54','ea006f17a29deefbda54','ea006f17a29deefbda54','ea006f17a29deefbda54'],
    [6,1458,2,16,193,245,true,'ef3df4616d2339e998b1','ef3df4616d2339e998b1','ef3df4616d2339e998b1','ef3df4616d2339e998b1']
   ]},
   451:{frames:194,anchor:0,events:[
    {kind:'sfx',id:1445,channel:1,target:14,start:0,raw:[1445,1,14,0,0,110,0,0,0]},
    {kind:'sfx',id:1376,channel:1,target:14,start:90,raw:[1376,1,14,90,0,0,0,0,0]},
    {kind:'control',channel:1,start:0,raw:[1,0,0,-2000,2000,0,90,0,0]},
    {kind:'sfx',id:1963,channel:2,target:14,start:90,raw:[1963,2,14,90,1000,100,0,0,0]},
    {kind:'sfx',id:1376,channel:2,target:14,start:170,raw:[1376,2,14,170,0,0,0,0,0]},
    {kind:'control',channel:2,start:0,raw:[2,0,1,115,0,140,30,0,0]},
    {kind:'sfx',id:1407,channel:1,target:14,start:90,raw:[1407,1,14,90,0,115,0,0,0]},
    {kind:'sfx',id:1376,channel:1,target:14,start:170,raw:[1376,1,14,170,0,0,0,0,0]},
    {kind:'control',channel:1,start:0,raw:[1,0,0,-1000,2000,0,90,0,0]},
    {kind:'control',channel:1,start:0,raw:[1,0,1,115,0,140,30,0,0]},
    {kind:'panControl',channel:1,start:0,raw:[1,0,2,0,0,85,40,0,0],from:14,to:16},
    {kind:'panControl',channel:2,start:0,raw:[2,0,2,0,0,85,40,0,0],from:14,to:16}
   ],voices:[
    [0,1445,1,14,0,90,false,'59f9358a804a7c3e83a7','2d19b3f32fa2d301e0ff','12eefd735b75915db192','a2d1909b9169a8d08b96'],
    [3,1963,2,14,90,170,false,'67a3ead98f88620cb804','d54a77460d6846d87bfc','b7352d10957f1dbb0cb3','77edaabe80692fcf2d11'],
    [6,1407,1,14,90,170,false,'c01faa52595ed1fd43eb','3796c907444f1288734d','a4020f72d3601420ce3c','9f63c66d8184bf0d11cb']
   ]},
   39:{frames:88,anchor:0,events:[
    {kind:'sfx',id:1527,channel:1,target:14,start:0,raw:[1527,1,14,0,0,90,0,0,0]},
    {kind:'sfx',id:1527,channel:1,target:14,start:35,raw:[1527,1,14,35,0,90,0,0,0]}
   ],voices:[
    [0,1527,1,14,0,35,true,'105850eb7a4f14a8555e','105850eb7a4f14a8555e','105850eb7a4f14a8555e','105850eb7a4f14a8555e'],
    [1,1527,1,14,35,88,true,'105850eb7a4f14a8555e','105850eb7a4f14a8555e','105850eb7a4f14a8555e','105850eb7a4f14a8555e']
   ]},
   205:{frames:112,anchor:41,events:[
    {kind:'sfx',id:1443,channel:1,target:14,start:0,raw:[1443,1,14,0,-400,120,0,0,0]},
    {kind:'sfx',id:1416,channel:2,target:14,start:11,raw:[1416,2,14,0,300,127,0,0,0]},
    {kind:'sfx',id:1376,channel:2,target:16,start:71,raw:[1376,2,16,60,0,0,0,0,0]},
    {kind:'panControl',channel:2,start:11,raw:[2,0,2,0,0,0,55,0,0],from:14,to:16},
    {kind:'sfx',id:1475,channel:0,target:16,start:41,raw:[1475,0,16,0,0,120,0,0,0]}
   ],voices:[
    [0,1443,1,14,0,112,true,'d88b70f43f6b8efbc72a','d88b70f43f6b8efbc72a','d88b70f43f6b8efbc72a','d88b70f43f6b8efbc72a'],
    [1,1416,2,14,11,71,false,'507f5a0e03bf8bf68aaa','87d77762c75dc41e76ac','46307c648bfb12ce9d4d','69d9eddded99b45bf470'],
    [4,1475,0,16,41,112,true,'56dad58f8e51dabcc8f1','56dad58f8e51dabcc8f1','56dad58f8e51dabcc8f1','56dad58f8e51dabcc8f1']
   ]},
   360:{frames:135,anchor:84,events:[
    {kind:'sfx',id:1876,channel:2,target:14,start:24,raw:[1876,2,14,0,0,80,0,0,0]},
    {kind:'panControl',channel:1,start:24,raw:[1,0,2,0,0,0,64,0,0],from:14,to:14},
    {kind:'sfx',id:1686,channel:2,target:16,start:84,raw:[1686,2,16,0,0,120,0,0,0]}
   ],voices:[
    [0,1876,2,14,24,84,true,'ba2291893a3f321fb41e','ba2291893a3f321fb41e','ba2291893a3f321fb41e','ba2291893a3f321fb41e'],
    [2,1686,2,16,84,135,true,'e834e957d1cf3f31be3f','e834e957d1cf3f31be3f','e834e957d1cf3f31be3f','e834e957d1cf3f31be3f']
   ]},
   16:{frames:182,anchor:34,events:[
    {kind:'sfx',id:1497,channel:1,target:16,start:34,raw:[1497,1,16,10,0,115,0,0,0]},
    {kind:'sfx',id:1376,channel:1,target:16,start:144,raw:[1376,1,16,120,0,0,0,0,0]},
    {kind:'control',channel:1,start:24,raw:[1,0,0,-500,500,10,80,0,0]},
    {kind:'control',channel:1,start:24,raw:[1,0,1,70,0,60,60,0,0]},
    {kind:'sfx',id:1717,channel:2,target:16,start:34,raw:[1717,2,16,10,0,100,0,0,0]},
    {kind:'sfx',id:1376,channel:2,target:16,start:144,raw:[1376,2,16,120,0,0,0,0,0]},
    {kind:'control',channel:2,start:24,raw:[2,0,0,0,1300,0,40,0,0]},
    {kind:'control',channel:2,start:24,raw:[2,0,0,1300,0,60,40,0,0]},
    {kind:'control',channel:2,start:24,raw:[2,0,1,0,100,0,30,0,0]},
    {kind:'control',channel:2,start:24,raw:[2,0,1,100,0,60,60,0,0]}
   ],voices:[
    [0,1497,1,16,34,144,true,'65f9874aa74ef8b19616','9ce14c1b30955fb3fa03','65f9874aa74ef8b19616','9ce14c1b30955fb3fa03'],
    [4,1717,2,16,34,144,true,'83de845c78659fb9d762','09f161943c6be680e6ca','83de845c78659fb9d762','09f161943c6be680e6ca']
   ]}
  };
  function validate(events,options){
   const species=options.cryIds?.[options.side],definition=contracts[options.moveId];
   const openingStatus=(species===495&&options.moveId===43&&options.profileSpecies===495&&options.profileKey==='snivy-43')||(species===498&&options.moveId===39&&options.profileSpecies===498&&options.profileKey==='tepig-39'),duration=openingStatus?(species===495?100:108):126,impact=openingStatus?(species===495?46:51):60;
   const claw=species===510&&options.moveId===10&&options.profileSpecies===510&&options.profileKey==='training-510-10';
   const tail=options.moveId===39&&[500,503].includes(species)&&options.profileKind==='nativeTailWhipStatus064'&&options.profileMarker==='native500503TailWhip064';
   const tynamo=species===602&&options.profileSpecies===602&&options.profileKind===({33:'bodyRam',86:'electricWave',209:'flameRush',451:'electricWave'}[options.moveId])&&[33,86,209,451].includes(options.moveId);
   if(!definition||!([205,360].includes(options.moveId)&&species===500||options.moveId===16&&species===521||tail||tynamo||openingStatus||claw)||options.frames!==duration)throw Error('Unsupported native battle presentation audio');
   if(![.5,1].includes(options.playbackSpeed)||![1,2,4].includes(options.speed/options.playbackSpeed)||![.5,1,2,4].includes(options.speed))throw Error('Unsupported native battle presentation speed');
   if(!['p1','p2'].includes(options.side)||!['p1','p2'].includes(options.targetSide)||options.targetSide===options.side||!Array.isArray(options.requiredKeys)||options.requiredKeys.length>256||!Number.isInteger(options.variant??0)||(options.variant??0)<0)throw Error('Invalid native battle action contract');
   const keys=Object.freeze([...new Set([0,...options.requiredKeys,duration])].sort((a,b)=>a-b));if(keys.some(k=>!Number.isFinite(k)||k<0||k>duration))throw Error('Invalid native battle audio key');
   const plan=nativePlan(options.moveId,options.variant||0,options.side);if(!plan||plan.frames!==definition.frames||plan.voices?.length!==definition.voices.length)throw Error('Changed native battle voice plan');
   if(!Array.isArray(events)||events.length!==definition.events.length)throw Error('Changed native battle audio event count');
   const mapped=t=>Math.max(0,Math.min(duration-1,definition.anchor>0&&t<=definition.anchor?t/definition.anchor*impact:impact+(t-definition.anchor)/(definition.frames-definition.anchor)*(duration-impact)));
   for(let i=0;i<events.length;i++){
    const actual=events[i],original=definition.events[i];if(JSON.stringify(Object.keys(actual).sort())!==JSON.stringify(Object.keys(original).sort()))throw Error('Changed native battle event shape');
    for(const key of Object.keys(original)){const expected=key==='start'?mapped(original.start):original[key];if(key==='raw'?JSON.stringify(actual.raw)!==JSON.stringify(expected):actual[key]!==expected)throw Error('Changed native battle event/control binding');}
    if(!keys.includes(actual.start))throw Error('A native battle audio cue is absent from the draw plan');
   }
   for(let i=0;i<plan.voices.length;i++){
    const n=plan.voices[i],d=definition.voices[i],offset=options.side==='p2'?2:0;
    if([n.order,n.id,n.channel,n.target,n.start,n.end,n.mirror].some((v,j)=>v!==d[j])||JSON.stringify(Object.keys(n.keys||{}).sort())!==JSON.stringify(['normal','slow'])||n.keys.normal!==d[7+offset]||n.keys.slow!==d[8+offset])throw Error('Changed native battle voice/window/clip binding');
    const record=nativeClip(n,options.speed,options.side),key=n.keys[options.speed===.5?'slow':'normal'];if(record?.src!=='assets/audio/native/'+key+'.flac')throw Error('Changed native battle PCM source');
   }
   return{plan,keys,duration};
  }
  async function compile(events,options,plan,loadOwned){
   const voices=[];
   for(const n of plan.voices){const event=events[n.order],side=event.target===16?options.targetSide:options.side;if(options.miss&&event.target===16&&side!==options.side)continue;
    const record=nativeClip(n,options.speed,options.side),buffer=await loadOwned(record.src);voices.push({order:n.order,kind:'sfx',side,start:event.start/(60*options.speed),src:record.src,buffer,mirror:!!(n.mirror&&options.side==='p2'),gain:1,rate:options.speed===.5?1:options.speed,pan:0,loop:null,automation:[],stop:n.end/(60*options.speed)});
   }
   return{native:true,voices};
  }
  async function prepare(events,options){
   const {plan,keys,duration}=validate(events,options),initial=owner.snapshot(),context=initial.context,ledger=[],records=[],nodes=new Set(),drawn=new Set(),preparationGeneration=presentationGeneration;
   let frame=0,paused=false,awaitResumeDraw=false,cancelled=false,finished=false,finalizedKeys=false,finishJob=null,finishCutoff=null,watcher=null,cancelCleanupTimer=null,resolveFinish,resolveCancel,droppedLogs=0;
   const cancelPromise=new Promise(resolve=>resolveCancel=resolve),ownedEpoch=initial.epoch;
   const log=event=>{if(ledger.length>=512){ledger.shift();droppedLogs++;}ledger.push(event);};
   const stateValid=()=>{const s=owner.snapshot();return s.context===context&&s.enabled&&s.epoch===ownedEpoch&&context?.state!=='closed';};
   const stillOwned=()=>!cancelled&&preparationGeneration===presentationGeneration&&stateValid(),resourceWaiters=new Set();
   const onContextState=()=>{if(context?.state==='closed')cancel('audio-context-closed',true);};
   const closeWatcher=()=>{if(watcher!==null){window.clearInterval(watcher);watcher=null;}context?.removeEventListener?.('statechange',onContextState);};
   function waitForResource(delay){
    return new Promise((resolve,reject)=>{
     let timer=null,settled=false;const unavailable=()=>window.navigator?.onLine===false||!!window.document?.hidden;
     function finish(error){if(settled)return;settled=true;if(timer!==null)window.clearTimeout(timer);window.removeEventListener?.('online',wake);window.removeEventListener?.('offline',wake);window.document?.removeEventListener?.('visibilitychange',wake);resourceWaiters.delete(ticket);if(error)reject(error);else resolve();}
     function wake(){
      if(!stillOwned()){finish(Error('Native battle audio preparation cancelled'));return;}
      if(unavailable()){if(timer!==null){window.clearTimeout(timer);timer=null;}return;}
      if(!delay){finish();return;}if(timer===null)timer=window.setTimeout(()=>{timer=null;if(unavailable())wake();else if(stillOwned())finish();else finish(Error('Native battle audio preparation cancelled'));},delay);
     }
     const ticket={cancel:()=>finish(Error('Native battle audio preparation cancelled'))};resourceWaiters.add(ticket);window.addEventListener?.('online',wake);window.addEventListener?.('offline',wake);window.document?.addEventListener?.('visibilitychange',wake);wake();
    });
   }
   async function guardedLoad(src){
    let failure;for(let attempt=0;attempt<3;attempt++){
     await waitForResource(attempt*350);if(!stillOwned())throw Error('Native battle audio preparation cancelled');
     try{return await owner.load(src);}catch(error){failure=error;if(!stillOwned())throw error;log({event:'resource-retry',src,attempt:attempt+1,at:context.currentTime});}
    }const error=Error('Audio della mossa non disponibile dopo tre tentativi.');error.name='BattleAudioResourceError';error.cause=failure;error.resource=src;error.attempts=3;throw error;
   }
   function cleanupNode(entry,reason){
    if(entry.cleaned)return;entry.cleaned=true;entry.source.disconnect();entry.gain.disconnect();entry.pan.disconnect();nodes.delete(entry);
    if(entry.record.node===entry&&entry.record.state==='playing')entry.record.state='ended';
    if(cancelled&&nodes.size===0){if(cancelCleanupTimer!==null){window.clearTimeout(cancelCleanupTimer);cancelCleanupTimer=null;}retiring.delete(instance);}
    log({event:'voice-node-ended',order:entry.record.order,generation:entry.generation,at:context.currentTime,reason});checkFinish();
   }
   function disposeNode(entry,reason){
    if(entry.cleaned)return;entry.endReason=reason;try{entry.source.stop(context.currentTime);}catch{}
    // AudioPlayback.ended owns a watchdog; invoke its completion callback on
    // explicit owned disposal so it cannot wait for a suspended native event.
    if(entry.source.onended)entry.source.onended();else cleanupNode(entry,reason);
    entry.source.onended=null;
   }
   function cancel(reason='owned-cancel',immediate=false){
    if(finished)return;
    if(cancelled){if(immediate){if(cancelCleanupTimer!==null){window.clearTimeout(cancelCleanupTimer);cancelCleanupTimer=null;}for(const entry of [...nodes])disposeNode(entry,reason);retiring.delete(instance);}return;}
    cancelled=true;paused=false;awaitResumeDraw=false;closeWatcher();for(const waiter of [...resourceWaiters])waiter.cancel();for(const record of records)record.state='suppressed';
    for(const entry of [...nodes]){
     const at=context.currentTime;if(immediate||context.state!=='running'||entry.endExpected<=at){disposeNode(entry,reason);continue;}
     entry.gain.gain.cancelScheduledValues(at);entry.gain.gain.setValueAtTime(entry.gain.gain.value,at);entry.gain.gain.linearRampToValueAtTime(0,at+.035);entry.source.stop(at+.045);entry.endExpected=Math.min(entry.naturalEnd,at+.045);entry.endReason='owned-cancel-fade';log({event:'owned-cancel-fade',order:entry.record.order,at,fadeSeconds:.035,stopAt:at+.045});
    }
    if(nodes.size){retiring.add(instance);cancelCleanupTimer=window.setTimeout(()=>{cancelCleanupTimer=null;for(const entry of [...nodes])disposeNode(entry,'owned-cancel-cleanup-deadline');retiring.delete(instance);},60);}
    log({event:'owned-cancel',reason,frame,at:context?.currentTime??null,retiringNodes:nodes.size});resolveCancel({cancelled:true,reason});resolveFinish?.({cancelled:true,reason});sessions.delete(instance);pendingPreparations.delete(instance);
   }
   function checkFinish(){
    if(!finishJob||cancelled||finished||finishCutoff===null)return;
    if(context.currentTime+1e-9<finishCutoff||nodes.size)return;
    finished=true;closeWatcher();log({event:'finish-complete',frame,at:context.currentTime});resolveFinish({cancelled:false});sessions.delete(instance);
   }
   function startVoice(record,{offset=0,stopRemaining=record.windowSeconds,when=context.currentTime,resuming=false}={}){
    if(cancelled||finished||!stateValid())return false;
    const remainingNatural=Math.max(0,(record.buffer.duration-offset)/record.rate),span=Math.min(remainingNatural,stopRemaining);
    if(span<=0){record.state='ended';return false;}
    const source=context.createBufferSource(),gain=context.createGain(),pan=context.createStereoPanner();source.buffer=record.buffer;source.playbackRate.value=record.rate;gain.gain.value=record.gain;pan.pan.value=record.pan;source.connect(gain);gain.connect(pan);pan.connect(record.kind==='cry'?initial.cryBus:initial.sfxBus);
    const entry={record,source,gain,pan,when,offset,stopAt:when+stopRemaining,naturalEnd:when+remainingNatural,endExpected:when+span,generation:++record.generation,cleaned:false,endReason:null};record.node=entry;record.state='playing';nodes.add(entry);
    if(resuming){gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(record.gain,when+Math.min(pauseFadeSeconds,span));}
    const cleanup=()=>cleanupNode(entry,entry.endReason||'native-ended');
    if(window.AudioPlayback?.ended)entry.done=window.AudioPlayback.ended(source,context,cleanup,{loop:false});else entry.done=new Promise(resolve=>source.onended=()=>{cleanup();resolve();});
    try{source.start(when,offset);source.stop(entry.stopAt);}catch(error){record.state='suppressed';disposeNode(entry,'start-error');throw error;}
    log({event:resuming?'voice-resume':'voice-onset',order:record.order,id:record.id,onsetFrame:record.onsetFrame,ackFrame:frame,kind:record.kind,src:record.src,when,offset,rate:record.rate,gain:record.gain,pan:record.pan,stopAt:entry.stopAt,endExpected:entry.endExpected,nativeStart:record.nativeStart,nativeEnd:record.nativeEnd,windowSeconds:record.windowSeconds,legacyRelativeStopSeconds:record.legacyRelativeStopSeconds,mirror:record.mirror,resumeFadeSeconds:resuming?pauseFadeSeconds:0});return true;
   }
   function assertFrame(value,next){
    if(!Number.isFinite(value)||value<frame||value>duration)throw Error('Voice-onset frame must be monotonic');
    const expected=keys.find(k=>k>value)??null;if(next!==expected)throw Error('Visual/native voice key plans differ');frame=value;if(keys.includes(value))drawn.add(value);if(value===duration)finalizedKeys=true;
   }
   const instance={
    canPresent(){return cancelled||finished||records.length===0||!enabled||context?.state==='running';},
    acknowledge(value,next){
     if(window.document?.hidden)return false;
     assertFrame(value,next);if(cancelled||finished||paused)return false;
     try{
      if(!stateValid()){cancel('audio-epoch-or-owner-changed');return false;}
      const at=context.currentTime;let started=false;
      if(awaitResumeDraw){awaitResumeDraw=false;for(const r of records)if(r.state==='paused')started=startVoice(r,{...r.resume,when:Math.max(at,r.resume.notBefore),resuming:true})||started;}
      for(const r of records){if(r.state!=='pending')continue;if(r.onsetFrame<frame)throw Error('An audible native onset was not actually drawn');if(r.onsetFrame===frame)started=startVoice(r,{when:at})||started;}
      return started;
     }catch(error){cancel('voice-ack-error',true);throw error;}
    },
    pause(value=frame){
     if(!Number.isFinite(value)||value<frame||value>duration)throw Error('Invalid voice pause frame');frame=value;if(cancelled||finished||paused)return;
     if(finishJob){log({event:'final-tail-uses-context-pause',frame,at:context.currentTime});return;}
     paused=true;awaitResumeDraw=false;const now=context.currentTime;
     for(const r of records){if(r.state!=='playing')continue;const n=r.node;if(n.endExpected<=now){r.state='ended';disposeNode(n,'already-ended-before-pause');continue;}
      const fade=context.state==='running'?Math.min(pauseFadeSeconds,Math.max(0,n.endExpected-now)):0,cut=now+fade;
      const offset=Math.min(r.buffer.duration,n.offset+Math.max(0,cut-n.when)*r.rate),remaining=Math.max(0,n.stopAt-cut);
      r.resume={offset,stopRemaining:remaining,notBefore:cut};r.state=remaining>0&&offset<r.buffer.duration?'paused':'ended';
      if(fade){n.gain.gain.cancelScheduledValues(now);n.gain.gain.setValueAtTime(r.gain,now);n.gain.gain.linearRampToValueAtTime(0,cut);n.endReason='graphic-pause-fade';n.source.stop(cut);n.stopAt=cut;n.endExpected=cut;}else disposeNode(n,'suspended-pause');
      log({event:'voice-pause',order:r.order,frame,at:now,offset,stopRemaining:remaining,notBefore:cut,pauseFadeSeconds:fade});
     }
    },
    resume(value=frame){if(!Number.isFinite(value)||value<frame||value>duration)throw Error('Invalid voice resume frame');frame=value;if(cancelled||finished||finishJob)return;if(!paused)return;paused=false;awaitResumeDraw=true;log({event:'resume-awaits-actual-draw',frame,at:context.currentTime});},
    cancel,
    finish(){
     if(finishJob)return finishJob;if(cancelled)return Promise.resolve({cancelled:true});if(!finalizedKeys)throw Error('Voice finish before final actual draw');if(paused||awaitResumeDraw)throw Error('Voice finish before resume actual draw');
     if(!stateValid()){cancel('finish-audio-owner-changed');return Promise.resolve({cancelled:true});}
     const missing=records.filter(r=>r.state==='pending');if(missing.length)throw Error('Final draw omitted a native voice onset');
     // A valid native miss may omit every voice. No audio tail exists, so a
     // suspended context must not impose an empty grace period on the battle.
     if(records.length===0){finished=true;closeWatcher();sessions.delete(instance);log({event:'finish-silent-no-tail',frame,at:context.currentTime});finishJob=Promise.resolve({cancelled:false});return finishJob;}
     finishCutoff=context.currentTime+.03/(options.speed/options.playbackSpeed);
     const completion=new Promise(resolve=>resolveFinish=resolve);finishJob=Promise.race([completion,cancelPromise]);
     for(const r of records){const n=r.node;if(r.state!=='playing'||!n||n.cleaned||n.endExpected<=finishCutoff)continue;
      n.gain.gain.cancelScheduledValues(finishCutoff);n.gain.gain.setValueAtTime(r.gain,finishCutoff);n.gain.gain.linearRampToValueAtTime(0,finishCutoff+.035);n.source.stop(finishCutoff+.045);n.stopAt=finishCutoff+.045;n.endExpected=Math.min(n.naturalEnd,n.stopAt);log({event:'native-finish-fade',order:r.order,at:finishCutoff,fadeSeconds:.035,stopAt:n.stopAt});
     }
     log({event:'finish-waits-native-tail',frame,at:context.currentTime,graceEnd:finishCutoff,activeNodes:nodes.size});checkFinish();return finishJob;
    },
    status(){return{mode:'native-battle-presentation',policy:'mapped-onset-ACK/native-relative-window',frame,paused,awaitResumeDraw,cancelled,finished,finalizedKeys,silent:records.length===0,ownedEpoch,drawnKeys:[...drawn],backend:{closed:cancelled||finished,activeRecords:nodes.size,pausedVoices:records.filter(r=>r.state==='paused').length,cancellingFade:cancelCleanupTimer!==null},voices:records.map(r=>({order:r.order,id:r.id,state:r.state,onsetFrame:r.onsetFrame,nativeStart:r.nativeStart,nativeEnd:r.nativeEnd,windowSeconds:r.windowSeconds,legacyRelativeStopSeconds:r.legacyRelativeStopSeconds,src:r.src,rate:r.rate,gain:r.gain,pan:r.pan,mirror:r.mirror,generation:r.generation})),ledger:ledger.slice(),droppedLogs,limits:['Native500205/360, exact normalized native52116, guarded native500/50339 and original60233/86/209/451, plus exact authored49543/49839/51010; dynamic fallback/runtime automation and cries are deliberately rejected. Native miss omits target voices; TailWhip keeps both original attacker voices.','Only onsets follow visual ACK; an already-started native voice continues through unrelated body holds. Separate onset spacing may stretch.','Native-relative window replaces the old browser absolute-end policy after onset remapping.','Two-ms fades adapt explicit graphic pauses/resumes; waveform continuity at those interruptions needs real Web Audio tests.','Mute or an epoch change suppresses this entire action without replay, matching the original beginMove cancellation policy.','Running-context cancel retains35ms fade/stop45ms with60ms owned cleanup fallback; suspended or error disposal is immediate.']};}
   };
   if(!initial.enabled||!context||context.state==='closed'){cancel('disabled-or-closed-at-prepare');return instance;}
   pendingPreparations.add(instance);
   context.addEventListener?.('statechange',onContextState);
   try{
    const result=await Promise.race([compile(events,options,plan,guardedLoad).then(compiled=>({compiled})),cancelPromise.then(cancellation=>({cancellation}))]);
    if(result.cancellation)return instance;
    if(!stillOwned()){cancel('action-cancelled-during-preparation',true);return instance;}
    const compiled=result.compiled;
    if(!stateValid()){cancel('preparation-superseded');return instance;}
    if(!compiled.native||compiled.voices.some(v=>v.kind!=='sfx'||v.loop||v.automation.length))throw Error('Dynamic scheduling is unsupported by this native battle action');
    for(const v of compiled.voices){const n=plan.voices.find(n=>n.order===v.order),e=events[v.order];if(!n||!e)throw Error('Native prepared voice lost its order binding');const buffer=v.mirror?swap(v.buffer):v.buffer;if(!buffer?.duration||!Number.isFinite(buffer.duration)||!Number.isFinite(v.rate)||v.rate<=0)throw Error('Invalid prepared native PCM');
     records.push({...v,id:e.id,buffer,onsetFrame:e.start,nativeStart:n.start,nativeEnd:n.end,windowSeconds:(n.end-n.start)/(60*options.speed),legacyRelativeStopSeconds:v.stop-v.start,state:'pending',generation:0,node:null,resume:null});
    }
   }catch(error){if(cancelled||preparationGeneration!==presentationGeneration){cancel('action-cancelled-during-preparation',true);return instance;}if(!stateValid()){cancel('preparation-superseded');return instance;}cancel('preparation-error');throw error;}finally{pendingPreparations.delete(instance);}
   sessions.add(instance);let stalledAt=null;
   watcher=window.setInterval(()=>{
    if(!stateValid()){cancel('audio-epoch-or-owner-changed');return;}
    const hidden=!!window.document?.hidden,at=window.performance?.now?.()??Date.now();
    if(context.state==='running'||hidden)stalledAt=null;else{stalledAt??=at;if(at-stalledAt>=500){cancel('foreground-audio-interruption');return;}}
    for(const entry of [...nodes])if(context.currentTime>=entry.endExpected+128/context.sampleRate)disposeNode(entry,'expected-context-end-observed');
    checkFinish();
   },16);
   log({event:'prepared-no-playback',voices:records.length,epoch:ownedEpoch,at:context.currentTime});return instance;
  }
  return{prepare,clear(reason='move-cancel',immediate=false){presentationGeneration++;for(const session of new Set([...pendingPreparations,...sessions,...retiring]))session.cancel(reason,immediate);},status(){return{active:sessions.size,pending:pendingPreparations.size,retiring:retiring.size,generation:presentationGeneration};}};
 }
 async function preparePresentation(events,options={}){
  // Each action claims its owner before IO. Cancelling a pending load settles
  // its caller without aborting the shared cache request or replaying a turn.
  cancelMove();
  const frozenOptions={...options,cryIds:{...options.cryIds},requiredKeys:Array.isArray(options.requiredKeys)?options.requiredKeys.slice():options.requiredKeys};
  const frozenEvents=Array.isArray(events)?events.map(event=>({...event,raw:Array.isArray(event.raw)?event.raw.slice():event.raw})):events;
  return presentationAudio.prepare(frozenEvents,frozenOptions);
 }
 function presentationStatus(){return presentationAudio.status();}
 function cancelMove(){presentationAudio.clear('move-cancel');if(!effectGroup)return;for(let v of effectGroup.voices)fadeStop(v,.035);effectGroup=null;}
 function beginMove(events,options){cancelMove();if(!enabled||!ctx)return;let group=effectGroup={voices:[],scheduled:[]},base=ctx.currentTime,speed=options.speed||1,plan=nativePlan(options.moveId,options.variant||0,options.side),dynamic=plan?null:window.NativeAudio?.plan(events,options.frames||600,options.side);events.forEach((e,order)=>{if(e.kind==='control'||e.kind==='panControl')return;let side=e.target===14?options.side:e.target===16?options.targetSide:options.side;if(options.miss&&e.target===16&&side!==options.side)return;let when=base+e.start/(60*speed);if(e.kind==='cry'){let id=cryId(options.cryIds?.[side]),mono=readyCries.get(id);if(!mono)return;let active=cryVoices(id,mono,e.raw,side,when,speed);group.voices.push(...active);group.scheduled.push({kind:'cry',at:e.start,when,reverse:!!e.raw?.[5],voices:active.length});return}let native=plan?.voices.find(v=>v.order===order),record=plan?(native&&nativeClip(native,speed,options.side)):(window.FIELD_AUDIO?.[e.id]||data.sounds[e.id]),buffer=cache.get(record?.src)?.buffer;if(!buffer)return;if(native?.mirror&&options.side==='p2')buffer=swap(buffer);let v=voice(buffer,sfxBus,{when,loop:plan?null:record.loop,kind:'sfx',rate:native?(speed===.5?1:speed):speed,pan:plan?0:side==='p1'?-.25:.25});if(native)v.source.stop(base+native.end/(60*speed));else{let script=dynamic?.find(x=>x.order===order);if(script){for(let control of script.automation){let at=when+control.frame/(60*speed);if(control.pitch64!==undefined)v.source.playbackRate.setValueAtTime(NativeAudio.pitchRate(control.pitch64)*speed,at);if(control.playerVolume127!==undefined)v.gain.gain.setValueAtTime(control.playerVolume127/127,at);if(control.pan128!==undefined)v.pan.pan.setValueAtTime(Math.max(-1,Math.min(1,control.pan128/128)),at)}v.source.stop(base+script.end/(60*speed));}}group.voices.push(v);group.scheduled.push({id:e.id,kind:e.kind,at:e.start,when,channel:e.channel,native:!!native});});el('audioControls').dataset.scheduled=group.scheduled.length;el('audioControls').dataset.move=options.moveId;el('audioControls').dataset.native=String(!!plan);}
 function stopSound(id){id=+id;const request=fieldSounds.get(id);if(!request)return;request.cancelled=true;if(request.voice)fadeStop(request.voice,.035);request.finish();}
 async function playSound(id,{offset=0}={}){id=+id;if(!enabled||!ctx)return;const previous=fieldSounds.get(id);if(previous)return previous.promise;const record=window.FIELD_AUDIO?.[id]||data.sounds[id];if(!record){problem(Error('Suono originale mancante: '+id));return;}
  let resolve;const request={epoch:audioEpoch,cancelled:false,voice:null,finished:false};request.promise=new Promise(done=>resolve=done);request.finish=()=>{if(request.finished)return;request.finished=true;if(fieldSounds.get(id)===request)fieldSounds.delete(id);resolve();};fieldSounds.set(id,request);
  void (async()=>{try{const buffer=await load(record.src);if(request.cancelled||request.epoch!==audioEpoch||!enabled||fieldSounds.get(id)!==request)return;request.voice=voice(buffer,sfxBus,{kind:'field',rate:window.GameSpeed?.rate||1,offset});request.voice.fieldId=id;await request.voice.done;}catch(e){if(!request.cancelled&&request.epoch===audioEpoch&&enabled)problem(e);}finally{request.finish();}})();return request.promise;
 }
 function setMono(mono){if(master){master.channelCount=mono?1:2;master.channelCountMode='explicit';}}
 function createCinematic(src,{ownsMusic=false}={}){
  let active=true,buffer=null,pending=null,current=null,origin=null,serial=0,failed=false,lastEpoch=audioEpoch,lastSync=null,musicClaimed=false;
  const stopVoice=()=>{if(current)fadeStop(current,.005);current=null;origin=null;lastSync=null;};
  async function prepare(){if(!active||!enabled||!ctx)return null;if(buffer)return buffer;if(pending)return pending;const token=++serial,epoch=audioEpoch;failed=false;
   pending=load(window.NativeTextLayout?.resource(src)||src).then(value=>{if(!active||token!==serial||epoch!==audioEpoch||!enabled)return null;buffer=value;cinematicBuffers.add(value);if(ownsMusic&&!musicClaimed){musicClaimed=true;cinematicMusicDepth++;applyMusicLevel(true);}return value;}).catch(error=>{if(!active||epoch!==audioEpoch||!enabled)return null;failed=true;throw error;}).finally(()=>{pending=null;});return pending;
  }
  function sync(frame,speed=window.GameSpeed?.rate||1){
   if(!active)return;if(!Number.isFinite(frame)||frame<0||!Number.isFinite(speed)||speed<=0||speed>8)throw Error('Tempo della sequenza audio non valido');
   if(lastEpoch!==audioEpoch){failed=false;lastEpoch=audioEpoch;}if(!enabled||!ctx||document.hidden||ctx.state!=='running'){stopVoice();return;}
   if(!buffer){if(!pending&&!failed)void prepare().catch(problem);return;}const offset=frame/30,now=ctx.currentTime;if(offset>=buffer.duration){stopVoice();return;}
   const predicted=origin?origin.offset+(now-origin.time)*origin.speed:0;if(current?.stopped||origin&&Math.abs(predicted-offset)>.08)stopVoice();
   if(!current){const item=voice(buffer,sfxBus,{kind:'cinematic',rate:speed,offset});current=item;origin={offset,time:item.startedAt,speed};void item.done.then(()=>{if(current===item){current=null;origin=null;}});}
   else if(speed!==origin.speed){current.source.playbackRate.setValueAtTime(speed,now);origin={offset,time:now,speed};}
   lastSync={time:Math.max(now,origin?.time??now),offset,speed};
  }
  function stop(){if(!active)return;active=false;serial++;stopVoice();if(buffer)cinematicBuffers.delete(buffer);buffer=null;if(musicClaimed){musicClaimed=false;cinematicMusicDepth--;applyMusicLevel(true);}trimCache();}
  return {prepare,sync,pause:stopVoice,stop,get status(){const sampledAt=ctx?.currentTime??null;return {ready:!!buffer,active:active&&!!current&&!current.stopped,offset:origin?origin.offset+(sampledAt-origin.time)*origin.speed:null,rate:origin?.speed??null,sampledAt,syncedAt:lastSync?.time??null,visualOffset:lastSync?.offset??null,visualRate:lastSync?.speed??null};}};
 }
 function cryWaveform(target){target.fill(0);if(enabled&&cryAnalyser)cryAnalyser.getFloatTimeDomainData(target);return target;}
 // Preserve scheduled native voices and their context time while gameplay is
 // paused. Resuming the context continues them instead of replaying the move.
 let visibilityPending=null;
 function syncVisibility(){
  if(!enabled||!ctx||ctx.state==='closed')return Promise.resolve();
  const current=ctx,token=audioEpoch,hidden=!!document.hidden;
  if(visibilityPending?.context===current&&visibilityPending.epoch===token)return visibilityPending.promise;
  if(hidden?current.state!=='running':current.state==='running')return Promise.resolve();
  const request={context:current,epoch:token,promise:null};
  try{request.promise=Promise.resolve(hidden?current.suspend():current.resume()).then(()=>{
   if(visibilityPending===request)visibilityPending=null;
   if(enabled&&current===ctx&&token===audioEpoch&&!!document.hidden!==hidden)return syncVisibility();
  },error=>{if(visibilityPending===request)visibilityPending=null;throw error;});}
  catch(error){return Promise.reject(error);}
  visibilityPending=request;return request.promise;
 }
 const reconcileVisibility=()=>{const current=ctx,token=audioEpoch;void syncVisibility().catch(error=>{if(enabled&&current===ctx&&token===audioEpoch)problem(error);});};
 document.addEventListener('visibilitychange',reconcileVisibility);
 const resume=()=>{if(!document.hidden)reconcileVisibility();};document.addEventListener('pointerdown',resume,{passive:true});document.addEventListener('keydown',resume);
 addEventListener('load',()=>window.GameSpeed?.subscribe(()=>{if(!ctx)return;for(const v of voices)if(v.kind==='field'&&!v.stopped)v.source.playbackRate.setValueAtTime(window.GameSpeed.rate,ctx.currentTime);}));
 const api=window.AudioEngine={cryData,cryWaveform,setMono,createCinematic,enable,disable,setScene,setMusicTrack,setFieldMusicVolume,get fieldMusicVolume(){return fieldMusicVolume},playSound,stopSound,cry,preloadMove,preloadEvents,preparePresentation,presentationStatus,get context(){return ctx||null},beginMove,cancelMove,get enabled(){return enabled},get scene(){return scene},get errors(){return errors},get scheduled(){return effectGroup?.scheduled||[]}};
 el('audioToggle').onclick=()=>enabled?disable():enable();
 for(let k of Object.keys(levels)){el('volume-'+k).value=Math.round(levels[k]*100);el('volume-'+k).oninput=e=>{levels[k]=+e.target.value/100;try{localStorage.setItem('soffiolieve-audio-levels',JSON.stringify(levels))}catch{}if(k==='music')applyMusicLevel();else if(ctx)(k==='sfx'?sfxBus:cryBus).gain.setTargetAtTime(levels[k],ctx.currentTime,.03)}}
 status('Premi Attiva audio per ascoltare la ROM.');
})();
