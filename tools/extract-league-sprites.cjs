/* Original Nitro composites for the052 roster; previous sprites stay unchanged. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),work=path.dirname(root),rom=process.argv[2];if(!rom)throw Error('Pass the supplied IRBI ROM path');
const fd=fs.openSync(rom,'r'),header=Buffer.alloc(16);try{fs.readSync(fd,header,0,16,0);}finally{fs.closeSync(fd);}if(header.toString('ascii',12,16)!=='IRBI')throw Error('Italian Black IRBI required');
const read=n=>{const s=fs.readFileSync(path.join(root,'src',n+'-data.js'),'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));},oldIds=new Set(Object.values(read('opelucid').progression).map(p=>p.id)),ids=[...new Set(Object.values(read('league').progression).map(p=>p.id))].filter(id=>!oldIds.has(id));
const origin=path.join(work,'soffiolieve/extract-pokemon-animations.cjs'),helper=path.join(work,'soffiolieve/rom-tools.cjs'),out=path.join(root,'src/assets/animated'),proof=path.resolve(root,'../../outputs/chapter052');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(proof,{recursive:true});
const record={exports:{}},helperSource=fs.readFileSync(helper,'utf8').replace(/const romPath='[^']+';/,'const romPath='+JSON.stringify(path.resolve(rom))+';');
vm.runInNewContext(helperSource,{require:createRequire(helper),module:record,exports:record.exports,Buffer,__dirname:path.dirname(helper)},{filename:helper});
const original=fs.readFileSync(origin,'utf8');let source=original.split('let report=')[0];
for(const [before,after]of [["path.join(__dirname,'dist/assets/animated')",JSON.stringify(out)],['function extract(id,back)','function extract(id,back,female=false)'],['gr=unpack(archive[base+2])','gr=unpack(archive[base+(female?3:2)])'],["let key=id+'-'","let key=id+(female?'-female':'')+'-'"]]){if(!source.includes(before))throw Error('Native decoder changed: '+before);source=source.replace(before,after);}
const load=createRequire(origin),scope={require:name=>name==='./rom-tools.cjs'?record.exports:load(name),__dirname:path.dirname(origin),console,Buffer};vm.createContext(scope);vm.runInContext(source+'\nthis.extract=extract;',scope,{filename:origin});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),records=[];
for(const [id,female]of ids.map(id=>[id,false]))for(const back of [false,true]){
 const result=scope.extract(id,back,female);for(const ext of ['json','png']){const file=path.join(out,result.key+'.'+ext);records.push({asset:path.relative(root,file).replaceAll('\\','/'),species:id,graphic:female?id+'-female':id,back,female,source:'IRBI a/0/0/4 original Nitro composite',sha256:hash(fs.readFileSync(file))});}
}
const report={source:'IRBI a/0/0/4 NCGR/NCER/NANR/NMCR/NMAR; reviewed Nitro decoder',decoderSHA256:hash(Buffer.from(original)),femaleVariants:[],species:ids,records};
fs.writeFileSync(path.join(out,'provenance-052.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(proof,'sprite-provenance.json'),JSON.stringify(report,null,2));console.log('Direct052 native sprites:',ids.length,'new species;',records.length,'files');
