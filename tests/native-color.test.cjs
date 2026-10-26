const {test}=require('node:test'),assert=require('node:assert/strict');
const {component,blend,interpolate,darken}=require('../src/native-color.js');
test('DS blend truncates in RGB555 before expansion and saturates additive coefficients',()=>{
 assert.equal(component(255,0,8,8),123);
 assert.equal(component(255,255,16,7),255);
 assert.equal(component(0,255,31,7),106);
 assert.equal(component(255,0,32,0),255);
 assert.equal(component(255,255,-1,0),0);
});
test('palette interpolation uses signed FX12 shifts, including descending colors',()=>{
 assert.deepEqual([...interpolate([255,0,0,255],[0,255,0,255],2048)],[123,123,0,255]);
 assert.deepEqual([...interpolate([255,0,0,255],[0,255,0,255],4096)],[0,255,0,255]);
});
test('selective brightness preserves alpha while darkening the native five-bit color',()=>{
 assert.deepEqual([...darken([255,0,255,128],8)],[123,0,123,128]);assert.deepEqual([...darken([255,255,255,255],0)],[0,0,0,255]);
});
test('transparent source pixels do not cover the existing background',()=>{
 assert.deepEqual([...blend(Uint8Array.from([255,0,0,255,0,0,0,0]),Uint8Array.from([0,0,255,255,20,30,40,255]),8)], [123,0,123,255,20,30,40,0]);
 assert.throws(()=>blend(new Uint8Array(4),new Uint8Array(8),8),/dimensions/);
});
