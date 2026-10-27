# Animazioni per coppia Pokémon–mossa — 0.28

Tre coreografie di Oshawott aggiunte alle otto di Snivy/Tepig. Matrice11/19: le altre8 coppie restano aperte. Sono adattamenti HD-2D delle parti originali, non animazioni dichiarate identiche al DS. Le regole del simulatore non cambiano.

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
| Patrat | Azione (1) | — | Da realizzare |
| Patrat | Fulmisguardo (3) | — | Da realizzare |
| Patrat | Morso (6) | — | Da realizzare |
| Patrat | Pazienza (8) | — | Da realizzare |
| Lillipup | Fulmisguardo (1) | — | Da realizzare |
| Lillipup | Azione (1) | — | Da realizzare |
| Lillipup | Segugio (5) | — | Da realizzare |
| Lillipup | Morso (8) | — | Da realizzare |

## Oshawott: anatomia e gesti

`src/oshawott-moves.js` usa testa0, busto1 con conchiglia solidale, braccia3/4 fronte e2/3 retro, coda2 fronte e4 retro, piedi5/6. Il collo ha perno locale(0,8); piedi e coda ruotano sui propri attacchi. I profili sono selezionati per specie501 e moveID33/39/55. Snivy e Tepig conservano coreografie distinte per le mosse condivise.

- Azione: raccolta, spinta alternata dei piedi, braccia a bilanciare, testa raccolta, breve avanzamento e ritorno. Scala e ombra seguono la profondità. Il mancato termina prima del contatto.
- Colpocoda: oscillazione della coda con compensazione del bacino, del busto e della testa; braccia accompagnano il gesto e piedi in appoggio. Non è una sferzata che produce danno o contraccolpo del bersaglio.
- Pistolacqua: inspirazione, assetto delle braccia, espulsione con lieve contraccolpo della testa e compensazione di corpo/coda, poi recupero. Il muso usa il riferimento originale sotto il naso sul fronte e il bordo della guancia lontana sul retro, dove la bocca è occultata.

Il riferimento del muso applica gli stessi perni, rotazione e scala delle guance del composito. I segmenti d'acqua conservano il punto di nascita e formano un getto breve con coda finita, gocce laterali e spruzzi divergenti all'impatto. Il primo arrivo è al fotogramma68, sincronizzato con l'audio. Un mancato devia il getto sopra la sagoma del bersaglio e non produce spruzzi o reazioni sul bersaglio. Non rimangono acqua o modifiche del terreno dopo la sequenza.

Le meccaniche di PP, danni, precisione e riduzione della Difesa rimangono nel motore GEN5. Disabilitare le animazioni nelle opzioni mantiene il comportamento precedente. Ogni lotta conserva il fondale acquisito dal suo luogo di origine.

## Studio e verifiche

`?oshawott=1` apre lo studio a livello10, con due Oshawott, su Percorso1/erba esplicitamente scelto per la dimostrazione. `&move=55` preseleziona Pistolacqua. Gli studi di Snivy/Tepig restano compatibili. Lo storage della storia è disconnesso e gli eventi della storia sono fermi; nessun nuovo incontro è aggiunto alla partita.

Sei nuovi test coprono le tre coppie e la distinzione dei gesti condivisi; parti originali fronte/retro, perni, ritorno al riposo e coordinate finite per tutti i fotogrammi; mancati e assenza di contraccolpo di Colpocoda; origine, arrivo, coda finita e scale delle traiettorie d'acqua; riferimento del muso e integrazione in MoveFX preservando gli starter precedenti. Totale128 test Node;3 test Python; controlli della build e9 percorsi narrativi.

Prove browser: riproduzione con audio di tutte e tre le mosse su entrambi i lati, mancato Pistolacqua, vista telefono e turni reali con profili corretti e consumo dei PP. Anteprime animate esportate da17 campioni per mossa; nello studio è disponibile la sequenza completa. Sprite articolati bidimensionali: non viene creato un modello3D o aggiunta una posa DS inedita.
