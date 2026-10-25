# Riproduzione fedele: lavoro in corso

La v0.10 pubblicata **non è ancora una riproduzione fedele**: contiene dialoghi
riassunti e meccaniche/scene semplificate. La richiesta successiva dell'utente
esclude queste sostituzioni. Il limite resta l'arrivo alla città successiva,
**Quattroventi** nella ROM italiana (Accumula in inglese).

## Dati verificati

`tools/extract-original-events.py` legge la ROM italiana IRBI fornita dall'utente.
Estrae 1.603 istruzioni raggiungibili da 52 ingressi di script in nove zone,
le relative sequenze di movimento, i testi italiani e le entità delle mappe.
Il conteggio degli ingressi è verificabile nei `supportedEntries` dell'output.
I testi mantengono segnaposto, ritorni a capo e codici di avanzamento originali.
Ogni programma conserva l'hash SHA-256 del membro originale dell'archivio.

Archivi: `a/0/5/7` (script), `a/0/0/3` (testi), `a/1/2/5` (eventi),
`a/0/1/2` (intestazioni delle zone). La ROM non viene caricata o inclusa.

Le firme dei comandi sono confrontate con
[PokeScriptSDK5 BW, revisione 233d070](https://github.com/PlatinumMaster/PokeScriptSDK5/blob/233d0702df1f9a35c49fb1d13f0b679f83258dd1/yml/BW/Base.yml)
e con le firme e i nomi documentati da
[pokebw2, revisione 966de38](https://github.com/fuddlesworth/pokebw2/blob/966de38c585822fba37d74a8a174f0e911b8ea58/tools/script/field_commands.json).
Le differenze BW/BW2 sono risolte nella tabella locale e controllate sui byte
IRBI. I nomi ereditati da BW2 non dimostrano da soli il comportamento del comando.

## Stato dell'integrazione

`field-event-vm.js` esegue variabili, condizioni, salti, chiamate e flag originali.
Delega i comandi del motore a un adattatore che deve confermarne esplicitamente
l'esecuzione. Un comando non implementato interrompe la sequenza: **non viene
ignorato e non viene sostituito da una scena inventata**.

Questi file non sono caricati da `index.html`: non modificano la demo pubblicata.
L'adattatore grafico e di gioco non è pronto. In particolare restano da verificare
e implementare gli effetti della stanza dopo la prima lotta, i comandi di camera
e animazione, il video Interpoké, gli script globali di consegna degli strumenti
e l'integrazione con salvataggi, lotte e mappe. Anche i limiti delle meccaniche
elencati in `ORIGINAL-OPENING.md` restano aperti.

I test verificano riferimenti, diramazioni, sincronizzazione e ordine delle
battute dell'introduzione. **Non sono un collaudo visivo della fedeltà** e non
giustificano una pubblicazione della nuova modalità.

## Rigenerazione locale

Con Python e `ndspy` installato:

```text
python tools/extract-original-events.py "percorso/Pokemon Nero.nds" src/original-events.js
node --test tests/original-events.test.cjs
```

Non collegare la nuova modalità alla demo finché gli effetti raggiungibili non
sono implementati e confrontati con il gioco originale. Il prossimo passo è
completare e collaudare l'adattatore della camera di Alcide, incluse entrambe le
lotte, senza sostituzioni narrative o comandi ignorati.
