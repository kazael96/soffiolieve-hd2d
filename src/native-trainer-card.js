/* Original rank-zero IRBI card. Values are the current demo player's record. */
(function(root){
  let preparation;
  async function open(screen,back,flipped=false){
    if(!preparation)preparation=(async()=>{const images={},image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=NativeTextLayout.resource(src);});await Promise.all(Object.entries(TRAINER_CARD_ASSETS.images).map(async([k,v])=>images[k]=await image(v.src)));const close=await image(DEX_BROWSER_ASSETS.groups.detailCommon.cells[0].src),flip=await image(TRAINER_CARD_ASSETS.groups.controls.cells[25].src);return {images,close,flip};})();
    const r=await preparation,a=TRAINER_CARD_ASSETS,s=Journey.state,profile=s.trainer,shortcut=await NativeShortcuts.checkbox(flipped?'trainer:back':'trainer',180,172,()=>open(screen,back,flipped));
    screen.show(s.playerName,c=>{
      c.drawImage(r.images.frontGridRank0,0,0);c.drawImage(r.images[flipped?'backMaleRank0':'frontMaleRank0'],0,0);if(!flipped)c.drawImage(r.images.avatarMaleRank0,...a.images.avatarMaleRank0.position);c.drawImage(r.images.commonFrame,0,0);
      const values=[s.playerName,a.classLabels[0],a.labels[31+(profile?.nature||0)],String(s.dex.seen.length),NativeTextLayout.format(a.labels[57],[s.money])];
      if(!flipped)for(let i=0;i<5;i++){
        if(i===3&&!s.original?.pokedex)continue;const w=a.frontLayout.windows[i];screen.text(a.labels[i],w.tileX*8,w.tileY*8);screen.text(values[i],i===4?232:152,w.tileY*8,false,'right');
      }
      else if(profile){const w=a.frontLayout.windows[a.backLayout.textWindow],x=w.tileX*8,y=w.tileY*8,seconds=profile.playSeconds,date=new Date(profile.startedAt);screen.text(a.labels[5],x,y);screen.text(String(profile.id).padStart(5,'0'),x+96,y,false,'right');screen.text(a.labels[6],x,y+16);screen.text(Math.floor(seconds/3600)+':'+String(Math.floor(seconds/60)%60).padStart(2,'0'),x+208,y+16,false,'right');screen.text(a.labels[7],x,y+32);screen.text(date.toLocaleDateString('it-IT')+'  '+date.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}),x,y+48);}
      c.drawImage(r.flip,102,170);
      shortcut.draw(c);c.drawImage(r.close,213,173);
    },[shortcut.button,{label:'Gira la scheda allenatore',x:100,y:168,w:64,h:24,action:()=>open(screen,back,!flipped)},{label:'Chiudi scheda allenatore',x:208,y:168,w:24,h:24,action:()=>screen.close()}],back,{drawFocus:false,top:c=>{c.drawImage(r.images.topGrid,0,0);c.drawImage(r.images.badges,0,0);if(s.original?.badges?.includes(0)){if(!r.trio){r.trio=document.createElement('canvas');r.trio.width=32;r.trio.height=64;const bc=r.trio.getContext('2d');bc.drawImage(r.images.badges,0,96,32,64,0,0,32,64);const px=bc.getImageData(0,0,32,64);for(let y=0;y<64;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4;if(px.data[i]===41&&px.data[i+1]===41&&px.data[i+2]===24){const color=y<25?[89,181,89]:y<42?[87,164,222]:[219,92,79];px.data.set(color,i);}}bc.putImageData(px,0,0);}c.drawImage(r.trio,0,96);}},topLabel:'Medaglie della scheda allenatore',key:key=>{if(key==='y'){shortcut.button.action();return true;}if(['arrowleft','arrowright'].includes(key)){open(screen,back,!flipped);return true;}return false;}});
  }
  root.NativeTrainerCard={open};
})(typeof window!=='undefined'?window:globalThis);
