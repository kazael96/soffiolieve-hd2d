# Riproduzione fedele: stato e prosecuzione

Aggiornamento: 25 ottobre 2026, 22:35 Europe/Rome. **Non pubblicata**.
La demo pubblica rimane alla v0.10, commit `769d32d`. Il lavoro è sulla branch
`faithful-opening`, PR bozza #1. Non confondere un commit di avanzamento con
il completamento della fedeltà o con una pubblicazione.

L'utente ha chiesto di continuare fino alle **06:00 del 26 ottobre 2026**;
a quell'ora completare l'intervento in corso e preparare un prompt per l'agente
precedente. Il limite della demo è l'ingresso a **Quattroventi**, senza gli
eventi della città. Il nome inglese è Accumula; Soffiolieve non è Albanova.

## Implementato e controllato

- L'adattatore `original-story.js` esegue realmente la VM collegata in index:
  1.798 istruzioni da nove zone e dagli script globali degli strumenti.
  Testi italiani, variabili, flag, diramazioni, movimenti e inizializzazione
  delle mappe provengono dalla ROM IRBI fornita dall'utente.
- Corretto il salto condizionale dello stack: condizione 255 salta sul falso.
  Corrette anche diverse firme BW che i metadati BW2 interpretavano male.
- Scelta dei tre starter, entrambe le lotte, Mamma, casa di Belle, laboratorio,
  Mappa Città, entrata sul percorso, tutorial, Pozione, confronto e chiamata.
- Interni anche delle camere di Belle e Komor; camera in disordine dopo Belle;
  sprite originali corretti e trasparenza. I gesti speciali di Belle e Komor
  sono letti dall'overlay 21, con fotogrammi e tempi originali. Nessun uso dei
  fotogrammi vuoti di Belle. Alcide usa i fotogrammi di corsa con Shift.
- Musiche/effetti mancanti convertiti da SDAT in FLAC con loop; prima chiamata
  Interpoké con ritratti, script e testi originali (a/1/3/1:63, testi192).
- Fondali e piattaforme delle lotte estratti da a/0/1/1 e tabelle a/1/5/2.
  Camera: BG9, terreno4, campo9, piattaforma3. Erba: BG0, terreno5,
  campo0, piattaforma23. La mappa tile->terreno è verificata nei byte
  dell'overlay21, offset0x50f88. Rendering WebGL, composizione HD-2D.
- Salvataggi v2 separati dai precedenti: si salva solo una scena completata;
  ricaricare durante una scena riprende il checkpoint precedente.

## Verifica eseguita

21 test Node passati, inclusi i 72 casi di movimento originari. Il controllo
runtime esegue nove percorsi completi: tre starter per vittoria, sconfitta e
lotte reali simulate. Controlla variabili, flag, strumenti, non duplicazione
Pozione e checkpoint finale. Sono verificati anche tutti i 14 collegamenti
porta/scala con direzione, collisioni del punto di arrivo e pausa contro
rientri involontari. La scala camera/piano terra è stata percorsa manualmente
nel browser. Gli altri collegamenti richiedono ancora prova manuale.

Nel browser sono stati provati introduzione, scelta di Snivy, lotta con Belle,
ritorno alla camera in disordine, dialoghi e cura di Komor. La seconda lotta è stata completata; verificati ricaricamento del checkpoint,
scala camera/piano terra, uscita degli amici e dialoghi di Mamma. Il controllo separato dei fondali mostra i modelli e le
piattaforme originali, senza errori WebGL. Non è un confronto completo con
una registrazione del gioco DS.

## Limiti da risolvere prima di dichiarare fedeltà completa

1. Terminare la prova nel browser fino a Quattroventi, soprattutto porte,
   rientri, flag degli NPC, salvataggio/ricarica e controlli su schermo.
2. Alcuni comandi della VM sono solo registrati: animazioni porte, effetti
   di consegna/cura, comandi UnknownBW024E/024F/0250/0252/025F e alcuni
   comandi speciali. Verificarne i veri effetti; non presentarli come completi.
3. Scelta starter ancora con pulsanti generici; mancano la schermata originale
   e le sue animazioni. Camera, paging dei dialoghi e tempi Interpoké non sono
   ancora identici. Il fondale lotta usa il modello statico, senza BCA animata.
4. IV, natura, sesso e abilità sono ora generati per starter/selvatici e
   conservati con EV, soprannomi e mosse. Cure e salvataggi li preservano.
   L'apprendimento permette di scegliere la mossa da dimenticare. Restano
   evoluzioni, deposito oltre sei Pokémon, premi in denaro e presentazione
   dell'esperienza nella schermata lotta (oggi avviene dopo averla chiusa).
