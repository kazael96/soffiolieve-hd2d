# Percorso, tempi e animazioni avversarie 0.34

## Aralia

L’uscita generica degli NPC esterni puntava verso nord. Aralia ha ora un percorso esplicito fino alla porta del laboratorio, apertura della porta, attraversamento con ritaglio e due riscontri di invisibilità prima della rimozione. Il viaggio continua in parallelo ai dialoghi e non trattiene lo script fino al termine del tragitto. I vecchi salvataggi che conservano Aralia su una rotta verso nord o ferma alla fine di essa vengono ripianificati dalla posizione salvata, senza teletrasporto e senza ricominciare la demo.

Il controllo delle porte può usare un riscontro grafico durante una panoramica quando il personaggio ha un piano di ritaglio del portale. Posa e visuale devono comunque coincidere esattamente con quelle renderizzate. Le uscite libere all’aperto mantengono il vincolo precedente sulla camera.

## Attese

- La ricerca del percorso usa A* e conserva collisioni e limite di lavoro. Su un percorso libero di 88 celle, il vecchio algoritmo controllava 12.311 vicini e raggiungeva solo 77 celle prima del limite; il nuovo ne controlla 265 e raggiunge tutte le 88 celle. Questo riduce il lavoro sincrono all’avvio delle uscite.
- Il vecchio accumulatore scartava il tempo oltre 40 ms per fotogramma, rallentando le azioni sotto 25 fps. Ora recupera fino a 250 ms per fotogramma, in sottopassi di massimo 40 ms, con un limite di 25 sottopassi a ×4. Il ritorno da una scheda nascosta azzera il riferimento temporale e l’input.
- Gli effetti sonori del campo seguono ×1/×2/×4 e un cambio di velocità aggiorna quelli già in corso. La musica mantiene il proprio tempo. I suoni del banco della scena vengono preparati in anticipo quando l’audio è attivo, senza attenderli prima di eseguire lo script.
- Il rilevamento dell’audio sospeso usa intervalli di 250 ms, evitando l’attesa precedente fino a due secondi. Le dissolvenze CSS seguono la velocità attiva al loro avvio.

## Lotte

L’instradamento delle animazioni usa la specie del combattente che agisce, con identificativi di entrambi i lati disponibili anche ai chiamanti che non li forniscono esplicitamente. Non vengono modificati mosse scelte dall’IA, danni, PP o regole. I profili specifici erano già disponibili nelle anteprime; ora la copertura comprende una regressione dei log di lotta reali per tutte le 19 coppie su entrambi i lati (38 percorsi), fino al campionamento della coreografia del corpo. Pazienza conserva le proprie fasi.

La diagnostica DOM della scena di lotta include specie, profilo e lato dell’attaccante per distinguere la coreografia personalizzata da un effetto generico; non viene aggiunto un HUD al gioco.

## Verifiche e limiti

Test automatici: rientro non bloccante di Aralia, migrazione delle rotte vecchie, nessuna rimozione prima della porta, percorso completo e lavoro limitato, tempo simulato a basso framerate, velocità degli effetti del campo, riscontri grafici coerenti durante panoramiche. Regole permanenti e matrice delle 19 coppie entro il livello 10 conservate. Restano necessari riscontri su dispositivi reali per misurare le prestazioni della specifica GPU; non è una garanzia di assenza di qualunque pausa.

Verifica nel browser a 390×844: migrazione di Aralia da (4.5, −64.5), cammino fino al laboratorio e rimozione a (−6.5, −14.3) con ragione `rendered-invisible`; nessun errore nello stato della scena. Braciere di Tepig avversario verificato al fotogramma 65 con profilo `tepig-52`, specie 498 e attaccante `p2`. Le fixture sono isolate dai salvataggi dell’utente ed escluse dalla build pubblica.
