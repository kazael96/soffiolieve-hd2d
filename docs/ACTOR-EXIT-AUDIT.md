# Audit delle rimozioni attori: programmi IRBI della demo

Inventario verificato su `src/original-events.js` e sul relativo host
`src/original-story.js`, 27 ottobre2026. Nessuna modifica runtime in questo
audit. Le coordinate seguenti sono **celle native X,Z**, non coordinate del
renderer. Conversione attuale: X+.5−origineX, Z+.5−origineZ; origine784,752
per zone389/317 e16,16 per gli interni.

Sono presenti **18 istruzioni ActorDelete**, delle quali17 riguardano
personaggi e una l'oggetto Regalo. **Cinque sequenze** contengono movimento69;
tutte precedono anche un ActorDelete del medesimo personaggio. Non sono
cinque uscite ulteriori da contare separatamente. Nessun altro banco estratto
contiene ActorDelete o movimento69.

Le posizioni finali sono somma delle traslazioni contenute nei programmi:
12/16/76=nord,13/17/77=sud,14/18/78=ovest,15/19/79=est;8..11 sono passi
lenti nelle medesime direzioni. Rotazioni, pause ed emote non traslano.
Le posizioni presuppongono la normale progressione della storia: i casi
dipendenti da override di inizializzazione sono indicati esplicitamente.

## Esterni: tutti i punti di rimozione

| Zona | Banco / entry | PC Delete | UID / persona | Posizione iniziale pertinente | Percorso nativo pertinente | Punto finale | Direzione dell'ultima uscita |
| --- | --- | --- | --- | --- | --- | --- | --- |
|389|778 /15|409|3 Belle|(781,751), override di syncActors con16511=1|mov432: sud6|(781,757)|sud|
|389|778 /2|582|4 Komor|(777,741), record zona|mov672: nord1,69|(777,740)|nord, porta laboratorio|
|389|778 /2|586|3 Belle|(776,741), record zona|mov684: est1,nord1,69|(777,740)|nord, porta laboratorio|
|389|778 /11|1122|5 Mamma|(777,744), record zona|1340:nord1;1348:ovest1;1360:est2;1372:sud1;1388:ovest1;1400:sud6|(777,750)|sud|
|389|778 /11|1221|4 Komor|(777,740), ActorSetGPos825;1300 porta a776,742|1408:nord1,est10|(786,741)|est|
|389|778 /11|1225|3 Belle|(777,740), ActorSetGPos772;1284 porta a778,742|1420:est9|(787,742)|est|
|317|634 /0|301|2 Aralia|(788,724), record zona|684:nord3;692:sud2;720:nord12|(788,711)|nord|
|317|634 /0|564|250 Komor|(787,726), conservato dal banco778/13|676:nord1;780:nord9|(787,716)|nord|
|317|634 /0|568|240 Belle|(789,726), conservata dal banco778/13|676:nord1;788:nord9|(789,716)|nord|
|317|634 /4|1634|3 Komor|(792,680), record zona|1792:nord4;1804:nord8|(792,668)|nord|
|317|634 /4|1638|4 Belle|(790,676), record zona|1804:nord8|(790,668)|nord|

I UID **non identificano la stessa persona fra zone**: in389 UID3=Belle,
UID4=Komor; in317 UID3=Komor,UID4=Belle. I temporanei250=Komor e240=Belle
sono creati in389 quando16512=2, rispettivamente a787,736 e789,736. Il banco
778/13 li porta entrambi a Z726: sequenze2356/2364 nord4,2380/2388 nord6.
Il trasferimento al tutorial conserva gli stessi oggetti prima di634/0.

Per gli esterni il solo dato originale verificato è la direzione e il punto
finale sopra. I programmi non prescrivono un ulteriore percorso web né una
destinazione dopo Delete. Un prolungamento verso il bordo coerente è quindi
un adattamento HD-2D autorizzato, da provare contro la visibilità effettiva.
Non dichiarare originali le eventuali celle aggiunte. In particolare Mamma
termina a777,750: **non raggiunge la porta di casa** nel programma nativo;
un ritorno alla casa richiederebbe un percorso aggiuntivo, non documentato qui.

Nel tutorial Aralia parte dopo la dimostrazione di cattura; i due amici
partono dopo il confronto/dialogo successivo. Nel confronto delle catture
634/4 Komor e Belle vanno verso nord. I record di317 hanno flag515 per
entrambi; il programma lo imposta subito dopo le due rimozioni.

## Interni: scala e porte

| Zona / stanza | Banco / entry | PC Delete | UID / persona | Prima della sequenza di uscita | Sequenza finale | Punto finale | Uscita coerente verificata |
| --- | --- | --- | --- | --- | --- | --- | --- |
|391 camera Alcide|782 /8|1726|0 Komor|(6,6)|1868:est2,nord4,est1,69|(9,2)|scala, warp della camera verso390|
|391 camera Alcide|782 /8|1730|1 Belle|(5,4)|1888:pausa,est3,nord2,est1,69|(9,2)|stessa scala|
|390 casa Alcide|780 /0|304|2 Komor|(3,5)|664:est1,sud3,est2,sud2,69|(6,10)|porta d'ingresso larga, warp verso389|
|390 casa Alcide|780 /0|308|1 Belle|(4,4)|688:sud4,est2,sud2|(6,10)|stessa porta|
|392 casa Belle|784 /2|245|2 Belle|(6,6)|328:est1,sud3,ovest1,sud1|(6,10)|porta d'ingresso larga, warp verso389|
|396 laboratorio|792 /0|858|0 Aralia|(4,4)|1308:sud2;1336:sud5|(4,11)|porta d'ingresso larga, warp verso389|

