# Correzioni da prove su telefono · 0.57

Le immagini fornite il17 novembre mostrano errori che i precedenti collaudi
non avevano intercettato. Questa revisione aggiunge regressioni dedicate;
un precedente PASS non dimostra assenza di questi difetti.

| Caso | Causa e correzione |
| --- | --- |
| Protagonista decentrato sul Percorso2 | Il target orizzontale moltiplicava la posizione assoluta per0,7. Ora segue la posizione effettiva, conservando visuale bassa, zoom e camere narrative esplicite. |
| Protagonista sopra la parete del varco320 | Il triangolo più alto veniva usato come pavimento. Il varco dichiara il piano nativo a−0,125; pareti e soffitto rimangono presenti. Anche la quota5,5 di un vecchio salvataggio non solleva il corpo. |
| Alberi e dislivelli nel campo di battaglia | Percorso1/2 e Cantiere dei Sogni usavano direttamente ostacoli della mappa esplorabile. La zona d'azione ora è una radura piana con materiali originali del luogo e scenario nativo distante. Ombre e piedi condividono il piano; le specie ambientali restano sullo sfondo. |
| Volti Interpoké, nomi coperti e comandi scuri | Gli estrattori associavano risorse facciali a personaggi diversi. Il nuovo riferimento comprende tutti i sei partecipanti nativi. Il pannello riserva lo spazio effettivo della barra velocità/riavvio dopo resize; i comandi touch mantengono testo leggibile anche dentro il dialogo. |
| Attesa all'apertura della lotta | Le stesse immagini dell'interfaccia sono trasportate in un pacchetto SFP1 dedicato, senza ricompressione o riduzione della qualità. I file individuali e i tentativi automatici restano disponibili. I materiali indipendenti del fondale entrano insieme nel pool limitato a sei richieste. |

## Prove e criteri di consegna

I rapporti grezzi restano esterni alle build in
`outputs/chapter057-preparation`. La ricevuta finale deve riferirsi al commit
e alla revisione della candidata effettivamente collaudata e pubblicata.

- Regressioni CPU: geometria nativa del varco, camera nei tre formati,
  radure/occlusione/appoggi, concorrenza/guasti dei materiali, associazione
  dei volti, posizione dei pannelli, integrità del trasporto.
- Replay con renderer reale: `qaFieldGate057`, `qaFieldCamera057`,
  `qaBattleClearings057`, `qaBattleDoubles057`, chiamate Interpoké,
  menu/Borsa, ripristino delle risorse e introduzione.
- Desktop1280×720, verticale390×844 e orizzontale844×390; ogni PNG
  esportato richiede esame visivo e associazione SHA alla candidata.
- Suite completa di49 fasi e controlli CI prima dell'integrazione.
  Verifica del manifest e dei file HTTP dopo l'effettivo deploy Pages.
- H.8: conservazione dell'ultima build verificata e al massimo una
  precedente utile; nessuna perdita di sorgenti, ROM o rapporti.

## Misure e limiti

Il riferimento prima della correzione è la candidata0.56
`c36caf0b62726b16`. Nel benchmark isolato di preparazione dell'interfaccia,
con100ms di latenza artificiale per richiesta, tre contesti freddi hanno
impiegato10643,8697 e8922ms, con272 richieste ciascuno. Il riuso già pronto
richiedeva0–0,1ms. Le misure successive devono usare lo stesso banco;
questi valori non descrivono la rete5G o la GPU fisica del telefono.

La revisione conserva le meccaniche delle lotte, le matrici di mosse/MN,
la progressione fino al primo finale e il limite54. Non certifica ogni
dispositivo Android, un confronto audio all'ascolto o l'assenza assoluta
di altri bug. Le prove di pose/preview restano distinte dai turni effettivi.
