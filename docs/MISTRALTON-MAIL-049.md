# Messaggi locali0.49

Gli strumenti137–145 acquistabili nei Market ora hanno un servizio locale di scrittura, lettura, consegna e ritiro. Non esiste invio a persone o servizi esterni. I nove sfondi e il lessico provengono dalla ROM italiana IRBI; [MISTRALTON-MAIL-DATA-049.md](MISTRALTON-MAIL-DATA-049.md) descrive l'estrazione.

## Struttura originale

Il gestore è nell'overlay136 (`mailtool.c`, `mailsys.c`, `mailview.c`). Il corpo nativo legge tre record di frase da otto byte a partire da `payload+0x16` (`021c520c`). Il loader ARM9 `020243a0/02024418` usa la tabella `0209f6a4`: banchi94,96,99,93,98,95,97. Sono123 modelli originali, con zero, una o due parole `{011c:0}`/`{011c:1}`. Il modello vuoto finale non può essere confermato come messaggio.

Il vocabolario conserva1776 voci e indici di11 banchi. Sei parole non riproducibili nel font italiano attualmente usato dal sito restano nei dati ma sono disabilitate nell'editor; questa è un'adattazione del font del browser, non una regola di sblocco del DS. Non vengono sostituite con punti interrogativi o parole inventate.

Gli sfondi256×192 sono i membri originali di `a/1/5/5`: tipo0–8, caratteri12+tipo, tilemap24+tipo, palette tipo. Le finestre native del testo sono `(24,24),(24,64),(24,104)`, ciascuna208×32; il lettore usa questi ancoraggi. Le due finestre del piè di pagina hanno origine `(64,152)` e `(168,152)`. Il servizio locale vi presenta l'etichetta italiana “Da:” e l'autore; non attribuisce a una stringa nativa un ruolo non ancora tracciato.

L'editor compatto usa `NativeUI.Screen`, font bitmap e i controlli A/B, frecce e touch già condivisi. Si scelgono una frase e le sue parole per ciascuna delle tre righe. La disposizione dei controlli è un adattamento HD-2D, non la ricostruzione completa dell'editor DS. Il lettore aggiunge pagine solo quando le sostituzioni richiedono più righe di quelle del foglio, conservando tutto il contenuto.

La schermata modale di caricamento compare sincronicamente prima di attendere font e carta; A/B permettono di annullare subito, anche se la risorsa rimane pendente. Un token per operazione impedisce completamenti tardivi. Un controllo ogni30ms chiude l'operazione se cambiano stato, scena, zona o inizia una lotta; il ritorno `close` usa il contratto già presente in `NativeUI.external` e impedisce di riaprire il vecchio menu nel nuovo contesto. La chiusura manuale del dialogo annulla anch'essa l'operazione. Queste protezioni non bloccano `Journey.save` durante la conferma della lettera.

## Stato e operazioni atomiche

Ogni Pokémon che tiene una lettera conserva:

```js
mail = {
  version: 1,
  item: 137,
  author: 'Alcide',
  lines: [
    {group: 0, phrase: 0, words: [{group: 5, word: 3}]},
    {group: 0, phrase: 0, words: [{group: 5, word: 3}]},
    {group: 0, phrase: 0, words: [{group: 5, word: 3}]}
  ]
};
```

Gli indici identificano i dati originali. Il salvataggio non contiene testo arbitrario o HTML. `sanitizeMail(value,heldItem)` verifica tipo di carta, autore, tre frasi, numero e validità delle parole, indici disabilitati e slot mancanti, comprese le matrici sparse.

La bozza non consuma carta. Alla conferma il servizio verifica di nuovo lo stesso Pokémon e la Borsa, restituisce l'eventuale strumento precedente, consuma una carta, assegna insieme `heldItem` e `mail`, poi salva una sola volta. Un errore nel consumo restituisce lo strumento precedente al suo conteggio originale. La sostituzione di uno strumento ordinario richiede conferma; una lettera già scritta deve prima essere ritirata. Lettura e annullamento non modificano nulla.

Il ritiro presenta l'avviso nativo sulla perdita del contenuto. Solo la conferma cancella `mail` e restituisce una carta bianca alla Borsa. Se la Borsa è piena, tutto rimane al Pokémon. Non è implementato un Box Messaggi del PC: non si promette di conservare il contenuto ritirato. Una carta tenuta priva di dati, per esempio da un vecchio salvataggio, può essere completata senza consumarne una seconda.

## Contratto per il runtime

Caricare `mistralton-mail-data.js` e `mistralton-mail.js` prima di `engine.js` e `story-state.js`; il menu viene costruito solo quando si apre il servizio. Conservare il risultato di `sanitizeMail` in `Engine.makeMon(options)`, `Journey.pack(mon)` e nella normalizzazione dei tratti di `StoryState`. Questo impedisce che cure, lotte, esperienza, evoluzioni o una ricostruzione del Pokémon cancellino il corpo pur conservando la carta.

Le API sono:

- `compose(item,index)`, `readUI(index)`, `takeUI(index)`: schermate native, esito booleano; `close` segnala una cancellazione per cambio di contesto o lotta, alla quale il chiamante non riapre il menu precedente.
- `createLetter(item,lines,author)`, `sanitizeMail(value,heldItem)`, `read(index)`, `text(letter)`: dati semantici verificati e copie difensive.
- `give(item,index,letter,{replace,fromHeld,pokemon})` e `take(index,{erase,pokemon})`: operazioni sincrone atomiche; le opzioni distruttive sono usate solo dopo le conferme del menu.
- `allowsGenericGive(item,index)` e `allowsGenericTake(index)`: impediscono alle normali azioni di consegna/ritiro di perdere il contenuto di una lettera.

Nel menu Borsa, sia USA sia DAI per137–145 aprono `compose`. Il menu dello strumento tenuto offre LEGGI e il ritiro tramite `takeUI`. Il controller non modifica i file condivisi: questi agganci appartengono al runtime. `createService(options)` permette l'iniezione di stato, Journey, salvataggio, controllo della lotta, `Screen` e caricatore immagini per i test.

## Verifiche

`tests/mistralton-mail.test.cjs` contiene20 prove di transazioni, salvataggio JSON, copie difensive, sostituzione con consenso, Borsa piena, operazioni fallite, riferimenti al Pokémon divenuti obsoleti, matrici sparse, due parole native, interfaccia completa di scelta, annullamento/lettura/ritiro, riprova delle risorse e azioni ripetute dopo la chiusura. Le prove di caricamento pendente coprono annullamento prima di font/carta, cambio di contesto o lotta, errori in corsa e completamenti di una vecchia operazione dopo l'apertura di una nuova. `tests/mistralton-mail-data.test.cjs` aggiunge quattro prove di grammatica, lessico, font e hash PNG. Tutte24 sono passate. Queste prove non certificano il rendering di una build; `qaMail049` usa il Market nativo e il menu reale per il collaudo della candidata.
