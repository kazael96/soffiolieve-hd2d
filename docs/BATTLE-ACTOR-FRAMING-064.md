# Inquadratura stabile dei combattenti ·0.64

La revisione dei comandi reali di Emboar ha trovato un secondo problema, distinto dalle durate native nulle: in tre dei430 disegni registrati il pugno dell'Emboar passivo supera il bordo sinistro. Gli stessi tick, pose e matrici producono il ritaglio anche con il selettore temporale corretto. Nei dati CPU il margine arriva a−6px; la correzione delle durate non risolve questo caso.

`BattleGround.setActorFraming({owner,actors})` prepara un piano di inquadratura per la sessione effettiva. La prima registrazione accetta soltanto due Emboar nativi visibili in una lotta singola, con banchi pronti e identità dei relativi Pokémon/slot. `actors.p1` e `actors.p2` dichiarano `nativeMon`, `graphic`, `slot`, `back`, `visible`, `bank` e gli eventuali stati `hidden`, `substitute`, `minimized`, `faint`. Le mosse vengono lette dai `moveSlots` nativi tramite il dex; una lista opzionale `moveIds` deve corrispondere ai dati reali.

Le dipendenze del renderer e di MoveFX vengono risolte alla registrazione, non quando si carica `battle-ground.js`, che nell'index precede entrambi. Il sincronizzatore del gioco deve chiamare l'API prima di risolvere la presentazione del campo di battaglia e liberarla alla fine della sessione con `clearActorFraming(owner)`. Una richiesta vecchia non può cancellare il piano di una sessione nuova.

## Calcolo e continuità

Il piano compone i contorni dei pixel opachi delle celle originali con tutte le trasformazioni native a durata positiva raggiungibili dalle mappe del primo parent. L'unione indipendente delle fasi è conservativa: comprende anche combinazioni che potrebbero non coincidere temporalmente. Non usa il massimo di127 fotogrammi campionati, né include le pose spurie create dai descrittori a durata zero. Le celle e i relativi hash vengono verificati nei test decodificando indipendentemente i PNG originali.

Le camere vengono compilate dai timeline delle mosse effettive, per tutte le varianti e i due modi di attesa, includendo sempre Scontro come ripiego possibile quando finiscono i PP. Questo non aggiunge una mossa ai Pokémon né ne cambia i PP. Nel modello corrente i movimenti della camera dipendono da contatori interi; con eventi/parametri interi sono costanti su ciascun intervallo nativo `[n,n+1)`. L'API rifiuta esplicitamente tempi non interi, dati non disponibili o domini oltre il budget di preparazione. Questo argomento riguarda il modello di camera attuale, non certifica l'intero controller Nintendo.

Per ogni viewport si sceglie un solo fattore comune che mantenga entrambi gli involucri nativi dentro la camera, con margine2.01px. Nei moveset205/360 a390×490 risulta circa0.92555; il numero è un risultato dei dati, non una scala codificata a mano. Il piano conserva `x`, `y`, `world`, `view` e `pixelsPerUnit`; scala insieme `height` e `size`. Le pose, Contact e i punti degli effetti leggono lo stesso layout. Il raggio dell'ombra segue l'altezza adattata, mentre la proiezione e il punto sul terreno restano fisici.

La scala è memorizzata per sessione e layout. Non viene rifatta a ogni mossa o fotogramma. Registrazioni equivalenti riusano piano e geometria; anche una condizione non supportata invariata viene memorizzata. Una variazione temporanea di visibilità, Sostituto, Minimizzato o svenimento conserva il piano già registrato: è un requisito di continuità della scala, non una nuova approvazione geometrica di quelle rappresentazioni. La prima registrazione con tali stati rimane esclusa.

Un cambio di attore, mosse, banca o sessione invalida il piano e restituisce il layout base con stato diagnostico esplicito. Non genera un'eccezione che congeli il renderer. Il sincronizzatore può registrare il nuovo piano durante il cambio coperto del Pokémon.

## Prove e perimetro

Le regressioni coprono i tre veri witness di ritaglio con i pixel originali, proprietà e continuità del piano, sorgenti nel vero ordine dell'index, invalidazione/recupero, riuso delle registrazioni e rifiuto di input non verificati. Il riferimento precedente fallisce sul margine opaco effettivo; il nuovo passa. In1016 pose fornite al banco Contact ricalcola il contatto con la nuova altezza, conserva home/recupero e non modifica HP, PP o turno. La prova privata della funzione reale `MoveFX.point` conserva un solo passaggio di scala per attore e bersaglio.

Il limite dimostrato è l'involucro nativo idle nelle camere compilate. Non certifica da solo l'involucro continuo di rotazioni, gesti autoriali, reazioni, Sostituto, doppie o altre specie. Le nuove dimensioni e i relativi contatti/effetti richiedono una candidata integrata e collaudi grafici dei comandi reali nei tre formati e alle velocità previste. I precedenti PNG della C3 restano riferimenti della versione precedente.
