# Appoggio dei Pokémon — 0.21

La0.20 posizionava i combattenti a percentuali fisse, estranee alla camera prospettica dei nuovi fondali. Le ombre erano disegnate dentro la trasformazione del corpo e i rettangoli delle celle includevano margini trasparenti sotto i piedi. Soprattutto nel Percorso1, il risultato appariva sospeso sopra alberi o cartelli.

`battle-ground.js` usa la camera esatta esposta dal diorama, interseca un raggio con il piano di appoggio e proietta quel punto per piedi, ombre e attacco degli effetti. Il piano rappresenta il terreno percorribile (y0.02 all'aperto) o il tappeto della camera (y0.125); non appoggia i Pokémon sulle facce verticali dei cartelli o sulle chiome. Le posizioni di messa in scena mantengono uno spazio libero dal HUD. La scala deriva dalla profondità, con limiti di leggibilità per desktop e telefono. Non è una simulazione delle altezze canoniche di ciascuna specie.

Le ombre di contatto sono ellissi proiettate sul piano XZ, con un nucleo scuro e una penombra nella direzione della luce del fondale. Sono esterne a rotazione e spostamento verticale del corpo: durante un salto rimangono sul suolo e si attenuano. Seguono spostamenti orizzontali, ingresso, KO, riduzione e visibilità del terreno.

Lo sprite animato viene misurato una volta sul primo fotogramma composito, usando i pixel realmente opachi per togliere il margine trasparente sotto i piedi. Sono conservate le trasformazioni e la sequenza originali dell'animazione; un salto nativo può quindi sollevare il corpo, ma non l'ombra. Anche l'immagine statica di attesa usa i limiti dei pixel opachi. Non si ricalcola la sagoma a ogni fotogramma.

Particelle ed effetti usano lo stesso punto di appoggio e l'altezza proiettata del combattente; la Poké Ball si aggancia al riferimento dei piedi aggiornato. La camera delle mosse continua a trasformare insieme scena, Pokémon, ombre ed effetti. Le altre ambientazioni predisposte nella0.19 conservano la propria composizione, con correzione dei margini degli sprite e ombre indipendenti dal corpo.

Verifica: quattro nuovi test su proiezione/intersezione, ridimensionamento, margini alpha e ombre durante il sollevamento; regressione dei test esistenti. Prove visive dei tre ambienti con HUD e Pokémon in campo, desktop e390×844, e un turno Frustata. Il motore GEN5, i salvataggi e la selezione immutabile del luogo non cambiano. Le animazioni personalizzate per coppia Pokémon–mossa restano un requisito separato.
