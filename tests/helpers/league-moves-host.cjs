const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function setup({withoutLeague=false}={}){
 const source=path.resolve(__dirname,'../../src'),site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../../_site'),c={};c.window=c;vm.createContext(c);
 const read=file=>fs.readFileSync(fs.existsSync(path.join(source,file))?path.join(source,file):path.join(site,file),'utf8');
 for(const file of ['assets/battle-data.js','battle-sim.js','training-data.js','league-data.js','pokemon-visuals.js','training.js'])vm.runInContext(read(file),c,{filename:file});
 for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(c.TRAINING_DATA[key],c.LEAGUE_DATA[key]);c.TRAINING_DATA.levelCap=50;c.TRAINING_DATA.capSteps=c.LEAGUE_DATA.capSteps;
 for(const name of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','opelucid-moves',...(!withoutLeague?['league-moves']:[]),'training-moves','battle-reactions'])vm.runInContext(read(name+'.js'),c,{filename:name+'.js'});
 return c;
}
module.exports={setup};
