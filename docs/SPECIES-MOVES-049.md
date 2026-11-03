# Coppie Pokémon–mossa · 0.49

1760 coppie predisposte su 85 specie e forme, fino al livello35: learnset originali IRBI, mosse mantenute dalle preevoluzioni, macchine realmente disponibili nel capitolo e Scontro. Le849 coppie della0.48 sono conservate. L'inventario comprende l'intera tappa; il limite operativo resta31 prima della quinta medaglia e35 dopo, senza abbassare i vecchi salvataggi.

Lo stato è **implementato e verificato numericamente**. La sola estrazione non certifica l'ottenibilità: amicizia, fenomeni di erba/ombre e contenuti esclusi restano distinti nell'[inventario narrativo](DRIFTVEIL-MISTRALTON-049.md). Le21 nuove specie predisposte comprendono anche avversari e fenomeni; non sono tutte dichiarate catturabili. Il collaudo del capitolo nel browser e dei singoli effetti resta distinto dalle prove qui sotto.

Le fonti rese disponibili aggiungono MT78, strumento405, Battiterra523, compatibilità originale bit77; MN02, strumento421, Volo19, bit96. Sono inoltre acquistabili le quattro MT meteo di Ponentopoli:334→258,338→241,345→240,364→201, bit6/10/17/36. L’audit dei Market precedenti conserva anche le sette MT native di Sciroccopoli:348→218,354→216,400→86,401→360,343→113,347→219,360→115, bit20/26/72/73/15/19/32. Sono raccoglibili MT55/382/Idrovampata503 al Deposito Frigo e MT58/385/Cadutalibera507 a Ponentopoli, bit54/57. Idrovampata aggiunge10 coppie fra12 apprendenti; Cadutalibera non ha apprendenti nativi fra le85 righe e rifiuta correttamente l’apprendimento. Tutte le26 macchine predisposte hanno una fonte raggiungibile; non si importano assortimenti di città future. Archen non è compatibile con Volo nella ROM. La consulenza Introforza a Ponentopoli usa il bit9 nativo e gli IV, senza rendere disponibile la MT10/strumento337. La tabella `hiddenPowerCompatibility` copre le85 voci; Tynamo è l'unica incompatibile. Le tasche degli strumenti provengono dal word8 di a/0/2/4, bit7–9, e non vengono dedotte dal loro nome.

Deerling e Sawsbuck conservano forma0 primavera,1 estate,2 autunno,3 inverno. Le sei varianti hanno i graphic originali701–706 e le rispettive icone originali; i dati di lotta e i versi restano quelli della specie base. Le femmine di Unfezant e Frillish usano gli atlanti originali separati `521-female` e `592-female` su entrambi i lati. Il genere non aggiunge un learnset e non incrementa il conteggio delle coppie.

I gesti anatomici sono adattamenti HD-2D:21 rig individuali, gruppi delle parti originali di fronte/dorso, punti di bocca/mani/foglie/terreno e rami corporei distinti per quadrupedi, ali, flipper, tentacoli, zampe, ingranaggi e corpo allungato. Volo distingue preparazione e attacco; Ventagliente evita reazioni del bersaglio durante la preparazione. Salti, corna, rotazioni, polveri, raggi, radici, ragnatele e recupero mantengono gli effetti nativi e le regole del motore. Non sono sequenze scheletriche originali DS.

