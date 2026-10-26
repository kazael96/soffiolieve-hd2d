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

### Verifica del font1 e cifre dei pannelli

La forma stretta del font1 non deriva da uno stride di riga sbagliato:
100 pixel a 2bpp occupano 25 byte, oltre alle tre metriche, quindi 28 byte
per cella. Il glifo A nella ROM ha indice33, bearing1, larghezza4,
avanzamento5; la bitmap ha apice, lati e traversa coerenti. È stato verificato
anche componendo parole con gli avanzamenti originali e ingrandimento intero3×
(Snivy, Tepig, Oshawott, Patrat, Lillipup e PS20/20). Un atlas visto interamente
a piccola scala può sembrare irregolare; ridimensionamenti frazionari del canvas
possono inoltre deformare i pixel. La variante bianca usa `y+variantOffset`;
quella scura usa `y`, con ombra dalla palette originale. Non sostituire questi
colori senza distinguere una scelta di resa dalla provenienza dell'asset.

Il membro4 è un set ridotto con simboli: la sua mappa non certifica un
alfabeto generico utilizzabile nei nomi. Non deve essere selezionato come tale.

L'atlante **164/palette162** dichiara nel NCGR dimensioni256×16, ora esportate
senza assegnargli un NCER di un altro membro: `hp-atlas-164.png`. Include barre
verdi/gialle/rosse, simboli di sesso e Poké Ball, e cifre PS/livello8×8. Le cifre
0–9 iniziano a `(72+8*n,8)`; i rettangoli sono nel manifest `hpAtlas.digits`.
Queste coordinate sono sorgenti grafiche, non posizioni assolute del pannello.

Il manifest generale dichiara `placementVerified:false`: non certifica tutte
le posizioni assolute dei pannelli sullo schermo. La successiva ricerca sotto
certifica separatamente composizione e testo delle quattro mosse. Restano
hit region, navigazione direzionale, animazioni/tempi e Borsa durante le lotte.

## Ricerca successiva: selezione mosse IRBI

La routine dell'overlay94 a **022032F4** carica NCGR91 su BG4,
NCGR113/NSCR114 su BG7, palette92 (`02203352`) e il gruppo OBJ115/117/118.
Questo conferma l'associazione della palette92 alle tile91 anche nel codice
originale. Il modulo è decompresso dalla ROM con base021F6460.

**02204BC0** riceve quattro ID mossa, quattro PP attuali e quattro PP massimi;
itera quattro volte e aggiorna testo, icona del tipo e palette. Il tipo viene
letto da `0201BD28(mossa,0)`. La tabella di palette a **0220A4F0** seleziona
uno dei membri194–212 dell'archivio lotta, a seconda del tipo: i primi16 colori
vengono copiati nel banco BG9+i da **02204F7E–02204F9C**. Il caricamento usa
esplicitamente l'archivio11 (`a/0/1/1`). Gli indici sono estratti nel manifest,
senza assegnare una lista di colori a mano.

L'apertura delle mosse (`022028EA`) richiama questa routine; il task
`022035C4`, alla fase finale **0220375C**, imposta BG5 a **(256,192)** tramite
`02204860`. Il setter ARM9 **020422E0** conferma le operazioni0=SET_X,
3=SET_Y. Il ritaglio di NSCR111 a queste coordinate è esportato come
`moves-layer-111.png`: mostra le quattro forme originali.

`move-panel-type-0.png`…`16.png` contengono la prima forma di128×48
(rettangolo sorgente256,224,128,48) con le palette originali selezionate dalla
tabella dei tipi. Possono sostituire sagome inventate, senza ridimensionamento
dei pixel. Il manifest espone `moves.panels`. La texture affine OBJ115:18 è
inoltre disponibile come **sorgente non trasformata**, con flag espliciti;
non è certificata come pannello mosse finale.

Le coordinate seguenti sono **locali al supporto testuale**, non ancora
coordinate assolute certificate della schermata:

