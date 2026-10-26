/* IRBI starter application: letter, box opening, selection, zoom and confirmation. */
(() => {
  const names=['Snivy','Tepig','Oshawott'],species=[495,498,501];
  const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Immagine iniziale non disponibile: '+src));i.src=src;});
  function pokePose(index,progress){
    const m=STARTER_ASSETS.pokeMoves[index],d0=m[10],d1=m[11],wait=m[9],t=Math.max(0,Math.min(d0+wait+d1,progress));
    if(t>=d0+wait+d1)return {x:m[4],y:m[5],scale:m[8]/16};
    const segment=t<d0?0:1,f=t<d0?t:Math.max(0,t-d0-wait),duration=segment?d1:d0,k=f/duration,a=segment*2,b=a+2;
    return {x:Math.trunc(m[a]+(m[b]-m[a])*k),y:Math.trunc(m[a+1]+(m[b+1]-m[a+1])*k-4*m[12+segment]*k*(1-k)),scale:(m[6+segment]+(m[7+segment]-m[6+segment])*k)/16};
  }
  async function choose({text}){
    const dialog=document.createElement('dialog');dialog.id='starterSelection';dialog.tabIndex=-1;dialog.setAttribute('aria-label','Scegli il tuo primo Pokémon');
    dialog.innerHTML='<div class="starter-screens"><div class="starter-top"><canvas class="starter-model" width="768" height="576" aria-label="Il regalo della Professoressa Aralia"></canvas><img class="starter-cursor" alt="" hidden><div class="starter-letter" hidden></div><div class="starter-white"></div></div><div class="starter-bottom" hidden><canvas class="starter-pokemon" width="512" height="384" aria-hidden="true"></canvas><div class="starter-hits"></div><p class="starter-description" aria-live="polite"></p></div></div><p class="starter-prompt" aria-live="polite"></p><div class="starter-actions"></div>';
    document.body.append(dialog);dialog.showModal();const query=s=>dialog.querySelector(s),top=query('.starter-model'),bottom=query('.starter-bottom'),canvas=query('.starter-pokemon'),context=canvas.getContext('2d'),actions=query('.starter-actions'),prompt=query('.starter-prompt'),description=query('.starter-description'),letter=query('.starter-letter'),white=query('.starter-white'),cursor=query('.starter-cursor');cursor.src=STARTER_ASSETS.cursor.src;
    let selected=-1,stage='loading',scene='letter',modelFrame=0,cameraFrame=0,ballFrame=0,animation=null,request=0,last=performance.now(),selectionWait=null,confirmationWait=null,continueWait=null;
    let keyboard=false,cursorFrame=0;const progress=[0,0,0];let models,pictures,backgrounds;
    const sound=id=>{void window.AudioEngine?.playSound(id);};
    function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;actions.append(b);return b;}
    function setStage(next){stage=next;dialog.dataset.stage=next;dialog.focus();}
    function setSelection(i,keys=false){if(stage!=='select')return;keyboard=keys;if(i===selected)return;selected=i;sound(1352);ballFrame=0;dialog.dataset.selected=names[i];description.textContent=text([18,17,16][i],names[i]);for(const [j,b] of [...query('.starter-hits').children].entries())b.setAttribute('aria-pressed',String(j===i));actions.replaceChildren();button('Conferma',()=>selectionWait?.(i));}
    function draw(now){
      const dt=Math.max(0,Math.min(4,(now-last)/1000));last=now;
      if(animation){const a=animation;a.time=Math.min(a.duration,a.time+dt);const k=a.duration?a.time/a.duration:1;a.update(k);if(k===1){animation=null;a.resolve();}}
      if(scene==='selection'){
        ballFrame=(ballFrame+dt*15)%160;
        for(let i=0;i<3;i++){const m=STARTER_ASSETS.pokeMoves[i],max=m[10]+m[9]+m[11],was=progress[i];progress[i]=Math.max(0,Math.min(max,was+(i===selected?1:-1)*dt*30));if(was<max&&progress[i]===max&&i===selected)void window.AudioEngine?.cry(species[i]);}
      }
      models.draw(scene,modelFrame,{cameraFrame,selected,ballFrame});
      if(!bottom.hidden){context.imageSmoothingEnabled=false;context.clearRect(0,0,512,384);context.drawImage(backgrounds[selected<0?3:selected],0,0,512,384);
        const order=names.map((_,i)=>({i,...pokePose(i,progress[i])})).sort((a,b)=>a.y-b.y);
        for(const p of order){const img=pictures[p.i][p.i===selected?'normal':'dim'],size=256*p.scale;context.drawImage(img,p.x*2-size/2,p.y*2-size/2,size,size);}
      }
      cursor.hidden=selected<0||stage!=='select'||!keyboard;if(!cursor.hidden){const data=STARTER_ASSETS.cursor;cursorFrame=(cursorFrame+dt*30)%data.frames.reduce((n,f)=>n+f[2],0);let t=cursorFrame,shift=data.frames[0];for(const frame of data.frames){shift=frame;if(t<frame[2])break;t-=frame[2];}cursor.style.left=(data.positions[selected][0]+shift[0])/256*100+'%';cursor.style.top=(data.positions[selected][1]+shift[1])/192*100+'%';}
      top.dataset.frame=String(Math.floor(modelFrame));top.dataset.cameraFrame=String(Math.floor(cameraFrame));request=requestAnimationFrame(draw);
    }
    function animate(ticks,update){return new Promise(resolve=>animation={time:0,duration:ticks/30,update,resolve});}
    function motion(from,to){return animate(Math.abs(to-from)*2,k=>cameraFrame=from+(to-from)*k);}
    function key(event){
      const nativeKey=event.key==='a'?'z':event.key==='b'?'Escape':event.key;
      if(event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ','Escape','z','x'].includes(nativeKey)){event.preventDefault();event.stopImmediatePropagation();}
      if(stage==='letter'&&['Enter',' ','Escape','z','x'].includes(nativeKey))continueWait?.();
      else if(stage==='select'){
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(nativeKey)){const i=selected<0?1:(selected+(['ArrowLeft','ArrowUp'].includes(nativeKey)?2:1))%3;setSelection(i,true);}
        else if(['Enter',' ','z'].includes(nativeKey)){if(selected<0)setSelection(1,true);else selectionWait?.(selected);}
      }else if(stage==='confirm'){
        if(['Escape','x'].includes(nativeKey))confirmationWait?.(false);
        else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(nativeKey)){const buttons=[...actions.children],i=buttons.indexOf(document.activeElement);buttons[(i+1)%2].focus();}
        else if(['Enter',' ','z'].includes(nativeKey))confirmationWait?.(document.activeElement!==actions.lastElementChild);
      }
    }
    window.addEventListener('keydown',key,true);dialog.addEventListener('cancel',e=>e.preventDefault());
    try{
      prompt.textContent='…';models=new StarterScene.Scene(top);
      [pictures,backgrounds]=await Promise.all([Promise.all(STARTER_ASSETS.sprites.map(async p=>({normal:await image(p.normal),dim:await image(p.dim)}))),Promise.all(STARTER_ASSETS.backgrounds.map(image)),models.ready]);
      request=requestAnimationFrame(draw);prompt.textContent='';setStage('letter-opening');await animate(138,k=>modelFrame=cameraFrame=69*k);
      letter.textContent=text(12);letter.hidden=false;setStage('letter');
      await new Promise(resolve=>{continueWait=()=>{continueWait=null;sound(1356);resolve();};button('▼',continueWait).focus();});actions.replaceChildren();letter.hidden=true;setStage('opening');
      let opened=false;await animate(61,k=>{modelFrame=cameraFrame=69+30.5*k;if(!opened&&modelFrame>=90){opened=true;sound(1956);}});
      await animate(12,k=>white.style.opacity=String(k));scene='selection';modelFrame=cameraFrame=0;selected=-1;bottom.hidden=false;sound(1957);
      await animate(78,k=>{modelFrame=cameraFrame=39*k;white.style.opacity=String(Math.max(0,1-k*78/16));});
      names.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className='starter-hit';b.setAttribute('aria-label',name);b.setAttribute('aria-pressed','false');b.style.left=[23.44,50,78.13][i]+'%';b.onclick=()=>setSelection(i);query('.starter-hits').append(b);});
      for(;;){
        setStage('select');prompt.textContent=text(19);description.textContent=selected<0?'':text([18,17,16][selected],names[selected]);actions.replaceChildren();if(selected>=0)button('Conferma',()=>selectionWait?.(selected));
        const i=await new Promise(resolve=>selectionWait=value=>{selectionWait=null;sound(1356);setStage('zoom');resolve(value);});
        actions.replaceChildren();prompt.textContent=text(20);const frames=STARTER_ASSETS.cameraFrames[i];await motion(frames[0]/2,frames[1]/2);setStage('confirm');
        const accepted=await new Promise(resolve=>{confirmationWait=value=>{confirmationWait=null;sound(1356);setStage(value?'chosen':'return');resolve(value);};button('SÌ',()=>confirmationWait?.(true)).focus();button('NO',()=>confirmationWait?.(false));});
        actions.replaceChildren();if(!accepted){await motion(frames[1]/2,frames[0]/2);cameraFrame=39;continue;}
        prompt.textContent='';description.textContent='';sound(1976);
        await animate(frames[3]-frames[2],k=>{cameraFrame=frames[2]/2+(frames[3]-frames[2])*k/2;const tick=frames[2]+(frames[3]-frames[2])*k;white.style.opacity=String(Math.max(0,Math.min(1,(tick-frames[4]+2)/20)));});
        return i;
      }
    }finally{window.removeEventListener('keydown',key,true);cancelAnimationFrame(request);models?.destroy();dialog.close();dialog.remove();}
  }
  window.StarterSelection={choose,pokePose};
})();
