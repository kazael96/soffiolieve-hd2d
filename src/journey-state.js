/* Small, versioned save format. No transient laboratory/battle state is stored. */
(function (root) {
  const KEY = 'soffiolieve-demo-v2';
  const LEGACY_KEY = 'soffiolieve-journey-v1';
  const starters = ['Snivy', 'Tepig', 'Oshawott'];
  const finite = (value, fallback, min, max) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  function fresh() { return {version:2,
    player:{x:-2,y:0}, facing:3, starter:'Snivy', hp:null, status:'', pp:[], potions:3,
    zoom:1.4, cinema:true, touch:false}; }
  function normalize(value) {
    if (!value || ![1,2].includes(value.version)) return null;
    const state = fresh();
    state.player = {x:finite(value.player?.x,-2,-11.4,7.4),y:finite(value.player?.y,0,-25.3,9.2)};
    state.facing = [0,3,6,9].includes(value.facing) ? value.facing : 3;
    state.starter = starters.includes(value.starter) ? value.starter : 'Snivy';
    state.hp = Number.isInteger(value.hp) ? finite(value.hp,null,0,999) : null;
    state.status = ['par','brn','psn','tox','slp','frz'].includes(value.status) ? value.status : '';
    state.pp = Array.isArray(value.pp) ? value.pp.filter(m => Number.isInteger(m?.id) && Number.isInteger(m?.left))
      .slice(0,4).map(m => ({id:m.id,left:finite(m.left,0,0,99)})) : [];
    state.potions = Math.floor(finite(value.potions,3,0,3));
    state.zoom = finite(value.zoom,1.4,.9,2);
    state.cinema = value.cinema !== false;
    state.touch = value.touch === true;
    return state;
  }
  function read(storage) {
    try {
      // Import exploration data only; the removed custom chapter is not story progress.
      // Leave the original v0.9 record untouched for recovery.
      const raw = storage.getItem(KEY) ?? storage.getItem(LEGACY_KEY);
      if (!raw) return {state:fresh(), restored:false};
      const state = normalize(JSON.parse(raw));
      return state ? {state,restored:true} : {state:fresh(),restored:false,error:'invalid'};
    } catch (error) { return {state:fresh(),restored:false,error:error instanceof SyntaxError?'invalid':'unavailable'}; }
  }
  function write(storage, state) {
    try { storage.setItem(KEY, JSON.stringify(normalize(state))); return true; }
    catch { return false; }
  }
  const api = {KEY, LEGACY_KEY, starters, fresh, normalize, read, write};
  root.JourneyState = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
