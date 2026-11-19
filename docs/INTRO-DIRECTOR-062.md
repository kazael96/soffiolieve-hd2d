# Lancio, Smeraldo e passaggio Nero2 → HD-2D · 0.62

Richiesta del19 novembre2026: migliorare il lancio della Poké Ball e la tappa Smeraldo, aggiungere Nero2 e far evolvere camera e grafica insieme verso la versione attuale. Si conservano tutte le regole A–H, figure intere native, identità, tre salvataggi e le regressioni precedenti.

## Lancio

La Ball precedente appariva molto piccola perché il ritaglio32×34 comprendeva un corpo visibile22×22. La nuova scala conserva il ritaglio nativo, rende leggibile la sfera e cresce gradualmente da10 a13 pixel durante il volo. La presa torna alla dimensione iniziale senza uno scatto. Un solo sprite rappresenta la Ball; una scia sottile segue alcune sue posizioni effettive precedenti, senza duplicarla.

Il braccio conserva una velocità in avanti più marcata al rilascio e accompagna il gesto fino al52. Il volo eredita la velocità della mano, rallenta prima dell'apertura e conserva il recupero continuo. Restano i fotogrammi46/76/112 per lancio, apertura e verso, Minccino86 e appoggio128. Il clock45 fotogrammi logici al secondo rende più leggibile il gesto, conservando ×1/×2/×4, checkpoint, sospensione e annullamento. Sono16 le pose esportate per formato. Non si dichiara una riproduzione temporale identica all'overlay DS.

## Smeraldo e Nero2

Smeraldo è disegnata direttamente a240×160: non viene più stirato il pittore Game Boy. Si mantengono laboratorio, tre case, rete dei sentieri, fiori e lungomare di Soffiolieve. La nuova veduta comprende chiome arrotondate con bordi e gruppi di foglie, erba a ciuffi, tetti con corsi sfalsati, laboratorio caldo, finestre con vetri e serramenti, zoccoli, comignoli, panchina, cartelli, parapetto e acqua a più toni. È una reinterpretazione autoriale dello stile GBA, non un'estrazione dalla ROM di Smeraldo.

La sequenza diventa Giallo, Oro, Smeraldo, Platino, Nero, Nero2 e HD-2D. La tappa Nero2 mantiene la stessa città e l'identità scelta, con griglia DS256×192, colori più vividi e vista43°. Usa i dati disponibili di Soffiolieve di Nero adattati; non viene attribuita a un archivio nativo di Nero2 non presente. Non introduce il protagonista, la trama o nuove mappe di Nero2.

Riferimenti visivi: [Smeraldo, immagini del gioco su Famitsu](https://www.famitsu.com/article/202509/52070), [Soffiolieve in Nero2/Bianco2](https://pokeaogtytnsy.blog70.fc2.com/blog-entry-1531.html). Le immagini esterne non sono incorporate negli asset.

## Un solo movimento verso la resa attuale

Le prime cinque transizioni conservano il fronte diagonale fine. Dopo la veduta stabile Nero2, dal302 al378, un solo renderer privato sposta il centro, abbassa il pitch43°→25° e adatta l'inquadratura. Lo stesso progresso controlla pixel, palette e ingresso della postproduzione. Non viene sovrapposta una città vista da due camere diverse. La posa finale mantiene la camera e la resa HD-2D della0.61; il montaggio termina al432, con durata nominale14,4s a×1.

Il framebuffer resta768×576 durante tutto il movimento. La griglia DS e il passaggio alla resa moderna sono applicati nello shader; niente letture GPU→CPU, texture, bitmap o contesti creati per ogni fotogramma. Le due catture Platino/Nero continuano a leggere il framebuffer prima degli effetti moderni. La proprietà del postprocesso è disponibile solo ai renderer isolati; il campo normale conserva valore1 e la resa completa precedente.

Il renderer privato non chiama camere, proiezioni, effetti o presentazioni MN del campo attivo. Non modifica posizione, stato, identità, camera o epoca del renderer giocabile. Viene mantenuto mentre serve, quindi rilasciato una sola volta a fine montaggio, annullamento o errore. Un errore libera anche la preparazione risolta o ancora pendente; Riprova prepara un nuovo proprietario, senza riusare quello distrutto o ripetere il lancio. `activeViews` deve tornare a zero.

## Verifica e consegna

Le regressioni coprono sette tappe e confini, camera/progresso sincronizzati, una sola veduta, riuso di superfici e renderer, errori e rilascio del contesto, isolamento dal campo normale, pixel GBA, impulso e dimensione visibile della Ball, scia e contatti. Le prove matematiche non sostituiscono la revisione delle immagini.

Il replay dell'index reale mantiene12 casi nei tre formati e alle tre velocità. Registra16 pose del lancio,19 vedute del montaggio per formato e tre schermate di recupero:117PNG complessivi. Verifica sette pose effettivamente disegnate del movimento finale, camera del campo invariata, una sola sessione privata durante il percorso normale e zero proprietari dopo la conclusione. Nei tre casi di recupero inietta anche una perdita reale del solo contesto privato durante il movimento; controlla campo ancora pronto, introduzione incompleta, messaggio recuperabile e ripresa senza rilanciare Minccino.

Prima della consegna servono suite completa49 fasi, replay interessati nei tre formati, revisione di ogni PNG, H.8, CI/Pages e verifica del codice pubblico. Le prove sono esterne alle build in `outputs/chapter062-*`; solo una ricevuta finale completa certifica la consegna. Chrome isolato con viewport mobili non certifica una GPU Android fisica né un confronto audio all'ascolto. Il rallentamento Intel osservato nella0.61 rimane storico e non viene dichiarato risolto da queste modifiche.
