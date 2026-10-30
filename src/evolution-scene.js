/* HD-2D evolution transition using the original front composites, with B to stop. */
(()=>{
 let active=null;
 async function play(from,to){
  if(active)throw Error('Evoluzione già in corso');
  const dialog=document.createElement('dialog');dialog.id='evolutionScene';
  dialog.setAttribute('aria-label','Evoluzione Pokémon');
  const canvas=document.createElement('canvas'),status=document.createElement('p'),cancel=document.createElement('button');
  canvas.width=640;canvas.height=420;canvas.setAttribute('aria-hidden','true');
  status.setAttribute('role','status');status.textContent='Preparazione dell’evoluzione…';
  cancel.textContent='B · Interrompi';cancel.type='button';dialog.append(canvas,status,cancel);document.body.append(dialog);
  const c=canvas.getContext('2d');let raf=0,done=false,elapsed=0,last=performance.now();
  const clock=()=>performance.now();
  let finish;const answer=new Promise(resolve=>{finish=result=>{if(done)return;done=true;cancelAnimationFrame(raf);active=null;dialog.close();dialog.remove();resetInput();resolve(result);};});
  active=dialog;cancel.onclick=()=>finish(false);
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false);});
  dialog.addEventListener('keydown',event=>{const key=event.key.toLowerCase();if(['b','escape'].includes(key)){event.preventDefault();event.stopImmediatePropagation();finish(false);}else if(['a','z','enter',' '].includes(key)&&!event.target.dataset?.retry){event.preventDefault();event.stopImmediatePropagation();}});
  dialog.tabIndex=-1;dialog.showModal();resetInput();dialog.focus({preventScroll:true});
  async function load(retryRequested=false){
   const sprites=[from,to].map(id=>ROM_SPRITE_ANIM.load(id+'-front',{retry:retryRequested}));
   await Promise.all(sprites.map(s=>s.promise));if(done)return;
   if(sprites.some(s=>!s.ready)){
    status.textContent='Sprite non disponibile. Puoi riprovare o interrompere.';
    let retry=dialog.querySelector('[data-retry]');if(!retry){retry=document.createElement('button');retry.dataset.retry='true';retry.textContent='Riprova';dialog.append(retry);}
    retry.onclick=()=>{retry.disabled=true;void load(true).finally(()=>{retry.disabled=false;});};return;
   }
   dialog.querySelector('[data-retry]')?.remove();status.textContent='Premi B per interrompere l’evoluzione.';last=clock();
   function draw(){
    if(done)return;const now=clock();if(!document.hidden)elapsed+=Math.min(80,Math.max(0,now-last))*(GameSpeed.rate||1);last=now;
    const t=Math.min(1,elapsed/3000);dialog.dataset.progress=String(Math.round(t*100));
    const bg=c.createRadialGradient(320,220,20,320,220,400);bg.addColorStop(0,'#3e7281');bg.addColorStop(1,'#101d31');c.fillStyle=bg;c.fillRect(0,0,640,420);
    c.save();c.translate(320,252);c.strokeStyle='#b3ebef';c.globalAlpha=Math.sin(Math.PI*t)*.65;c.lineWidth=2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6+t*9;c.beginPath();c.moveTo(Math.cos(a)*90,Math.sin(a)*45);c.lineTo(Math.cos(a)*300,Math.sin(a)*180);c.stroke();}c.restore();
    c.fillStyle='#102c39';c.beginPath();c.ellipse(320,355,77,13,0,0,2*Math.PI);c.fill();
    const evolved=t>.92||t>.25&&Math.sin(t*t*90)>0,scale=2.45*(.94+.06*Math.cos(t*10));
    ROM_SPRITE_ANIM.draw(c,evolved?to:from,false,320,353,scale,elapsed/33,true);
    if(t>=1){finish(true);return;}raf=requestAnimationFrame(draw);
   }
   draw();
  }
  void load().catch(error=>{if(!done){console.error(error);status.textContent='Caricamento non riuscito. Interrompi e riprova al prossimo aumento di livello.';}});
  return answer;
 }
 window.EvolutionScene={play,get active(){return active;}};
})();
