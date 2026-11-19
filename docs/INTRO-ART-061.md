# Regia di Aralia e stili della prima città · 0.61

Richiesta del19 novembre2026: migliorare il lancio di Aralia, dettagliare Giallo/Oro/Smeraldo conservando Soffiolieve, distinguere maggiormente Platino e Nero dalla versione HD-2D e rendere i passaggi più fluidi. Restano tutte le regole A–H, l'introduzione completa, l'identità scelta e i tre salvataggi della0.60.

## Aralia

La figura intera usa gli stessi pixel nativi di Nero documentati in [INTRO-FULLBODY-060.md](INTRO-FULLBODY-060.md). Il nuovo estrattore compone prima le celle originali: queste separano capelli/gambe da volto/busto, non parti anatomiche. Solo dopo divide la figura alla riga del collo64, senza aggiungere pixel. La ricomposizione di testa, busto e falde deve risultare identica byte per byte al corpo nativo. Il catalogo registra le maschere e i digest. Quattro PNG aggiungono testa, busto e due falde, senza modificare gli altri personaggi o i ritratti delle chiamate.

Aralia è già a sinistra prima del lancio e resta sullo stesso appoggio: eliminato lo scorrimento laterale del corpo senza un passo. Spalla e gomito seguono curve cubiche continue, con preparazione, estensione in avanti, accompagnamento e recupero; niente rotazione del braccio sopra la testa. Polso, piccolo cenno della testa e ritardo delle falde accompagnano il gesto. I piedi mantengono il piano130 e l'ombra segue l'appoggio.

La sfera resta in mano fino al46. La traiettoria eredita la velocità della mano e rallenta prima dell'apertura al76; apertura, comparsa di Minccino86, verso112, appoggio128 e presa150 rimangono nello stesso ordine. Anche il ritorno raggiunge la mano con posizione e velocità continue. Le pose40 e54 aggiungono testimoni della spinta e dell'accompagnamento. Conservare ×1/×2/×4, sospensione e annullamento senza duplicare suoni, versi o la sequenza tornando indietro. È una regia adattata HD-2D, non una riproduzione fotogramma per fotogramma dell'overlay DS.

## Soffiolieve nelle sei epoche

La pianta resta riconoscibile: laboratorio settentrionale, casa di Komor, case meridionali, sentieri, fiori e lungomare rialzato. Le prime tre vedute sono reinterpretazioni autoriali, non estrazioni da ROM di Giallo, Oro e Smeraldo. Non vengono cambiate geografia o identità del giocatore per mostrare un'altra città.

- **Giallo,160×144:** quattro sole tinte, contorni scuri, chiome e tronchi costruiti a pixel, corsi delle tegole, finestre e parapetto monocromatico. Suolo chiaro e retini conservano la leggibilità Game Boy.
- **Oro,160×144:** palette distinte di erba, muri, tetti, vetri e acqua, chiome a strati, serramenti, stipiti, camini e ombre nette nello stile Game Boy Color.
- **Smeraldo,240×160:** più dettaglio di fogliame e facciate, riflessi dei vetri, fiori rosa, percorsi e acqua con più tonalità; le forme e la trama sono disegnate sulla griglia GBA.
- **Platino,256×192:** veduta molto più dall'alto66°, trattamento freddo e discreto delle texture, verdi di Sinnoh e tetti più terrosi. Usa i modelli della stessa Soffiolieve di Nero adattati: non si dichiara l'esistenza di una mappa nativa di Platino.
- **Nero,256×192:** modelli e texture nativi di Soffiolieve, camera51°, colori quantizzati e presentazione DS senza postproduzione cinematografica. Non è un fotogramma di emulatore.
- **HD-2D,768×576:** camera bassa25°, piena resa e postproduzione del progetto. La maggiore risoluzione e profondità restano esclusive dell'ultima tappa.

Le catture 3D riusano il descrittore privato già preparato. Cambiare il colore di fondo non deve riassegnare `renderer.scene`, che riavvierebbe il caricamento prima della cattura. Validare risorse e contesto prima di acquisire; rilasciare infine il renderer temporaneo. Nessun cambiamento al renderer giocabile, alla posizione, all'identità o alla storia durante il montaggio.

## Passaggi e controlli

Il fronte diagonale usa fasce di2pixel logici e una sfumatura di8pixel: sostituisce i48 grandi tasselli della0.60. La fusione interessa soltanto una fascia stretta, non l'intero panorama. Il fronte conclude anche l'ultimo bordo prima della nuova epoca. Rimane una sola didascalia alla volta, con uscita e ingresso separati. Sei viste stabili e cinque passaggi hanno checkpoint realmente disegnati, anche a×4. Durata nominale10,8s a×1; i dispositivi lenti conservano i gesti, non saltano i checkpoint per forzare il tempo nominale. Non si ricrea una cattura, un'immagine o un contesto GPU a ogni fotogramma.

Le regressioni comprendono appoggio e arco della spalla, contatto/velocità della sfera, disegno effettivo dei tetti/chiome/costa sulle griglie originali, quattro tinte di Giallo, differenze effettive dei pixel DS e caricamento del renderer. Il replay dell'index misura varietà e contrasto dei pixel delle sei viste per rifiutare panorami neri o vuoti; questi numeri non sostituiscono la revisione grafica. Esporta15 pose del lancio per formato e i passaggi delle sei epoche:87PNG per12 casi completi, oltre a introduzione, avvio, slot e regressioni precedenti.

La prima candidata ha superato il solo replay desktop ma è stata respinta visivamente per sei immagini 3D vuote; preservare quel risultato e la regressione prima/dopo la correzione. Non trasferire quel PASS alla candidata successiva. L'accettazione richiede nuova suite49 fasi, tre formati, tutte le velocità, recupero risorse, revisione di ogni PNG, pulizia H.8 e verifica del codice pubblicato. Rapporti e ricevute sono esterni alle build in `outputs/chapter061-*`; soltanto la ricevuta finale completa certifica la consegna. Chrome isolato con viewport mobili non certifica una GPU Android fisica né un confronto audio all'ascolto.

Riferimenti visivi consultati: [Game Boy](https://juegosretro.com/pokemon-yellow-pikachu-edition), [Oro/Argento](https://oniwa-hanauta.hatenablog.com/entry/silver-kanto01), [Smeraldo](https://www.y9freegames.com/es/blog/pokemon-emerald-walkthrough-guide/). Le immagini esterne non sono incorporate negli asset del gioco.
