# Revisione MN 0.64 e conchiglia di Oshawott

Le acquisizioni private citate in questo registro sono storiche. Il percorso
`outputs/animation-review064` non risulta più disponibile nella ripresa del
23 novembre; non si attribuisce ai vecchi verbali un nuovo esito C7.
Asset o riferimenti ancora presenti nel checkout non recuperano da soli le
prove private mancanti.
Per stato e prove correnti vedere
[ANIMATION-RESUME-064.md](ANIMATION-RESUME-064.md).



La revisione distingue quattro prove: inventario delle coreografie, fotogrammi del compositore, giudizio visivo e comandi reali nel mondo. Un inventario completo o un controllo numerico non approva la qualità dell'animazione.



## Copertura di riferimento



Il banco privato in `outputs/animation-review064/hm` conserva la baseline 0.63 (`c666a2a1f8aeebf5a174926865fc549ff1615e51`, build `abedec256cddc00e`). Ha acquisito tutte le 105 coppie disponibili: 60 Taglio, 16 Volo e 29 Surf, per 448 sequenze di fase e vista. Ogni sequenza comprende 61 avanzamenti uniformi, i nodi scritti a mano e i campioni immediatamente prima e dopo ogni nodo. Le carte originali 512×512 restano a risoluzione nativa; le tavole usano un solo ritaglio per profilo.



Questa prova imposta esplicitamente le pose di riferimento: mantiene Taglio/Volo materializzati e Surf in sella. Non dimostra l'esecuzione dei 105 comandi, i trasferimenti, il contatto nel mondo o la temporizzazione del controller. Le righe non esaminate restano `UNREVIEWED` nel registro. I browser sono invisibili, isolati e chiusi fra i lotti; nessun controllo del PC o del browser personale.



Il primo fallimento di Durant è conservato. Il controllo condiviso pretendeva una quota di pixel saturi su una miniatura larga 240 pixel dell'intera striscia. La carta reale di Durant contiene 7.944 pixel visibili, 9 toni e contrasto 213; i piccoli occhi rossi si perdono riducendo decine di pose alla miniatura. Il solo sink privato MN ora verifica i dettagli RGB e alpha della carta nativa, conservando la PNG integra. Non cambia le soglie del gioco o del collaudo generale. Il nuovo controllo respinge anche carte vuote, uniformi, a due toni e rumore isolato.



## Difetto corretto: Oshawott usa davvero la conchiglia



La baseline prometteva di staccare la conchiglia dal ventre e portarla al viso, ma disegnava il torso originale con la conchiglia ancora attaccata. Muovere braccia, inclinazione e un arco luminoso non realizzava quella presa.



`field-hm-oshawott-cut.js` sostituisce soltanto il disegno di Oshawott durante Taglio. Battaglie, Surf, sprite originali e le altre specie mantengono i loro bank. La nuova sorgente contiene 71 avanzamenti per vista: 65 campioni uniformi e tutti i 6 nodi interni. Le 142 celle sono 56×56 con pivot e densità costanti. Testa, piedi, mani e conchiglia provengono dai componenti originali; i piccoli nodi di testa, piedi e braccio libero sono inclusi nelle celle. Lean, squash, posizione nel mondo, ombra, camera e contatto nativo dell'albero continuano a usare il controller esistente.



La conchiglia è unica: si stacca, resta nella presa della mano e torna al ventre nel recupero. Nel retro viene occultata da torso e testa dove necessario. La mano mantiene la stessa proprietà anatomica passando da fronte a retro: le due viste usano lati opposti dello schermo. L'effetto luminoso segue il bordo della conchiglia nella stessa trasformazione del corpo; Oshawott non usa più l'arco generico collocato sul lato fisso della carta.



## Provenienza dell'artwork



È stato usato il tool integrato ImageGen per una nuova superficie del ventre, nascosta nella fonte dalla conchiglia. Il risultato grezzo è stato respinto come cel intero perché alterava silhouette, alpha e palette. È preservato come `generated-torso-raw-FAIL.png`.



La calibrazione è limitata ai **46 pixel** originali della conchiglia, utilizzando soltanto le tre tinte teal già presenti. Fuori dalla maschera, RGBA e alpha del torso sono identici alla fonte. I pixel originali della conchiglia sono separati senza ridipingerli. Il corpo non viene ricostruito con un'immagine generata generica.



- Torso originale: `865130c8057a6e8e4504ed50de98bdf3aaebfa55f5fb61750ece1bb0238b2930`.

