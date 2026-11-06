const fs=require('node:fs'),vm=require('node:vm');
function fixture(){
 const starts=[],reads=[],sources=[],gains=[],contexts=[],held=new Map(),elements=new Map(),listeners={};
 const element=id=>{if(!elements.has(id))elements.set(id,{dataset:{},value:0,setAttribute(){}});return elements.get(id);};
 const param=()=>({value:1,setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},cancelScheduledValues(){}}),node=()=>({gain:param(),pan:param(),connect(){},disconnect(){}});
 const buffer=(channels=1,length=32,sampleRate=32)=>{const arrays=Array.from({length:channels},()=>new Float32Array(length));return {numberOfChannels:channels,length,sampleRate,duration:length/sampleRate,getChannelData:i=>arrays[i]};};
 const wav=()=>{const bytes=new ArrayBuffer(48),d=new DataView(bytes),s=(at,t)=>[...t].forEach((c,i)=>d.setUint8(at+i,c.charCodeAt(0)));s(0,'RIFF');d.setUint32(4,40,true);s(8,'WAVE');s(12,'fmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,22050,true);d.setUint16(34,16,true);s(36,'data');d.setUint32(40,4,true);d.setInt16(44,100,true);d.setInt16(46,-100,true);return bytes;};
 const payload=src=>src.endsWith('.wav')?wav():{src};
 class AudioContext{
  constructor(){contexts.push(this);this.currentTime=1;this.state='running';this.destination=node();}
  resume(){this.state='running';return Promise.resolve();}
  createGain(){const gain=node();gains.push(gain);return gain;}createStereoPanner(){return node();}
  createAnalyser(){return {...node(),getFloatTimeDomainData(a){a.fill(0);}};}
  createBuffer(...args){return buffer(...args);}
  decodeAudioData(raw){return Promise.resolve({...buffer(1,12000,1000),src:raw.src});}
  createBufferSource(){const source={...node(),playbackRate:param(),stopCalls:[],finished:false,start(when,offset){starts.push({source,when,offset,rate:this.playbackRate.value,src:this.buffer?.src});},stop(when){this.stopCalls.push(when);this.finish();},finish(){if(this.finished)return;this.finished=true;this.onended?.();}};sources.push(source);return source;}
 }
 const c={console,TextEncoder,TextDecoder,DataView,ArrayBuffer,Float32Array,Promise,AudioContext,document:{hidden:false,getElementById:element,addEventListener(){}},addEventListener:(name,fn)=>listeners[name]=fn,setInterval:()=>0,clearInterval(){},localStorage:{getItem:()=>null,setItem(){}},ROM_AUDIO_CATALOG:{music:{town:100},moveSounds:{},cries:Object.fromEntries([521,592,585,586].map(id=>[id,{file:'cry-'+id+'.wav',nativeSpeed:32768,baseVolume:100}]))},ROM_AUDIO:{sounds:{100:{src:'music.flac',loop:[0,12]},1351:{src:'beep.flac'},1738:{src:'motor.flac'},1739:{src:'brake.flac'},1741:{src:'barrier.flac'},1754:{src:'motor-back.flac'}}},GameSpeed:{rate:1,subscribe(fn){this.listener=fn;}},NativeAudio:{plan:()=>null,cryParameters:()=>({reverse:false,voices:[{volume:1,rate:1,speed:32768}]})},AudioPlayback:{bytes:src=>{reads.push(src);return held.get(src)?.promise||Promise.resolve(payload(src));},ended(source,context,cleanup){return new Promise(resolve=>source.onended=()=>{cleanup();resolve();});}}};
 c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('src/pokemon-visuals.js','utf8'),c);vm.runInContext(fs.readFileSync('src/audio-engine.js','utf8'),c);listeners.load?.();
 const drain=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
 return {c,api:c.AudioEngine,starts,reads,sources,gains,contexts,elements,drain,hold(src){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});held.set(src,{promise});return {resolve:()=>resolve(payload(src)),reject};},fieldStarts:()=>starts.filter(s=>s.src!=='music.flac')};
}
module.exports={fixture};
