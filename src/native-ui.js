/* Native-resolution menu compositor. Graphics/text are converted from IRBI. */
(function(root){
  function nextButton(buttons,current,dx,dy){
    const from=buttons[current];if(!from)return 0;
    const candidates=buttons.map((b,i)=>({b,i,x:b.x+b.w/2-from.x-from.w/2,y:b.y+b.h/2-from.y-from.h/2})).filter(c=>!c.b.disabled&&(dx?c.x*dx>0:c.y*dy>0));
    candidates.sort((a,b)=>Math.abs(dx?a.y:a.x)-Math.abs(dx?b.y:b.x)||Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));
    return candidates[0]?.i??current;
  }
  const images=new Map();
  function image(url){if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Risorsa interfaccia non disponibile: '+url));i.src=url;}));return images.get(url);}
  class Screen {
    constructor(){
      this.dialog=document.createElement('dialog');this.dialog.id='nativeMenu';this.dialog.className='native-screen';
      this.stage=document.createElement('div');this.stage.className='native-stage';this.canvas=document.createElement('canvas');this.canvas.width=256;this.canvas.height=192;this.canvas.setAttribute('role','img');this.stage.append(this.canvas);this.dialog.append(this.stage);document.body.append(this.dialog);
      this.ctx=this.canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;this.buttons=[];this.selected=0;
      this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.back?.();});
      this.dialog.addEventListener('keydown',e=>{
        if(e.target.closest('input,select,textarea'))return;const k=e.key.toLowerCase();
        if(['arrowup','arrowdown','arrowleft','arrowright','enter',' ','z','a','b','escape','x'].includes(k)){e.preventDefault();e.stopImmediatePropagation();}
        const directions={arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]};
        if(directions[k]){this.selected=nextButton(this.buttons,this.selected,...directions[k]);this.focus();void root.AudioEngine?.playSound(1352);}
        else if(['enter',' ','z','a'].includes(k))this.activate(this.selected);
        else if(['b','escape','x'].includes(k))this.back?.();
      });
    }
    async ready(){this.font=await NativeText.load();}
    show(title,render,buttons,back){
      this.title=title;this.render=render;this.back=back;this.buttons=buttons;this.selected=Math.max(0,buttons.findIndex(b=>!b.disabled));
      this.dialog.setAttribute('aria-label',title);this.canvas.setAttribute('aria-label',title);
      this.stage.querySelectorAll('button').forEach(b=>b.remove());
      buttons.forEach((b,i)=>{const el=document.createElement('button');el.type='button';el.className='native-hit';el.textContent=b.label;el.setAttribute('aria-label',b.label);el.disabled=!!b.disabled;Object.assign(el.style,{left:b.x/2.56+'%',top:b.y/1.92+'%',width:b.w/2.56+'%',height:b.h/1.92+'%'});el.onclick=()=>this.activate(i);el.onfocus=()=>{this.selected=i;this.draw();};b.element=el;this.stage.append(el);});
      if(!this.dialog.open)this.dialog.showModal();resetInput();this.focus();
    }
    focus(){this.buttons[this.selected]?.element.focus();this.draw();}
    activate(i){const b=this.buttons[i];if(!b||b.disabled)return;void root.AudioEngine?.playSound(1352);b.action();}
    draw(){const c=this.ctx;c.clearRect(0,0,256,192);this.render(c);const b=this.buttons[this.selected];if(b&&!b.disabled&&!['Menu','Pokémon'].includes(this.title)){c.strokeStyle='#f0a030';c.lineWidth=2;c.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2);}}
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
      assets.main=assets.background;assets.mainButtons=assets.buttons6;
      await Promise.all(Object.entries(root.MENU_ASSETS?.groups||{}).map(async([key,group])=>{if(group.cells[0])assets['icon-'+key]=await image(group.cells[0].src);}));
      await Promise.all(Object.entries(root.MENU_ASSETS?.pokemonIcons||{}).map(async([id,record])=>{assets['pokemon-'+id]=await image(record.cells[0].src);}));
      assets['icon-options']=assets['icon-pokedex'];assets['icon-pokedex']=assets['icon-xtransceiverMale'];
      if(root.MENU_ASSETS?.groups.bagMale)assets.bagSprite=await image(MENU_ASSETS.groups.bagMale.cells[2].src);
      if(root.MENU_ASSETS?.groups.selection)assets.selection=await image(MENU_ASSETS.groups.selection.cells[0].src);
    })();return preparation;
  }
  async function open(){if(battling||root.NativeStory?.locked)return;await prepare();main();}
  function main(){
    const s=Journey.state,labels=MENU_ASSETS.texts['34'],entries=[[labels[2],'pokemon',()=>team(),!s.starter],[labels[1],'pokedex',()=>external(()=>Pokedex.browse()),!s.original?.pokedex],[labels[3],'bag',()=>bag()], [s.playerName,'trainer',()=>trainerCard()],[labels[5],'save',()=>saveMenu()],[labels[6],'options',()=>options()]];
    const buttons=entries.map(([label,key,action,disabled],i)=>rect(label,4+(i%2)*128,24+Math.floor(i/2)*48,120,40,action,disabled));
    buttons.push(rect('Chiudi',228,168,28,24,()=>screen.close()));
    screen.show('Menu',c=>{background(c,'main');if(assets.mainButtons)c.drawImage(assets.mainButtons,0,0,256,192,0,0,256,192);const chosen=buttons[screen.selected];if(chosen&&screen.selected<6&&assets.selection)c.drawImage(assets.selection,chosen.x-1,chosen.y);entries.forEach(([label,key,,disabled],i)=>{const x=4+i%2*128,y=24+Math.floor(i/2)*48,im=assets['icon-'+key];if(im){c.save();c.globalAlpha=disabled?.35:1;c.drawImage(im,x+23-Math.floor(im.width/2),y+20-Math.floor(im.height/2));c.restore();}screen.text(label,x+43,y+12,true);});screen.text('X',242,172,false,'center');},buttons,()=>screen.close());
  }
  async function external(fn){screen.close();try{await fn();}finally{main();}}
  function partyMon(index){return Journey.unpack(Journey.state.party[index]);}
  function partyPanel(c,x,y,selected,ko){if(assets.partyPanels)c.drawImage(assets.partyPanels,selected?0:128,selected?56:ko?64:16,128,48,x,y,128,48);else box(c,x,y,128,48,selected);}
  function team({select=null,back=main}={}){
    const s=Journey.state;const buttons=s.party.map((p,i)=>rect(p.nickname||p.name,(i%2)*128,8+(i%2)*8+Math.floor(i/2)*48,128,48,()=>select?select(i):swapFrom===null?partyActions(i):swap(i)));
    buttons.push(rect('Esci',180,164,72,24,()=>{swapFrom=null;back();}));
    screen.show('Pokémon',c=>{c.fillStyle='#101820';c.fillRect(0,0,256,192);c.strokeStyle='#24333e';for(let x=0;x<256;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,168);c.stroke();}for(let y=0;y<168;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();}s.party.forEach((p,i)=>{const m=partyMon(i),x=i%2*128,y=8+i%2*8+Math.floor(i/2)*48;partyPanel(c,x,y,swapFrom===i||screen.selected===i,m.hp===0);const icon=assets['pokemon-'+m.spriteId];if(icon)c.drawImage(icon,x+2,y+3);screen.text(p.nickname||p.name,x+34,y+3,true);screen.text('L. '+p.level,x+34,y+18,true);screen.text(m.hp+'/'+m.max,x+120,y+31,true,'right');c.fillStyle='#465759';c.fillRect(x+65,y+25,54,3);c.fillStyle=m.hp/m.max<=.2?'#d85038':m.hp/m.max<=.5?'#e8b038':'#58b888';c.fillRect(x+65,y+25,54*m.hp/m.max,3);});c.fillStyle='#f2f3f2';c.fillRect(0,168,180,24);caption(MENU_ASSETS.texts['157'][swapFrom===null?9:11]);screen.text('Esci',216,168,true,'center');},buttons,()=>{swapFrom=null;back();});
  }
  function partyActions(i){
    const p=Journey.state.party[i],entries=[['Info',()=>summary(i)],['Sposta',()=>{swapFrom=i;team();}],['Strumento',()=>{if(p.heldItem){const id=Journey.takeItem(i);notice('Ritirato: '+ORIGINAL_EVENTS.itemNames[id],()=>team());}else notice('Nessuno strumento.',()=>team());}],['Esci',()=>team()]];
    screen.show(p.nickname||p.name,c=>{background(c,'party');screen.text(p.nickname||p.name,16,16);entries.forEach(([label],n)=>screen.text(label,40,54+n*28));},entries.map(([label,action],n)=>rect(label,24,50+n*28,208,26,action)),()=>team());
  }
  function swap(i){if(i!==swapFrom)Journey.moveParty(swapFrom,i);swapFrom=null;team();}
  function summary(index,page=0){
    const p=Journey.state.party[index],m=partyMon(index),name=p.nickname||p.name;
    const labels=['Info','Abilità','Mosse'];
    screen.show('Info di '+name,c=>{background(c,'summary');screen.text(name+'  L. '+p.level,12,8);screen.text(labels[page],244,8,false,'right');
      if(page===0){screen.text(m.type,16,45);screen.text('Allenatore: '+Journey.state.playerName,16,69);screen.text('Punti Esperienza: '+p.xp,16,93);const growth=OPENING_DATA[p.name].growth;screen.text('Al prossimo L.: '+Math.max(0,(growth[p.level+1]||p.xp)-p.xp),16,117);}
      if(page===1){[['PS',m.hp+'/'+m.max],['Attacco',m.stats.atk],['Difesa',m.stats.def],['Att. Sp.',m.stats.spa],['Dif. Sp.',m.stats.spd],['Velocità',m.stats.spe]].forEach(([k,v],i)=>{screen.text(k,12,36+i*18);screen.text(v,140,36+i*18,false,'right');});screen.text(m.ability,160,54);}
      if(page===2)m.moves.forEach((move,i)=>{screen.text(move.name,16,40+i*28);screen.text('PP '+move.left+'/'+move.pp,244,40+i*28,false,'right');});
      screen.text('<',16,171);screen.text('>',144,171);screen.text('Esci',224,171,false,'center');
    },[rect('Pagina precedente',4,164,36,28,()=>summary(index,(page+2)%3)),rect('Pagina successiva',128,164,36,28,()=>summary(index,(page+1)%3)),rect('Esci',188,164,64,28,()=>team())],()=>team());
  }
  function inventory(pocket){const s=Journey.state;return pocket===1?[{id:17,count:potions}].filter(i=>i.count):pocket===0?[{id:4,count:s.pokeballs}].filter(i=>i.count):pocket===4?[...(s.original?.map?[{id:442,count:1}]:[]),...(s.original?.phone?[{id:621,count:1}]:[])]:[];}
  function bag(pocket=0){
    const items=inventory(pocket),names=ORIGINAL_EVENTS.itemNames,pockets=MENU_ASSETS.texts['55'];
    const buttons=[0,1,2,3,4].map((n)=>rect(pockets[n]||['Strumenti','Rimedi','MT e MN','Bacche','Strumenti base'][n],4+n*50,26,48,24,()=>bag(n)));
    items.forEach((item,i)=>buttons.push(rect(names[item.id]+' ×'+item.count,70,60+i*28,180,26,()=>bagAction(item.id,pocket))));buttons.push(rect('Esci',188,164,64,28,main));
    screen.show('Borsa',c=>{background(c,'bagMale');screen.text(pockets[pocket]||'Borsa',12,8,true);buttons.slice(0,5).forEach((b,i)=>{box(c,b.x,b.y,b.w,b.h,i===pocket);screen.text(String(i+1),b.x+24,b.y+4,false,'center');});if(assets.bagSprite)c.drawImage(assets.bagSprite,4,68);items.forEach((item,i)=>{screen.text(names[item.id],74,64+i*28,true);screen.text('×'+item.count,248,64+i*28,true,'right');});if(!items.length)screen.text('Non ci sono strumenti.',16,88,true);screen.text('Esci',224,170,true,'center');},buttons,main);
  }
  function bagAction(id,pocket){
    const t=MENU_ASSETS.texts['3'],actions=[[t[0],()=>useItem(id,pocket)]];
    if(id===4||id===17)actions.push([t[1],()=>discard(id,pocket)],[t[3],()=>team({select:i=>{Journey.giveItem(id,i);notice('Strumento assegnato.',()=>bag(pocket));},back:()=>bag(pocket)})]);
    actions.push([t[8],()=>bag(pocket)]);
    screen.show(ORIGINAL_EVENTS.itemNames[id],c=>{background(c,'bagMale');screen.text(ORIGINAL_EVENTS.itemNames[id],12,8,true);(MENU_ASSETS.itemDescriptions[id]||'').split('\\n').forEach((line,i)=>screen.text(line,6,32+i*16,true));actions.forEach(([label],i)=>screen.text(label,180,96+i*21,true));},actions.map(([label,action],i)=>rect(label,140,92+i*21,112,21,action)),()=>bag(pocket));
  }
  function useItem(id,pocket){if(id===442)return external(()=>TownMap.open());if(id===17)return team({select:i=>{const result=Journey.usePotion(i);notice(result?MENU_ASSETS.texts['157'][44].replace('{0102:0}',Journey.state.party[i].nickname||Journey.state.party[i].name).replace('{0202:1}',result):'Non avrebbe alcun effetto.',()=>bag(pocket));},back:()=>bag(pocket)});notice('Non è il momento di usarlo!',()=>bag(pocket));}
  function discard(id,pocket){screen.show('Butta',c=>{background(c,'bagMale');screen.text('Vuoi buttare 1 '+ORIGINAL_EVENTS.itemNames[id]+'?',8,60,true);screen.text('SÌ',64,130,true,'center');screen.text('NO',192,130,true,'center');},[rect('SÌ',4,112,120,48,()=>{Journey.discardItem(id,1);bag(pocket);}),rect('NO',132,112,120,48,()=>bag(pocket))],()=>bag(pocket));}
  function notice(text,back){screen.show(text,c=>{background(c,'main');text.match(/.{1,31}(?:\s|$)|.{1,31}/g)?.forEach((line,i)=>screen.text(line.trim(),12,64+i*18));screen.text('A: Continua',128,158,false,'center');},[rect('Continua',4,140,248,48,back)],back);}
  function saveMenu(){const s=Journey.state;screen.show('Salva',c=>{background(c,'main');screen.text(s.playerName,16,24);screen.text('Pokédex: '+s.dex.caught.length,16,48);screen.text(MENU_ASSETS.texts['168'][0].replace('{0100:0}',s.playerName),16,92);screen.text('SÌ',64,144,false,'center');screen.text('NO',192,144,false,'center');},[rect('SÌ',4,132,120,40,()=>{Journey.save(true);notice(MENU_ASSETS.texts['36'][4].replace('{0100:0}',s.playerName),main);}),rect('NO',132,132,120,40,main)],main);}
  function options(draft={...NativeSettings.state},focus=0){
    const t=MENU_ASSETS.texts['29'],rows=[[t[1],'textSpeed',[1,2,3],[t[10],t[11],t[12]]],[t[2],'animations',[true,false],[t[13],t[14]]],[t[3],'battleStyle',['switch','set'],[t[15],t[16]]],[t[4],'sound',['stereo','mono'],[t[17],t[18]]]];
    const buttons=[];rows.forEach(([label,key,values,names],row)=>values.forEach((value,i)=>buttons.push(rect(label+': '+names[i],128+i*40,30+row*28,38,25,()=>options({...draft,[key]:value},buttons.findIndex(b=>b.label===label+': '+names[i]))))));
    buttons.push(rect(t[8],4,160,120,30,()=>{NativeSettings.set(draft);main();}),rect(t[9],132,160,120,30,main));
    screen.show(t[0],c=>{background(c,'options');screen.text(t[0],128,6,false,'center');rows.forEach(([label,key,values,names],row)=>{screen.text(label,8,35+row*28);values.forEach((value,i)=>{if(draft[key]===value)box(c,128+i*40,30+row*28,38,25,true);screen.text(names[i],147+i*40,35+row*28,false,'center');});});screen.text(t[8],64,167,false,'center');screen.text(t[9],192,167,false,'center');},buttons,main);screen.selected=focus;screen.focus();
  }
  function trainerCard(){const s=Journey.state;screen.show(s.playerName,c=>{background(c,'trainer');screen.text(s.playerName,16,16);screen.text('Denaro: '+s.money,16,56);screen.text('Pokédex: '+s.dex.caught.length,16,80);screen.text('Medaglie: 0',16,104);screen.text('Esci',224,170,false,'center');},[rect('Esci',188,164,64,28,main)],main);}
  root.NativeUI={Screen,nextButton,open,prepare,team:async()=>{if(battling||root.NativeStory?.locked||!Journey.state.starter)return;await prepare();team({back:()=>screen.close()});},main,bag,summary};
  if(typeof module!=='undefined')module.exports={nextButton};
})(typeof window!=='undefined'?window:globalThis);
