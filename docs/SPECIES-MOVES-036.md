# Animazioni della partita nella demo 0.36

Perimetro richiesto: tutte le mosse utilizzabili nella partita della demo. Le cinque specie ottenibili possono arrivare al livello100: vengono inclusi tutti i loro learnset per livello IRBI, senza introdurre un limite artificiale. N conserva la squadra originale con Purrloin/Graffio/Ruggito; Minccino usa Botta nel tutorial. Scontro è coperto per tutte le sette specie, anche se il tutorial guidato non può esaurire i PP. Nessuna nuova specie ottenibile, MT o fonte di apprendimento viene aggiunta. Le scelte arbitrarie del laboratorio tecnico non rappresentano mosse apprendibili nella partita.

83 coppie: 21 profili precedenti conservati e62 aggiunti. Ricette e coefficienti anatomici in `src/demo-moves.js`; perni originali dei cinque rig precedenti riutilizzati. Minccino: parti frontali/posteriori identificate nei PNG/OAM originali (testa, orecchie, braccia, piedi e coda); perni della coda condivisi fra tasselli per evitare distacchi. Purrloin mantiene il composito intero.

Le nuove pose sono adattamenti HD-2D. Gli effetti SPA, le animazioni CLACT disponibili, i movimenti della camera e i suoni originali vengono conservati sul proprio clock; preparazione/contatto/recupero e audio vengono sincronizzati tramite il punto di impatto. I risultati e le varianti del motore di lotta restano invariati. Le azioni su se stessi non fanno reagire l’avversario; un mancato bersaglio non riceve l’urto. Rotolamento usa il centro del corpo e compensa la sagoma inferiore per mantenere l’appoggio.

## Matrice

Stato: implementata; verifiche esatte nel rapporto della build consegnata. Non equiparare questi adattamenti a una riproduzione pixel per pixel della console.

