'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve(__dirname,'../src/emboar-moves.js'),'utf8'),geometry=require('./fixtures/emboar-native-geometry064.json'),baseline=process.env.EMBOAR064_BASELINE==='1';
const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const layout={p1:{x:300,y:500,height:160,w:1000,h:650},p2:{x:700,y:270,height:110,w:1000,h:650}};
function host(install=!baseline){
 const c=require('./helpers/finale-moves-host.cjs').setup({withoutEmboar:true});
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../src/pokemon-anim.js'),'utf8'),c);
 for(const view of ['front','back'])c.ROM_SPRITE_ANIM.cache['500-'+view]={ready:true,data:JSON.parse(fs.readFileSync(path.join(site,'assets/animated/500-'+view+'.json'),'utf8')),groundBounds:geometry.views[view].groundBounds.slice()};
 if(install)vm.runInContext(source,c,{filename:'emboar-moves.js'});
 return c;
}
test('prepared native geometry belongs to the exact original front/back sprite assets',()=>{
 for(const view of ['front','back'])for(const [ext,key] of [['json','jsonSHA256'],['png','pngSHA256']])assert.equal(sha(fs.readFileSync(path.join(site,'assets/animated/500-'+view+'.'+ext))),geometry.views[view][key]);
});
test('Rollout and Gyro Ball tuck real arms and legs, leaving chest cells attached to the torso',()=>{
 const c=host();for(const side of ['p1','p2'])for(const id of [205,360]){
  const back=side==='p1',p=c.SpeciesMoves.select(500,id,{}),a=c.SpeciesMoves.sample(p,p.impact,side,false);
  const arm=back?4:2,leg=back?6:4,chest=9;
  assert.ok(Math.abs(c.SpeciesMoves.part(arm,back,a)?.rotation||0)>.8,'Actual forearm does not tuck');
  assert.ok(Math.abs(c.SpeciesMoves.part(leg,back,a)?.rotation||0)>1.4,'Actual leg does not tuck');
  assert.equal(c.SpeciesMoves.part(chest,back,a),null,'Chest cell was treated as a detached foot');
  if(!back)assert.equal(c.SpeciesMoves.part(10,back,a),null,'Second chest cell was treated as a foot');
  const data=c.ROM_SPRITE_ANIM.cache['500-'+(back?'back':'front')].data,rows=data.maps[data.parent[0].frames[0][0]],head=back?[0,11,12]:[0,12,13];
  const joints=head.map(track=>{const row=rows.find(r=>r[0]===track),part=c.SpeciesMoves.part(track,back,a);return [row[1]+part.pivotX,row[2]+part.pivotY,part.rotation,part.y];});
  for(const joint of joints)assert.deepEqual(joint,joints[0],'Flames detach from the head joint');
 }
});
test('contact pauses briefly, rebounds on a hit, and misses turn short without a collision rebound',()=>{
 const c=host();for(const side of ['p1','p2'])for(const id of [205,360]){
  const p=c.SpeciesMoves.select(500,id,{}),at=(f,miss=false)=>c.SpeciesMoves.sample(p,f,side,miss),hit=at(p.impact),miss=at(p.impact,true);
  assert.ok(miss.reach<hit.reach,'Miss reaches the same target contact');
  assert.equal(at(p.impact+3).reach,hit.reach,'Contact is not held');
  assert.ok(at(p.impact+10).reach<hit.reach,'Actor stays inside the target after contact');
  assert.ok(at(p.impact+10).lift>0,'Hit has no physical rebound');
  assert.equal(at(p.impact+10,true).lift,0,'A missed move rebounds against an invisible target');
  const hops=[];for(let f=0;f<=p.frames;f++)if(at(f).emboarReturnHop>0)hops.push(f);
  assert.ok(hops.length>8,'Return has no recovery hop');
  const f=hops[Math.floor(hops.length/2)],a=at(f),back=side==='p1';
  assert.ok(Math.abs(c.SpeciesMoves.part(back?6:4,back,a)?.rotation||0)>.1,'Return hop leaves both legs rigid');
 }
});
test('all hit/miss half-frame poses stay finite and use physical support, then return exactly to rest',()=>{
 const c=host();let count=0;for(const side of ['p1','p2'])for(const id of [205,360])for(const miss of [false,true]){
  const p=c.SpeciesMoves.select(500,id,{}),back=side==='p1',data=c.ROM_SPRITE_ANIM.cache['500-'+(back?'back':'front')].data,rows=data.maps[data.parent[0].frames[0][0]];
  for(let f=0;f<=p.frames;f+=.5){
   const a=c.SpeciesMoves.sample(p,f,side,miss),pose=c.SpeciesMoves.pose(p,f,side,side,miss,layout);
   for(const name of ['x','y','groundX','groundY','groundLift','rotation','scale','scaleX','scaleY','alpha'])assert.ok(Number.isFinite(pose[name]),name+' is not finite');
   assert.ok(!(back?[10,11,12]:[11,12,13]).includes(pose.supportTrack),'Fire or tail supports body weight');
   assert.ok(pose.groundLift>=0);assert.ok(pose.scale>0);
   for(const row of rows){const q=c.SpeciesMoves.part(row[0],back,a);if(q)for(const value of Object.values(q))assert.ok(Number.isFinite(value));}
   count++;
  }
  for(const f of [0,p.frames]){
   const a=c.SpeciesMoves.sample(p,f,side,miss),pose=c.SpeciesMoves.pose(p,f,side,side,miss,layout);
   for(const name of ['emboarGather','emboarReturnHop','reach','roll'])assert.ok(Math.abs(a[name])<1e-12,'Channel does not recover: '+name);
   for(const row of rows)assert.equal(c.SpeciesMoves.part(row[0],back,a)?.rotation||0,0,'Local joint does not recover');
   for(const name of ['x','y','groundX','groundY','groundLift','rotation'])assert.ok(Math.abs(pose[name])<1e-9,'Root does not return: '+name);
  }
 }
 assert.ok(count>2000);
});
test('missing prepared geometry is an error, never an invisible or generic successful pose',()=>{
 const c=host(),p=c.SpeciesMoves.select(500,205,{});delete c.ROM_SPRITE_ANIM.cache['500-back'];
 assert.throws(()=>c.SpeciesMoves.pose(p,p.impact,'p1','p1',false,layout),/ground geometry unavailable/);
});
test('unrelated samples and defender poses delegate the same object without changing the native profile',()=>{
 const c=host(false),prior=c.ChapterMoves.sample,priorPose=c.SpeciesMoves.pose,priorPart=c.SpeciesMoves.part;let sampled,posed,parted;
 c.ChapterMoves.sample=(...args)=>sampled=prior(...args);c.SpeciesMoves.pose=(...args)=>posed=priorPose(...args);c.SpeciesMoves.part=(...args)=>parted=priorPart(...args);
 if(!baseline)vm.runInContext(source,c);
 let pairs=0;for(const [name,row]of Object.entries(c.TRAINING_DATA.progression))for(const id of c.Training.moves(name)){
  const p=c.SpeciesMoves.select(row.id,id,{});if(!p?.chapter||p.species===500&&[205,360].includes(p.id))continue;
  for(const side of ['p1','p2']){sampled=undefined;assert.strictEqual(c.SpeciesMoves.sample(p,p.impact,side,false),sampled,'Unrelated sample changed '+name+'/'+id);}
  pairs++;
 }
 assert.ok(pairs>3900);
 const p=c.SpeciesMoves.select(500,205,{}),profile=JSON.stringify(p);posed=undefined;
 assert.strictEqual(c.SpeciesMoves.pose(p,p.impact,'p2','p1',false,layout),posed);
 parted=undefined;assert.strictEqual(c.SpeciesMoves.part(0,false,{species:495,head:.2,dir:1,glare:0}),parted);
 assert.equal(JSON.stringify(p),profile);
});
test('packaging preserves the four reviewed private08 function bodies and installs idempotently',()=>{
 const c=host(),functions={'SpeciesMoves.part':c.SpeciesMoves.part,'SpeciesMoves.pose':c.SpeciesMoves.pose,'ChapterMoves.sample':c.ChapterMoves.sample,'DemoMoves.sample':c.DemoMoves.sample};
 // The private script was CRLF; the release bundler reads Python text (LF).
 // Preserve the historical raw hashes separately and normalize only EOL here.
 for(const [name,fn]of Object.entries(functions))assert.equal(sha(Function.prototype.toString.call(fn).replace(/\r\n/g,'\n')),geometry.reviewedPrivate08FunctionSHA256LF[name],'Reviewed function changed: '+name);
 const refs=Object.values(functions);assert.equal(c.EmboarMoves.install(),true);vm.runInContext(source,c);
 assert.deepEqual([c.SpeciesMoves.part,c.SpeciesMoves.pose,c.ChapterMoves.sample,c.DemoMoves.sample],refs);
});