Provenienza delle posizioni prima dell'uscita:

- Camera: ActorSetGPos917 pone Komor a5,4;1828 lo sposta sud2,1856 est1.
  ActorSetGPos905 pone Belle a6,7;1788 nord1,1840 nord2/ovest1. Tutti gli esiti
  delle lotte convergono sulle medesime sequenze di uscita.
- Casa Alcide: record Komor4,5;652 ovest1. Record Belle3,4;644 est1.
- Casa Belle: init784/3 pone Belle6,4 quando16504=0;308 la sposta sud2.
  Questa condizione appartiene alla prima visita prevista dalla storia.
- Laboratorio: record Aralia4,5;1236 ha traslazione netta zero;1284 nord1.

La scala della camera è il warp a X152/16=9.5,Z40/16=2.5.
Le porte delle due case sono warp larghi3 a X88/16=5.5,Z168/16=10.5;
il laboratorio a X56/16=3.5,Z184/16=11.5, largo3. I finali6,10 e4,11 sono
quindi coerenti con le rispettive aperture. Il dato del warp **non prova**
che il corpo del personaggio sia occultato nella camera HD-2D: deve essere
verificato nel rendering prima di applicare hidden/Delete.

La diciottesima rimozione è782/8 PC1083, UID2 Regalo, modello208, record5,8.
È l'oggetto consumato dopo la selezione starter: distinguerlo dai personaggi
evita di forzargli un inesistente percorso verso la scala.

## Movimento69: tutti i call site

| Banco / entry | ActorCmdExec PC | UID | Offset sequenza | Delete successivo |
| --- | --- | --- | --- | --- |
|778 /2|515|4 Komor|672|582|
|778 /2|523|3 Belle|684|586|
|780 /0|282|2 Komor|664|304|
|782 /8|1682|0 Komor|1868|1726|
|782 /8|1704|1 Belle|1888|1730|

Al momento dell'audit `tickMotions` applica69 con `n.hidden=true` e durata
1/30; ActorDelete esegue immediatamente splice. Entrambi i punti richiedono
la stessa garanzia di uscita. Ritardare solamente Delete lascerebbe ancora
la sparizione visibile causata da69.

## Ricostruzione, salvataggi e cambi di scena

Percorsi effettivamente presenti nell'host, da coprire oltre ai Delete:

1. `syncActors()` svuota tutto `npcs` e ricrea dai record, filtrando i flag.
   I personaggi assenti dai dati/flag cambiano senza usare ActorDelete.
   Successivamente applica posizioni salvate, poi override e temporanei;
   chiamarlo su campo scoperto può produrre sparizioni, ricomparse o salti.
2. I flag delle rimozioni sono spesso impostati **dopo** Delete. Aralia
   tutorial riceve508 solo dopo la partenza degli amici; i due amici della
   camera500/501 solo dopo entrambi i Delete; casaAlcide535 più avanti nel
   dialogo. Una ricostruzione intermedia potrebbe risuscitare attori se
   considera solo i flag e ignora lo stato dell'uscita in corso.
3. `captureActors` salva l'array attuale e una copia dei flag. `syncActors`
   riapplica un precedente record solo con la sua condizione sui flag
   `actorFlags`. Un attore flaggato in precedenza e poi riabilitato deve
   partire dal record nativo, non da una vecchia posizione di uscita.
4. In389 `syncActors`, con16511=1, sovrascrive Belle UID3 a781,751 anche
   dopo aver caricato il salvataggio. Con16512=2 crea sempre i temporanei
   250/240 a787,736 e789,736: non ripristina automaticamente il loro percorso
   dinamico se vengono ricostruiti durante la sequenza.
5. Fra778/13 e634/0, `run` cambia solo `native.zone` a317, cancella il saved
   array317, chiama `syncActors`, poi riaggiunge i due temporanei conservati.
   Non è un cambio di scena coperto da fade. Gli altri NPC del vecchio elenco
   vengono sostituiti immediatamente. È un punto specifico di audit visivo.
6. `changeZone` cattura gli attori, modifica la zona, chiamaJourney.setScene
   (che a sua volta può chiamare syncActors), poi richiama syncActors
   esplicitamente. La sicurezza dipende dal campo interamente coperto durante
   queste ricostruzioni. Il fade dei trasferimenti va verificato, non assunto.
7. All'avvio vengono chiamati initialize/syncActors/applyRoom; il checkpoint
   precedente all'evento permette di ritentarlo dopo errore. Il caricamento
   non deve mostrare un attore a metà uscita e poi riposizionarlo scoperto.

Questo audit inventaria dati e rischi del codice. Non certifica nuove uscite,
occlusione GPU o correttezza con camera/zoom: sono verifiche dell'implementazione
che segue. Nessuna coordinata aggiuntiva di uscita è spacciata per dato ROM.
