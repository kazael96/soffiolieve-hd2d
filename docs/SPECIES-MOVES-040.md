# Copertura Pokémon–mossa · 0.40

Le97 coppie precedenti sono conservate.42 nuovi profili portano la matrice implementata a139. Le nuove specie sono accessibili nella progressione entro15; nessuna MT/allevamento esterna al capitolo è resa disponibile. I profili oltre15 preesistenti restano per i vecchi salvataggi.

| Specie | Coppie aggiunte | Gesto specifico |
| --- | --- | --- |
| Pansage511 | Graffio10, Fulmisguardo43, Leccata122, Frustata22, Sfuriate154, Cuordileone526, Taglio15, Scontro165 | baricentro, arti, coda e emissione dai punti della testa/mani/ciuffo del proprio rig |
| Pansear513 | Graffio10, Fulmisguardo43, Leccata122, Bruciatutto510, Sfuriate154, Cuordileone526, Taglio15, Scontro165 | preparazione più energica, inclinazione distinta, zampate e emissione del fuoco dalla bocca |
| Panpour515 | Graffio10, Fulmisguardo43, Leccata122, Pistolacqua55, Sfuriate154, Cuordileone526, Taglio15, Scontro165 | postura più bassa, bilanciamento della coda, bocca e traiettoria d’acqua del proprio rig |
| Munna517 | Psiconda149, Ricciolscudo111, Fortuncanto381, Sbadiglio281, Psicoraggio60, Esclusiva286, Scontro165 | raccolta/espansione del corpo, oscillazione e punto di emissione psichico |
| Musharna518 | le stesse7 ereditabili da Munna | massa, postura fluttuante e punto di emissione propri; non è un cambio di nome del rig Munna |
| Snivy495, Oshawott501, Patrat504, Purrloin509 | Taglio15 per ciascuno | anatomia e gesto specifici riutilizzando il rig della specie |

Cuordileone per Patrat/Lillipup era già coperta dai profili precedenti. La compatibilità è ricavata dai bit personal IRBI (TM83 bit82, HM01 bit95); non si concede Taglio a Tepig o a Munna. Musharna conserva il repertorio precedente di Munna; non è disponibile un Ricordamosse che aggiunga le sue mosse di livello1.

Implementazione in `chapter-moves.js`, integrazione con `species-moves.js`, `demo-moves.js` e nuovi rig di reazione. Tutti i profili hanno selezione per coppia, preparazione, azione e recupero, specchiatura e reazioni su entrambi i lati. I movimenti del corpo sono coreografie realizzate per il porting HD-2D, sopra sprite/effetti originali; non sono animazioni scheletriche DS estratte. Per le nuove specie non sono inventate associazioni fra arti e indici OAM: la deformazione è applicata al corpo composto e gli effetti usano gli ancoraggi anatomici.

Stato: implementate; test automatici di tutti i fotogrammi per pose finite, recupero, rig distinti e specchiatura superati. Il collaudo browser deve riportare139 coppie ×2lati ×2esiti ×5campioni =2.780fotogrammi per formato,13specie animate (26atlanti,1.560campioni). Il rapporto della build effettiva determina lo stato di verifica visiva; questo conteggio da solo non dimostra identità al riferimento DS.

Collaudo completato sulla build `b7fad52e27c0020d`:139 coppie/2.780 campioni per ciascuno dei tre formati, entrambi i lati ed esiti; [rapporti](QA-040.md). Questo verifica il renderer e i profili del porting, non l’identità cinematica alla cartuccia.
