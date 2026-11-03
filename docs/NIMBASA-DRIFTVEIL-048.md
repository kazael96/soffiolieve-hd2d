# Sciroccopoli → Libecciopoli · 0.48

Richiesta: proseguire fino alla prossima città. Il 3 novembre 2026 l’utente ha autorizzato il **limite 30**. Conservare livelli e XP superiori dei vecchi salvataggi. La pubblicazione richiede i collaudi e la verifica di Pages descritti in QA-048.md; la sola estrazione non certifica giocabilità.

## Percorso integrato

| Luogo | Eventi e contenuti |
| --- | --- |
| Luna park (64) | Incontro con N, ruota panoramica, lotta e uscita di N/Plasma attraverso il varco |
| Palestra (63) | Quattro carrelli, nove stazioni, quattro scambi, allenatori, Camelia, Medaglia Volt e MT72 |
| Varco (91) | Passaggio fisico fra città e Percorso 5 |
| Percorso 5 (329) | Komor, Nardo, lotta con Komor contro Mila/Michelino, allenatori, strumenti, Camelia e abbassamento ponte |
| Ponte (253) | Attraversamento continuo dopo la sequenza del ponte mobile |
| Libecciopoli (96) | Arrivo con Komor, confronto con Rafan, esplorazione della città |
| Centro (99) | Infermiera, cure PS/PP/stati, negozio, residenti, Bis Ball e nuovo checkpoint |

N usa Sandile, Darumaka, Scraggy e Sigilyph al 22. Camelia usa due Emolga al 25 e Zebstrika al 27. La MT72 insegna Invertivolt (521), con compatibilità originale. Squadre, testi e geometria provengono dalla ROM IRBI dell’utente; la ROM e gli eseguibili non vengono distribuiti.

## Continuità

N e gli scagnozzi attraversano l’uscita del parco. Camelia esce dalla palestra e compare dal varco est del Percorso 5 con ingresso fisico; al termine riparte verso Sciroccopoli. Komor procede al ponte e viene trasferito fra le mappe solo dopo occultamento; entra da est a Libecciopoli e cammina fino al confronto con Rafan. Se il giocatore anticipa il suo arrivo mantiene il controllo; il trigger si rivaluta anche da fermo. Dopo il confronto Komor raggiunge il fronte del Deposito Frigo e resta presente per il capitolo successivo. Rafan lascia l’incontro attraverso la porta della palestra. Percorsi, record in viaggio e residenti sopravvivono ai salvataggi e al Centro.

## Presentazione e meccanismi

Modelli, animazioni dei carrelli e percorsi provengono da a/1/0/7 e overlay39. Salita/discesa, richiamo di un carrello lontano e continuità della posizione del giocatore sono adattamenti HD-2D. Gli allenatori dei carrelli vengono affrontati prima dell’imbarco; input ripetuti non avviano un secondo viaggio. Ricariche e stato persistente corrotto devono lasciare carrelli e giocatore in posizioni finite.

Ruota e ponte usano modelli e animazioni di a/1/6/0; inquadrature e presentazione dei dialoghi nella ruota sono adattate al browser. Le due frasi di N nella ruota sono parafrasi italiane, non testo della ROM certificato. Medaglia Volt usa i modelli originali maschile/femminile e la precedente presentazione delle medaglie; i limiti BTP/BVA/SPL della presentazione precedente restano dichiarati.

Sette contesti espliciti: palestra di Camelia, parco, sentiero/erba/erba scura del Percorso 5, ponte e città. Le presenze ambientali del Percorso 5 sono Minccino, Gothita e Trubbish, lontane dai combattenti. Nessun Ducklett ambientale viene inserito sul ponte finché non è implementata la cattura tramite ombre. Campo di battaglia e ombre restano fissati durante il turno.

## Pokémon, strumenti e audio

849 coppie su 58 specie/forme predisposte entro il 30; matrice in SPECIES-MOVES-048.md. Nuovi corpi: Zebstrika, Scolipede, Krokorok, Sigilyph, Minccino, Cinccino, Gothita, Ducklett ed Emolga. Profili e reazioni funzionano sui due lati; la copertura numerica e quella grafica vanno riportate separatamente.

Gli incontri normali/scuri del Percorso 5 sono originali: Minccino, Gothita, Trubbish e Liepard. Zebstrika, Krokorok e Scolipede hanno soglie evolutive 27/29/30. Le tabelle dei fenomeni sono dati predisposti, non incontri casuali sul ponte. Zinc: +10 EV Difesa Speciale con limiti Gen V di 100/510; Attacco X: +1; Bis Ball: moltiplicatore Gen V ×3 solo sulle specie già catturate. Consumo e salvataggio non duplicano gli effetti.

Aggiunte le musiche native di Libecciopoli (1030), ponte (1056) e lotta N (1137); Percorso 5 stagionale. Versi ed effetti si appoggiano al catalogo originale e ai controlli di velocità esistenti. Verifica del segnale e ascolto umano restano distinti.

## Limite del capitolo

L’arrivo a Libecciopoli conclude il tratto. Deposito Frigo, palestra di Rafan, successivo Team Plasma, Percorso 6 e attività Musical/rotazione di Charles non sono completati. Teatro e relativo evento facoltativo di Belle/padre restano al limite esplicito; non eseguire script estratti per il solo fatto che esistono. I fenomeni di erba che si muove e ombre/piume del ponte non sono implementati; Cinccino e Ducklett sono predisposizione grafica e dati, non catture dichiarate. Emolga e Sigilyph sono presenti negli avversari. I limiti precedenti di amicizia e attività facoltative restano validi.
