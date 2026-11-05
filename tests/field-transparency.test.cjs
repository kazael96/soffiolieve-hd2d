const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('native Tower cloud blend material is preserved separately from its opaque lower cloud floor',()=>{
 const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/icirrus-assets.js'),'utf8'),c);
 const groups=c.window.ICIRRUS_ASSETS.models['ic-map-391'].groups;
 assert.equal(groups.find(g=>g.texture.endsWith('o23_kumo_a')).transparent,true);
 assert.equal(groups.find(g=>g.texture.endsWith('o23_cloud_a')).transparent,false);
});
test('translucent clouds render after the body with depth writing disabled and restore the depth state',()=>{
 const c={window:null,innerWidth:1280,innerHeight:720,OPENING_SPRITES:{},ROM_SPRITES:{}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/world3d.js'),'utf8')+';window.Renderer=VillageRenderer;',c);
 const trace=[];let writes=true,current=null;
 const gl=new Proxy({depthMask:value=>{writes=value;},drawArrays:()=>trace.push({kind:current,writes}),getAttribLocation:()=>0},{get:(target,key)=>target[key]??(()=>{})});
 const group=(buf,transparent)=>({buf,transparent,texture:buf,count:3,verts:[0,0,0,0,0,1,1,1,0,1,0]});
 const r=Object.assign(Object.create(c.Renderer.prototype),{gl,canvas:{width:1280,height:720},scene:{instances:[{model:'map',x:0,y:0,z:0,rotation:0}]},center:[0,0],zoom:1,scale:1,ready:true,loc:{},attrs:[],models:{map:[group('opaque',false),group('cloud',true)]},cache:{},images:{'test-0':{}},white:{},shadow:{},presented:new WeakSet(),resourcePlan:()=>({}),hasResources:()=>true,resize(){},indoor:()=>false,bind:buf=>current=buf,texture(){},plane(){trace.push({kind:'body',writes});},screen:()=>[0,0,1]});
 r.draw(0,[{name:'test',x:0,z:0,frame:0,height:0,noShadow:true}]);
 const opaque=trace.findIndex(e=>e.kind==='opaque'),body=trace.findIndex(e=>e.kind==='body'),cloud=trace.findIndex(e=>e.kind==='cloud');
 assert.ok(opaque>=0&&body>opaque&&cloud>body,JSON.stringify(trace));assert.equal(trace[opaque].writes,true);assert.equal(trace[body].writes,true);assert.equal(trace[cloud].writes,false);assert.equal(writes,true);
});
