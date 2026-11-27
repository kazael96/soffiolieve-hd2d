# Collaudo approfondito e riproducibile

La suite distingue test del motore, della storia, degli asset e dei pixel del browser. Un esito positivo vale per la build e gli scenari indicati, non significa assenza assoluta di bug.

## Esecuzione automatica

Prima creare una build pulita con il builder documentato nel README. Poi:

```sh
node scripts/test-deep.cjs _site test-results/deep --python=python3
```

Su Windows `--python` può indicare il percorso completo di Python. La procedura limita il parallelismo a due processi dei test, usa una cartella temporanea separata e produce `report.json` e un log per ogni fase. Errori, timeout e dipendenze mancanti danno un codice d’uscita non zero. I rapporti non possono essere scritti dentro il sito pubblicato.

Copertura aggiunta:

- 20.000 operazioni riproducibili di tastiera e multitouch, con rilascio, cancellazione e reset.
- 12.000 cambi di direzione nei menu con voci disabilitate e geometria traslata.
- 600 salvataggi e ricaricamenti: ordine della squadra, PP, fase e immutabilità dell’input.
- 80 mappe con ostacoli confrontate con un algoritmo indipendente per il percorso minimo.
- 30 ricaricamenti del controller della storia, dai tre starter fino all’arrivo, conservando variabili, squadra, uscite degli NPC e oggetti non duplicabili.
- Una prima azione per ciascuna delle 559 mosse, più 75 combattimenti prolungati a semi fissi: 634 sessioni complessive. Controlli su HP, PP, stati, modificatori e messaggi di errore del motore. Questo non confronta ogni effetto con l’hardware originale.

La procedura comprende anche i test preesistenti: errori delle risorse, salvataggi non scrivibili, contesto grafico perso, menu, catture, porte, audio sospeso, tutte le combinazioni velocità/audio e i 38 percorsi delle animazioni specifiche nei log di lotta reali.

## Browser reale

```sh
node scripts/build-browser-qa.cjs _site test-results/browser-site
python scripts/serve-browser-qa.py _site test-results/browser-site --port 4182
```

Aprire `http://127.0.0.1:4182/qa-browser.html`. La fixture imposta la modalità isolata **prima** della creazione di Journey: nessun salvataggio della partita viene letto o scritto. Non viene copiata nella release e il generatore rifiuta una destinazione interna al sito. Verificare separatamente 1280×720, 390×844 e 844×390, compresi cambi di dimensione sulla stessa pagina.

Eseguire i controlli grafici e menu, quindi il ripristino GPU e il controllo negativo. Salvare il JSON del pannello come `browser-desktop.json`, `browser-portrait.json` e `browser-landscape.json` nella cartella del rapporto automatico. Il test GPU richiede l’estensione di collaudo `WEBGL_lose_context`; se non disponibile, la prova non viene falsamente dichiarata superata.

Per ciascun formato vengono verificati:

- 10 scene a zoom 0,9/1,4/2, errori WebGL, presenza di dettagli e miniature per revisione visiva.
- 159 texture NPC: lettura effettiva dalla GPU contro un PNG decodificato separatamente. I 13 slot trasparenti presenti negli originali non sono confusi con risorse mancanti.
- 840 fotogrammi da 14 atlanti Pokémon: silhouette presenti, margini, animazioni non congelate.
- Tre ambienti di battaglia; 228 fotogrammi delle 19 coppie Pokémon–mossa su entrambi i lati, anche con esito mancato. Si verifica la specie effettivamente adottata dalla sessione.
- Tutti i 770 assetti ambientali di Patrat e i 384 di Lillipup, senza tagli, immagini vuote o piedi sotto il terreno.
- 600 direzioni del menu, comandi A/B attraverso il ponte touch reale, scheda mosse, ritorno alla squadra e selezione conservata.
- Annullamento del riavvio senza cambiare i progressi e due perdite/ripristini consecutivi della GPU con scena, camera e texture conservate.
- Errori JavaScript e Promise rifiutate, anche durante l’avvio; un canvas vuoto introdotto intenzionalmente deve essere rifiutato dal controllo negativo.

Queste sono verifiche strutturali e pixel, non un confronto fotogramma per fotogramma con un video di Pokémon Nero. Restano distinti il confronto audio udibile e il collaudo sulle GPU dei telefoni fisici.

## Rapporto completo e integrazione continua

