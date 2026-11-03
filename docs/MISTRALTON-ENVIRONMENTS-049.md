# Contesti, ambienti e audio · 0.49

Questa estensione prepara i fondali della tappa Deposito Frigo–Rafan–Percorso6–Cava Pietrelettrica–Ponentopoli. Non certifica da sola il collaudo della tappa completa. I rapporti della preparazione sono in `outputs/chapter049/environments`, fuori dalle build generate.

## Contratto d'integrazione

`src/mistralton-field.js` espone `MISTRALTON_FIELD.context(zone,position,tile)` e `music(zone,month)`. La cattura centrale deve consultare questo modulo prima dei moduli precedenti e congelare il contesto insieme a zona, scena e posizione già acquisiti da `BattleLocation.capture`. Il modulo restituisce `null` per le zone escluse: non attribuisce un Percorso6 a un luogo sconosciuto.

`src/mistralton-battles.js` registra17 contesti nel catalogo `PinwheelBattles.contexts` e conserva le presenze dei capitoli precedenti. Espone `MistraltonBattles.has`, `instances`, `ambient`, `prepare`, `isGround`. Il chiamante di `PinwheelBattles.instances` deve delegare prima a `MistraltonBattles.instances`. `BattleDiorama.prepare` deve attendere `MistraltonBattles.prepare`, che attende `MistraltonChapter.ensure`; i fallimenti rimangono riprovabili e non riavviano eventi o lotte. Il classificatore del terreno deve consultare anche `MistraltonBattles.isGround`.

Il byte di comportamento24 identifica il ghiaccio del Deposito: la cattura del terreno deve convertirlo in `ice`, selezionando `coldStorageIce` invece del pavimento asciutto. Nel reticolo originale192 sono170 i riquadri24. Gli attori allenatori del magazzino occupano riquadri ordinari o rialzati.

Ogni contesto contiene facoltativamente `sky:[coloreSuperiore,coloreInferiore]`, per il gradiente dietro le superfici originali. Il renderer può usarlo al posto del gradiente indoor condiviso: Cava blu scuro, Deposito azzurro freddo, miniera della palestra bruna.

Caricare `src/mistralton-audio.js` dopo i cataloghi `FIELD_AUDIO` e `ROM_AUDIO_CATALOG`: installa automaticamente dieci musiche, otto effetti degli elevatori e della Cava e ventuno record dei versi. È disponibile anche `MistraltonAudio.install(field,cries)`. I descrittori distinguono `music` e `sounds`; entrambi entrano in `FIELD_AUDIO`. Restano condivisi attivazione tramite gesto, velocità native dei versi, volume, retry e gestione del background.

## Inventario geografico

| Zona nativa | Contesti | Terreno e scenario originali |
| --- | --- | --- |
|96|`driftveilTown`, riuso0.48|Libecciopoli; il modulo precedente conserva il relativo set|
|191|`coldStorageYardPath`, `coldStorageYardGrass`, `coldStorageYardDark`|Mappe51/147, piazzale e container; `michi02b` o `grass01ax`|
|192|`coldStorageWarehouse`, `coldStorageIce`|Mappa329, muri, tubi, ghiaccio e casse; `d5_dyuka01` oppure `d5_diceyk`|
|193|`coldStorageRoom`|Mappa532 e ghiaccio del container Plasma; `d5ice_yuka`|
|97|`clayGym`|Mappa524, stratificazioni e fossili della miniera; `in27_yuka02`, riferimento del set a quota−59|
|98|`clayGymEntrance`|Mappa595 e ingresso della palestra; `in27y_yuka01`|
|331|`route6Path`, `route6Grass`, `route6Dark`|Mappe52–54; sentiero `michi01b` o `grass01ax`|
|194|`chargestoneEntrance`|Mappa55, parete e ingresso della Cava; `gake_michi`, quota1|
|195|`chargestone1`|Mappe300–305, cristalli nativi; `d6yuka_001`|
|196|`chargestone2`|Mappe306–309, cristalli nativi; `d6yuka_001`|
|197|`chargestone3`|Mappe310/311, cristalli nativi; `d6yuka_001`|
|107|`mistraltonTown`|Mappe56–59 e strutture di Ponentopoli; `michi02b`|
|109|`mistraltonCenter`|Mappa489 e arredamento del Centro; `in02_yuka6`|

Tutti i materiali e le strutture provengono dall'estrazione IRBI `mistralton-assets.js`. Il piano di lotta ampio e la ricomposizione degli elementi lontani sono adattamenti HD-2D: le coordinate del set sono riframmate e il pavimento originale viene ripetuto, senza modificare la geometria dell'esplorazione. Il piano rimane completo anche quando una mossa nasconde lo strato decorativo. La palestra usa un set fisso della medesima miniera per le lotte, mentre movimento ed elevazione dell'esplorazione spettano al controller nativo degli ascensori.

La mappa308 contiene un gruppo nero senza texture,11 triangoli, normalmente ignorato dal renderer condiviso come gli altri gruppi privi di immagine. Il controllo distingue questo gruppo originale, con tutti i colori a zero, da una texture dichiarata ma mancante; non introduce un ripiego bianco.

## Presenze ambientali

Le presenze sono lette esclusivamente dalle liste degli incontri ordinari effettivamente disponibili nel luogo; nessuna specie viene derivata dalla squadra avversaria o dai fenomeni non implementati.

