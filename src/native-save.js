/* IRBI overlay34 notebook; browser save remains Journey.save. */
(function(root){
  let ready;
  async function open(screen,confirm,notice,back){
    if(!ready)ready=(async()=>{const a=await(await fetch(NativeTextLayout.resource('assets/save-ui/provenance.json'))).json();const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=NativeTextLayout.resource(src);});return {a,panel:await load(a.panel.path),header:await load(a.font.variants.header.path),body:await load(a.font.variants.body.path)};})();
    const r=await ready,s=Journey.state,t=MENU_ASSETS.texts[168],now=new Date(),pad=n=>String(n).padStart(2,'0'),seconds=s.trainer?.playSeconds||0;
    const date=d=>pad(d.getDate())+' '+d.toLocaleDateString('it-IT',{month:'short'})+' '+d.getFullYear();
    const zone=s.original?.zone===317?317:s.original?.zone===397?397:389,location=TOWNMAP_ASSETS.places.find(p=>p.zone===zone)?.name||'';
    const values=[NativeTextLayout.format(t[0],[s.playerName]),date(now),pad(now.getHours())+':'+pad(now.getMinutes()),location,NativeTextLayout.format(t[4],[0]),s.original?.pokedex?NativeTextLayout.format(t[5],[s.dex.seen.length]):'',NativeTextLayout.format(t[6],[Math.floor(seconds/3600),pad(Math.floor(seconds/60)%60)]),''];
    screen.show('Salva',c=>{c.drawImage(r.panel,0,0);r.a.windows.forEach((w,i)=>{if(values[i])NativeText.draw(c,i?r.body:r.header,values[i],w.pixelRect[0]+w.textLocalOrigin[0],w.pixelRect[1]+w.textLocalOrigin[1],false,'left',r.a.font);});},[],back,{drawFocus:false});
    confirm('Vuoi salvare il gioco?',()=>{const success=Journey.save(true);notice(success?NativeTextLayout.format(MENU_ASSETS.texts[36][4],[s.playerName]):document.getElementById('saveStatus').textContent,back);},back);
  }
  root.NativeSave={open};
})(typeof window!=='undefined'?window:globalThis);
