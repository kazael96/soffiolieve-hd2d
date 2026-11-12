const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){const c={Date,MENU_ASSETS:{pokemonIcons:{}},PARTY_DETAIL_ASSETS:{itemMap:{}}};c.window=c;vm.createContext(c);for(const file of ['mistralton-ball','capture-rules','native-capture','battle-bag','league-menu'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);return c;}
test('League Luxury Ball uses native151/152 cells, enters the bag and renders its own atlas with ordinary catch odds',async()=>{
 const c=fixture(),b=c.MISTRALTON_BALL.balls[11];assert.match(b.source,/129,130,151,152/);assert.equal(b.cells.length,17);assert.equal(b.sequences.length,5);for(const f of b.cells){const png=fs.readFileSync('src/'+f);assert.equal(png.readUInt32BE(16),128);assert.equal(png.readUInt32BE(20),128);}
 assert.equal(c.CaptureRules.ballBonus(11,{level:50},{caught:true,elapsedTurns:5}),1);assert.equal(c.BattleBag.inventory('balls',id=>id===11?2:0)[0].id,11);
 assert.ok(c.LEAGUE_MENU.items[11]);assert.ok(fs.existsSync('src/'+c.LEAGUE_MENU.items[11].src));
 c.CAPTURE_DATA=c.MISTRALTON_BALL;c.RuntimeAssets={image:async src=>({src,complete:true,naturalWidth:128,width:128,height:128})};await c.NativeCapture.preload(11);c.NativeCapture.compile(c.CAPTURE_DATA,new Proxy({},{get:()=>({emitters:[]})}),{ball:11});
 const drawn=[],ctx={save(){},restore(){},translate(){},scale(){},drawImage(im){drawn.push(im.src);}};c.NativeCapture.draw(ctx,[{op:69,start:0,args:[0,1,0,0,4096,4096]}],0,1000,650,()=>({x:100,y:100}));assert.deepEqual(drawn,[b.cells[0]]);
});
test('capture Ball identity survives construction, party packing and real save normalization',async()=>{
 const {setup}=require('./helpers/league-field-host.cjs'),c=await setup(),j=c.Journey;j.state.starter='Snivy';const mon=c.makeMon('Snivy',10,{ballId:11});j.state.party=[j.pack(mon,1000)];assert.equal(j.unpack(j.state.party[0]).ballId,11);assert.equal(j.save(true),true);assert.equal(c.StoryState.read(c.localStorage).party[0].ballId,11);
 j.addItem(11,1);assert.equal(j.giveItem(11,0),true);assert.equal(c.StoryState.read(c.localStorage).party[0].heldItem,11,'held Luxury Ball disappeared from the save');assert.equal(j.takeItem(0),11);assert.equal(j.discardItem(11,1),true);assert.equal(j.state.party[0].ballId,11);
});

test('Master Ball renders its own native131/132 atlas and keeps the original shared capture sequence',async()=>{
 const c=fixture(),b=c.MISTRALTON_BALL.balls[1];assert.match(b.source,/129,130,131,132/);assert.equal(b.cells.length,17);assert.equal(b.sequences.length,5);assert.notDeepEqual(b.cells,c.MISTRALTON_BALL.balls[11].cells);
 for(const file of b.cells){const png=fs.readFileSync('src/'+file);assert.equal(png.readUInt32BE(16),128);assert.equal(png.readUInt32BE(20),128);}
 c.CAPTURE_DATA=c.MISTRALTON_BALL;c.RuntimeAssets={image:async src=>({src,complete:true,naturalWidth:128,width:128,height:128})};await c.NativeCapture.preload(1);c.NativeCapture.compile(c.CAPTURE_DATA,new Proxy({},{get:()=>({emitters:[]})}),{ball:1,shakes:3,caught:true,critical:false});
 const drawn=[],ctx={save(){},restore(){},translate(){},scale(){},drawImage(im){drawn.push(im.src);}};c.NativeCapture.draw(ctx,[{op:69,start:0,args:[0,1,0,0,4096,4096]}],0,1000,650,()=>({x:100,y:100}));assert.deepEqual(drawn,[b.cells[0]]);
});
