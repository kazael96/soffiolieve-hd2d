/* Surf: authored body scores, not cadence variants of a shared paddle.
 * Every phase is a normalized, ordered sequence; world height, immersion,
 * rider contact and recall remain the responsibility of FieldHMWorld.
 * Arguments below are time, lean(rad), head, arms, feet, tail, crouch.
 * Zero loop boundaries also provide a stable pose for boarding/recall. */
(function(root){
 const k=(t,lean=0,head=0,arms=0,feet=0,tail=0,crouch=0,extra={})=>[t,{lean,head,arms,feet,tail,crouch,...extra}];
 const scores={
  '501':{
   id:'oshawott-shell-check-webbed-kick',title:'Conchiglia e gambata',
   beats:['Controlla la conchiglia prima di aprire le zampe anteriori','Raccoglie acqua con due remate corte e ferma le mani al ventre','Spinge con i piedi palmati e distende la coda nella scivolata','Offre il dorso abbassandosi; alla riva frena di coda e pianta i piedi'],
   swim:[k(0),k(.12,-.04,-.12,.2,0,.15),k(.26,-.07,.08,.85,-.1,.12),k(.38,-.02,.04,-.35,0,-.15),k(.49,-.055,.06,.65,0,.15),k(.62,.02,-.04,.05,.85,-.2),k(.76,.035,-.08,-.1,-.3,.4),k(.9,.01,0,0,0,.2),k(1)],
   idle:[k(0),k(.18,0,-.12,.15),k(.4,0,.09,-.1,0,.2),k(.62,.015,-.06,.08,.12,-.15),k(.81,0,0,0,0,.12),k(1)],
   board:[k(0),k(.16,0,.13,.2,0,0,.07),k(.34,-.035,.06,.65,-.2,.2,.14),k(.56,-.02,-.1,-.2,.45,-.15,.08),k(.78,.02,-.06,.1,.1,.18,.025),k(1)],
   land:[k(0),k(.16,.04,-.06,.12,0,-.55),k(.34,.025,.08,-.1,.6,-.25,.045),k(.52,-.015,.05,.55,.2,.12,.1),k(.76,0,-.14,.1,-.08,0,.04),k(1)]
  },
  '502':{
   id:'dewott-hind-kick-crossed-scull',title:'Remata incrociata',
   beats:['Piega i piedi e assesta una gambata prima della presa','Apre le braccia, incrocia la raccolta e ruota il busto','La coda arresta la torsione mentre le zampe tornano in avanti','Sale raccogliendo il busto; sbarca aprendo una mano di appoggio'],
   swim:[k(0),k(.12,.025,-.08,-.15,-.65,.15,.03),k(.25,-.03,0,.2,.9,-.15),k(.4,-.08,.12,1.15,.1,.35),k(.53,.085,-.08,-.85,0,-.8),k(.67,.035,-.02,-.25,-.15,-.4),k(.84,0,.04,.35,.1,.2),k(1)],
   idle:[k(0),k(.18,-.02,.08,-.2,0,.15),k(.37,.025,-.1,.22,0,-.22),k(.59,0,-.04,.05,.18,.12),k(.8,0,.05,-.05,-.05,0),k(1)],
   board:[k(0),k(.13,.025,-.1,-.35,-.15),k(.31,-.04,.05,.6,-.35,.35,.13),k(.5,.045,.03,-.55,.55,-.4,.08),k(.72,-.015,-.08,.22,.1,.12,.03),k(1)],
   land:[k(0),k(.15,-.03,.06,-.55,-.3,.35),k(.32,.05,-.1,.6,.15,-.6),k(.55,.015,.02,.9,.65,-.15,.07),k(.77,-.02,.12,.2,.1,.12,.04),k(1)]
  },
  '503':{
   id:'samurott-armored-foreleg-keel',title:'Chiglia corazzata',
   beats:['Abbassa il muso e allunga gli arti anteriori sotto la corazza','Compie una sola trazione profonda, con la coda tenuta a chiglia','Raccoglie gli arti e solleva il capo durante la lunga planata','Flette le spalle per la salita; alla riva apre gli arti prima di rialzare il capo'],
   swim:[k(0),k(.14,-.045,.18,-.55,0,-.12,.025),k(.29,-.07,.08,1.3,0,-.3),k(.44,-.04,-.06,.8,0,.1),k(.58,.015,-.24,-.2,0,.4),k(.75,.01,-.12,-.1,0,.18),k(.9,0,-.04,.1,0,.04),k(1)],
   idle:[k(0),k(.21,0,-.18,.08,0,.15),k(.43,-.015,.06,.2,0,-.15),k(.62,.015,-.08,-.15,0,.1),k(.83,0,-.03,0,0,.04),k(1)],
   board:[k(0),k(.16,-.025,.16,.35,0,.08,.07),k(.36,-.055,.1,.8,0,-.15,.18),k(.54,-.03,-.12,.45,0,.2,.12),k(.78,0,-.1,-.1,0,.1,.035),k(1)],
   land:[k(0),k(.18,.025,-.1,-.2,0,-.45),k(.34,-.045,.12,.95,0,-.15,.04),k(.53,-.025,.2,.55,0,.05,.13),k(.77,.015,-.18,.1,0,.15,.04),k(1)]
  },
  '507':{
   id:'herdier-beard-clear-dog-paddle',title:'Zampata e baffi',
   beats:['Le zampe anteriori remano in opposizione alla diagonale posteriore','Dopo due appoggi alza il muso per tenere i baffi fuori acqua','La coda corregge il rollio e segue una breve raccolta delle zampe','Flette le zampe per accogliere il cavaliere e cerca il fondo con una zampa'],
   swim:[k(0),k(.12,-.025,.04,-.65,.7,.2),k(.25,.025,.08,.8,-.8,-.25),k(.37,-.035,-.24,-.45,.55,.25),k(.51,.035,-.14,.65,-.65,-.2),k(.66,0,-.05,.15,-.15,.45,.025),k(.84,-.01,.04,-.12,.2,.12),k(1)],
   idle:[k(0),k(.19,0,-.16,-.08,.1,.25),k(.37,.015,-.08,.12,-.12,-.2),k(.56,0,.06,-.1,.16,.1),k(.78,0,-.03,.04,0,.18),k(1)],
   board:[k(0),k(.16,-.02,.06,-.2,-.25,.15,.06),k(.35,-.035,.1,.35,.15,-.2,.17),k(.54,.02,-.2,.6,.45,.3,.09),k(.78,0,-.08,-.08,-.1,.15,.03),k(1)],
   land:[k(0),k(.15,.025,-.08,-.25,-.55,-.35),k(.32,-.025,.12,.75,.65,.15,.035),k(.53,-.04,.06,-.15,-.2,0,.14),k(.76,0,-.16,.12,.12,.22,.035),k(1)]
  },
  '508':{
   id:'stoutland-chest-drive-moustache-shake',title:'Petto controcorrente',
   beats:['Raccoglie le zampe sotto il petto prima di una spinta lunga','Mantiene la testa alta mentre la coda fa da timone','Lascia scorrere il corpo e scuote i baffi solo a fine spinta','Si accovaccia sul dorso per la salita; sbarca distribuendo il peso sulle zampe'],
   swim:[k(0),k(.14,.025,-.2,-.6,-.65,.2,.035),k(.31,-.04,-.15,1.05,.95,-.35),k(.49,-.025,-.1,.35,.2,.55),k(.64,.015,.17,-.2,-.1,.15),k(.73,-.025,-.17,.1,.1,-.2),k(.86,.01,-.08,.04,0,.2),k(1)],
   idle:[k(0),k(.2,.01,-.12,-.1,-.08,.15),k(.44,-.015,-.06,.18,.12,-.1,.025),k(.62,0,.13,.05,0,.25),k(.75,0,-.11,-.05,0,.12),k(1)],
   board:[k(0),k(.14,0,-.08,-.35,-.4,.12,.05),k(.33,-.035,.04,.3,.15,-.15,.22),k(.57,-.015,-.16,.65,.35,.25,.16),k(.8,.01,-.08,.1,.1,.12,.045),k(1)],
   land:[k(0),k(.17,.035,-.18,-.45,-.3,-.55),k(.36,-.02,-.06,.95,.85,-.12,.025),k(.54,.02,.12,-.2,-.35,.18,.16),k(.77,0,-.1,.2,.15,.08,.04),k(1)]
  },
  '515':{
   id:'panpour-tail-anchor-cupped-scoop',title:'Coda ad ancora',
   beats:['Piega la coda sotto il corpo per stabilizzare il dorso','Raccoglie le mani a coppa e allarga i piedi','Lancia le mani in avanti, richiude le gambe e libera la coda','Invita alla salita con un piccolo inchino e offre una mano alla riva'],
   swim:[k(0),k(.12,.035,-.06,-.25,0,-1),k(.27,-.035,.1,.75,-.35,-.55,.04),k(.42,-.065,.04,1.05,.8,-.1),k(.57,.03,-.12,-.65,.35,.75),k(.73,.015,-.04,-.1,-.25,.4),k(.88,0,.03,.15,0,.1),k(1)],
   idle:[k(0),k(.16,0,.08,.2,0,-.35),k(.37,.025,-.07,-.2,.15,.4),k(.58,-.015,-.1,.15,0,-.15),k(.8,0,.02,0,-.08,.15),k(1)],
   board:[k(0),k(.14,.025,.12,-.15,0,-.65),k(.33,-.04,.14,.5,-.25,-.2,.16),k(.53,-.025,-.08,.2,.45,.45,.1),k(.76,.02,-.06,-.2,.08,.15,.03),k(1)],
   land:[k(0),k(.15,.045,-.05,-.4,0,-.8),k(.35,-.03,.08,.45,.55,-.25,.05),k(.54,-.015,-.12,1,.15,.2,.12),k(.78,.015,.06,.25,-.1,.1,.025),k(1)]
  },
  '516':{
   id:'simipour-reverse-scull-hair-check',title:'Richiamo a ventaglio',
   beats:['Estende le mani lateralmente e raccoglie entrambe le ginocchia','Esegue una remata all’indietro con il busto aperto','La coda recupera la linea prima che il capo liberi il ciuffo','Stabilizza la salita con due appoggi; alla riva chiude la remata e si china'],
   swim:[k(0),k(.13,-.025,-.08,-.8,0,.25),k(.27,.045,.06,-1.2,-.75,-.15,.035),k(.43,.07,-.1,.8,.85,.45),k(.58,-.025,-.06,.35,.15,-.8),k(.72,.015,.2,-.15,-.1,-.25),k(.84,-.015,-.12,.05,0,.2),k(1)],
   idle:[k(0),k(.18,-.015,-.06,-.35,.1,.3),k(.39,.025,.1,.18,0,-.3),k(.6,0,-.16,-.05,-.08,.45),k(.81,0,-.03,.08,0,.12),k(1)],
   board:[k(0),k(.16,-.025,-.1,-.65,.1,.4),k(.35,.04,.08,.65,-.4,-.3,.14),k(.55,.015,-.06,-.3,.55,.25,.1),k(.77,-.01,.03,.15,.05,.1,.025),k(1)],
   land:[k(0),k(.17,-.03,.08,-.85,-.1,.55),k(.34,.045,-.12,.9,.55,-.25),k(.52,.02,.15,.3,.12,-.1,.14),k(.75,-.015,-.05,-.1,-.1,.15,.035),k(1)]
  },
  '531':{
   id:'audino-listening-palms-breaststroke',title:'Ascolto e palmi',
   beats:['Inclina il capo in ascolto prima di riunire i palmi','Allarga le mani, chiude la remata e distende i piedi','Riallinea il capo dopo la scivolata, con la piccola coda quieta','Si abbassa per il cavaliere e alla riva prima offre il palmo, poi rialza il busto'],
   swim:[k(0),k(.14,.015,-.23,.2,-.1),k(.29,-.035,.05,-.8,-.35,0,.035),k(.46,-.055,.03,1.05,.15),k(.6,.02,-.08,.25,.65),k(.75,.015,.16,-.1,-.15),k(.89,0,-.06,.08),k(1)],
   idle:[k(0),k(.17,.01,-.24,.12),k(.39,-.015,.18,-.1,.06),k(.6,.01,-.1,.2,-.08,0,.025),k(.82,0,.03,0,.02),k(1)],
   board:[k(0),k(.17,0,-.17,.35,-.1),k(.36,-.025,.08,-.25,-.15,0,.18),k(.54,-.02,-.1,.65,.25,0,.12),k(.78,.01,.04,.1,.05,0,.035),k(1)],
   land:[k(0),k(.17,.02,-.12,-.45,-.2),k(.35,-.025,-.08,.8,.3,0,.04),k(.54,-.035,.14,.45,.12,0,.16),k(.78,.015,-.16,.12,-.05,0,.035),k(1)]
  },
  '535':{
   id:'tympole-coiled-tail-double-flick',title:'Virgola e doppio colpo',
   beats:['Curva la coda a virgola mantenendo il corpo raccolto','Compie due colpi caudali separati da un ritorno morbido','Raddrizza il corpo e lascia scorrere la pinna senza zampe','Per la salita curva la coda contro il rollio; in arrivo la apre per frenare'],
   swim:[k(0),k(.13,.045,0,0,0,-1.1,.025),k(.27,-.07,0,0,0,1.5),k(.41,.02,0,0,0,.15),k(.53,.065,0,0,0,-.8),k(.64,-.045,0,0,0,1.1),k(.8,-.01,0,0,0,.35),k(1)],
   idle:[k(0),k(.2,.025,0,0,0,-.4),k(.42,-.02,0,0,0,.3),k(.61,.01,0,0,0,.1,.02),k(.81,-.015,0,0,0,-.12),k(1)],
   board:[k(0),k(.15,.035,0,0,0,-.7),k(.34,-.045,0,0,0,.65,.055),k(.54,.025,0,0,0,-.4,.035),k(.78,0,0,0,0,.2,.01),k(1)],
   land:[k(0),k(.17,-.035,0,0,0,.9),k(.35,.055,0,0,0,-1.2,.02),k(.55,-.02,0,0,0,-.3,.06),k(.77,.01,0,0,0,.15,.02),k(1)]
  },
  '536':{
   id:'palpitoad-bellied-foot-spring',title:'Spinta dei piedi uniti',
   beats:['Raccoglie insieme i due piedi sotto il ventre senza simulare braccia','Distende la coppia di piedi, comprime il corpo e ripete una spinta più corta','La coda corregge il secondo impulso prima della distensione','Accoglie il peso piegando i piedi insieme; cerca il fondo con il ventre ancora basso'],
   swim:[k(0),k(.13,.025,0,0,-.75,.2,.09),k(.28,-.055,0,0,.95,-.2,.015),k(.42,.035,0,0,-.45,-.3,.055),k(.55,-.03,0,0,.65,.7),k(.71,.01,0,0,.15,-.4),k(.87,0,0,0,-.08,.15),k(1)],
   idle:[k(0),k(.18,.015,0,0,-.2,.15,.035),k(.39,-.02,0,0,.3,-.25),k(.6,0,0,0,-.1,.35,.025),k(.81,0,0,0,.08,.1),k(1)],
   board:[k(0),k(.15,.02,0,0,-.6,-.15,.08),k(.35,-.03,0,0,.25,.4,.21),k(.55,.015,0,0,.55,-.3,.1),k(.78,0,0,0,-.08,.12,.025),k(1)],
   land:[k(0),k(.17,.035,0,0,-.35,-.65),k(.35,-.04,0,0,.85,.2,.04),k(.54,.02,0,0,-.4,-.15,.18),k(.76,-.01,0,0,.2,.1,.04),k(1)]
  },
  '537':{
   id:'seismitoad-wide-catch-frog-whip',title:'Presa larga e frustata',
   beats:['Apre gli avambracci mentre ripiega le ginocchia','Chiude la presa larga e solo dopo frusta l’acqua con i piedi','Allunga le braccia in scivolata, poi rialza il capo','Offre un dorso fermo raccolto sulle ginocchia e scarica il peso sugli arti alla riva'],
   swim:[k(0),k(.14,.025,-.12,-.95,-.55,0,.065),k(.3,-.045,.08,1.2,-.2),k(.46,-.075,.06,.45,.95),k(.59,.01,-.16,-.55,.3),k(.74,.025,-.08,-.25,-.1),k(.88,0,.04,.1,.05),k(1)],
   idle:[k(0),k(.2,.015,-.08,-.3,-.12,0,.035),k(.42,-.015,.06,.35,.15),k(.62,.01,-.14,.1,-.08,0,.025),k(.82,0,-.03,-.05,.02),k(1)],
   board:[k(0),k(.15,.02,-.08,-.55,-.5,0,.08),k(.36,-.035,.08,.65,-.2,0,.24),k(.56,-.02,-.1,.25,.55,0,.14),k(.79,.01,-.04,-.15,.12,0,.035),k(1)],
   land:[k(0),k(.16,.025,-.15,-.8,-.35),k(.34,-.045,.1,.9,.85,0,.035),k(.55,-.015,.06,.4,-.1,0,.2),k(.77,.01,-.12,.1,.2,0,.045),k(1)]
  },
  '550':{
   id:'basculin-red-sawtooth-tail-break',title:'Doppio scatto rosso',
   beats:['Stringe le pinne e piega la coda nel verso opposto al muso','Assesta due inversioni caudali nette con un arresto intermedio','Apre le pinne per frenare prima del successivo scatto','Blocca il rollio con una pinna alla salita e frena con la coda alla riva'],
   swim:[k(0),k(.1,.055,.08,-.3,0,-.9),k(.22,-.07,-.05,.2,0,1.55),k(.34,-.025,0,.05,0,.3),k(.47,.075,.12,-.2,0,-1.45),k(.61,-.04,-.08,.4,0,.8),k(.8,.015,0,-.15,0,-.2),k(1)],
   idle:[k(0),k(.18,.02,.03,-.15,0,-.35),k(.35,-.025,-.02,.3,0,.5),k(.57,.01,0,.05,0,-.15),k(.8,-.01,.02,-.1,0,.15),k(1)],
   board:[k(0),k(.14,.04,.08,-.45,0,-.6),k(.33,-.06,-.04,.6,0,.85,.035),k(.53,.025,.02,.2,0,-.4,.02),k(.77,-.01,0,-.1,0,.2),k(1)],
   land:[k(0),k(.15,-.035,.04,.4,0,.6),k(.33,.07,-.08,-.55,0,-1.2),k(.54,-.025,.06,.65,0,.35,.025),k(.78,.01,0,.1,0,-.12),k(1)]
  },
  '699':{
   id:'basculin-blue-leading-head-sweep',title:'Serpentina blu',
   beats:['Porta il muso nella curva e apre una pinna prima della coda','Propaga una lunga curva a S dal busto alla pinna caudale','Lascia distendere la coda, poi esegue una sola controcurva di ritorno','Accompagna il cavaliere con una controsterzata lenta, richiamando prima le pinne alla riva'],
   swim:[k(0),k(.13,-.035,-.18,.45,0,.15),k(.29,-.07,-.04,.15,0,-1.25),k(.44,-.015,.08,-.2,0,-.65),k(.6,.065,.14,.25,0,1.35),k(.75,.025,-.05,.5,0,.45),k(.89,-.01,0,.1,0,-.15),k(1)],
   idle:[k(0),k(.21,-.02,-.08,.3,0,.12),k(.43,.025,.04,-.15,0,-.45),k(.66,.01,0,.2,0,.35),k(.84,-.005,-.02,.08,0,.08),k(1)],
   board:[k(0),k(.17,-.035,-.12,.5,0,.2),k(.36,.045,.04,.1,0,-.75,.035),k(.57,.025,-.04,-.25,0,.55,.02),k(.79,-.01,.02,.18,0,.15),k(1)],
   land:[k(0),k(.18,-.025,-.12,-.35,0,.15),k(.38,.05,.08,.65,0,-.8),k(.58,-.03,-.04,.3,0,.7,.025),k(.8,.01,.02,-.08,0,.2),k(1)]
  },
  '564':{
   id:'tirtouga-flipper-fan-shell-glide',title:'Ventaglio di pinne',
   beats:['Allarga le pinne anteriori e ritira il capo verso il guscio','Tira le pinne sotto la corazza mentre i piedi si raccolgono','Distende il capo e apre le pinne posteriori nella planata','Inclina appena il guscio per la salita; alla riva allarga le pinne prima dell’appoggio'],
   swim:[k(0),k(.14,.015,.2,-1.1,-.15),k(.31,-.045,.12,1.2,-.55,0,.035),k(.47,-.03,-.1,.55,.7),k(.61,.02,-.18,-.2,.25),k(.77,.01,-.08,-.45,-.1),k(.89,0,0,.1,.05),k(1)],
   idle:[k(0),k(.18,.01,.1,-.25,.12),k(.4,-.015,.16,.35,-.1,0,.025),k(.63,.01,-.12,.1,.16),k(.82,0,-.03,-.08,.04),k(1)],
   board:[k(0),k(.17,.02,.12,-.6,-.15),k(.36,-.035,.2,.8,-.3,0,.1),k(.56,-.015,-.05,.4,.45,0,.065),k(.79,.01,-.1,-.15,.1,0,.02),k(1)],
   land:[k(0),k(.17,.025,-.05,-.95,-.2),k(.36,-.03,.12,.5,.65,0,.035),k(.56,-.015,.2,.2,-.15,0,.09),k(.78,.01,-.12,-.15,.2,0,.025),k(1)]
  },
  '565':{
   id:'carracosta-rear-drive-armored-backstroke',title:'Spinta dalla corazza',
   beats:['Raccoglie i piedi contro la corazza, poi li distende per primi','Segue una larga rotazione delle pinne anteriori','Il capo si allunga nella pausa e le pinne restano a timone','Abbassa le spalle per l’imbarco e alla riva appoggia prima le pinne anteriori'],
   swim:[k(0),k(.13,.025,.06,.15,-.8,0,.045),k(.29,-.045,.02,-.35,.95),k(.45,.035,-.12,-1.25,.15),k(.58,-.035,.08,1,.05),k(.73,.015,-.2,.3,-.1),k(.88,0,-.06,-.15,.05),k(1)],
   idle:[k(0),k(.22,-.015,-.08,-.35,.15),k(.43,.02,.12,.25,-.12,0,.02),k(.64,0,-.16,.05,.1),k(.84,0,-.04,-.12),k(1)],
   board:[k(0),k(.16,.02,.08,.25,-.4),k(.34,-.04,.15,-.6,-.2,0,.15),k(.55,-.02,-.1,.85,.4,0,.1),k(.78,.01,-.08,.15,.1,0,.025),k(1)],
   land:[k(0),k(.16,.025,-.12,-.7,.15),k(.35,-.045,.08,1.2,-.3,0,.035),k(.54,-.025,.18,.45,.65,0,.14),k(.77,.01,-.14,-.1,.12,0,.035),k(1)]
  },
  '580':{
   id:'ducklett-bill-dip-webbed-tread',title:'Becco e piedi palmati',
   beats:['Abbassa il becco e stringe le ali al corpo','Alterna due colpi dei piedi palmati, mantenendo le ali quasi ferme','Solleva il becco e allarga appena un’ala per ritrovare equilibrio','Si raccoglie per la salita e alla riva cerca l’appoggio con i piedi prima di raddrizzarsi'],
   swim:[k(0),k(.12,.02,.3,-.12,-.15),k(.28,-.025,.14,.08,.85),k(.43,.025,-.1,.05,-.75),k(.59,-.02,-.24,-.2,.55),k(.73,.015,-.08,.4,-.2),k(.88,0,.04,.08,.05),k(1)],
   idle:[k(0),k(.18,.01,.2,-.12,.12),k(.4,-.01,-.2,.1,-.18),k(.63,.015,-.05,.25,.08),k(.82,0,.04,.04,-.04),k(1)],
   board:[k(0),k(.16,.025,.16,-.2,-.35,0,.04),k(.35,-.03,.05,.5,.2,0,.13),k(.56,.015,-.2,-.1,.55,0,.07),k(.78,0,-.06,.15,-.1,0,.02),k(1)],
   land:[k(0),k(.17,.025,-.15,.25,-.4),k(.35,-.02,.16,-.1,.8,0,.04),k(.54,-.035,.08,.55,.25,0,.12),k(.77,.01,-.22,.1,-.05,0,.03),k(1)]
  },
  '581':{
   id:'swanna-neck-arc-deep-oar',title:'Collo ad arco',
   beats:['Disegna un arco con il collo prima di allargare le ali a bilanciere','Compie una remata profonda dei piedi e richiude lentamente le ali','Tiene il collo disteso durante la lunga deriva, con una piccola correzione di coda','Abbassa il collo durante la salita e apre le ali per proteggere la discesa'],
   swim:[k(0),k(.15,.015,.4,-.15,-.3,.1),k(.31,-.02,-.2,.65,-.7,-.1),k(.47,-.035,-.35,.35,.85,.2),k(.62,.01,-.18,-.15,.2,-.35),k(.78,0,-.12,-.05,-.08,.15),k(.9,0,-.04,.04,.03,.05),k(1)],
   idle:[k(0),k(.21,.01,.28,.08,.08),k(.44,-.01,-.22,.18,-.12,.12),k(.65,.01,-.1,-.15,.06,-.1),k(.84,0,-.03,.04,0,.04),k(1)],
   board:[k(0),k(.17,.015,.35,.4,-.2),k(.36,-.025,.18,.65,.25,0,.12),k(.57,-.015,-.25,.2,.35,.2,.075),k(.79,.005,-.08,-.05,.05,.08,.02),k(1)],
   land:[k(0),k(.18,.02,-.2,.3,-.25,-.2),k(.36,-.025,.25,.9,.6,.15,.035),k(.57,-.015,.15,.55,.25,-.1,.11),k(.8,.005,-.3,.12,.05,.04,.025),k(1)]
  },
  '592':{
   id:'frillish-male-open-bell-tentacle-snap',title:'Campana e frusta',
   beats:['Apre i tentacoli laterali prima di raccogliere quelli inferiori','Comprime la campana e richiude di scatto i tentacoli','Allarga la corona, poi lascia distendere la frangia nella deriva','Avvolge il peso con i tentacoli in salita e si apre a ombrello alla riva'],
   swim:[k(0),k(.14,.015,-.08,-1,0,.15),k(.3,-.015,.12,-.35,0,-.9,.09),k(.43,-.025,.18,1.25,0,.8,.14),k(.57,.015,-.2,.35,0,.45,.035),k(.74,.01,-.08,-.55,0,-.2),k(.9,0,0,-.12,0,.1),k(1)],
   idle:[k(0),k(.19,.01,-.08,-.35,0,.2),k(.4,-.01,.1,.3,0,-.3,.04),k(.62,.005,-.05,-.1,0,.25,.015),k(.82,0,-.02,.1,0,.05),k(1)],
   board:[k(0),k(.16,.015,-.05,-.75,0,.2),k(.35,-.015,.1,.65,0,-.45,.13),k(.56,-.01,-.12,.4,0,.35,.08),k(.78,.005,-.04,-.15,0,.12,.02),k(1)],
   land:[k(0),k(.16,.02,.1,.35,0,-.65,.025),k(.35,-.02,-.1,-1.1,0,.5,.06),k(.55,-.01,.08,.5,0,.2,.12),k(.78,.005,-.08,.1,0,-.1,.03),k(1)]
  },
  '592-female':{
   id:'frillish-female-skirt-crown-double-fold',title:'Gonna e corona',
   beats:['Fa fiorire prima la frangia inferiore e soltanto dopo le braccia','Inclina la corona mentre richiude i tentacoli verso la campana','Segue una seconda piccola contrazione che libera la gonna','Apre la frangia per accogliere il cavaliere e la raccoglie dopo la discesa'],
   swim:[k(0),k(.13,.02,.04,.1,0,-1),k(.29,-.015,-.18,-.9,0,-.25,.035),k(.43,.025,.15,.85,0,.55,.11),k(.58,-.01,-.08,.2,0,-.45,.025),k(.71,.01,.06,.55,0,.8,.065),k(.86,0,-.08,-.25,0,.2),k(1)],
   idle:[k(0),k(.17,.01,.05,.08,0,-.45),k(.38,-.015,-.14,-.3,0,.25),k(.61,.01,.08,.4,0,.15,.035),k(.83,0,-.05,-.08,0,-.12),k(1)],
   board:[k(0),k(.17,.015,.05,.1,0,-.75),k(.36,-.02,-.15,-.6,0,.35,.08),k(.56,.015,.1,.75,0,.2,.12),k(.79,0,-.08,.1,0,-.1,.025),k(1)],
   land:[k(0),k(.17,.015,-.12,-.4,0,.65),k(.36,-.02,.1,.25,0,-1,.04),k(.56,.01,-.08,.85,0,.25,.1),k(.79,0,.04,-.15,0,.1,.025),k(1)]
  },
  '593':{
   id:'jellicent-male-crown-press-grand-pulse',title:'Pressa regale',
   beats:['Porta avanti la corona e raccoglie i tentacoli sotto la massa','Apre le braccia, comprime la campana e chiude una spinta ampia','I tentacoli inferiori seguono con ritardo mentre la corona si raddrizza','Offre una campana larga per la salita e frena con un’apertura piena alla riva'],
   swim:[k(0),k(.15,-.025,.22,.2,0,-.65,.035),k(.32,.02,.1,-1.2,0,-.2,.06),k(.48,-.035,.16,1.35,0,.3,.18),k(.61,.015,-.18,.6,0,1.1,.075),k(.77,.01,-.1,-.25,0,.35,.015),k(.9,0,-.02,-.08,0,.1),k(1)],
   idle:[k(0),k(.22,-.01,.12,.15,0,-.25,.025),k(.44,.015,-.1,-.45,0,.3),k(.65,-.005,.06,.3,0,.1,.045),k(.84,0,-.04,.05,0,-.08),k(1)],
   board:[k(0),k(.17,-.015,.12,-.6,0,-.2,.045),k(.37,.02,.08,.75,0,-.45,.18),k(.57,-.015,-.15,.5,0,.6,.12),k(.8,0,-.05,-.1,0,.15,.035),k(1)],
   land:[k(0),k(.18,-.02,.1,.35,0,-.8,.025),k(.38,.025,-.12,-1.25,0,.55,.08),k(.58,-.015,.14,.65,0,.25,.16),k(.8,0,-.08,.15,0,-.1,.04),k(1)]
  },
  '593-female':{
   id:'jellicent-female-ruff-ripple-curtsey',title:'Increspatura del collare',
   beats:['Inclina il capo e fa risalire la frangia prima dell’apertura laterale','Esegue una contrazione breve seguita da una remata della gonna','Riapre il collare e compie un secondo richiamo delle braccia','Si raccoglie in un inchino per la salita e sostiene la discesa con il collare aperto'],
   swim:[k(0),k(.12,.025,-.18,.15,0,-.85),k(.27,-.015,.1,-.45,0,.5,.08),k(.41,.015,-.08,.85,0,.9,.04),k(.56,-.025,.16,-.9,0,-.2,.13),k(.7,.02,-.12,.6,0,.35,.055),k(.85,.005,-.04,-.15,0,.15),k(1)],
   idle:[k(0),k(.18,.015,-.14,.1,0,-.3),k(.4,-.015,.08,-.4,0,.4,.025),k(.62,.01,-.06,.35,0,-.1,.04),k(.83,0,.02,.05,0,.15),k(1)],
   board:[k(0),k(.16,.02,-.15,.2,0,-.65),k(.35,-.025,.12,-.75,0,.35,.14),k(.56,.015,-.08,.85,0,.5,.09),k(.79,0,-.04,.15,0,-.1,.025),k(1)],
   land:[k(0),k(.14,.02,.1,.15,0,-.55),k(.32,-.025,-.15,-.65,0,.8,.045),k(.51,.015,.1,1,0,.35,.14),k(.7,-.01,-.1,-.2,0,-.25,.075),k(.85,0,-.03,.1,0,.1,.02),k(1)]
  },
  '594':{
   id:'alomomola-fin-cup-heart-tail-roll',title:'Coppa di pinne',
   beats:['Riunisce le grandi pinne prima di aprirle a ventaglio','La coda compie un’ampia spazzata mentre le pinne tengono la presa','Richiude le pinne e accompagna una controcurva caudale più corta','Offre le pinne come stabilizzatori alla salita e le riunisce dopo la discesa'],
   swim:[k(0),k(.14,.02,0,.8,0,-.15),k(.29,-.035,0,-1.1,0,-.35),k(.44,-.065,0,-.45,0,1.5),k(.59,.015,0,.95,0,.45),k(.73,.04,0,.25,0,-.85),k(.88,.005,0,-.15,0,-.2),k(1)],
   idle:[k(0),k(.2,.015,0,.35,0,-.2),k(.43,-.02,0,-.45,0,.4),k(.65,.01,0,.2,0,-.1),k(.84,0,0,-.1,0,.12),k(1)],
   board:[k(0),k(.17,.02,0,.55,0,-.25),k(.36,-.035,0,-.85,0,.5,.045),k(.57,.02,0,.4,0,-.3,.025),k(.79,0,0,.1,0,.15),k(1)],
   land:[k(0),k(.17,.03,0,-.65,0,-.45),k(.36,-.045,0,.25,0,1,.025),k(.57,.02,0,.9,0,-.35,.045),k(.79,0,0,.15,0,.1,.01),k(1)]
  },
  '612':{
   id:'haxorus-keel-tail-tusk-clearance',title:'Timone e zanne alte',
   beats:['Porta la coda a timone e tiene le zanne lontane dall’acqua','Compie una presa corta degli artigli seguita dalla spinta delle gambe','Raccoglie gli arti mentre la coda corregge il lato opposto','Abbassa il bacino per la salita e alla riva prima cerca il fondo, poi raddrizza le zanne'],
   swim:[k(0),k(.13,.035,-.16,-.15,-.25,-1),k(.29,-.045,-.12,.9,-.45,-.35,.035),k(.44,-.065,-.08,.3,.95,.25),k(.59,.035,.08,-.2,.15,.95),k(.74,.015,-.18,.1,-.15,.35),k(.88,0,-.06,0,.05,-.1),k(1)],
   idle:[k(0),k(.19,.015,-.16,.08,-.12,-.25),k(.41,-.02,.05,-.15,.15,.4),k(.64,.01,-.1,.2,.05,-.15),k(.84,0,-.03,.05,0,.1),k(1)],
   board:[k(0),k(.16,.025,-.18,-.2,-.35,-.5),k(.35,-.04,-.05,.6,.1,.35,.2),k(.56,-.02,.08,.25,.55,-.25,.12),k(.79,.01,-.12,-.05,.1,.12,.035),k(1)],
   land:[k(0),k(.17,.035,-.15,-.3,-.2,-.85),k(.35,-.045,-.05,.4,.85,.25,.04),k(.55,-.02,.16,.8,.15,-.15,.17),k(.78,.01,-.2,.15,.1,.1,.04),k(1)]
  },
  '613':{
   id:'cubchoo-nose-up-hesitant-forepaws',title:'Nasino fuori acqua',
   beats:['Solleva il naso prima di allungare timidamente le zampe anteriori','Compie due prese piccole con una pausa per recuperare il fiato','Solo dopo scalcia con i piedi e raccoglie le zampe al petto','Si accuccia per accogliere il peso e alla riva tende una zampa prima di poggiare i piedi'],
   swim:[k(0),k(.12,.015,-.3,.15,-.1),k(.27,-.035,-.18,.65,.15),k(.4,.01,-.12,-.2,-.1),k(.53,-.025,-.16,.5,.25),k(.67,.025,-.08,.1,.8),k(.82,.01,-.2,-.25,-.2),k(1)],
   idle:[k(0),k(.18,.005,-.25,.12,.06),k(.4,-.01,-.08,.2,-.1,0,.025),k(.62,.01,.08,-.12,.15),k(.82,0,-.12,.05,.03),k(1)],
   board:[k(0),k(.17,.015,-.22,.25,-.15),k(.36,-.025,.04,.5,-.2,0,.18),k(.56,.01,-.2,-.15,.4,0,.1),k(.79,0,-.08,.1,.08,0,.025),k(1)],
   land:[k(0),k(.17,.02,-.22,-.2,-.3),k(.35,-.025,-.1,.75,.1),k(.55,-.035,.08,.25,.7,0,.17),k(.78,.01,-.24,.1,.05,0,.04),k(1)]
  },
  '614':{
   id:'beartic-deep-forearm-pull-hind-tuck',title:'Bracciata polare',
   beats:['Apre gli avambracci in una grande presa con il muso alto','Tira l’acqua sotto il petto e raccoglie le zampe posteriori','Una gambata lenta conclude la spinta prima del controllo del capo','Accoglie il cavaliere abbassando le spalle e alla riva pianta gli arti con una presa larga'],
   swim:[k(0),k(.15,-.025,-.2,-1.1,-.1),k(.31,-.06,-.16,1.55,-.25,0,.035),k(.47,-.03,-.1,.8,-.75),k(.62,.025,-.06,-.15,.85),k(.76,.01,.16,-.1,.15),k(.89,0,-.12,.05,-.08),k(1)],
   idle:[k(0),k(.14,0,-.18),k(.32,-.015,-.08,.35,-.2),k(.5,.015,-.12,-.25,.15,0,.025),k(.68,-.005,.1,.1,-.05),k(.84,0,-.06,.04),k(1)],
   board:[k(0),k(.17,-.02,-.12,-.55,-.15),k(.36,-.045,.08,.8,-.3,0,.22),k(.57,-.02,-.16,.45,.45,0,.15),k(.79,.01,-.06,-.1,.12,0,.04),k(1)],
   land:[k(0),k(.15,-.02,-.2,.6),k(.31,-.045,.04,1.2,-.35,0,.08),k(.48,.025,.12,.35,.85,0,.18),k(.64,-.015,-.12,-.15,.25,0,.1),k(.81,0,-.2,.1,-.08,0,.025),k(1)]
  },
  '618':{
   id:'stunfisk-flat-fin-ripple-tail-hinge',title:'Ondulazione piatta',
   beats:['Tiene il corpo piatto e solleva i margini delle pinne','Fa passare la spinta dalle pinne alla coda senza usare piedi','Ribalta la curva caudale mentre le pinne si riaprono a sostegno','Allarga le pinne per la salita e alla riva frena piegando la coda sotto il corpo'],
   swim:[k(0),k(.13,.025,.03,-.8,0,.1),k(.28,-.02,0,.65,0,-.75),k(.43,-.055,-.02,.2,0,1.3),k(.59,.045,.02,-.55,0,.35),k(.74,.02,0,.4,0,-.9),k(.88,-.005,0,.08,0,-.2),k(1)],
   idle:[k(0),k(.2,.01,.02,-.3,0,.15),k(.42,-.015,0,.35,0,-.25),k(.64,.01,-.02,-.1,0,.35),k(.83,0,0,.08,0,.08),k(1)],
   board:[k(0),k(.17,.015,0,-.7,0,.15),k(.36,-.025,.02,.6,0,-.4,.035),k(.57,.015,0,-.2,0,.5,.02),k(.79,0,0,.1,0,.15),k(1)],
   land:[k(0),k(.17,-.02,.02,.25,0,.7),k(.36,.035,0,-.85,0,-1,.02),k(.57,-.015,-.02,.6,0,-.25,.035),k(.79,0,0,.1,0,.12),k(1)]
  },
  '621':{
   id:'druddigon-claw-hook-diagonal-tread',title:'Artigli a uncino',
   beats:['Piega gli artigli verso il petto prima di arpionare l’acqua','Compie una remata breve con una spinta diagonale delle gambe','La coda pesante contrasta il capo e riporta il corpo in asse','Offre le spalle raccolte in salita e alla riva distende gli artigli per stabilizzare il dorso'],
   swim:[k(0),k(.12,.03,.16,.45,-.3,-.15),k(.27,-.055,-.08,-.65,.65,.25),k(.42,.045,.1,1.1,-.75,-.65),k(.57,-.03,-.16,.25,.35,1.15),k(.73,.02,.04,-.25,.1,.4),k(.88,0,-.06,.1,-.05,-.15),k(1)],
   idle:[k(0),k(.19,.015,.12,.2,-.1,-.3),k(.41,-.02,-.1,-.3,.15,.45),k(.63,.01,.06,.35,-.05,-.15),k(.83,0,-.03,.05,.02,.1),k(1)],
   board:[k(0),k(.16,.025,.12,.4,-.25,-.45),k(.35,-.04,-.05,-.55,.1,.4,.2),k(.56,.025,.06,.75,.4,-.25,.12),k(.79,-.005,-.1,.1,.1,.12,.035),k(1)],
   land:[k(0),k(.17,.03,.06,.45,-.3,-.85),k(.35,-.045,-.12,-.7,.8,.35),k(.55,-.015,.16,1,.2,-.2,.18),k(.78,.01,-.08,.2,.08,.1,.04),k(1)]
  },
  '626':{
   id:'bouffalant-horn-balance-heavy-hoof-drive',title:'Zoccoli e corna ferme',
   beats:['Tiene le corna bilanciate e raccoglie gli zoccoli sotto la massa','Le zampe anteriori tirano mentre gli zoccoli posteriori distendono la diagonale','Il capo compensa il petto e una sola frustata di coda chiude la spinta','Abbassa tutte le zampe per la salita e alla riva cerca prima un appoggio largo'],
   swim:[k(0),k(.14,.025,-.08,-.45,-.7,-.1,.045),k(.29,-.045,.12,.75,.9,.15),k(.45,.035,-.16,-.6,-.8,-.25),k(.6,-.02,.08,.5,.55,.1),k(.73,.015,-.06,.2,.1,.85),k(.88,0,-.03,-.1,-.1,.2),k(1)],
   idle:[k(0),k(.22,.01,-.08,-.1,.12,.1),k(.44,-.015,.1,.15,-.15,-.1,.025),k(.65,.005,-.12,.04,.08,.4),k(.84,0,-.02,-.03,.03,.1),k(1)],
   board:[k(0),k(.17,.02,-.08,-.3,-.45,-.15,.08),k(.36,-.035,.1,.2,.2,.25,.24),k(.57,-.015,-.12,.45,.45,-.2,.16),k(.8,.005,-.04,.1,.1,.1,.04),k(1)],
   land:[k(0),k(.18,.03,-.12,-.35,-.3,-.6),k(.37,-.04,.08,.8,.85,.2,.04),k(.57,.02,.14,-.3,-.4,-.1,.22),k(.79,-.005,-.12,.2,.2,.1,.045),k(1)]
  },
  '635':{
   id:'hydreigon-low-hover-three-head-rudder',title:'Tre teste sull’acqua',
   beats:['Inclina le teste laterali in versi opposti e apre le sei ali','Una discesa delle ali precede il richiamo della coda a timone','Le teste tornano in asse durante il recupero alto delle ali','Raccoglie le teste per la salita e allarga ali e coda per sostenere la discesa'],
   swim:[k(0),k(.13,.025,-.08,0,0,-.2,0,{wings:-.22,sideHeads:.5}),k(.29,-.035,.12,0,0,.55,0,{wings:.5,sideHeads:.25}),k(.44,-.05,.04,0,0,-1.15,0,{wings:.2,sideHeads:-.5}),k(.59,.025,-.16,0,0,-.35,0,{wings:-.45,sideHeads:-.2}),k(.75,.015,-.06,0,0,.6,0,{wings:-.18,sideHeads:.3}),k(.89,0,.02,0,0,.15,0,{wings:.08,sideHeads:.08}),k(1)],
   idle:[k(0),k(.2,.015,-.08,0,0,-.15,0,{wings:-.15,sideHeads:.4}),k(.43,-.015,.06,0,0,.3,0,{wings:.2,sideHeads:-.35}),k(.65,.005,-.1,0,0,-.2,0,{wings:-.08,sideHeads:.15}),k(.84,0,-.02,0,0,.08,0,{wings:.05,sideHeads:.04}),k(1)],
   board:[k(0),k(.16,.02,.12,0,0,-.45,0,{wings:-.25,sideHeads:-.5}),k(.36,-.035,.08,0,0,.55,.06,{wings:.5,sideHeads:-.25}),k(.57,.015,-.1,0,0,-.25,.035,{wings:.2,sideHeads:.25}),k(.79,0,-.03,0,0,.1,.01,{wings:-.08,sideHeads:.08}),k(1)],
   land:[k(0),k(.17,.025,-.12,0,0,-.65,0,{wings:-.4,sideHeads:.5}),k(.36,-.035,.1,0,0,.8,.025,{wings:.5,sideHeads:.15}),k(.57,.015,.05,0,0,-.2,.055,{wings:.25,sideHeads:-.45}),k(.79,0,-.06,0,0,.12,.015,{wings:-.1,sideHeads:-.1}),k(1)]
  }
 };
 // Extra wing/head channels must also close at zero, including at loop ends.
 for(const phase of ['swim','idle','board','land'])for(const frame of scores['635'][phase]){frame[1].wings??=0;frame[1].sideHeads??=0;}
 root.FieldHMSurfChoreographies=scores;
 if(typeof module!=='undefined')module.exports=scores;
})(typeof window==='undefined'?globalThis:window);
