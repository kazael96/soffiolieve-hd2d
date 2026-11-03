# Regole vincolanti di Soffiolieve HD-2D

## Standard da leggere prima di ogni modifica

Applicare tutti gli standard A–H di [docs/DEVELOPMENT-RULES.md](docs/DEVELOPMENT-RULES.md), consolidati il 29 ottobre 2026: continuità degli eventi e posizioni successive degli NPC, fedeltà HD-2D, sfondi e Pokémon ambientali, animazioni e reazioni sui due lati, audio, comandi/servizi, salvataggi e recupero dagli errori, regressioni e consegna. Aggiornare gli inventari e compilare la checklist della PR per gli aspetti interessati. Queste istruzioni persistono per tutte le modifiche future della demo e della versione completa.

## Progressione richiesta il 3 novembre 2026

L’utente ha confermato come destinazione il finale della storia principale, inclusi Lega, N e Ghecis; le attività dopo i titoli di coda restano escluse. Proseguire città per città nella storia, con una tappa implementata, collaudata e pubblicata prima della successiva. Per le prossime estensioni ricavare dalla ROM il livello del Pokémon più forte del prossimo Capopalestra e aumentare di conseguenza il limite; non scegliere arrotondamenti arbitrari. Livelli verificati nelle squadre IRBI (a/0/9/2–3): Rafan 31 (trainer24), Anemone 35 (25), Silvestro 39 (131), Aristide 43 (133). Conservare sempre livelli e XP superiori dei vecchi salvataggi. La 0.48 mantiene il limite 30 già autorizzato; il capitolo della palestra di Rafan passa a 31. Queste richieste si aggiungono agli standard A–H, senza ridurre controlli, continuità, sfondi, coreografie o pulizia delle build.

## Capitolo corrente · 0.48

L'utente ha autorizzato esplicitamente il **limite di allenamento 30** il 3 novembre 2026 per proseguire da Sciroccopoli a Libecciopoli, passando per Camelia, Percorso 5 e Ponte Libecciopoli. Questa decisione sostituisce il limite 25 per il nuovo capitolo; conservare XP e livelli superiori dei vecchi salvataggi. Applicare `docs/NIMBASA-DRIFTVEIL-048.md`. Il runtime 0.48 integra N, Camelia, Percorso 5, ponte e arrivo a Libecciopoli; applicare anche `docs/SPECIES-MOVES-048.md` (849 coppie/58 specie e forme) e `docs/QA-048.md`. Distinguere collaudi effettivi e predisposizione dei dati. La consegna della 0.48 richiede collaudo e verifica del codice effettivamente servito da Pages, registrati nel rapporto relativo alla tappa.

## Capitolo precedente · 0.47

La richiesta prosegue dopo Belle al varco nord fino all'arrivo a Sciroccopoli passando per Percorso 4, Komor, chiamata di Aralia, dono delle Ultra Ball e Team Plasma/Bicicletta. Applicare docs/ROUTE4-NIMBASA-047.md, docs/SPECIES-MOVES-047.md (646 coppie/49 specie e forme) e docs/QA-047.md. Il limite resta 25. Preservare il viaggio reale di Komor al varco attraverso mappe/salvataggi, il suo ritorno al Percorso 4 dopo il dono, Belle davanti al Teatro, meteo naturale senza scadenza, distinzione fra le forme e abilità di Basculin, fotogrammi originali della Bicicletta e caricamento differito. Musical, luna park, palestra di Camelia, Deserto e percorsi successivi restano fuori dal perimetro. La pubblicazione richiede controlli e verifica pubblica, non il solo commit.

## Capitolo precedente · 0.46

La richiesta del 2 novembre prosegue la storia principale di Austropoli fino alla sfida con Belle al varco nord, dopo Team Plasma e terza palestra. Applicare docs/CASTELIA-046.md, docs/SPECIES-MOVES-046.md (553 coppie/44 specie predisposte) e docs/QA-046.md. Il limite resta 25. Conservare caricamento differito della città, collisioni miste griglia/binari, geometria originale del miele, continuità degli NPC, contesti espliciti delle lotte e animazioni/reazioni sui due lati. Il Percorso 4 e le attività facoltative escluse nell'inventario non sono completati. Le sezioni successive descrivono i capitoli precedenti.