- Risultato grezzo respinto: `bdc87dc1799b920226ca77803af209335f774d6ed3c049d44321a414e5c479dd`.

- Torso d'autore calibrato: `da97ef3e515abb60f45508893d2fdb202a9c529ead621c1adf849e6ccb5d4589`.

- Pixel della conchiglia separata: `88779815e75bb9ccfb6b2518b07efc92d1af1ce0ab9793c5a591bcb8138cf8c2`.

- Atlas finale di sorgente: `92bf8fd6c7bef1266b7bd653daa74ef8dc525f720b3cef54eec8f2812335a67c`.



Il prompt completo, i riferimenti, gli script di estrazione/calibrazione/bake e le varianti respinte restano nel rapporto. Il primo pilot aveva un errore nell'ordine OAM dell'assemblatore privato, il secondo una presa troppo lontana dal corpo; entrambi sono conservati come FAIL. Non sono mai stati installati nel gioco.



## Caricamento e memoria



La PNG è incorporata nel modulo: nessuna nuova richiesta di rete. L'immagine viene decodificata una volta prima dell'azione, anche al primo utilizzo offline; `draw` non crea immagini né canvas. Il footprint decodificato è 448×1008×4 = **1.806.336 byte**, con un solo atlas e un rilascio esplicito. Il compositore riutilizza la carta GPU da 1 MiB già esistente. La preparazione può fallire e riprovare; una decodifica annullata non sostituisce il proprietario successivo.



## Verifiche



`tests/field-hm-oshawott-cut.test.cjs` decodifica la PNG effettivamente incorporata. Confronta i fotogrammi iniziale/finale con i componenti originali, verifica l'estrazione e il reinserimento, l'assenza della seconda conchiglia sul ventre, il lato corretto nel retro, l'ingombro delle celle, la memoria, il caricamento offline e l'annullamento. `field-hm-world.test.cjs` conserva i controlli su contatti, appoggi, camera, pin, passaggio di bank e checkpoint ×1/×2/×4.



La candidata diagnostica C1 `af2fab81d1a6b91e` ha completato 18 replay Oshawott (fronte/retro, ×1/×2/×4, desktop/telefono verticale/orizzontale). Il helper tracciato `tests/field-hm-regression064.js` osserva il controller originale, il suo clock e la carta reale: non fornisce pose o risultati di gioco. Il caso retro ×1 attiva il pulsante A visibile, parte con atlas non decodificato e osserva la promessa originale restituita dall'alias `Journey.interact`, che deve coincidere con `NativeStory.interact`. Gli altri cinque casi per formato dichiarano esplicitamente l'ingresso API nel controller originale.



Tutti i 108 PNG del replay sono stati esaminati: quattro vedute del mondo e due carte native 512×512 per caso. I risultati riguardano le pose di preparazione/contatto catturate, insieme alla lettura separata delle 142 celle d'autore; non approvano ogni fotogramma del mondo o ogni GPU Android. Le attese fredde dei primi casi telefono non certificano la durata nominale a ×4. Rapporto: `outputs/animation-review064/hm/actual501-c1-r4/report.json`, SHA-256 `101ea28bd63decf64e4b4fca2fdff18a9c5b4c165ecd6f00d973a4a601723cfc`; revisione PNG: `review/manual-review.json`, SHA-256 `6d72fdf35412b2195413c246d4b5a5858a2cd381d4b109d6683d9b603765cfb7`.



I fallimenti precedenti restano preservati: il primo osservava soltanto la proprietà `NativeStory.interact` mentre il pulsante usava l'alias nativo già assegnato a `Journey.interact`; il secondo è stato fermato dalla guardia dei processi QA prima di eseguire casi. Quest'ultimo non dimostra un difetto del gioco né una causa di riciclo PID in assenza dei dati grezzi. Tutti i browser e server propri risultano chiusi. Le prove C1 non si trasferiscono ai successivi sorgenti modificati o alla distribuzione pubblica.



## Difetti ancora in revisione



La lettura della baseline ha individuato anche la mancata estrazione delle due conchiglie di Dewott e della lama di Samurott, oltre all'arco luminoso di Taglio collocato sul dorso di alcune viste posteriori. Questi FAIL restano nel registro originale; i pilot d'autore e le nuove coordinate non li trasformano automaticamente in PASS.



