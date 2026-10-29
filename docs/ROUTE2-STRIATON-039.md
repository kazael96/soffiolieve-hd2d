# Percorso 2 → arrivo a Levantopoli · 0.39

Richiesta del 29 ottobre 2026. Prosegue il salvataggio della 0.38 dall’ingresso nel Percorso 2, senza ricreare l’apertura. Il traguardo è l’arrivo a Levantopoli con esterni esplorabili e Centro Pokémon funzionante. Palestra, case, Scuola per Allenatori, Cantiere dei Sogni e progressione successiva appartengono al prossimo capitolo: le relative porte/eventi non avviano programmi incompleti.

## Inventario narrativo

| Evento | Prerequisito / programma IRBI | Esito e destinazione |
| --- | --- | --- |
| Chiamata e regalo di Mamma | Zona319, bank638 entry0; trigger754/647–650, var16509=0 | Interpoké2 originale, Scarpe da Corsa, var16509=1. Mamma raggiunge il varco verso Quattroventi per il ritorno a casa; nessuna eliminazione visibile. |
| Fernando, Paolina, Erasmo | Attori3/4/5, allenatori1/2/85; sguardo e raggio originali o interazione A | Avviso, avvicinamento e lotta; bandiera di vittoria persistente, premio una sola volta, dialogo successivo. Restano nel punto raggiunto per una futura interazione. |
| Nuova sfida con Belle | Zona319, bank638 entry1; trigger784–789/613, var16509=1 | Lillipup6 e starter7 corrispondente alla scelta originale (498/499/500). Vittoria: var16509=2. Belle raggiunge l’accesso al Cantiere dei Sogni, luogo della sua successiva apparizione, e vi aspetta. È un arrivo persistente, senza ritaglio o sparizione su una strada aperta. Sconfitta: recupero al Centro. |
| Arrivo in città | Confine originale z608/609 fra zona319 e zona6 | Musica di Levantopoli, attori cittadini e obiettivo aggiornati; ritorno sul percorso conservato. |
| Centro Pokémon | Zona8 / bank16; ingresso città warp0 | Cure di PS/PP/stati dal bancone, Market esistente, punto di recupero e salvataggio; uscita verso la città. |

I testi e i movimenti dei due eventi principali sono programmi della ROM IRBI. L’avvicinamento e il servizio dei normali allenatori sono un adattamento del flusso comune per il browser, con squadre, messaggi e premi originali. L’uscita lunga di Belle e il ritorno di Mamma adattano la regia alla visuale HD-2D. Nessun evento futuro della palestra viene dichiarato implementato.

## Campo, incontri e crescita

Mappe esterne dai membri6/7/8 (Percorso2; membro6 già presente) e9/10/11 (Levantopoli), matrice0; Centro dalla matrice13. Coordinate mantenute nel campo condiviso, con origine784/752. Conversione di32 modelli e177 texture del nuovo pacchetto, più sprite dei personaggi e icona originale di Purrloin. I materiali e i modelli restano separati dalle build temporanee e dalla ROM.

Incontri nell’erba: Patrat40%, Lillipup40%, Purrloin20%, livelli4–7 e tasso8, dalle12 fasce IRBI. Le specie ottenibili sono ora sei: tre starter, Patrat, Lillipup e Purrloin. La distribuzione selvaggia non viene artificialmente portata a15: il livello15 si raggiunge allenando la squadra. Il limite della demo è15, senza abbassare i Pokémon già più alti dei salvataggi precedenti. Nessuna evoluzione viene anticipata; il limite resta sotto le prime evoluzioni di queste specie.

Oggetti: script globali7267–7272, letti dal bank864 tramite tabella IRBI overlay10 02170098. Sono rispettivamente Poké Ball, Pozione, Caramella Rara, Superpozione, Mega Ball, Pozione, una unità ciascuno. Raggiungibilità e ostacoli seguono il terreno; non spostare gli strumenti solo per renderli accessibili. Inventario aggiuntivo persistente, cura50 della Superpozione, limite15 anche con Caramella Rara, moltiplicatore1,5 e celle originali della Mega Ball. I due oggetti comuni precedenti restano nei loro campi compatibili.

Le lotte del Percorso2 fissano un contesto `route2` proprio (sentiero/erba), con geometria originale e presenze lontane di Patrat, Lillipup e Purrloin. Non usano il fondale del Percorso1 come ripiego. Ogni Pokémon sconfitto della squadra avversaria contribuisce a esperienza ed EV nel riepilogo di fine lotta; questa gestione differita non è una riproduzione dei tempi della console durante una lotta con più avversari.

## Interpoké e audio

La chiamata2 usa record64 di a/1/3/1 e testi193 di a/0/0/2. Mamma usa ritratto5 e celle4: il ritratto1 è la protagonista femminile e non deve essere riutilizzato. Rimane la chiamata1 con quattro partecipanti. Ogni ritratto ha nove combinazioni occhi/bocca; le immagini vengono caricate prima di mostrare il pannello e ridimensionate senza ritagliare il personaggio. Le righe dei ritratti si adattano alla posizione effettiva del dialogo, anche con comandi touch e rotazione, lasciando almeno8 pixel di margine. Timer, osservatore del layout e pannello vengono rimossi alla chiusura.

Musiche originali aggiunte: Levantopoli1026 e incontro con Belle1088; Percorso2 e incontro con Mamma erano già disponibili. I normali allenatori usano il tema allenatore, Belle quello rivale. La sintesi web e la camera HD-2D sono adattamenti, non un’emulazione bit-identica.

## Verifiche e limiti

`route2-data.test.cjs`: prerequisiti, squadre per i tre starter, distribuzione degli incontri, oggetti esatti, ritratto di Mamma, puntatori e Mega Ball. `check-route2-runtime.cjs`: i tre starter a×1/×2/×4, eventi principali, normali allenatori e premi singoli, vittoria/sconfitta/lotta effettiva, Centro, nuovo inventario, Purrloin in salvataggio, limite15 e continuità del percorso raggiungibile. Le transizioni e gli input ripetuti includono anche il nuovo Centro.

Fixture browser: replay del capitolo con renderer e battaglie reali, due chiamate Interpoké con tutte le espressioni, controlli grafici sui nuovi ambienti e97 coppie sui due lati. I rapporti della consegna determinano quali prove sono effettivamente concluse: la presenza di un test non ne certifica il superamento.

Restano i limiti del progetto: nessuna certificazione di tutte le GPU Android fisiche, nessun confronto audio udibile dichiarato da questi test, AI/regia e servizi web non certificati contro ogni istruzione della console. Nessuna garanzia di assenza assoluta di bug.
