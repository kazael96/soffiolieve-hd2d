/* Native Gym121 floor, masonry and dragon geometry around a clear HD-2D arena.
 * This is a location composition, not a reconstruction of the DS battle camera
 * or a replay of the field puzzle's moving joints during a fight. */
(function(root){
 // Compose around the actual supported upper platform. Using the entrance's
 // zero datum made the twelve-unit puzzle decks hang over the combatants.
 if(!root.LEAGUE_BATTLE_DATA?.contexts)throw Error('Catalogo dei fondali originali052 non disponibile');
 const contexts={draydenGym:{zone:121,origin:[11.5,-12.5],height:12.002914428710938,back:25,cutoff:-21,floor:'lg-map-615-in31_fl02',wall:'lg-map-615-in31_wl01',wallPattern:'in31_wl',indoor:true,sky:['#101316','#343b40'],source:'IRBI121 original upper platform/walls, adapted HD-2D battle clearing'},...root.LEAGUE_BATTLE_DATA.contexts};
 if(!root.OpelucidBattles||!root.PinwheelBattles)throw Error('Compositore geografico dei fondali non disponibile');
 Object.assign(root.OpelucidBattles.contexts,contexts);Object.assign(root.PinwheelBattles.contexts,contexts);
 const floors=new Set(Object.values(contexts).flatMap(c=>[c.floor,...Object.values(c.variants||{}).map(v=>v.floor)])),old=root.OpelucidBattles.isGround;root.OpelucidBattles.isGround=name=>floors.has(name)||old(name);
 const owned=new WeakSet(Object.values(contexts)),season=()=>root.FieldSeason?.current()??new Date().getMonth()%4,oldBattle=root.OpelucidSeasons.battle,oldRevision=root.OpelucidBattles.revision;
 root.OpelucidSeasons.battle=c=>{if(!c?.variants||!owned.has(c))return oldBattle(c);const variant=c.variants[season()];if(!variant)throw Error('Materiali stagionali052 non disponibili');return {...c,...variant};};
 root.OpelucidBattles.revision=id=>contexts[id]?.variants?season():oldRevision(id);
 const sizes={Herdier:.5,Bouffalant:.65,Foongus:.28,Amoonguss:.38,Heatmor:.52,Mienfoo:.44,Fraxure:.54,Durant:.3,Boldore:.52,Deino:.44,Basculin:.24};
 function ambient(id){const c=contexts[id];if(!c)return null;if(!c.kind)return [];const source=root.LEAGUE_DATA?.encounters?.[c.zone]?.seasons[season()]?.[c.kind];if(!source?.rate)return [];
  const available=new Map(source.slots.map(s=>[s.name,s])),preferred=c.kind==='surf'?['Basculin']:c.zone===355?['Herdier','Bouffalant','Foongus','Amoonguss']:c.zone===214?['Heatmor','Mienfoo','Fraxure']:['Durant','Boldore','Deino','Mienfoo'];
  const names=[...new Set([...preferred.filter(name=>available.has(name)),...available.keys()])].slice(0,3);return names.map((name,i)=>({species:name,id:available.get(name).id,x:-6+i*3,z:-20.25-i*.2,height:sizes[name]||.42}));
 }
 const oldAmbient=root.PinwheelBattles.ambient,oldOpAmbient=root.OpelucidBattles.ambient;root.PinwheelBattles.ambient=id=>ambient(id)??oldAmbient(id);root.OpelucidBattles.ambient=id=>ambient(id)??oldOpAmbient(id);
 root.LeagueBattles={contexts,ambient,has:id=>Object.hasOwn(contexts,id)};
})(typeof window==='undefined'?globalThis:window);
