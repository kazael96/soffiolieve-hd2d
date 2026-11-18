# Regole vincolanti di Soffiolieve HD-2D

## Lancio introduttivo di Aralia · 18 novembre2026

Applicare [ARALIA-RELEASE-059.md](docs/ARALIA-RELEASE-059.md): mantenere contatto mano–Ball, traiettoria continua, apertura prima della comparsa di Minccino, appoggio e ritorno della sfera. Nessun replay tornando indietro. Conservare fotogrammi essenziali a×1/×2/×4, sospensione, caricamenti recuperabili, tutti i controlli precedenti e i12 casi dell'introduzione effettiva con revisione dei PNG.

Applicare [INTRO-HISTORY-059.md](docs/INTRO-HISTORY-059.md): dopo il discorso completo mostrare la stessa **Soffiolieve** attraverso Giallo, Oro, Smeraldo, quarta generazione, Nero e HD-2D. L'utente ha esplicitamente corretto la proposta della cameretta: il montaggio riguarda la prima città. Preservare il protagonista scelto e i dati del campo; il renderer temporaneo non deve gestire il caricamento o confermare azioni del renderer giocabile. I salvataggi precedenti non ripetono il montaggio.

## Avvio e selezione della partita · 18 novembre2026

Applicare [START-MENU-058.md](docs/START-MENU-058.md): il titolo e il menu precedono sia la nuova introduzione sia la ripresa. Nessuna scrittura o avanzamento del campo prima della scelta; Continua conserva i salvataggi legacy. Nuovo gioco richiede conferma quando esistono dati, controlla cambi da altre schede e non dichiara cancellazioni riuscite se il browser le nega. Una sessione con dati inizialmente inaccessibili non può scrivere sopra quei dati. Conservare i test dell'index reale, dell'introduzione e delle regressioni precedenti nei tre formati, con revisione di ogni PNG e verifica della pubblicazione.

## Standard da leggere prima di ogni modifica

Applicare tutti gli standard A–H di [docs/DEVELOPMENT-RULES.md](docs/DEVELOPMENT-RULES.md), consolidati il 29 ottobre 2026: continuità degli eventi e posizioni successive degli NPC, fedeltà HD-2D, sfondi e Pokémon ambientali, animazioni e reazioni sui due lati, audio, comandi/servizi, salvataggi e recupero dagli errori, regressioni e consegna. Aggiornare gli inventari e compilare la checklist della PR per gli aspetti interessati. Queste istruzioni persistono per tutte le modifiche future della demo e della versione completa.

## Lavoro senza controllo del PC · 9 novembre 2026

L'utente richiede di proseguire senza prendere il controllo del PC. Usare file, comandi e test in background; non muovere mouse/tastiera, non portare finestre in primo piano e non pilotare il browser personale. Per le verifiche grafiche usare `scripts/test-browser-headless.cjs`: istanza invisibile, profilo temporaneo isolato, server locale proprio su porta libera e chiusura automatica. Non riprendere CUA o Raise delle finestre senza una successiva richiesta esplicita. Conservare i tre formati, i controlli e i rapporti previsti dagli standard A–H; dichiarare il renderer effettivo e il mancato confronto all'ascolto. Questa preferenza non autorizza a saltare la revisione delle immagini esportate.

## Progressione richiesta il 3 novembre 2026

L’utente ha confermato come destinazione il finale della storia principale, inclusi Lega, N e Ghecis; le attività dopo i titoli di coda restano escluse. Proseguire città per città nella storia, con una tappa implementata, collaudata e pubblicata prima della successiva. Per le prossime estensioni ricavare dalla ROM il livello del Pokémon più forte del prossimo Capopalestra e aumentare di conseguenza il limite; non scegliere arrotondamenti arbitrari. Livelli verificati nelle squadre IRBI (a/0/9/2–3): Rafan 31 (trainer24), Anemone 35 (25), Silvestro 39 (131), Aristide 43 (133). Conservare sempre livelli e XP superiori dei vecchi salvataggi. La 0.48 mantiene il limite 30 già autorizzato; il capitolo della palestra di Rafan passa a 31. Queste richieste si aggiungono agli standard A–H, senza ridurre controlli, continuità, sfondi, coreografie o pulizia delle build.

