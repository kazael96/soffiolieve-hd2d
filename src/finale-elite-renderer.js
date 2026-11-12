/* Original hero/support models draw in the field's depth buffer and native camera. */
(function(root){
 function create({controller,renderer,state,hero,face,resetInput,play,stop,coverFailure=()=>{},prepareAudio=async()=>{},resourceGate=async(key,operation)=>operation()}){
  if(!controller||!renderer)throw Error('Renderer della Lega non disponibile');
  let target=null,preset=null,suspended=false;const records=new Map();
  function record(r){
   if(records.has(r.model.key))return records.get(r.model.key);
   const data={key:'fn-field-elite-'+r.model.member,model:r.model.url,mode:2,nativeFormats:['BCA0','BTP0'],animations:{0:{frames:r.entry.nativeFrames}},materialTextures:{0:JSON.parse(JSON.stringify(r.model.patterns))}};
   records.set(r.model.key,data);return data;
  }
  const task=root.FinaleEliteTask.create({state,hero,face,resetInput,play,stop,coverFailure,
   entryPosition:r=>{const trigger=root.FINALE_EVENTS?.zones?.[r.zone]?.triggers?.find(t=>t.script===2&&t.var===16384&&t.width===1&&t.height===1);if(!trigger)throw Error('Casella originale di ingresso non disponibile');return {x:trigger.x-15.5,y:trigger.z-15.5};},
   prepare:r=>resourceGate('elite-entrance',async()=>{const row=record(r),[loaded]=await Promise.all([controller.load([row]),prepareAudio([...new Set(r.control.events.filter(e=>e.action==='play').map(e=>e.id))])]);if(!loaded)throw controller.error||Error('Modello originale della Lega non pronto');}),
   show:r=>{target={instance:{model:r.model.key},record:record(r),x:0,y:0,z:0,rotation:0,animation:0,frame:0};},
   update:r=>{if(target)target.frame=r.frame;},hide:()=>{target=null;renderer.taskProjection=null;},
   startSupport:r=>{if([142,143].includes(r.zone)){const type=8,x=r.zone===142?8:0;if(!controller.property(type,x,0,2))throw Error('Supporto originale della Lega non disponibile');}},
   endSupport:(r,completed)=>{if([142,143].includes(r.zone)){const x=r.zone===142?8:0;controller.property(8,x,0,1);controller.property(8,x,0,3);}if(completed){state().fieldHeight=renderer.groundHeight(hero().x,hero().y);setPreset(r.room);}}
  });
  function setPreset(room){
   const row=root.FINALE_CAMERA_PRESETS?.presets?.[27+room];
   if(!Number.isInteger(room)||state().zone!==139+room||!row||row.rawWords.length!==11)throw Error('Preset originale della Lega non disponibile');
   preset={zone:139+room,row};suspended=false;
  }
  function sample(){
   const r=task.snapshot;if(r?.visible)return r.entry.camera.samples[r.frame];
   if(!preset||preset.zone!==state().zone||suspended)return null;
   const v=preset.row.rawWords;if(v[3]!==0||v[4]!==238551040||v[7]!==1)throw Error('Preset della Lega non compatibile');
   const p=v[1]*Math.PI*2/65536,d=v[0]/16,h=hero(),y=renderer.groundHeight(h.x,h.y),target=[h.x+v[8]/65536,y+v[9]/65536,h.y+v[10]/65536];
   return [1,1,1,-p*180/Math.PI,v[2]*360/65536,0,target[0]*16,(target[1]+d*Math.sin(p))*16,(target[2]+d*Math.cos(p))*16];
  }
  function projection(w,h,zoom){const s=sample();return s?root.FinaleEliteTask.cameraMatrix(s,w,h,zoom):null;}
  function applyCamera(r){const s=sample();if(r!==renderer||!s)return ()=>{};const pitch=r.cameraPitch,yaw=r.yaw,p=-s[3]*Math.PI/180;r.cameraPitch=[Math.sin(p),Math.cos(p)];r.yaw=s[4]*Math.PI/180;return ()=>{r.cameraPitch=pitch;r.yaw=yaw;};}
  function draw(r){if(target&&r===renderer)controller.draw(target.instance,[target]);}
  function enter(){task.cancel();preset=null;suspended=false;renderer.taskProjection=null;}
  return {begin:task.begin,tick:task.tick,cancel:task.cancel,actor:task.actor,enter,projection,draw,applyCamera,setPreset,suspendCamera:()=>{suspended=true;},resumeCamera:()=>{suspended=false;},get hidden(){return task.hidden;},get busy(){return task.busy;},get snapshot(){return task.snapshot;}};
 }
 const api={create};root.FinaleEliteRenderer=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