| Slot | Centro nome (0220A3AC) | Etichetta PP (0220A4B0) | Centro valori PP (0220A4D0) |
|---|---|---|---|
|0|64,10|51,26|90,26|
|1|192,10|179,26|218,26|
|2|64,58|51,74|90,74|
|3|192,58|179,74|218,74|

La larghezza del nome e dei valori viene misurata e dimezzata prima della
stampa, quindi quelle X sono centri. L'origine verticale32 è ora **verificata**:
**022021D8–022021EA** crea la finestra su BG6 a0,4 tile, con dimensioni32×12
tile e banco palette13. Il buffer viene recuperato da020456F0 e salvato in
manager+22C. Il manifest espone `textWindowOffsetVerified:true`, le coordinate
assolute `namesScreen`, `ppLabelScreen`, `ppValuesScreen`, e le quattro origini
dei pannelli `(0,32),(128,32),(0,80),(128,80)`.

Le17etichette dei tipi sono esportate `type-0.png`…`16.png` e catalogate in
`moves.typeLabels.labels`. Provenienza verificata anche nelle routine ARM9:
**02027564** restituisce83 (`a/0/8/3`), **02027568** restituisce palette33,
**02027578** restituisce34+tipo. La tabella dei banchi palette a0209FBF0 è
letta dall'ARM9 decompresso e verificata nell'estrattore, non copiata da Nero2.

**02205668** sceglie gli indici del testo PP, non colori RGB:
normale1/2/0, metà3/4/0, quarto5/6/0, zero7/8/0
(foreground/shadow/background). Per massimi1–2, un PP usa quarto; per
massimi3–7, uno usa quarto e due metà; dagli8 in su valgono i limiti
floor(max/4) e floor(max/2). PP pieni sono sempre normali. La palette testuale
attiva è ora verificata: membro92, banco13, selezionato dalla finestra. I
colori foreground sono bianco255,255,255; giallo255,213,0;
arancio255,115,0; rosa255,8,74, rispettivamente. Le ombre sono115,115,115;
123,98,0;115,57,0;123,8,49. Non sostituire arancio/rosa con colori generici.

Per confrontare il problema del grigio è stato esportato anche
`font-1-white-pal7.png`, bitmap font1 con palette originale7: bianco255 e
ombra90,90,90. La precedente variante bianca da palette5 aveva ombra164,164,172;
sono due palette diverse, non due interpretazioni del bitmap. Il relativo
callsite di selezione nella lotta non è certificato: **questa non è la palette
esatta delle mosse**. Per quelle usare `font-0-battle.png` oppure
`font-1-battle.png`, con i quattro stati del banco13 e offset nel manifest.
La selezione del font0/1 passato al costruttore resta separata e non ancora
certificata; bitmap e palette sono originali.

### Font finalmente identificati nei caller

**Mosse: font0**, non1. Catena verificata:

1. Ov93 **021E8E6A/6C** carica archivio23, membro0 tramite0201D7EC;
   handle salvato nel contesto+B0.
2. **021E8ED8/8EDC** passa questo handle al trampoline021E8F24;
   ov95 **06899AF0**, **06899B28** lo conserva nel campo+8.
3. Ov95 **06899C0E/12** lo ricarica e lo passa, tramite06899C8C,
   a ov94 **02201F7C/02201FA0**; **02201FFC** lo conserva inUI+224.
4. **02204BC0** usa questo handle per nomi e PP. Usare
   `font-0-battle.png`, con i quattro stati cromatici verificati del banco13.

**Pannelli PS, nomi: font2**, non1. Catena verificata:

1. Ov93 **021E8E7E/80** carica archivio23, membro2 tramite0201D7EC;
   handle salvato nel contesto+B4.
2. **021E9032/3A** ricarica+B4 e lo passa a ov94 **021F7444**;
   **021F7454**, **021F7650/54** lo passano al gestore PS02206AC8.
