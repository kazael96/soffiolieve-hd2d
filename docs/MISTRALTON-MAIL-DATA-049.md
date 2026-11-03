# Posta locale · fonti native 0.49

`tools/extract-mistralton-mail.py` legge la ROM italiana IRBI e genera solamente `src/mistralton-mail-data.js` e nove PNG originali. Il controller della Posta e i collegamenti a Borsa/Squadra appartengono a un modulo distinto.

Il catalogo `MISTRALTON_MAIL_DATA` contiene:

- `labels.mail/composer/editor/groups`: banche originali59/60/146/145 di `a/0/0/2`.
- `groups`: undici lessici di visualizzazione, con `name`, `bank`, `words` e indici `disabled`. Pokémon70, mosse203, abilità182 e parole149…156 conservano tutti gli indici, compresi i segnaposto disabilitati. I banchi alfabetici100…126 sono chiavi normalizzate di ricerca, quindi non sostituiscono le parole visualizzate.
- `phrases`: sette gruppi nella sequenza nativa94/96/99/93/98/95/97, con `templates` originali e `sourceGroup`. Totale123 record, incluso il record vuoto97/1 che deve essere respinto dal composer. I segnaposto sono `{011c:0}` e `{011c:1}`; le interruzioni restano nella forma originale `\n`.
- `items[137…145]`: nome, descrizione e `paper` con percorso PNG, dimensioni, rettangolo visibile, colore0 della palette, hash e membri originali.

La tabella ARM9 `0209f6a4` seleziona le sette banche dei modelli; i loader sono `020243a0` e `02024418`. L'overlay136, `021c520c…021c5236`, legge tre frasi da otto byte a partire da Mail+`0x16`: gruppo, modello e due parole codificate. Questa è la base per il formato locale con tre frasi e due riferimenti a parola; non vengono inventate frasi libere.

L'overlay136 contiene i moduli `mailtool.c`, `mailsys.c`, `mailview.c`. Il loader `021c4d8c` apre il NARC155, `a/1/5/5`. Il tipo della carta si trova a Mail+`0xb`: caratteri12+tipo, tilemap24+tipo e palette tipo. I dodici tipi della ROM comprendono i nove strumenti attualmente venduti137…145, che usano tipi0…8. I PNG conservano i pixel originali256×192. Le finestre native delle tre frasi iniziano a24,24;24,64;24,104, con estensione208×32. Le due finestre del piè di pagina sono64,152/88×16 e168,152/64×16. La loro costruzione è in `021c4ffc…021c508e`; i controlli del composer HD-2D possono adattare la disposizione, dichiarandolo.

L'editor locale usa i lessici estratti; i criteri DS per sbloccare singole parole non sono stati ricostruiti. `disabledFont` conserva gli indici delle parole con caratteri non presenti nei173 glifi della fonte italiana compatta esistente e li include in `disabled`: è un adattamento del font browser, non una regola di sblocco DS. Non vengono implementati trasporto di rete o scambi con altre console. Le categorie browser dei lessici aggiuntivi non pretendono di trascrivere tutte le regole del selettore DS.

Eseguiti: estrazione reale dei nove sfondi; verifica locale visiva di137 (carta con Pikachu/fiori) e145 (Ponte Libecciopoli); quattro test di grammatica/indici/font/integrità degli asset. Non eseguiti qui composer browser, tastiera/touch, dare/togliere e ricarica: queste prove spettano al controller integrato. Nessuna build o pubblicazione eseguita da questo sottocompito. Rapporto completo in `outputs/chapter049/mail/extraction-report.json`.
