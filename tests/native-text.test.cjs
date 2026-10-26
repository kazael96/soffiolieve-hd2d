const test=require('node:test'),assert=require('node:assert/strict');
const {wrap,width,format,resource}=require('../src/native-text-layout.js'),{edit}=require('../src/native-naming.js');
const font={glyphs:Object.fromEntries([...' abcdefW?'].map(c=>[c,[0,0,0,c==='W'?8:4]]))};
test('native text wraps by glyph advance, preserves paragraphs and splits long words',()=>{
 assert.deepEqual(wrap('abc def',font,28),['abc def']);
 assert.deepEqual(wrap('abc WWW\ndef',font,20),['abc','WW','W','def']);
 for(const line of wrap('abcdefabcdef abc',font,16))assert.ok(width(line,font)<=16);
 assert.equal(format('{0102:0} ha {0202:1} PS.\\n{be05:2}', ['Snivy',20]),'Snivy ha 20 PS.\n');
 assert.equal(format('Natura {ff00:2}Seria{ff00:0}. {0202:1}', ['Alcide',5]),'Natura Seria. 5');
});
test('native metadata and images use the release revision without replacing an explicit asset revision',()=>{
 assert.equal(resource('assets/menu/a.png'),'assets/menu/a.png?v=0.15-dev');assert.equal(resource('a.png?v=rom-hash'),'a.png?v=rom-hash');assert.equal(resource('a.png?mode=1'),'a.png?mode=1&v=0.15-dev');
});
test('native naming limits ten character codes and preserves original special glyphs',()=>{
 const allowed=new Set(['A','É','⑭',' ']);
 assert.equal(edit('AÉ','insert','⑭',allowed),'AÉ⑭');assert.equal(edit('AÉ⑭','delete'),'AÉ');
 assert.equal(edit('AAAAAAAAAA','insert','É',allowed),'AAAAAAAAAA');assert.equal(edit('A','insert','x',allowed),'A');
});
