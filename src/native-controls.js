/* A/B/X equivalents across original-event dialogs and native menu screens. */
(() => {
  const registered=document.getElementById('registeredTool');if(registered){registered.hidden=!(NativeSettings.state.registered||[]).length;registered.onclick=()=>NativeUI.useRegistered();}
  const sound=()=>{if(!AudioEngine.enabled)void AudioEngine.enable();};
  addEventListener('pointerdown',sound,{once:true});
  addEventListener('keydown',e=>{if(!e.ctrlKey&&!e.altKey&&!e.metaKey)sound();},{once:true});
  addEventListener('keydown',e=>{
    if(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.repeat||e.target.closest?.('input,select,textarea,[contenteditable="true"]'))return;
    const dialog=[...document.querySelectorAll('dialog[open]')].at(-1),key=e.key.toLowerCase();if(!dialog)return;
    if(dialog.id==='nativeMenu'||dialog.id==='starterSelection')return;
    const controls=[...dialog.querySelectorAll('button')].filter(b=>!b.disabled&&!b.closest('#touch')&&b.getClientRects().length);
    if(['z','a'].includes(key)){e.preventDefault();e.stopImmediatePropagation();(controls.includes(document.activeElement)?document.activeElement:controls[0])?.click();}
    else if(key==='b'||(key==='x'&&dialog.id==='journal')){e.preventDefault();e.stopImmediatePropagation();dialog.dispatchEvent(new Event('cancel',{cancelable:true}));if(dialog.id==='journal')dialog.close();}
    else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&!['dialogue','townMap'].includes(dialog.id)){
      e.preventDefault();const index=Math.max(0,controls.indexOf(document.activeElement)),delta=['ArrowUp','ArrowLeft'].includes(e.key)?-1:1;controls[(index+delta+controls.length)%controls.length]?.focus({preventScroll:true});
    }
  });
})();
