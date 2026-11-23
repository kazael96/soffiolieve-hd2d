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
stessi otto turni per velocità, audio e assert originali. Conserva tutte
le54 celle formato–caso–velocità,180s per caso,30 minuti per passo, una
sola build e rapporti distinti sempre raccolti. Il runner inoltra il filtro
al server QA isolato e controlla anche le velocità dei turni conclusi;
un parametro nell'URL da solo non prova copertura. Venti controlli mirati
passano, compresi inventario, limiti e rifiuto di velocità mancanti o
duplicate. Il primo replay reale desktop della08 a×1 supera tutti gli
otto turni in82099ms, con25 PNG esportati,399 moduli verificati e chiusura
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
