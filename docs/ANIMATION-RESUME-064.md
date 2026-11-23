# Ripresa della revisione064 · 23 novembre2026

La revisione prosegue dal checkout esistente. La cartella privata
`outputs/animation-review064` non risulta più presente e la ricerca nei percorsi
locali accessibili e nei metadati del Cestino non ha recuperato i suoi file.
Le descrizioni già commesse dei vecchi PASS restano cronologia documentale;
non sostituiscono rapporti e immagini mancanti. Non ricreare un pilot e
presentarlo come un originale recuperato.

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
