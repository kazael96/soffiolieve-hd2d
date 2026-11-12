# Percorso10 e Via Vittoria: fondali e incontri052

Questo blocco prosegue dopo il commit391495e. La candidata privata15 `32110f716e752a5f` è base051 con preview esplicita `leagueFields`;052 rimane non attivata nell’index e non pubblicata. Nessun controllo del PC: file,CLI e browser headless isolato.

## Inventario e origine

`tools/export-league-battle-profiles.cjs` ricava20contesti dal terreno e dai materiali IRBI già estratti: Percorso10 sentiero/erba/erba scura, esterno214, quattordicigrotte215–228 e due laghi215/220. Questo supera l’inventario preliminare18 che non contava le lotte su Surf. Il Centro146 e l’ingresso136 non diventano luoghi di combattimento. La palestra121 conserva il profilo verificato precedente.

`src/league-battle-data.js` conserva le ancore, la quota visuale del triangolo, la quota fisica separata, i nomi originali dei materiali e SHA dei cataloghi di origine. La ricerca geometrica avviene soltanto nell’esportatore, non all’avvio del gioco. Selezione su celle native percorribili e triangoli realmente presenti; niente pavimenti bianchi o nome di texture inventato. Nel Percorso10 la strada usa michi01a; erba e erba scura usano le rispettive celle originali e il contatto della piattaforma (il piano dell’erba scura è6). Quattroscelte stagionali per ognuno dei quattro contesti esterni,16varianti di materiali originali.

La composizione è una radura di battaglia HD-2D statica, con geometria del luogo distante, non la camera DS esatta o il puzzle del campo in movimento. L’esterno214 ha quota fisica5.625 e mesh visuale5: la composizione usa il datum visuale, conservando separata la fisica del campo. Analogamente i laghi conservano−0.5001068115234375fisico e−0.5visuale. Non correggere un’immagine facendo cambiare le collisioni del mondo. I combattenti e le ombre mantengono il comune piano proiettato di BattleGround.

## Presenze ambientali e stagioni

Fino a trespecie diverse, scelte dalle vere tabelle del luogo/stagione/tipo; preferenza per specie adatte al terreno. Nel Percorso10: Herdier/Bouffalant/Foongus o Amoonguss quando la tabella è scura. Esterno: Heatmor/Mienfoo/Fraxure. Grotte: Durant/Boldore e Deino o Mienfoo secondo disponibilità. Nei due laghi la tabella ordinaria contiene soltanto Basculin: una specie, senza inventarne altre per arrivare a tre. Sono presenze lontane dal combattimento; dimensioni differenziate e audit di ritaglio/occlusione eseguito nel renderer della15, nei tre formati.

Materiali stagionali applicati soltanto ai profili posseduti da LeagueBattles. Il resolver precedente resta attivo per le scene051; la revisione di cache segue la stagione effettivamente caricata, non cambia la scena nel mezzo di una lotta. Geometria e texture usano i veri identificatori lg-season0..3; non basta anteporre un colore alla stessa immagine. Il Diorama conserva il budget esistente3record/24MiB; le prove devono misurarlo. I test numerici limitano a32MiB il payload stimato dei numeri dei vertici derivati nella traversata dei20contesti: non è una misura dell’heap totale.

## Collegamento degli incontri

`IcirrusEncounters` non consultava ancora LEAGUE_DATA: provider corretto per le sole mappe possedute dal capitolo, con conservazione delle vecchie città a rate0 e nessuno sblocco delle mappe future. Passa le tabelle native per terra/erba scura/Surf di tutte le quattrostagioni.

Il controller reale Journey leggeva soltanto le griglie WB. L’esterno214 usa NG e non ha una WB fittizia: ora il controllo degli incontri campiona gli attributi del binario fisico con la quota/linea corrente. Le altre mappe continuano a usare WB. Restano intatti rate originali, maschere4/2, rifiuto del comportamento255, distanza reale, Repellente e regola del secondo avversario nell’erba scura. Le caselle di scivolata senza maschera incontri non fanno tiri casuali.

SurfBattles.capture consulta prima i contesti acquatici espliciti del nuovo capitolo; i vecchi luoghi mantengono il percorso precedente. Il movimento Surf esistente non viene riscritto e nessuna Canna postgame viene consegnata. Queste modifiche non sbloccano Komor67 o i trainer di riferimento dopo il finale; le loro condizioni narrative restano da verificare prima della consegna052.

## Prove e limiti correnti

FAIL prima del collegamento conservati: league-encounters-before-fix.log (provider assente), league-ng-encounter-before-fix.log (nessuna lotta sul vero NG), league-contexts-before-implementation.log e league-profiles-before-implementation.log (luoghi/fondali/lago mancanti).

`league-background-shared-current.log`:23Node PASS, inclusi20preparazioni con materiali/scenografia,16materiali stagionali, presenze da slot reali, contesto Surf immutabile, controller reale Journey su erba/erba scura/NG/due laghi, vecchie superfici e Surf/ristoro/salvataggi. Renderer/audio isolati nel banco Node: non sono prove grafiche o nuove vittorie.

