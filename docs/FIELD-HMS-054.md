# MN sul campo · candidata 0.54

La storia principale è consegnata nella 0.53: PR47 integrata, controlli automatici e Pages superati, codice pubblico verificato e avvio a freddo provato nel browser isolato. Rapporto di accettazione: [QA-053-FINAL.md](QA-053-FINAL.md). La 0.54 è una candidata privata; le prove grafiche disponibili e i controlli ancora necessari sono distinti sotto.

## Perimetro e origine

Sono predisposti 105 profili grafica–MN: 60 Taglio, 16 Volo e 29 Surf. Comprendono Basculin a strisce blu, le stagioni di Sawsbuck e le grafiche femminili di Unfezant, Frillish e Jellicent. Il test confronta l'intero inventario con le compatibilità delle MN attualmente insegnabili nei cataloghi estratti. Compatibilità e ottenibilità sono concetti distinti: un profilo per una specie nemica non la rende catturabile. Non vengono aggiunti strumenti, permessi o accessi dopo il finale; Forza, Cascata e Sub non sono attualmente offerte e non rientrano in questa consegna.

I fogli originali dei Pokémon e del protagonista vengono composti nel renderer del mondo. I contatti, le dimensioni dei billboard e le coreografie sono adattamenti HD-2D, non nuove animazioni estratte dal gioco DS. Rimangono nativi permessi, destinazioni, coste, altezze, incontri e musica già estratti. Le MN sul campo non consumano PP e non ricevono nuovi vincoli su PS o medaglie.

## Integrazione predisposta

- Taglio: il Pokémon esce dalla Ball, si avvicina all'albero e usa foglie, conchiglia, artigli, mandibole, pinne, corna o becco secondo la specie; il flag dell'albero viene applicato una sola volta al contatto. Il rientro viene rappresentato con riduzione verso la Ball e raggio, prima del rilascio del controllo.
- Volo: oltre al cut-in esistente, il Pokémon si presenta nel mondo, il protagonista sale e la coppia esce dall'inquadratura. La posa fuori campo viene mantenuta durante il trasferimento coperto; segue una distinta sequenza di atterraggio, discesa e richiamo. Le coordinate delle destinazioni originali restano invariate.
- Surf: il corpo della specie scelta sostituisce il supporto generico, mantenendo gli spruzzi originali. Il punto di appoggio segue inclinazione e anatomia. Ingresso e discesa separano il nuotatore dal protagonista; il richiamo alla riva ha un checkpoint persistente. Il Pokémon selezionato è conservato anche dopo uno scambio degli slot della squadra.

Le risorse trattengono un solo banco Pokémon fissato e una texture dinamica riutilizzabile di 1 MiB per renderer. Il ripristino del contesto elimina la texture precedente. Una preparazione sostituita non può cambiare la specie attiva. I fallimenti delle risorse non applicano gli esiti delle azioni.

## Regressioni e stato delle prove

La candidata07 ha completato tutti i49 stadi automatici (1300.846s), ma una nuova regressione indipendente ha trovato la sparizione temporanea del nuotatore durante il caricamento della forma evoluta. La correzione08 conserva una copia dell’identità grafica già pronta e riusa la stessa texture finché il nuovo banco è completo;68 controlli mirati passati. Questa modifica richiede nuova build e replay grafici prima della consegna. I rapporti07 sotto restano prove storiche, senza certificare la08.

Tre nuovi test hanno riprodotto l'assenza dell'identità del nuotatore, la sostituzione della squadra durante il caricamento e la migrazione dei vecchi salvataggi; fallivano prima della correzione. È stato inoltre riprodotto un problema precedente: la proprietà successiva delle mappe di Mistralopoli aggirava il controllo dell'acqua. Il nuovo test falliva camminando sull'acqua; la correzione dà precedenza ai permessi di Surf per il giocatore, conservando i percorsi degli NPC.

Il confronto numerico comprende tutte le105 coppie. Sono passati67 controlli mirati, incluse immersione, orientamento est indipendente del protagonista, quote di richiamo, due orientamenti preparati, migrazioni e gestione delle risorse. Sono passati anche i due controlli Python del server locale.

