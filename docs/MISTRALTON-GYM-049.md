# Palestra Rafan: pulsanti e ingressi riservati · 0.49

La ROM IRBI contiene26 background in97:24 copie dei dodici pulsanti dei sei ascensori, alle rispettive due quote, più i due pulsanti della piattaforma principale. Il programma194 controlla i flag10–15 prima di400; il pulsante SU al limite superiore risponde con il messaggio7 e non avvia una corsa. La fixture precedente selezionava proprio SU18,24, aspettandosi invece una discesa.

|Ascensore|SU: X,Z/script|GIÙ: X,Z/script|Quote|
|---|---|---|---|
|0|18,24/2|22,24/3|50,40|
|1|18,20/4|22,20/5|40,50|
|2|8,24/6|12,24/7|40,30|
|3|13,24/8|17,24/9|30,40|
|4|8,20/10|12,20/11|30,50|
|5|14,20/12|16,20/13|50,−59|

`qaGym049` preme undici pulsanti con A e camminate continue, comprese tre chiamate di piattaforme vuote. Il percorso conserva tutti gli attori e le collisioni delle passerelle. Per chiamare3 da ovest il giocatore supera di poco il centro del precedente pulsante di2, prima di rivolgersi a est; questo impedisce di riselezionare il pulsante più vicino. Nessun comando del controller o riposizionamento viene usato durante il puzzle. La prova narrativa del Capopalestra resta separata.

La sola preparazione cache usa waypoint indipendenti:98 dichiara quota0 e97 quota50. `changeZone` conserva la quota esplicita corrente; non deve dedurne una nuova da un salto della fixture. Il vero196 nell'anticamera contiene `[97,17,50,25,0]` e assegna50 prima del cambio di zona. La preparazione posta usa99/9,18, davanti al commesso7 oltre il bancone D4 a10,18; il precedente10,18 era dentro il bancone bloccato.

## RTReserveScript

L'inventario di tutti i programmi estratti e raggiungibili fino049 contiene soltanto questi tre casi:

|Sorgente|Riserva, numerata da1|Destinazione|
|---|---|---|
|196:83, anticamera|15|194, entry14:394 inizializza55;401(0) scende fino50|
|194:1452, piattaforma principale|2|196, entry1:395 inizializza−5;402(0) risale fino0|
|778:2211, partenza con gli amici|1|634, entry0; conserva il trasferimento speciale esistente e il dono di cinque Poké Ball|

L'host ora termina il VM sorgente, esegue una sola volta la riserva nel programma della mappa di destinazione e mantiene la stessa promessa e il blocco input. Consuma la riserva prima dell'attesa, controlla gli indici e limita eventuali catene. Non richiama l'evento originale. Il ramo778→634 resta quello precedente.

Nei due varchi verticali196 il campo resta completamente coperto durante cambio mappa e394/395. Dopo la preparazione della scena, il campo viene scoperto alla posa iniziale nativa55 o−5, prima di avviare la corsa continua401/402. La copertura è un adattamento HD-2D; evita un salto visibile50→55 o0→−5 e non altera le quote o la velocità native. Una risorsa ancora in attesa mantiene copertura e promessa; non riserva un altro evento e non sovrascrive il checkpoint completo.

L'interazione effettiva d'ingresso si trova davanti all'attore0 dell'anticamera:98/9,4 rivolto a nord verso9,3. Il ritorno si attiva da97/13,25 verso il pulsante SU13,24/script16. Il pulsante17,24/script17 è il limite inferiore della piattaforma principale.

## Prove eseguite

`mistralton-reserved.test.cjs` falliva prima della correzione con due mancate esecuzioni delle entry riservate; passava già il caso legacy. Ora passano quattro casi: inventario completo, ingresso/uscita tramite interazioni reali a×1/×2/×4 e ripristino del salvataggio completo, attesa delle risorse senza replay e legacy778→634 con dono unico.

Passano68 test mirati complessivi dei sei file `mistralton-reserved`, `mistralton-gym-route`, `mistralton-mail-fixture`, `mistralton-gym`, `mistralton-continuity` e `field-actor-exits`. Passano anche23 scenari di `check-mistralton-runtime.cjs` sul sorgente aggiornato: capitolo intero, doni, ripristino e sconfitte con Belle, Rafan e Plasma. Controlli di sintassi e diff senza errori.

Il nuovo controllo primario rilegge la ROM e confronta tutti26 background, attori/warps/trigger97/98/99 e tutti gli opcode estratti dei banchi194/196. Rapporti privati in `outputs/chapter049/gym/qa-native-rom-verification.json`, `reserved-script-inventory.json`, `reserved-baseline.json`, `reserved-regression.json`, `reserved-story-check.json` e `ante-warp-verification.json` nella cartella di lavoro superiore.

Queste sono prove CLI di sorgenti, VM, controller, geometria e persistenza. I nuovi esiti browser/CUA, pixel, viewport e pubblicazione devono essere registrati sulla candidata dal coordinatore; non sono dedotti da questi test.
