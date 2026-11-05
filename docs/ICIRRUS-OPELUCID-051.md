# Mistralopoli e seguito · 0.51 in lavorazione

Base pubblica verificata0.50, revisione9f3eb3ed9c872f04, main09ac96fdc7e958085db64966304a7b4bfdff4223. L'utente richiede di continuare città per città fino al primo finale, senza omettere gli standard A–H; le MN personalizzate sul campo seguono il finale.

Questa tappa parte da Silvestro e segue gli eventi nativi fino alla prossima città. Cap39 prima della settima medaglia,43 dopo, sulla base dei massimi delle squadre131/133 già verificati nella ROM. Conservare livelli e XP legacy superiori. Inventariare zone, script, incontri, servizi, sfondi, coppie specie–mossa e itinerari prima dell'integrazione; l'estrazione privata non costituisce contenuto giocabile.

La0.51 non è ancora integrata né collaudata. La0.50 resta il riferimento pubblicato. Nuove varianti stagionali, ghiaccio, puzzle, animazioni, Interpoké, audio e salvataggi richiedono prove specifiche; non riusare genericamente i PASS della0.50 per certificarli.

## Preparazione verificata dei riferimenti

Il lettore privato ricava48 zone/49 programmi,134 modelli e1027 texture dalla ROM: palestra114, Torre Dragospira205–213, Deserto157–159/Castello160–165, Percorso8/Palude345–346, varchi347/349 e Ponte Propulsione254, Percorso9/348, arrivo e interni di Boreduopoli120/122–135, oltre ai rientri a Zefiropoli16–17 e a Mistralopoli113–119. La palestra121 e le camere166–190 del Castello non sono incluse automaticamente dal solo nome geografico. I rami facoltativi estratti non sono dichiarati servizi o eventi già giocabili.

Le firme mancanti sono verificate nei handler originali delle overlay10/21, con disassemblati esterni in `outputs/chapter051`; il lettore aggrega gli errori ma rifiuta di esportare un catalogo parziale. La decodifica non implementa la semantica dei comandi del puzzle, delle sequenze o dei servizi. I249 gruppi traslucidi conservano i modi GLB originali.

Il catalogo di riferimento comprende57 allenatori,124 specie/forme,32 tabelle stagionali e47 macchine. Silvestro131 usa Vanillish37, Cryogonal37 e Beartic39; il prossimo massimo nativo resta43. I15 nuovi ID sono553,556,558,563,576,593,598,606,608,611,619,621,623,624,626: Fraxure e Bouffalant restano soltanto avversari nel catalogo. Le fonti ottenibili indicate dal catalogo richiedono ancora l'abilitazione dei relativi luoghi/eventi. Le otto macchine aggiunte sono item357/363/366/369/370/383/390/406, con mappatura ARM9 e compatibilità native.

Sono estratti64 file Nitro fronte/dorso per15 specie più Jellicent femmina e32 ritratti tramite il player effettivo. Il resolver grafico conserva ora il sesso dopo Frillish→Jellicent; il genere asessuato del personal prevale sulla soglia PID degli allenatori. L'operazione nativa OR del programma426 è implementata a16bit nella VM. Le due regressioni OR e le due del resolver falliscono prima delle correzioni.20 controlli mirati di VM, rami, dati, identità e presentazione precedente passano. Queste prove non certificano un replay della storia051 o le nuove coreografie.

I cataloghi sono presenti nei sorgenti ma non sono registrati nell'index/runtime: cap, zone e progressione pubblici restano050. Prima dell'abilitazione servono loader per famiglie geografiche con metadati utilizzabili anche dagli NPC fuori mappa, superfici/ghiaccio e puzzle nativi, integrazione degli script e itinerari, fonti/servizi effettivi, matrice completa entro43, rig e reazioni su entrambi i lati, fondali/ambientali e audio, quindi suite condivisa e browser nei tre formati. Non caricare l'intera nuova geografia all'avvio per evitare il ritorno delle attese già corrette.
