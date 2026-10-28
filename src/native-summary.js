/* Native Info/Mosse/Fiocchi page pairing; overlay131 swaps MAIN to the lower LCD. */
(function(root){
 let preparation;
 async function resources(){
   if(!preparation)preparation=(async()=>{
     const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=NativeTextLayout.resource(src);}),a=SUMMARY_DETAIL_ASSETS,layers={};
     await Promise.all(Object.entries(a.layers).map(async([k,v])=>layers[k]=await image(v.src)));
     const tabs=await Promise.all(a.groups.tabs.cells.map(c=>image(c.src))),common=await Promise.all(DEX_BROWSER_ASSETS.groups.detailCommon.cells.map(c=>image(c.src)));
     const moveRows=await Promise.all(a.groups.movePanels.cells.map(c=>image(c.src)));
     const moveTypes=await Promise.all(Array.from({length:17},(_,id)=>image('assets/battle-ui/type-'+id+'.png')));
     const toggles=await Promise.all(a.groups.toggle.cells.map(c=>image(c.src)));
     return {image,layers,tabs,common,moveRows,moveTypes,toggles};
   })();return preparation;
 }
 async function open(screen,index,back,page=0,detail=-1,reverse=false){
   const r=await resources(),a=SUMMARY_DETAIL_ASSETS,p=Journey.state.party[index],m=Journey.unpack(p),name=p.nickname||p.name,dispatch=a.native.pageDispatch[page],t=a.messages['158'];
   const sprite=await r.image('assets/pokemon/'+m.spriteId+(reverse?'-back.png':'-front.png'));
   const types=await Promise.all(POKEDEX_ASSETS.species[p.name].types.map(id=>r.image('assets/pokedex/type-'+id+'.png')));
   const text=(c,value,x,y,white=false,align='left')=>NativeText.draw(c,screen.font,String(value),x,y,white,align);
   const change=(next,selected=-1)=>open(screen,index,back,next,selected,reverse),adjacent=delta=>{const next=index+delta;if(next>=0&&next<Journey.state.party.length)open(screen,next,back,page,-1,reverse);};
   const shortcut=['summary:info','summary:moves','summary:ribbons'][page];
   const buttons=a.native.bottomButtons.map((b,i)=>({label:['Info','Mosse','Fiocchi','Registra o rimuovi la scheda dai comandi rapidi','Pokémon precedente','Pokémon successivo','Chiudi riepilogo','Torna alla squadra'][i],x:b.hitbox[0],y:b.hitbox[1],w:b.hitbox[2],h:b.hitbox[3],disabled:i===2||(i===4&&index===0)||(i===5&&index===Journey.state.party.length-1),action:i<3?()=>change(i):i===3?()=>{NativeUI.register(shortcut);change(page,detail);}:i===4?()=>adjacent(-1):i===5?()=>adjacent(1):i===6?()=>screen.close():back}));
   buttons.push({label:reverse?'Mostra il Pokémon di fronte':'Mostra il Pokémon di spalle',x:176,y:40,w:80,h:80,action:()=>open(screen,index,back,page,detail,!reverse)});
   if(page===1)buttons.unshift(...m.moves.map((move,i)=>({label:move.name+', PP '+move.left+'/'+move.pp,x:8,y:16+i*32,w:136,h:32,action:()=>change(1,i)})));
   const nativeCell=(c,group,images,index,x,y)=>{const cell=group.cells[index];c.drawImage(images[index],x+cell.origin[0],y+cell.origin[1]);};
   function top(c){
     c.drawImage(r.layers.subGrid,0,0);c.drawImage(r.layers[page===1&&detail>=0?'movesSubSelected':dispatch.top],0,0);
     c.drawImage(r.layers[page===1&&detail>=0?'movesHeaderSelected':dispatch.topHeader],0,0,256,24,0,0,256,24);
     if(page===0){
       const bank=a.messages['188'],w=a.native.infoSubWindow,nature=SummaryModel.natureId(m.nature),lines=[NativeTextLayout.format(bank[nature])];
       if(p.met){const date=new Date(p.met.date),zone=p.met.zone===317?317:389,place=TOWNMAP_ASSETS.places.find(z=>z.zone===zone)?.name||'';lines.push(NativeTextLayout.format(bank[25],[String(date.getFullYear()).slice(-2),date.toLocaleString('it-IT',{month:'long'}),date.getDate(),p.met.level,place]));}
       if(Number.isInteger(p.personality))lines.push(NativeTextLayout.format(bank[SummaryModel.characteristic(m.ivs,p.personality)]));
       let y=w.y+1;for(const paragraph of lines){for(const line of NativeTextLayout.wrap(paragraph,POKEDEX_ASSETS.font,w.width)){text(c,line,w.x+1,y);y+=16;}y+=0;}
     }else if(page===1&&detail<0){
       const stats=[m.hp+'/'+m.max,m.stats.atk,m.stats.def,m.stats.spa,m.stats.spd,m.stats.spe];
       a.native.statsText.forEach((entry,i)=>{const w=a.native.statsSubWindows[entry.window];text(c,t[entry.message],w.x+entry.x,w.y+entry.y,i<6);if(i<6)text(c,stats[i],w.x+entry.valueRight,w.y+entry.y,false,'right');else{const at=entry.abilityName,description=entry.abilityDescription;text(c,m.ability,w.x+at.x,w.y+at.y);NativeTextLayout.wrap(a.messages['183'][m.abilityId]||'',POKEDEX_ASSETS.font,160).slice(0,2).forEach((line,j)=>text(c,line,w.x+description.x,w.y+description.y+j*15));}});
     }else if(page===1){
       const move=m.moves[detail];
       a.native.moveDetailsText.forEach(entry=>{const w=a.native.statsSubWindows[entry.window],x=w.x+entry.x,y=w.y+entry.y;if(entry.role==='description'){NativeTextLayout.wrap(a.messages['202'][move.id]||'',POKEDEX_ASSETS.font,w.width-2).slice(0,3).forEach((line,i)=>text(c,line,x,y+i*15));return;}text(c,t[entry.message],x,y);if(entry.role==='category')text(c,move.cat,176,y);else{const value=move[entry.role]||t[entry.placeholderMessage];text(c,value,w.x+entry.valueX,w.y+entry.valueY);}});
     }
   }
   screen.show('Riepilogo di '+name,c=>{
     c.drawImage(r.layers.mainGrid,0,0);c.drawImage(r.layers[dispatch.bottom],0,0);
     if(page===0){
       const growth=OPENING_DATA[p.name].growth,values={0:String(POKEDEX_ASSETS.species[p.name].number).padStart(3,'0'),1:p.name,3:Journey.state.playerName,4:String(Journey.state.trainer?.id??0).padStart(5,'0'),6:p.xp,8:Math.max(0,(growth[p.level+1]||p.xp)-p.xp)};
       a.native.infoText.forEach(entry=>{const w=a.native.infoMainWindows[entry.window],x=w.x+entry.x,y=w.y+entry.y;if(entry.kind==='label')text(c,t[entry.message],x,y,true);else{const value=values[entry.window];text(c,entry.message===null?value:NativeTextLayout.format(t[entry.message],[value]),x,y,x<80);}});
       types.forEach((im,i)=>c.drawImage(im,80+i*34,40));
     }else if(page===1)m.moves.forEach((move,i)=>{
       const row=a.native.moveRows,[x,y]=row.anchors[i],cell=detail===i?row.selectedCell:row.normalCells[i];nativeCell(c,a.groups.movePanels,r.moveRows,cell,x,y);
       const tx=x+row.textWindowOffset[0];text(c,move.name,tx+row.name.x,y+row.name.y);text(c,t[row.ppLabel.message],tx+row.ppLabel.x,y+row.ppLabel.y);text(c,move.left,tx+row.currentPP.right,y+row.currentPP.y,false,'right');text(c,t[row.slash.message],tx+row.slash.x,y+row.slash.y);text(c,move.pp,tx+row.maxPP.x,y+row.maxPP.y);
       const type=r.moveTypes[ROM_BATTLE.typeNames.indexOf(move.type)];if(type)c.drawImage(type,x+row.typeAnchorOffset[0]-16,y+row.typeAnchorOffset[1]-8);
     });
     c.drawImage(sprite,216-sprite.width/2,72-sprite.height/2);
     text(c,name,177,1);text(c,NativeTextLayout.format(t[3],[p.level]),161,17);text(c,m.gender==='F'?'♀':m.gender==='M'?'♂':'',241,1);
     for(let i=0;i<3;i++)nativeCell(c,a.groups.tabs,r.tabs,i===2?8:i===page?i+3:i,i*40,168);
     for(const [key,index,x]of [['previous',3,144],['next',2,168],['close',0,200],['back',1,232]])nativeCell(c,DEX_BROWSER_ASSETS.groups.detailCommon,r.common,index,x,168);
     nativeCell(c,a.groups.toggle,r.toggles,(NativeSettings.state.registered||[]).includes(shortcut)?1:0,124,172);
   },buttons,()=>detail>=0?change(page):back(),{drawFocus:false,top,topLabel:'Riepilogo superiore di '+name,key:key=>{if(key==='y'){NativeUI.register(shortcut);change(page,detail);return true;}if(['arrowleft','arrowright'].includes(key)){change((page+1)%2);return true;}if(['arrowup','arrowdown'].includes(key)){const delta=key==='arrowup'?-1:1;if(page===0){adjacent(delta);return true;}if(detail>=0){change(page,Math.max(0,Math.min(m.moves.length-1,detail+delta)));return true;}}return false;}});if(page===1&&detail>=0){screen.selected=Math.min(detail,m.moves.length-1);screen.focus();}
 }
 root.NativeSummary={open};
})(typeof window!=='undefined'?window:globalThis);
