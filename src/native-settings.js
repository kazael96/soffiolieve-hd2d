/* Persistent BW options. Browser-only controls remain separate from game options. */
(function(root){
  const KEY='soffiolieve-native-options-v1',defaults={textSpeed:2,animations:true,battleStyle:'switch',sound:'stereo'};
  const functions=['pokemon','pokedex','bag','trainer','save','options','item:442','summary:info','summary:moves','summary:ribbons','trainer:back','pokedex:search','pokedex:info','pokedex:zona','pokedex:verso','pokedex:forme'];
  function normalize(v={}){return {textSpeed:[1,2,3].includes(v.textSpeed)?v.textSpeed:2,animations:v.animations!==false,battleStyle:v.battleStyle==='set'?'set':'switch',sound:v.sound==='mono'?'mono':'stereo',...(typeof v.autoSaveIR==='boolean'?{autoSaveIR:v.autoSaveIR}:{}),...(Array.isArray(v.registered)?{registered:[...new Set(v.registered.filter(id=>functions.includes(id)))].slice(0,25)}:{})};}
  let state;try{state=typeof document==='undefined'?{...defaults}:normalize(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch{state={...defaults};}
  function set(changes){state=normalize({...state,...changes});try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}root.AudioEngine?.setMono(state.sound==='mono');return state;}
  function message(element,text){
    let cursor=0,timer=null,done=false;const step=()=>{cursor=Math.min(text.length,cursor+(state.textSpeed===3?4:state.textSpeed===2?2:1));element.textContent=text.slice(0,cursor);done=cursor===text.length;if(!done)timer=setTimeout(step,1000/30);};
    element.textContent='';step();return {get done(){return done;},finish(){clearTimeout(timer);done=true;element.textContent=text;},cancel(){clearTimeout(timer);}};
  }
  root.NativeSettings={get state(){return state;},set,normalize,message};
  if(typeof module!=='undefined')module.exports={normalize};
})(typeof window!=='undefined'?window:globalThis);
