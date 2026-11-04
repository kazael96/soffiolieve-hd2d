# Ponentopoli–Mistralopoli · 0.50 in lavorazione

Base verificata:0.49 pubblica b22c8656e2bbe29f, main9881d9f24d1fe29c3bf77b615fbb43d549246b88. La richiesta complessiva prosegue fino al primo finale con Lega, N e Ghecis, senza postgame. Questa tappa va implementata, collaudata e pubblicata prima della successiva; la ricerca privata non costituisce integrazione.

## Percorso e livelli

| Luogo | Zone native | Perimetro |
| --- | --- | --- |
|Ponentopoli|107–112|Palestra di Anemone108, città e servizi;107/109 già presenti nella049|
|Percorso7|337,343,344|Passaggi reali, allenatori, case e nuova chiamata nativa|
|Torre Cielo|338–342|Piani, allenatori, cure e campana; viaggio fisico di Anemone|
|Monte Vite|198–204|Komor/Nardo, MN03, topologia e varianti delle quattro stagioni|
|Mistralopoli|113,115–119|Arrivo e servizi; palestra114 riservata alla tappa seguente|

Anemone è l'allenatrice25: Swoobat33, Unfezant33, Swanna35. Il cap resta35 prima della vittoria e diventa39 dopo la sesta medaglia, massimo della squadra originale di Silvestro131. Non abbassare livelli/XP legacy né modificare le squadre native. Inventariare separatamente eventuali rami facoltativi, fonti realmente raggiungibili e barriere del capitolo: Torre Dragospira e Cava Ponentopoli non diventano complete dalla sola conoscenza dei loro warp.

## Vincoli di integrazione

- A: migrare Komor, Anemone e Rutilo dalle posizioni effettivamente salvate nel viaggio049, senza ricrearli al prossimo evento. Anemone sale alla Torre e torna alla palestra dopo la campana; N resta disponibile all'aeroporto per il ruolo nativo successivo. Conservare i checkpoint fra porte, l'attesa dei personaggi realmente in arrivo e le giunzioni esterne107↔337↔198↔113. Il caricamento delle mappe adiacenti deve restare locale, senza unire tutta Unima in una scena.
- B: usare geometrie, permessi, superfici e animazioni originali. Cannoni108: dieci istanze, quattordici traiettorie campionate, innesco D-pad due caselle avanti, bordi81–88, logica30Hz e camera con occhio/bersaglio distinti. Non sostituire i percorsi con parabole generiche. Campana342: modello290/classe8, una BCA246frame e SFX1969.595/596 regolano il volume musicale; non sono zoom.
- C: ogni luogo combattibile e ogni nuova superficie Surf richiede un contesto geografico esplicito e presenze lontane realmente catturabili. Conservare ombre, appoggio, prospettiva e controlli dei cicli delle forme stagionali.
- D: consolidare prima la disponibilità nativa entro39, comprese evoluzioni finali degli starter, Pietratuono già ottenibile, MT/MN, scambio, Ricordamosse e mosse ereditate. La matrice049 resta la base1760/85 finché quella050 non è integrata e verificata; non inventare un conteggio dal solo roster estratto. Tutti i nuovi profili e le reazioni devono funzionare sui due lati.
- E: musiche, versi e suoni di cannoni/campana/Surf nativi, modulazioni, sincronizzazione e×1/×2/×4. Le prove del segnale restano distinte dal confronto udibile.
- F: nuova chiamata6 sul Percorso7 (banco674,entry8,PC138; membri Mamma/Alcide, archivio a/1/3/1:68). Verificare il banco testuale prima dell'integrazione: non riciclare il testo della chiamata2. Conservare comandi orizzontali, X/B nei modali e ricalcolo dei ritratti dopo lo spostamento del dialogo. Integrare i servizi effettivamente offerti e i loro limiti nativi.
- G: rispettare la proprietà della scena condivisa107 anche se il loader049 termina tardi. Surf usa quota fisica/logica distinta dalla posa; monte e acqua richiedono le superfici native WB/GC e la selezione del piano vicino alla quota, non il triangolo più alto o uno zero generale. Conservare salvataggi, annullamenti, cache limitate e recupero delle risorse.
- H: regressioni prima/dopo dei difetti, suite condivisa completa, renderer reale nei tre formati, inventari/prove/limiti, controllo dei file pubblici e pulizia delle build.

## Deposito locale e catture

Il PC locale è anche una dipendenza del finale: preservare il record completo del Pokémon e rendere atomica la consegna squadra/Box, senza rifiutare indiscriminatamente una cattura con sei membri. Riferimento privato storage-reference:8→16→24 Box da30, restrizioni sul membro cosciente rimasto e sulle lettere, ripristino PP e conversione Box→squadra con PS/stato nativi. Non presentare i soli pannelli grafici estratti come un servizio funzionante. Correggere coerentemente la validazione dello starter quando depositato o legittimamente liberato. Il comportamento speciale di Reshiram e le lettere del finale resta da implementare e verificare nella relativa tappa.

