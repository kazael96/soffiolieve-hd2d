# Ripresa della revisione064 · 23 novembre2026

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
