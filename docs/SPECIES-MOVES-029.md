# Animazioni per coppia Pokémon–mossa — 0.29

Quattro coppie di Patrat aggiunte agli starter. Matrice15/19: restano aperte le quattro coppie di Lillipup. Le pose e gli effetti sono adattamenti HD-2D delle parti originali, non animazioni dichiarate identiche al DS. Il simulatore rimane responsabile delle regole.

| Specie | Mossa (livello) | Profilo | Stato |
| --- | --- | --- | --- |
| Snivy | Azione (1) | snivy-33 | Verificata nella demo |
| Snivy | Fulmisguardo (4) | snivy-43 | Verificata nella demo |
| Snivy | Frustata (7) | snivy-22 | Verificata nella demo |
| Snivy | Avvolgibotta (10) | snivy-35 | Verificata nella demo |
| Tepig | Azione (1) | tepig-33 | Verificata nella demo |
| Tepig | Colpocoda (3) | tepig-39 | Verificata nella demo |
| Tepig | Braciere (7) | tepig-52 | Verificata nella demo |
| Tepig | Segugio (9) | tepig-316 | Verificata nella demo |
| Oshawott | Azione (1) | oshawott-33 | Verificata nella demo |
| Oshawott | Colpocoda (5) | oshawott-39 | Verificata nella demo |
| Oshawott | Pistolacqua (7) | oshawott-55 | Verificata nella demo |
| Patrat | Azione (1) | patrat-33 | Verificata nella demo |
| Patrat | Fulmisguardo (3) | patrat-43 | Verificata nella demo |
| Patrat | Morso (6) | patrat-44 | Verificata nella demo |
| Patrat | Pazienza (8) | patrat-117 | Verificata nella demo |
| Lillipup | Fulmisguardo (1) | — | Da realizzare |
| Lillipup | Azione (1) | — | Da realizzare |
| Lillipup | Segugio (5) | — | Da realizzare |
| Lillipup | Morso (8) | — | Da realizzare |

## Rig di Patrat

`src/patrat-moves.js` identifica testa0, incisivi1 sul fronte, busto2 fronte/1 retro, braccio alzato3 e mano4 fronte (3/2 retro), altro braccio5 fronte/4 retro, gambe6/7 e piedi8/9 fronte (5/6 e7/8 retro), coda10/11 fronte e9/10 retro. Mano e braccio alzati condividono il punto di rotazione; piede e gamba ruotano attorno alla stessa anca; coda e punta bianca restano solidali. Gli incisivi seguono la testa e hanno una piccola escursione aggiuntiva per Morso.

- Azione: raccolta, corsa breve con gambe alternate e coda a bilanciare, inclinazione verso l'avversario, contatto e ritorno. Scala e ombra seguono la profondità.
- Fulmisguardo: postura rigida, testa e coda in tensione, occhi con bagliore coerente al lato visibile. Nessun contraccolpo del bersaglio o impatto da danno.
- Morso: preparazione, avvicinamento con la testa, apertura/chiusura degli incisivi sul fronte, scatto e ritorno. Sul retro la bocca è in parte occultata dalla testa; il gesto e il contatto seguono il lato corretto. Non si sostituisce il corpo con una mascella generica sospesa.
- Pazienza: accumulo192 fotogrammi con postura raccolta e richiami verso il corpo; attesa96 fotogrammi con tensione più contenuta; rilascio144 fotogrammi con apertura delle braccia, spinta del busto e impulso verso il bersaglio. Nessun colpo durante l'accumulo.

## Pazienza guidata dal motore

`MoveFX` seleziona i profili per specie504, moveID e contesto. Il normale evento della mossa avvia l'accumulo; `-activate ... move: Bide` seleziona l'attesa; `-end ... move: Bide` seleziona il rilascio. La chiusura silenziosa non ripete l'animazione. Un successivo fallimento/immunità nella stessa azione sopprime il colpo: l'effetto si spegne presso Patrat senza raggiungere il bersaglio; un fallimento della mossa successiva non altera l'esito precedente.

Tra i turni, la postura raccolta viene mantenuta solo per Patrat finché Pazienza è attiva, anche mentre attacca l'avversario. Cessa al rilascio, cambio, KO o nuova lotta. Le proprie sequenze hanno precedenza sulla postura persistente. L'attesa non ripete il suono di avvio; nell'accumulo si conserva spazio per la modulazione audio originale. Il rilascio usa la fase nativa corrispondente.

PP, durata in turni, priorità, danno restituito, fallimento senza danni accumulati e stati rimangono quelli del motore GEN5. Le animazioni disabilitate nelle opzioni conservano il comportamento precedente. Ogni lotta mantiene il proprio fondale immutabile.

## Studio e prove

`?patrat=1` apre lo studio isolato con due Patrat al livello10 su Percorso1/erba, scelto esplicitamente per la dimostrazione. Per Pazienza il selettore Fase offre Accumulo, Attesa, Rilascio; `&move=117&phase=release` apre direttamente il rilascio. Gli altri studi restano compatibili. Storage ed eventi della storia sono disconnessi dalla prova; non vengono aggiunti incontri alla storia.

Nove test nuovi: selezione delle quattro coppie e delle tre fasi; gesti delle parti fronte/retro, coordinate finite e ritorno a riposo; coda, mano e incisivi solidali; assenza di impatti in concentrazione e nei mancati; eventi e fallimenti di Pazienza; postura persistente e pulizia; temporizzazione audio; selezione MoveFX tramite contesto e varianti; integrazione dell'adattatore con accumulo/attesa/rilascio fallito e chiusura silenziosa. Totale137 test Node,3 test Python, verifica della build e9 percorsi narrativi.

Nel browser: quattro mosse, tre fasi di Pazienza, entrambi i lati con audio, controllo telefono, turni reali e due cicli di Pazienza (con danni e senza danni accumulati). Le anteprime campionano17 fotogrammi per sequenza; la riproduzione completa è nello studio. Le animazioni restano basate su compositi bidimensionali articolati.
