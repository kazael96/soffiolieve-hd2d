const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const oldSite=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');
const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=oldSite;

test('Interpoke follows the chosen female identity, including the label and all nine expression frames',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),root=path.resolve(__dirname,'../src'),c=environment({sourceRoot:root});
 c.Journey.state.playerName='Élisa';c.Journey.state.playerGender='F';const frames=Array.from({length:9},(_,i)=>'female-phone-'+i+'.png');c.PLAYER_ASSETS={portraits:{Anita:frames}};
 vm.runInContext(fs.readFileSync(path.join(root,'player-identity.js'),'utf8'),c);let panel;const loaded=[];c.RuntimeAssets={image:async src=>{loaded.push(src);return {};}};
 c.document.body.append=node=>{if(node.id==='phoneScene')panel=node;};
 await drain(c,c.NativeStory.vm.host.command({name:'CallXTransceiver'},[1],[1],c.NativeStory.vm));
 const hero=panel.children.find(tile=>tile.children[0].alt==='Élisa');assert.ok(hero);assert.equal(hero.children[1].textContent,'Élisa');assert.ok(frames.includes(hero.children[0].src));
 for(const src of frames)assert.ok(loaded.includes(src),src);assert.equal(loaded.some(src=>String(src).includes('/Alcide-')),false);
});

test('native gender checks and gendered messages use the saved character while battle identity stays stable',async()=>{
 const c=environment({sourceRoot:path.resolve(__dirname,'../src')});
 for(const [gender,sex,index]of [['M',0,4],['F',1,5]]){
  c.Journey.state.playerGender=gender;let result;
  await c.NativeStory.vm.host.command({name:'TrainerCardGetSex'},[32768],[32768],{set:(address,value)=>{assert.equal(address,32768);result=value;}});assert.equal(result,sex);
  await drain(c,c.NativeStory.vm.host.command({name:'MsgActorGendered'},[428,4,5,3,5,0],[428,4,5,3,5,0],{words:{0:'Élisa'}}));
  assert.equal(c.$('dialogue').dataset.source,'428:'+index);
 }
 let options;c.FinaleElite={begin:async(room,settings)=>{options=settings;return true;}};
 await c.NativeStory.vm.host.command({name:'NativeOpcode418'},[0],[0],c.NativeStory.vm);assert.equal(options.female,true);
});
test('Interpoke refits on modal placement changes without a resize and disconnects its observer',async()=>{
 const c=environment({sourceRoot:process.env.QA_PHONE_SOURCE_ROOT||path.resolve(__dirname,'../src')}),seen=[];let panel;
 c.MutationObserver=class{constructor(callback){this.callback=callback;seen.push(this);}observe(target,options){this.target=target;this.options=options;}disconnect(){this.disconnected=true;}};
 c.document.body.append=node=>{if(node.id==='phoneScene')panel=node;};
 const task=c.NativeStory.vm.host.command({name:'CallXTransceiver'},[1],[1],c.NativeStory.vm);
 for(let i=0;i<200&&!c.$('dialogue').open;i++)await Promise.resolve();
 assert.ok(c.$('dialogue').open);assert.ok(panel);const observer=seen.find(o=>o.target===c.$('dialogue'));assert.ok(observer,'Modal position/class changes need their own observer; ResizeObserver does not report a bottom offset');
 assert.deepEqual(Array.from(observer.options.attributeFilter),['class','style','open']);const before=panel.style.gridTemplateRows;
 c.$('dialogue').getBoundingClientRect=()=>({top:100});observer.callback([{type:'attributes',attributeName:'class',target:c.$('dialogue')}]);
 assert.notEqual(panel.style.gridTemplateRows,before);assert.equal(panel.style.gridTemplateRows,'repeat(2,minmax(0,40px))');
 await drain(c,task);assert.equal(observer.disconnected,true,'A completed call cannot retain its position observer');
});

