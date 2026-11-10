/* Native Gym121 floor, masonry and dragon geometry around a clear HD-2D arena.
 * This is a location composition, not a reconstruction of the DS battle camera
 * or a replay of the field puzzle's moving joints during a fight. */
(function(root){
 // Compose around the actual supported upper platform. Using the entrance's
 // zero datum made the twelve-unit puzzle decks hang over the combatants.
 const contexts={draydenGym:{zone:121,origin:[11.5,-12.5],height:12.002914428710938,back:25,cutoff:-21,floor:'lg-map-615-in31_fl02',wall:'lg-map-615-in31_wl01',wallPattern:'in31_wl',indoor:true,sky:['#101316','#343b40'],source:'IRBI121 original upper platform/walls, adapted HD-2D battle clearing'}};
 if(!root.OpelucidBattles||!root.PinwheelBattles)throw Error('Compositore geografico dei fondali non disponibile');
 Object.assign(root.OpelucidBattles.contexts,contexts);Object.assign(root.PinwheelBattles.contexts,contexts);
 const old=root.OpelucidBattles.isGround;root.OpelucidBattles.isGround=name=>name===contexts.draydenGym.floor||old(name);
 root.LeagueBattles={contexts,has:id=>Object.hasOwn(contexts,id)};
})(typeof window==='undefined'?globalThis:window);
