# Da Zefiropoli ad Austropoli · 0.43

L’utente ha autorizzato il proseguimento fino alla prossima città e ha scelto il limite 25. La pubblicazione va distinta dalle verifiche locali: il rapporto finale e il riferimento della build verificata sono in QA-043.md quando disponibili.

## Progressione collegata

| Luogo | Zone IRBI | Contenuto |
| --- | --- | --- |
| Museo di Zefiropoli | 17 | visita, Teschio come attore 3D originale, furto e fumo |
| Biblioteca e palestra | 18, 19 | sequenza originale dei libri, insegnante, scaffale mobile e scale; Aloé con Herdier 18 e Watchog 20, Medaglia Base e MT67 |
| Piazza | 16 | incontro con Artemisio, Komor e Belle; Ricerca Strumenti e partenza delle ricerche |
| Bosco Girandola esterno | 154 | allenatori, Noemi con cure dopo vittoria e ripetute, regalo MT94, roccia dimostrativa e strumenti |
| Bosco Girandola interno | 155 | ricerca e quattro scontri Plasma, restituzione del Teschio, ricompensa Pietralunare; erba e allenatori nativi |
| Ponte Freccialuce | 250, 251, 249, 252 | accessi, varchi, Rapidartigli e attraversamento del ponte a quote sovrapposte |
| Austropoli | 28, 41 | arrivo sul lungomare, residenti, Centro Pokémon e infermiera; le altre strade e la palestra sono il confine del capitolo |

I programmi, i testi italiani, i Pokémon degli allenatori, le tabelle d’incontro, le geometrie, le texture e i dati musicali provengono dalla ROM IRBI fornita dall’utente. `extract-pinwheel.py` conserva i programmi globali 2800/2805/2806 necessari ai regali. Le coordinate delle mappe senza griglia provengono da `a/0/7/9` e `a/1/0/9`, con assegnazioni verificate nella tabella ARM9 `0209DFA6`: binari 5 per Austropoli e 11 per il ponte. La camera di Austropoli riprende l’orientamento dei suoi record; inclinazione e zoom restano adattati alla visuale HD-2D.

## Continuità e collisioni

| Personaggio / rimozione | Percorso previsto e destinazione |
| --- | --- |
| Aloé dopo la palestra | attraversa le scale verso la biblioteca/museo; riadozione della scena del furto durante un passaggio coperto |
| Personaggi e Plasma nel museo | uscita dal portone a sud; nessuna rimozione di persone dovuta soltanto alla fine dello script |
| Artemisio in piazza | viaggio sul campo condiviso fino all’attore 1 della zona 154, senza duplicazione del nome |
| Komor e Belle dopo l’incontro in piazza | il loro movimento nativo termina sulla porta del museo; entrano dalla porta, senza riportare Komor alla precedente attesa in piazza |
| Artemisio all’ingresso del bosco | raggiunge il passaggio per la zona 155; l’arrivo nella mappa con origine diversa avviene durante la transizione coperta |
| Artemisio dopo il recupero | verso l’uscita nord, in direzione di Austropoli e del successivo capitolo |
| Aloé dopo il recupero | verso l’uscita sud, in direzione del museo di Zefiropoli |
| Scomparse per cambio di flag | gli attori del nuovo capitolo vengono instradati anche quando il programma cambia un flag invece di eseguire ActorDelete |
| Teschio, scaffale, erba speciale | meccanismi/modelli, esclusi dalle partenze dei personaggi: non diventano camminatori invisibili |

I viaggi a piedi restano visibili finché il renderer non prova l’uscita dall’inquadratura o l’occultamento. Porte e scale mantengono le verifiche di visibilità precedenti; le transizioni coprono i cambi fra origini diverse. I viaggi di Aralia, Belle e Komor dei capitoli precedenti restano vincolati a CITY-CONTINUITY-037.md. Non attribuire ai test della sola sequenza narrativa una verifica esaustiva di ogni itinerario a ogni zoom.

La collisione sul ponte sceglie il piano vicino all’altezza persistente; non sceglie il piano superiore solo perché ha le stesse coordinate X/Z. Anche collisioni e interazioni degli NPC verificano il piano. Le scale della biblioteca restano inaccessibili prima della soluzione; la libreria si sposta con l’attore 185. Gli accessi della porzione orientale postgame del bosco non sono sbloccati dalla Medaglia Base.

## Lotte, menu e progressione

Quattro contesti espliciti: `nacreneLibrary`, `aloeGym`, `pinwheelOuter`, `pinwheelForest`. I fondali mettono in scena geometrie e texture native, con spazio di lotta adattato, terreno e ombre; negli esterni le presenze lontane sono Pidove/Timburr/Tympole e Sewaddle/Cottonee/Venipede. Non aggiungere Pokémon ambientali agli interni. La selezione geografica è fissata all’inizio della lotta.

Il limite comune di lotte, Caramelle Rare e Pensione è 25; i vecchi livelli/XP superiori restano intatti. Le evoluzioni conservano dati individuali, PP e deficit di PS, e rispettano lo slot abilità. Le icone e le pagine Pokédex del roster sono incluse. La matrice di animazioni e i suoi limiti sono in SPECIES-MOVES-043.md e TRAINING-043.md.

La Pietralunare è lo strumento **81**, distinto dalla Difesa X **58**: i vecchi Musharna non vengono annullati. Difesa X aumenta la Difesa di un livello in quinta generazione; Etere ripristina 10 PP della mossa scelta. Rapidartigli può essere assegnato e mantenuto nel salvataggio; le nuove MT usano i bit di compatibilità IRBI. La Borsa del campo scorre oltre sei voci e conserva la selezione al ritorno. Le gemelle richiedono almeno due Pokémon in grado di lottare.

## Adattamenti e limiti da mantenere espliciti

- Le coreografie dei corpi, le evoluzioni, le aperture della biblioteca e l’inquadratura sono adattamenti browser/HD-2D; non sono un’emulazione del motore DS.
- La Medaglia Base usa i modelli e le animazioni articolari originali dei descrittori 4/43 con l’alpha dello sfondo. Come per la Medaglia Tris, BVA/BTP e SPL15 non sono ricostruiti integralmente.
- Il campo usa illuminazione diurna. I coni luminosi aggregati del modello 194 non vengono mostrati come solidi gialli; non dichiarare un ciclo giorno/notte originale completo.
- Le tabelle dell’erba che si muove sono estratte e il roster relativo ha copertura grafica; non dichiarare il fenomeno casuale dell’erba che si muove implementato finché manca la relativa logica. Le specie preparate per quel fenomeno non sono tutte ottenibili solo entrando nell’erba normale.
- Le evoluzioni per amicizia leggono il valore salvato; l’intera progressione originale dell’amicizia non è certificata da questo capitolo.
- Geonet e servizi di rete restano offline. Il residente usa il ramo originale senza registrazione, senza richiedere dati geografici.
- Ricerca Strumenti è acquisito nella storia; l’interfaccia completa di ricerca del DS non è ricostruita.
- I veicoli e le sequenze dinamiche della camera del ponte non sono riprodotti integralmente. La camminata, i piani, i passaggi e l’audio del luogo sono separati da quel limite.
- Test WebAudio/PCM non significano confronto udibile; viewport mobile non significa certificazione di una GPU Android fisica.
