/* Exercise every initially visible city resident through their actual decoded entry. */
const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{const rows=[];
 for(const zone of [326,327,328,90,62,65]){
  const c=environment({nimbasa:true,sourceRoot:process.env.QA_SOURCE_ROOT}),n=c.NativeStory,j=c.Journey;await c.NimbasaChapter.ensure();n.state.intro=true;n.state.initialized=true;j.state.phase='castelia';j.state.starter='Snivy';j.state.party=['Pignite','Servine','Dewott'].map(name=>j.pack(c.makeMon(name,25),c.OPENING_DATA[name].growth[25]));
  await n.changeZone(zone,15,15);const actors=n.visualActors().filter(a=>a.script>0&&a.script<2000&&!a.gimmick&&!(zone===62&&a.script===19));
  for(const actor of actors){n.syncActors();if(!n.visualActors().some(a=>a.uid===actor.uid))continue;try{await drain(c,n.run(actor.script-1),0,'p1');rows.push({zone,id:actor.uid,script:actor.script,result:'PASS'});}catch(error){rows.push({zone,id:actor.uid,script:actor.script,result:'FAIL',error:String(error)});break;}}
 }
 console.log(JSON.stringify(rows,null,2));assert.ok(rows.length>10);assert.ok(rows.every(r=>r.result==='PASS'),'Resident script failure');
})().catch(e=>{console.error(e);process.exitCode=1;});
