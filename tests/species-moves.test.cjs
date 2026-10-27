const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('../src/species-moves.js');
const layout={p1:{x:300,y:380,height:150,w:1000,h:475},p2:{x:640,y:285,height:110,w:1000,h:475}};
test('Snivy coverage is exactly its four level-10 moves; unimplemented species retain native effects',()=>{
 assert.deepEqual(Object.keys(S.profiles).map(Number).sort((a,b)=>a-b),[22,33,35,43]);
 for(const id of [22,33,35,43]){assert.equal(S.select(495,id).species,495);assert.equal(S.select(506,id),null);}
 assert.equal(S.select(495,52),null);
});
test('all four choreographies deform named original parts and return to rest on both sides',()=>{
 const signatures=[];
 for(const p of Object.values(S.profiles))for(const side of ['p1','p2']){
  const a=S.sample(p,p.impact,side);signatures.push(JSON.stringify([a.lean,a.head,a.tail,a.arms,a.reach]));
  for(const back of [false,true]){const parts=Object.values(S.tracks[back?'back':'front']).flat().map(track=>S.part(track,back,a));assert.ok(parts.some(v=>Math.abs(v?.rotation||0)>.05));}
  for(let f=0;f<=p.frames;f++)for(const miss of [false,true])for(const who of ['p1','p2']){const pose=S.pose(p,f,who,side,miss,layout);for(const k of ['x','y','rotation','alpha','scale'])assert.ok(Number.isFinite(pose[k]),p.key+' '+k);}
  for(const f of [0,p.frames]){const pose=S.pose(p,f,side,side,false,layout);for(const k of ['x','y','rotation'])assert.ok(Math.abs(pose[k])<1e-8);assert.equal(pose.scaleY,1);}
 }
 assert.equal(new Set(signatures).size,4);
});
test('misses never recoil or bind the target; tackle stops before contact',()=>{
 for(const p of Object.values(S.profiles))for(const side of ['p1','p2'])for(let f=0;f<=p.frames;f++){
  const v=S.pose(p,f,side==='p1'?'p2':'p1',side,true,layout);assert.ok(Math.abs(v.x)===0);assert.ok(Math.abs(v.rotation)===0);
 }
 assert.ok(S.sample(S.profiles[33],38,'p1',true).reach<S.sample(S.profiles[33],38,'p1',false).reach);
});
test('sound scheduling follows authored impact while retaining original control events',()=>{
 const seq={frames:200,audio:[{kind:'sfx',start:20,id:123},{kind:'control',start:25,raw:[1]},{kind:'cry',start:10}],events:[]};
 for(const p of Object.values(S.profiles)){const out=S.timeline(seq,p);assert.equal(out.frames,p.frames);assert.equal(out.audio[0].start,p.impact);assert.equal(out.audio[0].id,123);assert.deepEqual(out.audio[1].raw,[1]);assert.equal(seq.frames,200);}
 const whip=S.timeline({frames:100,audio:[{kind:'sfx',target:14,start:10},{kind:'sfx',target:16,start:20},{kind:'sfx',target:16,start:27}]},S.profiles[22]);assert.ok(whip.audio[0].start<51);assert.equal(whip.audio[1].start,51);
 const wrap=S.timeline({frames:196,audio:[{kind:'sfx',target:16,start:24},{kind:'sfx',target:16,start:144}]},S.profiles[35]);assert.ok(wrap.audio[1].start<138,'late original wrap sounds must remain audible before the action ends');
});
test('MoveFX preview selects species profile only for the actual attacking Snivy',async()=>{
 const window={SpeciesMoves:S,ROM_MOVE_FX:{moves:{33:{id:33,variants:[{commands:[]}]}},spas:{}}};
 const context={window,SpeciesMoves:S,Image:class{},setTimeout,clearTimeout,performance};vm.runInNewContext(fs.readFileSync(require.resolve('../src/move-fx.js'),'utf8'),context);
 await window.MoveFX.preview(33,'p1',0,{cryIds:{p1:495,p2:506}});assert.equal(window.MoveFX.active.profile.key,'snivy-33');assert.equal(window.MoveFX.speciesPose('p2',495),null);assert.ok(window.MoveFX.speciesPose('p1',495));
 await window.MoveFX.preview(33,'p2',0,{cryIds:{p1:495,p2:506}});assert.equal(window.MoveFX.active.profile,null);window.MoveFX.cancel();
});
