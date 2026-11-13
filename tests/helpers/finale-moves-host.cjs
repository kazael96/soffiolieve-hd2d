const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function setup({withoutFinale=false,sourceRoot=path.resolve(__dirname,'../../src')}={}){
 const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../../_site'),c={};c.window=c;vm.createContext(c);
 const read=file=>fs.readFileSync(fs.existsSync(path.join(sourceRoot,file))?path.join(sourceRoot,file):path.join(site,file),'utf8');
 for(const file of ['assets/battle-data.js','battle-sim.js','training-data.js','league-data.js','finale-data.js','pokemon-visuals.js','training.js'])vm.runInContext(read(file),c,{filename:file});
 for(const data of [c.LEAGUE_DATA,c.FINALE_DATA])for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(c.TRAINING_DATA[key],data[key]);c.TRAINING_DATA.levelCap=54;
 for(const name of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','opelucid-moves','league-moves',...(!withoutFinale?['finale-moves']:[]),'training-moves','battle-reactions'])vm.runInContext(read(name+'.js'),c,{filename:name+'.js'});
 return c;
}
module.exports={setup};
