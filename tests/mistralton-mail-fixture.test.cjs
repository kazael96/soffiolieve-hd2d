const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('mail browser fixture approaches clerk7 across the actual D4 counter from a walkable tile',()=>{
 const source=fs.readFileSync(path.join(__dirname,'browser-qa.js'),'utf8'),mail=source.slice(source.indexOf("case049('qaMail049'"),source.indexOf("case049('qaCache049'")),entry=mail.match(/await enter049\((\d+),(\d+),(\d+)\)/);
 assert.ok(entry);const [zone,x,z]=entry.slice(1).map(Number);assert.deepEqual([zone,x,z],[99,9,18]);assert.match(mail,/facing=9;document\.getElementById\('interact'\)\.click\(\)/);
 const c={window:{}};for(const file of ['driftveil-assets.js','driftveil-events.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),c);
 const grid=c.window.DRIFTVEIL_ASSETS.scenes[99].permissionGrids[0],actors=c.window.DRIFTVEIL_EVENTS.zones[99].actors,cell=(x,z)=>grid.bytes.slice(8+(z*32+x)*8,12+(z*32+x)*8),clerk=actors.find(a=>a.id===7);
 assert.equal(cell(x,z)[2]&1,0,'Fixture starts on actual floor');assert.equal(cell(x+1,z)[0],0xd4,'Counter behavior must be preserved');assert.equal(cell(x+1,z)[2]&1,1,'Counter remains physically blocked');assert.equal(clerk.x,x+2);assert.equal(clerk.z,z);assert.equal(clerk.script,4);assert.equal(clerk.direction,2);
});
