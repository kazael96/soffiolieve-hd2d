# Regole permanenti di sviluppo

Richieste dall'utente il27 ottobre 2026. Valgono per la demo, le revisioni successive e la futura versione completa. Sono criteri di accettazione, non semplici preferenze. La resa rimane HD-2D; queste richieste autorizzano ad adattare la messa in scena originale.

## Standard obbligatori per ogni modifica

Consolidamento richiesto il 29 ottobre 2026. Questi standard valgono per demo e futura versione completa, anche quando cambia chi lavora al progetto. Le sezioni storiche sotto documentano l’avanzamento; non riducono il perimetro richiesto successivamente. Registrare uno standard non equivale ad averne completato l’implementazione.

### A. Continuità degli eventi e degli NPC

- Ogni evento deve dichiarare prerequisiti, attori necessari, posizione iniziale, percorso di uscita, destinazione e prossimo evento. Aggiornare l’inventario narrativo insieme al codice.
- La destinazione deve essere coerente con il prossimo incontro. Un NPC arrivato resta disponibile nella posizione prevista; non viene ritirato perché fuori camera. Nessuna duplicazione, teletrasporto o sparizione visibile durante i passaggi fra mappe, porte e salvataggi.
- Collisioni e interazioni seguono il corpo effettivamente presente e il suo movimento. Una futura posizione logica ancora vuota non deve bloccare il giocatore. Un personaggio proiettato da una mappa adiacente non deve eseguire lo script della mappa sbagliata.
- Un evento che richiede più personaggi parte quando sono effettivamente arrivati. Se il giocatore arriva prima mantiene il controllo; il trigger viene rivalutato anche se resta fermo. Impedire avvii duplicati e sovrapposizioni di script.
- Evitare attese fisse superflue. Movimento, caricamento, porte e animazioni devono segnalare il completamento; errori o interruzioni devono lasciare un recupero praticabile senza blocchi permanenti.
- Verificare arrivo anticipato/tardivo, uscita e rientro dal trigger, camera e zoom supportati, ×1/×2/×4 e ricarica nelle fasi di partenza, viaggio, porta, arrivo e riadozione.

Riferimento corrente: [CITY-CONTINUITY-037.md](CITY-CONTINUITY-037.md). Dopo il tutorial Aralia va al Centro Pokémon di Quattroventi; Komor e Belle al confronto sul Percorso 1, poi rispettivamente verso la piazza e il Centro. Il ritorno di Aralia al laboratorio della 0.34 è superato.

### B. Fedeltà e presentazione HD-2D

- Conservare ambienti, edifici, personaggi, Pokémon, testi, comandi, menu e schermate riconoscibili di Pokémon Nero italiano. Usare i riferimenti e i dati originali disponibili, documentando gli adattamenti necessari al browser e alla resa HD-2D.
- Mantenere visuale bassa e zoom supportati, HUD essenziale nello stile originale e leggibilità su telefono. Non reintrodurre pannelli tecnici nella partita; gli strumenti di collaudo restano separati.
- Preservare le correzioni di illuminazione, texture, trasparenze e giunzioni degli sprite. Vietati ripieghi bianchi o risorse mancanti presentati come resa completa.

### C. Sfondi e presenza ambientale nelle lotte

- Selezionare e fissare il contesto geografico all’inizio di ogni lotta, compresi tutorial e storia. Ogni nuovo luogo combattibile richiede fondale e terreno espliciti, coerenti con l’ambiente originale.
- Combattenti e Pokémon ambientali devono poggiare sul terreno con prospettiva, scala, occlusione e ombre coerenti. Nessuno sprite tagliato o apparentemente sospeso.
- Dove plausibile inserire sullo sfondo alcune specie effettivamente catturabili nel luogo: due o tre diverse quando disponibili, senza inventare specie per raggiungere il numero. Tenerle nella fascia lontana, separate dall’azione e dai combattenti; non aggiungerle indiscriminatamente a ogni interno.
- Verificare tutte le ambientazioni effettivamente combattibili e i cicli delle presenze ambientali ai formati supportati, anche durante gli effetti delle mosse.

