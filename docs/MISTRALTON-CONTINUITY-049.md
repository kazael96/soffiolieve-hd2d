# Continuità fisica0.49 · contratto e prove

`src/mistralton-continuity.js` estende il controller delle uscite senza modificare script originali, bootstrap, gioco o build. I nuovi hook di `field-actor-exits.js` delegano pianificazione, ripresa, continuazione dopo occlusione, tick nei soli campi pertinenti, occupazione fisica, collisioni fra corpi e cancellazione dei soli ruoli logici già sostituiti. Le identità Anemone/Rutilo sono uniche come quelle degli altri personaggi principali.

## Integrazione richiesta al chiamante

1. Dopo la creazione di `departures`, **prima di `departures.restore`**, configurare:

```js
MistraltonContinuity.configure({
  native, departures,
  blockedAt: MistraltonChapter.blockedAt,
  isCovered: () => fieldCovered,
  recheck: () => { lastTile = ''; }
});
```

I soli valori obbligatori sono `native`, `departures`, `blockedAt`. `recheck` deve invalidare il controllo del trigger anche se il giocatore è fermo. Il riferimento a `lastTile` può essere una chiusura dichiarata prima della sua inizializzazione, purché chiamata soltanto dai tick successivi.

2. Quando il campo è completamente coperto, chiamare `coveredTransition()` **prima** di salvare/ricostruire le uscite. Il filtro di `clearDepartures` conserva anche `MistraltonContinuity.carry(record)`. Non chiamare questo metodo quando la dissolvenza è soltanto iniziata. `Controller.restore` già richiama `restoreRecord` e la whitelist aggiuntiva; `migrate()` serve soltanto a vecchi record ancora presenti in memoria.

3. Dopo il cambio di zona, mentre il campo è ancora coperto e prima di accodare gli eventi d'ingresso, chiamare `enterZone(native.zone,{covered:fieldCovered})`. Questo avvia Komor dal corpo salvato in191 verso192 e da192 verso193. Gli eventi `onEnter`192/193 rimangono in una coda pendente finché `waitingFor(native.zone,['Komor'])` è falso. La coda viene rivalutata ogni tick e non attiva `ActorPauseAll` mentre il giocatore attende.

4. Chiamare `tick(dt)` **una sola volta** per tick del campo, oltre al normale `departures.tick(dt)`. Il controller con `shouldTick` già integrato muove i corpi nel campo attivo/confinante; il modulo muove fisicamente soltanto le tappe fuori mappa autorizzate da una copertura completa o da due prove reali d'invisibilità. Un risultato GPU mancante non è mai una prova.

5. Prima di eseguire un trigger e impostare `eventRunning`, chiamare `prepareEvent(native.zone,trigger.script,npcs)` con lo **scriptID nativo a partire da1**. Se restituisce falso, mantenere il controllo, invalidare `lastTile` e rivalutare anche da fermi. Per192/script2 prepara il vero viaggio dal ruolo Komor0 al ruolo1 prima del dialogo; per191,96/Ghecis e195/Belle aspetta gli attori richiesti.

6. Dopo aver aggiunto un attore, chiamare `introduced(n,npcs)`. Passare `visibleActors(npcs.filter(n=>!n.hidden))` a `departures.visible`. In questo modo un futuro ruolo nativo non sostituisce quello attuale perché più vicino al giocatore. I ruoli `continuitySuperseded` non hanno un secondo corpo; la loro successiva `ActorDelete` è già intercettata dal controller.

7. In `ActorCmdExec`, prima del normale `move`, chiamare `startExitMotion(actor(v[0]),native.zone,v[1])`: quando restituisce vero, il controller ha sostituito la sola camminata finale DS fuori visuale con il tragitto reale, quindi non accodare quella vecchia sequenza. Gli indirizzi selezionati sono conservati nel modulo: ultimi movimenti dei gruppi193, Aralia/Belle195 e Anemone107. Questo evita che `ActorDelete` riceva un corpo già passato oltre la porta e lo faccia tornare indietro.

8. Il filtro finale del campo deve mostrare i corpi soltanto quando `MistraltonContinuity.sameField(n.fieldZone,native.zone)` è vero per i record di questo capitolo, compresi quelli con `nextChapter` in337. Non limitare il filtro alle sole zone già implementate:337 è una destinazione pendente e non deve comparire in un interno dalle stesse coordinate locali. L'occupazione fuori campo è già esclusa dall'hook `occupies`.

## Inventario e fonti native

