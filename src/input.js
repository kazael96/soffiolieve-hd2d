/* Keyboard and pointer inputs stay independent, including multi-touch holds. */
(function (root) {
  const codeKeys = {KeyW:'w', KeyA:'a', KeyS:'s', KeyD:'d',
    ArrowUp:'ArrowUp', ArrowDown:'ArrowDown', ArrowLeft:'ArrowLeft', ArrowRight:'ArrowRight',
    ShiftLeft:'Shift', ShiftRight:'Shift', KeyB:'Shift'};
  function keyName(event) {
    if (codeKeys[event.code]) return codeKeys[event.code];
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift'].includes(event.key)) return event.key;
    if(/^b$/i.test(event.key||''))return 'Shift';
    return /^[wasd]$/i.test(event.key || '') ? event.key.toLowerCase() : null;
  }
  function create() {
    const keyboard = new Map(), pointers = new Map();
    return {
      keyDown(event) { const key = keyName(event); if (key) keyboard.set(event.code || event.key, key); },
      keyUp(event) {
        keyboard.delete(event.code || event.key);
        if (!event.code) for (const [id, key] of keyboard) if (key === keyName(event)) keyboard.delete(id);
      },
      pointerDown(id, key) { pointers.set(id, key); },
      pointerUp(id) { pointers.delete(id); },
      reset() { keyboard.clear(); pointers.clear(); },
      state() { return Object.fromEntries([...keyboard.values(), ...pointers.values()].map(key => [key, true])); },
    };
  }
  function attach({target, document, buttons, enabled}) {
    const input = create();
    const clear = input.reset;
    input.reset = () => { clear(); for (const button of buttons) button.classList.remove('held'); };
    target.addEventListener('keydown', event => {
      if (!enabled() || event.ctrlKey || event.metaKey || event.altKey ||
          event.target.closest?.('input,select,textarea,[contenteditable="true"]')) return;
      if (keyName(event)) { event.preventDefault(); input.keyDown(event); }
    });
    target.addEventListener('keyup', event => input.keyUp(event));
    target.addEventListener('blur', () => input.reset());
    document.addEventListener('visibilitychange', () => { if (document.hidden) input.reset(); });
    for (const button of buttons) {
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (!enabled()) return;
        button.setPointerCapture(event.pointerId);
        input.pointerDown(event.pointerId, button.dataset.key);
        button.classList.add('held');
      });
      for (const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name, event => {
        input.pointerUp(event.pointerId);
        button.classList.remove('held');
      });
    }
    return input;
  }
  const api = {create, attach, keyName};
  root.VillageInput = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
