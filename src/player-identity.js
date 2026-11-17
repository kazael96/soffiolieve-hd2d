/* Player-facing identity is separate from the stable native/battle key Alcide. */
(function(root){
 'use strict';
 const defaults=Object.freeze({M:'Alcide',F:'Anita'}),nameLimit=7,legacyNameLimit=10;
 const femaleKeys=Object.freeze({Alcide:'Anita',AlcideBike:'AnitaBike',AlcideSurf:'AnitaSurf'});
 const state=value=>value&&typeof value==='object'?value:root.Journey?.state||{};
 const gender=value=>typeof value==='string'?(value==='F'?'F':'M'):(state(value).playerGender==='F'?'F':'M');
 function normalizeName(value,{gender:sex='M',maxLength=legacyNameLimit}={}){
  const limit=Number.isInteger(maxLength)&&maxLength>0?Math.min(legacyNameLimit,maxLength):legacyNameLimit;
  const text=typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim():'';
  return [...text].slice(0,limit).join('')||defaults[gender(sex)];
 }
 function normalizeState(value,{fresh=false}={}){
  const saved=value&&typeof value==='object'?value:{},sex=gender(saved);
  return {playerName:normalizeName(saved.playerName,{gender:sex}),playerGender:sex,
   introductionComplete:typeof saved.introductionComplete==='boolean'?saved.introductionComplete:!fresh};
 }
 const name=value=>{const current=state(value);return normalizeName(current.playerName,{gender:gender(current)});};
 function spriteKey(logicalName='Alcide',value){
  return gender(value)==='F'&&femaleKeys[logicalName]?femaleKeys[logicalName]:logicalName;
 }
 function frames(logicalName='Alcide',value){
  const key=spriteKey(logicalName,value);
  return root.PLAYER_ASSETS?.sprites?.[key]||root.OPENING_SPRITES?.[key]||
   root.ROM_SPRITES?.[key]||root.SURF_FIELD_ASSETS?.sprites?.[key]||null;
 }
 function portraitFrames(logicalName='Alcide',value){
  const key=spriteKey(logicalName,value);
  return root.PLAYER_ASSETS?.portraits?.[key]||root.PHONE_ASSETS?.portraits?.[key]||
   root.ROUTE2_PHONE?.portraits?.[key]||root.CASTELIA_PHONE?.portraits?.[key]||
   root.NIMBASA_PHONE?.portraits?.[key]||root.ICIRRUS_PHONE?.portraits?.[key]||
   root.OPELUCID_PHONE?.portraits?.[key]||null;
 }
 const displayName=(logicalName='Alcide',value)=>logicalName==='Alcide'?name(value):logicalName;
 function trainerCard(value){
  const sex=gender(value),suffix=sex==='F'?'Female':'Male';
  return {front:'front'+suffix+'Rank0',back:'back'+suffix+'Rank0',avatar:'avatar'+suffix+'Rank0'};
 }
 function introIcon(value){
  const sex=gender(value),key=defaults[sex];
  return root.PLAYER_ASSETS?.intro?.[key]||root.PLAYER_ASSETS?.portraits?.[key]?.[0]||
   frames(key,{playerGender:sex})?.[0]||null;
 }
 const api={defaults,nameLimit,legacyNameLimit,battleKey:'Alcide',normalizeName,normalizeState,gender,name,
  spriteKey,frames,portraitFrames,displayName,trainerCard,introIcon,
  defaultName:value=>defaults[gender(value)],get key(){return gender();}};
 root.PlayerIdentity=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