| Specie/forma | Specie · graphic | ID delle mosse |
| --- | --- | --- |
| Snivy | 495 | 33, 43, 22, 35, 74, 536, 73, 72, 21, 348, 489, 202, 165, 15, 447, 148, 259, 241, 218, 216, 113, 219, 115 |
| Servine | 496 | 33, 43, 22, 35, 74, 536, 73, 72, 21, 348, 165, 15, 447, 148, 259, 241, 218, 216, 113, 219, 115, 489, 202 |
| Tepig | 498 | 33, 39, 52, 316, 111, 488, 123, 205, 36, 535, 372, 53, 165, 447, 249, 241, 218, 216, 360 |
| Pignite | 499 | 33, 39, 52, 316, 111, 488, 292, 123, 205, 36, 535, 165, 526, 447, 249, 523, 241, 218, 216, 360, 372, 53 |
| Oshawott | 501 | 33, 39, 55, 346, 116, 534, 210, 352, 279, 453, 227, 401, 165, 15, 514, 447, 249, 91, 258, 240, 218, 216, 503 |
| Dewott | 502 | 33, 39, 55, 346, 116, 534, 210, 352, 279, 453, 165, 15, 514, 447, 249, 91, 258, 240, 218, 216, 503, 227, 401 |
| Patrat | 504 | 33, 43, 44, 117, 197, 28, 242, 95, 162, 495, 526, 158, 212, 226, 165, 15, 514, 447, 91, 241, 240, 218, 216 |
| Watchog | 505 | 33, 43, 44, 67, 117, 197, 28, 242, 95, 109, 162, 495, 244, 158, 165, 526, 15, 514, 447, 249, 148, 91, 241, 240, 218, 216, 86, 113, 212, 226 |
| Lillipup | 506 | 43, 33, 316, 44, 270, 36, 526, 242, 46, 514, 179, 165, 249, 91, 241, 240, 218, 216, 86 |
| Herdier | 507 | 43, 33, 316, 44, 270, 36, 526, 242, 46, 514, 165, 249, 91, 241, 240, 218, 216, 86, 179 |
| Purrloin | 509 | 10, 45, 274, 28, 154, 228, 259, 252, 468, 372, 163, 445, 165, 168, 15, 447, 241, 240, 218, 216, 86 |
| Liepard | 510 | 10, 45, 274, 28, 154, 228, 259, 252, 468, 372, 163, 165, 168, 15, 447, 249, 241, 240, 218, 216, 86, 445 |
| Pansage | 511 | 10, 43, 122, 22, 154, 73, 44, 402, 259, 374, 512, 447, 165, 168, 526, 15, 249, 148, 91, 241, 218, 216 |
| Pansear | 513 | 10, 43, 122, 510, 154, 281, 44, 481, 133, 374, 512, 126, 165, 168, 526, 15, 447, 249, 91, 259, 241, 218, 216 |
| Panpour | 515 | 10, 43, 122, 55, 154, 346, 44, 503, 269, 374, 512, 362, 165, 168, 526, 15, 447, 249, 91, 259, 258, 240, 218, 216 |
| Munna | 517 | 149, 111, 381, 281, 60, 286, 236, 95, 428, 485, 171, 248, 347, 165, 148, 259, 240, 218, 216, 86, 360, 113, 219, 115 |
| Musharna | 518 | 111, 381, 60, 95, 165, 148, 259, 240, 218, 216, 86, 360, 113, 219, 115, 149, 281, 286, 236, 428, 485, 171, 248, 347 |
| Pidove | 519 | 16, 45, 43, 98, 314, 355, 197, 269, 403, 13, 165, 526, 19, 241, 240, 218, 216 |
| Tranquill | 520 | 16, 45, 43, 98, 314, 355, 197, 269, 403, 165, 526, 19, 241, 240, 218, 216, 13 |
| Blitzle | 522 | 98, 39, 268, 351, 86, 488, 228, 209, 23, 435, 165, 148, 521, 240, 218, 216, 113 |
| Roggenrola | 524 | 33, 106, 28, 29, 350, 189, 334, 479, 157, 446, 201, 165, 249, 523, 218, 216 |
| Boldore | 525 | 33, 106, 28, 29, 350, 189, 334, 479, 408, 157, 165, 249, 523, 201, 218, 216, 446 |
| Woobat | 527 | 93, 316, 16, 372, 531, 286, 314, 213, 133, 347, 403, 165, 168, 148, 259, 19, 240, 218, 216, 86, 360, 113, 219, 115 |
| Swoobat | 528 | 93, 316, 16, 372, 531, 286, 314, 213, 133, 347, 403, 165, 168, 148, 259, 19, 240, 218, 216, 86, 360, 113, 219, 115 |
| Audino | 531 | 1, 45, 270, 287, 3, 213, 290, 494, 36, 505, 165, 526, 514, 447, 148, 91, 241, 240, 218, 216, 86, 113, 219, 115 |
| Timburr | 532 | 1, 43, 116, 117, 67, 88, 358, 498, 339, 157, 223, 165, 526, 514, 447, 249, 91, 241, 240, 218, 216 |
| Gurdurr | 533 | 1, 43, 116, 117, 67, 88, 358, 498, 339, 157, 165, 526, 514, 447, 249, 91, 241, 240, 218, 216, 223 |
| Tympole | 535 | 145, 45, 48, 496, 61, 341, 392, 253, 330, 240, 175, 165, 258, 218, 216, 503 |
| Palpitoad | 536 | 145, 45, 48, 496, 61, 341, 392, 253, 330, 240, 165, 249, 523, 258, 218, 216, 503, 175 |
| Throh | 538 | 20, 43, 117, 116, 69, 233, 279, 480, 34, 339, 165, 526, 514, 447, 249, 91, 523, 241, 240, 218, 216 |
| Sawk | 539 | 249, 43, 117, 116, 24, 490, 68, 2, 280, 339, 165, 526, 514, 447, 91, 523, 241, 240, 218, 216 |
| Sewaddle | 540 | 33, 81, 450, 75, 522, 203, 165, 15, 447, 148, 241, 218, 216, 113, 219 |
| Swadloon | 541 | 320, 33, 81, 450, 75, 182, 165, 15, 447, 522, 148, 241, 218, 216, 113, 219, 203 |
| Leavanny | 542 | 206, 33, 81, 450, 75, 522, 163, 270, 165, 15, 514, 447, 148, 241, 218, 216, 113, 219, 115, 320, 182, 203 |
| Venipede | 543 | 111, 205, 40, 103, 228, 182, 342, 450, 474, 97, 537, 165, 249, 522, 241, 218, 216, 360 |
| Whirlipede | 544 | 111, 205, 40, 103, 228, 182, 342, 334, 450, 474, 97, 165, 249, 522, 241, 218, 216, 360, 537 |
| Cottonee | 546 | 71, 74, 73, 78, 72, 178, 75, 77, 202, 204, 270, 412, 165, 447, 148, 241, 218, 216, 219 |
| Whimsicott | 547 | 74, 73, 72, 178, 16, 366, 165, 168, 447, 148, 241, 218, 216, 113, 219, 71, 78, 75, 77, 202, 204, 270, 412 |
| Petilil | 548 | 71, 74, 73, 79, 72, 235, 345, 78, 202, 312, 270, 412, 165, 15, 447, 148, 241, 218, 216, 219 |
| Sandile | 551 | 43, 99, 44, 28, 259, 328, 372, 189, 373, 207, 242, 91, 184, 165, 168, 15, 514, 523, 201, 218, 216 |
| Stoutland | 508 | 423, 424, 422, 43, 33, 316, 44, 270, 36, 526, 242, 46, 165, 514, 249, 91, 241, 240, 218, 216, 86, 179 |
| Simisage | 512 | 43, 122, 154, 402, 165, 168, 526, 15, 447, 249, 148, 91, 259, 241, 218, 216, 10, 22, 73, 44, 374, 512 |
| Simisear | 514 | 43, 122, 154, 481, 165, 168, 526, 15, 447, 249, 91, 259, 241, 218, 216, 10, 510, 281, 44, 133, 374, 512, 126 |
| Simipour | 516 | 43, 122, 154, 503, 165, 168, 526, 15, 447, 249, 91, 259, 258, 240, 218, 216, 10, 55, 346, 44, 269, 374, 512, 362 |
| Unfezant | 521 | 16, 45, 43, 98, 314, 355, 197, 269, 403, 165, 526, 19, 241, 240, 218, 216, 13 |
| Zebstrika | 523 | 98, 39, 268, 86, 351, 488, 228, 209, 23, 165, 249, 148, 521, 240, 218, 216, 113, 435 |
| Drilbur | 529 | 10, 300, 229, 189, 154, 232, 91, 468, 163, 157, 89, 165, 15, 249, 523, 201, 218, 216 |
| Excadrill | 530 | 10, 300, 229, 189, 154, 232, 91, 468, 163, 157, 32, 165, 15, 249, 523, 201, 218, 216, 89 |
| Scolipede | 545 | 224, 111, 205, 40, 103, 228, 182, 342, 450, 474, 226, 97, 165, 15, 249, 522, 91, 523, 241, 218, 216, 360, 334, 537 |
| Lilligant | 549 | 74, 73, 72, 235, 298, 483, 165, 15, 447, 148, 241, 218, 216, 113, 219 |
| Basculin | 550 | 33, 55, 253, 29, 44, 453, 498, 36, 242, 401, 487, 165, 15, 258, 240, 218, 216, 503 |
| Krokorok | 552 | 43, 99, 44, 28, 259, 328, 372, 189, 373, 207, 242, 91, 165, 168, 15, 514, 447, 249, 523, 201, 218, 216, 184 |
| Darumaka | 554 | 33, 205, 510, 99, 424, 29, 253, 263, 7, 526, 37, 187, 394, 269, 165, 168, 447, 249, 91, 241, 218, 216, 360 |
| Darmanitan | 555 | 33, 205, 510, 99, 424, 29, 207, 263, 7, 526, 37, 187, 394, 359, 165, 168, 447, 249, 91, 259, 523, 241, 218, 216, 360, 253, 269 |
| Dwebble | 557 | 210, 350, 110, 28, 185, 479, 397, 450, 446, 157, 163, 404, 165, 15, 249, 522, 91, 523, 201, 218, 216 |
| Scraggy | 559 | 43, 67, 28, 185, 29, 207, 280, 371, 498, 136, 184, 165, 526, 514, 447, 249, 91, 259, 241, 240, 218, 216 |
| Sigilyph | 561 | 16, 357, 95, 149, 366, 18, 60, 314, 113, 115, 485, 119, 165, 168, 148, 19, 240, 218, 216, 86, 219 |
| Tirtouga | 564 | 117, 110, 55, 205, 44, 182, 453, 246, 242, 469, 362, 479, 174, 165, 249, 91, 523, 240, 201, 218, 216, 503 |
| Archen | 566 | 98, 43, 17, 88, 104, 184, 365, 246, 97, 501, 512, 225, 242, 165, 15, 249, 91, 259, 523, 201, 218, 216 |
| Trubbish | 568 | 1, 139, 278, 390, 491, 3, 124, 254, 256, 36, 188, 499, 165, 168, 241, 240, 218, 216 |
| Minccino | 572 | 1, 45, 270, 321, 3, 227, 129, 47, 541, 204, 358, 497, 165, 168, 526, 514, 447, 91, 241, 240, 218, 216, 86, 219 |
| Cinccino | 573 | 331, 350, 270, 321, 47, 541, 165, 526, 514, 447, 91, 241, 240, 218, 216, 86, 113, 219, 1, 45, 3, 227, 129, 204, 358, 497, 168 |
| Gothita | 574 | 1, 93, 321, 313, 3, 60, 373, 185, 473, 260, 248, 377, 165, 168, 447, 148, 259, 240, 218, 216, 86, 113, 219, 115 |
| Gothorita | 575 | 1, 93, 321, 313, 3, 60, 373, 185, 473, 260, 248, 377, 165, 168, 447, 148, 259, 240, 218, 216, 86, 113, 219, 115 |
| Ducklett | 580 | 55, 346, 432, 17, 352, 332, 61, 297, 392, 403, 355, 240, 165, 19, 258, 218, 216, 503 |
| Swanna | 581 | 55, 346, 432, 17, 352, 332, 61, 297, 392, 403, 355, 240, 165, 19, 258, 218, 216, 503 |
| Vanillite | 582 | 333, 106, 310, 253, 196, 54, 419, 269, 429, 151, 58, 165, 258, 240, 218, 216, 113 |
| Vanillish | 583 | 333, 106, 310, 253, 196, 54, 419, 269, 429, 151, 165, 258, 240, 218, 216, 113, 58 |
| Deerling | 585 | 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 514, 447, 148, 241, 240, 218, 216, 86, 113, 219 |
| Sawsbuck | 586 | 224, 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 15, 514, 447, 249, 148, 241, 240, 218, 216, 86, 113, 219 |
| Emolga | 587 | 84, 98, 39, 268, 209, 228, 104, 351, 486, 512, 113, 165, 15, 148, 521, 240, 218, 216, 86 |
| Karrablast | 588 | 64, 43, 203, 210, 31, 29, 206, 405, 163, 165, 15, 522, 240, 218, 216 |
| Foongus | 590 | 71, 74, 310, 117, 72, 275, 185, 230, 202, 92, 235, 165, 447, 148, 241, 240, 218, 216 |
| Frillish | 592 | 145, 346, 71, 101, 61, 105, 352, 466, 362, 165, 148, 258, 240, 218, 216, 219, 503 |
| Joltik | 595 | 81, 141, 169, 86, 103, 210, 527, 450, 380, 163, 486, 324, 165, 168, 15, 522, 148, 521, 240, 218, 216, 113 |
| Ferroseed | 597 | 33, 106, 205, 174, 232, 42, 360, 334, 429, 275, 165, 249, 148, 241, 218, 216, 86 |
| Klink | 599 | 11, 268, 84, 544, 20, 451, 475, 165, 249, 521, 201, 218, 216, 86 |
| Tynamo | 602 | 33, 86, 209, 451, 165 |
| Basculin-Blue-Striped | 550 | 33, 55, 253, 29, 44, 453, 498, 36, 242, 401, 487, 165, 15, 258, 240, 218, 216, 503 |
| Deerling-Summer | 585 · 701 | 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 514, 447, 148, 241, 240, 218, 216, 86, 113, 219 |
| Deerling-Autumn | 585 · 702 | 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 514, 447, 148, 241, 240, 218, 216, 86, 113, 219 |
| Deerling-Winter | 585 · 703 | 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 514, 447, 148, 241, 240, 218, 216, 86, 113, 219 |
| Sawsbuck-Summer | 586 · 704 | 224, 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 15, 514, 447, 249, 148, 241, 240, 218, 216, 86, 113, 219 |
| Sawsbuck-Autumn | 586 · 705 | 224, 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 15, 514, 447, 249, 148, 241, 240, 218, 216, 86, 113, 219 |
| Sawsbuck-Winter | 586 · 706 | 224, 33, 293, 45, 28, 24, 73, 185, 36, 26, 312, 412, 165, 526, 15, 514, 447, 249, 148, 241, 240, 218, 216, 86, 113, 219 |

