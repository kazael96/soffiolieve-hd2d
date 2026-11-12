# Via Vittoria: dimostrazione della discesa · componente052

## Perimetro e riferimenti

Componente privato della candidata10 `2ef099be9ea443de`, base0.51 con preview esplicita `leagueFields`. Non attiva052 nell’index e non completa la storia fino alla Lega. Nessun controllo del PC: solo comandi e Chrome headless isolato.

La ROM IRBI, overlay63/task021f365c e callback di proiezione021b7968/021b9d68/021b9eac, determina il comando122 del programma428/entry3 nella zona214. Il piano viene scelto prima di cercare una casella libera sul lato; il lato proiettato viene incrementato di2 e cercato verso l’interno. Non si sceglie un piano più lontano soltanto perché quello preferito è occupato.

Actor5 parte da `(18.5,21.5,10.625)` e raggiunge il binario13/front7/side0, `(18.5,29.5,5.625)`:19passi da mezza casella a30Hz. Il valutatore dei binari resta quello HD-2D in virgola mobile; questa verifica non è emulazione DS bit per bit. Il ramo è limitato alla dimostrazione214, non alle scivolate automatiche del giocatore sul terreno160.

## Continuità, camera e audio

Il comando attende la preparazione di tutti i fotogrammi dell’attore e del suono1773 con il normale recupero delle risorse. Durante la discesa la quota effettiva prevale sulla vecchia quota del binario. Annullamento/cambio scena ferma soltanto il suono posseduto e non inventa un atterraggio.

Il ruolo successivo0 si trova a `(20.522574215736235,28.50025483007724,5.625)`, distinto dall’atterraggio. Un raccordo HD-2D continuo di15punti supportati porta lo stesso corpo a quella posizione mentre la camera ritorna. Soltanto dopo l’arrivo i flag758/759 sostituiscono il ruolo5 con0 conservando l’identità del corpo. Il raccordo è un adattamento richiesto dalla continuità visibile, non una camminata presente nel programma DS. Il salvataggio viene verificato anche dopo ricarica e rientro.

Il comando323 usa pitch8485/yaw163 e quota del bersaglio originali; lente e zoom rimangono HD-2D. Corretto il renderer condiviso che sovrascriveva lo yaw narrativo a ogni draw. Il ritorno ripristina pitch/zoom/yaw precedenti senza lasciare un override. Regressione sul vero metodo draw, oltre al controller.

Suono1773 esportato dal driver originale:392794campioni a32768Hz,11.98712158203125s, picco8808, senza loop, sostenuto fino all’arresto del task. SHA256 FLAC `161cc8ae315064da2984528ce5b7908b67c65785c5bd10718dd94bb28739c39d`. Conservati4brani, tutti i precedenti effetti e13versi. Confronto automatico del segnale/catalogo; nessun confronto all’ascolto.

## Prove e limiti

Rapporti esterni `outputs/chapter052/`. Conservati i FAIL prima delle correzioni: modulo assente, comando122 non supportato, raccordo mancante e yaw sovrascritto dal renderer. `victory-slide-shared-current.log`:32test mirati PASS, inclusi programma originale a×1/×2/×4, salvataggio/ricarica, camera e regressioni condivise.

`browser-victory-slide-tenth/report.json`:9casi PASS nei tre formati1280×720,390×844,844×390. Ogni viewport riproduce la dimostrazione con input del campo a×1/×2/×4, gli otto Portali e ingresso/uscita della palestra di Rafan.102PNG, rivisti nei tre fogli di contatto e nelle viste dirette della discesa desktop/verticale e dell’arrivo verticale. Stesso corpo, quota intermedia, raccordo e ruolo finale visibili. Chrome155/ANGLE SwiftShader, audio interno attivo con uscita muta: non è prova su Android fisico o ascolto originale.

Checkpoint, otto medaglie e Snivy50 con forma conservata/repellente sono predisposti per isolare il percorso: nessuna nuova vittoria o storia completa certificata. `deep-victory-slide-tenth/report.json`: tutte le46fasi PASS,1069test Node e33Python,790.532s complessivi delle fasi. I14file runtime/banco congelati coincidono con gliSHA registrati prima del collaudo. Il PASS riguarda questo componente privato, non la consegna052.

Restano aperti: effetto di polvere originale richiamato da021ac428; scivolate automatiche del giocatore; bordi/cutaway della scenografia, inclusi margini petrolio delle viste verticali; continuità dei protagonisti,18contesti di lotta e servizi del tratto fino alla Lega. Dopo la consegna052 restano Superquattro, N, Ghecis e successivamente le MN personalizzate sul campo. La percentuale pubblicata non aumenta da questi componenti privati.

