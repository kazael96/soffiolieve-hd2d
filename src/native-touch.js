/* Physical DS controls remain usable when a modal makes the underlying page inert. */
(()=>{
 const touch=document.getElementById('touch'),home=touch.parentNode,anchor=document.createComment('field controls');home.insertBefore(anchor,touch);
 const fieldLabels=new Map([...touch.querySelectorAll('button')].map(button=>[button,button.getAttribute('aria-label')]));
 const active=()=>[...document.querySelectorAll('dialog[open]')].at(-1);
 function sync(){const dialog=active(),parent=dialog||home;if(touch.parentNode!==parent){if(parent===home)home.insertBefore(touch,anchor.nextSibling);else parent.append(touch);}for(const node of document.querySelectorAll('dialog.native-touch-controls'))if(node!==dialog)node.classList.remove('native-touch-controls');dialog?.classList.toggle('native-touch-controls',getComputedStyle(touch).display!=='none');for(const [button,label]of fieldLabels){const replacement=button.id==='interact'?'Pulsante A':button.dataset.key==='Shift'?'Pulsante B':{ArrowUp:'Su',ArrowDown:'Giù',ArrowLeft:'Sinistra',ArrowRight:'Destra'}[button.dataset.key];if(dialog&&replacement)button.setAttribute('aria-label',replacement);else if(label)button.setAttribute('aria-label',label);}}
 new MutationObserver(sync).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
 function key(value){const dialog=active();if(!dialog)return false;const target=dialog.contains(document.activeElement)&&!touch.contains(document.activeElement)?document.activeElement:dialog;target.dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true}));return true;}
 const interact=document.getElementById('interact'),open=document.getElementById('openJournal'),fieldInteract=interact.onclick,fieldOpen=open.onclick;
 interact.onclick=()=>{if(!key('a'))fieldInteract?.();};
 open.onclick=()=>{const dialog=active();if(!dialog)return fieldOpen?.();if(['nativeMenu','pokedexBrowser','pokedexEntry'].includes(dialog.id))key('x');else if(['townMap','phone'].includes(dialog.id))dialog.dispatchEvent(new Event('cancel',{cancelable:true}));};
 for(const button of touch.querySelectorAll('button'))button.addEventListener('pointerdown',event=>{if(active())event.preventDefault();});
 touch.querySelector('[data-key="Shift"]').addEventListener('click',()=>key('b'));
 for(const button of touch.querySelectorAll('[data-key^="Arrow"]'))button.addEventListener('click',()=>key(button.dataset.key));
 sync();
})();