Il contatto luminoso comune ora usa un pixel opaco del vero componente nativo, distinto per vista, e compone le stesse trasformazioni di track, giunto e padre del renderer. Non ribalta alla cieca l'arco del retro e non legge pixel o crea superfici per fotogramma. `field-hm-cut-anchor.test.cjs` verifica i 118 punti delle 59 specie senza l'atlante Oshawott, il caso Scolipede posteriore e l'ordine delle trasformazioni; la revisione grafica dei delta nella candidata successiva resta obbligatoria. L'inventario delle sorgenti e la copertura visiva corrente restano separati in `coverage064.json`.



## Dewott e Samurott: sorgenti complete, controllo finale ancora richiesto



`field-hm-evolved-cut.js` contiene soltanto Taglio502/503. Per Dewott usa le due conchiglie e i palmi nativi, con presa e affondi alternati; sul retro nasconde esclusivamente i23pixel dorati della conchiglia agganciata nel pantalone. Il braccio lontano posteriore, nascosto a riposo, adatta la parte originale corrispondente della vista frontale. Per Samurott articola la zampa anteriore originale16 attorno a due segmenti di lunghezza invariata, con la zampa17 che impugna una nuova seamitar disegnata a pixel nella palette nativa; il fodero15 resta al suo posto e gli altri tre appoggi restano disponibili. La lama è un adattamento d'autore dichiarato, non una sequenza estratta dalla ROM. Testa, piedi e coda delle parti non impegnate conservano la propria coreografia; inclinazione e compressione generale restano nel renderer del mondo. Battaglia e Surf non cambiano banco.



Le148celle di Dewott e144di Samurott sono state lette integralmente dall'autore e da `/root` nelle quattro tavole `evolved-shell-pilot/atlas-v2/*-complete.png`, con registro indipendente `independent-root-review.json`. La prima bake Samurott è respinta e conservata: il gruppo della zampa disegnato dopo il corpo introduceva224pixel frontali e16posteriori di salto vicino agli estremi. La seconda mantiene l'ordine originale per parte. I fotogrammi0/.002/.998/1 sono ora uguali byte per byte ai compositi originali in tutte le quattro viste. SHA-256 atlas502 `cd0631a4c391abce1d80a698dbb2aebc6483b8a904dde3ab1ff0097558765229`; atlas503 `cdc5d2378316eae6a76bbb190bc1420c0a82f76edf2f6913e15dd6d9b59fcc19`.



Il decoder conserva un solo atlas evoluto attivo:2.49MB RGBA per502 o6.23MB per503; rilasciare il proprietario precedente non elimina quello nuovo. Non decodifica immagini per fotogramma. Una regressione aggiuntiva ha rilevato che il riuso dello stesso banco passando da Taglio a Surf tratteneva inutilmente l'atlas: ora viene rilasciato anche in quel ritorno anticipato. Le prove del modulo coprono palette, alpha, bordi, estremi, estrazione effettiva, annullamento/riprova e cambio proprietario. I valori sono memoria RGBA stimata del decoder, non picco RAM di sistema o GPU osservato.



## Appoggi del protagonista



La candidataC2 ha individuato i primi appoggi sospesi su Herdier507, Stoutland508 e Swanna581. I test delle quote.48/.55/.47 misuravano però il bordo inferiore dello sprite del protagonista, cioè le suole. Quel controllo resta come regressione dei dati storici e non certifica il bacino. Le immagini FAIL e le prove precedenti non sono riscritte.



I sorgenti in revisione ora registrano l'anca originale del protagonista, distinta per sesso e per le quattro direzioni, su un punto opaco originale del torso/dorso. Nel primo consolidamentoV4 i punti erano specifici per vista per507/508/515/516/580/581, in entrambe le MN per gli ultimi due. La preparazione compone le vere matrici di track e padre Nitro una volta per banco; inclinazione e compressione del corpo trasformano poi lo stesso punto. Il raccordo della figura a piedi usa un punto separato, calcolato dal fondo dell'intero sprite seduto anche quando ruota. Non si abbassano gli altri profili:550/565 restano identici.



Le sole quote non bastavano: nei pilot il volto di Panpour515 e Simipour516 finiva sotto il cappello. L'assetto specifico di Surf fa protendere le parti native della testa davanti al corpo, mantenendo il collo sovrapposto al torso e gli arti originali. È una posa d'autore con parti originali, non un'animazione letterale estratta dalla ROM né una deformazione della testa. Sono stati rasterizzati1040insiemi di parti dalle vere trasformazioni del runtime:65tempi per quattro fasi e due viste. Le quattro tavole di minima sovrapposizione sono state effettivamente lette; il minimo8pixel è un controllo di continuità e non un'approvazione estetica.



