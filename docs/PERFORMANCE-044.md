# Caricamento per scena · 0.44

La 0.43 preparava subito 303 modelli e 2.772 texture GPU (1.874 ambienti, 898 fotogrammi degli attori), anche nella sola camera iniziale. La 0.44 prepara la geometria della scena attiva e tutti i fotogrammi degli attori necessari: all’avvio 4 modelli, 23 texture ambientali e 47 degli attori. Le risorse già caricate vengono riutilizzate; i dati originali, la qualità delle immagini e gli shader sono conservati.

## Implementazione

- `world3d.js`: piano delle risorse per scena, caricamento coalescente, epoche che impediscono upload tardivi dopo un cambio scena o ripristino GPU. Il renderer non presenta la scena finché mancano risorse. `prepareScene()` aspetta anche dopo un errore recuperabile: «Riprova» riprende lo stesso cambio mappa.
- `original-story.js`: attende le risorse prima di scoprire un cambio mappa, proseguire dopo ActorAdd/ActorNew e concludere una ricostruzione degli attori. Nessuna modifica ai percorsi narrativi o ai tempi delle mosse. Prepara l’interfaccia di lotta durante la scelta dello starter e l’avvicinamento al tutorial.
- `runtime-assets.css`: il controllo di recupero è sopra la dissolvenza, verificato con hit test reale. La scena incompleta rimane coperta.
- `runtime-assets.js`: riuso delle immagini decodificate con LRU limitata a 512 voci e 16 MiB stimati RGBA, oltre alla deduplicazione delle richieste in corso. Immagini troppo grandi non vengono trattenute; errori non diventano cache permanenti. Gli alias della revisione corrente condividono la cache, revisioni differenti restano distinte. Gli inventari esposti sono getter vivi.
- `native-ui.js`: menu principale separato dai dettagli, immagini indipendenti caricate in parallelo nel pool limitato a sei. Annullamento con B e nuove schermate invalidano i completamenti precedenti, anche durante il caricamento della Borsa.
- `battle-screen.js`: rimosso il caricamento globale all’avvio; resta l’attesa obbligatoria prima di mostrare la lotta e il recupero degli errori senza perdere i canvas.
- `audio-playback.js` / `audio-engine.js`: la scadenza copre fetch e lettura del corpo della risposta. Conservati PCM, modulazioni, pitch, volume e tempi originali.

## Misurazione

I rapporti grezzi sono conservati fuori dalle build in `outputs/performance-043` e `outputs/performance-044`. La fixture usa una partita isolata e registra separatamente preparazione delle risorse, apertura DOM, callback del browser, download, decodifica e tempi narrativi. Le misure finali e i riferimenti sono riportati in QA-044.

## Limiti

Il bundle JavaScript resta monolitico (circa 32,6 MB espansi) e conserva un task iniziale lungo. Il trasporto raggruppato scarica ancora il pacchetto globale delle immagini: questa modifica riduce soprattutto decodifiche, preparazione GPU e lavoro non necessario, non divide i dati in capitoli. La scena esterna condivisa comprende più mappe collegate e al primo ingresso richiede più lavoro della camera. Le cache GPU crescono esplorando il perimetro finito della demo; il limite LRU riguarda la cache condivisa delle immagini decodificate, non tutte le allocazioni grafiche.

Le dissolvenze native e i versi non sono trattati come rallentamenti da eliminare. Una callback requestAnimationFrame di una scheda di prova in secondo piano può essere ritardata: non va attribuita al tempo CPU del menu. La latenza del servizio Pages e le prestazioni di una GPU Android fisica non sono garantite dalle prove desktop con viewport telefono.
