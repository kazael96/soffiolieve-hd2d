/* Native595/596:02028714/0202878c, signed division over logical30Hz updates. */
(function(root){
 const valid=v=>Number.isInteger(v)&&v>=0&&v<=127;
 function volume(state){if(!valid(state.fieldMusicVolume))state.fieldMusicVolume=127;return state.fieldMusicVolume;}
 function start(state,target,frames){
  if(!valid(target)||!Number.isInteger(frames)||frames<0||frames>65535)throw Error('Dissolvenza audio nativa non valida');
  const from=volume(state);if(!frames){state.fieldMusicVolume=target;delete state.fieldMusicFade;return target;}
  state.fieldMusicFade={from,target,frames,elapsed:0};return from;
 }
 function tick(state,seconds){
  volume(state);const f=state.fieldMusicFade;if(!f)return state.fieldMusicVolume;
  if(!valid(f.from)||!valid(f.target)||!Number.isInteger(f.frames)||f.frames<1||f.frames>65535||!Number.isFinite(f.elapsed)||f.elapsed<0||f.elapsed>f.frames){delete state.fieldMusicFade;return state.fieldMusicVolume;}
  if(!Number.isFinite(seconds)||seconds<0)return state.fieldMusicVolume;
  f.elapsed=Math.min(f.frames,f.elapsed+seconds*30);const elapsed=Math.min(f.frames,Math.floor(f.elapsed+1e-8));
  state.fieldMusicVolume=f.from+Math.trunc((f.target-f.from)*elapsed/f.frames);
  if(elapsed===f.frames)delete state.fieldMusicFade;return state.fieldMusicVolume;
 }
 root.FieldMusicFade={start,tick,volume};
})(typeof window==='undefined'?globalThis:window);
