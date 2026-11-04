# Proprietà della scena condivisa96 e cache dei modelli · 0.49

Il ritorno dal Centro99 poteva far fallire l'apertura della porta della palestra durante Ghecis: `Original field model unavailable: class1 at−572,−352`. La geometria049 era già stata preparata, ma il caricamento differito048 richiesto dal Centro sovrascriveva lo stesso oggetto scena96 con i modelli `dv-map-*`. Restava il contrassegno049, mentre sparivano i figli di edificio `mt-*` riconosciuti dal catalogo delle porte.

`DriftveilChapter` ora conserva le identità delle scene che registra e aggiorna soltanto quelle che possiede ancora. Se049 ha sostituito il descrittore96, il loader048 non vi assegna geometria né `assetsPending=false`. La registrazione048 conserva inoltre una scena già contrassegnata049. Il Centro99 e le altre scene048 mantengono il loro loader differito: non sono stati aggiunti precaricamenti globali o duplicati del catalogo.

La cache `FieldModels` aveva un secondo problema: la chiave `WeakMap` era soltanto l'identità della scena. Una lettura prima del caricamento memorizzava un elenco vuoto; l'identità rimaneva uguale dopo la geometria o l'installazione di un nuovo catalogo di figli. `prepareScene` ora aggiorna i target prima di selezionare le sole risorse necessarie. Anche una sostituzione dell'array istanze o una sua variazione di lunghezza invalida il risultato. I target che conservano istanza e record originali vengono riusati, mantenendo promessa, handle, avanzamento e animazione già attivi.

## Prove eseguite

Il nuovo `tests/mistralton-scene-ownership.test.cjs` usa gli eventi, i descrittori, gli asset differiti e i cataloghi reali dei due capitoli. Prima del fix fallivano i quattro ordini di caricamento e i due casi di cache anticipata: baseline1PASS/6FAIL. Sono stati poi aggiunti i due completamenti concorrenti, per un totale di9 casi PASS:

- Entrambi gli ordini di registrazione dei bootstrap, combinati con entrambi gli ordini di caricamento degli asset.
- Andata al Centro99 e ritorno96, creazione/apertura/attesa/rilascio della porta nativa della palestra.
- Richieste dei due capitoli contemporanee, con048 oppure049 che completa per ultimo.
- Cache letta prima della geometria differita e prima del catalogo MT, con caricamenti limitati ai record della scena.
- Preparazione ripetuta mentre una porta è animata, conservando lo stesso handle fino al completamento.

Passano16/16 test dei nuovi casi e di `field-models.test.cjs`, con uscita naturale del processo. Il gruppo esteso con recupero risorse, performance e budget cache riporta53/53 PASS. Controlli di sintassi e diff senza errori. I rapporti privati sono `outputs/chapter049/gym/scene-ownership-baseline-final.json` e `scene-ownership-regression.json` nella cartella superiore di lavoro.

Queste prove certificano riferimenti, caricamento, selezione dei modelli e clock delle animazioni; il caricatore GLB è simulato nel nuovo test. Le prove preesistenti di `field-models.test.cjs` leggono invece gli asset originali e controllano geometria/animazioni finite. I risultati browser/CUA e pixel della candidata integrata restano separati e non sono dedotti da questi test.
