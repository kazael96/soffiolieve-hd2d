# Verifica di fedeltà 0.17

Ambito giocabile: camera di Alcide, Soffiolieve, Percorso 1 e ingresso di Quattroventi. La demo conserva la visuale bassa, lo zoom e la rappresentazione HD-2D.

## Interfacce e comportamento

- Squadra durante la lotta: la selezione apre il contesto originale, senza consumare il turno. Scambia conferma la sostituzione; INFO e MOSTRA MOSSE aprono le pagine interne della lotta, distinte dal Riepilogo fuori lotta. Sono consultabili anche i Pokémon attivi o KO; lo scambio resta disabilitato nei casi non validi. La selezione del bersaglio di una Pozione passa direttamente all'uso.
- INFO di lotta: finestre, font, statistiche, PS, livello, EXP al prossimo livello, abilità, descrizione, strumento, genere, tipi e stato. I valori provengono dalla sessione corrente, senza leggere PS e PP da un salvataggio precedente alla lotta.
- Mosse di lotta: quattro pannelli originali e pagina del dettaglio con PP, potenza, precisione, categoria e descrizioni italiane. Pulsanti con cinque aggiornamenti premuti e due di recupero; la scelta di una mossa da usare conserva i dieci coefficienti originali del lampeggio.
- Messaggi: prompt della squadra sullo schermo inferiore, testo narrativo sul superiore. Il separatore interno del turno non viene disegnato come messaggio del gioco. La cornice viene composta in RGB555 con coefficienti16 e7 anziché con trasparenza CSS.
- Borsa: frecce originali e sequenza premuto/riposo4+4+4+4, con ripartenza quando cambia il numero. Ripetizione al primo aggiornamento, pausa fino al30°, poi passi di1 e dal121° passi di10. La cattura del puntatore evita il doppio incremento del click successivo. Blur, cambio pagina e annullamento rilasciano il comando.
- Menu Y: inserimento fra le voci e posizione speciale finale0xff, conferma con A, annullamento con B o SELECT. L'ordine non viene modificato prima della conferma.
- Ricerca Pokédex: scorrimento a velocità costante per riga, sei livelli e budget di rilascio originali, trascinamento e barra con divisione intera. Un terzo tipo sposta il secondo nella prima posizione. Aiuto originale sopra le righe storiche del display superiore.
- Lista Pokédex: sette righe selezionabili in basso, otto righe precedenti in alto, fascia inferiore opaca originale e lampeggio della palette al posto della cornice bianca aggiunta.
- Pagine Pokédex: fusione RGB555 delle aree habitat, testo originale «Zona ignota», intestazione «Habitat di …» e font della ROM. Luminosità selettiva dei piani BG0/BG2/BG3: otto aggiornamenti per Info e per il display inferiore di Zona; nessuna dissolvenza generica di otto aggiornamenti su Verso o Forme. Il cambio specie carica atomicamente le nuove risorse.

## Prove e limiti

86 test Node e3 test Python; controllo dell'archivio di base e delle risorse della build; nove percorsi automatici della storia,14 porte e62 interazioni. Collaudo nel browser su salvataggi isolati per quantità, ricerca, habitat, menu Y e schermate di lotta, compresi ispezione, scambio e ritorno.

I modelli puri verificano i contatori di pressione e l'inerzia; non è stato eseguito un collaudo fisico del trascinamento prolungato su telefono. La lista regionale conserva ancora una navigazione adattata al browser; la coreografia completa fra caricamenti dei moduli, priorità hardware di ogni piano e sincronismo video/audio rispetto alla console non sono certificati. Il rendering è canvas/WebGL e l'uscita audio è WebAudio. Non si dichiara una replica pixel/ciclo esatta né una verifica esaustiva di ogni combinazione di mosse, abilità e stati del gioco completo.

Fonti tecniche: BATTLE-PARTY-UI.md, BATTLE-UI-REFERENCE.md, FIELD-MENU-PROGRESS.md, DEX-SCROLL.md, DEX-SEARCH.md e DEX-EFFECTS.md; cataloghi con indirizzi IRBI e archivi sorgenti accanto alle risorse.
