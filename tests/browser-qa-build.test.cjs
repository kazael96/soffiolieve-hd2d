const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),build=require('../scripts/build-browser-qa.cjs');
function fixture(t){const parent=path.resolve(os.tmpdir()),dir=fs.mkdtempSync(path.join(parent,'soffiolieve-qa-'));t.after(()=>{assert.equal(path.dirname(path.resolve(dir)),parent);assert.ok(path.basename(dir).startsWith('soffiolieve-qa-'));fs.rmSync(dir,{recursive:true,force:true});});const site=path.join(dir,'site');fs.mkdirSync(site);const html='<html lang="it"><head><script>window.SpeciesStudioMode=["snivy"].some(x=>false);</script></head><body></body></html>';fs.writeFileSync(path.join(site,'index.html'),html);return {dir,site,html};}
test('browser QA detaches save storage before app initialization and preserves the published index',t=>{const f=fixture(t),out=path.join(f.dir,'qa');build(f.site,out);const html=fs.readFileSync(path.join(out,'index.html'),'utf8');assert.ok(html.includes('window.SpeciesStudioMode=true;'));assert.ok(html.indexOf('DeepQAEarlyErrors')<html.indexOf('window.SpeciesStudioMode'));assert.ok(html.includes('/__qa/browser-qa.js'));assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),f.html);assert.ok(fs.existsSync(path.join(out,'browser-qa.js')));});
test('browser QA refuses to write test controls into the published site',t=>{const f=fixture(t);assert.throws(()=>build(f.site,path.join(f.site,'qa')),/outside/);assert.equal(fs.readdirSync(f.site).length,1);});

test('the full Gym GPU case receives the same expected input route as the field-frame regression',t=>{
 const f=fixture(t),out=path.join(f.dir,'qa');build(f.site,out);const script=fs.readFileSync(path.join(out,'browser-qa.js'),'utf8'),route=JSON.parse(script.match(/const brycenInput051=([\s\S]*?);\s*case049\('qaGymFull051'/)[1]);
 assert.deepEqual(route,require('./fixtures/brycen-input-route.json'));assert.equal(script.includes('/*QA_BRYCEN_INPUT*/null'),false);assert.ok(script.includes("case049('qaGymFull051'"));assert.equal(fs.existsSync(path.join(f.site,'browser-qa.js')),false);
 const html=fs.readFileSync(path.join(out,'index.html'),'utf8'),revision=html.match(/data-qa-fixture="([^"]+)"/)[1];assert.ok(html.includes('/__qa/browser-qa.js?v='+revision),'The transformed input reference must invalidate the browser script cache too');
});
test('an unrecognized startup format fails instead of running tests against real player storage',t=>{const f=fixture(t);fs.writeFileSync(path.join(f.site,'index.html'),'<html><head></head><body></body></html>');const out=path.join(f.dir,'qa');assert.throws(()=>build(f.site,out),/isolation/);assert.equal(fs.existsSync(out),false);});

test('the input health monitor is delivered before the QA driver and never inserted into the release',t=>{
 const f=fixture(t),out=path.join(f.dir,'qa');build(f.site,out);
 const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
 assert.ok(html.indexOf('/__qa/qa-input-health.js')<html.indexOf('/__qa/browser-qa.js'));
 assert.equal(fs.readFileSync(path.join(out,'qa-input-health.js'),'utf8'),fs.readFileSync(path.join(__dirname,'qa-input-health.js'),'utf8'));
 assert.equal(fs.existsSync(path.join(f.site,'qa-input-health.js')),false);
 assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),f.html);
});

test('the explicit Gym052 preview stays inside the QA index, filters future areas, and installs audio after prior catalogs',t=>{
 const f=fixture(t),out=path.join(f.dir,'qa'),preview=require('../scripts/gym-preview052.cjs');
 const html=f.html.replace('</head>','<script src="opelucid-bootstrap.js?v=build"></script><script src="opelucid-audio.js?v=build"></script><script src="training-moves.js?v=build"></script><script src="opelucid-badge-assets.js?v=build"></script><script src="opelucid-battles.js?v=build"></script><script src="opelucid-menu.js?v=build"></script></head>');fs.writeFileSync(path.join(f.site,'index.html'),html);
 const source=fs.readFileSync(path.join(__dirname,'../scripts/gym-preview052.cjs'),'utf8'),names=[...source.matchAll(/'(league-[a-z-]+|trainer-intro-music(?:-data)?)'/g)].map(m=>m[1]);
 for(const name of new Set(names))fs.writeFileSync(path.join(f.site,name+'.js'),'/* isolated file fixture */');
 build(f.site,out,{preview:'leagueGym'});const result=fs.readFileSync(path.join(out,'index.html'),'utf8');
 assert.ok(result.indexOf('src="league-gym-install.js"')<result.indexOf('src="opelucid-bootstrap.js'));
 assert.ok(result.indexOf('src="league-audio.js"')>result.indexOf('src="opelucid-audio.js'));
 assert.ok(result.includes('LEAGUE_SCENES={121:LEAGUE_SCENES[121]}'));assert.ok(result.includes('zoneFamily:{121:"drayden"}'));
 assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),html);
 build(f.site,path.join(f.dir,'fields'),{preview:'leagueFields'});const fields=fs.readFileSync(path.join(f.dir,'fields/index.html'),'utf8');assert.ok(fields.includes('052 native field components'));assert.ok(!fields.includes('LEAGUE_SCENES={121:'));assert.ok(fields.includes('src="league-camera-data.js"'));assert.ok(fields.includes('src="league-camera.js"'));assert.equal(fs.readFileSync(path.join(f.site,'index.html'),'utf8'),html);
 assert.throws(()=>build(f.site,path.join(f.dir,'bad'),{preview:'arbitrary'}),/Unsupported/);
 fs.unlinkSync(path.join(f.site,'league-gym-install.js'));assert.throws(()=>preview.inject(html,f.site),/Missing Gym052/);
});
