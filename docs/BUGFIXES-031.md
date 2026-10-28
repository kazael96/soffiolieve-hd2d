# Correzioni mobile e navigazione — 0.31

Segnalazioni: laboratorio sovraesposto, blocco occasionale sul Percorso1 risolto ricaricando, righe sui Pokémon in lotta e navigazione dei menu poco affidabile. Il momento esatto del blocco e lo stato audio/velocità non erano disponibili: non si attribuisce il singolo episodio a una causa certa.

## Laboratorio e grafica mobile

Il renderer applicava anche agli interni la tinta calda, la luce solare aggiunta, il bloom e la nebbia esterna. Gli interni ora hanno luce neutra più contenuta; niente sole/bloom/nebbia esterna. Geometria e texture originali conservate, profilo esterno invariato.

Ogni resize ora elimina entrambi i vecchi framebuffer, le due texture di destinazione e il depth buffer prima di ricrearli. La barra del browser mobile può ridimensionare frequentemente il campo: prima restavano allocazioni obsolete. In caso di perdita del contesto WebGL, la simulazione del campo si ferma; al ripristino si ricreano shader, mesh, texture e risorse dei modelli animati, mantenendo scena, camera, attori e sequenza. Le misure di visibilità precedenti vengono invalidate: nessun attore viene rimosso sulla base di un probe mancante.

Prova browser: perdita/ripristino esplicita tramite WEBGL_lose_context, ritorno alla stessa scena lab senza reload e senza errori shader. Stress unitario di60 resize: rimangono soltanto2 texture,2 framebuffer e1 depth buffer attivi.

## Attese degli eventi

Un personaggio nascosto con movimento ambientale pendente non deve tenere aperta settleAmbient. La preparazione dell'evento rientra nel blocco try/finally per rilasciare correttamente eventRunning.

Suoni e versi non dipendono più indefinitamente da onended quando Web Audio resta sospeso in primo piano. Si tenta la ripresa al gesto dell'utente; se il contesto rimane sospeso, la singola voce viene chiusa dopo due controlli a intervalli di un secondo e l'evento prosegue. I controlli non tagliano suoni mentre il contesto funziona, la scheda è nascosta o la musica è in loop. Fetch audio interrotti dopo15 secondi su connessioni ferme.

`check-mobile-runtime.cjs` esegue l'intera apertura fino alla partenza e al confronto dopo il tutorial in9 combinazioni: velocità1/2/4 × audio spento/in esecuzione/sospeso. Include un attore nascosto in fase4 e verifica sblocco, variabili della storia e5 Poké Ball. Si affianca alle9 prove originali di starter/esito. I casi audio usano un contesto simulato; non equivalgono a testare ogni dispositivo Android e la specifica versione di Brave dell'utente.

## Sprite Pokémon

I tasselli OAM contigui della stessa parte, posa e priorità vengono prima ricomposti a coordinate intere in una bitmap nativa. La trasformazione di testa/corpo si applica una sola volta al gruppo: niente campionamento separato dei bordi delle tile sulla destinazione. Ordine di sovrapposizione, flip, priorità e rig personalizzati conservati; gruppi intercalati da priorità diverse restano separati. Cache debole legata ai dati del Pokémon.

Prova browser degli sprite di Lillipup in lotta senza errori canvas; test dell'ordine prima/dopo raggruppamento. La segnalazione non comprendeva una foto delle righe: la correzione riguarda le giunzioni riproducibili, non certifica ogni possibile artefatto specifico del dispositivo.

## Menu

- Tasti touch: coppia keydown/keyup, nessuna freccia trattenuta sulla Mappa Città. Un tocco sposta il cursore di un passo; la tastiera mantiene il movimento continuo alla pressione.
- Il navigatore generico esclude la croce e A/B/X dall'elenco delle voci e rispetta eventi già gestiti.
- Direzioni: distanza lungo l'asse e distanza laterale pesate insieme; una voce larga lontana non attira il cursore saltando righe. Test sulle Opzioni e sui pannelli sfalsati della Squadra.
- Conferme A/B non ripetute automaticamente tenendo premuto il tasto; frecce ripetibili. Focus senza scorrimento della pagina.
- Ritorno al menu principale sulla voce usata; ritorno dal riepilogo sul Pokémon consultato.
- Riepilogo: Su/Giù sulla pagina Mosse selezionano le mosse; nel dettaglio scorrono i dettagli. Sulla pagina Info conservano il cambio del Pokémon.

Prove browser in390×844: Borsa/tasche/azioni/B, Squadra/azioni/Info/Mosse/dettaglio/B, Pokédex/lista/scheda/ricerca/B, Opzioni riga per riga, Scheda Allenatore, conferma Salva annullata, Mappa Città (cursore fermo dopo il tocco e ritorno alla Borsa). Menu di lotta: comandi, Borsa/B, griglia mosse con frecce, Squadra/B. Prove isolate dal salvataggio, con renderer del campo sostituito solo nella fixture dedicata ai menu per evitare il carico di più scene3D simultanee.

Una prova comparativa con due pagine3D aperte contemporaneamente ha fatto terminare una scheda del browser di collaudo; non viene contata come verifica riuscita. Il ripristino WebGL nella singola scena e le prove isolate dei menu sono stati verificati separatamente.

## Limiti

Restano valide le regole permanenti: niente sparizioni visibili, sfondo legato al luogo, coreografie specie+mossa. Queste correzioni non alterano statistiche, PP, apprendimento o salvataggi della storia. Non si promette l'assenza di ogni blocco futuro: la causa del singolo episodio segnalato non è identificabile dalla sola immagine.
