const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){
 const source=fs.readFileSync(process.env.SOFFIOLIEVE_GAME_SOURCE||require.resolve('../src/game.js'),'utf8'),start=source.indexOf('function frame(now){'),end=source.indexOf('refresh();requestAnimationFrame(frame);',start);assert.ok(start>=0&&end>start);
 let world=0,steps=0,arena=0;const overlays=new Set(),opaque=['chapterCinematic','nativeFirstCredits','nativeFirstSave','nativeFirstEnd','mainStoryComplete'];
 const c={console,Math,requestAnimationFrame(){},document:{hidden:false,querySelector(selector){return opaque.some(id=>overlays.has(id)&&selector.includes('#'+id))?{}:null;}},renderer:{ready:true,scene:{}},controls:{state:()=>({})},Journey:{locked:true,step(){steps++;}},GameSpeed:{steps:()=>[.016]},drawWorld(){world++;},drawArena(){arena++;},menuOpen:()=>false,t:0,last:0,keys:{},cooldown:0,moving:false,battling:false};c.window=c;vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 return{frame:()=>c.frame(100),overlays,c,get world(){return world;},get steps(){return steps;},get arena(){return arena;}};
}
test('opaque native movies/credits/save/END stop hidden world rendering without stopping event updates',()=>{
 const f=fixture();f.frame();assert.equal(f.world,1);for(const id of ['chapterCinematic','nativeFirstCredits','nativeFirstSave','nativeFirstEnd','mainStoryComplete']){f.overlays.add(id);f.frame();assert.equal(f.world,1,'Hidden field must not compete with '+id);f.overlays.delete(id);}assert.equal(f.steps,6);f.frame();assert.equal(f.world,2,'World must resume when its cover is removed');assert.equal(f.steps,7);
});
test('transparent field effects and ordinary battle frames retain their rendering',()=>{
 const f=fixture();f.overlays.add('nativeLightStone');f.frame();assert.equal(f.world,1);f.c.battling=true;f.frame();assert.equal(f.arena,1);assert.equal(f.steps,2);
});
