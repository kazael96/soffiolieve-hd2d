const test=require('node:test'),assert=require('node:assert/strict'),B=require('../src/field-backdrops.js');
test('only the original Castelia enclosing skyline shell is a backdrop',()=>{
 assert.equal(B.matches({zone:28},{model:'pw-map-635'}),true);
 for(const [zone,model]of [[152,'pw-map-635'],[28,'pw-map-636'],[28,'pw-map-637'],[28,'pw-map-638'],[28,'pw-prop-True-4-234'],[28,'actor-635']])assert.equal(B.matches({zone},{model}),false);
});
test('the original gradient, sky and skyline retain their self-depth but cannot occlude physical maps and actors',()=>{
 const log=[],g={CULL_FACE:1,BACK:2,TRIANGLES:3,DEPTH_BUFFER_BIT:4,uniform1f(){},uniform2f(){},uniform3f(){},enable(){},disable(){},cullFace(){},depthMask:v=>log.push(['depthMask',v]),drawArrays:(...a)=>log.push(['draw',...a]),clear:bits=>log.push(['clear',bits])};
 const r={scene:{zone:28},gl:g,loc:{},models:{'pw-map-635':[36,12,36,12].map((count,i)=>({count,texture:'native'+i,alpha:1,doubleSided:false}))},cache:{},bind(){},texture(){}};
 assert.equal(B.draw(r,[{model:'pw-map-635',x:0,y:0,z:0,rotation:0},{model:'pw-map-638'}]),true);
 assert.deepEqual(log,[['draw',3,0,36],['draw',3,0,12],['draw',3,0,36],['draw',3,0,12],['depthMask',true],['clear',4]],'No colour clear, skipped native layer, or premature per-group depth clear');
 log.length=0;assert.equal(B.draw(r,[{model:'pw-map-638'}]),false);assert.equal(log.length,0);
});
test('an active native material/model animation remains the owner of the backdrop geometry',()=>{
 const log=[],r={scene:{zone:28},gl:{uniform1f(){},depthMask(){},clear:()=>log.push('depth'),disable(){}},loc:{},fieldModels:{replaces:()=>true,draw:ins=>log.push(ins.model)}};
 assert.equal(B.draw(r,[{model:'pw-map-635'}]),true);assert.deepEqual(log,['pw-map-635','depth']);
});
