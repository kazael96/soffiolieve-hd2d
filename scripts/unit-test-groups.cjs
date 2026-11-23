/* Sequential independent Node processes keep the full suite within bounded
 * per-process budgets and release VM/asset memory between groups. */
function unitStages(files,{exe=process.execPath,windows=process.platform==='win32',groups=8}={}){
 if(!Array.isArray(files)||!files.length||files.some(f=>typeof f!=='string'||!f.endsWith('.test.cjs'))||new Set(files).size!==files.length)throw Error('Invalid unit test inventory');
 if(!Number.isInteger(groups)||groups<1||groups>8)throw Error('Invalid unit group count');
 // These fixtures measure their entire owned process against400MiB. Sharing
 // it with unrelated VM inventories invalidates that resource measurement.
 const boundedNames=new Set(['battle-actor-framing064.test.cjs','emboar-contact064.test.cjs']),name=file=>file.split(/[\\/]/).at(-1);
 // Physical Route10 reunions replay whole native journeys in every season.
 // Isolate their CPU cost after the combined group exceeded180s; this is not
 // an assertion that this fixture measures the entire process RSS.
 const dedicatedNames=new Set([...boundedNames,'league-journeys.test.cjs']);
 const ordered=[...files].sort(),bounded=ordered.filter(file=>dedicatedNames.has(name(file))),ordinary=ordered.filter(file=>!dedicatedNames.has(name(file)));
 const buckets=Array.from({length:Math.min(groups,ordinary.length)},()=>[]);
 ordinary.forEach((file,index)=>buckets[index%buckets.length].push(file));
 const args=bucket=>['--test',...(windows?['--test-isolation=none']:['--test-concurrency=2']),...bucket];
 return [...buckets.map((bucket,index)=>['unit-'+(index+1)+'-of-'+buckets.length,exe,args(bucket)]),...bounded.map((file,index)=>['unit-isolated-'+(index+1)+'-'+name(file).replace('.test.cjs',''),exe,args([file])])];
}
module.exports=unitStages;
