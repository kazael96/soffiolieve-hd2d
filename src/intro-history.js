/* One Soffiolieve panorama reinterpreted across eras. Native Black geometry ends the montage. */
(function(root){
 'use strict';
 const eras=Object.freeze([
  {id:'yellow',label:'GIALLO',size:[160,144],colors:['#f7efb5','#bdb86b','#737544','#303b31']},
  {id:'gold',label:'ORO',size:[160,144],colors:['#fff7ce','#a5cd73','#73a55a','#294a31','#dec694','#ce7352','#e7b552','#5a8cbd','#b59463','#524a39','#396b9c','#84b5e7']},
  {id:'emerald',label:'SMERALDO',size:[240,160],colors:['#fff7d6','#a5d67b','#73b563','#315a42','#f7e7bd','#d67352','#f7ce63','#739cce','#dec694','#9c735a','#426ba5','#b5d6e7','#4a8c5a','#6bb5ad','#de94ad','#e7bd94']},
  {id:'platinum',label:'PLATINO',size:[256,192],colors:['#f7ecd6','#93bf7b','#3e7658','#40505b','#ddc7ac','#b67069','#e9ce8c','#6a98c6']},
  {id:'black',label:'NERO',size:[256,192]},
  {id:'hd2d',label:'HD-2D',size:[768,576]}
 ]);
 const checkpoints=Object.freeze([...Array.from({length:13},(_,i)=>i*27),...Array.from({length:5},(_,i)=>i*54+43)].sort((a,b)=>a-b));
 const cameras=Object.freeze({platinum:{angle:66,cinema:false,clear:[.50,.64,.60],style:'sinnoh'},black:{angle:51,cinema:false,clear:[.27,.42,.38],style:'unova'},hd2d:{angle:25,cinema:true,clear:[.22,.39,.39],style:'hd2d'}});
 function townScene(source){const instances=source.instances.filter(i=>i.x>=-16&&i.x<16&&i.z>=-16&&i.z<16);if(!instances.some(i=>i.model==='map0'))throw Error('Mappa originale di Soffiolieve mancante');return{...source,instances,permissionGrids:source.permissionGrids.filter(g=>g.x===0&&g.z===0)};}
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 function frame(value){const f=Math.max(0,Math.min(324,Number(value)||0)),index=Math.min(5,Math.floor(f/54)),local=f-index*54;return{frame:f,index,id:eras[index].id,mix:index<5?smooth((local-32)/22):0,done:f>=324};}
 function clock(){let f=0,last;return{tick(now,{hidden=false,rate=1}={}){if(!Number.isFinite(now))throw Error('Invalid era clock');if(last===undefined){last=now;return frame(0);}const dt=Math.max(0,Math.min(100,now-last));last=now;if(!hidden){const next=checkpoints.find(x=>x>f)??324;f=Math.min(next,f+dt*.03*Math.max(1,Math.min(4,Number(rate)||1)));}return frame(f);},get done(){return f===324;}};}
 // Bounded diagonal pixel reveal: every tile settles before the next era starts.
 function tileAlpha(mix,x,y){return smooth((clamp(mix)*1.18-x*.70-y*.30)/.18);}
 function revealBand(mix,y){return {front:clamp(mix)*312-clamp(y)*32-16,feather:8};}
 function bounds(scene){const b={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};for(const i of scene.instances){const model=root.OPENING_ASSETS.models[i.model]||scene.models[i.model],cs=Math.cos(i.rotation),sn=Math.sin(i.rotation);for(const g of model.groups)for(let at=0;at<g.verts.length;at+=11){const v=g.verts,x=v[at]*cs+v[at+2]*sn+i.x,y=v[at+1]+i.y,z=-v[at]*sn+v[at+2]*cs+i.z;b.minX=Math.min(b.minX,x);b.maxX=Math.max(b.maxX,x);b.minY=Math.min(b.minY,y);b.maxY=Math.max(b.maxY,y);b.minZ=Math.min(b.minZ,z);b.maxZ=Math.max(b.maxZ,z);}}if(!Object.values(b).every(Number.isFinite))throw Error('Soffiolieve geometry is incomplete');return b;}
 let prepares=0;
 async function prepare(){
  prepares++;
  const doc=root.document,canvas=doc.createElement('canvas');let r;
  try{r=new VillageRenderer(canvas,{listen:false,isolated:true,viewSize:[256,192],cacheBytes:16*1024*1024});r.scene=townScene(ROM_SCENE);r.requiredActors=[];await r.pending;if(!r.ready||!r.hasResources(r.resourcePlan([])))throw r.loadingError||Error('Panorama di Soffiolieve non pronto');
   const box=bounds(r.scene),result={source:'Original Soffiolieve map0 geometry and textures, authored panoramic framing',bounds:box},spanX=box.maxX-box.minX,spanZ=box.maxZ-box.minZ;
   // townScene already returns our private descriptor. Replacing it here would
   // invoke VillageRenderer.scene and queue an asynchronous reload before capture.
   for(const [id,size]of [['platinum',[256,192]],['black',[256,192]],['hd2d',[768,576]]]){const {angle,cinema,clear}=cameras[id];r.scene.clearColor=clear;
    r.viewSize=size;r.center=[(box.minX+box.maxX)/2,(box.minZ+box.maxZ)/2];r.cameraPitch=[Math.sin(angle*Math.PI/180),Math.cos(angle*Math.PI/180)];r.elevation=(box.maxY+box.minY)*.4;r.cinema=cinema;
    const scale=Math.min(size[0]/30,size[1]/21),height=spanZ*r.cameraPitch[0]+(box.maxY-box.minY)*r.cameraPitch[1];r.zoom=Math.min(size[0]/(spanX*1.08*scale),size[1]/(height*1.1*scale));r.draw(0,[]);if(!r.ready||!r.hasResources(r.resourcePlan([]))||r.gl.isContextLost()||r.gl.getError())throw Error('Panorama context lost or resources no longer ready');
    const image=doc.createElement('canvas');image.width=size[0];image.height=size[1];const target=image.getContext('2d');
    if(cinema)target.drawImage(canvas,0,0);
    else{
     // Read the prepared scene before the project's bloom, sun and vignette pass.
     // Merely setting cinema=false disables blur, but retains those modern effects.
     const gl=r.gl,pixels=new Uint8Array(size[0]*size[1]*4),captured=target.createImageData(size[0],size[1]);gl.bindFramebuffer(gl.FRAMEBUFFER,r.framebuffer);
     try{gl.readPixels(0,0,size[0],size[1],gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(gl.getError())throw Error('Cattura DS non disponibile');}finally{gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
     for(let y=0;y<size[1];y++)captured.data.set(pixels.subarray((size[1]-1-y)*size[0]*4,(size[1]-y)*size[0]*4),y*size[0]*4);target.putImageData(captured,0,0);
    }
    const point=r.screen(0,6,.04);result[id]={image,hero:{x:point[0]/size[0],y:point[1]/size[1],width:2*point[2]/size[0],height:2*point[2]/size[1]},camera:{angle,zoom:r.zoom,center:[...r.center]},style:cameras[id].style};
   }return result;
  }finally{try{if(r){r.resourceEpoch++;r.recovery?.dispose();r.disposeGraphics();r.gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.width=canvas.height=0;}}finally{prepares--;}}
 }
 function palette(image,colors,doc=root.document){const c=doc.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);const data=x.getImageData(0,0,c.width,c.height),rgb=colors.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));for(let at=0;at<data.data.length;at+=4){if(!data.data[at+3])continue;let best=rgb[0],distance=Infinity;for(const color of rgb){const d=color.reduce((sum,v,i)=>sum+(v-data.data[at+i])**2,0);if(d<distance){best=color;distance=d;}}data.data[at]=best[0];data.data[at+1]=best[1];data.data[at+2]=best[2];}x.putImageData(data,0,0);return c;}
 function retro(era,hero,doc=root.document){
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
   }else{r=Math.min(248,Math.round(r/8)*8);g=Math.min(248,Math.round(g/8)*8);b=Math.min(248,Math.round(b/8)*8);}
   data.data[at]=r;data.data[at+1]=g;data.data[at+2]=b;
  }c.putImageData(data,0,0);return canvas;
 }
 function compose(landscapes,hero,doc=root.document){
  return eras.map(era=>{if(era.colors&&era.id!=='platinum'){const image=retro(era,hero,doc),matte=doc.createElement('canvas');matte.width=Math.round(Math.max(image.width,image.height*4/3));matte.height=Math.round(Math.max(image.height,image.width*3/4));const c=matte.getContext('2d');c.fillStyle='#13272e';c.fillRect(0,0,matte.width,matte.height);c.drawImage(image,(matte.width-image.width)/2,(matte.height-image.height)/2);return matte;}const record=landscapes[era.id],canvas=doc.createElement('canvas');canvas.width=record.image.width;canvas.height=record.image.height;const c=canvas.getContext('2d');c.drawImage(record.image,0,0);const p=record.hero,w=p.width*canvas.width,h=p.height*canvas.height;c.fillStyle='#18352e55';c.beginPath();c.ellipse(p.x*canvas.width,p.y*canvas.height,w*.3,h*.1,0,0,Math.PI*2);c.fill();c.imageSmoothingEnabled=false;c.drawImage(hero,p.x*canvas.width-w/2,p.y*canvas.height-h,w,h);return dsStyle(canvas,era.id,doc);});
 }
 function draw(c,cards,p,font){
  const canvas=c.canvas,scale=canvas.width/256;c.save();c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,256,224);c.fillStyle='#13272e';c.fillRect(0,0,256,224);
  const card=(image,alpha)=>{const s=Math.min(256/image.width,192/image.height);c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.drawImage(image,(256-image.width*s)/2,(192-image.height*s)/2,image.width*s,image.height*s);c.restore();};
  card(cards[p.index],1);
  if(p.mix){const image=cards[p.index+1],s=Math.min(256/image.width,192/image.height),ox=(256-image.width*s)/2,oy=(192-image.height*s)/2;
   const strip=(x,y,width,height,alpha)=>{x=Math.max(x,ox);width=Math.min(width,ox+image.width*s-x);if(width<=0)return;c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.drawImage(image,(x-ox)/s,(y-oy)/s,width/s,height/s,x,y,width,height);c.restore();};
   for(let y=oy;y<oy+image.height*s;y+=2){const band=revealBand(p.mix,y/192),opaque=Math.max(ox,Math.min(ox+image.width*s,band.front-band.feather));strip(ox,y,opaque-ox,Math.min(2,oy+image.height*s-y),1);
    for(let x=Math.max(ox,opaque);x<Math.min(ox+image.width*s,band.front);x+=2)strip(x,y,Math.min(2,band.front-x),Math.min(2,oy+image.height*s-y),smooth((band.front-x)/band.feather));
   }
  }
  c.fillStyle='#f8f8f0';c.fillRect(0,192,256,32);
  const alpha=Math.abs(1-2*p.mix),caption=Math.min(5,p.index+(p.mix>.5?1:0));
  if(alpha>0){c.save();c.globalAlpha=alpha;root.NativeText.draw(c,font,'SOFFIOLIEVE - '+eras[caption].label,128,202,false,'center',root.NAMING_ASSETS.font);c.restore();}c.restore();
 }
 function play({canvas,cards,font,onFrame=()=>{},request=root.requestAnimationFrame,cancel=root.cancelAnimationFrame,document:doc=root.document,rate=()=>root.GameSpeed?.rate||1}={}){const time=clock(),c=canvas.getContext('2d');let raf,stopped=false,resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});const stop=()=>{if(stopped)return;stopped=true;cancel(raf);resolve(false);};const tick=now=>{if(stopped)return;try{const p=time.tick(now,{hidden:doc.hidden,rate:rate()});if(!doc.hidden){draw(c,cards,p,font);onFrame(p);}if(time.done){stopped=true;resolve(true);}else raf=request(tick);}catch(error){stopped=true;reject(error);}};raf=request(tick);return{promise,cancel:stop};}
 const api={eras,cameras,checkpoints,townScene,frame,clock,tileAlpha,revealBand,bounds,prepare,palette,retro,dsStyle,compose,draw,play,get preparing(){return prepares>0;}};root.IntroHistory=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
