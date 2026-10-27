# Animazioni per coppia Pokémon–mossa — 0.25

Coreografie HD-2D personalizzate, non ricostruzioni dichiarate identiche alle animazioni DS. Riutilizzano i componenti originali di Snivy e i suoni delle mosse; pose, traiettorie e tempi sono adattati. Le regole del simulatore non cambiano.

| Specie | Mossa (livello) | Profilo | Stato |
| --- | --- | --- | --- |
| Snivy | Azione (1) | snivy-33 | Verificata nella demo |
| Snivy | Fulmisguardo (4) | snivy-43 | Verificata nella demo |
| Snivy | Frustata (7) | snivy-22 | Verificata nella demo |
| Snivy | Avvolgibotta (10) | snivy-35 | Verificata nella demo |
| Tepig | Azione (1) | — | Da realizzare |
| Tepig | Colpocoda (3) | — | Da realizzare |
| Tepig | Braciere (7) | — | Da realizzare |
| Tepig | Segugio (9) | — | Da realizzare |
| Oshawott | Azione (1) | — | Da realizzare |
| Oshawott | Colpocoda (5) | — | Da realizzare |
| Oshawott | Pistolacqua (7) | — | Da realizzare |
| Patrat | Azione (1) | — | Da realizzare |
| Patrat | Fulmisguardo (3) | — | Da realizzare |
| Patrat | Morso (6) | — | Da realizzare |
| Patrat | Pazienza (8) | — | Da realizzare |
| Lillipup | Fulmisguardo (1) | — | Da realizzare |
| Lillipup | Azione (1) | — | Da realizzare |
| Lillipup | Segugio (5) | — | Da realizzare |
| Lillipup | Morso (8) | — | Da realizzare |

## Corpo ed effetti

`src/species-moves.js` seleziona esclusivamente specie495 + moveID33/43/22/35. Le altre coppie mantengono il renderer precedente e non sono certificate. `pokemon-anim.js` applica trasformazioni alle vere parti del composito originale, su entrambi i lati. Testa, busto, coda, braccia e zampe hanno tracce identificate separatamente per fronte/retro. Durante l'azione la base è il fotogramma originale0; il gesto personalizzato sostituisce l'oscillazione di attesa. Al termine riprende l'animazione originale.

- Azione: raccolta, spinta delle zampe, avanzamento con testa e coda che compensano il corpo, piccolo salto, contatto e ritorno. Scala e ombra seguono l'avanzamento in profondità.
- Fulmisguardo: busto più eretto, testa inclinata, coda ferma in tensione e bagliore ancorato alla testa. Nessun balzo verso il bersaglio.
- Frustata: appoggio a terra, torsione di busto/coda e apertura delle braccia; due liane dal collare si estendono, colpiscono e rientrano.
- Avvolgibotta: flessione e torsione, braccia in tensione e coda che accompagna; liane dal collare raggiungono il bersaglio, con spire divise dietro/davanti al corpo, stretta e rilascio.

Il profilo sostituisce la composizione visiva generica della mossa per evitare doppi movimenti/particelle. Conserva gli eventi sonori originali, adattandoli alla durata e all'impatto della coreografia. PP, precisione, danni, cali delle statistiche, intrappolamento e danni residui rimangono responsabilità del motore GEN5. La coreografia mostra l'applicazione di Avvolgibotta, non mantiene una liana permanente fra i turni.

Un mancato/fallito esegue il gesto dell'attaccante, senza lampo d'impatto, stretta sul corpo o reazione del bersaglio. In Azione la corsa termina prima del contatto. Animazioni disabilitate nelle opzioni conservano il comportamento del gioco. I profili non cambiano il fondale catturato all'inizio della lotta.

## Prove e limiti

Cinque nuovi test coprono selezione della coppia, differenza delle quattro coreografie, trasformazioni delle parti fronte/retro, ritorno a riposo, coordinate finite durante tutti i fotogrammi e sui due lati, assenza di reazioni ai mancati, audio e integrazione della selezione in MoveFX. Suite complessiva:114 test Node;3 test Python; verifica degli asset della build e9 percorsi narrativi.

Nel browser: prova di turni reali con selezione del profilo corretto e consumo dei PP, oltre alla riproduzione completa delle quattro mosse da entrambi i lati, audio attivo senza errori di console; scorrimento delle pose; verifica del mancato Avvolgibotta e inquadratura mobile390×844. Anteprime animate esportate da17 campioni della battaglia per ciascuna mossa: sono prove sintetiche, mentre lo studio online riproduce la sequenza completa.

`?snivy=1` apre lo studio opzionale con due Snivy al livello10, stesso renderer delle lotte, su Percorso1/erba esplicitamente selezionato. La storia non avanza e il suo storage è disconnesso: la prova non modifica il salvataggio. I comandi consentono mossa, lato, esito, riproduzione con audio e ispezione dei fotogrammi. Non è un incontro aggiunto alla storia. La prima matrice passa a4/19 coppie verificate; le altre15 restano aperte. Una nuova fonte di apprendimento deve estendere la matrice.
