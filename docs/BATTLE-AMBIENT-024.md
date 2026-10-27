# Due specie sullo sfondo e correzione del taglio — 0.24

Ogni variante esterna del Percorso1 mostra insieme Patrat e Lillipup: sono le due specie selvatiche catturabili nella demo. Non si aggiunge una terza specie estranea agli incontri originali. Negli interni non vengono aggiunti Pokémon selvatici ambientali.

Le due presenze restano lontane: Patrat al bordo sinistro del sentiero (x3,z−17), Lillipup più indietro, presso il margine destro del sentiero distante (x5,z−23). Entrambi mantengono altezza scenica0.55, animazioni originali, ombre e profondità della geometria. Le posizioni sono libere da cartelli e tronchi davanti al corpo; non sono sovrapposte ai due combattenti. L'ordine di composizione è dal più lontano al più vicino.

Il canvas animato passa da64×80 a128×128, con corpo di riferimento64pixel e piede a104pixel. Sono così disponibili margini per testa, coda, arti e trasformazioni durante tutto il ciclo. Se una posa nativa porta i pixel opachi sotto il riferimento del piede, la composizione viene sollevata fino al piano di appoggio, evitando che il terreno ne tagli la parte inferiore. I salti verso l'alto restano visibili. La grandezza del canvas non ingrandisce artificialmente il Pokémon nel mondo.

Audit nel renderer reale:770 pose del ciclo congiunto di Patrat e384 di Lillipup, con zero canvas tagliati, zero fotogrammi vuoti e zero piedi opachi sotto il suolo dopo l'allineamento. L'audit considera il periodo congiunto delle tracce animate originali, non un solo fotogramma rappresentativo. Una posa integra può essere comunque occultata dalla geometria: per questo sono stati scelti e verificati anche punti liberi del fondale.

I test controllano il riferimento del piede e i margini del canvas128×128, entrambe le specie in entrambe le varianti, profondità, dimensioni e separazione dalle sagome di lotta su desktop/telefono/orizzontale. Prove visive con due presenze insieme in sentiero ed erba, senza modificare incontri, motore GEN5 o salvataggi. I Pokémon ambientali restano decorativi e utilizzano le pose originali di battaglia adattate alla scena HD-2D.
