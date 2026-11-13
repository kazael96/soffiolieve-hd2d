# Sequenze native e lotte finali053 in lavorazione

La pubblica resta052. Questo documento registra componenti privati, senza certificare Castello, cattura, N, Ghecis o titoli di coda giocabili. Continuare fino al primo finale e poi alle MN sul campo, senza CUA e senza fermarsi a ogni componente.

## Campo e fondali

La candidata privatafield03 `772128179b198a30` ha superato104 regressioni mirate e9 combinazioni browser nei tre formati;72 PNG rivisti nei18 contatti. Sono verificati gli ingressi originali418/419/420, il trasporto191 e Marzio a1/2/4. Correzioni: Catlina visibile con sprite verticale e contatto conservato, chiusura del piano inferiore del Centro146, passo concluso sulla casella prima del corpo3D, attese native65/66 da16/32frame, pulizia degli errori.

Field04 `12fe383033f1d3d1`: tre combinazioni browser e15 PNG rivisti nei4 contatti. Cinque ambienti espliciti: Antemia140, Mirton141, Marzio142, Catlina143 e sala del trono278. Materiali e quote campionati dalle geometrie originali, spazio di battaglia adattato HD-2D, scenografia oltrez−21, terreno dei combattenti a0. Non esistono incontri selvatici ambientali in queste sale; nessun Pokémon di sfondo inventato. Preparazione e regressioni del compositore geografico e della cache PASS. Questa prova usa anteprime, non vittorie reali.

Le musiche1135/1138/1139 sono associate ai quattro Superquattro, a N587 e a Ghecis232. I nomi SDAT sono rispettivamenteVS_SHITENNO,VS_N_2,VS_G_CIS; gli incontri precedenti di N conservano la loro selezione. Nessun confronto udibile effettuato.

## Cinque filmati

`inspect-finale-films.py` legge la tabella021c175c dell'overlay203, SHA256 `9691fcca035a4703c425237cfbf76391f9d4eadaf7bc08afc27ddf78f6fae851`. Archivio originalea/1/6/0:

| ID | Sequenza | Frame nativi a30Hz |
| --- | --- | --- |
| 6 | Comparsa del Castello di N | 1615 |
| 9 | Risveglio di Reshiram dalla pietra | 1361 |
| 10 | Risveglio di Zekrom dalla pietra, ramo White | 1361 |
| 11 | Arrivo di Zekrom con N in Black | 1261 |
| 12 | Arrivo di Reshiram con N, ramo White | 1261 |

`extract-finale-films.py` conserva tre modelli per filmato, scheletri, camera registrata, BMA, BTP con palette alias corrette, BTA e luminositàQ12. La sola esportazione non equivale all'integrazione dell'evento.314 file/34.458.636byte installati, hash in `outputs/chapter053-preparation/installed-five-native-films.json`; seconda generazione indipendente delle colonne sonore identica ai file installati.

Il primo export ha rifiutato le scale native omesse dal convertitore; il secondo ha rifiutato l'uso di un BMD come contenitoreBTX; il terzo ha rifiutato la rotazione UV non ancora implementata. Errori conservati, senza eliminarne i controlli. Il quarto completa i cinque filmati. Le matrici native Maya seguono [NitroSystem maya.c, revisione fissata](https://github.com/ntrtwl/NitroSystem/blob/d636fb5d2b212e8736f09859fff447be2bd0ac85/libraries/g3d/src/cgtool/maya.c), compresi scala, rotazione, aspetto e traslazione a virgola fissa. Lo shader opzionale riceve una matrice per materiale; gli altri materiali ricevono l'identità, senza propagazione fra gruppi. Baseline GPU-command FAIL conservata, poi22 regressioni condivise PASS;7 test Python dei canali/matrici PASS.

`render-finale-film-audio.py` usa il driver DS originale, SSEQ/SBNK/SWAR e controlli di volume/pan/pitch prima della sintesi. Conserva la sostituzione dei player0/1/2, gli stop e le dissolvenze BGM. Il primo render ha fallito per un campione di differenza fra arrotondamento della durata e bordi assoluti; ora calcola entrambi i bordi sulla griglia30Hz. Cinque regressioni del pianificatore PASS. La cache richiede digest degli ingressi e hash FLAC. I rapporti registrano saturazione dei campioni del mix; nessuna equivalenza byte per byte al mix hardware multisequenza o ascolto comparativo è dichiarata.

`FinaleCinematics` carica i dati su richiesta, prepara modelli e audio prima del tempo0, mantiene un solo filmato, segue1/2/4, sospende il tempo in secondo piano e libera risorse e input su termine, errore o annullamento. Il completamento tardivo di un modello annullato non riavvia scena o audio.24 regressioni mirate/condivise PASS, compresi i due filmati precedenti della Torre.

## Candidatafield05: collaudo in corso

Revisione `6afd9e16b4070cc8`,418 sorgenti runtime congelati e verificati invariati. Suite browser in `browser-field05-films-and-elite`: quattro lotte reali dei Superquattro PASS in desktop, verticale e orizzontale. Il banco usa interazioniA e cammini effettivi, sei specie legali al50 e turni GEN5 con semi registrati; cura la squadra fra controlli indipendenti delle sale. Non fornisce risultati vincenti al motore, ma non è una prova della Lega senza cure né dell'intera campagna precedente.

