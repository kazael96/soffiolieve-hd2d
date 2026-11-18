const test=require('node:test'),assert=require('node:assert/strict'),H=require('../src/intro-history.js');
test('the montage retains all six requested eras in historical order and reaches HD2D',()=>{
 assert.deepEqual(H.eras.map(e=>e.id),['yellow','gold','emerald','platinum','black','hd2d']);
 assert.deepEqual(H.eras.map(e=>e.size),[[160,144],[160,144],[240,160],[256,192],[256,192],[768,576]]);
 assert.equal(H.eras[0].colors.length,4);for(let i=0;i<6;i++)assert.equal(H.frame(i*54+27).id,H.eras[i].id);assert.equal(H.frame(324).done,true);
});
test('the first city snapshot excludes adjacent maps without modifying the source city or its instances',()=>{
 const base={instances:[{model:'map0',x:0,z:0},{model:'house',x:-7,z:4},{model:'map1',x:-32,z:0},{model:'map3',x:0,z:-32}],permissionGrids:[{x:0,z:0},{x:-32,z:0}]},before=JSON.stringify(base),town=H.townScene(base);
 assert.deepEqual(town.instances.map(i=>i.model),['map0','house']);assert.equal(town.permissionGrids.length,1);assert.equal(JSON.stringify(base),before);assert.notEqual(town.instances,base.instances);assert.throws(()=>H.townScene({...base,instances:[]}),/Soffiolieve/);
});
test('every era has a displayed stable frame at x1/x2/x4, including long frames and hidden intervals',()=>{
 for(const rate of [1,2,4]){const c=H.clock(),seen=new Set();let now=0;c.tick(now);seen.add(0);c.tick(now+=20000,{hidden:true,rate});assert.equal(c.tick(now,{rate}).frame,0);
  for(let i=0;i<2000&&!c.done;i++){const p=c.tick(now+=[16,220,30][i%3],{rate});seen.add(p.frame);}
  assert.equal(c.done,true);for(const f of H.checkpoints)assert.ok(seen.has(f),'Skipped '+f+' at x'+rate);
 }
});
test('history frame boundaries blend only adjacent eras and clamp invalid/finished input',()=>{
 assert.equal(H.frame(-100).id,'yellow');assert.equal(H.frame(10000).id,'hd2d');assert.equal(H.frame(43).index,0);assert.ok(H.frame(43).mix>0&&H.frame(43).mix<1);assert.equal(H.frame(54).index,1);assert.equal(H.frame(54).mix,0);assert.equal(H.frame(323).mix,0);
});
