const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('native marker bounce follows camera up at30Hz, then holds and expires without a shadow',()=>{
 const c={OPENING_SPRITES:{}};c.window=c;vm.createContext(c);for(const file of ['native-object-emotes-data','native-object-emotes'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file+'.js'),'utf8'),c);
 for(const code of [186,187,188,189,190]){
  for(const [frame,height]of [[0,22],[1,28],[2,32],[3,34],[4,34],[5,32],[6,28],[7,22],[36,22]]){
   const pitch=[.6,.8],yaw=.7,body={x:3,y:4,height:2},v=c.NativeObjectEmotes.visual(body,code,frame/30,{pitch,yaw});assert.equal(v.worldWidth,1);assert.equal(v.worldHeight,1);assert.equal(v.noShadow,true);assert.equal(v.nativeBillboard,true);
   assert.ok(Math.abs(v.height-body.height-height/16*.8)<1e-10);assert.ok(Math.abs(v.x-body.x+height/16*.6*Math.sin(yaw))<1e-10);assert.ok(Math.abs(v.z-body.y+height/16*.6*Math.cos(yaw))<1e-10);
  }
  assert.equal(c.NativeObjectEmotes.visual({x:0,y:0},code,37/30),null);assert.equal(c.NativeObjectEmotes.visual({hidden:true},code,0),null);
 }
 assert.equal(c.NativeObjectEmotes.resources([[187,1],[186,1],[188,1],[254,0]]).length,2);assert.deepEqual(Array.from(c.NativeObjectEmotes.sounds([[187,1],[188,1],[189,1],[190,1]])),[1656,1840,1841]);
});
test('Champion hall original288 completes the Castle movie and leaves Nardo and Komor resident, with no repeat reward',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16546]=0;n.firstEndingWins=[228,229,230,231];n.flags=n.flags.filter(f=>![595,596].includes(f));await drain(c,c.NativeStory.changeZone(144,16,13));
 const before=c.Journey.state.money,messages=await drain(c,c.NativeStory.run(0));
 assert.equal(n.vars[16546],1);assert.equal(n.vars[16434],548);assert.equal(c.OpelucidChapter.scene(144).sourceMatrix,218);assert.deepEqual(Array.from(c.cinematics),[6]);assert.ok(messages.some(s=>s.includes('castello')));
 assert.equal(c.npcs.some(a=>a.uid===0),false);assert.ok(n.flags.includes(595));assert.ok(n.flags.includes(2428));assert.equal(c.Journey.state.money,before);
 for(const [id,name]of [[1,'Nardo'],[3,'Komor']]){const a=c.npcs.find(a=>a.uid===id);assert.equal(a.name,name);assert.equal(a.y,-7.5);assert.equal(a.hidden,undefined);}
 assert.equal(c.NativeStory.visualEffects().length,0);assert.equal(c.NativeStory.locked,false);assert.ok(c.soundRequests.some(s=>s.id===1656));
 const count=c.cinematics.length;await drain(c,c.NativeStory.changeZone(146,7,12));await drain(c,c.NativeStory.changeZone(144,16,13));assert.equal(c.cinematics.length,count);assert.equal(n.vars[16546],1);assert.equal(c.OpelucidChapter.scene(144).sourceMatrix,218);
});
