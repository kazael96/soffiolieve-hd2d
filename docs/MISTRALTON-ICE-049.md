# Ghiaccio, camera e varco dinamico · 0.49

`src/mistralton-ice.js` implementa tre comportamenti separati e non modifica il codice condiviso. L'integrazione nel runtime e i controlli grafici spettano al chiamante `MistraltonPuzzles`.

## Contratto

`MistraltonIce.createController(options)` accetta `state()`, `player()`, `direction()` (0nord,1sud,2ovest,3est), `resetInput()`, `save()`, `canStart()`, `grids(zone)`, `events` o `events()`, `blocked(x,y)` oppure l'alias `baseBlocked(x,y)`. L'opzione facoltativa `actors()` aggiunge i corpi effettivi presenti nello stesso campo. I valori predefiniti leggono `NativeStory`, `MistraltonChapter.grids(192)` o `MISTRALTON_SCENES[192]`, `MISTRALTON_EVENTS`, il movimento e i comandi già esistenti. La collisione predefinita comprende anche `NativeStory.occupied`.

API restituita: `prepare()` (nessuna nuova risorsa), `tick(dt,moved)`, `enter(zone)`, `restore()`, `reset()`, `command(name,args,values)`, `playShake(values)`, `patchWarp(values)`, `warps(zone,list)`, `cameraOffset()`, `applyCamera(renderer)`, `tile(x,y)`, `busy`, `sliding`, `slide`, `canMove()` e `blocked()`. Quest'ultimo restituisce `null`: il ghiaccio non aggiunge pareti e non deve introdurre ricorsione attraverso il controllo globale delle collisioni.

Invocare `tick` una sola volta per passo del gioco **prima** del controllo `held` di `OriginalStory`. Il parametro `moved` deve rappresentare il movimento manuale già avvenuto in esplorazione, non quello prodotto da uno script. Il chiamante blocca il normale movimento quando `busy` è vero. `canStart` viene consultato soltanto all'avvio: il blocco provocato dalla corsa stessa non la interrompe. `dt` è già il tempo virtuale scalato da `GameSpeed`; il modulo non moltiplica ancora per×2/×4 e non usa timer esterni.

Chiamare `enter` dopo un cambio di zona e `restore` dopo aver ripristinato la posizione del giocatore. `reset` annulla scivolamento/scossa e libera l'input, mantenendo le modifiche narrative dei varchi.

Per la camera:

```js
const restoreCamera = MistraltonPuzzles.applyCamera(renderer);
try { renderer.draw(/* attori e tempo correnti */); }
finally { restoreCamera(); }
```

Il ripristino è idempotente e conserva esattamente `center[0]` e la precedente proprietà `elevation`, compresa la sua assenza. `center[1]` non viene cambiato. L'offset non va applicato al movimento del giocatore o alla logica dei trigger.

## Ghiaccio del Deposito

La zona192 contiene esattamente170 riquadri con comportamento24, comprese le caselle24 bloccate. Il controller usa anche il bit di collisione originale; non converte automaticamente tutto il ghiaccio in pavimento percorribile. I metadati del reticolo hanno8196 byte: il comportamento è a `8+indice*8` e la collisione a `10+indice*8`, come nel runtime esistente.

Una nuova corsa parte soltanto dopo movimento manuale su una casella24. L'allineamento perpendicolare raggiunge il centro della casella con un movimento continuo; non sposta istantaneamente il corpo. La direzione viene poi mantenuta fino al centro della prima casella asciutta o all'ultima posizione sicura davanti a un ostacolo. Pareti e personaggi presenti sono controllati durante il percorso con passi interni non superiori a0.08tile. L'input viene azzerato all'inizio e alla fine; una pressione residua nella stessa direzione non riavvia ripetutamente una corsa contro il muro. Una nuova direzione rimane consentita.

La velocità di3.75tile/s è un **adattamento temporale HD-2D**, non una velocità nativa misurata. Geometria, direzione obbligata, arresti e accessi rimangono soggetti al reticolo originale. Una risorsa del terreno temporaneamente assente sospende la stessa corsa senza considerare il terreno libero o terminare l'operazione.

