# Porte e gesti originali · 0.49

L’evento nativo192/8 richiede la porta della palestra tramite `BMCreateHandleByGPos(1,212,400)`. Il catalogo precedente non conteneva il figlio animato dell’edificio51 nel bundle8. `tools/extract-mistralton-doors.py` esporta sette modelli originali con quattordici animazioni da `a/2/2/9` bundle5/8/9 e texture `a/1/7/6`; otto riferimenti degli edifici conservano offset e rotazione originali. Gli ID ripetuti, in particolare259, restano separati per bundle. Le due animazioni di264 conservano lo scorrimento originale della texture BTA.

Il catalogo si registra dopo il caricamento differito del capitolo. Il renderer prepara soltanto i modelli richiesti dalla scena, prima di presentarla; un nuovo tentativo conserva quelli già caricati. Le sette regressioni di `tests/field-models.test.cjs` comprendono il selettore reale della porta di Rafan, la separazione degli ID, errore temporaneo, cache e geometria animata finita. Gli effetti sonori1669/1670/1671 erano già nel catalogo audio originale.

Il gesto di N nella Cava deriva dal modello103, tabella animazioni25, voce40, indirizzo IRBI021d73b8: celle3/12/13/15/14/13/3 mantenute per10/5/2/10/10/1/10 frame. `tools/extract-mistralton-gestures.py` verifica terminazione e hash della sequenza, esportata in `src/mistralton-gestures.js`; il movimento181 usa questi48 frame originali invece di un gesto inventato.

La ragnatela148 è un oggetto visivo, separato dalle uscite dei personaggi. Parte dalla cella0 e riproduce la sequenza nativa171 descritta in `MISTRALTON-PUZZLES-049.md`. Le apparizioni della Triade usano una copertura opaca dell’intero campo per rispettare lo standard delle sparizioni: adattamento HD-2D dichiarato, senza dissolvenza del personaggio visibile.

Le prove grafiche e narrative della candidata integrata sono registrate nel rapporto049; i controlli dei dati e della geometria qui descritti non certificano da soli i pixel nel browser o il confronto udibile.