Per Ducklett580 il protagonista mantiene l'anca fissa e inclina l'intera figura seduta originale di.20radianti, con verso coerente alla vista. La maschera delle gambe e la diagnostica usano la stessa rotazione. Volo aumenta l'inclinazione fra.35–.45 e la annulla fra.50–.65, prima del ritorno a piedi. Surf mostra cinque pose riconosciute soltanto dopo un disegno riuscito, sia quando il protagonista si assesta sia quando si raddrizza prima di scendere. Il progresso di presentazione resta privato, fuori dal record salvato della costa. Il primo prototipo riavviava questa attesa riprendendo una discesa già avanzata: il FAIL è conservato; la versioneV4 la crea soltanto all'inizio del movimento di uscita, senza ripeterla a metà tragitto o durante il richiamo.



Le immersioni515/580 sono.20, verificate sulla vera anca; le quote precedenti fallivano il nuovo controllo. Le regressioni conservano i margini nominali di allestimento e controllano separatamente l'altezza effettiva sopra l'acqua usando la camera e il posizionamento del billboard. Il renderer ordinario conserva un solo banco e una sola cardGPU512×512; non crea nuove immagini o maschere per fotogramma.



La revisione grafica privataV3 esegue quattro sorgenti espliciti sopra la baseC2 senza modificare la build:76tavole con508pose originali e508copie diagnostiche, più40fotogrammi del mondo. Tutte le76tavole sono state lette da un secondo revisore; tutti i40fotogrammi del mondo dall'autore. I96fotogrammi di controllo550/565 coincidono byte per byte conC2, ma la qualità dei loro volti è stata controllata separatamente. Questo è un riscontro positivo sui riferimenti privati; non è una certificazione dei comandi, dei raccordi reali o della candidataC3. La guardia di ripresaV4 è un delta successivo e non cambia retroattivamente gli SHA delle immaginiV3.



Prove locali: `outputs/animation-review064/hm/runtime-v3-pilot-story76.json`, ledger indipendente `story/hm-runtime-v3-story-review.json` e `hm/runtime-v3-world-review/manual-review.json`. Il consolidamentoV4 comprendeva49contratti del mondo, otto prove di sorgente/geometria e sei dell'acqua, con fondali e punti nativi della build effettiva. `field-hm-rider-contact.test.cjs` verifica anche le due direzioni laterali e le matrici non identità; `field-hm-rider-water.test.cjs` distingue il margine non proiettato dall'altezza reale. Restano obbligatori i comandi effettivi e le riprese sulla candidata integrata nei tre formati e alle tre velocità, oltre ai delta Taglio.



Il helper tracciato offre ora18casi Taglio501/502/503×fronte/retro×tre velocità, da eseguire nei tre formati. Per ciascuna specie il caso retro×1 attiva un solo A DOM visibile, con atlas freddo, e attende la promessa originale invariata; gli altri casi dichiarano l'ingresso API nel controller originale. Le prove C1 Oshawott restano storiche: le nuove coreografie, scie e posizioni vanno osservate sulla candidata integrata prima della consegna.



## Sei appoggi aggiuntivi e postura CubchooV7

La lettura dei45profili cavalcabili ha riaperto altre sei coppie: Oshawott501, Dewott502, Audino531, Cubchoo613 e Alomomola594 con Surf, Golurk623 con Volo. I primi quattro collocavano il protagonista sopra testa/cresta; Alomomola sulla pinna superiore; Golurk copriva il cono del volto. I nuovi punti opachi appartengono al corpo nativo e sono distinti per vista. Golurk usa la spalla opposta e lascia libero il cono, senza un ripiego speciale di sovrapposizione. Alomomola mantiene occhio e ovale visibili, con la pinna dietro il protagonista. Stunfisk618 è rimasto invariato: il riscontro separato usa esclusivamente pelle marrone originale, escludendo pinna gialla e contorno, e non ha confermato un nuovo distacco.

Le parti native della testa di501/502/531/613 assumono una postura specifica di Surf. L'ingresso nella postura e il ritorno neutro seguono l'attesa originale di apparizione/richiamo, senza abbassare il capo mentre il protagonista è ancora montato. Il peso transiente è calcolato dal record nativo, senza aggiungere campi al salvataggio. Il banco e la cartaGPU restano quelli già presenti.

