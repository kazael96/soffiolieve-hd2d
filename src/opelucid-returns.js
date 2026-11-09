/* Small metadata itineraries; no remote scene graphics are loaded by travel. */
(function(root){
 let sampler;const cachedLegs=new WeakMap();
 const keys=['aralia-museum','cedric-museum','belle-museum','komor-castle-entrance'];
 const fields=new Map(),connect=(a,b)=>{if(!fields.has(a))fields.set(a,new Set());fields.get(a).add(b);};for(const t of Object.values(root.OPELUCID_RETURN_DATA.seasons[0]))for(let i=0;i<t.legs.length-1;i++)if(t.legs[i].kind==='path'){const a=t.legs[i].zone,b=t.legs[i+1].zone;connect(a,b);connect(b,a);}
 function trip(key){const season=root.FieldSeason.current(),data=root.OPELUCID_RETURN_DATA;if(data?.version!==1||!data.seasons[season]?.[key])throw Error('Itinerario di ritorno non disponibile: '+key);return data.seasons[season][key];}
 function extend(kit){for(const key of keys)kit.itineraries['return-'+key]=()=>{const t=trip(key);if(!cachedLegs.has(t))cachedLegs.set(t,t.legs.map(l=>({...l,worldReturn:true})));return cachedLegs.get(t);};}
 const sources={Aralia:{zone:107,uid:250,model:105,key:'aralia-museum',target:'16:9'},Gasparago:{zone:207,uid:1,model:104,key:'cedric-museum',target:'16:10'},Belle:{zone:205,uid:2,model:134,key:'belle-museum',target:'16:12'},Komor:{zone:205,uid:1,model:7,key:'komor-castle-entrance',target:'158:2'}};
 function destination(actor,z,n){if(n?.vars[16551]!==9)return null;const s=sources[actor.name];if(!s||s.zone!==z||n.opelucidArrivals?.[s.target]===actor.name)return null;if(actor.name==='Gasparago'&&n.vars[16543]!==1)return null;if(!['Belle','Komor'].includes(actor.name)&&n.vars[16541]!==1)return null;return 'return-'+s.key;}
 function start(options){const n=options.native;if(n?.vars[16541]!==1||n.vars[16551]!==9||root.NativeStory?.locked)return;
  for(const [name,s]of Object.entries(sources)){if(name==='Komor'||n.opelucidArrivals?.[s.target]===name)continue;const records=options.departures?.records;if(!records)continue;let r=records.get(name);if(r){if(r.stage!=='resident'||r.plan.worldReturn||!destination(r.actor,r.actor.fieldZone,n))continue;const previous=r.plan.transferAuthorized===true,zone=r.actor.fieldZone;if(options.departures.depart(r.actor,zone)&&previous&&!root.MistraltonContinuity.sameField(zone,n.zone))r.plan.transferAuthorized=true;continue;}
   // A native role may already have adopted the arrived body and released the
   // departure record. Its captured actor is still physical arrival evidence.
   const valid=a=>a?.name===name&&a.model===s.model&&a.uid===s.uid&&a.fieldZone===s.zone&&!a.hidden&&[a.x,a.y,a.height].every(Number.isFinite),body=(options.actors?.()||[]).find(valid)||(n.actors?.[s.zone]||[]).find(valid);if(!body||!destination(body,s.zone,n))continue;
   if(options.departures.depart(body,s.zone)&&!root.MistraltonContinuity.sameField(s.zone,n.zone))records.get(name).plan.transferAuthorized=true;
  }
 }
 const superseded=(a,n)=>{const s=sources[a.name];return !!s&&a.fieldZone===s.zone&&a.uid===s.uid&&n?.opelucidArrivals?.[s.target]===a.name;};
 const isTarget=a=>a.fieldZone===16&&({Aralia:9,Gasparago:10,Belle:12})[a.name]===a.uid||a.fieldZone===158&&a.name==='Komor'&&a.uid===2;
 function points(leg,actor){const pose=actor.incomingPortal||actor;if(Math.hypot(pose.x-leg.start.x,pose.y-leg.start.y)>.011)throw Error('Ingresso dell’itinerario di ritorno non coerente: '+leg.zone);const source=root.OPELUCID_RETURN_DATA.paths[leg.path];if(!source)throw Error('Percorso di ritorno incompleto');return source.map(p=>({x:p[0],y:p[1],height:p[2],...(p.length>3?{jumpLift:p[3]}:{})}));}
 function tickHeight(record){const index=Math.min(record.index,record.plan.points.length-1),target=record.plan.points[index],before=index>0?record.plan.points[index-1]:record.plan.startPose;if(!target||!before)return;const dx=target.x-before.x,dy=target.y-before.y,length=dx*dx+dy*dy,f=length?Math.max(0,Math.min(1,((record.actor.x-before.x)*dx+(record.actor.y-before.y)*dy)/length)):1,from=before.height??record.actor.height??0,to=target.height??from,wanted=from+(to-from)*f,z=record.actor.fieldZone;
  sampler??=root.NativeSurfaces.create(root.NATIVE_SURFACE_DATA);const rail=root.NativeRails.has(z)&&root.NativeRails.locate(z,record.actor.x,record.actor.y,{height:wanted});let surface;
  if([113,205].includes(z))surface=root.OpelucidSeasons.surfaceAt(z,record.actor.x,record.actor.y,wanted);
  else if(z===199){if(root.IcirrusSeasons.stats().season===root.FieldSeason.current())surface=root.IcirrusChapter.surfaceAt(z,record.actor.x,record.actor.y,wanted);}
  else surface=root.OpelucidChapter.surfaceAt(z,record.actor.x,record.actor.y,wanted)||sampler.at(z,record.actor.x,record.actor.y,wanted);
  record.actor.height=rail?.height??surface?.height??wanted;
 }
 root.OpelucidReturns={extend,points,tickHeight,destination,start,isTarget,superseded,keys,trip,sameField:(a,b)=>fields.get(a)?.has(b)||false};
})(typeof window!=='undefined'?window:globalThis);