## Conferma e seguito richiesti il 5 novembre 2026

L'utente ha ribadito di completare il lavoro con cura, rispettando tutte le indicazioni e senza accelerare omettendo integrazioni o verifiche. La richiesta di avanzare nella trama non autorizza ad aggirare gli standard A–H. Distinguere sempre storia implementata, verificata e pubblicata: PC, manutenzione e preparazione di risorse non aumentano da soli la percentuale narrativa.

Dopo aver completato la storia principale, realizzare anche animazioni delle MN sul campo personalizzate per ciascun Pokémon compatibile, comprese Volo e Surf. Devono comprendere il Pokémon che compie l'azione nel mondo, con anatomia, contatti, movimento e transizioni coerenti; il solo cut-in iniziale o la coreografia in battaglia non soddisfa questa richiesta. Registrare la copertura per specie/forma–MN e verificare le azioni effettivamente utilizzabili. Questa estensione segue il finale e non lo sostituisce né autorizza a sbloccare automaticamente il postgame.

## Stato dei sorgenti e delle prove

La storia principale fino a Lega, N, Ghecis e primo finale è consegnata nella0.53: [accettazione](docs/QA-053-FINAL.md). Il limite finale è54, verificato sulla squadra nativa di Ghecis. Non ricominciare la progressione né riportare il progetto a un vecchio limite.

La0.54 aggiunge105 profili di MN sul campo: Taglio60, Volo16 e Surf29, con le forme compatibili. Applicare [FIELD-HMS-054.md](docs/FIELD-HMS-054.md) e [QA-054.md](docs/QA-054.md). Le parti originali sono composte in coreografie HD-2D: corpo, contatto, salita/discesa, decollo/atterraggio, nuoto e richiamo. Disponibilità, compatibilità e ottenibilità restano distinte. La presenza di un profilo non sblocca una specie o una MN non offerta.

Il nuotatore selezionato deve conservare identità dopo scambio degli slot, evoluzione e salvataggio. Durante la preparazione della forma evoluta mantenere visibile il banco già pronto e sostituirlo soltanto quando il nuovo è completo, senza supporto generico intermedio né una seconda texture GPU. Preparare entrambe le viste prima di mostrare il Pokémon. Conservare il controllo effettivo di perdita del contesto prima della notifica DOM.

