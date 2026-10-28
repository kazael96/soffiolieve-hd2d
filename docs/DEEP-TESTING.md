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
