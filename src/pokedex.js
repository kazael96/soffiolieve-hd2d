/* Original one-screen registration layout, backed by the player's seen/caught record. */
(() => {
  const images=new Map();
  const image=src=>{if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Risorsa Pokédex non disponibile: '+src));i.src=NativeTextLayout.resource(src);}));return images.get(src);};
  function text(ctx,atlas,value,x,y,white=false,align='left',font=POKEDEX_ASSETS.font){
    const f=font,glyphs=[...value].map(c=>f.glyphs[c]||f.glyphs['?']),width=glyphs.reduce((n,g)=>n+g[3],0);
    if(align==='center')x-=Math.floor(width/2);else if(align==='right')x-=width;
    for(const [sx,sy,left,advance] of glyphs){const w=f.cellWidth||12,h=f.height||15;ctx.drawImage(atlas,sx,sy+(f.sourceOffset||0)+(white?f.variantOffset:0),w,h,x+left,y,w,h);x+=advance;}
  }
  async function entry(name,{caught=true,registration=false}={}){
    if(!registration&&window.NativePokedexDetails)return NativePokedexDetails.open(name,{caught});
    const data=POKEDEX_ASSETS.species[name];if(!data)throw Error('Specie fuori dal Pokédex della demo: '+name);
    const [background,font,foot,mark,...types]=await Promise.all(['entry','font',`foot-${data.id}`,'caught',...data.types.map(t=>'type-'+t)].map(n=>image('assets/pokedex/'+n+'.png?v='+POKEDEX_ASSETS.revision)));
    const sprite=await image(`assets/pokemon/${data.id}-front.png`),animated=window.ROM_SPRITE_ANIM?.load(data.id+'-front');if(animated)await animated.promise;
    const dialog=document.createElement('dialog');dialog.id='pokedexEntry';dialog.className='native-screen';dialog.setAttribute('aria-label',registration?'Registrazione Pokédex':'Pokédex');
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;canvas.setAttribute('role','img');
    const record=caught?data:POKEDEX_ASSETS.unknown;
    canvas.setAttribute('aria-label',`${String(data.number).padStart(3,'0')} ${name}. ${record.category}. Altezza ${record.height}. Peso ${record.weight}. ${record.description.replaceAll('\\n',' ')}`);
    const button=document.createElement('button');button.textContent='Continua';button.className='native-hit';button.setAttribute('aria-label','Continua');Object.assign(button.style,{inset:'0',width:'100%',height:'100%'});const stage=document.createElement('div');stage.className='native-stage';stage.append(canvas,button);dialog.append(stage);document.body.append(dialog);dialog.showModal();button.focus();
    let request=0;const start=performance.now(),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    function draw(now){
      ctx.clearRect(0,0,256,192);ctx.drawImage(background,0,0);
      if(registration)text(ctx,font,POKEDEX_ASSETS.labels.registration,128,5,true,'center');
      else text(ctx,font,'Pokédex',128,5,true,'center');
      text(ctx,font,String(data.number).padStart(3,'0'),136,37);text(ctx,font,name,176,37);text(ctx,font,record.category,188,54,false,'center');
      text(ctx,font,POKEDEX_ASSETS.labels.height,144,100);text(ctx,font,POKEDEX_ASSETS.labels.weight,144,116);text(ctx,font,record.height,245,100,false,'right');text(ctx,font,record.weight,246,116,false,'right');
      record.description.split('\\n').forEach((line,i)=>text(ctx,font,line,18,141+i*15,true));
      if(caught){ctx.drawImage(mark,96,32);ctx.drawImage(foot,112,80);types.forEach((im,i)=>ctx.drawImage(im,152+i*40,76));}
      const h=animated?.ready?animated.bounds[3]-animated.bounds[1]:sprite.height;
      if(!window.ROM_SPRITE_ANIM?.draw(ctx,data.id,false,50,72+h/2,h/80,(now-start)*.06))ctx.drawImage(sprite,50-sprite.width/2,72-sprite.height/2);
      request=requestAnimationFrame(draw);
    }
    request=requestAnimationFrame(draw);void window.AudioEngine?.cry(data.id);
    try{await new Promise(resolve=>{button.onclick=resolve;dialog.addEventListener('cancel',e=>{e.preventDefault();resolve();});});}
    finally{cancelAnimationFrame(request);dialog.close();dialog.remove();resetInput();}
  }
  async function browse(){
    if(battling||window.NativeStory?.locked||!NativeStory.state.pokedex)return;
    $('journal').close();resetInput();
    if(window.NativePokedexBrowser)return NativePokedexBrowser.open();
    const state=Journey.state,dialog=document.createElement('dialog');dialog.id='pokedexList';dialog.setAttribute('aria-label','Pokédex');
    const title=document.createElement('h2');title.textContent='Pokédex';const total=document.createElement('p');total.textContent=`Visti: ${state.dex.seen.length} · Catturati: ${state.dex.caught.length}`;dialog.append(title,total);
    const list=document.createElement('div');list.className='pokedex-species';dialog.append(list);
    for(const [name,data] of Object.entries(POKEDEX_ASSETS.species).sort((a,b)=>a[1].number-b[1].number)){
      if(!state.dex.seen.includes(name))continue;
      const b=document.createElement('button');b.textContent=`${String(data.number).padStart(3,'0')} ${name}${state.dex.caught.includes(name)?' ●':''}`;
      b.onclick=async()=>{b.disabled=true;try{await entry(name,{caught:state.dex.caught.includes(name)});}catch(e){console.error(e);toast('Impossibile aprire questa scheda. Riprova.');}finally{b.disabled=false;b.focus();}};list.append(b);
    }
    const close=document.createElement('button');close.textContent='Chiudi';close.onclick=()=>dialog.close();dialog.append(close);dialog.addEventListener('close',()=>{dialog.remove();resetInput();});document.body.append(dialog);dialog.showModal();close.focus();await new Promise(resolve=>dialog.addEventListener('close',resolve,{once:true}));
  }
  window.NativeText={draw:text,load:()=>image('assets/pokedex/font.png?v='+POKEDEX_ASSETS.revision)};
  window.Pokedex={entry,browse};
})();
