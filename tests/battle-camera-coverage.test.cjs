const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function fixture(){
 const paints=[],draws=[],canvases=[];const c={console,Map,Promise,document:{documentElement:{dataset:{}},createElement(){const node={width:0,height:0,getContext:()=>({imageSmoothingEnabled:false,drawImage(){}})};canvases.push(node);return node;}},PinwheelBattles:{has:()=>true,contexts:{test:{indoor:false}}},RuntimeAssets:{},BattleDiorama:{prepare:()=>Promise.resolve(true),paint:(context,layers,w,h,options)=>{paints.push({w,h,options});return true;},drawAmbient(){}}};c.window=c;vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/battle-environment.js'),'utf8'),c);c.BattleEnvironment.set({id:'test',terrain:'grass'});
 const target={save(){},restore(){},translate(){},scale(){},drawImage(...args){draws.push(args);}};return {c,paints,draws,canvases,target};
}
test('native camera zoom-out, pan and shake keep every viewport corner covered',()=>{
 for(const [w,h]of [[1280,720],[390,844],[844,390]])for(const camera of [{zoom:1,x:0,y:0},{zoom:.65,x:0,y:0},{zoom:.4875,x:37,y:-42},{zoom:1.3,x:150,y:99}]){
  const f=fixture();f.c.BattleEnvironment.draw(f.target,w,h,{},camera);const coverage=f.c.BattleEnvironment.coverage(w,h,camera);assert.ok(coverage,'explicit camera coverage');
  const bs=Math.min(w/1000,h/650),left=w/2+camera.x*bs-camera.zoom*coverage.width/2,top=h/2+camera.y*bs-camera.zoom*coverage.height/2;
  assert.ok(left<=0&&top<=0&&left+camera.zoom*coverage.width>=w&&top+camera.zoom*coverage.height>=h,'camera exposes an unpainted edge');
  assert.ok(f.c.BattleEnvironment.cacheStats().bytes<=24*1024*1024,'overscan exceeds retained frame budget');
  const p=f.paints[0];assert.equal(p.options.aspect,w/h);assert.equal(p.options.overscan,coverage.factor);
  // Expanded FOV plus centered placement must leave the original projection unchanged.
  for(const normalized of [-.8,0,.7])assert.ok(Math.abs(coverage.width*(.5+normalized/(2*p.options.overscan))-(coverage.width-w)/2-w*(.5+normalized/2))<1e-8);
 }
});
test('camera buckets reuse frames and release canvases when the cache evicts',()=>{
 const f=fixture();for(let i=0;i<30;i++)f.c.BattleEnvironment.draw(f.target,1280,720,{}, {zoom:.49+i*.015,x:i,y:0});
 assert.ok(f.paints.length<20);assert.ok(f.c.BattleEnvironment.cacheStats().bytes<=24*1024*1024);assert.ok(f.c.BattleEnvironment.cacheStats().frames<=3);assert.ok(f.canvases.some(c=>!c.width&&!c.height));
});
