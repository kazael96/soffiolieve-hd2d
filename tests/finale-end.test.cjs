const test=require('node:test'),assert=require('node:assert/strict'),{motion,create}=require(process.env.SOFFIOLIEVE_END_SOURCE||'../src/finale-end.js');
test('Italian END keeps native16-tick fades and waits901 ticks before automatic exit',()=>{
 const m=motion();let s;for(let i=0;i<15;i++){s=m.tick(true);assert.equal(s.phase,'in');}s=m.tick(true);assert.equal(s.phase,'wait');for(let i=0;i<900;i++)assert.equal(m.tick().phase,'wait');assert.equal(m.tick().phase,'out');for(let i=0;i<15;i++)assert.equal(m.tick().finished,false);assert.equal(m.tick().finished,true);
});
test('A/B/Start confirmation is consumed only in the wait phase',()=>{
 const m=motion();for(let i=0;i<16;i++)m.tick(true);assert.equal(m.tick(true).phase,'out');for(let i=0;i<16;i++)m.tick();assert.equal(m.tick(true).finished,true);
});
function fixture(){
 const queue=new Map(),events=new Map(),panels=[];let id=0,now=0,hidden=false,resets=0;
 const element=()=>({style:{},setAttribute(){},append(){},addEventListener(){},removeEventListener(){},remove(){panels.splice(panels.indexOf(this),1);},getContext:()=>({fillRect(){},drawImage(){}})});
 const document={get hidden(){return hidden;},createElement:element,body:{append:e=>panels.push(e)},addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};
 const api=create({document,image:async()=>({}),requestFrame:fn=>{queue.set(++id,fn);return id;},cancelFrame:id=>queue.delete(id),resetInput:()=>resets++});
 async function pump(count){for(let i=0;i<count;i++){await Promise.resolve();const jobs=[...queue.values()];queue.clear();now+=100;for(const fn of jobs)fn(now);}}
 return{api,queue,events,panels,pump,hide:v=>hidden=v,get resets(){return resets;}};
}
test('hidden page pauses END; repeat keys do not dismiss; valid confirmation cleans every handler',async()=>{
 const f=fixture(),p=f.api.play();await f.pump(15);f.hide(true);await f.pump(300);assert.equal(f.api.active,true);f.hide(false);f.events.get('keydown')({key:'Enter',repeat:true});await f.pump(2);assert.equal(f.api.active,true);f.events.get('keydown')({key:'Enter',preventDefault(){},stopImmediatePropagation(){}});await f.pump(6);await p;assert.equal(f.events.size,0);assert.equal(f.queue.size,0);assert.equal(f.panels.length,0);assert.equal(f.resets,2);
});
test('cancellation during resource loading never appends a late END panel',async()=>{
 const f=fixture(),p=assert.rejects(f.api.play(),/annullata/);f.api.cancel();await f.pump(6);await p;assert.equal(f.panels.length,0);assert.equal(f.events.size,0);
});
test('END remains visible above the original opaque field fade at layer80',async()=>{
 const f=fixture(),p=f.api.play();await f.pump(12);const actual=Number(f.panels[0]?.style.zIndex);f.api.cancel();await assert.rejects(p,/annullata/);assert.ok(actual>80,'END was hidden below the opaque original field cover');
});
