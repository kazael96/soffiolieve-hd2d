const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){const c={Date};c.window=c;vm.createContext(c);for(const file of ['mistralton-ball','capture-rules','native-capture','battle-bag'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);return c;}
test('Timer and Quick use the native elapsed-turn counter and exact Q12 constants',()=>{
 const c=fixture();for(const elapsedTurns of [0,1,2,5,9,10,11,100]){
  assert.equal(c.CaptureRules.ballBonus(10,{}, {elapsedTurns}),Math.min(16384,4096+1229*elapsedTurns)/4096);
  assert.equal(c.CaptureRules.ballBonus(15,{}, {elapsedTurns}),elapsedTurns===0?5:1);
 }
});
test('new market balls keep their original cells and enter the battle bag',async()=>{
 const c=fixture();for(const id of [10,15]){const b=c.MISTRALTON_BALL.balls[id];assert.ok(b);assert.equal(b.cells.length,17);assert.equal(b.sequences.length,5);for(const file of b.cells)assert.equal(fs.readFileSync('src/'+file).readUInt32BE(16),128);assert.ok(c.BattleBag.inventory('balls',n=>n===id?1:0).some(row=>row.id===id));}
 c.CAPTURE_DATA=c.MISTRALTON_BALL;c.RuntimeAssets={image:async src=>({src,complete:true,naturalWidth:128,width:128,height:128})};await c.NativeCapture.preload();const drawn=[],ctx={save(){},restore(){},translate(){},scale(){},drawImage(im){drawn.push(im.src);}};
 for(const id of [10,15]){await c.NativeCapture.preload(id);c.NativeCapture.compile(c.CAPTURE_DATA,new Proxy({},{get:()=>({emitters:[]})}), {ball:id});drawn.length=0;c.NativeCapture.draw(ctx,[{op:69,start:0,args:[0,1,0,0,4096,4096]}],0,1000,650,()=>({x:100,y:100}));assert.deepEqual(drawn,[c.MISTRALTON_BALL.balls[id].cells[0]]);}
});
