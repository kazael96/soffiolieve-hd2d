# Regole permanenti di sviluppo

Richieste dall'utente il27 ottobre 2026. Valgono per la demo, le revisioni successive e la futura versione completa. Sono criteri di accettazione, non semplici preferenze. La resa rimane HD-2D; queste richieste autorizzano ad adattare la messa in scena originale.

## Progressione fra città e limite di livello

Dal 3 novembre 2026 proseguire per tappe città per città fino al finale della storia principale, inclusi Lega, N e Ghecis, come confermato dall’utente. Ogni nuova tappa richiede integrazione, collaudo e verifica della pubblicazione prima di passare alla successiva. Il cap delle estensioni segue il livello più alto della squadra del prossimo Capopalestra, verificato nei dati originali; conservare livelli ed esperienza già superiori nei salvataggi precedenti.

## Standard obbligatori per ogni modifica

Consolidamento richiesto il 29 ottobre 2026. Questi standard valgono per demo e futura versione completa, anche quando cambia chi lavora al progetto. Le sezioni storiche sotto documentano l’avanzamento; non riducono il perimetro richiesto successivamente. Registrare uno standard non equivale ad averne completato l’implementazione.

### A. Continuità degli eventi e degli NPC

- Ogni evento deve dichiarare prerequisiti, attori necessari, posizione iniziale, percorso di uscita, destinazione e prossimo evento. Aggiornare l’inventario narrativo insieme al codice.
- Quando un cambio coperto aggiorna stagione o topologia, sincronizzare anche i metadati delle mappe percorse dagli NPC fuori scena prima di avviare gli itinerari; mantenere le immagini differite. Verificare la sequenza cambio variante→evento e il filtro degli attori in tutti gli interni del capitolo, non soltanto nelle aree esterne.
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

Dal20 novembre2026 applicare [ANIMATION-QUALITY.md](ANIMATION-QUALITY.md) a tutte le animazioni del gioco, comprese figure umane, introduzione, oggetti e transizioni. Le skill `sprite-animation` e `pixel-art-fundamentals` guidano costruzione e critica. Giudicare pose, anatomia, ritmo e contatti separatamente da correttezza del pacchetto e test del runtime. Una sequenza funzionante o un inventario numerico non certificano la naturalezza del movimento. La revisione dell'intero catalogo resta distinta dall'applicazione del metodo alle modifiche correnti.

- Misurare la copertura per coppia specie/forma–mossa, includendo ogni fonte di apprendimento resa disponibile. La priorità iniziale entro il livello 10 è stata ampliata alle mosse della demo: mantenere e aggiornare la [matrice corrente 0.49](SPECIES-MOVES-049.md),1760 coppie su85 specie e forme predisposte fino al livello35, distinguendo sempre specie effettivamente ottenibili e verifiche grafiche dai soli controlli numerici. Le matrici precedenti restano riferimenti storici.
- Animare coerentemente sia la mossa sia il Pokémon che la esegue: corpo, anatomia, punto di emissione/contatto, traiettorie e recupero. Integrare effetti originali, sequenze senza particelle, contesti speciali e movimenti di camera pertinenti.
- Ogni coreografia e reazione deve funzionare per il giocatore e per l’avversario. Il bersaglio reagisce in modo coerente con impatto, esito, stato e numero dei colpi; distinguere mancato bersaglio, fallimento e mosse rivolte a sé stessi.
- Conservare danni, precisione, PP, priorità, abilità, stati e altre regole di Pokémon Nero. Nessuna alterazione delle meccaniche per semplificare una coreografia. Una prova di esecuzione senza eccezioni non certifica da sola la fedeltà delle regole.

Richiesta successiva del5 novembre2026: dopo il completamento della storia principale, estendere le coreografie personalizzate alle MN nel mondo di gioco, per ogni specie/forma compatibile, comprese Volo e Surf. Verificare corpo, contatto con il protagonista e il terreno, orientamento, spostamento, partenza/arrivo e uso concreto dell'azione. Un cut-in o un profilo di lotta da soli non completano una coppia specie/forma–MN sul campo. Conservare disponibilità e meccaniche native e una matrice distinta dalle mosse in combattimento.

Matrice successiva in lavorazione: [SPECIES-MOVES-052.md](SPECIES-MOVES-052.md),3987 coppie su137 record fino al50, con prove numeriche esplicite. Il documento distingue i componenti predisposti dai pixel e dalla storia ancora da collaudare; non sostituisce una consegna verificata.

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

