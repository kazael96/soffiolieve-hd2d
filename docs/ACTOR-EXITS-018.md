# Demo 0.18: uscite dei personaggi senza sparizioni visibili

Implementa il primo requisito permanente dell'utente. Le regole sugli sfondi di lotta e sulle animazioni Pokémon–mossa rimangono lavori distinti.

## Comportamento

Il comando della ROM può rimuovere un attore dalla logica della scena, ma non cancella direttamente il suo corpo dal rendering. Il nuovo controllore conserva la sua rappresentazione visiva e ne completa l'uscita. Movimento69 e ActorDelete passano entrambi da questo sistema. Il Regalo consumato nella camera è un oggetto, non viene fatto camminare verso un'uscita.

- Scala della camera: Komor e Belle raggiungono il gradino e scendono sotto il piano della scala. Nessuna dissolvenza del personaggio.
- Porte delle case e del laboratorio: il corpo attraversa il portale della stanza; il ritaglio avviene nel piano del passaggio, non diminuendo l'opacità. Le aperture necessarie usano i modelli animati delle porte; le aperture già controllate dallo script originale non vengono riavviate.
- Rientri all'aperto: Belle può completare il percorso verso casa, Mamma verso la propria abitazione. Queste estensioni sono adattamenti HD-2D autorizzati, non percorsi attribuiti alla ROM.
- Partenze sul campo esterno connesso: proseguono lungo celle percorribili verso nord. L'evento narrativo può terminare mentre il personaggio continua a camminare. Se al limite del percorso il personaggio è ancora visibile, resta rappresentato finché non è realmente coperto, fuori vista o il campo viene interamente nascosto da una transizione. Non viene forzata una sparizione per rispettare una scadenza.

## Garanzia di visibilità

Il renderer esegue un passaggio dedicato del corpo, con la stessa geometria dello sprite, texture trasparente, proiezione, profondità del mondo e piano del portale. Il risultato non viene mostrato sullo schermo. Si considera invisibile soltanto quando non rimane alcun pixel del corpo visibile, per due risultati di rendering distinti. Il controllo segue il viewport, la camera e lo zoom correnti.

Texture mancanti, framebuffer incompleto, errori di lettura e risultati relativi a una posa differente non costituiscono una prova di invisibilità. Una prova mancante interrompe la sequenza di conferme. La rimozione visiva non dipende dalla sola posizione del piede o da un rettangolo approssimativo che ignora edifici e sprite.

## Continuità delle scene

La ricostruzione degli attori preserva i residenti ancora visibili fra Soffiolieve e Percorso1. Le identità dei personaggi principali rimangono uniche anche quando le due mappe native hanno UID differenti. Un rientro viene raccordato alla rappresentazione precedente, senza eliminare un corpo per mostrarne un altro a distanza nello stesso fotogramma.

Le partenze e le posizioni visive vengono salvate nell'estensione originale del salvataggio. Al caricamento si riparte da quella posizione e si scartano le vecchie conferme GPU. Gli attori predefiniti del vecchio prototipo non vengono conservati al primo caricamento della scena.

I cambi di mappa ricostruiscono gli attori soltanto con il campo interamente coperto. Il completamento della copertura viene fissato esplicitamente, senza assumere che l'ultimo fotogramma di una transizione CSS sia già opaco. I riposizionamenti di personaggi già presentati vengono raccordati visivamente; le inizializzazioni non ancora mostrate non inventano percorsi di ingresso.

## Verifiche

- Inventario completo dei punti originali:18 ActorDelete, dei quali17 persone e un oggetto; cinque movimenti69, già compresi nelle rimozioni. Coordinate e programmi in `ACTOR-EXIT-AUDIT.md`.
- Sette test del controllore: corpo visibile e prova assente, doppia conferma GPU, porte/scala, continuità fra mappe, salvataggio del portale, nuova cancellazione durante un raccordo, collisioni e oggetti.
- Suite completa:96 test Node. Verifica del generatore con tre test Python; build con hash dell'archivio e delle risorse.
- Nove percorsi automatici della storia,14 porte/scale e62 interazioni. Queste prove usano un campionatore di visibilità simulato dichiarato; non vengono presentate come prova di occlusione grafica.
- Prove del rendering reale nel browser su pagine QA isolate: scala, porte interne, ingresso del laboratorio, percorso esterno, cambio della camera e salvataggio/ripresa. Controlli su viewport desktop e390×844, con zoom supportati. Le pagine QA non sono distribuite nella build pubblica.

## Limiti pratici

Le celle aggiuntive e il raccordo degli attori sono adattamenti del porting. Una partenza all'aperto può restare visibile più a lungo rispetto al DS, specialmente con zoom minimo e schermo verticale; è il comportamento voluto per evitare il pop. Il percorso della storia non attende indefinitamente questa rappresentazione residua. Non è stato eseguito un collaudo su un telefono fisico: la verifica verticale usa il browser con viewport390×844.
