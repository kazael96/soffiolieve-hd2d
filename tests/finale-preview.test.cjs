const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{inject,metadata}=require('../scripts/finale-preview053.cjs');
test('isolated finale fixture loads catalogs before the real bootstrap and preserves the release source',()=>{
 const root=path.resolve('src'),source=fs.readFileSync(path.join(root,'index.html'),'utf8'),output=inject(source,root);
 assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),source);assert.ok(output.includes('window.QA053Preview='));
 for(const file of metadata){const at=output.indexOf('<script src="'+file+'.js"');assert.ok(at>=0&&at<output.indexOf('<script src="opelucid-bootstrap.js"'),file);}
 assert.ok(output.indexOf('<script src="finale-audio.js"')>output.indexOf('<script src="league-audio.js"'));
 assert.ok(output.indexOf('<script src="finale-moves.js"')>output.indexOf('<script src="league-moves.js"'));
 assert.ok(output.indexOf('<script src="finale-moves.js"')<output.indexOf('<script src="training-moves.js"'));
 assert.throws(()=>inject(output,root),/already installed/);
});
