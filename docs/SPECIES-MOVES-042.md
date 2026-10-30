# Coppie Pokémon–mossa · 0.42

Le 139 coppie precedenti restano. Si aggiungono 42 profili HD-2D, per 181 complessivi; alcuni profili comprendono mosse dei livelli precedenti dei Pokémon avversari. La presenza del profilo non concede una mossa non disponibile nella partita.

| Specie | Nuovi profili | Anatomia e gesto |
| --- | --- | --- |
| Pidove | Raffica16, Ruggito45, Fulmisguardo43, Att. Rapido98, Aerasoio314, Cuordileone526, Scontro165 | battiti, rialzo e picchiata del corpo, becco come origine di raffiche e richiamo |
| Blitzle | Att. Rapido98, Colpocoda39, Sottocarica268, Ondashock351, Tuononda86, Scontro165 | corsa a quattro zampe, coda, raccolta dell'elettricità e rilascio dalla testa |
| Roggenrola | Azione33, Rafforzatore106, Turbosabbia28, Bottintesta29, Cadutamassi350, Scontro165 | massa compatta, dondolio sui piedi, irrigidimento e proiezione delle rocce |
| Woobat | Confusione93, Segugio316, Raffica16, Garanzia372, Cuorestampo531, Furto168, Scontro165 | oscillazione e picchiata del corpo alato, muso per emissione psichica e contatto |
| Timburr, solo avversario | Botta1, Fulmisguardo43, Focalenergia116, Pazienza117, Colpo Basso67, Scontro165 | baricentro, preparazione delle braccia, colpo basso e accumulo/rilascio di Pazienza |
| Tympole, solo avversario | Bolla145, Ruggito45, Supersuono48, Coro496, Bollaraggio61, Scontro165 | espansione ritmica del corpo, coda e bocca per bolle e onde sonore |
| Purrloin, Pansage, Pansear, Panpour | Furto168 per ciascuno, dalla nuova MT46 | avvicinamento e contatto con gli ancoraggi e la postura del rispettivo rig |

Le quattro nuove specie ottenibili coprono tutte le mosse per livello fino al 15, Scontro e le macchine rese disponibili e compatibili. MT83 è compatibile con Pidove; MT46 con Woobat e le quattro specie indicate; nessuna delle quattro nuove specie è compatibile con MN01. Compatibilità dai bit personal IRBI 45/82/95. Timburr e Tympole non diventano catturabili per il solo fatto di apparire nella squadra di N.

`route3-moves.js` estende i rig di `chapter-moves.js`, con preparazione, gesto, emissione/contatto e recupero distinti. I profili funzionano sui due lati e integrano le reazioni dei sei nuovi corpi. Non si inventano indici OAM anatomici: come per la 0.40, il movimento è applicato al corpo composto e agli ancoraggi. Sprite animati, effetti nativi e suoni restano quelli estratti; le nuove coreografie sono adattamenti HD-2D, non sequenze scheletriche DS recuperate.

Verifica unitaria: tutti i fotogrammi dei 42 nuovi profili con entrambi i lati/esiti, valori finiti, recupero a riposo, rig distinti e confini di Pazienza. Il collaudo browser completo deve riportare 181 coppie × 2 lati × 2 esiti × 5 campioni = 3.620 campioni per formato; 19 specie animate, 38 atlanti, 2.280 campioni del ciclo originale. Stato attuale: implementazione e verifiche unitarie completate; verifica finale dei tre formati ancora da registrare; il tentativo desktop interrotto e la correzione dell’audit sono documentati in QA-042.md. Nessun conteggio sostituisce il confronto visivo della build.