- Gli errori temporanei devono poter riprendere automaticamente con tentativi limitati e attese progressive; quando manca la rete o la scheda è nascosta, sospendere i tentativi e riprendere al ritorno. Ritentare esclusivamente il caricamento delle risorse, mantenendo la stessa operazione in attesa: vietato rigiocare eventi, creare una seconda lotta, riapplicare un turno o ricaricare automaticamente la pagina. Dopo l’esaurimento resta un recupero manuale raggiungibile. Riferimento: [RECOVERY-045.md](RECOVERY-045.md).
- Preparare le risorse della scena e degli attori necessari prima della presentazione, inclusi tutti i loro fotogrammi. Caricamenti differiti non devono introdurre attori mancanti o superfici bianche. Una transizione fallita resta coperta e si riprende con un controllo raggiungibile sopra la dissolvenza. Annullare o sostituire una schermata invalida i suoi completamenti asincroni; una richiesta vecchia non può riaprirla. Misurare primo uso e riuso separatamente; preservare cache limitate e scadenze che comprendano il corpo delle risposte, non soltanto gli header. Riferimento: [PERFORMANCE-044.md](PERFORMANCE-044.md).
- I loader dei capitoli devono rispettare il proprietario attuale delle scene condivise in qualsiasi ordine di completamento, anche concorrente. Un capitolo precedente caricato tardi non deve sostituire geometria, porte o stato di preparazione di una scena aggiornata. Le cache derivate vanno aggiornate dopo geometria/cataloghi differiti, conservando handle e animazioni ancora attivi. Riferimento: [MISTRALTON-SCENE-OWNERSHIP-049.md](MISTRALTON-SCENE-OWNERSHIP-049.md).
- Applicare budget anche ai consumatori che trattengono texture GPU, atlanti e compositi, non soltanto alla cache condivisa. Proteggere scena, slot attivi e richieste in corso; liberare le risorse inattive senza chiudere immagini condivise. Misurare il contenuto trattenuto e dichiarare separatamente il picco osservato e le stime. Riferimento: [RESOURCE-CACHES-049.md](RESOURCE-CACHES-049.md).
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
8. A ogni nuova build fare pulizia delle copie locali generate obsolete, come richiesto il 30 ottobre 2026. Tenere l'ultima build verificata e al massimo una precedente effettivamente utile ai confronti; durante il collaudo può restare anche la candidata. Non eliminare l'ultima valida prima di avere una sostituta verificata. Conservare rapporti, log e immagini di prova fuori dalle build da rimuovere, insieme a sorgenti, risorse non ricostruibili, ROM e archivio base. Prima di ogni rimozione ricorsiva verificare i percorsi assoluti e che i bersagli siano soltanto directory generate previste nell'area di lavoro, prive di repository Git o collegamenti verso altre cartelle. Arrestare eventuali server di sviluppo propri che servono quelle copie obsolete e registrare le directory rimosse e conservate. La pulizia deve avvenire anche prima della build se serve spazio: non accumulare copie `live-*` o `fidelity-build-*`.

Un controllo fallito va corretto o segnalato con causa e limite concreto; non rimuoverlo per ottenere un rapporto verde. Le prove su viewport telefono non certificano ogni GPU Android fisica e nessuna suite dimostra assenza assoluta di bug.

### Efficienza del ciclo di sviluppo e dei rilasci

Dal9 novembre2026 l'utente richiede lavoro senza controllo del PC. Le verifiche grafiche vengono eseguite in un browser headless separato e con profilo temporaneo; evitare interazioni con mouse/tastiera, cambio del focus o browser personali. `scripts/test-browser-headless.cjs` avvia e arresta il proprio server locale, esegue le fixture isolate nei tre formati e conserva rapporti e PNG. La modalità è sempre invisibile e non accetta un'opzione headed. Distinguere il rendering software ANGLE SwiftShader da una GPU Android fisica: l'audio interno può essere attivo mentre l'uscita del processo di test rimane muta. Conservare il controllo manuale delle immagini esportate; non richiedere che l'utente mantenga una finestra in primo piano.

