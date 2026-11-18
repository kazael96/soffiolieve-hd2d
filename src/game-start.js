/* Browser title and save selection. Native Italian logo/artwork, adapted HD-2D layout. */
(function(root){
 'use strict';
 const RESTART='soffiolieve-start-new-once';
 let running=null,active=false,completed=false,savingBlocked=false;
 function read(storage,slot=root.SaveSlots?.active||1){
  try{
   if(!storage)return {kind:'unavailable',hasData:false};
   const raw=storage.getItem(root.SaveSlots?root.SaveSlots.key(slot):root.StoryState.KEY);
   if(raw===null)return {kind:'empty',hasData:false,raw};
   let state;try{state=root.StoryState.normalize(JSON.parse(raw));}catch{}
   return state?{kind:'saved',hasData:true,raw,state}:{kind:'damaged',hasData:true,raw};
  }catch{return {kind:'unavailable',hasData:false};}
 }
 function storage(){try{return root.localStorage;}catch{return null;}}
 function summary(state){
  const seconds=Math.max(0,Math.floor(state.trainer?.playSeconds||0));
  const place=root.TOWNMAP_ASSETS?.places?.find(p=>p.zone===state.original?.zone)?.name;
  return {name:state.playerName,badges:(state.original?.badges||[]).length,
   caught:state.dex?.caught?.length||0,time:Math.floor(seconds/3600)+':'+String(Math.floor(seconds/60)%60).padStart(2,'0'),
   location:place||({bedroom:'Soffiolieve',home:'Soffiolieve',lab:'Soffiolieve'}[state.scene])||'Unima'};
 }
 function prepareRestart(){try{root.sessionStorage.setItem(RESTART,String(root.SaveSlots?.active||1));return true;}catch{return false;}}
 function consumeRestart(){try{const pending=root.sessionStorage.getItem(RESTART)===String(root.SaveSlots?.active||1);root.sessionStorage.removeItem(RESTART);return pending;}catch{return false;}}
 function clearRestart(){try{root.sessionStorage.removeItem(RESTART);}catch{}}
 async function start(){
  if(root.SpeciesStudioMode||completed)return false;if(running)return running;
  active=true;
  running=(async()=>{
   const saved=root.SaveSlots?.blocked?{kind:'unavailable',hasData:false}:read(storage());
   savingBlocked=saved.kind==='unavailable'||root.SaveSlots?.blocked===true;
   if(savingBlocked){const status=document.getElementById('saveStatus');if(status)status.textContent='Salvataggio non disponibile su questo browser';}
   if(consumeRestart()&&saved.kind==='empty'){active=false;completed=true;return root.GameIntroduction.start();}
   return show(saved,root.SaveSlots?.consumeMenu()===true);
  })();
  try{return await running;}finally{running=null;}
 }
 async function show(saved,skipTitle=false){
  const dialog=document.createElement('dialog');dialog.id='gameStart';dialog.className='native-screen native-start';dialog.setAttribute('aria-label','Pokémon Versione Nera');
  const screen=document.createElement('div');screen.className='start-screen';
  const art=document.createElement('div');art.className='start-art';
  let logo=document.createElement('img');logo.alt='Pokémon Versione Nera';logo.className='start-logo';
  let dragon=document.createElement('img');dragon.alt='Reshiram';dragon.className='start-dragon';
  art.append(logo,dragon);
  const credits=document.createElement('div');credits.className='start-copyright';
  let copyright=document.createElement('img');copyright.alt='Developed by GAME FREAK inc.';credits.append(copyright);
  const heading=document.createElement('h1');heading.className='intro-accessible';heading.textContent='Pokémon Versione Nera';
  const message=document.createElement('p');message.className='start-message';message.setAttribute('aria-live','polite');
  const buttons=document.createElement('div');buttons.className='start-choices';screen.append(heading,art,credits,message,buttons);dialog.append(screen);document.body.append(dialog);dialog.showModal();root.resetInput?.();
  let font,selected=0,step='loading',busy=false,resolve;
  const finished=new Promise(done=>{resolve=done;});
  function announce(value){
   value=String(value).replace(/[’‘]/g,"'");message.replaceChildren();message.dataset.text=value;
   if(!value)return;if(!font){message.textContent=value;return;}
   const readable=document.createElement('span');readable.className='intro-accessible';readable.textContent=value;
   const lines=root.NativeTextLayout.wrap(value,root.NAMING_ASSETS.font,236),canvas=document.createElement('canvas');canvas.width=256;canvas.height=lines.length*16+16;canvas.setAttribute('aria-hidden','true');
   const c=canvas.getContext('2d');c.fillStyle='#f8f8f0';c.fillRect(0,0,canvas.width,canvas.height);c.strokeStyle='#263b42';c.lineWidth=2;c.strokeRect(1,1,canvas.width-2,canvas.height-2);
   lines.forEach((line,i)=>root.NativeText.draw(c,font,line,10,8+i*16,false,'left',root.NAMING_ASSETS.font));message.append(readable,canvas);
  }
  function caption(button,text){
   button.setAttribute('aria-label',text);
   if(!font){button.textContent=text;return;}
   const lines=text.split('\n'),canvas=document.createElement('canvas');canvas.width=256;canvas.height=lines.length*18+12;
   const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
   lines.forEach((line,i)=>root.NativeText.draw(c,font,line,step==='title'?128:12,7+i*18,false,step==='title'?'center':'left',root.NAMING_ASSETS.font));
   canvas.setAttribute('aria-hidden','true');button.append(canvas);
  }
  function controls(options){
   buttons.replaceChildren();selected=0;
   for(const [label,action]of options){
    const button=document.createElement('button');button.type='button';caption(button,label);
    button.onclick=()=>{if(busy||button.disabled)return;root.resetInput?.();action();};
    button.onfocus=()=>{selected=[...buttons.children].indexOf(button);};buttons.append(button);
   }
   buttons.firstElementChild?.focus({preventScroll:true});
  }
  function page(value){step=value;dialog.dataset.step=value;dialog.classList.toggle('start-title',value==='title');dialog.classList.toggle('start-slots',value==='slots');announce('');}
  function title(){page('title');controls([['PREMI START',menu]]);}
  function menu(){
   page('menu');const options=[];
   if(saved.kind==='saved'){
    const s=summary(saved.state);
    options.push([`CONTINUA\n${s.name}       ${s.time}\nMedaglie: ${s.badges}   Pokédex: ${s.caught}`,resume]);
   }
   options.push(['NUOVO GIOCO',newGame]);
   if(root.SaveSlots)options.push(['SALVATAGGI - SLOT '+root.SaveSlots.active+'/3',slots]);
   if(saved.kind==='damaged')announce('Il salvataggio non può essere letto. Non è stato cancellato.');
   if(saved.kind==='unavailable')announce('Il browser non rende disponibile il salvataggio. Puoi giocare, ma questa sessione non verrà salvata.');
   controls(options);
  }
  function slots(){
   page('slots');announce('Scegli il salvataggio.');
   const options=[1,2,3].map(slot=>{
    const data=read(storage(),slot),s=data.state&&summary(data.state);
    const label='SLOT '+slot+(slot===root.SaveSlots.active?' - ATTUALE':'')+'\n'+(s?s.name+'   '+s.time:data.kind==='empty'?'Nuovo gioco':data.kind==='damaged'?'Dati non leggibili':'Non disponibile');
    return [label,()=>chooseSlot(slot)];
   });controls([...options,['INDIETRO',menu]]);
  }
  function chooseSlot(slot){
   if(slot===root.SaveSlots.active)return menu();
   if(!root.SaveSlots.select(slot)){page('error');announce('Impossibile cambiare slot. I salvataggi sono conservati.');controls([['INDIETRO',slots]]);return;}
   busy=true;page('starting');announce('Apertura dello slot '+slot+'...');controls([]);root.location.reload();
  }
  function newGame(){
   if(!saved.hasData)return enter();
   page('confirm-new');announce('Vuoi iniziare una nuova partita? Verrà cancellato soltanto lo slot '+(root.SaveSlots?.active||1)+'. L’operazione non può essere annullata.');
   controls([['NO',menu],['SÌ, NUOVO GIOCO',restart]]);
  }
  function restart(){
   if(changed())return;
   busy=true;
   if(!prepareRestart()){busy=false;page('error');announce('Impossibile preparare la nuova partita. Il salvataggio precedente è conservato.');controls([['INDIETRO',menu]]);return;}
   if(!root.Journey.restart()){clearRestart();busy=false;page('error');announce('Il salvataggio non può essere cancellato. Puoi tornare indietro e continuare la partita.');controls([['INDIETRO',menu]]);}
  }
  function resume(){
   if(changed())return;
   void enter();
  }
  function changed(){
   const current=read(storage());if(current.raw===saved.raw&&current.kind===saved.kind)return false;
   page('error');announce('Il salvataggio è cambiato. Ricarica per riprendere i progressi più recenti.');controls([['RICARICA',()=>root.location.reload()]]);return true;
  }
  async function prepareField(){
   const attach=()=>{const loading=document.getElementById('loading');if(loading&&loading.parentNode!==dialog)dialog.append(loading);};
   // The existing bounded resource recovery must remain reachable in the
   // modal top layer, including its manual control after automatic retries.
   const observer=new MutationObserver(attach);observer.observe(document.body,{subtree:true,childList:true});attach();
   try{
    for(let attempt=0;attempt<3;attempt++){
     const scene=renderer.scene;
     try{return await renderer.prepareScene();}catch(error){if(scene===renderer.scene||attempt===2)throw error;}
    }
   }finally{observer.disconnect();const loading=document.getElementById('loading');if(loading?.parentNode===dialog)document.body.append(loading);}
  }
  async function enter(){
   if(busy||changed())return;busy=true;page('starting');controls([]);
   // Keep the boot lock until the introduction has synchronously claimed it.
   try{
    if(!root.AudioEngine?.enabled)void root.AudioEngine?.enable();
    if(!root.GameIntroduction.pending){announce('Caricamento della partita...');await prepareField();if(changed()){busy=false;return;}}
    const intro=root.GameIntroduction.start();active=false;completed=true;dialog.close();root.resetInput?.();
    const value=await intro;dialog.remove();
    if(!value)void root.AudioEngine?.setScene(root.NativeStory?.music||'town');
    resolve(true);
   }catch(error){busy=false;active=true;completed=false;if(!dialog.isConnected)document.body.append(dialog);dialog.showModal();page('error');announce('Non è stato possibile avviare la partita. Riprova.');controls([['RIPROVA',()=>void enter()]]);}
  }
  async function load(){
   page('loading');announce('Caricamento...');controls([]);
   try{
    const loaded=await Promise.all(['assets/finale/credits/title.png','assets/pokemon/643-front.png',root.NAMING_ASSETS.font.src,'assets/finale/credits/copyright.png'].map(src=>root.RuntimeAssets.image(src)));
    // Reuse the decoded nodes, including images whose packed blob URL was
    // revoked after decoding. Copying .src would issue a broken second request.
    loaded[0].alt=logo.alt;loaded[0].className=logo.className;logo.replaceWith(loaded[0]);logo=loaded[0];
    loaded[1].alt=dragon.alt;loaded[1].className=dragon.className;dragon.replaceWith(loaded[1]);dragon=loaded[1];
    loaded[3].alt=copyright.alt;copyright.replaceWith(loaded[3]);copyright=loaded[3];font=loaded[2];if(skipTitle)menu();else title();
   }catch(error){page('error');announce('Non è stato possibile caricare il titolo. Il salvataggio è conservato.');controls([['RIPROVA',()=>void load()]]);}
  }
  dialog.addEventListener('cancel',event=>event.preventDefault());
  dialog.addEventListener('keydown',event=>{
   if(event.ctrlKey||event.metaKey||event.altKey)return;const key=event.key.toLowerCase();
   if(!['a','z','enter',' ','b','escape','arrowup','arrowdown','arrowleft','arrowright'].includes(key))return;
   event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;
   if(busy){if(step==='starting'&&['a','z','enter',' '].includes(key))dialog.querySelector('#loading button:not([disabled])')?.click();return;}
   if(key==='b'||key==='escape'){if(step==='confirm-new'||step==='slots')menu();else if(step==='menu')title();return;}
   const rows=[...buttons.children];if(!rows.length)return;
   if(key.startsWith('arrow')){selected=(selected+(['arrowup','arrowleft'].includes(key)?-1:1)+rows.length)%rows.length;rows[selected].focus({preventScroll:true});}
   else rows[selected]?.click();
  });
  void load();return finished;
 }
 root.GameStart={start,read,summary,prepareRestart,consumeRestart,get pending(){return active;},get savingBlocked(){return savingBlocked;}};
})(typeof window==='undefined'?globalThis:window);
