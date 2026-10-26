const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const {records}=require('../src/pokedex-browser.js');const scope={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../src/dex-browser-assets.js'),'utf8'),scope);const a=scope.window.DEX_BROWSER_ASSETS;
test('Unova list includes unknown Victini and intermediate entries only through last known species',()=>{
 const list=records(a,{seen:['Snivy','Oshawott'],caught:['Snivy']});
 assert.equal(list.length,8);assert.equal(list[0].number,0);assert.equal(list[0].seen,false);assert.equal(list[1].name,'Snivy');assert.equal(list[1].caught,true);assert.equal(list[7].name,'Oshawott');assert.equal(list[7].caught,false);
 assert.equal(records(a,{seen:[],caught:[]}).length,0);
 assert.equal(records(a,{seen:[],caught:['Lillipup']}).at(-1).name,'Lillipup');
});
