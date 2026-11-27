const test=require('node:test'),assert=require('node:assert/strict'),P=require('../src/intro-pokeball.js');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('all five introduction actors use complete native new-game cells, with separately decoded Aralia limbs',()=>{
 const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/intro-fullbody-assets.js'),'utf8'),context);const catalog=context.window.INTRO_FULLBODY_ASSETS;
 assert.equal(catalog.archive,'a/1/7/0');const hashes=new Set();for(const key of ['aralia','Alcide','Anita','Belle','Komor']){const row=catalog.actors[key],raw=fs.readFileSync(path.join(__dirname,'../src',row.src));assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),row.sha256);hashes.add(row.sha256);assert.deepEqual([raw.readUInt32BE(16),raw.readUInt32BE(20)],[192,192]);assert.ok(row.bounds[1]>0&&row.bounds[3]<192&&row.bounds[3]-row.bounds[1]>=70,'Native full-body bounds must fit with head and feet');assert.ok(!row.src.includes('phone'));}assert.equal(hashes.size,5);
 for(const key of ['araliaBody','araliaUpper','araliaForearm','araliaHand'])assert.ok(catalog.actors[key]?.source.multiCell===2);
 const atlas={width:768,height:576};assert.deepEqual(P.sprites({araliaThrow:atlas}),{atlas});assert.throws(()=>P.sprites({araliaThrow:{width:192,height:192}}),/incomplete/);assert.throws(()=>P.sprites({}),/incomplete/);
 const authored=catalog.actors.araliaThrow,raw=fs.readFileSync(path.join(__dirname,'../src',authored.src));assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),authored.sha256);assert.deepEqual([raw.readUInt32BE(16),raw.readUInt32BE(20)],[768,576]);assert.equal(authored.source.authored,true);assert.equal(authored.source.poses,12);
});

test('the actual rendered cel projects its inspected palm to the held sphere contact without cutout rotations',()=>{
 const palmLandmarks=[[73,81],[74,93],[67,102],[62,106],[102,99],[115,81],[124,61],[133,64],[125,73],[88,90],[72,83],[74,81]],atlas={};
 for(const f of P.checkpoints){let depth=0,body;const c={save(){depth++;},restore(){depth--;},translate(){},scale(){},rotate(){},drawImage(image,...a){if(image===atlas){assert.equal(body,undefined);body=a;}},beginPath(){},ellipse(){},fill(){},stroke(){},moveTo(){},lineTo(){}};
  const p=P.pose(f);P.draw(c,{balls:{0:{},9:{},10:{}},minccino:{width:1,height:1},white:{}},{atlas},p);assert.ok(body);const [sx,sy,sw,sh,dx,dy,dw,dh]=body,index=sy/192*4+sx/192;assert.equal(sw,192);assert.equal(sh,192);assert.equal(dw/sw,dh/sh);const landmark=palmLandmarks[index];assert.ok(landmark);const palm={x:dx+landmark[0]*dw/sw,y:dy+landmark[1]*dh/sh};assert.ok(distance(palm,p.palm)<1e-10,'Displayed palm mismatch at '+f);if(f<46||f>=150){assert.ok(Math.abs(p.ball.y+p.ball.size*22/64-palm.y)<1e-10);assert.ok(Math.abs(p.ball.x-palm.x-1)<1e-10);}assert.equal(depth,0);
 }
});

