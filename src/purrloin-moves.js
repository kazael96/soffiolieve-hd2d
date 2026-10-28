/* Purrloin: low feline approach, paw swipe and a braced chest for Growl.
 * Whole-composite deformation preserves the original front/back part alignment. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const profiles=Object.freeze(Object.fromEntries([[10,'Graffio',90,43],[45,'Ruggito',106,48]].map(([id,name,frames,impact])=>[id,Object.freeze({species:509,id,name,frames,impact,key:'purrloin-'+id})])));
 function sample(p,f,side='p1',miss=false){const t=clamp(f/p.frames),dir=side==='p1'?1:-1,wind=ease(t/.22)*(1-ease((t-.76)/.24));
  const swipe=p.id===10,advance=ease((t-.2)/.23)*(1-ease((t-.53)/.36)),voice=ease((t-.28)/.12)*(1-ease((t-.69)/.22));
  return {species:509,t,dir,miss,wind,hit:voice,reach:swipe?advance*(miss?.48:.72):0,lift:swipe?.025*Math.sin(Math.PI*advance):0,
   crouch:swipe?.1*wind:-.055*voice,lean:swipe?-.11*wind:.035*Math.sin(t*Math.PI*8)*voice,voice:swipe?0:voice};}
 function part(){return null;}
 function draw(c,W,H,x,f,layer){if(layer!=='front')return;const p=x.profile,a=sample(p,f,x.side,x.miss),l=root.BattleGround.layout(W,H),from=l[x.side],to=l[x.targetSide],body=root.SpeciesMoves.pose(p,f,x.side,x.side,x.miss,l),s=Math.min(W/1000,H/650),h=from.height*body.scale;
  const mouth={x:from.x+body.x*s+a.dir*h*.22,y:from.y+body.y*s-h*.68};c.save();c.lineCap='round';
  if(p.id===10){const q=clamp(1-Math.abs(f-p.impact)/13);if(q){c.globalAlpha=q;c.strokeStyle='#fff0d8';c.lineWidth=Math.max(2,h*.025);const x0=to.x+(x.miss?a.dir*to.height*.8:0),y=to.y-to.height*.55;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x0-a.dir*h*.18+i*h*.07,y-h*.2);c.quadraticCurveTo(x0+i*h*.07,y,x0+a.dir*h*.18+i*h*.07,y+h*.18);c.stroke();}}}
  else if(a.voice>0){c.strokeStyle='#f5d8f9';c.lineWidth=Math.max(2,h*.02);for(let i=0;i<3;i++){const u=((f-29)/25-i*.28)%1;if(u<0)continue;c.globalAlpha=a.voice*(1-u);const radius=h*(.08+u*.3);c.beginPath();c.ellipse(mouth.x+a.dir*u*h*.65,mouth.y,radius*.45,radius,0,a.dir===1?-1.2:Math.PI-1.2,a.dir===1?1.2:Math.PI+1.2);c.stroke();}}
  c.restore();}
 root.PurrloinMoves={profiles,sample,part,draw};if(typeof module!=='undefined')module.exports=root.PurrloinMoves;
})(typeof window!=='undefined'?window:globalThis);
