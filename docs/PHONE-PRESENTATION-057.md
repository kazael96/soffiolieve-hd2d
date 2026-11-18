# Interpoké: volti originali e spazio dei comandi · 0.57

Questa correzione risolve due difetti visibili nella chiamata Mamma–protagonista: i comandi ×4/Ricomincia coprivano il nome del partecipante di destra e il volto della madre mostrava tasselli estranei sul collo. La stessa assegnazione errata delle risorse riguardava anche Anita, Alcide e Komor.

## Inventario delle risorse

La ROM italiana IRBI conserva i ritratti completi e le celle del volto in ordini diversi nell'archivio `a/1/3/1`. Le associazioni sono state controllate sui colori delle palette originali, sulla geometria OAM e sui confronti visivi di tutte le espressioni; non viene dichiarato un tracciamento della tabella del caricatore nativo. Non sono stati ridisegnati o ricolorati i tasselli.

| Identità | Ritratto | Celle del volto | Palette/immagine base | Palette/grafica/celle volto |
| --- | ---: | ---: | --- | --- |
| Aralia | 0 | 0 | 18 / 24 | 39 / 40 / 41 |
| Mamma | 5 | 1 | 23 / 34 | 43 / 44 / 45 |
| Anita | 1 | 2 | 19 / 26 | 47 / 48 / 49 |
| Alcide | 2 | 3 | 20 / 28 | 51 / 52 / 53 |
| Komor | 3 | 4 | 21 / 30 | 55 / 56 / 57 |
| Belle | 4 | 5 | 22 / 32 | 59 / 60 / 61 |

Le celle 96×96 si compongono all'origine (16, 56) del ritratto 128×192. Sono corretti 36 PNG: nove per Mamma, Anita, Alcide e Komor. I diciotto PNG di Aralia e Belle sono identici ai precedenti. I maschi e Anita conservano la mobilità effettivamente presente nelle rispettive risorse: le celle di Anita e Alcide cambiano gli occhi e hanno la bocca fissa. Non viene simulata un'animazione della bocca assente.

L'estrattore di identità aggiorna anche i riferimenti con SHA di Anita e l'immagine introduttiva di Komor e Belle. Il nome salvato e il sesso del protagonista restano risolti da `PlayerIdentity`; il cambio di risorse non cambia i dati della partita.

## Impaginazione

`phoneCall` misura il rettangolo effettivo dei comandi e colloca la prima fila almeno otto pixel sotto il suo bordo inferiore. Ricalcola lo spazio delle righe prima della finestra del messaggio. Osserva dimensioni e attributi pertinenti di messaggio e comandi, oltre alla rotazione. Quando i comandi si nascondono, rimuove la riserva precedente. Alla chiusura scollega tutti gli osservatori e rimuove il pannello della chiamata.

## Prove e limiti

I comandi touch spostati dentro il dialogo ereditavano il testo scuro della
finestra: la baseline reale misura1,28:1. Il contenitore ora conserva il colore
chiaro del campo; lo stato premuto mantiene testo scuro sul proprio fondo
chiaro. La fixture misura i sei pulsanti A/B/frecce effettivi, con contrasto
minimo4,5:1, sfondi RGBA e opacità, senza cambiare dimensioni o aree di tocco.
Il controllo fallito e le sue immagini restano nel rapporto della candidata02.

- Baseline riproducibile: il nuovo controllo CPU del layout fallisce perché manca lo spazio dei comandi; il controllo dei volti fallisce per le quattro identità coinvolte e passa per Aralia e Belle.
- Dopo la correzione: dodici test mirati superati, con verifiche del layout nei tre formati, riadattamento, identità femminile, chiamate 5/6 e pulizia degli osservatori.
- Rivisti i sei fogli prima/dopo, ciascuno con nove espressioni per riga, e l'immagine introduttiva degli amici. SHA, sorgente nativa e revisione sono in `outputs/chapter057-preparation/phone-native/portrait-provenance.json` e `manual-review.json`, esterni alle build. Il fixture versionato `tests/fixtures/phone-native-057.json` fissa l'assegnazione e gli SHA dei 54 fotogrammi.
- La fixture grafica misura la separazione fra comandi, partecipanti e messaggio. `qaPhoneIdentity057` esegue le chiamate 2/5/6 con nome Élisa, personaggio femminile, touch e ×4; `qaPhone` conserva le chiamate 1–4 e `qaPhone050` la chiamata 6. Le catture DOM mostrano il layout effettivo, separatamente dai fogli dei ritratti.

Questo documento registra implementazione e prove mirate dei sorgenti. Le prove grafiche della candidata, la suite completa e la pubblicazione devono essere riportate separatamente dal rapporto finale della 0.57. Nessuna certificazione di GPU Android fisica o confronto udibile è attribuita a queste prove.
