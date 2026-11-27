# QA064 — Emboar MISS: piano full-visible

Preparazione candidata: runtime500/205–360 limitato al mirror nativo singles già supportato. Il MISS conserva la posa e la traiettoria breve originali (.48 al contatto/.40 al settle). La sola correzione aggiunge lo stesso arretramento a x/groundX quando il supporto della silhouette completa, incluse coda e fiamme, supera un piano fisso davanti al bersaglio. Non viene attirato fino a un piano di contatto. Con delta0, x/groundX originali sono restituiti esattamente, compreso il segno dello zero.

Il piano usa tutte le fasi idle native effettivamente raggiungibili del bersaglio e un margine di3pixel nativi. Se la posa reale a riposo e l'unione full-idle non sono separabili, la preparazione si arresta: nessun allargamento di home, cambio di framing o fallback al vecchio MISS. Le costanti native derivano dagli originali PNG/JSON, senza modifiche a pixel, OAM, pivot o timing. I36stati sincronizzati default per ciascuna vista hanno periodo1008; i track front da96tick non sono raggiunti dai map default0/1. Il ramo HIT e il suo modello di contatto restano invariati.

Prova CPU privata eseguita dal coordinatore: V3r2,7/7PASS,0skip,10396ms, pin prima/dopo invariati. Confrontate1524pose HIT esatte e1524pose MISS con tutte le chiavi non orizzontali esatte; provati supporto/piano indipendenti, arretramento soltanto, riposi, variazione del tick target, identità bank/data/image e6mutazioni in-place rifiutate. Gli altri6controlli storici sono preservati. Il riferimento emboar-contact-phase2-reference064.cjs non è stato riscritto. Budget180s/heap400MiB/output8MiB e guard interni170s/RSS400MiB invariati.

Il witness delle strutture native è compilato a freddo e verificato nel warm senza nuova serializzazione JSON o contenitori. I dati della prova CPU sono geometria nativa preparata: non includono R.draw su canvas, screenshot, audio o una partita browser. Il payload portabile conserva tutti i corpi/assert della prova privata e adatta soltanto4loader. Nel checkout integrato passano di nuovo7/7controlli in11711ms e il controllo storico di rotolamento in3590ms, con sorgenti invariati. La nuova suite completa CI resta da eseguire sul commit che conterrà questa correzione.

La candidata locale12 ha revisione4ed37d9fe9a925f8 e appSHA256
631d24411695ca2325b80a23c850a863fece75bbdcbac7949f73a543357bfab9.
Usa il sorgente Emboar afc9a4ea7dfec6b7bafc956e57bbca47ea71dff33a4c2dbc7379fd094c963163,
senza la proposta di ottimizzazione dei readback e senza i nuovi CEL di
Minccino. I comandi DOM LOTTA/mossa e la simulazione GEN5 effettivi
passano in Chrome158 invisibile, con profilo e partita isolati:

- verticale390×844 a×1: quattro turni, otto esecuzioni sui due lati,
  35001ms nel caso/59322ms nel lotto,24PNG dell'arena e un catalogo QA;
- orizzontale844×390 a×1/×2/×4: dodici turni,24esecuzioni,
  72606ms nel caso/98274ms nel lotto,72PNG dell'arena e un catalogo QA.

Le durate del lotto comprendono avvio e strumenti di prova: non sono
tempi di caricamento o FPS di un telefono. In entrambi i lotti il cleanup
termina con zero processi proprietari residui; il browser personale non
viene collegato. Il CDP registra i programmi effettivamente compilati,
distinti dai soli pin dei file su disco. Un revisore indipendente apre
tutti i25PNG verticali: i MISSstep5/P1 e8/P2 al contatto60 mostrano
sfondo fra le appendici complete e il bersaglio; nessun nuovo taglio
concreto nei24campioni dell'arena. Root rilegge quei due originali e
il catalogo QA. Le letture complete degli altri lotti restano separate.

Verifica grafica/GPU ancora richiesta: completare i3formati a×1/×2/×4,
con lettura delle immagini effettivamente esportate e giudizio distinto
su continuità/naturalezza. I PNG dell'arena senza interfaccia non
certificano l'HUD completo o il movimento continuo. Il PASS CPU non
approva tutte le mosse/art della demo o le altre animazioni ancora
trattenute. I FAIL V3 e la correzione signed-zero V3r2 rimangono
evidenze storiche distinte. Nessuna pubblicazione è implicita.
