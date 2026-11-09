const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const reads=[],released=[],prepared=[],c={TextDecoder,OPENING_ASSETS:{models:{},textures:{},scenes:{}},OPENING_SPRITES:{},OPENING_DATA:{},TRAINING_DATA:{},PINWHEEL_RAILS:{},OPELUCID_RAILS:{},LEAGUE_RAILS:{121:{original:true},214:{original:true}},OPELUCID_SPRITES:{},OPELUCID_DATA:{levelCap:43,capSteps:[]},NativeTextLayout:{resource:f=>f},NativeStory:{state:{zone:121,fieldHeight:9,vars:{}}},NativeRails:{locate:(zone,x,z,hint)=>x===999?null:{height:hint.height,line:0}}};
 c.NativeSurfaces={create:input=>{c.samplerInput=input;return {at:()=>({height:2,flags:0})};}};
 for(const key of ['evolutions','progression','pokemonData','compatibility','machines']){c.TRAINING_DATA[key]={};c.OPELUCID_DATA[key]={};}
 c.window=c;c.OPELUCID_SCENES={114:{family:'brycen',sourceMatrix:1},120:{family:'opelucid',sourceMatrix:0}};
 c.LEAGUE_SCENES={121:{family:'drayden',sourceMatrix:66},214:{family:'victoryOutside',sourceMatrix:162},136:{family:'leagueEntry',sourceMatrix:87}};
 function manifest(scenes,prefix){const families={},zoneFamily={};for(const [id,scene]of Object.entries(scenes)){families[scene.family]={src:prefix+'-'+scene.family+'-assets.js',pack:'assets/'+prefix+'-'+scene.family+'-pack.bin',zones:[+id],...(prefix==='league'?{variable:'LEAGUE_PART_ASSETS'}:{})};zoneFamily[id]=scene.family;}return {residentLimit:3,families,zoneFamily};}
 c.OPELUCID_PARTS=manifest(c.OPELUCID_SCENES,'opelucid');c.LEAGUE_PARTS=manifest(c.LEAGUE_SCENES,'league');
 c.IcirrusChapter={zones:[],ensure:async()=>{c.NATIVE_SURFACE_DATA={grids:{},scenes:{}};}};
 c.LeagueGym={install(){},prepare:async()=>{prepared.push(121);return true;},release:()=>released.push('gym')};
 c.RuntimeAssets={releaseImages:f=>released.push(f),preloadImages:async()=>true,bytes:async file=>{
  reads.push(file);if(file.endsWith('surface-data.js'))return Buffer.from('window.'+(file.startsWith('league')?'LEAGUE':'OPELUCID')+'_SURFACE_DATA='+JSON.stringify({grids:{},scenes:{120:[{member:file.startsWith('league')?999:74}]}})+';');
  const pair=[...Object.entries(c.OPELUCID_PARTS.families),...Object.entries(c.LEAGUE_PARTS.families)].flatMap(([name,part])=>[[name,part],...Object.values(part.seasons||{}).map(row=>[name,row])]).find(([name,part])=>part.src===file);if(!pair)throw Error('Unexpected catalog '+file);
  const [name,part]=pair;return Buffer.from('window.'+(part.variable||'OPELUCID_PART_ASSETS')+'='+JSON.stringify({family:name,...(part.season!==undefined?{season:part.season}:{}),models:{[name]:{groups:[],season:part.season??0}},textures:{},scenes:Object.fromEntries(part.zones.map(z=>[z,{instances:[{model:name}]}])),sprites:{}})+';');
 }};
 vm.createContext(c);for(const file of ['league-geography','league-surfaces','opelucid-resource-cache','opelucid-family-loader','opelucid-scene-window','opelucid-bootstrap'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);
 return {c,reads,released,prepared};
}
test('one registered chapter owns old and new scene handles with a shared three-family cache',async()=>{
 const {c,reads,released,prepared}=setup(),old=c.OpelucidChapter.scene(120),gym=c.OpelucidChapter.scene(121);assert.equal(reads.length,0);assert.equal(c.OpelucidChapter.zones.length,5);
 for(const zone of [114,121,214,136])assert.equal(await c.OpelucidChapter.ensure(zone),true);
 assert.equal(c.OPENING_ASSETS.scenes.zone120,old);assert.equal(c.OPENING_ASSETS.scenes.zone121,gym);assert.deepEqual(Array.from(c.OpelucidChapter.loader.stats().resident),['drayden','victoryOutside','leagueEntry']);assert.equal(c.OPENING_ASSETS.models.brycen,undefined);assert.equal(c.OpelucidChapter.scene(114).assetsPending,true);assert.deepEqual(prepared,[121]);assert.ok(released.includes('assets/opelucid-brycen-pack.bin'));assert.equal(reads.filter(f=>f.endsWith('surface-data.js')).length,2);
 assert.equal(c.PINWHEEL_RAILS[121],c.LEAGUE_RAILS[121]);c.OpelucidChapter.loader.clear();assert.ok(released.includes('gym'));
});
test('new native rail floors cannot silently fall back to a WB plane when the rail is blocked',async()=>{
 const {c}=setup();await c.OpelucidChapter.ensure(121);assert.equal(c.OpelucidChapter.surfaceAt(121,0,0,9).height,9);assert.equal(c.OpelucidChapter.surfaceAt(121,999,0,9),null);assert.equal(c.OpelucidChapter.blockedAt(121,999,0),true);assert.equal(c.OpelucidChapter.blockedAt(121,0,0),false);
});
test('Gym WB floors work without ribbons while the NG Victory exterior never borrows a WB floor',async()=>{
 const {c}=setup();await c.OpelucidChapter.ensure(121);c.NativeStory.state.fieldHeight=2;assert.equal(c.OpelucidChapter.blockedAt(121,999,0),false);assert.equal(c.OpelucidChapter.surfaceAt(121,999,0,2).height,2);assert.equal(c.OpelucidChapter.surfaceAt(214,999,0,2),null);assert.equal(c.OpelucidChapter.blockedAt(214,999,0),true);
});
test('an unavailable Gym controller leaves the descriptor pending and can recover on a later preparation',async()=>{
 const {c}=setup(),gym=c.LeagueGym;delete c.LeagueGym;await assert.rejects(c.OpelucidChapter.ensure(121),/Meccanismi/);assert.equal(c.OpelucidChapter.scene(121).assetsPending,true);c.LeagueGym=gym;assert.equal(await c.OpelucidChapter.ensure(121),true);assert.equal(c.OpelucidChapter.scene(121).assetsPending,false);
});
test('supplementary surface records cannot replace the previous owner of the three shared scenes',async()=>{
 const {c}=setup();await c.OpelucidChapter.ensure(114);assert.equal(c.samplerInput.scenes[120][0].member,74);
});
function seasonal(f){const {c}=f;let current=0;c.FieldSeason={current:()=>current};vm.runInContext(fs.readFileSync('src/league-seasons.js','utf8'),c);const part=c.LEAGUE_PARTS.families.leagueEntry;part.seasons=Object.fromEntries([0,1,2,3].map(season=>[season,{...part,season,src:'league-leagueEntry-season'+season+'-assets.js',pack:'assets/league-leagueEntry-season'+season+'-pack.bin'}]));return value=>current=value;}
test('a season change uses a new part under the same canonical scene handle and three-family budget',async()=>{
 const f=setup(),set=seasonal(f),{c,reads,released}=f,scene=c.OpelucidChapter.scene(136);await c.OpelucidChapter.ensure(136);assert.equal(c.OPENING_ASSETS.models.leagueEntry.season,0);set(3);await scene.ensureAssets();assert.equal(c.OPENING_ASSETS.scenes.zone136,scene);assert.equal(c.OPENING_ASSETS.models.leagueEntry.season,3);assert.equal(c.OpelucidChapter.loader.stats().limit,3);assert.ok(reads.includes('league-leagueEntry-season3-assets.js'));assert.ok(released.includes('assets/league-leagueEntry-season0-pack.bin'));
});
test('a pending preparation for the old season cannot complete as the current same-scene request',async()=>{
 const f=setup(),set=seasonal(f),{c}=f,waiting=new Map();c.RuntimeAssets.preloadImages=pack=>new Promise(done=>waiting.set(pack,done));const old=c.OpelucidChapter.ensure(136);await new Promise(done=>setImmediate(done));assert.ok(waiting.has('assets/league-leagueEntry-season0-pack.bin'));set(1);const current=c.OpelucidChapter.ensure(136);await new Promise(done=>setImmediate(done));waiting.get('assets/league-leagueEntry-season0-pack.bin')(true);await new Promise(done=>setImmediate(done));assert.ok(waiting.has('assets/league-leagueEntry-season1-pack.bin'));waiting.get('assets/league-leagueEntry-season1-pack.bin')(true);assert.equal(await old,false);assert.equal(await current,true);assert.equal(c.OPENING_ASSETS.models.leagueEntry.season,1);assert.equal(c.OpelucidChapter.scene(136).assetsPending,false);
});
