/* IRBI overlay68: MAIN on the lower LCD, SUB on the upper LCD. */
(function(root){
  let resources;
  async function load(){
    if(!resources)resources=(async()=>{
      const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=NativeTextLayout.resource(src);});
      const a=root.OPTIONS_ASSETS,images={};
      await Promise.all(Object.entries(a.images).map(async([k,v])=>{images[k]=await image(v.src);}));
      const selectors=await Promise.all(a.groups.selector.cells.map(c=>image(c.src)));
      const fonts={};await Promise.all(Object.entries(a.font.variants).map(async([k,v])=>fonts[k]=await image(v.src)));
      return {images,selectors,fonts,font:await NativeText.load()};
    })();return resources;
  }
  async function open(screen,done,draft={...NativeSettings.state},focus=0){
    const r=await load(),a=OPTIONS_ASSETS,t=a.labels,shortcut=await NativeShortcuts.checkbox('options',48,172,()=>open(screen,done,draft,focus));
    const rows=[['textSpeed',[1,2,3],[10,11,12],1,25],['animations',[true,false],[13,14],2,26],['battleStyle',['switch','set'],[15,16],3,27],['sound',['stereo','mono'],[17,18],4,28],['autoSaveIR',[true,false],[23,24],7,31]];
    const buttons=[],write=(c,text,x,y,white=false,align='left',variant)=>NativeText.draw(c,variant?r.fonts[variant]:r.font,text,x,y,variant?false:white,align,variant?a.font:POKEDEX_ASSETS.font);
    rows.forEach(([key,values,ids,label],row)=>values.forEach((value,i)=>{
      const x=row===0?112+48*i:112+72*i,w=row===0?48:72,index=buttons.length;
      buttons.push({label:t[label]+': '+t[ids[i]],x,y:24+24*row,w,h:24,row,action:()=>open(screen,done,{...draft,[key]:value},index)});
    }));
    const changed=()=>rows.some(([key])=>(draft[key]??true)!==(NativeSettings.state[key]??true));
    const finish=()=>{NativeSettings.set(draft);done();};
    const leave=()=>{
      if(!changed())return done();
      NativeUI.confirm(t[33],finish,done);
    };
    buttons.push({...shortcut.button,row:5},{label:t[8],x:64,y:160,w:64,h:32,row:5,action:finish},{label:t[9],x:128,y:160,w:128,h:32,row:5,action:leave});
    screen.show(t[0],c=>{
      c.drawImage(r.images.bottomBackground,0,0);
      write(c,t[0],64,4,false,'center');
      const active=buttons[screen.selected]?.row??0;
      rows.forEach(([key,values,ids,label],row)=>{
        const selected=active===row,y=24+24*row;
        c.drawImage(r.images[selected?'rowSelected':'rowNormal'+row],0,y);
        write(c,t[label],8,y+4,false,'left',selected?'focusedChosen':'normalChosen');
        values.forEach((value,i)=>{
          const current=(draft[key]??true)===value,x=row===0?[119,164,210][i]:[120,192][i];
          const animation=selected?(current?3:2):(current?0:1),frame=a.groups.selector.animations[animation].frames[0][0],cell=a.groups.selector.cells[frame];
          c.drawImage(r.selectors[frame],x+cell.origin[0],y+cell.origin[1]);
          write(c,t[ids[i]],x,y+4,false,'left',selected?(current?'focusedChosen':'focusedOther'):(current?'normalChosen':'normalOther'));
        });
      });
      shortcut.draw(c);write(c,t[8],96,170,false,'center');write(c,t[9],192,170,false,'center');
    },buttons,leave,{top:c=>{
      c.drawImage(r.images.upperBackground,0,0);
      c.fillStyle='#fff';c.fillRect(8,152,240,32);
      const row=buttons[screen.selected]?.row??0;
      NativeTextLayout.wrap(t[rows[Math.min(4,row)][4]],POKEDEX_ASSETS.font,232).slice(0,2).forEach((line,i)=>write(c,line,12,152+15*i));
    },topLabel:'Descrizione opzioni',key:key=>{if(key==='y'){shortcut.button.action();return true;}return false;}});
    screen.selected=Math.min(focus,buttons.length-1);screen.focus();
  }
  root.NativeOptions={open};
})(typeof window!=='undefined'?window:globalThis);