### D. Mosse, Pokémon e reazioni

- Misurare la copertura per coppia specie/forma–mossa, includendo ogni fonte di apprendimento resa disponibile. La priorità iniziale entro il livello 10 è stata ampliata a tutte le mosse utilizzabili nella demo: mantenere e aggiornare la [matrice corrente](SPECIES-MOVES-036.md), oggi di 83 coppie.
- Animare coerentemente sia la mossa sia il Pokémon che la esegue: corpo, anatomia, punto di emissione/contatto, traiettorie e recupero. Integrare effetti originali, sequenze senza particelle, contesti speciali e movimenti di camera pertinenti.
- Ogni coreografia e reazione deve funzionare per il giocatore e per l’avversario. Il bersaglio reagisce in modo coerente con impatto, esito, stato e numero dei colpi; distinguere mancato bersaglio, fallimento e mosse rivolte a sé stessi.
- Conservare danni, precisione, PP, priorità, abilità, stati e altre regole di Pokémon Nero. Nessuna alterazione delle meccaniche per semplificare una coreografia. Una prova di esecuzione senza eccezioni non certifica da sola la fedeltà delle regole.

### E. Audio e sincronizzazione

- Conservare musica del luogo e delle lotte, versi ed effetti delle mosse originali, comprese modulazioni dinamiche di pitch e volume quando previste dai dati.
- Sincronizzare audio, gesto, emissione, impatto e camera. Verificare il comportamento a ×1/×2/×4, con audio attivo/disattivo, passaggio in secondo piano e ripresa; nessuna sovrapposizione incontrollata o attesa bloccata dall’audio.
- Rispettare l’attivazione dell’audio tramite gesto richiesta dal browser. Dichiarare separatamente test automatici del segnale e confronto udibile: non affermare di aver ascoltato ciò che non è stato ascoltato.

### F. Comandi, menu e servizi

- Tastiera e touch devono funzionare in esplorazione, dialoghi, scelte, Squadra, Borsa e schermate secondarie. A conferma/interagisce, B annulla/torna; conservare selezione e contesto quando si rientra, senza input propagati alla schermata sottostante.
- Verificare pressione singola, ripetizione e rilascio, pointer cancel/perdita del focus e input rapidi. Evitare doppi acquisti, doppie cure e transizioni duplicate.
- Preservare ×1/×2/×4 accessibile fuori menu e riavvio con conferma. Annullare il riavvio non cambia la partita; confermarlo non deve ripristinare il vecchio salvataggio.
- Infermiera, negozi e altri servizi devono essere raggiungibili dalla posizione prevista, anche attraverso i banconi appropriati. Verificare cure ripetute di PS/PP/stati, costi, quantità e limiti della Borsa.

### G. Salvataggi, risorse e interruzioni

- Conservare la compatibilità con i salvataggi precedenti; documentare le migrazioni e verificare la ripresa degli eventi e degli itinerari. Non cancellare silenziosamente la partita per aggirare un bug.
- Errori temporanei di immagini, font, dati o audio non devono restare memorizzati come fallimenti permanenti. Consentire tentativi ripetuti, pulire le schermate incomplete e mostrare un messaggio recuperabile.
- Verificare perdita e ripristino del contesto grafico, background/ripresa e frame rate basso. Convalidare i dati persistenti interessati; isolare record danneggiati quando possibile senza compromettere quelli validi.
- I test usano fixture e salvataggi isolati, mai la partita reale del giocatore.

### H. Criteri di consegna e regressione

