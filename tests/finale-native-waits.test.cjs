/* IRBI movement table021d5e40:65 ->021988d4 sets16,66 ->021988e0 sets32;
 * shared02198878 decrements before completion. Actual host motion executor. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('native waits65/66 retain their16/32 updates without changing the actor position',()=>{
 const source=fs.readFileSync('src/original-story.js','utf8'),code=source.slice(source.indexOf('  function tickMotions(dt){'),source.indexOf('  function fieldActors()'));
 for(const [movement,ticks]of [[65,16],[66,32]]){
  let done=false;const actor={x:1.5,y:-9.5,height:18,direction:1},task={id:0,sequence:[[movement,1]],index:0,count:0,elapsed:0,resolve:()=>done=true},c={Math,window:{},motions:[task],actor:()=>actor,pose(){},fieldFall:null};vm.createContext(c);vm.runInContext(code,c);
  for(let frame=0;frame<ticks-1;frame++)c.tickMotions(1/30);assert.equal(done,false,'native wait ended early '+movement);
  for(let frame=ticks-1;frame<ticks+2&&!done;frame++)c.tickMotions(1/30);assert.equal(done,true,'native wait did not finish '+movement);assert.deepEqual([actor.x,actor.y,actor.height],[1.5,-9.5,18]);
 }
});
