# Audit approfondito e correzioni — 0.38

## Metodo e risultati riproducibili

La suite precedente sulla0.37 passava190 test Node,3 Python e10 fasi automatiche. L’audit aggiunge scenari indipendenti: confronta le collisioni con i corpi effettivamente rappresentati, ricarica durante i passaggi e la riadozione degli attori, ripete rapidamente gli input e altera deliberatamente singoli record di viaggio in copie isolate del salvataggio.

Sono stati riprodotti cinque difetti della0.37 e un caso aggiuntivo di robustezza:

| Caso | Prima | Correzione0.38 |
| --- | --- | --- |
| Destinazione futura di un NPC ancora in viaggio | La posizione logica era già solida anche se il personaggio era altrove. | Movimento del giocatore, vagabondaggio e attesa di Belle usano gli stessi corpi visibili. I duplicati logici non camminano indipendentemente. |
| Ricarica durante l’attraversamento di una porta | Il flag aperto era salvato, ma il nuovo renderer non aveva il relativo modello/handle aperto. | Il ritaglio viene conservato e il modello della porta viene riaperto prima di riprendere il movimento. |
| Ricarica di un residente in riadozione senza attore logico momentaneamente disponibile | Il viaggio diventava un’uscita e il personaggio poteva essere ritirato fuori visuale. | Il residente resta in attesa e viene poi riadottato; l’attesa non costituisce una sparizione. |
| Errore temporaneo nel caricamento del menu | La promessa fallita rimaneva in cache e i tentativi successivi fallivano subito. | Caricamento limitato e ripetibile, font e Borsa recuperabili, pulizia dei dialoghi incompleti. |
| Arrivo anticipato al confronto sul Percorso1 | Il dialogo partiva mentre Komor e Belle erano ancora in viaggio. | Il giocatore resta libero fino al loro arrivo; il trigger riparte anche restando fermi. Prova a�1/�2/�4. |
| Record di viaggio danneggiato, per esempio punti nulli | Poteva provocare un’eccezione e bloccare il caricamento. | Convalida di forma, coordinate, fasi e indici; righe non valide isolate; identità ricostruite e campi transitori esclusi. Rimangono supportate le migrazioni note di Aralia. |

Le prove prima delle correzioni sono conservate nel rapporto locale `reproductions-before.json`, sulla build0.37 effettiva. Non vengono usati salvataggi del giocatore.

Il controllo grafico ha inoltre rilevato un errore di caricamento di `assets/menu/bagMale-7.png`, pur essendo il PNG presente e valido. I test di errore simulato hanno confermato che menu, font condiviso e catalogo Borsa conservavano la promessa fallita: i tentativi successivi non potevano recuperare. Ora usano il caricatore con richieste limitate e tentativi ripetuti, eliminano gli errori dalla cache e ripuliscono i dialoghi incompleti. Se il caricamento resta impossibile, il giocatore può riprovare senza una rejection non gestita.

## Nuova copertura

- `native-ui-recovery.test.cjs`: errore e ripresa di menu, font e catalogo Borsa, pulizia del dialogo incompleto e gestione del fallimento dall’apertura pubblica. La prova grafica inserisce un errore temporaneo controllato e verifica poi la navigazione del menu.
- `field-recovery.test.cjs`: ricostruzione della porta,20 istantanee distribuite fra le fasi del passaggio, riadozione in attesa, record danneggiati, identità e contatori temporanei.
- `check-field-stress.cjs`:1.170 confronti fra collisione e corpi rappresentati a×1/×2/×4,9 ricariche durante il viaggio,100 pressioni A durante una cura, acquisti/denaro insufficiente/Borsa piena/ricarica,60 transizioni con2.400 tentativi ripetuti respinti.
- La fixture browser attraversa fisicamente una casella prima bloccata dalla destinazione invisibile, poi riproduce tutorial, arrivi, adozione al confine e due cure con A/touch.
- Restano obbligatorie tutte le verifiche precedenti: storia, menu, salvataggi, audio attivo/interrotto,20.000 input,12.000 direzioni nei menu,600 salvataggi,80 mappe di ricerca del percorso,30 riprese di checkpoint,634 combattimenti di stress e559 mosse in esecuzione di controllo. Le83 coppie personalizzate vengono provate su entrambi i lati (166 percorsi dei log) e in1.660 fotogrammi per formato.

Il nuovo stadio viene eseguito sia nella CI delle PR sia prima della pubblicazione Pages. La suite completa comprende199 test Node,3 Python e11 fasi automatiche. I rapporti della consegna indicano build, formati e prove effettivamente concluse; una prova disponibile ma non eseguita non è dichiarata superata.

## Limiti

Le verifiche grafiche usano un browser desktop con formati desktop e telefono; non certificano ogni GPU Android fisica. Il controllo delle559 mosse verifica esecuzione e integrità, non ogni regola contro una console. Non è stato eseguito un confronto audio udibile. Le prove di corruzione riguardano i record di viaggio specificati, non qualunque possibile alterazione del salvataggio. Nessuna dichiarazione di assenza assoluta di bug.
