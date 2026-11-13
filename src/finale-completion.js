/* Browser checkpoints around IRBI342 mode0. Native866:1 supplies the save
 * mutations; this coordinator never supplies victories or enters postgame. */
(function(root){
 const stages=['credits','departure','prepare','end','complete'];
 async function prepare(options){
  const {native,data,VM,healParty,returnLocation}=options;
  if(native.flags.includes(2400))throw Error('Preparazione del primo finale già applicata');
  if(data?.source?.bank!==866||data.source.entry!==1||data.source.scriptSHA256!=='6d7de82b6fe0a81856cd19e9ce2c2652a2635e2c5258f2a8f269c3f9ab878c0b')throw Error('Programma di completamento originale non valido');
  const draft=structuredClone(native);let party;
  const child=new VM({scripts:{866:data.program}},draft,{async command(c,a,v){
   switch(c.name){
    case 'PokePartyRecoverAll':party=await healParty();break;
    case 'NativeOpcode217':if(!returnLocation.set(draft,v[0]))throw Error('Ritorno finale non valido');break;
    case 'NativeOpcode220':if(v.length!==5||v[0]!==391||v[1]!==1||v[2]!==5||v[3]!==0||v[4]!==6)throw Error('Posizione finale originale non valida');draft.endingPosition={type:1,zone:v[0],warp:-1,facing:v[1],x:v[2],height:v[3],z:v[4]};break;
    case 'NativeOpcode228':if(![1,2].includes(v[0]))throw Error('Stato finale originale non valido');draft.completionBits=(draft.completionBits||0)|v[0];break;
    case 'MapReplaceSetEvent':if(![1,5].includes(v[0])||v[2]!==0)throw Error('Variante finale originale non valida');draft.endingMapEvents={...draft.endingMapEvents,[v[0]]:v[1]};if(v[0]===1)draft.roomMess=!!v[1];break;
    default:throw Error('Comando inatteso nella preparazione finale: '+c.name);
   }return true;
  }});
  await child.run(866,1);
  if(!Array.isArray(party)||!draft.flags.includes(2400)||(draft.completionBits&1)!==1||!draft.endingPosition)throw Error('Preparazione finale incompleta');
  // Publish together only after the original program has finished. No disk
  // write occurs inside the script, so retries cannot select its second branch.
  for(const key of Object.keys(native))delete native[key];Object.assign(native,draft);
  return party;
 }
 function normalize(native){
  const p=native?.firstEnding;
  if(p===undefined)return null;
  if(!p||p.version!==1||!stages.includes(p.stage)||![5,6].includes(native.vars?.[16566])||![278,391].includes(native.zone)||(['end','complete'].includes(p.stage)&&!native.flags?.includes(2400))){delete native.firstEnding;return null;}
  return native.firstEnding={version:1,stage:p.stage};
 }
 function create(options){
  const n=options.native;let current=null;
  async function persist(){
   // Retry the same serialization, never an event or native preparation.
   for(let attempt=0;;attempt++){
    let error;try{if(await options.save())return;error=Error('Salvataggio finale non disponibile');}catch(e){error=e;}
    if(!options.recover)throw error;
    await options.recover(error,attempt);
   }
  }
  async function execute(){
   if(!normalize(n)){
    if(n.zone!==278||n.vars?.[16566]!==5)throw Error('Primo finale fuori dalla fase originale');
    n.firstEnding={version:1,stage:'credits'};
   }
   await persist();
   while(n.firstEnding.stage!=='complete'){
    const stage=n.firstEnding.stage;
    if(stage==='credits')await options.credits();
    else if(stage==='departure')await options.departure(7);
    else if(stage==='prepare'){
     // A thrown native preparation must leave an untouched state. The host
     // executes the verified program transactionally before this returns.
     await options.prepare();
     if(!n.flags.includes(2400))throw Error('Preparazione nativa del finale incompleta');
    }else if(stage==='end')await options.end();
    n.firstEnding={version:1,stage:stages[stages.indexOf(stage)+1]};
    await persist();
   }
   await options.complete?.();
  }
  function run(){if(current)return current;current=execute().finally(()=>{current=null;});return current;}
  return{run,get active(){return !!current;}};
 }
 const api={create,normalize,prepare};root.FinaleCompletion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
