# Percorso 4 e arrivo a Sciroccopoli · 0.47

Prosecuzione dopo Belle al varco nord di Austropoli, fino all'arrivo nella città successiva. Limite di allenamento 25; conservati i livelli e gli XP superiori dei salvataggi precedenti. Il capitolo non comprende ancora palestra di Camelia, luna park/N, Teatro Musical, Deserto della Quiete, Castello Sepolto e percorsi successivi. Le relative entrate segnalano il confine senza avviare script incompleti. Il negozio conserva il catalogo base della demo: non sono ricostruiti tutti i cataloghi dinamici del gioco DS.

## Eventi e continuità

| Passaggio | Prerequisiti | Posizione, uscita e destinazione |
| --- | --- | --- |
| Sfida di Komor | Medaglia Scarabeo e sfida con Belle conclusa; variabile 16540=1 | Komor sul tratto meridionale del Percorso 4; squadra originale scelta dallo starter, quattro Pokémon di livello 20–22. Segue la chiamata Interpoké 4 di Aralia, Komor e Alcide. |
| Komor verso il varco | Sfida conclusa | Cammina sulla strada verso l'ingresso nord; il viaggio continua anche se il giocatore cambia mappa. Entra dalla porta sud del varco, raggiunge la posizione prevista e aspetta. Il trigger attende l'arrivo effettivo senza bloccare il controllo. Il percorso e la sua fase sopravvivono al salvataggio. |
| Dono di Aralia | Komor arrivato e variabile 16578=0 | Aralia e Komor nel varco; dieci Ultra Ball una sola volta. Aralia riparte verso Belle a sud. Komor dichiara di voler catturare Pokémon sul Percorso 4 e riparte a sud; non viene inviato arbitrariamente alla città. |
| Arrivo a Sciroccopoli | Dono nel varco concluso | I seguaci minacciano il proprietario della Pensione. Lotta originale contro Watchog e Trubbish di livello 18. I seguaci escono verso il luna park; il proprietario verso il varco sud e la Pensione del Percorso 3. Ricezione della Bicicletta una volta sola. |
| Belle in città | Seguaci sconfitti | Belle entra dalla porta sud, sulla quota corretta della piazza, e parla del Teatro Musical, poi cammina verso la posizione nativa davanti al Teatro. La stessa identità visiva viene riadottata senza duplicazioni. L'attività Musical resta al capitolo successivo. |
| Centro e case | Accessi percorribili | Centro di Sciroccopoli con infermiera, PC e negozio; casa di riposo del Percorso 4 con cura e casa del dono della MT28 Fossa. Interazioni attraverso i banconi, cure ripetute e ritorno al Centro dopo una sconfitta. |

Zone nuove: 326 Percorso 4, 327 casa di riposo, 328 casa MT28, 90 varco, 62 esterno Sciroccopoli, 65 Centro. Sono usate geometria, griglie, attori, testi e programmi IRBI originali. Gli eventi futuri del Musical e della stazione non vengono avviati dai trigger della città. Le coordinate globali delle nuove mappe non sono troncate ai vecchi limiti dei salvataggi.

## Lotte, specie e strumenti

Quattro contesti espliciti e immutabili: strada del Percorso 4, sabbia, costa e piazza di Sciroccopoli. Ambienti ricomposti dalla geometria e dalle texture locali per la camera HD-2D. Nei fondali del Percorso 4 sono presenti, lontano dai combattenti, Sandile, Darumaka e Scraggy: sono effettivamente catturabili sulla sabbia scura, ai livelli nativi 15–18. Nessun selvatico viene inventato in città. L'acqua costiera resta non attraversabile senza Surf.

Le lotte sul Percorso 4 hanno tempesta di sabbia naturale senza scadenza di cinque turni; restano le immunità e le altre regole di quinta generazione. Un meteo esplicitamente impostato dalla lotta conserva il proprio comportamento. La proiezione dei granelli è un adattamento HD-2D.

Basculin nelle due forme, Darumaka, Scraggy e Trubbish ampliano il roster predisposto. Sandile, Darumaka e Scraggy diventano catturabili; Basculin e Trubbish sono avversari in questo capitolo. La forma blu usa il grafico originale 699 e il dato personale 665, conservando la distinzione Testadura/Adattabilità rispetto alla forma rossa. Non deve passare dal ripiego Snivy del convertitore di specie base.

La matrice complessiva comprende [646 coppie su 49 specie e forme](SPECIES-MOVES-047.md), con rig anatomici, emissioni, gesti e reazioni sui due lati. Si aggiungono le compatibilità native di MT28 Fossa e MT41 Attaccalite, strumenti raccoglibili e icone originali. Ultra Ball usa moltiplicatore di cattura 2 e le proprie celle originali; Antiscottatura, Precisione X e Baccacedro sono disponibili nei rispettivi contesti e menu. Le macchine non vengono consumate.

## Risorse e adattamenti

La geometria e le texture del capitolo si caricano all'arrivo attraverso un pacchetto separato; prima della presentazione vengono preparati i fotogrammi effettivamente necessari. Conservati cache limitate e recupero delle sole risorse della 0.44/0.45. La Bicicletta prepara i suoi 16 fotogrammi originali prima della salita, si usa dalla Borsa o dal pulsante Y se assegnata, scende negli interni e non riappare dopo un caricamento vecchio. Movimento continuo e velocità sono adattati al browser.

Musica originale di Sciroccopoli (SSEQ1029), Bicicletta (1012), Percorso 4 stagionale (1042–1045), renderizzata con il driver DS già usato nel progetto. La stagione mensile sceglie la sequenza; i loop provengono dal rendering del driver. All'uscita dalla Bicicletta torna la musica del luogo. Audio automatico, ascolto comparato e prova su GPU Android fisica restano evidenze distinte.

Non sono distribuiti ROM o archivi NARC grezzi. Camera, fondali di lotta, movimenti corporei e trasferimenti degli NPC sono adattamenti HD-2D; non sono una promessa di uguaglianza al renderer DS o di emulazione completa delle funzioni wireless. Prove e stato effettivo della consegna in [QA-047.md](QA-047.md).
