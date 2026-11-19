const test=require('node:test'),assert=require('node:assert/strict'),P=require('../src/intro-pokeball.js');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('all five introduction actors use complete native new-game cells, with separately decoded Aralia limbs',()=>{
 const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/intro-fullbody-assets.js'),'utf8'),context);const catalog=context.window.INTRO_FULLBODY_ASSETS;
 assert.equal(catalog.archive,'a/1/7/0');const hashes=new Set();for(const key of ['aralia','Alcide','Anita','Belle','Komor']){const row=catalog.actors[key],raw=fs.readFileSync(path.join(__dirname,'../src',row.src));assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),row.sha256);hashes.add(row.sha256);assert.deepEqual([raw.readUInt32BE(16),raw.readUInt32BE(20)],[192,192]);assert.ok(row.bounds[1]>0&&row.bounds[3]<192&&row.bounds[3]-row.bounds[1]>=70,'Native full-body bounds must fit with head and feet');assert.ok(!row.src.includes('phone'));}assert.equal(hashes.size,5);
 for(const key of ['araliaBody','araliaUpper','araliaForearm','araliaHand'])assert.ok(catalog.actors[key]?.source.multiCell===2);
 const image={width:192,height:192};assert.deepEqual(Object.keys(P.sprites({araliaBody:image,araliaUpper:image,araliaForearm:image,araliaHand:image,araliaHead:image,araliaTorso:image,araliaCoatLeft:image,araliaCoatRight:image})),['body','upper','forearm','hand','head','torso','coatLeft','coatRight']);assert.throws(()=>P.sprites({araliaBody:{width:128,height:192}}),/incomplete/);
});
test('rendered two-joint hand matches the physical ball anchor throughout the full-body choreography',()=>{
 for(const f of P.checkpoints){let m=[1,0,0,1,0,0],stack=[],hand;const mul=n=>{const[a,b,c,d,e,g]=m,[h,i,j,k,l,o]=n;m=[a*h+c*i,b*h+d*i,a*j+c*k,b*j+d*k,a*l+c*o+e,b*l+d*o+g];};const handImage={},c={save(){stack.push([...m]);},restore(){m=stack.pop();},translate(x,y){mul([1,0,0,1,x,y]);},scale(x,y){mul([x,0,0,y,0,0]);},rotate(a){mul([Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]);},drawImage(image){if(image===handImage)hand={x:m[0]*75+m[2]*69+m[4],y:m[1]*75+m[3]*69+m[5]};},beginPath(){},ellipse(){},fill(){},stroke(){},moveTo(){},lineTo(){}};
  const p=P.pose(f);P.draw(c,{balls:{0:{},9:{},10:{}},minccino:{width:1,height:1},white:{}},{body:{},upper:{},forearm:{},hand:handImage},p);assert.ok(distance(hand,p.hand)<1e-10,'Displayed hand and ball disagree at '+f);assert.equal(stack.length,0);
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
