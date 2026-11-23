# Colpocoda di Emboar e Samurott · nuova implementazione064

Questa implementazione è nuova. Il precedente pilot privato non è stato
recuperato: i suoi vecchi13PASS non certificano questi file.

`src/tail-whip-moves.js` modifica esclusivamente i due profili500–39 e503–39,
mantenendo126fotogrammi, impatto60, effetto nativo, bersaglio e natura di
mossa di stato. Il nuovo tipo esclude l'arco fisico generico; le funzioni di
disegno, la sequenza nativa di effetti/audio e il simulatore restano delegati.
Le due curve della coda sono coreografie HD-2D originali, non movimenti
estratti dalla ROM.

Il modulo va caricato dopo `emboar-moves.js`, prima di `unfezant-moves.js`
e `emboar-contact-moves.js`. Una prima installazione tardiva è rifiutata;
ripetere una installazione già corretta è innocuo. La prevalidazione dei
profili e delle proprietà precede ogni mutazione. Il selettore conserva la
stessa tabella e la stessa funzione; `SpeciesMoves.pose/sample` conservano
le identità originali. I campionatori lessicali effettivi Chapter/Demo sono
avvolti dopo i rispettivi adattamenti generici.

Entrambe le banche native devono essere preparate prima di campionare.
La preparazione delega quella precedente, attende `ROM_SPRITE_ANIM.prepare`
senza un secondo gate e propaga errori e tentativi successivi. Il contratto
controlla immagine, dimensioni, bounds, disponibilità, sequenze presenti,
parent0 con affine identità, posizione del pezzo, CEL e affine locale.
Emboar delega la sua anatomia reale; Samurott articola soltanto la pinna
front28/CEL28 e back8/CEL8. I vecchi indici degli arti non vengono riutilizzati.

## Verifiche riproducibili

Eseguire con Node e `SOFFIOLIEVE_TEST_SITE` puntato a una build contenente i
quattro asset originali500/503 front/back:

```text
node --test --test-isolation=none tests/tail-whip064.test.cjs
```

La suite usa JSON/PNG nativi verificati mediante SHA256 e bounds opachi
calcolati indipendentemente dai pixel. Le immagini nei cache host sono
descrittori CPU dichiarati: non sono immagini DOM decodificate.

I15test coprono i difetti riprodotti prima della modifica (avanzamento e
arco da mossa fisica, arti errati di Samurott),1016pose dell'attaccante su
tutti127fotogrammi, entrambi i lati e successo/mancato colpo, campionamento
diretto Chapter/Demo e difensore, giunti Emboar, pinna Samurott, delega delle
altre mosse, caricamento/retry, dati corrotti, installazione atomica e ordine.
Il simulatore GEN5 reale controlla PS invariati, consumo PP, riduzione della
Difesa e log invariati per entrambi i lati. Il vero modulo Contact205 conserva
il controllo dei proprietari e rifiuta una successiva sostituzione di `part`.

Questi sono controlli CPU di sorgenti, integrazione e meccaniche. Non
certificano resa grafica, sovrapposizioni, naturalezza, audio udibile o qualità
estetica: servono nuovi replay della candidata nei tre formati, osservati
effettivamente, prima di attribuire una approvazione visiva o pubblicare.

## Ritmo e verifica successiva

Il primo replay della candidata05 nel formato telefono390×844, con comandi
reali nel browser isolato e audio attivo,
ha saltato la finestra di rilascio di Samurott/P1 anche a×1. Il rapporto rimane
FAIL; le15 immagini disponibili non approvano la fase assente. La correzione
conserva i landmark delle due curve e richiede il disegno completo dell'arena
prima di superarli, secondo il protocollo di presentazione già usato da
Rotolamento, Vortexpalla e Raffica. Non vengono allargate le finestre del test.

Colpocoda usa due voci native1527 sul Pokémon attaccante. I dati originali
sono88 frame, senza ancora di impatto; la mappatura già presente del profilo
porta gli inizi a60 e86,25. Le finestre native0–35 e35–88, la scelta del clip,
la velocità e il PCM restano espliciti nel contratto. Il medesimo clip
`105850eb7a4f14a8555e.flac`,17432byte, ha SHA256
`440c9fb0bae7249539add260fc1c5a273cead539aaf8456d1f55b2b56a6b59b3`.
Il trasporto conserva la finestra relativa di ciascuna voce dopo l'inizio
confermato dal disegno; non confronta all'ascolto il browser con il DS.

Le quattro reference corporee complete della candidata05 hanno nuovi readback:
508 pose in32 tavole, lette tutte da un revisore indipendente. Nei campioni
non risultano parti staccate o tagli al bordo; recupero e riposo hanno pixel
corporei identici. Il controgesto di testa e braccia di Emboar è molto sottile.
Questo giudizio non certifica il ritmo dei comandi: il clock corretto e gli
avversari di specie diverse richiedono i propri replay della nuova candidata.

La candidata corrente è07 `85b98d70e88848df`. Il controller riconosce gli attaccanti
500/503 con profilo di stato verificato contro qualunque avversario nativo
visibile e invariato nella lotta singola. Questa estensione non amplia il
modello di contatto205/360 né approva doppie, stati alterati graficamente o
le nuove immagini per deduzione. Lo stato della suite completa e dei replay
è mantenuto in [ANIMATION-RESUME-064.md](ANIMATION-RESUME-064.md).
