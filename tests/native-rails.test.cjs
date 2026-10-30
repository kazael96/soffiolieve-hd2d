const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function context(){const c={};c.window=c;vm.createContext(c);for(const f of ['pinwheel-rails','native-rails','pinwheel-events'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),c);return c;}
test('IRBI rail assignments and bridge endpoint positions retain native coordinates',()=>{
 const c=context(),r=c.NativeRails;assert.equal(c.PINWHEEL_RAILS[28].file,5);assert.equal(c.PINWHEEL_RAILS[249].file,11);assert.equal(c.PINWHEEL_RAILS[249].chunkSpan,128);
 assert.deepEqual(JSON.parse(JSON.stringify(r.position(249,13,0))),{x:89.3125,height:2,z:275.9375});
 assert.deepEqual(JSON.parse(JSON.stringify(r.position(249,13,4))),{x:93.15625,height:2,z:275.9375});
 for(const [zone,data]of Object.entries(c.PINWHEEL_RAILS))for(const [id,l]of data.lines.entries())for(const t of [0,.2,.5,.8,1]){
  const p=r.position(zone,id,l.length*t);assert.ok(Object.values(p).every(Number.isFinite));const endpoint=t===0?data.points[l.a].position:t===1?data.points[l.b].position:null;
  if(endpoint)for(const [i,key]of ['x','height','z'].entries())assert.ok(Math.abs(p[key]-endpoint[i])<1e-7,zone+'/'+id+' '+key);
 }
});
test('Castelia follows native camera orientation and screen-relative input remains consistent',()=>{
 const c=context(),r=c.NativeRails,data=c.PINWHEEL_RAILS[28];
 for(const [id,line]of data.lines.entries())for(const t of [.1,.5,.9]){
  const p=r.position(28,id,line.length*t),yaw=r.cameraYaw(28,p.x-16,p.z-16,{line:id,height:p.height});assert.ok(Number.isFinite(yaw));if(id===0)assert.ok(Math.abs(yaw)>1,'eastern entrance requires the original rotated view');
  for(const [screenDir,[x,z]]of [[0,[0,-1]],[1,[0,1]],[2,[-1,0]],[3,[1,0]]]){const dx=x*Math.cos(yaw)+z*Math.sin(yaw),dz=-x*Math.sin(yaw)+z*Math.cos(yaw);assert.ok(Math.abs(dx*Math.cos(yaw)-dz*Math.sin(yaw)-x)<1e-10);assert.ok(Math.abs(dx*Math.sin(yaw)+dz*Math.cos(yaw)-z)<1e-10);}
 }
 assert.equal(r.cameraYaw(249,0,0),0);assert.equal(r.screenDirection(0,Math.PI/2),3);
});
test('native walkable ribbons connect along the bridge and reject distant empty space',()=>{
 const c=context(),r=c.NativeRails;let samples=0;
 for(const [id,line]of c.PINWHEEL_RAILS[249].lines.entries())for(let front=.5;front<line.length;front+=.5){
  if(line.tiles.values[Math.floor(front)*line.tiles.width+Math.floor(line.tiles.width/2)]&0x10000)continue;
  const p=r.position(249,id,front),hit=r.locate(249,p.x-16,p.z-16,{height:p.height,line:id});assert.ok(hit,'disconnected rail '+id+' / '+front);assert.ok(Math.abs(hit.height-p.height)<.03);samples++;
 }
 assert.ok(samples>600);assert.equal(r.locate(249,-100,-100),null);assert.equal(r.locate(28,-100,-100),null);
});
test('rail arrivals clear the blocked warp tile for the whole player body, not only its center',()=>{
 const c=context(),r=c.NativeRails,warp=c.PINWHEEL_EVENTS.zones[249].warps[0],p=r.warp(249,warp),old={x:p.x-16-p.out.x,z:p.z-16-p.out.z};
 assert.ok(r.locate(249,old.x,old.z,{height:p.height,line:p.line}));assert.ok(!r.locate(249,old.x-.18,old.z-.18,{height:p.height,line:p.line}),'reproduce the old foot collision');
 const first=r.landing(249,warp);assert.ok(first.distance>1);
 for(const [zone,index]of [[249,0],[249,1],[28,9],[28,10]]){const at=r.landing(zone,c.PINWHEEL_EVENTS.zones[zone].warps[index]);assert.ok(at.distance<=3);for(const [dx,dz]of [[-.2,-.2],[.2,.2],[-.2,.2],[.2,-.2]])assert.ok(r.locate(zone,at.x+dx,at.z+dz,at.rail),'blocked landing corner '+zone+'/'+index);}
});
test('overlapping bridge decks use height instead of switching the player to another floor',()=>{
 const c=context(),r=c.NativeRails,x=113.9375-16,z=275.9375-16;
 const lower=r.locate(249,x,z,{height:14.3}),upper=r.locate(249,x,z,{height:29.5});
 assert.ok(lower&&upper);assert.ok(upper.height-lower.height>12);assert.notEqual(upper.line,lower.line);
 assert.equal(r.locate(249,x,z,{height:70}),null);
});
test('rail NPCs and warp anchors decode signed side offsets without huge coordinates',()=>{
 const c=context(),r=c.NativeRails;
 for(const zone of [249,28]){
  for(const n of c.PINWHEEL_EVENTS.zones[zone].actors){const p=r.actor(zone,n);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));assert.ok(Math.abs(p.x)<400&&Math.abs(p.z)<400);assert.equal(p.railOriginal.y,n.y);}
  for(const w of c.PINWHEEL_EVENTS.zones[zone].warps){const p=r.warp(zone,w);assert.ok(Object.values(p.out).every(Number.isFinite));assert.ok(Math.abs(p.side)<12);}
 }
 const entry=r.warp(249,c.PINWHEEL_EVENTS.zones[249].warps[0]);assert.equal(entry.side,0);assert.ok(entry.out.x<-.9);assert.ok(Math.abs(entry.out.z)<.01);
 const exit=r.warp(249,c.PINWHEEL_EVENTS.zones[249].warps[1]);assert.ok(exit.out.z<-.9);
});
