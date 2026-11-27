/* Complete source-body reference only. This never supplies battle commands. */
(function(root){
 'use strict';
 const sourceKeys=Object.freeze(['back','front'].flatMap(view=>['far','near'].flatMap(depth=>['cap','cuff','fan'].map(part=>view+'-'+depth+'-'+part))));
 function alphaProof(data,width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||!data||data.length!==width*height*4)throw Error('Invalid Gust reference alpha readback');
  let count=0,edge=0,left=width,top=height,right=-1,bottom=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){count++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);if(x===0||y===0||x===width-1||y===height-1)edge++;}
  return{nonzeroAlphaPixels:count,edgeAlphaPixels:edge,bounds:count?[left,top,right+1,bottom+1]:null};
 }
 async function run(e){
  const{SpeciesMoves:S,ROM_SPRITE_ANIM:R,check}=e,U=e.UnfezantMoves||root.UnfezantMoves,cell=320,anchor=[160,300],size=1.3,create=e.createCanvas||(()=>root.document.createElement('canvas')),sequences=[];
  check(S&&R&&U&&typeof U.ready==='function'&&U.images instanceof Map&&U.sourceOwners instanceof Map,'Gust reference requires the installed production wing rig');
  check(typeof R.parts==='function','Gust reference native part identity API unavailable');
  const owners={sample:S.sample,part:S.part,select:S.select,prepare:S.prepare,draw:R.draw,parts:R.parts,ready:U.ready,images:U.images,sourceOwners:U.sourceOwners};
  const rootOwners={SpeciesMoves:root.SpeciesMoves,ROM_SPRITE_ANIM:root.ROM_SPRITE_ANIM,UnfezantMoves:root.UnfezantMoves};
  let wingBindings=null;
  function unchanged(){check(e.SpeciesMoves===S&&e.ROM_SPRITE_ANIM===R&&S.sample===owners.sample&&S.part===owners.part&&S.select===owners.select&&S.prepare===owners.prepare&&R.draw===owners.draw&&R.parts===owners.parts&&U.ready===owners.ready&&U.images===owners.images&&U.sourceOwners===owners.sourceOwners&&Object.entries(rootOwners).every(([key,value])=>root[key]===value)&&(!wingBindings||wingBindings.every(b=>U.images.get(b.key)===b.image&&U.sourceOwners.get(b.key)===b.owner&&b.owner.pngSHA256===b.hash)),'Gust reference source owner changed');}
  function wingSources(){check(U.images.size===12&&U.sourceOwners.size===12,'Gust reference requires all12 prepared wing images and owners');const rows=sourceKeys.map(key=>{const image=U.images.get(key),owner=U.sourceOwners.get(key);check(image?.naturalWidth===128&&image.naturalHeight===128&&typeof owner?.pngSHA256==='string'&&/^[a-f0-9]{64}$/.test(owner.pngSHA256),'Gust reference wing image/owner unavailable '+key);return{key,image,owner,hash:owner.pngSHA256};});wingBindings??=rows;return Object.fromEntries(rows.map(b=>[b.key,b.hash]));}
  function canvas(w,h){const c=create();c.width=w;c.height=h;return c;}
  const tile=canvas(cell,cell),context=tile.getContext('2d',{willReadFrequently:true});check(!!context,'Gust reference source canvas unavailable');context.imageSmoothingEnabled=false;
  let total=0,boards=0;
  for(const [gender,graphic]of[['M',521],['F','521-female']]){
   unchanged();const profile=S.select(521,16,{});check(profile?.species===521&&profile.id===16&&profile.frames===126&&profile.impact===60&&profile.nativeEffects===true,'Gust reference requires current521/16 production profile');
   const options={cryIds:{p1:graphic,p2:graphic},side:'p1'},prepared=await S.prepare(profile,options);unchanged();const hashes=wingSources(),banks=['front','back'].map(view=>graphic+'-'+view);
   check(U.ready(graphic)===true&&String(prepared?.graphic)===String(graphic)&&prepared.images===12&&Array.isArray(prepared.banks)&&banks.every(key=>prepared.banks.includes(key)),'Gust reference form preparation did not verify both native views');
   for(const key of banks)check(R.cache?.[key]?.ready&&R.cache[key].image&&R.cache[key].data,'Gust reference actual form bank unavailable '+key);
   for(const view of['front','back']){
    const back=view==='back',side=back?'p1':'p2',bankKey=graphic+'-'+view,bank=R.cache[bankKey],sequence={species:521,moveId:16,gender,graphic,view,side,bankKey,frames:0,boards:[]};let board,boardContext,metadata;
    for(let f=0;f<=126;f++){
     unchanged();check(R.cache[bankKey]===bank&&U.ready(graphic)===true,'Gust reference native bank owner/readiness changed');
     if(f%16===0){board=canvas(cell*4,cell*4);boardContext=board.getContext('2d');check(!!boardContext,'Gust reference board canvas unavailable');boardContext.clearRect(0,0,board.width,board.height);metadata={referenceOnly:true,actualBattleCommand:false,normalTempoPlayback:false,suppliedBattleOutcomes:false,sourcePins:e.sourcePins||null,species:521,moveId:16,gender,graphic,view,side,bankKey,board:Math.floor(f/16)+1,cellSize:cell,columns:4,rows:4,anchor:anchor.slice(),size,grounded:true,nativeBodyHeight:80*size,wingSourceHashes:{...hashes},frames:[],unusedTilesTransparent:true};}
     const a=S.sample(profile,f,side,false);unchanged();check(a?.species===521&&a.unfezantPaintedWing?.frame===f,'Gust reference sample lost authored521/16 wing ownership');const tick=Number.isFinite(a.nativeTick)?a.nativeTick:0;
     context.clearRect(0,0,cell,cell);check(owners.draw.call(R,context,graphic,back,anchor[0],anchor[1],size,tick,true,a)===true,'Gust reference original native draw failed');unchanged();
     const alpha=alphaProof(context.getImageData(0,0,cell,cell).data,cell,cell);check(alpha.nonzeroAlphaPixels>0,'Gust reference original native draw was empty');check(alpha.edgeAlphaPixels===0,'Gust reference full body clips320px cell at '+graphic+'/'+view+'/'+f+'; do not shrink the production body');
     const parts=[];for(const part of owners.parts.call(R,bank.data,tick,a.nativeParentMap,a.nativeCells))if(!parts.some(row=>row.track===part.r[0]))parts.push({track:part.r[0],cell:part.f[0],row:[part.r[1],part.r[2]]});unchanged();
     const index=f%16,x=index%4*cell,y=Math.floor(index/4)*cell;boardContext.fillStyle='#203a37';boardContext.fillRect(x,y,cell,cell);boardContext.drawImage(tile,x,y);boardContext.fillStyle='#e8f0e7';boardContext.font='12px monospace';boardContext.fillText('521 '+gender+' '+view+' f'+f,x+6,y+16);
     metadata.frames.push({frame:f,tile:index,anchor:anchor.slice(),nativeTick:tick,alpha,pose:{species:a.species,t:a.t??null,nativeTick:a.nativeTick??null,nativeParentMap:a.nativeParentMap??null,wing:{...a.unfezantPaintedWing}},parts});total++;sequence.frames++;
     if(f%16===15||f===126){metadata.usedTiles=metadata.frames.length;metadata.unusedTiles=16-metadata.usedTiles;await e.capture('064 Gust source '+gender+' '+view+' board'+metadata.board,board,metadata);unchanged();boards++;sequence.boards.push({board:metadata.board,firstFrame:metadata.frames[0].frame,lastFrame:f,usedTiles:metadata.usedTiles});}
    }
    check(sequence.frames===127&&sequence.boards.length===8,'Gust reference source sequence incomplete');sequences.push(sequence);
   }
  }
  unchanged();check(total===508&&boards===32&&sequences.length===4,'Gust reference source coverage incomplete');
  return{sourcePins:e.sourcePins||null,referenceOnly:true,actualBattleCommands:false,normalTempoPlayback:false,suppliedBattleOutcomes:false,cellSize:cell,anchor,size,frames:total,boards,sequences,scope:'508 complete authored production samples via the original native/hybrid renderer, M/F front/back.32 source boards only, without hooks, commands, forced battle outcomes or body shrink. Readback checks nonempty unclipped cells, not visual quality, movement tempo, ground contact, audible comparison or physical Android.'};
 }
 const api={sourceKeys,alphaProof,run};root.QAGustReference064=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
