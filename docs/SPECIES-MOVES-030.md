# Lillipup, reazioni e velocità — 0.30

Le quattro coppie di Lillipup completano le 19 coppie del perimetro corrente: cinque specie ottenibili, apprendimento per livello fino al 10. Non certifica tutte le mosse, forme o fonti di apprendimento della futura versione completa. Le pose sono adattamenti HD-2D delle parti originali; le meccaniche rimangono nel simulatore.

| Specie | Mossa (livello) | Profilo | Stato |
| --- | --- | --- | --- |
| Snivy | Azione (1) | snivy-33 | Verificata nella demo |
| Snivy | Fulmisguardo (4) | snivy-43 | Verificata nella demo |
| Snivy | Frustata (7) | snivy-22 | Verificata nella demo |
| Snivy | Avvolgibotta (10) | snivy-35 | Verificata nella demo |
| Tepig | Azione (1) | tepig-33 | Verificata nella demo |
| Tepig | Colpocoda (3) | tepig-39 | Verificata nella demo |
| Tepig | Braciere (7) | tepig-52 | Verificata nella demo |
| Tepig | Segugio (9) | tepig-316 | Verificata nella demo |
| Oshawott | Azione (1) | oshawott-33 | Verificata nella demo |
| Oshawott | Colpocoda (5) | oshawott-39 | Verificata nella demo |
| Oshawott | Pistolacqua (7) | oshawott-55 | Verificata nella demo |
| Patrat | Azione (1) | patrat-33 | Verificata nella demo |
| Patrat | Fulmisguardo (3) | patrat-43 | Verificata nella demo |
| Patrat | Morso (6) | patrat-44 | Verificata nella demo |
| Patrat | Pazienza (8) | patrat-117 | Verificata nella demo |
| Lillipup | Fulmisguardo (1) | lillipup-43 | Verificata nella demo |
| Lillipup | Azione (1) | lillipup-33 | Verificata nella demo |
| Lillipup | Segugio (5) | lillipup-316 | Verificata nella demo |
| Lillipup | Morso (8) | lillipup-44 | Verificata nella demo |

## Lillipup

Rig originale 506: testa0, busto1/2; fronte gambe3/4/5 e piedi7/8/9, coda6; retro gambe4/6/7, piedi9/11/12 e zampa10, coda8. Piedi e gambe accoppiati condividono il pivot originale. Testa ruota sul collo; le orecchie appartengono alla cella della testa e non vengono staccate artificialmente.

- Azione: raccolta, galoppo a zampe alternate, testa avanzata e coda di bilanciamento, contatto e ritorno con scala/ombra coerenti alla profondità.
- Fulmisguardo: testa rigida, coda abbassata, fissazione degli occhi; bersaglio intimorito senza urto fisico.
- Segugio: capo abbassato e oscillazione del muso durante le annusate, coda in movimento, tracce odorose leggere; bersaglio allerta senza danni.
- Morso: preparazione, balzo corto guidato dal muso, chiusura al contatto e recupero. La bocca è integrata nella cella della testa: piccolo accenno di deformazione e segno locale, senza inventare una mandibola separata assente negli asset.

Studio `?lillipup=1`: entrambi i lati, esito riuscito/fallito, fotogrammi e riproduzione. Bersaglio selezionabile tra cinque specie per verificare le reazioni. Studio isolato dal salvataggio della storia.

## Reazioni del bersaglio

`battle-reactions.js` guida i rig specifici di Snivy, Tepig, Oshawott, Patrat e Lillipup. Distinti urto, frustata, costrizione, morso, fuoco, acqua, rilascio di Pazienza, intimidazione, distrazione e allerta. Movimento della testa, braccia/zampe, orecchie dove separate, coda e postura dipendono dall'anatomia. Nessuna reazione a mancato/fallito/immune o accumulo/attesa di Pazienza. Non introduce ustione, tentennamento o altri effetti meccanici. Il corpo sostitutivo non usa il rig anatomico del Pokémon. Rimane il comportamento precedente per specie/mosse fuori dal perimetro.

Il contraccolpo generico successivo all'aggiornamento PS viene soppresso quando l'azione ha già mostrato una reazione personalizzata; rimane per danni residui e mosse generiche. Ombra al terreno, nessun salto arbitrario durante le reazioni.

## Velocità x1 / x2 / x4

Menu X → Opzioni → Velocita gioco (premere per alternare); selettore diretto nello studio. Preferenza persistente separata dal salvataggio. Orologio virtuale per mosse, ingressi/KO, pause di lotta e attese della storia; movimento, NPC, porte e scene aggiornati in sottopassi massimi di 40 ms. Le uscite restano subordinate alla visibilità effettiva, non a tempi abbreviati.

Un cambio durante una mossa si applica alla sua conclusione, per non desincronizzare la programmazione Web Audio. SFX e versi accelerano con l'azione (anche il pitch); musica resta a velocità normale. L'opzione rallentata del laboratorio rimane un moltiplicatore distinto. I/O, caricamenti, testo leggibile, menu e ripetizione dei tocchi restano a tempo reale.

## Verifiche

Test automatici di profili, fine corsa, rig finiti sui due lati, reazioni per cinque specie e dieci mosse, esiti mancati e Pazienza, continuità dell'orologio, rischedulazione timer e sottopassi. Turni reali delle quattro mosse: PP consumati una volta, motore intatto. Catture reali del renderer in `outputs/lillipup-030-quattro-mosse.webp`; prove aggiuntive di reazioni e velocità nella consegna. Verifiche di build e storia eseguite prima della pubblicazione.
