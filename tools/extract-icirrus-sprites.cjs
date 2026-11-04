/* Reuse the reviewed Nitro decoder on the24 new species, directly from IRBI. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),work=path.dirname(root),rom=process.argv[2];if(!rom)throw Error('Pass the supplied IRBI ROM path');
const descriptor=fs.openSync(rom,'r'),header=Buffer.alloc(16);try{fs.readSync(descriptor,header,0,16,0);}finally{fs.closeSync(descriptor);}if(header.toString('ascii',12,16)!=='IRBI')throw Error('Italian Black IRBI is required');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,'src',n+'-data.js'),'utf8').split('=',2)[1].replace(/;\s*$/,'')),oldIds=new Set(Object.values(read('mistralton').progression).map(p=>p.id)),ids=[...new Set(Object.values(read('icirrus').progression).map(p=>p.id))].filter(id=>!oldIds.has(id));
const origin=path.join(work,'soffiolieve/extract-pokemon-animations.cjs'),helper=path.join(work,'soffiolieve/rom-tools.cjs'),out=path.join(root,'src/assets/animated'),proof=path.resolve(root,'../../outputs/chapter050');
fs.mkdirSync(out,{recursive:true});
const moduleRecord={exports:{}},helperSource=fs.readFileSync(helper,'utf8').replace(/const romPath='[^']+';/,'const romPath='+JSON.stringify(path.resolve(rom))+';');
vm.runInNewContext(helperSource,{require:createRequire(helper),module:moduleRecord,exports:moduleRecord.exports,Buffer,__dirname:path.dirname(helper)},{filename:helper});
const original=fs.readFileSync(origin,'utf8'),source=original.split('let report=')[0].replace("path.join(__dirname,'dist/assets/animated')",JSON.stringify(out)),load=createRequire(origin),scope={require:name=>name==='./rom-tools.cjs'?moduleRecord.exports:load(name),__dirname:path.dirname(origin),console,Buffer};
vm.createContext(scope);vm.runInContext(source+'\nthis.extract=extract;',scope,{filename:origin});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),records=[];
for(const id of ids)for(const back of [false,true]){
 const result=scope.extract(id,back);for(const ext of ['json','png']){const file=path.join(out,result.key+'.'+ext);records.push({asset:path.relative(root,file).replaceAll('\\','/'),species:id,back,source:'IRBI a/0/0/4 Nitro composite '+id+' '+(back?'back':'front'),sha256:hash(fs.readFileSync(file))});}
}
const report={source:'IRBI a/0/0/4 NCGR/NCER/NANR/NMCR/NMAR; original Nitro decoder',decoderSHA256:hash(Buffer.from(original)),species:ids,records};
fs.writeFileSync(path.join(out,'provenance-050.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(proof,'sprite-provenance.json'),JSON.stringify(report,null,2));
console.log('Direct native sprites:',ids.length,'new species,',records.length,'files');
