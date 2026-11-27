'use strict';
// Production lookup regression against actual catalogs. No browser/FPS or gameplay speed claim.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{performance}=require('node:perf_hooks');
const repo=path.resolve(process.env.SOFFIOLIEVE_TEST_REPO||path.join(__dirname,'..'));
const site=path.resolve(process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site'));
const old=fs.readFileSync(path.join(__dirname,'fixtures/pokemon-visuals-before-nullish064.js'),'utf8');
const next=fs.readFileSync(path.join(repo,'src/pokemon-visuals.js'),'utf8');
const native={};native.window=native;vm.createContext(native);
for(const file of ['assets/form-sprites.js','assets/battle-data.js','battle-sim.js','training-data.js','league-data.js','finale-data.js','pokedex-assets.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),native,{filename:'ACTUAL/'+file});
const progression=Object.assign({},native.TRAINING_DATA.progression,native.LEAGUE_DATA.progression,native.FINALE_DATA.progression),rows=[],clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const normal=x=>typeof x==='bigint'?{bigint:String(x)}:x===undefined?{undefined:true}:typeof x==='number'&&!Number.isFinite(x)?{number:String(x)}:x&&typeof x==='object'?Array.isArray(x)?x.map(normal):Object.fromEntries(Object.keys(x).map(k=>[k,normal(x[k])])):x;
const outcome=fn=>{try{return{ok:true,value:normal(fn())};}catch(e){return{ok:false,error:e.name,message:e.message};}};
const zero=()=>({formsRootReads:0,formEnumerations:0,formValueReads:0,gen5RootReads:0,romRootReads:0,speciesFindReads:0,speciesIndexReads:0});
function api(source,config='both',instrument=false,formsPresent=true){
 const counts=zero(),c={};c.window=c;const catalog=entries=>instrument?new Proxy(entries,{get(t,k,r){if(k==='find')counts.speciesFindReads++;if(typeof k==='string'&&/^\d+$/.test(k))counts.speciesIndexReads++;return Reflect.get(t,k,r);}}):entries;
 const forms=formsPresent?(instrument?new Proxy(native.ROM_FORM_SPRITES,{ownKeys(t){counts.formEnumerations++;return Reflect.ownKeys(t);},get(t,k,r){counts.formValueReads++;return Reflect.get(t,k,r);}}):native.ROM_FORM_SPRITES):undefined;
 const gen=config==='gen5'||config==='both'?{species:catalog(native.GEN5.species)}:config==='empty-gen5'?{species:catalog([])}:undefined,rom=config==='rom'||config==='both'||config==='empty-gen5'?{species:catalog(native.ROM_BATTLE.species)}:undefined;
 for(const[key,get,value]of[['ROM_FORM_SPRITES','formsRootReads',forms],['GEN5','gen5RootReads',gen],['ROM_BATTLE','romRootReads',rom]])Object.defineProperty(c,key,{configurable:true,get(){if(instrument)counts[get]++;return value;}});
 c.TRAINING_DATA={...native.TRAINING_DATA,progression};c.POKEDEX_ASSETS=native.POKEDEX_ASSETS;c.Journey={state:{dex:{appearances:{}},party:[]}};vm.createContext(c);vm.runInContext(source,c,{filename:'PRIVATE/pokemon-visuals.js'});
 return{c,p:c.PokemonVisuals,counts,reset(){Object.assign(counts,zero());}};
}
function same(before,after,method,input,...args){assert.deepEqual(outcome(()=>after[method](input,...args)),outcome(()=>before[method](input,...args)),method+':'+String(input?.name??input));}
function models(){return native.GEN5.species.filter(p=>p.id>0).map(p=>({name:p.en||p.name,id:p.id,gender:p.id%2?'F':'M',nickname:'Compagno '+p.id}));}
test('actual source catalogs contain no legitimate nullish graphic alias or positive-ID empty normalized name',()=>{
 assert.equal(Object.keys(native.ROM_FORM_SPRITES).length,76);assert(!Object.hasOwn(native.ROM_FORM_SPRITES,''));
 for(const[name,f]of Object.entries(native.ROM_FORM_SPRITES)){assert(Object.hasOwn(f,'graphic'),name);assert.notEqual(f.graphic,undefined,name);assert.notEqual(f.graphic,null,name);}
 const empties=[];for(const[name,catalog]of[['ROM_BATTLE',native.ROM_BATTLE.species],['GEN5',native.GEN5.species]])for(const p of catalog)for(const field of['name','en'])if(p[field]&&!clean(p[field])){assert.equal(p.id,0,'Nullish old lookup could otherwise resolve a real species: '+name);empties.push({catalog:name,id:p.id,field,value:p[field]});}
 rows.push({test:'actual-catalog-audit',formRows:Object.keys(native.ROM_FORM_SPRITES).length,ROMspecies:native.ROM_BATTLE.species.length,GEN5species:native.GEN5.species.length,integratedProgression:Object.keys(progression).length,emptyNormalizedSentinels:empties});
});

test('undefined and null keep current zero output while performing zero catalog reads in every supported availability configuration',()=>{
 for(const config of['rom','gen5','both','none','empty-gen5'])for(const forms of[true,false]){
  const before=api(old,config,true,forms),after=api(next,config,true,forms);
  for(const value of[undefined,null]){before.reset();after.reset();assert.equal(before.p.speciesId(value),0);assert.equal(after.p.speciesId(value),0);assert.deepEqual(after.counts,zero());assert(Object.values(before.counts).some(n=>n>0));rows.push({test:'nullish-zero-reads',config,forms,value:value===null?'null':'undefined',before:{...before.counts},after:{...after.counts}});}
 }
});

test('all actual species IDs/localized names/English aliases and every form graphic preserve scalar outputs',()=>{
 const cases=[];for(const name of['ROM_BATTLE','GEN5'])for(const p of native[name].species){cases.push(p.id);if(p.name)cases.push(p.name);if(p.en)cases.push(p.en);}
 for(const[name,f]of Object.entries(native.ROM_FORM_SPRITES))cases.push(name,f.graphic,String(f.graphic));
 cases.push('',0,false,true,NaN,Infinity,-1,'unknown-pokemon',699,701,702,703,704,705,706,'521-female','592-female','593-female');
 let checks=0;for(const config of['rom','gen5','both','none','empty-gen5']){const before=api(old,config),after=api(next,config);for(const value of cases){same(before.p,after.p,'speciesId',value);checks++;}}
 rows.push({test:'complete-native-scalar-equivalence',cases:cases.length,configs:5,checks});
});

test('actual structured mons, missing fields, gender/season/form/nickname and current appearance fallbacks preserve every output',()=>{
 const before=api(old),after=api(next);let checks=0;
 for(const mon of models())for(const input of[{...mon},{name:mon.name},{id:mon.id},{speciesId:mon.id},{id:null,name:mon.name},{speciesId:null,id:mon.id},{id:undefined,name:mon.name},{name:mon.name,nickname:'Nick '+mon.id,species:{name:mon.name,id:mon.id}}]){same(before.p,after.p,'speciesId',input);checks++;}
 const extra=[{},undefined,null,{name:'unknown nickname',species:'Snivy'},{speciesName:'Snivy'},{species:{name:'Minccino'}},{name:'DeerlingWinter'},{name:'Sawsbuck',season:'Autumn'},...models()];
 for(const id of[521,592,593,585,586])for(const gender of['F','M','N'])for(const form of[0,1,2,3,'Spring','Summer','Autumn','Winter'])extra.push({id,gender,form,name:({521:'Unfezant',592:'Frillish',593:'Jellicent',585:'Deerling',586:'Sawsbuck'})[id]});
 for(const mon of extra)for(const method of['speciesId','graphic','form','identity','menuId','portraitSrc']){same(before.p,after.p,method,mon);checks++;}for(const mon of extra){same(before.p,after.p,'portraitSrc',mon,true);checks++;}
 for(const[name,record]of Object.entries(progression)){
  for(const h of[before,after]){h.c.Journey.state.party=[{name,gender:'F',form:1,nickname:'Nick '+name}];h.c.Journey.state.dex.appearances[record.dexName||name]={name,gender:'M',form:2};}
  for(const options of[{}, {gender:'M',form:3},{pokemon:{name,gender:'F',form:0,nickname:'Nome personale'}}]){same(before.p,after.p,'appearance',name,options);checks++;}
 }
 rows.push({test:'structured-and-appearance-equivalence',checks,sourceModels:models().length});
});

test('real Session snapshots retain graphic/species identity and remove only missing-field scans',()=>{
 const s=new native.GEN5.Session([{name:'Minccino',level:25,moves:[3],gender:'F'}],[{name:'Snivy',level:25,moves:[33],gender:'M'}],{seed:[1,2,3,4]}),before=api(old,'both',true),after=api(next,'both',true);
 for(const side of['p1','p2']){const mon=s.snapshot(side),inputBefore=normal(mon);for(const method of['speciesId','graphic','identity','menuId','portraitSrc']){before.reset();after.reset();same(before.p,after.p,method,mon);assert(after.counts.formEnumerations<=before.counts.formEnumerations);assert(after.counts.speciesIndexReads<=before.counts.speciesIndexReads);rows.push({test:'actual-session-snapshot-lookups',side,method,before:{...before.counts},after:{...after.counts}});}assert.deepEqual(normal(mon),inputBefore,'Lookup must not mutate actual snapshot');}
});