## Continuità richiesta il 28 ottobre 2026

Recupero automatico 0.45: applicare `docs/RECOVERY-045.md`. Riprovare soltanto le risorse fallite, mantenendo la stessa promessa narrativa e la stessa sessione di lotta. Mai usare retry automatici per rieseguire un evento, applicare di nuovo un turno o ricaricare la pagina. Conservare tentativi limitati, pausa senza rete/in background, ripresa online/in primo piano, annullamento con B e controllo manuale finale. Un caricamento vecchio o annullato non deve riaprire schermate né presentare risorse incomplete.

Manutenzione performance 0.44: applicare `docs/PERFORMANCE-044.md` e `docs/QA-044.md`. Preparare risorse GPU per scena e attori effettivi, conservando tutti i fotogrammi necessari. Aspettare le risorse prima di scoprire una transizione o proseguire uno script che introduce attori. Un fallimento deve consentire «Riprova» sopra la dissolvenza e riprendere il chiamante in attesa. Annullamento e cambio schermata invalidano i caricamenti dei menu precedenti. Conservare i limiti della cache condivisa e la scadenza dell’intera risposta audio; non reintrodurre caricamenti globali per nascondere attese. Misurare separatamente avvio, primo uso, riuso e animazioni narrative.

Richiesta corrente del 30 ottobre: proseguire da Zefiropoli fino all’arrivo ad Austropoli passando per palestra di Aloé, furto del Teschio, Bosco Girandola e Ponte Freccialuce. L’utente ha scelto **livello massimo 25**. Conservare livelli e XP superiori nei vecchi salvataggi, coerenza di abilità ed evoluzioni e animazioni su entrambi i lati. Inventario in `docs/NACRENE-CASTELIA-043.md`, matrice 477 coppie/40 specie in `docs/SPECIES-MOVES-043.md`, prove e stato di consegna in `docs/QA-043.md`. `docs/TRAINING-043.md` conserva i rapporti della preparazione: non confonderli con la verifica del capitolo completo. Austropoli comprende arrivo, lungomare e Centro; strade successive e terza palestra restano fuori dal perimetro.

Pulizia richiesta il 30 ottobre 2026: dopo ogni nuova build applicare H.8 di `docs/DEVELOPMENT-RULES.md`. Eliminare le copie generate obsolete, conservando l'ultima build verificata e al massimo una precedente utile al confronto; la candidata può restare durante il collaudo. Conservare separatamente rapporti e prove, sorgenti, ROM e archivio base. Questa regola vale anche per le prossime modifiche e la versione completa.

Per ogni estensione conservare il lavoro precedente: stile HD-2D e riferimenti IRBI, comandi e menu ispirati a Pokémon Nero, controlli mobile, velocità ×1/×2/×4 fuori menu e riavvio con conferma. Preservare le correzioni a illuminazione, texture, blocchi degli eventi, navigazione e arrivo coerente di Aralia. Le animazioni personalizzate e le reazioni devono funzionare su entrambi i lati della lotta. Eseguire la suite di regressione e aggiornare inventari e prove per i nuovi contenuti; non dichiarare verificati scenari non collaudati.

L'utente autorizza il merge della PR #25 e delle future PR di questo progetto; questa autorizzazione resta valida senza chiederla nuovamente per ogni PR. Integrare dopo i controlli pertinenti. Estensione corrente autorizzata: palestra di Levantopoli e Cantiere dei Sogni, fino alla restituzione del Fumonirico a Zania. Conservare Percorso 2, Centro Pokémon, limite 15, chiamate Interpoké e salvataggi esistenti. Applicare docs/STRIATON-DREAMYARD-040.md e docs/SPECIES-MOVES-040.md.

Leggere `docs/DEVELOPMENT-RULES.md` prima di modificare il gioco. Le tre regole richieste dall'utente valgono per la demo e per la futura versione completa:

