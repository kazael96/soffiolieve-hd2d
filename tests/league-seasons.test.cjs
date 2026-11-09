const test=require('node:test'),assert=require('node:assert/strict'),{partFor}=require('../src/league-seasons.js'),{parse}=require('../src/opelucid-family-loader.js');
function part(){return {zones:[136,146],src:'base.js',seasons:Object.fromEntries([0,1,2,3].map(season=>[season,{season,zones:[136,146],variable:'LEAGUE_PART_ASSETS',src:'s'+season+'.js',pack:'s'+season}]))};}
test('all four native seasonal parts preserve the whole geographic family, including its unchanging interior',()=>{
 const row=part(),before=JSON.stringify(row);for(let i=0;i<4;i++)assert.equal(partFor('leagueEntry',row,i),row.seasons[i]);assert.equal(JSON.stringify(row),before);const indoor={zones:[121]};assert.equal(partFor('drayden',indoor,3),indoor);
});
test('missing or corrupt seasons fail instead of displaying an arbitrary earlier terrain',()=>{
 for(const season of [-1,4,'1',NaN])assert.throws(()=>partFor('leagueEntry',part(),season),/non valida/);
 const row=part();delete row.seasons[2];assert.throws(()=>partFor('leagueEntry',row,2),/incompleto/);row.seasons[2]={season:2,zones:[136],variable:'LEAGUE_PART_ASSETS'};assert.throws(()=>partFor('leagueEntry',row,2),/incompleto/);
});
test('a declared seasonal catalog cannot install data for another season',()=>{
 const row={zones:[136],variable:'LEAGUE_PART_ASSETS',season:3},data={family:'leagueEntry',season:0,models:{},textures:{},sprites:{},scenes:{136:{instances:[]}}};assert.throws(()=>parse(Buffer.from('window.LEAGUE_PART_ASSETS='+JSON.stringify(data)+';'),'leagueEntry',row),/Stagione geografica errata/);
});
