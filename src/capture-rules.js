/* Pokémon Black IRBI CheckBallCapture at 0x021cba34 (overlay 93).
 * Opening scope: ordinary grass, Poké Balls, no Pass Powers.
 * Preserve Nitro fx32 rounding instead of rounding the catch rate to an integer.
 */
(function(root){
 const ONE=4096;
 function integerSqrt(value){if(value<2n)return value;let x=1n<<BigInt(Math.ceil(value.toString(2).length/2));for(;;){let y=(x+value/x)>>1n;if(y>=x)return x;x=y}}
 const multiply=(a,b)=>Number((BigInt(a)*BigInt(b)+2048n)>>12n);
 const divide=(a,b)=>Number((((BigInt(a)<<32n)/BigInt(b))+0x80000n)>>20n);
 const sqrt=a=>Number((integerSqrt(BigInt(a)<<32n)+512n)>>10n);
 function rate({hp,maxhp,status=''},catchRate){
  if(!Number.isInteger(maxhp)||maxhp<1||!Number.isInteger(hp)||hp<1||hp>maxhp||!Number.isInteger(catchRate)||catchRate<1||catchRate>255)throw Error('Invalid capture parameters');
  let value=Math.floor((3*maxhp-2*hp)*ONE*catchRate/(3*maxhp));
  if(['slp','frz'].includes(status))value=multiply(value,10240);
  else if(['par','brn','psn','tox'].includes(status))value=multiply(value,6144);
  return value;
 }
 function threshold(value){if(value>=255*ONE)return 65536;return Math.floor(divide(65536*ONE,sqrt(sqrt(divide(255*ONE,value))))/ONE)}
 function roll(mon,catchRate,random,caughtCount=0){
  const value=rate(mon,catchRate),ratio=caughtCount>600?10240:caughtCount>450?8192:caughtCount>300?6144:caughtCount>150?4096:caughtCount>30?2048:0;
  const critical=!!ratio&&random(256)<Math.floor(multiply(Math.min(value,255*ONE),ratio)/6/ONE),checks=critical?1:3;
  if(value>=255*ONE)return{caught:true,shakes:checks,critical,rate:value,threshold:65536};
  const limit=threshold(value);let shakes=0;
  for(;shakes<checks;shakes++)if(random(65536)>=limit)return{caught:false,shakes,critical,rate:value,threshold:limit};
  return{caught:true,shakes,critical,rate:value,threshold:limit};
 }
 root.CaptureRules={rate,threshold,roll};if(typeof module!=='undefined')module.exports=root.CaptureRules;
})(typeof window!=='undefined'?window:globalThis);
