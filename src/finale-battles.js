/* First-ending geographic compositions: native rooms behind a clear HD-2D arena.
 * Contact datums/materials sampled from IRBI553–556/585. This adapts the field
 * geometry, rather than claiming to reproduce the original DS battle camera. */
(function(root){
 const contexts={
  shauntalRoom:{zone:140,origin:[-.5,-6.5],height:14.003402709960938,floor:'fn-map-553-c09_01_yuka',sky:['#080c0e','#1e3535']},
  grimsleyRoom:{zone:141,origin:[-.5,-6.5],height:10.002426147460938,floor:'fn-prop-False-51-116-c09_04_14',sky:['#130e09','#4a3523']},
  marshalRoom:{zone:142,origin:[-.5,-4.5],height:18.004379272460938,floor:'fn-prop-False-52-125-c09_03_ring21',sky:['#080d15','#26374d']},
  caitlinRoom:{zone:143,origin:[-.5,-6.5],height:18.004379272460938,floor:'fn-map-556-c09_04_nuno',sky:['#171206','#514529']},
  castleThrone:{zone:278,origin:[.5,26.5],height:0,floor:'fn-map-585-n_yuka5',sky:['#12232b','#5c8a8b']}
 };
 const labels={140:'Sala di Antemia',141:'Sala di Mirton',142:'Sala di Marzio',143:'Sala di Catlina',278:'Castello di N · sala del trono'};
 if(!root.OpelucidBattles||!root.PinwheelBattles)throw Error('Compositore geografico del finale non disponibile');
 for(const c of Object.values(contexts))Object.assign(c,{back:25,cutoff:-21,indoor:true,source:'IRBI native room geometry, contact floor and clear HD-2D battle arena'});
 Object.assign(root.OpelucidBattles.contexts,contexts);Object.assign(root.PinwheelBattles.contexts,contexts);
 const floors=new Set(Object.values(contexts).map(c=>c.floor)),oldGround=root.OpelucidBattles.isGround;
 root.OpelucidBattles.isGround=name=>floors.has(name)||oldGround(name);
 const byZone=new Map(Object.entries(contexts).map(([id,c])=>[c.zone,id]));
 root.FINALE_FIELD={context(zone){const id=byZone.get(zone);return id?{id,label:labels[zone],terrain:'interior'}:null;},music:zone=>root.FINALE_EVENTS?.zones?.[zone]?.music??null};
 root.FinaleBattles={contexts,has:id=>Object.hasOwn(contexts,id)};
})(typeof window==='undefined'?globalThis:window);