## Prove primarie e stato

I riferimenti IRBI sono conservati privatamente in outputs/chapter050 del workspace e nel rapporto dati del checkout: header/eventi/testi/allenatori, geometrie, cannoni, campana, stagioni, Surf, superfici, PC e progressione finale. Il banco674 è ora decodificato in tutte le nove voci; questo non certifica il supporto semantico dei suoi comandi. Il modello162 della casa343 è un segnaposto: il codice nativo seleziona209/Cottonee nella versione Nera, con fotogrammi originali già estratti.

## Avanzamento delle basi locali

Sono stati generati dalla ROM i cataloghi eventi, geometrie e descrittori delle27 zone:97 modelli statici e763 texture. `icirrus-data.js` comprende39 allenatori,109 specie/forme predisposte,17 tabelle di incontri con quattro stagioni e39 MT/MN; i precedenti dati di crescita, identità e mosse entro35 sono conservati. Il catalogo distingue le fonti ordinarie dai dati di pesca/fenomeni di solo riferimento. Questo inventario non certifica ancora fonti e servizi effettivamente giocabili.

La chiamata6 è estratta e supportata dall'host: Mamma/Alcide, archivio a/1/3/1:68 e banco197. La selezione è ora dimostrata dall'overlay174:021b668a–021b669a, banco191+ID chiamata. La nuova conversazione non riusa il testo della chiamata2. I test dell'host verificano partecipanti, testo e chiusura; il collaudo grafico nei tre formati della nuova tappa resta aperto.

Il loader049 conserva il proprietario050 della scena107, anche quando l'asset precedente arriva tardi. I comandi595/596 usano ora il volume musicale nativo0..127 e la divisione intera firmata0202878c, con avanzamento logico30Hz e checkpoint; volume utente, effetti e versi restano distinti. Sono presenti regressioni che fallivano prima delle due correzioni. Le prove del bus sono automatiche, senza dichiarare un confronto udibile.

`native-surfaces.js` campiona i piani WB/GC originali di44 mappe/49 strati;1027 campioni di riferimento indipendenti coprono triangoli e ponti sovrapposti, selezione della quota vicina e origine verticale. La cache decodificata è limitata a64 griglie. L'uso di queste superfici per personaggi, camera e Surf resta da collegare al nuovo campo.

La risorsa dei cannoni è stata convertita di nuovo dalla ROM nel catalogo050:10 posizioni,14 percorsi completi, quattro coppie BCA/BMA con alpha originali,4096 coppie seno/coseno Q12. `icirrus-gym-motion.js` verifica innesco, bordi direzionali, coordinate/campioni e aritmetica della camera. Conserva separatamente il punto finale Y10.25 del percorso21 e il riposizionamento nativo aY10. Il controller narrativo, la presentazione e il collaudo effettivo della palestra non sono ancora completati.

Sono inoltre estratti sei modelli animati di campo e sette collegamenti: la campana originale246frame è ora supportata dal selettore della classe8 con prefisso ic. Le24 specie aggiuntive hanno96 risorse Nitro fronte/dorso,48 ritratti e icone originali; Pokédex esteso a102 specie base. Le palette e i compositi sono stati ispezionati; la riproduzione numerica delle animazioni native non sostituisce le coreografie personalizzate in battaglia. Le evoluzioni finali degli starter sono riconosciute dalla validazione dei salvataggi. Prove e limiti in [QA-050.md](QA-050.md).

Restano aperti: registrazione delle nuove scene, controller e camera completa dei cannoni, campana, collegamento superfici/stagioni, continuità narrativa, Surf/PC/servizi, matrice delle coreografie e relative risorse, fondali, suite completa sulla nuova build, prove browser e distribuzione. La0.49 resta l'ultima versione pubblica verificata.


## Integrazione locale successiva alle basi

Il runtime ora registra le27 scene, le quote WB/GC e i binari della Torre, i cannoni con camera e geometria animata, la campana e i salti narrativi di Nardo. Gli itinerari continuano dai record049: Anemone sale alla Torre e torna alla palestra attraversando undici lanci reali; Komor e Rutilo attraversano i portali e le gallerie realmente collegate di Monte Vite. I checkpoint conservano la quota dei piani sovrapposti. N e Rutilo proseguono fisicamente verso il varco settentrionale di Mistralopoli, in attesa dell'estensione seguente.

Il replay dei comandi nativi `check-icirrus-runtime.cjs`, con esiti di lotta forniti dalla fixture, supera introduzione, campana, sesta medaglia/MT62, N all'aeroporto, Komor/Nardo/MN03, Team Plasma e arrivo di Rutilo a Mistralopoli. Riproduce anche il trasferimento di Komor dal controller049. Questa prova certifica la sequenza del controller, non un attraversamento manuale nel browser né le meccaniche delle lotte simulate.

La matrice numerica locale comprende2620 coppie su109 specie/forme entro39, con profili anatomici sui due lati. Quattro tavole dei gesti di24 nuove specie sono state ispezionate. Restano distinti replay numerico, campioni visivi e prova completa nel combattimento reale.