5. Il tutorial ora segue la sequenza nativa verificata (vedere sotto), ma
   mancano ancora cursore automatico, interfaccia Borsa e animazione della Ball.
6. Incontri casuali ancora all'8% approssimativo. `field_encount.c` della fonte
   primaria descrive il contatore crescente; verificare contro IRBI.
7. Mancano movimenti autonomi degli NPC, alcune interazioni opzionali e la
   presentazione originale delle lotte. Il laboratorio libero non deve
   interferire con il percorso narrativo.
8. Aggiornare README/versione/testi diagnostici, completare controlli e solo
   allora decidere se la versione è pronta per main e Pages. Verificare anche
   il game.js effettivamente servito. Non promettere fedeltà non dimostrata.

## Ambiente di lavoro locale

Root della chat sotto Documents/Codex/2026-10-25/github-app-connector-76869538009648d5b282a4bb21c3d157.
Repo: work/repo. ROM: cartella Downloads/Pokemon - Versione Nera (Italy) (NDSi Enhanced).
Python: work/rom-tools-env/Scripts/python.exe (ndspy, numpy, Pillow, DualRip).
Apicula: work/tools/apicula/apicula.exe. ffmpeg: C:/ProgramData/chocolatey/bin/ffmpeg.exe.
Archivio verificato: work/site-v08.zip. Anteprima: work/fidelity/preview, porta4177.
`work/fidelity/sync-preview.py` copia i sorgenti e aggiorna gli hash URL; copiare
separatamente nuove cartelle asset. Il browser può conservare JS/PNG vecchi:
verificare gli hash, non affidarsi a una sola ricarica. La pagina qa-fields.html
è solo nell'anteprima e non va inclusa nei sorgenti pubblicati.

Build: `python scripts/build-site.py <zip> <nuova-cartella>` (non sovrascrive).
Verifiche: `node --test tests/*.test.cjs`, `python -m unittest discover -s tests`,
`node tests/check-built-site.cjs <site>`, `node tests/check-story-runtime.cjs <site>`.
Rigenerazione: tools/extract-opening.py, extract-original-events.py,
extract-phone.py, extract-battle-backdrops.py, convert-field-audio.py (vedere --help).
La ROM intera non viene inclusa o caricata.

## Fonti tecniche

