const test=require('node:test'),assert=require('node:assert/strict');
const {nextButton}=require('../src/native-ui.js');const {normalize}=require('../src/native-settings.js');
test('menu direction preserves rows/columns and never selects an unavailable entry',()=>{
 const buttons=Array.from({length:6},(_,i)=>({x:i%2*128,y:Math.floor(i/2)*48,w:120,h:40,disabled:i===1}));
 assert.equal(nextButton(buttons,0,0,1),2);assert.equal(nextButton(buttons,2,1,0),3);assert.equal(nextButton(buttons,3,0,-1),0);
 assert.equal(nextButton(buttons,0,-1,0),0);
});
test('game option validation keeps explicit off/mono/set values and rejects corrupt choices',()=>{
 assert.deepEqual(normalize({textSpeed:3,animations:false,battleStyle:'set',sound:'mono'}),{textSpeed:3,animations:false,battleStyle:'set',sound:'mono'});
 assert.deepEqual(normalize({textSpeed:0,battleStyle:'invalid',sound:'invalid'}),{textSpeed:2,animations:true,battleStyle:'switch',sound:'stereo'});
});
test('registered shortcuts discard unsupported actions, deduplicate and keep IR saving preference',()=>{
 const result=normalize({registered:['item:442','pokemon','item:442','javascript:alert(1)',null,'bag'],autoSaveIR:false});
 assert.deepEqual(result.registered,['item:442','pokemon','bag']);assert.equal(result.autoSaveIR,false);
 assert.equal('autoSaveIR' in normalize({autoSaveIR:'false'}),false);
});
