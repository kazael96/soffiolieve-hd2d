/* QA only: observe completed synchronous classic-script execution. No source rewrite. */
(function(root){
 'use strict';
 if(root.QAExecutedSources064)throw Error('Executed-source observer installed twice');
 const rows=Object.create(null),targets=new Set(['game.js','double-battles.js','pokemon-anim.js','species-moves.js','training-moves.js','demo-moves.js','patrat-moves.js']);
 const append=Element.prototype.append;
 const bindings=()=>({combatant:root.combatant,draw:root.ROM_SPRITE_ANIM?.draw,part:root.SpeciesMoves?.part,pose:root.SpeciesMoves?.pose,chapterSample:root.ChapterMoves?.sample,demoSample:root.DemoMoves?.sample});
 Element.prototype.append=function(...nodes){
  const result=append.apply(this,nodes);
  for(const node of nodes){
   if(node?.nodeName!=='SCRIPT')continue;
   const text=node.textContent||'',at=text.lastIndexOf('\n//# sourceURL=');
   if(at<0)continue;
   const url=text.slice(at+15).trim(),name=new URL(url,location.href).pathname.split('/').at(-1);
   if(!targets.has(name))continue;
   if(rows[name])throw Error('Transported source executed twice: '+name);
   const refs=bindings(),functions=Object.fromEntries(Object.entries(refs).filter(([,value])=>typeof value==='function').map(([key,value])=>[key,value.toString()]));
   rows[name]={source:text.slice(0,at),url,functions,refs};
  }
  return result;
 };
 root.QAExecutedSources064={rows,scope:'Bindings sampled immediately after synchronous script append returns, before later transported modules can wrap them. Refs remain available for identity checks. Isolated QA only.'};
})(window);