test('Interpoke reserves the visible speed and restart bar, then refits all call rows after rotation',async()=>{
 for(const [width,height,dialogueTop,barBottom]of [[1280,720,560,62],[390,844,615,54],[844,390,200,70]]){
  const c=environment({sourceRoot:process.env.QA_PHONE_SOURCE_ROOT||path.resolve(__dirname,'../src')}),observers=[];let panel;
  const controls=c.$('demoControls');controls.hidden=false;controls.getBoundingClientRect=()=>({left:width-180,right:width-10,top:10,bottom:barBottom,width:170,height:barBottom-10});
  c.$('dialogue').getBoundingClientRect=()=>({top:dialogueTop});
  c.getComputedStyle=node=>node===controls?{display:controls.hidden?'none':'flex',visibility:'visible'}:{paddingTop:panel?.style.paddingTop||'8',rowGap:'4'};
  c.ResizeObserver=class{constructor(callback){this.callback=callback;this.targets=[];observers.push(this);}observe(target){this.targets.push(target);}disconnect(){this.disconnected=true;}};
  c.document.body.append=node=>{if(node.id==='phoneScene')panel=node;};
  const task=c.NativeStory.vm.host.command({name:'CallXTransceiver'},[1],[1],c.NativeStory.vm);
  for(let i=0;i<200&&!c.$('dialogue').open;i++)await Promise.resolve();
  assert.ok(panel);const top=parseFloat(panel.style.paddingTop),row=Number(/minmax\(0,([\d.]+)px/.exec(panel.style.gridTemplateRows)?.[1]);
  assert.ok(top>=barBottom+8,`${width}x${height}: participant names must start below the complete toolbar`);
  assert.ok(top+2*row+4<=dialogueTop-8,`${width}x${height}: both participant rows must fit above the message`);
  const observer=observers.find(o=>o.targets.includes(controls));assert.ok(observer,'Toolbar size changes require an observed layout update');
  controls.getBoundingClientRect=()=>({top:10,bottom:92,width:190,height:82});observer.callback();assert.ok(parseFloat(panel.style.paddingTop)>=100,'Rotation can grow the toolbar without changing the message size');
  controls.hidden=true;observer.callback();assert.equal(panel.style.paddingTop,'','A hidden toolbar cannot leave stale reserved space');
  await drain(c,task);assert.ok(observers.every(o=>o.disconnected),'Every call layout observer must disconnect');
 }
});

test('Route7 call6 uses the native mother portrait, bank197 text and clean modal teardown',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),root=path.resolve(__dirname,'../src'),c=environment({sourceRoot:root});
 vm.runInContext(fs.readFileSync(path.join(root,'icirrus-phone.js'),'utf8'),c);
 const catalog=c.ICIRRUS_PHONE;assert.deepEqual(Array.from(catalog.participants),[4,0,255,255]);assert.equal(catalog.textBank,197);
 let panel,removed=false;c.document.body.append=node=>{if(node.id==='phoneScene'){panel=node;node.remove=()=>{removed=true;};}};
 const words={0:'Alcide'},task=c.NativeStory.vm.host.command({name:'CallXTransceiver'},[6],[6],{words});
 const messages=await drain(c,task);
 assert.ok(panel);assert.equal(panel.children.length,2);
 assert.equal(panel.children[0].children[0].alt,'Mamma');assert.equal(panel.children[1].children[0].alt,'Alcide');
 assert.ok(messages.some(text=>text.includes('Percorso 7')),'The second call text cannot replace the Route7 conversation');
 assert.equal(removed,true);assert.equal(c.$('world').dataset.phone,undefined);assert.equal(c.$('dialogue').open,false);
});

test('Castle call5 keeps Aralia and the player in two tiles and uses the original Museum invitation',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),root=path.resolve(__dirname,'../src'),c=environment({sourceRoot:root});vm.runInContext(fs.readFileSync(path.join(root,'opelucid-phone.js'),'utf8'),c);
 let panel,removed=false;c.document.body.append=node=>{if(node.id==='phoneScene'){panel=node;node.remove=()=>removed=true;}};
 const pages=await drain(c,c.NativeStory.vm.host.command({name:'CallXTransceiver'},[5],[5],{words:{0:'Alcide'}}));assert.equal(c.OPELUCID_PHONE.textBank,196);assert.equal(panel.children.length,2);assert.equal(panel.children[0].children[0].alt,'Aralia');assert.equal(panel.children[1].children[0].alt,'Alcide');assert.ok(pages.some(t=>t.includes('Museo')&&t.includes('Zefiropoli')));assert.equal(removed,true);assert.equal(c.$('world').dataset.phone,undefined);
});
