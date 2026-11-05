const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function setup(){const c={atob:s=>Buffer.from(s,'base64').toString('binary'),Math,Promise};c.window=c;vm.createContext(c);for(const f of ['native-surface-data','native-surfaces','icirrus-gym-data','icirrus-gym-motion','icirrus-cannon-task'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',f+'.js'),'utf8'),c);const surface=c.NativeSurfaces.create(c.NATIVE_SURFACE_DATA);c.IcirrusChapter={surfaceAt:(...args)=>surface.at(...args)};vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/icirrus-gym.js'),'utf8'),c);return c;}
test('real native solid cannon front cells dispatch all14 valid routes',async()=>{
 const c=setup(),D=c.ICIRRUS_GYM_DATA,directions=[[0,-1],[0,1],[-1,0],[1,0]];let count=0;
 for(let index=0;index<10;index++)for(let dir=0;dir<4;dir++){const column=D.nativeDirectionToColumn[dir],r=D.routes[index][column];if(r.member<0)continue;
  const a=D.anchors[index],[dx,dz]=directions[dir],hero={x:a[0]-15.5-dx*2,y:a[2]-15.5-dz*2},state={zone:108,cannonHeight:a[1]},sounds=[],controller=c.IcirrusGym.create({state:()=>state,hero:()=>hero,sound:id=>sounds.push(id),save:()=>{}});
  assert.equal(controller.tryStep(dx,dz),true,'route '+r.member+' solid front must launch');assert.equal(controller.busy,true);
  let frames=0;while(controller.busy&&frames++<1000){controller.tick(1/30);if(state.cannonCamera){assert.ok(Number.isFinite(state.cannonCamera.distance));assert.ok(state.cannonCamera.target.every(Number.isFinite));const renderer={center:[9,8],elevation:7,yaw:.3},before={...renderer};controller.applyCamera(renderer)();assert.deepEqual(renderer,before);}}
  assert.equal(controller.busy,false);assert.equal(controller.hidden,false);assert.equal(state.cannonCamera,undefined);assert.ok(Math.abs(hero.x-(r.destination[0]-15.5))<1e-6);assert.ok(Math.abs(hero.y-(r.destination[2]-15.5))<1e-6);assert.ok(Math.abs(state.cannonHeight-r.destination[1])<.01);assert.ok(sounds.includes(1696));count++;
 }
 assert.equal(count,14);
});
