/* Native matrix coverage; renderer/pixel verification remains separate. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
async function setup(){const c=environment({icirrus:true,sourceRoot:process.env.GEOGRAPHY_SOURCE_ROOT||path.resolve(__dirname,'../src')});await c.IcirrusChapter.ensure();c.NativeStory.state.intro=true;c.NativeStory.state.initialized=true;return c;}
test('every Icirrus NPC has a rendered native matrix cell beneath its actual position',async()=>{
 const c=await setup(),scene=c.OPENING_ASSETS.scenes.zone113,cells=scene.instances.filter(i=>/^ic-map-\d+$/.test(i.model));
 for(const a of c.ICIRRUS_EVENTS.zones[113].actors){const x=a.x+.5-784,z=a.z+.5-752;assert.ok(cells.some(i=>x>=i.x-16&&x<i.x+16&&z>=i.z-16&&z<i.z+16),'Native actor '+a.id+' would float over an absent matrix cell');}
 for(const [member,x,z]of [[68,-576,-576],[69,-544,-576],[67,-608,-608]])assert.ok(cells.some(i=>i.model==='ic-map-'+member&&i.x===x&&i.z===z),'Native visible neighbor '+member);
});
test('native visual surroundings never become town collision or story permissions',async()=>{
 const c=await setup(),scene=c.OPENING_ASSETS.scenes.zone113;
 assert.equal(scene.permissionGrids.some(g=>g.x===-576&&g.z===-576),false,'Route8 is visual only');
 assert.equal(c.ORIGINAL_EVENTS.zones[345],undefined);assert.equal(c.ORIGINAL_EVENTS.zones[205],undefined);
 assert.equal(c.IcirrusChapter.blockedAt(113,-585.5,-576.5),true);
});
test('field collision cannot bypass the Mountain through a rendered adjacent town cell',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(198,144,208));const g=c.ICIRRUS_SCENES[113].permissionGrids[1];let target;
 for(let y=0;y<32&&!target;y++)for(let x=0;x<32&&!target;x++)if(!(g.bytes[8+(y*32+x)*8+2]&1))target={x:g.x+x-15.5,y:g.z+y-15.5};
 assert.ok(target);assert.equal(c.IcirrusChapter.fieldAt(target.x,target.y),113);assert.equal(c.blocked(target.x,target.y,{surf:true}),true);assert.equal(c.IcirrusChapter.blockedAt(198,target.x,target.y),true);
});
