/* Native backgrounds/text/icons, composed for the browser's two-screen interface. */
(function(root){
 let prepared=null,images=null;
 async function prepare(){
  if(!prepared)prepared=RuntimeAssets.retry(async()=>{
   if(!root.POKEMON_STORAGE_ASSETS){const bytes=await RuntimeAssets.bytes(NativeTextLayout.resource('pokemon-storage-assets.js')),tag=document.createElement('script');tag.textContent=new TextDecoder().decode(bytes);document.body.append(tag);tag.remove();}
   if(!root.POKEMON_STORAGE_ASSETS)throw Error('Grafica del Sistema Memoria non disponibile');
   const entries=await Promise.all(Object.entries(POKEMON_STORAGE_ASSETS.images).map(async([key,row])=>[key,await RuntimeAssets.image(NativeTextLayout.resource(row.path))]));images=Object.fromEntries(entries);
  }).catch(error=>{prepared=null;throw error;});return prepared;
 }
 function open(screen,{assets,notice:baseNotice,confirm:baseConfirm}){
  const pc=Journey.storage,data=pc.enter(),texts=POKEMON_STORAGE_ASSETS.texts,t=texts.pc.messages,m=texts.messages.messages;
  let mode='move',selected=null,holding=null,closed=false,mailBusy=false;
  return new Promise(resolve=>{
   const owner=Journey.state,ownerZone=owner.original?.zone,ownerScene=owner.scene,mailContext=()=>!closed&&Journey.state===owner&&owner.original?.zone===ownerZone&&owner.scene===ownerScene&&!(typeof battling!=='undefined'&&battling),abandon=()=>{closed=true;resolve(false);};
   const text=(c,s,x,y,white=false)=>NativeText.draw(c,screen.font,String(s),x,y,white);
   const close=()=>{if(closed)return;closed=true;screen.close();Journey.displayPartner();Journey.save(true);resolve(true);};
   const notice=(...args)=>{baseNotice(...args);screen.exit=close;},confirm=(...args)=>{baseConfirm(...args);screen.exit=close;};
   const save=()=>{Journey.displayPartner();Journey.save(true);};
   const button=(label,x,y,w,h,action,disabled=false)=>({label,x,y,w,h,action,disabled});
   const identity=p=>p.nickname||p.name;
   const icon=(c,p,x,y)=>{if(!p)return;const id=PokemonVisuals.speciesId(p),image=assets['pokemon-'+id];if(image)c.drawImage(image,x-16,y-16);};
   function fail(reason,back=draw){notice(({last:m[6],partyFull:m[5],full:m[12],mail:m[27],egg:m[28],busy:'Attendi la fine dell’operazione.'})[reason]||m[12],back);}
   function apply(from,to){const result=pc.move(from,to);if(!result.ok)return fail(result.reason);holding=null;selected=to;save();draw();}
   function choose(at){
    if(holding){if(mode==='deposit'&&!at.party&&pc.get(at))return fail('full');return apply(holding,at);}const p=pc.get(at);if(!p)return;
    selected=at;if(mode==='withdraw'&&!at.party)return apply(at,{party:true,slot:Journey.state.party.length});
    if(mode==='deposit'&&at.party)holding=at;draw();
   }
   function back(){if(holding){holding=null;draw();}else menu();}
   function rename(){const p=selected&&pc.get(selected);if(!p)return;screen.close();Promise.resolve(NativeStory.nickname(p)).then(()=>{if(!closed){save();draw();}},error=>{console.error(error);if(!closed)notice('Soprannome non modificato.',draw);});}
   function release(){const p=selected&&pc.get(selected);if(!p)return;const name=identity(p);confirm(m[2],()=>{const result=pc.release(selected);if(!result.ok)return fail(result.reason);selected=null;save();notice(NativeTextLayout.format(m[3],[name]),()=>notice(NativeTextLayout.format(m[4],[name]),draw));},draw);}
   function menu(){
    holding=null;selected=null;const rows=[[t[14],'deposit'],[t[15],'withdraw'],[t[16],'move'],[t[18],null]];
    const hasMail=root.MistraltonMail?.mailbox?.().some(Boolean),buttons=rows.map(([label,value],i)=>button(label,8,36+i*32,240,30,()=>{if(value){mode=value;draw();}else close();}));if(hasMail)buttons.push(button(t[27],144,166,104,24,()=>mailMenu()));
    screen.show(t[13].replace(/\{[^}]*\}/g,''),c=>{c.drawImage(images.sub,0,192,256,192,0,0,256,192);text(c,t[13].replace(/\{[^}]*\}/g,''),8,5);rows.forEach(([label],i)=>text(c,label,16,44+i*32));if(hasMail)text(c,t[27],152,170);},buttons,close,{exit:close});
   }
   function mailMenu(page=0){
    if(!mailContext())return abandon();const service=root.MistraltonMail,rows=service.mailbox().map((r,i)=>r?{record:r,slot:i}:null).filter(Boolean),pages=Math.max(1,Math.ceil(rows.length/5));page=Math.max(0,Math.min(pages-1,page));const visible=rows.slice(page*5,page*5+5),buttons=visible.map((r,i)=>button((r.record.letter?.author||'Messaggio')+' - '+(i+page*5+1),8,34+i*24,240,22,()=>mailActions(r.slot,page)));
    buttons.push(button('Prima',8,164,64,24,()=>mailMenu(page-1),page===0),button('Dopo',76,164,64,24,()=>mailMenu(page+1),page+1>=pages),button('Indietro',148,164,100,24,menu));
    screen.show(t[27],c=>{c.drawImage(images.sub,0,192,256,192,0,0,256,192);text(c,t[27]+' '+rows.length+'/20',8,5);if(!visible.length)text(c,'Non ci sono Messaggi.',12,56);visible.forEach((r,i)=>text(c,(r.record.letter?.author||'Messaggio')+' - '+(i+page*5+1),16,38+i*24));text(c,'Prima',12,169);text(c,'Dopo',80,169);text(c,'Indietro',152,169);},buttons,menu,{exit:close});
   }
   function mailActions(slot,page){
    if(!mailContext())return abandon();const service=root.MistraltonMail,r=service.mailbox()[slot];if(!r)return mailMenu(page);
    const single=operation=>async()=>{if(mailBusy||closed)return;if(!mailContext())return abandon();mailBusy=true;try{return await operation();}finally{mailBusy=false;}};
    const read=single(async()=>{try{await service.readStored(slot);}catch(error){console.error(error);}if(!mailContext())return abandon();mailActions(slot,page);});
    const give=single(async()=>{screen.close();try{const index=await root.NativeUI.chooseParty();if(!mailContext())return abandon();if(index!==null&&!service.giveStored(slot,index))return notice('Scegli un Pokémon che non tenga uno strumento.',()=>mailActions(slot,page));}catch(error){console.error(error);if(!mailContext())return abandon();return notice('Il Messaggio non è stato spostato.',()=>mailActions(slot,page));}if(!mailContext())return abandon();save();mailMenu(page);});
    const take=()=>{if(!mailContext())return abandon();confirm(root.MISTRALTON_MAIL_DATA?.labels?.mail?.[10]||'Il contenuto del Messaggio andrà perso. Vuoi continuare?',()=>{if(!mailContext())return abandon();if(service.mailbox()[slot]!==r)return mailMenu(page);if(!service.takeStored(slot,{erase:true}))return notice('La Borsa non può contenere il Messaggio.',()=>mailActions(slot,page));save();mailMenu(page);},()=>mailActions(slot,page));};
    const buttons=[button('Leggi',8,40,240,28,read),button('Dai',8,72,240,28,give),button('Riprendi nella Borsa',8,104,240,28,take),button('Indietro',8,152,240,28,()=>mailMenu(page))];
    screen.show(t[27],c=>{c.drawImage(images.sub,0,192,256,192,0,0,256,192);text(c,r.letter?'Da: '+r.letter.author:'Messaggio non compilato',8,5);buttons.forEach(b=>text(c,b.label,b.x+8,b.y+5));},buttons,()=>mailMenu(page),{exit:close});
   }
   function draw(){
    if(closed)return;const rows=[],current=data.current,p=selected&&pc.get(selected),title=t[mode==='deposit'?14:mode==='withdraw'?15:16];
    const change=delta=>{data.current=(data.current+delta+data.unlocked)%data.unlocked;selected=null;save();draw();};
    for(let slot=0;slot<30;slot++){const x=8+slot%6*24,y=40+Math.floor(slot/6)*24,at={box:current,slot},record=pc.get(at);rows.push({...button(record?identity(record):'BOX '+(current+1)+' · posto '+(slot+1),x,y,24,24,()=>choose(at),mode==='deposit'&&!holding),physicalScreen:'top'});}
    for(let slot=0;slot<Journey.state.party.length;slot++){const record=Journey.state.party[slot],at={party:true,slot};rows.push(button(identity(record),8,80+slot*18,128,18,()=>choose(at),mode==='withdraw'&&!holding));}
    if(holding&&Journey.state.party.length<6)rows.push(button('Squadra · posto libero',8,80+Journey.state.party.length*18,128,18,()=>apply(holding,{party:true,slot:Journey.state.party.length})));
    rows.push(button('Box precedente',160,8,40,28,()=>change(-1)),button('Box successivo',208,8,40,28,()=>change(1)));
    if(!holding&&selected&&p&&mode==='move')rows.push(button('Sposta',152,48,96,28,()=>{holding=selected;draw();}),button('Rinomina',152,80,96,28,rename),button('Libera',152,112,96,28,release));
    rows.push(button(holding?'Annulla':'Indietro',152,160,96,28,back));
    const paintFocus=(c,physical)=>{const b=rows[screen.selected];if(b&&b.physicalScreen===physical){c.strokeStyle='#ffcf40';c.lineWidth=2;c.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2);}};
    screen.show(title,c=>{
     c.drawImage(images.sub,0,0,256,192,0,0,256,192);text(c,title,8,2);
     Journey.state.party.forEach((mon,i)=>{icon(c,mon,24,89+i*18);text(c,identity(mon),40,82+i*18);});
     text(c,holding?'Scegli dove spostarlo.':m[7],8,38);
     for(const b of rows.filter(b=>!b.physicalScreen&&b.x>=152)){c.fillStyle='#30474d';c.fillRect(b.x,b.y,b.w,b.h);text(c,b.label==='Box precedente'?'<':b.label==='Box successivo'?'>':b.label,b.x+4,b.y+6,true);}paintFocus(c,undefined);
    },rows,back,{drawFocus:false,exit:close,topLabel:'BOX '+(current+1),top:c=>{
     c.drawImage(images.main,0,0);c.drawImage(images.wallpaper,0,8);text(c,'BOX '+(current+1),42,13);
     for(let i=0;i<30;i++)icon(c,pc.get({box:current,slot:i}),20+i%6*24,52+Math.floor(i/6)*24);
     if(p){icon(c,p,208,56);text(c,identity(p).slice(0,12),170,82);text(c,'L. '+p.level,170,100);}paintFocus(c,'top');
    },key:(k)=>{
     const direction={arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]}[k];if(!direction)return false;
     const mapped=rows.map(b=>({...b,y:b.y+(b.physicalScreen==='top'?-196:0)}));screen.selected=NativeUI.nextButton(mapped,screen.selected,...direction);screen.focus();return true;
    }});
   }
   menu();
  });
 }
 root.NativeStorage={prepare,open};
})(typeof window!=='undefined'?window:globalThis);
