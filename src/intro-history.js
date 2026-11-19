/* One Soffiolieve panorama reinterpreted across eras. Native Black geometry ends the montage. */
(function(root){
 'use strict';
 const eras=Object.freeze([
  {id:'yellow',label:'GIALLO',size:[160,144],colors:['#f7efb5','#bdb86b','#737544','#303b31']},
  {id:'gold',label:'ORO',size:[160,144],colors:['#fff7ce','#a5cd73','#73a55a','#294a31','#dec694','#ce7352','#e7b552','#5a8cbd','#b59463','#524a39','#396b9c','#84b5e7']},
  {id:'emerald',label:'SMERALDO',size:[240,160],colors:['#fff7d6','#a5d67b','#73b563','#315a42','#f7e7bd','#d67352','#f7ce63','#739cce','#dec694','#9c735a','#426ba5','#b5d6e7','#4a8c5a','#6bb5ad','#de94ad','#e7bd94']},
  {id:'platinum',label:'PLATINO',size:[256,192],colors:['#f7ecd6','#93bf7b','#3e7658','#40505b','#ddc7ac','#b67069','#e9ce8c','#6a98c6']},
  {id:'black',label:'NERO',size:[256,192]},
  {id:'black2',label:'NERO 2',size:[256,192]},
  {id:'hd2d',label:'HD-2D',size:[768,576]}
 ]);
 const checkpoints=Object.freeze([...new Set([...Array.from({length:11},(_,i)=>i*27),...Array.from({length:5},(_,i)=>i*54+43),297,302,314,330,340,346,362,377,378,405,432])].sort((a,b)=>a-b));
 const cameras=Object.freeze({platinum:{angle:66,cinema:false,clear:[.50,.64,.60],style:'sinnoh'},black:{angle:51,cinema:false,clear:[.27,.42,.38],style:'unova'},black2:{angle:43,cinema:false,clear:[.27,.42,.38],style:'unova2'},hd2d:{angle:25,cinema:true,clear:[.22,.39,.39],style:'hd2d'}});
 function townScene(source){const instances=source.instances.filter(i=>i.x>=-16&&i.x<16&&i.z>=-16&&i.z<16);if(!instances.some(i=>i.model==='map0'))throw Error('Mappa originale di Soffiolieve mancante');return{...source,instances,permissionGrids:source.permissionGrids.filter(g=>g.x===0&&g.z===0)};}
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 function frame(value){const f=Math.max(0,Math.min(432,Number(value)||0)),index=f<270?Math.floor(f/54):f<378?5:6,local=f-(index===6?378:index*54);return{frame:f,index,id:eras[index].id,mix:index<5?smooth((local-32)/22):index===5?smooth((local-32)/76):0,done:f>=432};}
 function clock(){let f=0,last;return{tick(now,{hidden=false,rate=1}={}){if(!Number.isFinite(now))throw Error('Invalid era clock');if(last===undefined){last=now;return frame(0);}const dt=Math.max(0,Math.min(100,now-last));last=now;if(!hidden){const next=checkpoints.find(x=>x>f)??432;f=Math.min(next,f+dt*.03*Math.max(1,Math.min(4,Number(rate)||1)));}return frame(f);},get done(){return f===432;}};}
 // Bounded diagonal pixel reveal: every tile settles before the next era starts.
 function tileAlpha(mix,x,y){return smooth((clamp(mix)*1.18-x*.70-y*.30)/.18);}
 function revealBand(mix,y){return {front:clamp(mix)*312-clamp(y)*32-16,feather:8};}
 function bounds(scene){const b={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};for(const i of scene.instances){const model=root.OPENING_ASSETS.models[i.model]||scene.models[i.model],cs=Math.cos(i.rotation),sn=Math.sin(i.rotation);for(const g of model.groups)for(let at=0;at<g.verts.length;at+=11){const v=g.verts,x=v[at]*cs+v[at+2]*sn+i.x,y=v[at+1]+i.y,z=-v[at]*sn+v[at+2]*cs+i.z;b.minX=Math.min(b.minX,x);b.maxX=Math.max(b.maxX,x);b.minY=Math.min(b.minY,y);b.maxY=Math.max(b.maxY,y);b.minZ=Math.min(b.minZ,z);b.maxZ=Math.max(b.maxZ,z);}}if(!Object.values(b).every(Number.isFinite))throw Error('Soffiolieve geometry is incomplete');return b;}
 const lerp=(a,b,t)=>a+(b-a)*t;
 function fitCamera(box,angle,size=[768,576]){const pitch=[Math.sin(angle*Math.PI/180),Math.cos(angle*Math.PI/180)],height=(box.maxZ-box.minZ)*pitch[0]+(box.maxY-box.minY)*pitch[1],scale=Math.min(size[0]/30,size[1]/21);return Math.min(size[0]/((box.maxX-box.minX)*1.08*scale),size[1]/(height*1.1*scale));}
 function evolutionCamera(box,progress){const t=clamp(progress),angle=lerp(cameras.black2.angle,cameras.hd2d.angle,t);return {angle,center:[(box.minX+box.maxX)/2-.4*(1-t),(box.minZ+box.maxZ)/2-.8*(1-t)],elevation:(box.maxY+box.minY)*lerp(.42,.4,t),zoom:fitCamera(box,angle),graphics:t,clear:cameras.black2.clear.map((v,i)=>lerp(v,cameras.hd2d.clear[i],t))};}
 function heroPoint(r,size){const p=r.screen(0,6,.04);return{x:p[0]/size[0],y:p[1]/size[1],width:2*p[2]/size[0],height:2*p[2]/size[1]};}
 function paintHero(c,hero,p,size){const w=p.width*size[0],h=p.height*size[1];c.fillStyle='#18352e55';c.beginPath();c.ellipse(p.x*size[0],p.y*size[1],w*.3,h*.1,0,0,Math.PI*2);c.fill();c.imageSmoothingEnabled=false;c.drawImage(hero,p.x*size[0]-w/2,p.y*size[1]-h,w,h);}
 let prepares=0,liveViews=0,sessionSequence=0;
 async function prepare(){
  prepares++;const doc=root.document,session=++sessionSequence;let canvas,r,retained=false,disposed=false,registered=false;
  const dispose=()=>{if(disposed)return;disposed=true;if(r)try{r.resourceEpoch++;r.recovery?.dispose();r.disposeGraphics();}finally{try{r.gl.getExtension('WEBGL_lose_context')?.loseContext();}finally{if(registered){liveViews--;registered=false;}canvas.width=canvas.height=0;}}};
  try{canvas=doc.createElement('canvas');r=new VillageRenderer(canvas,{listen:false,isolated:true,viewSize:[256,192],cacheBytes:16*1024*1024});liveViews++;registered=true;r.scene=townScene(ROM_SCENE);r.requiredActors=[];await r.pending;
   const ready=()=>{if(disposed||!r.ready||!r.hasResources(r.resourcePlan([]))||r.gl.isContextLost()||r.gl.getError())throw r.loadingError||Error('Panorama di Soffiolieve non pronto');};ready();
   const box=bounds(r.scene),result={source:'Original Soffiolieve map0; authored GBA and Black2 treatment; one private camera into modern HD2D',bounds:box};
   const configure=(view,size)=>{r.viewSize=size;r.scene.clearColor=view.clear;r.center=[...view.center];r.elevation=view.elevation;r.cameraPitch=[Math.sin(view.angle*Math.PI/180),Math.cos(view.angle*Math.PI/180)];r.zoom=view.zoom;r.evolutionBlend=view.graphics;r.cinema=view.graphics>0;};
   for(const [id,size]of [['platinum',[256,192]],['black',[256,192]],['hd2d',[768,576]]]){
    const setting=cameras[id],view=id==='hd2d'?evolutionCamera(box,1):{angle:setting.angle,center:[(box.minX+box.maxX)/2,(box.minZ+box.maxZ)/2],elevation:(box.maxY+box.minY)*.4,zoom:fitCamera(box,setting.angle,size),clear:setting.clear,graphics:1};configure(view,size);r.cinema=setting.cinema;r.draw(0,[]);ready();
    const image=doc.createElement('canvas');image.width=size[0];image.height=size[1];const target=image.getContext('2d');
    if(setting.cinema)target.drawImage(canvas,0,0);else{const gl=r.gl,pixels=new Uint8Array(size[0]*size[1]*4),captured=target.createImageData(size[0],size[1]);gl.bindFramebuffer(gl.FRAMEBUFFER,r.framebuffer);try{gl.readPixels(0,0,size[0],size[1],gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(gl.getError())throw Error('Cattura DS non disponibile');}finally{gl.bindFramebuffer(gl.FRAMEBUFFER,null);}for(let y=0;y<size[1];y++)captured.data.set(pixels.subarray((size[1]-1-y)*size[0]*4,(size[1]-y)*size[0]*4),y*size[0]*4);target.putImageData(captured,0,0);}
    result[id]={image,hero:heroPoint(r,size),camera:{angle:view.angle,zoom:r.zoom,center:[...r.center]},style:setting.style};
   }
   // One live renderer and one reusable CPU surface; no readPixels, context,
   // texture upload or changing framebuffer dimensions during the final move.
   const live=doc.createElement('canvas');live.width=768;live.height=576;const c=live.getContext('2d');let cachedHero,dsHero,lastProgress,lastView;
   const draw=(progress,hero)=>{ready();const t=clamp(progress);if(hero!==cachedHero){cachedHero=hero;dsHero=dsStyle(hero,'black2',doc);lastProgress=undefined;}if(lastProgress===t)return live;
    const view=evolutionCamera(box,t);configure(view,[768,576]);r.cinema=true;r.draw(0,[]);ready();c.clearRect(0,0,768,576);c.drawImage(canvas,0,0);const p=heroPoint(r,[768,576]);paintHero(c,dsHero,p,[768,576]);if(t>0){c.save();c.globalAlpha=t;c.imageSmoothingEnabled=false;const w=p.width*768,h=p.height*576;c.drawImage(hero,p.x*768-w/2,p.y*576-h,w,h);c.restore();}
    lastView={session,angle:Math.atan2(r.cameraPitch[0],r.cameraPitch[1])*180/Math.PI,center:[...r.center],zoom:r.zoom,graphics:r.evolutionBlend,epoch:r.resourceEpoch,viewport:[...r.viewSize]};lastProgress=t;return live;
   };
   result.evolution={draw,snapshot(progress,hero){const image=doc.createElement('canvas');image.width=768;image.height=576;image.getContext('2d').drawImage(draw(progress,hero),0,0);return image;},camera:t=>evolutionCamera(box,t),get lastView(){return lastView;},get disposed(){return disposed;},dispose};retained=true;return result;
  }finally{try{if(!retained)dispose();}finally{prepares--;}}
 }
 function palette(image,colors,doc=root.document){const c=doc.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);const data=x.getImageData(0,0,c.width,c.height),rgb=colors.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));for(let at=0;at<data.data.length;at+=4){if(!data.data[at+3])continue;let best=rgb[0],distance=Infinity;for(const color of rgb){const d=color.reduce((sum,v,i)=>sum+(v-data.data[at+i])**2,0);if(d<distance){best=color;distance=d;}}data.data[at]=best[0];data.data[at+1]=best[1];data.data[at+2]=best[2];}x.putImageData(data,0,0);return c;}
 function emeraldTown(era,hero,doc){
  const canvas=doc.createElement('canvas');canvas.width=240;canvas.height=160;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  const grass='#7bc884',leaf='#42845a',dark='#28504b',cream='#f7efc6',sand='#efdfac';rect(0,0,240,160,grass);
  // Native GBA pixels: leaf rims, clustered tufts and warm roof courses are
  // drawn on240x160 directly, without stretching the old Game Boy painter.
  for(let y=4;y<143;y+=8)for(let x=4;x<238;x+=12){if((x*7+y*11)%5<2){rect(x,y,1,2,'#63b573');rect(x+2,y+1,1,1,'#a5d694');rect(x+4,y-1,1,2,'#63b573');}}
  const path=(x,y,w,h)=>{rect(x-1,y-1,w+2,h+2,'#bdd694');rect(x,y,w,h,sand);rect(x,y,w,1,'#f7efbd');for(let yy=y+3;yy<y+h-1;yy+=6)for(let xx=x+3;xx<x+w-1;xx+=9){rect(xx,yy,1,1,'#d6c68c');rect(xx+3,yy+2,1,1,cream);}};
  path(112,0,17,143);path(57,74,124,9);path(60,47,9,90);path(163,119,9,19);
  rect(0,145,240,15,'#527bad');for(let y=147;y<160;y+=5)for(let x=(y%3)*5;x<240;x+=19){rect(x,y,10,1,'#84adce');rect(x+2,y+1,6,1,'#b5d6de');rect(x+12,y+3,4,1,'#426b9c');}
  rect(21,137,198,9,'#ad946b');rect(21,137,198,2,'#e7ce94');rect(22,140,196,1,'#8c735a');rect(23,143,194,2,'#735a4a');
  for(let x=27;x<218;x+=12){rect(x,132,3,11,dark);rect(x,131,3,2,cream);rect(x+1,134,1,8,'#bdb58c');}rect(27,134,189,2,'#ded6ad');rect(27,139,189,1,'#6b7352');
  const tree=(x,y)=>{rect(x+6,y+26,23,4,'#63a56b');rect(x+14,y+24,5,8,'#735a42');rect(x+14,y+25,2,6,'#bd9463');
   for(const [yy,xx,w]of [[0,12,10],[2,7,20],[5,4,26],[9,2,30],[16,3,28],[22,6,23],[26,11,13]])rect(x+xx,y+yy,w,yy<16?7:5,dark);
   rect(x+9,y+3,15,4,'#84c884');rect(x+5,y+7,22,8,'#63ad73');rect(x+4,y+14,25,7,leaf);rect(x+8,y+22,17,5,'#316b52');
   for(const [xx,yy,w,h,color]of [[10,5,8,2,'#a5d694'],[6,11,6,3,'#84c884'],[18,8,7,3,'#84c884'],[13,14,6,3,'#73bd7b'],[22,15,4,3,'#63ad73'],[7,20,5,2,'#63ad73'],[15,23,5,2,'#42845a'],[25,11,3,3,'#42845a'],[12,18,3,2,'#42845a'],[18,4,4,1,'#bddfa5']])rect(x+xx,y+yy,w,h,color);
   const leaves=[[12,3,0],[17,4,0],[8,6,0],[21,7,1],[5,10,1],[12,9,0],[16,12,1],[24,12,2],[8,14,1],[11,17,2],[20,16,1],[25,18,2],[6,19,2],[15,20,1],[19,23,2],[11,24,2]];
   const tones=[['#bddfa5','#84c884','#63ad73'],['#a5d694','#73bd7b','#42845a'],['#73bd7b','#42845a','#316b52']];
   for(const [xx,yy,tone]of leaves){const colors=tones[tone];rect(x+xx,y+yy,2,1,colors[0]);rect(x+xx-1,y+yy+1,3,1,colors[1]);rect(x+xx+1,y+yy+2,2,1,colors[2]);}
   for(const [xx,yy]of [[8,8],[20,5],[4,14],[28,14],[23,21],[8,23],[15,27]]){rect(x+xx,y+yy,1,2,leaf);rect(x+xx+1,y+yy+1,1,1,'#63ad73');}
  };
  for(let y=-12;y<129;y+=24){tree(-10,y);tree(218,y);}for(let x=16;x<219;x+=26)tree(x,-23);
  const flower=(x,y)=>{rect(x+2,y+4,1,3,leaf);rect(x,y+6,5,1,'#63ad73');rect(x+1,y,3,1,'#efad9c');rect(x,y+1,5,2,'#de7b7b');rect(x+1,y+3,3,1,'#efad9c');rect(x+2,y+1,1,2,'#fff7bd');};
  rect(27,56,29,19,'#63ad73');for(let y=57;y<74;y+=8)for(let x=29;x<54;x+=7)flower(x,y);
  for(const [x,y]of [[91,127],[96,131],[185,89],[192,92],[138,22],[142,16]])flower(x,y);
  const window=(x,y,w)=>{rect(x-1,y-1,w+2,11,'#6b735a');rect(x,y,w,8,'#73a5b5');rect(x,y,w,1,'#e7f7de');rect(x+1,y+1,w-2,2,'#b5d6d6');rect(x+1,y+4,w-2,3,'#8cbdbd');rect(x+Math.floor(w/2),y,1,8,'#f7f7de');rect(x,y+8,w,1,cream);rect(x-1,y+10,w+2,1,'#b5a584');};
  const house=(x,y,w,h,lab=false)=>{const roofH=lab?17:15,bottom=y+h;rect(x+3,bottom-2,w,4,'#5a9c63');rect(x+2,y+roofH,w-4,h-roofH,'#8c8c73');rect(x+3,y+roofH,w-7,h-roofH-2,'#efe7bd');rect(x+3,bottom-5,w-7,3,'#c6b58c');rect(x+w-7,y+roofH,4,h-roofH-2,'#b5ad8c');
   for(let yy=0;yy<roofH;yy++){const inset=Math.max(0,5-Math.floor(yy/2));rect(x+inset,y+yy,w-inset*2,1,'#735a4a');rect(x+inset+1,y+yy,w-inset*2-2,1,lab?(yy%4===0?'#d69c6b':'#ad6b4a'):(yy%4===0?'#adbdc6':'#7b94a5'));}
   for(let yy=3;yy<roofH-1;yy+=4)for(let xx=3+(yy%8?2:0);xx<w-4;xx+=6){rect(x+xx,y+yy,4,1,lab?'#7b4a39':'#526b84');rect(x+xx+3,y+yy-1,1,2,lab?'#d69c6b':'#c6d6d6');}
   rect(x,y+roofH-1,w,2,'#5a6352');rect(x+1,y+roofH+1,w-2,1,'#b5ad8c');rect(x+w-14,y-2,6,6,'#8c846b');rect(x+w-15,y-2,8,1,'#efe7bd');
   const door=x+Math.floor(w/2)-4;rect(door-1,bottom-14,10,13,'#636b52');rect(door,bottom-13,8,12,'#94734a');rect(door+1,bottom-12,5,5,'#b5a573');rect(door+6,bottom-7,1,2,'#efe7bd');rect(door-3,bottom-1,14,3,'#efdfb5');rect(door-4,bottom+2,16,1,'#b5ad84');
   if(lab){window(x+7,y+roofH+4,12);window(x+25,y+roofH+4,12);window(x+w-20,y+roofH+4,12);rect(x+4,y+roofH+16,w-8,1,'#b5ad8c');window(x+7,bottom-13,12);window(x+w-20,bottom-13,12);}else{window(x+6,bottom-13,11);window(x+w-17,bottom-13,11);}
   for(let yy=y+roofH+3;yy<bottom-4;yy+=5){rect(x+3,yy,4,1,'#ded6ad');rect(x+w-7,yy+2,3,1,'#9c9473');}
  };
  house(35,5,64,46,true);house(99,43,50,36);house(39,95,50,35);house(137,95,50,35);
  const sign=(x,y)=>{rect(x+4,y+7,3,5,'#94734a');rect(x,y,12,9,'#73846b');rect(x+1,y+1,10,6,'#e7d69c');rect(x+2,y+2,8,1,'#fff7ce');rect(x+3,y+4,6,1,'#ad9463');rect(x+3,y+6,4,1,'#ad9463');};sign(27,121);sign(183,121);sign(151,75);
  for(let i=0;i<3;i++)rect(29,81+i*2,17,1,i===0?'#e7bd84':'#b59463');rect(30,87,2,3,dark);rect(43,87,2,3,dark);
  const icon=palette(hero,era.colors,doc);c.drawImage(icon,110,89,20,20);return canvas;
 }
 function retro(era,hero,doc=root.document){
  if(era.id==='emerald')return emeraldTown(era,hero,doc);
  const canvas=doc.createElement('canvas');[canvas.width,canvas.height]=era.size;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,gb=era.id==='yellow',gba=era.id==='emerald',C=era.colors;
  const T=gb?{grass:C[0],tuft:C[1],deep:C[2],ink:C[3],shine:C[0],wall:C[0],shade:C[1],roof:C[2],roofHi:C[1],roofBlue:C[2],wood:C[2],path:C[0],pathEdge:C[1],water:C[2],waterHi:C[1],glass:C[1],flower:C[3]}:
   {grass:C[1],tuft:C[2],deep:gba?'#4a8c5a':'#4a733a',ink:C[3],shine:C[0],wall:C[4],shade:C[8],roof:C[5],roofHi:gba?'#efad73':'#efa573',roofBlue:C[7],wood:C[9],path:gba?'#f7e7bd':'#f7e7ad',pathEdge:gba?'#cebd84':'#c6b573',water:gba?'#527bad':'#527bb5',waterHi:C[11],glass:gba?'#b5d6e7':'#84b5d6',flower:gba?'#de94ad':'#e7b552'};
  c.imageSmoothingEnabled=false;
  // All coordinates are snapped to the chosen console's native pixel grid.
  const rect=(x,y,a,b,color)=>{const left=Math.round(x*w/160),top=Math.round(y*h/144),right=Math.round((x+a)*w/160),bottom=Math.round((y+b)*h/144);c.fillStyle=color;c.fillRect(left,top,Math.max(1,right-left),Math.max(1,bottom-top));};
  const stamp=(rows,x,y,colors,unit=1)=>{for(let yy=0;yy<rows.length;yy++)for(let xx=0;xx<rows[yy].length;xx++){const k=rows[yy][xx];if(k!=='.')rect(x+xx*unit,y+yy*unit,unit,unit,colors[Number(k)]);}};
  rect(0,0,160,144,T.grass);
  for(let y=2;y<126;y+=8)for(let x=2;x<160;x+=8){if((x/8+y/8)%3<1){rect(x,y,1,1,T.tuft);rect(x+2,y-1,1,2,T.tuft);}else if(!gb){rect(x+1,y+2,1,1,T.shine);if(gba)rect(x+4,y+1,2,1,T.tuft);}}
  const path=(x,y,a,b)=>{rect(x-1,y-1,a+2,b+2,T.pathEdge);rect(x,y,a,b,T.path);if(!gb)for(let yy=y+2;yy<y+b-1;yy+=5)for(let xx=x+2;xx<x+a-1;xx+=7){rect(xx,yy,1,1,T.pathEdge);if(gba)rect(xx+2,yy+1,1,1,T.shine);}};
  path(73,6,14,121);path(23,69,104,8);path(41,43,7,81);path(108,107,7,19);path(79,58,7,18);
  // The raised promenade, railings and sea preserve Nuvema's coastal identity.
  rect(0,126,160,18,T.water);
  for(let y=129;y<144;y+=5)for(let x=(y%2)*4;x<160;x+=16){rect(x,y,7,1,T.waterHi);rect(x+2,y+1,3,1,gb?T.grass:T.glass);if(gba)rect(x+9,y+3,3,1,T.waterHi);}
  rect(14,121,132,5,T.wood);rect(14,121,132,1,T.shine);rect(15,123,130,1,T.shade);rect(17,125,128,1,T.ink);
  for(let x=19;x<146;x+=10){rect(x,117,2,7,T.ink);rect(x,116,2,1,T.shine);rect(x+1,118,1,5,T.shade);}rect(18,118,127,1,T.wood);
  // Leaf clusters and trunk pixels, rather than single solid silhouettes.
  const treeGB=['.....222222.....','...2233333322...','..232211112232..','.23211111111232.','2321112112111232','2311121111211132','2311211111121132','2321111111111232','.23111211211132.','.23211111111232.','..232211112232..','...2233333322...','.....233332.....','......2332......','......2332......','.....223322.....'];
  const treeGBC=['......22......','....223322....','...23111232...','..2311111232..','.231121121132.','23111111111132','23211211211232','.233111111332.','..2311111132..','.231121121132.','23111111111132','23211211211232','.233111111332.','..2233333322..','.....2332.....','.....2332.....'];
  const treeGBA=['.......2222.......','.....22333322.....','...223211112322...','..23111111111132..','.2311211111121132.','231111211211111132','231121111112112132','232111112111111232','.2311211111121132.','231111111211111132','231211211112112132','232111111111111232','.2321121121121232.','..23311111111332..','...223333333322...','.....22333322.....','.......2332.......','.......2332.......'];
  const tree=(x,y)=>{if(gba){rect(x+2,y+15,16,3,T.deep);stamp(treeGBA,x,y,[null,T.tuft,T.deep,T.ink],1.05);rect(x+8,y+15,2,4,T.wood);rect(x+8,y+15,1,3,T.shade);}else stamp(gb?treeGB:treeGBC,x,y,[null,gb?T.grass:T.tuft,T.deep,T.ink]);};
  for(let y=-8;y<115;y+=14){tree(-2,y);tree(145,y);}for(let x=12;x<148;x+=14)tree(x,-10);
  const flower=(x,y)=>{rect(x+1,y+3,1,2,T.deep);rect(x,y+4,3,1,T.tuft);stamp(['.1.','121','.1.'],x,y,[null,T.flower,T.shine]);};
  rect(17,49,22,15,T.tuft);for(let y=50;y<65;y+=6)for(let x=19;x<39;x+=6)flower(x,y);
  for(const [x,y]of [[62,113],[66,116],[121,82],[127,85],[90,18]])flower(x,y);
  const fence=(x,y,n)=>{for(let i=0;i<n;i++){rect(x+i*4,y,2,5,T.ink);rect(x+i*4,y,1,4,T.shine);}rect(x,y+1,n*4,1,T.shade);rect(x,y+3,n*4,1,T.shade);};
  fence(18,81,7);fence(97,113,9);
  const window=(x,y,wide=false)=>{const a=wide?10:7;rect(x-1,y-1,a+2,8,T.ink);rect(x,y,a,6,T.glass);rect(x,y,a,1,gb?T.shine:T.roofBlue);rect(x,y+5,a,1,T.shine);rect(x+Math.floor(a/2),y,1,6,T.shine);rect(x,y+3,a,1,T.shine);if(gba){rect(x+1,y+1,1,2,'#e7f7ef');rect(x-1,y+7,a+2,1,T.shade);}};
  const house=(x,y,lab=false)=>{
   const width=lab?42:34,roofH=lab?14:12,wallH=lab?28:17,bottom=y+roofH+wallH,roof=lab?T.roof:T.roofBlue,highlight=gb?T.roofHi:lab?T.roofHi:gba?'#a5bde7':'#84a5ce',seam=gb?T.deep:lab?'#944a39':gba?'#426ba5':'#396b9c';
   if(!gb){rect(x+3,y+roofH+wallH-1,width+1,3,T.deep);rect(x+width-1,y+8,3,wallH+roofH-7,T.deep);}
   rect(x+1,y+roofH,width-2,wallH,T.ink);rect(x+2,y+roofH,width-4,wallH-2,T.wall);
   rect(x+width-6,y+roofH,4,wallH-2,T.shade);rect(x+2,bottom-3,width-4,2,T.shade);
   // Roof pitch, ridge, interlocking courses, overhang and chimney.
   for(let row=0;row<roofH;row++){const inset=Math.max(0,4-Math.floor(row/2));rect(x+inset,y+row,width-2*inset,1,T.ink);rect(x+inset+1,y+row,width-2*inset-2,1,row===0?T.shine:row%4===1?highlight:roof);}
   for(let row=3;row<roofH-1;row+=4)for(let xx=x+3+(row%8?2:0);xx<x+width-3;xx+=5){rect(xx,y+row,3,1,seam);rect(xx+2,y+row+1,1,2,seam);}
   rect(x,y+roofH-1,width,2,T.ink);rect(x+1,y+roofH,width-2,1,T.shade);
   rect(x+width-11,y-2,5,7,T.ink);rect(x+width-10,y-1,3,6,T.shade);rect(x+width-11,y-2,5,1,T.shine);
   const doorX=x+Math.floor(width/2)-3;rect(doorX-1,bottom-12,8,11,T.ink);rect(doorX,bottom-11,6,9,T.wood);rect(doorX+1,bottom-10,3,1,T.shade);rect(doorX+4,bottom-7,1,1,T.shine);rect(doorX-2,bottom-1,10,2,T.shine);rect(doorX-2,bottom+1,10,1,T.pathEdge);
   if(lab){window(x+5,y+roofH+4);window(x+width-13,y+roofH+4);window(x+15,y+roofH+4,true);rect(x+3,y+roofH+12,width-6,1,T.shade);window(x+5,bottom-10);window(x+width-13,bottom-10);}
   else{window(x+4,bottom-11);window(x+width-11,bottom-11);if(gba){rect(x+1,bottom-6,1,3,T.wood);rect(x+width-2,bottom-6,1,3,T.wood);}}
   if(gba)for(let yy=y+roofH+2;yy<bottom-4;yy+=4){rect(x+2,yy,3,1,T.shade);rect(x+width-7,yy+1,2,1,T.wall);}
  };
  house(25,4,true);house(66,36);house(26,84);house(91,84);
  const sign=(x,y)=>{rect(x+2,y+5,2,3,T.wood);rect(x,y,8,6,T.ink);rect(x+1,y+1,6,4,T.wall);rect(x+2,y+2,4,1,T.wood);rect(x+2,y+4,3,1,T.shade);};
  sign(18,106);sign(118,106);sign(91,65);
  if(gba){rect(19,73,11,1,T.wood);rect(19,75,11,2,T.wood);rect(20,77,1,2,T.ink);rect(28,77,1,2,T.ink);}
  const pixel=gba?20:16,icon=palette(hero,C,doc);c.drawImage(icon,Math.round(w*.5-pixel/2),Math.round(h*22/32-pixel),pixel,pixel);return canvas;
 }
 function dsStyle(image,id,doc=root.document){
  if(id==='hd2d')return image;
  const canvas=doc.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d');c.drawImage(image,0,0);const data=c.getImageData(0,0,canvas.width,canvas.height);
  const green=[[36,68,60],[52,92,72],[76,120,84],[112,152,100],[148,180,128],[184,204,160]],blue=[[44,60,100],[60,84,128],[88,120,160],[132,164,192],[180,204,216]],roof=[[72,52,60],[112,64,72],[156,84,88],[196,116,112],[224,164,148]];
  for(let at=0;at<data.data.length;at+=4){let r=data.data[at],g=data.data[at+1],b=data.data[at+2];
   if(id==='platinum'){const light=(r+g+b)/3;let colors=g>r*1.08&&g>b*1.06?green:b>r*1.12&&b>g*.94?blue:r>g*1.15?roof:null;
    if(colors){const level=colors===green?g:light,color=colors[Math.min(colors.length-1,Math.floor(level/256*colors.length))];[r,g,b]=color;}
    else{r=Math.min(248,Math.round((r*.92+14)/16)*16);g=Math.min(248,Math.round((g*.93+13)/16)*16);b=Math.min(248,Math.round((b*.98+11)/16)*16);}
   }else{if(id==='black2'){r=r*1.035-1.53;g=g*1.035-1.53;b=b*1.035-1.53;}r=Math.max(0,Math.min(248,Math.round(r/8)*8));g=Math.max(0,Math.min(248,Math.round(g/8)*8));b=Math.max(0,Math.min(248,Math.round(b/8)*8));}
   data.data[at]=r;data.data[at+1]=g;data.data[at+2]=b;
  }c.putImageData(data,0,0);return canvas;
 }
 function compose(landscapes,hero,doc=root.document){
  const cards=eras.map(era=>{if(era.id==='black2')return landscapes.evolution.snapshot(0,hero);if(era.colors&&era.id!=='platinum'){const image=retro(era,hero,doc),matte=doc.createElement('canvas');matte.width=Math.round(Math.max(image.width,image.height*4/3));matte.height=Math.round(Math.max(image.height,image.width*3/4));const c=matte.getContext('2d');c.fillStyle='#13272e';c.fillRect(0,0,matte.width,matte.height);c.drawImage(image,(matte.width-image.width)/2,(matte.height-image.height)/2);return matte;}const record=landscapes[era.id],canvas=doc.createElement('canvas');canvas.width=record.image.width;canvas.height=record.image.height;const c=canvas.getContext('2d');c.drawImage(record.image,0,0);paintHero(c,hero,record.hero,[canvas.width,canvas.height]);return dsStyle(canvas,era.id,doc);});
  const owner=landscapes.evolution;cards.evolution={draw:t=>owner.draw(t,hero),dispose:()=>owner.dispose(),get lastView(){return owner.lastView;}};return cards;
 }
 function draw(c,cards,p,font){
  const canvas=c.canvas,scale=canvas.width/256;c.save();c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,256,224);c.fillStyle='#13272e';c.fillRect(0,0,256,224);
  const card=(image,alpha)=>{const s=Math.min(256/image.width,192/image.height);c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.drawImage(image,(256-image.width*s)/2,(192-image.height*s)/2,image.width*s,image.height*s);c.restore();};
  if(p.index===5){if(!cards.evolution)throw Error('La camera della transizione non è pronta');card(cards.evolution.draw(p.mix),1);}
  else card(cards[p.index],1);
  if(p.mix&&p.index<5){const image=cards[p.index+1],s=Math.min(256/image.width,192/image.height),ox=(256-image.width*s)/2,oy=(192-image.height*s)/2;
   const strip=(x,y,width,height,alpha)=>{x=Math.max(x,ox);width=Math.min(width,ox+image.width*s-x);if(width<=0)return;c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.drawImage(image,(x-ox)/s,(y-oy)/s,width/s,height/s,x,y,width,height);c.restore();};
   for(let y=oy;y<oy+image.height*s;y+=2){const band=revealBand(p.mix,y/192),opaque=Math.max(ox,Math.min(ox+image.width*s,band.front-band.feather));strip(ox,y,opaque-ox,Math.min(2,oy+image.height*s-y),1);
    for(let x=Math.max(ox,opaque);x<Math.min(ox+image.width*s,band.front);x+=2)strip(x,y,Math.min(2,band.front-x),Math.min(2,oy+image.height*s-y),smooth((band.front-x)/band.feather));
   }
  }
  c.fillStyle='#f8f8f0';c.fillRect(0,192,256,32);
  const alpha=Math.abs(1-2*p.mix),caption=Math.min(6,p.index+(p.mix>.5?1:0));
  if(alpha>0){c.save();c.globalAlpha=alpha;root.NativeText.draw(c,font,'SOFFIOLIEVE - '+eras[caption].label,128,202,false,'center',root.NAMING_ASSETS.font);c.restore();}c.restore();
 }
 function play({canvas,cards,font,onFrame=()=>{},request=root.requestAnimationFrame,cancel=root.cancelAnimationFrame,document:doc=root.document,rate=()=>root.GameSpeed?.rate||1}={}){const time=clock(),c=canvas.getContext('2d');let raf,stopped=false,resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});const finish=value=>{cards.evolution?.dispose();resolve(value);};const stop=()=>{if(stopped)return;stopped=true;cancel(raf);finish(false);};const tick=now=>{if(stopped)return;try{const p=time.tick(now,{hidden:doc.hidden,rate:rate()});if(!doc.hidden){draw(c,cards,p,font);onFrame({...p,view:p.index===5?cards.evolution?.lastView:null});}if(time.done){stopped=true;finish(true);}else raf=request(tick);}catch(error){stopped=true;cards.evolution?.dispose();reject(error);}};raf=request(tick);return{promise,cancel:stop};}
 const api={evolutionCamera,eras,cameras,checkpoints,townScene,frame,clock,tileAlpha,revealBand,bounds,prepare,palette,retro,dsStyle,compose,draw,play,get preparing(){return prepares>0;},get activeViews(){return liveViews;}};root.IntroHistory=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