Distinguere sempre sorgenti implementati, prove grafiche/automatiche e pubblicazione effettiva. Il [manifest pubblico](https://kazael96.github.io/soffiolieve-hd2d/build.json) identifica il codice servito; push e merge non certificano la distribuzione. I rapporti locali, gli archivi H.8 e il punto operativo corrente sono esterni alle build, in `outputs/chapter054-preparation` e `session-state.json`. Non ripubblicare una vecchia candidata basandosi sui suoi soli inventari.

## Regole di regressione e conservazione

- A ogni nuova build applicare H.8: ultima verificata, al massimo una precedente utile e candidata; preservare integralmente risorse non ricostruibili, sorgenti, ROM e rapporti. Verificare il percorso assoluto prima di eliminare soltanto directory generate, senza Git o collegamenti. Gli inventari base+delta devono ricostruire e verificare ogni file prima della rimozione.
- Eseguire la suite completa per modifiche al runtime e i replay interessati nei tre formati. Nessun FAIL diventa PASS aumentando soltanto il timeout. Esaminare ogni PNG esportato e distinguere keyframe di anatomia da un uso effettivo del comando.
- Il banco CPU deve esporre le API WebGL effettivamente usate dal ciclo del gioco; correggere i simulatori incompleti mantenendo i controlli del runtime. Le prove grafiche usano esclusivamente Chrome invisibile e isolato, senza browser personale o salvataggio reale.
- Conservare le regressioni dei capitoli precedenti, comprese lotte doppie/multi e scelta dei bersagli, quote/linee native nei salvataggi, griglie64×64, gestione delle scene condivise e [discesa214](docs/VICTORY-SLIDE-052.md). I vecchi rapporti di capitolo non riducono il perimetro della storia attuale.
- Un errore di risorsa deve propagarsi al chiamante e consentire un nuovo tentativo, senza risolvere una promessa con un'interfaccia incompleta o rieseguire l'evento. La fixture deve installare i controlli anche con head HTML implicito e verificare che un guasto richiesto sia stato davvero iniettato.

La cronologia operativa precedente è preservata fuori dalle build e nella storia Git. Per le modifiche future seguire gli standard A–H e gli inventari correnti, senza riattivare limiti o istruzioni di perimetro superati.

## Coreografie MN esclusive · 16 novembre 2026

Richiesta esplicita permanente: ciascuna delle 105 coppie specie/forma–MN sul campo già offerte (60 Taglio, 16 Volo, 29 Surf) deve avere una coreografia completamente esclusiva, con ordine di gesti, enfasi anatomica, traiettoria e recupero riconoscibili. Rinominare una famiglia o cambiarne soltanto grafica, velocità, dimensioni o ampiezza non soddisfa il requisito. Sono condivisibili effetti e codice; l'esclusività deve risultare dalle parti realmente renderizzabili in entrambe le viste e dalle prove grafiche, distinguendo sempre dati implementati, comandi effettivamente collaudati e pubblicazione. Applicare [FIELD-HMS-055.md](docs/FIELD-HMS-055.md) e [QA-055.md](docs/QA-055.md). Un PASS su riferimenti a pose fornite dalla fixture non certifica il comando effettivo o il rilascio; ogni correzione successiva del runtime richiede una nuova candidata e prove del suo codice esatto. I PASS di candidate precedenti restano storici e non si trasferiscono al runtime modificato.


Il banco di compilazione delle fixture usa 256 voci / 96 MiB dopo la regressione reale del finale227 script: applicare il nuovo paragrafo di DEVELOPMENT-RULES, conservare baseline e isolamento dei contesti. Questo aggiornamento del banco non cambia il runtime del gioco né trasferisce un PASS alle49 fasi prima della loro conclusione.

## Regressioni telefono · 17 novembre2026

Applicare [BUGFIXES-057.md](docs/BUGFIXES-057.md): il target della camera esterna segue la posizione effettiva del protagonista, senza scalare coordinate assolute. I varchi interni dichiarano il pavimento nativo quando un soffitto sovrasta celle percorribili. Le radure di lotta devono mantenere liberi appoggi e corsie anche nelle doppie, con osservatori lontani e non tagliati. I ritratti Interpoké richiedono associazione comprovata tra corpo, volto e palette; i controlli browser non devono coprire i nomi. Misurare i caricamenti freddi e il riuso separatamente: un pacchetto di trasporto non autorizza a saltare immagini o recuperi dagli errori. Queste regressioni si aggiungono agli standard A–H.

## Introduzione e presentazione MN · 16 novembre2026

L'utente richiede di correggere i limiti documentati della0.55 e aggiungere l'introduzione con scelta del sesso e del nome. Applicare [INTRODUCTION-056.md](docs/INTRODUCTION-056.md), [FIELD-PRESENTATION-056.md](docs/FIELD-PRESENTATION-056.md) e lo stato effettivo delle prove in [QA-056.md](docs/QA-056.md). L'identità deve restare coerente in campo, bicicletta, MN, chiamate, scheda e salvataggi; conservare i nomi legacy e non riproporre l'introduzione alle partite precedenti. Le conferme di fotogramma delle MN appartengono al disegno concluso, non alla sola composizione della carta. A FPS insufficienti preservare i gesti e il loro ordine, senza certificare la durata nominale di×4.