Prove eseguite:

- `tests/mistralton-moves.test.cjs`:8 controlli su conservazione delle coppie0.48, fonti MT/MN, soglie evolutive, identità di genere/stagione, Introforza, tasche e risorse originali. Nessun confronto grafico è dedotto da questi test.
- `tests/check-mistralton-moves.cjs`: tutte le1760 coppie, ogni fotogramma, entrambi i lati, bersaglio mancato, reazioni e recupero. Rapporto `outputs/chapter049/moves/coverage.json` e log `numeric-check.log`.
- `original-composites.png`: revisione visiva dei frontali/dorsi originali delle21 specie,6 varianti stagionali e2 femmine, con fogli delle parti separati. `palette-proof.png`: confronto visivo delle tre palette native delle27 nuove icone; corretti Stoutland, Foongus, Frillish e Ferroseed.
- `pose-proof-1.png` fino a `pose-proof-5.png`:29 esempi distinti di specie/genere/stagione con il renderer composito reale su Canvas, fronte/dorso, posa iniziale, preparazione e recupero;174 campioni. Verificati separatamente dai combattimenti completi.
- `tests/mistralton-presentation.test.cjs`:5 controlli su scelta dell'aspetto, passaggio di genere/stagione alla lotta, evoluzione, registrazione/Pokédex e16 ritratti statici originali. `static-portraits.png` revisionato visivamente; hash in `src/assets/pokemon/provenance-049.json`. I menu Info/Mosse e il Pokédex usano l'aspetto del Pokémon effettivo, della squadra o del primo avvistamento memorizzato.
- `tests/audio-field-cancellation.test.cjs` e `audio-field-speed.test.cjs`:7 controlli su stop prima del caricamento, disattivazione/riattivazione, attese dei versi annullate, indipendenza degli ID, richieste duplicate, completamento naturale, offset e velocità. `audio-browser.json` registra4 prove con Chrome AudioContext reale e i FLAC originali degli elevatori; nessun confronto udibile è dichiarato. I tre suoni sostenuti restano PCM finiti entro12s: le fasi native durano al massimo7,267s di corsa o10s di barriera e chiamano `stopSound(id)` al termine. `playSound(id,{offset})` riprende i secondi PCM nativi entro il buffer; nessun loop arbitrario è aggiunto.

