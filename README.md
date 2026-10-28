# Soffiolieve HD-2D — demo 0.34

Una demo amatoriale dell’inizio di **Pokémon Nero** con resa HD-2D.
Il percorso previsto è **Soffiolieve → Percorso 1 → arrivo a Quattroventi**.
La demo si ferma prima degli eventi del Centro Pokémon e del Team Plasma.

[Gioca alla demo](https://kazael96.github.io/soffiolieve-hd2d/)

## Regole permanenti di sviluppo

Demo e versione completa seguono le [regole vincolanti](docs/DEVELOPMENT-RULES.md): uscite dei personaggi senza sparizioni visibili, sfondi di lotta coerenti con il luogo e animazioni personalizzate per ogni coppia Pokémon–mossa. La prima copertura richiesta comprende19 coppie entro il livello 10. Le istruzioni operative sono in [AGENTS.md](AGENTS.md).

## Questa versione

La 0.34 riporta Aralia al laboratorio anche dai vecchi salvataggi, riduce le attese a basso framerate e verifica tutte le 19 animazioni personalizzate anche nei turni degli avversari. Dettagli in [docs/ROUTE-BATTLES-034.md](docs/ROUTE-BATTLES-034.md).

La 0.33 corregge il caricamento delle immagini, elimina i ripieghi bianchi in caso di errore, consente di riprovare e ripristina ripetutamente la grafica senza perdere lo stato. Controlli e limiti in [docs/STABILITY-033.md](docs/STABILITY-033.md).

La 0.32 aggiunge ↺ Ricomincia con conferma e controllo diretto ×1/×2/×4 (tasto F), senza aprire le Opzioni. Corregge la riscrittura del vecchio salvataggio durante il riavvio. Dettagli in [docs/DEMO-CONTROLS-032.md](docs/DEMO-CONTROLS-032.md).

La 0.31 corregge luce degli interni, giunzioni dei tasselli degli sprite, gestione delle interruzioni grafiche/audio su mobile e navigazione touch/tastiera dei menu. Prove, cause accertate e limiti in [docs/BUGFIXES-031.md](docs/BUGFIXES-031.md).

La 0.29 aggiunge le quattro coppie di Patrat: Azione, Fulmisguardo, Morso e Pazienza, con parti originali articolate, incisivi, concentrazione persistente e fasi di accumulo/attesa/rilascio guidate dagli eventi del motore. Studio: `?patrat=1`. Matrice15/19 e prove in [docs/SPECIES-MOVES-029.md](docs/SPECIES-MOVES-029.md).

La 0.28 aggiunge le tre coppie di Oshawott: Azione, Colpocoda e Pistolacqua, con movimenti delle parti originali, perni del collo e delle zampe, getto dal muso e spruzzi. Studio: `?oshawott=1`. Matrice11/19 e prove in [docs/SPECIES-MOVES-028.md](docs/SPECIES-MOVES-028.md).

La 0.27 rifinisce Braciere di Tepig: preparazione ed espulsione più leggibili, tre raffiche di braci con scie irregolari, origine fissata al muso al momento del lancio, scintille e piccolo sbuffo all’impatto. Dettagli in [docs/EMBER-027.md](docs/EMBER-027.md).

La 0.26 aggiunge le quattro coppie di Tepig: Azione, Colpocoda, Braciere e Segugio, con gesti delle parti originali, muso articolato, braci e ricerca olfattiva. Studio: `?tepig=1`; quello di Snivy resta disponibile. Matrice 8/19 e verifiche in [docs/SPECIES-MOVES-026.md](docs/SPECIES-MOVES-026.md).

La 0.25 introduce coreografie personalizzate di Snivy per Azione, Fulmisguardo, Frustata e Avvolgibotta: parti del corpo originali, preparazione, esecuzione, recupero e percorsi delle liane. Studio interattivo: `?snivy=1`. Copertura e limiti in [docs/SPECIES-MOVES-025.md](docs/SPECIES-MOVES-025.md).

La 0.24 mostra insieme Patrat e Lillipup nella fascia lontana del Percorso1 e corregge il taglio degli sprite ambientali: canvas più ampio, piedi vincolati al suolo e punti liberi della scena. Sono le due specie selvatiche disponibili nella demo. Audit dei cicli animati e limiti in [docs/BATTLE-AMBIENT-024.md](docs/BATTLE-AMBIENT-024.md).

La 0.23 arretra e riduce i Pokémon ambientali, mantenendoli lontani dai due combattenti. Verifica della separazione e limiti in [docs/BATTLE-AMBIENT-023.md](docs/BATTLE-AMBIENT-023.md).

La 0.22 migliora i Pokémon ambientali del Percorso1 con animazioni di attesa originali, riferimento dei piedi opaco, ombre sul suolo, scala più leggibile e occlusione della vegetazione. Rimane una presenza per variante: Patrat sul sentiero e Lillipup nell’erba. Dettagli in [docs/BATTLE-AMBIENT-022.md](docs/BATTLE-AMBIENT-022.md).

La 0.21 corregge i Pokémon sospesi: piedi e ombre usano la proiezione del terreno e la stessa camera del fondale, con scala legata alla distanza. Esclude i margini trasparenti dal riferimento dei piedi e aggiorna gli ancoraggi di mosse e cattura. Verifiche in [docs/BATTLE-GROUND-021.md](docs/BATTLE-GROUND-021.md).

La 0.20 ricostruisce i tre fondali delle lotte effettive con geometria, materiali e UV originali: camera di Alcide in disordine, Percorso1 sentiero ed erba. Aggiunge presenze ambientali di Patrat e Lillipup, con profondità e occlusione reali. Inquadratura e luce sono adattate al combattimento HD-2D. Verifiche e limiti in [docs/BATTLE-BACKGROUNDS-020.md](docs/BATTLE-BACKGROUNDS-020.md).

La 0.19 introduce un HUD di lotta ispirato a Pokémon Nero, adattivo per telefono e desktop, e fondali HD-2D legati al luogo fisico di avvio. Conserva le texture originali degli ambienti e i menu nativi di Borsa e Squadra. Inventario: [docs/BATTLE-ENVIRONMENTS-019.md](docs/BATTLE-ENVIRONMENTS-019.md).

La 0.18 applica la regola delle uscite senza sparizioni visibili: i personaggi attraversano porte e scale; all’aperto continuano a camminare e vengono rimossi dalla visuale solo dopo due riscontri di invisibilità nel rendering. Conserva gli attori visivi durante il passaggio fra Soffiolieve e Percorso1 e nei salvataggi. Verifiche e limiti: [docs/ACTOR-EXITS-018.md](docs/ACTOR-EXITS-018.md).

La 0.17 completa il contesto della squadra in lotta con Scambia, INFO, MOSTRA MOSSE e dettaglio delle mosse, usando dati vivi della lotta. Corregge frecce e ripetizione della quantità, riordino del menu Y, selezione dei tipi, scorrimento della ricerca e composizione RGB555 di messaggi e habitat. Integra font, lampeggio e ritaglio originali della lista Pokédex e luminosità selettiva delle pagine. Usa i messaggi originali per mosse, statistiche, KO e stati comuni.

Verifiche e limiti: [docs/FEDELTA-017.md](docs/FEDELTA-017.md).

La 0.16 corregge gli elenchi e le sagome della ricerca Pokédex, la selezione combinata di due tipi, il grafico dei versi da PCM originale, le maschere habitat e il loro lampeggio. Aggiunge il pannello quantità originale della Borsa con comandi ±1/±10, il menu Y sullo schermo superiore con riordino e i font, gli stati e la pressione originali della squadra in lotta.

Le verifiche e i limiti della conversione sono in [docs/FEDELTA-016.md](docs/FEDELTA-016.md).

La 0.15 ricostruisce le schermate principali con fondi, font e controlli estratti dalla ROM italiana: Squadra, Borsa, Riepilogo, Opzioni, Scheda Allenatore, tastiera dei soprannomi, Salva e Pokédex con ricerca. Le lotte usano pannelli delle mosse, colori PP, cursori, Borsa e selettore squadra originali. I tasti touch A/B e la croce funzionano anche nei menu.

Prove, risorse certificate e differenze residue: [INTERFACES-015](docs/INTERFACES-015.md).

- Camera di Alcide, scelta fra Snivy, Tepig e Oshawott al livello 5.
- Lotte iniziali con Belle e Komor nell’ordine originale, con i rispettivi starter. Si prosegue anche perdendo.
- Mamma e Interpoké, casa di Belle, laboratorio di Aralia, Pokédex e Mappa Città.
- Partenza sul Percorso 1, dimostrazione di cattura con Minccino e Patrat, cinque Poké Ball.
- Incontri nell’erba alta, catture, squadra fino a sei Pokémon, esperienza e apprendimento per livello.
- Pozione della viandante, confronto delle catture e chiamata di Aralia, conclusione all’ingresso di Quattroventi.
- Interni e terreno convertiti dalla ROM italiana fornita dall’utente; sprite e motore della demo conservati.

La 0.14 esegue i programmi degli eventi e i dialoghi italiani originali del tratto,
con movimenti sincronizzati, camera riordinata/disordinata, scelta originale dello
starter, Interpoké animato, Pokédex e Mappa Città consultabili. Incontri, catture,
statistiche individuali, premi delle lotte e movimenti ambientali sono stati
confrontati con i dati e le routine IRBI.

**La fedeltà non è ancora completa.** Restano transizioni, effetti, interfacce e
altre differenze elencate in [docs/ORIGINAL-OPENING.md](docs/ORIGINAL-OPENING.md).

La 0.14 aggiunge apertura/chiusura delle porte, fumo nella camera e ricezione
animata del Pokédex con modelli, tracce scheletriche, trasparenze, particelle e
suoni estratti dalla ROM. I tempi assoluti e la proiezione delle particelle
richiedono ancora un confronto video con la console.

La 0.14 elimina gli elementi HUD aggiunti dal porting: il campo resta libero. Squadra, audio e salvataggi sono accessibili dal menu X (anche J); su touch restano i soli tasti A/B/X e la croce direzionale.

## Comandi e salvataggi

WASD/frecce: muovi; Shift: corri; E: parla, apri il regalo, usa porte e scale;
X/J: menu, salvataggio e impostazioni; V: messa a fuoco; +/−: zoom.
Il pulsante della squadra sceglie chi mandare in testa. Nei combattimenti sono
disponibili mosse, cambi, pozioni e, contro i selvatici, Poké Ball e fuga.
Il Laboratorio lotte rimane una prova separata e non modifica la squadra della storia.

Il salvataggio è locale al browser, ogni cinque secondi e dopo gli eventi, fuori
dalle lotte. Ricaricare durante una lotta ripristina il punto precedente.
La storia usa una nuova chiave: il salvataggio della 0.9 resta disponibile nei
dati del browser ma non viene interpretato come progressione di Pokémon Nero.
Le preferenze di visualizzazione vengono recuperate. Ricomincia richiede conferma.

## Build e pubblicazione

`src/` contiene i sorgenti pubblicati e i nuovi asset di questo tratto.
Gli asset precedenti e il simulatore `battle-sim.js` provengono dalla
[release v0.8](https://github.com/kazael96/soffiolieve-hd2d/releases/tag/v0.8).
La build verifica lo SHA-256 originale:
`2451b9f6531a90bcec395037624de300fa16a2e49f88becbe2701969a77176d6`.
I vecchi `site-part-*.zip` non sono usati. La ROM non è inclusa né richiesta per giocare.

```sh
curl -L --fail https://github.com/kazael96/soffiolieve-hd2d/releases/download/v0.8/soffiolieve-demo-v08.zip -o site.zip
node --test tests/*.test.cjs
python -m unittest discover -s tests -p 'test_*.py'
python scripts/build-site.py site.zip _site
node tests/check-built-site.cjs _site
node tests/check-story-runtime.cjs _site
python -m http.server 4174 --bind 127.0.0.1 --directory _site
```

La destinazione della build deve essere nuova. Il workflow esegue i test,
controlla gli asset e il percorso e pubblica su GitHub Pages da `main`.
Gli URL JavaScript/CSS cambiano con il contenuto; `build.json` riporta versione,
revisione e hash. La patch storica `patches/fix-player-facing.py` resta conservata;
l’orientamento corretto è già incorporato nei sorgenti.

## Rigenerare i nuovi asset localmente

`tools/extract-opening.py` legge una ROM IRBI fornita localmente e usa
[apicula](https://github.com/scurest/apicula) per convertire i modelli.
Servono Python con `ndspy`, `numpy` e `Pillow`. Nessun eseguibile della ROM viene
copiato nel sito. Gli archivi intermedi restano in `_extract/`, esclusa da Git.

```sh
python tools/extract-opening.py --rom "percorso/Pokemon.nds" --apicula "percorso/apicula.exe" --output src --work-dir _extract
```

La 0.30 completa Lillipup (Azione, Fulmisguardo, Segugio e Morso), aggiunge reazioni anatomiche ai bersagli delle cinque specie e velocità x1/x2/x4 nelle Opzioni. Studio `?lillipup=1`, con bersaglio selezionabile. Matrice19/19 del perimetro livello10 e limiti in [docs/SPECIES-MOVES-030.md](docs/SPECIES-MOVES-030.md).
