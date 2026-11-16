/* Field-only Taglio anatomy, reviewed against the original initial composites.
 * IDs are animation-track IDs in maps[parent[0].frames[0][0]], not cell IDs.
 * This catalog covers only the43 graphic keys absent from both Surf and Fly.
 * Empty roles are intentional: a hidden/inseparable joint must use the global
 * foot-anchored pose rather than rotate an invented or unrelated sprite part.
 * body/shell/mane/skirt mark static assemblies, not extra moving limbs.
 * Evidence: outputs/chapter055-preparation/cut-anatomy, native-page-01..22.png.
 * These maps do not replace or mutate the battle animation catalogs. */
(function(root){
 const catalog={
  495:{front:{head:[0],left:[2],right:[3],feet:[4,5],tail:[8,9],body:[1,6,7]},
       back:{head:[0],left:[2],right:[],feet:[3,4],tail:[7,8],body:[1,5,6]}},
  496:{front:{head:[0],left:[5],right:[6],feet:[7,8,9],tail:[2,4],body:[1,3]},
       back:{head:[0],left:[6],right:[],feet:[7,8,9,10],tail:[2,5],body:[1,3,4]}},
  497:{front:{head:[0,1,2,6],left:[],right:[],feet:[],tail:[7,8,9],body:[3,4,5]},
       back:{head:[0,1,2,4],left:[],right:[],feet:[],tail:[5,7,8,9],body:[3,6]}},
  540:{front:{head:[0,6,7],left:[],right:[],feet:[1,2,5,8,9],tail:[],body:[3,4]},
       back:{head:[0,3],left:[],right:[],feet:[1,4,5],tail:[],body:[2]}},
  // The rear cloak contains the entire hidden head. Global compression/lean only.
  541:{front:{head:[0],left:[],right:[],feet:[],tail:[],shell:[1,2,3,4,5,6,7,8,9,10]},
       back:{head:[],left:[],right:[],feet:[],tail:[],shell:[0,1,2,3,4]}},
  542:{front:{head:[0,1,2,10,11],left:[4,6],right:[5,7],feet:[14,15],tail:[],body:[3],skirt:[8,9,12,13]},
       back:{head:[0,8,9],left:[2,4],right:[3,5],feet:[11,12],tail:[],body:[1],skirt:[6,7,10]}},
  548:{front:{head:[0,5,6,7],left:[3],right:[4],feet:[],tail:[],body:[1,2]},
       back:{head:[0,5,6,7],left:[3],right:[4],feet:[],tail:[],body:[1,2]}},
  // The bulb and broad lower leaves are skirt/body, not parts of the head.
  549:{front:{head:[17,18,19,20,21,28,29,30],left:[23],right:[24],feet:[31,32,33],tail:[],body:[22,27],skirt:[25,26]},
       back:{head:[11,12,13,19,20],left:[14],right:[15],feet:[21],tail:[],body:[18],skirt:[16,17]}},
  // Keep the middle vine static: it has a third, separate native attachment.
  598:{front:{head:[],left:[11,8],right:[12,10],feet:[],tail:[],vineMiddle:[13,9],shell:[7]},
       back:{head:[],left:[11,8],right:[12,10],feet:[],tail:[],vineMiddle:[13,9],shell:[7]}},
  557:{front:{head:[0],left:[1],right:[2],feet:[4,5],tail:[],shell:[3]},
       back:{head:[0],left:[1],right:[],feet:[2,5],tail:[],shell:[4]}},
  558:{front:{head:[0],left:[1],right:[2],feet:[4,5,6,7,8,9],tail:[],shell:[3]},
       back:{head:[],left:[],right:[0],feet:[2,3,4,5],tail:[],shell:[1]}},
  // Both blue horn and armour are one piece. Do not call that whole piece head.
  588:{front:{head:[],left:[8],right:[9],feet:[10,11],tail:[],body:[6,7]},
       back:{head:[],left:[5],right:[],feet:[6,7],tail:[],body:[4]}},
  589:{front:{head:[11,12],left:[19],right:[20],feet:[],tail:[],body:[13,14,15,16,17,18]},
       back:{head:[10,11],left:[18],right:[19],feet:[],tail:[],body:[12,13,14,15,16,17]}},
  504:{front:{head:[0,1],left:[3,4],right:[5],feet:[6,7,8,9],tail:[10,11],body:[2]},
       back:{head:[0],left:[2,3],right:[4],feet:[5,6,7,8],tail:[9,10],body:[1]}},
  // Crossed hands are one native track; there is no separable second hand.
  505:{front:{head:[0,1,2],left:[5],right:[],feet:[6,7,8,9],tail:[10,11],body:[3,4]},
       back:{head:[0,1,2],left:[5],right:[],feet:[6,7,8,9],tail:[10],body:[3,4]}},
  509:{front:{head:[8,9,10],left:[13],right:[15],feet:[12,14],tail:[17],body:[11]},
       back:{head:[9,10,11],left:[15],right:[],feet:[13,16],tail:[17],body:[12]}},
  // Forelegs are arms for the claw stroke; hindlegs retain the feet channel.
  510:{front:{head:[36,37,38],left:[41],right:[42],feet:[43,44],tail:[45],body:[39,40]},
       back:{head:[34,35],left:[39],right:[38],feet:[40,41],tail:[42],body:[36,37]}},
  511:{front:{head:[0,1,2,3,4,5],left:[7],right:[8],feet:[10,11],tail:[12],body:[6,9]},
       back:{head:[0,1,2,3],left:[5],right:[6],feet:[8,9],tail:[10],body:[4,7]}},
  512:{front:{head:[0,1,2,3,4,5,6],left:[7,8],right:[9,10],feet:[15,16,17,18],tail:[19,20],body:[11,12,13,14]},
       back:{head:[0,1,2,3],left:[7],right:[4,8,9],feet:[12,13,14,15],tail:[16],body:[5,6,10,11]}},
  513:{front:{head:[0],left:[2],right:[3],feet:[5,6],tail:[4],body:[1]},
       back:{head:[0],left:[2],right:[3],feet:[5,6],tail:[4],body:[1]}},
  514:{front:{head:[0],left:[3],right:[4],feet:[5,6],tail:[7],body:[1]},
       back:{head:[0],left:[3],right:[4],feet:[5,6],tail:[7],body:[1]}},
  // Only the muzzle/jaw is separate; the cranium is integral with the torso.
  529:{front:{head:[0,4],left:[8,5,6,7],right:[12,9,10,11],feet:[2,3],tail:[],body:[1]},
       back:{head:[1],left:[5],right:[6],feet:[3,4],tail:[],body:[0,2]}},
  530:{front:{head:[9,10],left:[16],right:[17],feet:[12,13,14,15],tail:[],body:[11]},
       back:{head:[9,10],left:[16],right:[17],feet:[12,13,14,15],tail:[],body:[11]}},
  551:{front:{head:[5,6],left:[],right:[],feet:[1,2,3,7,8],tail:[4],body:[0]},
       back:{head:[0,1],left:[],right:[],feet:[3,4,5,7,8],tail:[6],body:[2]}},
  552:{front:{head:[0],left:[1],right:[],feet:[2,3,7,8],tail:[5,6],body:[4]},
       back:{head:[0],left:[2],right:[],feet:[3,4,7],tail:[5,6],body:[1]}},
  553:{front:{head:[0],left:[1],right:[2],feet:[3,4,5,6],tail:[7],body:[8,9]},
       back:{head:[0],left:[1,9],right:[2],feet:[4,5,7,8],tail:[6],body:[3]}},
  566:{front:{head:[0],left:[1],right:[2],feet:[4,5],tail:[6],body:[3]},
       back:{head:[0],left:[1],right:[2],feet:[4,5],tail:[6],body:[3]}},
  571:{front:{head:[14,15],left:[21],right:[23],feet:[12,13,20,24,25],tail:[],mane:[16,17],body:[18,19,22]},
       back:{head:[11],left:[15],right:[17],feet:[9,10,18,19],tail:[],mane:[12,13],body:[14,16]}},
  // Front hindfeet are painted into the belly; rear feet share one track.
  587:{front:{head:[0,1,2],left:[3],right:[4,5],feet:[],tail:[7],body:[6]},
       back:{head:[0,1,2],left:[4],right:[5],feet:[6],tail:[7],body:[3]}},
  631:{front:{head:[0],left:[6,7],right:[8,9],feet:[10,11,12,13],tail:[4,5],body:[1,2,3]},
       back:{head:[0],left:[7,8],right:[5,6],feet:[9,10],tail:[2,4],body:[1,3]}},
  // The whole neck assembly pivots together at its basal native track.
  545:{front:{head:[58,54,55,56,60,61,62,63,64,65,66,67,68],left:[],right:[],feet:[69,70,71,72,76,77,78],tail:[79,80],body:[59,73,74,75]},
       back:{head:[52,48,49,50,55,56,57,58],left:[],right:[],feet:[64,65,66,67,68,69],tail:[70,71],body:[53,54,59,60,61,62,63]}},
  595:{front:{head:[6],left:[],right:[],feet:[2,3,4,5],tail:[],body:[1]},
       back:{head:[6],left:[],right:[],feet:[3,4,5],tail:[],body:[1,2]}},
  596:{front:{head:[0],left:[],right:[],feet:[3,4,5,6,7,8,9,10],tail:[],body:[1,2]},
       back:{head:[0],left:[],right:[],feet:[2,4,5,6,7,8,9],tail:[],body:[1,3]}},
  632:{front:{head:[0,8,9,10,11],left:[],right:[],feet:[3,4,5,6,7],tail:[],body:[1,2]},
       back:{head:[0,9,10,11,12],left:[],right:[],feet:[3,4,5,6,7,8],tail:[],body:[1,2]}},
  604:{front:{head:[22,18,19,20],left:[24],right:[25],feet:[27,28],tail:[23,26],body:[21]},
       back:{head:[22,18,19,20],left:[24],right:[25],feet:[27,28],tail:[26],body:[21]}},
  586:{front:{head:[0,1,2,13],left:[],right:[],feet:[4,5,6,7,9,10,11,12],tail:[8],body:[3]},
       back:{head:[0,1,2,13],left:[],right:[],feet:[4,5,6,7,9,10,11,12],tail:[8],body:[3]}},
  704:{front:{head:[0,1,2,3,4],left:[],right:[],feet:[7,8,9,10,12,13,14,15],tail:[11],body:[5,6]},
       back:{head:[0,1,2,3,4],left:[],right:[],feet:[6,7,8,9,11,12,13,14],tail:[10],body:[5]}},
  705:{front:{head:[0,1,2,3,4,15],left:[],right:[],feet:[6,7,8,9,11,12,13,14],tail:[10],body:[5]},
       back:{head:[0,1,2,3,4,15],left:[],right:[],feet:[6,7,8,9,11,12,13,14],tail:[10],body:[5]}},
  706:{front:{head:[0,3,4,15],left:[],right:[],feet:[6,7,8,9,11,12,13,14],tail:[10],body:[5]},
       back:{head:[0,1,2,13,14],left:[],right:[],feet:[4,5,6,7,9,10,11,12],tail:[8],body:[3]}},
  610:{front:{head:[0,1],left:[3],right:[4],feet:[5,6,7,8],tail:[9],body:[2]},
       back:{head:[0,1,3],left:[4],right:[],feet:[5,6,7,8],tail:[9],body:[2]}},
  611:{front:{head:[0,1,2,3],left:[5],right:[6],feet:[7,8,9,10],tail:[11],body:[4]},
       back:{head:[0,1,2],left:[4],right:[],feet:[5,6,7,8],tail:[9],body:[3]}},
  624:{front:{head:[0],left:[2,3],right:[4],feet:[5,6,7,8],tail:[],body:[1]},
       back:{head:[0],left:[3],right:[4],feet:[5,6,7,8],tail:[],body:[1]}},
  625:{front:{head:[0],left:[2,4],right:[3,5],feet:[6,7,8,9],tail:[],body:[1]},
       back:{head:[0],left:[2,4],right:[3,5],feet:[6,7,8,9],tail:[],body:[1]}}
 };
 root.FieldHMCutAnatomy=catalog;
 if(typeof module!=='undefined')module.exports=catalog;
})(typeof window==='undefined'?globalThis:window);
