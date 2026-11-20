# Lancio di Aralia con pose complete · 0.63

Richiesta del20 novembre2026: usare le nuove skill per rifare il lancio e guidare tutte le animazioni. [ANIMATION-QUALITY.md](ANIMATION-QUALITY.md) registra la regola generale. Questa implementazione riguarda il lancio introduttivo; non dichiara rifatte tutte le coreografie esistenti.

## Metodo e risorse

Il lancio0.62 ruotava i ritagli di una figura sostanzialmente statica; l'utente lo ha giudicato innaturale. Il nuovo banco comprende12 pose complete prodotte con il tool integrato Imagegen usando la figura nativa di Aralia come riferimento. Ogni posa ridisegna corpo e braccia con variazioni coerenti di ginocchia, bacino, busto, testa e camice. Non si tratta di un'animazione estratta dalla ROM. Le figure native e le loro parti restano intatte.

I due output originali e i prompt sono conservati fuori dalle build in `outputs/chapter063-preparation`. La seconda sorgente viene impacchettata su un atlante768×576 con celle192×192: scala uniforme0,375 nearest, pivot sul punto della scarpa anteriore ispezionato, alpha della frangia inferiore a128 rimosso, senza centrare separatamente i riquadri variabili. La figura mantiene circa127 pixel utili, resa a122 pixel logici. Il PNG versionato e il suo SHA entrano nel catalogo, nel manifest e nei controlli pubblici.

Le pose coprono riposo, discesa della mano, caricamento, punto arretrato, passaggio davanti al bacino, rilascio, due fasi di accompagnamento e recupero. Sono associate a0/14/26/34/40/46/52/61/76/100/128/139, con ritorno al riposo al150. Il checkpoint26 aggiunto preserva la seconda fase di caricamento anche a×4 con fotogrammi lenti. Il gesto mantiene durata nominale e lanci/apertura/verso ai fotogrammi46/76/112, Minccino86 e appoggio128.

## Contatti e traiettorie

Il corpo usa una sola cella intera, senza le precedenti rotazioni di braccio, busto o testa. Il punto del palmo è misurato per ciascuna posa; la sfera appoggia sopra la mano invece di coprirla con il proprio centro. Il volo eredita lo spostamento dell'ultimo intervallo autoriale40→46. Non si deduce una velocità fisica dalla derivata nulla di un cel fermo. Il ritorno rallenta verso la presa; il primo percorso che passava davanti al viso è stato rifiutato nella prova e sostituito da un rientro basso. Apertura, apparizione, verso, ombra di Minccino e recupero mantengono le regole precedenti.

Lo stesso riposo compare nei dialoghi prima e dopo il lancio, evitando il salto fra la vecchia figura e il nuovo banco. Se manca l'atlante completo il caricamento fallisce e si recupera; non si presenta la vecchia coreografia rifiutata come ripiego riuscito. Il PNG viene decodificato una volta, con1,69MiB per la superficie RGBA, senza allocazioni per fotogramma nel disegno del corpo.

## Prove richieste

- Conservare il FAIL dei vecchi contratti di rig, distinguendo il passaggio ai cels dai regressi; verificare contatto proiettato dalla vera drawImage, ancoraggi, slancio tra pose e rientro sotto il viso.
- Esaminare la sequenza completa nel pilot, poi l'introduzione reale. I pilot servono alla critica del movimento e non sostituiscono il percorso di produzione.
- Replay12 casi nei tre formati e alle tre velocità, con ogni cel osservato nella vera drawImage, matrice priva di rotazioni, alpha e margini delle12 celle decodificate e recupero di un guasto reale al nuovo atlante oltre a quello della Ball.
- Conservare le sette epoche, movimento camera/grafica, identità e recupero da perdita reale del contesto privato. Il nuovo checkpoint porta le immagini del replay a120, con17 pose del lancio per formato.
- Suite completa49, introduzione, avvio, tre salvataggi e regressioni pertinenti; revisione dei PNG effettivi, H.8, CI/Pages e verifica del codice pubblico prima della consegna.

I rapporti correnti risiedono fuori dalle build in `outputs/chapter063-*`. Questo documento descrive implementazione e criteri: solo i rapporti prodotti e la ricevuta finale dichiarano i PASS effettivi. Nessuna certificazione di Android fisico, confronto audio all'ascolto o revisione indipendente è implicata dalle prove dello stesso agente.