1. Leggere AGENTS.md e questo documento; individuare regole, inventari e correzioni precedenti interessati prima di modificare il codice.
2. Per ogni bug riproducibile aggiungere una regressione significativa che fallisca prima della correzione. Per nuove funzioni coprire percorso normale, confini ed errori pertinenti; non duplicare soltanto l’implementazione nel test.
3. Eseguire i controlli pertinenti e, per modifiche al runtime, la suite completa con `node scripts/test-deep.cjs <build> <rapporti> --python=<python>`. La base 0.38 è di 199 test Node, 3 Python e 11 fasi: il numero non è un obiettivo che sostituisce la copertura.
4. Se cambiano grafica, comandi o flussi narrativi, usare anche la fixture browser: desktop 1280×720, telefono verticale 390×844 e orizzontale 844×390 secondo l’area interessata. Verificare visualmente le scene e salvare rapporti/prove della build effettiva. Per itinerari e servizi riprodurre gli eventi con renderer reale e input A/touch.
5. Ogni nuova scena, evento, specie, mossa o fonte di apprendimento aggiorna inventario, prove e limiti. Distinguere richiesto, implementato e verificato; uno scenario non eseguito non risulta superato.
6. Mantenere i controlli automatici nelle PR e prima di Pages. Integrare dopo i controlli pertinenti, nell’autorizzazione già concessa dall’utente. Una modifica solo documentale richiede verifica di coerenza, collegamenti e diff; non richiede di rieseguire combattimenti o pubblicare una nuova versione del gioco.
7. Dopo una pubblicazione del runtime verificare versione e codice effettivamente serviti dal link pubblico. Non dichiarare completata la distribuzione dal solo push o merge.

Un controllo fallito va corretto o segnalato con causa e limite concreto; non rimuoverlo per ottenere un rapporto verde. Le prove su viewport telefono non certificano ogni GPU Android fisica e nessuna suite dimostra assenza assoluta di bug.

## 1. Uscite e sparizioni dei personaggi

Un personaggio non deve sparire in un punto che il giocatore può vedere. Prima della rimozione deve raggiungere un'uscita coerente, attraversare una porta, uscire dall'inquadratura o passare dietro un elemento che lo nasconda realmente. Deve restare non visibile anche durante la rimozione, tenendo conto dei movimenti della camera e dello zoom.

Il comando di rimozione della ROM rappresenta l'intento narrativo; non obbliga a riprodurre una sparizione visibile nella camera HD-2D. Se la visuale mostra più spazio rispetto al DS, adattare percorso e tempi. Una dissolvenza sul personaggio ancora visibile non risolve il requisito. Non usare un'attesa infinita finché il giocatore guarda altrove: l'uscita deve poter terminare in modo deterministico.

Applicare la regola a tutti i percorsi di rimozione e ricostruzione degli attori, compresi salvataggi, cambi di scena, annullamenti e ripresa delle sequenze. Trasferimenti espliciti di scena possono rimuovere attori durante una transizione che nasconde interamente il campo.

Verifica: riprodurre ogni uscita con visuale bassa, zoom supportati, camera ferma e in movimento. Controllare i fotogrammi prima/durante/dopo la rimozione, la conclusione dell'evento e il corretto stato al rientro. Distinguere visibilità effettiva, occlusione e semplice posizione nel rettangolo dello schermo.

La richiesta del29 ottobre2026 aggiunge la continuità narrativa degli spostamenti: Aralia, Komor e Belle devono raggiungere la posizione coerente con il loro prossimo evento. Un personaggio che arriva e aspetta non deve essere eliminato perché fuori inquadratura. La revisione0.37 sostituisce il precedente ritorno di Aralia al laboratorio dopo il tutorial con l’arrivo davanti al Centro di Quattroventi. Inventario e verifiche in [CITY-CONTINUITY-037.md](CITY-CONTINUITY-037.md).

## 2. Sfondi delle lotte legati al luogo

Ogni lotta deve usare un ambiente coerente con il luogo fisico in cui inizia: interni, stanze specifiche, erba/percorso e, quando saranno disponibili, città, grotte, acqua, edifici speciali e altri terreni. Anche lotte della storia e tutorial seguono questa regola. Il tipo di avversario non sostituisce il contesto geografico.

Acquisire all'inizio della lotta il contesto necessario: zona/mappa, interno o esterno, terreno e varianti disponibili pertinenti. Lo sfondo non deve cambiare perché lo stato di esplorazione viene aggiornato durante la lotta. Le ambientazioni devono comprendere fondale e terreno/pedane coerenti, senza limitarsi a cambiare il colore del cielo.

