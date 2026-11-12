/* IRBI SDAT names:1135 VS_SHITENNO,1138 VS_N_2,1139 VS_G_CIS.
 * First Black-version teams only; N's earlier encounters keep their old theme. */
(function(root){
 const tracks=Object.freeze({228:1135,229:1135,230:1135,231:1135,587:1138,232:1139});
 function sequence(trainerId){return tracks[trainerId]??null;}
 root.FinaleBattleMusic={sequence,tracks};
})(typeof window==='undefined'?globalThis:window);
