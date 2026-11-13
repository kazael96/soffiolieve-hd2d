const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const src=path.resolve(__dirname,'../src'),raw=fs.readFileSync(path.join(src,'finale-credits-data.js'),'utf8'),data=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,'')),motion=require('../src/finale-credits-motion.js');
test('native Italian staff roll keeps all rows, exact sources, original glyphs and the Black dragon',()=>{
 assert.equal(data.source.overlay,181);assert.equal(data.source.tableMember,1);assert.equal(data.rows.length,437);assert.equal(data.texts.length,401);assert.deepEqual(data.source.modelMembers,[6,7,8]);assert.deepEqual(Object.values(data.fonts).map(f=>f.nativeMember),[0,2]);assert.equal(data.music,1016);
 for(const asset of [...Object.values(data.images),data.model]){const b=fs.readFileSync(path.join(src,asset.src||asset.url));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),asset.sha256);}
 assert.ok(data.model.loopFrames>1);for(const r of data.rows)if(r.text!==65535)for(const c of data.texts[r.text])assert.ok(data.fonts[r.font].glyphs[c]);
 assert.equal(data.fontPalette.member,12);assert.deepEqual(data.fontPalette.colorsRGB[1],[255,255,255]);assert.deepEqual(data.fontPalette.colorsRGB[3],[49,90,222]);
});
test('all native commands terminate at435; trailing White title is never rendered or treated as another ending',()=>{
 const m=motion.create(data),titles=[],staticPages=[],cameraMoves=[];let s;for(let i=0;i<12000;i++){s=m.tick();if(s.phase==='in'&&s.alpha===0)staticPages.push(s.lines.map(l=>data.texts[l.text]));if(s.lines.some(l=>l.text===348))titles.push(s.frame);if(s.visible)cameraMoves.push(s.camera);if(s.finished)break;}
 assert.equal(s.finished,true);assert.equal(s.row,435);assert.deepEqual(s.visited,Array.from({length:435},(_,i)=>i));assert.deepEqual(staticPages[0],['Director','Junichi  Masuda']);assert.equal(staticPages.length,3);assert.ok(titles.length>0);assert.deepEqual(s.camera,data.cameraQ12[6]);assert.ok(cameraMoves.length>1000);assert.equal(s.visited.includes(435),false);
});
test('original logo setup, zoom/blend,166-tick hold and cleanup finish before the first credit row',()=>{
 const m=motion.create(data);let s;for(let i=0;i<42;i++){s=m.tick();assert.equal(s.row,0);assert.equal(s.logo.visible,false);}s=m.tick();assert.equal(s.frame,43);assert.equal(s.logo.visible,true);assert.equal(s.logo.alpha,0);assert.equal(s.logo.scale,8);
 s=m.tick();assert.equal(s.logo.alpha,2/16);assert.equal(s.logo.scale,7);for(let i=0;i<7;i++)s=m.tick();assert.equal(s.phase,'logoHold');assert.equal(s.logo.scale,1);assert.equal(s.logo.alpha,1);assert.equal(s.wait,166);
 for(let i=0;i<166;i++){s=m.tick();assert.equal(s.row,0);}assert.equal(s.phase,'logoOut');s=m.tick();assert.equal(s.logo.alpha,14/16);assert.equal(s.logo.scale,2);for(let i=0;i<7;i++)s=m.tick();assert.equal(s.logo.visible,false);assert.equal(s.phase,'introCleanup');s=m.tick();assert.equal(s.row,0);s=m.tick();assert.equal(s.row,2);assert.equal(s.phase,'in');assert.equal(s.visible,false);
});
test('a zero-height credit shares its baseline and preserves the preceding line wait',()=>{
 const m=motion.create(data);let prior,next;for(let i=0;i<2000;i++){const s=m.tick();if(s.lines.some(l=>l.row===23)&&!prior)prior=s;if(s.lines.some(l=>l.row===25)){next=s;break;}}
 assert.ok(prior&&next);const lead=prior.lines.find(l=>l.row===23),name=prior.lines.find(l=>l.row===24);assert.equal(name.y,lead.y-2);assert.equal(prior.wait,18);assert.ok(next.frame-prior.frame>=18);
});
test('native camera projections are finite and preserve the recorded aspect instead of changing on phone orientation',()=>{
 for(const c of data.cameraQ12){const p=motion.projection(c,data.perspective);assert.equal(p.length,16);assert.ok(p.every(Number.isFinite));}
 assert.throws(()=>motion.projection([0,0,0,0,0,0],data.perspective),/degenere/);assert.throws(()=>motion.create({rows:[]}),/non valida/);
});
function fixture({rate=1,fail=false,slow=false,retry=false}={}){
 const c={TextDecoder,Promise,FinaleCreditsMotion:motion};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(src,'finale-credits.js'),'utf8'),c);let now=0,next=0,hidden=false,destroyed=0,stops=0,resets=0,release;const queue=new Map(),panels=[],sounds=[],frames=[];
 const element=()=>({style:{},dataset:{},setAttribute(){},append(){},remove(){const i=panels.indexOf(this);if(i>=0)panels.splice(i,1);},getContext:()=>({clearRect(){},drawImage(){},save(){},restore(){},translate(){},scale(){}})}),doc={get hidden(){return hidden;},body:{append:e=>panels.push(e)},createElement:element};
 let attempts=0,maxPanels=0;
 class Scene{constructor(canvas,assets){assert.ok(assets.materialAlpha?.dragon,'Shared StarterScene requires the native material-alpha dictionary');attempts++;maxPanels=Math.max(maxPanels,panels.length);this.ready=retry&&attempts===1?Promise.reject(Error('temporary model failure')):slow?new Promise(resolve=>release=resolve):Promise.resolve();}draw(){if(fail)throw Error('GPU lost');}destroy(){destroyed++;}}
 const api=c.FinaleCredits.create({data,resource:p=>p,document:doc,resources:{image:async()=>({})},Scene,resourceGate:async(key,load)=>{if(!retry)return load();try{return await load();}catch(error){assert.match(error.message,/temporary model/);return load();}},rate:()=>rate,music:{src:'native1016'},audio:{createCinematic:()=>({prepare:async()=>{},sync:(f,r)=>sounds.push([f,r]),stop:()=>stops++})},requestFrame:f=>{queue.set(++next,f);return next;},cancelFrame:id=>queue.delete(id),resetInput:()=>resets++,onFrame:s=>frames.push({frame:s.frame,row:s.row})});
 async function pump(n=1600){for(let i=0;i<n;i++){await Promise.resolve();const jobs=[...queue.values()];queue.clear();now+=100;for(const f of jobs)f(now);}}
 return{api,pump,panels,queue,frames,sounds,setHidden:v=>hidden=v,release:()=>release?.(),get maxPanels(){return maxPanels;},get destroyed(){return destroyed;},get stops(){return stops;},get resets(){return resets;}};
}
test('automatic resource retry replaces the failed scene and panel instead of accumulating invisible credits canvases',async()=>{
 const f=fixture({retry:true}),play=f.api.play();await f.pump();await play;assert.equal(f.maxPanels,1);assert.equal(f.panels.length,0);assert.equal(f.destroyed,2);assert.equal(f.stops,1);
});
test('credits use their own60Hz clock and synchronize the original soundtrack at1/2/4 with complete cleanup',async()=>{
 for(const rate of [1,2,4]){const f=fixture({rate}),play=f.api.play();await f.pump();await play;assert.equal(f.frames.at(-1).row,435);assert.ok(f.sounds.every(([frame,r],i)=>frame===f.frames[i].frame/2&&r===rate));assert.equal(f.panels.length,0);assert.equal(f.queue.size,0);assert.equal(f.destroyed,1);assert.equal(f.stops,1);assert.equal(f.resets,1);assert.equal(f.api.active,false);}
});
test('background, duplicate start, cancellation while loading and render failures never leave a credits overlay',async()=>{
 const f=fixture(),play=f.api.play();for(let i=0;i<100&&!f.frames.length;i++)await f.pump(1);assert.ok(f.frames.length);f.setHidden(true);const at=f.frames.at(-1).frame;await f.pump(10);assert.equal(f.frames.at(-1).frame,at);await assert.rejects(f.api.play(),/già in corso/);f.setHidden(false);await f.pump();await play;
 const slow=fixture({slow:true}),cancelled=assert.rejects(slow.api.play(),/annullati/);await slow.pump(15);assert.equal(slow.api.cancel(),true);await slow.pump(5);await cancelled;slow.release();await slow.pump(5);assert.equal(slow.panels.length,0);assert.equal(slow.frames.length,0);assert.equal(slow.destroyed,1);
 const broken=fixture({fail:true}),failed=assert.rejects(broken.api.play(),/GPU lost/);await broken.pump();await failed;assert.equal(broken.panels.length,0);assert.equal(broken.api.active,false);assert.equal(broken.queue.size,0);
});
