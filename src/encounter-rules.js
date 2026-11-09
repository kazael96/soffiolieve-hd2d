/* IRBI uses a direct zone rate, unlike the climbing rate table in Black 2.
 * Continuous HD-2D movement counts actual distance; blocked movement counts zero.
 */
(function(root){
 class RouteEncounter {
  // IRBI021aa25c: attributes mask0x4 enables encounters, mask0x2 selects water.
  // 021ab000 rejects the invalid behavior255 before either table is used.
  static terrain(behavior,flags,surfing=false){return Number.isInteger(behavior)&&behavior>=0&&behavior!==255&&Number.isInteger(flags)&&!!(flags&4)&&!!(flags&2)===surfing;}
  constructor(rate){this.rate=rate;this.reset()}
  reset(){this.steps=0;this.distance=0}
  advance(distance,inGrass,random){
   if(!Number.isFinite(distance)||distance<=0)return false;
   this.distance+=distance;
   while(this.distance>=1-1e-9){
    this.distance=Math.max(0,this.distance-1);this.steps=Math.min(40960,this.steps+1);
    if(!inGrass||!(this.rate>0))continue;
    const rate=this.steps===1?1:Math.min(100,this.rate);
    // GFL_RandomLC(65535) followed by integer division by 656, inclusive test.
    if(Math.floor(random(65535)/656)<=rate){this.reset();return true}
   }
   return false;
  }
 }
 root.RouteEncounter=RouteEncounter;if(typeof module!=='undefined')module.exports=RouteEncounter;
})(typeof window!=='undefined'?window:globalThis);
