# Volo sul campo · 0.49

La MN02 ricevuta da Belle dopo Rafan è utilizzabile dalla Squadra: il Pokémon deve conoscere Volo19 e la mappa corrente deve consentire Volo. Non si richiedono una medaglia successiva, PS o PP positivi; il viaggio non consuma i PP di lotta. La Mappa Città conserva grafica, luoghi e comandi originali; «Vola qui», A/Invio e tocco selezionano soltanto una destinazione già visitata. B/Chiudi annulla senza cambiare posizione.

`tools/extract-mistralton-fly.py` legge direttamente IRBI. L’archivio `a/0/1/2:0` contiene record da48byte: flags u16 a30, permesso Volo bit13; parent u16 a24; unione di coordinate signed32 a36. Il bit15 riguarda il Bosco Intramondo e non viene usato come permesso Volo. La tabella originale `a/0/8/6:0` contiene record da54byte: ammissibilità di destinazione a24 e flag di visita a30. Hash dei due record completi in `mistralton-fly-data.js`.

| Città | Zona | Flag visita | Approdo nativo |
| --- | --- | --- | --- |
| Soffiolieve |389|2480|782,0,750|
| Quattroventi |397|2481|796,0,659|
| Levantopoli |6|2482|781,0,589|
| Zefiropoli |16|2483|637,0,599|
| Austropoli |28|2484|binario3, front8, side1|
| Sciroccopoli |62|2485|406,1,469|
| Libecciopoli |96|2486|187,0,414|
| Ponentopoli |107|2487|108,0,306|

Le visite usano i flag nativi e sono monotone. I vecchi salvataggi recuperano soltanto città già provate dai marcatori di arrivo/medaglie o dalla zona corrente e dal suo parent; nessuna città futura è aggiunta per la sola presenza dei dati. Austropoli interpreta l’unione come binario/front/side tramite `NativeRails.position`, conservando quota e linea nel salvataggio. Gli altri approdi rispettano le coordinate e la quota del terreno. Il viaggio interrompe la Bicicletta, copre integralmente il cambio scena, prepara la nuova scena, poi salva a campo sbloccato.

Il cut-in mostra lo sprite animato originale del Pokémon effettivo, inclusa la femmina di Unfezant. Il gesto delle ali/corpo riusa la coreografia anatomica di Volo e il verso originale. Questa sequenza è un adattamento HD-2D; non viene dichiarata estratta dal programma di animazione DS. Il canvas mantiene proporzioni2:1 su telefono e desktop.

Prove: `tests/mistralton-fly.test.cjs` verifica bit13, otto record nativi, migrazione e uso a0PP/PS. `tests/check-mistralton-fly.cjs` esegue12 controlli del controller reale: rifiuto in grotta, annullamento, destinazione non implementata, otto approdi percorribili, quote/binari, PP invariati e salvataggio/rilettura. La fixture CLI sostituisce soltanto i pixel del cut-in; il collaudo visivo nel browser resta distinto.

Audit delle fonti: MT55/strumento382/mossa503 è sul pavimento del Deposito Frigo192, attore10/script7005/flag1167. MT58/385/507 è a Ponentopoli107, attore12/script7104/flag1263. Idrovampata è compatibile con12 righe attuali e aggiunge10 coppie nuove. Cadutalibera non ha alcun apprendente nativo fra le85 righe: è raccoglibile e il rifiuto di apprendimento è verificato; non si inventano animazioni per coppie assenti. Archeops non è compatibile nella ROM. MT01 postgame di Violante, MT69 postgame di Celio e MT84 sull’isola che richiede Surf restano fuori dalle fonti raggiungibili di questa tappa.

Raccolta sul campo rimane una lacuna precedente segnalata: Lillipup ha l’abilità nativa53, ma non è ancora implementata l’estrazione casuale degli strumenti dopo la lotta sul campo. Le regole di Raccolta durante la lotta sono quelle del motore esistente. Nessuna delle21 nuove specie aggiunge questa abilità.
