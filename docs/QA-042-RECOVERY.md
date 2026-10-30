# Recupero delle risorse di lotta · manutenzione 0.42

La verifica del sito dopo la PR #33 ha rilevato un errore intermittente su `move-panel-type-11.png`. La risposta pubblica successiva era HTTP 200, PNG di 1.105 byte identico alla build: nessun file mancante. Il [log del browser](qa-042-recovery/public-error-before.json) conserva l'errore originale.

Il difetto era nel recupero: `BattleScreen` convertiva il rifiuto della promessa in un risultato risolto e sostituiva i figli del pannello con il messaggio. All'ingresso nella lotta il chiamante poteva quindi proseguire con l'interfaccia incompleta e senza canvas.

## Correzione

Immagini e cataloghi usano il caricatore limitato e ritentabile esistente. Le richieste uguali restano condivise; quelle fallite vengono rimosse dalla cache. L'inizializzazione può ripartire dopo un fallimento, conserva il canvas e propaga l'errore se anche i tentativi successivi falliscono. Il chiamante della lotta conserva così il proprio percorso di recupero dal salvataggio. Non vengono modificati mosse, meccaniche, geometria o disegno dei menu.

La build Windows è `ef85407600c38c9b`. Il [confronto delle build](qa-042-recovery/change-scope.json) delimita le modifiche del runtime; le prove visive complete delle animazioni restano quelle della [0.42 precedente](QA-042.md). Questa manutenzione ricollauda il caricamento e i flussi dell'interfaccia coinvolti, senza attribuire alla nuova build un'altra esecuzione della matrice da 3.620 fotogrammi.

## Verifiche

- [Suite CLI](qa-042-recovery/report.json): tutte le 15 fasi. La prima fase include 230 test Node e la suite Python ne include quattro. Dopo l'aggiunta della regressione della fixture, la [suite unitaria completa aggiornata](qa-042-recovery/unit-final.log) passa con 231 test Node.
- [Desktop](qa-042-recovery/desktop.json), [telefono verticale](qa-042-recovery/portrait.json), [orizzontale](qa-042-recovery/landscape.json): un'intera richiesta dell'immagine viene rifiutata deliberatamente durante l'avvio; la seconda inizializzazione riesce. Si controllano canvas conservato, turni reali doubles/multi, bersagli e animazioni sui due lati, 600 direzioni nei menu, quattro categorie e 400 direzioni nella Borsa, cinque ambientazioni e separazione dei riquadri dell'HUD.
- La fixture installa ora i controlli degli errori prima dell'app anche quando l'HTML omette il tag head, sintassi valida usata dalla distribuzione. La regressione copre head esplicito e implicito. Il [primo tentativo](qa-042-recovery/fault-fixture-first-attempt.json) non aveva iniettato il guasto ed è conservato come FAIL; non è una prova di recupero riuscito. Anche la raccolta globale degli errori d'avvio dei precedenti rapporti aveva questo limite; le loro misure grafiche e asserzioni esplicite restano valide.

La prova è confinata alla fixture localhost con `battleResourceFault=1`: nessuna iniezione o pannello tecnico entra nella demo pubblica. I test non usano i salvataggi del giocatore. I limiti relativi a confronto audio udibile, GPU Android fisiche e assenza assoluta di bug restano quelli della 0.42.
