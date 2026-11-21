'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'qa-executed-sources064.js'),'utf8');
function host(){const c=vm.createContext({URL,location:{href:'http://127.0.0.1:1234/qa-browser.html'}});c.window=c;c.executeSource=text=>vm.runInContext(text,c);vm.runInContext('class Element{append(...nodes){for(const node of nodes)if(node.nodeName==="SCRIPT")executeSource(node.textContent);return "native-result";}};globalThis.Element=Element;globalThis.body=new Element;',c);vm.runInContext(source,c);return c;}
test('records the binding produced by the executed source before a later wrapper replaces it',()=>{
 const c=host();
 assert.equal(c.body.append({nodeName:'SCRIPT',textContent:'window.combatant=function original(){return 7;};\n//# sourceURL=http://127.0.0.1:1234/game.js'}),'native-result');
 const row=c.QAExecutedSources064.rows['game.js'];assert.equal(row.functions.combatant,'function original(){return 7;}');assert.equal(row.refs.combatant(),7);assert.strictEqual(row.refs.combatant,c.combatant);
 c.body.append({nodeName:'SCRIPT',textContent:'const before=combatant;window.combatant=function wrapped(){return before();};\n//# sourceURL=http://127.0.0.1:1234/double-battles.js'});
 assert.notStrictEqual(row.refs.combatant,c.combatant);assert.strictEqual(c.QAExecutedSources064.rows['double-battles.js'].refs.combatant,c.combatant);assert.equal(c.combatant(),7);
});
test('preserves exact source text and ignores non-script, untagged and unrelated nodes',()=>{
 const c=host();c.body.append({nodeName:'DIV',textContent:'not code'});c.body.append({nodeName:'SCRIPT',textContent:'window.unrelated=1;'});c.body.append({nodeName:'SCRIPT',textContent:'window.other=2;\n//# sourceURL=http://127.0.0.1:1234/other.js'});
 assert.equal(Object.keys(c.QAExecutedSources064.rows).length,0);
 const text='window.ROM_SPRITE_ANIM={draw:function draw(){return "è";}};';c.body.append({nodeName:'SCRIPT',textContent:text+'\n//# sourceURL=http://127.0.0.1:1234/pokemon-anim.js'});assert.equal(c.QAExecutedSources064.rows['pokemon-anim.js'].source,text);assert.equal(c.QAExecutedSources064.rows['pokemon-anim.js'].refs.draw(),'è');
});
test('rejects a second execution of a pinned transported script',()=>{const c=host(),node={nodeName:'SCRIPT',textContent:'window.combatant=function first(){};\n//# sourceURL=http://127.0.0.1:1234/game.js'};c.body.append(node);assert.throws(()=>c.body.append(node),/executed twice/);});
