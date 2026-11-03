/* Original graphic identity is separate from species mechanics and cries.
 * Gen V seasons: 0 spring, 1 summer, 2 autumn, 3 winter. Gender stays on mon. */
(function(root){
 const seasons=['Spring','Summer','Autumn','Winter'],ids={deerling:585,sawsbuck:586,unfezant:521,frillish:592};
 const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 function form(mon={}){
  const name=clean(mon.name||mon.species||mon.speciesName),suffix=seasons.findIndex(s=>name.endsWith(s.toLowerCase()));
  if(suffix>=0)return suffix;
  const value=mon.form??mon.season;
  if(value===undefined){const id=+mon.id;if(id>=701&&id<=703)return id-700;if(id>=704&&id<=706)return id-703;}
  if(Number.isInteger(+value)&&+value>=0&&+value<=3)return +value;
  return Math.max(0,seasons.findIndex(s=>s.toLowerCase()===String(value||'').toLowerCase()));
 }
 function speciesId(value){
  if(value&&typeof value==='object')return speciesId(value.speciesId)||speciesId(value.id)||speciesId(value.name||value.species);
  const n=Number(value);if(n>=701&&n<=703)return 585;if(n>=704&&n<=706)return 586;if(n===699)return 550;
  if(Number.isFinite(n)&&n>0)return Object.values(root.ROM_FORM_SPRITES||{}).find(f=>f.graphic===n)?.species||n;
  const s=clean(value);if(s.startsWith('521female'))return 521;if(s.startsWith('592female'))return 592;
  if(s.startsWith('basculin'))return 550;
  for(const [name,id]of Object.entries(ids))if(s.startsWith(name))return id;
  return root.ROM_FORM_SPRITES?.[s]?.species||Object.values(root.ROM_FORM_SPRITES||{}).find(f=>f.graphic===value)?.species||(root.GEN5?.species||root.ROM_BATTLE?.species||[]).find(p=>[p.name,p.en].some(n=>n&&clean(n)===s))?.id||0;
 }
 function graphic(mon={}){
  if(typeof mon!=='object')mon={id:mon};
  const name=clean(mon.name||mon.species||mon.speciesName),native=root.ROM_FORM_SPRITES?.[name],id=speciesId(mon)||native?.species;
  if(id===585||id===586){const f=form(mon);return f?(id===585?700:703)+f:id;}
  if((id===521||id===592)&&String(mon.gender||'').toUpperCase()==='F')return id+'-female';
  return native?.graphic||mon.id||id;
 }
 function identity(mon){const id=speciesId(mon),f=form(mon);return {speciesId:id,graphic:graphic(mon),...(id===585||id===586?{form:f}:{}),...(mon.gender?{gender:mon.gender}:{})};}
 const menuId=mon=>{const key=graphic(mon);return typeof key==='number'?key:speciesId(key);};
 const portraitSrc=(mon,back=false)=>'assets/pokemon/'+graphic(mon)+'-'+(back?'back':'front')+'.png';
 function appearance(name,options={}){
  const base=root.TRAINING_DATA?.progression?.[name]?.dexName||name,stored=root.Journey?.state?.dex?.appearances?.[base],party=root.Journey?.state?.party?.find(p=>(root.TRAINING_DATA?.progression?.[p.name]?.dexName||p.name)===base),mon=options.pokemon||party||stored||{},id=root.POKEDEX_ASSETS?.species?.[base]?.id||speciesId(name);
  return {...mon,name:mon.name||name,id,...(options.gender!==undefined?{gender:options.gender}:{}),...(options.form!==undefined?{form:options.form}:{})};
 }
 const api={graphic,speciesId,form,identity,menuId,portraitSrc,appearance,seasons};root.PokemonVisuals=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