Usare dati originali dove adatti; quando manca un ambiente per il porting, realizzare un adattamento coerente e dichiararlo. Ogni nuovo luogo combattibile richiede una scelta esplicita. Un ambiente generico temporaneo può servire allo sviluppo, ma è un requisito aperto e non deve far risultare la copertura completa.

Verifica: inventario di tutti i luoghi combattibili e delle relative varianti, controllo della selezione per zona/terreno e prova visiva di avvio delle lotte normali, della storia e del tutorial. Controllare anche che il contesto rimanga stabile durante animazioni e transizioni.

## 3. Animazioni per ogni coppia Pokémon–mossa

Ogni Pokémon deve avere un'animazione personalizzata per ogni mossa che può imparare. La copertura si misura sulla coppia specie/forma+mossa, non sul solo moveID. L'apprendimento nella versione completa comprende tutte le fonti che il gioco renderà disponibili; non limitare automaticamente il requisito alle mosse per livello.

È consentito condividere effetti, particelle e codice. La coppia deve però avere un adattamento visivo verificabile all'anatomia e al modo di agire del Pokémon: pose e movimento del corpo, punto di emissione o contatto, traiettoria, orientamento, dimensioni e tempi di preparazione/recupero pertinenti. La stessa sequenza copiata con un altro nome non è personalizzazione. Non imporre movimenti arbitrari quando la mossa richiede immobilità: personalizzare i dettagli pertinenti al caso.

Comprendere anche mosse di stato e senza particelle, contatto, attacchi a distanza, preparazione/rilascio, colpi multipli e bersaglio proprio quando applicabili. Preservare danni, precisione, PP, priorità, abilità e stati del motore di lotta. Sincronizzare animazione, impatto, camera, versi ed effetti sonori; supportare entrambi i lati del campo. I tempi devono essere compatibili con l'azione risolta, inclusi fallimento e mancato bersaglio.

Verifica: matrice esplicita delle coppie con stato da realizzare/in lavorazione/da verificare/verificata, riferimento al profilo specifico e prove visive. Un'animazione generica già presente è una risorsa riutilizzabile, non una coppia già verificata. Ogni nuova specie, forma, mossa o fonte di apprendimento aggiorna la matrice prima di dichiarare completa la copertura.

### Perimetro iniziale della demo: livello 10

Interpretazione operativa dell'attuale demo: cinque specie ottenibili; mosse apprese entro il livello 10 incluso, comprese quelle dei livelli precedenti alla ricezione/cattura. Sono19 coppie e10 mosse distinte, ricavate dai learnset IRBI presenti nel pacchetto della demo 0.17. Se vengono rese disponibili altre fonti di apprendimento o specie nel medesimo perimetro, aggiungerle alla matrice; la tabella non è una deroga permanente.

| Pokémon | Mosse e livello di apprendimento |
| --- | --- |
| Snivy | Azione1; Fulmisguardo4; Frustata7; Avvolgibotta10 |
| Tepig | Azione1; Colpocoda3; Braciere7; Segugio9 |
| Oshawott | Azione1; Colpocoda5; Pistolacqua7 |
| Patrat | Azione1; Fulmisguardo3; Morso6; Pazienza8 |
| Lillipup | Fulmisguardo1; Azione1; Segugio5; Morso8 |

Minccino del tutorial non è ottenibile nell'attuale demo e non rientra in questa prima matrice; resta soggetto alla regola generale per il successivo ampliamento della copertura. I Pokémon usati soltanto dagli avversari vanno mantenuti distinti nell'inventario, senza dichiararli ottenibili.

## Stato al momento dell'introduzione

Questa modifica registra i requisiti; non certifica una loro implementazione completa nel runtime 0.17.

