/* IRBI effect 0x23a and original NCER/NANR cells. Screen projection is HD-2D. */
(function(root){
 let ballItem=4;
 const supported=new Set([46,47,48,49,50,69]);
 const compare=(x,op,y)=>[x===y,x!==y,x<y,x>y,x<=y,x>=y][op];
 function compile(data,spas,{shakes=3,caught=true,critical=false,side='p1',ball=4}={}){
  ballItem=[3,4,14].includes(ball)?ball:4;
  const variables={12:shakes,13:Number(caught),14:Number(critical),15:ballItem,19:side==='p2'?1:0,39:0};
  const byOffset=new Map(data.commands.map((c,i)=>[c.at,i])),commands=[];let yieldAfterCommand=true;
  const finishCommand=()=>{if(yieldAfterCommand)commands.push([57,[1]])};
  for(let pc=0,steps=0;pc<data.commands.length;){
   if(++steps>1000)throw Error('Capture effect loop exceeded');
   const row=data.commands[pc++],op=row.op,a=row.args.slice();
   if(op===59){if(!(a[0] in variables))throw Error('Unknown capture variable '+a[0]);if(compare(variables[a[0]],a[1],a[2]))pc=byOffset.get(row.end+a[3]);if(pc===undefined)throw Error('Invalid capture branch');finishCommand();continue}
   if(op===72){pc=byOffset.get(row.end+a[0]);if(pc===undefined)throw Error('Invalid capture jump');finishCommand();continue}
   if(op===77||op===73)break;
   if(op===58){yieldAfterCommand=!!a[0];finishCommand();continue}
   if([6,7,9,10,11,13].includes(op))a[0]=data.particleMap[a[0]]??a[0];
   if(op===10){const spa=spas[a[0]];if(!spa)throw Error('Missing capture SPA '+a[0]);for(let i=0;i<spa.emitters.length;i++)commands.push([7,[a[0],i,a[1],a[2],a[3],a[4],0,...a.slice(6)]]);finishCommand();continue}
   commands.push([op,a]);if(op===56)yieldAfterCommand=true;else if(op!==57)finishCommand();
  }
  return{id:data.id,spas:[...new Set(commands.filter(([op])=>[6,7,9,13].includes(op)).map(([,a])=>a[0]))],variants:[{commands}]};
 }
 function duration(op,a){
  if(op===46||op===47)return root.NativeVisual.duration(18,a);
  if(op===49)return root.NativeVisual.duration(27,a);
  return 0;
 }
 function cellAt(sequence,t){
  let total=sequence.frames.reduce((n,f)=>n+f[1],0),tick=Math.max(0,Math.floor(t));
  if(sequence.mode===2)tick%=total;else tick=Math.min(tick,total-1);
  for(let [cell,length]of sequence.frames){if(tick<length)return cell;tick-=length}
  return sequence.frames.at(-1)[0];
 }
 function actors(events,f,data){
  const states=new Map(),V=root.NativeVisual;
  for(let event of events){if(event.start>f)continue;let a=event.args,id=a[0],s=states.get(id),t=f-event.start;
   if(event.op===69){s={id,target:a[1],offset:[a[2]/4096,a[3]/4096],scale:[a[4]/4096,a[5]/4096],position:[0,0],sequence:0,sequenceStart:event.start,visible:true,tracks:{},tint:0,color:0};states.set(id,s)}
   if(!s)continue;
   if(event.op===50)s.visible=false;
   if(event.op===48){s.sequence=a[1];s.sequenceStart=event.start}
   if(event.op===46||event.op===47){let key=event.op===46?'position':'scale',prior=s.tracks[key],origin=prior?prior.sample(event.start-prior.start):s[key];if(event.op===47)origin=[1,1];let end=[a[2],a[3]].map(v=>event.op===47?v/4096:v),sample=q=>V.curve(origin,end,a[1],a[4],a[5],a[6],q,event.op===46&&a[1]===1);s.tracks[key]={start:event.start,sample}}
   if(event.op===49){s.tint=V.blend(a,t)/16;s.color=a[4]}
  }
  return [...states.values()].map(s=>{for(let [key,track]of Object.entries(s.tracks))s[key]=track.sample(f-track.start);s.cell=cellAt(data.sequences[s.sequence],f-s.sequenceStart);return s});
 }
 const images=new Map(),tints=new Map();
 async function preload(){return Promise.all([...(root.CAPTURE_DATA?.cells||[]),...(root.ROUTE2_BALL?.cells||[]),...(root.ROUTE3_BALL?.cells||[])].map(src=>new Promise(resolve=>{let im=images.get(src);if(im?.complete){resolve();return}if(!im){im=new Image();images.set(src,im);im.onload=im.onerror=resolve;im.src=src}else{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true})}})))}
 function draw(c,events,f,W,H,point){
  const data=root.CAPTURE_DATA;if(!data)return;const scale=Math.min(W/1000,H/650),pixelScale=1.5*scale;
  // Object 1 is the script's flattened palette-tinted shadow, beneath object 0.
  for(let actor of actors(events,f,data).sort((a,b)=>b.id-a.id)){
   if(!actor.visible)continue;let im=images.get((ballItem===14?root.ROUTE3_BALL?.cells||data.cells:ballItem===3?root.ROUTE2_BALL?.cells||data.cells:data.cells)[actor.cell]);if(!im?.complete||!im.naturalWidth)continue;
   if(actor.tint>0){let key=ballItem+':'+actor.cell+':'+actor.color+':'+Math.round(actor.tint*16),tinted=tints.get(key);if(!tinted){tinted=document.createElement('canvas');tinted.width=im.width;tinted.height=im.height;let cx=tinted.getContext('2d');cx.drawImage(im,0,0);cx.globalCompositeOperation='source-atop';cx.fillStyle='rgba('+[(actor.color&31)*255/31,(actor.color>>5&31)*255/31,(actor.color>>10&31)*255/31].join(',')+','+actor.tint+')';cx.fillRect(0,0,im.width,im.height);tints.set(key,tinted)}im=tinted}
   const anchor=point(actor.target),x=anchor.x+actor.offset[0]*16*pixelScale+actor.position[0]*pixelScale,y=anchor.y-actor.offset[1]*16*pixelScale+actor.position[1]*pixelScale;
   c.save();c.imageSmoothingEnabled=false;c.translate(x,y);c.scale(actor.scale[0]*pixelScale,actor.scale[1]*pixelScale);c.drawImage(im,-data.origin[0],-data.origin[1]);c.restore();
  }
 }
 root.NativeCapture={compile,supported,duration,cellAt,actors,preload,draw};
 if(typeof module!=='undefined')module.exports=root.NativeCapture;
})(typeof window!=='undefined'?window:globalThis);
