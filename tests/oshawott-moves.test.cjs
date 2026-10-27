const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const O=require('../src/oshawott-moves.js'),T=require('../src/tepig-moves.js'),S=require('../src/species-moves.js');
const layout={p1:{x:300,y:380,height:150,w:1000,h:475},p2:{x:640,y:285,height:110,w:1000,h:475}};
test('Oshawott selects its three level-10 pairs with distinct shared-move choreography',()=>{
 assert.deepEqual(Object.keys(O.profiles).map(Number).sort((a,b)=>a-b),[33,39,55]);for(const p of Object.values(O.profiles)){assert.equal(S.select(501,p.id),p);assert.ok(Object.isFrozen(p));assert.equal(S.select(504,p.id),null);}
 assert.notEqual(S.select(501,33),S.select(495,33));assert.notEqual(S.select(501,39),S.select(498,39));assert.notDeepEqual(S.sample(O.profiles[33],44),S.sample(T.profiles[33],41));
});
test('Oshawott original head torso arms tail and feet have distinct finite gestures and return to rest',()=>{
 const signatures=[];for(const p of Object.values(O.profiles))for(const side of ['p1','p2']){
  const a=S.sample(p,p.impact,side);signatures.push(JSON.stringify([a.head,a.tail,a.arms,a.reach]));
  for(const back of [false,true]){const roles=O.tracks[back?'back':'front'];assert.deepEqual(Object.keys(roles).sort(),['arms','body','feet','head','tail']);assert.ok(Object.values(roles).flat().some(i=>Math.abs(S.part(i,back,a)?.rotation||0)>.05));for(const f of [0,p.frames])for(const i of Object.values(roles).flat()){const q=S.part(i,back,S.sample(p,f,side));assert.ok(Math.abs(q?.rotation||0)<1e-8);assert.ok(Math.abs((q?.scaleX||1)-1)<1e-8);}}
  for(let f=0;f<=p.frames;f++)for(const miss of [true,false]){const q=S.pose(p,f,side,side,miss,layout);for(const k of ['x','y','groundY','scale','rotation'])assert.ok(Number.isFinite(q[k]));assert.ok(q.scale>0&&q.scaleX>0&&q.scaleY>0);}
  if(p.id===33){const contact=S.pose(p,p.impact,side,side,false,layout);assert.ok(Math.sin(contact.rotation)*(side==='p1'?1:-1)>0,'Tackle must lean the head towards its opponent');}
  const q=S.pose(p,p.frames,side,side,false,layout);assert.ok(Math.abs(q.x)+Math.abs(q.y)+Math.abs(q.rotation)<1e-8);
 }assert.equal(new Set(signatures).size,3);
});
test('Oshawott Tail Whip and misses do not recoil the target; Tackle misses stop early',()=>{
 for(const p of Object.values(O.profiles))for(const side of ['p1','p2'])for(let f=0;f<=p.frames;f++)for(const miss of [true,false])if(miss||p.id===39){const q=S.pose(p,f,side==='p1'?'p2':'p1',side,miss,layout);assert.ok(Math.abs(q.x)===0);assert.ok(Math.abs(q.rotation)===0);}
 for(const side of ['p1','p2']){const target=layout[side],q=O.aim(target,true);assert.ok(q.y<target.y-target.height,'missed water must pass above the complete silhouette');assert.equal(q.x,target.x);}
 assert.ok(O.sample(O.profiles[33],44,'p1',true).reach<O.sample(O.profiles[33],44,'p1',false).reach);
});
test('Water Gun starts at the emission-time mouth, reaches impact68 and has a finite trailing edge',()=>{
 const births=[],origin=f=>{births.push(f);return{x:f,y:100}},target={x:600,y:200};const first=O.waterPackets(40,origin,target,100)[0];assert.equal(first.x,40);assert.equal(first.y,100);
 const hit=O.waterPackets(68,origin,target,100).find(e=>e.n===0);assert.equal(hit.x,600);assert.equal(hit.y,200);assert.ok(births.every(f=>f>=40&&f<=68.8));assert.equal(O.waterPackets(126,origin,target,100).length,0);
 for(const dir of [-1,1])for(const height of [80,150])for(let f=0;f<=126;f++)for(const q of O.waterPackets(f,()=>({x:dir*300,y:200}),{x:dir*600,y:150},height)){for(const k of ['x','y','r','alpha'])assert.ok(Number.isFinite(q[k]));assert.ok(q.r>0&&q.alpha>=0&&q.alpha<=1);}
});
test('Oshawott mouth follows the head neck pivot and cheek scale on both original composites',()=>{
 const prior=global.ROM_SPRITE_ANIM;global.ROM_SPRITE_ANIM={cache:{}};for(const [side,key,y]of [['p1','501-back',-25],['p2','501-front',-26]]){global.ROM_SPRITE_ANIM.cache[key]={groundBounds:[-20,-40,20,0],data:{maps:[[[0,0,y]]]}};const rest=O.mouth(side,O.sample(O.profiles[55],0,side)),spout=O.mouth(side,O.sample(O.profiles[55],60,side));assert.equal(rest.x,side==='p1'?.325:-.05);assert.equal(rest.y,side==='p1'?-.575:-.55);assert.notDeepEqual(rest,spout);}
 global.ROM_SPRITE_ANIM=prior;
});
test('MoveFX selects Oshawott only for its actual attacker and preserves prior starters',async()=>{
 const window={},c={window,Image:class{},setTimeout,clearTimeout,performance};vm.createContext(c);for(const file of ['species-moves','tepig-moves','oshawott-moves'])vm.runInContext(fs.readFileSync(require.resolve('../src/'+file+'.js'),'utf8'),c);c.SpeciesMoves=window.SpeciesMoves;
 window.ROM_MOVE_FX={moves:Object.fromEntries([33,39,55].map(id=>[id,{id,variants:[{commands:[]}]}])),spas:{}};vm.runInContext(fs.readFileSync(require.resolve('../src/move-fx.js'),'utf8'),c);
 for(const id of [33,39,55])for(const side of ['p1','p2']){await window.MoveFX.preview(id,side,0,{cryIds:{p1:501,p2:501}});assert.equal(window.MoveFX.active.profile.key,'oshawott-'+id);assert.equal(window.MoveFX.speciesPose(side,501).species,501);assert.equal(window.MoveFX.speciesPose(side,498),null);}
 for(const [species,key]of [[495,'snivy-33'],[498,'tepig-33']]){await window.MoveFX.preview(33,'p1',0,{cryIds:{p1:species,p2:501}});assert.equal(window.MoveFX.active.profile.key,key);}window.MoveFX.cancel();
});
