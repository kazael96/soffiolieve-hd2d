const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const oldSite=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');
const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=oldSite;
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
