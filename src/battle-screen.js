/* BW single-battle touchscreen flow; native IRBI art, manual-confirmed command order. */
(() => {
  const panel=document.querySelector('#battle .battle-panel'),stage=document.createElement('div');stage.id='battleTouch';stage.className='native-stage';
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Comandi di lotta');stage.append(canvas);panel.append(stage);
  const messageCanvas=document.createElement('canvas');messageCanvas.id='nativeBattleMessage';messageCanvas.width=384;messageCanvas.height=72;messageCanvas.setAttribute('role','img');$('battle').append(messageCanvas);const messageContext=messageCanvas.getContext('2d');messageContext.imageSmoothingEnabled=false;let lastMessage='';
  BattleHUD.mount(stage,messageCanvas);panel.inert=true;panel.setAttribute('aria-hidden','true');
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const resources={},images=new Map(),selectionByMode=new Map();let font,smallFont,battleFont,fontMetrics,moveMetrics,metadata,ready=false,mode='main',buttons=[],selected=0,wasBusy=false,notice=null,bagCategory='medicine',bagPage=0,bagItem=17,lastItem=0,press=null,partyIndex=0,partyMove=0;
  function load(src){if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{images.delete(src);reject(Error('Grafica lotta non disponibile: '+src));};im.src=NativeTextLayout.resource(src);}));return images.get(src);}
  const loading=(async()=>{
    metadata=await fetch(NativeTextLayout.resource('assets/battle-ui/provenance.json')).then(r=>{if(!r.ok)throw Error('Catalogo interfaccia lotta non disponibile');return r.json();});fontMetrics=metadata.fonts['2'];moveMetrics=metadata.fonts['0'];
    [font,smallFont,battleFont]=await Promise.all([NativeText.load(),load(fontMetrics.hpPalette162.path),load(moveMetrics.battlePalette13.path)]);
    const paths=['command-view-105.png','command-source-105.png','cell-115-117-0.png','cell-115-117-2.png','cell-165-166-0.png','cell-168-169-0.png','hp-atlas-164.png','moves-layer-111.png'];
    await Promise.all(paths.map(async name=>resources[name]=await load('assets/battle-ui/'+name)));
    await Promise.all(Object.entries(metadata.moves.panels).map(async([id,record])=>resources['panel-'+id]=await load(record.path)));
    await Promise.all(Object.entries(metadata.moves.typeLabels.labels).map(async([id,record])=>resources['type-'+id]=await load(record.path)));
    await Promise.all(Object.entries(metadata.bag.views).map(async([id,record])=>resources['bag-'+id]=await load(record.path)));
    resources.moveFlash={};for(const [id,record]of Object.entries(metadata.moves.panels)){const source=resources['panel-'+id],canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;const c=canvas.getContext('2d');c.drawImage(source,0,0);const from=c.getImageData(0,0,canvas.width,canvas.height),white=new Uint8ClampedArray(from.data.length).fill(255);resources.moveFlash[id]={};for(const level of [0,2,4,6,8]){const frame=document.createElement('canvas');frame.width=canvas.width;frame.height=canvas.height;const context=frame.getContext('2d'),pixels=context.createImageData(frame.width,frame.height);pixels.data.set(NativeColor.blend(from.data,white,16-level,level));context.putImageData(pixels,0,0);resources.moveFlash[id][level]=frame;}}
    resources.emptyMove=await load(metadata.moves.emptyPanel.path);
    resources.messageFrame=await load(metadata.messageWindow.outerFrame.path);resources.messageFont=await load(metadata.fonts['0'].messagePalette90.path);
    await Promise.all(metadata.moves.keyCursor.cells.map(async(record,i)=>resources['key-cursor-'+i]=await load(record.path)));
    resources.partyData=await(await fetch(NativeTextLayout.resource('assets/battle-party/provenance.json'))).json();
    resources.partyBase=await load(resources.partyData.images['0'].path);
    resources.partyPanels=await Promise.all(resources.partyData.panels.map(record=>load(record.path)));
    resources.partyPromptFont=await load(resources.partyData.font.variants.prompt.path);resources.partyNameFont=await load(resources.partyData.font.variants.name.path);resources.partyNumberFont=await load(resources.partyData.font.variants.levelAndHp.path);
    resources.partyKo={};await Promise.all(Object.entries(resources.partyData.fainted.byColumn).map(async([k,v])=>resources.partyKo[k]=await load(v.path)));resources.partyStatuses=await Promise.all(resources.partyData.statusLabels.cells.map(v=>load(v.path)));
    resources.partyIcons={};await Promise.all(Object.entries(MENU_ASSETS.pokemonIcons).map(async([id,record])=>resources.partyIcons[id]=await load(record.cells[0].src)));
    const a=resources.partyData;resources.partyMaps={};await Promise.all(Object.entries(a.images).map(async([id,v])=>resources.partyMaps[id]=await load(v.path)));resources.partyParts={};await Promise.all(Object.entries(a.context.parts).map(async([id,v])=>resources.partyParts[id]=await load(v.path)));resources.partyDetailFonts={};await Promise.all(Object.entries(a.font.variants).map(async([id,v])=>resources.partyDetailFonts[id]=await load(v.path)));resources.detailMovePanels={};await Promise.all(Object.entries(a.detailPages.moves.panelStates).map(async([id,v])=>resources.detailMovePanels[id]=await load(v.path)));
    resources.moveTabs={};await Promise.all(Object.entries(a.detailPages.moveDetail.tabStates).map(async([id,v])=>resources.moveTabs[id]=await load(v.path)));
    resources.heldBadges=await Promise.all(a.heldItemBadge.cells.map(v=>load(v.path)));resources.categoryIcons={};await Promise.all(Object.entries(a.moveCategoryIcons.categories).map(async([id,v])=>resources.categoryIcons[id]=await load(v.cells[0].path)));
    ready=true;if(battling){cards();update();}
  })().catch(error=>{console.error(error);stage.setAttribute('aria-label',error.message);stage.textContent=error.message;});
  const text=(s,x,y,white=false,align='left')=>NativeText.draw(c,font,String(s),x,y,white,align);
  const rect=(label,x,y,w,h,action,disabled=false)=>({label,x,y,w,h,action,disabled});
  function choose(next){selectionByMode.set(mode,selected);if(BattleBag.names[next]&&mode!=='itemDetail'&&mode!=='itemTarget'&&mode!==next)bagPage=0;mode=next;notice=null;update();}
  function back(){if(busy||press)return;if(mode==='itemTarget')return choose(bagCategory);if(mode==='partyContext')return choose('party');if(['partyInfo','partyMoves','partyMoveDetail'].includes(mode))return choose(mode==='partyMoveDetail'?'partyMoves':'partyContext');if(mode==='party'&&session.request()?.forceSwitch?.[0])return;if(mode==='main')return;choose(mode==='itemDetail'?bagCategory:['medicine','balls','statusItems','battleItems'].includes(mode)?'bag':'main');}
  function bagView(){return BattleBag.page(BattleBag.inventory(mode,id=>Journey.itemCount(id)),bagPage);}
  function pageBag(delta){bagPage=bagView().number+delta;update();}
  function bagIcon(id){const key='item-'+id,path=window.PARTY_DETAIL_ASSETS?.itemMap?.[id]?.src;if(path&&!resources[key]&&!resources[key+'-pending']){resources[key+'-pending']=true;void load(path).then(im=>{resources[key]=im;draw();}).catch(()=>{}).finally(()=>{resources[key+'-pending']=false;});}return resources[key];}
  function drawBagIcon(id,x,y){const im=bagIcon(id);if(im)c.drawImage(im,Math.round(x+(24-im.width)/2),Math.round(y+(24-im.height)/2));}

  function useBagItem(){
    if(BattleMedicine.ids.includes(bagItem)){if(Journey.itemCount(bagItem)>0){lastItem=bagItem;choose('itemTarget');}return;}
    if(trainer){notice='Non si possono catturare i Pokémon degli altri Allenatori!';mode='notice';update();return;}
    lastItem=bagItem;void throwStoryBall(bagItem);
  }
  function activate(index){const b=buttons[index];if(!b||b.disabled||press||busy)return;void AudioEngine.playSound(1352);if(mode==='moves'&&index<partner.moves.length){press={kind:'move',index,at:performance.now(),action:b.action};draw();return;}if(['party','itemTarget'].includes(mode)&&index<session.party().length){press={kind:'party',index,at:performance.now(),action:b.action};draw();return;}if(['partyContext','partyInfo','partyMoves','partyMoveDetail'].includes(mode)){press={kind:'app',index,at:performance.now(),action:b.action};draw();return;}b.action();}
  function renderButtons(next){
    BattleHUD.mode(mode,busy,finished);buttons=next;selected=selectionByMode.get(mode)??0;if(!next[selected]||next[selected].disabled)selected=Math.max(0,next.findIndex(b=>!b.disabled));stage.querySelectorAll('button').forEach(b=>b.remove());
    next.forEach((b,i)=>{const el=document.createElement('button');el.className='native-hit';el.setAttribute('aria-label',b.label);el.textContent=b.label;el.disabled=!!b.disabled;Object.assign(el.style,{left:b.x/2.56+'%',top:b.y/1.92+'%',width:b.w/2.56+'%',height:b.h/1.92+'%'});el.onclick=()=>activate(i);el.onfocus=()=>{if(!press)selected=i;draw();};b.element=el;BattleHUD.decorate(el,b,i,finished?'main':mode,resources);stage.append(el);});
    if(!busy)next[selected]?.element.focus({preventScroll:true});draw();
  }
  stage.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input'))return;if(press||busy){e.preventDefault();e.stopPropagation();return;}const k=e.key.toLowerCase();if(e.repeat&&['enter',' ','z','a','b','escape','x'].includes(k)){e.preventDefault();return;}const directions={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]};if(directions[k]){e.preventDefault();e.stopPropagation();selected=NativeUI.nextButton(buttons,selected,...directions[k]);buttons[selected]?.element.focus({preventScroll:true});}else if(['enter',' ','z','a'].includes(k)){e.preventDefault();activate(selected);}else if(['escape','b','x'].includes(k)){e.preventDefault();back();}});
  function run(){if(trainer&&!labBattle){notice="Non si può fuggire da una lotta contro un Allenatore!";mode='notice';update();}else $('run').onclick();}
  function update(){
    if(!battling||!ready||!session)return;
    const forced=!!session.request()?.forceSwitch?.[0];if(busy){wasBusy=true;BattleHUD.mode(mode,true,finished);if(['main','moves'].includes(mode)&&buttons.length){buttons.forEach(b=>b.element.disabled=true);return;}renderButtons([]);return;}
    if(wasBusy){wasBusy=false;mode=forced?'party':'main';}
    if(finished){renderButtons(storyBattle==='tutorial'?[]:[rect('Continua',0,0,256,192,()=>endBattle())]);return;}
    if(forced&&!['party','partyContext','partyInfo','partyMoves','partyMoveDetail'].includes(mode))mode='party';
    if(mode==='main')renderButtons([rect('LOTTA',0,0,128,96,()=>choose('moves')),rect('BORSA',128,0,128,96,()=>choose('bag')),rect('POKÉMON',0,96,128,96,()=>choose('party')),rect('FUGA',128,96,128,96,run)]);
    else if(mode==='moves'){
      const list=[...$('moves').querySelectorAll(':scope > button')];renderButtons([...list.map((b,i)=>rect(b.textContent,i%2*128,32+Math.floor(i/2)*48,128,48,()=>b.onclick(),b.disabled)),rect('Indietro',176,144,80,48,back)]);
    }else if(mode==='bag'){
      const names=metadata.battleText.banks['17'],modes=['medicine','balls','statusItems','battleItems'];
      renderButtons([...metadata.bag.categories.map((category,i)=>rect(category.messages.map(id=>names[id]).join(' '),...category.panelRect,()=>{bagCategory=modes[i];choose(bagCategory);})),...(lastItem?[rect(names[8],16,160,200,32,()=>{bagItem=lastItem;bagCategory=[22,27].includes(lastItem)?'statusItems':BattleMedicine.ids.includes(lastItem)?'medicine':'balls';choose('itemDetail');})]:[]),rect('Indietro',216,152,40,40,back)]);
    }else if(BattleBag.names[mode]){const view=bagView();bagPage=view.number;renderButtons([...view.items.map(item=>rect(ORIGINAL_EVENTS.itemNames[item.id]+' ×'+item.count,...item.rect,()=>{bagItem=item.id;choose('itemDetail');},storyBattle==='tutorial')),rect('Pagina precedente',4,156,32,32,()=>pageBag(-1),!view.previous),rect('Pagina successiva',44,156,32,32,()=>pageBag(1),!view.next),rect('Indietro',220,156,32,32,()=>choose('bag'))]);}
    else if(mode==='itemDetail')renderButtons([rect('USA',56,152,152,40,useBagItem,storyBattle==='tutorial'||!Journey.itemCount(bagItem)),rect('Indietro',216,152,40,40,back)]);
    else if(mode==='party'||mode==='itemTarget'){
      const item=mode==='itemTarget';renderButtons([...session.party().map((p,i)=>rect(p.name,...resources.partyData.slots[i].rect,()=>{
        if(item){session.potionTarget=p.index;session.potionItem=bagItem;turn(null,'potion');}else {partyIndex=i;choose('partyContext');}
      },item&&!BattleMedicine.canUse(bagItem,p))),...(!forced?[rect('Indietro',188,164,64,28,()=>choose(item?bagCategory:'main'))]:[])]);
    }else if(['partyContext','partyInfo','partyMoves','partyMoveDetail'].includes(mode))renderPartyPageButtons();
    else if(mode==='notice')renderButtons([rect('Continua',0,0,256,192,()=>choose('main'))]);
  }
  function draw(){
    if(!ready)return;c.clearRect(0,0,256,192);c.drawImage(resources['command-view-105.png'],0,0);
    if(finished){text('A: Continua',128,138,false,'center');return;}
    if(busy)return;
    if(mode==='main'){
      const source=resources['command-source-105.png'];
      [[0,142,'BORSA'],[86,154,'FUGA'],[172,142,'POKÉMON']].forEach(([x,y,label],i)=>{c.drawImage(source,i===0?256:384,224,128,56,x,y,84,56);text(label,x+42,y+22,true,'center');});
      const own=session.party(),foes=session.battle.p2.pokemon;
      const mark=(pokemon,x,y)=>{c.drawImage(resources[pokemon.hp>0?'cell-115-117-0.png':'cell-115-117-2.png'],x,y);};
      Array.from({length:6},(_,i)=>mark(own[i]||{hp:0},84+i*15,126));if(trainer)Array.from({length:6},(_,i)=>mark(foes[i]||{hp:0},84+i*15,36));
    }else{
      c.fillStyle='#e6e7ed';c.fillRect(0,0,256,192);
      if(mode==='notice'){NativeTextLayout.wrap(notice,POKEDEX_ASSETS.font,240).forEach((line,i)=>text(line,8,64+i*18));text('A: Continua',128,160,false,'center');return;}
      if(mode==='moves'){
        c.drawImage(resources['moves-layer-111.png'],0,0);
        for(let i=0;i<4;i++)c.drawImage(resources.emptyMove,i%2*128,32+Math.floor(i/2)*48);
        const list=[...$('moves').querySelectorAll(':scope > button')];list.forEach((button,i)=>{
          const move=partner.moves[i],id=ROM_BATTLE.typeNames.indexOf(move?.type),x=i%2*128,y=32+Math.floor(i/2)*48;
          if(!move)return;c.save();c.globalAlpha=button.disabled?.55:1;const coefficient=press?.kind==='move'&&press.index===i?metadata.moves.pressed.timing.visibleCoefficientTicks[Math.min(9,Math.floor((performance.now()-press.at)*60/1000))]:0;c.drawImage(resources.moveFlash[Math.max(0,id)][coefficient],x,y);
          const draw=(label,position,align='left',state='normal')=>NativeText.draw(c,battleFont,String(label),...position,false,align,{...moveMetrics,sourceOffset:moveMetrics.battlePalette13.states[state].offsetY});
          draw(move.name,metadata.moves.namesScreen[i],'center');draw('PP',metadata.moves.ppLabelScreen[i]);
          const left=move.left,max=move.pp,state=NativeBattleRules.ppState(left,max);
          draw(left+'/'+max,metadata.moves.ppValuesScreen[i],'center',state);
          const type=resources['type-'+id];if(type)c.drawImage(type,x+16,y+24);c.restore();
        });
      }else if(mode==='bag'){
        c.drawImage(resources['bag-categories'],0,0);const names=metadata.battleText.banks['17'];
        metadata.bag.categories.forEach(category=>{const w=metadata.bag.windows[category.window];category.messages.forEach((id,i)=>text(names[id],w.pixelRect[0]+w.pixelRect[2]/2,w.pixelRect[1]+i*16,true,'center'));});
        if(lastItem)text(names[8],120,168,true,'center');
      }else if(BattleBag.names[mode]){
        c.drawImage(resources['bag-list'],0,0);const view=bagView();for(let i=view.items.length;i<6;i++){c.fillStyle='#182329b0';c.fillRect(8+i%2*128,8+Math.floor(i/2)*48,112,32);}for(const item of view.items){const [x,y]=item.rect;drawBagIcon(item.id,x+2,y+8);const label=ORIGINAL_EVENTS.itemNames[item.id],width=NativeTextLayout.width(label,POKEDEX_ASSETS.font);c.save();c.translate(x+30,y+8);c.scale(Math.min(1,84/width),1);text(label,0,0,true);c.restore();text('×'+item.count,x+108,y+24,true,'right');}if(!view.items.length)text('Nessuno strumento',128,64,true,'center');text(BattleBag.names[mode]+' '+(view.number+1)+'/'+view.pages,148,168,true,'center');c.fillStyle='#182329a0';if(!view.previous)c.fillRect(4,156,32,32);if(!view.next)c.fillRect(44,156,32,32);
      }else if(mode==='itemDetail'){
        c.drawImage(resources['bag-detail'],0,0);drawBagIcon(bagItem,16,24);text(ORIGINAL_EVENTS.itemNames[bagItem],56,32,true);text('×'+Journey.itemCount(bagItem),200,32,true,'right');
        NativeTextLayout.wrap(MENU_ASSETS.itemDescriptions[bagItem]||'',POKEDEX_ASSETS.font,224).slice(0,3).forEach((line,i)=>text(line,16,72+15*i,true));text('USA',108,168,true,'center');
      }else if(['partyContext','partyInfo','partyMoves','partyMoveDetail'].includes(mode)){drawPartyPage();
      }else if(mode==='party'||mode==='itemTarget'){
        drawParty();
      }else buttons.filter(b=>b.label!=='Indietro').forEach(b=>{c.fillStyle='#fafafa';c.fillRect(b.x,b.y,b.w,b.h);text(b.label,b.x+b.w/2,b.y+16,false,'center');});
      if(buttons.some(b=>b.label==='Indietro')&&!['bag','medicine','balls','statusItems','battleItems','itemDetail','partyContext','partyInfo','partyMoves','partyMoveDetail'].includes(mode))text('Indietro',220,171,false,'center');
    }
    const b=buttons[selected];if(b&&!b.disabled){
      {
        const group=metadata.moves.keyCursor,positions=[[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]],sequences=[0,2,1,3],tick=Math.floor(performance.now()*.06)%36;
        positions.forEach(([x,y],i)=>{const animation=group.animations[sequences[i]],frame=animation.frames[Math.min(2,Math.floor(tick/12))],cell=group.cells[frame[0]];c.drawImage(resources['key-cursor-'+frame[0]],x+cell.bounds[0]+frame[2],y+cell.bounds[1]+frame[3]);});
      }
    }
  }
  function drawParty(){
    const a=resources.partyData,party=session.party(),nf=a.font.variants.name,df=a.font.variants.levelAndHp;
    const put=(value,x,y,number=false,align='left')=>NativeText.draw(c,number?resources.partyNumberFont:resources.partyNameFont,String(value),x,y,false,align,number?df:nf);
    c.drawImage(resources.partyBase,0,0);a.slots.forEach((slot,i)=>{const [x,y]=slot.rect,p=party[i],down=press?.index===i&&!press.released;
      const frame=p?(p.active?0:4)+(down?1:0):7;c.drawImage(p&&p.hp<=0?resources.partyKo[(p.active?'0':'1')+'-'+(down?8:7)]:resources.partyPanels[frame],x,y);if(!p)return;
      const mon=session.battle.p1.pokemon[p.index-1],id=POKEDEX_ASSETS.species[p.name]?.id,icon=resources.partyIcons[id];if(icon)c.drawImage(icon,x+2,y+3);
      c.save();c.beginPath();c.rect(x,y,120,40);c.clip();put(mon.name||p.name,x+32,y+7);
      const status=p.hp<=0?6:({slp:1,brn:2,psn:3,tox:3,par:4,frz:5})[p.status];if(status!=null){const cell=a.statusLabels.cells[status],anchor=a.statusLabels.positions[i];c.drawImage(resources.partyStatuses[status],anchor[0]+cell.bounds[0],anchor[1]+cell.bounds[1]);}else put('L'+mon.level,x+8,y+32,true);
      const slash=NativeTextLayout.width('/',df),sx=x+92-Math.floor(slash/2);put(p.hp,sx,y+32,true,'right');put('/',sx,y+32,true);put(p.max,sx+slash,y+32,true);
      c.fillStyle='#455054';c.fillRect(x+64,y+27,48,2);c.fillStyle=p.hp/p.max<=.2?'#e04a39':p.hp/p.max<=.5?'#efb539':'#69c549';c.fillRect(x+64,y+27,Math.ceil(48*p.hp/p.max),2);c.restore();
    });
    const forced=!!session.request()?.forceSwitch?.[0],prompt=a.prompt,choice=mode==='itemTarget'?'3':forced?'2':'default';c.fillStyle='#fff';c.fillRect(...prompt.rect);NativeText.draw(c,resources.partyPromptFont,prompt.nativeModes[choice].text,prompt.rect[0],prompt.rect[1],false,'left',a.font.variants.prompt);
  }
  function partyMon(){return session.battle.p1.pokemon[partyIndex];}
  function switchLabel(){const p=session.party()[partyIndex];return p.active?27:p.hp<=0||session.request()?.active?.[0]?.trapped?26:21;}
  function renderPartyPageButtons(){const a=resources.partyData,t=a.messages,context=mode==='partyContext';if(context){const unavailable=switchLabel();renderButtons([rect(t[unavailable],0,8,240,136,()=>turn('switch '+(partyIndex+1)),unavailable!==21),rect(t[24],0,152,104,40,()=>choose('partyInfo')),rect(t[25],104,152,104,40,()=>choose('partyMoves')),rect('Indietro',216,152,40,40,back)]);return;}
    if(mode==='partyMoveDetail'){renderButtons([...partyMon().moveSlots.map((slot,i)=>rect(GEN5.byMoveKey[slot.id]?.name||slot.move,88+i%2*40,152+Math.floor(i/2)*16,40,16,()=>{partyMove=i;update();})),rect('Indietro',216,152,40,40,back)]);return;}
    renderButtons([...(mode==='partyMoves'?partyMon().moveSlots.map((slot,i)=>rect(GEN5.byMoveKey[slot.id]?.name||slot.move,i%2*128,48+Math.floor(i/2)*48,128,48,()=>{partyMove=i;choose('partyMoveDetail');})):[]),rect('Pokémon precedente',0,152,40,40,()=>{partyIndex--;update();},partyIndex===0),rect('Pokémon successivo',40,152,40,40,()=>{partyIndex++;update();},partyIndex===session.party().length-1),rect(t[mode==='partyInfo'?25:24],96,152,104,40,()=>choose(mode==='partyInfo'?'partyMoves':'partyInfo')),rect('Indietro',216,152,40,40,back)]);
  }
  function drawPartyPage(){const a=resources.partyData,t=a.messages,mon=partyMon(),context=mode==='partyContext',page=context?a.context:a.detailPages[mode==='partyInfo'?'info':mode==='partyMoveDetail'?'moveDetail':'moves'],key=context?'context':mode==='partyInfo'?'info':mode==='partyMoveDetail'?'moveDetail':'moves';
    for(const bg of ['bg7','bg6']){const path=page.background[bg].path,id=Object.keys(a.images).find(id=>a.images[id].path===path);c.drawImage(resources.partyMaps[id],0,0);}
    if(press?.kind==='app'&&!press.released){const b=buttons[press.index],part=b.h===16?resources.moveTabs.pressed:b.w===128?resources.detailMovePanels.pressed:b.y===8?resources.partyParts['panel-pressed']:resources.partyParts[(b.x===216?'back':b.w===104?'wide':b.x===40?'next':'previous')+'-pressed'];if(part)c.drawImage(part,b.x,b.y);}
    const put=(value,x,y,align='left',variant='name')=>NativeText.draw(c,resources.partyDetailFonts[variant],String(value),x,y,false,align,a.font.variants[variant]);
    const windowText=(id,value,{align='left',y=0,variant='name'}={})=>{const w=(Array.isArray(page.windows)?page.windows[id]:Object.values(page.windows)[id]).rect;put(value,w[0]+(align==='center'?w[2]/2:align==='right'?w[2]:0),w[1]+y,align,variant);};
    const id=mon.species.num,icon=resources.partyIcons[id],anchor=page.sprites.pokemonIcon;if(icon)c.drawImage(icon,anchor[0]-16,anchor[1]-16);
    if(context){c.drawImage(resources.partyParts[switchLabel()===21?(press?.kind==='app'&&press.index===0&&!press.released?'panel-pressed':'panel'):'panel-disabled'],0,8);if(icon)c.drawImage(icon,anchor[0]-16,anchor[1]-16);windowText(0,mon.name,{y:7});windowText(1,t[switchLabel()],{align:'center',y:5});windowText(2,t[24],{align:'center',y:5});windowText(3,t[25],{align:'center',y:5});return;}
    const header=key==='moveDetail'?6:0;windowText(header,mon.name);if(mon.gender==='M'||mon.gender==='F')windowText(header,mon.gender==='M'?'♂':'♀',{align:'right',variant:mon.gender==='M'?'male':'female'});
    const typeIds=mon.getTypes().map(type=>['Normal','Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel','Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark'].indexOf(type));typeIds.forEach((id,i)=>{const im=resources['type-'+id],p=page.sprites.types[i];if(im&&p)c.drawImage(im,p[0]-16,p[1]-8);});
    const badge=()=>{if(!mon.item)return;const index=/mail$/.test(mon.item)?1:0,cell=a.heldItemBadge.cells[index],p=key==='info'?page.sprites.heldItemIcon:[anchor[0]+8,anchor[1]+8];c.drawImage(resources.heldBadges[index],p[0]+cell.bounds[0],p[1]+cell.bounds[1]);};badge();
    const status=mon.hp<=0?6:({slp:1,brn:2,psn:3,tox:3,par:4,frz:5})[mon.status];if(status!=null){const cell=a.statusLabels.cells[status],p=page.sprites.status;c.drawImage(resources.partyStatuses[status],p[0]+cell.bounds[0],p[1]+cell.bounds[1]);}
    if(key==='info'){
      const ability=GEN5.byAbilityKey[mon.ability],item=GEN5.items.find(v=>v.key===mon.item),story=Journey.state.party[mon.storyId],growth=OPENING_DATA[mon.species.name]?.growth,xp=story?.xp??growth?.[mon.level]??0;
      windowText(1,ability?.name||GEN5.label(mon.getAbility().name));NativeTextLayout.wrap(page.abilityDescriptions[ability?.id]||'',a.font.variants.name,144).slice(0,2).forEach((line,i)=>windowText(2,line,{y:i*16}));windowText(3,item?.name||t[30]);
      const w=page.windows[4].rect,slash=NativeTextLayout.width('/',a.font.variants.detailNumber),x=w[0]+Math.floor((w[2]-slash)/2);put(mon.hp,x,w[1],'right','detailNumber');put('/',x,w[1],'left','detailNumber');put(mon.maxhp,x+slash,w[1],'left','detailNumber');
      for(const [win,stat]of [[5,'atk'],[6,'def'],[7,'spe'],[8,'spa'],[9,'spd']])windowText(win,mon.storedStats[stat],{align:'right',variant:'detailNumber'});
      windowText(11,mon.level,{variant:'detailNumber'});windowText(12,mon.level===100?0:Math.max(0,(growth?.[mon.level+1]??xp)-xp),{align:'right',variant:'detailNumber'});
      for(const [win,msg]of Object.entries(page.textLayout.messageByWindow))if(+win>=13)windowText(+win,t[msg],+win===21?{align:'center',y:5}:{});
      const bar=page.windows[10].rect;c.fillStyle='#455054';c.fillRect(bar[0],bar[1]+3,48,2);c.fillStyle=mon.hp/mon.maxhp<=.2?'#e04a39':mon.hp/mon.maxhp<=.5?'#efb539':'#69c549';c.fillRect(bar[0],bar[1]+3,Math.ceil(48*mon.hp/mon.maxhp),2);
    }else if(key==='moveDetail'){
      const slot=mon.moveSlots[partyMove],move=GEN5.byMoveKey[slot.id];windowText(0,move.name);windowText(1,slot.pp+'/'+slot.maxpp);windowText(2,move.accuracy||t[60],{align:'right'});windowText(3,move.power>1?move.power:t[60],{align:'right'});windowText(5,t[page.textLayout.categoryMessageMap[move.category]]);
      NativeTextLayout.wrap(page.descriptions[move.id]||'',a.font.variants.name,240).slice(0,3).forEach((line,i)=>windowText(4,line,{y:i*16}));for(const [win,msg]of Object.entries(page.textLayout.messageByWindow))windowText(+win,t[msg]);
      const type=resources['type-'+ROM_BATTLE.typeNames.indexOf(move.type)],p=page.sprites.moveType;if(type)c.drawImage(type,p[0]-16,p[1]-8);const cat=resources.categoryIcons[move.category],record=a.moveCategoryIcons.categories[move.category]?.cells[0],catAt=page.sprites.categoryIcon;if(cat)c.drawImage(cat,catAt[0]+record.bounds[0],catAt[1]+record.bounds[1]);for(let i=0;i<mon.moveSlots.length;i++)c.drawImage(resources.moveTabs[press?.kind==='app'&&!press.released&&press.index===i?'pressed':i===partyMove?'selected':'normal'],88+i%2*40,152+Math.floor(i/2)*16);
    }else{
      for(let i=0;i<4;i++){const slot=mon.moveSlots[i],move=slot&&GEN5.byMoveKey[slot.id],x=i%2*128,y=48+Math.floor(i/2)*48;c.drawImage(resources.detailMovePanels[slot?(press?.kind==='app'&&!press.released&&press.index===i?'pressed':'normal'):'empty'],x,y);if(!slot)continue;const type=resources['type-'+ROM_BATTLE.typeNames.indexOf(move.type)],anchor=page.sprites.moveTypes[i];if(type)c.drawImage(type,anchor[0]-16,anchor[1]-8);windowText(i+1,move?.name||slot.move,{align:'center',y:7});const w=page.windows[i+1].rect;put(t[53],w[0]+40,w[1]+24);put(slot.pp,w[0]+80,w[1]+24,'right');put(t[56],w[0]+80,w[1]+24);put(slot.maxpp,w[0]+80+NativeTextLayout.width(t[56],a.font.variants.name),w[1]+24);}
      windowText(5,t[24],{align:'center',y:5});
    }
  }
  function tick(){
    if(!ready||!battling)return;if(press){const ticks=(performance.now()-press.at)*60/1000;if(['party','app'].includes(press.kind)&&ticks>=5)press.released=true;if(ticks>=(press.kind==='move'?metadata.moves.pressed.timing.unlockAfterControllerTicks:7)){const action=press.action;press=null;action();}}if(['moves','party','itemTarget','partyContext','partyInfo','partyMoves','partyMoveDetail'].includes(mode)&&!busy)draw();
    let narrative=$('log').lastElementChild;while(narrative&&/^— Turno [0-9]+ —$/.test(narrative.textContent))narrative=narrative.previousElementSibling;const value=mode==='notice'?notice:busy||finished||!['main','moves'].includes(mode)?narrative?.textContent||'':NativeTextLayout.format(metadata.battleText.banks['15'][69],[partner.nickname||partner.name]);
    messageCanvas.hidden=!value;if(!value)return;
    if(value!==lastMessage){lastMessage=value;BattleHUD.message(value,resources.partyNameFont,resources.partyData.font.variants.name);}
  }
  function cards(){
    if(!ready)return;
    for(const [id,p,own] of [['enemyCard',enemy,false],['playerCard',partner,true]]){
      const record=own?Journey.state.party[session.active().storyId]:null,growth=OPENING_DATA[p.name]?.growth;
      const xp=record&&growth?Math.min(1,(record.xp-growth[p.level])/(growth[p.level+1]-growth[p.level]||1)):0;
      BattleHUD.card($(id),p,own,resources,xp,Journey.state.dex.caught.includes(p.name));
    }
  }

  function itemTarget(s){const original=s.battle.runAction;s.battle.runAction=function(action){if(action.choice==='event'&&action.event==='DemoPotion'){const target=this.p1.pokemon[(s.potionTarget||action.pokemon.position+1)-1];s.potionTarget=null;BattleMedicine.apply(this,s.potionItem||17,target);return;}return original.call(this,action);};}

  window.BattleScreen={update,cards,tick,reset(){selectionByMode.clear();bagPage=0;mode='main';wasBusy=false;lastMessage='';press=null;},itemTarget,loading};
})();
