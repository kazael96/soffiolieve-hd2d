/* Select authored ROM phases from the observed Gen V battle event. */
(function(root){
 const labels={311:['Normale','Sole · Fuoco','Grandine · Ghiaccio','Sabbia · Roccia','Pioggia · Acqua'],546:['Senza modulo','Idromodulo · Acqua','Voltmodulo · Elettro','Piromodulo · Fuoco','Gelomodulo · Ghiaccio'],290:['Botta sul terreno · Corposcontro','Sabbia · Fangosberla','Palude · Fanghiglia','Neve · Slavina','Ghiaccio · Geloscheggia','Acqua · Idropulsar','Roccia · Sassata','Vegetazione · Pugnospine'],174:['Altri tipi','Tipo Spettro'],217:['Danno','Cura'],168:['Senza furto','Strumento rubato'],343:['Senza furto','Strumento rubato'],280:['Senza barriere','Barriere presenti'],117:['Accumulo','Rilascio'],248:['Previsione','Impatto'],353:['Preparazione','Impatto'],558:['Normale','Combinazione'],559:['Normale','Combinazione','Inquadratura finale']};
 function choose(move,context={}){let phase=context.phase??0,weather=String(context.weather||'').toLowerCase(),item=String(context.item||'').toLowerCase().replace(/[^a-z]/g,''),lines=context.events||[],has=kind=>lines.some(e=>e.kind===kind),steal=lines.some(e=>e.kind==='-item'&&e.args.some(a=>/thief|covet/i.test(a)));
  if(context.phase===undefined){
   if(context.chargeMove)phase=context.preparing?0:1;
   if(move.id===311)phase=({sunnyday:1,raindance:4,sandstorm:3,hail:2})[weather]||0;
   if(move.id===546)phase=({dousedrive:1,shockdrive:2,burndrive:3,chilldrive:4})[item]||0;
   if(move.id===290)phase=Math.max(0,Math.min(7,context.terrain??0));
   if(move.id===174)phase=context.types?.some(t=>/ghost|spettro/i.test(t))?1:0;
   if(move.id===217)phase=has('-heal')?1:0;
   if([168,343].includes(move.id))phase=steal?1:0;
   if(move.id===280)phase=context.screens?1:0;
   if(move.id===117)phase=context.releasing?1:0;
   if([248,353].includes(move.id))phase=context.impact?1:0;
   if([558,559].includes(move.id))phase=context.combo?1:0;
  }
  let phaseMap=move.phaseMap||move.variants.map((_,i)=>i);phase=Math.max(0,Math.min(phase,phaseMap.length-1));return{phase,variant:phaseMap[phase]??0,layout:context.layout??0,labels:labels[move.id]};
 }
 root.BattleContext={choose,labels};if(typeof module!=='undefined')module.exports=root.BattleContext;
})(typeof window!=='undefined'?window:globalThis);