Richiesta del9 novembre2026: velocizzare i rilasci conservando la qualità. Durante lo sviluppo usare prima regressioni mirate al componente e prove brevi per localizzare i difetti; raggruppare correzioni coerenti prima di ricostruire una candidata. La candidata destinata alla pubblicazione deve comunque superare l'intera suite e i replay richiesti nei tre formati. Non trasformare un FAIL in PASS aumentando soltanto il timeout o eliminando l'asserzione.

Riutilizzare un rapporto soltanto per gli stessi sorgenti/asset e lo stesso comportamento verificato, con revisione e perimetro espliciti. Una modifica del controllore condiviso richiede le regressioni dei capitoli che lo usano; la cache non sostituisce la verifica del risultato. Conservare separatamente build, fixture e rapporti per poter ricondurre ogni esito alla candidata esatta.

Ottimizzare il generatore evitando copie integrali superflue: la build completamente preparata può essere spostata dalla cartella temporanea alla destinazione sullo stesso volume. Deve restare indipendente da sorgenti e build precedenti; vietati collegamenti mutabili condivisi. Su volumi diversi usare la copia, rifiutare destinazioni già esistenti e conservare tutti i controlli SHA-256 e dei percorsi. Misurare i miglioramenti; non promettere percentuali di accelerazione prima dei confronti. Le cache incrementali degli asset restano un'estensione da implementare e collaudare, non una capacità già presente.

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

## Estensione palestra e Cantiere · 0.40

Inventario corrente: [STRIATON-DREAMYARD-040.md](STRIATON-DREAMYARD-040.md), matrice [SPECIES-MOVES-040.md](SPECIES-MOVES-040.md), 139 coppie implementate. Le matrici precedenti restano riferimenti storici. Aggiungere la regressione `check-striaton-runtime.cjs` alla suite completa e a Pages. Non confondere superamento dei test matematici dei profili con confronto visivo al gioco DS; riportare separatamente adattamenti, prove nel browser e limiti.

## Estensione Percorso 3 e arrivo a Zefiropoli · 0.42

Applicare [ROUTE3-NACRENE-042.md](ROUTE3-NACRENE-042.md) e [SPECIES-MOVES-042.md](SPECIES-MOVES-042.md): 181 profili complessivi, quattro nuove specie ottenibili, due soltanto avversarie, MT46, lotte doubles e multi reali, limiti 15 e accessi successivi espliciti. Conservare la corrispondenza fra slot nativi p3b/p4b e corpi/bersagli/HUD, la scelta indipendente dei comandi, le riserve non duplicabili e le pose di Pazienza associate al singolo combattente. La Pensione non deve invalidare il salvataggio quando viene depositato lo starter. I nuovi cataloghi con cifre nel nome devono entrare nel trasporto raggruppato senza perdere il ripiego alle immagini individuali. La suite completa include route3-runtime e double-runtime; i rapporti finali determinano cosa è stato effettivamente verificato.

## Estensione Zefiropoli–Austropoli e limite 25 · 0.43

Applicare [NACRENE-CASTELIA-043.md](NACRENE-CASTELIA-043.md), [SPECIES-MOVES-043.md](SPECIES-MOVES-043.md) e [QA-043.md](QA-043.md). Conservare quote e linee del ponte nei salvataggi, ingressi percorribili anche agli angoli del corpo, comandi relativi alla camera e prove di visibilità invalidate quando cambiano orientamento o altezza. Conservare evoluzioni, slot abilità, PS/PP e livelli/XP legacy senza abbassarli; il limite corrente della demo è 25. La suite comprende training-runtime e pinwheel-runtime. Roster predisposto, specie ottenibili, prove numeriche, rendering e confronto visivo restano distinti; i limiti aperti non diventano funzionalità complete per il solo aggiornamento degli inventari.


### Esecuzione della suite estesa · 9 novembre 2026

La crescita dei replay host051 ha superato il budget del vecchio singolo processo unitario300s. Conservare quel FAIL come baseline e non alzare soltanto il timeout. `scripts/unit-test-groups.cjs` distribuisce in modo deterministico tutti i file `.test.cjs` in quattro gruppi sequenziali, senza duplicati né omissioni; ogni processo termina e rilascia VM/asset prima del successivo. Windows conserva `--test-isolation=none`, Linux `--test-concurrency=2`. Ogni fase ha budget180s; nessun gruppo vuoto o test saltato. Il rapporto completo registra separatamente tutti i gruppi e rimane FAIL se uno fallisce. I test verificano l’inventario reale e i confini del raggruppamento. Non attribuire un miglioramento di tempo totale prima della misura; lo scopo immediato è mantenere budget e memoria per processo senza ridurre la copertura.


