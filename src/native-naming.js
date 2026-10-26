/* IRBI naming pages and controls; text is kept as native character codes. */
(function(root){
  function edit(value,action,character='',allowed=null){
    const letters=[...String(value)];
    if(action==='delete')letters.pop();
    else if(action==='insert'&&letters.length<10&&(!allowed||allowed.has(character)))letters.push(character);
    return letters.join('');
  }
  async function open(pokemon){
    const data=root.NAMING_ASSETS;
    if(!data)throw Error('Tastiera originale non disponibile');
    const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Risorsa tastiera non disponibile: '+src));im.src=NativeTextLayout.resource(src);});
    const resources={};await Promise.all(Object.entries(data.images).map(async([key,record])=>resources[key]=await load(record.src)));
    const font=await load(data.font?.src||'assets/pokedex/font.png'),metrics=data.font||POKEDEX_ASSETS.font;
    const cursors=await Promise.all(data.sprites.cells.map(record=>load(record.src)));
    const promptFrame=await load(COMMON_DIALOGUE_ASSETS.images.fieldDialogue.src);
    const id=GEN5.species.find(s=>s.en===pokemon.name).id,sprite=await load(MENU_ASSETS.pokemonIcons[id].cells[0].src);
    const dialog=document.createElement('dialog');dialog.id='nativeNaming';dialog.className='native-dual-screen';dialog.setAttribute('aria-label','Soprannome del Pokémon');
    const screens=document.createElement('div');screens.className='native-dual-panels';dialog.append(screens);
    const top=document.createElement('canvas');top.width=256;top.height=192;top.setAttribute('role','img');screens.append(top);
    const stage=document.createElement('div');stage.className='native-stage';screens.append(stage);
    const bottom=document.createElement('canvas');bottom.width=256;bottom.height=192;bottom.setAttribute('role','img');bottom.setAttribute('aria-label','Tastiera italiana originale');stage.append(bottom);
    const input=document.createElement('input');input.maxLength=10;input.value=pokemon.nickname||'';input.setAttribute('aria-label','Soprannome del Pokémon');input.autocomplete='off';input.spellcheck=false;input.className='native-name-input';screens.append(input);
    const a=top.getContext('2d'),b=bottom.getContext('2d');a.imageSmoothingEnabled=b.imageSmoothingEnabled=false;
    let value=input.value,page=0,selected=0,buttons=[],finished=false,request=0;const started=performance.now();
    const allowed=new Set(data.pages.flatMap(p=>p.codes.map(c=>String.fromCharCode(c))).filter(c=>c!=='※'));
    const put=(ctx,text,x,y,white=false,align='left')=>NativeText.draw(ctx,font,String(text),x,y,white,align,metrics);
    let complete;const done=new Promise(resolve=>complete=resolve);
    function finish(){if(finished)return;finished=true;const result=value.trim();complete(!result||result===(pokemon.nickname||pokemon.name)?null:result);}
    function change(action,character){value=edit(value,action,character,allowed);input.value=value;draw();}
    function command(action){
      if(action==='confirm')finish();else if(action==='delete')change('delete');
      else if(action==='upper')switchPage(page>=3?4:0);else if(action==='lower')switchPage(page>=3?3:1);
      else if(action==='symbols')switchPage(2);else if(action==='qwerty')switchPage(page>=3?0:3);
      else if(action==='shift')switchPage(page===4?3:4);else if(action==='space')change('insert',' ');
    }
    function add(label,x,y,w,h,action){buttons.push({label,x,y,w,h,action});}
    function switchPage(next){page=next;selected=0;renderButtons();}
    function renderButtons(){
      stage.querySelectorAll('button').forEach(el=>el.remove());buttons=[];
      const p=data.pages[page],qwerty=page>=3;
      p.codes.forEach((code,i)=>{const character=String.fromCharCode(code);if(character==='※')return;const row=Math.floor(i/p.columns),column=i%p.columns;
        const x=qwerty?(row===1?48:row===2?56:40)+column*16:24+column*16,y=qwerty?64+row*32:40+row*24;
        add(character===' '?'Spazio':character,x,y,15,qwerty?22:23,()=>change('insert',character));
      });
      const labels={upper:'MAIUS',lower:'minus',symbols:'altri',qwerty:'qwerty',delete:'Cancella',confirm:'OK'};
      for(const button of data.buttons){if(qwerty&&['delete','confirm'].includes(button.action))continue;add(labels[button.action],...button.rect,()=>command(button.action));}
      if(qwerty){add('Cancella',200,64,31,22,()=>command('delete'));add('OK',192,96,39,22,finish);add('MAIUSCOLE',24,128,31,22,()=>command('shift'));add('MAIUSCOLE',184,128,31,22,()=>command('shift'));add('Spazio',120,162,95,20,()=>command('space'));}
      buttons.forEach((button,i)=>{const el=document.createElement('button');el.type='button';el.className='native-hit';el.textContent=button.label;el.setAttribute('aria-label',button.label);Object.assign(el.style,{left:button.x/2.56+'%',top:button.y/1.92+'%',width:button.w/2.56+'%',height:button.h/1.92+'%'});el.onclick=()=>{selected=i;void AudioEngine.playSound(1352);button.action();};el.onfocus=()=>{selected=i;draw();};button.element=el;stage.append(el);});
      buttons[selected]?.element.focus();draw();
    }
    function draw(){
      a.clearRect(0,0,256,192);a.drawImage(resources.upperBackground,0,0,256,192,0,0,256,192);
      a.drawImage(promptFrame,0,144);
      NativeTextLayout.wrap(NativeTextLayout.format(data.labels[1],[pokemon.nickname||pokemon.name]),metrics,240).slice(0,2).forEach((line,i)=>put(a,line,8,152+i*16));
      top.setAttribute('aria-label',NativeTextLayout.format(data.labels[1],[pokemon.nickname||pokemon.name]));
      b.clearRect(0,0,256,192);b.drawImage(resources.nameHeader,0,0,256,192,0,0,256,192);b.drawImage(resources.buttons,0,0,256,192,0,0,256,192);b.drawImage(resources[page>=3?'qwertyKeys':'alphabetKeys'],0,0,256,192,0,0,256,192);
      b.drawImage(sprite,30-Math.floor(sprite.width/2),20-Math.floor(sprite.height/2));
      const sequence=data.sprites.animations[0].frames,total=sequence.reduce((sum,frame)=>sum+frame[1],0);let time=Math.floor((performance.now()-started)*60/1000)%total,active=sequence[0][0];for(const frame of sequence){if(time<frame[1]){active=frame[0];break;}time-=frame[1];}
      const letters=[...value];for(let i=0;i<10;i++){if(letters[i])put(b,letters[i],71+i*14,16,true,'center');const index=i===Math.min(9,letters.length)?active:0,origin=data.sprites.cells[index].origin;b.drawImage(cursors[index],64+i*14+origin[0],37+origin[1]);}
      bottom.setAttribute('aria-label','Tastiera italiana. Soprannome: '+(value||pokemon.name));
      const p=data.pages[page];p.codes.forEach((code,i)=>{if(code===8251)return;const row=Math.floor(i/p.columns),column=i%p.columns,x=page>=3?(row===1?48:row===2?56:40)+column*16:24+column*16,y=page>=3?64+row*32:40+row*24,pixel=b.getImageData(x+7,y+10,1,1).data;put(b,String.fromCharCode(code),x+7,y+4,pixel[0]+pixel[1]+pixel[2]<450,'center');});
      const selectedButton=buttons[selected];if(selectedButton){b.strokeStyle='#f8f8d0';b.lineWidth=1;b.strokeRect(selectedButton.x,selectedButton.y,selectedButton.w,selectedButton.h);}
    }
    input.oninput=()=>{value=[...input.value.normalize('NFC')].filter(c=>allowed.has(c)).slice(0,10).join('');input.value=value;draw();};
    input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();finish();}else if(e.key==='Escape'){e.preventDefault();buttons[selected]?.element.focus();}};
    dialog.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const key=e.key.toLowerCase(),directions={arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]};
      if(directions[key]){e.preventDefault();e.stopImmediatePropagation();selected=NativeUI.nextButton(buttons,selected,...directions[key]);buttons[selected]?.element.focus();}
      else if(['a','z','enter',' '].includes(key)){e.preventDefault();e.stopImmediatePropagation();buttons[selected]?.action();}
      else if(['b','backspace','escape'].includes(key)){e.preventDefault();e.stopImmediatePropagation();change('delete');}
      else if(key==='start'||key==='f2'){e.preventDefault();selected=buttons.findIndex(button=>button.label==='confirm'||button.label==='OK');buttons[selected]?.element.focus();}
      else if(key==='select'||key==='tab'){e.preventDefault();switchPage(page>=3?0:page+1);}
    });
    dialog.addEventListener('cancel',e=>{e.preventDefault();change('delete');});
    document.body.append(dialog);dialog.showModal();resetInput();renderButtons();
    const animate=()=>{draw();request=requestAnimationFrame(animate);};request=requestAnimationFrame(animate);
    try{return await done;}finally{cancelAnimationFrame(request);dialog.close();dialog.remove();resetInput();}
  }
  const api={edit,open};root.NativeNaming=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
