/* Native metadata only: safe physical continuation to the post-demo role. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),c={};c.window=c;vm.createContext(c);const hashes={};
for(const file of ['league-rails','league-events','native-rails','native-rail-paths','league-slide']){const text=fs.readFileSync(path.join(root,'src',file+'.js'),'utf8');hashes[file]=crypto.createHash('sha256').update(text).digest('hex');vm.runInContext(text,c);}
c.PINWHEEL_RAILS=c.LEAGUE_RAILS;const header=c.LEAGUE_EVENTS.zones[214],source=header.actors.find(a=>a.id===5),target=header.actors.find(a=>a.id===0),a=c.NativeRails.actor(214,source),b=c.NativeRails.actor(214,target),body={x:a.x+.5-16,y:a.z+.5-16,height:a.y/65536,direction:1};
const slide=c.LeagueSlide.plan(214,body);if(!slide||slide.landing.line!==13||slide.landing.front!==7||slide.landing.side!==0)throw Error('Reviewed native demonstration projection changed');
const goal={x:b.x+.5-16,y:b.z+.5-16,height:b.y/65536},points=c.NativeRailPaths.route(214,slide.to,goal);if(!points?.length||Math.hypot(points.at(-1).x-goal.x,points.at(-1).y-goal.y)>1e-6)throw Error('Incomplete native lower-role continuation');
for(const p of points)if(!c.NativeRails.locate(214,p.x,p.y,{height:p.height}))throw Error('Continuation leaves its actual native support');
const data={source:'IRBI214/428: role5 after slide to post-event role0; continuous HD-2D walking adaptation after camera return',version:1,zone:214,bank:428,actor:5,targetUid:0,sourceFlag:758,targetFlag:759,from:slide.to,goal,targetRecord:target,points:points.map(p=>[p.x,p.y,p.height]),hashes};
fs.writeFileSync(path.join(root,'src/league-slide-data.js'),'window.LEAGUE_SLIDE_PATH='+JSON.stringify(data)+';\n');console.log('Exported native lower-role continuation:',points.length,'supported points');
