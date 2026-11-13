/* Native16-unit models composited with VillageRenderer's actual field camera. */
(function(root){
 function matrix(renderer,anchor,scale=1/16){
  const {width:w,height:h}=renderer.canvas;if(![w,h,anchor.x,anchor.y,anchor.height,scale].every(Number.isFinite)||w<=0||h<=0||scale<=0)throw Error('Proiezione del modello di campo non valida');
  const [s,c]=renderer.cameraPitch||[.423,.906],yaw=renderer.yaw||0,cy=Math.cos(yaw),sy=Math.sin(yaw),[x,z]=renderer.center,e=renderer.elevation||0,d=renderer.cameraDistance||65,zoom=renderer.zoom??1.4,pixels=Math.min(w/30,h/21)*zoom,fx=2*pixels/w,fy=2*pixels/h;
  let base=renderer.taskProjection;
  if(!base)base=[fx*cy,-fy*s*sy,-c*sy/180,-c*sy/d,0,fy*c,-s/180,-s/d,-fx*sy,-fy*s*cy,-c*cy/180,-c*cy/d,fx*(-x*cy+z*sy),fy*(-c*e+s*(x*sy+z*cy)),(s*e+c*(x*sy+z*cy))/180,1+(s*e+c*(x*sy+z*cy))/d];
  const result=Array.from(base);for(let col=0;col<3;col++)for(let row=0;row<4;row++)result[col*4+row]=base[col*4+row]*scale;
  for(let row=0;row<4;row++)result[12+row]=base[row]*anchor.x+base[4+row]*anchor.height+base[8+row]*anchor.y+base[12+row];
  if(result.length!==16||!result.every(Number.isFinite))throw Error('Proiezione del modello di campo non valida');return result;
 }
 root.NativeFieldProjection={matrix};if(typeof module!=='undefined')module.exports={matrix};
})(typeof window==='undefined'?globalThis:window);