test('Aralia holds the ball in the moving hand until release; flight and return are continuous',()=>{
 for(let f=0;f<46;f+=.2){const p=P.pose(f);assert.equal(distance(p.ball,p.hand),0);assert.equal(p.pokemon.visible,false);}
 assert.ok(P.pose(34).hand.x<60,'Windup remains behind the throwing shoulder');assert.ok(P.pose(34).hand.y>P.pose(14).hand.y+10);
 assert.ok(P.pose(46).hand.x>P.pose(34).hand.x+20,'The new underhand toss extends forward from the shoulder');assert.ok(P.pose(46).hand.y<P.pose(34).hand.y-4,'The wrist rises into the release without an overhead shoulder rotation');
 assert.ok(distance(P.pose(46).ball,P.pose(46).hand)<1e-5);assert.ok(distance(P.pose(76-1e-6).ball,P.pose(76).ball)<1e-4);
 assert.ok(P.pose(61).ball.y<Math.min(P.pose(46).ball.y,P.pose(76).ball.y)-8);
 for(let f=0;f<=162;f+=.1){const p=P.pose(f);assert.ok(p.ball.x>=4&&p.ball.x<=252&&p.ball.y>=4.25&&p.ball.y<=131.75,'The complete ball must stay above the dialogue and inside the canvas');assert.equal(p.actor.y+158*p.actor.scale,130,'Native feet retain contact with the platform');}
 assert.ok(distance(P.pose(128-1e-6).ball,P.pose(128).ball)<1e-4);assert.ok(distance(P.pose(150-1e-6).ball,P.pose(150).hand)<1e-4);
 assert.equal(P.pose(162).phase,'settled');assert.equal(distance(P.pose(162).ball,P.pose(162).hand),0);
});
test('Minccino emerges after the ball opens and settles on the shadow plane, without a midair sprite replacement',()=>{
 for(let f=0;f<86;f++)assert.equal(P.pose(f).pokemon.visible,false);
 assert.equal(P.pose(82).ball.cell,10);assert.ok(P.pose(82).flash>.5);assert.equal(P.pose(86).pokemon.white,1);
 assert.ok(P.pose(100).pokemon.scale>P.pose(86).pokemon.scale);assert.equal(P.pose(128).pokemon.feet,128);
 assert.deepEqual(P.pose(162).pokemon,{visible:true,x:182,feet:128,scale:1.2,stretch:1,white:0,shadow:1});
});
test('all authored checkpoints are drawn at x1/x2/x4 even after a long frame; hidden time is paused',()=>{
 for(const rate of [1,2,4]){const c=P.clock(),seen=new Set(),deltas=[16,240,33,170];let now=0;
  c.tick(now);seen.add(0);c.tick(now+=5000,{hidden:true,rate});assert.equal(c.frame,0);
  for(let i=0;i<2000&&!c.done;i++){const p=c.tick(now+=deltas[i%4],{rate});seen.add(p.frame);}
  assert.equal(c.done,true);for(const f of P.checkpoints)assert.ok(seen.has(f),'Skipped displayed checkpoint '+f+' at x'+rate);
 }
});
test('throw/open/cry follow their displayed frames exactly once and completion does not depend on sound promises',async()=>{
 let next,now=0,lastPaint,events=[],frames=[];const doc={hidden:false},run=P.play({document:doc,request:f=>(next=f,1),cancel(){},rate:()=>4,paint:p=>{lastPaint=p;frames.push(p.frame);},sound:id=>events.push([id,lastPaint.frame]),cry:()=>events.push(['cry',lastPaint.frame])});
 for(let i=0;i<1000&&next;i++){const tick=next;next=null;tick(now+=180);}
 assert.equal(await run.promise,true);assert.deepEqual(events,[[1382,46],[1383,76],['cry',112]]);assert.equal(frames.at(-1),162);
});
test('cancelled animation cannot paint, play delayed sounds or finish a newer introduction',async()=>{
 let tick,paint=0,sound=0;const run=P.play({document:{hidden:false},request:f=>(tick=f,1),cancel(){},paint:()=>paint++,sound:()=>sound++});
 tick(0);run.cancel();tick(5000);assert.equal(await run.promise,false);assert.equal(paint,1);assert.equal(sound,0);
});

test('fractional browser timestamps cannot step over an almost reached checkpoint',()=>{
 for(const rate of [1,2,4]){const c=P.clock(),target=P.checkpoints[1];let now=0,p=c.tick(now);
  while(p.frame<target-1e-8){const dt=Math.min(100,(target-p.frame-1e-10)/(.06*rate));p=c.tick(now+=dt,{rate});}
  assert.ok(p.frame<target&&target-p.frame<1e-7);assert.equal(c.tick(now+=16.7,{rate}).frame,target,'The actual checkpoint must still be displayed at x'+rate);
  assert.ok(c.tick(now+=16.7,{rate}).frame>target,'A displayed checkpoint must not hold the clock forever');
 }
});

test('every authored body cel survives slow rendering and x4; returning ball clears the face',()=>{
 assert.equal(new Set(P.poses.map(p=>p[1])).size,12);
 for(const rate of [1,2,4]){const clock=P.clock(),cells=new Set();let now=0;cells.add(clock.tick(now).actor.cell);for(let i=0;i<2000&&!clock.done;i++)cells.add(clock.tick(now+=i%2?240:16.7,{rate}).actor.cell);assert.equal(clock.done,true);assert.deepEqual([...cells].sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i));}
 for(let f=128;f<=150;f+=.05){const p=P.pose(f);if(p.ball.x>=60&&p.ball.x<=100)assert.ok(p.ball.y>=68,'Returning sphere crosses the face at '+f);}
 assert.equal(P.pose(162).actor.cell,P.pose(0).actor.cell);
});


