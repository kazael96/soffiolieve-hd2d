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
Pozione e checkpoint finale. Il test attraversa alcune porte chiamando il
cambio mappa: **non prova il cammino libero reale**.

Nel browser sono stati provati introduzione, scelta di Snivy, lotta con Belle,
ritorno alla camera in disordine, dialoghi e cura di Komor. La seconda lotta
è ancora in corso. Il controllo separato dei fondali mostra i modelli e le
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
4. Le caratteristiche dei Pokémon sono ancora fisse (IV15, natura neutra,
   maschio), non conservate nel salvataggio; mancano EV, scelta delle mosse,
   evoluzioni, deposito oltre sei Pokémon. Non limitare arbitrariamente il
   giocatore per aggirare queste differenze.
5. Il tutorial cattura indebolisce artificialmente Patrat a1PS. Sostituirlo con
   la sequenza originale, verificando danno, specie/livelli e lancio.
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
