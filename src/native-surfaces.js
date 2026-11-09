/* IRBI Q12 plane evaluation. Physical height stays separate from visual poses. */
(function(root){
 const signed=n=>Number(BigInt.asIntN(32,n)),raw=n=>Math.round(n*65536);
 const mul=(a,b)=>signed((BigInt(a)*BigInt(b)+2048n)>>12n);
 const div=(a,b)=>signed(((BigInt(a)<<32n)/BigInt(b)+524288n)>>20n);
 const decoded=new Map();let ownerSerial=0;
 function retain(token,cache,key,grid){
  decoded.delete(token);decoded.set(token,{cache,key,grid});
  while(decoded.size>64){const [old,row]=decoded.entries().next().value;decoded.delete(old);if(row.cache.get(row.key)===row.grid)row.cache.delete(row.key);}
 }
 function create(data){
  const cache=new Map(),owner=++ownerSerial;
  function grid(member,layer){
   const key=member+':'+layer,token=owner+':'+key;if(cache.has(key)){const v=cache.get(key);retain(token,cache,key,v);return v;}
   const encoded=data.grids[member]?.[layer];if(!encoded)return null;
   const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer),g={view,width:view.getUint16(0,true),depth:view.getUint16(2,true)};
   cache.set(key,g);retain(token,cache,key,g);return g;
  }
  function sample(member,x,z,layer=0,originY=0){
   if(![x,z,originY].every(Number.isFinite))return null;const g=grid(member,layer);if(!g||x<0||z<0||x>=g.width||z>=g.depth)return null;
   const {view,width,depth}=g,ix=Math.floor(x),iz=Math.floor(z),at=4+8*(iz*width+ix),word=view.getUint16(at,true),value=view.getUint16(at+2,true),attributes=view.getUint32(at+4,true),kind=word&3;
   let normalIndex=0,offsetIndex=null;
   if(kind===0){normalIndex=word>>>2;offsetIndex=value;}
   else if(kind===2){
    const aux=4+8*width*depth+value*8;if(aux+8>view.byteLength)throw Error('Riferimento superficie incompleto');
    const fx=raw(x)%65536,fz=raw(z)%65536,first=attributes&0x80000000?fx>fz:fx+fz<65536;
    normalIndex=first?view.getUint16(aux,true)>>>2:view.getUint16(aux+2,true);offsetIndex=view.getUint16(aux+(first?4:6),true);
   }
   const normal=offsetIndex===null?[0,4096,0]:data.normals[normalIndex],plane=offsetIndex===null?0:data.offsets[offsetIndex];
   if(!normal||!normal[1]||!Number.isInteger(plane))throw Error('Piano nativo non valido');
   const [nx,ny,nz]=normal,qx=raw(x-width/2),qz=raw(z-depth/2),numerator=signed(-BigInt(plane+mul(nx,qx)+mul(-nz,qz))),heightRaw=div(numerator,ny)+raw(originY),attrs=attributes&0x7fffffff;
   return {layer,cell:[ix,iz],kind,normalIndex,offsetIndex,heightRaw,height:heightRaw/65536,attributes:attrs,behavior:attrs&65535,flags:attrs>>>16};
  }
  function surfaces(member,x,z,originY=0){return (data.grids[member]||[]).map((_,layer)=>sample(member,x,z,layer,originY)).filter(Boolean);}
  function choose(rows,requestedY){
   if(!rows.length||!Number.isFinite(requestedY))return null;if(rows.length===1)return rows[0];
   let chosen=rows[0],best=0xfff000,requested=raw(requestedY);
   for(const row of rows){if(row.behavior===255)continue;const distance=Math.abs(row.heightRaw-requested);if(distance<best){best=distance;chosen=row;}}
   return chosen;
  }
  function at(zone,x,z,requestedY=0,members=data.scenes[zone]){
   for(const entry of members||[]){const rows=surfaces(entry.member,x-entry.x+16,z-entry.z+16,entry.y);if(rows.length)return choose(rows,requestedY);}
   return null;
  }
  return {sample,surfaces,choose,at,cacheSize:()=>cache.size};
 }
 root.NativeSurfaces={create};
})(typeof window==='undefined'?globalThis:window);
