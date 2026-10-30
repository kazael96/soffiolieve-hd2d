/* Generates an isolated fixture only. Never overlays or edits the release directory. */
const fs=require('fs'),path=require('path');
function build(input,output){const site=path.resolve(input),out=path.resolve(output);
if(site===out||out.startsWith(site+path.sep))throw Error('QA output must be outside the published site');
let html=fs.readFileSync(path.join(site,'index.html'),'utf8');
// The release uses the valid optional-head syntax. Install hooks there too.
if(!/<head\b/i.test(html))html=html.replace(/(<html\b[^>]*>)/i,'$1\n<head>').replace(/(<body\b)/i,'</head>\n$1');
const fixture=require('crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../tests/browser-qa.js'))).update(fs.readFileSync(path.join(__dirname,'../tests/ambient-audit.js'))).update(fs.readFileSync(__filename)).digest('hex').slice(0,16);
html=html.replace(/<title>[^<]*<\/title>/,'<title>Collaudo approfondito · 0.43</title>').replace('<html ', '<html data-qa-fixture="'+fixture+'" ');
html=html.replace('<head>','<head><base href="/"><script>window.DeepQAEarlyErrors=[];addEventListener("error",e=>DeepQAEarlyErrors.push(e.message));addEventListener("unhandledrejection",e=>DeepQAEarlyErrors.push(String(e.reason)));</script>').replace(/window.SpeciesStudioMode=\[[^;]+;/,'window.SpeciesStudioMode=true;');
if(!html.includes('window.SpeciesStudioMode=true;'))throw Error('Save isolation could not be installed');
// Deliberately fail a complete image request only in the isolated fault fixture.
html=html.replace('<head>','<head><script>if(new URLSearchParams(location.search).get("battleResourceFault")==="1"){window.QABattleResourceFault={attempts:0,failures:0};Object.defineProperty(window,"RuntimeAssets",{configurable:true,set(api){Object.defineProperty(window,"RuntimeAssets",{value:api,writable:true,configurable:true});const image=api.image;api.image=src=>{if(src.includes("move-panel-type-11.png")){QABattleResourceFault.attempts++;if(QABattleResourceFault.failures===0){QABattleResourceFault.failures++;return Promise.reject(Error("QA: temporary battle UI image failure"));}}return image(src);};}});}</script>');
html=html.replace('</body>','<script src="/__qa/ambient-audit.js?v='+fixture+'"></script><script src="/__qa/browser-qa.js?v='+require('crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../tests/browser-qa.js'))).digest('hex').slice(0,12)+'"></script></body>');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html);fs.copyFileSync(path.join(__dirname,'../tests/browser-qa.js'),path.join(out,'browser-qa.js'));fs.copyFileSync(path.join(__dirname,'../tests/ambient-audit.js'),path.join(out,'ambient-audit.js'));console.log('Generated isolated QA fixture in '+out);
}
if(require.main===module)build(process.argv[2]||'_site',process.argv[3]||'test-results/browser-site');module.exports=build;
