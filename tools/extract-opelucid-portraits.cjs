/* Native frame0 portraits through the actual composite renderer, not an atlas crop. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),read=n=>{const s=fs.readFileSync(path.join(root,'src',n+'-data.js'),'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));},old=new Set(Object.values(read('icirrus').progression).map(p=>p.id)),ids=[...new Set(Object.values(read('opelucid').progression).map(p=>p.id))].filter(id=>!old.has(id));
const origin=path.join(__dirname,'extract-mistralton-portraits.cjs');let source=fs.readFileSync(origin,'utf8');const marker="['521-female','592-female',701,702,703,704,705,706]";if(!source.includes(marker))throw Error('Portrait exporter changed');
source=source.replace(marker,JSON.stringify([...ids,'593-female'])).replaceAll('provenance-049.json','provenance-051.json').replace('original gender/season portraits','original051 species/gender portraits');
vm.runInNewContext(source,{require:createRequire(origin),__dirname,process,console,Buffer},{filename:origin});
