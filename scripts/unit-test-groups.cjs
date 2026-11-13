/* Sequential independent Node processes keep the full suite within bounded
 * per-process budgets and release VM/asset memory between groups. */
function unitStages(files,{exe=process.execPath,windows=process.platform==='win32',groups=8}={}){
 if(!Array.isArray(files)||!files.length||files.some(f=>typeof f!=='string'||!f.endsWith('.test.cjs'))||new Set(files).size!==files.length)throw Error('Invalid unit test inventory');
 if(!Number.isInteger(groups)||groups<1||groups>8)throw Error('Invalid unit group count');
 const buckets=Array.from({length:Math.min(groups,files.length)},()=>[]);
 [...files].sort().forEach((file,index)=>buckets[index%buckets.length].push(file));
 return buckets.map((bucket,index)=>['unit-'+(index+1)+'-of-'+buckets.length,exe,['--test',...(windows?['--test-isolation=none']:['--test-concurrency=2']),...bucket]]);
}
module.exports=unitStages;
