# Regole permanenti di sviluppo

Richieste dall'utente il27 ottobre 2026. Valgono per la demo, le revisioni successive e la futura versione completa. Sono criteri di accettazione, non semplici preferenze. La resa rimane HD-2D; queste richieste autorizzano ad adattare la messa in scena originale.

## 1. Uscite e sparizioni dei personaggi

Un personaggio non deve sparire in un punto che il giocatore può vedere. Prima della rimozione deve raggiungere un'uscita coerente, attraversare una porta, uscire dall'inquadratura o passare dietro un elemento che lo nasconda realmente. Deve restare non visibile anche durante la rimozione, tenendo conto dei movimenti della camera e dello zoom.

Il comando di rimozione della ROM rappresenta l'intento narrativo; non obbliga a riprodurre una sparizione visibile nella camera HD-2D. Se la visuale mostra più spazio rispetto al DS, adattare percorso e tempi. Una dissolvenza sul personaggio ancora visibile non risolve il requisito. Non usare un'attesa infinita finché il giocatore guarda altrove: l'uscita deve poter terminare in modo deterministico.

Applicare la regola a tutti i percorsi di rimozione e ricostruzione degli attori, compresi salvataggi, cambi di scena, annullamenti e ripresa delle sequenze. Trasferimenti espliciti di scena possono rimuovere attori durante una transizione che nasconde interamente il campo.

Verifica: riprodurre ogni uscita con visuale bassa, zoom supportati, camera ferma e in movimento. Controllare i fotogrammi prima/durante/dopo la rimozione, la conclusione dell'evento e il corretto stato al rientro. Distinguere visibilità effettiva, occlusione e semplice posizione nel rettangolo dello schermo.

## 2. Sfondi delle lotte legati al luogo

Ogni lotta deve usare un ambiente coerente con il luogo fisico in cui inizia: interni, stanze specifiche, erba/percorso e, quando saranno disponibili, città, grotte, acqua, edifici speciali e altri terreni. Anche lotte della storia e tutorial seguono questa regola. Il tipo di avversario non sostituisce il contesto geografico.

Acquisire all'inizio della lotta il contesto necessario: zona/mappa, interno o esterno, terreno e varianti disponibili pertinenti. Lo sfondo non deve cambiare perché lo stato di esplorazione viene aggiornato durante la lotta. Le ambientazioni devono comprendere fondale e terreno/pedane coerenti, senza limitarsi a cambiare il colore del cielo.

Usare dati originali dove adatti; quando manca un ambiente per il porting, realizzare un adattamento coerente e dichiararlo. Ogni nuovo luogo combattibile richiede una scelta esplicita. Un ambiente generico temporaneo può servire allo sviluppo, ma è un requisito aperto e non deve far risultare la copertura completa.

Verifica: inventario di tutti i luoghi combattibili e delle relative varianti, controllo della selezione per zona/terreno e prova visiva di avvio delle lotte normali, della storia e del tutorial. Controllare anche che il contesto rimanga stabile durante animazioni e transizioni.

## 3. Animazioni per ogni coppia Pokémon–mossa

Ogni Pokémon deve avere un'animazione personalizzata per ogni mossa che può imparare. La copertura si misura sulla coppia specie/forma+mossa, non sul solo moveID. L'apprendimento nella versione completa comprende tutte le fonti che il gioco renderà disponibili; non limitare automaticamente il requisito alle mosse per livello.

È consentito condividere effetti, particelle e codice. La coppia deve però avere un adattamento visivo verificabile all'anatomia e al modo di agire del Pokémon: pose e movimento del corpo, punto di emissione o contatto, traiettoria, orientamento, dimensioni e tempi di preparazione/recupero pertinenti. La stessa sequenza copiata con un altro nome non è personalizzazione. Non imporre movimenti arbitrari quando la mossa richiede immobilità: personalizzare i dettagli pertinenti al caso.

