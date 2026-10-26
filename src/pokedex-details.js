/* Original Info viewport in browser mode: overlay206 translates all layers by -24. */
(function(root){
  const cache=new Map();
  function image(src){if(!cache.has(src))cache.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Risorsa Pokédex non disponibile: '+src));i.src=NativeTextLayout.resource(src);}));return cache.get(src);}
  async function open(initial,{caught=true,mode:initialMode='info'}={}){
    const a=DEX_BROWSER_ASSETS,screen=new NativeUI.Screen();screen.dialog.id='pokedexEntry';await screen.ready();
    const common=await Promise.all(a.groups.detailCommon.cells.map(c=>image(c.src))),tabs=await Promise.all(a.groups.detailNavigation.cells.map(c=>image(c.src)));
    const background=await image(a.detail.info.reuseImage),font=screen.font,map=await image(a.detail.habitat.mapSrc);
    const modes=DEX_MODES_ASSETS,modeImages={},modeGroups={};await Promise.all(Object.entries(modes.images).map(async([key,record])=>modeImages[key]=await image(record.src)));await Promise.all(Object.entries(modes.groups).map(async([key,group])=>modeGroups[key]=await Promise.all(group.cells.map(cell=>image(cell.src)))));
    const shortcut=await NativeShortcuts.checkbox(()=>'pokedex:'+mode,184,172,()=>{});
    const waveform=new Float32Array(248),audio=new Float32Array(256);let waveTick=performance.now();
    let name=initial,data,record,sprite,foot,mark,types=[],mode=initialMode,request=0,closed=false,generation=0;
    const known=Object.keys(POKEDEX_ASSETS.species).filter(n=>Journey.state.dex.seen.includes(n)).sort((x,y)=>POKEDEX_ASSETS.species[x].number-POKEDEX_ASSETS.species[y].number);
    let done;const finished=new Promise(resolve=>done=resolve);
    const close=(result='back')=>{closed=true;generation++;cancelAnimationFrame(request);screen.close();screen.dialog.remove();done(result);};
    const text=(c,value,x,y,white=false,align='left')=>NativeText.draw(c,font,String(value),x,y,white,align);
    const nativeCell=(c,group,loaded,index,x,y)=>{const cell=group.cells[index];c.drawImage(loaded[index],x+cell.origin[0],y+cell.origin[1]);};
    async function select(next){
      const revision=++generation;name=next;data=POKEDEX_ASSETS.species[name];caught=Journey.state.dex.caught.includes(name);record=caught?data:POKEDEX_ASSETS.unknown;
      const loaded=await Promise.all([image('assets/pokemon/'+data.id+'-front.png'),image('assets/pokedex/foot-'+data.id+'.png'),image('assets/pokedex/caught.png'),...data.types.map(t=>image('assets/pokedex/type-'+t+'.png'))]);
      if(closed||revision!==generation)return;
      [sprite,foot,mark,...types]=loaded;
      const animated=root.ROM_SPRITE_ANIM?.load(data.id+'-front');if(animated)void animated.promise.then(()=>{if(!closed)screen.draw();});
      render();void root.AudioEngine?.cry(data.id);
    }
    function adjacent(delta){const at=known.indexOf(name),next=known[at+delta];if(next)void select(next);}
    function portrait(c,x,y){const now=performance.now();if(!root.ROM_SPRITE_ANIM?.draw(c,data.id,false,x,y+sprite.height/2,sprite.height/80,now*.06))c.drawImage(sprite,x-sprite.width/2,y-sprite.height/2);}
    function info(c){
      c.save();c.translate(0,a.detail.info.mainBottomOffsetY);c.drawImage(background,0,0);
      text(c,String(data.number).padStart(3,'0'),136,37);text(c,name,176,37);text(c,record.category,188,54,false,'center');
      text(c,POKEDEX_ASSETS.labels.height,144,100);text(c,POKEDEX_ASSETS.labels.weight,144,116);text(c,record.height,245,100,false,'right');text(c,record.weight,246,116,false,'right');
      record.description.split('\\n').forEach((line,i)=>text(c,line,18,141+i*15,true));
      if(caught){c.drawImage(mark,96,32);c.drawImage(foot,112,80);types.forEach((im,i)=>c.drawImage(im,152+40*i,76));}portrait(c,50,72);c.restore();
    }
    function render(){
      const buttons=[];const register=()=>{NativeUI.register('pokedex:'+mode);render();};buttons.push({...shortcut.button,action:register});
      Object.entries(a.detail.tabs).forEach(([key,tab])=>buttons.push({label:{info:'Info',zona:'Zona',verso:'Verso',forme:'Forme'}[key],x:tab.x,y:tab.y,w:tab.width,h:24,action:()=>{mode=key;render();if(key==='verso')void root.AudioEngine?.cry(data.id);}}));
      Object.entries(a.detail.commonButtons).forEach(([key,b])=>buttons.push({label:{close:'Chiudi Pokédex',back:'Torna alla lista',previous:'Pokémon precedente',next:'Pokémon successivo'}[key],x:b.x,y:b.y,w:b.width,h:24,action:key==='previous'?()=>adjacent(-1):key==='next'?()=>adjacent(1):()=>close(key==='close'?'close':'back'),disabled:key==='previous'?known.indexOf(name)<=0:key==='next'?known.indexOf(name)>=known.length-1:false}));
      if(mode==='verso'){buttons.push({label:'Riproduci verso',x:8,y:16,w:248,h:120,action:()=>void root.AudioEngine?.cry(data.id)});buttons.push({label:'Ripeti verso',x:8,y:140,w:80,h:24,action:()=>void root.AudioEngine?.cry(data.id)});}
      screen.show(name,c=>{
        if(mode==='info')info(c);
        else if(mode==='zona'){
          c.drawImage(map,0,0);const habitat=a.detail.habitat,species=habitat.species[data.id],areas=species.areaMembers;
          c.fillStyle='#071e23';c.fillRect(0,0,256,20);text(c,name,8,2,true);
          if(!areas.length){c.fillStyle='#071e23';c.fillRect(32,64,192,32);text(c,'Zona ignota',128,72,true,'center');}
          c.fillStyle='#f8a048';for(const id of areas){const area=habitat.areas[id];c.fillRect(area.x-3,area.y-3,7,7);}
        }else if(mode==='verso'){
          c.drawImage(modeImages.cryLowerCommon,0,0);c.drawImage(modeImages.cryBackground,0,0);
          c.save();c.beginPath();c.rect(8,16,248,120);c.clip();c.strokeStyle='#fff';c.lineWidth=1;c.beginPath();waveform.forEach((v,i)=>{const y=71-Math.max(-1,Math.min(1,v))*48;if(i===0)c.moveTo(8+i,y);else c.lineTo(8+i,y);});c.stroke();c.restore();
          nativeCell(c,a.groups.detailNavigation,tabs,a.detail.cryControls.play.normal,8,142);
        }else{
          c.drawImage(modeImages.formsLowerCommon,0,0);portrait(c,64,72);text(c,name,64,8,false,'center');
        }
        c.fillStyle='#242829';c.fillRect(0,168,256,24);
        Object.entries(a.detail.tabs).forEach(([key,b])=>nativeCell(c,a.groups.detailNavigation,tabs,b[key===mode?'highlighted':'normal'],b.x,b.y));
        shortcut.draw(c);
        Object.values(a.detail.commonButtons).forEach(b=>nativeCell(c,a.groups.detailCommon,common,b.normal,b.x,b.y));
      },buttons,()=>close('back'),{drawFocus:false,exit:()=>close('close'),top:c=>{
        const index=['info','zona','verso','forme'].indexOf(mode),base=mode==='info'?'infoUpperCommon':mode==='zona'?'habitatUpperCommon':mode==='verso'?'cryUpperCommon':'formsUpperCommon';c.drawImage(modeImages[base],0,0);
        if(mode==='verso'){nativeCell(c,modes.groups.cryPanel,modeGroups.cryPanel,0,128,96);text(c,name,128,40,false,'center');}
        if(mode==='forme'){c.drawImage(modeImages.formsUpperBackground,0,0);portrait(c,128,64);text(c,modes.labels['234'][184],24,152,true);text(c,'1',216,152,true);}
        c.drawImage(modeImages[modes.header.modeImage[index]],0,0);text(c,modes.labels['234'][178+index],24,5,true);
      },topLabel:'Pokédex '+mode,key:key=>{if(key==='y'){register();return true;}if(['arrowup','arrowdown'].includes(key)){adjacent(key==='arrowup'?-1:1);return true;}if(mode==='verso'&&['f2','start'].includes(key)){void root.AudioEngine?.cry(data.id);return true;}return false;}});
    }
    try{await select(name);const animate=now=>{if(closed)return;if(mode==='verso'&&now-waveTick>=1000/60){waveTick=now;root.AudioEngine?.cryWaveform(audio);waveform.copyWithin(0,2);waveform[246]=audio[64];waveform[247]=audio[192];}screen.draw();request=requestAnimationFrame(animate);};request=requestAnimationFrame(animate);return await finished;}
    finally{closed=true;cancelAnimationFrame(request);if(screen.dialog.isConnected){screen.close();screen.dialog.remove();}}
  }
  root.NativePokedexDetails={open};
})(typeof window!=='undefined'?window:globalThis);
