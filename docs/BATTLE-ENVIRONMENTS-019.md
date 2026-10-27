# Ambienti di lotta 0.19: materiali originali IRBI

`src/battle-environment-assets.js` espone `BATTLE_ENVIRONMENT_ASSETS`: 10 profili espliciti e 60 texture già presenti. L'estrattore riproducibile è `tools/catalog-battle-environments.py`; non vengono aggiunti PNG o modificati i materiali originali.

Questi sono **materiali originali degli ambienti di esplorazione**, impiegabili per comporre fondali di lotta HD-2D coerenti con il luogo. La prospettiva, le proporzioni della stanza, la disposizione scenica e l'illuminazione del fondale sono adattamenti da verificare nel runtime; il catalogo non li presenta come fondali di lotta originali di Nero.

## Provenienza e scelta delle superfici

Fonte primaria: `OPENING_ASSETS` estratto dalla ROM italiana IRBI tramite `tools/extract-opening.py`. Modelli `a/0/0/8`, materiali `a/0/1/4`. Ogni nome del catalogo corrisponde a una texture esistente; SHA-256 e dimensioni sono registrati per controllare l'integrità. Le palette riportano i sei colori RGB più frequenti tra i pixel con alpha almeno 128, senza correzione cromatica inventata.

| Profilo | Modello / materiali | Pavimento; parete; fascia | Elementi riconoscibili |
| --- | --- | --- | --- |
| `bedroom` | 505 / 212 | `fhyuka`; `fhkabe`; `fhkabe2` | Finestra, letto, tappeto, scrivania PC |
| `bedroomMess` | 633 / 212 | Gli stessi nomi, dal modello 633 | Letto, finestra e impronte originali |
| `home` | 504 / 212 | `fhyuka`; `fhkabe`; `fhkabe2` | Tappeto verde `carpet01_1`, ingresso |
| `bianca` | 502 / 212 | Materiali propri del modello 502 | Tappeto e ingresso della casa di Belle |
| `biancaRoom` | 503 / 212 | Materiali propri del modello 503 | Tenda rosa, letto e tappeto |
| `komorHome` | 500 / 212 | Materiali propri del modello 500 | Ingresso della casa di Komor |
| `komorRoom` | 501 / 212 | Materiali propri del modello 501 | Letto, tappeto rosso, libreria e finestra |
| `lab` | 506 / 213 | `m_lab01_01`; `m_lab01_04`; `m_lab01_03` | Piastrelle chiare, parete verde, inserto in legno, armadio e monitor |
| `route1` | 4 / 2 | `grass01ax`; `michi01a` | Erba, alberi, chiome e staccionata del Percorso 1 |
| `nuvema` | 0–3 / 2 | `grass01ax`; `michi_isi` | Alberi e facciate `t2_house01_01/02` di Soffiolieve |

La scelta dei pavimenti degli interni è verificata anche sulla geometria: somma delle aree proiettate orizzontali dei triangoli con quel materiale, registrata in `proof.floorHorizontalTriangleArea`. I valori sono 73,62 per la camera, 110,59 per casa Alcide, 110,60 per casa Belle, 75,24 per camera Belle, 112,05 per casa Komor, 76,48 per camera Komor e 126,64 per il laboratorio. `fhkabe` e `m_lab01_04` sono invece superfici verticali; la selezione non dipende soltanto dai nomi.

I materiali del paese provengono da `ROM_SCENE` conservato in `work/fidelity-build-018-release/assets/scene.js`. Le relative immagini `assets/textures/` devono rimanere nel pacchetto finale. Gli altri materiali si trovano già in `src/assets/opening/`.

## Contratto di integrazione

1. Risolvere il luogo in un profilo esplicito e conservarlo all'avvio della lotta. Le chiavi sono quelle delle scene esistenti; `aliases` aggiunge i nomi italiani. Non sostituire un profilo mancante con Percorso 1.
2. Risolvere `environments[id].surfaces` e `.decorations` attraverso `textures[key].src`. Il percorso è relativo al sito assemblato, come gli altri cataloghi esistenti.
3. Negli interni comporre pavimento prospettico e pareti reali. Le ripetizioni suggerite in `composition` sono una scelta scenica adattata, non coordinate ricavate dal gioco.
4. Le texture dei mobili e degli edifici sono facce/atlanti di materiali, non sprite completi. Per oggetti completi usare la geometria originale con le sue UV; per box scenici scegliere esplicitamente le singole facce. Non stirare l'atlante del letto o della casa su un unico cartellone.
5. All'aperto scegliere prato o sentiero in base al terreno catturato dal contesto. Mantenere alberi/recinzioni/facciate specifici del luogo; cielo, profondità di campo e grading restano scelte HD-2D.

Il catalogo fornisce risorse e provenienza verificabili. La presenza effettiva degli elementi, l'inquadratura e la leggibilità sotto il nuovo HUD richiedono una verifica visiva del runtime. Non amplia gli incontri o la copertura delle animazioni Pokémon–mossa.

## Riproduzione

Eseguire `tools/catalog-battle-environments.py --help` per i percorsi configurabili. Richiede Pillow, `src/opening-assets.js`, le sue immagini e il pacchetto base con `assets/scene.js`. L'esecuzione verifica l'esistenza di ogni immagine e l'area dei pavimenti, poi rigenera il catalogo. L'anteprima di ricerca `work/battle-env-texture-proof.png` rimane fuori dagli asset pubblicati.
