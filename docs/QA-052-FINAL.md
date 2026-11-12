# Accettazione del capitolo052 · 12 novembre2026

La tappa comprende palestra di Aristide, Percorso10, otto Portali delle Medaglie, Via Vittoria e arrivo/servizi del Centro della Lega. Superquattro, Castello di N, N/Ghecis e primo finale restano da integrare; le MN personalizzate nel mondo seguono quel finale. Il collaudo non aumenta da solo la percentuale narrativa.

## Build e prove

Candidata31, versione0.52, revisione locale `48a5680a562e543e`. I380file runtime e i323file del banco congelati sono rimasti invariati durante la suite finale. Rapporti esterni conservati in `outputs/chapter052`, con build, fixture e immagini separati. Il riferimento CRLF/LF degli strumenti è normalizzato senza cambiare le azioni registrate.

- `deep-release31-final/report.json`:47/47fasi PASS,1189test Node e37Python,937263ms complessivi delle fasi. Tutti i capitoli precedenti, controlli mobile, avversari, checkpoint, stress e builder inclusi. Nessun test saltato.
- GitHub Actions [43191043174](https://github.com/kazael96/soffiolieve-hd2d/actions/runs/43191043174):47/47fasi PASS sul commit `e81febfd707c1ff097387885d859942a2e176519`; artifact e log conservati. La revisione Linux `702cbedf672e3d81` differisce per gli hash dei sorgenti con terminatori nativi; la pubblicazione richiede il confronto del payload effettivamente servito.
- `browser-release31-core`:21/21combinazioni,7casi nei tre formati1280×720,390×844,844×390;114PNG tutti rivisti. Comprende cammino reale214→136→146 e ritorno, servizi/input, itinerari/scivolate NPC, Interpoké, camera in tre luoghi, Calcio, medicine e MasterBall con registrazione/salvataggio.
- `matrix31-aggregate.json`:9/9combinazioni,573nuove coppie per formato,35460campioni renderizzati;741PNG rivisti nei63contatti. Desktop/verticale provengono da `browser-release31-matrix-corrected`, fixture `bdb4714002a49cb3`; orizzontale da `browser-release31-matrix-landscape-native`, fixture `2852d52e2d34ed28`. Entrambi i lati, impatto/mancato bersaglio e recupero campionati. Non sono tutti i fotogrammi e gli stati possibili.
- La matrice completa conserva3987coppie/137record,573nuove e0precedenti perse. `league-moves` verifica2028112campioni numerici: prova distinta dai pixel.
- Pacchetto cattura:221PNG/158620byte confrontati byte per byte con gli originali;18regressioni mirate PASS. La cattura prepara soltanto la Ball scelta; l'annullamento invalida le continuazioni della vecchia sessione.

I replay precedenti invariati di attraversamento della palestra, stagioni, fondali geografici e riunione sul Percorso10 restano riferimenti con revisione e perimetro nei rispettivi inventari. Non sostituiscono le prove nuove sopra.

## Errori conservati e correzioni del banco

La prima CI falliva su hash CRLF/LF e import anticipato di NumPy; regressioni e suite remota ripetute dopo le correzioni. Il primo browser31 restava sulla prima scheda Pokédex perché la fixture non premeva Continua. La matrice originale resta complessivamente FAIL: tre fotogrammi orizzontali nativi scuri/monocromatici non superavano la quota cromatica fissa. Il controllo mantiene il precedente criterio e usa un secondo criterio di dettaglio soltanto con comandi nativi espliciti di sfondo/tint/visibilità, respingendo immagini vuote, trasparenti e uniformi. Il replay mirato e le regressioni positive/negative sono distinti dal rapporto fallito. Nessuna risorsa o animazione runtime è stata cambiata per far passare queste fixture.

## Limiti dichiarati

Chrome155 headless isolato, ANGLE SwiftShader; nessun controllo del PC o browser personale. Nessuna certificazione di GPU Android fisica, nessun confronto udibile con il DS e nessuna dichiarazione di assenza assoluta di bug. Gli sfondi sono adattamenti geografici HD-2D da materiali originali, con tagli scenografici finiti documentati. L'amicizia aggiuntiva della ChicBall e le pietre108/109 restano limiti aperti espliciti; non diventano complete dalla sola presenza degli strumenti nei cataloghi. Il rilascio non è certificato dal solo merge: controllare Pages e il codice realmente servito.
