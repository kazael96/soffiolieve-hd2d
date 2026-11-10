/* Isolated QA only: immutable, ordered artifacts with explicit acknowledgement. */
(function(root){
 function create(send){
  let tail=Promise.resolve();const failures=[];
  function enqueue(kind,payload){const body=JSON.stringify(payload),task=tail.then(()=>send(kind,body));tail=task.catch(error=>{failures.push(String(error));});return task;}
  async function flush(){await tail;if(failures.length)throw Error('QA artifact write failed: '+failures.join('; '));}
  return {enqueue,flush};
 }
 const api={create};root.QAArtifactQueue=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
