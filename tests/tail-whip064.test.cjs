'use strict';
// CPU source/integration tests. No DOM, GPU or visual acceptance is inferred.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'..'),site=process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site');
process.env.SOFFIOLIEVE_TEST_SITE=site;
const source=fs.readFileSync(path.join(repo,'src/tail-whip-moves.js'),'utf8'),plain=x=>JSON.parse(JSON.stringify(x)),load=(c,name)=>vm.runInContext(fs.readFileSync(path.join(repo,'src',name+'.js'),'utf8'),c,{filename:name+'.js'});
const assets=new Map(),pins={
 '500-front':['8ea23b2229636e1c710130a3920268b863b27cee79d593f1bbea6b0cb7a8b4fc','0c974285cc883e43ceb35bf43602499387fb13a80f769c3e671eee8391cd49ce'],
 '500-back':['0ed04f265eb27169f0500ba29c14593b44e60862151aafc46e3548c444293adf','7f90ceb11ebb09dbc0c734bf788bcf78322ede69a3456cf8adc00bf555ec76c4'],
 '503-front':['7f6a2dc66f19510e80ff28525676e29fa77283b39ad3c1a18ca50b282cc1de6e','7a72ce9d67a70d90a73d884560f73c6e178657f96940e0eeb3db0dbbeb394b81'],
 '503-back':['d245d455617e51d3bbed044e2c5fb204b27da7e740a763d4691e0822a703fa98','5551d6d169719226f952aac01fe9d885d6ab32f248e31215f98effca7e575bac']
};
function point(x,y,f){const a=f[2]*Math.PI*2/65536,u=x*f[3]/4096,v=y*f[4]/4096;return[f[5]+u*Math.cos(a)-v*Math.sin(a),f[6]+u*Math.sin(a)+v*Math.cos(a)];}
function prepared(c,key){
 if(!assets.has(key)){
  const json=fs.readFileSync(path.join(site,'assets/animated',key+'.json')),png=fs.readFileSync(path.join(site,'assets/animated',key+'.png'));
  for(const [i,value]of[json,png].entries())assert.equal(crypto.createHash('sha256').update(value).digest('hex'),pins[key][i],key+' source changed');
  const data=JSON.parse(json),image=require('./helpers/native-png.cjs')(png),b=[Infinity,Infinity,-Infinity,-Infinity];
  for(const {o,r,f,pf}of c.ROM_SPRITE_ANIM.parts(data,0)){
   const [ix,iy]=data.images[o[4]];
   for(let y=0;y<o[3];y++)for(let x=0;x<o[2];x++){
    const sx=ix+(o[5]?o[2]-1-x:x),sy=iy+(o[6]?o[3]-1-y:y);
    if(image.pixels[(sy*image.width+sx)*4+3]<64)continue;
    for(const dx of[0,1])for(const dy of[0,1]){let [u,v]=point(o[0]+x+dx,o[1]+y+dy,f);[u,v]=point(u+r[1],v+r[2],pf);b[0]=Math.min(b[0],u);b[1]=Math.min(b[1],v);b[2]=Math.max(b[2],u);b[3]=Math.max(b[3],v);}
   }
  }
  assets.set(key,{data,width:image.width,height:image.pixels.length/(image.width*4),groundBounds:b});
 }
 const a=assets.get(key),data=plain(a.data);
 return{ready:true,pending:false,data,bounds:c.ROM_SPRITE_ANIM.bounds(data),groundBounds:a.groundBounds.slice(),image:{width:a.width,height:a.height,cpuFixtureOnly:true}};
}
function host(install=true){
 const c=require('./helpers/finale-moves-host.cjs').setup();
 for(const key of Object.keys(pins))c.ROM_SPRITE_ANIM.cache[key]=prepared(c,key);
 if(install)vm.runInContext(source,c,{filename:'tail-whip-moves.js'});
 return c;
}
function layout(){return{p1:{x:120,y:400,height:160,w:390,h:490},p2:{x:280,y:220,height:110,w:390,h:490}};}
function sample(c,species,f=45,side='p1',miss=false){const p=c.SpeciesMoves.select(species,39,{});return c.SpeciesMoves.pose(p,f,side,side,miss,layout());}
function install(c){return vm.runInContext(source,c,{filename:'tail-whip-moves.js'});}

