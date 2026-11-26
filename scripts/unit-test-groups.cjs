/* Sequential independent Node processes keep the full suite within bounded
 * per-process budgets and release VM/asset memory between groups. */
const {isolationFlag}=require('./node-test-options.cjs');
function baseUnitStages(files,{exe=process.execPath,windows=process.platform==='win32',groups=8,nodeVersion=process.versions.node}={}){
 if(!Array.isArray(files)||!files.length||files.some(f=>typeof f!=='string'||!f.endsWith('.test.cjs'))||new Set(files).size!==files.length)throw Error('Invalid unit test inventory');
 if(!Number.isInteger(groups)||groups<1||groups>8)throw Error('Invalid unit group count');
 const noIsolation=isolationFlag(nodeVersion);
 // These fixtures measure their entire owned process against400MiB. Sharing
 // it with unrelated VM inventories invalidates that resource measurement.
 const boundedNames=new Set(['battle-actor-framing064.test.cjs','emboar-contact064.test.cjs','ambient-readback064.test.cjs']),name=file=>file.split(/[\\/]/).at(-1);
 // Physical Route10 reunions replay whole native journeys in every season.
 // Isolate their CPU cost after the combined group exceeded180s; this is not
 // an assertion that this fixture measures the entire process RSS.
 const dedicatedNames=new Set([...boundedNames,'league-journeys.test.cjs','native602-density064.test.cjs']);
 const ordered=[...files].sort(),bounded=ordered.filter(file=>dedicatedNames.has(name(file))&&name(file)!=='ambient-readback064.test.cjs').concat(ordered.filter(file=>name(file)==='ambient-readback064.test.cjs')),ordinary=ordered.filter(file=>!dedicatedNames.has(name(file)));
 const buckets=Array.from({length:Math.min(groups,ordinary.length)},()=>[]);
 ordinary.forEach((file,index)=>buckets[index%buckets.length].push(file));
 const args=bucket=>bucket.length===1&&name(bucket[0])==='ambient-readback064.test.cjs'?['--expose-gc','--max-old-space-size=400','--test',noIsolation,...bucket]:['--test',...(windows?[noIsolation]:['--test-concurrency=2']),...bucket];
 return [...buckets.map((bucket,index)=>['unit-'+(index+1)+'-of-'+buckets.length,exe,args(bucket)]),...bounded.map((file,index)=>['unit-isolated-'+(index+1)+'-'+name(file).replace('.test.cjs',''),exe,args([file])])];
}
function unitStages(files,options={}){
 if(!Array.isArray(files)||!files.length||files.some(f=>typeof f!=='string'||!f.endsWith('.test.cjs'))||new Set(files).size!==files.length)throw Error('Invalid unit test inventory');
 // Keep the two native541 files in ONE directly owned, sequential GC host.
 // Remove them before the previous scheduler so all previous52 argv stay exact.
 const tail541Names=['native-tail541-protocol064.test.cjs','native-tail541-audio064.test.cjs'],basename=file=>file.split(/[\\/]/).at(-1),selected=new Map();
 for(const file of files)if(tail541Names.includes(basename(file))){if(selected.has(basename(file)))throw Error('Ambiguous native-tail541 paired basename');selected.set(basename(file),file);}
 if(selected.size){
  if(selected.size!==tail541Names.length)throw Error('Incomplete native-tail541 paired catalog');
  const {exe=process.execPath,nodeVersion=process.versions.node,groups=8}=options;if(!Number.isInteger(groups)||groups<1||groups>8)throw Error('Invalid unit group count');
  const previousFiles=files.filter(file=>!tail541Names.includes(basename(file))),previous=previousFiles.length?unitStages(previousFiles,options):[];
  return [...previous,['unit-native-tail541',exe,['--expose-gc','--max-old-space-size=400','--require',require('node:path').resolve(__dirname,'../tests/helpers/native-tail541-metrics064.cjs'),'--test',isolationFlag(nodeVersion),'--test-concurrency=1',...tail541Names.map(name=>selected.get(name))]]];
 }
 const lifecycle=require('./liepard-lifecycle-stages064.cjs');
 return lifecycle.applies(files)?lifecycle.augment(baseUnitStages,files,{...options,dedicatedFromOtherWork:['native602-density064.test.cjs']}):baseUnitStages(files,options);
}
module.exports=unitStages;