`native.mistraltonIceSlide` conserva versione, zona, direzione, fase, bersaglio e posa. La ripresa convalida assi, distanze e coordinate e non teletrasporta il giocatore verso la copia salvata. Un record danneggiato viene isolato senza cambiare la posizione. Il passaggio a un'altra zona annulla la corsa precedente.

Percorso legale verificato verso il container, in **coordinate native di casella**, partendo da7,31:

`N×7 →7,24; N/scivola→7,15; E/scivola→12,15; S→12,16; O/scivola→1,16; N/scivola→1,13; N×5→1,8; E×4→5,8`.

Il percorso alternativo verso l'allenatore superiore, dopo12,15, è `N→12,14; E×2→14,14; E/scivola→21,14; S/scivola→21,17; O→20,17; O/scivola→16,17; N/scivola→16,8; N×2→16,6; E×2→18,6`. Le coordinate world sono `casella−15.5`.

## Opcode328

Fonte: handler IRBI `021b540c→021d2c64`, disassemblato in `outputs/chapter049/puzzles/0x21d2c38.txt`. I parametri sono ampiezzaX, ampiezzaY, periodo, cicli, decadimentoX, decadimentoY, ritardo del decadimento e intervallo. Il ritardo è espresso in cicli completati; l'intervallo in aggiornamenti nativi. Ritardo0 disattiva il decadimento. Quando attivo, le ampiezze vengono ridotte con limite inferiore1, come nel codice esaminato.

L'unica chiamata della tappa è194 con `[0,1,3,6,0,0,0,0]`:18 fotogrammi a30Hz,0.6secondi. `command` restituisce una promessa bloccante, completata esclusivamente dal tick virtuale. L'onda è sinusoidale, campionata e quantizzata Q12, con ampiezze convertite in tile dividendo per16. La scossa temporanea è conservata in `native.mistraltonCameraShake` e riprende dal tempo trascorso; una richiesta duplicata degli stessi parametri riutilizza la promessa attiva. Cambio zona e annullamento risolvono con `false` e rimuovono l'offset.

## Opcode491

Fonte: handler `0215b16c→021625f8`, prova in `outputs/chapter049/puzzles/0x21625f8.txt`. Non è una dissolvenza o un teletrasporto del giocatore: modifica la posizione di un record nella tabella dei varchi, con20byte per record. Per `[indice,x,y,z]` scrive `x*16+8`, `y*16`, `z*16+8`.

Le due chiamate native194 sono `[0,107,1,337]` prima della rimozione della ragnatela e `[0,107,1,339]` dopo. Il record continua a condurre alla zona195; cambiano soltanto le coordinate del varco corrente. `native.mistraltonWarpPatches` usa chiavi `zona:indice`. `warps(zone,list)` restituisce cloni e non modifica mai `MISTRALTON_EVENTS`. Indici, coordinate e record salvati vengono convalidati; i varchi su binario non vengono modificati, come nel controllo originale. Le modifiche persistono dopo salvataggio/ricarica e dopo un semplice reset dello scivolamento.

## Prove effettive

Eseguito `node --test --test-isolation=none tests/mistralton-ice.test.cjs`:19 test superati. Coperti170tile originali, termine su asciutto, muri, allineamento continuo, direzione, input ripetuto, mancato avvio negli script, personaggi effettivi, passi frazionari e ricarica, dati danneggiati, risorsa del terreno mancante/ripristinata,×1/×4, percorso completo del puzzle, durata/promessa/decadimento della scossa, ripristino della camera anche su errore, cambi di zona, modifica nativa e immutabilità dei varchi, persistenza e convalida.

Questi sono controlli del controller e dei dati originali. Non sono state eseguite qui prove browser con input/touch, tre viewport, audio udibile o confronto visivo col DS; restano al collaudo della candidata integrata. Non sono state create nuove build, commit o pubblicazioni.