| Pokémon | Mossa | Fonte nella partita | Profilo | Azione |
| --- | --- | --- | --- | --- |
| Snivy | Azione (33) | Livello 1 | snivy-33 | profilo precedente |
| Snivy | Fulmisguardo (43) | Livello 4 | snivy-43 | profilo precedente |
| Snivy | Frustata (22) | Livello 7 | snivy-22 | profilo precedente |
| Snivy | Avvolgibotta (35) | Livello 10 | snivy-35 | profilo precedente |
| Snivy | Crescita (74) | Livello 13 | snivy-74 | grow |
| Snivy | Vorticerba (536) | Livello 16 | snivy-536 | leafVortex |
| Snivy | Parassiseme (73) | Livello 19 | snivy-73 | seed |
| Snivy | Megassorbim. (72) | Livello 22 | snivy-72 | drain |
| Snivy | Schianto (21) | Livello 25 | snivy-21 | tailSlam |
| Snivy | Fendifoglia (348) | Livello 28 | snivy-348 | leafBlade |
| Snivy | Arrotola (489) | Livello 31 | snivy-489 | coil |
| Snivy | Gigassorbim. (202) | Livello 34 | snivy-202 | drainStrong |
| Snivy | Strizzata (378) | Livello 37 | snivy-378 | squeeze |
| Snivy | Gastroacido (380) | Livello 40 | snivy-380 | acid |
| Snivy | Verdebufera (437) | Livello 43 | snivy-437 | leafStorm |
| Snivy | Scontro (165) | PP esauriti | snivy-165 | struggle |
| Tepig | Azione (33) | Livello 1 | tepig-33 | profilo precedente |
| Tepig | Colpocoda (39) | Livello 3 | tepig-39 | profilo precedente |
| Tepig | Braciere (52) | Livello 7 | tepig-52 | profilo precedente |
| Tepig | Segugio (316) | Livello 9 | tepig-316 | profilo precedente |
| Tepig | Ricciolscudo (111) | Livello 13 | tepig-111 | curl |
| Tepig | Nitrocarica (488) | Livello 15 | tepig-488 | flameRush |
| Tepig | Smog (123) | Livello 19 | tepig-123 | smoke |
| Tepig | Rotolamento (205) | Livello 21 | tepig-205 | roll |
| Tepig | Riduttore (36) | Livello 25 | tepig-36 | bodyRam |
| Tepig | Marchiafuoco (535) | Livello 27 | tepig-535 | fireRing |
| Tepig | Garanzia (372) | Livello 31 | tepig-372 | ambush |
| Tepig | Lanciafiamme (53) | Livello 33 | tepig-53 | flameJet |
| Tepig | Zuccata (457) | Livello 37 | tepig-457 | headRam |
| Tepig | Boato (46) | Livello 39 | tepig-46 | roar |
| Tepig | Fuococarica (394) | Livello 43 | tepig-394 | flareRush |
| Tepig | Scontro (165) | PP esauriti | tepig-165 | struggle |
| Oshawott | Azione (33) | Livello 1 | oshawott-33 | profilo precedente |
| Oshawott | Colpocoda (39) | Livello 5 | oshawott-39 | profilo precedente |
| Oshawott | Pistolacqua (55) | Livello 7 | oshawott-55 | profilo precedente |
| Oshawott | Docciascudo (346) | Livello 11 | oshawott-346 | shellGuard |
| Oshawott | Focalenergia (116) | Livello 13 | oshawott-116 | focus |
| Oshawott | Conchilama (534) | Livello 17 | oshawott-534 | shellSlash |
| Oshawott | Tagliofuria (210) | Livello 19 | oshawott-210 | furySlash |
| Oshawott | Idropulsar (352) | Livello 23 | oshawott-352 | waterPulse |
| Oshawott | Vendetta (279) | Livello 25 | oshawott-279 | counterPalm |
| Oshawott | Acquagetto (453) | Livello 29 | oshawott-453 | waterRush |
| Oshawott | Ripeti (227) | Livello 31 | oshawott-227 | clap |
| Oshawott | Idrondata (401) | Livello 35 | oshawott-401 | waterTail |
| Oshawott | Nemesi (514) | Livello 37 | oshawott-514 | retaliate |
| Oshawott | Danzaspada (14) | Livello 41 | oshawott-14 | swordDance |
| Oshawott | Idropompa (56) | Livello 43 | oshawott-56 | hydroJet |
| Oshawott | Scontro (165) | PP esauriti | oshawott-165 | struggle |
| Patrat | Azione (33) | Livello 1 | patrat-33 | attack |
| Patrat | Fulmisguardo (43) | Livello 3 | patrat-43 | status |
| Patrat | Morso (44) | Livello 6 | patrat-44 | attack |
| Patrat | Pazienza (117) | Livello 8 | patrat-117-prepare | prepare |
| Patrat | Individua (197) | Livello 11 | patrat-197 | watch |
| Patrat | Turbosabbia (28) | Livello 13 | patrat-28 | sandKick |
| Patrat | Sgranocchio (242) | Livello 16 | patrat-242 | crunch |
| Patrat | Ipnosi (95) | Livello 18 | patrat-95 | hypnosis |
| Patrat | Superzanna (162) | Livello 21 | patrat-162 | superFang |
| Patrat | Cortesia (495) | Livello 23 | patrat-495 | bow |
| Patrat | Cuordileone (526) | Livello 26 | patrat-526 | rally |
| Patrat | Iperzanna (158) | Livello 28 | patrat-158 | hyperFang |
| Patrat | Malosguardo (212) | Livello 31 | patrat-212 | meanLook |
| Patrat | Staffetta (226) | Livello 33 | patrat-226 | baton |
| Patrat | Schianto (21) | Livello 36 | patrat-21 | tailSlam |
| Patrat | Scontro (165) | PP esauriti | patrat-165 | struggle |
| Lillipup | Fulmisguardo (43) | Livello 1 | lillipup-43 | profilo precedente |
| Lillipup | Azione (33) | Livello 1 | lillipup-33 | profilo precedente |
| Lillipup | Segugio (316) | Livello 5 | lillipup-316 | profilo precedente |
| Lillipup | Morso (44) | Livello 8 | lillipup-44 | profilo precedente |
| Lillipup | Altruismo (270) | Livello 12 | lillipup-270 | encourage |
| Lillipup | Riduttore (36) | Livello 15 | lillipup-36 | bodyRam |
| Lillipup | Cuordileone (526) | Livello 19 | lillipup-526 | rally |
| Lillipup | Sgranocchio (242) | Livello 22 | lillipup-242 | crunch |
| Lillipup | Boato (46) | Livello 26 | lillipup-46 | roar |
| Lillipup | Nemesi (514) | Livello 29 | lillipup-514 | retaliate |
| Lillipup | Contropiede (179) | Livello 33 | lillipup-179 | flail |
| Lillipup | Ultimascelta (387) | Livello 36 | lillipup-387 | lastResort |
| Lillipup | Gigaimpatto (416) | Livello 40 | lillipup-416 | gigaRush |
| Lillipup | Scontro (165) | PP esauriti | lillipup-165 | struggle |
| Purrloin | Graffio (10) | Lotta con N | purrloin-10 | profilo precedente |
| Purrloin | Ruggito (45) | Lotta con N | purrloin-45 | profilo precedente |
| Purrloin | Scontro (165) | PP esauriti | purrloin-165 | struggle |
| Minccino | Botta (1) | Tutorial di Aralia | minccino-1 | tailPound |
| Minccino | Scontro (165) | PP esauriti | minccino-165 | struggle |

## Verifiche

`demo-moves.test.cjs`: copertura indipendente degli83 abbinamenti, pose finite e recupero di ogni fotogramma sui due lati, differenze fra specie sulle mosse condivise, perni di Minccino, reazioni, PP esauriti, sincronizzazione e mantenimento degli effetti originali, appoggio durante Rotolamento. `check-opponent-runtime.cjs`:166 percorsi reali del registro di lotta, incluso Scontro con PP realmente azzerati. La fixture browser deriva la matrice dai learnset originali, prova entrambi i lati e hit/miss, con cinque campioni per animazione (1.660 fotogrammi). Le tre fasi di Pazienza restano coperte dai test specifici precedenti. La suite precedente resta obbligatoria per storia, menu, salvataggi, rendering e velocità.

Limiti: nessuna certificazione di tutte le GPU fisiche Android, confronto audio udibile o assenza assoluta di bug. Le mosse arbitrarie del laboratorio tecnico e i repertori da MT/allevamento non presenti nell’avventura restano fuori da questa matrice.
