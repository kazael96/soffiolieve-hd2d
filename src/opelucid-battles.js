/* Native geographic scenery behind an unobstructed, grounded HD-2D arena. */
(()=>{
 const contexts={brycenGym:{zone:114,origin:[1.5,-1.5],height:7,back:25,cutoff:-20,floor:'op-map-527-in30_yuka02',indoor:true,sky:['#263d50','#839ba9']}};
 for(const [zone,map,origin]of [[205,67,[-602.5,-607.5]],[206,415,[24.5,22.5]]])for(const variant of ['Path','Grass','Dark'])contexts['dragon'+zone+variant]={zone,origin,height:zone===205?3:0,back:25,cutoff:-21,floor:'op-map-'+map+'-grass01ax',bank:zone===205?'op-map-67-gake01a':'op-map-415-gake1_1',kind:variant==='Dark'?'dark':'normal'};
 contexts.dragon206Water={zone:206,origin:[16.5,22.5],height:-.5,back:25,cutoff:-21,floor:'op-map-414-ike01',bank:'op-map-415-gake1_1',kind:'surf'};
 for(const [zone,map,part,height]of [[207,378,'f',0],[208,407,'f',0],[210,409,'e',10],[212,411,'e',0]])contexts['dragon'+zone]={zone,origin:[.5,.5],height,back:25,cutoff:-21,floor:'op-map-'+map+'-in14_yuka_'+part,wall:'op-map-'+map+'-in14_wall_'+(zone<210?'c':'a'),indoor:true,sky:['#252c30','#525955'],kind:'normal'};
 function clipFar(verts,cutoff){
  const result=[];for(let at=0;at<verts.length;at+=33){const polygon=[verts.slice(at,at+11),verts.slice(at+11,at+22),verts.slice(at+22,at+33)],kept=[];
   for(let i=0;i<3;i++){const a=polygon[i],b=polygon[(i+1)%3],inside=a[2]<=cutoff,next=b[2]<=cutoff;if(inside)kept.push(a);if(inside!==next){const f=(cutoff-a[2])/(b[2]-a[2]),point=a.map((v,k)=>v+(b[k]-v)*f);point[2]=cutoff;kept.push(point);}}
   for(let i=1;i+1<kept.length;i++)result.push(...kept[0],...kept[i],...kept[i+1]);
  }return result;
 }
 function supportEdges(verts){
  const edges=new Map(),point=v=>v.slice(0,3).map(n=>Math.round(n*1e6)).join(',');
  for(let k=0;k<verts.length;k+=33){const triangle=[verts.slice(k,k+11),verts.slice(k+11,k+22),verts.slice(k+22,k+33)];if(triangle[0][1]<=.001||triangle.some(v=>Math.abs(v[1]-triangle[0][1])>.0001))continue;for(let i=0;i<3;i++){const a=triangle[i],b=triangle[(i+1)%3],key=[point(a),point(b)].sort().join('|'),old=edges.get(key);if(old)old.count++;else edges.set(key,{a,b,count:1});}}
  const walls=[];for(const {a,b,count}of edges.values()){if(count!==1)continue;const length=Math.hypot(b[0]-a[0],b[2]-a[2]);if(length<.0001)continue;for(const i of [0,1,2,2,1,3]){const p=i%2?b:a;walls.push(p[0],i>=2?p[1]:0,p[2],i%2?length*4:0,i>=2?0:64,1,1,1,0,0,1);}}return walls;
 }
 function floor(id){const c=contexts[id],key='opelucid-battle-'+id;if(!OPENING_ASSETS.textures[c.floor])throw Error('Pavimento nativo non disponibile: '+id);
  if(!OPENING_ASSETS.models[key]){const verts=[];for(const i of [0,1,2,2,1,3])verts.push(i%2?48:-48,0,i>=2?24:-64,i%2?1536:0,i>=2?1408:0,1,1,1,0,1,0);const groups=[{texture:c.floor,verts,repeatS:true,repeatT:true}];
   if(c.wall){const texture=OPENING_ASSETS.textures[c.wall];if(!texture)throw Error('Parete nativa non disponibile: '+id);const arc=[[-48,-29],[-32,-40],[-16,-46],[0,-48],[16,-46],[32,-40],[48,-29]];for(let s=0;s+1<arc.length;s++){const [ax,az]=arc[s],[bx,bz]=arc[s+1],wall=[],length=Math.hypot(bx-ax,bz-az);for(const i of [0,1,2,2,1,3])wall.push(i%2?bx:ax,i>=2?24:0,i%2?bz:az,i%2?length*4:0,i>=2?0:texture.h*3,.76,.81,.82,0,0,1);groups.push({texture:c.wall,verts:wall,repeatS:true,repeatT:true,doubleSided:true});}}
   OPENING_ASSETS.models[key]={groups};}return key;
 }
 async function prepare(id){const c=contexts[id];if(!c)return false;await OpelucidChapter.ensure(c.zone);floor(id);return true;}
 function instances(id){const c=contexts[id],source=OpelucidChapter.scene(c.zone);return [...source.instances.filter(i=>i.actorUid===undefined&&(c.zone!==205||i.model==='op-map-67')).map(i=>{
   // Clip individual polygons, preserving long native grass/cliff faces that
   // cross the clear arena edge. Dropping whole triangles left trees floating.
   const key='opelucid-battle-scenery-'+c.zone+'-'+(c.height||0)+'-'+i.model;if(!OPENING_ASSETS.models[key]){const cs=Math.cos(i.rotation),sn=Math.sin(i.rotation),groups=OPENING_ASSETS.models[i.model].groups.filter(g=>!c.wall||!/in14_wall/.test(g.texture||'')).map(g=>{const verts=[...g.verts];for(let k=0;k<verts.length;k+=11){const x=verts[k],z=verts[k+2],nx=verts[k+8],nz=verts[k+10];verts[k]=x*cs+z*sn+i.x-c.origin[0];verts[k+1]+=i.y-(c.height||0);verts[k+2]=-x*sn+z*cs+i.z-c.origin[1]-c.back;verts[k+8]=nx*cs+nz*sn;verts[k+10]=-nx*sn+nz*cs;}return {...g,verts:clipFar(verts,c.cutoff)};}).filter(g=>g.verts.length);if(c.bank){const edges=groups.filter(g=>/grass01ax/.test(g.texture)).flatMap(g=>supportEdges(g.verts));if(edges.length)groups.push({texture:c.bank,verts:edges,repeatS:true,repeatT:true,doubleSided:true});}OPENING_ASSETS.models[key]={groups};}return {model:key,x:0,y:0,z:0,rotation:0};
  }),{model:floor(id),x:0,y:0,z:0,rotation:0}];}
 function ambient(id){const c=contexts[id];if(!c)return null;if(!c.kind)return [];const season=OPELUCID_DATA.encounters[c.zone]?.seasons[window.FieldSeason?.current()??new Date().getMonth()%4],slots=season?.[c.kind]?.slots||[];return [...new Map(slots.map(s=>[s.name,s])).values()].slice(0,3).map((s,i)=>({species:s.name,id:s.id,x:-6+i*2.2,z:-19.5,height:.38}));}
 const previous=PinwheelBattles.instances,previousAmbient=PinwheelBattles.ambient;Object.assign(PinwheelBattles.contexts,contexts);PinwheelBattles.instances=id=>contexts[id]?instances(id):previous(id);PinwheelBattles.ambient=id=>ambient(id)??previousAmbient(id);
 window.OpelucidBattles={has:id=>!!contexts[id],prepare,instances,ambient,contexts,clipFar,supportEdges,isGround:name=>/^op-/.test(name||'')&&/(?:yuka|ice_s|grass|michi|mizu|water)/.test(name)};
})();
