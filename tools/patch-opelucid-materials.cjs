/* Preserve GLB alpha modes in the new deferred native scene catalog. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const origin=path.join(__dirname,'patch-icirrus-materials.cjs'),source=fs.readFileSync(origin,'utf8').replaceAll('ICIRRUS_ASSETS','OPELUCID_ASSETS');
vm.runInNewContext(source,{require:createRequire(origin),process,console,Buffer,__dirname},{filename:origin});
