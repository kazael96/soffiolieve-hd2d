/* Isolated QA instrumentation. Never loaded by the published game. */
(function(root){
 function create({maxGapMs=1000}={}){
  if(!Number.isFinite(maxGapMs)||maxGapMs<=0)throw Error('Invalid QA input frame budget');
  let failure=null;
  return {
   sample({dt,held,locked=false}){
    if(!failure&&held&&!locked&&Number.isFinite(dt)&&dt>maxGapMs){
     failure=Error('QA input bench stalled while holding '+held+': '+Math.round(dt)+'ms between frames; replay is not valid collision evidence');
     failure.code='QA_INPUT_FRAME_STALL';
     failure.details={gapMs:dt,key:held,maxGapMs};
    }
    return failure;
   },
   assert(){if(failure)throw failure;}
  };
 }
 const api={create};root.QAInputHealth=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
