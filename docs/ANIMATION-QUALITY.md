# Metodo per tutte le animazioni

Richiesta permanente del20 novembre2026, dopo il rifiuto estetico del lancio0.62. Integra gli standard A–H; non riduce copertura per specie/forma–mossa, esclusività delle MN, regole di combattimento, fedeltà, continuità degli NPC, audio, prestazioni o regressioni.

## Ambito e strumenti

Applicare alle animazioni nuove e modificate: personaggi e introduzione, Pokémon e mosse sui due lati, reazioni e stati, MN sul campo, oggetti, camera, passaggi generazionali e interfacce. Le risorse native rimangono il riferimento per identità e stile. Conservare gli originali quando occorrono pose autoriali; dichiarare cosa proviene dalla ROM e cosa viene adattato.

Skill installate: [Sprite Animation, revisione d26f3ac](https://github.com/asaeed/sprite-animation-skill/tree/d26f3acc9da07f91c69fbb9b6f44628f747eabd7), [Pixel Art Fundamentals, revisione056b13a](https://github.com/ProkStudio/skills/tree/056b13a91db5d0bb6a195f5271360aaf82270fdb/skills/game/2d/pixel-art-fundamentals). Usare le istruzioni specifiche quando disponibili; il metodo seguente resta applicabile senza dipendere da un percorso personale. Per nuove immagini raster usare Imagegen disponibile, preservando prompt, riferimenti e originali. Il solo strumento non garantisce qualità.

Risoluzione, palette, proiezione, destinazione, comandi e dimensioni già stabiliti dal progetto sono risposte valide al brief. Non chiedere conferme o dettagli già forniti. Rispettare il lavoro senza controllo del PC: browser invisibili isolati, mai finestre personali o primo piano.

## Progettazione prima dei ritocchi

1. Individuare la fase più difficile e scegliere il metodo adatto. Un rig piano richiede parti complete e superfici nascoste; per cambi di sagoma o profondità usare pose dedicate o un rig adeguato, senza deformare oltre misura una singola immagine.
2. Scrivere pose e tempi: preparazione, trasferimento del peso, azione/contatto, accompagnamento e recupero. Variare ritmo e distanza fra pose secondo il gesto. Descrivere cosa fanno spalla, gomito, polso, bacino e appoggi pertinenti.
3. Definire riferimenti anatomici stabili, proprietà delle parti, presa e ancoraggi. La sfera o lo strumento devono toccare il palmo, non essere centrati sul polso. La traiettoria libera deve proseguire lo slancio delle pose effettivamente mostrate. Per cels discreti usare lo spostamento fra contatti autoriali, non una falsa derivata di una posa immobile.
4. Preparare una sequenza rappresentativa prima di espandere il lavoro. Una bocciatura strutturale ripetuta richiede un metodo o una sorgente migliori. Non basta aumentare FPS, ampiezza o numero di profili.

## Disegno e pacchetto

- Controllare identità, proporzioni, silhouette, articolazioni, palette e materiali a scala nativa e ingrandita. Niente arti di gomma, cambi involontari di scala o particolari incoerenti tra fotogrammi.
- Registrare i fotogrammi su piede, sedile, presa o altro punto significativo; non centrare ogni riquadro visibile. Distinguere movimento reale dell'appoggio e scorrimento introdotto dal ritaglio.
- Validare trasparenza reale, margini, contorni, ordine delle celle, durate e densità dei pixel. Impacchettare deterministicamente le pose già prodotte, senza spacciare ritagli duplicati o sola traslazione per un nuovo gesto.
- Conservare dimensioni logiche e campionamento del motore. Preparare il banco completo prima di mostrarlo. Riutilizzare superfici e atlanti; niente decodifiche, contesti o texture creati a ogni fotogramma.

## Quattro giudizi distinti

1. **Sorgente:** figura completa, identità, anatomia, superfici, colori e alpha.
2. **Movimento:** progressione completa, ritmo, contatti, appoggi, accompagnamento e recupero. Esaminare tutti i fotogrammi consegnati, riproduzione normale e rallentata, confini e salti. Una carta generata ma non esaminata non è una revisione.
3. **Pacchetto:** celle decodificate, ordine, ancoraggi, alpha, margini e durata. Il numero di pixel o l'assenza di duplicati non giudicano la bellezza.
4. **Integrazione:** comando e renderer effettivi, touch/tastiera, desktop e telefoni, ×1/×2/×4, frame lenti, sospensione, errori e recupero pertinenti. Conservare audio e meccaniche. Nessuna approvazione visiva dedotta da un PASS matematico.

Conservare candidati rifiutati, difetti osservati e ambito delle prove. Una seconda lettura dello stesso agente non è una revisione indipendente. Non richiedere agenti o servizi aggiuntivi se non autorizzati. Il giudizio estetico dell'utente prevale sulle precedenti autovalutazioni.

## Stato della revisione

| Ambito | Stato al20 novembre2026 |
| --- | --- |
| Lancio Aralia0.62 | Rifiutato dall'utente per movimento innaturale; baseline tecnica e visiva preservata |
| Lancio Aralia0.63 | Pose autoriali e percorso di verifica in [ARALIA-AUTHORED-063.md](ARALIA-AUTHORED-063.md); consegna dipendente da prove effettive |
| Mosse, reazioni, MN, NPC, altre transizioni | Regola applicabile da ora; nessuna nuova certificazione globale ottenuta dalla modifica di questo documento |

Ogni successiva modifica aggiorna l'inventario pertinente con metodo, pose, riferimenti, esiti osservati e limiti. Tenere distinti richiesto, implementato, esaminato, collaudato e pubblicato.
