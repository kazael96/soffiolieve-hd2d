/* Preserve the story's input/typewriter state while drawing original field windows. */
(async()=>{
 const dialog=document.getElementById('dialogue'),message=document.getElementById('dialogueText'),choices=document.getElementById('starterChoices'),advance=document.getElementById('dialogueContinue');
 const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=NativeTextLayout.resource(src);});
 try{
  const [frame,font,arrow,normal,selected,popupFont]=await Promise.all([image(COMMON_DIALOGUE_ASSETS.images.fieldDialogue.src),NativeText.load(),image(COMMON_DIALOGUE_ASSETS.images.advanceArrow.src),image(PARTY_POPUP_ASSETS.images.buttonNormal.src),image(PARTY_POPUP_ASSETS.images.buttonSelected.src),image(PARTY_POPUP_ASSETS.font.src)]);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=48;canvas.className='native-field-window';canvas.setAttribute('role','img');dialog.prepend(canvas);const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;
  const labels=new WeakMap();let pending=false;
  // Preserve the native corner pixels when a shop label needs a wider panel.
  function panel(c,image,w,h){const xs=[0,8,96,104],ys=[0,6,18,24],dx=[0,8,w-8,w],dy=[0,6,h-6,h];for(let y=0;y<3;y++)for(let x=0;x<3;x++)c.drawImage(image,xs[x],ys[y],xs[x+1]-xs[x],ys[y+1]-ys[y],dx[x],dy[y],dx[x+1]-dx[x],dy[y+1]-dy[y]);}
  function draw(){
   pending=false;context.clearRect(0,0,256,48);context.drawImage(frame,0,0);const text=message.textContent||'';
   NativeTextLayout.wrap(text,POKEDEX_ASSETS.font,240).slice(-2).forEach((line,i)=>NativeText.draw(context,font,line,8,8+i*16));canvas.setAttribute('aria-label',text);
   if(!advance.hidden)context.drawImage(arrow,240,32);
   const buttons=[...choices.querySelectorAll('button')],plan=NativeTextLayout.fieldChoices(buttons.map(button=>labels.get(button)?.label??button.textContent),PARTY_POPUP_ASSETS.font),scale=dialog.getBoundingClientRect().width/256;
   choices.style.width=plan.width*scale+'px';choices.style.maxHeight=Math.max(24,dialog.getBoundingClientRect().top-12)+'px';
   for(const [index,button]of buttons.entries()){
    let record=labels.get(button);if(!record){const label=button.textContent;const bitmap=document.createElement('canvas');bitmap.width=104;bitmap.height=24;bitmap.setAttribute('aria-hidden','true');button.setAttribute('aria-label',label);button.append(bitmap);record={label,bitmap};labels.set(button,record);}
    const row=plan.rows[index];record.bitmap.width=plan.width;record.bitmap.height=row.height;button.style.height=row.height*scale+'px';const c=record.bitmap.getContext('2d');c.imageSmoothingEnabled=false;panel(c,button===document.activeElement?selected:normal,plan.width,row.height);for(const [line,text]of row.lines.entries())NativeText.draw(c,popupFont,text,10,6+line*16,false,'left',PARTY_POPUP_ASSETS.font);
   }
   if(buttons.includes(document.activeElement))document.activeElement.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  const queue=()=>{if(!pending){pending=true;requestAnimationFrame(draw);}};
  new MutationObserver(queue).observe(dialog,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','open']});dialog.addEventListener('focusin',queue);dialog.addEventListener('focusout',queue);
  addEventListener('resize',queue);new ResizeObserver(queue).observe(dialog);
  document.body.classList.add('native-field-ready');draw();
 }catch(error){console.error('Cornice originale dei messaggi non disponibile',error);}
})();
