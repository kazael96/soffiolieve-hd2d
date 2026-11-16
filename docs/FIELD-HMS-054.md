# MN sul campo · 0.54

La storia principale è consegnata nella 0.53: [QA-053-FINAL.md](QA-053-FINAL.md). La 0.54 aggiunge le MN personalizzate nel mondo; prove della candidata 08 `e5adb3a82063de78` in [QA-054.md](QA-054.md). Distribuzione effettiva identificata dal [manifest Pages](https://kazael96.github.io/soffiolieve-hd2d/build.json).

## Perimetro e origine

Sono predisposti 105 profili grafica–MN: 60 Taglio, 16 Volo e 29 Surf. Comprendono Basculin a strisce blu, le stagioni di Sawsbuck e le grafiche femminili di Unfezant, Frillish e Jellicent. Il test confronta l'intero inventario con le compatibilità delle MN attualmente insegnabili nei cataloghi estratti. Compatibilità e ottenibilità sono concetti distinti: un profilo per una specie nemica non la rende catturabile. Non vengono aggiunti strumenti, permessi o accessi dopo il finale; Forza, Cascata e Sub non sono attualmente offerte e non rientrano in questa consegna.

I fogli originali dei Pokémon e del protagonista vengono composti nel renderer del mondo. I contatti, le dimensioni dei billboard e le coreografie sono adattamenti HD-2 D, non nuove animazioni estratte dal gioco DS. Rimangono nativi permessi, destinazioni, coste, altezze, incontri e musica già estratti. Le MN sul campo non consumano PP e non ricevono nuovi vincoli su PS o medaglie.

## Integrazione predisposta

- Taglio: il Pokémon esce dalla Ball, si avvicina all'albero e usa foglie, conchiglia, artigli, mandibole, pinne, corna o becco secondo la specie; il flag dell'albero viene applicato una sola volta al contatto. Il rientro viene rappresentato con riduzione verso la Ball e raggio, prima del rilascio del controllo.
- Volo: oltre al cut-in esistente, il Pokémon si presenta nel mondo, il protagonista sale e la coppia esce dall'inquadratura. La posa fuori campo viene mantenuta durante il trasferimento coperto; segue una distinta sequenza di atterraggio, discesa e richiamo. Le coordinate delle destinazioni originali restano invariate.
- Surf: il corpo della specie scelta sostituisce il supporto generico, mantenendo gli spruzzi originali. Il punto di appoggio segue inclinazione e anatomia. Ingresso e discesa separano il nuotatore dal protagonista; il richiamo alla riva ha un checkpoint persistente. Il Pokémon selezionato è conservato anche dopo uno scambio degli slot della squadra.

Le risorse trattengono un solo banco Pokémon fissato e una texture dinamica riutilizzabile di 1 MiB per renderer. Il ripristino del contesto elimina la texture precedente. Una preparazione sostituita non può cambiare la specie attiva. I fallimenti delle risorse non applicano gli esiti delle azioni.

## Regressioni e prove

La candidata 08 ha superato 68 controlli mirati. Le regressioni hanno riprodotto identità del nuotatore persa, cambio della squadra durante la preparazione, migrazione dei salvataggi, permesso di camminare sull'acqua aggirato dalla proprietà successiva della scena e perdita GPU prima della notifica DOM. Sono conservati i relativi FAIL precedenti; il controllo effettivo WebGL rimane nel runtime e nei simulatori completi.

La forma evoluta mantiene visibile il banco della forma precedente fino alla preparazione di entrambe le viste nuove, poi lo sostituisce usando la stessa texture. Il replay esegue realmente Dewott 35→Samurott 36 durante Surf, con risorsa 503-back ritardata, PP0, controllo dell'assenza del supporto generico e roundtrip del salvataggio isolato. È passato nei tre formati.

Il rapporto `browser-field08-all-world-second` ha superato 16 casi per formato,48 in totale: menu a freddo con errore e recupero, Borsa, Interpoké, Taglio/Volo/Surf a×1/×2/×4, Surf→Volo, evoluzione e matrice 105 ×4 pose. Esaminati tutti i 258 PNG. Le 16 coppie di Volo usano una riva nativa leggibile; le occlusioni fisiche del mulino restano presenti. Le catture di salita, decollo e atterraggio provengono dai fotogrammi realmente disegnati, senza un disegno forzato dalla fixture. Il precedente timeout del polling a×4 resta conservato.

Il rapporto `browser-field08-real-finale` ha ripetuto vera cattura di Reshiram, lotte contro N e Ghecis e FINE nei tre formati;24 PNG esaminati. Prerequisiti e limiti sono dichiarati in QA-054. I rapporti 07 restano storici: il loro PASS non sostituisce le nuove prove 08.

Volo comprende undici destinazioni della storia principale. Le tre aggiunte sono ricavate dalla ROM: Mistralopoli 113, Boreduopoli 120 e Lega 136. I427 header e le prime otto destinazioni restano identici. La migrazione richiede prove della visita; otto medaglie da sole non sbloccano la Lega.

Suite completa di 49 stadi, CI del commit esatto e verifica Pages restano criteri obbligatori di consegna. I rapporti sono conservati fuori dalle build in `outputs/chapter054-preparation`. Le candidate 01–07 sono state preservate integralmente con base+delta e inventari SHA256 verificati prima della rimozione H.8. Nessun archivio, sorgente, ROM o rapporto viene rimosso con le copie generate obsolete.

## Matrice dei 105 profili verificati su fotogrammi rappresentativi

Ogni riga indica un profilo nel mondo. Sono passati il confronto delle compatibilità native e i fotogrammi rappresentativi nei tre formati, con la combinazione dei rapporti indicata sopra. I replay dei comandi effettivi usano Servine, Unfezant e Dewott: non affermano 105 campagne complete o l'uso concreto di ciascuna specie in ogni mappa.

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