test('four pinned native banks use identity parent0 and actual tail CEL/rows',()=>{
 const c=host();
 for(const species of[500,503])for(const view of['front','back']){
  const b=c.ROM_SPRITE_ANIM.cache[species+'-'+view],d=c.TailWhipMoves.definitions[species][view];
  assert.deepEqual(plain(c.ROM_SPRITE_ANIM.frame(b.data.parent[0],0)).filter((_,i)=>i!==1),[0,0,4096,4096,0,0]);
  assert.deepEqual(b.data.maps[0].find(r=>r[0]===d.track).slice(1,3),plain(d.row));
  assert.equal(c.ROM_SPRITE_ANIM.frame(b.data.animations[d.track],0)[0],d.cell);
  assert.ok(b.groundBounds.every(Number.isFinite));assert.ok(c.TailWhipMoves.instance.ready(species));
 }
});
test('only two guarded profile entries change; lexical selector and public pose/sample identities remain',()=>{
 const c=host(false),S=c.SpeciesMoves,C=c.ChapterMoves,table=C.profiles,before={...table},select=C.select,pose=S.pose,s=S.sample,draw=S.draw,timeline=S.timeline;
 install(c);assert.equal(C.profiles,table);assert.equal(C.select,select);assert.equal(S.pose,pose);assert.equal(S.sample,s);assert.equal(S.draw,draw);assert.equal(S.timeline,timeline);
 for(const key of Object.keys(before)){
  if(!['500-39','503-39'].includes(key)){assert.equal(table[key],before[key]);continue;}
  const p=table[key],{kind,tailWhip064,...unchanged}=plain(p),{kind:oldKind,...original}=plain(before[key]);
  assert.equal(oldKind,'tailPound');assert.equal(kind,'nativeTailWhipStatus064');assert.deepEqual(unchanged,original);assert.ok(Object.isFrozen(p));
  assert.equal(S.select(p.species,39,{}).kind,kind);
 }
});
test('baseline Samurott moves incorrect limbs; new choreography moves only actual front28/back8 fins',()=>{
 const c=host(false),old=sample(c,503).speciesPose;
 for(const species of[500,503])assert.ok(Math.abs(sample(c,species).x)>0,'reproduce physical approach in status move');
 for(const [back,wrong,fin]of[[false,19,28],[true,10,8]]){
  assert.ok(Math.abs(c.SpeciesMoves.part(wrong,back,old)?.rotation)>0,'reproduce wrong limb');
  assert.equal(c.SpeciesMoves.part(fin,back,old),null,'reproduce unmoving actual fin');
 }
 install(c);const a=sample(c,503).speciesPose;
 for(const back of[false,true])for(const row of c.ROM_SPRITE_ANIM.cache['503-'+(back?'back':'front')].data.maps[0]){
  const p=c.SpeciesMoves.part(row[0],back,a),fin=back?8:28;
  if(row[0]===fin){assert.ok(Math.abs(p.rotation)>0);assert.equal(p.pivotX,0);assert.equal(p.pivotY,0);}else assert.equal(p,null);
 }
});
test('real draw reproduces generic physical tail arc before fix and removes it without replacing draw/audio timeline',()=>{
 const c=host(false);c.BattleGround={layout};
 const ctx={save(){},restore(){},beginPath(){},stroke(){},arc(){throw Error('PHYSICAL_ARC');}},seq={frames:100,audio:[{kind:'sfx',target:16,start:30},{kind:'cry',start:10}]},before={};
 for(const species of[500,503]){const p=c.SpeciesMoves.select(species,39,{});before[species]=plain(c.SpeciesMoves.timeline(seq,p));assert.throws(()=>c.SpeciesMoves.draw(ctx,390,490,{profile:p,side:'p1',targetSide:'p2'},60,'front'),/PHYSICAL_ARC/);}
 install(c);
 for(const species of[500,503]){const p=c.SpeciesMoves.select(species,39,{});assert.doesNotThrow(()=>c.SpeciesMoves.draw(ctx,390,490,{profile:p,side:'p1',targetSide:'p2'},60,'front'));assert.deepEqual(plain(c.SpeciesMoves.timeline(seq,p)),before[species]);assert.equal(p.nativeEffects,true);}
});
test('real lexical poses stay grounded across all127 frames, both roles and misses; native resource ownership is fixed',()=>{
 const c=host();let count=0;
 for(const species of[500,503])for(const side of['p1','p2'])for(const miss of[false,true])for(let f=0;f<=126;f++){
  const p=c.SpeciesMoves.select(species,39,{}),body=c.SpeciesMoves.pose(p,f,side,side,miss,layout()),a=body.speciesPose;
  for(const k of['x','y','groundY','rotation'])assert.equal(Math.abs(body[k]),0,`${species}/${side}/${miss}/${f}/${k}`);
  for(const k of['scale','scaleX','scaleY'])assert.equal(body[k],1);
  for(const k of['reach','lift','feet','crouch','lean','hip','breath','ears','cheeks','jaw','sniff','glare','coil'])assert.equal(a[k],0);
  assert.equal(a.nativeTailWhip,species);assert.equal(a.nativeTick,0);assert.equal(a.nativeParentMap,0);assert.equal(a.roll,undefined);assert.equal(a.nativeCells,undefined);
  for(const owner of[c.ChapterMoves,c.DemoMoves]){
   const direct=owner.sample(p,f,side,miss);
   for(const k of['tail','head','arms','feet','reach','lift','nativeTick','nativeParentMap','nativeTailWhip'])assert.equal(direct[k],a[k],'direct sample wrapper '+k);
  }
  assert.equal(a.dir,side==='p1'?1:-1);
  const view=side==='p1'?'back':'front',d=c.TailWhipMoves.definitions[species][view],part=c.SpeciesMoves.part(d.track,side==='p1',a);
  assert.ok(Math.abs(part.rotation-a.tail*a.dir*.15)<1e-12);
  if(species===500)assert.deepEqual(plain(part),plain(c.TailWhipMoves.instance.previous.part(d.track,side==='p1',a)));
  else assert.equal(a.head,0);
  const defender=c.SpeciesMoves.pose(p,f,side==='p1'?'p2':'p1',side,miss,layout());assert.equal(Math.abs(defender.x),0);assert.equal(defender.rotation,0);
  count++;
 }
 assert.equal(count,1016);
});
test('distinct authored gesture landmarks and recovery endpoints remain explicit',()=>{
 const c=host();
 for(const [species,tail]of[[500,[[.2,-.4],[.36,2],[.55,-.5],[.7,1],[.87,-.35]]],[503,[[.1,-.15],[.25,1.5],[.44,-1.55],[.62,1.35],[.79,-.65],[.93,.15]]]]){
  for(const [t,v]of tail)assert.ok(Math.abs(sample(c,species,t*126).speciesPose.tail-v)<1e-12);
  for(const f of[0,126])for(const k of['tail','head','arms'])assert.equal(Math.abs(sample(c,species,f).speciesPose[k]),0);
 }
 assert.notEqual(sample(c,500,60).speciesPose.tail,sample(c,503,60).speciesPose.tail);
 assert.equal(sample(c,503,45).speciesPose.arms,0);
 assert.ok(Math.abs(sample(c,500,.17*126).speciesPose.head+.12)<1e-12);
 assert.ok(Math.abs(sample(c,500,.21*126).speciesPose.arms+.16)<1e-12);
});
test('non39 profiles sample/part/pose delegate exactly including physical Emboar205/360',async()=>{
 const c=host(false),pairs=[[500,205],[500,360],[500,33],[503,33],[503,534],[495,33],[572,47]],before=[];
 let call;const token={untouched:true};c.SpeciesMoves.prepare=function(...args){call={owner:this,args};return token;};
 for(const [species,id]of pairs){const p=c.SpeciesMoves.select(species,id,{});assert.ok(p);before.push({p,body:plain(c.SpeciesMoves.pose(p,45,'p1','p1',false,layout())),a:plain(c.ChapterMoves.sample(p,45,'p1',false))});}
 install(c);
 for(const {p,body,a}of before){assert.deepEqual(plain(c.SpeciesMoves.pose(p,45,'p1','p1',false,layout())),body);assert.deepEqual(plain(c.ChapterMoves.sample(p,45,'p1',false)),a);const pose=c.SpeciesMoves.sample(p,45,'p1',false);for(let track=0;track<30;track++)assert.deepEqual(plain(c.SpeciesMoves.part(track,false,pose)),plain(c.TailWhipMoves.instance.previous.part(track,false,pose)));}
 const options={probe:1};assert.equal(await c.SpeciesMoves.prepare(before[0].p,options),token);assert.equal(call.owner,c.SpeciesMoves);assert.equal(call.args[0],before[0].p);assert.equal(call.args[1],options);
});
test('prepare blocks active pose until both banks are prepared and awaits existing predecessor',async()=>{
 const c=host(false);let unblock,previousFinished=false;c.SpeciesMoves.prepare=()=>new Promise(resolve=>{unblock=()=>{previousFinished=true;resolve();};});install(c);
 const saved=c.ROM_SPRITE_ANIM.cache['503-back'];delete c.ROM_SPRITE_ANIM.cache['503-back'];let calls=0;
 c.ROM_SPRITE_ANIM.prepare=async(keys,options)=>{assert.equal(previousFinished,true);assert.deepEqual(plain(keys),['503-front','503-back']);assert.deepEqual(plain(options),{gate:false});calls++;c.ROM_SPRITE_ANIM.cache['503-back']=saved;};
 const pending=c.SpeciesMoves.prepare(c.SpeciesMoves.select(503,39,{}));assert.throws(()=>sample(c,503),/completely prepared/);assert.equal(calls,0);unblock();const result=await pending;assert.equal(calls,1);assert.equal(result.representation,'originalNativeParts');assert.doesNotThrow(()=>sample(c,503));
});
test('prepare preserves failed retry errors and does not accept a false-success incomplete bank',async()=>{
 const c=host(),p=c.SpeciesMoves.select(500,39,{}),saved=c.ROM_SPRITE_ANIM.cache['500-front'];delete c.ROM_SPRITE_ANIM.cache['500-front'];let attempts=0;
 c.ROM_SPRITE_ANIM.prepare=async()=>{if(++attempts===1)throw Error('retry transport');if(attempts===3)c.ROM_SPRITE_ANIM.cache['500-front']=saved;return true;};
 await assert.rejects(c.SpeciesMoves.prepare(p),/retry transport/);assert.throws(()=>sample(c,500),/completely prepared/);
 await assert.rejects(c.SpeciesMoves.prepare(p),/completely prepared/);await c.SpeciesMoves.prepare(p);assert.equal(attempts,3);assert.doesNotThrow(()=>sample(c,500));
});
test('active pose rejects missing image/dimensions/bounds/pending on either native view',()=>{
 const c=host();for(const species of[500,503])for(const view of['front','back']){
  const key=species+'-'+view,saved=c.ROM_SPRITE_ANIM.cache[key];
  for(const patch of[{image:null},{image:{}},{image:{width:0,height:512}},{pending:true},{bounds:[0,0,0,1]},{groundBounds:[0,NaN,2,3]}]){c.ROM_SPRITE_ANIM.cache[key]={...saved,...patch};assert.throws(()=>sample(c,species),/completely prepared/);}
  c.ROM_SPRITE_ANIM.cache[key]=saved;
 }
});
test('explicit parent0 identity, CEL and local affine contracts reject altered native data',()=>{
 const c=host();for(const species of[500,503])for(const view of['front','back']){
  const key=species+'-'+view,saved=c.ROM_SPRITE_ANIM.cache[key],d=c.TailWhipMoves.definitions[species][view];
  for(const mutate of[
   data=>{data.maps[1]=plain(data.maps[0]);data.parent[0].frames[0][0]=1;},
   data=>{data.parent[0].frames[0][5]=1;},data=>{data.parent[0].frames[0][3]=4095;},
   data=>{data.maps[0].find(r=>r[0]===d.track)[1]++;},
   data=>{data.animations[d.track].frames[0][0]=0;},data=>{data.animations[d.track].frames[0][2]=1;},
   data=>{data.parent=[];},data=>{data.animations[d.track].frames=[];},
   data=>{data.cells[d.cell]=[];}
  ]){const data=plain(saved.data);mutate(data);c.ROM_SPRITE_ANIM.cache[key]={...saved,data};assert.throws(()=>sample(c,species),/source contract changed/);}
  c.ROM_SPRITE_ANIM.cache[key]=saved;
 }
});
test('installation preflights every profile and writable slot atomically',()=>{
 for(const corrupt of[
  c=>Object.defineProperty(c.ChapterMoves.profiles,'503-39',{writable:false}),
  c=>{c.ChapterMoves.profiles['503-39']={...c.ChapterMoves.profiles['503-39'],impact:59};},
  c=>Object.defineProperty(c.SpeciesMoves,'prepare',{value:()=>{},writable:false})
 ]){const c=host(false);corrupt(c);const refs=[c.ChapterMoves.profiles['500-39'],c.ChapterMoves.sample,c.DemoMoves.sample,c.SpeciesMoves.part,c.SpeciesMoves.prepare];assert.throws(()=>install(c),/TailWhip|original TailWhip/);assert.deepEqual([c.ChapterMoves.profiles['500-39'],c.ChapterMoves.sample,c.DemoMoves.sample,c.SpeciesMoves.part,c.SpeciesMoves.prepare],refs);}
});
test('late first installation fails, repeated correct installation preserves exact owners even after Contact',()=>{
 for(const name of['UnfezantMoves','EmboarContactMoves']){const c=host(false);c[name]=name==='UnfezantMoves'?{}:{instance:{}};const part=c.SpeciesMoves.part;assert.throws(()=>install(c),/before Unfezant/);assert.equal(c.SpeciesMoves.part,part);assert.equal(c.ChapterMoves.profiles['500-39'].kind,'tailPound');}
 const c=host(),refs=[c.SpeciesMoves.part,c.ChapterMoves.sample,c.DemoMoves.sample,c.TailWhipMoves.instance];c.EmboarContactMoves={instance:{}};install(c);assert.deepEqual([c.SpeciesMoves.part,c.ChapterMoves.sample,c.DemoMoves.sample,c.TailWhipMoves.instance],refs);
});
test('real GEN5 Colpocoda preserves both sides HP/PP/defense effects and battle logs',()=>{
 const a=host(false),b=host();
 function run(c,name){const team=[{name,level:54,moves:[39]}],s=new c.GEN5.Session(team,team,{seed:[1,2,3,4]}),start=['p1','p2'].map(side=>({hp:s.battle[side].active[0].hp,pp:s.battle[side].active[0].moveSlots[0].pp}));s.act('move 1');for(const [i,side]of['p1','p2'].entries()){const p=s.battle[side].active[0];assert.equal(p.hp,start[i].hp);assert.equal(p.moveSlots[0].pp,start[i].pp-1);assert.equal(p.boosts.def,-1);}return plain({snap1:s.snapshot('p1'),snap2:s.snapshot('p2'),log:s.battle.log.filter(line=>!line.startsWith('|t:|'))});}
 for(const name of['Emboar','Samurott'])assert.deepEqual(run(a,name),run(b,name));
});
test('real Contact205 accepts correct Tail→Unfezant→Contact order and retains pinned part guard',()=>{
 const c=host();c.performance=performance;c.GameSpeed={now:()=>1000};for(const name of['battle-diorama','battle-ground','double-rules'])load(c,name);
 const team=[{name:'Emboar',level:50,moves:[205,360]}];c.session=new c.GEN5.Session(team,team,{seed:[1,2,3,4]});c.partner=c.session.snapshot('p1');c.enemy=c.session.snapshot('p2');c.visualState={p1:{idleClock:0,idleUpdated:1000},p2:{idleClock:0,idleUpdated:1000}};c.MoveFX={active:null,idleTick:()=>0};c.BattleEnvironment={context:{id:'route1',terrain:'grass'}};
 load(c,'unfezant-moves');load(c,'emboar-contact-moves');const p=c.SpeciesMoves.select(500,205,{}),l=c.BattleGround.layout(390,490);c.MoveFX.active={profile:p,side:'p1',targetSide:'p2',miss:false,hiddenSides:[],cryIds:{p1:500,p2:500}};
 assert.ok(c.SpeciesMoves.pose(p,60,'p1','p1',false,l).emboarContact);const part=c.SpeciesMoves.part;c.SpeciesMoves.part=(...args)=>part(...args);assert.throws(()=>c.SpeciesMoves.pose(p,60,'p1','p1',false,l),/Pinned articulation dependency changed/);
});
