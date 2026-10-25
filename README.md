# Soffiolieve HD-2D — demo 0.9

Demo browser amatoriale non ufficiale ambientata a **Soffiolieve**, in Unima.

[Gioca alla demo](https://kazael96.github.io/soffiolieve-hd2d/)

## Questa versione

- Orientamento corretto di Alcide in tutte e quattro le direzioni.
- Diario con un breve capitolo: parla con Belle e Komor, poi torna da Aralia.
- Dialoghi prima delle lotte: allenarsi con i rivali è facoltativo.
- Salvataggio locale di posizione, compagno, PS/PP, stato, pozioni, incontri e preferenze.
- Tastiera e tocchi indipendenti, corsa con Shift o pulsante dedicato e rilascio dei comandi quando si lascia la pagina.
- Interfaccia compatta, messa a fuoco sul personaggio e sagoma discreta quando un edificio lo nasconde.

## Comandi

WASD o frecce per muoversi, Shift per correre, E per interagire, J per il diario,
V per cambiare messa a fuoco, +/− per lo zoom. Il diario permette di mostrare
i controlli su schermo anche su desktop. Su mobile, tieni premuti una direzione
e **Corri** insieme. Il pulsante ⇄ cambia il compagno come nella demo precedente.

Il viaggio viene salvato ogni cinque secondi e dopo le interazioni, fuori dalle
lotte. Ricaricare durante una lotta ripristina l'ultimo punto precedente alla
lotta. Il laboratorio non sostituisce il compagno del paese nel salvataggio.
Non c'è sincronizzazione tra browser o dispositivi. **Ricomincia** nel diario
chiede conferma prima di sostituire i progressi; non cancella le preferenze audio.

## Sorgenti e risorse

`src/` contiene HTML, CSS e JavaScript modificabili del gioco. Questi file sono
la fonte della pubblicazione; non modificare `_site/`, che è una cartella generata.
Gli asset, i dati generati dalla ROM e il bundle del simulatore `battle-sim.js`
rimangono nel [pacchetto v0.8](https://github.com/kazael96/soffiolieve-hd2d/releases/tag/v0.8).
Il file ROM originale non è incluso.

`scripts/build-site.py` verifica il pacchetto con SHA-256
`2451b9f6531a90bcec395037624de300fa16a2e49f88becbe2701969a77176d6`,
estrae il sito e vi applica i sorgenti. Aggiunge un identificatore basato sul
contenuto agli URL JavaScript/CSS, così una nuova pubblicazione non riutilizza
vecchio codice dalla cache. `build.json` espone versione e hash dei sorgenti.

I vecchi `site-part-*.zip` sono incompleti e non partecipano alla pubblicazione.
`patches/fix-player-facing.py` documenta la precedente correzione della v0.8:
la v0.9 la incorpora direttamente in `src/game.js` e non riapplica lo script.
Per i limiti delle animazioni e dell'audio, consulta ANIMAZIONI.txt, AUDIO.txt e
THIRD_PARTY_NOTICES.txt nel pacchetto. La progressione è adattata a questa demo,
non una riproduzione completa della storia di Pokémon Nero.

## Sviluppo locale

Servono Python 3.11+ e Node.js 20+. Dalla cartella del repository:

```sh
curl -L --fail https://github.com/kazael96/soffiolieve-hd2d/releases/download/v0.8/soffiolieve-demo-v08.zip -o site.zip
python scripts/build-site.py site.zip _site
python -m http.server 4174 --bind 127.0.0.1 --directory _site
```

Apri http://127.0.0.1:4174. Per ricostruire scegli una nuova cartella di output
oppure rimuovi consapevolmente quella generata: lo script non sovrascrive cartelle
esistenti. Non servono dipendenze da installare per build e test.

## Test e pubblicazione

```sh
node --test tests/*.test.cjs
python -m unittest discover -s tests -p 'test_*.py'
```

I test coprono input, 72 combinazioni di movimento, pause/collisioni, progressione,
salvataggi non validi, verifica dell'archivio e versionamento della cache.
Il workflow Pages esegue questi controlli e verifica la sintassi di tutti i
sorgenti JavaScript prima della build e della pubblicazione su `main`.
I test automatici non sostituiscono le prove su telefoni reali e sui diversi browser.
