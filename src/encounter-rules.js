/* IRBI uses a direct zone rate, unlike the climbing rate table in Black 2.
 * Continuous HD-2D movement counts actual distance; blocked movement counts zero.
 */
(function(root){
 class RouteEncounter {
  constructor(rate){this.rate=rate;this.reset()}
  reset(){this.steps=0;this.distance=0}
  advance(distance,inGrass,random){
   if(!Number.isFinite(distance)||distance<=0)return false;
   this.distance+=distance;
   while(this.distance>=1-1e-9){
    this.distance=Math.max(0,this.distance-1);this.steps=Math.min(40960,this.steps+1);
    if(!inGrass)continue;
    const rate=this.steps===1?1:Math.min(100,this.rate);
    // GFL_RandomLC(65535) followed by integer division by 656, inclusive test.
    if(Math.floor(random(65535)/656)<=rate){this.reset();return true}
   }
   return false;
  }
 }
 root.RouteEncounter=RouteEncounter;if(typeof module!=='undefined')module.exports=RouteEncounter;
})(typeof window!=='undefined'?window:globalThis);
