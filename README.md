# Soffiolieve HD-2D — demo 0.15

Una demo amatoriale dell’inizio di **Pokémon Nero** con resa HD-2D.
Il percorso previsto è **Soffiolieve → Percorso 1 → arrivo a Quattroventi**.
La demo si ferma prima degli eventi del Centro Pokémon e del Team Plasma.

[Gioca alla demo](https://kazael96.github.io/soffiolieve-hd2d/)

## Questa versione

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
