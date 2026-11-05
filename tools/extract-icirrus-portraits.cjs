/* Rasterize frame0 through the actual Nitro player, preserving its ground anchor. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),read=n=>JSON.parse(fs.readFileSync(path.join(root,'src',n+'-data.js'),'utf8').split('=',2)[1].replace(/;\s*$/,'')),old=new Set(Object.values(read('mistralton').progression).map(p=>p.id)),ids=[...new Set(Object.values(read('icirrus').progression).map(p=>p.id))].filter(id=>!old.has(id));
const origin=path.join(__dirname,'extract-mistralton-portraits.cjs');let source=fs.readFileSync(origin,'utf8');
const previous="['521-female','592-female',701,702,703,704,705,706]";if(!source.includes(previous))throw Error('Portrait exporter changed');
source=source.replace(previous,JSON.stringify(ids)).replaceAll('provenance-049.json','provenance-050.json').replace('original gender/season portraits','original species portraits');
vm.runInNewContext(source,{require:createRequire(origin),__dirname,process,console,Buffer},{filename:origin});
