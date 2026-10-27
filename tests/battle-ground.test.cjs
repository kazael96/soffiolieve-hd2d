const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),Ground=require('../src/battle-ground.js'),Sprites=require('../src/pokemon-anim.js');
const c={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../src/battle-diorama.js'),'utf8'),c);const Diorama=c.window.BattleDiorama;
const contexts=[{id:'bedroomMess',terrain:'interior'},{id:'route1',terrain:'path'},{id:'route1',terrain:'grass'}];
test('feet and contact shadows share the actual diorama camera and intersect the ground in every layout',()=>{
 for(const context of contexts)for(const[w,h]of [[1280,475],[390,490],[844,234],[600,400]]){const view=Diorama.camera(context,w/h),layout=Ground.layout(w,h,context,view);for(const side of ['p1','p2']){const p=layout[side],q=Ground.project(view,p.world,w,h);assert.ok(Math.abs(q.x-p.x)<1e-7);assert.ok(Math.abs(q.y-p.y)<1e-7);assert.ok(Math.abs(p.world[1]-(context.id==='bedroomMess'?.125:.02))<1e-8);assert.ok(p.depth>0);assert.ok(p.y>h*.5&&p.y<h*.9);assert.ok(p.x>0&&p.x<w);assert.ok(p.height>0&&p.height<=h*.34+1e-8);assert.ok(p.y-p.height>0);}assert.ok(layout.p1.depth<layout.p2.depth);assert.ok(layout.p1.height>layout.p2.height);}
});
test('effect attachment follows the same foot point and projected body height after a resize',()=>{
 global.BattleDiorama=Diorama;for(const context of contexts)for(const[w,h]of [[1280,475],[390,490]]){const layout=Ground.layout(w,h,context);for(const side of ['p1','p2']){const p=Ground.effect(side,w,h,context),a=layout[side];assert.equal(p.x,a.x);assert.ok(Math.abs((p.y+a.height*.55)-a.y)<1e-8);}}delete global.BattleDiorama;
});
test('transparent sprite margins do not count as feet, including partially transparent antialiasing',()=>{
 const pixels=new Uint8ClampedArray(10*12*4);pixels[(2*10+3)*4+3]=255;pixels[(8*10+6)*4+3]=255;pixels[(11*10+9)*4+3]=10;assert.deepEqual(Sprites.alphaBounds(pixels,10,12),[3,2,7,9]);assert.equal(Sprites.alphaBounds(new Uint8ClampedArray(16),2,2),null);
});
test('contact shadow is projected onto the ground plane and lift reduces opacity without moving it upwards',()=>{
 const a=Ground.layout(1280,475,contexts[1],Diorama.camera(contexts[1],1280/475)).p1,transforms=[],stops=[];const ctx={globalAlpha:1,save(){},restore(){},transform(...m){transforms.push(m)},createRadialGradient(){return{addColorStop(t,c){stops.push(c)}}},beginPath(){},arc(){},fill(){}};
 Ground.shadow(ctx,a,{lift:0});const resting=stops[0];stops.length=0;Ground.shadow(ctx,a,{lift:80});assert.deepEqual(transforms[0],transforms[2]);assert.notEqual(stops[0],resting);assert.ok(transforms.every(m=>m.every(Number.isFinite)));assert.ok(Math.abs(transforms[0][3])>0,'Perspective must preserve a finite depth axis');
});