Ricerca successiva della polvere: manager021abc50/NARC75 `a/0/7/5`, registro1/init021ac394, modello48 e pattern96. Quattro chiavi ai frame0/3/6/9 su12frame; quattro nomi di palette condividono il medesimo intervalloTEX0. Decodificati gli alias tramite offset distinti,4PNG coincidono byte per byte con apicula; foglio pattern-review.png rivisto. Asset soltanto in outputs/chapter052/native-slide-dust, nessuna integrazione o verifica del loro rendering nel mondo. Provenienza e disassemblaggi conservati; dimensione/orientamento/durata del callback ancora da collegare.

## Seguito: polvere in integrazione

Dopo il commit92b7571, nuovo blocco non ancora certificato dalla suite completa: esportatore riproducibile con3regressioni Python per alias/confini/rifiuto dati corrotti; catalogo e4PNG originali riprodotti identici. `dust-integrated-shared-current.log`:24Node PASS, con vero programma428 a×1/×2/×4, precaricamento dei4frame e presenza/estinzione degli effetti, campionamento sparso delle9emissioni ai frame pari. Il primo log integrated-first precede il collegamento all’host (fallita lettura UTF-8 dello script di modifica) e non ne certifica il runtime; integrated-second e shared-current sono successivi al collegamento. Non attribuire loro il PASS completo della10.

Nuovo renderer opzionale degli effetti transitori: stessa posizione di nascita lungo la traiettoria, offset nativoY1/Z6, pattern0/3/6/9 e durata12frame. Quad2×1ricavato dalla geometria originale; billboard della normale prospettiva HD-2D, non proiezione DS bit per bit. Nessuna ombra fittizia o collisione/interazione aggiunta. Tutte le immagini sono preparate prima della discesa; cancellazione coperta pulisce gli effetti. Scene051 senza modulo conservano il comportamento precedente. Il renderer e la suite completa della candidata11 restano da eseguire.

H.8: durante il collaudo11 restano soltanto051pubblica come confronto e10ultima verificata; cleanup-before-fields11.json. Rimuovere10 dopo un PASS della11 conservando tutti i rapporti e i sorgenti. Non sostituire l’ultima verificata con una candidata fallita.

## Audit semantico successivo: atterraggio da correggere nella12

Questa sezione supera i riferimenti precedenti a side0/29.5/19passi/15waypoint e alle9emissioni. Il PASS di10/11 certifica regressioni e resa del comportamento allora implementato, non equivalenza delle routine DS. L’audit di021f36a2–021f36ca dimostra che il raggio nasce una casella davanti al corpo;021f37e6–021f3852 pre-decrementa il lato e conserva ogni casella libera fino al primo muro, anziché fermarsi alla prima libera. Il codice del porting si fermava troppo presto. Evidenze in player-slide-ray-origin-audit.txt, victory-road-slide-full-task.txt e victory-road-slide-task-tail.txt; FAIL prima del fix in slide-native-scan-before-fix.log.

Destinazione corretta della dimostrazione:13/front7/side−1, `(18.5,28.5,5.625)`. Raggio da `(18.5,22.5,10.625)`,16passi nativi di discesa; HD-2D aggiunge due mezzi passi continui per raggiungere quel bordo senza spostare istantaneamente il corpo.18aggiornamenti complessivi, adattamento dichiarato. La polvere nativa nasce prima dell’aggiornamento della posizione ai frame pari2..14; l’ultimo frame salta il callback. Setteemissioni, non nove. Aggiornati percorso di raccordo (12punti supportati), regressioni e campionamento sparso.13Node mirati PASS dopo il fix; renderer e suite completa del nuovo comportamento ancora pendenti.

Privata11 `84928e9c8f101395`:9casiGPU/3formati/102PNG PASS e rivisti (trecontatti + discesa desktop×1/verticale×4) per il vecchio punto d’atterraggio; non riusare come PASS del fix. Suite completa11 interrotta dopo la scoperta semantica, solo albero di processi identificato, log e interrupted.json conservati; nessuna fase esclusa dal prossimo collaudo e nessun PASS complessivo attribuito. Primo avvio senza privilegi aveva EPERMspawn, conservato separatamente.

Scivolate del giocatore ancora da integrare:67celle native160 nella214. La direzione deve derivare dal tangente NG e dalle tabelle native021d83bc/021d8304, non semplicemente dal basso dello schermo. Il primo probe geometrico con direzione derivata accettava63/67; con origine e scansione corrette accetta64/67 (player-slide-corrected-planning.json). Sono solo pianificazione, non gameplay o copertura completa; restano treproiezioni di confine e collegamento al movimento reale da verificare. I chiamanti Thumb individuati in player-slide-constructor-callers.json richiedono ancora lettura semantica: il wrapper NPC021c4630 passaR3=0.

## Candidata12 in verifica

