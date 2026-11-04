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
