# Verifica di fedeltà 0.16

Ambito: apertura originale da camera di Alcide a ingresso di Quattroventi. La demo non contiene il resto di Pokémon Nero. Mantiene la rappresentazione HD-2D, la visuale bassa e lo zoom della versione precedente.

## Correzioni integrate

- Ricerca Pokédex: elenchi verticali originali, righe precedenti sullo schermo superiore, scorrimento/pagine, font e indicatori originali. I filtri si disattivano selezionandoli di nuovo; due tipi si combinano senza aprire una seconda pagina. Sagome indicizzate 0..13 e rappresentate dai relativi sprite, senza riga fittizia di azzeramento. Il lampeggio interpola le palette RGB555 usando64 coefficienti FX12 originali.
- Verso: minimi e massimi dai campioni PCM8 originali, guadagno e pitch nativi, due colonne per aggiornamento a60Hz. Vedi CRY-GRAPH.md.
- Zona: distribuzione originale a/1/7/8, sagome rosa originali e64 valori di lampeggio dalla LUT ARM9. Nessuna zona inventata per gli starter.
- Borsa: pannello quantità e messaggi italiani originali; Su/Giù ±1, Destra/Sinistra ±10, ritorno ciclico, conferma quantità e successiva scelta SÌ/NO.
- Menu Y: sullo schermo superiore, font/palette originali, cinque righe visibili, avvio con A/Y, riordino con SELECT, annullamento con B/X. Su telefono il testo SELECT nella testata è toccabile. La ricerca registrata apre la lista completa dei risultati.
- Squadra in lotta: font0 per i nomi, font3 per livello/PS, coordinate originali, pannelli distinti attivo/riserva/vuoto/KO, cinque aggiornamenti di pressione e due di recupero, simboli originali degli stati.
- Messaggio lotta: cornice originale e testo a `[8,152]`; interno con il rapporto7/16 della scena sottostante.

## Limiti dichiarati

Il rendering resta una conversione canvas/WebGL, non un emulatore del Nintendo DS. La fusione hardware RGB555, i filtri di uscita WebAudio e il sincronismo complessivo fra caricamenti dei moduli non sono certificati pixel/ciclo per pixel/ciclo. Il grafico dei versi ricompone le colonne anziché emulare la memoria tilemap. Il trascinamento degli elenchi non riproduce l'inerzia nativa; le frecce grafiche della quantità e alcuni casi limite di riordino richiedono ulteriore identificazione. Le transizioni native sono documentate, ma non sostituite con dissolvenze generiche presentate come originali.

La fedeltà di questa revisione riguarda questi controlli e le risorse descritte; non equivale a una verifica esaustiva di ogni mossa, abilità e combinazione di condizioni del gioco completo.