Il primo CubchooV6, con testa frontale traslata di16pixel, è stato respinto da un secondo revisore: pur senza buchi alpha, sembrava allontanare il cranio dalle piccole spalle. Sono conservati gli otto pannelli, i raccordi e il FAIL di naturalezza. La sola continuità o il conteggio dei pixel sovrapposti non lo rendevano accettabile. Il confronto delle parti ha mostrato anche la zampa bianca6 davanti all'occhio. La varianteV7 conserva la testa vicina al busto, a[-8,+4]pixel, e abbassa di3pixel la zampa propulsiva originale, mantenendola associata alla spalla. Il protagonista inclina la figura seduta di.16radianti attorno all'anca; i cinque passi di assestamento/raddrizzamento usano gli stessi riconoscimenti di disegno reale già previsti per Ducklett. L'immersione613 è.23, dopo il FAIL della vecchia.30 sui margini dell'anca.

Il secondo revisore ha letto effettivamente le64pose negli otto nuovi pannelli CubchooV7, quattro vedute con acqua e due raccordi di18pose native. L'approvazione riguarda questi riferimenti privati forniti, non il comando C3 o ogni fotogramma normale. Gli altri cinque profili hanno38pannelli completi,228pose e20vedute del mondo letti dall'autore; il loro manifest per la revisione indipendente è separato, senza trasferire il giudizio su Cubchoo. Rapporti e SHA: `hm/runtime-v7-cubchoo-r1/root-native-review`, `hm/cubchoo-balance-v7/native-transition-strips`, `hm/additional-five-independent-review.json`, `hm/rider-v7-install-source-check.json` sotto `outputs/animation-review064`.

I nuovi test mirati sono falliti sei volte sulla fonteV4 e passati57/57 sul pilot privato prima della copia. Dopo l'integrazioneV7 sono passati85/85controlli mirati:52del mondo,14di appoggio nativo,11dell'acqua, cinque delle pose e tre del collegamento dei replay. Comprendono le quattro direzioni, M/F, attesa/richiamo, ripresa della discesa già avviata, riconoscimenti a contesto perso/nascosto e assenza di dati di presentazione nel record salvato. Sono prove CPU, separate dalla revisione raster e dai comandi della candidata integrata.

`tests/field-hm-regression064.js` registra anche168replay selezionabili, per14profili cavalcabili nei due sessi, due viste e tre velocità, da eseguire per lotti limitati nei tre formati. Mantiene i controller reali: HM03 insegnata e pulsante A, oppure Squadra/VOLO/mappa. Gli arrivi di Volo restano frontali come nel controller nativo; soltanto la vista della partenza è selezionata. I default dei casi storici Dewott/Unfezant non cambiano. La registrazione e i tre test di collegamento non significano che168comandi siano già stati eseguiti.

Restano obbligatori i replay e i delta sul codice esatto della candidataC3:120sequenze Taglio e106sequenze delle coppie cavalcabili modificate, tutte le fasi e le due viste, oltre a salita/discesa, cambio banco, ripresa e tre formati/velocità. Il primo finale e il limite54 restano invariati.


La revisione indipendente delle altre cinque specie è poi stata completata: tutte le38tavole/228pose effettivamente lette, senza ulteriori distacchi o volti coperti osservati. Il registro `hm/additional-five-manual-review-root.json`, SHA-256 `c0fb0513c3afb6746619bca981792dda17ae5440b6391abc5052405fa2887eb0`, resta limitato ai riferimenti forniti; non approva comandi, curve complete o acqua.

## Prova del codice effettivamente eseguito nei pilot

I pilot privati MN non sostituiscono file individuali dietro un bundle: inseriscono il testo completo dei quattro moduli come IIFE eseguibili nel `browser-qa.js` della fixture, dopo `app.js`. L'audit conserva gli otto rapporti originali senza aggiungervi hash retroattivi. Tre nuove microprove distinteV3/V6/V7 hanno confrontato nel browser29funzioni realmente installate e tre insiemi di dati con le stesse fonti valutate in una VMNode. Prima di disegnare hanno inoltre verificato l'identità dei riferimenti effettivamente chiamati. Le quattroSHA di ogni versione coincidono con quelle registrate dai pilot storici. Rapporto additivo: `hm/executed-source-audit064.json`. Questo controllo conferma il collegamento del codice, senza riabilitare CubchooV6 o certificare C3.

Per la candidata integrata il banco preparato usa `--actual-runtime`: verifica le funzioni del bundle già eseguito e non reinietta i moduli MN. `--full-poses` esporta le carte native in strisce di massimo otto pose, con canvas da16MiB e scrittura attesa prima della striscia successiva. La preparazione di questo banco non è un risultato di collaudo; serve una candidata costruita e il suo replay effettivo.