`6d094556a8edbd8b`: browser-victory-scan-twelfth/report.json PASS9casi nei3formati,102PNG rivisti nei trecontatti e nella discesa desktop×1. Riprodotti input reale,×1/×2/×4, stesso corpo/raccordo, polvere originale precaricata ed esaurita, camera/audio, ottoportali e ingresso/uscita Rafan. Tempi discesa32.510/47.244/35.701s per desktop/verticale/orizzontale (trevelocità percaso); non confronto prestazionale DS. Chrome155/ANGLE SwiftShader e uscita audio muta, nessun Android fisico/ascolto. Bordi e inquadratura restano aperti; non è certificazione grafica completa del capitolo.

Sorgenti e4PNG coincidono con la candidata, congelati in slide-twelfth-source-hashes.json.33regressioni mirate condivise PASS prima della build; suite completa in corso in deep-victory-scan-twelfth, leggere il rapporto finale. Non attribuire ancora1074/36 o un PASS complessivo prima della conclusione.

Ricerca giocatore successiva: wrapper021c45dc carica overlay63 e passaR3=1, chiamante0218b14c. Controlla direzione risultante1, campo di contesto+1c uguale0o3, comportamento attraverso021bb06c e query blocco&3; significato completo dei campi ancora da convalidare. Inventario a16bit:67celle160 e2celle161. Le treproiezioni senza destinazione del probe non dimostrano da sole un bug: occorre verificare ammissibilità dell’input e collisioni; non inventare un atterraggio. Dati e routine in player-slide-*.json/txt, solo pianificazione, nessun giocatore ancora integrato.

Suite12prima esecuzione: tutti i gruppi unitari e36Python PASS, ma story-runtime FALLISCE per un errore nel banco: una lettura cp1252 durante la modifica del preload ha alterato cinquecommenti/stringhe UTF-8 di tests/check-story-runtime.cjs. Testo effettivo `E · Interagisci`, atteso corrotto `E Â· Interagisci`; conservare story-runtime.log e rapporto finale FAIL. Lasciare terminare il banco prima del ripristino e poi rieseguire l’intera suite con il medesimo runtime12. Non ricostruire o ricollaudare GPU se tutti i sorgenti runtime/browser e gli asset rimangono byte-identici: è una correzione del solo harnessNode. Aggiornare separatamente il fingerprint del banco corretto, senza sovrascrivere quello precedente.

Ripristino UTF-8 del banco concluso dopo la prima suite:45fasi PASS/1FAIL story-runtime, rapporto conservato. File recuperato dai byte del commit92b7571, riapplicata soltanto l’aggiunta dei due moduli al preload; diffNodehost torna a1riga, nessun testo alterato. story-utf8-restored-current.log PASS per tutto il replay originale. Runtime12, asset e browserQA invariati rispetto al renderer verificato; nuovo fingerprint distinto slide-twelfth-corrected-harness-source-hashes.json. Suite completa in riesecuzione in deep-victory-scan-twelfth-final; nessun PASS anticipato.

## Consolidamento della12 corretta

`deep-victory-scan-twelfth-final/report.json`:46fasi PASS,1074Node,36Python,682.773s complessivi delle fasi. Tutti i19fingerprint del banco corretto/source/4PNG rimangono identici dopo la suite. Il tempo è una misura di questa esecuzione, non una dichiarazione di accelerazione.9casiGPU/102PNG della medesima revisione `6d094556a8edbd8b` restano validi perché la correzione successiva riguardava soltanto le aspettative UTF-8 del runnerNode, estraneo alla fixture del browser. Il primo rapportoFAIL e tutti i log/interruzioni restano conservati.

`cleanup-after-fields12.json`: archiviato il manifest della10 e rimossa soltanto quella copia generata dopo controllo assoluto dei percorsi, link/Git/processi.11già rimossa con cleanup-before-fields12.json. Conservate051pubblica e12privata verificata, sorgenti/ROM/base e tutti i rapporti esterni. Nuovo blocco pronto per commit locale; nessuna052 attiva o pubblicata.

Limiti invariati: dimostrazione214 completata in questo perimetro, non tutto il percorso. Piani e prove del giocatore (69celle160/161;66/69proiezioni accettate) restano prototipi esterni, con input/ammissibilità/collisioni/ripresa da implementare. I materiali dei16luoghi (355/214 e14grotte, varianti del355 ancora da scegliere) sono stati campionati in battle-contact-*-planning.json: sono ancore native e intersezioni dei triangoli, non18fondali implementati o verificati. Differenze fra quota fisica e mesh visiva devono essere gestite esplicitamente, senza far galleggiare i Pokémon. Profili pubblici ancora solo palestra121. Prima di attivare052 risolvere l’ordine di caricamento dei piccoli cataloghi/controllori e verificarlo a cache fredda; la preview li carica prima di OriginalStory.

Restano continuità dei protagonisti fino alla Lega, servizi136/146 e bordi/inquadratura, poi consegna052 e seguito Superquattro/N/Ghecis. Le MN personalizzate sul campo seguono il finale. Nessuna percentuale narrativa aggiunta dalle sole risorse, commit o prove del componente.
