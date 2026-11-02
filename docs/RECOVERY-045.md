# Ripresa automatica delle risorse · 0.45

La 0.44 ritentava già tre volte le singole immagini, ma un gruppo di risorse fallito poteva lasciare una transizione in attesa di «Riprova», oppure richiedere di ricaricare prima della lotta. La 0.45 riprende automaticamente le risorse senza ripetere la logica della partita.

## Comportamento

- `RuntimeAssets.Recovery` gestisce tre passaggi automatici aggiuntivi del gruppo fallito, con attese reali di 0,8 / 2,4 / 6 secondi. I tentativi già presenti nel caricatore delle singole risorse sono conservati. Senza rete e in background non consuma i passaggi; gli eventi online e ritorno in primo piano riattivano le operazioni ancora in attesa. A esaurimento si ferma; un nuovo ritorno della connessione/in primo piano o una richiesta manuale può iniziare un nuovo ciclo.
- «Riprova ora» può anticipare l’attesa. Durante un tentativo attivo è disabilitato e richieste concorrenti condividono la stessa promessa. Dopo l’esaurimento resta «Riprova caricamento». Non ci sono polling infinito né ricaricamenti automatici della pagina.
- Le richieste che richiedono rete falliscono prontamente quando il browser dichiara offline. Le immagini già scaricate nel pack o nella cache restano utilizzabili. Questo non garantisce il funzionamento offline dell’intera demo: musica, dati e risorse non ancora disponibili possono ancora richiedere rete.
- Scene, modelli animati e ripristino dei fondali hanno recuperi distinti. Cambio scena ed epoche invalidate cancellano i tentativi vecchi. La scena incompleta rimane coperta; lo stesso chiamante in attesa riprende quando le risorse sono complete.
- `resourceGate` mantiene in attesa le risorse critiche delle lotte e dei Pokémon. La sessione di lotta viene creata una sola volta, prima del caricamento; non vengono riapplicati comandi, PP, premi o script narrativi. I gruppi concorrenti devono completare tutti prima di riattivare il rendering. Le altre cause di pausa grafica e gli errori del driver rimangono distinte.
- Menu, Borsa e interfaccia di lotta fanno anche un secondo passaggio di preparazione quando il primo fallisce. La selezione e i controlli di revisione della 0.44 restano attivi: B annulla la schermata anche mentre le immagini continuano a caricarsi; un completamento vecchio non la riapre.
- L’evoluzione riprova le sue immagini in modo autonomo; B interrompe e cancella timer e riprese future senza applicare l’evoluzione.

I ritardi usano il tempo reale e non vengono moltiplicati da ×2/×4. Un caricamento sano non avvia tentativi aggiuntivi o un nuovo ciclo al cambio di focus. Non sono state aggiunte risorse, specie, eventi, mosse o modifiche alle regole di lotta. Restano cap 25 e inventari della 0.43, caricamento per scena e cache limitata della 0.44. Il bundle JavaScript e il pacchetto immagini globale non sono stati suddivisi in questa revisione.

## Verifica

Candidata Windows `b42581394a308389`. Suite completa: **274 test Node, 4 Python e 17 fasi PASS**, rapporto `outputs/deep-tests-045-final/report.json`. Le nuove regressioni coprono backoff, limite dei tentativi, pausa/ripresa, deduplicazione fra azione manuale e automatica, cancellazione/scene superate, completamenti tardivi, richieste offline, riuso del pack offline e attesa di gruppi critici concorrenti. La preparazione automatica della UI di lotta conserva i canvas e la promessa condivisa.

Le prove browser, con salvataggi isolati, sono in `outputs/browser-045-final`. La nuova prova forza errori all’avvio, nel cambio mappa, durante disconnessione/riconnessione, nel menu, nella UI di lotta, nello sprite del Pokémon e nell’evoluzione; non preme «Riprova». Conta le sessioni reali create per assicurarsi che il recupero non duplichi la lotta. Le regressioni manuali usano soltanto nella fixture `?manualRecovery=1`, che azzera i tentativi automatici e mantiene verificabile il controllo finale; non è un’opzione del gioco pubblicato.

Il primo rapporto desktop della nuova fixture (`report-desktop-before-draw-fix.json`) conserva un errore di cattura: il test fotografava il canvas prima di ridisegnare la destinazione. Il controllo di colore ha correttamente rifiutato la prova vuota; la cattura è stata corretta, senza modificare il runtime.

Fixture finale `07ae95520080377d`: **48 casi PASS senza errori non gestiti**, quattro prove automatiche e dodici regressioni per ciascuno dei formati 1280×720, 390×844 e 844×390. Rapporti automatici `report-automatic-1280x720.json`, `report-automatic-390x844.json`, `report-automatic-844x390.json`: tutti registrano zero clic di retry e una sola sessione di lotta. Le dodici regressioni per formato sono in `report-1280x720.json`, `report-390x844.json`, `report-844x390.json`: 40 scene/120 inquadrature e altre cinque scene native, confronto GPU/source delle 363 texture NPC caricate, tutorial reale di Aralia a ×4, controllo manuale di riserva, menu annullati, camminata e ponte a ×1, Borsa, Interpoké, sei fondali/varianti e due ripristini GPU. Indice verificato in `outputs/recovery-045/browser-index.json`.

156 sorgenti radice coincidono con la build, escluso l’HTML trasformato e verificato dai test del builder/sito (`outputs/recovery-045/source-check.json`). Sono passati anche i quattro test del generatore e dell’isolamento dei salvataggi della fixture.

La candidata iniziale è stata sostituita nello stesso percorso, conservando separatamente i rapporti (`cleanup-candidate.json`). Rimossa la build 0.43 `adb3030786ce5a18` ormai superata, con percorso/revisione e assenza di Git/collegamenti verificati; restano soltanto 0.45 e 0.44 (`outputs/recovery-045/cleanup-release.json`). Sorgenti, ROM, archivio base e prove esterne sono conservati.

La consegna usa PR e controlli GitHub prima di Pages. Dopo il deploy, il verificatore confronta versione, file radice, sorgenti normalizzati e risorse selezionate con questa build; l’esito effettivo viene registrato in `outputs/recovery-045/public-verification.json`, insieme a una prova pubblica con partita isolata. I soli controlli locali non certificano la distribuzione.

## Limiti

Una risorsa inesistente, dati invalidi, rete che continua a fallire o un problema persistente della GPU possono ancora richiedere un intervento. Il pulsante finale non viene nascosto per presentare un caricamento incompleto come riuscito. I segnali online/offline del browser non certificano che il server sia raggiungibile: per gli errori con rete apparentemente attiva valgono timeout e tentativi limitati. Restano distinti gli errori di programmazione che richiedono una ricarica esplicita. Le prove con viewport telefono non certificano ogni GPU Android fisica né l’assenza assoluta di bug.
