# Cold Storage e Cava Pietrelettrica0.49

`mistralton-puzzle-data.js`, `mistralton-ice.js` e `mistralton-puzzles.js` precedono `original-story.js`. Il controller riceve lo stato nativo, il giocatore e le griglie originali; non modifica la geometria delle mappe o gli script della storia. Il dettaglio del ghiaccio e dei comandi328/491 è in [MISTRALTON-ICE-049.md](MISTRALTON-ICE-049.md).

## Origine dei cristalli

L'overlay51 IRBI contiene le tabelle `021f3c94` (cristalli fisici:12 nella zona195,5 nella196,3 nella197) e `021f3cdc` (decorazioni:14,11,11). `021f3610` crea attori fisici modello253 e collega gli effetti grafici; i cristalli piccoli non sono corpi solidi. Le coordinate sono quelle native, centrate con `x+0.5,z+0.5` e convertite nell'origine interna16,16. L'altezza decorativa è il valore della tabella più0.5.

`tools/extract-mistralton-puzzles.py` estrae queste tabelle dalla ROM, preserva gli hash e converte i membri `a/0/7/5`: modello78 con BCA120/121, modello79 con BCA122/123, ombra81 e scarica80/BTP102. I file GLB, le texture e le geometrie hanno prefisso `mt-crystal-`; il catalogo condiviso non è riscritto.

Il dispatcher dei passi `overlay10:0216379c/021637b0` crea la scarica solamente sul comportamento48, riconosciuto da `overlay21:021ab2ec`. Il percorso principale attraversa16 di queste caselle nella prima zona195 e22 nella196. L'effetto `021c8e60` cattura la posizione dell'attore al passo; il browser usa il cambiamento effettivo di casella del giocatore, degli NPC e dei cristalli, compresi i movimenti tramite script. L'ingresso in una scena azzera i campioni; una discontinuità di posizione non crea un passo. La quota è quella nativa dell'attore, ossia il terreno del renderer più0.5 per le sprite adattate; la geometria originale della scarica si trova0.5 più in basso.

Apicula esporta le cinque texture originali ma omette il BTP dal GLB. L'estrattore legge quindi direttamente il record PAT originale:15 frame, texture successive ai frame0,1,4,7,10. `drawFloor(renderer)` disegna il quad nativo e queste texture dopo la geometria della scena e prima delle sprite. Non sintetizza particelle o cicli. Ripristina uniformi e culling in `finally`; le risorse delle cinque texture sono precaricate tramite un modello trasparente separato per piano. Il suono1698 è chiamato da `021c8eb4/021c8eb6`.

## Regola originale e moto continuo

`021f3784` verifica la direzione del giocatore. `021f3838` rifiuta un cristallo già adiacente a una roccia magnetica. `021f3aa4` scandisce fino a32 caselle: un ostacolo ordinario o un altro attore annulla il moto; una collisione magnetica ferma il cristallo nell'ultima casella libera. L'handler `021ab2f8` riconosce esclusivamente il comportamento mappa50. Non esistono destinazioni o corridoi inventati nel controller.

Il task `021f38d8` usa gli stili8,12,16 quando restano rispettivamente più di4, più di2, oppure al massimo2 caselle. Le tabelle direzionali `02197d7c` e i relativi handler `02197fb0`, `02198004`, `0219805c` fissano16,8,4 frame per casella. Il browser interpola continuamente questi segmenti a30Hz. Il corpo di collisione segue la posizione presente; la destinazione non diventa un ostacolo anticipato. Un tentativo fallito riproduce la BCA121, dura45 frame e non si riattiva per la stessa direzione dalla stessa posizione mentre il tasto viene ripetuto.

Gli effetti sonori originali aggiunti sono1742 all'inizio di una spinta (`021f3914/021f3916`),1699 all'arrivo al magnete (`021f3962/021f3916`),1370 per un tentativo fallito (`021f39da/021f39dc`) e1698 per la scarica. Il descrittore separa10 musiche,8 effetti e21 versi; i quattro nuovi effetti sono finiti. Gli effetti motore della Palestra restano catture native con arresto esplicito, senza cicli PCM inventati.

## Contratto di integrazione

