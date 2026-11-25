'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{create,data}=require('./native602-host064.cjs');
function actualDrawMatchesSupport(draw){assert.equal(draw.matrix[4],Math.fround(draw.support.x));assert.equal(draw.matrix[5],Math.fround(draw.support.y));}
test('real NAPI quarter-pixel translation fails the exact backend predicate while native supports stay unchanged',async()=>{
 const h=await create();await h.session([602,500,495,500],false);const before=h.render(390,490),slots=h.c.DoubleBattles.slots(390,490),snap=data(slots);assert.equal(before.draws.length,4);for(const draw of before.draws)actualDrawMatchesSupport(draw);
 const original=h.R.draw;h.R.draw=function(ctx,...args){ctx.translate(.25,0);try{return original.call(this,ctx,...args);}finally{ctx.translate(-.25,0);}};let shifted;try{shifted=h.render(390,490);}finally{h.R.draw=original;}
 assert.equal(shifted.draws.length,4);assert.equal(h.c.DoubleBattles.slots(390,490),slots);assert.deepEqual(data(slots),snap,'Physical support/world/size must not be moved to hide the injected renderer error');
 for(const draw of shifted.draws){const prior=before.draws.find(row=>row.slot===draw.slot);assert.equal(draw.support,prior.support);assert.equal(draw.nativeMon,prior.nativeMon);assert.equal(draw.result,true);assert.equal(draw.size,prior.size);assert.equal(draw.x,prior.x);assert.equal(draw.y,prior.y);assert.equal(draw.matrix[5],Math.fround(draw.support.y));assert.notEqual(draw.matrix[4],Math.fround(draw.support.x));assert.throws(()=>actualDrawMatchesSupport(draw),assert.AssertionError,'Actual original draw with .25px drift must be rejected');}
});