- Uscite: implementazione della demo0.18 in `src/field-actor-exits.js`, integrata con movimento69, ActorDelete, ricostruzioni della zona e rendering. Audit e verifiche in `ACTOR-EXIT-AUDIT.md` e `ACTOR-EXITS-018.md`. Le altre due regole restano requisiti distinti.
- Sfondi: la demo0.19 acquisisce un contesto immutabile in `src/battle-location.js` e compone fondali distinti in `src/battle-environment.js`. Inventario di luoghi, materiali e adattamenti in `BATTLE-ENVIRONMENTS-019.md`; verifica dell'HUD e della selezione in `BATTLE-HUD-019.md`. Nuovi luoghi richiedono sempre un profilo esplicito.
- Animazioni: la selezione attuale degli effetti si basa sulla mossa e sul contesto della lotta. Le19 coppie della tabella richiedono inventario di profili personalizzati e collaudo individuale; nessuna è dichiarata verificata dalla sola esistenza dell'effetto generico.

Ogni consegna deve distinguere regole registrate, comportamento implementato e comportamento effettivamente verificato.

## Avanzamento animazioni 0.25

Matrice esplicita e prove in [SPECIES-MOVES-025.md](SPECIES-MOVES-025.md): quattro coppie di Snivy implementate e verificate nella demo; le altre15 restano da realizzare. La presenza degli effetti generici non modifica questo conteggio.

## Avanzamento animazioni 0.26

Matrice e prove in [SPECIES-MOVES-026.md](SPECIES-MOVES-026.md): quattro coppie di Tepig aggiunte alle quattro di Snivy, per8/19 coppie verificate nella demo. Le altre11 restano aperte.

## Avanzamento animazioni 0.28

Matrice e prove in [SPECIES-MOVES-028.md](SPECIES-MOVES-028.md): tre coppie di Oshawott aggiunte a Snivy/Tepig, per11/19 coppie verificate nella demo; altre8 aperte.

## Avanzamento animazioni 0.29

Matrice e prove in [SPECIES-MOVES-029.md](SPECIES-MOVES-029.md): quattro coppie di Patrat aggiunte agli starter, per15/19 coppie verificate; restano le quattro di Lillipup.

## Avanzamento animazioni 0.30

Quattro coppie di Lillipup aggiunte: matrice19/19 nel perimetro livello10, reazioni sui cinque rig e velocità in [SPECIES-MOVES-030.md](SPECIES-MOVES-030.md). La versione completa richiederà un inventario ampliato.

## Estensione Quattroventi 0.35

L'utente autorizza la progressione fino all'ingresso nel Percorso2. Inventario e prove in [QUATTROVENTI-035.md](QUATTROVENTI-035.md): nuovo fondale urbano esplicito, uscite della folla/N/Ghecis/Aralia tramite porte e varco, ripresa delle uscite fra le mappe esterne collegate. Le cinque specie ottenibili e le19 coppie iniziali restano invariate; Purrloin è soltanto avversario nella squadra di N, con due profili aggiuntivi (Graffio/Ruggito). Questi due profili non certificano tutte le altre mosse apprendibili da Purrloin. I test nel browser coprono le21 coppie sui due lati e i rapporti distinguono il collaudo visivo dalla verifica del motore.

## Copertura della partita 0.36

Richiesta: tutte le mosse utilizzabili nella demo. Matrice83 coppie in [SPECIES-MOVES-036.md](SPECIES-MOVES-036.md): tutti i learnset per livello delle cinque specie ottenibili (anche oltre10), le due mosse del Purrloin di N, Botta del Minccino del tutorial e Scontro per tutte le sette specie. Restano validi i requisiti di anatomia, reazioni, entrambi i lati, effetti/audio e verifiche. Il laboratorio tecnico con mosse arbitrarie non sostituisce l’inventario della partita.

## Estensione Percorso 2 e livello 15 · 0.39

La richiesta del29 ottobre estende il capitolo fino all’arrivo a Levantopoli e la progressione al livello15. Inventario narrativo, itinerari, strumenti, Centro e chiamate in [ROUTE2-STRIATON-039.md](ROUTE2-STRIATON-039.md). Purrloin diventa ottenibile; la matrice conservata cresce da83 a97 coppie in [SPECIES-MOVES-039.md](SPECIES-MOVES-039.md). Non alterare i livelli selvatici originali per confonderli con il limite di allenamento. Verificare sempre anche entrambe le chiamate Interpoké, ritratti corretti, espressioni, layout telefono e pulizia alla chiusura.
