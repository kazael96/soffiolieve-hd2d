'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Q=require('./qa-tail-reference064.js');
const check=(ok,message)=>{if(!ok)throw Error(message);};
function fixture({empty=false,clip=false,drawResult=true,cellSize,captureError=false}={}){
 const calls={draw:[],sample:[],prepare:[],captures:[]},canvasFactory=()=>{const c={width:0,height:0},ctx={canvas:c,filled:[],clearRect(){this.pixel=null;this.filled=[];},fillRect(...args){this.filled.push(args);},drawImage(){},fillText(){},getImageData(){const data=new Uint8ClampedArray(c.width*c.height*4);if(this.pixel)data[(this.pixel[1]*c.width+this.pixel[0])*4+3]=255;return{data};}};c.getContext=()=>ctx;return c;};
 const S={select:(species,id)=>({species,id,frames:126,impact:60,kind:'nativeTailWhipStatus064'}),async prepare(p){calls.prepare.push(p);},sample(p,f,side,miss){calls.sample.push({p,f,side,miss});return{species:p.species,t:f/126,dir:side==='p1'?1:-1,nativeTailWhip:p.species,nativeTick:0,nativeParentMap:0,feet:0,reach:0,lift:0,tail:Math.sin(f),head:0,arms:0};},part(track,back,a){return track===8?{rotation:a.tail*a.dir*.15,pivotX:0,pivotY:0}:null;}},R={cache:{},parts:()=>[{r:[8,-14,-29],f:[8]},{r:[8,-14,-29],f:[8]},{r:[1,0,0],f:[1]}],draw(ctx,id,back,x,y,size,tick,grounded,a){calls.draw.push({id,back,x,y,size,tick,grounded,a});if(!empty)ctx.pixel=clip?[0,0]:[x,y-20];return drawResult;}};
 for(const id of[500,503])for(const view of['front','back'])R.cache[id+'-'+view]={ready:true,image:{cpuSynthetic:true},data:{cpuSynthetic:true}};
 const e={SpeciesMoves:S,ROM_SPRITE_ANIM:R,check,createCanvas:canvasFactory,cellSize,sourcePins:{fixture:'CPU_SYNTHETIC_NOT_VISUAL'},capture(label,canvas,metadata){if(captureError)throw Error('capture rejection');calls.captures.push({label,width:canvas.width,height:canvas.height,fillRects:canvas.getContext().filled.slice(),metadata});}};
 return{e,calls,S,R};
}
test('alpha proof distinguishes empty, interior, partial-alpha edge and malformed source buffers',()=>{
 const data=new Uint8ClampedArray(4*4*4);assert.deepEqual(Q.alphaProof(data,4,4),{nonzeroAlphaPixels:0,edgeAlphaPixels:0,bounds:null});data[(1*4+2)*4+3]=255;assert.deepEqual(Q.alphaProof(data,4,4),{nonzeroAlphaPixels:1,edgeAlphaPixels:0,bounds:[2,1,3,2]});data[3]=1;assert.equal(Q.alphaProof(data,4,4).edgeAlphaPixels,1);assert.throws(()=>Q.alphaProof(data,5,4),/Invalid/);
});
test('synthetic CPU wiring samples exactly508 production frames, renders once each and exports32 bounded boards',async()=>{
 const {e,calls,S,R}=fixture(),owners=[S.sample,S.part,S.select,S.prepare,R.draw],result=await Q.run(e);
 assert.equal(result.referenceOnly,true);assert.equal(result.actualBattleCommands,false);assert.equal(result.frames,508);assert.equal(result.boards,32);assert.equal(calls.prepare.length,2);assert.equal(calls.sample.length,508);assert.equal(calls.draw.length,508);assert.equal(calls.captures.length,32);assert.deepEqual([S.sample,S.part,S.select,S.prepare,R.draw],owners);
 for(const species of[500,503])for(const side of['p1','p2'])assert.deepEqual(calls.sample.filter(x=>x.p.species===species&&x.side===side).map(x=>x.f),Array.from({length:127},(_,i)=>i));
 for(const draw of calls.draw){assert.equal(draw.x,80);assert.equal(draw.y,145);assert.equal(draw.size,1.3);assert.equal(draw.tick,0);assert.equal(draw.grounded,true);assert.equal(draw.a.nativeTailWhip,draw.id);}
 for(const cap of calls.captures){assert.equal(cap.width,640);assert.equal(cap.height,640);assert.ok(cap.label.length<90);assert.equal(cap.metadata.referenceOnly,true);assert.equal(cap.metadata.actualBattleCommand,false);assert.equal(cap.fillRects.length,cap.metadata.usedTiles);assert.equal(cap.metadata.frames[0].parts.length,2);assert.equal(cap.metadata.frames[0].alpha.edgeAlphaPixels,0);}
 for(const cap of calls.captures.filter(c=>c.metadata.board===8)){assert.equal(cap.metadata.usedTiles,15);assert.equal(cap.metadata.unusedTiles,1);assert.equal(cap.metadata.frames.at(-1).frame,126);assert.ok(!cap.fillRects.some(([x,y])=>x===480&&y===480),'unused final tile remains transparent');}
});
test('explicit192 cell rerun changes cell/anchor only and keeps native size unchanged',async()=>{
 const f=fixture({cellSize:192}),result=await Q.run(f.e);assert.deepEqual(result.anchor,[96,177]);assert.equal(result.size,1.3);assert.equal(f.calls.captures[0].width,768);assert.ok(f.calls.draw.every(d=>d.x===96&&d.y===177&&d.size===1.3));
});
test('clipping/empty/failed native draws fail before exporting a misleading board',async()=>{
 for(const [options,message]of[[{clip:true},/clips cell/],[{empty:true},/empty/],[{drawResult:false},/original native draw failed/]]){const f=fixture(options);await assert.rejects(Q.run(f.e),message);assert.equal(f.calls.captures.length,0);assert.equal(f.calls.draw.length,1);}
});
test('wrong body markers, moving feet and profile mismatch cannot enter source reference',async()=>{
 for(const patch of[{nativeTailWhip:500},{nativeTick:1},{nativeParentMap:1},{feet:1},{reach:.1},{lift:.2}]){const f=fixture(),sample=f.S.sample;f.S.sample=(p,...args)=>({...sample(p,...args),...patch,nativeTailWhip:patch.nativeTailWhip??p.species});if(patch.nativeTailWhip===500){f.S.sample=(p,...args)=>({...sample(p,...args),nativeTailWhip:999});}await assert.rejects(Q.run(f.e),/ownership or stable anchor/);assert.equal(f.calls.draw.length,0);}
 const f=fixture(),select=f.S.select;f.S.select=(...args)=>({...select(...args),kind:'tailPound'});await assert.rejects(Q.run(f.e),/guarded production profile/);
});
test('preparation failure, source-owner replacement and capture failure propagate without helper mutations',async()=>{
 const a=fixture();a.S.prepare=async()=>{throw Error('native prepare rejection');};const owners=[a.S.sample,a.S.part,a.S.select,a.S.prepare,a.R.draw];await assert.rejects(Q.run(a.e),/native prepare rejection/);assert.deepEqual([a.S.sample,a.S.part,a.S.select,a.S.prepare,a.R.draw],owners);assert.equal(a.calls.draw.length,0);
 const b=fixture();b.S.prepare=async()=>{b.R.draw=()=>true;};await assert.rejects(Q.run(b.e),/source owner changed/);assert.equal(b.calls.draw.length,0);
 const c=fixture({captureError:true}),draw=c.R.draw,sample=c.S.sample;await assert.rejects(Q.run(c.e),/capture rejection/);assert.equal(c.R.draw,draw);assert.equal(c.S.sample,sample);assert.equal(c.calls.draw.length,16);
});
