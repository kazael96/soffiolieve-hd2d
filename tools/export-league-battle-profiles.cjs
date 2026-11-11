/* Offline native contact/material selection. No geometry search at startup. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),c={atob:s=>Buffer.from(s,'base64').toString('binary')},hashes={},parts=new Map();c.window=c;vm.createContext(c);
function load(name){const file=path.join(root,'src',name+'.js'),text=fs.readFileSync(file,'utf8');hashes[name]=crypto.createHash('sha256').update(text).digest('hex');vm.runInContext(text,c,{filename:name});}
for(const name of ['league-scenes','league-events','league-parts','league-rails','native-rails','native-surface-data','league-surface-data','native-surfaces'])load(name);
c.PINWHEEL_RAILS=c.LEAGUE_RAILS;
const surfaces=c.NativeSurfaces.create({...c.NATIVE_SURFACE_DATA,grids:{...c.NATIVE_SURFACE_DATA.grids,...c.LEAGUE_SURFACE_DATA.grids},scenes:c.LEAGUE_SURFACE_DATA.scenes});
function assets(family,season){const row=c.LEAGUE_PARTS.families[family],name=(season===undefined?row:row.seasons[season]).src.slice(0,-3);if(!parts.has(name)){load(name);parts.set(name,c.LEAGUE_PART_ASSETS);}return parts.get(name);}
function triangleHeight(x,z,a,b,d){const den=(b[2]-d[2])*(a[0]-d[0])+(d[0]-b[0])*(a[2]-d[2]);if(Math.abs(den)<1e-8)return null;const u=((b[2]-d[2])*(x-d[0])+(d[0]-b[0])*(z-d[2]))/den,v=((d[2]-a[2])*(x-d[0])+(a[0]-d[0])*(z-d[2]))/den,w=1-u-v;return Math.min(u,v,w)<-1e-6?null:a[1]*u+b[1]*v+d[1]*w;}
function triangles(data,zone,pattern){const out=[];for(const ins of data.scenes[zone].instances.filter(i=>/^lg-(?:season\d+-)?map-/.test(i.model))){const cs=Math.cos(ins.rotation||0),sn=Math.sin(ins.rotation||0);for(const group of data.models[ins.model].groups){if(!pattern.test(group.texture||''))continue;const v=group.verts;for(let at=0;at<v.length;at+=33){const tri=[0,11,22].map(o=>[v[at+o]*cs+v[at+o+2]*sn+ins.x,v[at+o+1]+ins.y,-v[at+o]*sn+v[at+o+2]*cs+ins.z]);if(Math.max(...tri.map(p=>p[1]))-Math.min(...tri.map(p=>p[1]))>.02)continue;out.push({texture:group.texture,tri});}}}return out;}
function material(list,p,maxError){const hits=[];for(const t of list){const height=triangleHeight(p.x,p.z,...t.tri);if(height!==null&&Math.abs(height-p.height)<=maxError)hits.push({texture:t.texture,height,error:Math.abs(height-p.height)});}hits.sort((a,b)=>a.error-b.error);return hits[0]||null;}
const kind=b=>[4,5].includes(b)?'grass':[6,7,9,34].includes(b)?'darkGrass':'path';
function goal(zone){const row=c.LEAGUE_EVENTS.zones[zone].actors.find(a=>a.type===1)||c.LEAGUE_EVENTS.zones[zone].actors[0];if(!row)return {x:0,z:0,height:0};const a=row.rail?c.NativeRails.actor(zone,row):row,o=zone===355?[784,752]:[16,16];return {x:a.x+.5-o[0],z:a.z+.5-o[1],height:a.y/65536};}
function candidates(zone,terrain){const target=goal(zone),out=[];if(zone===214){const row=c.NativeRails.surfaceAt(zone,target.x,target.z,{height:target.height});if(!row||row.flags&1)throw Error('Native canyon anchor is not supported');return [{...target,physical:row}];}
 for(const grid of c.LEAGUE_SCENES[zone].permissionGrids)for(let z=0;z<32;z++)for(let x=0;x<32;x++){const p={x:grid.x+x-15.5,z:grid.z+z-15.5},row=surfaces.at(zone,p.x,p.z,target.height);if(!row||row.behavior===255||row.flags&1||!!(row.flags&2)!==(terrain==='water')||zone===355&&kind(row.behavior)!==terrain)continue;out.push({...p,height:row.height,physical:row});}
 out.sort((a,b)=>Math.hypot(a.x-target.x,a.z-target.z)+Math.abs(a.height-target.height)*5-Math.hypot(b.x-target.x,b.z-target.z)-Math.abs(b.height-target.height)*5);return out;
}
function bank(data,floor){const prefix=floor.match(/^(.*map-\d+-)/)?.[1];return ['gake01a','gake1_1','gake01a2'].map(s=>prefix+s).find(k=>data.textures[k]);}
function wall(data,floor){const prefix=floor.match(/^(.*map-\d+-)/)?.[1],key=['d0gake_001','d0gake_002','d0gake_001b','d0gake_002b'].map(s=>prefix+s).find(k=>data.textures[k]);if(!key)throw Error('Native cave wall not found for '+floor);return key;}
const plans=[['route10Path',355,'path'],['route10Grass',355,'grass'],['route10Dark',355,'darkGrass'],['victoryOutside',214,'path'],...Array.from({length:14},(_,i)=>['victoryCave'+(215+i),215+i,'cave']),['victoryCave215Water',215,'water'],['victoryCave220Water',220,'water']],contexts={};
for(const [id,zone,terrain]of plans){const family=c.LEAGUE_PARTS.zoneFamily[zone],data=assets(family),water=terrain==='water',pattern=zone===355?terrain==='path'?/michi/:/grass/:zone===214?/cpl_michi/:water?/-d0_miz$/:/-d0yuka_00[12]$/,list=triangles(data,zone,pattern),maxError=zone===214||water?1:.035;let anchor,contact;
 for(const p of candidates(zone,terrain)){const found=material(list,p,maxError);if(found){anchor=p;contact=found;break;}}
 if(!anchor)throw Error('No actual native contact material for '+id);
 const inside=zone>=215&&zone<=228,profile={zone,family,origin:[anchor.x,anchor.z],height:contact.height,physicalHeight:anchor.height,back:25,cutoff:-21,floor:contact.texture,indoor:inside,kind:water?'surf':terrain==='darkGrass'?'dark':'normal',terrain,source:'IRBI native floor triangle and physical support; static HD-2D battle clearing, not exact DS camera'};
 if(inside)Object.assign(profile,{wall:wall(data,contact.texture),wallPattern:'^$',sceneryExcludePattern:'d0ana_002b$',removeBlackCaps:true,supportPattern:'d0yuka_00[12]$',sky:['#242e31','#53605d']});
 else if(zone===355){if(terrain==='path')profile.floorUV=[.5,10.5,30.5,14.5];profile.bank=bank(data,contact.texture);profile.sky=['#85b2bc','#c5dac7'];}
 else profile.sky=['#9bb7bb','#d7c6a0'];
 if(c.LEAGUE_PARTS.families[family].seasons){profile.variants={};for(let season=0;season<4;season++){const variant=assets(family,season),hit=material(triangles(variant,zone,pattern),anchor,maxError);if(!hit||Math.abs(hit.height-profile.height)>.035)throw Error('Native seasonal contact changed for '+id+':'+season);profile.variants[season]={season,floor:hit.texture,height:hit.height,...(zone===355?{bank:bank(variant,hit.texture)}:{})};}}
 contexts[id]=profile;
}
const result={source:'Existing IRBI052 exports, fixed geographic contact points and original seasonal material names; no actor or postgame event unlocked',contexts,hashes};
fs.writeFileSync(path.join(root,'src/league-battle-data.js'),'window.LEAGUE_BATTLE_DATA='+JSON.stringify(result)+';\n');
console.log('Exported',Object.keys(contexts).length,'native battle contexts, including both cave lakes; graphical acceptance still required');
