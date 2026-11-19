/* One Soffiolieve panorama reinterpreted across eras. Native Black geometry ends the montage. */
(function(root){
 'use strict';
 const eras=Object.freeze([
  {id:'yellow',label:'GIALLO',size:[160,144],colors:['#f7efb5','#bdb86b','#737544','#303b31']},
  {id:'gold',label:'ORO',size:[160,144],colors:['#f8efc2','#77aa59','#326d45','#344b57','#c69a6b','#b35d4e','#d5b95d','#527fc1']},
  {id:'emerald',label:'SMERALDO',size:[240,160],colors:['#f5eacb','#74bf70','#28694d','#304b55','#d8b78e','#b75f58','#efd677','#5d8fc8']},
  {id:'platinum',label:'PLATINO',size:[256,192],colors:['#f7ecd6','#93bf7b','#3e7658','#40505b','#ddc7ac','#b67069','#e9ce8c','#6a98c6']},
  {id:'black',label:'NERO',size:[256,192]},
  {id:'hd2d',label:'HD-2D',size:[768,576]}
 ]);
 const checkpoints=Object.freeze([...Array.from({length:13},(_,i)=>i*27),...Array.from({length:5},(_,i)=>i*54+43)].sort((a,b)=>a-b));
 function townScene(source){const instances=source.instances.filter(i=>i.x>=-16&&i.x<16&&i.z>=-16&&i.z<16);if(!instances.some(i=>i.model==='map0'))throw Error('Mappa originale di Soffiolieve mancante');return{...source,instances,permissionGrids:source.permissionGrids.filter(g=>g.x===0&&g.z===0)};}
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 function frame(value){const f=Math.max(0,Math.min(324,Number(value)||0)),index=Math.min(5,Math.floor(f/54)),local=f-index*54;return{frame:f,index,id:eras[index].id,mix:index<5?smooth((local-32)/22):0,done:f>=324};}
 function clock(){let f=0,last;return{tick(now,{hidden=false,rate=1}={}){if(!Number.isFinite(now))throw Error('Invalid era clock');if(last===undefined){last=now;return frame(0);}const dt=Math.max(0,Math.min(100,now-last));last=now;if(!hidden){const next=checkpoints.find(x=>x>f)??324;f=Math.min(next,f+dt*.04*Math.max(1,Math.min(4,Number(rate)||1)));}return frame(f);},get done(){return f===324;}};}
 // Bounded diagonal pixel reveal: every tile settles before the next era starts.
 function tileAlpha(mix,x,y){return smooth((clamp(mix)*1.18-x*.70-y*.30)/.18);}
 function bounds(scene){const b={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};for(const i of scene.instances){const model=root.OPENING_ASSETS.models[i.model]||scene.models[i.model],cs=Math.cos(i.rotation),sn=Math.sin(i.rotation);for(const g of model.groups)for(let at=0;at<g.verts.length;at+=11){const v=g.verts,x=v[at]*cs+v[at+2]*sn+i.x,y=v[at+1]+i.y,z=-v[at]*sn+v[at+2]*cs+i.z;b.minX=Math.min(b.minX,x);b.maxX=Math.max(b.maxX,x);b.minY=Math.min(b.minY,y);b.maxY=Math.max(b.maxY,y);b.minZ=Math.min(b.minZ,z);b.maxZ=Math.max(b.maxZ,z);}}if(!Object.values(b).every(Number.isFinite))throw Error('Soffiolieve geometry is incomplete');return b;}
 let prepares=0;
 async function prepare(){
  prepares++;
  const doc=root.document,canvas=doc.createElement('canvas');let r;
  try{r=new VillageRenderer(canvas,{listen:false,isolated:true,viewSize:[256,192],cacheBytes:16*1024*1024});r.scene=townScene(ROM_SCENE);r.requiredActors=[];await r.pending;if(!r.ready||!r.hasResources(r.resourcePlan([])))throw r.loadingError||Error('Panorama di Soffiolieve non pronto');
   const box=bounds(r.scene),result={source:'Original Soffiolieve map0 geometry and textures, authored panoramic framing',bounds:box},spanX=box.maxX-box.minX,spanZ=box.maxZ-box.minZ;
   for(const [id,size,angle,cinema]of [['platinum',[256,192],62,false],['black',[256,192],50,false],['hd2d',[768,576],25,true]]){
    r.viewSize=size;r.center=[(box.minX+box.maxX)/2,(box.minZ+box.maxZ)/2];r.cameraPitch=[Math.sin(angle*Math.PI/180),Math.cos(angle*Math.PI/180)];r.elevation=(box.maxY+box.minY)*.4;r.cinema=cinema;
    const scale=Math.min(size[0]/30,size[1]/21),height=spanZ*r.cameraPitch[0]+(box.maxY-box.minY)*r.cameraPitch[1];r.zoom=Math.min(size[0]/(spanX*1.08*scale),size[1]/(height*1.1*scale));r.draw(0,[]);if(r.gl.isContextLost()||r.gl.getError())throw Error('Panorama context lost');
    const image=doc.createElement('canvas');image.width=size[0];image.height=size[1];image.getContext('2d').drawImage(canvas,0,0);const point=r.screen(0,6,.04);result[id]={image,hero:{x:point[0]/size[0],y:point[1]/size[1],width:2*point[2]/size[0],height:2*point[2]/size[1]},camera:{angle,zoom:r.zoom,center:[...r.center]}};
   }return result;
  }finally{try{if(r){r.resourceEpoch++;r.recovery?.dispose();r.disposeGraphics();r.gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.width=canvas.height=0;}}finally{prepares--;}}
 }
 function palette(image,colors,doc=root.document){const c=doc.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);const data=x.getImageData(0,0,c.width,c.height),rgb=colors.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));for(let at=0;at<data.data.length;at+=4){if(!data.data[at+3])continue;let best=rgb[0],distance=Infinity;for(const color of rgb){const d=color.reduce((sum,v,i)=>sum+(v-data.data[at+i])**2,0);if(d<distance){best=color;distance=d;}}data.data[at]=best[0];data.data[at+1]=best[1];data.data[at+2]=best[2];}x.putImageData(data,0,0);return c;}
 function retro(era,hero,doc=root.document){
  const canvas=doc.createElement('canvas');[canvas.width,canvas.height]=era.size;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,s=w/160,C=era.colors,gb=era.id==='yellow',depth=era.id==='platinum'?5:0;
  c.imageSmoothingEnabled=false;const rect=(x,y,a,b,color)=>{c.fillStyle=color;c.fillRect(Math.round(x*s),Math.round(y*h/144),Math.ceil(a*s),Math.ceil(b*h/144));};
  rect(0,0,160,144,C[1]);for(let y=1;y<144;y+=8)for(let x=1;x<160;x+=8){rect(x,y,1,1,C[2]);if(!gb)rect(x+3,y+2,1,1,C[0]);}
  // Laboratory, Komor's home and the two southern homes retain their native arrangement.
  rect(67,22,17,109,C[0]);rect(24,65,92,10,C[0]);rect(44,17,10,74,C[0]);
  const house=(x,y,roof,lab=false)=>{const extra=lab?10:0;rect(x+2,y+6,34,26+depth+extra,C[3]);rect(x+3,y+7,32,23+extra,C[4]||C[0]);rect(x+2,y,34,2,roof);rect(x,y+2,38,10,roof);rect(x,y+11,38,2,C[3]);for(let k=2;k<36;k+=5)rect(x+k,y+2,1,8,C[3]);rect(x+15,y+19+extra,9,12,C[3]);for(const dx of [4,26]){rect(x+dx,y+15+extra,7,6,C[7]||C[1]);rect(x+dx+3,y+15+extra,1,6,C[0]);rect(x+dx,y+18+extra,7,1,C[0]);}if(lab){rect(x+14,y+15,10,6,C[7]||C[1]);rect(x+18,y+15,1,6,C[0]);rect(x+14,y+18,10,1,C[0]);}};
  house(26,4,C[5]||C[2],true);house(62,34,C[7]||C[2]);house(26,84,C[7]||C[2]);house(89,84,C[7]||C[2]);
  rect(0,132,160,12,C[7]||C[2]);rect(0,128,160,4,C[0]);for(let y=135;y<144;y+=4)for(let x=1;x<160;x+=16)rect(x,y,10,1,C[0]);
  for(let y=5;y<118;y+=18)for(const x of [0,151]){rect(x+3,y+10,3,6,C[3]);rect(x+3,y,4,2,C[2]);rect(x+1,y+2,8,3,C[2]);rect(x,y+5,10,5,C[2]);rect(x+2,y+10,6,3,C[2]);rect(x+3,y+3,3,1,gb?C[1]:C[0]);if(!gb)rect(x+2,y+6,5,2,C[1]);}
  for(let y=45;y<66;y+=7)for(let x=19;x<42;x+=7){rect(x,y,2,3,C[6]||C[3]);rect(x-1,y+1,4,1,C[0]);}
  const pixel=gb?16:era.id==='gold'?16:24,icon=palette(hero,C,doc);c.drawImage(icon,Math.round(w*.5-pixel/2),Math.round(h*22/32-pixel),pixel,pixel);return canvas;
 }
 function compose(landscapes,hero,doc=root.document){
  return eras.map(era=>{if(era.colors&&era.id!=='platinum'){const image=retro(era,hero,doc),matte=doc.createElement('canvas');matte.width=Math.round(Math.max(image.width,image.height*4/3));matte.height=Math.round(Math.max(image.height,image.width*3/4));const c=matte.getContext('2d');c.fillStyle='#13272e';c.fillRect(0,0,matte.width,matte.height);c.drawImage(image,(matte.width-image.width)/2,(matte.height-image.height)/2);return matte;}const record=landscapes[era.id],canvas=doc.createElement('canvas');canvas.width=record.image.width;canvas.height=record.image.height;const c=canvas.getContext('2d');c.drawImage(record.image,0,0);const p=record.hero,w=p.width*canvas.width,h=p.height*canvas.height;c.fillStyle='#18352e55';c.beginPath();c.ellipse(p.x*canvas.width,p.y*canvas.height,w*.3,h*.1,0,0,Math.PI*2);c.fill();c.imageSmoothingEnabled=false;c.drawImage(hero,p.x*canvas.width-w/2,p.y*canvas.height-h,w,h);return canvas;});
 }
 function draw(c,cards,p,font){
  const canvas=c.canvas,scale=canvas.width/256;c.save();c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,256,224);c.fillStyle='#13272e';c.fillRect(0,0,256,224);
  const card=(image,alpha)=>{const s=Math.min(256/image.width,192/image.height);c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.drawImage(image,(256-image.width*s)/2,(192-image.height*s)/2,image.width*s,image.height*s);c.restore();};
  card(cards[p.index],1);
  if(p.mix){const image=cards[p.index+1],s=Math.min(256/image.width,192/image.height),ox=(256-image.width*s)/2,oy=(192-image.height*s)/2;
   for(let y=0;y<6;y++)for(let x=0;x<8;x++){const alpha=tileAlpha(p.mix,x/7,y/5);if(!alpha)continue;const sx=x*image.width/8,sy=y*image.height/6;c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.drawImage(image,sx,sy,image.width/8,image.height/6,ox+sx*s,oy+sy*s,image.width*s/8,image.height*s/6);c.restore();}
  }
  c.fillStyle='#f8f8f0';c.fillRect(0,192,256,32);
  const alpha=Math.abs(1-2*p.mix),caption=Math.min(5,p.index+(p.mix>.5?1:0));
  if(alpha>0){c.save();c.globalAlpha=alpha;root.NativeText.draw(c,font,'SOFFIOLIEVE - '+eras[caption].label,128,202,false,'center',root.NAMING_ASSETS.font);c.restore();}c.restore();
 }
 function play({canvas,cards,font,onFrame=()=>{},request=root.requestAnimationFrame,cancel=root.cancelAnimationFrame,document:doc=root.document,rate=()=>root.GameSpeed?.rate||1}={}){const time=clock(),c=canvas.getContext('2d');let raf,stopped=false,resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});const stop=()=>{if(stopped)return;stopped=true;cancel(raf);resolve(false);};const tick=now=>{if(stopped)return;try{const p=time.tick(now,{hidden:doc.hidden,rate:rate()});if(!doc.hidden){draw(c,cards,p,font);onFrame(p);}if(time.done){stopped=true;resolve(true);}else raf=request(tick);}catch(error){stopped=true;reject(error);}};raf=request(tick);return{promise,cancel:stop};}
 const api={eras,checkpoints,townScene,frame,clock,tileAlpha,bounds,prepare,palette,retro,compose,draw,play,get preparing(){return prepares>0;}};root.IntroHistory=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
