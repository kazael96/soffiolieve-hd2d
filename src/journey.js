/* A short village chapter, with optional battles and local autosave. */
(() => {
  let storage;
  try { storage = window.localStorage; } catch { storage = null; }
  const loaded = JourneyState.read(storage);
  const state = loaded.state;
  let lastSave = '', pending = null;
  // Never place a restored player inside an obstacle or outside the walkable grid.
  if (!blocked(state.player.x-.18,state.player.y-.18) && !blocked(state.player.x+.18,state.player.y+.18)) {
    player = {...state.player};
  }
  facing = state.facing;
  partner = makeMon(state.starter);
  if (state.hp !== null) partner.hp = Math.min(partner.max, state.hp);
  partner.status = state.status;
  for (const move of partner.moves) {
    const saved = state.pp.find(entry => entry.id === move.id);
    if (saved) move.left = Math.min(move.pp, saved.left);
  }
  potions = state.potions;
  renderer.zoom = state.zoom;
  renderer.cinema = state.cinema;
  $('zoomValue').value = Math.round(renderer.zoom*100)+'%';
  $('touchPreference').checked = state.touch;
  $('focusPreference').checked = !state.cinema;
  document.body.classList.toggle('touch-enabled',state.touch);
  refresh();

  function update() {
    const count = Number(state.visits.Belle)+Number(state.visits.Komor)+Number(state.complete);
    $('questSummary').textContent = state.complete ? 'Primo incontro completato' : JourneyState.objective(state);
    $('questCount').textContent = count+'/3';
    $('questObjective').textContent = JourneyState.objective(state);
    for (const name of ['Belle','Komor','Aralia']) {
      const done = name === 'Aralia' ? state.complete : state.visits[name];
      $('visit'+name).textContent = done ? 'Incontro completato' : 'Da incontrare';
      $('visit'+name).parentElement.classList.toggle('done',done);
    }
  }
  function save(force = false) {
    if (battling) return;
    Object.assign(state,{player:{...player},facing,starter:partner.name,hp:partner.hp,status:partner.status,
      pp:partner.moves.map(m=>({id:m.id,left:m.left})),potions,zoom:renderer.zoom,cinema:renderer.cinema});
    const encoded = JSON.stringify(state);
    if (!force && encoded === lastSave) return;
    if (JourneyState.write(storage,state)) {
      lastSave = encoded;
      $('saveStatus').textContent = 'Progressi salvati su questo dispositivo';
    } else $('saveStatus').textContent = 'Salvataggio non disponibile: i progressi durano solo in questa sessione.';
  }
  function heal() {
    partner = makeMon(partner.name);
    potions = 3;
    refresh();
    save();
  }
  function openJournal() {
    if (battling || menuOpen()) return;
    resetInput(); update(); save();
    $('journal').showModal();
  }
  const conversations = {
    Belle: ['Il vento di casa', 'Il mare, il sentiero… oggi anche Soffiolieve sembra diversa! Komor ti aspetta a est. Poi passiamo da Aralia, davanti al laboratorio. Se vuoi, prima possiamo allenarci insieme.'],
    Komor: ['Un passo alla volta', 'Prima di partire, impariamo a conoscere il nostro compagno. Le lotte aiutano, ma non serve avere fretta. Saluta anche Belle, poi raggiungiamo Aralia a nord-ovest.'],
    Aralia: ['Il tuo primo incontro', 'Un viaggio comincia dalle persone che conosci. Parla con Belle e Komor, poi torna da me. Intanto mi prenderò cura del tuo Pokémon.'],
  };
  function talk(name) {
    if (battling || menuOpen()) return;
    resetInput();
    const [title, text] = conversations[name];
    $('speakerName').textContent = name;
    $('dialogueTitle').textContent = title;
    $('dialogueText').textContent = name === 'Aralia' && state.visits.Belle && state.visits.Komor
      ? 'Avete fatto il primo passo insieme. Ricordatevi di ascoltare il vostro compagno e di tornare a riposare. Il vostro primo incontro è completo: Soffiolieve sarà sempre casa vostra.' : text;
    $('dialoguePortrait').src = 'assets/characters/'+name+'-3.png';
    $('dialoguePortrait').alt = name;
    $('dialogueBattle').hidden = name === 'Aralia';
    $('dialogueBattle').textContent = 'Allenati con '+name;
    $('dialogueContinue').textContent = name === 'Aralia' ? 'Grazie, Aralia' : 'A presto!';
    pending = name;
    $('dialogue').showModal();
  }
  function finishConversation(battle = false) {
    if (!pending) return;
    const name = pending;
    pending = null;
    const wasComplete = state.complete;
    JourneyState.meet(state,name);
    $('dialogue').close();
    resetInput();
    if (name === 'Aralia') heal();
    update(); save();
    if (!wasComplete && state.complete) toast('Il tuo primo incontro è completo. Bentornato a Soffiolieve!');
    else if (name === 'Aralia') toast('Aralia ha ripristinato PS, PP e pozioni.');
    if (battle) { rival=name; startBattle(true); }
  }
  $('dialogueContinue').onclick = () => finishConversation();
  $('dialogueBattle').onclick = () => finishConversation(true);
  $('dialogue').addEventListener('cancel', () => { pending=null; });
  for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('close',resetInput);
  $('openJournal').onclick = openJournal;
  $('closeJournal').onclick = () => $('journal').close();
  $('saveNow').onclick = () => save(true);
  $('touchPreference').onchange = () => {
    state.touch = $('touchPreference').checked;
    document.body.classList.toggle('touch-enabled',state.touch);
    resetInput(); save(true);
  };
  $('focusPreference').onchange = () => {
    renderer.cinema = !$('focusPreference').checked;
    save(true);
  };
  $('resetJourney').onclick = () => {
    $('resetConfirmation').hidden = false;
    $('cancelReset').focus();
  };
  $('cancelReset').onclick = () => { $('resetConfirmation').hidden = true; };
  $('confirmReset').onclick = () => {
    Object.assign(state,JourneyState.fresh());
    player={x:-2,y:0}; facing=3; partner=makeMon('Snivy'); potions=3;
    renderer.zoom=1.4; renderer.cinema=true;
    $('zoomValue').value='140%'; $('touchPreference').checked=false; $('focusPreference').checked=false;
    document.body.classList.remove('touch-enabled');
    $('resetConfirmation').hidden=true; resetInput(); refresh(); update(); save(true);
    $('journal').close(); toast('Un nuovo inizio a Soffiolieve.');
  };
  addEventListener('pagehide', () => save());
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  setInterval(() => save(),5000);
  window.Journey = {talk,save,heal,openJournal};
  update();
  $('saveStatus').textContent = loaded.error ? 'Salvataggio non leggibile o non disponibile. Una nuova sessione è pronta.'
    : loaded.restored ? 'Progressi ripresi da questo dispositivo' : 'Salvataggio automatico ogni 5 secondi, fuori dalle lotte';
  if (loaded.restored) toast('Bentornato a Soffiolieve. I tuoi progressi sono stati ripresi.');
})();
