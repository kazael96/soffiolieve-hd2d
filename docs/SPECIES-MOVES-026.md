# Animazioni per coppia Pokémon–mossa — 0.26

La 0.26 aggiunge quattro coreografie di Tepig e conserva quelle di Snivy. Sono adattamenti HD-2D delle parti originali, non animazioni dichiarate identiche al DS. La matrice passa a8/19 coppie; le altre11 restano aperte.

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

## Rig e coreografie di Tepig

`src/tepig-moves.js` identifica le tracce originali fronte/retro: testa0, corpo1, orecchie2/3, zampe4/5/6, coda7/8. Cordino e pallina della coda condividono il perno originale e la stessa trasformazione. Il rig è separato da quello di Snivy: anche Azione usa una coreografia diversa, con appoggio da quadrupede, passo più rapido e salto molto basso.

- Azione: piccola raccolta, testa bassa, orecchie indietro, spinta alternata delle zampe, carica, contatto e rientro. Scala e ombra seguono il movimento in profondità. Il mancato termina prima del contatto.
- Colpocoda: oscillazione della coda con compensazione del busto, della testa e delle orecchie; zampe in appoggio. Nessun impatto o contraccolpo del bersaglio.
- Braciere: inspirazione nel corpo, assetto della testa, espirazione e recupero. Una breve raffica di piccole braci parte dal muso e termina con scintille solo se colpisce. Non è una fiamma continua.
- Segugio: testa abbassata, piccoli annusamenti, orecchie attente e coda in movimento contenuto. Richiami olfattivi verso le narici e identificazione visiva del bersaglio; nessun contraccolpo da danno.

Il punto del muso viene calcolato dal perno della testa e dai limiti opachi del composito originale, applicando lo stesso angolo della testa e la posa del corpo. Le particelle seguono questa geometria su entrambi i lati. Il renderer di parti supporta anche la respirazione del corpo; le altre specie conservano il comportamento precedente.

I profili sono selezionati per specie498+moveID33/39/52/316. Snivy continua ad avere i suoi quattro profili distinti; la presenza di una mossa condivisa non certifica altre specie. I suoni originali sono allineati alla preparazione e all'esecuzione; la logica di PP, danni, precisione, probabilità di scottatura, variazioni di Difesa e identificazione da Segugio resta al simulatore GEN5. Il fondale resta quello del luogo acquisito all'inizio della lotta.

## Studio, prove e limiti

`?tepig=1` apre lo studio con due Tepig al livello10 su Percorso1/erba, scelto esplicitamente per la dimostrazione. `?snivy=1` resta compatibile. Gli studi disconnettono lo storage della storia e ne fermano l'avanzamento. Consentono scelta della mossa, lato, esito, riproduzione con audio e ispezione dei fotogrammi; non aggiungono incontri alla storia.

Sei nuovi test coprono selezione delle quattro coppie, distinzione da Azione di Snivy, rig fronte/retro, movimenti separati delle parti, coda integra, ritorno a riposo e coordinate finite durante tutti i fotogrammi, mancati, assenza di contraccolpo nelle mosse di stato, punto del muso e integrazione in MoveFX. Totale120 test Node;3 test Python; controlli della build e9 percorsi narrativi.

Nel browser: riproduzione completa delle quattro mosse su entrambi i lati con audio, verifica del mancato Braciere, inquadratura mobile e turni reali con profilo specifico e consumo dei PP. Anteprime esportate da17 campioni per mossa; lo studio online riproduce il ciclo completo. Restano adattamenti di sprite bidimensionali articolati, senza un nuovo modello3D o pose DS inedite.
