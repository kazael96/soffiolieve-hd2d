const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {create}=require('../src/native-return-location.js');
const text=fs.readFileSync('src/native-return-location-data.js','utf8'),data=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
test('League context12 resolves the native Center1467/12, never map12',()=>{
 const api=create(data),s={healZone:123,hp:1};assert.equal(api.set(s,12),true);
 assert.deepEqual(api.respawn(s),{zone:146,x:7,z:12,facing:1});assert.equal(s.healZone,123);assert.equal(s.hp,1);
 const loaded=JSON.parse(JSON.stringify(s));api.normalize(loaded);assert.deepEqual(api.respawn(loaded),api.respawn(s));
});
test('native guard rejects invalid contexts without replacing a valid return or curing the party',()=>{
 const api=create(data),s={returnContext:12,party:[{hp:0,status:'psn'}]};
 for(const id of [0,-1,18,65535,NaN,1.2,'12',null]){assert.equal(api.set(s,id),false);assert.equal(s.returnContext,12);}
 assert.deepEqual(s.party,[{hp:0,status:'psn'}]);
});
test('missing legacy context keeps its ordinary heal destination; invalid saved context is isolated',()=>{
 const api=create(data),s={healZone:398};assert.equal(api.respawn(s),null);api.normalize(s);assert.deepEqual(s,{healZone:398});
 s.returnContext=99;api.normalize(s);assert.deepEqual(s,{healZone:398});
 for(let id=1;id<=17;id++){api.set(s,id);const p=api.respawn(s);assert.ok(Number.isInteger(p.zone)&&p.zone>0);assert.ok(p.x>=0&&p.x<=255&&p.z>=0&&p.z<=255);}
});
test('visiting a different native healing Center replaces the previous League context',()=>{
 const api=create(data),s={returnContext:12};assert.equal(api.setCenter(s,122),true);assert.equal(s.returnContext,10);
 assert.deepEqual(api.respawn(s),{zone:122,x:7,z:12,facing:1});
 assert.equal(api.setCenter(s,999),false);assert.equal(s.returnContext,10);
});
