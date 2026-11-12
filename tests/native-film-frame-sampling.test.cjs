/* Actual native Reshiram camera has a cut at681, with a roll wrap ±180. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('native movie rendering keeps one complete recorded frame across a camera cut, without interpolating through the room',()=>{
 const c={};c.window=c;vm.createContext(c);for(const file of ['starter-scene','finale-cinematics-data'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file+'.js'),'utf8'),c);
 const film=c.FINALE_CINEMATICS.films[9],matrices=[],poses=[],gl=new Proxy({uniformMatrix4fv:(location,transpose,value)=>matrices.push([...value])},{get:(target,key)=>key in target?target[key]:()=>{}});
 const scene={canvas:{width:960,height:720},assets:{frameSampling:'native',curves:{part0:film.camera},perspective:film.perspective,brightness:film.brightness},gl,locations:{},drawModel:(name,frame)=>poses.push(frame)};
 for(const time of [680.1,680.66,680.99,681.01]){
  poses.length=0;matrices.length=0;c.StarterScene.Scene.prototype.draw.call(scene,'part0',time,{extra:['part1','part2']});
  assert.ok(poses.every(frame=>frame===Math.floor(time)),'All three models and materials use the same native frame');
  const expected=Array.from(new Float32Array(c.StarterScene.camera(film.camera,Math.floor(time),4/3,film.perspective)));assert.deepEqual(matrices[0],expected,'Camera jumps at the original cut, without an invented intermediate viewpoint');
 }
});
