/* Native, height-aware footpaths for the four chapter051 return journeys.
 * This exports metadata only. It never changes story flags or supplies an
 * occlusion proof; the ordinary field controller must perform every handoff.
 */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hashes={};
function read(name){const file=path.join(root,'src',name+'.js'),text=fs.readFileSync(file,'utf8');hashes[name]=crypto.createHash('sha256').update(text).digest('hex');const start=text.indexOf('{');let depth=0,quoted=false,escape=false;for(let i=start;i<text.length;i++){const ch=text[i];if(quoted){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')quoted=false;}else if(ch==='"')quoted=true;else if(ch==='{'||ch==='[')depth++;else if(ch==='}'||ch===']'){if(--depth===0)return JSON.parse(text.slice(start,i+1));}}throw Error('Missing JSON catalogue '+name);}
const events={},baseScenes={};
for(const [prefix,geometry]of [['pinwheel','assets'],['castelia','scenes'],['nimbasa','scenes'],['driftveil','scenes'],['mistralton','scenes'],['icirrus','scenes'],['opelucid','scenes']]){Object.assign(events,read(prefix+'-events').zones);const data=read(prefix+'-'+geometry);Object.assign(baseScenes,data.scenes||data);}
const c={atob:s=>Buffer.from(s,'base64').toString('binary')};c.window=c;vm.createContext(c);
for(const name of ['native-surfaces','native-rails','native-rail-paths','icirrus-paths']){const text=fs.readFileSync(path.join(root,'src',name+'.js'),'utf8');hashes[name]=crypto.createHash('sha256').update(text).digest('hex');vm.runInContext(text,c,{filename:name+'.js'});}
c.PINWHEEL_RAILS={...read('pinwheel-rails'),...read('castelia-rails'),...read('icirrus-rails'),...read('opelucid-rails')};
const base=read('native-surface-data'),op=read('opelucid-surface-data'),bridge=read('opelucid-map-variants');
const globals=new Set([16,154,157,326,62,329,96,191,331,194,107,337,198,113,205,345,348,120]),origin=z=>globals.has(z)?[784,752]:[16,16];
const south=[[107,5],[195,0],[194,331,[-681.5,-400.5],[0,1]],[331,96,[-623.5,-348.5],[1,0]],[96,0],[253,1],[329,0],[91,0],[62,0],[90,1]];
const museum=[...south,[326,1],[51,0],[32,4],[30,1],[31,1],[28,9],[252,0],[249,0],[251,0],[250,0],[155,0],[154,16,[-175.5,-165.5],[1,0]]];
const castle=[...south,[326,157,[-384.5,-240.5],[0,-1]],[157,0],[159,1]];
const descending=season=>{
 const climb=[[198,0],...(season===3?[[200,1],[199,14],[201,7]]:[[200,1],[199,1],[200,4],[199,4],[200,6],[201,0],[199,6],[201,2],[199,8],[201,4],[202,1],[199,10]]),[202,3]];
 return climb.map(([z,i])=>{const w=events[z].warps[i];return [w.zone,w.warp];}).reverse();
};
const recipes=season=>{
 const tower=[[205,113,[-602.5,-591.5],[0,1]],...descending(season),[198,337,[-643.5,-528.5],[0,1]],[337,107,[-668.5,-463.5],[0,1]]];
 return [
  {key:'aralia-museum',name:'Aralia',start:{zone:107,x:-683.5,y:-441.5,height:0},route:museum,target:[16,9]},
  {key:'cedric-museum',name:'Gasparago',start:{zone:207,x:6.5,y:-3.5,height:0},route:[[207,0],[206,0],...tower,...museum],target:[16,10]},
  {key:'belle-museum',name:'Belle',start:{zone:205,x:-602.5,y:-596.5,height:3},route:[...tower,...museum],target:[16,12]},
  {key:'komor-castle-entrance',name:'Komor',start:{zone:205,x:-605.5,y:-596.5,height:3},route:[...tower,...castle],target:[158,2]},
 ];
};
const paths={},seasons={},proof=[];
for(const season of [0,1,2,3]){
 const field=read('field-season-'+season+'-assets'),east=read('opelucid-season-'+season+'-assets');
 const scenes={...baseScenes,199:{...baseScenes[199],...field.scenes[199]},206:{...baseScenes[206],...bridge.scene}};for(const [z,value]of Object.entries(east.scenes))scenes[z]={...scenes[z],...value};
 const canonical=c.NativeSurfaces.create({...base,grids:{...base.grids,...op.grids,...east.surfaces.grids},scenes:{...base.scenes,...op.scenes,...east.surfaces.scenes,199:field.scenes[199].surfaces,206:op.scenes[bridge.surfaceZone]}});
 const grids={},members={},worldIndex=new Map();let serial=0;
 for(const [z,scene]of Object.entries(scenes))members[z]=(scene.permissionGrids||[]).map(g=>{const id=++serial;grids[id]=[Buffer.from(g.bytes).toString('base64')];const entry={member:id,x:g.x,z:g.z,y:0};if(globals.has(+z)){const key=g.x+':'+g.z;if(!worldIndex.has(key))worldIndex.set(key,[]);worldIndex.get(key).push(entry);}return entry;});
 const fallback=c.NativeSurfaces.create({...base,grids,scenes:members});
 function surface(z,x,y,h){let row=canonical.at(z,x,y,h)||fallback.at(z,x,y,h);if(!row&&globals.has(z)){const entries=worldIndex.get(Math.floor((x+16)/32)*32+':'+Math.floor((y+16)/32)*32);if(entries)row=fallback.at(z,x,y,h,entries);}return row?{...row,flags:row.flags|((row.flags&2)?1:0)}:null;}
 const chapter={ready:true,surfaceAt:surface};
 function portal(z,index){const w=events[z].warps[index],o=origin(z);if(w.rail){const p=c.NativeRails.warp(z,w),q=c.NativeRails.landing(z,w);return {w,x:p.x-o[0],y:p.z-o[1],height:p.height,dx:p.out.x,dy:p.out.z,stage:{x:q.x,y:q.z,height:q.rail.height}};}const [dx,dy]=({1:[0,1],2:[0,-1],3:[1,0],4:[-1,0]})[w.a],x=w.x/16+(w.width-1)/2-o[0],y=w.z/16+(w.height-1)/2-o[1],height=(w.y<<16>>16)/16;return {w,x,y,height,dx,dy,stage:{x:x-dx,y:y-dy,height}};}
 function footpath(z,from,to){const points=c.NativeRails.has(z)&&!scenes[z].permissionGrids.length?c.NativeRailPaths.route(z,from,to):c.IcirrusPaths.route(z,from,to,{chapter,zones:[z],unbounded:true});if(!points||!points.length||Math.hypot(points.at(-1).x-to.x,points.at(-1).y-to.y)>.00001)throw Error('Incomplete footpath '+z);const tuples=points.map(p=>[p.x,p.y,p.height??0,...(p.jumpLift===undefined?[]:[p.jumpLift])]),id=crypto.createHash('sha256').update(JSON.stringify(tuples)).digest('hex').slice(0,20);paths[id]=tuples;return id;}
 const trips={};let activeKey;
 for(const recipe of recipes(season)){
  activeKey=recipe.key;let pose={...recipe.start};const legs=[];
  for(const [z,index,point,dir]of recipe.route){let leg,next;
   if(point){const row=surface(z,point[0],point[1],pose.height);if(!row||row.flags&3)throw Error('Blocked native border '+z);leg={zone:z,kind:'path',anchor:{x:point[0],y:point[1]},dx:dir[0],dy:dir[1],height:row.height,stagePoint:{x:point[0],y:point[1],height:row.height}};next={x:point[0]+dir[0]*2.8,y:point[1]+dir[1]*2.8,height:row.height};}
   else {const p=portal(z,index),q=portal(p.w.zone,p.w.warp);leg={zone:z,kind:'door',anchor:{x:p.x,y:p.y},dx:p.dx,dy:p.dy,height:p.height,nativePortal:index,stagePoint:p.stage,next:{x:q.x+q.dx*.8,y:q.y+q.dy*.8},nextEntry:{x:q.stage.x,y:q.stage.y},nextHeight:q.stage.height};next={...q.stage};}
   leg.start={x:pose.x,y:pose.y,height:pose.height};try{leg.path=footpath(z,pose,leg.stagePoint);}catch(error){error.message+=' season'+season+' '+activeKey;throw error;}legs.push(leg);pose=next;
  }
  const [zone,uid]=recipe.target,a=events[zone].actors.find(a=>a.id===uid),o=origin(zone),goal={x:a.x+.5-o[0],y:a.z+.5-o[1],height:a.y/65536};legs.push({zone,kind:'arrival',anchor:{x:goal.x,y:goal.y},height:goal.height,destinationZone:zone,targetUid:uid,start:pose,path:footpath(zone,pose,goal)});
  trips[recipe.key]={name:recipe.name,source:recipe.start,target:recipe.target,legs};proof.push({season,key:recipe.key,legs:legs.length,points:legs.reduce((sum,l)=>sum+paths[l.path].length,0)});
 }
 seasons[season]=trips;
}
const data={version:1,source:'IRBI native portals, Q12 WB/GC planes and rail curves; HD-2D itineraries, not original DS frame timing',inputSha256:hashes,paths,seasons};
const target=path.resolve(process.argv[2]||path.join(root,'src/opelucid-return-data.js')),report=path.resolve(process.argv[3]||path.join(path.dirname(target),'opelucid-return-proof.json'));
fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'window.OPELUCID_RETURN_DATA='+JSON.stringify(data)+';\n');fs.mkdirSync(path.dirname(report),{recursive:true});fs.writeFileSync(report,JSON.stringify({source:data.source,proof,uniquePaths:Object.keys(paths).length,bytes:fs.statSync(target).size,limits:['Footpaths only; actor continuity, portal visibility, input, save/resume and resource preparation still require runtime tests','Grid metadata for earlier single-floor maps is used only where complete native WB/GC data is unavailable']},null,2)+'\n');console.log(JSON.stringify({trips:proof.length,uniquePaths:Object.keys(paths).length,bytes:fs.statSync(target).size}));