| Origine | Percorso fisico e destinazione |
| --- | --- |
|Komor048,96uid253|Mantiene la posa salvata, abbandona il vecchio ancoraggio−606.5,−304.5 e attraversa i reticoli96/191 fino al vero191uid0:−612.5,−285.5|
|Komor191|Porta del Deposito191→192, ruolo0 all'ingresso; poi vero tragitto al ruolo1 nativo13,5|
|Komor192|Porta192→193 e posizione nativa del ruolo3|
|Komor/Rafan193|Porta193→192; attraversamento del magazzino; porta192→191; cammino nel campo191/96 fino a96uid11 Komor207,405 e96uid9 Rafan212,402|
|Seguaci/lavoratori193|Raggiungono la porta effettiva prima del ritiro. Non vengono inventate corrispondenze con gli altri gruppi nativi della piazza|
|Ghecis/gruppo96|Ritiro verso il passaggio occidentale per il Percorso6; il programma originale li cancella durante una copertura completa. Nessuno viene indirizzato alla porta della palestra|
|Rafan96/194|Porta vera della palestra; da194 attraversa331 prima del rientro a96|
|Belle96|Passaggio occidentale96→331, ingresso194→195, vero ruolo195uid0 in8,45|
|N195|Esce verso107 e aspetta alla posizione originale107uid13:−707.5,−482.5; script2000 finché il ruolo dopo la palestra non diventa nativamente disponibile|
|Aralia/Belle195|Escono dalla Cava verso107. Restano insieme per la ricerca: Aralia−683.5,−441.5 e Belle−682.5,−442.5, UID di adattamento250/251, senza occupare l'imbocco della Cava|
|Komor dopo la piazza|Continua verso il Percorso6/Cava/Ponentopoli e conserva un itinerario pendente per il prossimo ruolo nativo198uid2|
|Anemone/Rutilo107|Raggiungono separatamente il confine nord orientale verso il Percorso7; record conservati per i prossimi eventi nativi342uid0 e113uid2|

Fonti: `MISTRALTON_EVENTS` programmi192/382/384/386/388/390/214; reticoli propri in `MISTRALTON_SCENES`; tabella completa `outputs/chapter047/zones.json`. Le coordinate globali usano origine784/752, gli interni16/16. Il passaggio96↔331 è percorribile su entrambi i lati alle righe−348.5…−344.5; il tragitto usa−346.5. L'A* raggiunge la casella davanti alle porte; l'attraversamento successivo è esplicito, perché la casella del varco può risultare bloccata nel reticolo statico.

Il testo nativo203/38 dice che Aralia continuerà a raccogliere dati;203/39 presenta Belle come sua guardia del corpo. La loro sosta di ricerca107 è un adattamento di continuità, non un nuovo evento originale o un ritorno al laboratorio. I capitoli futuri devono proseguire da qui fino ai ruoli distinti successivi. Analogamente i record `nextChapter` non dichiarano implementati Percorso7, Torre Cielo o Monte Vite.

## Salvataggi e prove effettive

Le tappe persistono con destinazione, numero di tratta e versione2. Alla ripresa vengono ricostruite le rotte dalle costanti e dalla posa valida, senza affidarsi a UID/zone/punti alterati del piano salvato. Sono conservati il passo frazionario sul proprio asse, i tagli delle porte, la posa, i ruoli residenti e le destinazioni successive; i vecchi certificati GPU vengono scartati. Le soglie tra campi globali mantengono le coordinate effettive, mentre i passaggi fra porte usano i rispettivi ingressi soltanto dopo occlusione o copertura.

Eseguiti21 test nuovi e20 regressioni precedenti con `node --test --test-isolation=none tests/mistralton-continuity.test.cjs tests/field-actor-exits.test.cjs`: tutti superati. I test usano i reticoli nativi reali e campioni di visibilità controllati: migrazione048, arrivo attuale96/191, attesa delle prove GPU, passaggio193→192→191→96, continuazione esplicitamente coperta, ritiro dei gruppi, pose frazionarie e salvataggi, due ricercatrici, ruoli duplicati, attesa del giocatore anticipato, tratte successive e sostituzione delle camminate finali DS. Due regressioni aggiuntive coprono ripristini consecutivi durante un attraversamento della porta e ruoli futuri già popolati in96: questi ultimi non possono interrompere il viaggio fisico ancora in193/192; l'adozione richiede arrivo residente, UID, zona e coordinate coincidenti.

Non sono stati eseguiti qui renderer browser, confronti di occlusione reali, itinerari tramite input, tre viewport, zoom supportati o confronto a×1/×2/×4. Queste prove e la suite completa appartengono alla candidata integrata. Nessuna nuova build, commit o pubblicazione eseguita da questo sottocompito.

## Violante: atlante e prove di uscita della candidata3

La prova browser della candidata `2bf585a84d2780ce` si è fermata dopo le quattro lotte nel container con «Verifica visibilità uscita non disponibile: Violante». La causa verificata è la diversa chiave dello sprite: `original-story.js` assegna al modello192 il nome `Violante`, mentre i bootstrap048/049 registravano i sette fotogrammi nativi sotto `Original192`. Il piano del renderer ometteva quindi quelle texture e il probe non poteva fornire una prova valida. Il cambio mappa asincrono già avviato poteva mostrare96 nel DOM dopo l’errore; non era dimostrato un difetto della politica off-map.

La correzione aggiunge soltanto l’alias192→Violante nei due bootstrap. La regressione con i dati originali falliva prima con zero fotogrammi nel vero `VillageRenderer.resourcePlan`, contro i sette richiesti; dopo la correzione verifica tutte le sette chiavi e carica i sette PNG originali nel percorso di upload GPU simulato. Un secondo test copre il bootstrap differito048. Il controllo dei nomi del catalogo049 nel runtime di prova non ha trovato altri atlanti mancanti.

La suite mirata aggiornata passa41/41 test. Restano invariati percorsi, passaggi coperti, `shouldTick`, attesa delle due prove di invisibilità e guard delle sonde assenti. La prova con upload simulato non certifica i pixel della GPU: il replay browser deve essere ripetuto sulla candidata successiva. Evidenza della prova interrotta: `outputs/chapter049/candidate3-aborted.json` e `outputs/chapter049/browser-final/1280x720-failure-Violante-offmap.png`.
