/* Native geographic scenery behind an unobstructed, grounded HD-2D arena. */
(()=>{
 const contexts={brycenGym:{zone:114,origin:[1.5,-1.5],height:7,back:25,cutoff:-20,floor:'op-map-527-in30_yuka02',indoor:true,sky:['#263d50','#839ba9']}};
 for(const [zone,map,origin]of [[205,67,[-602.5,-607.5]],[206,415,[24.5,22.5]]])for(const variant of ['Path','Grass','Dark'])contexts['dragon'+zone+variant]={zone,origin,height:zone===205?3:0,back:25,cutoff:-21,floor:'op-map-'+map+'-grass01ax',bank:zone===205?'op-map-67-gake01a':'op-map-415-gake1_1',kind:variant==='Dark'?'dark':'normal'};
 contexts.dragon206Water={zone:206,origin:[16.5,22.5],height:-.5,back:25,cutoff:-21,floor:'op-map-414-ike01',bank:'op-map-415-gake1_1',kind:'surf'};
 for(const [zone,map,part,height]of [[207,378,'f',0],[208,407,'f',0],[210,409,'e',10],[212,411,'e',0]])contexts['dragon'+zone]={zone,origin:[.5,.5],height,back:25,cutoff:-21,floor:'op-map-'+map+'-in14_yuka_'+part,wall:'op-map-'+map+'-in14_wall_'+(zone<210?'c':'a'),indoor:true,sky:['#252c30','#525955'],kind:'normal'};
 for(const [zone,map,origin,height]of [[157,37,[-413.5,-263.5],0],[158,348,[31.5,25.5],1.5]])contexts['desert'+zone]={zone,origin,height,back:25,cutoff:-21,floor:'op-map-'+map+'-sabaku01',bank:'op-map-'+map+'-gake01a',kind:'normal',sky:['#ad9a79','#e4cfa7']};
 for(const [zone,map]of [[160,295],[161,296],[162,297],[163,298],[164,299],[165,312]])contexts['relic'+zone]={zone,origin:[.5,.5],height:zone===165?1.5:0,back:25,cutoff:-21,floor:'op-map-'+map+'-in10_suna01',wall:'op-map-'+map+'-in10_kabe03',wallPattern:'in10_kabe',indoor:true,sky:['#34261f','#806345'],kind:'normal'};
 // Contact points and heights are sampled from native planes; the material
 // is the actual horizontal triangle beneath that point, not a guessed name.
 for(const [id,zone,origin,floor,kind,height=0]of [
  ['icirrusTown',113,[-592.5,-555.5],'op-map-64-grass01ax','normal',-98327/65536],
  ['icirrusMarsh',113,[-582.5,-544.5],'op-map-65-sp_marsh','normal',-98327/65536],
  ['icirrusWater',113,[-585.5,-546.5],'op-map-65-sp_marsh2','surf',-98327/65536],
  ['route8Path',345,[-569.5,-573.5],'op-map-68-grass01ax','normal'],
  ['route8Mud',345,[-568.5,-574.5],'op-map-68-sp_o11m2','normal'],
  ['route8Water',345,[-568.5,-579.5],'op-map-68-sp_marsh2','surf'],
  ['moorPath',346,[17.5,9.5],'op-map-385-grass01ax','normal'],
  ['moorMud',346,[16.5,23.5],'op-map-386-sp_o11m','normal'],
  ['moorWater',346,[18.5,22.5],'op-map-386-sp_marsh2','surf'],
  ['route9Path',348,[-429.5,-576.5],'op-map-71-michi02b','normal'],
  ['route9Grass',348,[-419.5,-569.5],'op-map-71-grass01ax','normal'],
  ['route9Dark',348,[-433.5,-566.5],'op-map-70-grass01ax','dark',-65551/65536]
 ])contexts[id]={zone,origin,height,back:25,cutoff:-21,floor,kind};
 contexts.tubeline={zone:254,origin:[-.5,79.5],height:0,back:25,cutoff:-21,floor:'op-map-184-h03_05',sky:['#7e9aa4','#c6d6d6']};
 contexts.opelucidTrainerHouse={zone:125,origin:[-6.5,-6.5],height:0,back:25,cutoff:-21,floor:'op-map-531-in33yuka',wall:'op-map-531-in33kabe01',wallPattern:'in33kabe',indoor:true,sky:['#313942','#71828a']};
 function clipFar(verts,cutoff){
  const result=[];for(let at=0;at<verts.length;at+=33){const polygon=[verts.slice(at,at+11),verts.slice(at+11,at+22),verts.slice(at+22,at+33)],kept=[];
   for(let i=0;i<3;i++){const a=polygon[i],b=polygon[(i+1)%3],inside=a[2]<=cutoff,next=b[2]<=cutoff;if(inside)kept.push(a);if(inside!==next){const f=(cutoff-a[2])/(b[2]-a[2]),point=a.map((v,k)=>v+(b[k]-v)*f);point[2]=cutoff;kept.push(point);}}
   for(let i=1;i+1<kept.length;i++)result.push(...kept[0],...kept[i],...kept[i+1]);
  }return result;
 }
 function withoutBlackCaps(verts){const kept=[];for(let k=0;k<verts.length;k+=33)if(![0,11,22].every(o=>verts.slice(k+o+5,k+o+8).every(v=>v<.08)))kept.push(...verts.slice(k,k+33));return kept;}
 function supportEdges(verts){
  const edges=new Map(),point=v=>v.slice(0,3).map(n=>Math.round(n*1e6)).join(',');
  for(let k=0;k<verts.length;k+=33){const triangle=[verts.slice(k,k+11),verts.slice(k+11,k+22),verts.slice(k+22,k+33)];if(triangle[0][1]<=.001||triangle.some(v=>Math.abs(v[1]-triangle[0][1])>.0001))continue;for(let i=0;i<3;i++){const a=triangle[i],b=triangle[(i+1)%3],key=[point(a),point(b)].sort().join('|'),old=edges.get(key);if(old)old.count++;else edges.set(key,{a,b,count:1});}}
  const walls=[];for(const {a,b,count}of edges.values()){if(count!==1)continue;const length=Math.hypot(b[0]-a[0],b[2]-a[2]);if(length<.0001)continue;for(const i of [0,1,2,2,1,3]){const p=i%2?b:a;walls.push(p[0],i>=2?p[1]:0,p[2],i%2?length*4:0,i>=2?0:64,1,1,1,0,0,1);}}return walls;
 }
 const context=id=>window.OpelucidSeasons?.battle(contexts[id])||contexts[id];
 function floor(id){const c=context(id),key='opelucid-battle-'+id+'-season'+(c.season??'base');if(!OPENING_ASSETS.textures[c.floor])throw Error('Pavimento nativo non disponibile: '+id);
  if(!OPENING_ASSETS.models[key]){const verts=[];for(const i of [0,1,2,2,1,3])verts.push(i%2?48:-48,0,i>=2?24:-64,i%2?1536:0,i>=2?1408:0,1,1,1,0,1,0);const groups=[{texture:c.floor,verts,repeatS:true,repeatT:true}];
   if(c.wall){const texture=OPENING_ASSETS.textures[c.wall];if(!texture)throw Error('Parete nativa non disponibile: '+id);const arc=[[-48,-29],[-32,-40],[-16,-46],[0,-48],[16,-46],[32,-40],[48,-29]];for(let s=0;s+1<arc.length;s++){const [ax,az]=arc[s],[bx,bz]=arc[s+1],wall=[],length=Math.hypot(bx-ax,bz-az);for(const i of [0,1,2,2,1,3])wall.push(i%2?bx:ax,i>=2?24:0,i%2?bz:az,i%2?length*4:0,i>=2?0:texture.h*3,.76,.81,.82,0,0,1);groups.push({texture:c.wall,verts:wall,repeatS:true,repeatT:true,doubleSided:true});}}
   OPENING_ASSETS.models[key]={groups};}return key;
 }
 async function prepare(id){const c=contexts[id];if(!c)return false;await OpelucidChapter.ensure(c.zone);floor(id);return true;}
 function instances(id){const c=context(id),source=OpelucidChapter.scene(c.zone);return [...source.instances.filter(i=>i.actorUid===undefined&&(c.zone!==205||/^op-(?:season[0-3]-)?map-(?:67|197)$/.test(i.model))).map(i=>{
   // Clip individual polygons, preserving long native grass/cliff faces that
   // cross the clear arena edge. Dropping whole triangles left trees floating.
   const key='opelucid-battle-scenery-'+id+'-season'+(c.season??'base')+'-'+(c.height||0)+'-'+i.model;if(!OPENING_ASSETS.models[key]){const cs=Math.cos(i.rotation),sn=Math.sin(i.rotation),groups=OPENING_ASSETS.models[i.model].groups.filter(g=>!c.wall||!new RegExp(c.wallPattern||'in14_wall').test(g.texture||'')).map(g=>{const verts=c.wallPattern==='in10_kabe'&&/in10_suna01$/.test(g.texture)?withoutBlackCaps(g.verts):[...g.verts];for(let k=0;k<verts.length;k+=11){const x=verts[k],z=verts[k+2],nx=verts[k+8],nz=verts[k+10];verts[k]=x*cs+z*sn+i.x-c.origin[0];verts[k+1]+=i.y-(c.height||0);verts[k+2]=-x*sn+z*cs+i.z-c.origin[1]-c.back;verts[k+8]=nx*cs+nz*sn;verts[k+10]=-nx*sn+nz*cs;}return {...g,verts:clipFar(verts,c.cutoff)};}).filter(g=>g.verts.length);if(c.bank){const edges=groups.filter(g=>/grass01ax/.test(g.texture)).flatMap(g=>supportEdges(g.verts));if(edges.length)groups.push({texture:c.bank,verts:edges,repeatS:true,repeatT:true,doubleSided:true});}OPENING_ASSETS.models[key]={groups};}return {model:key,x:0,y:0,z:0,rotation:0};
  }),{model:floor(id),x:0,y:0,z:0,rotation:0}];}
 function ambient(id){const c=contexts[id];if(!c)return null;if(!c.kind)return [];const season=OPELUCID_DATA.encounters[c.zone]?.seasons[window.FieldSeason?.current()??new Date().getMonth()%4],slots=season?.[c.kind]?.slots||[];return [...new Map(slots.map(s=>[s.name,s])).values()].slice(0,3).map((s,i)=>({species:s.name,id:s.id,x:-6+i*2.2,z:-19.5,height:.38}));}
 const previous=PinwheelBattles.instances,previousAmbient=PinwheelBattles.ambient;Object.assign(PinwheelBattles.contexts,contexts);PinwheelBattles.instances=id=>contexts[id]?instances(id):previous(id);PinwheelBattles.ambient=id=>ambient(id)??previousAmbient(id);
 window.OpelucidBattles={has:id=>!!contexts[id],revision:id=>[113,205,345,346].includes(contexts[id]?.zone)?window.FieldSeason?.current()??0:null,prepare,instances,ambient,contexts,clipFar,supportEdges,isGround:name=>/^op-/.test(name||'')&&/(?:yuka|suna|sabaku|sand_base|ice_s|grass|michi|mizu|water|(?:sp|w)_marsh|(?:sp|w)_o11m|w_out11_yuka|h03_05)/.test(name)};
})();
