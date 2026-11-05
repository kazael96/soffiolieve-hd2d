# Monte Vite: varianti stagionali della 0.50

Il nuovo catalogo riguarda il cortile esterno di Monte Vite, zona199. Non certifica varianti geometriche di ogni ambiente precedente o della città di Mistralopoli.

`tools/extract-mountain-seasons.py` legge la ROM IRBI e il selettore nativo a record di16 byte (`<HBB5HH`). Il record34 seleziona la matrice93 nelle stagioni0/1/2 e193 in inverno3. Le mappe sono330–333 oppure396–399; le texture del terreno provengono dai membri110–113. Il contenitore delle decorazioni è28: cinque collocazioni normali, nessuna in inverno. I quattro cataloghi utilizzano456 immagini referenziate; preparazione e rapporti originali restano esterni al sito.

`FieldSeason.current` mantiene una stagione effettivamente caricata nel salvataggio. Geometria, superfici native, incontri, musica, forme stagionali e script210 condividono quel valore. Il calendario non cambia indipendentemente la geometria mentre il giocatore la vede. L'aggiornamento viene differito a un passaggio coperto da interno a esterno, senza itinerari pendenti interessati: questa politica di presentazione è un adattamento browser documentato, non una certificazione della temporizzazione originale.

`IcirrusSeasons` conserva un solo catalogo di metadati attivo e prepara il relativo pacchetto immagini prima della presentazione. Modelli, griglie e superfici vengono sostituiti insieme. Richieste superate non installano vecchie varianti e gli errori possono essere ritentati. Le cache GPU seguono i budget condivisi; non si dichiara che un singolo catalogo di metadati equivalga a una sola stagione trattenuta nella GPU.

Le quote dei portali sono interi16 con segno in Q4. In inverno gli ingressi8/9/10/16 sono coperti dalla neve e non si attivano; il percorso principale passa per199/14,201/7,202. Komor e Rutilo seguono questi passaggi fisici. Il record di un personaggio arrivato elimina il vecchio corridoio di ingresso: conservarlo faceva tornare Komor verso Rutilo, bloccando entrambi alla partenza successiva.

Correzione del riferimento privato `mountain-seasons/README.md`: la sua descrizione dei flag821/840 è invertita. Gli script398/402/404 impostano prima il flag e lo azzerano nel ramo stagione3. Gli attori interessati sono quindi visibili in inverno e nascosti nelle altre stagioni. Le prove eseguono gli script effettivi, senza imporre l'interpretazione errata della nota.

Il primo collaudo browser della candidata b57a0269d4c77e75 ha trovato un difetto distinto: il piano delle risorse era memorizzato per identità della scena e ignorava la sostituzione del suo elenco di istanze. La nuova regressione fallisce prima della correzione; `VillageRenderer.resourcePlan` ora invalida il piano quando cambia tale elenco e attende i nuovi modelli prima di disegnarli. I12 test delle risorse passano sui sorgenti corretti. Il rapporto fallito rimane in `outputs/chapter050/browser-seasons`, fuori dalle build.

Le prove sui sorgenti precedenti alla correzione del renderer hanno superato651 test Node e il replay nativo fino a Mistralopoli con esiti delle lotte forniti dalla fixture. Il nuovo browser offre prove separate di quattro varianti, ingresso tramite D-pad,21 fondali e860 nuove coppie sui due lati. Predisporre questi controlli non significa averli superati: gli esiti della candidata aggiornata vanno registrati nel rapporto QA prima della pubblicazione.
# Verifica successiva

Il browser2926947e6f769318 supera la sequenza quattro stagioni→storia in orizzontale fino a Mistralopoli. Il difetto precedente era reale: dopo la promozione stagionale in città, Rutilo trovava ancora i portali invernali fuori mappa. `changeZone` prepara ora i metadati della zona199 ogni volta che il capitolo è caricato, anche quando il giocatore entra altrove; le immagini restano differite. I fondali ora comprendono24 contesti, inclusi quattro cortili stagionali con identità di cache distinta. Dettagli, limiti e prove audio separate in [QA-050.md](QA-050.md).

