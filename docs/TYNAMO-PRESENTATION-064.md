# Ritmo delle quattro mosse di Tynamo · 064

La prova effettiva della candidata06 nel formato telefono390×844 a×4 ha saltato la finestra
di impatto di Scintilla/P2 e quella iniziale di P1. Il rapporto resta FAIL,
con16 immagini di battaglia e una schermata d'errore lette separatamente.
Le immagini presenti conservano la sagoma nell'arena; non approvano i gesti
assenti. La candidata05 aveva superato i quattro turni soltanto a×1.

Il controller di presentazione ora comprende602–33/86/209/451: Azione,
Tuononda, Scintilla e Raggioscossa. Conserva i landmark del movimento
già implementato, l'impatto, il recupero e gli inizi dei suoni. Il fotogramma
avanza dopo il disegno nativo riuscito di entrambi gli attori e la conferma
dell'arena completa. Un dispositivo lento può prolungare il gesto; il test
non allarga le sue finestre e non sostituisce le pose realmente disegnate.

Questa modifica non aggiunge una nuova anatomia né una nuova coreografia.
In particolare il pezzo posteriore di Tynamo che contiene il pesce intero
non diventa una coda separata. Il dimensionamento e i suoi limiti sono
descritti in [TYNAMO-FRAMING-064.md](TYNAMO-FRAMING-064.md).

| Mossa | Durata nativa | Ancora | Voci native |
| --- | ---: | ---: | ---: |
| Azione33 | 72 | 24 | 3 |
| Tuononda86 | 205 | 53 | 2 |
| Scintilla209 | 245 | 193 | 5 |
| Raggioscossa451 | 194 | 0 | 3 |

I quattro programmi hanno una sola variante ROM ciascuno, con piano audio
P2 esplicito. I21 file FLAC originali comprendono le versioni lente e i clip
laterali distinti di Raggioscossa. Pitch, volume e pan già incorporati nei clip
restano conservati. Le voci451 sono associate all'attaccante: non viene
inventato un suono d'impatto sul bersaglio. Il controller richiede i dati e
la ricetta602 riconosciuti, due attori nativi visibili e preparati, in una
lotta singola. Le restrizioni precedenti di Emboar e Raffica restano proprie
dei rispettivi contratti; doppie e stati grafici alterati non sono certificati.

Le regressioni nuove usano MoveFX e AudioEngine originali con orologio,
contesti audio e proprietari CPU dichiarati.192 combinazioni del controller
coprono le quattro mosse, due lati, quattro specie avversarie, tre velocità
e successo/mancato bersaglio.96 combinazioni audio controllano parametri,
clip e omissioni sul miss. Il gruppo finale di sette file passa94 test, con
picco RSS osservato380,55MiB nel processo dedicato; il campionamento nominale
è100ms, non una prova del picco assoluto o di un telefono fisico.

Contratti, log completi e misure sono in
`outputs/animation-review064-resume-20261123/tynamo-presentation-c7`.
Queste prove non sostituiscono i nuovi replay della candidata congelata,
la lettura delle immagini, la suite completa o la verifica della pubblicazione.
Nessun confronto audio all'ascolto è implicito.

Il codice descritto è nella candidata07 congelata `85b98d70e88848df`. Il nuovo
collaudo non è il replay fallito della06: deve produrre ricevute, immagini
lette e risultati propri. Per la suite r2 ancora in corso e la PR in bozza
consultare [ANIMATION-RESUME-064.md](ANIMATION-RESUME-064.md); non viene
anticipato un PASS completo o una pubblicazione.
