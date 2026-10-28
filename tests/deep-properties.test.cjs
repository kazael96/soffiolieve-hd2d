const {test}=require('node:test'),assert=require('node:assert/strict');
const Input=require('../src/input.js'),Story=require('../src/story-state.js'),{nextButton}=require('../src/native-ui.js'),{route}=require('../src/field-actor-exits.js');
function random(seed){return()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);}

test('20,000 mixed keyboard/multitouch operations never leave a key stuck after release or reset',()=>{
 const keys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift'];
 for(const seed of [1,34,735,4294967295]){const rnd=random(seed),input=Input.create(),keyboard=new Set(),pointers=new Map();
  for(let i=0;i<5000;i++){const action=Math.floor(rnd()*5),key=keys[Math.floor(rnd()*keys.length)],id=Math.floor(rnd()*5);
   if(action===0){input.keyDown({code:key,key});keyboard.add(key);}else if(action===1){input.keyUp({code:key,key});keyboard.delete(key);}else if(action===2){input.pointerDown(id,key);pointers.set(id,key);}else if(action===3){input.pointerUp(id);pointers.delete(id);}else{input.reset();keyboard.clear();pointers.clear();}
   assert.deepEqual(Object.keys(input.state()).sort(),[...new Set([...keyboard,...pointers.values()])].sort(),`seed=${seed} step=${i}`);
  }input.reset();assert.deepEqual(input.state(),{});
 }
});

test('12,000 menu direction changes stay on visible, enabled entries without losing translated geometry',()=>{
 const rnd=random(20034),dirs=[[0,-1],[0,1],[-1,0],[1,0]];
 for(let trial=0;trial<120;trial++){const buttons=Array.from({length:12},(_,i)=>({x:i%3*80,y:Math.floor(i/3)*40,w:72,h:32,disabled:i>0&&rnd()<.35}));let at=0;
  for(let step=0;step<100;step++){const d=dirs[Math.floor(rnd()*4)],next=nextButton(buttons,at,...d);assert.ok(next>=0&&next<buttons.length);assert.equal(buttons[next].disabled,false);assert.equal(nextButton(buttons.map(b=>({...b,x:b.x+317,y:b.y-71})),at,...d),next);at=next;}
 }
});

test('600 legal save round trips preserve party order, move PP and story progress without mutating the input',()=>{
 const rnd=random(26034),names=['Snivy','Tepig','Oshawott','Patrat','Lillipup'];
 for(let i=0;i<600;i++){const s=Story.fresh();s.starter=names[i%3];s.phase=Story.phases[1+i%(Story.phases.length-1)];s.scene=Story.scenes[i%Story.scenes.length];s.party=Array.from({length:1+i%6},(_,j)=>({name:j?names[Math.floor(rnd()*5)]:s.starter,nickname:'Test'+j,level:2+Math.floor(rnd()*99),xp:Math.floor(rnd()*100000),hp:Math.floor(rnd()*100),status:['','par','brn','psn','tox','slp','frz'][i%7],pp:[{id:33,left:i%36}]}));s.original={zone:317,initialized:true,intro:true,vars:{16508:1},flags:[501,679]};const before=JSON.stringify(s),values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  assert.equal(Story.write(storage,s),true);const loaded=Story.read(storage);assert.equal(loaded.phase,s.phase);assert.equal(loaded.starter,s.starter);assert.deepEqual(loaded.party.map(p=>[p.name,p.pp]),s.party.map(p=>[p.name,p.pp]));assert.equal(JSON.stringify(s),before);assert.deepEqual(Story.normalize(loaded),loaded);
 }
});

test('80 obstacle maps agree with an independent shortest-path oracle and never cross walls',()=>{
 const rnd=random(8034),size=14;
 for(let trial=0;trial<80;trial++){const walls=new Set();for(let z=0;z<size;z++)for(let x=0;x<size;x++)if(rnd()<.25)walls.add(x+','+z);walls.delete('0,0');walls.delete('13,13');const blocked=(x,y)=>x<.5||y<.5||x>=size||y>=size||walls.has(Math.floor(x)+','+Math.floor(y));
  const q=[[0,0,0]],seen=new Set(['0,0']);let shortest=null;for(let i=0;i<q.length;i++){const [x,y,d]=q[i];if(x===13&&y===13){shortest=d;break;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,key=a+','+b;if(!seen.has(key)&&!blocked(a+.5,b+.5)){seen.add(key);q.push([a,b,d+1]);}}}
  const points=route({x:.5,y:.5},{x:13.5,y:13.5},blocked);let old={x:.5,y:.5};for(const p of points){assert.equal(blocked(p.x,p.y),false);assert.equal(Math.abs(p.x-old.x)+Math.abs(p.y-old.y),1);old=p;}if(shortest!==null){assert.equal(points.length,shortest);assert.deepEqual(points.at(-1),{x:13.5,y:13.5});}
 }
});
