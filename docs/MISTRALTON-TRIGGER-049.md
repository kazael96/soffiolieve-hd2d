# Casella speciale del Deposito Frigo

La zona191 contiene un record22byte a X169/Z475, script2000, tipo6, variabile0. Non è una normale scena da avviare camminando. Il vecchio ciclo di `original-story.js` ignorava il tipo e provava a eseguire la voce1999 del banco382: il VM rifiutava correttamente l'evento e il campo rimaneva in errore. Il tempo impiegato per attraversare la casella rendeva intermittente il difetto nel replay.

La ROM IRBI distingue questa query: overlay10 `02162780` confronta esplicitamente il tipo con6 a `021627a2`; `02162830` ne restituisce lo script o FFFF. Il caller overlay21 `02189e10–26` la esegue soltanto dopo il predicato relativo all'header `02013ffc`. La query ordinaria `021626b8` seleziona invece il tipo tramite `0216268c` e il parametro ricevuto. I disassemblati e i caller originali sono conservati nel rapporto esterno `outputs/chapter049/trigger-*`.

Il port esclude il tipo6 dal ciclo dei passi incondizionati. Conserva il record estratto e gli eventi ordinari; non dichiara implementata l'intera funzione speciale della query dal solo fatto di evitare la chiamata errata. Le altre tipologie eventualmente introdotte dai capitoli futuri richiedono il loro dispatcher nativo.

La regressione `tests/mistralton-trigger-types.test.cjs` usa il vero host degli eventi e la casella originale, con avanzamento a×1/×2/×4. La baseline riproduce `Event outside the extracted opening`; la correzione lascia controllo e variabile16528 invariati. Il replay browser visita esplicitamente la casella dopo l'evento di Komor, prima di continuare nel magazzino: non si affida più a evitarla incidentalmente.