test('actual Aralia player resumes without consuming wall time when hidden RAFs are entirely suspended',async()=>{
 class VisibilityDoc extends EventTarget{
  constructor(){super();this.hidden=false;this.listeners=new Set();this.removed=[];}
  addEventListener(type,listener,options){super.addEventListener(type,listener,options);if(type==='visibilitychange')this.listeners.add(listener);}
  removeEventListener(type,listener,options){super.removeEventListener(type,listener,options);if(type==='visibilitychange'){this.listeners.delete(listener);this.removed.push(listener);}}
  visibility(hidden){this.hidden=hidden;this.dispatchEvent(new Event('visibilitychange'));}
 }
 for(const rate of [1,2,4]){
  const doc=new VisibilityDoc(),foreign=()=>{};doc.addEventListener('visibilitychange',foreign);
  let next,lastPaint,paintCount=0;const events=[];
  const run=P.play({document:doc,request:f=>(next=f,1),cancel(){next=null;},rate:()=>rate,paint:p=>{lastPaint=p;paintCount++;},sound:id=>events.push(id),cry:()=>events.push('cry')});
  const frame=now=>{const tick=next;assert.equal(typeof tick,'function');next=null;tick(now);};
  try{
   frame(0);assert.equal(lastPaint.frame,0);
   doc.visibility(true); // No RAF callback at all during these5000ms.
   doc.visibility(false);frame(5000);
   assert.equal(lastPaint.frame,0,'First visible RAF consumed hidden wall time at x'+rate);
   assert.equal(paintCount,2);assert.deepEqual(events,[]);assert.equal(doc.listeners.size,2);
   frame(5016);assert.equal(lastPaint.frame,16*.045*rate,'Ordinary visible rate changed');
   doc.visibility(true);doc.visibility(false);frame(15016);
   assert.equal(lastPaint.frame,16*.045*rate,'A second suspended interval advanced the gesture');
   frame(15032);assert.equal(lastPaint.frame,2*(16*.045*rate));
  }finally{run.cancel();assert.equal(await run.promise,false);}
  assert.equal(doc.listeners.size,1);assert(doc.listeners.has(foreign));assert.equal(doc.removed.length,1);assert.notEqual(doc.removed[0],foreign);
  doc.removeEventListener('visibilitychange',foreign);
 }
});

test('Aralia visibility binding is released on completion, cancellation and original callback or scheduler error',async()=>{
 class VisibilityDoc extends EventTarget{
  constructor(){super();this.hidden=false;this.listeners=new Set();}
  addEventListener(type,listener,options){super.addEventListener(type,listener,options);if(type==='visibilitychange')this.listeners.add(listener);}
  removeEventListener(type,listener,options){super.removeEventListener(type,listener,options);if(type==='visibilitychange')this.listeners.delete(listener);}
 }
 const begin=(doc,extra={})=>{let next,lastTick,draws=0;const run=P.play({document:doc,request:f=>(next=f,1),cancel(){next=null;},paint(){draws++;},...extra});return{run,step(now){const tick=next;assert.equal(typeof tick,'function');next=null;lastTick=tick;tick(now);},get pending(){return !!next;},get draws(){return draws;},stale(now){lastTick(now);}};};
 for(const mode of ['complete','cancel','paint-error','frame-error','rate-error','sound-error']){
  const doc=new VisibilityDoc(),foreign=()=>{},sentinel=Error('original '+mode);doc.addEventListener('visibilitychange',foreign);
  let paints=0;const extra=mode==='paint-error'?{paint(){paints++;throw sentinel;}}:mode==='frame-error'?{onFrame(){throw sentinel;}}:mode==='rate-error'?{rate(){throw sentinel;}}:mode==='sound-error'?{sound(){throw sentinel;}}:{};
  const h=begin(doc,extra),work=h.run.promise;const rejected=mode.endsWith('error')?assert.rejects(work,error=>error===sentinel):null;
  h.step(0);
  if(mode==='complete'||mode==='sound-error')for(let i=1;i<1000&&h.pending;i++)h.step(i*180);
  if(mode==='cancel')h.run.cancel();
  if(rejected)await rejected;else assert.equal(await work,mode==='complete');
  assert.equal(doc.listeners.size,1,mode);assert(doc.listeners.has(foreign));
  const draws=h.draws;h.stale(100000);assert.equal(h.draws,draws,'A terminal callback painted again');if(mode==='paint-error')assert.equal(paints,1);
  h.run.cancel();assert.equal(doc.listeners.size,1);doc.removeEventListener('visibilitychange',foreign);
 }
 const doc=new VisibilityDoc(),sentinel=Error('original initial RAF failure');let stale,draws=0;
 assert.throws(()=>P.play({document:doc,paint(){draws++;},request(fn){stale=fn;throw sentinel;}}),error=>error===sentinel);
 assert.equal(doc.listeners.size,0,'Initial scheduler error leaked the visibility binding');stale(100000);assert.equal(draws,0,'A failed initial scheduler retained a live player');
});
