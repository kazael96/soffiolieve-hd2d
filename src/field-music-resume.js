/* IRBI request4: fade out, restore the current field music, then fade in.
 * 161 waits for completion;162 only submits the request. The browser keeps
 * the field voice while full movie soundtracks own the music bus separately.
 */
(function(root){
 function create({state,volume,scene=()=>{},cancelScene=()=>{},onError=()=>{}}){
  const queue=[];let current=null;
  function next(){if(current||!queue.length)return;current=queue.shift();current.phase='out';volume(root.FieldMusicFade.start(state,0,current.out));advance();}
  function advance(){
   if(!current)return;
   if(current.valid&&!current.valid()){delete state.fieldMusicFade;state.fieldMusicVolume=127;volume(127);finish(false);return;}
   if(state.fieldMusicFade)return;
   if(current.phase==='install')return;
   if(current.kind==='change'||current.kind==='restore'){
    if(current.phase==='in'){finish(true);return;}
    const token=current;token.phase='install';
    Promise.resolve().then(()=>{if(current===token&&(!token.valid||token.valid()))return scene(token.sequence);}).then(()=>{if(current!==token)return;if(token.valid&&!token.valid()){advance();return;}state.music=token.sequence;token.phase='in';volume(root.FieldMusicFade.start(state,127,token.inside));if(!state.fieldMusicFade)finish(true);},error=>{if(current!==token)return;if(token.valid&&!token.valid()){advance();return;}token.reject(error);current=null;onError(error);next();});return;
   }
   if(current.phase==='out'){current.phase='in';volume(root.FieldMusicFade.start(state,127,current.inside));if(state.fieldMusicFade)return;}
   finish(true);
  }
  function finish(value){const completed=current;current=null;completed.resolve(value);next();}
  function request(out,inside){
   if(![out,inside].every(v=>Number.isInteger(v)&&v>=0&&v<=65535))throw Error('Tempi musicali nativi non validi');
   const promise=new Promise(resolve=>queue.push({kind:'resume',out,inside,resolve}));next();return promise;
  }
  function change(sequence,frames){if(!Number.isInteger(sequence)||sequence<1000||sequence>2500||!Number.isInteger(frames)||frames<0||frames>65535)throw Error('Cambio musicale nativo non valido');const promise=new Promise((resolve,reject)=>queue.push({kind:'change',sequence,out:frames,inside:0,resolve,reject}));next();return promise;}
  // IRBI587 ->021aef44/02029820 submits mode5: current map sequence,
  // caller-supplied fade out, fixed60-frame fade in. The field task yields
  // once after submission; it does not block the script for the entire fade.
  function restore(sequence,out,inside=60,valid){if(!Number.isInteger(sequence)||sequence<1000||sequence>2500||![out,inside].every(v=>Number.isInteger(v)&&v>=0&&v<=65535)||valid!==undefined&&typeof valid!=='function')throw Error('Ripristino musicale nativo non valido');const promise=new Promise((resolve,reject)=>queue.push({kind:'restore',sequence,out,inside,resolve,reject,valid}));next();return promise;}
  function stop(frames){void change(1001,frames).catch(()=>{});}
  function reset(){const install=current?.phase==='install',pending=[...(current?[current]:[]),...queue];current=null;queue.length=0;if(install)Promise.resolve(cancelScene()).catch(onError);delete state.fieldMusicFade;state.fieldMusicVolume=127;volume(127);for(const request of pending)request.resolve(false);}
  return {request,change,restore,stop,tick:advance,reset,get busy(){return !!current||queue.length>0;}};
 }
 root.FieldMusicResume={create};
})(typeof window==='undefined'?globalThis:window);