```sh
node scripts/summarize-deep.cjs test-results/deep
```

Produce `report.html` e `summary.json`. Se manca uno dei tre rapporti del browser, l’esito complessivo è **INCOMPLETO**, anche se i test automatici passano. Una prova ancora in esecuzione non appare come PASS.

Le pull request eseguono il workflow `Deep regression checks`, conservando log e JSON come artifact. La pubblicazione Pages esegue anche gli stress di salvataggio e combattimento: non distribuisce una build che li fallisce. I test del browser richiedono la sessione grafica e restano documentati separatamente.

## Regressione ambientale064: readback delimitato

`tests/ambient-readback064.test.cjs` è un unico proprietario Node con32passi sequenziali e fail-fast: confronto tra ambientPose storico immutabile e funzioni/helper estratti dal `src/battle-diorama.js` corrente. Entrambi usano lo stesso `src/pokemon-anim.js` originale. Per504/506front copre i cicli completi770/384tick, ripetuti a caldo, con uguaglianza byte dell'intero frameRGBA256×256 e della sourceRGBA, metriche, fallback e ownership. Non fornisce pixel sintetici ai renderer. La prova privata R3 ha riportato32PASS,2340coppie,1154campioni per ciclo cold/warm e piccoRSS135060KiB; questi risultati non sono trasferiti automaticamente al port o a Chrome.

Il nuovo file appartiene a un solo gruppo dedicato su Windows e Linux, con `--expose-gc --max-old-space-size=400 --test` e il flag di isolamento scelto per la versione Node. Gli altri51processi conservano argomenti/callback. Inventario atteso dopo l'inserimento:425file `.test.cjs`,52fasiunit e93fasi totali della CLI. Il guard170s/RSS400MiB, il limite esterno180s/heap400MiB/output8MiB e la stessa raccoltaGC con yield event-loop ogni32coppie e a fine passo non sono ridotti per inserirlo in un gruppo ordinario.

Dipendenze: `SOFFIOLIEVE_CANVAS_MODULE` oppure `@napi-rs/canvas`0.1.100 già previsto in CI; asset da `SOFFIOLIEVE_TEST_SITE` oppure `_site`. Le firme di programmi/metadata normalizzano soltanto CRLF→LF prima delloSHA, mentre i byteUTF8 effettivi vengono compilati senza modifiche. PNG e JSON nativi mantengonoSHAraw. Il fixture ambientPose storico e i corpi/assert dei32passi R3 restano preservati; il port adatta soltanto loader, luogo del rapporto e registrazione come test. Un risultato CPU positivo dimostra equivalenza e riduzione dell'area richiesta nei casi controllati, non velocitàGPU/FPS o qualità visiva: Chrome e browser vanno qualificati separatamente.
## Diagnostica del processo nativo541 · 27 novembre 2026

Le CI115 e CI116 conservano il FAIL RSS di `unit-native-tail541`: 423612 e 417668 KiB contro 409600 ammessi. In entrambe passano i 16 callback funzionali, ma la suite completa rimane 93 PASS / 1 FAIL su 94. I job Windows nominale e recupero503 passano separatamente.

Il solo host Node541 riusa ora la compilazione tramite `compiled-fixture.cjs` originale: 256 voci / 96 MiB di testo, non memoria totale. Ogni accesso verifica nuovamente byte UTF-8 e provenienza; ogni programma viene eseguito nel nuovo contesto VM. Il test conserva entrambi i ruoli e verifica riuso senza stato condiviso. Il primo confronto diretto termina oltre 180 s e resta FAIL; la versione strumentata misura soltanto letture, esecuzione e GC già presenti, senza nuovi GC o attese. Questa versione passa i 16 casi Windows in 109470 ms, RSS 333504 KiB: non dimostra un miglioramento rispetto alla baseline, né spiega da sola il precedente timeout. I contatori cumulativi per file non conservano contesti e rimangono nel log limitato a 8 MiB.

Un job Linux aggiuntivo esegue la coppia originale, selezionata dal registro effettivo, con 16 callback, heap 400 MiB, RSS 409600 KiB, 180 s e log 8 MiB. Tutti i 7 test del runner passano, inclusi uscita nonzero, metriche mancanti, overflow e riepiloghi TAP incompleti. Full94 e Windows restano invariati e obbligatori. La nuova misura Linux è ancora necessaria; questi risultati non approvano prestazioni del gioco, grafica, movimento o audio.
