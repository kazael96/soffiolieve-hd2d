const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/pokemon-visuals.js'),'utf8'),c);
test('female Frillish keeps female native appearance after evolving to Jellicent',()=>{
 const before={id:592,name:'Frillish',gender:'F'},after={...before,id:593,name:'Jellicent'};
 assert.equal(c.PokemonVisuals.graphic(before),'592-female');assert.equal(c.PokemonVisuals.graphic(after),'593-female');assert.equal(c.PokemonVisuals.speciesId('593-female'),593);assert.equal(c.PokemonVisuals.menuId(after),593);
 for(const back of [false,true])assert.ok(fs.existsSync(path.join(__dirname,'../src',c.PokemonVisuals.portraitSrc(after,back))));
 assert.equal(c.PokemonVisuals.graphic({...after,gender:'M'}),593);
});
test('Jellicent display name, graphic, mechanics identity and cry species stay distinct',()=>{
 assert.equal(c.PokemonVisuals.speciesId('Jellicent'),593);const identity=c.PokemonVisuals.identity({name:'Jellicent',gender:'F'});
 assert.equal(identity.speciesId,593);assert.equal(identity.graphic,'593-female');assert.equal(identity.gender,'F');
});
