# Strumenti ottenibili nel capitolo052

La regressione `native-items-before.json` ha riprodotto sei errori concreti: la Master Ball ricevuta da Aralia non era selezionabile nella Borsa della lotta; Ricarica Tot23, Pozione Max24 e Revitalizzante Max29 erano acquistabili/ricevibili ma privi di uso completo. Il controllo successivo ha incluso anche il Calcio49 trovato nel percorso e gli strumenti tenuti durante i salvataggi. La candidata29 ha47fasi CLI PASS/1175Node/36Python e105PNG rivisti, ma non è stata accettata per il rilascio perché i nuovi controlli degli strumenti fallivano.

## Semantica nativa e integrazione

Master Ball: overlay93, hash6887c756d8b92655097ac4e9a1ba97122e8ab10b861d8bfdb253c10c42287750. Le istruzioni021cba4a..56 restituiscono successo con tre scuotimenti e flag critico0 prima di tasso, stati e RNG. La prova esplicita è `masterball-native-catch-overlay93.txt`: la prima disassemblazione selezionava erroneamente l'overlay21 sovrapposto ed è conservata senza usarla come prova. `CaptureRules.roll` ora mantiene questo ramo separato; gli altri moltiplicatori e l'ordine RNG ordinario restano invariati. `throwStoryBall` trasmette l'ID reale. Restano i controlli preesistenti per lotte Allenatore, due avversari vivi e spazio in squadra/Box.

Atlante Master Ball: originali a/0/9/5:131/132 con celle129 e sequenze130;17PNG128x128 e5sequenze. La cattura usa lo script originale a/0/6/7:9. Il cell0 viola con la M è stato rivisto direttamente. La rigenerazione mantiene byte e metadati della Chic Ball e le altre Ball; tutte sono preparate dal loader esistente. Nessuna ricolorazione manuale.

Ricarica Tot cura tutti i PS e stato/confusione, anche quando sono necessari soltanto questi ultimi; Pozione Max cura tutti i PS senza curare stati. Revitalizzante Max si applica soltanto a un Pokémon esausto, ripristina tutti i PS e aggiorna una sola volta il conteggio dei Pokémon disponibili. Nessuno di questi strumenti restituisce PP. Il Calcio applica al solo Attacco Speciale un incremento fino10 EV, rispettando100 EV per stat e510 totali come lo Zinco preesistente. Borsa sul campo, in lotta, dare/togliere/scartare e normalizzazione degli strumenti tenuti comprendono gli ID supportati.

Le icone1/23/24/29 sono lette dalla tabella ARM9 a0209eaec e dagli originali a/0/2/5. Nuovi file23/24;13record di Pokémon e tutti i precedenti file delle icone sono rimasti identici (`menu30-integration-proof.json`).

## Prove e limiti correnti

`native-items-all-targeted-fixed.log`:18test pertinenti PASS, incluse cure/stati/confusione, PS dispari, PP invariati, usi inefficaci senza consumo, EV, dare/togliere e salvataggio reale, selezione dell'atlante Master Ball e regressioni delle altre Ball. Non è ancora il collaudo grafico della candidata30.

Candidata30 in costruzione. Aggiunto replay `qaNativeItems052` con uso effettivo del Calcio nei menu, azioni della Borsa per le tre cure e cattura con Master Ball: occorre eseguirlo/revisionarlo nei tre formati. Restano nuova suite completa sulla candidata, matrici mosse A/B/C e rilascio verificato. Nessuna certificazione Android fisica o confronto udibile. Le limitazioni preesistenti dell'amicizia Chic Ball non sono dichiarate completate da questo intervento.

Per il finale verificare anche uso delle pietre evolutive108/109 e altri servizi: un riferimento nel catalogo non certifica un'evoluzione con risorse e coreografie complete. Lampent→Chandelure richiede anche la copertura609 già necessaria per i Superquattro.


## Primo replay della cattura: attesa risorse e correzione

