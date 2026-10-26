/* Checkbox used by each supported native page, never by the X-menu grid. */
(function(root){
 let ready;
 async function load(){if(!ready)ready=Promise.all(SUMMARY_DETAIL_ASSETS.groups.toggle.cells.map(cell=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=NativeTextLayout.resource(cell.src);})));return ready;}
 async function checkbox(id,x,y,refresh){const images=await load(),group=SUMMARY_DETAIL_ASSETS.groups.toggle,key=()=>typeof id==='function'?id():id;return {button:{label:'Registra o rimuovi dai comandi rapidi',x:x-4,y:168,w:24,h:24,action:()=>{NativeUI.register(key());refresh();}},draw(c){const n=(NativeSettings.state.registered||[]).includes(key())?1:0,cell=group.cells[n];c.drawImage(images[n],x+cell.origin[0],y+cell.origin[1]);}};}
 root.NativeShortcuts={checkbox};
})(typeof window!=='undefined'?window:globalThis);
