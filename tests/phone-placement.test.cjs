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
