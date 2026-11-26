# Ripresa della revisione064 · stato del port541

Il documento conserva la cronologia e i FAIL delle revisioni precedenti.
Lo stato corrente541 e del controllo automatico è consolidato nelle sezioni
«Raccordo541, comandi reali e limiti attuali» e «Port automatico actual541 su
Windows». I vecchi PENDING descrivono i rispettivi checkpoint storici.

## Aggiornamento del collaudo e del controllo automatico

Il run45174752181 sulla candidata08 ha concluso51 delle52 fasi con PASS.
L'unico errore confrontava due log nativi integrali generati ai lati di un
cambio di secondo: differivano soltanto le righe di timestamp `|t:|`.
La correzione riguarda esclusivamente l'orologio della VM di quella fixture:
il confronto integrale rimane, così come seed, precisione, danni e PP. Cinque
test passano in1793ms; un avanzamento controllato di un secondo cambia il log
ma conserva gli esiti, e il ripristino riproduce l'intero risultato.
L'orologio del processo host rimane originale. Il vecchio FAIL è conservato
in `outputs/animation-review064-resume-20261123/ci-seed-clock064-fix`;
il nuovo controllo completo deve ancora concludersi.

La matrice runtime dei tre profili protetti comprende54 celle
(due lati, tre formati, tre velocità):39 provate direttamente sulla08 e15
con il precedente trasporto privato, di cui sono verificati tutti i399
moduli decodificati e gli asset identici. Sono81 azioni con tutte le chiavi
confermate dal disegno concluso; non è una certificazione estetica globale.
Quattro prove reali sulla08 superano sospensione audio, perdita e ripristino
WebGL, annullamento e disattivazione audio. La revisione di tutte le immagini
di questi ultimi lotti è ancora in corso; nessun confronto all'ascolto è
stato eseguito.

Il successivo run45169070659 del codice07 supera i primi17 casi nativi,
ma Tynamo desktop raggiunge il proprio limite180s. Il limite cumulativo
precedente è quindi risolto, mentre questo FAIL per singolo caso rimane
distinto e richiede diagnosi. Non aumentare il timeout né trasferire alla08
i PASS della07.

La diagnosi dell'artefatto originale mostra55 PNG parziali di Tynamo e il
caso ancora in esecuzione, senza errore del gioco registrato. Il workflow
divide adesso soltanto Tynamo in tre lotti sequenziali ×1/×2/×4, con gli
stessi quattro turni, con otto azioni dei due lati per velocità, audio e assert originali. Conserva tutte
le54 celle formato–caso–velocità,180s per caso,30 minuti per passo, una
sola build e rapporti distinti sempre raccolti. Il runner inoltra il filtro
al server QA isolato e controlla anche le velocità dei turni conclusi;
un parametro nell'URL da solo non prova copertura. Venti controlli mirati
passano, compresi inventario, limiti e rifiuto di velocità mancanti o
duplicate. Il primo replay reale desktop della08 a×1 supera tutti gli
quattro turni e otto azioni in82099ms, con25 PNG esportati,399 moduli verificati e chiusura
dei processi confermata. I lotti×2/×4 sono ancora da concludere: non
attribuire ancora un PASS complessivo né una riduzione del tempo totale.

Il run GitHub45157199563, sul commit120158159fdac3e65cd5616424c2614adff1a8a4,
ha superato le52 fasi automatiche e i controlli di introduzione, titolo,
salvataggi e regressioni telefono. Il blocco delle animazioni resta **FAIL**:
sei casi in verticale, sei in orizzontale e cinque su desktop sono passati,
ma il limite cumulativo di30 minuti ha interrotto l'ultimo caso Tynamo su
desktop. Il log originale e la ricevuta sono conservati in
`outputs/animation-review064-resume-20261123/ci-45157199563-timeout`.

I workflow QA e Pages eseguono ora i tre formati in passi sequenziali
separati, con un solo download e una sola build. Restano gli stessi18 casi,
il limite di180s per caso, il fallimento immediato e la raccolta dei rapporti
anche dopo un errore. Dodici controlli mirati della configurazione passano;
occorre un nuovo run completo. Questa correzione non modifica il runtime,
non converte il vecchio FAIL in PASS e non certifica le immagini non ancora
esaminate del nuovo run.

Il port per i gesti saltati di Snivy/Fulmisguardo, Tepig/Colpocoda e
Liepard/Graffio è ora nei sorgenti del ramo e nella candidata locale08
`b2fa3b18ae22f8c2`, ancora **in collaudo e non pubblicata**. Le durate originali
100/108/126 e gli impatti46/51/60 restano invariati. Il controller conserva
le pose finché entrambi i corpi sono effettivamente disegnati nell'arena;
gli attacchi diversi e i contesti non verificati mantengono le guardie
precedenti. Non cambia le parti anatomiche, gli esiti GEN5 o i campioni audio
nativi. Nove nuovi test sui sorgenti reali e100 regressioni esistenti passano
in45738ms, con180s di budget, heap400MiB e sorgenti invariati durante la prova.
Il primo avvio del banco era stato negato dal sandbox prima dei test: quel
tentativo resta documentato separatamente.

La candidata08 usa il normale server QA Python, senza il trasferimento HTTP
aggiuntivo dei prototipi. Il primo replay a×4 in orizzontale supera i sei
scenari, con399 moduli verificati e tutte le chiavi effettivamente confermate
per le direzioni offerte dal caso. Restano necessari gli altri replay,
le direzioni inverse, il lifecycle audio/GPU e la nuova suite completa.
Le473 voci di sorgenti/trasporti cambiano soltanto per i tre moduli, `app.js`
e l'HTML versionato; tutte le20841 voci degli asset restano identiche alla07.

La prima prova grafica privata aveva completato i sei scenari a×1 e fallito nell'esportazione
del rapporto oltre4MB: l'esito complessivo rimane FAIL. La raccolta delle
tracce è stata separata dal rapporto, senza alzare il limite o indebolire gli
assert. I successivi prototipi passano in verticale a×1/×2/×4 e in orizzontale
a×1/×2; due interruzioni del trasporto locale prima del caricamento
dell'app restano FAIL e non sono prove della geometria o delle azioni.
La sovrapposizione dei corpi Minccino/Liepard e l'inquadratura delle
doppie con Tynamo rimangono problemi distinti, ancora in revisione.

H.8: la06 `cf264ab8433c8fe9` è stata archiviata e rimossa dopo ricostruzione e
verifica di tutti i32009 file:32001 dalla04 obbligatoria e8 dal delta ZIP,
SHA256 `134eba7d60b596ad78f4d749b849e730664436d87ce1e073029c5b65bbcc2f69`.
Prove, sigilli e ricevuta sono in
`outputs/animation-review064-resume-20261123/h8-c6`. Durante il collaudo restano
soltanto04 come dipendenza degli archivi,07 come confronto e08 come candidata.

La revisione prosegue dal checkout esistente. La cartella privata
`outputs/animation-review064` non risulta più presente e la ricerca nei percorsi
locali accessibili e nei metadati del Cestino non ha recuperato i suoi file.
Le descrizioni già commesse dei vecchi PASS restano cronologia documentale;
non sostituiscono rapporti e immagini mancanti. Non ricreare un pilot e
presentarlo come un originale recuperato.

## Registro della ripresa fino alla candidata06

Restano disponibili i sorgenti, l'archivio base verificato e la candidata04
`9d50b97661c11307`. La nuova candidata05 `16ae4134ba4f7230` integra
[Colpocoda500/503](TAIL-WHIP-064.md) e il
[dimensionamento condiviso602](TYNAMO-FRAMING-064.md). Le immagini e i dati
nativi dei Pokémon non vengono sostituiti. Il primo intervento corregge la
mossa di stato e le parti realmente animate; il secondo conserva appoggi e
punti degli effetti nella stessa scala. Doppie/multi e inviluppi delle pose
autoriali non ricevono una certificazione implicita dal calcolo idle.

I nuovi rapporti sono separati, sotto
`outputs/animation-review064-resume-20261123`. La costruzione della candidata
non è un PASS della suite completa, una approvazione estetica o una
pubblicazione. I test CPU mirati passano; i replay e la suite finale sono in
corso e devono riportare i propri esiti effettivi.

Il banco aggiunge comandi reali per Raffica, Colpocoda e le quattro mosse native
di Tynamo. Le squadre sono fixture isolate; i seed entrano nel costruttore GEN5,
senza sostituire precisione, danni, PP o esiti. Le finestre approssimate di
Colpocoda/Tynamo rimangono distinte dalle chiavi confermate dal clock di
Raffica. Gli altri replay di lotta possono selezionare sottoinsiemi espliciti
di velocità e, quando richiesto, riattivano il vero motore audio dopo `ready()`.

`run-bounded-qa.cjs` conserva i controlli del runner grafico originale e limita
ogni lotto a240s,400MiB di heap,64MiB di PNG e220MiB di spazio residuo. Usa un
solo proprietario Chrome invisibile, profilo temporaneo, priorità ridotta e due
CPU. PID e tempi di nascita delimitano le operazioni di pulizia. Output
preesistenti sono rifiutati; un arresto non verificato conserva il lock.

L'osservatore separato confronta il testo degli script realmente eseguiti via
CDP con il trasporto immutabile, ordine e riferimenti delle funzioni. Riconosce
il wrapper previsto di Unfezant e il suo predecessore nativo. Questa provenienza
non giudica il movimento. Il primo tentativo ha fallito per un contratto
dell'osservatore che pretendeva erroneamente il solo draw nativo; il secondo
ha trovato gli helper esclusi dalla whitelist del server QA. I tentativi
rimangono FAIL; la whitelist ha ora una regressione HTTP effettiva.

La candidata06 `cf264ab8433c8fe9` conserva il primo port del clock Colpocoda,
prima dell'estensione agli avversari diversi. Una prova anticipata di Tynamo
a×4 ha inoltre riprodotto il salto della finestra di impatto di Scintilla;
quel rapporto resta FAIL. La protezione delle sue quattro mosse viene quindi
integrata prima di congelare la candidata successiva. Non attribuire i PASS
della05 a questo nuovo codice.

H.8: la candidata05 è stata archiviata e rimossa dopo verifica completa dei
32009 file. La ricostruzione usa32004 file della candidata04 e cinque file
nel delta ZIP, SHA256
`8d60ceb79cd0d880de57cf13a3c0823640c4a8759d4e6e8b250ee3fa27996f9c`.
Manifest, ricontrollo dei file, sigilli e ricevuta della pulizia sono esterni
alle build in `outputs/animation-review064-resume-20261123/h8-c5`.
**La candidata04 resta una dipendenza obbligatoria dell'archivio.** Le copie
conservate sono04 e06; la prossima candidata può affiancarle durante il
collaudo. La precedente build063 e la candidata03 non sono più presenti;
questa ripresa non ne dichiara una nuova archiviazione o rimozione. ROM,
sorgenti, archivio base e rapporti disponibili restano preservati. Il blocco
temporaneo dello standby deve essere rilasciato soltanto al termine effettivo
del lavoro, senza cambiare il piano energetico.