Comprendere anche mosse di stato e senza particelle, contatto, attacchi a distanza, preparazione/rilascio, colpi multipli e bersaglio proprio quando applicabili. Preservare danni, precisione, PP, priorità, abilità e stati del motore di lotta. Sincronizzare animazione, impatto, camera, versi ed effetti sonori; supportare entrambi i lati del campo. I tempi devono essere compatibili con l'azione risolta, inclusi fallimento e mancato bersaglio.

Verifica: matrice esplicita delle coppie con stato da realizzare/in lavorazione/da verificare/verificata, riferimento al profilo specifico e prove visive. Un'animazione generica già presente è una risorsa riutilizzabile, non una coppia già verificata. Ogni nuova specie, forma, mossa o fonte di apprendimento aggiorna la matrice prima di dichiarare completa la copertura.

### Perimetro iniziale della demo: livello 10

Interpretazione operativa dell'attuale demo: cinque specie ottenibili; mosse apprese entro il livello 10 incluso, comprese quelle dei livelli precedenti alla ricezione/cattura. Sono19 coppie e10 mosse distinte, ricavate dai learnset IRBI presenti nel pacchetto della demo 0.17. Se vengono rese disponibili altre fonti di apprendimento o specie nel medesimo perimetro, aggiungerle alla matrice; la tabella non è una deroga permanente.

| Pokémon | Mosse e livello di apprendimento |
| --- | --- |
| Snivy | Azione1; Fulmisguardo4; Frustata7; Avvolgibotta10 |
| Tepig | Azione1; Colpocoda3; Braciere7; Segugio9 |
| Oshawott | Azione1; Colpocoda5; Pistolacqua7 |
| Patrat | Azione1; Fulmisguardo3; Morso6; Pazienza8 |
| Lillipup | Fulmisguardo1; Azione1; Segugio5; Morso8 |

Minccino del tutorial non è ottenibile nell'attuale demo e non rientra in questa prima matrice; resta soggetto alla regola generale per il successivo ampliamento della copertura. I Pokémon usati soltanto dagli avversari vanno mantenuti distinti nell'inventario, senza dichiararli ottenibili.

## Stato al momento dell'introduzione

Questa modifica registra i requisiti; non certifica una loro implementazione completa nel runtime 0.17.

- Uscite: implementazione della demo0.18 in `src/field-actor-exits.js`, integrata con movimento69, ActorDelete, ricostruzioni della zona e rendering. Audit e verifiche in `ACTOR-EXIT-AUDIT.md` e `ACTOR-EXITS-018.md`. Le altre due regole restano requisiti distinti.
- Sfondi: la demo0.19 acquisisce un contesto immutabile in `src/battle-location.js` e compone fondali distinti in `src/battle-environment.js`. Inventario di luoghi, materiali e adattamenti in `BATTLE-ENVIRONMENTS-019.md`; verifica dell'HUD e della selezione in `BATTLE-HUD-019.md`. Nuovi luoghi richiedono sempre un profilo esplicito.
- Animazioni: la selezione attuale degli effetti si basa sulla mossa e sul contesto della lotta. Le19 coppie della tabella richiedono inventario di profili personalizzati e collaudo individuale; nessuna è dichiarata verificata dalla sola esistenza dell'effetto generico.

Ogni consegna deve distinguere regole registrate, comportamento implementato e comportamento effettivamente verificato.

## Avanzamento animazioni 0.25

Matrice esplicita e prove in [SPECIES-MOVES-025.md](SPECIES-MOVES-025.md): quattro coppie di Snivy implementate e verificate nella demo; le altre15 restano da realizzare. La presenza degli effetti generici non modifica questo conteggio.

## Avanzamento animazioni 0.26

Matrice e prove in [SPECIES-MOVES-026.md](SPECIES-MOVES-026.md): quattro coppie di Tepig aggiunte alle quattro di Snivy, per8/19 coppie verificate nella demo. Le altre11 restano aperte.

## Avanzamento animazioni 0.28

Matrice e prove in [SPECIES-MOVES-028.md](SPECIES-MOVES-028.md): tre coppie di Oshawott aggiunte a Snivy/Tepig, per11/19 coppie verificate nella demo; altre8 aperte.
