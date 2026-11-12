# Primo finale: riferimenti nativi e integrazione ancora aperta

Destinazione autorizzata: Lega, Castello di N, lotte con N/Ghecis e finale principale. Il postgame resta escluso. Questa pagina registra riferimenti letti dalla ROM IRBI dell'utente; non dichiara eventi giocabili o pubblicati.

## Aree

- 137: atrio Lega, quattro porte140–143 e portale speciale65535.
- 140–143: sale dei quattro Superquattro; relativi ritorni137.
- 138/139: collegamenti del settore144;139 collega anche264.
- 144: N, due ruoli alternativi di Nardo e Komor. Non attivare la lotta con Nardo407 del postgame.
- 264–278: catena del Castello di N.264 collega139→265;265 serve266/267/268/269;269 serve270/271/272/273;273 serve274/275/276/277;277 porta278, sala finale con N, Ghecis e Nardo.
- 145: programma del settore successivo; la sua presenza non autorizza contenuti postgame.

`outputs/chapter052/finale-zone-survey.json` conserva attori, flag, portali, musica e testi di31zone di ricerca, comprese aree adiacenti non automaticamente incluse nel finale. `finale-role-index.json` indicizza tutte le mappe con N/Nardo/Ghecis.274–278 non vanno confusi con le camere166–190 del Castello Sepolto.

## Squadre native

| Allenatore | ID | Massimo livello | Perimetro |
| --- | --- | --- | --- |
| Antemia |228|50| Primo finale |
| Marzio |229|50| Primo finale |
| Mirton |230|50| Primo finale |
| Catlina |231|50| Primo finale |
| N |586/587|52| Due versioni native; verificare la selezione IRBI, non rendere entrambe arbitrariamente disponibili |
| Ghecis |232|54| Primo finale |
| Nardo |407|77| Escluso: postgame |
| Superquattro rivincite |563–566|73| Esclusi: postgame |

`finale-trainer-reference.json` conserva specie/forma, livello, mosse, strumenti, difficoltà e byte genere/abilità, con firme degli header e delle squadre. Non è ancora il catalogo runtime completo di natura/IV/abilità né una verifica delle battaglie.

Mancano nei cataloghi di progressione cumulativi attuali Chandelure, Bisharp, Reuniclus, Hydreigon, Reshiram, Zekrom, Carracosta, Archeops e Zoroark. Integrare le coppie specie/forma–mossa, risorse, versi, icone e profili per entrambi i lati; la presenza di altre specie delle stesse squadre non certifica le mosse specifiche. La successiva progressione fino al finale deve considerare il massimo54 nativo e preservare XP/livelli legacy superiori.

## Programmi e comandi

`finale-script-audit.json`:24programmi (137–145 e264–278) decodificati con le firme esistenti, senza aggiungere operandi inventati. `finale-runtime-command-audit.json`:127nomi distinti,29assenti dagli switch VM/host. L'inventario statico non certifica la semantica dei comandi già presenti.

Comandi da integrare/verificare:37,126,161,162,184,191,217,289,293,300,302,328,342,376,378,379,380,418,419,420,443,469,575,581,597,598,599,600,601. Handler ARM9/overlay10/21 disassemblati in `finale-handlers-first.txt`; proseguire nei task/callback degli overlay specifici prima di assegnare significati a rituali, teletrasporti, leggendario, cambi della squadra e titoli di coda. Nessun comando di attesa deve diventare un no-op per far avanzare la trama.

## Continuità e servizi

Il membro Plasma146:0 è nascosto dal flag669. Il programma528 nella zona264 lo rende disponibile con `FlagReset669` al pc1023. Il gruppo consecutivo `FlagSet` del comune866, byte36..524, contiene669,759 e816 (`common866-flag-run.json`); il programma866 completo non è decodificato da questo audit (primo comando non supportato249 a0x1e). Usare il riferimento esplicito per una migrazione compatibile, senza reimpostare flag dopo l'avanzamento della storia.

La scelta del membro Plasma nel Centro146 usa il trasferimento nativo191 verso272/9/8/facing1. Renderlo disponibile prima dell'evento264 espone una destinazione non ancora integrata. Infermiera2100 e due negozi10110 nel Centro146 restano da collaudare con input reale, costi/quantità, PS/PP/stati e rientro. Nardo/Komor devono raggiungere fisicamente il prossimo ruolo;337 non è una destinazione reale della Lega.

