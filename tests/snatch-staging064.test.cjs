const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {setup}=require('./helpers/finale-moves-host.cjs');
test('Snatch uses the native self target and holds a ready stance instead of advancing on a foe',()=>{
 const c=setup(),native=c.GEN5.dex.moves.get('snatch');assert.equal(native.target,'self');assert.equal(native.category,'Status');
 const names=Object.keys(c.TrainingMoves.pairs).filter(name=>c.TrainingMoves.pairs[name].includes(289));assert.ok(names.length>1);
 for(const name of names){const p=c.SpeciesMoves.select(c.TRAINING_DATA.progression[name].id,289);assert.equal(p.target,'self',name+' Snatch points at a foe');assert.equal(p.damage,false,name+' Snatch invents damage');assert.equal(p.nativeEffects,true,name+' must retain original move effects');
  for(const side of ['p1','p2'])for(let frame=0;frame<=p.frames;frame++){const a=c.SpeciesMoves.sample(p,frame,side,false);assert.equal(a.reach,0,name+' Snatch advances or retreats as a different action at '+frame);}
 }
});
test('Patrat Bide accumulation selects its own effect target and release selects the opponent',async()=>{
 const c=setup();Object.assign(c,{Image:class{},performance,setTimeout,clearTimeout});c.ROM_MOVE_FX={moves:{117:{id:117,phaseMap:[0,1],variants:[{commands:[]},{commands:[]}]}},spas:{}};
 for(const file of ['battle-context.js','move-fx.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),c,{filename:file});
 for(const side of ['p1','p2'])for(const [context,target,damage]of [[{phase:0},side,false],[{phase:0,storing:true},side,false],[{phase:1},side==='p1'?'p2':'p1',true]]){
  await c.MoveFX.preview(117,side,0,{cryIds:{p1:504,p2:504},context});assert.equal(c.MoveFX.active.targetSide,target,'Bide target differs '+side+'/'+JSON.stringify(context));assert.equal(c.MoveFX.active.profile.damage,damage);
 }
 c.MoveFX.cancel();
});
