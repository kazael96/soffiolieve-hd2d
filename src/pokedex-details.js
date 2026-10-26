/* Original Info viewport in browser mode: overlay206 translates all layers by -24. */
(function(root){
  const cache=new Map();
  function image(src){if(!cache.has(src))cache.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Risorsa Pokédex non disponibile: '+src));i.src=NativeTextLayout.resource(src);}));return cache.get(src);}
  async function open(initial,{caught=true,mode:initialMode='info'}={}){
    const a=DEX_BROWSER_ASSETS,screen=new NativeUI.Screen();screen.dialog.id='pokedexEntry';await screen.ready();
    const common=await Promise.all(a.groups.detailCommon.cells.map(c=>image(c.src))),tabs=await Promise.all(a.groups.detailNavigation.cells.map(c=>image(c.src)));
    const background=await image(a.detail.info.reuseImage),font=screen.font,map=await image(a.detail.habitat.mapSrc);
    const modes=DEX_MODES_ASSETS,modeImages={},modeGroups={};await Promise.all(Object.entries(modes.images).map(async([key,record])=>modeImages[key]=await image(record.src)));await Promise.all(Object.entries(modes.groups).map(async([key,group])=>modeGroups[key]=await Promise.all(group.cells.map(cell=>image(cell.src)))));
    const habitatMasks={};await Promise.all(Object.entries(DEX_EFFECTS_ASSETS.habitat.cells).map(async([key,record])=>habitatMasks[key]=await image(record.src)));const habitatStart=performance.now();
    const shortcut=await NativeShortcuts.checkbox(()=>'pokedex:'+mode,184,172,()=>{});
    const waveform=new NativeCryGraph.Scroll();let waveTick=performance.now(),waveRemainder=0,cryRequest=0;
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
      render();if(mode==='verso')void replayCry();else void root.AudioEngine?.cry(data.id);
    }
    async function replayCry(){const token=++cryRequest,id=data.id;try{const source=await root.AudioEngine?.cryData(id);if(closed||mode!=='verso'||token!==cryRequest||id!==data.id)return;if(source){waveform.play(NativeCryGraph.columns(source.samples,source.sampleRate,source.speed,source.volume));waveTick=performance.now();waveRemainder=0;}void root.AudioEngine?.cry(id);}catch(error){console.error('Verso non disponibile',error);}}
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
      Object.entries(a.detail.tabs).forEach(([key,tab])=>buttons.push({label:{info:'Info',zona:'Zona',verso:'Verso',forme:'Forme'}[key],x:tab.x,y:tab.y,w:tab.width,h:24,action:()=>{mode=key;render();if(key==='verso')void replayCry();}}));
      Object.entries(a.detail.commonButtons).forEach(([key,b])=>buttons.push({label:{close:'Chiudi Pokédex',back:'Torna alla lista',previous:'Pokémon precedente',next:'Pokémon successivo'}[key],x:b.x,y:b.y,w:b.width,h:24,action:key==='previous'?()=>adjacent(-1):key==='next'?()=>adjacent(1):()=>close(key==='close'?'close':'back'),disabled:key==='previous'?known.indexOf(name)<=0:key==='next'?known.indexOf(name)>=known.length-1:false}));
      if(mode==='verso'){buttons.push({label:'Riproduci verso',x:8,y:16,w:248,h:120,action:()=>void replayCry()});buttons.push({label:'Ripeti verso',x:8,y:140,w:80,h:24,action:()=>void replayCry()});}
      screen.show(name,c=>{
        if(mode==='info')info(c);
        else if(mode==='zona'){
          c.drawImage(map,0,0);const habitat=DEX_EFFECTS_ASSETS.habitat,distribution=habitat.species[data.id].seasons[0],pulse=habitat.alphaPulse,tick=Math.floor((performance.now()-habitatStart)*60/1000);
          if(distribution.noArea){c.fillStyle='#071e23';c.fillRect(32,64,192,32);text(c,'Zona ignota',128,72,true,'center');}
          c.save();c.globalAlpha=(tick===0?pulse.initialAlpha:pulse.alphaSamplesPhaseZero[(32+tick)%64])/16;for(const entry of distribution.areas){const area=habitat.areas[entry.row],cell=habitat.cells[area.cell];c.drawImage(habitatMasks[area.cell],area.anchor[0]+cell.origin[0],area.anchor[1]+cell.origin[1]);}c.restore();
        }else if(mode==='verso'){
          c.drawImage(modeImages.cryLowerCommon,0,0);c.drawImage(modeImages.cryBackground,0,0);
          c.save();c.beginPath();c.rect(8,16,248,120);c.clip();waveform.draw(c);c.restore();
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
      },topLabel:'Pokédex '+mode,key:key=>{if(key==='y'){register();return true;}if(['arrowup','arrowdown'].includes(key)){adjacent(key==='arrowup'?-1:1);return true;}if(mode==='verso'&&['f2','start'].includes(key)){void replayCry();return true;}return false;}});
    }
    try{await select(name);const animate=now=>{if(closed)return;const elapsed=Math.max(0,now-waveTick);waveTick=now;if(mode==='verso'){waveRemainder+=elapsed*60/1000;const frames=Math.floor(waveRemainder);waveRemainder-=frames;waveform.advance(frames);}screen.draw();request=requestAnimationFrame(animate);};request=requestAnimationFrame(animate);return await finished;}
    finally{closed=true;cancelAnimationFrame(request);if(screen.dialog.isConnected){screen.close();screen.dialog.remove();}}
  }
  root.NativePokedexDetails={open};
})(typeof window!=='undefined'?window:globalThis);