## Criteri ancora da completare

Viaggi e ripresa degli NPC; migrazioni; servizi; geometria e risorse delle aree finali; presentazione delle sequenze native; fondali specifici; copertura delle coppie e reazioni; audio; leggendario/cattura/squadra/Box; vittorie e sconfitte; credits/finale; suite completa e input/GPU nei tre formati sulla stessa build; pubblicazione verificata. Dopo il primo finale seguono le MN sul campo personalizzate già richieste. Nessun lavoro preparatorio aumenta la percentuale narrativa pubblicata.

## Precisazioni della ricerca nativa · 11 novembre

Programma556, pc2396..2441:224 legge la versione; confronto con20, salto255 sul confronto falso. IRBI restituisce21, quindi viene chiamata la squadra587 (Zekrom52, Carracosta/Vanilluxe/Archeops/Zoroark/Klinklang50). Non scegliere586 in Nero. Questa è selezione verificata nel codice decodificato, non battaglia integrata.

Il flag185 viene impostato nel programma528/campo264 al pc1027, subito dopo FlagReset669: corrisponde all'apertura del Castello e non dimostra il completamento dei titoli di coda/postgame. La136 lo legge per il suo ingresso alternativo. Le rivincite continuano a richiedere i propri flag/ruoli separati.

finale-overlay-candidates.txt censisce tutti gli overlay che sovrappongono021f35a0. Nell'overlay56 gli indirizzi35a0/35a8 sono effettivamente un dispatch e una tabella di callback compatibili con418/419; finale-overlay56-disassembly.txt conserva hash e istruzioni. Non basta per attribuire l'overlay alla scena: ricostruire anche il caricamento e i task. finale-ending-task.txt segue342→215f798, senza ancora assegnare una semantica finale non dimostrata. Nessun handler mancante è stato sostituito da un no-op.


## Lettura dei flag nel finale: prova nativa aggiuntiva

`finale-flags-disassembly-authorized.txt` confronta gli handler35/36/37 con la routine ARM9. Il37 risolve il primo operando, legge il bit tramite20142e8 (selettore del byte2014388, maschera1<<bit) e scrive0/1 nel work puntato dal secondo operando. In137, programma274 pc30, viene letto il flag357 nel work32784 prima del ramo dell'ingresso. Si tratta di una lettura senza mutazione, non di una flag impostata per far passare il cancello. Non è ancora un handler runtime.

`finale-return-flags-native.txt` segue anche217→2012900→2008850: il comando salva un halfword nell'oggetto persistente soltanto quando2159e84 restituisce1. Il valore12 nell'atrio137 non va interpretato arbitrariamente come numero di mappa o healZone12: manca ancora la tabella e la semantica del contesto.191 legge quattro operandi halfword, costruisce X/Z fixed-point e avvia il task2184f50;443 avvia un task basato su216c0f4 e non può diventare un no-op. Questi risultati sono ricerca read-only nella ROM, non storia integrata.


## Proprietà del modulo delle stanze dei Superquattro: prova esplicita

La lettura dei literal OP420 in `finale-overlay56-ownership.txt` dimostra il caricamento dell'overlay56 (literal021b55d0=0x38), tramite21bb874. Non è più un'attribuzione basata soltanto su indirizzi sovrapposti. La tabella di salto ha offset42/8/16/24/32: argomento0 termina senza caricamento,1..4 configurano rispettivamente le mappe140..143. I descrittori sono4224/4254/426c/423c, con dimensione0x80, valore0x10 e tre callback originali ciascuno; `finale-overlay56-descriptors.json` e `finale-elite-four-native-init.txt` conservano puntatori e codice. Seguire i callback e i task418/419 per animazioni e camera prima dell'integrazione, senza sostituirli con attese o no-op. Le mappe147..149 sono Torre Unione e150/151 lotte di collegamento, come confermato dai testi originali estratti in `finale-native-texts.json`; non inserirle automaticamente nel primo finale.145Sala d'Onore resta riferimento distinto dal primo finale342(0) in556.
