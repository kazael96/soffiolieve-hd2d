const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function host(){const c={structuredClone};c.window=c;vm.createContext(c);for(const file of ['finale-scenes','finale-data','finale-progression','native-return-location-data','native-return-location'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);c.TRAINING_DATA=c.FINALE_DATA;for(const file of ['training','pokemon-storage','story-state'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);return c;}
test('all23 finale scenes retain declared wide-map positions and legacy XP through disk storage',()=>{
 const c=host(),store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
 for(const [zone,scene]of Object.entries(c.FINALE_SCENES))for(const grid of scene.permissionGrids){
  const s={...c.StoryState.fresh(),phase:'opelucid',scene:'zone'+zone,starter:'Snivy',party:[{name:'Serperior',level:70,xp:500000,hp:1,pp:[]}],player:{x:grid.x+4.5,y:grid.z+4.5},original:{zone:+zone,flags:[185],vars:{16566:4},firstEndingWins:[228,229,230,231,587],returnContext:12,extraItems:{1:1}}};
  assert.equal(c.StoryState.write(storage,s),true,'write '+zone);const saved=c.StoryState.read(storage);
  assert.deepEqual(JSON.parse(JSON.stringify(saved.player)),s.player,'position '+zone);assert.equal(saved.original.zone,+zone);assert.equal(saved.party[0].level,70);assert.equal(saved.party[0].xp,500000);assert.equal(saved.original.extraItems[1],1);assert.equal(saved.original.returnContext,12);assert.equal(c.Training.limit(saved.original),31,'badge threshold remains required');
 }
});
test('corrupt finale subrecords are isolated without losing the party or inventing final completion',()=>{
 const c=host(),s={...c.StoryState.fresh(),phase:'opelucid',scene:'zone278',starter:'Snivy',party:[{name:'Serperior',level:54,xp:123456,hp:1,pp:[]}],original:{zone:278,flags:[],vars:{16566:3},firstEndingWins:[228,228,'587',999],returnContext:99}};
 const next=c.StoryState.normalize(s);assert.ok(next);assert.deepEqual(Array.from(next.original.firstEndingWins),[228]);assert.equal(next.original.returnContext,undefined);assert.equal(next.original.vars[16566],3);assert.equal(next.party[0].xp,123456);
 for(const zone of [145,147,150,279])assert.equal(c.StoryState.normalize({...s,scene:'zone'+zone,original:{zone}}),null,'excluded '+zone);
});