Un'ispezione del tetto della Torre ha rilevato che la nebbia trasparente scriveva nella profondità e copriva il personaggio. Il catalogo conserva ora142 gruppi con blending nativo e il renderer li ordina dopo i corpi senza scrivere nella profondità. Una regressione verifica ordine e ripristino dello stato GPU; la nuova resa richiede ancora verifica nel browser. I centri geometrici per l'ordinamento vengono calcolati una sola volta per gruppo.

Restano aperti Surf sul campo, PC e servizi facoltativi, varianti geometriche invernali, collaudo completo dei fondali e dei viaggi nel browser, suite condivisa della candidata aggiornata e distribuzione. Questa integrazione non è ancora una consegna050; la049 resta l'ultima versione pubblica verificata.


### Preparazione Surf dopo il checkpoint fa31a62

`extract-surf-field.py` riproduce dalla ROM le otto texture originali dei due personaggi, sea_ride, shibuki01 e le animazioni BCA/BTA dai membri49/54/107/133 di a/0/7/5, con hash degli originali. Le rotazioni/scostamenti direzionali provengono dalle tabelle native. `surf-field-motion.js` separa selezione della mossa, rive a una/due celle, quote native, approdo, occupazione, cancellazione delle risorse e checkpoint. Nove test isolati passano a velocita1/2/4. Non aggiunge requisiti di PS, PP o medaglie assenti nel controllo originale.

Questi file non sono ancora collegati a index/controlli/renderer: Surf non e ancora giocabile. La candidata verificata8e94a4aff25628dd precede questa preparazione. Restano da integrare sprite e modello sotto il personaggio, spruzzi, menu Squadra/A, caricamento e recupero, musica/incontri nativi, fondali acquatici espliciti e salvataggi, poi ripetere suite e attraversamenti nel browser. La cadenza della transizione continua e un adattamento HD-2D, non una misura temporale nativa.


### Collegamento Surf in collaudo

Surf e ora collegata ad A e al menu Squadra, con testi originali280/13-14 e157/79-80, selezione di un utilizzatore non uovo senza requisiti aggiunti di PS/PP, riva normale o speciale65/68 a due celle, occupazione del fronte/approdo, quote native e ritorno automatico a piedi. La MN03 viene insegnata attraverso Journey.teachMachine. Sprite originali del protagonista, sea_ride, spruzzi BCA/BTA e rotazioni/scostamenti originali sono usati nella presentazione; la temporizzazione continua e il cut-in della specie sono adattamenti HD-2D, distinti dal task197 e dal comando416 nativi. Il cut-in usa la coreografia personale della mossa57 e non viene dichiarato una riproduzione letterale dei fotogrammi originali416.

L'autosalvataggio puo registrare la traversata posseduta dal servizio Surf, mantenendo il blocco dei comandi e impedendo il salvataggio di altri script narrativi. Il controllo delle collisioni distingue il giocatore dai percorsi degli NPC. Caricamento differito, preparazione GPU, recupero delle risorse e ripristino del contesto utilizzano i servizi comuni. Le superfici WB/GC comprendono ora39 scene/89 mappe/106 strati: le aree precedenti raggiungibili con Surf conservano quote e ponti sovrapposti, con cache64 griglie.

Musica1013 condizionata dal bit14 dell'header e incontri stagionali Surf sono estratti dalla ROM, comprese le aree precedenti. I campi con rate0 non usano le tabelle terrestri e non tirano incontri acquatici. I nove contesti combattibili sono Levantopoli6, Libecciopoli96, Mistralopoli113, Bosco155, Percorso1/317, Percorso3/321, Grotta Minerale324, Percorso4/326 e Percorso6/331. Ognuno ha texture d'acqua esplicita, geometria nativa del luogo, superficie libera per i combattenti e presenza lontana ricavata dai soli incontri Surf ordinari. Le altre acque esplorabili senza incontri non vengono presentate come nuovi luoghi di lotta.

Le prove mirate di controller, origine delle superfici, cache e fondali passano. La nuova candidata deve ancora completare suite condivisa, prove grafiche e controlli di A/Squadra/touch nei formati supportati. Non e ancora una distribuzione050 e non certifica ogni riva come percorribile da un salvataggio reale.


### Vicini visibili di Mistralopoli

Il catalogo comprende ora9 celle visive adiacenti originali della matrice0,17 istanze e i membri67/68/69/204 con le rispettive texture e il portale146. Servono a sostenere il paesaggio e gli NPC originali visibili nella camera HD-2D ampia. Il catalogo completo sale a102 modelli/821 texture. Queste celle non aggiungono eventi o permessi del Percorso8/Torre Dragospira: i confini narrativi rimangono espliciti. Una verifica delle collisioni impedisce inoltre il passaggio prematuro tra il Percorso7 e Mistralopoli attraverso celle adiacenti visualizzate. La distribuzione pubblica resta049; PC, geometria invernale e collaudi complessivi050 rimangono aperti.
