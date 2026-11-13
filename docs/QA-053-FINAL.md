# Accettazione locale del primo finale0.53

La candidata18, revisione `8f90f07adbc35fe2`, collega la Lega al Castello di N,
alla cattura di Reshiram, alle lotte con N e Ghecis, ai crediti, al salvataggio
e a FINE. Il limite segue le squadre native:50/52/54. Non sblocca il postgame.
Le MN personalizzate nel mondo restano la successiva estensione richiesta.

Tutte le prove sotto si trovano in `outputs/chapter053-preparation`, fuori
dalle build. `field18-release-gate-audit.json` ricontrolla risultati, revisione,
SHA dei462 file radice congelati e inventario completo dei405 PNG del browser,
tutti rivisti; sono rivisti anche i30 fotogrammi delle dieci nuove icone native.
Il risultato è **LOCAL_PASS**, distinto dalla pubblicazione: la chiusura della
[PR47](https://github.com/kazael96/soffiolieve-hd2d/pull/47) richiede anche CI
sul commit finale, Pages e confronto dei payload effettivamente serviti.

## Prove della candidata effettiva

| Rapporto | Risultato | Perimetro |
| --- | --- | --- |
| `deep-field18` |49/49 PASS,977,360s | Otto gruppi unitari entro180s,52 test Python,41 fasi non unitarie, capitoli precedenti e stress test |
| `browser-field18-production-menus` | PASS tre formati,3 PNG rivisti | Avvio del bundle di produzione senza preview, menu e recupero delle risorse; i PNG mostrano il rapporto dopo la chiusura dei menu |
| `browser-field18-field-regressions-second` | PASS tre formati,57 PNG rivisti | Trasporto Centro/Castello, pose dei draghi, rituale e variante geometrica con cache calda, sei fondali |
| `browser-field18-moves` | PASS tre formati,243 PNG rivisti | Tutte le378 nuove coppie, entrambi i lati, esiti e fasi previste; totale numerico4.365 coppie/147 record |
| `browser-field18-mail-pokedex-second` | PASS tre formati,33 PNG rivisti | Squadra piena/Box, Messaggio conservato e riconsegnato, icona Reshiram,38 nuove registrazioni Pokédex |
| `browser-field18-real-finale` | PASS tre formati,24 PNG rivisti | Interazione A, Master Ball realmente usata, N587 e Ghecis232 vinti dal motore GEN5, crediti/salvataggio/FINE;252,307/170,612/174,049s |
| `browser-field18-elite` | PASS tre formati,45 PNG rivisti | Quattro lotte reali e progressione della Lega; Marzio a×1/×2/×4. Lotte202,339/142,187/148,076s |

Desktop1280×720, telefono390×844 e844×390. Chrome155 headless, profilo
temporaneo isolato e ANGLE SwiftShader; nessun controllo del PC personale.
I replay preparano esplicitamente prerequisiti e squadre legali allenate;
gli esiti delle lotte effettive non sono forniti dal banco. Il finale usa
un adattatore Map di persistenza isolato. Non è una singola partita continua
dall'inizio della campagna, una verifica Android fisica, un confronto udibile,
un confronto di ogni fotogramma con la cartuccia o una garanzia di assenza di bug.

## Checklist A–H

- [x] **A — Eventi/NPC:** percorsi, arrivi e ricostruzioni conservati; suite
  condivisa e replay di trasporto, ingressi e finale. Nessuna rimozione aggiunta
  per aggirare un percorso. Le prove con prerequisiti sono dichiarate sopra.
- [x] **B — Presentazione:** geometria nativa e variante della parete coerenti,
  camera e sprite conservati, primi piani e Poké Ball originali osservati negli
  eventi reali. Tutti i PNG esportati sono inventariati e rivisti.
- [x] **C — Lotte:** quattro sale dei Superquattro e due varianti del trono;
  terreno, contatto e prospettiva verificati. Nessuna fauna inventata negli
  interni senza incontri selvatici; fondali precedenti conservati.
- [x] **D — Animazioni/meccaniche:**378 nuove coppie nel renderer e matrice
  numerica completa; attaccante/bersaglio e due lati. Avversari e regole GEN5
  originali, livelli e vincoli di ottenibilità distinti. Le MN sul campo non
  vengono conteggiate come completate dalle animazioni di lotta.
- [x] **E — Audio:**1140 per Reshiram, ripristino587, transizioni dei crediti,
  versi/effetti e annullamento dei completamenti obsoleti; test del segnale e
  dei tempi logici. Uscita del browser muta: nessun confronto all'ascolto.
- [x] **F — Comandi/servizi:** avvio e menu nei tre formati, PC/Messaggi, icone,
  input A/B, velocità e riavvio con conferma nelle regressioni condivise.
- [x] **G — Persistenza/recupero:** salvataggi precedenti, ripresa delle fasi
  finali e transazione866:1, errori temporanei e contesto, nessuna ricompensa
  duplicata; i test non leggono né modificano la partita reale.
- [x] **H — Regressioni/inventari:** suite completa, prove grafiche della18,
  fallimenti conservati e correzioni riprodotte, inventari e checklist.
  Le candidate obsolete sono preservate integralmente prima della rimozione;
  dopo il rilascio mantenere053 e052 di confronto secondoH.8.

## Correzioni rilevate durante l'accettazione

Il primo collaudo con cache calda lasciava la matrice172 invece della212:
il comando della variante ora invalida la preparazione della scena. La pagina
ometteva il catalogo delle icone finali: ora lo carica prima dell'interfaccia.
Le regressioni falliscono sui sorgenti precedenti e passano dopo la correzione.

Due ulteriori fallimenti riguardavano l'isolamento del banco: attori visivi
ricatturati nello scenario successivo e fotografia del foglio Messaggi durante
il caricamento dopo32ms. Ora il seed azzera anche gli attori della fixture e
la fotografia attende il foglio realmente pronto. Nessuna di queste modifiche
ritira NPC nella partita o aumenta i timeout. Dopo l'ultima modifica della sola
attesa Mail,14 test condivisi del banco passano; runtime18 e caso della matrice
restano immutati. La CI finale riesegue l'intera suite con la fixture aggiornata.

La [cronologia053](QA-053.md) conserva i rapporti precedenti e i limiti.
Il workflow Pages verifica nuovamente la build prima della distribuzione;
la versione pubblica si legge dal [manifest effettivamente servito](https://kazael96.github.io/soffiolieve-hd2d/build.json).