Inventario del banco browser13–15: qaLeagueBattlePlaces052 (20anteprime, erba scura doubles, specie lontane/piedi/cache), qaLeagueBattleSeasons052 (16viste), qaGymBattle052 (2regressioni palestra), tre viewport1280×720/390×844/844×390. La fixture delle anteprime fornisce un vincitore soltanto per chiudere ogni caso; non prova vittorie reali o la traversata della storia. Audio disabilitato da ready, uscita del browser comunque muta. Leggere report e rivedere tutti i PNG prima di attribuire un PASS; nessuna GPU Android fisica/ascolto DS.

Restano servizio/continuità/giocatore69celle160/161 e bordi grafici del campo, poi attivazione e consegna052; il collaudo finale di questo blocco è documentato sotto. Superquattro/N/Ghecis e MN personalizzate sul campo seguono: non contare questo componente come fine della storia.


## Revisione manuale13: due correzioni prima dell'accettazione

Il banco13 ha concluso PASS9casi/3formati/114PNG sulla revisione15b28cc0461e5689. La revisione dei sei segmenti dei tre fogli di contatto e della grotta219 verticale ha però respinto la composizione: michi01a include il bordo verde, ripetuto a strisce attraverso l'arena; d0ana_002b è una vera texture originale bianca di uscita, non un asset mancante, ma risulta troppo luminosa nel fondale statico. Materiali verificati nel foglio native-bg-material-review.png. Il PASS automatico non supera questi difetti visivi.

La correzione usa soltanto il campione sabbioso UV0.5/10.5–30.5/14.5 di michi01a, con specchio alternato già supportato dal compositore. Le quattro stagioni mantengono i propri pixel originali. Per le sole grotte052 il profilo esclude l'overlay luminoso d0ana_002b dalla scenografia della lotta, conservando la cornice rocciosa d0ana_001b e la parete nativa dietro; il campo esplorabile e le sue uscite restano invariati. È un adattamento HD-2D della radura di lotta, non una modifica delle texture o collisioni originali. Il filtro del compositore condiviso è opzionale: i vecchi profili non lo impostano.

Baseline league-background-visual-before-fix.log FAIL conservata e26regressioni mirate PASS in league-background-visual-current.log, comprese stagioni e fondali precedenti.13archiviata/rimossa dopo controlli H.8;051 e12verificata preservate, rapporti/114PNG conservati. Candidata14 20d4e44fa12187c2 congelata con15SHA in background-fourteenth-source-hashes.json; nuove proveGPU e suite completa ancora da concludere.


La14 termina anch'essa PASS automatico9casi/114PNG, ma la vista diretta verticale222 mostra un taglio rialzato e le superfici nere originali di chiusura della mappa. L'accettazione resta sospesa: league-cave-support-before-fix.log FAIL conservato, poi27regressioni mirate PASS in league-background-support-current.log. I soli profili delle grotte052 chiedono la rimozione delle facce a vertici completamente neri e il raccordo delle superfici orizzontali rialzate d0yuka_001/002 fino al datum della radura, usando d0gake originale come rivestimento. La funzione di sostegno è quella già usata dall'erba: evita diagonali interne e chiude i soli bordi. È scenografia della lotta, non un cambiamento dei permessi o della geometria del campo.14archiviata/rimossa con114PNG esterni;15 32110f716e752a5f in collaudo,15SHA congelati.


## Accettazione del componente15

Candidata15 `32110f716e752a5f`: browser-league-background-fifteenth/report.json PASS9casi nei tre formati,114PNG. Rivisti tutti i114fotogrammi nei nove fogli review-1280x720-0..2, review-390x844-0..2 e review-844x390-0..2, più la grotta222 verticale a dimensione originale. Sentiero senza bordo verde ripetuto, overlay bianco assente, tagli rialzati della grotta raccordati a terra e facce nere escluse; combattenti appoggiati e presenze ambientali lontane non ritagliate. I controlli automatici rilevano posizione dei piedi, specie catturabili, visibilità delle presenze e budget Diorama3record/24MiB. Sono anteprime preparate: non provano avvio spontaneo delle nuove lotte selvatiche nel renderer, traversata del capitolo o vittorie. Audio delle anteprime disabilitato; browser Chrome155/ANGLE SwiftShader isolato e invisibile, nessuna GPU Android fisica o confronto all'ascolto.

Suite completa della stessa15: deep-league-background-fifteenth/report.json PASS46fasi,1084Node (181/160/193/163/202/185 nei sei gruppi) e36Python,693.690s. Comprende regressioni dei capitoli precedenti, Surf, menu, salvataggi, avversari, telefono e stress. Tutti i15SHA di background-fifteenth-source-hashes.json sono invariati dopo il collaudo. Il test del vero Journey verifica in Node gli incontri355 erba/erba scura,214NG e215/220Surf, con renderer/audio isolati; il perimetro differisce dalle anteprimeGPU.

051pubblica preservata per regressioni;12 sostituita dal componente15 verificato secondoH.8, con manifest e tutti i suoi rapporti esterni conservati. Le precedenti13/14 restano respinte alla revisione manuale, non certificate dalla sola suite automatica. Questo commit non attiva052 nell'index e non pubblica nuova storia. Seguito: scivolate del giocatore, continuità Nardo/Komor/Belle, filtro attori postgame, servizi136/146 e bordi del campo, accettazione completa052; poi Superquattro/N/Ghecis e MN sul campo.
