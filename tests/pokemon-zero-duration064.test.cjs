const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..'),site=process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site');
function load(file){const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(file,'utf8'),c);return c.ROM_SPRITE_ANIM;}
const baseline=load(path.join(__dirname,'fixtures/pokemon-anim064-before-zero-duration.js')),actual=load(process.env.REVIEW64_ZERO_CANDIDATE||path.join(repo,'src/pokemon-anim.js'));
const cel=(id,duration)=>[id,duration,0,4096,4096,0,0];
// Independent discrete schedule: preserve original loop indices, but only positive
// time intervals own displayed poses. Zero-duration commands consume no time.
function expected(a,tick){const f=a.frames;if(!f.length)return null;const dur=x=>Math.max(0,x[1]);if(!f.some(x=>dur(x)>0))return f[0];const loop=Math.min(a.loop||0,f.length-1),forward=f.map((_,i)=>i),reverse=(a.mode===3||a.mode===4)?forward.slice(a.mode===4?loop:0,-1).reverse():[],sequence=forward.concat(reverse),total=sequence.reduce((n,i)=>n+dur(f[i]),0),intro=forward.slice(0,loop).reduce((n,i)=>n+dur(f[i]),0);tick=Math.max(0,Math.floor(tick));if(a.mode===2||a.mode===4){if(tick>=total)tick=total>intro?intro+(tick-intro)%(total-intro):tick%total;}else tick=Math.min(tick,total-1);for(const i of sequence){if(dur(f[i])>0&&tick<dur(f[i]))return f[i];tick-=dur(f[i]);}throw Error('Invalid positive-duration oracle schedule');}
test('native Unfezant back ribbon tracks never display zero-time head CEL0 at loop boundaries',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(site,'assets/animated/521-back.json')));
 for(const tick of[85,171,257,289,347,405])for(const track of[2,3,14,15])assert.equal(actual.frame(data.animations[track],tick),expected(data.animations[track],tick),'Track '+track+' tick '+tick+' must retain its positive-time native CEL/affine');
 const parts=actual.parts(data,289);for(const track of[2,3]){const selected=parts.filter(p=>p.r[0]===track);assert.ok(selected.length);assert.ok(selected.every(p=>p.f[0]===expected(data.animations[track],289)[0]));assert.ok(selected.every(p=>p.f[0]!==0),'A ribbon track must not duplicate the head at its own origin');}
});
test('finite forward and looping sequences skip zero duration and preserve the original loop index',()=>{
 for(const a of[{mode:1,loop:0,frames:[cel(0,0),cel(1,3),cel(2,0)]},{mode:2,loop:1,frames:[cel(0,2),cel(1,0),cel(2,3),cel(3,0)]},{mode:2,loop:2,frames:[cel(0,2),cel(1,3),cel(2,0)]}])for(let tick=0;tick<70;tick++)assert.equal(actual.frame(a,tick),expected(a,tick));
});
test('ping-pong skips zero frames in both directions without remapping the source loop index',()=>{
 for(const mode of[3,4])for(const loop of[0,1,2]){const a={mode,loop,frames:[cel(0,2),cel(1,0),cel(2,3),cel(3,0),cel(4,4)]};for(let tick=0;tick<100;tick++)assert.equal(actual.frame(a,tick),expected(a,tick));}
});
test('an all-zero animation holds its first native element safely for every mode',()=>{
 for(const mode of[1,2,3,4]){const a={mode,loop:1,frames:[cel(7,0),cel(8,0),cel(9,0)]};for(const tick of[0,1,20,9999])assert.equal(actual.frame(a,tick),a.frames[0]);}
});
test('every strictly positive native animation preserves baseline element identity at boundary and long ticks',()=>{
 const graphics=[...require('./fixtures/native-cells064-graphics.json').graphics,800];let checks=0,animations=0;
 for(const graphic of graphics)for(const side of['front','back']){const d=JSON.parse(fs.readFileSync(path.join(site,'assets/animated',graphic+'-'+side+'.json')));for(const a of[...d.parent,...d.animations]){if(!a.frames.length||a.frames.some(f=>f[1]<=0))continue;const sum=a.frames.reduce((n,f)=>n+f[1],0),ticks=new Set([0,1,sum-1,sum,sum+1,sum*2+1,100000]);let age=0;for(const f of a.frames){ticks.add(age);ticks.add(age+f[1]-1);age+=f[1];}for(const tick of ticks){assert.equal(actual.frame(a,tick),baseline.frame(a,tick));checks++;}animations++;}}
 assert.ok(animations>1000);assert.ok(checks>10000);
});
test('all original zero-duration animations in offered graphics follow positive-time scheduling',()=>{
 const graphics=[...require('./fixtures/native-cells064-graphics.json').graphics,800];let animations=0,checks=0;
 for(const graphic of graphics)for(const side of['front','back']){const d=JSON.parse(fs.readFileSync(path.join(site,'assets/animated',graphic+'-'+side+'.json')));for(const a of[...d.parent,...d.animations]){if(!a.frames.length||!a.frames.some(f=>f[1]===0))continue;let sum=a.frames.reduce((n,f)=>n+Math.max(0,f[1]),0),ticks=new Set([0,1,Math.max(0,sum-1),sum,sum+1,sum*2,10000]);let age=0;for(const f of a.frames){ticks.add(age);if(age)ticks.add(age-1);age+=Math.max(0,f[1]);}for(const tick of ticks){assert.equal(actual.frame(a,tick),expected(a,tick),graphic+' '+side+' tick '+tick);checks++;}animations++;}}
 assert.ok(animations>100);assert.ok(checks>1000);
});
