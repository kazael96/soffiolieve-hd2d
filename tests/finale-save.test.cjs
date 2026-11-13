const test=require('node:test'),assert=require('node:assert/strict'),{create}=require('../src/finale-save.js');
function fixture(){
 const queue=new Map(),panels=[],rendered=[],sounds=[];let id=0,now=0,hidden=false;
 const element=()=>({style:{},dataset:{},setAttribute(){},append(){},remove(){panels.splice(panels.indexOf(this),1);}}),document={get hidden(){return hidden;},createElement:element,body:{append:e=>panels.push(e)}};
 const api=create({document,render:(canvas,text)=>rendered.push(text),format:require('../src/native-text-layout.js').format,messages:{3:'Salvataggio in corso.',4:'{0100:0} ha salvato il gioco.'},playerName:()=> 'Alcide',playSound:id=>sounds.push(id),requestFrame:fn=>{queue.set(++id,fn);return id;},cancelFrame:id=>queue.delete(id)});
 async function pump(count){for(let i=0;i<count;i++){await Promise.resolve();const jobs=[...queue.values()];queue.clear();now+=100;for(const fn of jobs)fn(now);}}
 return{api,panels,queue,rendered,sounds,pump,hide:v=>hidden=v};
}
test('automatic save writes once after rendering and only then announces success and plays1368',async()=>{
 const f=fixture();let writes=0;const p=f.api.play(()=>{writes++;assert.deepEqual(f.rendered,['Salvataggio in corso.']);return true;});await f.pump(55);assert.equal(await p,true);assert.equal(writes,1);assert.deepEqual(f.rendered,['Salvataggio in corso.','Alcide ha salvato il gioco.']);assert.deepEqual(f.sounds,[1368]);assert.equal(f.panels.length,0);assert.equal(f.queue.size,0);
});
test('failed storage produces neither a success caption nor success audio and leaves no overlay',async()=>{
 const f=fixture(),p=assert.rejects(f.api.play(()=>false),/non riuscito/);await f.pump(12);await p;assert.deepEqual(f.rendered,['Salvataggio in corso.']);assert.deepEqual(f.sounds,[]);assert.equal(f.panels.length,0);
});
test('hidden page preserves the success hold and duplicate invocation never writes twice',async()=>{
 const f=fixture();let writes=0;const p=f.api.play(()=>{writes++;return true;});await f.pump(12);await assert.rejects(f.api.play(()=>{writes++;return true;}),/già in corso/);f.hide(true);await f.pump(300);assert.equal(f.api.active,true);assert.equal(writes,1);f.hide(false);await f.pump(40);await p;assert.equal(writes,1);
});
test('cancelling before the first visible frame prevents a late save and cleans the animation',async()=>{
 const f=fixture();let writes=0;const p=assert.rejects(f.api.play(()=>{writes++;return true;}),/annullato/);f.api.cancel();await f.pump(10);await p;assert.equal(writes,0);assert.equal(f.panels.length,0);assert.equal(f.queue.size,0);
});