| Luogo | Presenze diverse | Fonte |
| --- | --- | --- |
|Piazzale191|Vanillite582, Minccino572, Timburr532|Slot ordinari191|
|Percorso6,331|Swadloon541, Foongus590, Karrablast588|Slot ordinari331|
|Cava195/196/197|Joltik595, Klink599, Ferroseed597|Slot ordinari di ciascun piano|

Le tre presenze restano a `z=-18.5`, in una fascia laterale lontana, con appoggio e ombra del renderer condiviso; il combattimento occupa lo spazio anteriore. Il loro intero canvas256×256 rientra matematicamente nella camera diorama a1280×720,390×844 e844×390. Questo controllo di proiezione non sostituisce la verifica visiva delle animazioni, delle occlusioni e degli effetti delle mosse.

Magazzino, container, palestra, ingresso della Cava, città e Centro non aggiungono Pokémon selvatici ambientali. Drilbur, Audino e altre specie disponibili soltanto da polvere/erba in movimento non vengono usati. Swadloon evita di fissare una forma stagionale arbitraria di Deerling nel set ambientale.

## Audio nativo

| Luogo | SSEQ originale |
| --- | --- |
|Libecciopoli e piazzale|1030|
|Ponentopoli|1031|
|Percorso6 e ingresso Cava|1046/1047/1048/1049, stagione secondo mese modulo4|
|Centro Pokémon|1060|
|Palestra e ingresso|1063|
|Cava Pietrelettrica|1078|
|Deposito e container|1079|

`tools/render-mistralton-audio.py` riusa byte per byte i render nativi già verificati1030/1060/1078 e genera gli altri sette con il driver DS conservato in `native-driver`. Produce FLAC PCM16 a32768Hz, trattiene introduzione e primo ciclo completo e conserva i punti di loop misurati dal driver. Le musiche di lotta restano assegnate dal chiamante: non vengono selezionate dal luogo al posto del tipo di sfida.

Gli effetti della palestra sono1738 (motore),1739 (arresto),1741 (paratia) e1754 (arrivo). Non compaiono nei programmi degli eventi: le chiamate sono nei gestori nativi degli overlay43/44, con indirizzi conservati nei descrittori e nel rapporto della palestra. Il motore si arresta prima del suono1739; l'ingresso usa1754 al posto del motore. La discesa profonda ferma il motore a quota−40, avvia1741, aspetta100 fotogrammi nativi e riparte; la paratia continua la propria animazione fino al fotogramma300, anche dopo l'arrivo della pedana, e soltanto allora termina1741.

1738/1741/1754 mantengono note sostenute senza fine di sequenza entro il limite di sintesi: l'estrattore conserva12 secondi di PCM nativo e li marca `sustain`/`captureLimitSeconds`, senza inventare punti di loop. Tutti gli impieghi sono più brevi: massimo7,267 secondi per un tratto del motore,10 per la paratia e1,333 per l'arrivo. Il controller richiede `AudioEngine.stopSound(id)` ai punti nativi e durante annullamento/cambio di zona; il chiamante deve invalidare anche un caricamento ancora pendente. La ripresa di un salvataggio usa `playSound(id,{offset})` per riprendere il PCM dalla fase memorizzata, senza rieseguire interruttore o frenata. Il solo vecchio `playSound` senza arresto lascerebbe sovrapposizioni e non completa questa integrazione.1739 termina naturalmente dopo0,792 secondi. I cristalli aggiungono1742 alla spinta (0,802 secondi),1699 al magnete (0,438) e1370 al tentativo fallito (0,208), estratti dagli handler dell’overlay51 e conservati come effetti finiti. La scarica del pavimento sul comportamento48 aggiunge1698 (0,792 secondi), chiamato dall’handler nativo021c8eb6. I render sono stati verificati numericamente; non è stato eseguito un confronto udibile.

I ventuno versi delle specie nuove per questa progressione sono508,521,529,530,549,555,564,566,575,581,582,583,585,586,588,590,592,595,597,599,602. La base0.48 contiene già tutti i649 WAV nativi; questi ventuno vengono ripresi senza ricampionamento. L'estrattore confronta ciascun hash dei campioni SWAV con il segmento corrispondente di `wb_sound_data.sdat`, verifica WAV PCM16 mono, campioni e frequenza, e conserva `nativeSpeed` e `baseVolume`. Le forme stagionali e sessuali condividono il verso della specie originale.

## Verifiche effettive e lavoro residuo

Eseguiti l'estrattore audio e nove test Node mirati: selezione di tutti i luoghi, stagioni e musiche, materiali e file reali, piano di terreno completo, mancata mutazione dell'esplorazione, specie ordinarie, esclusione degli interni, proiezione delle presenze ai tre formati, propagazione/retry dei fallimenti, cataloghi audio, hash FLAC/WAV e parametri dei versi. Comando: `node --test --test-isolation=none tests/mistralton-environments.test.cjs tests/mistralton-audio.test.cjs`.

Il rapporto `native-audio-report.json` registra durate, picchi non nulli, frequenze, loop e hash. Non è stato eseguito un confronto udibile col DS. Restano al collaudo della candidata integrata la stabilità del contesto durante la lotta, ogni scenario ai tre formati, cicli completi e ombre/occlusioni delle nuove presenze, mosse su entrambi i lati, audio attivo/disattivo e×1/×2/×4, background/ripresa, perdita del contesto e recupero delle risorse. Questa preparazione non crea nuove build né modifica meccaniche, salvataggi o continuità degli NPC.
