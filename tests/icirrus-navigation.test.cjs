const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment}=require('./check-story-runtime.cjs');process.argv[2]=old;
test('all eleven Gym approaches obey native directional edges and actual ramp heights',async()=>{
 const c=environment({icirrus:true,sourceRoot:path.resolve(__dirname,'../src')});await c.IcirrusChapter.ensure();let from={x:-.5,y:25.3,height:0};const directions=[[0,-1],[0,1],[-1,0],[1,0]],routes=[];
 for(const[index,direction]of [[0,0],[1,2],[1,3],[2,2],[3,0],[4,3],[4,2],[5,1],[6,3],[7,0],[8,2]]){
  const a=c.ICIRRUS_GYM_DATA.anchors[index],[dx,dy]=directions[direction],to={x:a[0]-15.5-dx*2,y:a[2]-15.5-dy*2,height:a[1]},points=c.IcirrusPaths.route(108,from,to);
  assert.ok(points.length);assert.ok(Math.hypot(points.at(-1).x-to.x,points.at(-1).y-to.y)<.01);
  for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i],dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<.01)continue;
   const dir=dx?(dx>0?3:2):(dy>0?1:0),source=c.IcirrusChapter.surfaceAt(108,p.x,p.y,p.height),dest=c.IcirrusChapter.surfaceAt(108,q.x,q.y,q.height);assert.ok(source&&dest);assert.equal(c.IcirrusGymMotion.edgeBlocked(source.behavior,dest.behavior,dir),false,JSON.stringify({index,p,q,source:source.behavior,dest:dest.behavior}));assert.ok(Math.abs(q.height-p.height)<1.81);
  }
  routes.push(points);const col=c.ICIRRUS_GYM_DATA.nativeDirectionToColumn[direction],r=c.ICIRRUS_GYM_DATA.routes[index][col];from={x:r.destination[0]-15.5,y:r.destination[2]-15.5,height:r.destination[1]};
 }
 // Native wall rebound12 requires the stair loop, not the blocked direct descent.
 const rebound=routes[2];assert.ok(rebound.some(p=>p.x===-8.5&&p.y===1.5),'Stair approach must clear the ramp edge before descending');
});
