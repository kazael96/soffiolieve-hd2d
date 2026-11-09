# Boreduopoli–Lega · preparazione0.52

Base pubblica0.51,29443de2fb776b81/main57d1a1299c5d54ebd891262dd9e9a6db12ce6406. Questa tappa è autorizzata fino al primo finale, da proseguire per milestone verificate: palestra di Aristide ed eventi successivi, Percorso10, Via Vittoria e ingresso alla Lega; quindi Superquattro, N e Ghecis nella tappa seguente. Le MN personalizzate nel mondo seguono il finale. Nessun contenuto052 è già dichiarato giocabile dalla sola preparazione.

## Riferimenti verificati e confini

La ROM IRBI fornisce i programmi e i ruoli conservati esternamente in outputs/chapter051/next-ending-reference-fourteenth.json e next-ending-role-inventory.json. Sono52 zone di riferimento, comprese aree facoltative/future: non vanno abilitate dal solo nome. Qui il perimetro iniziale è121,136,146,214–228,355–364, oltre ai necessari collegamenti con le scene precedenti. Sala d'Onore145 e postgame restano esclusi dal primo finale. Le stanze dei Superquattro e il Palazzo di N sono riferimenti per la continuazione, non contenuti già integrati.

Aristide trainer133 ha massimo43. I primi Superquattro228/229/230/231 hanno massimo50; N586/587 massimo52 e Ghecis232 massimo54 sono riferimenti del seguito. Nardo407/77 e le varianti563–566/73 sono successive e non devono determinare il limite di questa storia. Verificare i rami effettivi dei programmi e la variante Nero prima di scegliere squadre o cap. La regola prevista è43 fino alla medaglia8,50 dopo; conservare tutti i livelli/XP legacy superiori.

Il programma242 della palestra è decodificato completo:446 istruzioni/12 ingressi, effetti10/49 e rami trainer133/132 dipendenti dalla versione. I comandi406–410 inizializzano e comandano il puzzle originale: le sole firme non ne realizzano animazioni, collisioni, attese o checkpoint. Il comando224 IRBI scrive21 nella variabile destinazione. Le firme aggiuntive in tools/league-opcodes.json derivano dai gestori originali; non sono placeholder per ignorare operazioni sconosciute. La decodifica deve continuare a rifiutare programmi parziali.

## Inventario da completare prima dell'abilitazione

- Eventi/attori:uscita di Aristide, intervento di Aralia dopo medaglia/MasterBall, Komor e Belle sul Percorso10, passaggio di Nardo verso la Lega. Per ciascuno ricavare fonte effettiva, percorso/porte, destinazione/prossimo ruolo e gate di arrivo; verificare anticipo/ritardo e salvataggi. Non creare futuri corpi sopra quelli della051.
- Palestra:pulsanti/draghi, geometrie e supporti dinamici, quote, spostamenti e tempi originali, suoni, cambio scena, checkpoint e ritorno. Nessuna scorciatoia o collisione modificata per far passare il test.
- Percorso10:varchi delle otto medaglie, requisiti reali, animazioni e suoni, lotte e consegne, neve/stagioni dove native.
- Via Vittoria:geografia/porte/rampe/salti, dislivelli, incontri e allenatori, strumenti e accessi facoltativi; non aprire aree oltre il perimetro per errore.
- Lega:arrivo, infermiera/PC/Market e recupero dal blackout della tappa; ingressi della fase successiva espliciti e coerenti.
- Lotte/risorse:contesto geografico fissato, diorami/pedane/ombre, poche specie ambientali effettivamente catturabili; aggiornare roster, apprendimento e coppie specie/forma–mossa sui due lati, reazioni ed esiti.
- Audio/UI:risorse native prima della presentazione, modulazioni/sincronia, comandi/touch/Interpoké e menu nei tre formati; primo uso e riuso distinti, caricamenti ripetibili.

Applicare tutti gli standardA–H. Le prove del codice numerico non certificano i pixel o una partita integrale; registrare separatamente fixture, esiti forniti/preparazioni, renderer reale e confronto udibile non eseguito. Le verifiche grafiche usano soltanto il browser headless isolato, senza controllare il PC. Non pubblicare né contare completata la tappa prima di integrazione, regressione completa, revisione dei PNG nei tre formati e verifica della distribuzione effettiva.


## Prima lettura degli eventi

Il nuovo estrattore tools/extract-league.py deriva dal lettore051 e conserva la semantica dei comandi già recensiti: MsgCloseImmediate, CallBattleBlackout, TrainerSetDefeated, BadgeCheck, BadgeSet e BadgeRegisterParty, oltre alla voce preesistente584. tools/league-opcodes.json aggiunge soltanto31 firme mancanti, tutte verificate nei gestori nativi. Nessun handler di gioco viene installato da questo file.

I due test tests/test_league_export.py verificano perimetro/eredità dei comandi/rifiuto dei programmi parziali e i processi di conversione invisibili su Windows, con conservazione degli altri flag. Sono entrambi PASS. La prima prova CLI aveva sostituito impropriamente ndspy con il solo adattatore dei contenitori, privo di texture/color; corretto usando il pacchetto completo già richiesto dal lettore precedente. Baseline extractor-cli-before-fix.log e successiva estrazione extractor-events-current.log sono esterni in outputs/chapter052.

Il primo catalogo privato contiene31 zone e32 programmi (incluso il comune862), con unsupported-commands.json vuoto. Le scene condivise120/123/132 sono incluse per gli eventi dopo la medaglia; nuove aree restano121/136/146/214–228/355–364. Per28 programmi nuovi, opcode/argomenti/offset/fine e hash della sorgente coincidono con il riferimento assemblato separatamente dalle firme originali. Rapporto events-reference-proof.json. Questi controlli non certificano grafica, percorsi, runtime o avanzamento giocabile; l'estrazione geometrica e l'integrazione restano da completare.


## Geometria privata e selettore della palestra

La conversione statica conclude31 zone/82modelli/890texture e43 grafici di attore in extractor-geometry-current.log. Il modello162 della palestra risulta un selettore, non un normale billboard: l'inizializzatore242:68–111 assegna work16416=180 per la versione IRBI21. Il nuovo league-graphics.js vincola soltanto quel contesto alla grafica di Aristide prima della preparazione delle risorse. La casa343 mantiene il comportamento209 esistente e gli altri contesti162 restano invariati. Non si rinomina globalmente l'identificatore.

La regressione esegue i bytecode originali dell'inizializzatore nella VM, poi il costruttore reale degli attori: prima162!=180 fallisce in graphic-selector-before-fix.log; dopo17 test mirati PASS in graphic-selector-current.log, inclusi VM e servizi precedenti. Mantiene UID, coordinate e quota12 della posa nativa, senza mutare il record sorgente. L'inizializzazione del puzzle406 è isolata nella prova: non è una prova del puzzle o del rendering. Il modulo non è ancora collegato all'index e nessuna mappa052 è giocabile. Restano ripartizione geografica/cache, superfici/binari/stagioni, task della palestra, dati/roster/coreografie/audio e integrazione narrativa/servizi prima di una candidata.
