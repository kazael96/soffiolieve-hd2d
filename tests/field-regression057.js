/* Test-only real-controller replays. Loaded exclusively by the isolated QA fixture. */
(function(root){
 function install({case049,seed049,enter049,auto049,hold049,release049,until,check,shot,wait}){
  case049('qaFieldGate057','Varco057: ingressi reali e quota legacy','field057-real-renderer-gate-both-directions-and-legacy-height',async()=>{
   await seed049({16506:3,16507:3,16508:2,16509:2,16512:3},[511,518,520,521,522,523,524,525,528,637]);
   const n=NativeStory.state,draw=renderer.draw,rows=[],samples=[],violations=[];let lastActors=[];
   renderer.draw=function(time,actors){const result=draw.call(this,time,actors);lastActors=actors;if(n.zone===320){const hero=actors.find(a=>a.name==='Alcide');if(hero){const sample={x:hero.x,z:hero.z,height:hero.height,ground:this.groundHeight(hero.x,hero.z),savedHeight:n.fieldHeight};if(samples.length<400)samples.push(sample);if(Math.abs(hero.height-(-.125+.04))>1e-8)violations.push(sample);}}return result;};
   async function capture(label){
    await renderer.prepareScene();drawWorld(true);const actors=lastActors,hero=actors.find(a=>a.name==='Alcide');check(hero,'057 hero missing from real field draw');
    const copy=document.createElement('canvas');copy.width=renderer.canvas.width;copy.height=renderer.canvas.height;const ctx=copy.getContext('2d',{willReadFrequently:true});ctx.drawImage(renderer.canvas,0,0);const withHero=ctx.getImageData(0,0,copy.width,copy.height).data;
    renderer.draw(t,actors.filter(a=>a!==hero));ctx.clearRect(0,0,copy.width,copy.height);ctx.drawImage(renderer.canvas,0,0);const without=ctx.getImageData(0,0,copy.width,copy.height).data;let visiblePixels=0;for(let i=0;i<withHero.length;i+=4)if(Math.abs(withHero[i]-without[i])+Math.abs(withHero[i+1]-without[i+1])+Math.abs(withHero[i+2]-without[i+2])>24)visiblePixels++;
    check(visiblePixels>12,'057 gate hero is not visible in actual pixels: '+visiblePixels);drawWorld(true);shot(label,renderer.canvas);check(renderer.gl.getError()===renderer.gl.NO_ERROR,'057 gate WebGL error');return {zone:n.zone,player:{...player},ground:renderer.groundHeight(player.x,player.y),heroHeight:hero.height,visiblePixels,instances:renderer.scene.instances.length};
   }
   try{
    for(const speed of [1,2,4])for(const trip of [{source:397,x:770,z:647,key:'ArrowLeft',exit:319},{source:319,x:760,z:647,key:'ArrowRight',exit:397}]){
     GameSpeed.set(speed);await enter049(trip.source,trip.x,trip.z);
     await hold049(trip.key,()=>n.zone===320,'057 actual gate entrance '+trip.source,12000);
     await auto049(until(()=>!NativeStory.locked&&renderer.ready,'057 gate arrival completes',15000));
     const arrival=await capture('057 varco da '+trip.source+' x'+speed);
     check(arrival.ground===-.125,'057 arrival stands on the ceiling');
     await hold049(trip.key,()=>n.zone===trip.exit,'057 actual opposite gate exit '+trip.exit,20000);
     await auto049(until(()=>!NativeStory.locked&&renderer.ready,'057 outdoor arrival completes',15000));
     drawWorld(true);shot('057 uscita varco '+trip.exit+' x'+speed,renderer.canvas);rows.push({speed,from:trip.source,to:trip.exit,arrival,exit:{player:{...player},zone:n.zone}});
    }
    GameSpeed.set(1);await enter049(320,7,4);release049();NativeStory.captureActors();
    const before={...player},snapshot=structuredClone(Journey.state);snapshot.player={...player};snapshot.facing=facing;snapshot.original=structuredClone(n);snapshot.original.fieldHeight=5.5;
    let encoded;const storage={setItem:(key,value)=>encoded=value,getItem:()=>encoded};check(StoryState.write(storage,snapshot),'057 legacy gate save rejected');const loaded=StoryState.read(storage);check(loaded.original.fieldHeight===5.5,'057 legacy ceiling height was not supplied');
    for(const key of Object.keys(n))delete n[key];Object.assign(n,loaded.original);Journey.state.original=n;player={...loaded.player};facing=loaded.facing;NativeStory.syncActors();
    check(Math.hypot(player.x-before.x,player.y-before.y)<1e-10,'057 legacy recovery moved the player');
    const legacy=await capture('057 varco ripresa quota legacy 5 5');check(legacy.ground===-.125&&Math.abs(legacy.heroHeight+.085)<1e-8,'057 legacy height still lifts the hero');
    await hold049('ArrowDown',()=>player.y>before.y+.6,'057 walk after legacy recovery',5000);check(!violations.length,'057 gate animation used ceiling height: '+JSON.stringify(violations.slice(0,3)));check(samples.length>10,'057 real gate draw sampling missing');
    return {rows,legacy:{...legacy,serializedHeight:loaded.original.fieldHeight,bytes:encoded.length,storageRoundtrip:true,pageReload:false,posePreserved:true,walkResumed:true},renderedSamples:samples.length,ceilingHeightViolations:violations,scope:'DOM keyboard enters and crosses the original gate in both directions at x1/x2/x4. Native floor and hero pixels measured. Completed story prerequisites supplied; legacy storage roundtrip is in-memory, no browser reload. Native ceiling/walls/collisions retained.'};
   }finally{release049();renderer.draw=draw;}
  });
  case049('qaFieldCamera057','Camera057: protagonista centrato nel campo','field057-real-renderer-outdoor-centering-and-native-transition',async()=>{
   await seed049({16506:3,16507:3,16508:2,16509:2,16512:3},[511,518,520,521,522,523,524,525,528,637]);const rows=[];
   for(const speed of [1,2,4]){
    GameSpeed.set(speed);await enter049(319,756,646);await until(()=>Math.abs(renderer.center[0]-player.x)<.025,'057 Route2 horizontal camera settles',7000);drawWorld(true);
    const point=renderer.screen(player.x,player.y,renderer.groundHeight(player.x,player.y)+.04),offset=point[0]-innerWidth/2;check(Math.abs(offset)<1.5,'057 player remains horizontally decentered: '+offset);shot('057 Percorso2 camera centrata x'+speed,renderer.canvas);rows.push({speed,zone:NativeStory.state.zone,player:{...player},camera:[...renderer.center],screen:point,offset,pitch:[...renderer.cameraPitch||[.423,.906]],zoom:renderer.zoom});
   }
   return {rows,viewport:[innerWidth,innerHeight],scope:'Actual rendered Route2 field at three game speeds after native changeZone. Horizontal projection checked in this viewport; pitch and zoom remain runtime preferences. Fixed early-room cameras and scripted story framing have separate CPU regressions.'};
  });
 }
 root.FieldRegression057={install};
})(typeof window==='undefined'?globalThis:window);