Servizi e nuovi strumenti:

- `mistralton-services.js` usa gli assortimenti originali0–6 dei commessi realmente presenti nei sette Centri. Il commesso255 varia con le medaglie secondo la tabella nativa; il commesso6 vende soltanto le quattro MT meteo, il commesso4 le sette MT di Sciroccopoli. Le liste scorrono in pagine di sei articoli e consentono acquisto1–99, annullamento, controllo del denaro/capacità, MT riutilizzabili possedute e vendita a metà prezzo. Nessuno dei commessi cura la squadra.
- `tests/mistralton-services.test.cjs` e `mistralton-capture-items.test.cjs` verificano7 contratti di acquisto/vendita/assortimento e4 contratti delle Ball. Le native Rete6, Minor8, Premier12 e Scuro13 hanno68 celle originali; `market-item-proof.png` revisionato visivamente insieme alle33 icone strumenti. Premier è l’omaggio nativo singolo per un acquisto di almeno dieci Poké Ball. Rete ha bonus3 su Acqua/Coleottero; Minor usa il valore fx32 troncato e torna1 dal livello30; Scuro ha bonus3,5 in grotta o nei periodi3/4 della tabella oraria stagionale originale ARM9 `0209dea4`. Non sono assunti orari fissi per tutte le stagioni.
- Antigelo cura soltanto il congelamento; Superrepellente e Repellente Max durano200 e250 passi. La Fune di Fuga conserva l’ultima entrata fisica nella Grotta Minerale o nella Cava e torna al suo varco esterno sotto copertura, consumando lo strumento soltanto a uscita riuscita. Un salvataggio vecchio senza una precedente entrata fisica non inventa un luogo di ritorno.
- `weather-emitter-proof.png` contiene8 campioni Canvas aggiuntivi dei quattro richiami meteo, fronte/dorso, con atlante originale e punti di emissione; revisione distinta dalle sequenze complete di lotta.
- Le verifiche sorgente del capitolo registrano la progressione nativa completa, tre sconfitte senza avanzamento/regali/medaglia, il ricaricamento dei regali unici,59 interazioni/servizi, gli assortimenti di tutti i14 commessi e acquisti/vendite a Ponentopoli, i sette allenatori Plasma della cava, due Pepite una volta sola, il moltiplicatore EXP reale di Fortunuovo e il danno da contatto reale di Bitorzolelmo. Le lettere scritte attraversano anche la catena reale makeMon→pack→cura→salvataggio su disco→lettura→evoluzione di Snivy/Deerling, conservando autore, testo, strumento e forma stagionale. Il servizio wireless2101 mostra i messaggi nativi346/13 e346/24 senza curare né effettuare transazioni. Tutti i nove strumenti137–145 arrivano al motore come la categoria Mail esistente:27 sessioni reali verificano Furto, Raggiro e Rapidscambio, mantenendo il comportamento del [motore](https://github.com/smogon/pokemon-showdown/blob/master/data/items.ts#L3751) [ereditato dalla Gen V](https://github.com/smogon/pokemon-showdown/blob/master/data/mods/gen5/items.ts#L262), senza introdurre nuove regole. Furto trasferisce lo strumento durante il turno; Raggiro/Rapidscambio falliscono. Dopo la lotta con allenatore il record di viaggio conserva il tipo di carta originale e il testo. La navigazione verifica35 casi,304 celle consecutive e sette spinte fisiche dei cristalli, ragnatela chiusa/aperta e ritorno con Fune anche dopo salvataggio. Sono prove di logica/controller, non certificazioni dei pixel o dei suoni.

Provenienza:116 file animati copiati dal precedente export originale o estratti soltanto per le due femmine; hash in `src/assets/animated/provenance-049.json`. Le femmine usano NCGR specie×20+3 davanti e+12 dietro, con NCER/NANR/NMCR/NMAR e palette condivisi; nessuna palette rosa o forma sostitutiva è inventata. Esportate27 icone native (81 celle), 35 immagini native di strumenti, lettere e MT/MN,21 impronte e tre nuovi tipi; le tre tabelle Pokédex coprono78 specie distinte. Gli script di estrazione non riscrivono la vecchia distribuzione e non pubblicano la ROM.

`scald-emitter-proof.png` aggiunge24 campioni dei12 apprendenti di Idrovampata sui due lati, con le due icone MT native. `tests/check-mistralton-fly.cjs` verifica12 contratti di Volo sul campo, comprese le otto destinazioni native già visitate, con pixel del cut-in sostituiti dalla fixture CLI. Fonte e limiti in [MISTRALTON-FLY-049.md](MISTRALTON-FLY-049.md).

Limiti: i174 campioni Canvas non certificano tutte le1760 sequenze con fondale, camera, effetti, audio e input sui tre viewport. Non dichiarare tutte le coppie graficamente verificate prima della prova browser della build candidata; i risultati finali vanno registrati nel rapporto QA0.49.
