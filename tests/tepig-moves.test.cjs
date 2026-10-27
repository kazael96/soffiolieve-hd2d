const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const T=require('../src/tepig-moves.js'),S=require('../src/species-moves.js');
const layout={p1:{x:300,y:380,height:150,w:1000,h:475},p2:{x:640,y:285,height:110,w:1000,h:475}};
test('Ember bursts start at the emission-time muzzle and arrive with the sound impact',()=>{
 const births=[],origin=f=>{births.push(f);return{x:f,y:100}},target={x:600,y:200};
 const atBirth=T.emberParticles(38,origin,target,100);assert.equal(atBirth.length,1);assert.equal(atBirth[0].x,38);assert.equal(atBirth[0].y,100);
 const atImpact=T.emberParticles(65,origin,target,100).find(e=>e.n===0);assert.equal(atImpact.x,600);assert.equal(atImpact.y,200);assert.ok(births.every(f=>f>=38&&f<=61));
 assert.equal(T.emberParticles(120,origin,target,100).length,0);
});
test('Ember trails stay finite and fade out in both field directions at phone and desktop scales',()=>{
 for(const direction of [-1,1])for(const height of [80,150])for(let f=0;f<=120;f++)for(const e of T.emberParticles(f,()=>({x:direction*300,y:200}),{x:direction*650,y:150},height)){for(const key of ['x','y','angle','size','alpha'])assert.ok(Number.isFinite(e[key]));assert.ok(e.size>0&&e.alpha>=0&&e.alpha<=1);}
});
test('Tepig selects exactly its four level-10 pairs; shared Tackle remains distinct from Snivy',()=>{
 assert.deepEqual(Object.keys(T.profiles).map(Number).sort((a,b)=>a-b),[33,39,52,316]);
 for(const p of Object.values(T.profiles)){assert.equal(S.select(498,p.id),p);assert.ok(Object.isFrozen(p));assert.equal(S.select(506,p.id),null);}
 assert.notEqual(S.select(498,33),S.select(495,33));assert.notDeepEqual(S.sample(T.profiles[33],40),S.sample(S.profiles[33],40));
});
test('Tepig body poses are finite, distinct and return every part to rest on both sides',()=>{
 const gestures=[];
 for(const p of Object.values(T.profiles))for(const side of ['p1','p2']){
  const a=S.sample(p,p.impact,side);gestures.push(JSON.stringify([a.head,a.tail,a.ears,a.breath,a.reach]));
  for(const back of [true,false]){assert.ok(Object.values(T.tracks[back?'back':'front']).flat().map(i=>S.part(i,back,a)).some(v=>Math.abs(v?.rotation||0)>.03));for(const f of [0,p.frames])for(const i of Object.values(T.tracks[back?'back':'front']).flat()){const v=S.part(i,back,S.sample(p,f,side));assert.ok(Math.abs(v?.rotation||0)<1e-8);assert.ok(Math.abs((v?.scaleX||1)-1)<1e-8);}}
  for(let f=0;f<=p.frames;f++)for(const miss of [true,false]){const v=S.pose(p,f,side,side,miss,layout);for(const key of ['x','y','scale','rotation','groundY'])assert.ok(Number.isFinite(v[key]));assert.ok(v.scale>0&&v.scaleX>0&&v.scaleY>0);}
  const rest=S.pose(p,p.frames,side,side,false,layout);assert.ok(Math.abs(rest.x)+Math.abs(rest.y)+Math.abs(rest.rotation)<1e-8);
 }assert.equal(new Set(gestures).size,4);
});
test('tail cord and ball share a pivot transform; ears and sniffing head animate separately',()=>{
 for(const back of [true,false])for(let f=0;f<=108;f++){const a=T.sample(T.profiles[39],f);assert.deepEqual(T.part(7,back,a),T.part(8,back,a));}
 const a=T.sample(T.profiles[316],75);assert.notDeepEqual(T.part(0,false,a),T.part(2,false,a));
 // Hip pivots sit inside the original leg cells, rather than rotating a leg
 // around the origin at the ground and pulling it away from the body.
 for(const back of [false,true])for(const track of [4,5,6]){const foot=T.part(track,back,T.sample(T.profiles[33],34));assert.ok(Number.isFinite(foot.pivotX));assert.ok(foot.pivotY<0);assert.equal(foot.y,undefined);}
});
test('Tepig status moves and missed attacks do not recoil the target',()=>{
 for(const p of Object.values(T.profiles))for(const side of ['p1','p2'])for(let f=0;f<=p.frames;f++)for(const miss of [true,false])if(miss||[39,316].includes(p.id)){const v=S.pose(p,f,side==='p1'?'p2':'p1',side,miss,layout);assert.ok(Math.abs(v.x)===0);assert.ok(Math.abs(v.rotation)===0);}
 assert.ok(T.sample(T.profiles[33],41,'p1',true).reach<T.sample(T.profiles[33],41,'p1',false).reach);
});
test('muzzle landmark follows the head joint on front and back original composites',()=>{
 const prior=global.ROM_SPRITE_ANIM;global.ROM_SPRITE_ANIM={cache:{}};
 for(const [side,key,r] of [['p1','498-back',[0,-1,-12]],['p2','498-front',[0,-2,-11]]]){
  global.ROM_SPRITE_ANIM.cache[key]={groundBounds:[-25,-40,25,0],data:{maps:[[r]]}};
  const rest=T.muzzle(side,T.sample(T.profiles[52],0,side)),breath=T.muzzle(side,T.sample(T.profiles[52],60,side));assert.ok(Number.isFinite(rest.x)&&Number.isFinite(rest.y));assert.notDeepEqual(rest,breath);assert.ok(side==='p1'?rest.x>0:rest.x<0);
  assert.equal(rest.x,side==='p1'?.325:-.45);assert.equal(rest.y,side==='p1'?-.425:-.375);
 }global.ROM_SPRITE_ANIM=prior;
});
test('actual MoveFX resolves Tepig profiles for attacker only and preserves Snivy selection',async()=>{
 const window={},context={window,Image:class{},setTimeout,clearTimeout,performance};vm.createContext(context);
 for(const file of ['species-moves','tepig-moves'])vm.runInContext(fs.readFileSync(require.resolve('../src/'+file+'.js'),'utf8'),context);context.SpeciesMoves=window.SpeciesMoves;
 window.ROM_MOVE_FX={moves:Object.fromEntries([33,39,52,316].map(id=>[id,{id,variants:[{commands:[]}]}])),spas:{}};
 vm.runInContext(fs.readFileSync(require.resolve('../src/move-fx.js'),'utf8'),context);
 for(const id of [33,39,52,316])for(const side of ['p1','p2']){await window.MoveFX.preview(id,side,0,{cryIds:{p1:498,p2:498}});assert.equal(window.MoveFX.active.profile.key,'tepig-'+id);assert.equal(window.MoveFX.speciesPose(side,498).species,498);assert.equal(window.MoveFX.speciesPose(side,495),null);}
 await window.MoveFX.preview(33,'p1',0,{cryIds:{p1:495,p2:498}});assert.equal(window.MoveFX.active.profile.key,'snivy-33');window.MoveFX.cancel();
});
