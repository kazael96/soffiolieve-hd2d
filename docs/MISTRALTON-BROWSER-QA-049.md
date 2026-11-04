# Fixture browser fisiche · 0.49

I pulsanti sono in `tests/browser-qa.js`, disponibili con lo stesso server e gli stessi parametri della fixture dei capitoli precedenti. Eseguire separatamente a1280×720,390×844 e844×390; l'aggregato è `qaPresentation049`. La fixture registra nel rapporto viewport, esito, dettagli e PNG. Le posizioni iniziali sono ingressi nativi percorribili. Camera, zoom e quota non vengono corretti manualmente.

|Pulsante|Prova predisposta|
|---|---|
|`qaIce049`|Da192(7,31), camminata fino al ghiaccio, scivolate7,15→12,15→1,16→1,13 e arrivo davanti al container5,8; checkpoint durante lo scivolamento e controllo del rilascio input|
|`qaCrystal049`|Da195(7,59), percorso effettivo alla prima pietra; A avvia la spinta nativa verso ovest di3 caselle, collisione sul corpo in movimento e checkpoint prima dell'aggancio magnetico|
|`qaWeb049`|Da194(107,340), A esegue il programma nativo di Rafan: ragnatela, MT78 e491; osserva328 durante i draw reali e verifica applicazione/ripristino esatto della camera, varco337→339, immutabilità degli eventi estratti e persistenza del varco|
|`qaGymEntry049`|Operatore reale98(9,3) avvicinato da9,4, ingresso nativo e comando riservato; uscita da97(13,25). Campiona dopo il draw reale i quattro movimenti0→−5,55→50,50→55,−5→0, con campo visibile e input bloccato|
|`qaGym049`|Da97(17,25) a quota50, interruttori nativi tramite A, sei ascensori, chiamate di piattaforme vuote, checkpoint durante una corsa, piani30/40/50, barriera e discesa fino a−59; raggiunge Rafan e torna a50|
|`qaArrival049`|Da195(75,7), cammina fino al vero varco nord, arriva107, raggiunge il trigger nativo di Anemone/Rutilo e verifica camera e scenario dopo l'incontro|
|`qaStory049`|Stato concluso048, quattro seguaci reali, Ghecis, lotta di Rafan e quinta medaglia, Belle/MN02, Rafan/MT78, Triade/Aralia/N, uscita reale verso107 e incontro di arrivo; infermiera109 ripetuta, consulenza Introforza con Squadra DOM, acquisti ai due commessi originali|
|`qaMoves049`|Tutte911 coppie aggiunte oltre849 precedenti:1760 complessive/85 specie e forme; due lati, successo/mancato bersaglio, recupero corporeo, due fasi di Volo, forme stagionali e originali femminili;120 coppie dalla fonte aggiuntiva delle quattro MT meteorologiche|
|`qaStages049`|Tutti17 fondali geografici nuovi, terreni nativi, presenze previste e controllo GPU di visibilità; istantanee ferme e durante una mossa, contesto fisso|
|`qaAmbient049`|Ciclo nativo completo di tutte9 presenze distinte dei nuovi luoghi, disegno Nitro effettivo, nessun fotogramma vuoto/tagliato/sotto il terreno|
|`qaAudio049`|Dieci musiche,21 versi e8 effetti di campo a×1/×2/×4, disattivazione e ripresa; decoding/riproduzione WebAudio, senza certificare confronto udibile|
|`qaMail049`|Acquisto137 dal commesso99/7 originale, Borsa→USA→Snivy, tre frasi94/0 con parola151/3, lettura e B, conferme PRENDI/NO e SÌ, annullamento della composizione; salvataggio/lettura, makeMon, pack/unpack e cura reale dall'infermiera preservano il contenuto|
|`qaFly049`|Squadra→Volo→Mappa Città originale, B di annullamento, città futura disabilitata, Unfezant femmina e approdo nativo su binario3 di Austropoli; due input B distinti per Squadra→Menu→chiusura|
|`qaCache049`|Diciassette Diorama con espulsione e ritorno,45 banche Nitro e combattenti attivi protetti,13 scene del campo e ritorno, due perdite/ripristini reali del contesto WebGL|

`qaComplete049` riunisce i quattordici casi e lascia per ultima la matrice delle coppie; `qaPresentation049` mantiene il gruppo dei cinque casi fisici originari. Il caso storia dichiara i salti ai punti di approccio di ciascun evento: non certifica una camminata continua fra tutti i luoghi. Le interazioni, i trigger, i dialoghi, le lotte e i servizi usano il runtime reale. Le scelte di lotta passano per `turn()` e il motore determina il vincitore. La squadra iniziale è al31, con un solo starter, quattro medaglie e denaro dichiarato come risorsa della fixture; nessun flag narrativo viene imposto dopo l'avvio degli eventi. Squadra, fonti legali delle mosse, semi deterministici e Max Repellente consumato sono descritti in [QA-049-FIXTURE-RESOURCES.md](QA-049-FIXTURE-RESOURCES.md). Le prove fisiche separate coprono i percorsi dei puzzle.

`qaMail049` parte senza carta in Borsa e dichiara10000 di denaro iniziale della fixture: compra lo strumento137 tramite il programma nativo del commesso e controlla prezzo e quantità. Non concede direttamente la carta o il contenuto. Seleziona i riferimenti a modelli e parole nel dialogo nativo e passa per i sottomenu effettivi di Borsa/Squadra. Il checkpoint è un vero roundtrip di `StoryState`, riportato come `pageReload:false`; il Pokémon ripristinato viene poi curato dall'infermiera tramite A. Il caso richiede i collegamenti Mail nel runtime integrato e non considera superata un'API assente.

Gli input sono eventi DOM di tastiera e click sul pulsante A esistente. La fixture non invoca direttamente `moveLift`, `tryStep` o comandi nativi per produrre l'esito del percorso. Nei cinque casi fisici i trainer sono dichiarati già completati nella preparazione: le prove isolano la fisica del campo e non certificano le lotte. Il caso Palestra non sfida il Capopalestra; le verifiche narrative e di combattimento restano distinte.

I checkpoint passano davvero per `StoryState.write/read` su memoria isolata, mantengono la posa e riprendono il controller; riportano esplicitamente `pageReload:false`. Non sono una ricarica della pagina. Le prove di ricarica completa devono essere registrate dalla candidata integrata.

Il controllo delle immagini misura anche lo scenario con `renderer.draw(t,[])`, usando la stessa camera e le stesse risorse del draw reale. Richiede almeno16 colori quantizzati e una frazione di dettaglio dello scenario superiore al2,5%; il solo sprite del protagonista contro lo sfondo vuoto non basta. Il draw con gli attori viene ripristinato immediatamente e produce il PNG. Le quote attese50/30/40/−59/50 della Palestra sono confrontate con la camera effettiva.

Le prove precedenti restano disponibili. `qaStages043` esclude i contesti049 aggiunti; `qaMoves048` usa `DRIFTVEIL_DATA` per mantenere la matrice storica di203 coppie aggiunte, senza includere mosse/specie introdotte successivamente.

La matrice049 contiene1760 coppie,911 aggiunte rispetto alla048,126 coppie della famiglia meteorologica aggiunte rispetto alla048 (incluse quelle naturali) e120 coppie ulteriori rese disponibili specificamente dalle quattro MT. Questa pagina descrive il protocollo: gli esiti effettivi della candidata e la pubblicazione sono registrati separatamente in [QA-049.md](QA-049.md). Nessun confronto udibile o certificazione delle GPU fisiche viene dedotto dalla sola esistenza della fixture.