Candidata30 `2d743da5d01e66ac`: il primo replay chiamava direttamente NativeUI.bag senza passare per il pulsante Borsa che prepara i sottomenu; è un errore della fixture, corretto usando i controlli reali. Il secondo replay e le due diagnostiche hanno poi riprodotto un blocco reale dopo le cure: risultato Master Ball corretto/senzaRNG, ma nessuna animazione attiva. `browser-release30-items-resource-diagnostic-second` registra lo stato `capture-ball-images`: venivano richieste le celle di tutte13Ball, con molte immagini ancora in coda dopo30s. Non è stata aumentata l'attesa per far risultare verde il test.

La sorgente ora prepara soltanto le17celle della Ball selezionata e riusa i bitmap già decodificati. Il builder genera un trasporto SFP compatto con tutte le celle originali, caricato soltanto alla prima cattura: una richiesta invece di centinaia, mantenendo gli URL singoli come fallback. Il pacchetto è incluso negli hash di build; il test sul sito generato confronta tutti i byte delle221celle con gli originali. Due richieste di Ball diverse hanno gate distinti.

La chiusura della fixture mentre la cattura attendeva esponeva anche una continuazione vecchia su session=null. Il nuovo test riproduce il TypeError della candidata30 (`capture-cancellation-before-correct-fixture.log`); la correzione lega la conclusione alla sessione iniziale, impedendo premi, letture, ridisegni o sblocco di una partita successiva. I due test del loader e dell'annullamento passano;15test condivisi di strumenti/altreBall passano con il preload esplicito. Candidata31 in costruzione; nuova cattura GPU/full suite/matrice mosse non ancora certificate.

Un primo tentativo della diagnostica risorse non ha eseguito casi perché il server locale ha rifiutato la richiesta della fixture (`browser-release30-items-resource-diagnostic`). La ripetizione invariata ha eseguito il caso e riprodotto l'attesa: la causa del singolo errore di connessione non è dimostrata.


## Candidata31 e registrazione effettiva · 12 novembre

Build `48a5680a562e543e`: pacchetto cattura221celle/158620byte, confronto byte per byte PASS insieme alle18regressioni pertinenti (`capture-pack-and-items31.log`). Il primo browser31 ha completato animazione/cattura ma il banco restava in attesa alla prima registrazione Pokédex: il loop confermava i dialoghi e il soprannome, senza premere Continua sulla scheda appena registrata. FAIL conservato in `browser-release31-items`. Nessun aggiramento nel gioco: corretto il percorso di input della fixture.

`browser-release31-items-registration/report.json`:3/3casi/formati PASS, desktop29.940s, verticale20.511s, orizzontale21.033s;30PNG rivisti nei sei contatti. Calcio da menu principale, cure reali, consumo singolo, cattura garantita senza RNG e ballId1 nel roundtrip di salvataggio. Il primo scatto cattura era precedente all'apparizione della Ball: il successivo replay core esporta il fotogramma originale dopo215tick, con oggetto0 realmente visibile, senza saltare né congelare la sequenza. Lo scatto desktop mostra la Master Ball e l'ombra sul terreno; attendere il rapporto core per il riepilogo completo.

I380file runtime della31 corrispondono agli hash congelati;307file del banco/generatori sono congelati separatamente. Restano le matrici grafiche delle573nuove coppie, la suite completa finale e il rilascio; nessun primo finale o pubblicazione052 è certificato da questi soli test.

`browser-release31-core/report.json`:21/21 combinazioni PASS, sette casi nei tre formati. Tutti114PNG rivisti nei21contatti; Master Ball visibile sul terreno nel nuovo scatto, caricamento/registrazione/salvataggio completati. Renderer Chrome155 ANGLE SwiftShader, audio interno della fixture e uscita muta. Il primo avvio matrice31 non ha eseguito casi per un percorso Playwright scritto male: MODULE_NOT_FOUND preservato; ripetizione con percorso corretto in browser-release31-matrix-corrected. Nessuna modifica runtime fra i due tentativi.
