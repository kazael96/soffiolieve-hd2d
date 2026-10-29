const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const D=require('../src/demo-moves.js');
for(const file of ['purrloin','tepig','oshawott','patrat','lillipup'])require('../src/'+file+'-moves.js');
const S=require('../src/species-moves.js'),R=require('../src/battle-reactions.js');
const layout={p1:{x:300,y:430,height:170,w:1000,h:650},p2:{x:680,y:300,height:120,w:1000,h:650}};
// Independent IRBI level-up inventory (all levels, not only the first ten).
const learned={495:[33,43,22,35,74,536,73,72,21,348,489,202,378,380,437],498:[33,39,52,316,111,488,123,205,36,535,372,53,457,46,394],501:[33,39,55,346,116,534,210,352,279,453,227,401,514,14,56],504:[33,43,44,117,197,28,242,95,162,495,526,158,212,226,21],506:[43,33,316,44,270,36,526,242,46,514,179,387,416],509:[10,45,274,28,154,228,259,252,468,372,163,445,400,289,417,389],572:[1]};
test('all 97 reachable adventure pairs have profiles, including tutorial and depleted PP',()=>{
 let count=0;for(const [species,ids]of Object.entries(learned))for(const id of [...ids,165]){const p=S.select(species,id);assert.equal(p?.species,+species,species+' / '+id);assert.equal(p.id,id);count++;}assert.equal(count,97);assert.equal(Object.keys(D.profiles).length,76);
 const data={window:{}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../src/accumula-events.js'),'utf8'),data);assert.deepEqual(Array.from(data.window.ACCUMULA_EVENTS.trainer.party[0].moves),[10,45],'N keeps his explicit two-move team while wild Purrloin can learn Assist');assert.equal(S.select(572,52),null,'debug arbitrary moves are not adventure learnsets');
});
test('new bodies remain finite, mirrored and grounded; every pose recovers',()=>{
 for(const p of Object.values(D.profiles)){
  for(let f=0;f<=p.frames;f++){
   const a=S.sample(p,f,'p1'),b=S.sample(p,f,'p2');assert.equal(a.dir,-b.dir);assert.equal(a.head,b.head);assert.equal(a.reach,b.reach);assert.equal(a.species,p.species);
   for(const side of ['p1','p2']){const pose=S.pose(p,f,side,side,false,layout);for(const [key,value]of Object.entries(pose))if(typeof value==='number')assert.ok(Number.isFinite(value),p.key+' '+key);assert.ok(pose.scale>0&&pose.scaleX>0&&pose.scaleY>0);assert.ok(pose.groundY!==undefined);}
  }
  for(const f of [0,p.frames]){const a=S.sample(p,f);for(const k of ['reach','crouch','lift','head','tail','arms','feet','lean','breath','coil'])assert.ok(Math.abs(a[k])<1e-8,p.key+' did not recover '+k);}
 }
});
test('shared moves retain visibly different species staging and rig attachments',()=>{
 for(const id of [21,36,242,526,46,514,165]){
  const pp=Object.values(D.profiles).filter(p=>p.id===id);const signatures=pp.map(p=>{const a=S.sample(p,p.impact);return JSON.stringify([a.head,a.tail,a.arms,a.feet,a.reach,a.crouch,D.rigs[p.species][p.attachment]]);});assert.equal(new Set(signatures).size,pp.length,'same choreography pasted across species for '+id);
 }
 const p=D.profiles['572-1'],a=S.sample(p,p.impact);assert.ok(Math.abs(S.part(10,false,a).rotation)>0);assert.ok(Math.abs(S.part(7,true,a).rotation)>0);assert.equal(S.part(5,false,a),null,'body should not inherit tail rotation');
});
test('Tepig rolls about its body centre with the lower silhouette on the ground',()=>{
 const p=D.profiles['498-205'];for(const side of ['p1','p2'])for(let f=0;f<=p.frames;f++){
  const pose=S.pose(p,f,side,side,false,layout),h=layout[side].height*pose.scale*pose.scaleY,w=layout[side].height*pose.scale*pose.scaleX*.75,s=Math.min(layout[side].w/1000,layout[side].h/650),theta=pose.rotation;
  const bottom=pose.y*s-Math.cos(theta)*h*.5+(Math.abs(Math.sin(theta))*w+Math.abs(Math.cos(theta))*h)*.5;assert.ok(Math.abs(bottom-pose.groundY*s)<1e-7,'silhouette floated or sank at '+f+' '+side);
 }
});
test('self actions never produce an opponent damage reaction and misses suppress reactions',()=>{
 for(const p of Object.values(D.profiles))for(const id of Object.keys(D.rigs)){
  assert.equal(R.sample(p,p.impact+10,'p2',id,true),null);
  if(p.target==='self')assert.equal(R.sample(p,p.impact+10,'p2',id),null);
  else assert.ok(R.sample(p,p.impact+10,'p2',id),p.key+' has no defender reaction for '+id);
 }
});
test('native particles, camera and effects retain their own clock; audio aligns with impact',async()=>{
 const ctx={window:null,DemoMoves:D,SpeciesMoves:S,Image:class{},performance,setTimeout,clearTimeout,arena:{width:1000,height:650},BattleGround:{layout:()=>layout},ROM_MOVE_FX:{moves:{53:{id:53,variants:[{commands:[[52,[123,0,16,20]],[4,[80]]]}]}},spas:{}}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../src/move-fx.js'),'utf8'),ctx);
 await ctx.MoveFX.preview(53,'p1',0,{cryIds:{p1:498,p2:572}});const x=ctx.MoveFX.active;assert.equal(x.profile.key,'tepig-53');assert.equal(x.sequence.audio[0].start,x.profile.impact);assert.equal(x.sequence.nativeAnchor,20);assert.ok(x.profile.nativeEffects);assert.equal(x.targetSide,'p2');ctx.MoveFX.cancel();
 const seq={frames:200,events:[{start:30,end:90}],visual:[{op:1,start:20,end:100}],clact:[{start:20,end:70}],audio:[{kind:'sfx',start:20,target:16}]};const p=D.profiles['498-53'],out=S.timeline(seq,p);assert.equal(out.events,seq.events);assert.equal(out.visual,seq.visual);assert.equal(out.clact,seq.clact);assert.equal(out.frames,p.frames);assert.equal(out.nativeFrames,200);
});
