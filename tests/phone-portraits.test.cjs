/* IRBI a/1/3/1: each full portrait uses its own native face palette and cells. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),test=require('node:test'),assert=require('node:assert/strict');
const native=require('./fixtures/phone-native-057.json'),root=path.resolve(__dirname,'../src');
for(const name of ['Aralia','Mamma','Anita','Alcide','Komor','Belle'])test('Interpoke '+name+' retains its own native eyes and mouth in every expression',()=>{
 const frames=Object.entries(native.frames).filter(([src])=>src.includes('/'+name+(name==='Anita'?'-phone-':'-')));assert.equal(frames.length,9);
 for(const [src,hash]of frames){const data=fs.readFileSync(path.join(root,src));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),hash,src+' must use the verified native face assignment');}
});