[PokeScriptSDK5 BW 233d070](https://github.com/PlatinumMaster/PokeScriptSDK5/blob/233d0702df1f9a35c49fb1d13f0b679f83258dd1/yml/BW/Base.yml)
e [pokebw2 966de38](https://github.com/fuddlesworth/pokebw2/tree/966de38c585822fba37d74a8a174f0e911b8ea58).
Copie selettive in work/fidelity (fldmmdl_drawdata.c, field_encount.c,
map_attr.c, btlv_field.c, btlv_stage.c, btlv_effect.c, zone_data.py).
Non assumere che nomi o strutture BW2 siano validi per BW: confrontare i byte.

## Checkpoint 25 ottobre, 23:20

Statistiche confrontate con il motore GEN5 per cinque specie e tre nature,
con IV/EV distinti; test del livello13 di Snivy, Crescita al posto della
mossa scelta, conservazione delle altre mosse, cura e ricarica del salvataggio.
I vecchi salvataggi v2 senza IV/natura mantengono i valori precedenti.

Le sei squadre iniziali sono estratte da IRBI a/0/9/2 e a/0/9/3
(trainer53-55,59-61), non derivate solo dal tipo dello starter: IV0, abilità,
livello, natura deterministica, sesso, felicità255. Algoritmo PID da
TrainerUtil_LoadParty e NitroSDK MATH_Rand32 (fonte primaria sopra).
AIflag4 è verificata direttamente nel programma IRBI a/1/7/1 membro4,
SHA256 1445323f99bfae12e70184f3b76b4d902e0532c0f479a78c95e6475fa4183cbd:
bonus alle mosse dannose al primo turno, probabilità di favorire mosse di
stato quando il giocatore ha <=50% e <=25% PS. Ora applicata alle lotte
iniziali; il laboratorio conserva la sua logica libera.
Rigenerazione: tools/extract-opening-trainers.py --rom <IRBI> --output src/opening-trainers.js.

Corretto anche il menu squadra: PS massimi calcolati con i dati individuali
e soprannome visualizzato. Pubblicazione resta quella su main769d32d;
questo ramo non è ancora la demo pubblica né una ricostruzione completa.

## Checkpoint 25 ottobre, 23:50: tutorial verificato nei programmi IRBI

Trovata EVCMD_TABLE in overlay10 (base0x02155060), offset0x1b4bc.
Il comando0x17d punta a overlay21 0x021b4fdc e **non legge argomenti**:
chiama EventCaptureDemo_Create a0x0216e84c. La firma BW della fonte SDK
indicava erroneamente un u16 e consumava il successivo EVCameraInit0x13f.
Corretto il nome in CallCaptureDemo, firma senza argomenti; rigenerazione
ora contiene1799 istruzioni. CallWildBattleEnd0x179 esegue solo il rientro
nel campo. Aggiunti hash dei tre tratti nativi verificati all'estrattore.

Il setup nativo usa Minccino7 (Botta1, Ruggito45), Patrat2 (Azione33,
Fulmisguardo43), parametri temporanei generati. BtlvCore_CmdCaptureDemo in
overlay93, base0x021b6000, funzione0x021e90e8, è una sequenza dimostrativa:
Botta, barra Patrat impostata a floor(maxHP/6), Fulmisguardo, Difesa di
Minccino -1, consiglio, Poké Ball e cattura garantita. Quindi simulare un
normale turno casuale sarebbe meno fedele: non si tratta di danno calcolato.
Messaggi estratti dai bank13/14/15/20; la pausa dopo il consiglio è60frame.
Il controller è condiviso dal browser e dal test che verifica ordine,
mosse, PS, Difesa, consiglio e conclusione. L'animazione della Ball è
ancora assente (pausa), da implementare con risorse originali.

Corretti anche WordSetItemNameEx (rispetta withArticle; niente quantità
aggiunta arbitrariamente) e nomi tasche dal bank55. Nomi oggetti dal bank54.

Prova manuale aggiornata: casa propria -> paese -> casa Belle, discussione
con il padre, uscita, cammino fino a Komor, attivazione ingresso laboratorio.
Nessun blocco riscontrato in questi passaggi. Proseguire con Aralia e Percorso1.


## Checkpoint 26 ottobre, 00:30: animazione cattura originale

Aggiunti `tools/extract-capture.py`, `capture-data.js`, `native-capture.js`
e 17 celle originali della Poké Ball. Archivio IRBI a/0/9/5: celle129,
animazioni130, grafica137, palette138; gli indici BW2 sono diversi.
Conferma diretta overlay94 base0x021f6460, tabella comandi offset0x13928,
handler BallAdd69 a0x021fc048. Effetto0x23a da a/0/6/7 membro9,
118 istruzioni (incluse diramazioni fallimento), hash721b4c13e2881f6c612c6a8ac3acfad6a9b7ca1d04d7e589c5e9440b4f62c35d.
L'opcode10 ha dieci parametri, espanso sui quattro emettitori della risorsa32.
Le particelle specifiche della Poké Ball sono6,32,58,60,61 già nel pacchetto.

Il tutorial ora riproduce lancio, assorbimento, chiusura, rimbalzi, tre scosse,
chiusura finale e stelle. La sprite catturata resta nascosta fino al rientro.
Compilazione dei salti e del flag yield originale; attese distinte tra camera,
particelle e trasformazioni, con cancellazione del precedente movimento camera.
La proiezione della scena rimane l'adattamento HD-2D, non il renderer NDS.

Aggiunti cinque suoni originali1383,1384,1387,1396,1970, render DualRip lossless.
`preloadEvents` e riproduzione degli eventi senza banca precalcolata rispettano
volume/pitch/pan e successione sullo stesso canale; nessuna sostituzione sintetica.
Verifica browser su pagina temporanea `work/fidelity/preview/qa-capture.html`:
cattura riuscita e fallita completate, nove eventi audio caricati, nessun errore.
Fotogrammi ispezionati manualmente; corretta ombra inizialmente fuori posizione.
Questa pagina di verifica non fa parte della pubblicazione.

25 test Node, tre Python e tutte le nove partite simulate della storia passano.
La prova manuale della storia è nel dialogo di Aralia nel laboratorio.
Le catture normali usano ancora la vecchia formula e pausa: verificare la formula
IRBI prima di collegare il nuovo effetto (la fonte BW2 usa una radice quarta,
mentre la vecchia implementazione usa esponente3/16). Verificare anche il risultato
nativo shakes: valore2 percorre comunque la terza scossa visibile.
Non dichiarare conclusa la fedeltà: mancano ancora scelte/UI, camera e vari effetti,
frequenza incontri, animazioni di ambiente e prove visive dell'intero finale.


## Checkpoint 26 ottobre, 00:40: calcolo catture IRBI

Verificato CheckBallCapture direttamente in overlay93,0x021cba34–0x021cbbf4,
hash8ae492569c1d0d13c563c6a70c10141ab4a25f6335cca3474a9caa4b2e72fd86.
Due chiamate a FX_Sqrt0x0207c734, divisore FX_Div0x0207c6e8, tre confronti
RNG65536: soglia alla radice quarta, non l'esponente3/16 precedentemente usato.
Riprodotti anche gli arrotondamenti Nitro a12bit con BigInt, senza troncare
prima il tasso di cattura. 63 vettori di riferimento ottenuti separatamente
con Python integer sqrt/division, più test del numero di estrazioni casuali.
Un Patrat sano a PS pieni ha soglia49802 su65536, tre controlli.
La cattura critica è impossibile con <=30 specie catturate, quindi nell'apertura.

Le catture normali ora usano l'effetto originale, testi bank15:61–65,
conservano il Pokémon nascosto dopo il successo e mostrano la fuga prima del
turno avversario in caso di fallimento. I dati individuali rimangono conservati.
Non viene aggiunta esperienza per la cattura (comportamento quinta generazione).
28 test Node passano; build completa `work/fidelity/build-0036`, revision
4baf327a50453284, supera dipendenze, hash e percorso raggiungibile.

ATTENZIONE per il prossimo intervento sugli incontri: i riferimenti BW2 NON
corrispondono all'IRBI. Nel codice italiano non c'è la tabella crescente a12
configurazioni. a/1/2/6:77 contiene direttamente tasso8. Verificato nel codice
0x021aa2e0–0x021aa32a: primo passo dopo reset tasso1, poi tasso della zona;
random=floor(GFL_RandomLC(65535)/656), confronto <=tasso. Contatore aggiornato
0x021aa628, reset0x021aa5f8. Disassemblato in work/fidelity/irbi-encounters.txt.
Non applicare il sistema BW2 descritto nei precedenti appunti.


## Checkpoint 26 ottobre, 01:00: incontri e precedenza delle scene

Implementato il tasso IRBI verificato sopra: rate8 diretto, primo passo dopo
una lotta rate1, estrazione0..65534 divisa per656 e confronto inclusivo.
`tools/extract-opening-encounters.py` verifica tre tratti del programma originale
e ricava zona317/rate8 dai dati. `RouteEncounter` conta la distanza effettiva
passata dal frame di movimento: collisioni/pausa non fanno avanzare il contatore,
camminata/corsa/diagonali non alterano la probabilità per distanza percorsa.
Il contatore prosegue fuori dall'erba e si azzera dopo la lotta; nessun blocco
artificiale di cinque secondi. Nella proiezione a movimento continuo, un passo
corrisponde a una unità realmente percorsa, non a una pressione del tasto.

Risolti due errori di integrazione: gli interni non riutilizzano le coordinate
dell'erba esterna; arrivo/trigger narrativi sono controllati prima dell'incontro
casuale. Il sistema rimane limitato al Percorso1 e alle specie originali presenti.
Test aggiunti su limiti RNG, distanze frazionarie, collisioni, esclusione interni
e precedenza dell'arrivo. Tutte le nove partite simulate passano insieme ai31
test Node. Ancora da eseguire la passeggiata manuale finale con questi aggiornamenti.

Dialoghi manuali laboratorio: soprannome rifiutato; risposta NO alla missione
Pokédex verificata fino alla ripetizione originale della domanda, poi SÌ.
La partita aperta nel browser è ancora nel dialogo di consegna del Pokédex;
ricaricare al prossimo checkpoint prima del tutorial per usare il codice nuovo.

## Checkpoint 26 ottobre, 01:50: scelta originale del primo Pokémon

Sostituite le tre schede generiche con l'applicazione PSEL: regalo e biglietto,
scatola che si apre, tre Poké Ball, sprite che avanzano con due salti, descrizione
del tipo, zoom alla conferma, ritorno con NO, inquadratura finale. Dati IRBI,
non quelli di Nero2: overlay2230x021b94a0, archivio a/2/0/5(40file).
Prima scena29/30/31/32, camera33; selezione34/35, camera36; ball37/38/39.
Le tabelle originali sono verificate nell'estrattore. Camera FOV~40gradi ricavata
dai valori1398/3850(ARM9). Le curve contengono angoli Euler e posizioni float.

`tools/extract-starter.py` ricava GLB con animazioni articolari e texture,
curve, posizioni delle ball, spostamenti/salti sprite, sfondi/palette/cursore.
Il nuovo renderer preserva skinning, interpolazione quaternion e texture animate.
Decodificate separatamente le tracce alpha BMA31/38: dissolvenza biglietto/luce,
luce della ball. Opaque/translucent separati: la luce non scrive più profondità
coprendo erroneamente le ball. Nuovi asset circa440KB, nessuna ROM distribuita.
Suoni originali1352,1356,1956,1957 aggiunti ai24suoni di campo;1976 era già presente.
Cursore originale con spostamento NANR (16frame) e posizioni IRBI(67,39),(128,13),(189,39).

Prove visive: pagina QA dedicata Snivy→NO→Oshawott→SÌ; poi vera partita separata
in `qa-opening.html` (salvataggioQA, non quello principale), interazione regalo,
Tepig scelto con freccia/Invio→Esc→frecciaOshawott→Invio→SÌ. Tornato al messaggio
originale «Alcide riceve Oshawott!», nessun errore browser. Risolto il problema
che faceva perdere alla tastiera il controllo della finestra dopo NO.
34 test Node,3Python e nove percorsi storia passano. Build completa
`work/fidelity/build-0148`, revisione e525dfe0f26d81d3 (include ultimo cursore).
Il browser della partitaQA ha la revisione precedente al cursore; provarlo ancora.
La scansione temporale PSEL usa30aggiornamenti/sec e mezzo frame animazione per
aggiornamento: verificare la frequenza dell'applicazione nativa prima di chiamare
i tempi perfettamente identici. Test mobile/audio della scelta ancora da eseguire.

La partita principale nel tab8 è fuori dal laboratorio, prima di Mamma/Mappa Città.
Riprendere quella per il percorso manuale/tutorial/cattura/fine demo. Non confondere
il salvataggio principale con qa-opening(tab11). La pubblicazione è ancora0.10.

## Checkpoint 26 ottobre, 02:05: tutorial provato nel browser

Partita principale: verificati saluto di Mamma, Mappa Città, partenza simultanea,
arrivo da Aralia e dimostrazione con Minccino/Patrat. Nessun errore browser/audio.
La prova ha rilevato il vecchio pulsante «Torna al villaggio» dopo il tutorial e
la scomparsa anticipata della ball. Corretto: il tutorial mantiene la ball fino
al ritorno automatico, dopo la lettura del risultato; le altre lotte della storia
mostrano «Continua». PaginaQA `qa-tutorial.html` conferma ritorno automatico e
assenza di errori. Il salvataggio principale è ancora nei dialoghi successivi
alla dimostrazione; sono state assegnate le cinque Poké Ball.

Rimosso anche l'esecutore Promise async in CallCaptureDemo e la mancata attesa
dell'avvio in CallTrainerBattle: gli errori asincroni ora raggiungono il gestore
dell'evento, liberando la callback pendente. Test di regressione su errore in
avvio e animazione; nove percorsi originali ancora passano. Non ancora pubblicato.

## Checkpoint 26 ottobre, 02:45: battute dei rivali e percorso manuale

Estratti messaggi allenatori IRBI banca189, mappatura a/0/9/0 e offset a/0/9/1.
I sei primi rivali hanno messaggi17,20,1. La routine overlay93 021ce7f0
controlla nell'ordine18,17,19,20 e consuma tutte le condizioni soddisfatte,
mostrando l'ultima. Il messaggio20 richiede più di un Pokémon iniziale: non va
forzato in queste lotte. Primo danno sopravvissuto:17, una sola volta; vittoria
del giocatore: messaggio1 dopo XP. Nuovo opening-battle-rules.js con test.
Browser qa-trainer.html: Belle dice «Aaah! Cosa?! Non la passerai liscia!» al
secondo turno dopo il primo Azione, correttamente. 36testNode e novepartitepassano.

Partita principale tab8: catturato PatratLv3 indebolito, squadra2/PokéBall4;
parlato a entrambi i personaggi del Percorso1 e ottenuta una Pozione.
Posizione9.60255,-48.6524; seconda lotta PatratLv4, fuga riuscita, ancora
pulsanteContinua. Rilevato messaggio/musica vittoria errati dopo fuga: correggere.
Per procedere usare sentiero x4.5 evitando cartello/vegetazione a x6..9.
Ricerca ricompense: formula IRBI verificata in overlay93 021d7ebc (ultimoLv
*moneyMultiplier*4 =500perprimi6rivali). Perdita senza medaglie: routine021d7ef8
e tabella021f032d, ancora da leggere. Denaro iniziale ancora da verificare.
