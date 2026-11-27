/* Field-only native track identities, visually checked against both views.
 * IDs are animation-track IDs from the active native parent map at tick 0,
 * not cell indices or bounding-box classifications. Diagnostic isolated-track
 * composites and SHA provenance live outside builds in
 * outputs/chapter055-preparation/fly-anatomy.
 *
 * TrainingMoves.partMaps, OpelucidMotion.parts, LeagueMotion.parts and
 * FinaleMotion.parts were starting references; the field maps below correct
 * the visibly misidentified Swanna wings, Golurk seal/opposite fist,
 * Mandibuzz tail/thighs and Reshiram back-view head. Battle rigs are untouched.
 * An omitted role has no independently separable native pixels in that view.
 * Ordinary bird/bat wings use left/right (arms); Hydreigon and Zekrom have
 * dedicated wingLeft/wingRight joints, independent of their other limbs.
 */
(function(root){
 'use strict';
 const anatomy={
  // Pidove uses parent map 1 at tick 0. Its front view has one visible wing.
  // Back16 contains BOTH native feet in one track and cannot alternate them.
  '519':{
   front:{head:[12,13,14],left:[10],footLeft:[17],footRight:[16],tail:[11]},
   back:{head:[9,10,11],left:[14],right:[15],feet:[16],tail:[17]}
  },
  // Neck ruff/crest follow the head; both front tail feathers stay together.
  '520':{
   front:{head:[0,1,2,3,4],left:[6],footLeft:[9],footRight:[10],tail:[7,8]},
   back:{head:[0,1,2,3],left:[5],right:[6],footLeft:[8],footRight:[9],tail:[7]}
  },
  // TrainingMoves521, plus the independently visible far wing in back view.
  '521':{
   front:{head:[18,19,20,21,22,23,24,25],left:[29],footLeft:[31,33],footRight:[32,34],tail:[30]},
   back:{head:[12,13,14,15],left:[18],right:[17],footLeft:[20,22],footRight:[21,23],tail:[19]}
  },
  // Male ribbon tracks exist in the table but contain no female pixels.
  '521-female':{
   front:{head:[18,19],left:[29],footLeft:[31,33],footRight:[32,34],tail:[30]},
   back:{head:[12,13],left:[18],right:[17],footLeft:[20,22],footRight:[21,23],tail:[19]}
  },
  // The furball is an inseparable head/body. Nose/mouth share its nod.
  // Neither view contains independently drawable feet or tail.
  '527':{
   front:{head:[0,1,2],left:[4],right:[3]},
   back:{head:[0],left:[2],right:[1]}
  },
  // Back view uses parent map 1 and has one independently visible foot.
  '528':{
   front:{head:[0,1],left:[8],right:[7],footLeft:[5],footRight:[4],tail:[6]},
   back:{head:[0,1],left:[7],right:[6],footRight:[4],tail:[5]}
  },
  // Body/head are one native track; black lateral feet are NOT gold wings.
  // All four lower fan feathers follow their shared fan-root track 5.
  '561':{
   front:{head:[0],left:[3],right:[4],footLeft:[1],footRight:[2],tail:[5,6,7,8,9]},
   back:{head:[0],left:[3],right:[4],footLeft:[1],footRight:[2],tail:[5,6,7,8,9]}
  },
  // FinaleMotion567, checked against the independent wing/leg/tail sheets.
  '567':{
   front:{head:[0],left:[2],right:[3],footLeft:[5],footRight:[4],tail:[6]},
   back:{head:[0],left:[4],right:[3],footLeft:[5],footRight:[6],tail:[7]}
  },
  // Front neck patch 9 belongs to the head group. Tail is part of the torso.
  '580':{
   front:{body:[3],head:[0,1,2,9],left:[5],right:[6],footLeft:[8],footRight:[7]},
   back:{body:[2],head:[0,1],left:[5],right:[4],footLeft:[7],footRight:[6]}
  },
  // Swanna's broad white feathers 8/front and 9/back are wings, not head.
  // Torso track 2 stays fixed; front tail pixels are inseparable from torso.
  '581':{
   front:{body:[2],head:[0,1],left:[7],right:[8],footLeft:[5,6],footRight:[3,4]},
   back:{body:[2],head:[0,1],left:[10],right:[9],footLeft:[5,6],footRight:[7,8],tail:[3,4]}
  },
  // Golurk chest seal 2/front stays on torso; each fist follows its shoulder.
  // Native paired feet are one track in each view, intentionally unsplit.
  '623':{
   front:{body:[1,2],head:[0],left:[4,7],right:[5,6],feet:[3]},
   back:{body:[1],head:[0],left:[3,5],right:[4,6],feet:[2]},
   // Native opaque foot-component bottom contacts. u is horizontal distance
   // from full opaque center / full opaque height; v is height above foot.
   jetAnchors:{front:[[-.22151899,.02531646],[.15822785,0]],back:[[-.1875,.0125],[.13125,0]]}
  },
  // LeagueMotion629, with the visible dark upper legs attached to the feet.
  // Eggshell and collar remain on the body, never masquerading as limbs.
  '629':{
   front:{head:[0,1],left:[8],right:[7],footLeft:[9,11],footRight:[10,12]},
   back:{head:[0,1],left:[6],right:[5],footLeft:[7,9],footRight:[8,10]}
  },
  // Tail plumes are 8/front and 9/back. Back-view far leg is fully occluded;
  // the bone fringe 8/back is part of the waist, not a foot.
  '630':{
   front:{head:[0,1,2,3,4],left:[9],right:[10],footLeft:[11,13],footRight:[12,14],tail:[8]},
   back:{head:[0,1,2,3,4],left:[10],right:[11],footRight:[12,13],tail:[9]}
  },
  // FinaleMotion635. One side head is occluded in back view; no foot track.
  '635':{
   front:{head:[0],headLeft:[3],headRight:[2],wingLeft:[4,5,6],wingRight:[7,8,9],tail:[10]},
   back:{head:[0],headLeft:[2],wingLeft:[3,4,5],wingRight:[6,7,8],tail:[9]}
  },
  // Reshiram neck pieces stay with its face; back track 0 is HEAD, not wing.
  // Leg fur and talons remain articulated as one native limb per side.
  '643':{
   front:{head:[0,1,2,3,4],left:[11,12,13],right:[14,15,16],footLeft:[6,8],footRight:[7,9,10],tail:[17,18,19]},
   back:{head:[0,1,2,3,4,5,6],left:[13,14],right:[15,16,17],footLeft:[8,9],footRight:[10,11,12],tail:[18,19,20,21]}
  },
  // FinaleMotion644, with separate forearm/wing controls and leg groups.
  // Back-view far upper leg is inseparable from the torso and stays there.
  '644':{
   front:{head:[0,1],left:[4],right:[5],wingLeft:[10],wingRight:[11],footLeft:[6,8],footRight:[7,9],tail:[12]},
   back:{head:[0],left:[3,6],right:[2,5],wingLeft:[10],wingRight:[9],footLeft:[8],footRight:[4,7],tail:[11]}
  }
 };
 root.FieldHMFlyAnatomy=anatomy;
 if(typeof module!=='undefined')module.exports=anatomy;
})(typeof window==='undefined'?globalThis:window);
