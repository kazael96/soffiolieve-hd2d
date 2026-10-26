const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=path.join(__dirname,'../src');
const data=JSON.parse(fs.readFileSync(path.join(src,'capture-data.js'),'utf8').split('=',2)[1].trim().slice(0,-1));
const V=require('../src/native-visual.js');global.NativeVisual=V;
const C=require('../src/native-capture.js');
const spas=Object.fromEntries([6,28,32,58,60,61].map(id=>[id,{id,emitters:Array.from({length:id===32?4:id===61?2:1},()=>({delay:0,emitterLife:1,life:20,scale:1})),textures:[]}]));
function effect(options){return C.compile(data,spas,options)}
function timeline(options){const scope={NativeVisual:V,NativeCapture:C,ROM_MOVE_FX:{moves:{},spas},Image:class{},console};scope.window=scope;vm.runInNewContext(fs.readFileSync(path.join(src,'move-fx.js'),'utf8'),scope);return scope.MoveFX.timeline(effect(options),0,0,'p1',{nativeWaitGroups:true});}

test('native capture branches preserve three shakes and guaranteed tutorial catch',()=>{
 const commands=effect({shakes:3,caught:true}).variants[0].commands;
 assert.deepEqual(commands.filter(([op])=>op===48).map(([,a])=>a[1]),[4,1,2,3]);
 assert.equal(commands.some(([op,a])=>op===52&&a[0]===1396),true);
 assert.equal(commands.some(([op])=>op===50),false);
 assert.equal(commands.filter(([op,a])=>op===7&&a[0]===32).length,4);
 assert.equal(commands.some(([op,a])=>op===13&&a[0]===60),true);
 for(const [op,a]of commands)if([7,9,13].includes(op))assert.ok(spas[a[0]],'Referenced SPA exists');
});
test('escape branches use the cartridge shake parameter, restore the target and remove both ball objects',()=>{
 for(let shakes=0;shakes<4;shakes++){
  const commands=effect({shakes,caught:false}).variants[0].commands;
  assert.deepEqual(commands.filter(([op])=>op===48).map(([,a])=>a[1]),[4,...Array.from({length:shakes>=2?3:shakes},(_,i)=>i+1)]);
  assert.deepEqual(commands.filter(([op])=>op===50).map(([,a])=>a[0]),[0,1]);
  assert.equal(commands.some(([op,a])=>op===52&&a[0]===1396),false);
  const sequence=timeline({shakes,caught:false});
  assert.equal(C.actors(sequence.clact,sequence.frames,data).every(a=>!a.visible),true);
  const target=V.sprite(sequence.visual,sequence.frames,'p2');
  assert.equal(target.visible,true);assert.equal(target.scaleX,1);assert.equal(target.tint,0);
 }
});
test('original cell animations retain their native frame order and final pose',()=>{
 assert.equal(data.cells.length,17);assert.equal(data.sequences.length,5);
 assert.deepEqual(data.sequences[1].frames.map(f=>f[0]),[11,12,13,12,11,0,14,15,16,15,14,0]);
 for(const sequence of data.sequences){let elapsed=0;for(const [cell,duration]of sequence.frames){assert.equal(C.cellAt(sequence,elapsed),cell);assert.equal(C.cellAt(sequence,elapsed+duration-1),cell);elapsed+=duration}assert.equal(C.cellAt(sequence,elapsed+100),sequence.frames.at(-1)[0]);}
});
test('successful animation consumes the target while the closed ball remains visible',()=>{
 const sequence=timeline({shakes:3,caught:true});
 assert.ok(sequence.frames>300&&sequence.frames<1200);
 const actors=C.actors(sequence.clact,sequence.frames,data),ball=actors.find(a=>a.id===0);
 assert.equal(ball.visible,true);assert.equal(ball.cell,0);assert.deepEqual(ball.position,[0,40]);
 assert.equal(V.sprite(sequence.visual,sequence.frames,'p2').visible,false);
 assert.equal(sequence.audio.filter(e=>e.id===1384).length,3);
});