I cinque filmati e la regressione dei due della Torre passano in desktop e verticale. In orizzontale la regressione della Torre passa, ma il controllo di sincronizzazione audio dei cinque filmati fallisce. Filmati e risorse terminano; la causa del controllo resta da isolare. Non accettarefield05 sulla base degli altri PASS. Ripetizione diagnostica sulla stessa build in `browser-field05-landscape-audio-diagnostic`, con valori nell'errore e nessuna soglia allentata.15 PNG dei nuovi filmati desktop già rivisti nei4 contatti; le altre immagini restano da esaminare.

H.8: restano051 utile al confronto,052release31 verificata e candidata05.03 e04 ritirate dopo archiviazione completa, verificaCRC e SHA256 di ogni file; rapporti e manifesti esterni conservati. Un primo tentativo di ritiro03 con archivio dei soli file principali è stato respinto dalla revisione automatica; nessuna cancellazione eseguita in quel tentativo.

## Prossimo lavoro obbligatorio

Risolvere il controllo audio, rivedere tutte le immagini e conservare la provenienza della fixture. Completare comandi e raccordi della sala del Campione/Castello, continuità degli NPC, sprite dei leggendari sul campo, cattura e gestione squadra/Box, N, Ghecis e crediti. Poi verificare378 nuove coppie Pokémon–mossa su entrambi i lati, salvataggi, servizi, errori, suite completa e rilascio/Pages. L'index di gioco non attiva ancora i cataloghi finali; la preparazione non aumenta da sola l'avanzamento narrativo.


### Seguito: due regressioni temporali e controllo BGM

La ripetizione isolatafield05 in orizzontale passa, ma non dimostra la causa del primo FAIL. Due regressioni mirate riproducono comunque problemi reali: durante la creazione dei nodi il tempo del contesto può avanzare, mentre l’origine veniva registrata prima della partenza; una lettura successiva dello stato confrontava tempi diversi. Ora l’origine segue `source.start`, lo stato campiona una sola volta il contesto ed espone il riferimento dell’ultimo fotogramma. Il banco conserva sia lo scarto live sia quello calcolato al tempo comune, senza alzare la soglia0,1s. Aggiunti proprietari conteggiati del bus musicale per evitare la musica di campo sotto la BGM già inclusa nei nuovi filmati; gli effetti restano attivi.1002 è silenzio nativo verificato con lo stesso SSEQ di1017, non risorsa PCM mancante.67 regressioni audio condivise PASS; errori di fixture con _site mancante conservati separatamente.

Nuova candidata06 `8b783f2406add18f`,418SHA congelati verificati invariati. Replay completo nei tre formati in corso in `browser-field06-films-and-elite`; nessuna accettazione anticipata.05 rimossa dopo ricostruzione verificata di31627file (archivio04 completo più delta05 e inventario esplicito), senza una nuova copia integrale ridondante.

### Revisione completa06 e sorgenti successivi

Nove combinazioni automatiche PASS,87 PNG tutti rivisti nei22 contatti. La revisione rifiuta lo stacco camera dei risvegli: interpolare680/681 combina due inquadrature native e produce una vista del soffitto. Ora i cinque film campionano uno stesso fotogramma nativo intero per camera, scheletri e materiali, senza soglie arbitrarie per gli stacchi; gli altri filmati conservano il comportamento precedente. Baseline FAIL e18 regressioni condivise PASS. Non ancora verificato in nuova candidata GPU.

OP184 verifica quantita inventario senza modificarlo, inclusa assenza dello strumento con richiesta zero, secondo IRBI021af534/02007ecc. Baseline FAIL, poi3 test host inventario/E4 PASS. Questi sorgenti sono successivi alla build06 e non ereditano la sua certificazione.

### Candidata07: filmati e sprite verificati

Revisione `be11c9d640b4abb7`,419 sorgenti runtime congelati invariati.12 combinazioni GPU PASS nei tre formati: cinque film finali, due della Torre, quattro lotte reali dei Superquattro e selettori dei leggendari.96 PNG tutti rivisti nei24 contatti; accettazione limitata ai componenti eseguiti, non agli eventi completi del Castello. Lo stacco nativo dei risvegli non interpola piu inquadrature estranee. `review-field07-all.json` conserva gli inventari SHA delle immagini.

Selettori162/163 della sala278 risolti dopo inizializzazione, anche al rientro:212 per Reshiram,214/213/222 per le tre pose di Zekrom in Black. Dimensioni64px e programmi originali; nessuna cella verde di servizio. Dieci regressioni condivise PASS. OP379/380 distinguono cattura/KO/fuga/sconfitta secondo le tabelle native; callback di registrazione consegna il risultato dopo il deposito riuscito. Due test di risultato/trasferimento nei Box PASS. La lotta376 e il raccordo completo non sono ancora implementati.

H.8:06 ritirata dopo ricostruzione SHA di31627file da archivio04 completo e delta06 (29353270byte; SHA95706bf9e6fdb7ea3e0744164b46e16c04d4598a502fe15f7f90180aad14dfdc). Restano051,052release31 e07 privata.

Prossimo gruppo: replay sala144 fermato sul movimento187 (`champion-hall-host-first.log`); recuperati originali a/0/7/5 membri50..53, fumetti16px, rimbalzo7tick/attesa30tick, audio1656/1840/1841 nativo in preparazione esterna emote-export. Varianti mappe144 e278 esportate fuori sorgenti: matrici218/212, condizioni evento1/work16434=548 ed evento3/work16436=4617, originali geometria/collisioni/quote. Primo export ha rifiutato il contenitore NARC non aperto; secondo PASS. Queste preparazioni non sono ancora integrate nella candidata07. Continuare fino al finale e poiMN senza controllo del PC e senza fermarsi al componente.
