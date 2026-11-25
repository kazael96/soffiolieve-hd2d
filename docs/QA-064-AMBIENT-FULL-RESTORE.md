# Ripristino delle letture complete degli sprite ambientali

## Decisione del25 novembre2026

Il runtime torna all'implementazione FULL originale di `battle-diorama.js`, SHA256 `e36f3903827cedcb0ebced1d747d3ea1c21f79fa6c982a341e4ed77de57ead9f`. Nessuna delle due ottimizzazioni sperimentali viene adottata. Il readback rettangolare aveva superato l'equivalenza dei pixel ma peggiorava i tempi dell'app nei riferimenti R4/R5.

La successiva alpha memo V2 resta privata. Passa46casi/2407coppie CPU e Chrome, invalidazione temporale e proprietà delle risorse comprese. Un solo confronto ABBA dell'app, FULL→MEMO→MEMO→FULL, verifica399programmi eseguiti, stessi comandi/esiti GEN5 e binding originari, zero breakpoint, immagini, errori e processi residui. Cambia soltanto la risposta privata del modulo Diorama; nessuna nuova build è dedotta dall'override.

La memo evita47,3–49,0% delle letture dei due attori eleggibili e migliora la mediana degli aggiornamenti non memorizzati da7,9–8 a6,4–6,6ms. Il peggioramento della coda impedisce però di approvare un beneficio netto:

| Variante | P95 cold, due prove | P95 warm, due prove |
| --- | --- | --- |
| FULL |17,3 /18,7ms|18,9 /17,6ms|
| MEMO |28,7 /24,1ms|23,6 /18,8ms|

Gli aggiornamenti pubblici da almeno50ms sono13/402cold con MEMO contro6/397con FULL; warm6/389contro5/394. Non sono contati due volte i GID annidati. Tutti i campioni e gli estremi restano nei rapporti, compresi745,5ms cold e513,6ms warm della prima FULL. Una sola ABBA non ne dimostra la causa. Root e revisore indipendente concordano sul ripristino; nessuna promessa FPS o misura Android fisica e nessuna terza variante.

## Regressioni mantenute

- Owner ambientale:32casi/2340coppie PASS in30311ms, picco138768KiB, sorgenti invariati. A esegue il controllo ROI storico distinto; B estrae la FULL corrente dal vero runtime. Uguaglianza di tutti i byte RGBA del frame e della superficie finale, metriche, cicli completi, riuso, risorse e20fault/fallback. B deve leggere tutti65536pixel; A conserva sia i rettangoli ridotti positivi sia i fallback FULL. Anche il vecchio contesto avvelenato dello step09 è verificato esplicitamente su entrambi i lati.
- Provider reale:5casi PASS in600ms. La migrazione `coherent-v4-original-full-restored` ripristina tutti i pin sorgente V4 originali, preserva separatamente V4 e V4+ROI e aggiunge la provenienza esplicita. Rimangono rifiutate mutazioni sostanziali, geometriche e dei byte nativi; LF/CRLF sono ammessi soltanto nel dominio dichiarato.
- Inventario invariato:425file test,52processi unitari e93fasi CLI. Restano170s/RSS400MiB interni,180s per fase, heap400MiB, GC e yield ogni32coppie. Nessun test disattivato. Questi PASS mirati non sostituiscono la nuova CI completa del commit ripristinato.

Le prove sono conservate fuori dalle build in `outputs/ci064green/full-restored-targeted-v1`, `ambient-alpha-actualapp-v1` e relativi rapporti indipendenti. I precedenti FAIL rimangono tali, incluso il falso controllo di teardown dell'observer, corretto con diagnostico causale e riesecuzione del solo gruppo interessato. Programmi e metadati usano esclusivamente canonicalizzazione CRLF→LF; PNG/JSON nativi conservano SHA RAW.

## Standard A–H e consegna

La modifica interessa presentazione delle lotte, risorse e regressioni. L'equivalenza conserva terreno, appoggi e sprite ambientali; NPC, camera, menu, comandi, meccaniche, audio e salvataggi non ricevono nuovo codice. I relativi controlli completi restano da riferire al nuovo commit. Le nuove pose private di Minccino non sono installate da questo ripristino e hanno un'accettazione separata.

H.8 completato: tutti32009file/1136523784byte della C13 respinta sono ricostruiti e verificati da base04 più delta, poi la sola directory generata C13 è rimossa. Restano04obbligatoria,08verificata e12confronto, oltre a sorgenti, ROM e rapporti. L'eventuale riuso della12 richiede ancora la verifica dell'esatto codice e degli asset; non viene rinominata come nuova revisione. Nessun merge, deploy o approvazione artistica globale segue dai soli PASS mirati.
