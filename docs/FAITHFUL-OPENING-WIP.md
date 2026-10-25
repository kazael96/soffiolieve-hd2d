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