## Aggiornamento alla candidata07 · collaudo ancora aperto

La candidata07 è congelata alla revisione `85b98d70e88848df`. Integra Colpocoda500/503
anche contro avversari nativi di specie diversa e il controller delle quattro
mosse di Tynamo. I dati, i clip audio e le coreografie già presenti rimangono
distinti dalla protezione dei loro fotogrammi importanti. In particolare il
controller602 non introduce una nuova anatomia o una coreografia esclusiva.
I contratti di contatto205/360 restano limitati al proprio caso verificato.

I log CPU mirati di sette file registrano94/94 PASS e un picco RSS osservato
di380,55MiB, con campionamento nominale100ms nel processo dedicato. Sono in
`outputs/animation-review064-resume-20261123/tynamo-presentation-c7`;
non costituiscono una misura del picco assoluto, del telefono fisico o un
giudizio sul rendering. I vecchi51/51 della candidata04 non sono il rapporto
completo della07.

La suite completa C7/r1 rimane **FAIL**: il fixture minimo di ordine degli
script ometteva il merge del catalogo e il terzo gruppo unitario ha superato
il budget180s. La correzione del fixture conserva il controllo negativo del
vecchio indice. Il fixture separato di framing passa11/11 sia prima sia dopo
l'allineamento del cap al catalogo finale: quel PASS→PASS non viene descritto
come un bug riprodotto. Log e ricevute sono in `index-order-c7-fix`; il
raggruppamento sequenziale dei percorsi è documentato in
[DEVELOPMENT-RULES.md](DEVELOPMENT-RULES.md). Nessuna soglia o asserzione è
stata allentata. La nuova suite completa C7/r2, di52 fasi, è **in corso** al
momento di questo aggiornamento. Conservare il rapporto r1 e registrare
l'esito effettivo di r2 prima di dichiararla superata.

