# Portali delle Medaglie · componente052

Perimetro: otto portali356–363, arrivo364. Nessuna052 attiva o pubblicata. Il seguito finoallaLega/N/Ghecis e poi le MN nel mondo resta da completare. Nessun controllo delPC: soltanto file/CLI e Chrome headless isolato.

| Zona | Programma IRBI | Indice medaglia | Flag aperto |
| --- | --- | --- | --- |
|356|712|0|136|
|357|714|1|137|
|358|716|2|138|
|359|718|3|139|
|360|720|4|140|
|361|722|5|141|
|362|724|6|142|
|363|726|7|143|

I programmi originali controllano la singola medaglia, avviano camera e modelli54frame, riproducono1774/1775 e conducono alla tappa seguente. Le altre sette medaglie non sostituiscono quella richiesta. Nessuna collisione o permesso ampliato per il banco.

## Collegamenti

- Native299/021b2b08 disabilita il modello individuato per classe/posizione. FieldModels.hide preserva geometria e handle; una nuova preparazione ripristina lo stato previsto. L'assenza di un match è il no-op originale, non una risorsa di ripiego.
- Native326/021b5310 legge preset6 da NARC163/a/1/6/3; tabellaARM9 020a6b58.44byte, SHA28e9d56a494e54c8ab978001ddd8372197ce2a9e1dcb51e89e598b3d07ec2536. TargetQ16[1015808,135168,360448], pitch5720, yaw0, distanza970752 e6flag conservati. LeagueCamera interpola target/quota/inclinazione; mantiene zoom e lente HD-2D. Non emula la proiezioneDS. Fine camera, cambio scena ed errore ripristinano le proprietà precedenti.
- Native167/021af16c arresta i player della maschera dello script. Il vecchio handler ripristinava soltanto la musica, lasciando continuare1774. Ora arresta i suoni emessi dal programma.1774 è prolungato, cattura limitata12s e stop esplicito dopo la pausa originale. Aggiunte musiche1054/1073/1084 e1774/1775 con il driverDS; file precedenti riusati,13versi conservati. Hash/campioni/loop verificati, nessun confronto all'ascolto.
- Rientro: work16384=1 di un portale aperto poteva disabilitare il successivo chiuso. Native021589e0→021588f4 azzera flag0..99 inclusi e work4000..401e. resetMapState applica gli stessi estremi prima di selezionare gli attori e inizializzare la scena.401f,4020, progressione, medaglie e strumenti preservati. Riferimenti in outputs/chapter052/gate-native-*.txt.
- LeagueGates.prepare riconcilia modello e trigger con cache fredda senza rigiocare eventi. Un programma o un'animazione in corso mantiene la posa. Regressioni su rientro, cache fredda e ordine reset→selezioneNPC.

## Prove e limiti

Privata7 cc4d0170cd5de7fd: browser-badge-gates-first FAIL desktop perché il banco teneva soltanto su contro gli ostacoli del terzo ambiente. Driver corretto sui camminiWB originali, medesimi40s per portale. browser-badge-gates-second PASS3formati/48PNG:83.21s desktop,124.07s verticale,169.25s orizzontale; Chrome155/ANGLE SwiftShader. Cammino×1, scene×4: perimetri dichiarati. Zoom/camera/audio e arresti1774 verificati;8flag registrati. Medaglie predisposte, non conquista delle palestre o storia completa.

Rivisti tutti48fotogrammi in review-eight-gates-contact.png e aperture357/362 direttamente. I bordi dei moduli restano visibili nella camera ampia, soprattutto verticale: rifinitura di fondale/inquadratura aperta prima della consegna052. Non è accettazione grafica complessiva o certificazione GPU Android fisica.

Vero game.frame, percorsiWB e trigger:×1/×2/×4 a60Hz e×2a20Hz PASS; DOM/GPU/audio e attese a tempo degli script isolati. Primo banco Node falliva controllando la promessa prima dell'inizio asincrono delVM; log conservato.51Node condivisi PASS prima dell'ultimo spostamento del reset;9mirati attuali PASS/14.6s con attori, input, camera, stato aperto/chiuso e cache.

La7 precede resetMapState/LeagueGates.prepare: non attribuirle queste correzioni.8 in preparazioneH.8;051 preservata,7 archiviata con manifest/rapporti/PNG esterni. Restano GPU8 del rientro e del percorso, suite completa per i cambiamenti condivisi, rifinitura grafica, continuità Komor/Belle/Nardo, Percorso10/ViaVittoria e serviziLega.122/overlay63 è ancora da integrare;191 riguarda il futuro ritorno al castello272. Nessun no-op per aggirare gli eventi mancanti.


### Rientro verificato e regressione condivisa