La candidata07 `9c67100e2cd06ff6` ha renderizzato105×4 pose in ciascuno dei tre formati. Sono stati esaminati tutti i66 PNG; le pose al suolo di Volo nel riferimento cittadino erano parzialmente nascoste dagli edifici, quindi non sono state accettate come prova completa dell'anatomia. Le16 coppie di Volo sono state ripetute sulla stessa candidata da una riva nativa:64 pose per formato, tutte superate,15 PNG esaminati. La copertura delle105 coppie combina Taglio60 e Surf29 della prima matrice con Volo16 della seconda. Si tratta di fotogrammi rappresentativi delle fasi, non di ogni fotogramma di ogni possibile luogo di partenza.

I replay effettivi07 nei tre formati hanno superato Taglio, Volo e Surf a×1/×2/×4, comprese due vere perdite/riprese GPU durante ogni prova di Surf×2. Il cambio dal Dewott nuotatore a Unfezant con Volo è passato anche senza scendere prima a riva. Il primo tentativo06 aveva riprodotto una condizione di gara: il contesto GPU era già perso prima della relativa notifica DOM e il caricamento della texture MN generava un errore permanente. La regressione fallisce sulla06 e passa sulla07: presentazione e ciclo del gioco controllano lo stato effettivo del contesto prima di caricare. Lo stato di prova di Volo è isolato dalle visite lasciate dalla precedente prova di Surf; la migrazione del gioco non è stata indebolita.

Volo comprende undici destinazioni della storia principale. Le tre aggiunte sono ricavate dalla ROM: Mistralopoli113, Boreduopoli120 e Lega136; non sono gli header degli interni dei Centri Pokémon. I427 header e le prime otto destinazioni rimangono identici. La migrazione richiede prove della visita, senza sbloccare la Lega per il solo possesso di otto medaglie.

Matrice e replay effettivi di Taglio, Volo e Surf hanno superato i tre formati, comprese velocità×1/×2/×4 e due riprese GPU di Surf×2. Il cambio diretto dal Dewott nuotatore a Unfezant con Volo è passato nei tre formati. Sono stati esaminati tutti i PNG dei rapporti accettati; i tentativi falliti restano conservati. Restano necessari regressione del finale, suite completa, CI e verifica del codice pubblico. I rapporti falliti sono preservati. Le candidate01–06 sono archiviate integralmente mediante base e delta verificati e rimosse secondo H.8. Restano la0.52 per confronti, la0.53 verificata e la candidata07. Rapporti e PNG sono conservati in `outputs/chapter054-preparation`, fuori dalle build. Il browser è headless con rendering software e salvataggi isolati; non certifica una GPU Android fisica né un confronto udibile con la cartuccia.

## Matrice dei105 profili verificati su fotogrammi rappresentativi

Ogni riga indica un profilo nel mondo. Sono passati il confronto delle compatibilità native e i fotogrammi rappresentativi nei tre formati, con la combinazione dei rapporti indicata sopra. I replay dei comandi effettivi usano Servine, Unfezant e Dewott: non affermano105 campagne complete o l'uso concreto di ciascuna specie in ogni mappa.

