/* Original Unova map resources and place geometry. The modal adapts both DS screens. */
(function(root){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function capsuleDistance(x,y,p){const a=p.params,dx=a[8]-a[6],dy=a[9]-a[7],d=dx*dx+dy*dy,t=d?((x-a[6])*dx+(y-a[7])*dy)/d:0;
    // IRBI ARM9 02051eb4 omits the capsule radius beyond the segment ends.
    // With the cursor's zero radius those ends match only the exact point.
    if(t<0||t>1)return Infinity;return Math.hypot(x-a[6]-dx*t,y-a[7]-dy*t);}
  function hit(places,x,y){return places.find(p=>capsuleDistance(x,y,p)<=p.params[10])||null;}
  function frame(sequence,tick){const a=TOWNMAP_ASSETS.animations[sequence],total=a.frames.reduce((n,f)=>n+f[1],0);let t=a.mode===2?Math.floor(tick)%total:Math.min(total-1,Math.floor(tick));for(const f of a.frames){if(t<f[1])return f;t-=f[1];}return a.frames.at(-1);}
  function viewFor(x,y,zoom){return {zoom,x:zoom===1?0:clamp(128-x,-128,128),y:zoom===1?0:clamp(96-y,-72,96)};}
  const screen=(x,y,v)=>[128+(x-128)*v.zoom+v.x,96+(y-96)*v.zoom+v.y];
  const world=(x,y,v)=>[128+(x-128-v.x)/v.zoom,96+(y-96-v.y)/v.zoom];
  async function open(){
    if(battling||window.NativeStory?.locked||!NativeStory.state.map)return;
    const journalWasOpen=$('journal').open;resetInput();
    const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Risorsa Mappa Città non disponibile: '+src));i.src=src;});
    const [map,info,font,...cells]=await Promise.all([image('assets/townmap/map.png?v='+TOWNMAP_ASSETS.revision),image('assets/townmap/info.png?v='+TOWNMAP_ASSETS.revision),NativeText.load(),...TOWNMAP_ASSETS.cells.map((_,i)=>image(`assets/townmap/cell-${i}.png?v=${TOWNMAP_ASSETS.revision}`))]);
    if(journalWasOpen&&!$('journal').open)return;$('journal').close();
    const native=NativeStory.state,visited=new Set([389,...(native.arrived?[397]:[])]),places=TOWNMAP_ASSETS.places.filter(p=>p.params[16]===65535||native.flags.includes(p.params[16]));
    const player=places.find(p=>p.zone===(native.arrived&&Journey.state.player.y<=-80?397:native.zone===317?317:389))||places[0];
    let selected=player,cursor=[player.params[4],player.params[5]],view=viewFor(...cursor,1),tick=0,last=performance.now(),request=0,keyTime=0,drag=null,touch=false,zoomMotion=null;const held=new Set();
    const dialog=document.createElement('dialog');dialog.id='townMap';dialog.setAttribute('aria-label','Mappa Città');
    dialog.innerHTML='<div class="townmap-screens"><canvas class="townmap-info" width="256" height="192" role="img"></canvas><canvas class="townmap-map" width="256" height="192" role="img" aria-label="Mappa di Unima" tabindex="0"></canvas></div><div class="townmap-actions"><label>Luogo <select aria-label="Luogo sulla mappa"></select></label><button class="townmap-zoom">Ingrandisci</button><button class="townmap-close">Chiudi</button></div>';
    const q=s=>dialog.querySelector(s),top=q('.townmap-info'),bottom=q('.townmap-map'),a=top.getContext('2d'),b=bottom.getContext('2d'),select=q('select'),zoom=q('.townmap-zoom');a.imageSmoothingEnabled=b.imageSmoothingEnabled=false;
    places.forEach(p=>select.add(new Option(p.name,String(p.zone))));select.value=String(player.zone);
    function selectPlace(p){selected=p;if(p)select.value=String(p.zone);top.setAttribute('aria-label',p?`${p.name}. ${p.description.replaceAll('\\n',' ')}${visited.has(p.zone)||p.params[15]===65535?'. '+p.landmarks.join('. '):''}`:'Mappa Città');dialog.dataset.place=p?.name||'';}
    function marker(ctx,seq,x,y,t=tick,scale=1){const f=frame(seq,t),c=TOWNMAP_ASSETS.cells[f[0]];ctx.drawImage(cells[f[0]],Math.round(x+(c[0]+f[2])*scale),Math.round(y+(c[1]+f[3])*scale),c[2]*scale,c[3]*scale);}
    function lines(value,x,y){value.split('\\n').forEach((line,i)=>NativeText.draw(a,font,line,x,y+i*15));}
    function draw(now){
      const dt=Math.min(.1,(now-last)/1000);last=now;tick+=dt*60;keyTime+=dt;
      if(zoomMotion){const m=zoomMotion;m.time=Math.min(10/30,m.time+dt);const k=m.time/(10/30);view={zoom:m.from.zoom+(m.to.zoom-m.from.zoom)*k,x:m.from.x+(m.to.x-m.from.x)*k,y:m.from.y+(m.to.y-m.from.y)*k};if(k===1){zoomMotion=null;zoom.disabled=false;selectPlace(hit(places,...cursor));}}
      while(keyTime>=1/30){keyTime-=1/30;moveCursor(Number(held.has('ArrowRight'))-Number(held.has('ArrowLeft')),Number(held.has('ArrowDown'))-Number(held.has('ArrowUp')));}
      a.clearRect(0,0,256,192);a.drawImage(info,0,0);
      if(selected){NativeText.draw(a,font,selected.name,128,48,false,'center');lines(selected.description,28,80);if(visited.has(selected.zone)||selected.params[15]===65535)selected.landmarks.forEach((s,i)=>lines(s,i<3?16:136,128+(i%3)*16));}
      b.fillStyle='#000';b.fillRect(0,0,256,192);const origin=screen(0,0,view);b.drawImage(map,origin[0],origin[1],256*view.zoom,192*view.zoom);
      for(const p of places){const pos=screen(p.params[2],p.params[3],view);if(p.params[11]===0&&visited.has(p.zone))marker(b,p===selected?2:1,...pos,tick,view.zoom);else if(p.params[11]===2&&p===selected)marker(b,3,...pos,tick,view.zoom);}
      marker(b,6,...screen(player.params[2],player.params[3],view));
      if(selected)marker(b,5,...screen(selected.params[4],selected.params[5],view));if(!touch)marker(b,4,...screen(...cursor,view));
      if(selected){marker(b,0,128,96,1000);NativeText.draw(b,font,selected.name,16,2);}
      request=requestAnimationFrame(draw);
    }
    function moveCursor(dx,dy){if(!zoomMotion&&(dx||dy)){touch=false;const point=screen(...cursor,view),length=Math.hypot(dx,dy);point[0]=clamp(point[0]+Math.trunc(3*dx/length),0,248);point[1]=clamp(point[1]+Math.trunc(3*dy/length),8,168);cursor=world(...point,view);selectPlace(hit(places,...cursor));dialog.dataset.cursor=cursor.join(',');}}
    select.onchange=()=>{const p=places.find(p=>p.zone===+select.value);cursor=[p.params[4],p.params[5]];view=viewFor(...cursor,view.zoom);selectPlace(p);void AudioEngine.playSound(1352);bottom.focus();};
    zoom.onclick=()=>{if(zoomMotion)return;const next=view.zoom===1?2:1;zoomMotion={time:0,from:{...view},to:viewFor(...cursor,next)};zoom.disabled=true;zoom.textContent=next===1?'Ingrandisci':'Riduci';dialog.dataset.zoom=String(next);held.clear();selectPlace(null);void AudioEngine.playSound(next===2?1608:1609);bottom.focus();};
    const point=e=>{const r=bottom.getBoundingClientRect();return[(e.clientX-r.left)*256/r.width,(e.clientY-r.top)*192/r.height];};
    bottom.onpointerdown=e=>{if(zoomMotion)return;touch=true;held.clear();const pos=point(e);cursor=world(...pos,view);selectPlace(hit(places,...cursor));drag={pos,view:{...view},moved:false};bottom.setPointerCapture(e.pointerId);bottom.focus();e.preventDefault();};
    bottom.onpointermove=e=>{if(!drag||view.zoom===1||zoomMotion)return;const pos=point(e),dx=pos[0]-drag.pos[0],dy=pos[1]-drag.pos[1];if(Math.hypot(dx,dy)>3)drag.moved=true;if(drag.moved){view.x=clamp(drag.view.x+dx,-128,128);view.y=clamp(drag.view.y+dy,-72,96);}};
    bottom.onpointerup=bottom.onpointercancel=()=>{drag=null;};
    const key=e=>{if(e.target===select)return;if(e.key.startsWith('Arrow')){e.preventDefault();e.stopImmediatePropagation();if(e.code==='TouchControl')moveCursor(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0,e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0);else held.add(e.key);}else if(['+','=','-'].includes(e.key)){e.preventDefault();zoom.click();}};
    const keyup=e=>held.delete(e.key),blur=()=>held.clear();dialog.addEventListener('keydown',key);addEventListener('keyup',keyup);addEventListener('blur',blur);
    document.body.append(dialog);dialog.showModal();selectPlace(selected);bottom.focus();request=requestAnimationFrame(draw);
    try{await new Promise(resolve=>{q('.townmap-close').onclick=resolve;dialog.addEventListener('cancel',e=>{e.preventDefault();resolve();});});}
    finally{cancelAnimationFrame(request);removeEventListener('keyup',keyup);removeEventListener('blur',blur);dialog.close();dialog.remove();resetInput();}
  }
  const api={capsuleDistance,hit,frame,viewFor,screen,world,open};root.TownMap=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
