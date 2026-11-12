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
 assert.equal(resource('assets/menu/a.png'),'assets/menu/a.png?v=0.29-dev');assert.equal(resource('a.png?v=rom-hash'),'a.png?v=rom-hash');assert.equal(resource('a.png?mode=1'),'a.png?mode=1&v=0.29-dev');
});
test('native naming limits ten character codes and preserves original special glyphs',()=>{
 const allowed=new Set(['A','É','⑭',' ']);
 assert.equal(edit('AÉ','insert','⑭',allowed),'AÉ⑭');assert.equal(edit('AÉ⑭','delete'),'AÉ');
 assert.equal(edit('AAAAAAAAAA','insert','É',allowed),'AAAAAAAAAA');assert.equal(edit('A','insert','x',allowed),'A');
});

test('field shop labels preserve the native currency/dash glyphs and fit measured popup rows',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('src/party-popup-assets.js','utf8'),c);const font=c.PARTY_POPUP_ASSETS.font,{glyph,fieldChoices}=require('../src/native-text-layout.js');
 assert.equal(glyph('₽',font),font.glyphs.$);for(const mark of ['—','–','−'])assert.equal(glyph(mark,font),font.glyphs['-']);
 const labels=['Superpozione — ₽700','Iperpozione — ₽1200','Pagina successiva','Una descrizione deliberatamente lunga che deve andare a capo senza perdere lettere'],plan=fieldChoices(labels,font);assert.ok(plan.width<=236&&plan.width>104);for(const [i,row]of plan.rows.entries()){assert.ok(row.lines.every(line=>width(line,font)<=plan.width-24));assert.equal(row.lines.join(' ').replace(/\s/g,''),labels[i].replace(/\s/g,''));assert.equal(row.height,24+(row.lines.length-1)*16);}assert.ok(plan.rows.at(-1).lines.length>1);
});
