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
