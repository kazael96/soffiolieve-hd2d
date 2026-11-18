/* Three independent browser adventures. Slot 1 keeps the legacy bytes in place. */
(function(root){
 'use strict';
 const LEGACY='soffiolieve-black-opening-v2',SESSION='soffiolieve-save-slot-v1';
 const valid=n=>Number.isInteger(n)&&n>=1&&n<=3;
 function session(){try{return root.sessionStorage;}catch{return null;}}
 function token(){try{const v=JSON.parse(session()?.getItem(SESSION)||'null');return valid(v?.slot)?v:null;}catch{return null;}}
 const initial=token(),active=initial?.slot||1;
 let problem='',blocked=false;
 function key(slot=active){if(!valid(slot))throw Error('Invalid save slot');return slot===1?LEGACY:LEGACY+'-slot'+slot;}
 function select(slot){
  if(!valid(slot))return false;
  try{const value=JSON.stringify({slot,menu:true}),s=session();s.setItem(SESSION,value);return s.getItem(SESSION)===value;}catch{return false;}
 }
 function consumeMenu(){
  const v=token();if(!v?.menu||v.slot!==active)return false;
  try{const s=session(),value=JSON.stringify({slot:active});s.setItem(SESSION,value);return s.getItem(SESSION)===value;}catch{return false;}
 }
 function wrap(storage){
  let observed=false,expected;
  const current=()=>storage.getItem(key());
  function check(){
   if(blocked||!observed){problem=problem||'unavailable';throw Error('Save not readable');}
   if(current()!==expected){problem='changed';throw Error('Save changed in another tab');}
  }
  return {
   getItem(name){
    if(name!==LEGACY)return storage.getItem(name);
    try{const raw=current();if(!observed){expected=raw;observed=true;}return raw;}
    catch(error){blocked=true;problem='unavailable';throw error;}
   },
   setItem(name,value){
    if(name!==LEGACY)return storage.setItem(name,value);
    check();storage.setItem(key(),value);if(current()!==String(value))throw Error('Save write was not retained');expected=String(value);problem='';
   },
   removeItem(name){
    if(name!==LEGACY)return storage.removeItem(name);
    check();storage.removeItem(key());if(current()!==null)throw Error('Save deletion was not retained');expected=null;problem='';
   }
  };
 }
 root.SaveSlots={active,key,select,consumeMenu,wrap,get blocked(){return blocked;},get problem(){return problem;}};
})(typeof window==='undefined'?globalThis:window);