1. Un personaggio che lascia una scena deve uscire dalla visuale o essere realmente occultato prima della rimozione. Vietate sparizioni visibili causate dal semplice rispetto dei tempi/script DS.
2. Ogni combattimento deve avere uno sfondo coerente con il luogo effettivo in cui inizia, mantenuto per tutta la lotta. Non usare un percorso come ripiego silenzioso per luoghi non gestiti.
3. Ogni combinazione di Pokémon e mossa apprendibile richiede un'animazione personalizzata al Pokémon. Un effetto generico della mossa non soddisfa questo requisito. Per la demo, priorità obbligatoria alle specie ottenibili e alle mosse accessibili entro il livello 10, come dettagliato nel documento.

Questi requisiti dell'utente prevalgono sulla riproduzione letterale della ROM quando servono adattamenti HD-2D. Non alterare le meccaniche di lotta per ottenere un effetto visivo. Conservare copertura, prove e limiti dichiarati; non dichiarare completata una combinazione solo perché esiste un'animazione per il suo moveID.

Ogni nuova scena, specie, fonte di apprendimento o mossa deve aggiornare il relativo inventario e le verifiche previste nel documento. I requisiti non si considerano implementati per il solo fatto di essere documentati.

La richiesta successiva amplia le animazioni a tutte le mosse utilizzabili nella partita della demo: applicare la matrice83 coppie in docs/SPECIES-MOVES-036.md, compresi livelli oltre10, tutorial e Scontro. Conservare il perimetro delle specie ottenibili e non aggiungere mosse illegali per ampliare la copertura.

Richiesta del29 ottobre2026: ogni uscita narrativa di Aralia, Komor e Belle deve condurre verso la posizione del loro prossimo evento. Dopo il tutorial Aralia va davanti al Centro Pokémon di Quattroventi; la destinazione al laboratorio della0.34 è superata. Applicare docs/CITY-CONTINUITY-037.md e preservare le interazioni attraverso i banconi.

La 0.39 aggiunge Purrloin ottenibile e porta la matrice a 97 coppie, conservando le precedenti. Applicare docs/ROUTE2-STRIATON-039.md e docs/SPECIES-MOVES-039.md. Il limite della nuova progressione è 15: non abbassare i livelli già superiori presenti nei salvataggi precedenti.

La 0.40 conserva le 97 coppie e aggiunge 42 profili (139 complessivi), con Pansage/Pansear/Panpour, Munna/Musharna e Taglio. Le animazioni del corpo sono adattamenti HD-2D: non chiamarle sequenze scheletriche originali DS. C-Gear è un traguardo narrativo offline; non dichiarare funzioni di rete implementate.

La 0.41 conserva il capitolo 0.40 e corregge caricamento, attese degli eventi, dialogo pre-Plasma di Komor, ritratti Interpoké e Borsa. Conservare il trasporto raggruppato con ripiego alle immagini individuali e la selezione/contesto dei sottomenu. L’estensione richiesta fino a Zefiropoli resta da implementare; non considerarla inclusa nella 0.41. Vedere docs/QA-041.md.

La richiesta corrente autorizza l’estensione fino a Zefiropoli nella 0.42: applicare docs/ROUTE3-NACRENE-042.md e docs/SPECIES-MOVES-042.md. Conservare lotte doubles/multi reali, slot p3b/p4b, scelta dei bersagli, Cura Ball, tabelle di erba scura e limite15. Il Museo, la palestra di Aloe e il Bosco Girandola restano oltre il perimetro dell’arrivo. La pubblicazione è completata solo dopo i controlli e la verifica dell’URL pubblico; non confondere un rapporto di sviluppo con quello finale.

La manutenzione di rete della 0.42 è documentata in docs/QA-042-RECOVERY.md: l'inizializzazione dell'interfaccia di lotta deve conservare i canvas, propagare i fallimenti al chiamante e consentire un nuovo tentativo. Non trasformare un errore di risorsa in una promessa risolta con interfaccia incompleta. La fixture deve installare i controlli d'avvio anche con head HTML implicito; una prova di guasto deve verificare che il guasto sia stato effettivamente iniettato.
