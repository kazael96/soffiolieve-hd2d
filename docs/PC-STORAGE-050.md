# Sistema Memoria Pokémon · integrazione050

Fonte: ROM italiana IRBI, archivio grafico a/1/1/6 e overlay170; testi SYSTEM9/10 e STORY314. La ricerca privata `outputs/chapter050/storage-reference` conserva catene di ingresso, capacità e vincoli con hash e indirizzi. `tools/extract-pokemon-storage.py` esporta PNG, testi e provenienza.

## Funzioni collegate

- Terminale reale: A verso nord davanti al comportamento0xD6 nei Centri Pokémon. Il servizio possiede il blocco del campo e i propri checkpoint; non sblocca salvataggi durante altri script.
- Deposito, ritiro, spostamento e scambio tra squadra e celle indicizzate.8 Box iniziali,30 celle ciascuno, fino a24 Box. L'apertura espande di8 se ogni Box aperto contiene almeno un Pokémon; la cattura espande quando quelli aperti sono tutti pieni.
- Ultimo membro utilizzabile protetto (non Uovo, PS>0 secondo la conversione della squadra); deposito/rilascio con Messaggio tenuto rifiutati. Ritiro a squadra piena rifiutato. Nessuna protezione MN importata dalle generazioni precedenti.
- Il deposito ripristina i PP delle mosse disponibili; il ritiro ripristina PS e rimuove stati. Scambi dentro squadra e tra Box non applicano una cura arbitraria. Identità, forma, soprannome, IV/EV, XP, mosse, abilità, natura, genere, felicità, provenienza e strumenti supportati restano sul record.
- Cattura con sei membri inviata al primo posto legale, senza settimo membro. Soprannome anche nel Box. Se tutte720 celle sono occupate non si abilita un'altra cattura.
- Rilascio dopo conferma; NO/B/X non cancellano il Pokémon. X deve risolvere il servizio anche durante trasporto o conferma, oltre a chiudere la finestra.
- Normalizzazione senza comprimere celle vuote; record danneggiati isolati e occupazioni valide non nascoste da un numero di Box aperti incoerente. Lo starter depositato non invalida il salvataggio. Vecchie partite senza Box compatibili.

## Presentazione e limiti

Cornici, sfondo erboso, testi e icone sono originali; composizione dei pulsanti e navigazione tra pannelli sono adattamenti browser. Non si dichiara un confronto fotogramma per fotogramma con il DS. Lo sfondo decodificato usa NCGR14/NSCR13/NCLR38: abbinamento ispezionato visivamente, distinto dalla verifica del caricatore per i tre livelli principali. Non sono offerte personalizzazione sfondi/nomiBox, selezioni multiple, BoxLotta/rete, casella Messaggi, PC personale o record postgame. I PPUp non sono una fonte di potenziamento disponibile: il controller puro conserva i campi del record, ma questo non abilita PPUp nella partita.

## Prove in corso

Controller:10 prove. Integrazione: deposito starter, cattura oltre il sesto posto con soprannome, PC fisico/checkpoint, limite720 e vecchi PS mancanti. Le tre regressioni X falliscono sulla candidata9402c2d8fe884292 e passano sui sorgenti corretti.26 prove mirate complessive PASS (`storage-all-targeted.log`). Il primo browser desktop supera il percorso funzionale ma rivela sovrapposizioni e simboli non disponibili nel font; la nuova candidata richiede nuovo collaudo. I rapporti precedenti non dimostrano la correzione grafica.

La pubblicazione resta049. Suite condivisa e browser nei tre formati del PC finale ancora da completare.


### Verifica successiva

La candidata707f passa635 Node/7 Python/40 fasi e PC nei tre formati, con griglia D-pad, Invio, B/X e recupero immagine. Il rilascio dello starter e l'indice lead del Repellente hanno poi rivelato due ulteriori regressioni, corrette nei sorgenti: il record conserva un marcatore di rilascio legittimo e ogni operazione ricalcola il primo utilizzabile.28 prove mirate PASS, nuova candidata finale in preparazione. Il vecchio PASS635 non include queste due correzioni.


### Candidata verificata1e785ffa8a012933

Suite completa:637 Node,7 Python e40 fasi PASS (`deep-storage-final/report.json`). Browser: fixturec7cea4e7248153e5, PC PASS1280x720/390x844/844x390, includendo rilascio confermato dello starter nel Box, annullamenti B/X, D-pad, ritiro con Invio, serializzazione e margini dei pannelli/hitbox. Guasto desktop wallpaper:2 tentativi,1 fallimento e4 aperture corrispondenti ai4 ingressi A volontari. PNG e rapporti in `browser-storage-final`. Restano esclusi vero reload, confronto udibile, GPU Android fisica e servizi non elencati. Scheda192 chiusa, viewport ripristinato, server4211 arrestato. PC verificato in locale; pubblicazione050 ancora assente.
