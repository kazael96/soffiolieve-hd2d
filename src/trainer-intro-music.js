/* OP139 changes the field music before the encounter movement/dialogue. */
(function(root){
 function sequence(trainer,table=root.TRAINER_INTRO_MUSIC){
  if(!trainer||!Number.isInteger(trainer.trainerClass)||!table||!Number.isInteger(table.fallback))throw Error('Musica di incontro originale non disponibile');
  return table.classMusic[trainer.trainerClass]??table.fallback;
 }
 async function start(id,{trainers=root.OPENING_TRAINERS,table=root.TRAINER_INTRO_MUSIC,catalog=root.FIELD_AUDIO,audio=root.AudioEngine}={}){
  const music=sequence(trainers?.[id],table);
  if(!catalog?.[music]||!audio?.setScene)throw Error('Risorsa della musica di incontro mancante: '+music);
  // The shared audio engine owns resource retry, cancellation and mute state.
  // Do not persist a temporary encounter theme as the map's recovery music.
  await audio.setScene(music);return music;
 }
 const api={sequence,start};root.TrainerIntroMusic=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
