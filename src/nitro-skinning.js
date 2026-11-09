/* Preserve triangle order while fitting native skeletons into mobile palettes. */
(function(root){
 function batches(indices,joints,weights,limit=24){
  if(!Number.isInteger(limit)||limit<1||indices.length%3)throw Error('Palette scheletrica non valida');
  const result=[];let current=[],palette=new Set();
  const finish=()=>{if(current.length)result.push({indices:current,palette:[...palette]});current=[];palette=new Set();};
  for(let at=0;at<indices.length;at+=3){const triangle=indices.slice(at,at+3),used=new Set();
   for(const vertex of triangle){if(!joints[vertex]||!weights[vertex])throw Error('Vertice scheletrico mancante');for(let k=0;k<4;k++)if(weights[vertex][k]>0){const joint=joints[vertex][k];if(!Number.isInteger(joint)||joint<0)throw Error('Giunto scheletrico non valido');used.add(joint);}}
   if(used.size>limit)throw Error('Un triangolo supera la palette scheletrica');
   if(new Set([...palette,...used]).size>limit)finish();for(const joint of used)palette.add(joint);current.push(...triangle);
  }
  finish();return result;
 }
 const api={batches};root.NitroSkinning=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
