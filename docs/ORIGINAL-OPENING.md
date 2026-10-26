# Perimetro: l’inizio di Pokémon Nero

La demo 0.12 parte dalla camera di Alcide e termina all’ingresso di **Quattroventi**
(Accumula in inglese), dopo il Percorso 1. Centro Pokémon e Team Plasma non sono
inclusi. Non ampliare questa parte del gioco senza concordarlo con l’utente.

## Ripristinato

- Programmi e dialoghi italiani originali: 1813 istruzioni selezionate, nove zone,
  movimenti sincronizzati, flag, variabili e scelte; non dialoghi riassunti.
- Interni, arredi, camera disordinata dopo le lotte, 14 porte/scale e 62 approcci
  validi alle interazioni con cartelli e mobili.
- Porte animate, fumo della camera e ricezione del Pokédex con BCA/BMA/SPA originali.
- Regalo e selezione animata dei tre starter con grafica originale; soprannomi.
- Belle e Komor con squadra, caratteristiche e battute originali. Le prime
  sconfitte non sottraggono denaro; le vittorie assegnano 500 ciascuna.
- Interpoké con i quattro ritratti, sequenza e testi originali.
- Tutorial con Minccino e Patrat, incontri di Patrat/Lillipup ai livelli 2–4,
  frequenza e controlli nell’erba confrontati con IRBI; priorità delle scene.
- Formula di cattura di quinta generazione con arrotondamenti, sfera, particelle
  e suoni originali; registrazione al primo incontro/cattura e soprannomi.
- Pokédex del tratto con font, impronte, tipi e descrizioni originali; Mappa Città
  ricevuta da Mamma consultabile, con cursore, zoom e luoghi visitati.
- IV, EV, natura, sesso, abilità, felicità, PS/PP individuali, esperienza,
  scelta della mossa da dimenticare e salvataggi della squadra.
- Passeggiate degli NPC entro i limiti degli eventi, pause e direzioni originali;
  collisioni e completamento del passo prima delle scene.
- Comandi da tastiera e schermo, orientamento corretto, preferenze persistenti.

## Provenienza e riproducibilità

La ROM italiana **IRBI** è stata letta solo localmente e non è nel repository.
`tools/` contiene gli estrattori; `docs/FAITHFUL-OPENING-WIP.md` registra indici,
indirizzi, controlli e risultati della ricerca. Gli asset v0.8 restano verificati
con lo SHA-256 originale durante ogni build.

Mappe: a/0/0/8; texture: a/0/1/4; arredi: a/2/3/0 e a/1/7/7;
eventi: a/1/2/5; incontri: a/1/2/6; statistiche/crescita: a/0/1/6–7.
Pokédex: a/1/5/9, a/1/6/7, a/0/8/3 e font a/0/2/3.
Mappa: a/0/8/5–6. I riferimenti alle routine IRBI sono nei moduli e nel checkpoint.
La ricerca su [pokebw2](https://github.com/fuddlesworth/pokebw2/tree/966de38c585822fba37d74a8a174f0e911b8ea58)
ha aiutato a identificare i formati; indici e routine sono stati verificati nella
ROM Nero, senza assumere che coincidano con Nero 2.

## Differenze ancora da completare

- Introduzione precedente alla camera, scelta nome/sesso e personaggio femminile.
- Porte, fumo e ricezione del Pokédex ora riproducono i dati originali. Restano
  da confrontare i tempi assoluti, la preparazione/ripristino dello schermo e la
  proiezione delle particelle del Pokédex; vedere FIELD-MODELS.md e FIELD-EFFECTS.md.
- Regia, transizioni e tempi precisi da confrontare fotogramma per fotogramma;
  la camera HD-2D resta un adattamento. Non è un’emulazione della cartuccia.
- Menu squadra/borsa/diario, interfaccia delle lotte e tastiera dei soprannomi
  restano adattamenti web. Pokédex: transizione, bagliore e scorrimento di fondo
  incompleti. Mappa: barra dei comandi web, tempi dello zoom da confrontare.
- Deposito oltre sei Pokémon ed evoluzioni non implementati. L’esperienza viene
  presentata al termine della lotta. Ritorno dopo sconfitta selvatica da rifinire.
- Il generatore casuale non replica lo stato globale della console; le regole
  degli incontri/catture e degli NPC sono riprodotte, non la stessa sequenza casuale.
- Il saldo iniziale 3000 è verificato da riferimento di gioco, ma la routine IRBI
  di inizializzazione non è ancora identificata. I vecchi salvataggi non ricevono
  premi retroattivi per risultati di lotta non registrati.
- Nessuna verifica completa su telefoni fisici o confronto video integrale con
  emulatore. Non dichiarare il tratto completamente fedele finché questi limiti
  non sono risolti e verificati.

## Verifiche

Test unitari di input, salvataggi, eventi, lotte, cattura, mappa e NPC; controlli
sugli asset reali, checksum, dipendenze e raggiungibilità. Il test del motore
esegue nove sequenze complete: tre starter con vittoria, sconfitta e lotte
simulate, più registrazione delle catture, apprendimento, porte e interazioni.

Le prove nel browser includono l’intera progressione fino al limite della demo,
selezione dello starter, registrazione e soprannomi, consultazione della mappa,
cartelli, fuga, direzioni da tastiera e pulsanti sullo schermo. Le pagine QA
isolate restano locali e non fanno parte della pubblicazione.
