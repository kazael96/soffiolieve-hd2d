/* IRBI Castelia map635 contains w_gra, c3_sky2 and c3_billboard: the
 * enclosing gradient/skyline shell, not a walkable building facade.
 * Keep its geometry/materials and self-depth, then clear only its depth
 * before drawing physical maps/actors. This is the HD-2D backdrop pass. */
(function(root){
 function matches(scene,instance){return scene?.zone===28&&instance?.model==='pw-map-635';}
 function draw(renderer,instances){const list=instances.filter(ins=>matches(renderer.scene,ins));if(!list.length)return false;
  const g=renderer.gl;g.uniform1f(renderer.loc.uSprite,0);g.uniform1f(renderer.loc.uShadow,0);g.uniform1f(renderer.loc.uCutawayKind,0);g.uniform1f(renderer.loc.uExitEnabled,0);
  for(const ins of list){if(renderer.fieldModels?.replaces(ins)){renderer.fieldModels.draw(ins);continue;}
   g.uniform3f(renderer.loc.uOffset,ins.x,ins.y,ins.z);g.uniform2f(renderer.loc.uRotation,Math.cos(ins.rotation),Math.sin(ins.rotation));
   for(const group of renderer.models[ins.model]){if(group.doubleSided===false){g.enable(g.CULL_FACE);g.cullFace(g.BACK);}else g.disable(g.CULL_FACE);renderer.bind(group.buf);renderer.texture(renderer.cache[group.texture]||renderer.white,group.repeatS,group.repeatT,group.mirrorS,group.mirrorT);g.uniform1f(renderer.loc.uAlpha,group.alpha??1);g.drawArrays(g.TRIANGLES,0,group.count);}
  }
  g.depthMask(true);g.clear(g.DEPTH_BUFFER_BIT);g.disable(g.CULL_FACE);return true;
 }
 const api={matches,draw};root.FieldBackdrops=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
