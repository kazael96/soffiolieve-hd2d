/* IRBI visual task reconstruction. Native timing/data, adapted HD-2D projection. */
(function(root){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),fx=x=>x/4096;
 const supported=new Set([0,1,3,4,18,19,21,22,23,25,26,27,28,29,36,37,40,42,43,51]);
 function blend(a,t){let interval=(a[3]<<24)>>24,step=interval<0?1-interval:1,skip=Math.max(0,interval),n=t<1?0:1+Math.floor((t-1)/(skip+1));return a[1]+Math.sign(a[2]-a[1])*Math.min(Math.abs(a[2]-a[1]),n*step)}
 function vectorDuration(mode,steps,interval,cycles){if([0,6].includes(mode)||steps<=0)return 0;let n=steps*([2,3,4].includes(mode)?Math.max(1,cycles)*2:1);return 1+(n-1)*(Math.max(0,interval)+1)}
 function duration(op,a){
  if(op===0||op===1){if(op===0&&[14,15,16,18,19,20].includes(a[1]))return 0;let steps=op===0?a[2]:a[7],interval=op===0?a[3]:a[8],decay=op===0?a[4]:a[9];if(decay>0&&decay<steps)steps=steps*2-decay;return vectorDuration(a[0]===0?0:1,steps,interval,1)}
  if(op===3)return vectorDuration(3,a[3],a[4],Math.max(1,a[5])*2);
  if([18,21].includes(op))return vectorDuration(a[1],a[4],a[5],a[6]);
  if([22,23].includes(op))return vectorDuration(a[1],a[3],a[4],a[5]);
  if(op===19){let period=Math.max(1,a[5]>>12),interval=Math.max(0,a[6]>>12),cycles=Math.max(1,a[7]>>12);return cycles*period*(interval+1)+Math.max(0,a[8])*(cycles-1)}
  if(op===25)return a[1]===2?(Math.max(0,a[2])+1)*Math.max(1,a[3])*2:0;
  if(op===27||op===42){let i=(a[3]<<24)>>24,n=Math.ceil(Math.abs(a[2]-a[1])/(i<0?1-i:1));return n?1+(n-1)*(Math.max(0,i)+1):0}
  if(op===37)return a[0]===4?Math.max(0,a[3])+1:vectorDuration(a[0],a[3],a[4],a[5]);
  return 0;
 }
 function resolve(code,attacker,target){if([9,14,15].includes(code))return[attacker];if([11,16,17].includes(code))return[target];if(code===18)return['p1','p2'];if(code===0)return['p1'];if(code===1)return['p2'];return[target]}
 function curve(origin,end,mode,steps,interval,cycles,t,relative=false){
  if(mode===5)end=origin.map(()=>0);
  if(mode===6)return origin.map(()=>0);
  let delta=end.map((v,i)=>relative||[2,3,4].includes(mode)?v:v-origin[i]);
  if(mode===0)return end.slice();
  if(steps<=0)return origin.map((v,i)=>v+delta[i]);
  let count=t<1?0:1+Math.floor((t-1)/(Math.max(0,interval)+1));
  if([1,5].includes(mode))return origin.map((v,i)=>v+delta[i]*Math.min(count,steps)/steps);
  let legs=Math.max(1,cycles)*2;
  if(count>=steps*legs)return origin.slice();
  let leg=Math.floor(count/steps),n=count%steps,k=0,sign=1;
  for(let l=0;l<leg;l++){k+=sign;if(mode===2||((legs-l-1)&1))sign=-sign}
  return origin.map((v,i)=>v+delta[i]*(k+sign*n/steps));
 }
 function sprite(events,f,side,attacker='p1',target='p2',initialVisible=true){
  let state={x:0,y:0,z:0,scale:1,scaleX:1,scaleY:1,rotation:0,alpha:1,tint:0,color:32767,visible:initialVisible,suppressSecondaryPass:false,renderFlags:0},tracks={};
  const initial={position:[0,0],scale:[1,1],rotation:[0],alpha:[31]};let tintTrack=null,saved=true;
  for(let e of events){if(e.start>f||!resolve(e.args[0],attacker,target).includes(side))continue;let a=e.args,t=f-e.start,property=[18,21,22,23].includes(e.op)?({18:'position',21:'scale',22:'rotation',23:'alpha'})[e.op]:null;
   if(property){let prior=tracks[property],origin=prior?prior.sample(e.start-prior.start):initial[property],end,steps,interval,cycles;
    if(e.op===18||e.op===21){end=[fx(a[2]),fx(a[3])];if(e.op===18&&side==='p2')end[0]=-end[0];steps=a[4];interval=a[5];cycles=a[6]}
    else{end=[e.op===22?a[2]/4096*Math.PI*2/65536:a[2]];steps=a[3];interval=a[4];cycles=a[5]}
    let mode=a[1],sample=q=>curve(origin,end,mode,steps,interval,cycles,q,e.op===18&&mode===1);tracks[property]={sample,start:e.start};
   }
   if(e.op===19&&t<=duration(19,a)){
    let period=Math.max(1,a[5]>>12),interval=Math.max(0,a[6]>>12),cycleTicks=period*(interval+1),cycle=Math.floor(t/(cycleTicks+Math.max(0,a[8]))),local=t-cycle*(cycleTicks+Math.max(0,a[8]));
    if(cycle<Math.max(1,a[7]>>12)&&local<cycleTicks){let phase=Math.floor(local/(interval+1))/period*Math.PI*2*(a[1]&1?-1:1),A=fx(a[3]),B=fx(a[4]),u=0,v=0;
     if(a[2]===0){u=A*(1-Math.cos(phase));v=-B*Math.sin(phase)}else if(a[2]===1){u=A*(Math.cos(phase)-1);v=B*Math.sin(phase)}else if(a[2]===2){u=-A*Math.sin(phase);v=B*(1-Math.cos(phase))}else{u=A*Math.sin(phase);v=B*(Math.cos(phase)-1)}
     if(side==='p2')u=-u;let plane=(a[1]&7)>>1;if(plane===1){state.x+=u*12;state.y+=v*5;state.z+=v}else if(plane===2){state.x+=u*12;state.y-=v*12}else{state.y-=u*12;state.y+=v*5;state.z+=v}
    }
   }
   if(e.op===27)tintTrack={a,start:e.start};
   if(e.op===28){if(a[1]===0)state.visible=!state.visible;if(a[1]===1)state.visible=false;if(a[1]===2||a[1]===5)state.visible=true;if(a[1]===3){saved=state.visible;state.visible=false}if(a[1]===4)state.visible=saved}
   if(e.op===25){if(a[1]===3)state.visible=false;if(a[1]===4)state.visible=true;if(a[1]===2&&t<duration(25,a))state.visible=Math.floor(t/(Math.max(0,a[2])+1))%2===0}
   if(e.op===29)state.suppressSecondaryPass=!!a[1];
   if(e.op===26){if(a[1]===1)state.renderFlags|=1;else if(a[1]===2)state.renderFlags|=2;else if(a[1]===3)state.renderFlags&=~2;else state.renderFlags&=~1}
  }
  for(let [key,track]of Object.entries(tracks)){let v=track.sample(f-track.start);if(key==='position'){state.x+=v[0]*12;state.y-=v[1]*12}else if(key==='scale'){state.scaleX=v[0];state.scaleY=v[1]}else if(key==='rotation')state.rotation=v[0];else state.alpha=clamp(v[0]/31,0,1)}
  if(tintTrack){state.tint=clamp(blend(tintTrack.a,f-tintTrack.start)/16,0,1);state.color=tintTrack.a[4]}
  state.pauseAnimation=state.renderFlags!==0;if(!state.visible)state.alpha=0;return state;
 }
 function camera(events,f,side='p1',target='p2'){
  const db=root.ROM_VISUAL_CAMERA,def={eye:db?.defaultEye||[27443,27443,70861],target:db?.defaultTarget||[0,10650,0]};let current=def,track=null,shake=[0,0];
  function sample(t){if(!track)return current;let n=t<=track.start?0:1+Math.floor((t-track.start-1)/(track.interval+1)),progress=track.decay>0&&n>track.decay?track.decay+(n-track.decay)*.5:n,p=clamp(progress/Math.max(1,track.steps),0,1);return{eye:track.from.eye.map((v,i)=>v+(track.to.eye[i]-v)*p),target:track.from.target.map((v,i)=>v+(track.to.target[i]-v)*p)}}
  for(let e of events){if(e.start>f)continue;let a=e.args,t=f-e.start;
   if(e.op===0||e.op===1){let from=sample(e.start),to;
    if(e.op===0){let id=a[1];if([15,16,18,19,20,14].includes(id))continue;if([8,13,17].includes(id))id=8;else if([9,10,21].includes(id))id=side==='p1'?0:1;else if([11,12].includes(id))id=target==='p1'?0:1;to=db?.presets[id]||def}
    else{let eye=a.slice(1,4),aim=a.slice(4,7);to=a[0]===2?{eye:from.eye.map((v,i)=>v+eye[i]),target:from.target.map((v,i)=>v+aim[i])}:{eye,target:aim}}
    track={from,to,start:e.start,duration:duration(e.op,a),steps:e.op===0?a[2]:a[7],interval:Math.max(0,e.op===0?a[3]:a[8]),decay:e.op===0?a[4]:a[9]};if(!track.duration){current=to;track=null}
   }
   if(e.op===3&&t<duration(3,a)){let value=curve([0],[fx(a[1])],3,a[3],a[4],Math.max(1,a[5])*2,t)[0];shake[a[0]===1?0:1]+=value*12}
   if(e.op===4)shake=[0,0];
  }
  let c=sample(f),d0=Math.hypot(...def.eye.map((v,i)=>v-def.target[i])),d=Math.hypot(...c.eye.map((v,i)=>v-c.target[i])),zoom=clamp(d0/Math.max(8192,d),.65,2.1),dx=fx(c.target[0]-def.target[0]),dy=fx(c.target[1]-def.target[1]),dz=fx(c.target[2]-def.target[2]);
  // Project native camera translation to the HD-2D battle plane; UI stays fixed.
  zoom*=clamp(1-dz*.018,.75,1.4);return{x:-dx*15+shake[0],y:dy*14+dz*5+shake[1],zoom,eye:c.eye,target:c.target};
 }
 function background(events,f,side='p1'){
  let state={id:null,visible:false,x:0,y:0,tint:0,color:0,worldTint:0,worldColor:0,hideSky:false,hideGround:false},scroll=null;
  for(let e of events){if(e.start>f)continue;let a=e.args,t=f-e.start;
   if(e.op===36){state.id=a[0];state.visible=true}
   if(e.op===40)state.visible=!a[0];
   if(e.op===43){if(a[0]===2)state.visible=!a[1];if(a[0]===0)state.hideGround=!!a[1];if(a[0]===1)state.hideSky=!!a[1]}
   if(e.op===42){let amount=clamp(blend(a,t)/16,0,1);if(a[0]===3||a[0]===4){state.tint=amount;state.color=a[4]}if(a[0]===2||a[0]===4){state.worldTint=amount;state.worldColor=a[4]}}
   if(e.op===37){let origin=scroll?scroll.sample(e.start-scroll.start):[0,0],mode=a[0],end=[a[1]*(side==='p2'&&mode===4?-1:1),a[2]],sample=q=>mode===4?origin.map((v,i)=>v+end[i]*Math.min(Math.max(0,a[3])+1,Math.max(0,Math.floor(q)))):curve(origin,end,mode,a[3],a[4],a[5],q,mode===1);scroll={start:e.start,sample}}
  }
  if(scroll)[state.x,state.y]=scroll.sample(f-scroll.start);return state;
 }
 function idleTick(events,f,side,attacker='p1',target='p2'){let flags=0,last=0,tick=0;for(let e of events){if(e.start>f||e.op!==26||!resolve(e.args[0],attacker,target).includes(side))continue;if(!flags)tick+=e.start-last;last=e.start;let mode=e.args[1];if(mode===1)flags|=1;else if(mode===2)flags|=2;else if(mode===3)flags&=~2;else flags&=~1}if(!flags)tick+=f-last;return tick}
 function hud(events,f,attacker='p1',target='p2'){let result={p1:{visible:true,x:0},p2:{visible:true,x:0}};for(let e of events){if(e.start>f||e.op!==51)continue;let [mode,group]=e.args,sides=group===2?['p1','p2']:group===3?[attacker]:group===4?[target]:[group===0?'p1':'p2'];for(let side of sides){if(mode===0)result[side].visible=false;else if(mode===1)result[side].visible=true;else result[side].x=(side==='p1'?-1:1)*(mode===2?128:16)}}return result}
 function secondaryAlpha(bodyAlpha,override=32,suppressed=false){if(suppressed)return 0;let value=override===32?(Math.floor(clamp(bodyAlpha,0,1)*31)>>1):override;return(value&255)/31}
 root.NativeVisual={duration,supported,resolve,curve,blend,sprite,camera,background,idleTick,hud,secondaryAlpha};if(typeof module!=='undefined')module.exports=root.NativeVisual;
})(typeof window!=='undefined'?window:globalThis);
