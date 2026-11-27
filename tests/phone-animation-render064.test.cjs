const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){
 let phone=true,draws=0,steps=0;
 const c={console,document:{hidden:false,querySelector(selector){return phone&&selector.includes('#phoneScene')?{id:'phoneScene'}:null;},addEventListener(){}},performance:{now:()=>0},requestAnimationFrame(){},refresh(){},last:0,t:0,cooldown:0,moving:false,battling:false,keys:{},renderer:{ready:true,contextLost:false,gl:{isContextLost:()=>false},status(){}},canvas:{dataset:{}},controls:{state:()=>({})},GameSpeed:{steps:()=>[1/60]},Journey:{locked:true,step(){steps++;}},menuOpen:()=>true,drawWorld(){draws++;}};
 c.window=c;vm.createContext(c);const source=fs.readFileSync('src/game.js','utf8'),start=source.indexOf('function frame(now)'),end=source.indexOf('function changeViewZoom',start);assert.ok(start>=0&&end>start);vm.runInContext(source.slice(start,end),c);
 return {c,frame(at){c.frame(at);assert.equal(c.canvas.dataset.runtimeError,undefined);},close(){phone=false;},get draws(){return draws;},get steps(){return steps;}};
}
test('a fully opaque actual phone screen suppresses invisible world draws while event clocks continue',()=>{
 const f=fixture();for(let i=1;i<=30;i++)f.frame(i*16);assert.equal(f.steps,30);assert.equal(f.draws,0,'The opaque phone screen should not repeatedly draw an invisible 3D world');
});
test('closing the phone restores world drawing on the very next frame without dropping simulation steps',()=>{
 const f=fixture();f.frame(16);f.close();f.frame(32);assert.equal(f.steps,2);assert.equal(f.draws,1);
});
