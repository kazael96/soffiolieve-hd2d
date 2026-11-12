/* Original composite frame0 for the thirteen new chapter052 species. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),read=name=>{const text=fs.readFileSync(path.join(root,'src',name+'-data.js'),'utf8');return JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));},old=new Set(Object.values(read('opelucid').progression).map(p=>p.id)),ids=[...new Set(Object.values(read('league').progression).map(p=>p.id))].filter(id=>!old.has(id));
if(ids.length!==13)throw Error('Unexpected new species inventory');
const origin=path.join(__dirname,'extract-mistralton-portraits.cjs'),marker="['521-female','592-female',701,702,703,704,705,706]";let source=fs.readFileSync(origin,'utf8');if(!source.includes(marker))throw Error('Reviewed composite exporter changed');
source=source.replace(marker,JSON.stringify(ids)).replaceAll('provenance-049.json','provenance-052.json').replace('original gender/season portraits','original052 species portraits');
// Never replace a previously reviewed image with different bytes.
const write="fs.writeFileSync(file,bytes);";if(!source.includes(write))throw Error('Reviewed portrait writer changed');
source=source.replace(write,"if(fs.existsSync(file)&&!fs.readFileSync(file).equals(bytes))throw Error('Existing portrait differs: '+file);"+write);
vm.runInNewContext(source,{require:createRequire(origin),__dirname,process,console,Buffer},{filename:origin});
