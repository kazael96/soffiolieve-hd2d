/* Native IRBI permissions/visited flags/landing union; HD-2D Pokémon cut-in. */
(function(root){
  const data=()=>root.MISTRALTON_FLY_DATA;
  function migrate(state){
    const n=state.original||state,flags=n.flags||(n.flags=[]),badges=n.badges||[];
    const reached=[true,n.arrived,n.striaton||badges.includes(0),n.nacrene||badges.includes(1),n.castelia||badges.includes(2),n.nimbasa||badges.includes(3),n.driftveil||badges.includes(4),n.mistralton||badges.includes(5)];
    const home=data()?.headers[n.zone]?.parent;
    data()?.destinations.forEach((d,i)=>{if((reached[i]||n.zone===d.zone||home===d.zone)&&!flags.includes(d.flag))flags.push(d.flag);});
    return flags;
  }
  function destinations(state){const flags=migrate(state);return (data()?.destinations||[]).filter(d=>flags.includes(d.flag));}
  function allowed(zone){return !!(data()?.headers[zone]?.flags&0x2000);}
  function knows(mon){return !!mon&&(mon.pp||mon.moves||[]).some(m=>(typeof m==='number'?m:m.id)===19);}
  function canUse(state,index){const n=state.original||state;return allowed(n.zone)&&knows(state.party?.[index]);}
  // Keep the actual species, sex and season. The cut-in uses the same fitted
  // wing/body preparation as battle Fly; this is an HD-2D presentation adaptation.
  async function play(mon){
    if(!root.ROM_SPRITE_ANIM||!root.SpeciesMoves)throw Error('Animazione Volo non disponibile.');
    await root.ROM_SPRITE_ANIM.prepare([mon]);
    const release=root.ROM_SPRITE_ANIM.pin?.([mon])||(()=>{}),canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;canvas.id='nativeFlyCutIn';canvas.setAttribute('aria-label',(mon.nickname||mon.name)+' usa Volo');
    Object.assign(canvas.style,{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'min(100vw,200vh,768px)',height:'auto',zIndex:'1500',pointerEvents:'none',background:'rgba(8,24,48,.86)'});
    const c=canvas.getContext('2d'),graphic=root.PokemonVisuals.graphic(mon),id=root.PokemonVisuals.speciesId(mon),profile={...root.SpeciesMoves.select(id,19,{preparing:true}),graphic};if(!profile.frames){release();throw Error('Coreografia Volo non disponibile.');}let request;
    document.body.append(canvas);void root.AudioEngine?.cry(id);
    try{await new Promise((resolve,reject)=>{let last,elapsed=0;const tick=now=>{try{last??=now;elapsed+=(now-last)*(root.GameSpeed?.rate||1);last=now;const t=Math.min(1,elapsed/1000),pose=root.SpeciesMoves.sample(profile,t*profile.frames,'p1');c.clearRect(0,0,768,384);root.ROM_SPRITE_ANIM.draw(c,graphic,false,128+512*t,300-75*Math.sin(Math.PI*t),2.6,elapsed/1000,false,pose);if(t===1)resolve();else request=requestAnimationFrame(tick);}catch(e){reject(e);}};request=requestAnimationFrame(tick);});}
    finally{if(request)cancelAnimationFrame(request);canvas.remove();release();}
  }
  root.MistraltonFly={migrate,destinations,allowed,knows,canUse,play};
})(typeof window!=='undefined'?window:globalThis);
