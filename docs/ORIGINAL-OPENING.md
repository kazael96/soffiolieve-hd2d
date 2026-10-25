# Perimetro: l’inizio di Pokémon Nero

La demo ripropone gli eventi iniziali del gioco, fino all’arrivo ad Accumula.
Nessun evento successivo in città è incluso. La sequenza è camera di Alcide e
scelta dello starter, lotte con Belle e Komor, Mamma, casa di Belle, Aralia,
consegna della mappa, primo passo sul Percorso 1, tutorial di cattura,
esplorazione e confronto delle catture, chiamata di Aralia e arrivo.

Riferimenti per l’ordine narrativo:
[Soffiolieve e Percorso 1](https://bulbapedia.bulbagarden.net/wiki/Appendix:Black_and_White_walkthrough/Section_1),
[dettagli della partenza](https://strategywiki.org/wiki/Pok%C3%A9mon_Black_and_White/Nuvema_Town).
I dialoghi della demo sono sintesi, non una trascrizione del copione.

## Provenienza dei nuovi dati

- ROM italiana IRBI letta localmente, mai caricata nel repository.
- Geometria: `a/0/0/8`, elementi 505 (camera), 504 (casa), 502 (casa di Belle), 506 (laboratorio), 4–6 (collegamento nord e Accumula).
- Texture terreno/interni: `a/0/1/4`, elementi 2, 212, 213.
- Arredi: `a/2/3/0`, banco 6, e banco 1 per le macchine 23/24, identiche negli altri banchi che le contengono. Texture `a/1/7/7`.
- Oggetti esterni: `a/2/2/9`, banco 0; texture `a/1/7/6`.
- Sprite aggiuntivi: tabella `a/0/4/8` e grafica `a/0/4/9`; oggetti 208 (regalo), 24 (padre), 18 (viandante).
- Porte e scale confrontate con gli eventi `a/1/2/5`, zone 389–396.
- Esperienza e cattura: statistiche `a/0/1/6`, crescita `a/0/1/7`.
- Incontri del Percorso 1: `a/1/2/6`, tabella 77, dodici slot terrestri, Patrat/Lillipup ai livelli 2–4.

Formati verificati anche con gli strumenti di ricerca
[pokebw2](https://github.com/fuddlesworth/pokebw2/tree/966de38c585822fba37d74a8a174f0e911b8ea58/tools/data)
e con apicula. Gli indici effettivi qui elencati sono della ROM **Nero**, non Nero 2.
Le nuove geometrie vengono trasformate dal formato glTF nel formato già usato
dal renderer; UV, normali, trasformazioni e palette provengono dai dati originali.

## Limiti di questa prima implementazione

- Le scene sono dialoghi con personaggi posizionati: mancano ancora le camminate
  sincronizzate, la regia completa, il disordine animato della camera e la chiamata video dell’Interpoké.
- La selezione è limitata ad Alcide; soprannomi, consultazione completa del
  Pokédex e della Mappa Città non sono implementati. Gli oggetti ricevuti sono indicati nel diario.
- Il tutorial è una dimostrazione sceneggiata. Le catture normali consumano una
  Poké Ball e, se falliscono, concedono il turno al selvatico. Mancano le catture
  critiche, l’animazione originale della sfera e il deposito oltre sei Pokémon.
- Specie, livelli e pesi degli incontri sono originali; il generatore di passi
  e la frequenza degli incontri sono semplificati. Nessun incontro sul prato ordinario.
- Il motore delle lotte conserva i limiti della v0.8: IA provvisoria e statistiche
  con IV prefissati. La crescita usa tabelle ROM; EV, evoluzioni e scelta della
  mossa da dimenticare non sono ancora gestiti (vengono mantenute le ultime quattro apprese).
- Musica e animazioni restano quelle già disponibili nella demo; non ogni scena
  ha ancora la traccia e gli effetti esatti dell’originale.

## Verifiche

Test degli input (incluse 72 combinazioni), migrazione delle preferenze, salvataggi
della storia, checksum e versionamento della build. Controlli sugli asset reali
verificano la raggiungibilità di porte, interazioni e ingresso di Accumula.
Il controllo del motore percorre nove sequenze complete: tre starter con vittoria,
sconfitta e combattimenti realmente simulati. Verifica anche catture riuscite,
lanci falliti, turno avversario, inventario e squadra.
Le prove nel browser integrano questi controlli; non sostituiscono un collaudo su telefoni reali.

## Prossimo lavoro entro lo stesso perimetro

Completare regia e transizioni delle scene originali, poi rifinire cattura,
Pokédex, mappa e apprendimento. Non ampliare la storia oltre Accumula senza accordo.
