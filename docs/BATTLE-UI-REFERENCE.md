# Interfacce originali: riferimenti verificati

## Ambito e stato

Ricerca svolta sulla ROM italiana **IRBI** fornita dall'utente. L'estrattore
`tools/extract-battle-ui.py` legge `a/0/1/1` e produce soltanto PNG convertiti e
`src/assets/battle-ui/provenance.json`. Non esporta ROM, overlay o file Nitro.
Le immagini sono risorse originali; **non costituiscono una ricostruzione completa
delle schermate**. La posizione assoluta e le trasformazioni dello schermo
inferiore non sono ancora state verificate nel codice IRBI.

L'archivio contiene 222 membri; SHA-256 della NARC nella ROM locale:
`2c1255e06d5c81973d07ffa007d1af1788a8b6eef3e4643c6973885b118793cd`.

## Verifica visiva con il manuale originale

Fonte primaria: [manuale Nintendo di Pokémon Black](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/DS_Pokemon_Black),
edizione originale, non Nero 2. Le pagine stampate 11, 14, 16–18 sono state
renderizzate e ispezionate. Il manuale è inglese; non certifica le traduzioni
italiane né coordinate al pixel.

- Lotta: grande comando centrale fra le due metà della Poké Ball; sotto,
  Borsa a sinistra, Fuga al centro, Pokémon a destra. Le squadre sono indicate
  da Poké Ball sopra e sotto il comando centrale. Non è una griglia 2×2.
- Pannello avversario in alto a sinistra: nome, sesso, livello, barra PS e
  simbolo di cattura. Quello proprio in basso a destra aggiunge PS numerici
  ed esperienza. Tipo e abilità non restano sempre esposti.
- Menu: Pokémon/Pokédex, Borsa/nome allenatore, Salva/Opzioni su tre righe;
  chiusura in basso a destra. Le voci dipendono dal progresso.
- Croce: movimento/cursore; A: conferma/interazione/testo; B: annulla/indietro;
  X: apre e chiude il menu; Y: scorciatoie registrate. Start e Select hanno
  funzioni contestuali nella Borsa.
- Opzioni: velocità testo, suono, animazioni e stile lotta; Conferma salva.
  Cambio propone una sostituzione dopo un KO avversario, Fisso prosegue.

## Risorse estratte e limiti

I nomi dei file mantengono gli indici della ROM. Le associazioni sotto sono
verificate dai formati e dall'ispezione delle immagini. Gli offset sono
**origini relative NCER/OAM**, non posizioni assolute sul display.

| NCGR | NCLR | NCER | Cella | Ritaglio | Origine relativa |
|---|---|---|---|---|---|
| 165 | 162 | 166 | 0 | 128×16 | −64, −7 |
| 168 | 162 | 169 | 0 | 128×21 | −64, −7 |
| 171 | 162 | 172 | 0 | 128×16 | −64, −7 |
| 174 | 162 | 175 | 0 | 128×17 | −64, −8 |
| 177 | 162 | 178 | 0 | 50×6 | −17, −7 |
| 183 | 162 | 184 | 0 | 84×3 | −42, −6 |
| 186 | 162 | 187 | 0 | 8×8 | 0, −8 |

165/168/171/174 sono elementi dei pannelli PS con diciture PS/Lv.; 177/183
sono barre separate. Non si certifica ancora quale variante il dispatcher
selezioni per ogni configurazione della lotta.

Altri gruppi:

- 115/116/117, celle 0–7: simboli delle Poké Ball e varianti ridotte. Le celle
  successive usano attributi affini e sono volutamente escluse dall'estrattore
  finché matrice e comportamento non vengono verificati.
- 189/190/191: 25 icone di Poké Ball più due barre, con bounds originali nel
  manifest. La corrispondenza semantica delle 25 varianti non è ancora assegnata.
- 113/114/92: immagine sorgente della sfera touchscreen, **512×512**; NCGR
  8 bpp, tilemap NSCR e palette originali. `touchscreen-sphere-source.png`
  ricostruisce l'immagine sorgente, non uno screenshot 256×192. Non ridimensionare
  arbitrariamente questa immagine presentandola come proiezione originale.
- 91 con **palette 92** contiene altre tile dei comandi, inclusa la scritta
  italiana LOTTA. Esportate mappe 104–112 come `command-source-*.png` e ritagli
  iniziali 256×192 come `command-view-*.png`. Il primo quadrante di 104–106
  contiene la fascia LOTTA, quelli 107–111 la fascia senza etichetta; 112 è
  trasparente nel ritaglio iniziale. Le forme esagonali sono in altri settori
  delle mappe complete. I ritagli **non sono schermate complete**: mancano i
  tre comandi inferiori, le Poké Ball e la barra superiore. L'associazione
  iniziale di prova con palette 90 era errata; non è pubblicata come grafica
  finale. L'ordine degli screen block testuali è 32×32 tile; la sfera affine
  113/114 ha invece la propria mappa sorgente lineare.
- Font piccoli dalla NARC `a/0/2/3`: membro 1 cella 10×10, 28 byte; membro 3
  cella 11×8, 25 byte; membro 4 cella 12×12, 39 byte. Gli atlas mantengono
  metriche di avanzamento e bearing, senza ridimensionare i pixel. Il manifest
  include glifi e due varianti dalla palette 5. **La scelta del font per i
  nomi nei pannelli PS non è ancora certificata** (`battleRoleVerified:false`).

Il manifest dichiara `placementVerified: false`. Non sono certificati ancora
hit region, navigazione direzionale originale, animazioni di apertura, tempi,
schermata delle quattro mosse o categorie della Borsa durante le lotte.

## Riproduzione

Con ndspy e Pillow disponibili nel Python locale:

```text
python tools/extract-battle-ui.py <ROM-IRBI.nds> src
```

L'estrattore controlla il codice gioco, il numero dei membri, le signature
Nitro, le dimensioni della sfera e l'assenza di celle affini nei gruppi esportati.
Nessun indice di Nero 2 viene assunto automaticamente: le costanti di
[pokebw2](https://github.com/fuddlesworth/pokebw2/blob/main/include/constants/arc.h)
sono state consultate come orientamento, mentre tutti gli asset di questo
checkpoint provengono dalla NARC IRBI verificata.
