/* Scope original Nitro exports to the 0.49 delta; never rebuild the base650. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),work=path.resolve(root,'..'),out=path.join(root,'src/assets/animated'),proof=path.join(root,'outputs/chapter049/moves');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(proof,{recursive:true});
const read=n=>JSON.parse(fs.readFileSync(path.join(root,'src',n+'-data.js'),'utf8').split('=',2)[1].replace(/;\s*$/,''));
const current=read('mistralton'),old=read('driftveil'),oldIds=new Set(Object.values(old.progression).map(p=>p.id)),ids=[...new Set(Object.values(current.progression).map(p=>p.id))].filter(id=>!oldIds.has(id));
const records=[],hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const id of [...ids,701,702,703,704,705,706])for(const side of ['front','back'])for(const ext of ['json','png']){
 const source=path.join(work,id>=701?'extra-sprites':'soffiolieve/dist/assets/animated',`${id}-${side}.${ext}`),dest=path.join(out,`${id}-${side}.${ext}`),bytes=fs.readFileSync(source);fs.writeFileSync(dest,bytes);records.push({asset:path.relative(root,dest).replaceAll('\\','/'),source:path.relative(work,source).replaceAll('\\','/'),sha256:hash(bytes)});
}
const origin=path.join(work,'soffiolieve/extract-pokemon-animations.cjs');let source=fs.readFileSync(origin,'utf8').split('let report=')[0];
source=source.replace("path.join(__dirname,'dist/assets/animated')",JSON.stringify(out)).replace('function extract(id,back)','function extract(id,back,female=false)').replace('gr=unpack(archive[base+2])','gr=unpack(archive[base+(female?3:2)])').replace("let key=id+'-'","let key=id+(female?'-female':'')+'-'");
const scope={require:createRequire(origin),__dirname:path.dirname(origin),console,Buffer};vm.createContext(scope);vm.runInContext(source+'\nthis.extract=extract;',scope,{filename:origin});
for(const id of [521,592])for(const back of [false,true]){
 const decoded=scope.extract(id,back,true);for(const ext of ['json','png']){const dest=path.join(out,decoded.key+'.'+ext);records.push({asset:path.relative(root,dest).replaceAll('\\','/'),source:`IRBI a/0/0/4 NCGR ${id*20+(back?12:3)}; shared ${back?'13/14/15/16':'4/5/6/7'}, palette18`,sha256:hash(fs.readFileSync(dest))});}
}
const manifest=JSON.stringify({species:ids,seasonal:[701,702,703,704,705,706],female:[521,592],records},null,2);
fs.writeFileSync(path.join(proof,'sprite-provenance.json'),manifest);fs.writeFileSync(path.join(out,'provenance-049.json'),manifest);
console.log(`Scoped original sprites: ${ids.length} species, 6 seasonal forms, 2 female variants; ${records.length} files.`);
