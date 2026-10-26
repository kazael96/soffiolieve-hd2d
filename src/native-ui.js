/* Native-resolution menu compositor. Graphics/text are converted from IRBI. */
(function(root){
  function wrapQuantity(value,delta,maximum){return value+delta>maximum?1:value+delta<1?maximum:value+delta;}
  function nextButton(buttons,current,dx,dy){
    const from=buttons[current];if(!from)return 0;
    const candidates=buttons.map((b,i)=>({b,i,x:b.x+b.w/2-from.x-from.w/2,y:b.y+b.h/2-from.y-from.h/2})).filter(c=>!c.b.disabled&&(dx?c.x*dx>0:c.y*dy>0));
    candidates.sort((a,b)=>Math.abs(dx?a.y:a.x)-Math.abs(dx?b.y:b.x)||Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));
    return candidates[0]?.i??current;
  }
  const images=new Map();
  function image(url){if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Risorsa interfaccia non disponibile: '+url));i.src=NativeTextLayout.resource(url);}));return images.get(url);}
  class Screen {
    constructor(){
      this.dialog=document.createElement('dialog');this.dialog.id='nativeMenu';this.dialog.className='native-screen';
      this.upper=document.createElement('canvas');this.upper.width=256;this.upper.height=192;this.upper.className='native-upper';this.upper.hidden=true;this.dialog.append(this.upper);this.upperContext=this.upper.getContext('2d');this.upperContext.imageSmoothingEnabled=false;
      this.stage=document.createElement('div');this.stage.className='native-stage';this.canvas=document.createElement('canvas');this.canvas.width=256;this.canvas.height=192;this.canvas.setAttribute('role','img');this.stage.append(this.canvas);this.dialog.append(this.stage);document.body.append(this.dialog);
      this.ctx=this.canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;this.buttons=[];this.selected=0;
      this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.back?.();});
      this.dialog.addEventListener('keydown',e=>{
        if(e.target.closest('input,select,textarea'))return;const k=e.key.toLowerCase();
        if(['arrowup','arrowdown','arrowleft','arrowright','enter',' ','z','a','b','escape','x'].includes(k)){e.preventDefault();e.stopImmediatePropagation();}
        if(this.keyHandler?.(k,e)){e.preventDefault();e.stopImmediatePropagation();return;}
        const directions={arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]};
        if(directions[k]){this.selected=nextButton(this.buttons,this.selected,...directions[k]);this.focus();void root.AudioEngine?.playSound(1352);}
        else if(['enter',' ','z','a'].includes(k))this.activate(this.selected);
        else if(k==='x')this.exit?.();
        else if(['b','escape'].includes(k))this.back?.();
      });
    }
    async ready(){this.font=await NativeText.load();}
    show(title,render,buttons,back,config={}){
      this.keyHandler=config.key;
      this.exit=config.exit||(()=>{if(this.dialog.id==='nativeMenu')this.close();else this.back?.();});
      this.drawFocus=config.drawFocus!==false;
      this.topRender=config.top;this.upper.hidden=!this.topRender;this.dialog.classList.toggle('native-has-top',!!this.topRender);this.upper.setAttribute('role','img');this.upper.setAttribute('aria-label',config.topLabel||title);
      this.title=title;this.render=render;this.back=back;this.buttons=buttons;this.selected=Math.max(0,buttons.findIndex(b=>!b.disabled));
      this.dialog.setAttribute('aria-label',title);this.canvas.setAttribute('aria-label',title);
      this.stage.querySelectorAll('button').forEach(b=>b.remove());
      buttons.forEach((b,i)=>{const el=document.createElement('button');el.type='button';el.className='native-hit';el.textContent=b.label;el.setAttribute('aria-label',b.label);el.disabled=!!b.disabled;Object.assign(el.style,{left:b.x/2.56+'%',top:b.physicalScreen==='top'?'calc('+b.y/1.92+'% - 100% - 4px)':b.y/1.92+'%',width:b.w/2.56+'%',height:b.h/1.92+'%'});el.onclick=()=>this.activate(i);el.onfocus=()=>{this.selected=i;this.draw();};b.element=el;this.stage.append(el);});
      if(!this.dialog.open)this.dialog.showModal();resetInput();this.focus();
    }
    focus(){this.buttons[this.selected]?.element.focus();this.draw();}
    activate(i){const b=this.buttons[i];if(!b||b.disabled)return;void root.AudioEngine?.playSound(1352);b.action();}
    draw(){const c=this.ctx;c.clearRect(0,0,256,192);this.render(c);if(this.topRender){this.upperContext.clearRect(0,0,256,192);this.topRender(this.upperContext);}const b=this.buttons[this.selected];if(this.drawFocus&&b&&!b.disabled&&!['Menu','Pokémon','OPZIONI'].includes(this.title)){c.strokeStyle='#f0a030';c.lineWidth=2;c.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2);}}
    text(value,x,y,white=false,align='left'){NativeText.draw(this.ctx,this.font,String(value),x,y,white,align);}
    close(){this.dialog.close();resetInput();}
  }
  let screen=null,preparation=null,assets={},swapFrom=null;
  const rect=(label,x,y,w,h,action,disabled=false)=>({label,x,y,w,h,action,disabled});
  function background(c,key){const im=assets[key]||assets.main;if(im)c.drawImage(im,0,0,256,192,0,0,256,192);else{c.fillStyle='#eff0f0';c.fillRect(0,0,256,192);}}
  function caption(value){screen.text(value,8,174);}
  function box(c,x,y,w,h,selected=false){c.fillStyle=selected?'#d2e9ee':'#f5f7f7';c.fillRect(x,y,w,h);c.strokeStyle='#66747a';c.strokeRect(x,y,w,h);}
  async function prepare(){
    if(preparation)return preparation;
    preparation=(async()=>{screen=new Screen();await screen.ready();
      const records=root.MENU_ASSETS?.images||{};await Promise.all(Object.entries(records).map(async([key,value])=>{assets[key]=await image(typeof value==='string'?value:value.src||value.url);}));
      for(const [key,v] of Object.entries(FIELD_POPUP_ASSETS.images))assets['field-'+key]=await image(v.src);assets.readyFonts=await Promise.all(['normal','highlight'].map(k=>image(FIELD_POPUP_ASSETS.fonts.variants[k].src)));assets.readyMarkers=await Promise.all(FIELD_POPUP_ASSETS.groups.readyMarkers.cells.map(v=>image(v.src)));assets.main=assets.background;assets.mainButtons=assets.buttons6;
      await Promise.all(Object.entries(root.MENU_ASSETS?.groups||{}).map(async([key,group])=>{if(group.cells[0])assets['icon-'+key]=await image(group.cells[0].src);}));
      await Promise.all(Object.entries(root.MENU_ASSETS?.pokemonIcons||{}).map(async([id,record])=>{assets['pokemon-'+id]=await image(record.cells[0].src);}));
      assets['icon-options']=assets['icon-pokedex'];assets['icon-pokedex']=assets['icon-xtransceiverMale'];
      if(root.MENU_ASSETS?.groups.bagMale)assets.bagSprite=await image(MENU_ASSETS.groups.bagMale.cells[4].src);
      for(const[key,record]of Object.entries(root.PARTY_DETAIL_ASSETS?.images||{}))assets['detail-'+key]=await image(record.src);
      for(const[id,record]of Object.entries(root.PARTY_DETAIL_ASSETS?.itemMap||{}))assets['item-'+id]=await image(record.src);
      assets.bagCells=await Promise.all(MENU_ASSETS.groups.bagMale.cells.map(cell=>image(cell.src)));
      assets.bagChecks=await Promise.all(MENU_ASSETS.groups.bagPockets.cells.slice(0,2).map(cell=>image(cell.src)));
      assets.bagButton=await image(MENU_ASSETS.groups.bagButton.cells[0].src);
      assets.partyNavigation=await Promise.all(PARTY_DETAIL_ASSETS.groups.partyNavigationBlue.cells.map(cell=>image(cell.src)));
      for(const[key,record]of Object.entries(root.PARTY_POPUP_ASSETS?.images||{}))assets['popup-'+key]=await image(record.src);
      assets.nativeClose=await image(DEX_BROWSER_ASSETS.groups.detailCommon.cells[0].src);
      assets.popupFont=await image(PARTY_POPUP_ASSETS.font.src);
      assets.partyPrompt=await image(COMMON_DIALOGUE_ASSETS.images.partyPrompt.src);
      assets.messageFrame=await image(COMMON_DIALOGUE_ASSETS.images.fieldDialogue.src);
      if(root.MENU_ASSETS?.groups.selection)assets.selection=await image(MENU_ASSETS.groups.selection.cells[0].src);
    })();return preparation;
  }
  async function open(){if(battling||root.NativeStory?.locked)return;await prepare();main();}
  function main(){
    const s=Journey.state,labels=MENU_ASSETS.texts['34'],entries=[[labels[2],'pokemon',()=>team(),!s.starter],[labels[1],'pokedex',()=>external(()=>Pokedex.browse()),!s.original?.pokedex],[labels[3],'bag',()=>bag()], [s.playerName,'trainer',()=>trainerCard()],[labels[5],'save',()=>saveMenu()],[labels[6],'options',()=>options()]].filter(entry=>!entry[3]);
    const buttons=entries.map(([label,key,action,disabled],i)=>rect(label,4+(i%2)*128,24+Math.floor(i/2)*48,120,40,action,disabled));
    buttons.push(rect('Chiudi',228,168,28,24,()=>screen.close()));
    screen.show('Menu',c=>{background(c,'main');const layout=assets[entries.length===6?'buttons6':entries.length===5?'buttons1':'buttons2'];if(layout)c.drawImage(layout,0,0,256,192,0,0,256,192);const chosen=buttons[screen.selected];if(chosen&&screen.selected<entries.length&&assets.selection)c.drawImage(assets.selection,chosen.x-1,chosen.y);entries.forEach(([label,key],i)=>{const x=4+i%2*128,y=24+Math.floor(i/2)*48,im=assets['icon-'+key];if(im)c.drawImage(im,x+23-Math.floor(im.width/2),y+20-Math.floor(im.height/2));screen.text(label,x+43,y+12,true);});c.drawImage(assets.nativeClose,237,173);},buttons,()=>screen.close());
  }
  async function external(fn,back=main){screen.close();let result;try{result=await fn();}finally{if(result!=='close')back();}}
  function partyMon(index){return Journey.unpack(Journey.state.party[index]);}
  function partyPanel(c,x,y,selected,ko){if(assets.partyPanels)c.drawImage(assets.partyPanels,selected?0:128,selected?56:ko?64:16,128,48,x,y,128,48);else box(c,x,y,128,48,selected);}
  function drawParty(c,selected){const s=Journey.state;c.drawImage(assets['popup-mainBackground'],0,0);s.party.forEach((p,i)=>{const m=partyMon(i),x=i%2*128,y=8+i%2*8+Math.floor(i/2)*48;partyPanel(c,x,y,swapFrom===i||selected===i,m.hp===0);const icon=assets['pokemon-'+m.spriteId];if(icon)c.drawImage(icon,x+2,y+3);screen.text(p.nickname||p.name,x+34,y+3,true);screen.text('L. '+p.level,x+34,y+18,true);screen.text(m.hp+'/'+m.max,x+120,y+31,true,'right');c.fillStyle='#465759';c.fillRect(x+65,y+25,54,3);c.fillStyle=m.hp/m.max<=.2?'#d85038':m.hp/m.max<=.5?'#e8b038':'#58b888';c.fillRect(x+65,y+25,54*m.hp/m.max,3);});c.fillStyle='#f2f3f2';c.fillRect(0,168,180,24);caption(MENU_ASSETS.texts['157'][swapFrom===null?9:11]);screen.text('Esci',216,168,true,'center');}
  function team({select=null,back=main}={}){
    const s=Journey.state;const buttons=s.party.map((p,i)=>rect(p.nickname||p.name,(i%2)*128,8+(i%2)*8+Math.floor(i/2)*48,128,48,()=>select?select(i):swapFrom===null?partyActions(i):swap(i)));
    buttons.push(rect('Esci',180,164,72,24,()=>{swapFrom=null;back();}));
    screen.show('Pokémon',c=>drawParty(c,screen.selected),buttons,()=>{swapFrom=null;back();});
  }
  function partyPopup(index,entries,back){
    const top=192-24*entries.length;
    screen.show('Azioni Pokémon',c=>{drawParty(c,index);c.drawImage(assets.partyPrompt,8,144);NativeTextLayout.wrap(NativeTextLayout.format(MENU_ASSETS.texts['157'][18],[Journey.state.party[index].nickname||Journey.state.party[index].name]),POKEDEX_ASSETS.font,112).slice(0,2).forEach((line,i)=>screen.text(line,16,152+i*16));entries.forEach(([label],i)=>{c.drawImage(assets['popup-'+(screen.selected===i?'buttonSelected':'buttonNormal')],152,top+24*i);NativeText.draw(c,assets.popupFont,label,162,top+24*i+6,false,'left',PARTY_POPUP_ASSETS.font);});},entries.map(([label,action],i)=>rect(label,152,top+24*i,104,24,action)),back,{drawFocus:false});
  }
  function partyActions(i){
    const t=MENU_ASSETS.texts['157'];partyPopup(i,[[t[109],()=>summary(i)],[t[108],()=>{swapFrom=i;team();}],[t[110],()=>heldActions(i)],[t[115],()=>team()]],()=>team());
  }
  function heldActions(i){
    const t=MENU_ASSETS.texts['157'];partyPopup(i,[[t[123],()=>bag(0,{giveTo:i,back:()=>team()})],[t[124],()=>{const p=Journey.state.party[i],old=p.heldItem;if(!Journey.takeItem(i))return notice(t[61],()=>team());notice(NativeTextLayout.format(t[62],[p.nickname||p.name,ORIGINAL_EVENTS.itemNames[old]]),()=>team());}],[t[115],()=>team()]],()=>team());
  }
  function actionList(title,entries,back){
    screen.show(title,c=>{background(c,'main');screen.text(title,12,12);entries.forEach(([label],i)=>{box(c,132,42+i*28,120,26);screen.text(label,144,47+i*28);});},entries.map(([label,action],i)=>rect(label,132,42+i*28,120,26,action)),back);
  }
  function giveItem(id,index,back){
    const p=Journey.state.party[index],t=MENU_ASSETS.texts['157'],apply=()=>{
      const previous=p.heldItem;
      if(!Journey.giveItem(id,index))return notice(t[63],back);
      notice(previous?NativeTextLayout.format(t[64],['',ORIGINAL_EVENTS.itemNames[previous],ORIGINAL_EVENTS.itemNames[id]]):NativeTextLayout.format(t[86],[p.nickname||p.name,ORIGINAL_EVENTS.itemNames[id]]),back);
    };
    if(p.heldItem)confirm(NativeTextLayout.format(t[58],[p.nickname||p.name,ORIGINAL_EVENTS.itemNames[p.heldItem]]),apply,back);else apply();
  }
  function swap(i){if(i!==swapFrom)Journey.moveParty(swapFrom,i);swapFrom=null;team();}
  function summary(index,page=0,back=()=>team()){return NativeSummary.open(screen,index,back,page);}
  function inventory(pocket){const s=Journey.state;return pocket===1?[{id:17,count:potions}].filter(i=>i.count):pocket===0?[{id:4,count:s.pokeballs}].filter(i=>i.count):pocket===4?[...(s.original?.map?[{id:442,count:1}]:[]),...(s.original?.phone?[{id:621,count:1}]:[])]:[];}
  let fieldBagReady;
  async function prepareFieldBag(){
    if(!fieldBagReady)fieldBagReady=(async()=>{const response=await fetch(NativeTextLayout.resource('assets/field-bag/provenance.json'));if(!response.ok)throw Error('Catalogo Borsa non disponibile');assets.fieldBag=await response.json();assets.fieldBagImages={};await Promise.all(Object.entries(assets.fieldBag.images).map(async([key,record])=>assets.fieldBagImages[key]=await image(record.path)));assets.fieldBagFont=await image(assets.fieldBag.font.path);})();return fieldBagReady;
  }
  function bagItemIndex(){return Math.max(0,screen.selected-5);}
  function drawBagTop(c,pocket,selectedItem=bagItemIndex()){
    const a=assets.fieldBag,im=assets.fieldBagImages;c.drawImage(im.topDecorationMale,0,0);c.drawImage(im.topPanelMale,0,0);
    const items=inventory(pocket),item=items[Math.min(selectedItem,items.length-1)];if(!item)return;
    const write=(text,x,y)=>NativeText.draw(c,assets.fieldBagFont,String(text),x,y,false,'left',a.font);
    write(ORIGINAL_EVENTS.itemNames[item.id],...a.topTitle.textScreenOrigin);
    if(item.id===4||item.id===17)write('× '+item.count,...a.topQuantity.textScreenOrigin);
    const icon=assets['item-'+item.id],record=PARTY_DETAIL_ASSETS.itemMap[item.id];if(icon&&record)c.drawImage(icon,a.topItemIcon.actorOrigin[0]+record.origin[0],a.topItemIcon.actorOrigin[1]+record.origin[1]);
    NativeTextLayout.wrap(MENU_ASSETS.itemDescriptions[item.id]||'',a.font,232).slice(0,3).forEach((line,i)=>write(line,16,100+i*15));
  }
  function drawBag(c,pocket,selectedItem=0){
    c.drawImage(assets.fieldBagImages.bottomMale,0,0);const names=ORIGINAL_EVENTS.itemNames,items=inventory(pocket),group=MENU_ASSETS.groups.bagMale,a=assets.fieldBag;
    a.bagActors.sequencePairs.forEach(([active,inactive],i)=>{const frame=group.animations[i===pocket?active:inactive].frames.at(-1),cell=group.cells[frame[0]];c.drawImage(assets.bagCells[frame[0]],cell.origin[0]+frame[2],80+cell.origin[1]+frame[3]);});
    screen.text(MENU_ASSETS.texts['55'][pocket],8,6,true);
    items.forEach((item,i)=>{const y=12+i*24;c.drawImage(assets.bagButton,135,y);screen.text(names[item.id],142,y+4,true);if(item.id===4||item.id===17)screen.text('×'+item.count,238,y+4,true,'right');});
    if(pocket===4)items.forEach((item,i)=>{if(item.id===442)c.drawImage(assets.bagChecks[(NativeSettings.state.registered||[]).includes('item:442')?0:1],119,16+i*24);});
    c.drawImage(assets.nativeClose,237,173);
  }
  async function bag(pocket=0,context={}){
    await prepareFieldBag();const items=inventory(pocket),names=ORIGINAL_EVENTS.itemNames,back=context.back||main,group=MENU_ASSETS.groups.bagMale;
    const buttons=assets.fieldBag.bagActors.sequencePairs.map(([,inactive],n)=>{const cell=group.cells[group.animations[inactive].frames[0][0]];return rect(MENU_ASSETS.texts['55'][n],Math.max(0,cell.origin[0]),80+cell.origin[1],cell.size[0],cell.size[1],()=>bag(n,context));});
    items.forEach((item,i)=>buttons.push(rect(names[item.id]+' ×'+item.count,135,12+i*24,106,24,()=>context.giveTo!==undefined?giveItem(item.id,context.giveTo,()=>bag(pocket,context)):bagAction(item.id,pocket),context.giveTo!==undefined&&pocket===4)));
    if(context.giveTo===undefined&&pocket===4&&items.some(item=>item.id===442))buttons.push(rect('Assegna Mappa Città al pulsante Y',116,16+items.findIndex(item=>item.id===442)*24,16,16,()=>{register('item:442');bag(pocket,context);}));
    buttons.push(rect('ESCI',228,168,28,24,()=>screen.close()));
    screen.show('Borsa',c=>drawBag(c,pocket,bagItemIndex()),buttons,back,{drawFocus:false,top:c=>drawBagTop(c,pocket),topLabel:'Descrizione dello strumento',key:key=>{
      if(key==='arrowleft'||key==='arrowright'){bag((pocket+(key==='arrowleft'?4:1))%5,context);return true;}
      if(key==='start'||key==='f2'){items.sort((a,b)=>a.id-b.id);bag(pocket,context);return true;}return false;
    }});screen.selected=items.length?5:buttons.length-1;screen.focus();
  }
  function bagAction(id,pocket){
    const t=MENU_ASSETS.texts['3'],actions=[[t[0],()=>useItem(id,pocket)]];
    if(id===4||id===17)actions.push([t[1],()=>discard(id,pocket)],[t[3],()=>team({select:i=>giveItem(id,i,()=>bag(pocket)),back:()=>bag(pocket)})]);
    actions.push([t[8],()=>bag(pocket)]);
    const top=192-actions.length*24,itemIndex=inventory(pocket).findIndex(item=>item.id===id);
    screen.show(ORIGINAL_EVENTS.itemNames[id],c=>{drawBag(c,pocket,itemIndex);actions.forEach(([label],i)=>{c.drawImage(assets['popup-'+(screen.selected===i?'buttonSelected':'buttonNormal')],152,top+i*24);NativeText.draw(c,assets.popupFont,label,162,top+6+i*24,false,'left',PARTY_POPUP_ASSETS.font);});},actions.map(([label,action],i)=>rect(label,152,top+i*24,104,24,action)),()=>bag(pocket),{drawFocus:false,top:c=>drawBagTop(c,pocket,itemIndex),topLabel:'Descrizione dello strumento'});
  }
  function register(id){const registered=[...(NativeSettings.state.registered||[])],index=registered.indexOf(id);if(index<0)registered.push(id);else registered.splice(index,1);NativeSettings.set({registered});const button=document.getElementById('registeredTool');if(button)button.hidden=!registered.length;}
  async function useRegistered(){
    if(battling||menuOpen()||root.NativeStory?.locked)return;
    const registry={pokemon:['POKÉMON',()=>team({back:()=>screen.close()})],pokedex:['POKÉDEX',()=>{screen.close();return Pokedex.browse();}],bag:['BORSA',()=>bag(0,{back:()=>screen.close()})],trainer:[Journey.state.playerName,()=>NativeTrainerCard.open(screen,()=>screen.close())],'trainer:back':['Scheda allenatore: retro',()=>NativeTrainerCard.open(screen,()=>screen.close(),true)],save:['SALVA',saveMenu],options:['OPZIONI',()=>NativeOptions.open(screen,()=>screen.close())],'item:442':['Mappa Città',()=>{screen.close();return TownMap.open();}],'summary:info':['Info',()=>summary(0,0,()=>screen.close())],'summary:moves':['Mosse',()=>summary(0,1,()=>screen.close())],'summary:ribbons':['Fiocchi',()=>summary(0,2,()=>screen.close())]};
    for(const mode of ['info','zona','verso','forme'])registry['pokedex:'+mode]=['Pokédex: '+mode,()=>{const name=Journey.state.dex.seen.find(n=>POKEDEX_ASSETS.species[n]);screen.close();return name?NativePokedexDetails.open(name,{mode}):Pokedex.browse();}];
      registry['pokedex:search']=['Pokédex: ricerca',()=>{screen.close();return NativePokedexBrowser.open({searchInitially:true});}];
      const ids=(NativeSettings.state.registered||[]).filter(id=>registry[id]&&(id!=='item:442'||Journey.state.original?.map)&&(!id.startsWith('summary:')||Journey.state.party.length));await prepare();
    if(ids.length===1)return registry[ids[0]][1]();
    if(!ids.length)return notice('Puoi assegnare strumenti e funzioni al pulsante Y dalla Borsa.',()=>screen.close());
    const nativeLabels={'item:442':1,'summary:info':7,'summary:moves':8,'summary:ribbons':9,bag:10,pokedex:15,'pokedex:search':16,'pokedex:info':17,'pokedex:zona':18,'pokedex:verso':19,'pokedex:forme':20,trainer:21,'trainer:back':22,options:24};for(const [id,index]of Object.entries(nativeLabels))registry[id][0]=FIELD_POPUP_ASSETS.ready.labels[index].replace(/\{ff00:\d+\}/g,'');
    const popup=FIELD_POPUP_ASSETS.ready,frame=assets['field-readyBackground'],field=document.createElement('canvas');field.width=256;field.height=192;const fc=field.getContext('2d');drawWorld();for(const id of ['stage','world']){const source=document.getElementById(id);if(source)fc.drawImage(source,0,0,256,192);}let cursor=0,first=0,moving=null,original=[...ids];
    function renderReady(){const rows=ids.slice(first,first+popup.visibleRows),back=()=>{if(moving!=null){ids.splice(0,ids.length,...original);cursor=moving;moving=null;first=Math.min(first,cursor);renderReady();}else screen.close();};const move=delta=>{const next=Math.max(0,Math.min(ids.length-1,cursor+delta));if(moving!=null){const [id]=ids.splice(cursor,1);ids.splice(next,0,id);}cursor=next;if(cursor<first)first=cursor;if(cursor>=first+popup.visibleRows)first=cursor-popup.visibleRows+1;renderReady();};const activate=()=>{if(moving!=null){NativeSettings.set({registered:ids});moving=null;original=[...ids];renderReady();}else{screen.close();registry[ids[cursor]][1]();}};
      screen.show('Comandi rapidi Y',c=>background(c,'main'),rows.map((id,i)=>({...rect(registry[id][0],8,96+i*16,240,16,()=>{cursor=first+i;activate();}),physicalScreen:'top'})).concat([{...rect('SELECT: sposta',184,88,64,8,()=>{if(moving==null){moving=cursor;original=[...ids];}else{NativeSettings.set({registered:ids});moving=null;original=[...ids];}renderReady();}),physicalScreen:'top'}]),back,{drawFocus:false,top:c=>{c.drawImage(field,0,0);c.drawImage(frame,0,88,256,104,0,88,256,104);c.fillStyle='#000';c.fillRect(8,96,240,96);rows.forEach((id,i)=>{const y=104+i*16;if(first+i===cursor){c.fillStyle='rgb(0,0,213)';c.fillRect(8,y-2,240,16);}NativeText.draw(c,assets.readyFonts[first+i===cursor?1:0],registry[id][0],21,y,false,'left',FIELD_POPUP_ASSETS.fonts);});if(moving!=null){const group=FIELD_POPUP_ASSETS.groups.readyMarkers,tick=Math.floor(performance.now()*60/1000);for(let j=0;j<3;j++){const anim=group.animations[j],duration=anim.frames.reduce((n,f)=>n+f[1],0);let phase=tick%duration,frame=anim.frames[0];for(const f of anim.frames){frame=f;if(phase<f[1])break;phase-=f[1];}const cell=group.cells[frame[0]],y=96+(cursor-first)*16;c.drawImage(assets.readyMarkers[frame[0]],popup.markerAnchorsX[j]+cell.origin[0]+frame[2],y+cell.origin[1]+frame[3]);}}},key:key=>{if(key==='arrowup'||key==='arrowdown'){move(key==='arrowup'?-1:1);return true;}if(['select','shift','f1'].includes(key)){if(moving==null){moving=cursor;original=[...ids];}else{NativeSettings.set({registered:ids});moving=null;original=[...ids];}renderReady();return true;}if(['a','z','enter',' ','y'].includes(key)){activate();return true;}if(['b','escape','x'].includes(key)){back();return true;}return false;}});
    }
    renderReady();const animateReady=()=>{if(!screen.dialog.open||screen.title!=='Comandi rapidi Y')return;screen.draw();requestAnimationFrame(animateReady);};requestAnimationFrame(animateReady);
  }
  function useItem(id,pocket){if(id===442)return external(()=>TownMap.open(),()=>bag(pocket));if(id===17)return team({select:i=>{const result=Journey.usePotion(i);notice(result?MENU_ASSETS.texts['157'][44].replace('{0102:0}',Journey.state.party[i].nickname||Journey.state.party[i].name).replace('{0202:1}',result):'Non avrebbe alcun effetto.',()=>bag(pocket));},back:()=>bag(pocket)});notice('Non è il momento di usarlo!',()=>bag(pocket));}
  function discard(id,pocket,count=1){
    const maximum=id===4?Journey.state.pokeballs:potions,a=FIELD_POPUP_ASSETS.bagQuantity,t=MENU_ASSETS.texts['3'],item=ORIGINAL_EVENTS.itemNames[id];
    const change=delta=>discard(id,pocket,wrapQuantity(count,delta,maximum));
    const accept=()=>confirm(NativeTextLayout.format(t[55],[item,count]),()=>{Journey.discardItem(id,count);notice(NativeTextLayout.format(t[54],[item,count]),()=>bag(pocket));},()=>bag(pocket));
    screen.show('BUTTA',c=>{drawBag(c,pocket);c.drawImage(assets['field-bagQuantity'],...a.imagePosition);screen.text('x'+count,a.textWindow[0],a.textWindow[1]);c.drawImage(assets.messageFrame,0,144);NativeTextLayout.wrap(NativeTextLayout.format(t[53],[item]),POKEDEX_ASSETS.font,240).slice(0,2).forEach((line,i)=>screen.text(line,8,152+i*16));},[
      rect('Aumenta quantità',...a.touch.increase,()=>change(1)),rect('Diminuisci quantità',...a.touch.decrease,()=>change(-1)),rect('Conferma quantità',...a.touch.confirm,accept),rect('Annulla',...a.touch.cancel,()=>bag(pocket))
    ],()=>bag(pocket),{drawFocus:false,top:c=>drawBagTop(c,pocket,inventory(pocket).findIndex(item=>item.id===id)),key:key=>{const delta={arrowup:1,arrowdown:-1,arrowright:10,arrowleft:-10}[key];if(delta){change(delta);return true;}if(['a','z','enter',' '].includes(key)){accept();return true;}return false;}});
  }
  function snapshot(){const copy=canvas=>{const image=document.createElement('canvas');image.width=256;image.height=192;image.getContext('2d').drawImage(canvas,0,0);return image;};return {lower:copy(screen.canvas),upper:screen.upper.hidden?null:copy(screen.upper)};}
  function confirm(text,yes,no){
    const previous=snapshot();screen.show(text,c=>{c.drawImage(previous.lower,0,0);c.drawImage(assets.messageFrame,0,144);NativeTextLayout.wrap(text,POKEDEX_ASSETS.font,240).slice(0,2).forEach((line,i)=>screen.text(line,8,152+i*16));['SÌ','NO'].forEach((label,i)=>{c.drawImage(assets['popup-confirmation'+(screen.selected===i?'Selected':'Normal')],192,96+i*24);NativeText.draw(c,assets.popupFont,label,202,102+i*24,false,'left',PARTY_POPUP_ASSETS.font);});},[rect('SÌ',192,96,64,24,yes),rect('NO',192,120,64,24,no)],no,{drawFocus:false,top:previous.upper?c=>c.drawImage(previous.upper,0,0):null});
  }
  function notice(text,back){const previous=snapshot();screen.show(text,c=>{c.drawImage(previous.lower,0,0);c.drawImage(assets.messageFrame,0,144);NativeTextLayout.wrap(text,POKEDEX_ASSETS.font,240).slice(0,2).forEach((line,i)=>screen.text(line,8,152+i*16));},[rect('Continua',0,144,256,48,back)],back,{drawFocus:false,top:previous.upper?c=>c.drawImage(previous.upper,0,0):null});}
  function saveMenu(){return NativeSave.open(screen,confirm,notice,main);}
  function options(draft={...NativeSettings.state},focus=0){return NativeOptions.open(screen,main,draft,focus);}
  function trainerCard(){return NativeTrainerCard.open(screen,main);}
  root.NativeUI={Screen,nextButton,open,prepare,confirm,register,useRegistered,team:async()=>{if(battling||root.NativeStory?.locked||!Journey.state.starter)return;await prepare();team({back:()=>screen.close()});},main,bag,summary};
  if(typeof module!=='undefined')module.exports={nextButton,wrapQuantity};
})(typeof window!=='undefined'?window:globalThis);
