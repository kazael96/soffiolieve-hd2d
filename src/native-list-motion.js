/* IRBI shared frame_list: constant pixel steps and native row-budget ordering. */
(function(root){
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function target(y,max){return Math.floor(max*(clamp(y,12,156)-12)/144);}
 function thumb(first,max){return 12+(max?Math.floor(144*first/max):0);}
 function releaseTier(delta,stable,thresholds){return thresholds[clamp(stable,0,5)].findIndex(n=>Math.abs(delta)>=n);}
 class Motion{
  constructor(config,total,budgets){this.height=config.rowHeight;this.speeds=config.stepPixelsByTier;this.visible=config.visibleRows;this.max=Math.max(0,total-this.visible);this.budgets=budgets;this.first=0;this.position=0;this.framesLeft=0;this.rowsLeft=0;this.moving=false;}
  set(first){this.first=clamp(first,0,this.max);this.position=this.first*this.height;this.framesLeft=0;this.rowsLeft=0;this.moving=false;}
  start(direction,rows,tier=0,inertia=false){if(this.moving)return false;this.direction=Math.sign(direction);this.tier=tier;this.inertia=inertia;const available=this.direction>0?this.max-this.first:this.first;this.rowsLeft=Math.min(Math.max(0,rows),available);this.framesLeft=0;this.moving=this.rowsLeft>0;return this.moving;}
  tick(){if(!this.moving)return false;if(!this.framesLeft){if(!this.rowsLeft){this.moving=false;return false;}if(this.inertia&&this.rowsLeft===1){this.tier++;if(this.tier<6)this.rowsLeft=Math.min(this.budgets[this.tier],this.direction>0?this.max-this.first:this.first);}if(!this.rowsLeft){this.moving=false;return false;}this.step=this.direction*this.speeds[Math.min(5,this.tier)];this.framesLeft=this.height/Math.abs(this.step);this.rowsLeft--;this.position=this.first*this.height;this.first+=this.direction;}
   this.position+=this.step;this.framesLeft--;if(!this.framesLeft&&!this.rowsLeft)this.moving=false;return true;
  }
 }
 const api={target,thumb,releaseTier,Motion};root.NativeListMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