3. **02206C42/44** lo conserva nel gestore+8; **0220805C** lo usa
   per misurare e stampare il nome.
4. **02208052** imposta foreground1/shadow4/background0, nella palette
   originale162: bianco255 e ombra32,32,32.

È disponibile `font-2-hp.png`, con metriche11×13 e avanzamenti originali.
La stampa avviene in un supporto64×16: origine locale8,5, oppure2,5
se il nome supera48 pixel (**02208066/78**). Queste sono coordinate del
supporto del nome, non posizioni assolute del pannello sul display.

`fonts['0'].battlePalette13.fontSelectionVerified` e
`fonts['2'].hpPalette162.fontSelectionVerified` ora sono true. Gli atlasfont1
rimangono risorse di confronto, senza rivendicare questi due ruoli.

Restano da tracciare stati di focus/pressione,
finestra dei messaggi e Borsa in lotta. Non sono stati prodotti compositi
di queste parti presentandoli come definitivi.

## Riproduzione

### Borsa del campo: LCD e descrizione completa

Catalogo dedicato: `assets/field-bag/provenance.json`, riproducibile con
`tools/extract-field-bag-ui.py ROM src` dopo l'export battleUI (font0).
Overlay70 `021B8E90–021B8E9C` azzera POWCNT1 bit15: main engine sul LCD
inferiore, sub sul superiore. La convenzione è confermata da
[libnds](https://github.com/devkitPro/libnds/blob/master/include/nds/system.h).
Di conseguenza il fondo maschile3/5/4 va in basso, mentre decorazione6/7/8
e pannello17/23/8 vanno in alto. Per il maschio `021B9200–021B9212`
copia i32byte della palette8 a offset32 sull'offset0; i PNG `topPanelMale`
e `topDecorationMale` comprendono questa sostituzione blu verificata.

`021B9B92` crea la descrizione sul BG6: `[16,96,232,56]`, non104pixel.
`021B9944` ottiene il testo dell'oggetto e `021B995E` stampa locale0,4,
quindi origine fisica `[16,100]`, font0. `021B8714/021B871E` selezionano
font0; `021BB5D4` inoltra al renderer il colore packed0x3DC0:
foreground15/shadow14/background0. Il packing è provato direttamente in
ARM9 `0201C8E6–0201C924`, shift10/5/0 seguiti da0201DD78. La palette
attiva di questa finestra TOP è **a/0/8/8:8**, non font5: per il maschio
il suo banco1 sostituisce banco0; ombra14 RGB123,148,172 e testo15 bianco.
Il caricamento font5 a021B92CC riguarda invece il banco12 main.
È esportato il font0 corretto in
`field-bag/font-0-fg15-shadow14.png` insieme alle metriche originali.
Altre finestre superiori: titolo `[56,40,144,24]`, quantità `[160,64,48,24]`,
messaggio `[0,152,256,40]` (costruttori `021B9B42/5C/76`).
Il titolo stampa in `[56,44]`, quantità in `[160,68]` (locale0,4,
`021B9822/021B987E`). L'icona oggetto sul TOP ha origine attore
`[132,80]`, `021B9D76–021B9DA6`; aggiungere l'origine NCER della cella.

La lista è invece composta da otto attori OBJ (`021BA028–021BA0B6`),
origine x140,y24*i, selettore x116,y24*i. Le finestre BG3 a destra sono
contestuali: non costituiscono il testo della lista. L'origine bitmap
delle etichette dinamiche resta da tracciare separatamente.
I cinque attori dello zaino creati da `021BA7B4` condividono posizione0,80
con aggiustamento−16,0; tabella delle coppie di sequenze
`[[9,4],[8,3],[6,1],[7,2],[5,0]]` a021BB975. Sono stati sovrapposti
dello zaino intero, non cinque icone da distribuire arbitrariamente in basso.
Le origini iniziali−16,80 sono una transizione: `021BB584–021BB5C6`
aggiunge4alla X di ogni attore finché raggiunge la tabella021BBAAC,
quindi le origini **finali sono0,80**, senza tagliare lo zaino.
La lista ha invece una riga buffer reale: `021B6244` imposta ctx814=−1,
`021B7C74` limita lo scroll a−1 e `021BA1B6` legge itemIndex=ctx814+actorIndex.
Al normale inizio l'item0 appartiene dunque all'attore1, origine140,24,
e la cella con origineY−12 comincia aY12. L'attore0 rimane parzialmente
fuori dallo schermo come buffer dello scorrimento: non aggiungere12pixel
indiscriminatamente a tutti gli attori. `021B60B8` conferma la selezione
item=ctx810+ctx814+1. Il catalogo distingue `initialOrigins`/`settledOrigins`
e `list.bufferedRows`.

### Aggiornamento: focus, pressione, slot vuoto e messaggi

La selezione mosse usa il buttonset IRBI `0220A29C`, referenziato da
`MoveScreenMain 02202FF0` a `02203140`; le touch rect originali sono a
`0220A3CC`. I quattro pannelli occupano x0/128, y32/80, 128x48 pixel
(il byte destro255 rappresenta il bordo dello schermo). Annulla ha rect
originale x176..255,y144..192. Questi dati sono esportati in `moves.touchRects`.

Lo slot con moveID0 seleziona la palette193 (`02204F48`): deve mantenere
la sagoma scura originale senza nome, tipo e PP. È disponibile come
`moves.emptyPanel`, non va lasciata la palette gialla della texture base.

Il cursore da tastiera è NCGR119/NCER120/NANR121 con palette116:
quattro parentesi magenta e bianche. Le pose e le animazioni originali sono
in `moves.keyCursor`; gli offset OAM vanno rispettati. I frame NANR sono
triplette da12 tick con traslazioni -2/-1/0 verso il bordo per ciascun angolo.
Il costruttore `02205D80` usa la tabella di sei sequenze a `0220A480`,
esportata come `actorSequences`; il posizionamento è in `022063CC`.
La mano217 del tutorial non è questo cursore.

La pressione `02206478` avvia il task `0220653C`: palette sub-BG della
mossa selezionata (banchi9..12, maschere a `0220A350`) sfumata verso
bianco0x7FFF, coefficiente0→8→0 con denominatore16. La durata esatta
non è ancora certificata; non serve introdurre un bordo grafico estraneo.

La finestra messaggi superiore è stata individuata in ov93:
`021EB00A–021EB01A` crea BG1 x1,y19,w30,h4 tile, palette0,
ossia interno `[8,152,240,32]`. `021EB03A` riempie con indice12 nero;
`021EAF64` carica palette90, `021EAFBE` carica char89. La striscia originale
64x8 è `message-tiles-89.png`, esportata con la sua palette90. La finestra
riceve font0 dal controller+24. `021ED66C` configura blending hardware
(BLDCNT via0207D5BC, target2/0x3D, coefficienti31 e7). Sono certificati
interno, riempimento e risorse: assemblaggio dei tile esterni, baseline e
indici colore del printer richiedono ancora il relativo tracciamento.
Aggiornamento printer: `021ECDB8–021ECE04` risolve anche font, colori e
origine. `021ECDCC` imposta foreground1/shadow9/background12 tramite
`0201DD78`; `021ECDE0` usa il font controller+24 (font0), e il printer
`021ECE04` riceve x0,y0. Il testo parte quindi da `[8,152]` sullo schermo
superiore. È esportato `font-0-message.png`, con metadata
`fonts['0'].messagePalette90`. Restano separati l'assemblaggio esterno dei
tile e l'esatta resa del blending; colori e origine non sono più ipotesi.
Non è corretto sostituire questi dati con un bevel verde o con il riquadro
dei dialoghi del campo. Il catalogo applicabile è `messageWindow`.

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
