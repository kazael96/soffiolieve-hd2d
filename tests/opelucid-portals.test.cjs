const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=path.resolve(__dirname,'../src'),c={};c.window=c;vm.createContext(c);for(const name of ['opelucid-events','opelucid-rails'])vm.runInContext(fs.readFileSync(path.join(src,name+'.js'),'utf8'),c);c.PINWHEEL_RAILS=c.OPELUCID_RAILS;vm.runInContext(fs.readFileSync(path.join(src,'native-rails.js'),'utf8'),c);
test('a native actor already on its doorway has a zero-length approach, while nonzero movement still requires a real path',()=>{const context={OpelucidChapter:{zones:[120]},IcirrusPaths:{route(){throw Error('A real route is required');}}};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(src,'opelucid-continuity.js'),'utf8'),context,{filename:'opelucid-continuity.js'});const p={x:-365.5,y:-592.5,height:0};assert.deepEqual(Array.from(context.OpelucidContinuity.path(p,{...p},120)),[]);assert.throws(()=>context.OpelucidContinuity.path(p,{...p,y:p.y+1},120),/real route/);assert.throws(()=>context.OpelucidContinuity.path(p,{...p,height:1},120),/real route/);});
vm.runInContext(fs.readFileSync(path.join(src,'native-rail-paths.js'),'utf8'),c);
test('all four native Tower rail portals have a body-sized landing on their connected rail graph',()=>{
 for(const zone of [209,211])for(const w of c.OPELUCID_EVENTS.zones[zone].warps){const p=c.NativeRails.warp(zone,w),at=c.NativeRails.landing(zone,w),data=c.OPELUCID_RAILS[zone],line=data.lines[w.x],connected=new Set([w.x,...data.points[line.a].lines,...data.points[line.b].lines]);
  assert.ok(connected.has(at.rail.line),zone+'/'+w.x+' lands on an unrelated ring');assert.ok(Math.abs((p.x-16-at.x)*p.out.z-(p.z-16-at.z)*p.out.x)<1e-6);
  for(const [dx,dz]of [[-.2,-.2],[.2,.2],[-.2,.2],[.2,-.2]])assert.ok(c.NativeRails.locate(zone,at.x+dx,at.z+dz,{height:at.rail.height}),zone+'/'+w.x+' clips the footprint');
 }
});

test('curved Tower traversal retains native ramp direction and continuous grounded or airborne steps',()=>{
 const jumps=c.NativeRailPaths.jumpLinks(211);assert.deepEqual(Array.from(jumps,j=>[j.line,j.row]),[[17,1],[32,1],[45,2]]);
 for(const jump of jumps){assert.ok(jump.path.some(p=>p.jumpLift>.5));assert.equal(jump.path.at(-1).jumpLift,0);assert.ok(c.NativeRails.locate(211,jump.from.x,jump.from.y,{height:jump.from.height}));assert.ok(c.NativeRails.locate(211,jump.to.x,jump.to.y,{height:jump.to.height}));}
 const [a,b]=c.OPELUCID_EVENTS.zones[211].warps.map(w=>c.NativeRails.landing(211,w)),points=c.NativeRailPaths.route(211,{x:a.x,y:a.z,height:a.rail.height},{x:b.x,y:b.z,height:b.rail.height});
 assert.ok(points.some(p=>p.jumpLift>.1),'Native ledges were skipped');
 for(let i=1;i<points.length;i++){const p=points[i],before=points[i-1];assert.ok(Math.hypot(p.x-before.x,p.y-before.y,p.height-before.height)<.4,'Discontinuous route');if(p.jumpLift===undefined)assert.ok(c.NativeRails.locate(211,p.x,p.y,{height:p.height}),'Walk over a gap');}
});
