const test=require('node:test'),assert=require('node:assert/strict');
const {setup,drain}=require('./helpers/league-field-host.cjs');

test('cave216 exit restores both the rail identity and the actual player elevation',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 await drain(c,c.NativeStory.changeZone(216,5,17,0));
 const w=c.LEAGUE_EVENTS.zones[216].warps[1];
 Object.assign(c.player,{x:w.x/16-16,y:w.z/16-16-.25});
 await drain(c,c.NativeStory.tryWarp(0,1,c.player.x,c.player.y+1));
 assert.equal(n.zone,214);assert.equal(n.railCurrent.height,5.625);
 assert.equal(n.fieldHeight,5.625,'player kept cave height after returning to the elevated ribbon');
});

test('native Victory Road sentinel enters League136 and returns through its reciprocal rail portal',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 await drain(c,c.NativeStory.changeZone(214,25,30,5.625));
 const exit=c.LEAGUE_EVENTS.zones[214].warps[10],rail=c.NativeRails.warp(214,exit);
 assert.equal(exit.zone,65535);assert.equal(exit.warp,65535);
 const [ox,oz]=[16,16],cx=rail.x-ox,cz=rail.z-oz;
 n.fieldHeight=rail.height;n.railCurrent={zone:214,line:rail.line,height:rail.height};
 Object.assign(c.player,{x:cx-rail.out.x*.25,y:cz-rail.out.z*.25});
 await drain(c,c.NativeStory.tryWarp(rail.out.x,rail.out.z,c.player.x+rail.out.x,c.player.y+rail.out.z));
 assert.equal(n.zone,136,'native final Victory Road portal did not resolve to the League entrance');
 assert.equal(c.elements.get('world')?.dataset.eventError,undefined);

 for(let i=0;i<40;i++)c.Journey.step(1/30,false);
 const entrance=c.LEAGUE_EVENTS.zones[136].warps[0];
 assert.equal(entrance.zone,214);assert.equal(entrance.warp,10);
 const x=entrance.x/16+(entrance.width-1)/2-16,z=entrance.z/16+(entrance.height-1)/2-16;
 Object.assign(c.player,{x,y:z-.25});
 await drain(c,c.NativeStory.tryWarp(0,1,c.player.x,c.player.y+1));
 assert.equal(n.zone,214,'League entrance failed to return through the same Victory Road portal');
 assert.equal(n.railCurrent?.zone,214);
 assert.equal(n.railCurrent?.line,rail.line);
 assert.equal(n.fieldHeight,n.railCurrent.height,'rail landing retained the previous room height');
 assert.equal(c.elements.get('world')?.dataset.eventError,undefined);
});

test('a Victory Road portal cannot activate from a different deck at the same screen coordinates',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 await drain(c,c.NativeStory.changeZone(214,25,30,5.625));
 const rail=c.NativeRails.warp(214,c.LEAGUE_EVENTS.zones[214].warps[10]);
 Object.assign(c.player,{x:rail.x-16-rail.out.x*.25,y:rail.z-16-rail.out.z*.25});
 n.fieldHeight=5.625;n.railCurrent={zone:214,line:13,height:5.625};
 const result=c.NativeStory.tryWarp(rail.out.x,rail.out.z,c.player.x+rail.out.x,c.player.y+rail.out.z);
 if(result)await drain(c,result);
 assert.equal(n.zone,214,'a lower deck triggered the high League exit');
 assert.equal(result,false);
});