### Aggiornamento del banco · 10 novembre 2026

Il primo gruppo della candidata privata052/9 ha raggiunto180s; il secondo ha richiesto179.95s. Conservare il FAIL in deep-gates-ninth, senza aumentare il budget. Il raggruppamento predefinito passa da quattro a sei processi sequenziali: stesso inventario completo, ordinamento deterministico, ogni file una sola volta, nessun gruppo vuoto, stessi flag Windows/Linux e180s per fase. Il numero di fasi complete cresce di due; non attribuire un'accelerazione del tempo totale prima della misura.

Il solo host Node riusa la compilazione dei sorgenti tramite tests/helpers/compiled-fixture.cjs; ogni invocazione esegue comunque il programma nel proprio contesto VM e ricrea oggetti e stato. La corrispondenza del testo deve essere esatta, anche con stesso nome/file e stessa lunghezza; sintassi ed errori di esecuzione restano visibili. CacheLRU:192entry,96MiB di testo sorgente (limite dei testi conservati, non misura dell'heap totale del processo). Codice troppo grande eseguito senza memorizzazione. Prove di isolamento su veri inventari, party, flag e attori; prove di invalidazione e budget. Il banco da48MiB iniziale causava espulsioni circolari dell'inventario da circa50MiB: FAIL della regressione d'integrazione conservato,96MiB elimina questa ricompilazione integrale. I rapporti finali devono riferirsi al banco congelato; il rapporto9 precedente resta fallito e non certifica queste modifiche.


Il runner delle fasi ora usa spawn asincrono e scrive entrambi i flussi nel log mentre il processo lavora, invece di trattenerli fino alla fine di spawnSync. Conservare180s per fase e8MiB di output: timeout, uscita nonzero, errore di avvio, errore del log o superamento del limite restano FAIL, con evidenza parziale. Non sostituire i test con un semplice avvio. Regressioni specifiche verificano log prima del completamento e chiusura prima della lettura del rapporto. I timeout precedenti con output vuoto restano evidenze fallite; il PASS isolato non ne dimostra la causa. Cambiare trasporto dei log non autorizza ad attribuire un successo alla suite prima della conclusione di tutte le fasi.


### Aggiornamento del banco · primo finale0.53

Il primo gruppo su sei della candidata privata053/15 ha superato180s; conservare il rapporto fallito in `outputs/chapter053-preparation/deep-field15`. Il raggruppamento predefinito passa a otto processi sequenziali, con lo stesso inventario completo e deterministico, ogni file una volta, nessun gruppo vuoto e budget180s invariato. Le regressioni verificano inventario e confini. Questa variazione non certifica un PASS né una riduzione del tempo totale: occorre rieseguire tutte le fasi. I test dei portali devono fornire le dimensioni del canvas effettivo, richieste dal nuovo controllo della proiezione; l’inventario audio comprende anche i cinque effetti verificati1368/1382/1656/1840/1841. Conservare le verifiche SHA e di provenienza, senza limitarsi a cambiare un conteggio.

### Coreografie MN completamente esclusive · 16 novembre 2026

L'utente richiede esplicitamente una coreografia completamente esclusiva per ciascuna delle 105 coppie specie/forma–MN sul campo già offerte: 60 Taglio, 16 Volo, 29 Surf. L'ordine dei gesti, l'enfasi sulle parti anatomiche, la traiettoria e il recupero devono distinguere effettivamente ogni coppia. Nomi o famiglie diversi, cambi di grafica, cadenza, dimensioni o sole ampiezze della medesima sequenza non soddisfano il requisito; effetti, interpolazione e codice possono essere condivisi.

Misurare l'esclusività sui canali sostenuti dalle parti native realmente renderizzabili in entrambe le viste e sulle fasi interessate; arti nascosti, giunti inesistenti o segmenti inseparabili non possono fornire differenze fittizie. I controlli numerici normalizzati non sostituiscono le prove grafiche né l'uso concreto del comando. Conservare la distinzione fra sorgenti implementati, sequenze/anatomia esaminate, replay effettivi e pubblicazione. Un PASS su pose fornite dalla fixture resta un riferimento: difetti di transizione, appoggio o leggibilità del protagonista richiedono correzione e nuova candidata con prove del codice esatto. L'inventario e lo stato delle prove sono in [FIELD-HMS-055.md](FIELD-HMS-055.md) e [QA-055.md](QA-055.md); gli esiti delle candidate precedenti non certificano il runtime modificato. Restano invariati disponibilità e regole native delle MN e tutti gli standard A–H.


### Cache delle fixture del finale · 0.55

Il banco usa ora 256 voci per la cache di sola compilazione, mantenendo 96 MiB di testo sorgente, otto processi unitari,49 stadi e180 s per fase. Il finale con componenti carica227 script (223 senza componenti), oltre le precedenti 192 voci: la seconda istanza ricompilava tutti 227 script. Conservare il FAIL reale192 e la regressione256 con227 hit/zero ricompilazioni e stato dei contesti isolato, in `outputs/chapter055-preparation/cache-entry-audit-055`. Il limite in byte non misura l'heap totale e il PASS mirato non certifica un miglioramento dei tempi della suite completa.

Il tentativo locale precedente in `outputs/chapter055-preparation/deep-exclusive03` resta una baseline interrotta dopo i timeout180 s dei gruppi 3–6; i log e la ricevuta di arresto sono preservati. Il nuovo rapporto completo usa `deep-exclusive03-final`. Registrare il runtime Node effettivo di ogni esecuzione e distinguere le versioni del banco dai browser del gioco. Un nuovo PASS non riscrive i vecchi FAIL.

### Budget delle fixture native · revisione0.64

Il primo gruppo della candidata04 ha superato il limite400MiB durante il confronto di3048 pose, mentre condivideva il processo con gli inventari VM di altri test. Conservare quel FAIL in `outputs/animation-review064/deep-candidate04-r2`; il rapporto non certifica una candidata corretta. Non alzare il limite né rimuovere l'asserzione. I confronti `emboar-contact064.test.cjs` e `battle-actor-framing064.test.cjs`, che misurano la memoria dell'intero processo proprietario, hanno ciascuno un processo sequenziale dedicato. Gli altri file restano distribuiti negli otto gruppi bilanciati. L'inventario completo viene eseguito una sola volta, senza gruppi vuoti, con gli stessi flag Windows/Linux e180s per fase; il registro corrente passa da49 a51 fasi. I test verificano inventario, isolamento e determinismo. La separazione conserva un significato corretto del budget per fixture; un miglioramento complessivo richiede la misura e la nuova suite completa.

### Identità e tempi di presentazione · 0.56

Per la nuova introduzione conservare la scelta del personaggio e il nome in tutti i sistemi che li mostrano, con immagini native coerenti, tastiera italiana e comandi touch/tastiera. Distinguere i sette caratteri del nuovo nome dai dieci dei soprannomi e dai nomi legacy già salvati. Le partite precedenti proseguono senza ripetere l'introduzione; Ricomincia mantiene conferma e cancellazione verificate. Testi originali lunghi devono essere impaginati senza perdere righe.

L'avanzamento di una coreografia MN non può attraversare tutte le pose fra due disegni: una carta composta non certifica un fotogramma mostrato. Preservare pose autoriali, contatti una sola volta, sedile e recupero anche a×4 con FPS bassi, context loss, scheda nascosta e ripresa dal salvataggio. Una conferma vecchia non libera una nuova azione. Le animazioni possono durare più del nominale se il dispositivo non disegna abbastanza fotogrammi; non eliminare gesti o modificare la fisica per rispettare artificialmente la velocità.

Il naming deve misurare anche i tasti effettivi, il campo del nome e la leggibilità del prompt nei tre formati: un tocco automatico al centro di un tasto troppo piccolo non certifica l'usabilità. Conservare nome e comandi durante la rotazione. L'annullamento del riavvio non cambia i dati di gioco; il confronto deve distinguere il naturale avanzamento del tempo e l'ordine delle raccolte non ordinate, senza ignorare posizioni, identità, squadra o progressione.

### Budget dei percorsi fisici degli attori · candidata0.64/7

La suite completa C7/r1 conserva il FAIL del terzo gruppo unitario, terminato dopo180788ms contro il budget180000ms. Quel gruppo comprendeva anche `league-journeys.test.cjs`: i replay completi di Belle e Komor sul Percorso10, nelle diverse stagioni, attraversano controller, terreno e portali nativi e hanno un costo CPU significativo. Separare questo file in un processo sequenziale dedicato, oltre ai due processi già riservati alle fixture native che misurano la memoria. L'isolamento dei percorsi riguarda il budget di esecuzione: non attribuirgli una misura RSS che non effettua.

Conservare gli otto gruppi ordinari bilanciati, ogni file eseguito esattamente una volta, ordinamento deterministico e nessun gruppo vuoto o test saltato. Rimangono invariati180s per fase, limiti di memoria, asserzioni e flag Windows `--test-isolation=none` / Linux `--test-concurrency=2`. Il registro completo passa da51 a52 fasi perché si aggiunge un processo, non perché siano aumentati i file o sia stata ridotta la copertura. Le regressioni del raggruppatore devono coprire anche l'inventario minimo con tutti e tre i file isolati e i due sistemi operativi. Un PASS mirato del raggruppatore o dei percorsi non sostituisce la nuova suite completa; conservare il rapporto C7/r1 fallito e non affermare una riduzione del tempo totale prima della misura.

### Processi dei protocolli di lotta · candidata0.64/11

Il nuovo inventario integra21 casi del ciclo di vita di Graffio e18 casi
di risorse/recupero in39 processi sequenziali dedicati, con un callback
per wrapper. Questi processi disattivano l'isolamento anche su Linux:
il processo controllato dal runner deve essere quello che esegue il caso,
senza un ulteriore figlio Node lasciato fuori dal controllo del timeout.
Conservare180s per fase, heap V8 massimo400MiB, output massimo8MiB e
zero casi saltati. Un limite dell'heap non misura il picco RSS del sistema.

I quattro controlli602 condividono un solo processo dedicato. Rimangono
anche i tre processi storici e gli otto gruppi ordinari bilanciati; i28
casi leggeri del controller restano ordinari. L'inventario attuale di424
file produce51 fasi unitarie, più il builder e40 controlli runtime, per92
fasi totali. Verificare inventario completo e unico, ordine deterministico,
cataloghi incompleti rifiutati e flag effettivi su Windows/Linux. I piccoli
inventari dei test del raggruppatore conservano il comportamento storico.
Il PASS dei cinque controlli di distribuzione non sostituisce l'esecuzione
delle92 fasi e non certifica da solo velocità o memoria complessive.

Le fixture derivate di questo protocollo usano pin canonical LF per i soli
metadati, conservando separatamente hash e byte originali di provenienza.
I programmi compilati registrano i propri byte reali e i frammenti il
parent effettivo; i JSON/PNG/DATA nativi restano controllati sui byte raw.
Conservare il FAIL del providerR1 che confrontava il pin raw del metadato
con il testo normalizzato. Le regressioni devono accettare LF/CRLF per i
metadati equivalenti e rifiutare sia modifiche sostanziali sia variazioni
dei byte nativi, anche se il JSON risultante contiene gli stessi valori.

La forma del flag dipende dalla versione effettiva di Node: da22.8 e
nelle prime23 usare `--experimental-test-isolation=none`; da23.6 e nelle
24 successive usare `--test-isolation=none`. Il modulo condiviso
`scripts/node-test-options.cjs` seleziona il nome e rifiuta versioni
precedenti o non riconosciute. Gli otto gruppi ordinari Linux mantengono
`--test-concurrency=2`; i39 processi di protocollo e quello602 eseguono
direttamente i callback nel processo controllato, su entrambi i sistemi.
Non cambiare Node su CI o i budget per aggirare un'opzione incompatibile.
Conservare la suite45621297400:52 fasi PASS e40 avvii falliti prima dei
callback su Node22.23.5. Le prove di compatibilità dei flag e del PID non
sostituiscono i casi funzionali o la successiva suite completa.

### Letture dei pixel ambientali · candidata0.64/13

Il confronto nativo di `ambient-readback064.test.cjs` ha un processo
sequenziale dedicato: un owner esegue32passi, i cicli completi e il riuso,
confrontando tutti i byte RGBA del frame e della superficie finale,
metriche, fallback e proprietà delle risorse. Il nuovo inventario ha
425file,52fasi unitarie e93fasi totali; gli altri51argv/callback unitari
rimangono invariati. Soltanto il nuovo owner riceve `--expose-gc`,
heap400MiB e il flag di isolamento corretto per Node22/24 anche su Linux.

Conservare i FAIL dei primi banchi sincroni: la sola raccolta GC non
rilasciava i buffer nativi entro il ciclo. Il banco restituisce il
controllo all'event loop ogni32coppie e a fine passo, mantenendo gli
stessi guard prima e dopo GC/yield,170s/RSS400MiB interni e180s per fase.
Non trasferire queste misure alla memoria, ai caricamenti o agli FPS
del gioco. La prova Chrome separata conserva tutti32casi logici in tre
processi limitati, dopo il FAIL80s del lotto unico; non alzare i timeout.

I programmi e i metadati ammettono soltanto l'equivalenza CRLF→LF;
JSON/PNG nativi restano verificati sui byte RAW. Il riferimento storico
ambientPose867byte è immutabile; il nuovo helper viene estratto dal
sorgente corrente, con lo stesso renderer nativo per A/B. Il test CPU
e il confronto Canvas in Chrome non certificano da soli l'app completa:
verificare ordine/proprietà effettivi, binding intatti, rettangolo
ridotto realmente attivo e beneficio misurato nell'app prima del rilascio.

### Esito del confronto ambientale · 25 novembre2026

Il readback rettangolare e la successiva alpha memo sono respinti per
utilità prestazionale; i rispettivi PASS funzionali e tutti i FAIL
rimangono storici. Il runtime torna alla FULL originale e36. L'owner
portabile conserva32casi/2340coppie: A è la ROI storica immutabile,
B è la FULL estratta dal runtime corrente, con lo stesso rendererR6c.
Trasporre esplicitamente le aspettative ai rispettivi lati: B legge
sempre65536pixel; A conserva riduzioni positive e fallback FULL,
compreso il vecchio contesto avvelenato prima di crearne uno nuovo.
Non eliminare assert ROI o applicare assert memo a un runtime FULL.
Restano invariati inventario425/52/93, budget, GC/yield e oracoli RGBA.

Conservare separatamente i contratti V4 e V4+ROI; il contratto attuale
`coherent-v4-original-full-restored` dichiara entrambe le provenienze e
ripristina tutti i pin sorgente originali. Una minore area letta o una
mediana migliore non certifica un vantaggio se peggiora la coda: nel
giudizio mantenere tutti i campioni e gli estremi, distinguere costo
per aggiornamento dalle chiamate riusate e non dedurre FPS. Il seguito
di questa decisione non apre un'altra ottimizzazione esplorativa.

### Processo nativo572/541: protocollo e audio condividono un owner

I due file `native-tail541-protocol064.test.cjs` e
`native-tail541-audio064.test.cjs` formano un solo processo sequenziale
dedicato `unit-native-tail541`: argv protocollo,audio, `--expose-gc`,
preload `--require tests/helpers/native-tail541-metrics064.cjs` una volta,
heap400MiB, `--test-concurrency=1` e isolamento disattivato con il flag
corretto di Node22/24 su entrambi Windows/Linux. Il processo del runner
è quello che esegue i callback, senza un figlio Node nascosto. Il preload
metrics misura maxRSS; `--expose-gc` consente al fixture host il GC tra VM.
L'ordine dei callback non dipende dall'ordine argv. Non disperdere questi
test nei gruppi ordinari.

La coppia viene rimossa prima del raggruppamento precedente: tutti gli
altri52argv rimangono identici. Senza altri cambi d'inventario,425+2=427
file producono53fasi unitarie e94CLI (builder1+runtime40 invariati).
I16casi del port (14precedenti+2negativi owner/preparation) non sono16fasi:
restano due file e un solo processo. Conservare180s, heap400MiB e8MiB
di output per fase; un limite heap non è una prova di RSS del sistema.

Le regressioni verificano coppia minima, Node22/24 e Windows/Linux,
assegnazione unica/deterministica, incomplete catalog e basename ambigui
rifiutati, presenza della coppia nell'inventario reale e le94fasi totali.
Gli otto gruppi ordinari Linux mantengono `--test-concurrency=2`; tutte le
vecchie dediche e i cataloghi vita/recovery rimangono invariati. Nessuna
modifica al builder, alla CI, ai runtime o a un'asserzione funzionale deriva
dal registro. Il run privato precedente14/14 è evidenza mirata, non PASS
del port16 o della nuova suite94, né una certificazione del movimento.