La privata8 ba1cc71d9bc998ee supera browser-badge-gates-eighth nei tre formati: sei casi complessivi e57PNG, inclusi cache dei modelli svuotata, rientro e percorso degli otto portali. Rivisti tutti57 nel contatto review-gates8-contact.png e direttamente il rientro verticale. Le prove conservano i prerequisiti espliciti e i limiti del renderer software; bordi del ritaglio ancora da rifinire. Nessuna accettazione grafica completa.

La suite completa sulla8 rileva una regressione nel contratto degli ascensori di Rafan: il reset nativo svuota i flag10..15 mentre le posizioni fisiche serializzate rimangono. Baseline FAIL conservata in deep-gates-current/unit-3-of-4.log; nuova regressione indipendente gym-map-flags-before-fix.log. Il controllore ricostruisce soltanto questi sei specchi logici dalle quote effettive dei sei ascensori entrando nelle zone97/98, prima degli script. Conserva gli altri flag, le posizioni salvate e le transizioni coperte. Nessuna esclusione globale della palestra dal reset o modifica dei permessi. gym-map-flags-and-gates-current.log:32Node PASS/28.3s, inclusi arrivi riservati reali a tutte le velocita, interruttori misti salvati e portali game.frame. La correzione e successiva alla8: richiede nuova candidata e regressioni complete/GPU condivise, non attribuirle il PASS della8.


### Candidata9 · controllo condiviso degli ascensori e dei portali

33d47d21a8fded5c, browser-gates-and-lifts-ninth:12casi PASS, tre formati,90PNG. In ciascun formato: operatore e arrivi riservati reali di Rafan; cammino e interruttori dell'intero puzzle, ascensore profondo e ritorno; rientro/cache fredda dei portali; otto aperture originali. Vittorie allenatori e medaglie sono prerequisiti della fixture, non nuove lotte vinte dal banco. Cammino portali x1 e script x4; gli altri regimi restano nelle prove game.frame dichiarate separatamente.

Riviste tutte90immagini nei tre fogli review-1280x720/review-390x844/review-844x390.png e direttamente il fotogramma desktop della discesa principale. Contatto con le piattaforme continuo; stato degli interruttori corretto dopo il cambio mappa. Le superfici esterne del ritaglio nei portali, e i margini ereditati della palestra di Rafan, non sono ancora una presentazione grafica completa: non ridurre questo limite al solo esito automatico PASS. Chrome155/ANGLE SwiftShader; audio interno attivo e processo muto, nessun confronto all'ascolto o GPU Android fisica.

9file runtime SHA identici fra sorgenti e candidata in gates-runtime-preview9-source-hashes.json. La8 e stata archiviata/rimossa secondoH.8;051 verificata e9 conservate, rapporti/immagini esterni. La suite completa9 e in corso in deep-gates-ninth: attribuire il risultato solo leggendo il rapporto concluso. Nessuna052 attiva nell'index o pubblicata.


### Consolidamento verificato della candidata9

La suite completa deep-gates-ninth-streamed/report.json e PASS:46fasi,1060test Node e33Python. Tutti e sei i processi unitari hanno terminato nel budget180s; gruppo4 in104.002s. Il precedente gruppo4 isolato con trasporto corrente:202PASS/107.948s. I gruppi5/6 della suite completa includono i file ripartiti dopo l'aggiunta dei test del runner; l'inventario ne verifica presenza unica senza esclusioni.

I precedenti tentativi falliti restano archiviati: deep-gates-current completo44fasi FAIL sul contratto degli ascensori della8; deep-gates-ninth FAILunit1timeout e interrotto; deep-gates-ninth-final e final-second FAILunit4timeout e interrotti con rapporti espliciti. Il diagnostico con traccia di caricamento e budget per-test60s supera204casi/123s. La causa dei vecchi timeout non e dimostrata da questo PASS; il runner asincrono conserva ora i log durante ogni fase, gli errori di avvio/log, timeout e output eccessivo restano FAIL.10regressioni mirate del banco PASS/5.48s. Nessun aumento del budget o rimozione di controlli.

I file runtime della9 e gli8file del banco congelato coincidono ancora con gliSHA registrati prima della suite completa. Le prove GPU restano quelle della stessa33d47d21a8fded5c:12casi/3formati/90PNG rivisti, con i prerequisiti e limiti dichiarati sopra. Risultati CLI, renderer software, audio interno e confronto all'ascolto restano distinti. Non certificano grafica Android fisica, storia completa, equivalenza DS o i contesti ancora mancanti.

La0.52 rimane disattiva nell'index e non pubblicata. Restano i bordi dei ritagli, continuita degliNPC,18contesti del prossimo tratto, movimento122 e servizi finoLega. Le ricerche correnti sul122 sono soltanto riferimenti: punto iniziale, vettore/raggio, costanti nativi4731/4096 e suono1773; la prova geometrica iniziale non trova un atterraggio sui soli nastriNG, quindi non viene sostituita con un teletrasporto. Lega/N/Ghecis e MN nel mondo restano l'obiettivo successivo, non completato da questo consolidamento.