| Grafica | Pokémon / forma | MN | Gesto |
|---|---|---|---|
| 495 | Snivy | Taglio | leafCut |
| 496 | Servine | Taglio | leafCut |
| 497 | Serperior | Taglio | leafCut |
| 501 | Oshawott | Taglio | shellCut |
| 502 | Dewott | Taglio | shellCut |
| 503 | Samurott | Taglio | shellCut |
| 504 | Patrat | Taglio | clawCut |
| 505 | Watchog | Taglio | clawCut |
| 509 | Purrloin | Taglio | clawCut |
| 510 | Liepard | Taglio | clawCut |
| 511 | Pansage | Taglio | clawCut |
| 512 | Simisage | Taglio | clawCut |
| 513 | Pansear | Taglio | clawCut |
| 514 | Simisear | Taglio | clawCut |
| 515 | Panpour | Taglio | clawCut |
| 516 | Simipour | Taglio | clawCut |
| 529 | Drilbur | Taglio | clawCut |
| 530 | Excadrill | Taglio | clawCut |
| 540 | Sewaddle | Taglio | leafCut |
| 541 | Swadloon | Taglio | leafCut |
| 542 | Leavanny | Taglio | leafCut |
| 545 | Scolipede | Taglio | mandibleCut |
| 548 | Petilil | Taglio | leafCut |
| 549 | Lilligant | Taglio | leafCut |
| 550 | Basculin | Taglio | finCut |
| 551 | Sandile | Taglio | clawCut |
| 552 | Krokorok | Taglio | clawCut |
| 553 | Krookodile | Taglio | clawCut |
| 557 | Dwebble | Taglio | shellCut |
| 558 | Crustle | Taglio | shellCut |
| 566 | Archen | Taglio | clawCut |
| 567 | Archeops | Taglio | clawCut |
| 571 | Zoroark | Taglio | clawCut |
| 586 | Sawsbuck | Taglio | hornCut |
| 587 | Emolga | Taglio | clawCut |
| 588 | Karrablast | Taglio | shellCut |
| 589 | Escavalier | Taglio | shellCut |
| 595 | Joltik | Taglio | mandibleCut |
| 596 | Galvantula | Taglio | mandibleCut |
| 598 | Ferrothorn | Taglio | leafCut |
| 604 | Eelektross | Taglio | finCut |
| 610 | Axew | Taglio | hornCut |
| 611 | Fraxure | Taglio | hornCut |
| 612 | Haxorus | Taglio | hornCut |
| 613 | Cubchoo | Taglio | clawCut |
| 614 | Beartic | Taglio | clawCut |
| 621 | Druddigon | Taglio | clawCut |
| 624 | Pawniard | Taglio | hornCut |
| 625 | Bisharp | Taglio | hornCut |
| 626 | Bouffalant | Taglio | hornCut |
| 629 | Vullaby | Taglio | beakCut |
| 630 | Mandibuzz | Taglio | beakCut |
| 631 | Heatmor | Taglio | clawCut |
| 632 | Durant | Taglio | mandibleCut |
| 643 | Reshiram | Taglio | clawCut |
| 644 | Zekrom | Taglio | clawCut |
| 699 | Basculin-Blue-Striped | Taglio | finCut |
| 704 | Sawsbuck-Summer | Taglio | hornCut |
| 705 | Sawsbuck-Autumn | Taglio | hornCut |
| 706 | Sawsbuck-Winter | Taglio | hornCut |
| 519 | Pidove | Volo | wingFlight |
| 520 | Tranquill | Volo | wingFlight |
| 521 | Unfezant | Volo | wingFlight |
| 521-female | Unfezant | Volo | wingFlight |
| 527 | Woobat | Volo | wingFlight |
| 528 | Swoobat | Volo | wingFlight |
| 561 | Sigilyph | Volo | wingFlight |
| 567 | Archeops | Volo | wingFlight |
| 580 | Ducklett | Volo | wingFlight |
| 581 | Swanna | Volo | wingFlight |
| 623 | Golurk | Volo | rocketFlight |
| 629 | Vullaby | Volo | wingFlight |
| 630 | Mandibuzz | Volo | wingFlight |
| 635 | Hydreigon | Volo | wingFlight |
| 643 | Reshiram | Volo | wingFlight |
| 644 | Zekrom | Volo | wingFlight |
| 501 | Oshawott | Surf | paddle |
| 502 | Dewott | Surf | paddle |
| 503 | Samurott | Surf | paddle |
| 507 | Herdier | Surf | paddle |
| 508 | Stoutland | Surf | paddle |
| 515 | Panpour | Surf | paddle |
| 516 | Simipour | Surf | paddle |
| 531 | Audino | Surf | paddle |
| 535 | Tympole | Surf | tailSwim |
| 536 | Palpitoad | Surf | paddle |
| 537 | Seismitoad | Surf | paddle |
| 550 | Basculin | Surf | tailSwim |
| 564 | Tirtouga | Surf | paddle |
| 565 | Carracosta | Surf | paddle |
| 580 | Ducklett | Surf | waterBird |
| 581 | Swanna | Surf | waterBird |
| 592 | Frillish | Surf | bellSwim |
| 592-female | Frillish | Surf | bellSwim |
| 593 | Jellicent | Surf | bellSwim |
| 593-female | Jellicent | Surf | bellSwim |
| 594 | Alomomola | Surf | tailSwim |
| 612 | Haxorus | Surf | paddle |
| 613 | Cubchoo | Surf | paddle |
| 614 | Beartic | Surf | paddle |
| 618 | Stunfisk | Surf | tailSwim |
| 621 | Druddigon | Surf | paddle |
| 626 | Bouffalant | Surf | paddle |
| 635 | Hydreigon | Surf | levitateSwim |
| 699 | Basculin-Blue-Striped | Surf | tailSwim |
