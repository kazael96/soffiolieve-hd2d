/* Native regional ordering and the two-LCD list viewport, IRBI overlays209/212. */
(function(root){
  function records(catalog,dex){
    const seen=new Set(dex.seen),caught=new Set(dex.caught);
    const list=catalog.regionalOrder.map(id=>({id,name:catalog.names[id],number:catalog.regionalNumbers[id],seen:seen.has(catalog.names[id])||caught.has(catalog.names[id]),caught:caught.has(catalog.names[id])}));
    let end=list.length;while(end&&!list[end-1].seen)end--;return list.slice(0,end);
  }
  let prepared;
  async function prepare(){
    if(!prepared)prepared=(async()=>{
      const a=DEX_BROWSER_ASSETS,images={},groups={};
      const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Risorsa Pokédex non disponibile: '+src));i.src=NativeTextLayout.resource(src);});
      await Promise.all(Object.entries(a.images).map(async([k,v])=>images[k]=await image(v.src)));
      await Promise.all(Object.entries(a.groups).map(async([k,v])=>groups[k]=await Promise.all(v.cells.map(cell=>image(cell.src)))));
      const screen=new NativeUI.Screen();screen.dialog.id='pokedexBrowser';await screen.ready();
      const portraits={};await Promise.all(Object.values(POKEDEX_ASSETS.species).map(async d=>portraits[d.id]=await image('assets/pokemon/'+d.id+'-front.png')));
      return {screen,images,groups,portraits};
    })();return prepared;
  }
  async function open(){
    const r=await prepare(),s=r.screen,a=DEX_BROWSER_ASSETS,all=records(a,Journey.state.dex);let list=all;
    let selected=Math.max(0,list.findIndex(p=>p.seen)),start=0,resolve;
    const shortcut=await NativeShortcuts.checkbox('pokedex',188,172,()=>render());
    const finished=new Promise(done=>resolve=done),close=(result='back')=>{s.close();resolve(result);};
    const write=(c,t,x,y,white=false,align='left')=>NativeText.draw(c,s.font,String(t),x,y,white,align);
    function drawRows(c,offset){
      for(let row=0;row<8;row++){
        const index=offset+row,p=list[index];if(!p)continue;
        c.drawImage(r.images[p.caught?'rowCaught':p.seen?'rowSeen':'rowUnknown'],96,row*24);
        write(c,String(p.number).padStart(3,'0'),100,row*24+4,true);
        write(c,p.seen?p.name:a.labels[7],160,row*24+4,true);
        if(index===selected){c.strokeStyle='#f8fcfc';c.strokeRect(97,row*24+1,152,21);}
      }
    }
    function move(delta){let index=selected+delta;while(index>=0&&index<list.length&&!list[index].seen)index+=Math.sign(delta);if(index<0||index>=list.length)return;selected=index;if(selected<start)start=selected;if(selected>=start+8)start=selected-7;render();}
    async function details(index){const p=list[index];if(!p?.seen)return;selected=index;s.close();try{const result=await Pokedex.entry(p.name,{caught:p.caught});if(result==='close')return close('close');render();}catch(error){render();throw error;}}
    async function search(){await NativePokedexSearch.open(s,result=>{if(result==='close')return close('close');if(Array.isArray(result)){list=result.map(id=>all.find(p=>p.id===id)).filter(Boolean);selected=0;start=0;}render();});}
    function render(){
      const buttons=list.slice(start,start+8).map((p,i)=>({label:String(p.number).padStart(3,'0')+' '+(p.seen?p.name:a.labels[7]),x:96,y:i*24,w:156,h:24,disabled:!p.seen,action:()=>details(start+i)}));
      buttons.push({label:'Cerca',x:0,y:168,w:72,h:24,action:search},{label:'Pokédex nazionale non ancora disponibile',x:72,y:168,w:64,h:24,disabled:true,action:()=>{}},shortcut.button,{label:'Chiudi',x:208,y:168,w:24,h:24,action:()=>close('close')},{label:'Torna indietro',x:232,y:168,w:24,h:24,action:()=>{if(list!==all){list=all;selected=Math.max(0,list.findIndex(p=>p.seen));start=0;render();}else close('back');}});
      s.show(a.labels[0],c=>{
        c.drawImage(r.images.lowerBackground,0,0);drawRows(c,start);
        write(c,a.labels[2],4,20);write(c,Journey.state.dex.seen.length,84,36,false,'right');write(c,a.labels[3],4,52);write(c,Journey.state.dex.caught.length,84,68,false,'right');
        const p=list[selected],portrait=p?.seen&&r.portraits[p.id];if(portrait)c.drawImage(portrait,48-portrait.width/2,122-portrait.height/2);
        const b=a.detail.commonButtons.close,cell=a.groups.detailCommon.cells[b.normal];c.drawImage(r.groups.detailCommon[b.normal],208+cell.origin[0],168+cell.origin[1]);const back=a.groups.detailCommon.cells[1];c.drawImage(r.groups.detailCommon[1],232+back.origin[0],168+back.origin[1]);const search=a.groups.listObjects.cells[0];c.drawImage(r.groups.listObjects[0],36+search.origin[0],180+search.origin[1]);const select=a.groups.listObjects.cells[1];c.drawImage(r.groups.listObjects[1],104+select.origin[0],180+select.origin[1]);shortcut.draw(c);if(!list.length)write(c,DEX_SEARCH_ASSETS.messages[10],4,92);
        const track=r.groups.listObjects[3],thumb=r.groups.listObjects[2];c.drawImage(track,251,12);c.drawImage(thumb,252,12+(list.length>1?Math.round(selected/(list.length-1)*144):0));
      },buttons,()=>close('back'),{drawFocus:false,exit:()=>close('close'),top:c=>{c.drawImage(r.images.upperBackground,0,0);write(c,a.labels[0],4,4,true);drawRows(c,start-8);},topLabel:'Pokédex, parte superiore della lista',key:key=>{
        if(key==='y'){shortcut.button.action();return true;}if(['start','f2'].includes(key)){void search();return true;}if(key==='arrowup'||key==='arrowdown'){move(key==='arrowup'?-1:1);return true;}
        if(key==='arrowleft'||key==='arrowright'){move(key==='arrowleft'?-8:8);return true;}return false;
      }});
      const focus=buttons.findIndex((p,i)=>i<8&&start+i===selected);s.selected=focus<0?buttons.length-1:focus;s.focus();
    }
    render();return await finished;
  }
  root.NativePokedexBrowser={records,open};if(typeof module!=='undefined')module.exports={records};
})(typeof window!=='undefined'?window:globalThis);
