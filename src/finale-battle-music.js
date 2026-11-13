/* IRBI SDAT names:1135 VS_SHITENNO,1138 VS_N_2,1139 VS_G_CIS.
 * First Black-version teams only; N's earlier encounters keep their old theme. */
(function(root){
 const tracks=Object.freeze({228:1135,229:1135,230:1135,231:1135,587:1138,232:1139});
 function sequence(trainerId){return tracks[trainerId]??null;}
 // IRBI556:7 starts species643/level50 with flags273 in map278.
 // SDAT1140 is SEQ_BGM_VS_SHIN. Keep this exact story context scoped:
 // these bits are not a general interpretation of all native wild flags.
 function wildSequence(battle,location){return battle?.story==='wild'&&battle.nativeWildFlags===273&&location?.zone===278&&battle.p2?.length===1&&battle.p2[0].name==='Reshiram'&&battle.p2[0].level===50?1140:null;}
 root.FinaleBattleMusic={sequence,wildSequence,tracks};
})(typeof window==='undefined'?globalThis:window);
