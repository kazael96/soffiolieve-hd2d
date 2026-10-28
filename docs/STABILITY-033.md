# Stabilità 0.33

La foto dell’utente mostra geometria e personaggi bianchi. Causa compatibile accertata nel codice precedente: 549 immagini di campo richieste insieme (390 texture, 159 fotogrammi NPC), con ogni errore sostituito definitivamente da una texture bianca e avvio comunque consentito. Non è stato possibile ricostruire a posteriori l’esatto errore di rete o GPU del telefono.

## Correzioni

- Coda condivisa con massimo sei caricamenti contemporanei, deduplicazione, tre tentativi e timeout di 15 secondi per tentativo, anche per i modelli binari. Nessun caricamento fallito viene dichiarato valido.
- La scena incompleta rimane coperta e in pausa. «Riprova caricamento» recupera le sole immagini mancanti; durante un lotto ancora pendente ricarica dal checkpoint, annullando le vecchie richieste.
- Ripristino del contesto sullo stesso renderer: stato narrativo, camera, attori e animazioni dei modelli sono conservati; risorse obsolete non possono essere caricate nel contesto nuovo. Le risorse GPU valide vengono liberate prima di riprovare.
- Modelli falliti riprovabili; i comandi delle porte attendono il recupero. Cache di sfondi, texture di battaglia e atlanti Pokémon non conservano per sempre un fallimento. Gli sprite dei due combattenti sono preparati prima di mostrare la lotta.
- Recupero separato del contesto del fondale di lotta, conservando il luogo acquisito. Il canvas viene riutilizzato per evitare l’accumulo di contesti grafici.
- Il ciclo di disegno prenota il fotogramma successivo prima di eseguire il codice: un’eccezione mostra una schermata di recupero invece di arrestare silenziosamente il gioco. Un campo incompleto non sovrascrive l’ultimo salvataggio valido.

## Verifiche

- 161 test Node e tre test Python del builder superati. Test di regressione per coda da 549 richieste, errori temporanei e permanenti, timeout, deduplicazione, richiesta tardiva dopo perdita del contesto, tre ripristini consecutivi, eccezioni di disegno, protezione dei salvataggi, cache di lotta e ripresa dei comandi dei modelli.
- Audit degli asset: 594 PNG con dati decodificabili, percorsi con maiuscole/minuscole esatte, immagini dei GLB e 14 atlanti frontali/posteriori. Le immagini di campo richiedono circa 7,33 MiB di pixel RGBA nativi, esclusi framebuffer e copie del browser.
- Regressioni della storia originale con i tre starter sui due lati e in esecuzione; nove combinazioni prima/dopo il tutorial con velocità ×1/×2/×4 e audio spento, attivo o sospeso. Verifiche di porte, menu, salvataggi, animazioni e luoghi di battaglia conservate.
- Browser reale a 390×844: immagine del protagonista bloccata deliberatamente, scena in pausa, riparazione e recupero di tutte le 549 immagini; tre perdite/ripristini consecutivi sul Percorso 1; perdita/ripristino del fondale di lotta con tre contesti complessivi invariati, luogo/PS/PP conservati e menu mosse ancora accessibile. Squadra, navigazione touch, scheda mosse e ritorno con selezione conservata verificati dopo il recupero. Fixture isolate dai salvataggi reali ed escluse dal sito pubblicato.

La verifica mobile del browser non equivale a una prova su ogni GPU Android. Queste correzioni rimuovono cause riproducibili e rendono recuperabili gli errori; non certificano l’assenza assoluta di bug. Le regole permanenti su uscite, luoghi e coppie Pokémon–mossa restano invariate.
