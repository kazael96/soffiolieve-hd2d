/* Full-sequence native-source reference only; no battle command is supplied. */
(function(root){
 'use strict';
 const clone=value=>JSON.parse(JSON.stringify(value));
 function alphaProof(data,width,height){
  if(!data||data.length!==width*height*4)throw Error('Invalid native reference alpha readback');
  let opaque=0,edge=0,minX=width,minY=height,maxX=-1,maxY=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){opaque++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);if(x===0||y===0||x===width-1||y===height-1)edge++;}
  return{nonzeroAlphaPixels:opaque,edgeAlphaPixels:edge,bounds:opaque?[minX,minY,maxX+1,maxY+1]:null};
 }
 async function run(e){
  const {SpeciesMoves:S,ROM_SPRITE_ANIM:R,check}=e,cell=e.cellSize??160;
  check(cell===160||cell===192,'Tail reference cells must be160 or192 pixels');
  const create=e.createCanvas||(()=>root.document.createElement('canvas')),anchor=[cell/2,cell-15],size=1.3,owners={sample:S.sample,part:S.part,select:S.select,prepare:S.prepare,draw:R.draw},sequences=[];
  function canvas(width,height){const c=create();c.width=width;c.height=height;return c;}
  const tile=canvas(cell,cell),tileContext=tile.getContext('2d',{willReadFrequently:true});check(!!tileContext,'Tail reference native canvas unavailable');
  let total=0,boards=0;
  for(const species of[500,503]){
   const p=S.select(species,39,{});
   check(p?.species===species&&p.id===39&&p.frames===126&&p.impact===60&&p.kind==='nativeTailWhipStatus064','Tail reference requires current guarded production profile');
   await S.prepare(p);
   check(S.sample===owners.sample&&S.part===owners.part&&S.select===owners.select&&S.prepare===owners.prepare&&R.draw===owners.draw,'Tail reference source owner changed');
   for(const view of['front','back']){
    const back=view==='back',side=back?'p1':'p2',bank=R.cache?.[species+'-'+view],rows=[],sequence={species,moveId:39,view,side,frames:0,boards:[]};
    check(bank?.ready&&bank.image&&bank.data,'Tail reference actual native bank unavailable');
    check(typeof R.parts==='function','Tail reference native part introspection unavailable');
    for(const part of R.parts(bank.data,0,0))if(!rows.some(row=>row.track===part.r[0]))rows.push({track:part.r[0],cell:part.f[0],row:[part.r[1],part.r[2]]});
    let board=null,boardContext=null,metadata=null;
    for(let f=0;f<=126;f++){
     if(f%16===0){board=canvas(cell*4,cell*4);boardContext=board.getContext('2d');check(!!boardContext,'Tail reference board canvas unavailable');boardContext.clearRect(0,0,board.width,board.height);metadata={referenceOnly:true,actualBattleCommand:false,suppliedBattleOutcomes:false,sourcePins:e.sourcePins||null,species,moveId:39,view,side,board:Math.floor(f/16)+1,cellSize:cell,columns:4,rows:4,anchor:anchor.slice(),size,grounded:true,nativeTick:0,frames:[],unusedTilesTransparent:true};}
     const a=S.sample(p,f,side,false);
     check(a?.species===species&&a.nativeTailWhip===species&&a.nativeTick===0&&a.nativeParentMap===0&&a.feet===0&&a.reach===0&&a.lift===0,'Tail reference sample lost native body ownership or stable anchor');
     tileContext.clearRect(0,0,cell,cell);
     check(owners.draw.call(R,tileContext,species,back,anchor[0],anchor[1],size,0,true,a)===true,'Tail reference original native draw failed');
     const alpha=alphaProof(tileContext.getImageData(0,0,cell,cell).data,cell,cell);
     check(alpha.nonzeroAlphaPixels>0,'Tail reference native draw was empty');
     check(alpha.edgeAlphaPixels===0,'Tail reference native sprite clips cell at '+species+'/'+view+'/'+f+'; use explicit cellSize192 rerun, keep size1.3');
     const index=f%16,x=index%4*cell,y=Math.floor(index/4)*cell;
     boardContext.fillStyle='#203a37';boardContext.fillRect(x,y,cell,cell);boardContext.drawImage(tile,x,y);boardContext.fillStyle='#e8f0e7';boardContext.font='11px monospace';boardContext.fillText(species+' '+view+' f'+f,x+5,y+13);
     const pose=Object.fromEntries(['species','t','dir','nativeTailWhip','nativeTick','nativeParentMap','tail','head','arms','feet','reach','lift'].map(key=>[key,a[key]??null]));
     metadata.frames.push({frame:f,tile:index,anchor:anchor.slice(),alpha,pose,parts:rows.map(row=>({...row,transform:clone(S.part(row.track,back,a)??null)}))});
     total++;sequence.frames++;
     if(f%16===15||f===126){metadata.usedTiles=metadata.frames.length;metadata.unusedTiles=16-metadata.usedTiles;await e.capture('064 tail source '+species+' '+view+' board'+metadata.board,board,metadata);boards++;sequence.boards.push({board:metadata.board,firstFrame:metadata.frames[0].frame,lastFrame:f,usedTiles:metadata.usedTiles});metadata=null;board=null;boardContext=null;}
    }
    check(sequence.frames===127&&sequence.boards.length===8,'Tail reference native sequence incomplete');sequences.push(sequence);
   }
  }
  check(total===508&&boards===32&&sequences.length===4,'Tail reference coverage incomplete');
  check(S.sample===owners.sample&&S.part===owners.part&&S.select===owners.select&&S.prepare===owners.prepare&&R.draw===owners.draw,'Tail reference changed native source owners');
  return{sourcePins:e.sourcePins||null,referenceOnly:true,actualBattleCommands:false,suppliedBattleOutcomes:false,cellSize:cell,anchor,size,frames:total,boards,sequences,scope:'Original production source samples and original native renderer, all127 frames/front/back. Alpha readback proves nonempty unclipped cells only; no visual-quality, physical-foot-support, audible or actual-command acceptance.'};
 }
 const api={alphaProof,run};root.QATailReference064=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
