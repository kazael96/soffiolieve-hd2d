# Arrivi coerenti e Centro Pokémon — 0.37

## Comportamento

| Personaggio e momento | Destinazione |
| --- | --- |
| Aralia, dopo il tutorial di cattura | Cammina fino al punto dell’evento davanti al Centro Pokémon di Quattroventi e vi aspetta. |
| Komor e Belle, dopo il tutorial | Raggiungono le rispettive posizioni del confronto sul Percorso1. |
| Komor, dopo il confronto | Raggiunge la piazza dove parteciperà agli eventi del Team Plasma. |
| Belle, dopo il confronto | Si dirige verso il Centro. Se Aralia occupa l’accesso, aspetta di lato; il passaggio al successivo evento interno avviene durante la transizione coperta. |
| Aralia dopo il tour; Komor dopo N | Restano valide l’uscita del Centro e quella verso il varco, nascoste soltanto dopo il passaggio effettivo attraverso il portale. |

Un arrivo non è una rimozione: il personaggio resta nella scena finché il corrispondente attore dell’evento successivo può essere adottato nella medesima posizione. Soffiolieve, Percorso1 e Quattroventi condividono un campo continuo: Aralia e Komor vengono mostrati alla loro destinazione già dal Percorso1, senza apparire improvvisamente al confine della mappa nativa. Le copie visive della mappa adiacente non eseguono eventi finché il giocatore non entra nella mappa corretta.

Le adozioni di attori preesistenti seguono le celle percorribili invece di tagliare in linea retta attraverso gli ostacoli. Le attese di viaggio non bloccano il controllo del giocatore. I personaggi che entrano in una porta mantengono la verifica effettiva di invisibilità, senza dissolvenze.

## Salvataggi precedenti

Il vecchio tragitto di Aralia verso il laboratorio e i percorsi generici dei due amici vengono aggiornati dalla posizione salvata, senza spostare il corpo di colpo. Per Komor/Belle si considera anche se il confronto è già terminato. I nuovi viaggi salvano l’indice del percorso e riprendono da quel punto. Se Aralia era già stata rimossa da una vecchia versione, la sua attesa davanti al Centro viene ripristinata al caricamento del campo, usando la posizione originale dell’evento.

La vecchia destinazione descritta in `ROUTE-BATTLES-034.md` è storica ed è superata da questa revisione.

## Interazione con l’infermiera

Il bersaglio dell’interazione ora considera una seconda casella soltanto quando quella immediatamente davanti è un bancone (comportamento0xD4 nei dati IRBI). Il controllo utilizza la posizione del personaggio effettivamente mostrato: niente interazioni con una copia logica ancora lontana dalla sua destinazione. Rimangono esclusi bersagli diagonali, troppo lontani e interazioni attraverso normali muri o pavimento.

Si continua a usare A/interazione dal pavimento davanti al bancone. L’infermiera ripristina PS, PP e stati alterati; la prima cura prosegue il tour, le visite successive consentono cure ripetute. Rispondere NO lascia invariata la squadra e libera i comandi.

## Verifiche

- Unit test di itinerari, salvataggi precedenti, attese, ripresa, assenza di rimozione all’arrivo e percorso intorno agli ostacoli.
- `check-accumula-runtime.cjs`: arrivi reali sulle mappe estratte, unicità degli attori, confine fra mappe, ricarica e interazione con Aralia; infermiera prima/dopo il tour, PS/PP/stati, ricarica e visite ripetute a×1/×2/×4; rifiuto e bersagli non validi.
- Fixture browser: tutorial originale, viaggi dei tre personaggi nel renderer reale, adozione al confine e due cure premendo il vero pulsante A/touch. Galleria con proporzioni delle immagini conservate.
- Suite di regressione precedente obbligatoria: storia,20 transizioni nuove e14 originarie, menu, salvataggi,83 animazioni,166 percorsi dei log di lotta, rendering e recupero GPU.

I rapporti locali della build consegnata distinguono verifiche concluse da controlli non eseguiti. Non certificano assenza assoluta di bug o tutte le GPU Android fisiche.
