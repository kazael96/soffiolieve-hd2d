/* Preserve reviewed GLB material blend modes without redoing ROM conversion. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const input=path.resolve(process.argv[2]),conversion=path.resolve(process.argv[3]),c={window:{}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(input,'utf8'),c);let changed=0;
for(const [key,model]of Object.entries(c.ICIRRUS_ASSETS.models)){
 const dir=path.join(conversion,key,'converted');if(!fs.existsSync(dir))continue;
 const file=fs.readdirSync(dir).find(f=>f.endsWith('.glb'));if(!file)continue;
 const bytes=fs.readFileSync(path.join(dir,file)),doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),rows=[];
 for(const node of doc.nodes){if(node.mesh===undefined)continue;for(const primitive of doc.meshes[node.mesh].primitives){const material=doc.materials[primitive.material];rows.push(material.alphaMode==='BLEND'||(material.pbrMetallicRoughness?.baseColorFactor?.[3]??1)<1);}}
 if(rows.length!==model.groups.length)throw Error('Material group mismatch '+key);
 model.groups.forEach((g,i)=>{g.transparent=rows[i];if(rows[i])changed++;});
}
fs.writeFileSync(input,'window.ICIRRUS_ASSETS='+JSON.stringify(c.ICIRRUS_ASSETS)+';\n');console.log('Retained '+changed+' native translucent material groups.');
