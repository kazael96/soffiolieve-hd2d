'use strict';
const {repo,sourceRoot,sourcePath,site,fixturePath,readSourceBytes,readFixtureBytes}=require('./helpers/minccino-slap-paths064.cjs');
// Same regression runs against frozenV3 (expectedFAIL) and V4 dedicated
// Recovery (candidate). No renderer/global status ownership is transferred.
const test=require('node:test'),assert=require('node:assert/strict');
const {make}=require('./helpers/minccino-slap-protocol064.cjs');
test('settling an abandoned native slap resource gate preserves a newer unregistered status owner',async()=>{
 const h=make(process.env.SOFFIOLIEVE_PREFLIGHT_BASELINE!=='1'),owned=await h.owned('p1');let release;const wait=new Promise(done=>release=done),bank=h.bank('p2');bank.ready=false;h.prepareUsing(()=>wait);
 try{h.frame(16);await h.flush();const box=h.c.document.getElementById('loading');assert(box);const foreign=h.c.document.createElement('p');foreign.textContent='Ripristino scena estranea';box.replaceChildren(foreign);h.c.MoveFX.cancel();await h.flush();assert.equal(h.c.document.getElementById('loading'),box,'Only the exact native slap status may be removed');assert.equal(box.children[0],foreign);}finally{bank.ready=true;release();await h.flush();await owned.dispose();}
});