La ragnatela148 dell'ingresso194 usa il set billboard19, non le pose direzionali delle persone. La tabella `021ddad8` contiene la posa iniziale `021d646c`, frame0, e il taglio `021d6c3c`: frame0 per4 aggiornamenti,1 per6,2 per6,3 per6. Il movimento171 (`021d41c4`, inizializzazione `02199bc8`, attesa `02199be4`) seleziona l'animazione1 e attende22 fotogrammi. `actorFrame(n)` precede la selezione generica delle pose; `movement(n,171,elapsed)` restituisce durata22/30 e posa. Il fotogramma3 resta visibile durante la scossa328, poi `ActorDelete` rimuove l'oggetto senza applicare il percorso di uscita degli NPC. L'oggetto conserva le risorse sprite, è `fieldObject`/`noShadow` e non è `gimmick`. I frame transitori restano associati all'oggetto in memoria durante una pausa delle risorse; un nuovo caricamento prima della conferma della storia riparte dalla posa integra.

`MistraltonPuzzles.prepare()` segue `MistraltonChapter.ensure()` e precede il caricamento delle risorse della scena. Installa76 istanze visibili originali:20 cristalli grandi,20 ombre,36 piccoli, oltre ai tre modelli trasparenti di precaricamento della scarica. Un secondo caricamento reinserisce le istanze se una scena differita è stata sostituita e non duplica quelle già presenti. Gli errori di risorsa si ritentano senza eseguire comandi della storia.

Il runtime chiama:

- `tryStep(dx,dz)` prima dei test di movimento e dei varchi: gestisce la spinta con i tasti direzionali; `interact()` accetta anche l'interazione frontale.
- `blocked(x,z)` per collisioni: restituisce `true` su un cristallo nella posizione attuale, altrimenti `null`. La collisione della mappa originale continua a essere necessaria. `canMove(x,z)` non muta lo stato.
- `tick(dt,moved)` prima della verifica di input bloccato. Il tempo `dt` è già scalato da GameSpeed; la fisica non applica un secondo moltiplicatore.
- `enter(zone)` e `restore()` durante entrate e ripristini; `busy` blocca movimento manuale, incontri e ambientazioni autonome durante la spinta, il ghiaccio e la scossa.
- `command(name,args,values)` prima dello switch del VM per328 e491; `warps(zone,list)` in tutti i lookup di sorgenti e destinazioni.
- `apply(renderer)` prima del disegno per BCA e posizioni; `drawFloor(renderer)` dopo la geometria e prima delle sprite per il BTP della scarica. `applyCamera(renderer)` immediatamente intorno a `renderer.draw()`, con il callback restituito in `finally`, applica e ripristina esattamente la scossa.
- `actorFrame(actor)` prima delle pose umane e `movement(actor,code,elapsed)` nel task dei movimenti gestiscono l'animazione nativa171 della ragnatela. I valori `null` indicano un altro attore o movimento.

Il factory `createController(options)` accetta `data,state,player,direction,save,resetInput,canStart,grids(zone),actors,baseBlocked,assets,loadGLB,audio` ed eventualmente un controller `ice` iniettato. Non dipende dal renderer per simulare le collisioni.

## Persistenza e verifica

`native.mistraltonCrystals` contiene le tre liste `[nativeX,height,nativeZ]`; `native.mistraltonCrystalMotion` conserva zona, indice, direzione, estremi, distanza e avanzamento frazionario. Il ripristino verifica gli estremi contro le coordinate iniziali estratte e i magneti della mappa; una posizione corrotta non apre passaggi. Non riproduce nuovamente il suono di partenza. I campi del ghiaccio, della scossa e dei varchi sono descritti nel documento dedicato.

Il percorso nativo principale, registrato casella per casella in `tests/fixtures/mistralton-native-routes.json`, richiede sette spinte:

1. Zona195, ingresso(7,59) → scala(67,50): cristalli0 a ovest3,2 a est6,5 a ovest6,6 a sud6,9 a sud3.
2. Scala195/2 →196/1, arrivo(60,50); fino alla scala(52,5): cristalli2 a ovest4 e3 a nord5.
3. Scala196/2 →195/4, arrivo(56,5); percorso libero fino all'uscita nord(75,6).

I test camminano lungo tutte le caselle, verificano collisioni native e corpi, poi simulano ciascuna spinta a30Hz. Coprono anche avanzamento frazionario, salvataggio/ripristino, tentativi falliti, velocità1/2/4, NPC reali, riprova delle risorse e campionamento delle quattro BCA originali sul percorso reale di `FieldModels.geometry`. Le prove CLI e i rapporti di estrazione sono sotto `outputs/chapter049/puzzles`; il collaudo browser completo è un passaggio separato della candidata del progetto.
