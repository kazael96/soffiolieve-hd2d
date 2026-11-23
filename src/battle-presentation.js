/* A battle pose advances only after its complete visible draw is acknowledged.
 * Ordinary draws count rendering time; required poses and interrupted draws
 * hold their own frame instead of accumulating catch-up time.
 */
(function(root){
 'use strict';
 function create({duration,keys,now=0}){
  if(!Number.isFinite(duration)||duration<=0||!Number.isFinite(now)||!Array.isArray(keys)||keys.length>256)throw Error('Invalid battle presentation clock');
  const required=Object.freeze([...new Set([0,...keys,duration])].sort((a,b)=>a-b));
  if(required.some(frame=>!Number.isFinite(frame)||frame<0||frame>duration))throw Error('Invalid battle presentation key');
  let value=0,anchorAt=now,lastObserved=now,serial=0,pending=null,pendingSampleAt=now,rejected=false,holdValue=false,cancelled=false,complete=false,paused=false;
  const shown=new Set();
  function observe(at){if(!Number.isFinite(at)||at<lastObserved)throw Error('Battle presentation time must be monotonic');lastObserved=at;}
  function begin(at){
   observe(at);if(cancelled||complete||paused)return null;if(pending)return pending;
   if(shown.size&&!holdValue){const desired=Math.min(duration,value+(at-anchorAt)*.06),next=required.find(frame=>frame>value);value=next!==undefined&&next<=desired?next:desired;}
   pendingSampleAt=at;rejected=false;holdValue=false;pending=Object.freeze({id:++serial,frame:value});return pending;
  }
  function presented(token,at,{drawable=true,visible=true}={}){
   if(!pending||token!==pending||cancelled||complete||paused)return false;observe(at);if(!drawable||!visible){rejected=true;return false;}
   const key=required.includes(value);if(key)shown.add(value);anchorAt=key||rejected?at:pendingSampleAt;pending=null;rejected=false;complete=value===duration;
   return Object.freeze({frame:value,key,complete,nextKey:required.find(frame=>frame>value)??null});
  }
  function pause(at){observe(at);if(cancelled||complete)return;paused=true;pending=null;anchorAt=at;rejected=false;holdValue=true;}
  function resume(at){observe(at);if(cancelled||complete)return;paused=false;pending=null;anchorAt=at;rejected=false;holdValue=true;}
  return Object.freeze({get value(){return value;},begin,presented,pause,resume,cancel(){cancelled=true;pending=null;},snapshot(){return{value,shown:[...shown],required,complete,cancelled,paused,pending};}});
 }
 // Colpocoda has no target-impact sound. Native attacker cues map to60 and
 //86.25; retain those onsets while protecting both authored tail gestures.
 const tailDefinition=Object.freeze({nativeFrames:88,nativeAnchor:0,cues:[],keys:[0,12.6,21.42,25.2,31.5,42.84,45.36,56.7,60,69.3,75.6,78.12,88.2,99.54,100.8,109.62,110.88,117.18,126]});
 const definitions=Object.freeze({
  '500:205':Object.freeze({nativeFrames:112,nativeAnchor:41,cues:[1475],keys:[0,25,38,48,60,63,84,98,107,116,126]}),
  '500:360':Object.freeze({nativeFrames:135,nativeAnchor:84,cues:[1686],keys:[0,25,36,48,60,63,88,102,110,119,126]}),
  '521:16':Object.freeze({nativeFrames:182,nativeAnchor:34,cues:[1497,1717],keys:[0,8,9,21,33,43,54,64,78,91,95,101,106,111,112,126]}),
  '500:39':tailDefinition,'503:39':tailDefinition,
  // Existing602 recipe: wind reaches1 at.23 and releases at.74.
  // Contact advance peaks at impact, returns at impact+.08, ends at.94;
  // sampled phase landmarks also retain its sin6 tail / sin4 electric pulses.
  '602:33':Object.freeze({nativeFrames:72,nativeAnchor:24,cues:[1437],keys:[0,10.5,28.98,31.5,52.5,60,70.08,73.5,93.24,94.5,115.5,118.44,126]}),
  '602:209':Object.freeze({nativeFrames:245,nativeAnchor:193,cues:[1505,1458],keys:[0,10.5,28.98,31.5,52.5,60,70.08,73.5,93.24,94.5,115.5,118.44,126]}),
  '602:86':Object.freeze({nativeFrames:205,nativeAnchor:53,cues:[1522],keys:[0,10.5,15.75,28.98,31.5,47.25,52.5,60,73.5,78.75,93.24,94.5,110.25,115.5,126]}),
  '602:451':Object.freeze({nativeFrames:194,nativeAnchor:0,cues:[],keys:[0,10.5,15.75,28.98,31.5,47.25,52.5,60,73.5,78.75,93.24,94.5,110.25,115.5,126]})
 });
 function plan(profile,sequence){
  const definition=definitions[profile?.species+':'+profile?.id];if(!definition)return null;
  if(profile.frames!==126||profile.impact!==60||profile.nativeEffects!==true||sequence?.frames!==126||sequence.nativeFrames!==definition.nativeFrames||sequence.nativeAnchor!==definition.nativeAnchor||!Array.isArray(sequence.audio))throw Error('Supported battle presentation timing changed');
  if(profile.id===39){
   if(profile.kind!=='nativeTailWhipStatus064'||profile.tailWhip064!=='native500503TailWhip064'||profile.damage!==false||profile.target!=='foe')throw Error('TailWhip presentation requires its guarded native status profile');
   if(sequence.audio.length!==2||sequence.audio.some((event,i)=>event.kind!=='sfx'||event.id!==1527||event.channel!==1||event.target!==14||event.start!==[60,86.25][i]))throw Error('Native TailWhip attacker cue changed');
  }
  if(profile.species===602){
   const kind={33:'bodyRam',86:'electricWave',209:'flameRush',451:'electricWave'}[profile.id];
   if(!kind||profile.kind!==kind||profile.training!==true||profile.chapter!==true||profile.target!=='foe'||profile.damage!==(profile.id!==86)||profile.graphic!==undefined&&profile.graphic!==602)throw Error('Tynamo presentation requires its unchanged native recipe');
   if(profile.id===451)for(const [id,start]of[[1445,60],[1963,90.61855670103093],[1407,90.61855670103093]]){const cues=sequence.audio.filter(event=>event.kind==='sfx'&&event.id===id&&event.target===14);if(cues.length!==1||cues[0].start!==start)throw Error('Native Tynamo attacker cue changed');}
  }
  for(const id of definition.cues){const cues=sequence.audio.filter(event=>event.kind==='sfx'&&event.id===id&&event.target===16);if(cues.length!==1||cues[0].start!==60)throw Error('Native battle impact cue changed');}
  const keys=definition.keys.slice();for(const event of sequence.audio){if(!Number.isFinite(event.start)||event.start<0||event.start>126||!['sfx','control','panControl'].includes(event.kind))throw Error('Invalid supported battle audio event');keys.push(event.start);}
  return Object.freeze({duration:126,keys:Object.freeze([...new Set(keys)].sort((a,b)=>a-b))});
 }
 const api=Object.freeze({create,plan});root.BattlePresentation=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
