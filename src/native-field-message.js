/* Preserve the story's input/typewriter state while drawing original field windows. */
(async()=>{
 const dialog=document.getElementById('dialogue'),message=document.getElementById('dialogueText'),choices=document.getElementById('starterChoices'),advance=document.getElementById('dialogueContinue');
 const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=NativeTextLayout.resource(src);});
 try{
  const [frame,font,arrow,normal,selected,popupFont]=await Promise.all([image(COMMON_DIALOGUE_ASSETS.images.fieldDialogue.src),NativeText.load(),image(COMMON_DIALOGUE_ASSETS.images.advanceArrow.src),image(PARTY_POPUP_ASSETS.images.buttonNormal.src),image(PARTY_POPUP_ASSETS.images.buttonSelected.src),image(PARTY_POPUP_ASSETS.font.src)]);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=48;canvas.className='native-field-window';canvas.setAttribute('role','img');dialog.prepend(canvas);const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;
  const labels=new WeakMap();let pending=false;
  function draw(){
   pending=false;context.clearRect(0,0,256,48);context.drawImage(frame,0,0);const text=message.textContent||'';
   NativeTextLayout.wrap(text,POKEDEX_ASSETS.font,240).slice(-2).forEach((line,i)=>NativeText.draw(context,font,line,8,8+i*16));canvas.setAttribute('aria-label',text);
   if(!advance.hidden)context.drawImage(arrow,240,32);
   for(const button of choices.querySelectorAll('button')){
    let record=labels.get(button);if(!record){const label=button.textContent;const bitmap=document.createElement('canvas');bitmap.width=104;bitmap.height=24;bitmap.setAttribute('aria-hidden','true');button.setAttribute('aria-label',label);button.append(bitmap);record={label,bitmap};labels.set(button,record);}
    const c=record.bitmap.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,104,24);c.drawImage(button===document.activeElement?selected:normal,0,0);NativeText.draw(c,popupFont,record.label,10,6,false,'left',PARTY_POPUP_ASSETS.font);
   }
  }
  const queue=()=>{if(!pending){pending=true;requestAnimationFrame(draw);}};
  new MutationObserver(queue).observe(dialog,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','open']});dialog.addEventListener('focusin',queue);dialog.addEventListener('focusout',queue);
  document.body.classList.add('native-field-ready');draw();
 }catch(error){console.error('Cornice originale dei messaggi non disponibile',error);}
})();
