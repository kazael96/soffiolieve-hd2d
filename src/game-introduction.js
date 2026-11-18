/* A new adventure precedes the bedroom. Legacy saves retain their identity. */
(function(root){
 'use strict';
 let running=null;
 const needed=()=>!root.SpeciesStudioMode&&!!root.Journey&&root.Journey.state.phase==='gift'&&root.Journey.state.introductionComplete===false;
 async function start(){
  if(!needed())return false;if(running)return running;
  running=show().then(value=>{running=null;if(value){root.Journey.save(true);void root.AudioEngine?.setScene(root.NativeStory?.music||'town');}return value;},error=>{running=null;throw error;});return running;
 }
 async function show(){
  void root.AudioEngine?.setScene(1009);
  const dialog=document.createElement('dialog');dialog.id='gameIntroduction';dialog.className='native-screen native-introduction';dialog.setAttribute('aria-label','Una nuova avventura');
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;canvas.setAttribute('role','img');
  const message=document.createElement('p');message.className='intro-accessible';message.setAttribute('aria-live','polite');
  const buttons=document.createElement('div');buttons.className='intro-choices';dialog.append(canvas,message,buttons);document.body.append(dialog);dialog.showModal();root.resetInput?.();
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  let font,frame,images={},parts,release=null,releaseToken=0,selected=0,step='loading',retry=null,draft={gender:'M',name:''},complete;
  const finished=new Promise(resolve=>{complete=resolve;});
  const put=(text,x,y,align='left')=>root.NativeText.draw(c,font,text,x,y,false,align,root.NAMING_ASSETS.font);
  function paint(text,portrait='aralia',releasePose=null){
   message.textContent=text;canvas.setAttribute('aria-label',text);c.clearRect(0,0,256,192);
   const gradient=c.createLinearGradient(0,0,0,140);gradient.addColorStop(0,'#e3f5f4');gradient.addColorStop(1,'#b8ddd1');c.fillStyle=gradient;c.fillRect(0,0,256,192);
   c.fillStyle='#f2faf6';c.beginPath();c.ellipse(128,125,80,12,0,0,Math.PI*2);c.fill();
   if(releasePose)root.IntroPokeball.draw(c,images,parts,releasePose);
   else if(portrait==='minccino'&&parts)root.IntroPokeball.draw(c,images,parts,root.IntroPokeball.pose(162));
   else{const image=images[portrait];if(image){const scale=Math.min(160/image.height,180/image.width);c.drawImage(image,128-image.width*scale/2,135-image.height*scale,image.width*scale,image.height*scale);}}
   if(frame)c.drawImage(frame,0,0,frame.width,frame.height,0,136,256,56);else{c.fillStyle='#fff';c.fillRect(2,136,252,54);}
   if(font)root.NativeTextLayout.wrap(text,root.NAMING_ASSETS.font,238).slice(0,2).forEach((line,i)=>put(line,9,145+16*i));
   else{c.fillStyle='#233239';c.font='11px sans-serif';c.fillText(text,9,157,238);}
  }
  function controls(options){
   buttons.replaceChildren();selected=0;
   for(const [label,action]of options){const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',label);
    if(font){const caption=document.createElement('canvas');caption.width=Math.max(96,Math.min(240,root.NativeTextLayout.width(label,root.NAMING_ASSETS.font)+16));caption.height=24;caption.style.width=caption.width*1.5+'px';caption.setAttribute('aria-hidden','true');root.NativeText.draw(caption.getContext('2d'),font,label,caption.width/2,6,false,'center',root.NAMING_ASSETS.font);button.append(caption);}else button.textContent=label;
    button.onclick=()=>{if(button.disabled)return;if(!root.AudioEngine?.enabled)void root.AudioEngine?.enable();root.resetInput?.();action();};button.onfocus=()=>{selected=[...buttons.children].indexOf(button);};buttons.append(button);}
   buttons.firstElementChild?.focus({preventScroll:true});
  }
  function narrate(ids,portrait,actions){
   const text=ids.map(id=>root.NativeTextLayout.format(root.PLAYER_ASSETS.texts.bank44[id],[draft.name])).join('\n');
   const lines=root.NativeTextLayout.wrap(text,root.NAMING_ASSETS.font,238);let offset=0;
   const next=()=>{paint(lines.slice(offset,offset+2).join('\n'),portrait);offset+=2;controls(offset<lines.length?[['Continua',next]]:actions);};next();
  }
  function page(next){
   release?.cancel();release=null;releaseToken++;
   step=next;dialog.dataset.step=step;
   if(step==='welcome')narrate([6],'aralia',[['Continua',()=>page('professor')]]);
   else if(step==='professor'){void root.AudioEngine?.preloadEvents([{kind:'sfx',id:1382},{kind:'sfx',id:1383}],{p2:572});narrate([7],'aralia',[['Continua',()=>void showPokemon()]]);}
   else if(step==='pokemon')narrate([8,9],'minccino',[['Continua',()=>page('gender')]]);
   else if(step==='gender')narrate([10,11],draft.gender==='F'?'Anita':'Alcide',[['Ragazzo',()=>choose('M')],['Ragazza',()=>choose('F')]]);
   else if(step==='genderConfirm')narrate([draft.gender==='F'?13:12],draft.gender==='F'?'Anita':'Alcide',[['SÌ',()=>void name()],['NO',()=>page('gender')]]);
   else if(step==='confirm')narrate([17],draft.gender==='F'?'Anita':'Alcide',[['SÌ',()=>page('friends')],['NO',()=>void name()]]);
   else if(step==='friends')narrate([21,22,23,24],'friends',[['Continua',()=>page('ready')]]);
   else if(step==='ready')narrate([25,26],draft.gender==='F'?'Anita':'Alcide',[["Comincia l'avventura",()=>void begin()]]);
  }
  async function showPokemon(){
   if(release||step==='pokemon-release')return;
   const token=++releaseToken;step='pokemon-release';dialog.dataset.step=step;controls([]);root.resetInput?.();
   const text='Aralia lancia una Poké Ball!';
   release=root.IntroPokeball.play({paint:p=>paint(text,'aralia',p),onFrame:p=>{dialog.dataset.releaseFrame=String(p.frame);dialog.dataset.releasePhase=p.phase;},sound:id=>void root.AudioEngine?.playSound(id),cry:()=>void root.AudioEngine?.cry(572)});
   try{const shown=await release.promise;if(token!==releaseToken||!dialog.isConnected)return;release=null;if(shown)page('pokemon');}
   catch(error){if(token===releaseToken){release=null;failed(error,()=>void showPokemon());}}
  }
  function choose(gender){draft={gender,name:''};page('genderConfirm');}
  async function name(){
   step='naming';dialog.dataset.step=step;controls([]);
   try{draft.name=await root.NativeNaming.open({name:draft.gender==='F'?'Anita':'Alcide'},{mode:'player',defaultName:draft.gender==='F'?'Anita':'Alcide',initialValue:draft.name,iconSrc:root.PlayerIdentity.introIcon(draft.gender),onOpen:()=>dialog.classList.add('intro-naming'),onClose:()=>dialog.classList.remove('intro-naming')});page('confirm');}
   catch(error){failed(error,()=>void name());}
  }
  function failed(error,operation){retry=operation;step='error';dialog.dataset.step=step;paint('Non è stato possibile caricare le risorse. Riprova.');controls([['Riprova',()=>{retry=null;operation();}]]);dialog.dataset.error=String(error);}
  async function load(){
   step='loading';dialog.dataset.step=step;paint('Un momento...');controls([]);
   try{
    const data=root.PLAYER_ASSETS;
    if(!data)throw Error('Risorse della presentazione mancanti');
    const loadImage=src=>root.RuntimeAssets.image(src);
    [font,frame]=await Promise.all([loadImage(root.NAMING_ASSETS.font.src),loadImage(root.COMMON_DIALOGUE_ASSETS.images.fieldDialogue.src)]);
    const entries=await Promise.all(Object.entries(data.intro).map(async([key,src])=>[key,await loadImage(typeof src==='string'?src:src.src)]));images=Object.fromEntries(entries);
    const balls=await Promise.all(root.IntroPokeball.assets.map(loadImage));images.balls={0:balls[0],9:balls[1],10:balls[2]};images.white=root.IntroPokeball.white(images.minccino);parts=root.IntroPokeball.sprites(images.aralia);page('welcome');
   }catch(error){failed(error,()=>void load());}
  }
  async function begin(){
   step='starting';dialog.dataset.step=step;paint('La tua avventura sta per cominciare!',draft.gender==='F'?'Anita':'Alcide');controls([]);
   try{
    const state=root.Journey.state;state.playerGender=draft.gender;state.playerName=draft.name;
    await renderer.pending;await renderer.requireActors([{name:'Alcide'}]);
    if(!renderer.ready||!renderer.hasResources(renderer.resourcePlan()))throw renderer.loadingError||Error('Personaggio non preparato');
    state.introductionComplete=true;dialog.close();complete(true);
   }catch(error){failed(error,()=>void begin());}
  }
  dialog.addEventListener('keydown',event=>{
   if(event.ctrlKey||event.metaKey||event.altKey)return;const key=event.key.toLowerCase();
   if(!['a','z','enter',' ','b','escape','arrowup','arrowdown','arrowleft','arrowright'].includes(key))return;
   event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;
   if(key==='b'||key==='escape'){if(step==='confirm')void name();else if(step==='genderConfirm')page('gender');else if(step==='gender')page('pokemon');return;}
   const rows=[...buttons.children];if(!rows.length)return;
   if(key.startsWith('arrow')){selected=(selected+(key==='arrowup'||key==='arrowleft'?-1:1)+rows.length)%rows.length;rows[selected].focus({preventScroll:true});}
   else rows[selected]?.click();
  });
  dialog.addEventListener('cancel',event=>event.preventDefault());
  void load();try{return await finished;}finally{releaseToken++;release?.cancel();dialog.remove();root.resetInput?.();}
 }
 root.GameIntroduction={start,get pending(){return needed()||!!running;}};
})(typeof window==='undefined'?globalThis:window);
