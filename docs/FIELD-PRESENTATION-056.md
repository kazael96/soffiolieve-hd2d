# Leggibilità e tempi delle MN · 0.56

La0.55 documentava due limiti: edifici in primo piano che nascondevano parte della salita su Volo e pose saltate a×4 con pochi fotogrammi al secondo. Stato corrente: correzioni implementate, accettazione finale ancora da completare.

Durante Volo la camera sale temporaneamente ad almeno62°, prima della salita del protagonista; resta alta durante la partenza e ritorna alla visuale precedente durante il richiamo dopo l'atterraggio. La proiezione del sedile segue lo stesso pitch della scena. Edifici, tetti, alberi, quote native e coordinate di destinazione restano fisici; non viene esclusa la loro profondità per mostrare il Pokémon attraverso gli ostacoli. Zoom e camera esterni all'azione vengono ripristinati.

Il vecchio ciclo avanzava tutti i passi di velocità prima di disegnare un solo fotogramma. Ora la presentazione conserva i tempi delle pose autoriali e i punti fisici di preparazione, contatto, salita e discesa. Fra due fermate il progresso non supera0.08. `present()` compone la carta; soltanto `rendered(renderer)`, chiamato dopo il disegno del mondo e del passaggio finale, conferma il fotogramma. Una carta preparata, un frame saltato, una scheda nascosta o un contesto perso non costituiscono conferma. Una conferma vecchia non libera una nuova azione.

Taglio applica una sola volta il contatto a0.52, dopo una preparazione mostrata, e conclude dopo il recupero disegnato. Partenza e arrivo di Volo conservano le rispettive pose. Surf applica la stessa conferma alle transizioni di salita/discesa, conserva l'endpoint nel salvataggio e lo completa dopo un fotogramma valido; nuoto libero e percorribilità mantengono le regole precedenti. Cache e conferme restano fuori dai dati persistenti.

Il replay della candidata03 ha individuato un recupero incompleto: dopo il rilascio del banco grafico e il ripristino di una salita Surf ancora occupata, le barriere attendevano una risorsa che il vecchio `tick` ricaricava soltanto a movimento terminato. La correzione prepara nuovamente il Pokémon anche durante la transizione, attraverso lo stesso gestore di risorse; mantiene ferma la fisica fino alla disponibilità del banco e non ripete il cut-in o l'evento. La regressione CPU fallisce sul codice precedente e passa sulla correzione; il replay grafico della nuova candidata resta necessario.

A FPS insufficienti non è possibile mostrare tutti i gesti conservando contemporaneamente la durata nominale di×4: viene privilegiata la sequenza visibile. La durata della presentazione può quindi aumentare. Questa scelta non modifica danni, PP, disponibilità delle MN, flag applicati o coordinate raggiunte.

Le baseline reali fallite sono conservate in `outputs/chapter056-preparation/cpu-field-render-barriers`. Il confronto iniziale della camera usa un overlay dichiarato dei sorgenti sulla0.55 e non certifica la candidata finale. I replay della candidata e gli esiti effettivi sono registrati separatamente in [QA-056.md](QA-056.md).
