/* Native, height-aware footpaths for the chapter052 Route10 reunions.
 * This exports metadata only. It never changes story flags or supplies an
 * occlusion proof; the ordinary field controller must perform every handoff.
 */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hashes={};
const traceVictory=require('./trace-victory-rail.cjs').trace,railTrips=new Map();
function railTrip(entry,exit){const key=entry+':'+exit;if(!railTrips.has(key))railTrips.set(key,traceVictory(entry,exit));return railTrips.get(key);}
function read(name){const file=path.join(root,'src',name+'.js'),text=fs.readFileSync(file,'utf8');hashes[name]=crypto.createHash('sha256').update(text).digest('hex');const start=text.indexOf('{');let depth=0,quoted=false,escape=false;for(let i=start;i<text.length;i++){const ch=text[i];if(quoted){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')quoted=false;}else if(ch==='"')quoted=true;else if(ch==='{'||ch==='[')depth++;else if(ch==='}'||ch===']'){if(--depth===0)return JSON.parse(text.slice(start,i+1));}}throw Error('Missing JSON catalogue '+name);}
const events={},baseScenes={};
for(const [prefix,geometry]of [['pinwheel','assets'],['castelia','scenes'],['nimbasa','scenes'],['driftveil','scenes'],['mistralton','scenes'],['icirrus','scenes'],['opelucid','scenes']]){Object.assign(events,read(prefix+'-events').zones);const data=read(prefix+'-'+geometry);Object.assign(baseScenes,data.scenes||data);}
Object.assign(events,read('league-events').zones);for(const family of ['route10','badgeGates','victoryOutside','victoryCaves','leagueEntry'])Object.assign(baseScenes,read('league-'+family+'-assets').scenes);
const oldTrips=read('opelucid-return-data'),leagueSurfaces=read('league-surface-data');
const originalEvents=read('opelucid-events'),bottom=originalEvents.scripts[330],outside=originalEvents.scripts[316],komor=events[158].actors.find(a=>a.id===3);
if(JSON.stringify(bottom.code[548].args)!==JSON.stringify([158,61,0,32,1])||JSON.stringify(bottom.code[544].args)!=='[5]'||outside.code[679].name!=='WorkSetConst'||JSON.stringify(outside.code[679].args)!=='[16530,6]'||JSON.stringify(outside.movements[708])!=='[[32,1],[254,0]]'||komor.model!==7||komor.x!==62||komor.z!==33)throw Error('Native covered Komor return has changed; re-audit source role before exporting');

const c={atob:s=>Buffer.from(s,'base64').toString('binary')};c.window=c;vm.createContext(c);
for(const name of ['native-surfaces','native-rails','native-rail-paths','icirrus-paths']){const text=fs.readFileSync(path.join(root,'src',name+'.js'),'utf8');hashes[name]=crypto.createHash('sha256').update(text).digest('hex');vm.runInContext(text,c,{filename:name+'.js'});}
c.PINWHEEL_RAILS={...read('pinwheel-rails'),...read('castelia-rails'),...read('icirrus-rails'),...read('opelucid-rails'),...read('league-rails')};
const base=read('native-surface-data'),op=read('opelucid-surface-data'),bridge=read('opelucid-map-variants');
const globals=new Set([16,154,157,326,62,329,96,191,331,194,107,337,198,113,205,345,348,120]),origin=z=>globals.has(z)?[784,752]:[16,16];
globals.add(355);
const south=[[107,5],[195,0],[194,331,[-681.5,-400.5],[0,1]],[331,96,[-623.5,-348.5],[1,0]],[96,0],[253,1],[329,0],[91,0],[62,0],[90,1]];
const museum=[...south,[326,1],[51,0],[32,4],[30,1],[31,1],[28,9],[252,0],[249,0],[251,0],[250,0],[155,0],[154,16,[-175.5,-165.5],[1,0]]];
const castle=[...south,[326,157,[-384.5,-240.5],[0,-1]],[157,0],[159,1]];
// Native193 landing arguments:322:16,324:28,326:52,328:56/70.
// The upper floor partitions prevent an all-stair shortcut.
const sandDescent=[[158,1],[160,0],[161,{pit:0,to:[162,22,17]}],[162,{pit:1,to:[163,21,19]}],[163,{pit:0,to:[164,15,21]}]];
const descending=season=>{
 const climb=[[198,0],...(season===3?[[200,1],[199,14],[201,7]]:[[200,1],[199,1],[200,4],[199,4],[200,6],[201,0],[199,6],[201,2],[199,8],[201,4],[202,1],[199,10]]),[202,3]];
 return climb.map(([z,i])=>{const w=events[z].warps[i];return [w.zone,w.warp];}).reverse();
};
function reverse(season,key){const legs=oldTrips.seasons[season][key].legs,result=[];for(let i=legs.length-1;i>=0;i--){const l=legs[i];if(l.kind==='arrival'||l.zone===205)continue;if(l.kind==='door'){const w=events[l.zone].warps[l.nativePortal];result.push([w.zone,w.warp]);}else if(l.kind==='path')result.push([legs[i+1].zone,l.zone,[l.anchor.x+l.dx*2.8,l.anchor.y+l.dy*2.8],[-l.dx,-l.dy]]);else throw Error('Cannot reverse falling trajectory');}return result;}
// Native330:548 returns the whole scene to158; reserved316:5 leaves Komor3
// at62,33, WB height98327/65536.165's static role2 is NOT the new source.
const leagueRoad=[[132,1],[355,1],...Array.from({length:8},(_,i)=>{const z=356+i;return z===359?[[z,1]]:[[z,{waitGate:true,waitFor:z===358?[358,359]:[z]}],[z,1]];}).flat(),[364,1],[214,{rail:[14,15]}],[215,1],[216,1],[214,{rail:[16,6]}],[220,1],[219,2],[221,0],[214,{rail:[13,3]}],[223,1],[224,1],[225,2],[226,1],[214,{rail:[5,9]}],[227,1],[228,0],[214,{rail:[18,10]}]];
const recipes=season=>{const east=[[113,{border:345}],[345,0],[347,1],[254,1],[349,1],[348,1],[131,1],[120,8],[132,1]],actor=(zone,uid)=>{const a=events[zone].actors.find(a=>a.id===uid),o=origin(zone);return {zone,x:a.x+.5-o[0],y:a.z+.5-o[1],height:a.y/65536};};return [
{key:'belle-route10',name:'Belle',start:actor(16,12),route:[...reverse(season,'belle-museum'),...east],target:[355,8]},
{key:'komor-route10',name:'Komor',start:actor(158,3),route:[...reverse(season,'komor-castle-entrance'),...east],target:[355,0]},
// Interior132 waypoints preserve a body in transit; these are NOT native next-event roles.
{key:'komor-route10-exit',name:'Komor',start:actor(355,0),route:[[355,0]],target:[132,252],goal:{x:-10.5,y:-11.5,height:0}},
{key:'belle-route10-exit',name:'Belle',start:{zone:355,x:468.5-784,y:118.5-752,height:6},route:[[355,0]],target:[132,253],goal:{x:-9.5,y:-12.5,height:0}},
// Champion walks the same native mountain.136:251 is an explicit HD-2D
// waiting point before the later144 role, not an invented original event.
{key:'nardo-league-entry',name:'Nardo',start:actor(120,8),route:[[120,8],...leagueRoad],target:[136,251],goal:{x:15.5,y:31.5,height:.5}},
{key:'komor-league-entry',name:'Komor',start:{zone:132,x:-10.5,y:-11.5,height:0},route:leagueRoad,target:[136,250],goal:{x:17.5,y:31.5,height:.5}}

];};
const paths={},seasons={},proof=[];
for(const season of [0,1,2,3]){
 const field=read('field-season-'+season+'-assets'),east=read('opelucid-season-'+season+'-assets');
 const scenes={...baseScenes,199:{...baseScenes[199],...field.scenes[199]},206:{...baseScenes[206],...bridge.scene}};for(const [z,value]of Object.entries(east.scenes))scenes[z]={...scenes[z],...value};
 const route10=read('league-route10-season'+season+'-assets');scenes[355]={...scenes[355],...route10.scenes[355]};
 const canonical=c.NativeSurfaces.create({...base,grids:{...base.grids,...op.grids,...leagueSurfaces.grids,...east.surfaces.grids},scenes:{...base.scenes,...op.scenes,...leagueSurfaces.scenes,...east.surfaces.scenes,199:field.scenes[199].surfaces,206:op.scenes[bridge.surfaceZone]}});
 const grids={},members={},worldIndex=new Map();let serial=0;
 for(const [z,scene]of Object.entries(scenes))members[z]=(scene.permissionGrids||[]).map(g=>{const id=++serial;grids[id]=[Buffer.from(g.bytes).toString('base64')];const entry={member:id,x:g.x,z:g.z,y:0};if(globals.has(+z)){const key=g.x+':'+g.z;if(!worldIndex.has(key))worldIndex.set(key,[]);worldIndex.get(key).push(entry);}return entry;});
 const fallback=c.NativeSurfaces.create({...base,grids,scenes:members});
 function surface(z,x,y,h){let row=canonical.at(z,x,y,h)||fallback.at(z,x,y,h);if(!row&&globals.has(z)){const entries=worldIndex.get(Math.floor((x+16)/32)*32+':'+Math.floor((y+16)/32)*32);if(entries)row=fallback.at(z,x,y,h,entries);}return row?{...row,flags:row.flags|((row.flags&2)?1:0)}:null;}

 function boundary(a,b,pose){const candidates=[];for(const ga of scenes[a].permissionGrids)for(const gb of scenes[b].permissionGrids){const dx=Math.sign(gb.x-ga.x),dy=Math.sign(gb.z-ga.z);if(Math.abs(ga.x-gb.x)+Math.abs(ga.z-gb.z)!==32)continue;for(let i=1;i<31;i++){const x=dx?ga.x+(dx>0?15.5:-15.5):ga.x-15.5+i,y=dy?ga.z+(dy>0?15.5:-15.5):ga.z-15.5+i,from=surface(a,x,y,pose.height),to=surface(b,x+dx*2.8,y+dy*2.8,from?.height);if(!from||!to||from.flags&3||to.flags&3||Math.abs(from.height-to.height)>.5)continue;candidates.push({x,y,dx,dy,height:from.height,distance:Math.hypot(x-pose.x,y-pose.y)});}}candidates.sort((a,b)=>a.distance-b.distance);if(!candidates.length)throw Error('No shared boundary '+a+'/'+b);return candidates[0];}
 const chapter={ready:true,surfaceAt:surface};
 function npcSurface(z,x,y,h){const row=surface(z,x,y,h);if(!row||!(z===136||z===214||z>=215&&z<=228||z>=356&&z<=364))return row;const waiting=z===136?(activeKey==='komor-league-entry'?[15.5,31.5,.5]:activeKey==='nardo-league-entry'?[17.5,31.5,.5]:null):null;if(waiting&&Math.abs(x-waiting[0])<.55&&Math.abs(y-waiting[1])<.55&&Math.abs(row.height-waiting[2])<1.25)return {...row,flags:row.flags|1};const o=origin(z);for(const a of events[z].actors){if(a.flag===816)continue;const p=a.rail?c.NativeRails.actor(z,a):a;if(Math.abs(x-p.x-.5+o[0])<.55&&Math.abs(y-p.z-.5+o[1])<.55&&Math.abs(row.height-p.y/65536)<1.25)return {...row,flags:row.flags|1};}return row;}
 function gateWait(z,from){const attempts=[],entrance=portal(z,0),goal=portal(z,1).stage,direct=footpath(z,from,goal),road=paths[direct];
  for(let radius=1;radius<=6;radius++)for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==radius)continue;const x=from.x+dx,y=from.y+dy,s=npcSurface(z,x,y,from.height);if(!s||s.flags&3||(x-entrance.x)*entrance.dx+(y-entrance.y)*entrance.dy>-.8)continue;
   const p={x,y,height:s.height};if(road.some(q=>Math.abs(q[0]-x)<.65&&Math.abs(q[1]-y)<.65&&Math.abs(q[2]-s.height)<1.25))continue;
   try{footpath(z,from,p);const guarded={ready:true,surfaceAt:(zone,xx,yy,h)=>{const row=npcSurface(zone,xx,yy,h);return row&&Math.abs(row.height-p.height)<1.25&&Math.abs(xx-x)<.55&&Math.abs(yy-y)<.55?{...row,flags:row.flags|1}:row;}},bypass=c.IcirrusPaths.route(z,from,goal,{chapter:guarded,zones:[z],unbounded:true});
    if(!bypass?.length||Math.hypot(bypass.at(-1).x-goal.x,bypass.at(-1).y-goal.y)>.00001)continue;
    return {point:p,bypass:savePath(bypass),direct};
   }catch(error){attempts.push({p,error:String(error)});}
  }const error=Error('No nonblocking physical gate waiting point '+z);error.details={from,attempts};throw error;
 }
 function savePath(points){const tuples=points.map(p=>Array.isArray(p)?p.slice(0,3):[p.x,p.y,p.height??0,...(p.jumpLift===undefined?[]:[p.jumpLift])]),id=crypto.createHash('sha256').update(JSON.stringify(tuples)).digest('hex').slice(0,20);paths[id]=tuples;return id;}
 function portal(z,index){const w=events[z].warps[index],o=origin(z);if(w.rail){const p=c.NativeRails.warp(z,w),q=c.NativeRails.landing(z,w);return {w,x:p.x-o[0],y:p.z-o[1],height:p.height,dx:p.out.x,dy:p.out.z,stage:{x:q.x,y:q.z,height:q.rail.height}};}const [dx,dy]=({1:[0,1],2:[0,-1],3:[1,0],4:[-1,0]})[w.a],x=w.x/16+(w.width-1)/2-o[0],y=w.z/16+(w.height-1)/2-o[1],height=(w.y<<16>>16)/16;return {w,x,y,height,dx,dy,stage:{x:x-dx,y:y-dy,height}};}
 function footpath(z,from,to){const guarded={ready:true,surfaceAt:(zone,x,y,h)=>{const s=npcSurface(zone,x,y,h);if(!s||s.behavior!==124||![160,161,162,163,164].includes(zone))return s;const centre=events[zone].triggers.some(t=>t.type===0&&t.var===16384&&Math.floor(x+16)===t.x+Math.floor(t.width/2)&&Math.floor(y+16)===t.z+Math.floor(t.height/2));return centre&&Math.hypot(x-to.x,y-to.y)>.01?{...s,flags:s.flags|1}:s;}};const points=c.NativeRails.has(z)&&!scenes[z].permissionGrids.length?c.NativeRailPaths.route(z,from,to):c.IcirrusPaths.route(z,from,to,{chapter:guarded,zones:[z],unbounded:true});if(!points||!points.length||Math.hypot(points.at(-1).x-to.x,points.at(-1).y-to.y)>.00001)throw Error('Incomplete footpath '+z);const tuples=points.map(p=>[p.x,p.y,p.height??0,...(p.jumpLift===undefined?[]:[p.jumpLift])]),id=crypto.createHash('sha256').update(JSON.stringify(tuples)).digest('hex').slice(0,20);paths[id]=tuples;return id;}
 const trips={};let activeKey;
 for(const recipe of recipes(season)){
  activeKey=recipe.key;const support=surface(recipe.start.zone,recipe.start.x,recipe.start.y,recipe.start.height);if(!support||support.flags&3)throw Error('No physical source for '+activeKey);recipe.start.height=support.height;let pose={...recipe.start},fallEntry=false;const legs=[];
  for(const [z,index,point,dir]of recipe.route){let leg,next;
   if(index?.rail){const route=railTrip(...index.rail);let walk;
    for(const action of route.actions){if(action.kind==='walk'){walk=action.points;if(Math.hypot(walk[0][0]-pose.x,walk[0][1]-pose.y,walk[0][2]-pose.height)>.011)throw Error('Rail itinerary entry mismatch '+activeKey);}
     else if(action.kind==='slide'){const p=action.record.plan.from,end=action.record.settle?.to||action.record.plan.to;leg={zone:z,kind:'slide',anchor:{x:p.x,y:p.y},height:p.height,stagePoint:{...p},start:{...pose},nativeSlide:action.record,path:savePath(walk),dx:0,dy:0};legs.push(leg);pose={...end};}
     else{const p=portal(z,action.index),sentinel=p.w.zone===65535;if(sentinel&&(z!==214||action.index!==10||events[136].warps[0].zone!==214||events[136].warps[0].warp!==10))throw Error('Unreviewed native sentinel');const q=portal(sentinel?136:p.w.zone,sentinel?0:p.w.warp),last=walk.at(-1);leg={zone:z,kind:'door',anchor:{x:p.x,y:p.y},dx:p.dx,dy:p.dy,height:p.height,nativePortal:action.index,stagePoint:{x:last[0],y:last[1],height:last[2]},start:{...pose},path:savePath(walk),next:{x:q.x+q.dx*.8,y:q.y+q.dy*.8},nextEntry:{x:q.stage.x,y:q.stage.y},nextHeight:q.stage.height,...(sentinel?{nativeReciprocal:[136,0]}:{})};legs.push(leg);pose={...q.stage};}
    }continue;
   }
   if(index?.waitGate){const wait=gateWait(z,pose),p=wait.point;leg={zone:z,kind:'path',anchor:{x:p.x,y:p.y},dx:0,dy:0,height:p.height,stagePoint:p,gateWaiting:true,gateWaitingFor:index.waitFor||[z],gateBypass:wait.bypass,gateApproach:wait.direct};next={...p};}
   else if(index?.border){const p=boundary(z,index.border,pose);leg={zone:z,kind:'path',anchor:{x:p.x,y:p.y},dx:p.dx,dy:p.dy,height:p.height,stagePoint:{x:p.x,y:p.y,height:p.height}};next={x:p.x+p.dx*2.8,y:p.y+p.dy*2.8,height:p.height};}
   else if(typeof index==='object'){const pit=events[z].triggers[index.pit],x=pit.x+Math.floor(pit.width/2)-15.5,y=pit.z+Math.floor(pit.height/2)-15.5,s=surface(z,x,y,pose.height),[nz,nx,ny]=index.to,ground=surface(nz,nx-15.5,ny-15.5,0);if(s?.behavior!==124||!ground)throw Error('Invalid native sand handoff '+z);next={x:nx-15.5,y:ny-15.5,height:ground.height};leg={zone:z,kind:'fall',anchor:{x,y},height:s.height,stagePoint:{x,y,height:s.height},next:{x:next.x,y:next.y},nextHeight:next.height,...(index.awaitNativeDrop?{awaitNativeDrop:true}:{})};}
   else if(point){const row=surface(z,point[0],point[1],pose.height);if(!row||row.flags&3)throw Error('Blocked native border '+z);leg={zone:z,kind:'path',anchor:{x:point[0],y:point[1]},dx:dir[0],dy:dir[1],height:row.height,stagePoint:{x:point[0],y:point[1],height:row.height}};next={x:point[0]+dir[0]*2.8,y:point[1]+dir[1]*2.8,height:row.height};}
   else {const p=portal(z,index),q=portal(p.w.zone,p.w.warp);leg={zone:z,kind:'door',anchor:{x:p.x,y:p.y},dx:p.dx,dy:p.dy,height:p.height,nativePortal:index,stagePoint:p.stage,next:{x:q.x+q.dx*.8,y:q.y+q.dy*.8},nextEntry:{x:q.stage.x,y:q.stage.y},nextHeight:q.stage.height};next={...q.stage};}
   if(fallEntry)leg.fallEntry=true;leg.start={x:pose.x,y:pose.y,height:pose.height};try{leg.path=footpath(z,pose,leg.stagePoint);}catch(error){error.message+=' season'+season+' '+activeKey;throw error;}legs.push(leg);pose=next;fallEntry=leg.kind==='fall';
  }
  const [zone,uid]=recipe.target,a=events[zone].actors.find(a=>a.id===uid),o=origin(zone),goal=recipe.goal||{x:a.x+.5-o[0],y:a.z+.5-o[1],height:a.y/65536};if(!recipe.awaitNativeDrop)legs.push({zone,kind:'arrival',anchor:{x:goal.x,y:goal.y},height:goal.height,destinationZone:zone,targetUid:uid,start:pose,path:footpath(zone,pose,goal),...(fallEntry?{fallEntry:true}:{})});
  trips[recipe.key]={name:recipe.name,source:recipe.start,target:recipe.target,legs};proof.push({season,key:recipe.key,legs:legs.length,points:legs.reduce((sum,l)=>sum+paths[l.path].length,0)});
 }
 seasons[season]=trips;
}
const data={version:1,source:'IRBI native portals, Q12 WB/GC planes and rail curves; HD-2D itineraries, not original DS frame timing',inputSha256:hashes,paths,seasons};
const target=path.resolve(process.argv[2]||path.join(root,'src/league-journeys-data.js')),report=path.resolve(process.argv[3]||path.join(path.dirname(target),'league-journeys-proof.json'));
fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'window.LEAGUE_JOURNEY_DATA='+JSON.stringify(data)+';\n');fs.mkdirSync(path.dirname(report),{recursive:true});fs.writeFileSync(report,JSON.stringify({source:data.source,proof,uniquePaths:Object.keys(paths).length,bytes:fs.statSync(target).size,limits:['Footpaths only; actor continuity, portal visibility, input, save/resume and resource preparation still require runtime tests','Grid metadata for earlier single-floor maps is used only where complete native WB/GC data is unavailable']},null,2)+'\n');console.log(JSON.stringify({trips:proof.length,uniquePaths:Object.keys(paths).length,bytes:fs.statSync(target).size}));
