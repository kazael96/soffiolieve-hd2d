/* Native Emboar/Samurott Colpocoda, with separate authored tail gestures.
 * Parts, palettes, move mechanics and native FX/audio remain original.
 * Install after EmboarMoves and before Unfezant/EmboarContact.
 */
(function(root){
 'use strict';
 if(root.TailWhipMoves){root.TailWhipMoves.install();return;}
 const KIND='nativeTailWhipStatus064',MARK='native500503TailWhip064';
 const check=(value,message)=>{if(!value)throw Error(message);};
 const freezePoints=points=>Object.freeze(points.map(point=>Object.freeze(point)));
 const curves=Object.freeze({
  500:Object.freeze({
   tail:freezePoints([[0,0],[.2,-.4],[.36,2],[.55,-.5],[.7,1],[.87,-.35],[1,0]]),
   head:freezePoints([[0,0],[.17,-.12],[.45,.06],[.8,-.03],[1,0]]),
   arms:freezePoints([[0,0],[.21,-.16],[.6,.1],[.88,-.04],[1,0]])
  }),
  503:Object.freeze({
   tail:freezePoints([[0,0],[.1,-.15],[.25,1.5],[.44,-1.55],[.62,1.35],[.79,-.65],[.93,.15],[1,0]]),
   head:freezePoints([[0,0],[1,0]]),arms:freezePoints([[0,0],[1,0]])
  })
 });
 const definition=(track,cell,x,y)=>Object.freeze({track,cell,row:Object.freeze([x,y])});
 const definitions=Object.freeze({
  500:Object.freeze({front:definition(11,11,2,-18),back:definition(10,12,-7,-21)}),
  503:Object.freeze({front:definition(28,28,16,-31),back:definition(8,8,-14,-29)})
 });
 let installedOn=null,instance=null;
 function curve(points,t){
  if(t<=points[0][0])return points[0][1];
  for(let i=1;i<points.length;i++)if(t<=points[i][0]){
   const [x,a]=points[i-1],[y,b]=points[i],u=Math.max(0,Math.min(1,(t-x)/(y-x)));
   return a+(b-a)*u*u*(3-2*u);
  }
  return points.at(-1)[1];
 }
 function selected(p){
  if(p?.tailWhip064!==MARK)return false;
  check([500,503].includes(p.species)&&p.id===39&&p.kind===KIND&&p.frames===126&&p.impact===60&&p.nativeEffects===true&&p.damage===false&&p.target==='foe','TailWhip profile contract changed');
  check(p.graphic===undefined||String(p.graphic)===String(p.species),'TailWhip excludes unverified forms');
  return true;
 }
 function install(){
  const S=root.SpeciesMoves,C=root.ChapterMoves,D=root.DemoMoves,R=root.ROM_SPRITE_ANIM;
  if(installedOn===S&&installedOn)return true;
  if(installedOn)throw Error('TailWhip owner replacement requires a fresh host');
  if(!S?.part||!S.sample||!S.pose||!C?.sample||!C.select||!C.profiles||!D?.sample||!R?.frame||!R.prepare||!root.EmboarMoves)return false;
  check(!root.UnfezantMoves&&!root.EmboarContactMoves?.instance,'Install TailWhip before Unfezant/EmboarContact; dependency guards must remain intact');
  check(S.prepare===undefined||typeof S.prepare==='function','TailWhip preparation predecessor must be callable');
  function writable(owner,key){
   const descriptor=Object.getOwnPropertyDescriptor(owner,key);
   check(descriptor?'value'in descriptor&&descriptor.writable:Object.isExtensible(owner),'TailWhip installation requires writable original slots');
  }
  for(const [owner,key]of[[S,'part'],[S,'prepare'],[C,'sample'],[D,'sample'],[C.profiles,'500-39'],[C.profiles,'503-39']])writable(owner,key);
  const previous=Object.freeze({part:S.part,sample:S.sample,pose:S.pose,chapterSample:C.sample,demoSample:D.sample,select:C.select,prepare:S.prepare});
  const originals={},profiles={};
  for(const species of[500,503]){
   const p=C.profiles[species+'-39'];
   check(p&&p.species===species&&p.id===39&&p.kind==='tailPound'&&p.frames===126&&p.impact===60&&p.nativeEffects===true&&p.damage===false&&p.target==='foe','Unexpected original TailWhip profile');
   originals[species]=p;profiles[species]=Object.freeze({...p,kind:KIND,tailWhip064:MARK});
  }
  const identity=f=>f&&f[2]===0&&f[3]===4096&&f[4]===4096&&f[5]===0&&f[6]===0;
  const bounds=value=>Array.isArray(value)&&value.length===4&&value.every(Number.isFinite)&&value[2]>value[0]&&value[3]>value[1];
  function bank(species,view,required=true){
   const value=R.cache?.[species+'-'+view],d=definitions[species][view];
   const image=value?.image,width=image?.naturalWidth||image?.width,height=image?.naturalHeight||image?.height;
   if(!value?.ready||value.pending||!value.data||!image||!Number.isFinite(width)||width<=0||!Number.isFinite(height)||height<=0||!bounds(value.bounds)||!bounds(value.groundBounds)){
    if(!required)return null;
    throw Error('TailWhip native banks must be completely prepared');
   }
   const parent=R.frame(value.data.parent?.[0],0),rows=value.data.maps?.[0],row=rows?.find(r=>r[0]===d.track),frame=R.frame(value.data.animations?.[d.track],0);
   // The authored pose explicitly requests map0. Validate that this is the
   // native tick-zero map and affine; a different parent must never pass by
   // having a coincidentally matching tail row on some other map.
   check(value.data.parent?.[0]?.frames?.length&&value.data.animations?.[d.track]?.frames?.length&&parent?.[0]===0&&identity(parent)&&row&&row[1]===d.row[0]&&row[2]===d.row[1]&&frame?.[0]===d.cell&&identity(frame)&&value.data.cells?.[d.cell]?.length,'TailWhip native parent/part source contract changed');
   return{value,row,definition:d};
  }
  function ready(species){return!!definitions[species]&&!!bank(species,'front',false)&&!!bank(species,'back',false);}
  function requireReady(p,f,side){
   check(Number.isFinite(f)&&['p1','p2'].includes(side),'Invalid TailWhip frame or role');
   bank(p.species,'front');bank(p.species,'back');
  }
  function author(a,p,f){
   check(a&&a.species===p.species,'TailWhip sample owner changed');
   const t=Math.max(0,Math.min(1,f/p.frames)),c=curves[p.species];
   for(const key of['reach','lift','feet','crouch','lean','hip','breath','ears','cheeks','jaw','sniff','glare','coil'])a[key]=0;
   delete a.roll;delete a.nativeCells;
   a.nativeTick=0;a.nativeParentMap=0;a.nativeTailWhip=p.species;
   a.tail=curve(c.tail,t);a.head=curve(c.head,t);a.arms=curve(c.arms,t);
   return a;
  }
  function chapterSample(p,f,side='p1',miss=false){
   if(!selected(p))return previous.chapterSample(p,f,side,miss);
   requireReady(p,f,side);return author(previous.chapterSample(p,f,side,miss),p,f);
  }
  function demoSample(p,f,side='p1',miss=false){
   if(!selected(p))return previous.demoSample(p,f,side,miss);
   requireReady(p,f,side);return author(previous.demoSample(p,f,side,miss),p,f);
  }
  function part(track,back,a){
   if(a?.nativeTailWhip===undefined)return previous.part(track,back,a);
   check([500,503].includes(a.nativeTailWhip)&&a.species===a.nativeTailWhip,'TailWhip body owner changed');
   const current=bank(a.species,back?'back':'front');
   if(a.species===500)return previous.part(track,back,a);
   // Samurott's old generic mapping labelled legs as tail. Only this real
   // native fin is articulated; no armor, head or leg follows the wag.
   return track===current.definition.track?{rotation:a.tail*a.dir*.15,pivotX:0,pivotY:0}:null;
  }
  async function prepare(p,options={}){
   const own=selected(p),result=await previous.prepare?.call(S,p,options);
   if(!own)return result;
   if(!ready(p.species))await R.prepare([p.species+'-front',p.species+'-back'],{gate:false});
   bank(p.species,'front');bank(p.species,'back');
   return{representation:'originalNativeParts',species:p.species,banks:[p.species+'-front',p.species+'-back']};
  }
  // Mutate only after every slot/profile has passed preflight. C.select owns
  // a closure over this same profiles table, so no selector replacement is
  // needed. The public S.sample/S.pose identities remain unchanged.
  for(const species of[500,503])C.profiles[species+'-39']=profiles[species];
  C.sample=chapterSample;D.sample=demoSample;S.part=part;S.prepare=prepare;
  installedOn=S;
  instance=Object.freeze({previous,profiles:Object.freeze(profiles),originals:Object.freeze(originals),ready,part,chapterSample,demoSample,prepare});
  return true;
 }
 const api={install,curve,curves,definitions,kind:KIND,marker:MARK,get instance(){return instance;},scope:'50039 and50339 native part choreography only. Native FX/audio/mechanics retained; visual/compositor/tempo acceptance requires the new candidate replays.'};
 root.TailWhipMoves=api;install();if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
