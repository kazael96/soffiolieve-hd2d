# Unfezant · Raffica · sorgente autoriale0.64

Questa scheda conserva anche il registro storico del pilot e della prima
promozione. Il precedente percorso `outputs/animation-review064` non risulta
più disponibile: la sua descrizione come «preservato» sotto è storica, non una
conferma di recupero attuale. Le fixture commesse e le nuove prove hanno
provenienza distinta; vedere [ANIMATION-RESUME-064.md](ANIMATION-RESUME-064.md).

`src/unfezant-moves.js` integra le quattro viste maschio/femmina, fronte/retro del pilot privato28. Il corpo e l'identità rimangono nativi; copritrici, ventaglio delle remiganti e sovrapposizione del polso sono un adattamento HD-2D autoriale. Non sono animazioni estratte dal DS. Effetti nativi della mossa, audio, meccaniche e profilo temporale rimangono affidati ai sistemi esistenti.

La sorgente precedente è preservata fuori dalle build: `outputs/animation-review064/story/unfezant-gust-private/wing-split-allcap26-064.js`, SHA-256 `62c60b0a471ce7480e1eb35f0dacd0134af446fcc639ef30161cd53c27b6dc84`. La fixture `tests/fixtures/unfezant-gust064-reference.json` conserva i dodici SHA delle immagini, i cinque SHA delle funzioni del rig effettivamente osservato e i riferimenti alle quattro banche native. I cinque corpi di funzione `prepare`, `phase`, `author`, `projection`, `surface` sono invariati rispetto al pilot.

## Proprietà e movimento

- Sopprimere la cella alare ripiegata12 sul fronte e7 sul retro soltanto nelle pose autoriali attive. Restano il corpo, testa, piedi, coda e dettagli distintivi nativi.
- Usare le quattro sorgenti specifiche `front/back × near/far`: cap, remiganti e striscia originale del polso, dodici PNG128×128 incorporati. Le riparazioni dei tre bordi aggiuntivi sono state disegnate separatamente, senza specchiare il primo intervento.
- Conservare spalla e polso effettivi, le tre battute, l'ingresso e il recupero approvati. Nei fotogrammi nativi/UP protetti0/33/54/78/112/126 i raster del pilot28 coincidono esattamente con il riferimento precedente nelle quattro banche; questo vincolo tecnico non sostituisce la revisione visiva.

## Preparazione e recupero

`SpeciesMoves.prepare(profile,{cryIds,side})` concatena l'eventuale preparazione già installata. Per521/16 attende sia la decodifica atomica dei dodici PNG sia `ROM_SPRITE_ANIM.prepare()` delle due banche native del graphic effettivo,521 oppure `521-female`. Non pubblica una collezione parziale di immagini.

Il modulo condivide le richieste contemporanee. Un errore rigetta la promessa e libera lo stato pendente per il tentativo successivo; le immagini già completate possono essere conservate quando fallisce soltanto la banca nativa. Sampling e rendering autoriale richiedono preparazione completa. Una banca espulsa o incompleta non produce un falso disegno riuscito.

Il pool contiene18 canvas128², riutilizzati con lo stesso ordine FIFO e azzeramento del pilot. Nessun canvas o immagine è creato da `surface()` durante i fotogrammi. Una sola superficie temporanea di analisi dell'alfa viene riutilizzata durante la preparazione e ridotta a1×1 alla fine. Le altre mosse e specie mantengono il precedente dispatcher.

## Geometria per il compositore

L'API diagnostica provvisoria `UnfezantMoves.phaseGeometry({graphic,back,speciesPose,frame,presentationToken})` legge **la posa fornita**, senza un secondo clock. Restituisce:

- `representation: hybridNativeAndAuthored` quando le ali autoriali sono attive; componente nativa e celle soppresse esplicite;
- sei layer con proprietari delle sorgenti immutabili, contorni alfa preparati, origine e matrice affine `sourceToNative`;
- coordinate locali della banca nativa, precedenti a dimensione di disegno e trasformazione esterna; tali trasformazioni devono essere applicate una sola volta dal consumatore;
- un'unione conservativa dei contorni delle ali, con un pixel nativo di margine. **Non include il corpo nativo**, né pretende di essere il raster finale dopo tutte le occlusioni;
- `physicalSemantics: UNKNOWN`. Questa API non certifica sostegno o contatto fisico.

Nessun riferimento a una superficie mutabile del pool viene restituito nella geometria. Posa assente/diversa, graphic non supportato o preparazione incompleta restituiscono `supported:false`: la sagoma nativa con ali chiuse non può essere spacciata per l'ingombro della composizione autoriale. L'uso effettivo da parte del compositore richiede ancora una prova integrata.

## Prove e limiti

Il pilot28 ha prodotto508 fotogrammi del corpo realmente letti dall'agente Story; la revisione indipendente root comprende16 tavole ambientate/88 campioni e8 tavole di proprietà43/64. Esito positivo limitato a queste sequenze a fotogrammi forniti. Conservare i vecchi rilievi sui bordi interni esposti come prove storiche del difetto.

La nuova suite `tests/unfezant-gust064.test.cjs` verifica13 casi: difetto originale delle ali chiuse, installazione ripetuta, barriera delle risorse, richieste concorrenti, errori e ripresa, entrambe le forme, banche espulse/incomplete, concatenazione del preparatore, sorgenti/funzioni accettate, pool, geometria ibrida e delega dell'intero catalogo ottenibile. Il caso originale fallisce con il modulo disattivato e passa con il nuovo modulo. L'output EPERM del primo tentativo del test runner è un limite del lancio isolato, non una regressione dell'app; è preservato separatamente. Il successivo FAIL di copertura del sottoinsieme iniziale è stato corretto esercitando l'intero catalogo, senza abbassare il controllo.

Queste prove CPU non certificano il rendering della nuova integrazione. Restano obbligatori candidata C3 immutabile, comandi reali, ritmo normale e rallentato, ×1/×2/×4, telefoni, audio e compositore ibrido. Il modulo non è ancora dichiarato pubblicato o completamente collaudato.

## Requisito attuale del collaudo

Il riferimento a C3 nel paragrafo precedente appartiene alla prima promozione;
la sua build non è disponibile nella ripresa. Il requisito attuale riguarda
la candidata07 immutabile `85b98d70e88848df`, con sorgenti realmente eseguiti attestati,
comandi e immagini nei tre formati e alle velocità dichiarate. Normale,
rallentato, audio ascoltato e immagini statiche restano prove distinte: un
parametro o un PASS CPU non ne certifica l'esecuzione grafica.

La lettura indipendente delle20 immagini di battaglia C5/ritratto/×2 copre
soltanto i cinque istanti60/95/101/106/126 per le quattro azioni. Non certifica
tutti i fotogrammi continui o il nuovo pacchetto C7. Il verbale conserva la
vicinanza ala/testa in alcune viste femminili e il rinculo sollevato del
difensore. Gli esiti e i limiti dei
nuovi replay vanno aggiunti dopo la loro effettiva esecuzione e lettura;
la bozza della PR e la suite r2 in corso non costituiscono pubblicazione.
