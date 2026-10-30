# Preparazione del capitolo fino ad Austropoli: limite 25

L’utente ha scelto esplicitamente il limite 25 il 30 ottobre 2026. Questo documento conserva i controlli della preparazione: la progressione successivamente collegata è descritta in [NACRENE-CASTELIA-043.md](NACRENE-CASTELIA-043.md), con stato di consegna e prove della build completa in [QA-043.md](QA-043.md). I rapporti della sola preparazione sotto non certificano il capitolo narrativo.

`training-data.js` separa dai dati IRBI del nuovo capitolo le tabelle di crescita, mosse, evoluzioni, slot abilità e compatibilità. `training.js` applica un’unica soglia a esperienza delle lotte, Caramelle Rare e Pensione. Non abbassa livello o esperienza dei vecchi salvataggi oltre il limite. Alla Pensione non avviene l’evoluzione.

Le evoluzioni per livello sono gestite dopo l’esperienza della lotta o della Caramella Rara, mantenendo soprannome, personalità, natura, IV, EV, sesso, provenienza, strumenti, PP e deficit di PS. Cambia lo slot corrispondente dell’abilità: per esempio Raccolta di Lillipup diventa Remasabbia di Herdier. Si apprendono anche le mosse previste al livello dell’evoluzione. La normalizzazione riconosce Servine, Pignite e Dewott come discendenti dello starter originale, anche alla Pensione.

La transizione di evoluzione è un adattamento HD-2D con compositi originali, interrompibile con B/touch; A non interrompe. Un caricamento fallito offre un tentativo esplicito. Non è una riproduzione della sequenza grafica o musicale DS. Non attribuire a questa modifica una progressione completa dell’amicizia: i metodi per amicizia leggono il valore persistente, ma i relativi incrementi richiedono ancora una verifica nel nuovo capitolo.

`training-moves.js` conserva le coreografie precedenti e aggiunge anatomie, attacchi, emissioni e reazioni per il roster predisposto fino al 25. La matrice verificata numericamente comprende 477 coppie su 40 specie, incluse le mosse mantenute dopo evoluzione e le MT del capitolo. **Il conteggio non significa che tutte queste specie siano ottenibili nelle mappe collegate.** Gli eventi successivamente integrati, le normali tabelle del bosco e i limiti di erba che si muove/amicizia sono distinti nell’inventario [NACRENE-CASTELIA-043.md](NACRENE-CASTELIA-043.md).

Icone di squadra, schede Pokédex, impronte, tipi, ricerca e habitat sono estratti per il roster. Le scelte delle tre palette delle icone sono circoscritte e controllate visivamente; il selettore ARM generale non è portato. La ROM, gli archivi NARC e i sorgenti terzi di ricerca non sono inclusi nel sito.

## Verifiche locali

Candidata `472e4899701b3533`, directory `work/fidelity-build-043-training-final` (etichetta del builder ancora 0.42, non distribuita):

- `outputs/deep-tests-043-training-menus`: 236 test Node, 4 test Python e tutte le 16 fasi CLI PASS. Dieci evoluzioni per livello, abilità, HP/PP, metadati, mosse, annullamento, input concorrenti, esperienza oltre il limite, Pensione e salvataggi.
- `outputs/browser-043-training-menus`: PASS a 1280×720, 390×844 e 844×390. Evoluzione e annullamento tramite B touch, riepilogo e pagina Mosse di Servine, habitat originale, Vorticerba di Servine e Morso di Herdier avversario, catture dei canvas e assenza di errori del browser.
- I precedenti rapporti `deep-tests-043-training` contengono fallimenti iniziali di fixture, corretti nei rapporti successivi; non usarli come rapporto finale.
- Nessun confronto udibile, nessuna certificazione di GPU Android fisica, nessun collaudo dell’intero nuovo capitolo.

Pulizia registrata in `outputs/chapter043/cleanup-training.json`: rimosse la candidata superata `fidelity-build-043-training` e la vecchia baseline `fidelity-build-042-hud`, arrestati i relativi server. Conservati demo pubblicata 0.42 recovery, rapporti e risorse sorgenti.
