/* IRBI overlay94,02205668: the PP palette boundaries are deliberately discrete. */
(function(root){
 function ppState(left,max){
   if(left===max)return 'normal';if(left===0)return 'zero';
   if(max<=2)return 'quarter';
   if(max<=7)return left===1?'quarter':left===2?'half':'normal';
   return left<=Math.floor(max/4)?'quarter':left<=Math.floor(max/2)?'half':'normal';
 }
 root.NativeBattleRules={ppState};if(typeof module!=='undefined')module.exports={ppState};
})(typeof window!=='undefined'?window:globalThis);
