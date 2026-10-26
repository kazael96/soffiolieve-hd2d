/* IRBI overlay208:021c3740..3912 columns,021c35cc scroll,021c3578 baseline. */
(function(root){
 const f=Math.fround;
 function amplitude(sample,volume){const pcm=Math.max(-128,Math.min(127,Math.trunc(sample*128)));return Math.max(-55,Math.min(55,Math.trunc(Math.trunc(pcm*47*volume/128)/128)));}
 function columns(samples,sampleRate,speed=32768,volume=110){
  const step=f(f(f(f(sampleRate)*f(speed))/f(32768))/f(60))/2,result=[];let cursor=0;
  for(let x=0;cursor<samples.length&&x<960;x++){
   const end=Math.min(samples.length,Math.trunc(f(f(x+1)*f(step))));let low=500,high=-500;
   for(;cursor<end;cursor++){const a=amplitude(samples[cursor],volume);low=Math.min(low,a);high=Math.max(high,a);}
   result.push(low<=high?[low,high]:null);cursor=end+1;
  }return result;
 }
 class Scroll {
  constructor(){this.low=new Int16Array(248);this.high=new Int16Array(248);this.valid=new Uint8Array(248);this.valid.fill(1,0,238);this.source=[];this.cursor=0;}
  play(source){this.source=source;this.cursor=0;}
  advance(frames=1){frames=Math.max(0,Math.floor(frames));if(frames>604){this.cursor=this.source.length;this.low.fill(0);this.high.fill(0);this.valid.fill(0);this.valid.fill(1,0,238);return;}
   for(let frame=0;frame<frames;frame++){
    this.low.copyWithin(0,2);this.high.copyWithin(0,2);this.valid.copyWithin(0,2);this.valid.fill(0,236);
    for(let i=0;i<2;i++){const span=this.cursor<this.source.length?this.source[this.cursor++]:[0,0];if(span){this.low[236+i]=span[0];this.high[236+i]=span[1];this.valid[236+i]=1;}}
   }
  }
  draw(c,x=8,y=16){c.fillStyle='#fff';for(let i=0;i<248;i++)if(this.valid[i])c.fillRect(x+i,y+55-this.high[i],1,this.high[i]-this.low[i]+1);}
 }
 const api={amplitude,columns,Scroll};root.NativeCryGraph=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
