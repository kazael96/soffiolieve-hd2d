# Palestra di Levantopoli e Cantiere dei Sogni · 0.40

Dati e testi da Pokémon Nero italiano IRBI, tramite gli estrattori versionati. La ROM e i contenitori originali non sono pubblicati. Conservare il capitolo 0.39, limite 15 e livelli già superiori nei vecchi salvataggi.

| Evento | Prerequisito e attori | Esito / posizione successiva |
| --- | --- | --- |
| Scuola, Komor | starter, squadra; banca30 | rivale al livello8 con Baccarancia; tre bacche al giocatore; Spighetto disponibile davanti alla palestra |
| Regalo al Cantiere | scelta originale, spazio nella squadra | Panpour per Snivy, Pansage per Tepig, Pansear per Oshawott, livello10; aggiunta alla squadra senza sostituire lo starter |
| Palestra | incontro esterno, banca14 | tre tende e pulsanti elementali; errore non avanza; Pierre e Ursula; Chicco/Spighetto/Maisello secondo lo starter |
| Capopalestra | percorso delle tende | Lillipup12 + scimmia14, mosse originali, una Pozione; Medaglia Tris e MT83 Cuordileone |
| Zania | vittoria, evento cittadino | ingresso nella casa e salita al laboratorio; MN01 Taglio; ricerca del Fumonirico |
| Taglio | Pokémon compatibile con mossa15 in squadra | domanda e rimozione persistente dell’albero; nessun consumo della MN |
| Munna / Team Plasma | ricerca avviata, banca304 | Belle, due seguaci (Patrat10 e Purrloin10), apparizione di Ghecis, Musharna e Zania |
| Ritorno da Zania | Fumonirico recuperato | ricompensa narrativa C-Gear offline e completamento del capitolo |

## Continuità e salvataggi

Spighetto attraversa la porta della palestra; Zania entra nella propria casa e raggiunge il laboratorio. Belle lascia la proiezione cittadina quando passa al Cantiere. Le uscite dal Cantiere continuano verso i varchi delle rovine fino a invisibilità verificata dal renderer. Le due apparizioni di Ghecis sono identità locali distinte; il cambio dell’illusione avviene sotto copertura completa bianca, adattamento necessario alla regola delle sparizioni. Non eliminare una persona visibile per rispettare il solo tempo DS.

La migrazione aggiunge le bandiere iniziali del capitolo senza cancellare la squadra. Ricompense, allenatori sconfitti, tenda corrente, Taglio, strumenti e stato della ricerca persistono. Gli strumenti del Cantiere sono registrati per zona, evitando che i loro ID nascondano allenatori del Percorso2.

## Ambienti, specie e audio

Cinque nuove scene: palestra7, casa9, laboratorio10, scuola15, Cantiere152; città6 aggiornata dai dati originali. Fondali di lotta espliciti per palestra, scuola e Cantiere. Al Cantiere le presenze lontane sono Patrat, Purrloin e Munna, tutte specie realmente catturabili: incontri originali 40%/40%/20%, livelli8–11. Le lotte mantengono il contesto acquisito all’avvio.

Sprite, icone, modelli, testi, squadre, compatibilità MT/MN e brani convertiti dalla ROM. Musiche palestra1062, Cantiere1077, Plasma1091, storia1100, Capopalestra1132, lotta Plasma1134. Non è stato eseguito un confronto udibile con la cartuccia.

MT83 e MN01 sono riutilizzabili; Taglio non si dimentica dal normale selettore mosse. Pietralunare evolve Munna conservando livello e mosse. Il giocatore può usare gli strumenti curativi introdotti, anche in lotta; le bacche tenute vengono passate al motore GenV. Il limite della squadra resta6; non viene aggiunto un sistema Box.

## Adattamenti e limiti

La geometria della stanza e dei pulsanti della palestra è originale; le tende sono superfici HD-2D pieghettate animate sul movimento degli attori logici. Il gesto di inchino di Spighetto usa le sue pose originali con tempi adattati. Ricezione della medaglia: modelli e curve articolari originali, alpha dello sfondo originale; BTP/BVA e particelle SPL15 non ricostruiti. La tessera usa una colorazione adattata della sagoma nativa. La scelta del turno della Pozione del Capopalestra usa una soglia web di un quarto dei PS, non certificata contro l’AI della cartuccia. L’evoluzione con pietra è presentata tramite dialoghi, senza filmato completo di evoluzione.

C-Gear è uno sblocco narrativo con avviso offline: servizi Wi-Fi, Sincronigioco e collegamenti fra console non implementati. Non comprende Percorso3, sotterraneo/postgame del Cantiere o l’intera Levantopoli oltre gli eventi elencati. Non dichiarare il porting identico alla cartuccia.

## Verifiche

`check-striaton-runtime.cjs`: tre starter a ×1/×2/×4, scuola/regalo/tende/Capopalestra/ricompense/Plasma/ritorno; macchine riutilizzabili e incompatibilità; Taglio; evoluzione e PP; strumenti tenuti e normalizzazione; cure nel motore reale; uso della Pozione avversaria. Le prove narrative CLI forzano l’esito delle lotte; il replay browser svolge combattimenti effettivi. La suite completa include le regressioni precedenti e32 collegamenti di mappa, ripetuti a tre velocità nello stress degli input.

La fixture browser ha un replay dedicato a palestra/Cantiere e controlli di sfondi, sprite, menu, coreografie, Interpoké e ripristino GPU nei tre formati. I rapporti della build consegnata distinguono prove eseguite da quelle non eseguite. Nessuna prova su viewport certifica ogni GPU Android fisica o l’assenza assoluta di bug.

Correzioni emerse nel collaudo: il blackout interrompe il programma corrente e non esegue ricompense o avanzamenti riservati alla vittoria; regressioni di sconfitta/rivincita per Capopalestra e N. Le chiamate Interpoké adattano le righe dei ritratti già durante l’apertura di ogni messaggio, prima del ResizeObserver, evitando la sovrapposizione del primo fotogramma in orizzontale.
