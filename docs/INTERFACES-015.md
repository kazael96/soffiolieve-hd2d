# Interfacce 0.15: verifica e limiti

Il tratto giocabile resta camera di Alcide → Soffiolieve → Percorso 1 → ingresso di Quattroventi. Questa versione completa le principali schermate consultabili nel tratto, senza aggiungere progressi, medaglie o funzioni nazionali non ancora sbloccate.

## Risorse e comportamenti confrontati con IRBI

- Menu X con voci disponibili e disposizione originale; nessun HUD informativo aggiunto sul campo.
- Squadra, azioni contestuali, scambio strumenti, cure, riordino e annullamento. Riepilogo Info/Mosse con statistiche, abilità, descrizioni, PP, natura e caratteristica; Fiocchi non disponibile all'inizio. I nuovi Pokémon conservano data e luogo d'incontro e personalità; i vecchi salvataggi non ricevono una storia inventata.
- Borsa a due schermi: cinque tasche, descrizioni complete, icone, quantità, uso, consegna, ritiro e scarto.
- Cinque opzioni native, con conferma o abbandono delle modifiche. L'opzione IR è memorizzata; comunicazioni e salvataggio a infrarossi non sono implementati nel browser.
- Scheda allenatore fronte/retro con ID, tempo e data generati e conservati dalla demo. Il conteggio Pokédex usa i visti. La frase personale resta vuota.
- Pokédex regionale con voci sconosciute intermedie, Info/Zona/Verso/Forme e ricerca. Ordinamenti provengono dalle tabelle italiane; filtri per nome, tipo, colore e sagoma seguono gli attributi personali. Peso/altezza e tipo richiedono cattura. Il Nazionale rimane bloccato. Le cinque specie del tratto non hanno forme alternative consultabili.
- Registrazione tramite Y/checkbox nelle pagine supportate; non dalla griglia X. Riepilogo, Pokédex, Opzioni e scheda allenatore hanno registri separati.
- Tastiera soprannomi originale, dieci caratteri, cinque pagine e caratteri speciali; B cancella, START seleziona OK, SELECT cambia pagina.
- Dialoghi con font e cornice originali; comandi A/B e direzioni touch funzionanti anche dentro i dialoghi modali del browser.
- Lotta: quattro pannelli mosse, slot vuoti, colori PP per soglie intere, icone tipo, cursore nativo, messaggi e cifre PS. Borsa dedicata alle lotte e pannelli squadra dedicati, distinti da quelli del campo.
- Salva usa il pannello originale; un errore di memoria del browser non produce il messaggio di successo.

Gli estrattori in `tools/` e i cataloghi/provenance in `src/` documentano archivi, finestre, palette e indirizzi delle routine. La ROM e i salvataggi della cartuccia non vengono pubblicati. Il sito viene ricostruito dall'archivio base verificato e dai sorgenti; la revisione comprende anche i nuovi asset per evitare risorse precedenti in cache.

## Adattamenti dichiarati

La resa HD-2D, la disposizione delle due LCD nella pagina e i tasti virtuali sono adattamenti al browser. Non è una replica pixel per pixel dell'hardware DS.

Restano adattati proiezione e dimensione di alcuni ritratti 3D, transizioni, tempi assoluti delle animazioni, composizione esterna dei messaggi di lotta, lampeggio delle aree del Pokédex, campionamento del grafico del verso, griglie delle opzioni di ricerca e finestra quantità/scorciatoie multiple. Gli stati cromatici dei pannelli squadra in lotta sono inferenze visive, mentre geometria e risorse sono certificate; la tipografia di quei pannelli richiede ulteriore confronto. Non viene dichiarata equivalenza completa di tutte le varianti di interfaccia o degli effetti di ogni mossa.

La demo conserva i limiti del tratto iniziale descritti in ORIGINAL-OPENING.md: non include l'intera avventura, Centro Pokémon/PC, comunicazioni, allevamento o tutti gli eventi successivi. I salvataggi sono locali al browser e non sincronizzati fra dispositivi. Nessun test su un telefono fisico è implicato dai controlli touch provati nel browser desktop.

## Verifica

70 test Node coprono controlli, progressione, risorse, ricerche, statistiche, cattura e salvataggi. Tre test Python verificano il costruttore e l'archivio base. L'integrazione esegue nove percorsi iniziali (tre starter, vittoria/sconfitta/gioco), 14 collegamenti porte/scale, 62 interazioni e i flussi degli strumenti. I controlli di pubblicazione verificano dipendenze e hash, oltre ad escludere le pagine di prova locali.
