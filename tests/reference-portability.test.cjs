const test=require('node:test'),assert=require('node:assert/strict');
const {sourceHash}=require('../tools/plan-league-gym-route.cjs');

test('native route source references survive Git CRLF conversion but reject actual changes',()=>{
 const original=Buffer.from('window.NATIVE={"zone":121,"height":12};\r\n');
 const checkout=Buffer.from('window.NATIVE={"zone":121,"height":12};\n');
 assert.equal(sourceHash(original),sourceHash(checkout));
 assert.notEqual(sourceHash(original),sourceHash(Buffer.from('window.NATIVE={"zone":121,"height":13};\n')));
 assert.notEqual(sourceHash(original),sourceHash(Buffer.from('window.NATIVE={"zone":121,"height":12}; \n')));
 assert.notEqual(sourceHash(Buffer.from('a\rb')),sourceHash(Buffer.from('a\nb')),'A standalone CR is content, not a Git line ending');
});
