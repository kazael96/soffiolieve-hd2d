# Quattroventi → ingresso nel Percorso 2

Estensione richiesta il 28 ottobre 2026, mantenendo la demo precedente e i salvataggi versione 2. Il limite nuovo è lo sbocco occidentale del varco: i successivi eventi del Percorso 2 non sono inclusi.

## Contenuti

- Programmi italiani IRBI di Quattroventi (zona397, script794), Centro Pokémon (398/796), case e piani superiori (399–405/798–810), varco (320/640). La zona319 serve esclusivamente come punto d’arrivo.
- Aralia conduce al Centro; visita con Belle, cura della squadra, spiegazione del PC e del Market, saluti e uscita di Aralia.
- Passanti all’uscita del Centro, invito di Komor, comizio originale di Ghecis, dispersione della folla, incontro e prima lotta con N, dialoghi successivi e uscita di N/Komor.
- Interazioni delle case, Poké Ball regalata una volta, Pokémorra cinese e attivazione dei due musicisti. Market web per acquisti singoli di Poké Ball/Pozioni; cure gratuite. Le interfacce di servizio sono adattamenti, non una riproduzione pixel per pixel.
- Primo N: allenatore64, Purrloin7 con Graffio/Ruggito, dati individuali derivati dai record originali, ricompensa700. Lo stato visto viene registrato, non la cattura. Esperienza ed EV usano i dati di Purrloin.
- Purrloin ha due profili specifici per Graffio e Ruggito: avvicinamento felino, colpo di zampa, preparazione del corpo e onde vocali. Mantiene il composito originale; le deformazioni del corpo sono adattamenti HD-2D. Supportati entrambi i lati, mancato bersaglio e reazioni. Non viene dichiarato ottenibile nel nuovo punto d’arrivo.
- Piazza di Quattroventi come fondale esplicito, con terreno, edifici e prospettiva dalla geometria originale della città. Nessun ripiego sul Percorso1.
- La ricarica conserva coordinate estese, quantità acquistate e progressione. I vecchi checkpoint all’arrivo possono proseguire. È possibile tornare sul Percorso1 e continuare gli incontri; il Centro visitato diventa il punto di recupero.

## Estrazione

`tools/extract-accumula.py` legge la ROM IRBI locale. Produce52 modelli,139 texture e33 modelli di personaggi, con scene, collisioni, programmi, testi e impronte degli script originali. Le9 scene aggiuntive degli interni vengono integrate prima della creazione delle risorse GPU.

Matrice globale a/0/0/9:0: due griglie u32, prima membri dei terreni, poi zone. Land5 contiene Quattroventi ed era già nella geometria nord; le collisioni del precedente limite della demo impedivano di percorrerla. Gli interni provengono dai membri489–491,497,509,514. Gli arredi condivisi vengono letti dai bundle originali insieme alle relative texture.

Nuove firme controllate nelle routine IRBI: MapChangeFly quattro u16 (021AFC44), messaggi collocati quattro u16 (021B1000) e chiusura un u16 (021B10D8), cambiamento musicale due u16 (021AED28), menu di scelta (021B01C8/021B0244/021B0294). La disposizione delle finestre multiple del comizio viene adattata alla singola finestra web, conservando i testi e l’ordine.

## Audio

Musiche originali aggiunte: Percorso2 (1038), Centro Pokémon (1060), varco (1065), spiegazione di Aralia (1086), incontro con N (1092), comizio (1093), lotta con N (1137).

Mixer di Quattroventi verificato in a/1/4/7:2 e ARM9 0202C360/0202C490: base0xFC7F, piano0x0300 (tracce8–9), batteria0x0080 (traccia7), ingresso60 aggiornamenti. `render-accumula-mix.py` verifica il record e traduce i numeri logici SSEQ negli slot interni del sintetizzatore, che sono diversi. I tre flussi mantengono clock e loop sincronizzati; attivare un musicista cambia il suo volume senza riavviare il brano. Il mix web e la rampa non sono dichiarati bit-identici al DAC della console.

## Verifiche e limiti

`check-accumula-runtime.cjs`: tre starter, guida, cura, visita, Plasma, N, premio e ricarica; sconfitta e lotta reale a×4; tutte20 transizioni nuove e21 programmi opzionali. Anche questi controlli vengono eseguiti nelle PR e prima di distribuire Pages.

La fixture browser include19 scene a tre zoom,397 texture NPC confrontate con i PNG,960 fotogrammi di sprite e252 fotogrammi di21 profili sui due lati; controlla anche i menu precedenti. La riproduzione della storia con renderer reale verifica separatamente le rimozioni fuori visuale. I rapporti indicano le prove effettivamente concluse, non quelle soltanto disponibili.

Restano fuori: deposito nel PC, comunicazione wireless, inventario completo del Market e avventura successiva sul Percorso2. Il display informativo del varco è un adattamento testuale. La regia, il mixer web e l’AI di N non sono certificati fotogramma per fotogramma o istruzione per istruzione contro la console. Le regole del motore di lotta e le19 coppie già realizzate restano invariate. Nessuna certificazione di assenza assoluta di bug o di tutte le GPU Android.
