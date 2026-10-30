# Percorso 3 → Zefiropoli · 0.42

Perimetro: dopo il Fumonirico e il C-Gear offline, Percorso 3, asilo, Pensione con un posto, prima area della Grotta Minerale, varco e arrivo a Zefiropoli. Comprende l'incontro con N davanti al Museo e il Centro Pokémon. Museo, palestra di Aloe, case secondarie di Zefiropoli, Bosco Girandola, Surf e piano inferiore della grotta appartengono ai capitoli successivi. Gli accessi oltre il perimetro mostrano il limite della demo. Il limite di allenamento resta 15; salvataggi con livelli superiori non vengono abbassati.

## Fonte e inventario

ROM italiana IRBI dell'utente, non distribuita. `tools/extract-route3.py` esporta geometrie, texture, attori, messaggi e programmi delle zone 321/322/323/324/27/16/20. Sono 49 modelli, 328 texture e 40 modelli di attori referenziati; il modello dinamico della Pensione non è una billboard e non viene sostituito con una figura inventata. `route3-opcodes.json` registra indirizzi e letture degli operandi verificati negli overlay 10/21. I comandi non implementati continuano a fallire esplicitamente.

`extract-route3-data.py` legge squadre, IV/natura/abilità/strumenti, incontri normali e nell'erba scura, crescita, EV e compatibilità con MT46/MT83/MN01. Il lettore dipende solo dalla ROM e dall'output degli eventi del medesimo estrattore. Allenatore Carmelo e strumenti oltre l'acqua restano nei dati originali ma non sono raggiungibili a piedi: il comportamento acqua 61 è bloccato finché non sarà disponibile Surf. Non vengono portati a livello 15 o spostati sul percorso accessibile.

| Sequenza | Stato / attori / destinazione |
| --- | --- |
| Ami e Mimi | Due Purrloin al 10; richiedono due Pokémon in grado di lottare; variabile 16510 da 0 a 1 |
| Komor e inseguimento | Squadra originale al 12/14, Baccarancia; variabile 16533 da 0 a 1. Komor attraversa il percorso verso l'attore 22 davanti alla grotta; i seguaci entrano dalla stessa imboccatura |
| Belle e bambina | Posizioni e dialoghi condizionati da 16533; attendono il recupero del Pokémon, poi partono attraverso il varco verso Zefiropoli |
| Grotta Minerale | Primo seguace 294, poi lotta con quattro allenatori: alleato Komor 56/57/58, avversari 62 e 63. Dopo il recupero, Komor esce verso la spiegazione dell'erba scura sul Percorso 3; variabile 16533 a 4 |
| Ricompensa e spiegazione | Tre Cura Ball dalla bambina; 16533 a 5. Komor spiega l'erba scura, 16510 a 2, poi passa dal varco per il suo prossimo incontro |
| Arrivo a Zefiropoli | Komor viene collocato dall'inizializzazione originale davanti all'ingresso orientale; regala tre Baccastagna, 16530 a 1. Raggiunge e conserva la successiva posizione presso il Museo |
| N | Squadra Pidove/Tympole/Timburr al 13; vittoria porta 16530 a 2; N esce verso il Bosco Girandola |
| Centro | Infermiera, negozi e checkpoint della zona 20; sconfitta successiva riporta a questo Centro |

Le uscite usano `field-actor-exits.js`: percorsi sulle celle valide, imboccature effettive, residenti per i prossimi incontri e rimozione soltanto dopo invisibilità verificata. Un trasferimento tramite porta mantiene il campo coperto. Le prove devono distinguere conclusione dello script e reale arrivo del corpo; il test della variabile da solo non certifica il percorso visivo.

## Incontri e lotte

Nuove specie ottenibili: Pidove e Blitzle sul Percorso 3, Roggenrola e Woobat nella Grotta Minerale. Le tabelle originali mantengono pesi, livelli e frequenza; l'erba scura usa una tabella separata. L'overlay 21, `0x021a935e..0x021a937a`, abilita il secondo incontro con almeno due Pokémon sani e `floor(RandomLC(65535)/656) < 40`. I due incontri vengono filtrati separatamente dal Repellente.

Il motore ROM Gen V usa formati doubles e multi reali. Komor è il giocatore p3 e il secondo seguace p4, con squadre autonome, abilità, strumenti, riserve e PP. Gli slot originali sono p1a/p2a/p3b/p4b: la presentazione li associa alle quattro posizioni senza aggiungere Komor alla squadra del giocatore. La selezione comprende il bersaglio e il secondo comando; B permette di rivedere la prima scelta. Gli avversari non scelgono casualmente il proprio alleato come bersaglio di Azione.

Non si può lanciare una Ball finché restano due selvatici. La Cura Ball usa le celle originali `a/0/9/5:157/158`, moltiplicatore ordinario e recupero di PS/PP/stato alla cattura. Il calcolo dell'erba scura scala il numeratore PS prima del tasso di cattura e del bonus Ball: coefficienti fx32 1229/2048/2867/3277/3686/4096 ai confini delle specie catturate 30/150/300/450/600, verificati nell'overlay 93 `0x021cbbf4..0x021cbc48`. La cattura normale conserva i calcoli precedenti.

La Pensione conserva un Pokémon, guadagna un punto esperienza per passo effettivo entro il limite 15, impara le nuove mosse sostituendo le più vecchie, non evolve e costa 100 più 100 per livello guadagnato. Il deposito dello starter è compatibile con il salvataggio. Il secondo posto e l'allevamento non sono sbloccati in questo capitolo. I testi di questo servizio sono un adattamento italiano del porting; non sono dichiarati trascrizioni dei messaggi del servizio globale DS.

## Presentazione e adattamenti

Fondali espliciti: Percorso 3 normale, erba scura, Grotta Minerale, Zefiropoli. Il contesto resta fissato all'avvio. Per la grotta l'arena ha un piano livellato con il materiale originale `d0yuka_001`, pareti `d0gake_001` e geometria distante; i dislivelli della mappa esplorabile non devono attraversare i combattenti. È una messa in scena HD-2D, non la geometria di una battaglia DS ricopiata letteralmente. Pokémon ambientali: Pidove/Blitzle/Patrat sul percorso, Roggenrola/Woobat nella grotta; nessun selvatico inventato nella città.

Nuovi brani originali renderizzati dal driver DS: 1027, 1078, 1087; gli altri richiesti erano già nel catalogo. Lotte di Komor, Plasma e N selezionano i rispettivi temi. Icone e Pokédex comprendono le sei nuove specie viste o catturabili; le palette delle icone sono controllate visivamente, non dichiarate estratte da un selettore generale portato.

Coreografie e limiti della verifica: [SPECIES-MOVES-042.md](SPECIES-MOVES-042.md). [QA-042.md](QA-042.md) registra 224 test Node, 4 Python e tutte le 15 fasi CLI superate sulla build finale; i controlli browser finali restano incompleti e bloccano la pubblicazione.
