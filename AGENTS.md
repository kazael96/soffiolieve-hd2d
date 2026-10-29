# Regole vincolanti di Soffiolieve HD-2D

## Continuità richiesta il 28 ottobre 2026

Per ogni estensione conservare il lavoro precedente: stile HD-2D e riferimenti IRBI, comandi e menu ispirati a Pokémon Nero, controlli mobile, velocità ×1/×2/×4 fuori menu e riavvio con conferma. Preservare le correzioni a illuminazione, texture, blocchi degli eventi, navigazione e arrivo coerente di Aralia. Le animazioni personalizzate e le reazioni devono funzionare su entrambi i lati della lotta. Eseguire la suite di regressione e aggiornare inventari e prove per i nuovi contenuti; non dichiarare verificati scenari non collaudati.

L'utente autorizza il merge della PR #25 e delle future PR di questo progetto; questa autorizzazione resta valida senza chiederla nuovamente per ogni PR. Integrare dopo i controlli pertinenti. Estensione corrente autorizzata: eventi di Quattroventi fino all'ingresso nel Percorso 2, conservando i salvataggi esistenti.

Leggere `docs/DEVELOPMENT-RULES.md` prima di modificare il gioco. Le tre regole richieste dall'utente valgono per la demo e per la futura versione completa:

1. Un personaggio che lascia una scena deve uscire dalla visuale o essere realmente occultato prima della rimozione. Vietate sparizioni visibili causate dal semplice rispetto dei tempi/script DS.
2. Ogni combattimento deve avere uno sfondo coerente con il luogo effettivo in cui inizia, mantenuto per tutta la lotta. Non usare un percorso come ripiego silenzioso per luoghi non gestiti.
3. Ogni combinazione di Pokémon e mossa apprendibile richiede un'animazione personalizzata al Pokémon. Un effetto generico della mossa non soddisfa questo requisito. Per la demo, priorità obbligatoria alle specie ottenibili e alle mosse accessibili entro il livello 10, come dettagliato nel documento.

Questi requisiti dell'utente prevalgono sulla riproduzione letterale della ROM quando servono adattamenti HD-2D. Non alterare le meccaniche di lotta per ottenere un effetto visivo. Conservare copertura, prove e limiti dichiarati; non dichiarare completata una combinazione solo perché esiste un'animazione per il suo moveID.

Ogni nuova scena, specie, fonte di apprendimento o mossa deve aggiornare il relativo inventario e le verifiche previste nel documento. I requisiti non si considerano implementati per il solo fatto di essere documentati.

La richiesta successiva amplia le animazioni a tutte le mosse utilizzabili nella partita della demo: applicare la matrice83 coppie in docs/SPECIES-MOVES-036.md, compresi livelli oltre10, tutorial e Scontro. Conservare il perimetro delle specie ottenibili e non aggiungere mosse illegali per ampliare la copertura.

Richiesta del29 ottobre2026: ogni uscita narrativa di Aralia, Komor e Belle deve condurre verso la posizione del loro prossimo evento. Dopo il tutorial Aralia va davanti al Centro Pokémon di Quattroventi; la destinazione al laboratorio della0.34 è superata. Applicare docs/CITY-CONTINUITY-037.md e preservare le interazioni attraverso i banconi.
