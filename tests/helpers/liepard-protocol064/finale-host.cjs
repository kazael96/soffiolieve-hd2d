'use strict';
// Portable form of the existing finale-moves test host; actual programs are
// compiled via the strict source provider, not copied from a frozen build.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),L=require('./strict-loader.cjs');
function setup({withoutFinale=false,withoutLiepard=false,withoutMinccino=false,withoutEmboar=false}={}){
 const c={};c.window=c;vm.createContext(c);
 for(const file of ['assets/battle-data.js','battle-sim.js','training-data.js','league-data.js','finale-data.js','pokemon-visuals.js','training.js'])L.run(c,file);
 for(const data of [c.LEAGUE_DATA,c.FINALE_DATA])for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(c.TRAINING_DATA[key],data[key]);c.TRAINING_DATA.levelCap=54;
 const hasLiepard=!withoutLiepard,hasMinccino=!withoutMinccino,hasEmboar=!withoutEmboar;
 if(hasEmboar){
  L.run(c,'pokemon-anim.js');const metadataPath=path.join(L.repo,'tests/fixtures/emboar-native-geometry064.json'),metadataText=L.decode(fs.readFileSync(metadataPath),metadataPath);assert.equal(L.sha(Buffer.from(L.LF(metadataText))),'c49a93f55b48e1236d4bf5bac2dd5a0b0d2bf4ab6a43904fdb0dc5e29427959c','Original existing500geometry metadata differs');const geometry=JSON.parse(metadataText);
  for(const view of ['front','back'])c.ROM_SPRITE_ANIM.cache['500-'+view]={ready:true,data:JSON.parse(L.decode(L.nativeAsset('assets/animated/500-'+view+'.json'),'original500JSON')),groundBounds:geometry.views[view].groundBounds.slice()};
 }
 for(const name of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','opelucid-moves','league-moves',...(!withoutFinale?['finale-moves']:[]),'training-moves',...(hasLiepard?['liepard-moves']:[]),...(hasMinccino?['minccino-moves']:[]),...(hasEmboar?['emboar-moves']:[]),'battle-reactions'])L.run(c,name+'.js');
 return c;
}
module.exports={setup};
