# Regole vincolanti di Soffiolieve HD-2D

Leggere `docs/DEVELOPMENT-RULES.md` prima di modificare il gioco. Le tre regole richieste dall'utente valgono per la demo e per la futura versione completa:

1. Un personaggio che lascia una scena deve uscire dalla visuale o essere realmente occultato prima della rimozione. Vietate sparizioni visibili causate dal semplice rispetto dei tempi/script DS.
2. Ogni combattimento deve avere uno sfondo coerente con il luogo effettivo in cui inizia, mantenuto per tutta la lotta. Non usare un percorso come ripiego silenzioso per luoghi non gestiti.
3. Ogni combinazione di Pokémon e mossa apprendibile richiede un'animazione personalizzata al Pokémon. Un effetto generico della mossa non soddisfa questo requisito. Per la demo, priorità obbligatoria alle specie ottenibili e alle mosse accessibili entro il livello 10, come dettagliato nel documento.

Questi requisiti dell'utente prevalgono sulla riproduzione letterale della ROM quando servono adattamenti HD-2D. Non alterare le meccaniche di lotta per ottenere un effetto visivo. Conservare copertura, prove e limiti dichiarati; non dichiarare completata una combinazione solo perché esiste un'animazione per il suo moveID.

Ogni nuova scena, specie, fonte di apprendimento o mossa deve aggiornare il relativo inventario e le verifiche previste nel documento. I requisiti non si considerano implementati per il solo fatto di essere documentati.
