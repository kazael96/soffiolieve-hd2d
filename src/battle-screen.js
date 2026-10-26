/* BW single-battle touchscreen flow; native IRBI art, manual-confirmed command order. */
(() => {
  const panel=document.querySelector('#battle .battle-panel'),stage=document.createElement('div');stage.id='battleTouch';stage.className='native-stage';
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Comandi di lotta');stage.append(canvas);panel.append(stage);
  const messageCanvas=document.createElement('canvas');messageCanvas.id='nativeBattleMessage';messageCanvas.width=256;messageCanvas.height=40;messageCanvas.setAttribute('role','img');$('battle').append(messageCanvas);const messageContext=messageCanvas.getContext('2d');messageContext.imageSmoothingEnabled=false;let lastMessage='';
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const resources={},images=new Map();let font,smallFont,battleFont,fontMetrics,moveMetrics,metadata,ready=false,mode='main',buttons=[],selected=0,wasBusy=false,notice=null,bagCategory='medicine',bagItem=17,lastItem=0;
  function load(src){if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Grafica lotta non disponibile: '+src));im.src=NativeTextLayout.resource(src);}));return images.get(src);}
  const loading=(async()=>{
    metadata=await fetch(NativeTextLayout.resource('assets/battle-ui/provenance.json')).then(r=>{if(!r.ok)throw Error('Catalogo interfaccia lotta non disponibile');return r.json();});fontMetrics=metadata.fonts['2'];moveMetrics=metadata.fonts['0'];
    [font,smallFont,battleFont]=await Promise.all([NativeText.load(),load(fontMetrics.hpPalette162.path),load(moveMetrics.battlePalette13.path)]);
    const paths=['command-view-105.png','command-source-105.png','cell-115-117-0.png','cell-115-117-2.png','cell-165-166-0.png','cell-168-169-0.png','hp-atlas-164.png','moves-layer-111.png'];
    await Promise.all(paths.map(async name=>resources[name]=await load('assets/battle-ui/'+name)));
    await Promise.all(Object.entries(metadata.moves.panels).map(async([id,record])=>resources['panel-'+id]=await load(record.path)));
    await Promise.all(Object.entries(metadata.moves.typeLabels.labels).map(async([id,record])=>resources['type-'+id]=await load(record.path)));
    await Promise.all(Object.entries(metadata.bag.views).map(async([id,record])=>resources['bag-'+id]=await load(record.path)));
    resources.emptyMove=await load(metadata.moves.emptyPanel.path);
    resources.messageFont=await load(metadata.fonts['0'].messagePalette90.path);
    await Promise.all(metadata.moves.keyCursor.cells.map(async(record,i)=>resources['key-cursor-'+i]=await load(record.path)));
    resources.partyData=await(await fetch(NativeTextLayout.resource('assets/battle-party/provenance.json'))).json();
    resources.partyBase=await load(resources.partyData.images['0'].path);
    resources.partyPanels=await Promise.all(resources.partyData.panels.map(record=>load(record.path)));
    resources.partyIcons={};await Promise.all(Object.entries(MENU_ASSETS.pokemonIcons).map(async([id,record])=>resources.partyIcons[id]=await load(record.cells[0].src)));
    ready=true;if(battling){cards();update();}
  })().catch(error=>{console.error(error);stage.setAttribute('aria-label',error.message);stage.textContent=error.message;});
  const text=(s,x,y,white=false,align='left')=>NativeText.draw(c,font,String(s),x,y,white,align);
  const rect=(label,x,y,w,h,action,disabled=false)=>({label,x,y,w,h,action,disabled});
  function choose(next){mode=next;notice=null;update();}
  function back(){if(busy)return;if(mode==='main')return;choose(mode==='itemDetail'?bagCategory:['medicine','balls','statusItems','battleItems'].includes(mode)?'bag':'main');}
  function bagItems(){return mode==='medicine'?(potions?[{id:17,count:potions}]:[]):mode==='balls'?(Journey.state.pokeballs?[{id:4,count:Journey.state.pokeballs}]:[]):[];}
  function useBagItem(){
    if(bagItem===17){if(potions>0){lastItem=17;choose('itemTarget');}return;}
    if(trainer){notice='Non si possono catturare i Pokémon degli altri Allenatori!';mode='notice';update();return;}
    lastItem=4;$('catchBall').onclick();
  }
  function activate(index){const b=buttons[index];if(!b||b.disabled)return;void AudioEngine.playSound(1352);b.action();}
  function renderButtons(next){
    buttons=next;selected=Math.max(0,next.findIndex(b=>!b.disabled));stage.querySelectorAll('button').forEach(b=>b.remove());
    next.forEach((b,i)=>{const el=document.createElement('button');el.className='native-hit';el.setAttribute('aria-label',b.label);el.textContent=b.label;el.disabled=!!b.disabled;Object.assign(el.style,{left:b.x/2.56+'%',top:b.y/1.92+'%',width:b.w/2.56+'%',height:b.h/1.92+'%'});el.onclick=()=>activate(i);el.onfocus=()=>{selected=i;draw();};b.element=el;stage.append(el);});
    if(!busy)next[selected]?.element.focus();draw();
  }
  stage.addEventListener('keydown',e=>{if(e.target.closest('input'))return;const k=e.key.toLowerCase(),directions={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]};if(directions[k]){e.preventDefault();e.stopPropagation();selected=NativeUI.nextButton(buttons,selected,...directions[k]);buttons[selected]?.element.focus();}else if(['enter',' ','z','a'].includes(k)){e.preventDefault();activate(selected);}else if(['escape','b','x'].includes(k)){e.preventDefault();back();}});
  function run(){if(trainer&&!labBattle){notice="Non si può fuggire da una lotta contro un Allenatore!";mode='notice';update();}else $('run').onclick();}
  function update(){
    if(!battling||!ready||!session)return;
    const forced=!!session.request()?.forceSwitch?.[0];if(busy){wasBusy=true;renderButtons([]);return;}
    if(wasBusy){wasBusy=false;mode=forced?'party':'main';}
    if(finished){renderButtons(storyBattle==='tutorial'?[]:[rect('Continua',0,0,256,192,()=>endBattle())]);return;}
    if(forced)mode='party';
    if(mode==='main')renderButtons([rect('LOTTA',0,60,256,64,()=>choose('moves')),rect('BORSA',0,142,84,50,()=>choose('bag')),rect('FUGA',86,154,84,38,run),rect('POKÉMON',172,142,84,50,()=>choose('party'))]);
    else if(mode==='moves'){
      const list=[...$('moves').querySelectorAll(':scope > button')];renderButtons([...list.map((b,i)=>rect(b.textContent,i%2*128,32+Math.floor(i/2)*48,128,48,()=>b.onclick(),b.disabled)),rect('Indietro',176,144,80,48,back)]);
    }else if(mode==='bag'){
      const names=metadata.battleText.banks['17'],modes=['medicine','balls','statusItems','battleItems'];
      renderButtons([...metadata.bag.categories.map((category,i)=>rect(category.messages.map(id=>names[id]).join(' '),...category.panelRect,()=>{bagCategory=modes[i];choose(bagCategory);})),...(lastItem?[rect(names[8],16,160,200,32,()=>{bagItem=lastItem;bagCategory=lastItem===17?'medicine':'balls';choose('itemDetail');})]:[]),rect('Indietro',216,152,40,40,back)]);
    }else if(['medicine','balls','statusItems','battleItems'].includes(mode))renderButtons([...bagItems().map((item,i)=>rect(ORIGINAL_EVENTS.itemNames[item.id]+' ×'+item.count,i%2*128,Math.floor(i/2)*48,128,48,()=>{bagItem=item.id;choose('itemDetail');},storyBattle==='tutorial')),rect('Indietro',216,152,40,40,()=>choose('bag'))]);
    else if(mode==='itemDetail')renderButtons([rect('USA',56,152,152,40,useBagItem,storyBattle==='tutorial'),rect('Indietro',216,152,40,40,back)]);
    else if(mode==='party'||mode==='itemTarget'){
      const item=mode==='itemTarget';renderButtons([...session.party().map((p,i)=>rect(p.name,...resources.partyData.slots[i].rect,()=>{
        if(item){session.potionTarget=p.index;turn(null,'potion');}else turn('switch '+p.index);
      },p.hp<=0||(item?p.hp===p.max:p.active))),...(!forced?[rect('Indietro',188,164,64,28,()=>choose(item?'medicine':'main'))]:[])]);
    }else if(mode==='notice')renderButtons([rect('Continua',0,0,256,192,()=>choose('main'))]);
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
          if(!move)return;c.save();c.globalAlpha=button.disabled?.55:1;c.drawImage(resources['panel-'+Math.max(0,id)],x,y);
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
      }else if(['medicine','balls','statusItems','battleItems'].includes(mode)){
        c.drawImage(resources['bag-list'],0,0);bagItems().forEach((item,i)=>{const x=i%2*128,y=Math.floor(i/2)*48;text(ORIGINAL_EVENTS.itemNames[item.id],x+8,y+8,true);text('×'+item.count,x+104,y+32,true,'right');});
      }else if(mode==='itemDetail'){
        c.drawImage(resources['bag-detail'],0,0);text(ORIGINAL_EVENTS.itemNames[bagItem],56,32,true);text('×'+(bagItem===17?potions:Journey.state.pokeballs),200,32,true,'right');
        NativeTextLayout.wrap(MENU_ASSETS.itemDescriptions[bagItem]||'',POKEDEX_ASSETS.font,224).slice(0,3).forEach((line,i)=>text(line,16,72+15*i,true));text('USA',108,168,true,'center');
      }else if(mode==='party'||mode==='itemTarget'){
        c.drawImage(resources.partyBase,0,0);session.party().forEach((p,i)=>{const [x,y]=resources.partyData.slots[i].rect,side=i%2,frame=side*4+(selected===i?1:0);c.drawImage(resources.partyPanels[frame],x,y);const id=POKEDEX_ASSETS.species[p.name]?.id,icon=resources.partyIcons[id];if(icon)c.drawImage(icon,x+2,y+3);text(p.name,x+34,y+3,true);const mon=session.battle.p1.pokemon[p.index-1];text('L. '+mon.level,x+34,y+18,true);text(p.hp+'/'+p.max,x+120,y+31,true,'right');c.fillStyle='#455054';c.fillRect(x+65,y+25,54,3);c.fillStyle=p.hp/p.max<=.2?'#e04a39':p.hp/p.max<=.5?'#efb539':'#69c549';c.fillRect(x+65,y+25,54*p.hp/p.max,3);});
      }else buttons.filter(b=>b.label!=='Indietro').forEach(b=>{c.fillStyle='#fafafa';c.fillRect(b.x,b.y,b.w,b.h);text(b.label,b.x+b.w/2,b.y+16,false,'center');});
      if(buttons.some(b=>b.label==='Indietro')&&!['bag','medicine','balls','statusItems','battleItems','itemDetail'].includes(mode))text('Indietro',220,171,false,'center');
    }
    const b=buttons[selected];if(b&&!b.disabled){
      {
        const group=metadata.moves.keyCursor,positions=[[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]],sequences=[0,2,1,3],tick=Math.floor(performance.now()*.06)%36;
        positions.forEach(([x,y],i)=>{const animation=group.animations[sequences[i]],frame=animation.frames[Math.min(2,Math.floor(tick/12))],cell=group.cells[frame[0]];c.drawImage(resources['key-cursor-'+frame[0]],x+cell.bounds[0]+frame[2],y+cell.bounds[1]+frame[3]);});
      }
    }
  }
  function tick(){
    if(!ready||!battling)return;if(mode==='moves'&&!busy)draw();
    const value=busy||finished?$('log').lastElementChild?.textContent||'':NativeTextLayout.format(metadata.battleText.banks['15'][69],[partner.nickname||partner.name]);
    if(value===lastMessage)return;lastMessage=value;messageContext.clearRect(0,0,256,40);messageContext.fillStyle='rgba(0,0,0,.8)';messageContext.fillRect(8,0,240,32);
    NativeTextLayout.wrap(value,metadata.fonts['0'],240).slice(-2).forEach((line,i)=>NativeText.draw(messageContext,resources.messageFont,line,8,i*15,false,'left',metadata.fonts['0']));messageCanvas.setAttribute('aria-label',value);
  }
  function cards(){
    if(!ready)return;
    for(const [id,p,own] of [['enemyCard',enemy,false],['playerCard',partner,true]]){
      const box=$(id);let card=box.querySelector('canvas');if(!card){card=document.createElement('canvas');card.width=128;card.height=own?54:40;box.replaceChildren(card);}const ctx=card.getContext('2d');ctx.clearRect(0,0,128,54);ctx.imageSmoothingEnabled=false;ctx.drawImage(resources[own?'cell-168-169-0.png':'cell-165-166-0.png'],0,15);
      const put=(s,x,y,align='left')=>NativeText.draw(ctx,smallFont,String(s),x,y,false,align,fontMetrics);
      function digits(value,x,y,align='left'){const string=String(value);if(align==='right')x-=string.length*8;for(const character of string){const source=metadata.hpAtlas.digits[character];if(source)ctx.drawImage(resources['hp-atlas-164.png'],...source,x,y,8,8);else NativeText.draw(ctx,smallFont,character,x+2,y-1,false,'left',fontMetrics);x+=8;}}
      put(p.nickname||p.name,8,2);put(p.gender==='F'?'♀':p.gender==='M'?'♂':'',72,1);digits(p.level,117,15,'right');const fraction=p.hp/p.max;ctx.fillStyle='#29463e';ctx.fillRect(53,23,50,3);ctx.fillStyle=fraction<=.2?'#d85038':fraction<=.5?'#e8b038':'#58b888';ctx.fillRect(53,23,Math.ceil(50*fraction),3);
      if(p.status)put(STATUS_NAMES[p.status]||p.status,8,33);
      if(own){digits(p.hp+'/'+p.max,119,33,'right');const record=Journey.state.party[session.active().storyId],growth=OPENING_DATA[p.name]?.growth,ratio=record&&growth?Math.min(1,(record.xp-growth[p.level])/(growth[p.level+1]-growth[p.level]||1)):0;ctx.fillStyle='#2c343d';ctx.fillRect(36,51,84,2);ctx.fillStyle='#74a6ff';ctx.fillRect(36,51,84*ratio,2);}
      else if(Journey.state.dex.caught.includes(p.name))ctx.drawImage(resources['cell-115-117-0.png'],1,31,8,8);
      card.setAttribute('role','img');card.setAttribute('aria-label',`${p.nickname||p.name}, livello ${p.level}${own?', PS '+p.hp+' su '+p.max:''}${p.status?', '+STATUS_NAMES[p.status]:''}`);
    }
  }
  function itemTarget(s){const original=s.battle.runAction;s.battle.runAction=function(action){if(action.choice==='event'&&action.event==='DemoPotion'&&s.potionTarget){const target=this.p1.pokemon[s.potionTarget-1];s.potionTarget=null;if(target&&target.hp>0)action.pokemon=target;}return original.call(this,action);};}
  window.BattleScreen={update,cards,tick,reset(){mode='main';wasBusy=false;lastMessage='';},itemTarget,loading};
})();
