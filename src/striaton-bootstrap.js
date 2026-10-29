/* Original Striaton gym, school, Fennel house and Dreamyard chapter. */
(()=>{
 if(!window.STRIATON_ASSETS)return;
 Object.assign(OPENING_ASSETS.models,STRIATON_ASSETS.models);Object.assign(OPENING_ASSETS.textures,STRIATON_ASSETS.textures);Object.assign(OPENING_DATA,STRIATON_DATA.pokemonData);
 for(const z of [7,9,10,15,152])OPENING_ASSETS.scenes['zone'+z]={...STRIATON_ASSETS.scenes[z],chapter040:true,outdoor:z===152};
 for(const [id,paths]of Object.entries(STRIATON_ASSETS.sprites))OPENING_SPRITES[{74:'Zania',85:'Spighetto',178:'Chicco',179:'Maisello',126:'Munna',127:'Musharna'}[id]||'Original'+id]??=paths;
 if(window.OPENING_GESTURES)OPENING_GESTURES.Spighetto={steps:[[7,4],[8,8],[7,4],[2,4]],source:'IRBI billboard poses 7/8; HD-2D bow timing'};
 // Folded HD-2D cloth; native room and type-button floor remain unchanged.
 const curtain=(key,rgb)=>{const verts=[];for(let strip=0;strip<28;strip++){const x0=strip/4,x1=(strip+1)/4,z0=Math.cos(strip*Math.PI/2)*.07,z1=Math.cos((strip+1)*Math.PI/2)*.07,shade=.82+.18*Math.sin((strip+.5)*Math.PI/2),color=rgb.map(v=>v*shade);for(const n of [0,1,2,2,1,3])verts.push(n%2?x1:x0,n>=2?3:0,n%2?z1:z0,0,0,...color,0,0,1);}OPENING_ASSETS.models[key]={groups:[{verts,repeatS:false,repeatT:false}]};};
 for(const [i,color]of [[1,[.7,.15,.12]],[2,[.12,.45,.8]],[3,[.2,.65,.25]]]){curtain('gym-curtain-'+i,color);OPENING_ASSETS.scenes.zone7.instances.push({model:'gym-curtain-'+i,x:-7,y:0,z:28.5-i*10,rotation:0,curtainStage:i});}
})();