La [PR58](https://github.com/kazael96/soffiolieve-hd2d/pull/58) è una bozza.
Il [controllo CI](https://github.com/kazael96/soffiolieve-hd2d/actions/runs/45150343970)
richiede la propria verifica; qui non se ne anticipa l'esito. Anche i replay
della07, le letture indipendenti delle immagini e gli eventuali confronti
audio devono conservare ricevute riferite alla build realmente eseguita.
Un formato390×844 è una prova nel formato telefono, non una certificazione
di Android fisico. Non è dichiarata una nuova pubblicazione.

Durante questo collaudo sono conservate04,06 e07:04 è il riferimento
verificato e la dipendenza dell'archivio differenziale05,06 serve al
confronto,07 è la candidata corrente. Ogni futura pulizia H.8 deve rispettare
quelle dipendenze e mantenere le ricevute fuori dalle build. Le frasi del
registro precedente sulle copie04/06 descrivono il momento antecedente
alla costruzione della07.

## Risultati successivi della ripresa

C7/r2 ha completato **52/52 fasi PASS** sulla revisione locale
`85b98d70e88848df`; SHA256 del rapporto completo
`6418ca0eebcbf1da28c27beef699624484146785d8a20be2777b6d8103bfcea1`.
I52 stadi della CI45150343970 sono passati separatamente su Linux.
I replay grafici e il loro giudizio rimangono distinti dal risultato CLI.

La CI costruisce `1f048ea8de0cd906`: la differenza è riconciliata esattamente
con20 file CRLF locali che Git distribuisce LF (19 script individuali e un
JSON di provenienza). Il bundle `app.js` e i pacchetti non cambiano. La prima
comparazione tramite `git hash-object` applicava i filtri Git e non costituiva
una prova dei byte grezzi; la rettifica usa `--no-filters`, conserva il primo
rapporto e ricostruisce esattamente entrambi gli identificativi. Ricevute in
`outputs/animation-review064-resume-20261123/ci-45150343970`.

Nella stessa CI passano introduzione, titolo, tre slot, lancio/ere e regressioni
telefono. Il nuovo gate delle mosse rimane invece **FAIL**: l'osservatore
pretendeva `minccinoPose` anche per1/3/541, che il runtime esclude esplicitamente
dalle nuove coreografie approvate. La correzione del banco conserva tutti i sei
scenari e gli esiti GEN5: Canto47 richiede la posa autoriale, gli altri tre
richiedono il corpo nativo precedente e respingono l'installazione delle nuove
sequenze trattenute. Questo intervento necessita del nuovo esito CI, non cambia
il codice C7 né riscrive il FAIL precedente.

Restano due finding grafici distinti: la forte sovrapposizione nei contatti
Minccino/Liepard, confermata nei PNG effettivi della CI, e i ritagli602 nelle
doppie verticali, riprodotti dalla nuova diagnostica delle funzioni originali.
I precedenti PASS delle singole non li chiudono. La segnalazione di Alcide
assente nei due fermi «ready» era invece un errore di lettura: la rilettura degli
stessi PNG invariati mostra chiaramente il protagonista; la rettifica additiva
conserva note e hash precedenti. Il bordo lilla coincide con la palette opaca
originale NARC e non dimostra un nuovo difetto alpha.

Nessuna nuova pubblicazione o revisione completa di tutte le animazioni viene
dichiarata da questo aggiornamento. I comandi MN, i filmati modificati e i
lifecycle durante le mosse rimangono attività di collaudo esplicite.

## Candidata09 · comando nativo e leggibilità ancora da correggere

La candidata09 privata è congelata alla revisione `80b062d4e490b7bc`;
SHA256 di `app.js`
`1cdae3ef0542a536489dcca2f22f997108df2387ad0e7239def0aa3f67bee590`.
Rispetto alla08 cambiano sei moduli: audio, presentazione, interfaccia,
coreografia Minccino, effetti e inquadratura. Tutti i20841 asset restano
identici. Manifest e ricevute sono esterni alle build, in
`outputs/animation-review064-resume-20261123`.

Minccino572/Doppiasberla3 usa le parti native con piedi fermi, preparazione,
alternanza delle zampe e recupero finale. Il numero dei gesti deriva dai colpi
effettivi del motore: nessun secondo danno inventato per un effetto sonoro,
nessun recupero intermedio duplicato. Fra colpi reali viene conservata solo
la posa conclusa, mentre audio, timer e conferme precedenti vengono ritirati.
Cancellazione, errore e cambio di sessione, attore o banco invalidano quel
possesso; un caricamento vecchio non può riattivarlo. Botta1 e Sveglipacca541
rimangono escluse dalla nuova coreografia. Canto47 conserva il suo profilo.

Il framing comune delle singole510/572 considera le silhouette originali dei
due banchi e le camere previste. Le sei regressioni CPU coprono parti,
alpha, dispatcher e proprietà dei banchi: non certificano ogni fase della
nuova azione di Liepard, che resta separata e non integrata.

Le prove mirate registrano42/42 PASS per contratti e osservatore,
109/109 regressioni preesistenti e6/6 controlli del framing. Un comando reale
LOTTA/Doppiasberla è stato eseguito in due replay verticali indipendenti,
ciascuno con un turno GEN5, due clip di colpo,66 conferme di fotogramma,
399 sorgenti verificati e ripristino delle nove funzioni osservate. Gli otto
avvii di voce per replay provengono dai due clip originali; non rappresentano
otto colpi. Non è dichiarato un confronto all'ascolto.

Tutti i17 PNG del primo replay e i67 del secondo sono stati esaminati dal
responsabile. Il primo ha anche una lettura indipendente. La correttezza
tecnica **non chiude la verifica visiva**: il gesto resta poco evidente e il
simbolo SPA163 viene presentato in circa7–11 pixel CSS, troppo piccolo per
leggersi chiaramente. I raggi generici iniziano prima del contatto nativo e
possono coprirlo. È in preparazione un confronto privato che conserva corpo,
texture, tempi e meccaniche, adattando l'unità spaziale dell'effetto alla scala
del bersaglio e togliendo soltanto quell'overlay generico per572/3. Non è
installato in questa candidata e non è presentato come misura esatta del DS.

La CI45183464849 sul commit `195c1ad56e18ad2d471670c6673a969c1a812c5e`
è terminata con successo:52 fasi CLI, cinque gate dell'indice originale e
replay nativi nei tre formati, con Tynamo suddiviso per velocità. Certifica
il checkpoint precedente08, non i sei moduli nuovi della09. Ciascun lotto
Tynamo di una velocità esegue quattro turni e otto azioni: i tre lotti desktop
locali contano12 turni,24 azioni e75 PNG, non24 turni. La nuova suite completa
della09 e la matrice di comandi sui due lati rimangono da eseguire.

Restano aperti la leggibilità Minccino, lo staging di Liepard con resize e
recupero, e il rendering effettivo a quattro combattenti delle doppie602.
I FAIL privati di preparazione e degli inviluppi vengono conservati; i nuovi
contratti numerici non li trasformano in approvazione estetica. La revisione
dell'intero catalogo4365 coppie, dei105 comandi MN e dei filmati/oggetti resta
distinta da queste prove mirate. La storia principale già consegnata non
cambia e la PR58 rimane una bozza senza nuova pubblicazione.

Pulizia H.8: la07 è stata ricostruita e verificata file per file prima della
rimozione della sola directory generata. Sono conservate04,08 e09:04 resta
base obbligatoria degli archivi,08 confronto verificato e09 candidata.
Sorgenti, ROM, archivio base e rapporti sono preservati. Prima di una candidata
successiva occorre rispettare nuovamente questo limite e conservare una
sostituta verificata; nessun accumulo di copie generate è autorizzato.

### Esito CI09/r1 e correzioni del banco

La CI45198705537 sul checkpoint `f04e05dda24a39b923e1004121d01731d9a73fcb`
ha concluso **50/52 fasi PASS**, con due gruppi unitari falliti. I gate browser
successivi sono stati saltati: non risultano superati. Il rapporto originale,
SHA256 `7d97afad90e5d7a729795f9ef9aa0d6b94974a089b89dddf00b15d203ee6ca84`,
resta conservato in `outputs/animation-review064-resume-20261123/ci-45198705537`.

Il quarto gruppo richiedeva ancora che Doppiasberla572/3 non conservasse la
posa intermedia, comportamento deliberatamente aggiornato nella09. La nuova
aspettativa misura esattamente i colpi nativi, il rilascio finale e la pulizia
degli stati nei due ruoli; un controllo su Audino impedisce di estendere la
nuova politica ad altre specie. Rimangono invariati i confronti di log,
PS, PP, turno e aggiornamenti dell'interfaccia per ogni danno o cura.

Il sesto gruppo si fermava prima della geometria: il pin del JSON di prova
era stato calcolato sui byte CRLF locali, mentre Git distribuisce LF. Il
confronto deve accettare esclusivamente quella normalizzazione e mantenere
il pin esatto del contenuto, senza ignorare coordinate, spazi o altri byte.
Queste sono modifiche dei test e non una nuova revisione del runtime09.

La revisione CI `9a7de10e6601a193` è riconciliata con la locale
`80b062d4e490b7bc` mediante22 differenze grezze CRLF→LF, confrontate con i
blob Git effettivi del checkpoint. Non sono stati scaricati e verificati
indipendentemente i byte dell'app remota. L'identità della revisione non
trasforma il FAIL50/52 in un PASS: occorre l'esito della nuova suite completa.

Le correzioni mirate passano78/78 controlli del replay multicolpo e6/6 del
framing. Gli stessi78 controlli con la vecchia sola interfaccia08 producono
76 PASS e i due FAIL attesi sulla posa intermedia572/3. Il pin geometrico
accetta LF/CRLF e respinge cinque modifiche diverse, compresa una coordinata
reale. Queste prove conservano runtime e asset09; la nuova CI completa resta
necessaria prima di qualificare il checkpoint per il rilascio.

### Ripresa del25 novembre: risorse, proprietà e leggibilità

La CI45204070028 su `a19017249745aa3c4b7461d0bb6b42a1171956f7` conclude
52/52 fasi CLI e i cinque gate dell'indice originale. Le prove native
verticali e orizzontali passano, ma `qaBattleActions064` desktop scade al
budget180s: il risultato complessivo rimaneFAIL. Sono presenti54 immagini
di azioni desktop,18 per velocità;62 è l'ultimo ordinale osservato, non il
numero dei PNG. Dopo quell'azione resta Snatch a×4. Non è ancora distinta
un'attesa bloccata da un costo aggregato eccessivo. Nessun timeout viene
aumentato per ottenerePASS. Archivio originale SHA256
`f2e221b164843e6272fd8bab52587ecba7dc25acae323a442308c05f8c9fb260`,
in `outputs/animation-review064-resume-20261125/ci-45204070028`.

Il nuovo gruppo corregge un caso non coperto dalla09: il percorso nativo
di Doppiasberla572/3 viene selezionato soltanto nelle singole con i due
proprietari originali disponibili. Doppie, multi e attori già alterati
conservano il percorso precedente. Durante un caricamento non viene
adottata silenziosamente una nuova sessione, un nuovo attore o bersaglio.
Le risorse sono controllate prima di cancellare l'arena; il recupero usa
il servizio originale di retry e pausa per rete assente o scheda nascosta,
senza rieseguire il turno GEN5 o cambiare il caricatore globale del campo.
Una vecchia azione non può rimuovere un pannello di un altro proprietario.

Texture e sequenza SPA163 restano originali. L'adattamento HD-2D usa una
densità0.55 dell'unità del bersaglio e un'origine condivisa fra emettitori
principali e secondari abbassata di0.18 della sua altezza. È una scelta di
messa in scena, non una misura dei pixelDS. Il solo overlay generico della
coppia protetta viene escluso. I12 contatti CPU dei due colpi, nei due ruoli
e nei tre formati, sono stati letti dall'autore, dal responsabile e da un
revisore indipendente: il palmo lascia visibili occhio e muso. Questa prova
statica non approva ancora naturalezza della sequenza o comando nel browser.

L'interfaccia conserva la sessione proprietaria attraverso attese di turno,
eventi, messaggi multipagina e riproduzione della mossa. Il completamento
di una vecchia lotta non scrive reazioni, pose mantenute, caption o stato
dei comandi della successiva. I test negativi riproducono i difetti con il
codice precedente; restano i controlli di successo, errore e cancellazione.

La ricerca dell'identità grafica restituisce subito0 per `undefined` e
`null`, evitando scansioni ripetute di forme e specie per campi assenti.
I confronti usano cataloghi reali e snapshotGEN5, comprese forme, sesso,
stagioni e nomi. Non cambia il percorso degli altri valori. Le misureNode
private rimangono distinte da una misura diFPS o dei tempi su Android.

I sorgenti installati passano101/101 controlli mirati in41074ms:79 di
protocollo e preparazione nativa,17 dell'interfaccia e5 dei cataloghi.
Il primo tentativo non ha avviato il processo figlio per `spawn EPERM`;
è preservato separatamente dall'avvio autorizzato. I loader portabili
conservano le asserzioni e normalizzano soltanto CRLF→LF nelle due fixture
di confronto sorgenti. I primi tentativi privati con import mancanti restano
FAIL. Canvas0.1.100 viene installato prima della suite CLI nei due workflow.
QuestiPASS non sostituiscono collaudo completo e rendering del codice nuovo.

Graffio di Liepard e densità delle doppie602 restano proposte separate,
non installate in questo gruppo. Il primo richiede ancora soluzione del
miss, clipping, proprietà e prestazioni; il secondo richiede i quattro
corpi effettivamente renderizzati. I controlli mirati non certificano la
revisione globale delle4365 coppie e dei105 comandiMN. La PR58 resta bozza.

La09 è stata archiviata secondoH.8 prima della10:32009 file ricostruiti e
ricontrollati,31999 dipendenti dalla base04 e10 nel deltaZIP, SHA256
`15e8a22a67c9335ca080969e9db99ad09b60f87c371abf78376f070cc18a7906`.
È stata rimossa soltanto la directory generata09, dopo i controlli di
percorso, Git, reparse e processi. Restano04 come base obbligatoria degli
archivi e08 come confronto verificato; sorgenti, ROM e rapporti sono
preservati. I test successivi usano gli asset08 con i32 pin nativi
individualmente confrontati, senza dipendenze eseguibili dalla09 rimossa.

### Candidata10 e compatibilità dei test

La10 locale `fe54a7ae6c478b40`, appSHA256
`679a696ac968bb1e6b750f421f733681ff7c9bab2657c3d697c075f4a941ccc4`,
passa il primo pilot effettivo di Doppiasberla nei tre formati:6 turni
nativi,12 clip di colpo,396 conferme protette e48 avvii delle voci originali.
Ogni turno usa i pulsanti LOTTA/mossa e i due colpi realmente risolti dal
motore. Sono verificati399 moduli effettivamente eseguiti e il ripristino
dei12 hook osservati. Tutti i12 PNG di contatto sono stati letti dal
responsabile; i quattro verticali hanno anche revisione indipendente.
Il renderer osservato è IntelHD630/D3D11 suWindows: non è Android.

Il primo pilot fallito resta preservato. Il suo osservatore registrava i
clear anche durante la preparazione, ma ometteva le vere chiamate R.draw
quando MoveFX non era ancora attivo. La regressione sul raccoglitore usa
R.prepare/R.draw originali, accetta due corpi realmente disegnati e rifiuta
zero/uno, alpha0 o disegni su un altro canvas. La nuova raccolta conserva
l'asserzione integrale e salva anche i diagnostici prima dei controlli.
Il replay nuovo passa; il witness storico incompleto non viene ricostruito
retroattivamente. I sei WebM rimangono disponibili per l'esame del movimento.
Questi risultati non coprono ancora miss, KO precoce,3–5 colpi,×2/×4,
guasti o sospensioni nel renderer, né l'approvazione visiva globale.

La CI45579984976 conclude48/52 fasi CLI; i successivi gate browser sono
saltati. I quattro gruppi falliti comprendono un pin grezzo della nuova
fixture `png-pins.json`, trasformata daCRLF aLF daGit. La correzione
normalizza solo quei terminatori prima del pin canonico, verificato contro
il blobGit originale; PNG e dati nativi mantengono SHA sui byte grezzi.
Il test di accettazioneLF fallisce con il vecchio helper; tutti i cinque
controlli passano con quello nuovo, inclusi i negativi sui veri hash e dati.

Le vecchie fixture isolate di Patrat e Unfezant non dichiaravano una
Session, ora necessaria al contratto dell'interfaccia. Ricevono un
proprietario stabile esplicito, mantenendo ogni asserzione su eventi,
preparazione, danni, cancellazioni e reazioni. Il codice del gioco resta
identico alla10. L'intero gruppo mirato aggiornato passa124/124 in43155ms,
senzaFAIL o skip. Il rapportoCI48/52 originale e il suo archivioSHA256
`f35e0967a31cf4a49e032f1ae2d46a37595d734587602b470b9fc349f019ff12`
restano conservati. Una nuova CI completa è richiesta dopo queste sole
modifiche dei test; nessun precedenteFAIL diventaPASS per questo documento.

### Isolamento delle velocità nel collaudo CI

La successiva CI45584501483 sul commit60e9 conclude52/52 fasi CLI e i
controlli browser di introduzione, titolo, lancio/transizioni, tre slot e
regressioni telefono. Le prove native verticali e orizzontali passano;
`qaBattleActions064` desktop supera nuovamente180s. Il rapporto conserva
46PNG di azione:18 a×1,18 a×2 e10 a×4, fino al colpo54. Il log finale è
Graffio/Doppiasberla; nessun erroreJavaScript o richiesta fallita è
registrato. Questi dati non dimostrano la causa né un blocco del gioco.
L'archivio originale haSHA256
`f066cc3295819ab265523a6eace877e0c134dee44fc8d0638672c2c7ed62df37`.
Il PNG di errore mostra soltanto la testa della paginaQA e non approva
la scena di lotta. Gli altri PNGCI restano prove da esaminare, non una
revisione visiva completata.

I due workflow separano ora anche i cinque casi principali per velocità:
tre processi sequenziali a×1/×2/×4 per ciascun formato, oltre ai tre già
separati diTynamo. Le54 celle formato–caso–velocità sono identiche, senza
duplicati o omissioni; restano180s per caso, fallimento immediato, rapporti
distinti e conservazione degli artefatti anche in errore. Il runtime e la
candidata10 non cambiano. I controlli mirati passano14/14 in1636ms,
compresi inventario, negativi sui limiti, selezione delle velocità e turni
GEN5 effettivi delle sei squadre. Il nuovo controllo di separazione
fallisce sul workflow precedente. Sono conservati anche il mancato avvio
`spawn EPERM` e il primo tentativo con percorso asset non dichiarato;
il successivo usa esplicitamente la10. QuestoPASS statico non sostituisce
la nuova esecuzioneCI né certifica un miglioramento del tempo complessivo.

La CI45595363257 sul commitd12671d concludeSUCCESS:52/52 fasi CLI,
i cinque gruppi browser dell'indice e tutte le18 esecuzioni native.
Il controllo indipendente dei rapporti verifica54 celle uniche
formato–caso–velocità e198 record di turni nativi, senza duplicati o
omissioni e con cleanup riuscito in ciascun processo. Il build remoto è
`96f796fbd1851aa7`. L'archivio grafico completo è preservato conSHA256
`9537efa270c837428ffe007a09f7dd5021f67655e6be1657874bf964524c137f`;
contiene1080PNG. La verifica dei rapporti non costituisce una lettura
visiva di quei1080PNG né una nuova approvazione estetica. I timeout
precedenti restanoFAIL storici; la causa generale delle differenze di
prestazioni fra le esecuzioni non è dimostrata.

Un ulteriore pilot desktop della10 misura i componenti durante due turni
reali di Doppiasberla, senza PNG, WebM o copie di canvas dell'osservatore.
Passano i quattro clip, con132 conferme protette e16 avvii audio,
399 programmi effettivamente eseguiti e sette binding ripristinati.
Il caso richiede26490ms; il picco precedente620ms non si riproduce.
Nei quattro intervalli associati alla mossa, il massimo di drawArena è
26,9–34,8ms e quello del fondale animato25,4–33,9ms; i record comprendono
anche la preparazione precedente ad active. Nel turno completo, inclusa
la risposta avversaria, drawArena raggiunge82,3ms. Non sono misure di
FPS né di CPU esclusiva, e non certificano Android, confronto udibile,
causalità delle catture o la futura candidata11. Il precedente controllo
senza registratore conservava quattro PNG a f60: non era una prova priva
di catture e non isola da solo il costo della registrazione.

### Recupero di Graffio e integrazione locale successiva

Il batch successivo introduce una preparazione proprietaria di Graffio
di Liepard: controlla Session, lotta, attori e generazione prima delle
risorse e dopo le attese; una preparazione annullata non può proseguire
sulla nuova azione. Gli errori del caricamento nativo consentono tentativi
automatici limitati e un nuovo tentativo manuale, con sospensione quando
la scheda è nascosta o manca la rete. Il fotogramma concluso resta valido
soltanto per il proprietario originario. Il ripristino degli hook avviene
in ordine inverso e non sovrascrive callback installate da altri sistemi.

Sul batch V4 congelato passano67 casi CPU in40 processi separati,
in118103ms sommati:16 recuperi con I/O,21 controlli dello stage,28
regressioni precedenti e due casi G7 corretti. Passano separatamente
anche i due test F1 di identità degli hook, in429ms. Nessun caso saltato,
nessuna differenza fra testo compilato e sorgente attestata, nessun
processo proprietario residuo. Le fotografie RSS dei41 processi
strumentati, incluse le due baseline, sono213,82–321,50MiB; non sono
il picco del sistema operativo. Il gruppo leggero da28 non misura RSS.

Sono preservate due baseline qualificate: il caricamento iniziale V2
fallisce realmente dopo i due tentativi del loader; il secondo caso V2
passa già quando il banco pronto viene ripristinato e si richiama la
preparazione. Quest'ultimo PASS non prova tentativi automatici, riprova
manuale o continuità del fotogramma. Restano conservati anche i FAIL
delle fixture prive della sincronizzazione reale dell'inquadratura e
dell'asserzione che richiedeva metadati identici a due rami legittimi.
La correzione di queste fixture non cambia geometria, tolleranze,
runtime o budget.

Le cinque sorgenti del batch sono integrate soltanto nel checkout locale;
il rapporto aggregato haSHA256
`9dd37ea430b201fd11a5351fe1d4e76b8e32e51f5bd9f5f8cb1cfeb5d21c7661`.
I test portabili e la suite completa sul codice finale, i comandi reali
nel browser invisibile, la revisione grafica e le prestazioni della nuova
build restano da concludere. Questi PASS di protocollo non certificano
movimento continuo, audio udibile, Android o il catalogo artistico globale.

La candidata locale11 è `9e0e68b0e1468f60`, appSHA256
`3ac317c88c2e8f36ea2a1aee09446236563579fddbade700ce11aaee803156c2`.
La10 è stata rimossa soltanto dopo la ricostruzione verificata dei32009
file e i controlli di percorso, collegamenti, Git e processi; restano
base04, confronto verificato08 e candidata11. I rapporti e l'archivio
della10 sono conservati. Sul checkout finale passano124/124 regressioni
precedenti in41419ms e16/16 nuovi casi portabili in6451ms. Il primo
avvio dei16, impedito da `spawn EPERM`, resta documentato; il secondo
usa un rapporto distinto. Nessun PASS della copia privata V2 è trasferito.

Il primo profilo strumentato della11 conclude due turni effettivi di
Doppiasberla, quattro clip,132 conferme e16 avvii audio, senza PNG, WebM,
copie di canvas o fotogrammi forzati dell'osservatore. Sono verificati i399
programmi e il ripristino dei binding. Il caso richiede30567ms. Sul quarto
clip si osservano567,9ms fra due disegni,524ms dentro drawArena e512,2ms
nell'intervallo di drawAmbient. Questo rallentamento resta aperto: tempi
inclusivi non identificano CPU, attesa del driver o una causa specifica.
La prova usa Chrome158 e Intel HD630/D3D11; non misura Android o audio
all'ascolto. Il profilo riguarda Minccino e non attiva lo stage di Liepard.

Il primo F1 portabile fallisce prima dei casi: il loader normalizza i
metadati CRLF ma li confronta erroneamente con il pin raw del JSON.
Il FAIL è conservato; il nuovo provider deve distinguere esplicitamente
pin LF dei metadati e pin raw degli asset, con regressioni dedicate.
Questo errore della suite non è corretto alterando i byte dei dati nativi
o le asserzioni funzionali. La suite completa e il rilascio restano aperti.

Il providerR2 corregge i due pin dei metadati derivati, conservandone i
byte originari e tutti i pin raw nativi. Passano cinque regressioni del
loader in663ms e i due F1 portabili in525ms. Seguono18/18 casi di
risorse/recupero in52723ms sommati e49/49 casi del controller/ciclo di vita
in22 processi separati, senza skip o processi residui. I corpi originari
e le asserzioni funzionali restano intatti. Dopo l'integrazione dei65 file
condivisi e dell'unico raggruppatore, passano anche i12 controlli di loader,
hook e distribuzione in715ms. L'inventario reale assegna423 file una sola
volta alle51 fasi unitarie; il registro completo ne prevede92, ancora da
eseguire prima di dichiarare la suite completa riuscita.

Passano due prove effettive di `qaBattleActions064` in verticale: il caso
originale e una fixture con le quattro squadre di contatto invertite,
che porta Graffio di Liepard sul lato avversario. La seconda conserva
tutti i sei scenari, i comandi touch, i risultati GEN5 e le asserzioni;
traspone soltanto squadre e corrispondenti ruoli nel controllo dei danni,
inclusa l'eccezione di Canto. Non fornisce pose, PS o risultati della lotta.
I due controlli della trasposizione, compreso un danno mancante nel caso
Canto, passano in436ms. La prova nativa P2 richiede74717ms e osserva2104
chiamate di posa con associazione esatta a proprietario, corpo e fotogramma,
zero associazioni invalide e ripristino dei binding originali. Non sono
2104 fotogrammi distinti. Sorgenti effettivi399 e cleanup sono verificati.

Sono letti da root e da un revisore indipendente tutti i19 PNG del caso
originale e i quattro PNG originali selezionati di Graffio avversario.
Sagome e sfondo risultano leggibili nei campioni; i14 shot non esportati
del secondo caso conservano le asserzioni pixel, ma non una lettura visiva.
I PNG contengono soltanto l'arena: non certificano HUD o movimento completo.
Il vecchio Spazzasberla541 sovrappone Minccino alla testa/spalle di Liepard
nel campione14; le nuove coreografie1/541 restano escluse. Il palmo di
Doppiasberla rimane sottile nei campioni e richiede ancora giudizio della
sequenza. Due console HTTP404 compaiono nei rapporti, senza URL conservati:
la causa deve essere identificata, senza attribuirli arbitrariamente alla
favicon o dichiarare assenti gli errori di rete. Pubblicazione e chiusura
artistica globale restano separate da questi PASS mirati.

### Compatibilità Node e diagnostica desktop del25 novembre

La suite GitHub45621297400 sul commit1f81 conclude52 fasi CLI con PASS;
le40 fasi dedicate nuove falliscono prima dei callback perché Node22.23.5
non accetta il nome stabile `--test-isolation=none`. I gruppi browser
rimangono non eseguiti: questo run non è una suite completa riuscita.
Il FAIL e il relativo archivio sono conservati. La correzione seleziona
`--experimental-test-isolation=none` per22.8 e prime23, e il nome stabile
da23.6. Non cambia la versione CI, i callback funzionali o i budget.

I due controlli privati effettivi con Node22.23.5 e24.22.3 passano entrambi
12 casi: cinque regressioni del raggruppatore, sei nuove verifiche di
versione/guardie e un test privato del PID. Sono gli stessi12 casi su due
versioni, non24 casi diversi. Il PID osservato dal parent coincide con
quello scritto indipendentemente dal callback e il PPID con il launcher.
L'inventario passa a424 file, sempre51 fasi unitarie e92 CLI complessive.
Questo gate non esegue i39 callback funzionali né i quattro controlli602;
la loro nuova prova con il runtime22 e la suite completa restano distinte.

Il caso GraffioP2 passa anche in orizzontale e desktop, con le stesse
sei battaglie reali e i quattro shot originali selezionati per formato.
Le quattro immagini di ciascun formato sono lette da root; quelle del
telefono anche da un revisore indipendente. Nessun taglio è osservato in
questi campioni, senza approvazione implicita del movimento o dell'HUD.
Nel desktop il raccoglitore passivo, installato prima della navigazione,
identifica entrambi i console404 come richieste a `/favicon.ico`, tramite
location e Log CDP. Non risultano risorse di gioco mancanti in questa
prova. Il listener response non osserva quei due errori: il solo suo
elenco vuoto non avrebbe autorizzato questa conclusione. Cleanup dei
listener/CDP e dei processi proprietari verificato; nessun browser personale.

Il successivo lotto sul checkout integrato esegue con il vero Node22.23.5
tutti i40 processi dedicati e passa43 casi senza skip:21 lifecycle,18
risorse/recupero e quattro602. Usa gli argv restituiti dal raggruppatore
reale, senza wrapper, preload o argomenti aggiuntivi; il runner originario
conserva180s, heap400MiB e output8MiB per fase. Durate sommate: 145365ms.
Tutti i pin restano invariati e i39 sidecar confermano un callback per
processo. Questo PASS locale non sostituisce la nuova suite GitHub.
I quattro PNG desktop sono ora letti anche dal revisore indipendente;
restano le stesse limitazioni del giudizio su fermiimmagine.

### Suite completa e revisione delle immagini · 25 novembre

Il run GitHub45630901928 sul commit1da93bfbef579a4943b829f03881b3a8cf941f0c
conclude con SUCCESS:92/92 fasi CLI, cinque gruppi browser e18 lotti
nativi nei tre formati a×1/×2/×4. La somma delle durate CLI è775426ms;
non è una misura del caricamento sul telefono. Il build CI è
e493acd6c1ef87ac, distinto dalla revisione locale9e0e68b0e1468f60.
La correzione dei flag Node non modifica il runtime del gioco.

Gli archivi e i rapporti sono conservati fuori dalle build in
`outputs/animation-review064-resume-20261125/ci-45630901928`.
L'archivio nativo408738306byte ha SHA256
1e6aaddbd5dff6ee6cb1c04895d6244632b8dd5730f0fbe078868421cd711640.
La prima estrazione supera il limite di percorso Windows; l'estrazione
verificata nel percorso breve `outputs/ci064green/native` riesce.
Questo errore di estrazione non è un errore del gioco o della suite.

Il manifest delle292 tavole conserva1410 PNG originali a scala1:1,
con didascalie esterne ai pixel. La generazione delle tavole non ne
certifica la lettura. Il revisore ausiliario ha effettivamente aperto
tutte le79 tavole dei330 PNG di introduzione, titolo, slot, lancio e
regressioni telefono; non osserva nuovi blocchi concreti su nomi,
ritratti, tagli o menu in questi campioni. Le immagini dell'arena prive
di HUD e i cataloghi QA restano distinti dalle schermate giocabili.

La revisione dei1080 PNG nativi è conclusa:177 tavole/720 PNG desktop e
orizzontali da un revisore,36 tavole/360 PNG verticali da un altro.
Con le79 tavole ausiliarie, l'aggregazione verifica292 tavole/1410
originali unici, senza omissioni o sovrapposizioni di assegnazione.
Letture e hash sono documentati separatamente nei ledger esterni;
root ha inoltre riletto16 tavole/84 campioni nativi indipendentemente.
Non risultano nuovi tagli evidenti dei corpi nei campioni; alcuni impatti
riusciti di Tynamo restano densi e richiedono giudizio in movimento.
Una seconda lettura
del campione desktop205/P1/MISS/contact60 segnala un'ambiguità: il corpo
ruotato di Emboar appare unito al guanto del bersaglio nonostante il
colpo fallito. Non è una misura di sovrapposizione alpha. Il caso richiede
diagnosi e controllo visivo prima di chiudere il rilascio correttivo.
La CI verde non approva il movimento completo né chiude le pose nuove
di Minccino, gli effetti SPL15 o la revisione artistica dell'inventario.
La PR58 resta bozza; nessun merge o aggiornamento pubblico è implicito.

Una proposta privata cambia soltanto i due margini MISS da3 a8 pixel
nativi, conservando i byte del riferimento storico e tutti gli HIT.
Il primo gate si ferma dopo5408ms: sei controlli PASS e uno FAIL, zero
skip e pin invariati. Prima di campionare il primo MISS205/P1 verticale,
il test misura13,8171px di headroom contro16,6986px richiesti; soltanto
127 pose HIT sono quindi confrontate, nessuna posa MISS approvata.
L'esito resta FAIL. La variante non è installata e non ha prodotto PNG.
Occorre rivedere il contratto della traiettoria prima di proseguire:
questo esito non autorizza un'affermazione di separazione visiva corretta.

Il diagnostico successivo misura12 contesti sul modulo originale senza
modificarlo:1848ms di processo,45 pin invariati e picco RSS194,066MiB.
Nel primo MISS il coseno con il vettore dei centri è0,980595: l'ipotesi
della normale quasi tangente non è confermata. Il riposo tick0 ha10,0691
pixel nativi di gap sullo stesso asse, contro6,6195 dell'inviluppo
conservativo. Nei due MISS P2 verticali il gap conservativo5 è il clamp
del modello, mentre il riposo corrente misura16,3265. Una seconda
proposta della sola normale di approccio resta non sigillata e non viene
eseguita. Questi numeri non certificano la sicurezza di8 pixel in movimento.

Sono estratte separatamente le superfici visibili native complete di
Emboar:45 CEL,130 OAM, inclusi coda e fiamme. Il processo termina in468ms,
con pixel originali alla risoluzione nativa, nessun ridimensionamento e
pin invariati. La geometria108304byte e il ledger38007byte rimangono
privati; non modificano i supporti fisici o il runtime. Un correttore
istantaneo basato su coppie AABB selezionate da un filtro Y booleano
può introdurre salti: il controesempio statico è conservato. Non è
approvato come traiettoria continua dal solo min/max dei supporti.

Un nuovo pilot della zampa vicina BACK di Minccino usa una sola edit
Imagegen, preservata con prompt e riferimenti. Il raw non è pixel art
nativa già pronta. L'importer originale resta byte identico e fallisce
ancora sullo stencil dei sette campioni, prima di R.prepare/R.draw.
Un diagnostico distinto conserva esplicitamente FAIL/REJECTED e produce
sette PNG mediante due R.prepare e due R.draw originali. Con i due PNG
STRICT sono nove immagini, tutte lette da root: il palmo si estende
più chiaramente oltre il collo, ma il gesto rimane piccolo a scala
nativa e non prova il contatto animato. Corpo49px, piedi e pixel fuori
dall'OAM restano invariati;37 pixel cambiano nella sola parte. Nessun
nuovo cel, asset o profilo di Minccino è installato.
Anche un revisore indipendente legge tutte le nove immagini: considera
il palmo un concetto di contatto utile per un futuro pilot, mantenendo
esplicitamente FAIL/REJECTED e la mancata approvazione a scala nativa.

### Correzione Emboar e nuove prove locali · 25 novembre, seguito

Il difetto concreto dei MISS205 è corretto nel modulo di contatto,
senza modificare il ramo HIT o i dati grafici originali. La correzione
usa tutta la sagoma nativa, comprese coda e fiamme, e un piano fisso
che comprende tutte le fasi idle raggiungibili del bersaglio. Aggiunge
soltanto l'arretramento necessario alla posa MISS breve originale;
non la porta fino al piano del contatto riuscito. La preparazione
rifiuta un riposo non separabile. La variante privata V3 conserva
il FAIL sul segno dello zero; V3r2 preserva esattamente x/groundX
quando l'arretramento vale zero e passa7/7controlli in10396ms.

Nel checkout integrato la prova portabile passa di nuovo7/7 in11711ms:
1524pose HIT identiche al riferimento storico,1524MISS con canali non
orizzontali identici, geometria/piano indipendenti, recupero e riposo,
identità delle banche e sei mutazioni in-place rifiutate. Il controllo
storico del rotolamento passa in3590ms. Riferimento storico e budget
restano invariati; i due loader delle fixture non forniscono pose
precalcolate al runtime. Questa prova CPU non disegna immagini.

La candidata12 è compilata con revisione4ed37d9fe9a925f8, appSHA256
631d24411695ca2325b80a23c850a863fece75bbdcbac7949f73a543357bfab9.
Il replay effettivo LOTTA/mossa/GEN5 passa nei tre formati a×1/×2/×4:
36turni e72esecuzioni complessive, comprese18MISS205 sui due lati;
il MISS360 è verificato qui dalla prova CPU, non da questi turni.
Esporta216PNG dell'arena e quattro cataloghi QA. Il backend rilevato
è Chrome158/ANGLE/Intel HD630/D3D11, non una GPU Android fisica.
I quattro lotti terminano con zero processi proprietari residui.
Le immagini e i rapporti sono in `outputs/ci064green/candidate12`.

Un revisore indipendente apre tutti i25PNG verticali a×1 e tutti
i73orizzontali alle tre velocità. Non osserva nuovi tagli; nei MISS
lo sfondo separa l'intera appendice dal guanto/corpo avversario.
Root rilegge le otto tavole verticali dei24campioni e i due originali
MISS al contatto. La lettura degli altri lotti continua separatamente;
le immagini dell'arena senza HUD non approvano tutta l'interfaccia,
il movimento continuo o l'audio. Il dettaglio della correzione è in
[QA-064-EMBOAR-MISS-FULL-PLANE.md](QA-064-EMBOAR-MISS-FULL-PLANE.md).

Il nuovo pilot BACK di Minccino arriva ora al renderer originale:
due preparazioni,64disegni e40PNG. Conserva FAIL in2852ms per34rilievi,
tra cui copertura della testa e attacco al corpo; alcune carenze
del socket sono presenti anche nel riferimento nativo con il rig
corrente. Nessun nuovo CEL è installato. La prima prova di una lettura
rettangolare dei pixel ambientali conserva FAIL4453ms sul budget RSS
400MiB del banco CPU; nessuna ottimizzazione è installata. Prima di
attribuire quel costo al gioco va verificata la vita dei buffer del
banco. Questi due FAIL non vengono promossi a PASS dal successo Emboar.

La nuova suite completa è ancora necessaria sul commit che include
questa modifica del runtime. Il PASS CI1da93bf resta riferito al suo
codice esatto. La PR58 resta bozza e la versione pubblica0.63 non è
stata aggiornata da questi collaudi locali.

### Letture ambientali e candidata13 · 25 novembre, seguito

I primi FAIL del banco CPU restano conservati. Restituendo il controllo
all'event loop per il rilascio dei buffer nativi, il confronto completa
32passi e2340coppie senza cambiare confrontoRGBA, fallback, ownership
o limiti. Il port integrato passa in30698ms, piccoRSS125604KiB e pin
invariati; i cinque casi del registro passano in461ms. La prova Canvas
Chrome separata completa gli stessi32casi logici in tre processi
limitati, dopo il FAIL del precedente lotto unico. Sono prove del
componente, non misure degli FPS o della memoria del gioco.

Il checkout comprende425file,52fasi unitarie e93fasi CLI. Solo il nuovo
owner ambientale riceve GC esplicito, mantenendo170s/RSS400MiB interni
e180s/heap400MiB/output8MiB esterni. La CI45661390800 sul commit
ec208305db65663f0953f0a887e26dc51a1db7d4 passa92/92fasi precedenti;
non comprende questa nuova fase. Il report CLI marca browser NOT_RUN:
i risultati dei gruppi browser appartengono ai rispettivi artifact.

La candidata13, revisione2fdac51b57c70626, include la proposta locale
DioramaSHA25656bccd637d8e48cbe409c832ac48ae5de379e58b178701261c8ea2c5efdbf0d7.
La qualificazione nell'app è ancora aperta. Il primo riferimentoC12
fallisce prima della navigazione per breakpoint CDP duplicati. Il
secondo esegue il comando GEN5 e le due fasi, ma fallisce alla chiusura
per due errori console404 non attribuiti; i quattro PNG mostrano il
catalogo QA invece della partita e non sono prove visive dell'arena.
Entrambi i FAIL sono conservati, con cleanup riuscito. Il banco viene
corretto senza alzare i budget né eliminare i controlli. Restano da
misurare la convenienza nell'app e la nuova suite completa; PR58 e
versione pubblica0.63 non cambiano per queste sole prove locali.

### Qualificazione nell'app e contratto dei protocolli · 25 novembre, seguito

Il riferimentoR4 risolve i404 con un'icona incorporata nella sola
fixture, dopo averne provato l'origine esatta tramite Network/Log.
Restano attivi tutti i controlli a zero errori. Quattro owner isolati
passano: C12/C13 di riferimento e C12/C13 profilati. Le399sorgenti,
il delegato nativo e i binding sono verificati; nellaC13 i due attori
504/506 usano realmente rettangoli ridotti. Root e un secondo revisore
leggono tutti gli otto PNG dell'arena/HUD. I profili non hanno
breakpoint, PNG o wrapperR/Species. Il confronto conserva i log grezzi
e normalizza soltanto il valore numerico delle righe native `|t:|`,
mantenendo posizione, quantità e ogni altro dato della lotta.

L'area media letta scende da65536 a circa25960pixel, ma i tempi della
prima coppia sono misti: peggiorano a freddo e migliorano al riuso.
Non è ancora approvato un beneficio prestazionale complessivo; una
coppia in ordine inverso verifica questo punto aperto. I rapporti
sono in `outputs/ci064green/ambient-readback-actualapp-v4` e nella
cartella separata del confronto dei timestamp. Nessun risultato FPS
o qualità del movimento è implicito.

La CI45675796534 sul commit353f123 esegue93fasi:54PASS e39FAIL.
Il nuovo owner ambientale passa32passi/2340coppie in15534ms. Tutti
i39FAIL dei protocolli avvengono sul vecchio pin Diorama, prima dei
loro casi funzionali; i successivi cinque gruppi browser e18nativi
sono saltati. Il contratto corrente diventa esplicitamente
`coherent-v4-plus-ambient064`, preservando il contrattoV4 originale
in una fixture storica. Cambiano solo il pin Diorama e i metadati
che distinguono la base storica dal contratto corrente. I cinque
controlli del loader passano in579ms; non sostituiscono la nuova
esecuzione dei39casi o della suite completa. Runtime e budget restano
invariati durante questa migrazione.

### Decisione prestazionale e ritorno alla FULL · 25 novembre, seguito

La CI45679530895 del commit405f7ca completa93fasi CLI, cinque gruppi
browser e18nativi con successo. I39casi precedentemente fermati dal pin
sono rieseguiti PASS; resta il solo skip Windows-only previsto suLinux.
Le immagini di quella CI non sono state revisionate e non trasferiscono
un'approvazione artistica.

Il successivo ordine inverso R5 conferma il peggioramento del readback
rettangolare: C13 è respinta. Anche la diversa alpha memo privata supera
correttezza e riuso ma non il giudizio di utilità dopo una sola ABBA:
la mediana migliora, mentre la coda cold peggiora ripetutamente. Non si
eliminano gli estremi né si apre una terza ottimizzazione. Il runtime
torna alla FULL originale e36; storiaV4 e V4+ROI rimangono distinte e il
contratto corrente dichiara esplicitamente il ripristino.

I nuovi controlli mirati passano32casi/2340coppie ambientali in30311ms e
cinque casi provider in600ms, con limiti e guard mantenuti. Fonte,
decisione, dati e limiti sono in
[QA-064-AMBIENT-FULL-RESTORE.md](QA-064-AMBIENT-FULL-RESTORE.md).
La suite completa del nuovo commit e il rilascio restano da concludere.
C13 è stata archiviata, ricostruita/hash-verificata e rimossa secondoH.8;
04,08e12 sono preservate.

Minccino ha cinque nuove pose BACK-near private e un primo pilot della
mossa3 reale: due colpi GEN5 completi,33ACK percolpo, SPA/audio originali,
stato/esiti coincidenti con una Session nativa indipendente e tutte le
sette immagini lette da due revisori. Il GO riguarda soltanto il primo
near osservato; far/front, movimento continuo, handoff e produzione
rimangono aperti. Nessun nuovo asset è installato da questo ripristino.

### Esito del ripristino e nuovi pilot privati · 25 novembre, seguito

La CI45704666787 del commit807d788c6d221541999a4a93f27e18f2e15c6de8
conclude con successo93fasi CLI, cinque gruppi browser e18lotti nativi.
I39casi lifecycle/recovery passano senza skip; resta lo skip Windows-only
storicamente previsto su Ubuntu. Il banco ambientale passa32passi e2340
coppie in18424ms. I sei artifact grafici della CI non sono stati scaricati
né letti: il risultato tecnico non costituisce una nuova revisione estetica.
PR58 resta draft; nessun merge o rilascio deriva da questi soli risultati.

Il pilot BACK-far di Minccino conserva le pose autoriali già esaminate, ma
il ponte intermedio con il rig originale cambia bruscamente corpo e palmi.
La decodifica integrale del filmato,361fotogrammi in cinque tavole tutte
lette da root e da un secondo revisore, conferma questo difetto. Il secondo
pilot elimina il ponte e trattiene l'anticipazione: tutte le188immagini
codificate, esportate in tre tavole, sono state lette da root. Non mostra
tagli o frammenti evidenti, ma l'attesa è troppo lunga e il recupero cambia
ancora sagoma. Anche questa variante resta privata, senza approvazione del
ritmo, del comando o dell'audio. I filmati non sono una misura degli FPS.

Nel FRONT, PASSING e CONTACT near hanno superato i rispettivi controlli
sorgente e composizione con i piedi originali. PASSING usa una registrazione
anatomica documentata: traslazione intera del centro degli appoggi, senza
riscalare o correggere singoli pixel. Il precedente FAIL di registrazione
rimane conservato. Le pose dipinte GATHER e FAR sono ancora mancanti o
respinte. Il confronto alternativo con il rig FRONT-far originale passa
dieci campioni e venti draw; entrambe le tavole sono state lette da due
revisori. Mano collegata e volto leggibile consentono soltanto una futura
preview in movimento: il gesto piccolo sotto la mandibola non è ancora
approvato come coreografia finale.

Per Spazzasberla541, il primo criterio di separazione orizzontale richiedeva
uno spostamento già a riposo in due dei dodici contesti e resta respinto.
Il nuovo piano geometrico fisso considera l'intera sagoma dell'attore e
l'inviluppo conservativo completo di idle e reazione del bersaglio. Il
controllo freddo passa12/12contesti, con spostamento esattamente nullo a
riposo e ritorno, senza modificare sorgenti o runtime. Non verifica ancora
gli intermedi, il renderer o il comando. Separare anche la coda non prova
il contatto fisico della coda, la cui articolazione resta un lavoro distinto.

Il successivo controllo della traiettoria privata valuta6252campioni con
tempi frazionari. Cinque contesti superano il criterio strict e sette lo
falliscono per residui di riproiezione nell'ordine di10^-13pixel; nessun
FAIL viene convertito in PASS con una tolleranza. Non emerge una
compenetrazione delle hull non espanse nei campioni, ma il ritiro arriva
a108pixel e non ha un'approvazione grafica. I difetti preliminari della
fixture sono conservati: invocazione anticipata della funzione shadow,
ordine del signed zero nella rotazione e precedenza del rig. Il profilo
base572/541, senza `graphic`, usa effettivamente Demo572 (reach.69), mentre
il valore.8 di Chapter572 è nominale. Il controllo delle ombre conserva
il fallback reale del gioco quando `groundX` è assente; omettere quella
proprietà non costituisce da solo un errore.

Un esperimento distinto articola il gruppo coda nativo sul posto. Tutti
i24draw e le due tavole sono stati esaminati da due revisori: il primo
arco scende sotto gli appoggi nell'anticipazione e attraversa la testa
nel colpo. Resta respinto, senza modifiche al gioco. Il nuovo metodo
richiede una traiettoria leggibile e verificata, non il solo superamento
del vincolo di separazione fra avversari.

Anche la singola revisione con arco sollevato resta respinta: risolve il
passaggio sotto il terreno, ma la coda copre ancora la testa. Il metodo
di rotazione rigida viene fermato, senza una terza ricerca di angoli.
Una nuova CONTACT completa disegnata appositamente curva invece la coda
verso l'esterno. Tre PNG sorgente e tre della composizione R sono letti
integralmente da root e revisori separati. Il pilot passa2prepare/2draw,
con prefisso nativo immutato,43pixel dei piedi originali, sei raccordi,
una componente e zero mismatch o tagli. La posa isolata è una candidata
plausibile, non un'animazione completa: la figura risultante è alta54px
contro49 del riposo. Testa rialzata, torso più diritto ed esposizione dei
piedi richiedono passaggi disegnati e una nuova verifica del movimento.
Nessuna nuova posa è installata da queste sole prove private.

La preview FRONT nativa ha inoltre351fotogrammi decodificati in quattro
tavole, tutte lette da due revisori. Corpo integro, ma gesto minuto e
alternanza poco leggibile; nessuna promozione a coreografia finale. Alcuni
pannelli mostrano uno spostamento isolato dell'intera scena, di causa
non dimostrata. Mossa3 non contiene comandi di camera; la fixture aggiorna
il frame durante il disegno del personaggio, dopo lo sfondo, e richiede
un clock coerente prima di eventuali nuove acquisizioni. Questo difetto
del banco non viene attribuito automaticamente al gioco pubblicato.

Le prove e i candidati rifiutati restano in `outputs/ci064green`, fuori dal
sito. Nessuno di questi pilot estende l'approvazione alle4365coppie o alle
105MN. Il blocco temporaneo dello standby rimane attivo durante il lavoro
autorizzato e viene rilasciato alla sua effettiva conclusione.

Le quattro pose dipinte successive per541 (GATHER, PASSING, FOLLOW e
RECOVER) sono conservate con prompt, riferimenti e ricevute reali. Due
prime generazioni non hanno restituito un'immagine; i singoli tentativi
invariati successivi sono riusciti. Root e un revisore indipendente hanno
letto tutti e quattro gli originali. La famiglia resta respinta prima del
pack: anticipazione e recupero non seguono la progressione della testa,
gli appoggi sembrano rialzati e FOLLOW restringe troppo la radice della
coda. I quattro config preparati non sono eseguiti; nessun nuovo PNG di
pack, draw, sequenza o asset installato deriva da questa famiglia. Le
misure mancanti non vengono inventate né il difetto corretto con fit o
traslazioni. Il seguito valuta separatamente la completezza delle parti
native della coda per una vera articolazione a due giunti, mantenendo
corpo e piedi originali; non riapre la rotazione rigida già respinta.

La copia privata della fixture FRONT passa ora il clock al guard iniziale
dell'arena, prima di sfondo e personaggi; il campionatore del Pokémon non
lo modifica. Dodici regressioni CPU sugli hook estratti passano in36ms:
ordine temporale, estremi0/126, proprietari estranei, errori e ripristino
delle identità. Il negativo precedente mostra il guard al frame0 e la
posa successiva al90; la copia nuova mantiene60 per guard, campionatori e mark,
avanzando a108 soltanto all'arena seguente. Il test usa stub espliciti,
non Game o R; non spiega i salti dei vecchi filmati. Per nuove acquisizioni
usare il case privato77d79 in `mf-front-native-motion-clock-v2`, con i suoi
pin e rapporti, conservando la vecchia prova. Questa correzione del banco
non modifica il runtime del gioco.

L'isolamento R della coda BACK mostra che CEL7 contiene anche una base
nascosta: non equivale a un pennacchio già separato. Il nuovo pilot divide
le OAM originali senza eliminarne pixel: immagine19 mobile, immagini20–23
statiche. Preserva le33posizioni visibili alla base e ricompone a riposo
l'intero originale. L'atlante è immutato; solo due CEL, due tracce e una
mappa sono aggiunte ai metadati privati, con inverso esatto e mappe0/1
intatte. Tutte le otto coppie di pose nelle due tavole sono lette da root
e da un revisore indipendente: volume49 e appoggi originali stabili,
flessione distinta fra60 e72, senza seconda radice o gradino evidente.
Il gesto resta contenuto e non è approvato come movimento o contatto541.

La stessa curva passa poi505campioni distinti a intervalli di un quarto
di frame, da0 a126, senza cambiare sorgente o soglie. Tre processi
sequenziali eseguono511draw, inclusi i sei controlli iniziali, con zero
nuovi PNG. In tutti i505campioni restano invariati i17pixel visibili dei
piedi, i33pixel statici e il corpo protetto; nessun distacco, head-cover,
spill o attraversamento del terreno. I picchi RSS campionati sono sotto
143MB, con400MiB di limite per processo. Sono prove tecniche Canvas/NAPI,
non fotogrammi del gioco, misura degli FPS o certificazione estetica.

Anche il FRONT è isolato con R originale: tre draw, due tavole lette da
root e da un revisore indipendente, ma coda dietro al corpo e geometria
diversa. La sua partizione e le sue pose richiedono verifiche proprie.
L'integrazione futura conserva il JSON nativo20b3 come riferimento e
richiede un tipo esplicito per la sola derivazione qualificata; i guard
di BG e Liepard non devono essere aggirati dalla fixture. Nessuna di
queste prove private installa da sola la mossa o pubblica una build.

Il FRONT supera successivamente il proprio pilot di otto pose e la griglia
di505campioni:511draw, tre preparazioni, zero nuovi PNG. Root e revisore
indipendente leggono entrambe le tavole; root ricontrolla i505record.
I25pixel visibili dei piedi e il corpo protetto restano identici; i21pixel
della porzione statica sono tutti conservati nella sorgente, mentre quelli
visibili nella composizione variano da17 a21 per occlusione. La coda resta
dietro il corpo, con giunti e geometria propri della vista frontale.
Queste prove approvano le pose della sorgente, non il movimento completo.

Il runtime locale ora riconosce esplicitamente gli originali e le sole due
derivazioni qualificate, controllandone prefissi, ricetta, immagine e
appoggi. Le16regressioni mirate passano; il renderer originale è invariato.
L'API pura della coda conserva i contesti, compreso MISS0/0, e coincide con
le sorgenti in1010campioni. Il loader aggiunge la revisione della build
soltanto ai due JSON interessati, evitando una vecchia risposta HTTP dopo
un aggiornamento:28test mirati passano. Il builder opt-in con provenienza,
hash RAW e inverso strutturale passa cinque test Python. Gli originali
rimangono riferimenti immutabili separati dai metadati derivati.

Al checkpoint precedente la selezione541 era ancora spenta. Il seguito
locale descritto sotto non trasferisce i PASS delle sorgenti al comando
effettivo. Il vecchio CI del commit807d788c resta storico e non certifica
il runtime modificato.

### Raccordo541, comandi reali e limiti attuali

La candidata14, revisione1f321a517cf3aaa0, contiene le due partizioni ma
non il nuovo controller541. Il controllo di coerenza legge tutti399moduli
effettivi, comprese le dieci risorse provenienti dall'archivio originale.
Nel suo preview sorgente due presentazioni normali e due rallentate per vista
mostrano la coda con il corpo piantato:361fotogrammi BACK e277FRONT,
esportati senza perdere campioni e letti tutti da root e da un revisore
indipendente. Le nove tavole mantengono coda, testa e piedi nel ritaglio.
Il gesto contenuto è una base articolata utilizzabile, non l'approvazione
dell'intera Spazzasberla. Restano documentati l'arco generico vicino alla
testa e cambiamenti del fondale di causa non provata.

I FAIL precedenti rimangono conservati. Il riesame offline dello zero
con segno usa uguaglianza esatta, senza tolleranze; non riscrive il FAIL
originario dell'observer. L'export finale cambia soltanto la serializzazione
PNG dopo verifica che ogni pixel sia opaco e che la riapertura restituisca
gli stessi byte RGBA; nessun campione, soglia o budget viene rimosso.

Il checkout locale integra poi cinque programmi per il solo caso nativo
singolo572/541: acquisizione dei proprietari prima dei caricamenti,
parti della coda autorevoli, superficie anatomica distinta per vista,
soppressione del solo arco generico marcato e piano protetto già esistente.
Sono preservati SPA704,39frame nativi, anchor0, impatto60 e le due voci
1651/1427. Le48chiavi includono i gesti e i40tick dell'effetto; a FPS bassi
la presentazione può allungarsi. Doppi/multi e corpi inizialmente non
supportati mantengono il percorso precedente. Una perdita del proprietario
dopo acquisizione rifiuta il vecchio chiamante.

Il contratto precedente621 è conservato immutabile. Il nuovo b73 dichiara
soltanto i cinque hash modificati; l'inversa delle43operazioni ricostruisce
i sorgenti precedenti, mentre l'inversa storica M3 resta invariata dopo
la rimozione delle sole cinque aggiunte Minccino. I riferimenti RAW nativi
mantengono il proprio significato. CI e Pages richiedono ora esplicitamente
la stessa opzione del builder; sei test Python passano, compreso il controllo
di corrispondenza dei due workflow.

Sul nuovo checkout passano19test di provider/metadati/framing e17di rig,
senza skip e con input invariati. Il primo banco541 separato passa14test
in65,282s, con picco RSS osservato338136KiB: clock, lease, caricamenti
tardivi, cancellazione, hold e AudioEngine su nodi dichiaratamente simulati.
Non esegue R.draw, GEN5, PCM o ascolto. Il banco indipendente GEN5/UI passa
82casi, inclusi Protezione541, KO anticipato e assenza della proprietà miss
nelle ripetizioni; usa un trasporto registrante e non certifica il renderer.

Il successivo port installato passa16casi in73,660s, con picco RSS
osservato335472KiB e126input invariati. Comprende due nuovi negativi:
perdita del proprietario durante la hold126 senza cancellazione esterna,
seguita da un nuovo chiamante non sovrascritto dall'IO vecchio; perdita
durante l'attesa R.prepare propria dell'API, separata da Species.prepare.
Gli otto test del registro passano e verificano427file,53fasi unitarie e
94CLI; tutti i52argv precedenti rimangono invariati. La coppia di test541
ha un processo dedicato con GC esposto e la medesima soglia RSS osservata.
Il PASS privato14 rimane distinto da questa esecuzione del port16.

L'audit del caricamento collega R.prepare al resourceGate reale del Game.
La prova con R.prepare simulato che rigetta resta distinta dal recupero UI
reale descritto sotto. Quest'ultimo riguarda lo switch2 che richiede572-back
uncached e il restante replay541; non dimostra un guasto dentro la prepare
diretta nativeTail541, il cui banco è già disponibile dopo lo switch.

La candidata15 coerente, revisione `b3b66a0b19856770`, supera la verifica
dei399moduli effettivi, delle due derivazioni e degli atlanti RAW invariati.
Il successivo comando reale R4 passa su desktop a×1, nei due ruoli e con
caricamento freddo/riuso: quattro turni GEN5, otto chiamate M.play e12PNG
letti integralmente da root e da un revisore indipendente. Sorgenti e asset
restano invariati e i processi vengono chiusi. È un PASS tecnico del caso
singolo572/541 supportato, non l'approvazione del movimento continuo.

La matrice privata V4 supera tutte le nove combinazioni dei tre formati a
×1/×2/×4:18casi,36turni GEN5,72presentazioni MFX e3456ACK. Tutti108PNG
sono letti dal revisore B; root esamina anche sei campioni di picco. Le
sorgenti restano invariate e la chiusura lascia zero processi. È copertura
tecnica dei comandi e di quei fermiimmagine, non visione continua del moto,
contatto fisico approvato o ascolto. Il FAIL V3 della lineage texture a×4
e il primo avvio EPERM restano conservati; V4 condivide solo il WeakMap
dell'observer tra P1/P2, senza cambiare il gioco.

La suite completa Windows precedente resta FAIL:69fasi passate e25fallite,
con builder e40controlli runtime passati. Le quattro fixture corrette
conservano inverse e assert; il target25processi supera59callback senza
skip, con22139input identici e389sorgenti/399moduli C15 invariati.
La successiva CI107 del commit6e8b60abdb809ddb3c7367ffd6b56d3ea14c7a39
(run45767542695) conclude il workflow con SUCCESS e43step riusciti:
94CLI, cinque gruppi browser e18lotti nativi. Il deep report conserva
separatamente NOT_RUN per il browser, eseguito nei suoi step successivi.
Un solo helper Windows è escluso per piattaforma nella CI Linux; la sua
esecuzione Windows storica è documentata e non rende PASS l'intera vecchia
suite Windows fallita. Nessun FAIL storico viene riscritto.

I recovery R1/R2 restano FAIL preservati. R1,32,959s, rifiuta i retry
asset_retry1/2 del loader e supera il budget diagnostico16KiB. R2 osserva
24 risposte503 reali ma fallisce il controllo di raggiungibilità del retry;
la correzione successiva nasconde e ripristina il pannello QA. R2 non aveva
raccolto una misura DOM-hit che dimostrasse il bersaglio effettivo: tale
evidenza appartiene alla fixture corretta. Non è una prova di guasto del gioco.
V5 actualR3 passa in57,782s:24 risposte503 possedute, poi una risposta200
RAW verificata della stessa risorsa revisionata, con i soli retry1/2 del
loader. Non si afferma che tutte le stringhe URL fossero identiche.
Una sola azione UI/GEN5, medesima promessa resourceGate e due presentazioni541
restanti; il retry usa il pulsante originale con input Playwright e hitguard,
senza rieseguire GEN5. Root e C leggono entrambi i due PNG; sorgenti invariate
e cleanup0processi. Il routing disabilita la cache HTTP di Playwright:
non è un benchmark cold. La verifica software del port è separata, sotto.

Restano aperti movimento continuo, qualità completa della541 e revisione
artistica globale del catalogo/MN. Il componente M3 V2 aveva soltanto una
lettura RAW visiva preliminare: il gate sorgente eseguito una volta fallisce
per tre pixel alpha trasparenti nel core, non per i colori RGB. Sono21pixel,
bounds[5,5,12,10] e una componente; i due PNG sono letti da root e C.
Il run2,06s conserva gli input e non esegue R.prepare, R.draw o Game.
La sorgente è quindi NON QUALIFICATA e non integrata. Le prove non certificano
4K, GPU Android fisica o confronto udibile con la cartuccia. PR58 resta bozza,
senza merge o deploy; la versione pubblica rimane0.63.


### Port automatico actual541 su Windows

Il batch del port conta15file: agli11iniziali si aggiungono la allowlist
Python del server QA, il relativo test HTTP e due fixture dei workflow
aggiornate per i proprietari Linux e Windows distinti. Gli otto programmi JS superano
la sintassi Node22. Il primo target passa28callback con i17gruppi puri
dell'adapter. Un nuovo negativo del vero observer, in un contesto dichiarato
simulato, produce prima28PASS/1FAIL; la correzione dei due catch conserva la
causa primaria, con quattro edit letterali e inversa esatta al c620.
Il target successivo passa29callback senza skip, con tutti i17gruppi
preservati. Queste unit non sono prove Game o raster.

Il controllo dei workflow conserva tutti54casi logici e18step nativi del
proprietario Linux, con un solo download e una sola build dentro quel job.
Il nuovo proprietario Windows prepara separatamente la stessa base
autenticata: il controllo del builder ora pretende esplicitamente entrambi
i comandi con il flag nativo. I vecchi assert globali falliscono prima
dell'adeguamento; i13controlli Node dei workflow e i6test Python del builder
passano dopo. La regressione rifiuta ancora build e download duplicati nel
medesimo job. I due errori precedenti di accesso alla cartella temporanea
del sandbox restano conservati, distinti dai fallimenti funzionali.

Il primo nominale software del port resta FAIL in46,158s: il nuovo helper
non era nella allowlist HTTP della fixture e risponde404. Nessun comando
Game è qualificato da quel run; un PNG è letto da root, sorgenti invariate
e cleanup0processi. Il controllo HTTP fallisce prima404!=200; aggiungendo
il solo nome canonico, i due test Python passano senza cambiare il runtime.

Il nominale software R2 passa in223,645s con Node22.23.5 e SwiftShader
effettivamente registrato: P1 106,848s, P2 93,297s. Sorgenti invariate e
zero processi residui. Root legge tutti i12PNG; B conclude il riesame dei
12PNG e sei gzip integrali, con399sorgenti CDP e dieci asset verificati.

Il recovery software del port passa in99,394s, caso70,542s, con sorgenti
invariate, SwiftShader e zero processi residui. Root e B leggono entrambi
i due PNG; B verifica anche i due gzip completi. Le24risposte503 possedute
si dividono8/8/8 tra richiesta senza asset_retry e retry1/2; segue una
risposta200 normale della stessa risorsa revisionata, JSON derivato
53cd4d6c/10678byte. Una sola azione UI/GEN5, la medesima promessa risolta
una volta e cursore18→34; due presentazioni541,96ACK e quattro onset audio.
Verificati399sorgenti CDP, dieci asset, hitguard del pulsante Playwright,
possesso/ripristino QA e route, source-after vero e cleanup0processi.
Non restano audit B aperti su questi due run.

La nuova CI successiva al batch è ancora **PENDING**. La CI107 verde
precede questo port e non ne sostituisce le verifiche automatiche.
L'inventario resta427file/53fasi unitarie/94CLI, senza nuovi `.test.cjs`.
Il job `native541-windows` riusa il proprietario Windows, renderer software
esplicito e240s/180s/heap400. I due step sono desktop×1 nominale nei due
ruoli con freddo/riuso e recovery dello switch2 con503 reale/stessa promessa.
Il collaudo locale riusa la C15 immutata con una fixture QA nuova: nessuna
ricompilazione inutile del trasporto del gioco. La futura CI deve qualificare
anche il proprio Chromium installato, senza trasferirgli i PASS locali.

La factory verifica399 programmi realmente compilati, i389sorgenti correnti,
dieci programmi della base autenticata e dieci risorse native reali. Le due
JSON572 derivano dalla ricetta qualificata e dalla build corrente; gli
originali RAW restano oracoli separati. I programmi/metadati ammettono solo
CRLF→LF; PNG/JSON/FLAC nativi mantengono i pin RAW. Nessun percorso privato o
eseguibile Windows è fissato nel test.

Il nominale conserva i `.click()` DOM originali con otto controlli di
raggiungibilità; il recovery usa un pointer Playwright sul retry originale,
verificato con `elementFromPoint`. Non sono prove equivalenti di trustedtouch.
Il routing recovery disabilita la cache HTTP di Playwright e non certifica
prestazioni di avvio. Dodici PNG nominali e due recovery richiedono lettura
umana;48chiavi/SPA704/audio1651+1427 non certificano contatto fisico, ascolto,
movimento continuo, GPU Android o qualità completa della541. La matrice
privata V4 è9/9 PASS nel proprio ambito; nominale e recovery software del
port hanno PASS separati e revisione delle rispettive ricevute conclusa.
Resta PENDING la nuova CI del batch, senza trasferimento dei PASS precedenti.

## Ripresa del26 novembre2026 · coda di Minccino e regressioni

La CI108 del commit `c19ca6bdc638078925459771f3a84e94b6d22f02` è conclusa
con successo, compreso il job Windows del port541. Le letture degli artefatti
sono terminate:330PNG delle interfacce e1080PNG del lotto nativo18, oltre
ai14PNG del job Windows541. Questi risultati qualificano quel commit;
non certificano le modifiche private successive o la pubblicazione0.64.

Il controller privato di Doppiasberla572/3 usa ora le parti native della
coda e il marker `private-native-tail-SPA163/v1`. Le due viste conservano
tick nativo, appoggi e corpo neutro ai confini. Il mancato colpo mantiene
il gesto senza inventare un impatto: hitCount0 e effectiveImpactFrame null.
Il confronto sorgente verifica762frame RGBA esatti,508positivi e254senza
colpo. Non è una prova del comando Game o del contatto fisico sul bersaglio.

Il target provider/rig/builder passa25test; audio5 e protocollo3 hanno
risultati separati nei propri budget, senza confronto all'ascolto.
Il builder completo passa95test in170,388s, entro180s, dopo la qualificazione
immutabile della C15. Tutti i32010file della C15 sono ReadOnly e tornano
a un solo hardlink dopo il collaudo; i sorgenti restano scrivibili e distinti.
Il precedente timeout180s e le prove fallite restano conservati.

Il primo target delle45regressioni legacy passa43casi e fallisce due fixture
UI che perdevano i getter p1/p2 copiando la Battle. La correzione conserva
il prototipo nativo e tutti gli assert precedenti. Il nuovo target limitato
ai due file UI passa9/9casi, zero skip, in8561ms, con115pin invariati e
processi posseduti chiusi. Metadata5, acquisizione9 e caricamenti27 erano già
passati e non vengono ripetuti. I50casi risultano così coperti da esecuzioni
distinte; il vecchio rapporto43/45 resta FAIL. Questi processi ordinari
non misurano un limite RSS400MiB e non sostituiscono la nuova suite completa.

Ricevute esterne: `outputs/ci064green/m3-python-full-discovery-readonly-v1`,
`m3-legacy50-canonical-target-v1` e `m3-ui9-canonical-target-v1`.
Restano aperti il contatto di Tynamo/Azione e Minccino/Botta osservato nei
replay effettivi, il movimento normale/rallentato e l'integrazione Game
della nuova coda. C15 contiene ancora il controller precedente; nessun
PASS della sua grafica viene trasferito ai quattro sorgenti runtime cambiati.
Nessuna nuova build pubblica, merge o consegna0.64 è dichiarata.

La migrazione esplicita dei consumatori541 conserva il contratto e la
fixture actual precedenti come riferimenti immutabili. La fixture corrente
cambia soltanto i due campi del contratto sorgente; il confronto storico
rifiuta variazioni a risorse native, ordine, tempi o limiti. Il target
canonico `unit-native-tail541` passa16/16casi in83560ms con il suo guard
RSS originario:333728KiB osservati contro409600KiB. Il file completo dei
controlli headless passa10/10callback in1613ms, mantenendo i17gruppi interni.
Tutti139pin restano invariati e i processi posseduti sono chiusi. Le prove
sono di protocollo/metadati/audio simulato, senza Game, raster o ascolto;
la nuova CI completa rimane da eseguire sul batch corrente.

La pulizia H.8 della C14 ricostruisce e ricontrolla32010file/1136580701byte
prima della rimozione, con19file nel delta e31991dipendenze dalla C04.
Archivio, prova, dry-run e ricevuta di rimozione restano esterni alle build
in `outputs/ci064green/h8-c14-preparation-v1`. Rimangono C04 base obbligatoria,
C08 verificata e C15 confronto ReadOnly; la C16 è ancora da compilare.

La C16 è poi compilata una sola volta: revisione `ce0d0dc3894405ea`,
131250ms nel worker/131738ms nel proprietario e328794112byte di picco,
entro175/180s e400MiB. I399programmi, le due derivazioni572 e i PNG
originali sono verificati; gli input restano invariati e il proprietario
è chiuso. È una prova di build/provenienza, senza nuova approvazione Game
o visiva. La voce C16Game nei limiti del template precedente resta storica:
la compilazione è conclusa, il collaudo Game rimane aperto.

La CI109 di `f6903835` passa il job Windows541, ma fallisce due delle94fasi
CLI, `unit-2-of-8` e `unit-6-of-8`; gli altri replay grafici non vengono
eseguiti. Il rapporto resta FAIL. Le cause sono due fixture rimaste sul
precedente contratto: campionamento senza preparazione del banco e vecchio
identificatore della zampa. Il banco del contatore ora usa dimensioni e
contorno opaco neutro qualificati, distinti dall'ingombro dell'animazione,
prima della vera API di preparazione. L'osservatore richiede anatomia tail,
riporta nativeTailSamples e rifiuta la classificazione paw.

Il primo target26 passa25casi e conserva un FAIL sui bounds della fixture;
dopo la correzione passa l'intero file seed5/5 in2041ms. I21layout erano
già passati e rimangono invariati; non sono ripetuti. Tutti gli assert
precedenti sono conservati, con un negativo aggiuntivo sulla classificazione.
Le prove sono in `outputs/ci064green/ci109-failed-tests-target-v1` e
`ci109-seed-fixture-target-v2`. Nuova CI completa ancora necessaria;
nessun PASS globale o nuova pubblicazione è dedotto dai target.
