const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),paths=require('./minccino-slap-paths064.cjs');
function setup({withoutFinale=false,withoutLiepard=false,withoutMinccino=false,withoutEmboar=false,sourceRoot=paths.sourceRoot}={}){
 const site=paths.site,c={};c.window=c;vm.createContext(c);
 const read=file=>{const selected=path.join(sourceRoot,file),fallback=path.join(paths.repo,'src',file);return fs.readFileSync(fs.existsSync(selected)?selected:fs.existsSync(fallback)?fallback:path.join(site,file),'utf8');};
 for(const file of ['assets/battle-data.js','battle-sim.js','training-data.js','league-data.js','finale-data.js','pokemon-visuals.js','training.js'])vm.runInContext(read(file),c,{filename:file});
 for(const data of [c.LEAGUE_DATA,c.FINALE_DATA])for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(c.TRAINING_DATA[key],data[key]);c.TRAINING_DATA.levelCap=54;
 const hasLiepard=!withoutLiepard&&(fs.existsSync(path.join(sourceRoot,'liepard-moves.js'))||fs.existsSync(path.join(paths.repo,'src','liepard-moves.js'))||fs.existsSync(path.join(site,'liepard-moves.js')));
 const hasMinccino=!withoutMinccino&&(fs.existsSync(path.join(sourceRoot,'minccino-moves.js'))||fs.existsSync(path.join(paths.repo,'src','minccino-moves.js'))||fs.existsSync(path.join(site,'minccino-moves.js')));
 const hasEmboar=!withoutEmboar&&(fs.existsSync(path.join(sourceRoot,'emboar-moves.js'))||fs.existsSync(path.join(paths.repo,'src','emboar-moves.js'))||fs.existsSync(path.join(site,'emboar-moves.js')));
 if(hasEmboar){
  // This fixture samples prepared battle poses. Install the actual pure native
  // API and the two verified prepared data banks; this does not emulate a load
  // or claim DOM/GPU rendering. A genuinely missing runtime bank still fails.
  vm.runInContext(read('pokemon-anim.js'),c,{filename:'pokemon-anim.js'});
  const geometry=require(path.join(paths.repo,'tests/fixtures/emboar-native-geometry064.json'));
  for(const view of ['front','back'])c.ROM_SPRITE_ANIM.cache['500-'+view]={ready:true,data:JSON.parse(read('assets/animated/500-'+view+'.json')),groundBounds:geometry.views[view].groundBounds.slice()};
 }
 for(const name of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','opelucid-moves','league-moves',...(!withoutFinale?['finale-moves']:[]),'training-moves',...(hasLiepard?['liepard-moves']:[]),...(hasMinccino?['minccino-moves']:[]),...(hasEmboar?['emboar-moves']:[]),'battle-reactions'])vm.runInContext(read(name+'.js'),c,{filename:name+'.js'});
 return c;
}
module.exports={setup};
