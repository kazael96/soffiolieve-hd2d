const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function setup(season=0){const c={FieldSeason:{current:()=>season},OpelucidChapter:{zones:[157,158,160,161,162,163,164,165,205,206,207,208,345,346,348]},IcirrusChapter:{zones:[113]}};c.window=c;vm.createContext(c);for(const f of ['icirrus-data.js','opelucid-data.js','icirrus-encounters.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',f),'utf8'),c);return c;}
test('Dragonspiral and Route9 use their native land tables in all four seasons',()=>{
 for(let season=0;season<4;season++){const c=setup(season);for(const zone of c.OpelucidChapter.zones){const expected=c.OPELUCID_DATA.encounters[zone].seasons[season].normal,actual=c.IcirrusEncounters.table(zone);assert.ok(actual,'missing table '+zone);assert.equal(actual.rate,expected?.rate||0);assert.equal(JSON.stringify(actual.slots),JSON.stringify(expected?.slots||[]));assert.equal(actual.shaking,undefined);assert.equal(actual.fishing,undefined);}}
});
test('frozen marshes have no land fallback while their native Surf tables stay distinct',()=>{
 const c=setup(3);for(const zone of [345,346]){assert.equal(c.IcirrusEncounters.table(zone).rate,0);assert.equal(c.IcirrusEncounters.water(zone).rate,3);assert.equal(c.IcirrusEncounters.water(zone).rippleSurf,undefined);}assert.equal(c.IcirrusEncounters.water(208).rate,0);assert.equal(c.IcirrusEncounters.water(191),null);
});
test('dark grass is exposed only where the native chapter has it; previous land tables retain ownership',()=>{
 const c=setup();assert.ok(c.IcirrusEncounters.table(206).dark.rate);assert.ok(c.IcirrusEncounters.table(348).dark.rate);assert.equal(c.IcirrusEncounters.table(207).dark,undefined);assert.deepEqual(c.IcirrusEncounters.table(113).slots,c.ICIRRUS_DATA.encounters[113].seasons[0].normal.slots);assert.equal(c.IcirrusEncounters.table(121),null);
});
