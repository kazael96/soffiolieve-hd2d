/* Taglio sul campo: sixty individually authored species/form performances.
 * These are HD-2D adaptations using the original sprite's anatomical parts.
 * Every .52 pose is the one cutting contact; earlier gestures are preparation.
 * Timings do not resolve the native command or change its commit point.
 * Missing channels are explicitly neutral, never inherited from another pose. */
(function(root){
 const catalog={};
 function add(graphic,id,title,beats,cut){
  catalog[String(graphic)]={id,title,beats,cut:cut.map(([t,p={}])=>[t,{lean:0,head:0,arms:0,feet:0,tail:0,crouch:0,stretch:0,squash:0,...p}])};
 }

 // Leaf bearers: tail, mouth, cloak, head leaves and arm blades are distinct.
 add(495,"snivy-tail-sickle","Falce della coda",[
  "Punta lo sguardo al fusto e porta la foglia caudale dietro il fianco.",
  "Solleva la punta della coda mentre il petto resta diritto.",
  "Falcia di lato con la foglia, poi la raccoglie sopra il dorso."
 ],[[0,{}],[.14,{head:-.3,tail:-.5}],[.28,{tail:-1.3,lean:.07}],
  [.41,{tail:-1.6,head:.15,feet:.2}],[.52,{tail:1.65,lean:-.18,head:-.1}],
  [.65,{tail:1.1,lean:.08}],[.82,{tail:-.25,head:.12}],[1,{}]]);
 add(496,"servine-low-leaf-hook","Uncino rasoterra",[
  "Abbassa il petto e distende la foglia caudale vicino al terreno.",
  "Fa passare la punta sotto il fianco, con una controcurva del collo.",
  "Recide risalendo a uncino e torna in appoggio partendo dalle zampe."
 ],[[0,{}],[.12,{crouch:.15,head:.22}],[.25,{tail:.8,lean:-.1,feet:-.2}],
  [.39,{tail:-.65,head:-.35,crouch:.22}],[.52,{tail:1.45,lean:.22,head:-.45,stretch:.07}],
  [.63,{tail:-.3,lean:.14,feet:.55}],[.81,{tail:.25,crouch:.08,feet:-.15}],[1,{}]]);
 add(497,"serperior-s-coil-guillotine","Lama della spira",[
  "Forma una S serrata con collo e coda senza inventare zampe.",
  "Si allunga e tiene alta la foglia terminale sopra la curva del corpo.",
  "Lascia cadere la lama caudale in diagonale, quindi riassorbe la spira."
 ],[[0,{}],[.16,{lean:.12,head:-.4,tail:.65,crouch:.1}],
  [.3,{lean:-.14,head:.5,tail:-.6,crouch:.18}],
  [.43,{stretch:.12,head:-.15,tail:-1.65,lean:.05}],
  [.52,{tail:1.75,head:.35,lean:-.27,squash:.06}],
  [.66,{tail:.55,head:-.25,lean:.18,crouch:.22}],
  [.86,{tail:-.2,lean:.04,crouch:.06}],[1,{}]]);
 add(540,"sewaddle-leaf-collar-nip","Morso sotto il colletto",[
  "Controlla il bordo del fusto muovendo soltanto il capo.",
  "Punta le zampette e raccoglie il corpo sotto il colletto di foglia.",
  "Chiude il morso con un taglio corto del collo e si ritira sotto la foglia."
 ],[[0,{}],[.11,{head:.4}],[.22,{head:-.25,feet:.22}],
  [.36,{crouch:.25,head:.15,feet:-.25,squash:.06}],
  [.46,{head:.55,stretch:.04}],[.52,{head:-.95,lean:-.14,feet:.35}],
  [.64,{head:-.3,crouch:.13}],[.8,{head:.2,crouch:.21,squash:.04}],[1,{}]]);
 add(541,"swadloon-cloak-hinge","Cerniera del mantello",[
  "Si raccoglie nella foglia e oscilla il mantello su un lato.",
  "Riemerge sollevando il capo, poi carica il bordo opposto della foglia.",
  "Ribalta il bordo come una cerniera sul fusto e richiude il mantello."
 ],[[0,{}],[.15,{crouch:.28,squash:.1,head:-.2}],
  [.27,{lean:.18,crouch:.2,head:.3}],[.4,{stretch:.09,head:-.5,lean:-.13}],
  [.52,{lean:.29,head:.8,crouch:.09,squash:.06}],
  [.62,{head:.2,lean:.07,stretch:.04}],[.79,{crouch:.22,head:-.15,squash:.07}],[1,{}]]);
 add(542,"leavanny-measured-scissor","Forbice misurata",[
  "Misura il punto con le lame accostate, poi apre il compasso delle braccia.",
  "Sposta un piede di traverso e immobilizza il capo.",
  "Chiude la forbice sul fusto e separa le lame verso il basso."
 ],[[0,{}],[.13,{arms:.35,head:-.25}],[.27,{arms:-1.7,stretch:.05}],
  [.4,{arms:-2.1,feet:.65,lean:.08,head:-.1}],
  [.52,{arms:2.35,lean:-.12,feet:.45}],
  [.64,{arms:1.2,crouch:.14,feet:-.2}],[.83,{arms:-.3,head:.1}],[1,{}]]);
 add(548,"petilil-three-leaf-cant","Ventaglio del capo",[
  "Inclina il ciuffo a tre foglie per scegliere il bordo esterno.",
  "Raccoglie il piccolo corpo e riporta il capo dal lato opposto.",
  "Fende con una foglia del ciuffo e raddrizza il corpo con un piccolo rimbalzo."
 ],[[0,{}],[.12,{head:-.6,lean:.08}],[.28,{head:.45,lean:-.15}],
  [.42,{crouch:.2,head:.85,squash:.08}],
  [.52,{head:-1.15,lean:.23,stretch:.08}],
  [.66,{head:-.25,crouch:.17,squash:.08}],[.81,{head:.2,stretch:.05}],[1,{}]]);
 add(549,"lilligant-toe-pivot-petal","Petalo in perno",[
  "Solleva le foglie delle braccia e incrocia gli appoggi come in una danza.",
  "Apre il braccio sul lato del taglio con il capo in controtempo.",
  "Ruota sul piede e passa il bordo della foglia, poi termina in un inchino."
 ],[[0,{}],[.1,{arms:.7,feet:-.65,head:.3}],
  [.24,{arms:-.9,feet:.8,lean:.17}],[.39,{arms:-1.75,head:-.45,feet:.45,stretch:.06}],
  [.52,{arms:1.8,lean:-.25,feet:-.8,head:.25}],
  [.63,{arms:.4,lean:.16,feet:.25}],[.81,{head:-.55,crouch:.18,arms:-.25}],[1,{}]]);
 add(598,"ferrothorn-tensioned-vine-reel","Argano di spine",[
  "Raccoglie le liane spinose sopra il nucleo e tende il corpo.",
  "Apre le liane come tiranti, lasciando il nucleo fermo e basso.",
  "Richiama il tirante di taglio e lascia smorzare le liane in due pieghe."
 ],[[0,{}],[.14,{arms:1.3,crouch:.1}],
  [.26,{arms:-.8,stretch:.1}],[.4,{arms:-2.2,lean:.12,crouch:.12}],
  [.52,{arms:2.25,lean:-.2,squash:.1}],
  [.64,{arms:-.65,lean:.09}],[.82,{arms:.45,crouch:.06}],[1,{}]]);

 // Shell tools and armoured cutters.
 add(501,"oshawott-belly-draw-scalchop","Estrazione della conchiglia",[
  "Abbassa la mano al ventre per prendere la conchiglia e guarda il bersaglio.",
  "Porta la conchiglia accanto al viso e pianta le zampe.",
  "Taglia in diagonale e riporta con cura la conchiglia al ventre."
 ],[[0,{}],[.12,{arms:-.4,head:.22,crouch:.08}],
  [.26,{arms:1.1,head:-.25}],[.4,{arms:-1.4,feet:.5,lean:.1}],
  [.52,{arms:2.1,head:-.35,lean:-.22,feet:.4}],
  [.65,{arms:.8,head:.2,lean:.06}],[.82,{arms:-.4,crouch:.1}],[1,{}]]);
 add(502,"dewott-twin-shell-weave","Intreccio di due lame",[
  "Stacca entrambe le conchiglie e le presenta ai due lati dei fianchi.",
  "Le fa passare davanti al petto, poi le apre dietro la linea delle spalle.",
  "Incrocia i bordi nel taglio e li ritira separatamente verso i fianchi."
 ],[[0,{}],[.1,{arms:-.65,feet:.2}],[.22,{arms:1.25,head:-.15}],
  [.34,{arms:.15,crouch:.18,lean:-.08}],[.44,{arms:-1.85,head:.2,feet:-.45}],
  [.52,{arms:2.3,lean:-.17,feet:.55}],
  [.66,{arms:-.5,lean:.12,head:-.2}],[.84,{arms:.4,crouch:.08}],[1,{}]]);
 add(503,"samurott-foreleg-sheath-draw","Lama dal fodero",[
  "Abbassa il muso e porta il peso sulle zampe posteriori.",
  "Libera la lama dell'arto anteriore sollevando il petto.",
  "Estrae e taglia in un unico arco basso, poi riappoggia la zampa e rinfodera."
 ],[[0,{}],[.13,{head:-.4,crouch:.16,tail:.25}],
  [.25,{lean:.12,arms:-.65}],[.42,{arms:-1.55,head:.2,stretch:.06}],
  [.52,{arms:1.95,lean:-.27,head:-.45,tail:-.45}],
  [.63,{arms:.55,crouch:.2}],[.83,{arms:-.35,head:.15}],[1,{}]]);
 add(557,"dwebble-shell-braced-pincer","Tenaglia col puntello",[
  "Punta le zampette e arretra il capo sotto la roccia.",
  "Presenta la chela aperta tenendo il guscio come contrappeso.",
  "Chiude la chela sul fusto e fa un piccolo passo di riassestamento."
 ],[[0,{}],[.1,{feet:.55,head:.3}],[.24,{crouch:.16,lean:.12,head:-.3}],
  [.4,{arms:-1.45,feet:-.35,stretch:.04}],
  [.52,{arms:1.8,lean:-.16,head:.15}],
  [.61,{arms:.4,feet:.7,crouch:.12}],[.8,{arms:-.25,feet:-.25}],[1,{}]]);
 add(558,"crustle-rock-anchored-prune","Potatura sotto la roccia",[
  "Assesta il grande guscio abbassando tutti gli appoggi.",
  "Muove le chele sotto la sporgenza, senza far oscillare il blocco roccioso.",
  "Solca verso l'alto con le chele e le ripiega al riparo del guscio."
 ],[[0,{}],[.16,{crouch:.3,feet:-.6,squash:.04}],
  [.29,{arms:.6,head:-.2,crouch:.24}],[.43,{arms:-2,lean:-.08,feet:.25}],
  [.52,{arms:2.2,stretch:.08,head:.2,lean:.09}],
  [.68,{arms:1.1,crouch:.2,feet:.45}],[.86,{arms:-.45,crouch:.1}],[1,{}]]);
 add(588,"karrablast-brow-hook-flick","Uncino della fronte",[
  "Solleva il mento e mostra il piccolo corno frontale.",
  "Contrae il corpo con le zampe ben aperte, quindi infila il corno di sbieco.",
  "Recide con uno scatto ascendente del capo e richiude gli appoggi."
 ],[[0,{}],[.1,{head:.65}],[.23,{crouch:.26,feet:.65,squash:.07}],
  [.39,{head:-.5,lean:.18}],
  [.52,{head:1.05,lean:-.22,stretch:.07,feet:-.4}],
  [.64,{head:.3,crouch:.13}],[.8,{head:-.2,feet:.2}],[1,{}]]);
 add(589,"escavalier-lance-cross-lock","Serrata delle lance",[
  "Raccoglie le due lance sotto l'elmo e le allinea al fusto.",
  "Porta le punte ai lati opposti con un breve arretramento del busto.",
  "Chiude le lance a croce, trattiene l'incrocio e sfila le punte verso il basso."
 ],[[0,{}],[.13,{arms:.9,head:-.25,crouch:.1}],
  [.28,{arms:-.7,lean:.16}],[.43,{arms:-2.25,head:.1,stretch:.08}],
  [.52,{arms:2.4,lean:-.18,head:-.15}],
  [.61,{arms:2.1,crouch:.16}],[.76,{arms:.65,lean:.08}],[.88,{arms:-.2}],[1,{}]]);

 // Mammalian claws: each sequence has a different preparation and recovery.
 add(504,"patrat-inspect-rake-retreat","Ispezione e rastrello",[
  "Annusa il fusto e lo controlla con un cenno laterale del capo.",
  "Si alza sulle zampe posteriori e raccoglie gli artigli vicino al petto.",
  "Rastrella in basso e arretra con la coda tesa per riprendere equilibrio."
 ],[[0,{}],[.1,{head:-.5,lean:-.08}],[.23,{head:.3,tail:.4}],
  [.39,{arms:-1.2,stretch:.07,feet:-.25}],
  [.52,{arms:1.9,lean:-.2,crouch:.16}],
  [.64,{feet:.65,tail:-.75,arms:.4}],[.82,{tail:.3,head:.15}],[1,{}]]);
 add(505,"watchog-sentry-cross-sweep","Guardia della vedetta",[
  "Resta eretto e porta le mani in guardia davanti al torace.",
  "Ruota il capo per allineare il taglio e apre le braccia senza abbassarsi.",
  "Passa gli artigli trasversalmente, poi torna alla posa da sentinella."
 ],[[0,{}],[.14,{arms:.7,stretch:.09,tail:.2}],
  [.29,{head:.55,arms:.2}],[.43,{arms:-1.7,head:-.3,lean:.11}],
  [.52,{arms:2.15,lean:-.15,tail:-.5}],
  [.67,{arms:1.15,head:.25,lean:.05}],[.85,{arms:.6,tail:.15}],[1,{}]]);
 add(509,"purrloin-tail-feint-claw","Finta della coda",[
  "Finge di voltarsi mostrando la curva della coda.",
  "Abbassa una spalla e nasconde gli artigli sotto il petto.",
  "Scatta con la zampa di lato e ritira prima il capo, poi la coda."
 ],[[0,{}],[.12,{tail:1.25,head:.5,lean:.1}],
  [.25,{tail:-.65,head:.2,crouch:.2}],[.42,{arms:-1.45,head:-.35,lean:.18}],
  [.52,{arms:2.2,lean:-.24,tail:.8}],
  [.63,{head:.6,arms:.55,tail:.65}],[.82,{tail:-.45,crouch:.06}],[1,{}]]);
 add(510,"liepard-prowling-forepaw-hook","Uncino in agguato",[
  "Si accuccia quasi immobile, con il capo già rivolto al punto di taglio.",
  "Trasferisce il peso dietro e allunga la zampa davanti al corpo.",
  "Aggancia il fusto dall'alto e richiama la zampa, rialzandosi dalle anche."
 ],[[0,{}],[.15,{crouch:.3,head:-.25,tail:.3}],
  [.28,{lean:.17,feet:-.55,tail:.7}],[.43,{arms:1.2,stretch:.08,head:-.1}],
  [.52,{arms:-2.25,lean:-.28,head:.3,tail:-.9}],
  [.65,{arms:-.6,crouch:.2,feet:.45}],[.84,{head:.15,tail:.2,stretch:.04}],[1,{}]]);
 add(511,"pansage-crown-check-palm-prune","Potatura del giardiniere",[
  "Controlla il ciuffo con una mano e indica il fusto col capo.",
  "Raccoglie la mano sotto il fogliame e tende la coda per bilanciarsi.",
  "Pota con un arco della mano dall'alto al basso, poi spolvera gli artigli."
 ],[[0,{}],[.1,{arms:1.25,head:.35}],
  [.24,{arms:.35,head:-.4,tail:.6}],[.41,{arms:-1.6,tail:-.8,feet:.25}],
  [.52,{arms:2.05,lean:-.2,head:-.25}],
  [.65,{arms:-.55,tail:.25}],[.79,{arms:.45,head:.15}],[.9,{arms:-.2}],[1,{}]]);
 add(512,"simisage-elbow-led-backhand","Rovescio del cespuglio",[
  "Allarga gli appoggi e conduce la preparazione con il gomito.",
  "Gira il busto portando la mano chiusa dietro il fianco.",
  "Rovescia gli artigli di traverso e tiene il braccio disteso prima del richiamo."
 ],[[0,{}],[.12,{feet:.8,arms:.5,head:-.1}],
  [.27,{lean:-.15,arms:1.2,tail:.4}],[.43,{arms:1.95,lean:.21,head:.35}],
  [.52,{arms:-2.3,lean:-.25,tail:-1.1,feet:-.4}],
  [.65,{arms:-1.8,head:-.2}],[.84,{arms:.3,feet:.2,tail:.2}],[1,{}]]);
 add(513,"pansear-heel-rocking-claw","Artigli a contrappeso",[
  "Dondola sui talloni con le mani raccolte vicino al viso.",
  "Porta il petto avanti mentre gli artigli restano indietro.",
  "Frusta la mano in diagonale, quindi scuote il polso e rimette giù i talloni."
 ],[[0,{}],[.12,{feet:-.5,arms:.8,head:.25}],
  [.26,{lean:-.18,arms:-.25,tail:.65}],[.42,{arms:-1.9,crouch:.16,head:-.35}],
  [.52,{arms:2.25,lean:.2,feet:.55,tail:-.3}],
  [.63,{arms:-.4,head:.2}],[.76,{arms:.55,feet:-.2}],[.88,{arms:-.15}],[1,{}]]);
 add(514,"simisear-loose-shoulder-snap","Scatto della spalla",[
  "Lascia pendere le braccia e scioglie una spalla con un'oscillazione del busto.",
  "Solleva gli artigli all'indietro soltanto dopo aver piegato le ginocchia.",
  "Libera un taglio verticale della spalla e conclude con entrambe le mani basse."
 ],[[0,{}],[.13,{arms:-.3,lean:.2,tail:-.4}],
  [.26,{lean:-.18,head:.3,arms:.2}],[.36,{crouch:.28,feet:.35}],
  [.45,{arms:-2.15,head:-.25,stretch:.04}],
  [.52,{arms:2.35,lean:-.12,crouch:.12}],
  [.67,{arms:.4,head:.15,crouch:.19}],[.84,{arms:-.25,tail:.25}],[1,{}]]);
 add(515,"panpour-cupped-hand-shear","Taglio a mano raccolta",[
  "Accosta le mani a coppa davanti al ciuffo e china il capo.",
  "Scorre con le mani verso un fianco mantenendo la coda arrotolata.",
  "Separa le mani in un taglio obliquo e le riunisce al petto."
 ],[[0,{}],[.11,{arms:.6,head:-.5,tail:.55}],
  [.25,{arms:1.4,lean:.17,tail:1.15}],[.42,{arms:-.8,head:.15,feet:-.35}],
  [.52,{arms:2.1,lean:-.23,tail:-.5,feet:.55}],
  [.66,{arms:-.55,head:.3,tail:.25}],[.82,{arms:.65,crouch:.06}],[1,{}]]);
 add(516,"simipour-overhead-cascade-slice","Lama a cascata",[
  "Alza gli artigli sopra il lungo ciuffo senza toccarlo.",
  "Si distende sulle punte e lascia il capo abbassato fra le braccia.",
  "Fa scendere il taglio fino alla vita, poi risale con le mani lungo i fianchi."
 ],[[0,{}],[.14,{arms:-1.1,head:-.3}],
  [.28,{arms:-2.2,feet:-.55,stretch:.12,tail:.5}],
  [.43,{arms:-1.9,head:-.7,lean:.12}],
  [.52,{arms:2.35,lean:-.29,crouch:.26,tail:-.65}],
  [.65,{arms:1.4,head:.2,feet:.4}],[.83,{arms:-.45,stretch:.03}],[1,{}]]);

 // Grounded claws and wing claws retain their own body mechanics.
 add(529,"drilbur-low-spade-lift","Paletta ascendente",[
  "Punta gli artigli al terreno e piega il piccolo corpo.",
  "Raccoglie le mani sotto il muso, con il peso fra le zampe.",
  "Solleva una paletta di artigli attraverso il fusto e riappoggia le mani."
 ],[[0,{}],[.12,{arms:.55,crouch:.22,head:-.3}],
  [.25,{arms:-.5,feet:.45,crouch:.29}],[.42,{arms:1.45,head:.2,lean:.14}],
  [.52,{arms:-2.25,lean:-.22,stretch:.08}],
  [.63,{arms:-.8,head:.4,feet:-.25}],[.83,{arms:.35,crouch:.16}],[1,{}]]);
 add(530,"excadrill-folded-steel-auger","Trivella d'acciaio",[
  "Accosta gli artigli d'acciaio al corno e comprime il busto.",
  "Avvita il corpo mantenendo raccolte le tre lame.",
  "Svolge l'avvitamento aprendo gli artigli sul fusto, poi torna nella guardia bassa."
 ],[[0,{}],[.1,{arms:1.2,head:-.5,crouch:.18}],
  [.24,{arms:1.8,lean:.26,head:.2,feet:-.5}],
  [.37,{arms:1.65,lean:-.24,head:-.25,squash:.07}],
  [.45,{arms:-1.2,lean:.15,feet:.4}],
  [.52,{arms:2.4,lean:-.3,head:-.6,stretch:.08}],
  [.68,{arms:.75,head:.15,crouch:.24}],[.86,{arms:.25,feet:.15}],[1,{}]]);
 add(551,"sandile-low-jaw-pull","Presa bassa del muso",[
  "Striscia il petto verso il terreno lasciando la coda diritta.",
  "Inclina il muso per prendere il fusto sul lato della bocca.",
  "Recide tirando di lato con il capo e ritira il collo prima delle zampe."
 ],[[0,{}],[.13,{crouch:.25,tail:.35,feet:.3}],
  [.27,{head:.75,lean:-.1}],[.43,{head:.35,tail:-.6,feet:-.25}],
  [.52,{head:-1.15,lean:.21,tail:.9,crouch:.16}],
  [.64,{head:-.35,arms:.3,feet:.5}],[.83,{head:.15,crouch:.08,tail:.2}],[1,{}]]);
 add(552,"krokorok-heel-pivot-rake","Rastrello in perno",[
  "Si raddrizza sui talloni e tiene il muso sollevato.",
  "Porta una mano dietro la spalla mentre la coda si oppone al giro.",
  "Pivota sugli appoggi e rastrella di traverso, poi recupera col petto in avanti."
 ],[[0,{}],[.11,{stretch:.08,head:.5,feet:-.4}],
  [.24,{arms:-1.1,tail:.8,lean:.14}],[.42,{arms:-1.95,feet:.65,head:-.2}],
  [.52,{arms:2.25,lean:-.24,tail:-1.15,head:.2}],
  [.65,{lean:.17,arms:.55,feet:-.35}],[.84,{head:-.15,tail:.25}],[1,{}]]);
 add(553,"krookodile-jaw-set-double-rake","Artiglio dopo la presa",[
  "Blocca il fusto contro il muso senza reciderlo e abbassa la spalla.",
  "Porta gli artigli sotto la presa, mentre la coda allarga il contrappeso.",
  "Taglia dal basso con gli artigli, libera il muso e richiama la grande coda."
 ],[[0,{}],[.12,{head:-.75,lean:-.1,arms:.4}],
  [.26,{crouch:.22,arms:1.2,tail:1.1}],
  [.41,{arms:1.85,head:-.45,feet:.55,lean:.12}],
  [.52,{arms:-2.35,head:.35,lean:-.28,tail:-.9}],
  [.64,{head:.7,arms:-.65,crouch:.12}],[.83,{tail:.4,feet:-.2}],[1,{}]]);
 add(566,"archen-perch-wing-claw","Artiglio dal posatoio",[
  "Fa un piccolo riassetto delle dita dei piedi con la coda distesa.",
  "Abbassa il becco e solleva l'ala artigliata davanti al petto.",
  "Aggancia con la mano alare e la ripiega mentre il becco torna alto."
 ],[[0,{}],[.1,{feet:.8,tail:.55}],
  [.23,{head:-.6,feet:-.45,lean:.1}],[.41,{arms:-1.5,head:-.25,tail:-.65}],
  [.52,{arms:2.15,lean:-.23,feet:.45}],
  [.64,{arms:.7,head:.65,tail:.8}],[.83,{arms:-.25,feet:.2}],[1,{}]]);
 add(567,"archeops-wing-hand-balance","Forbice con coda in bilancia",[
  "Apre entrambe le ali e sposta gli appoggi senza decollare.",
  "Alza la coda e ripiega soltanto le mani alari verso il fusto.",
  "Incrocia gli artigli delle ali con il corpo proteso, quindi richiude prima la coda."
 ],[[0,{}],[.13,{arms:-1.4,feet:.7,head:.15}],
  [.28,{tail:1.5,lean:.2,arms:-.75}],
  [.43,{arms:.5,head:-.4,crouch:.2,feet:-.35}],
  [.52,{arms:2.3,lean:-.28,tail:-1.35,head:.25}],
  [.65,{tail:.1,arms:1.1,feet:.35}],[.84,{arms:-.45,head:-.1}],[1,{}]]);
 add(571,"zoroark-mane-veiled-backclaw","Artiglio dietro la criniera",[
  "China il capo lasciando la criniera davanti alla spalla.",
  "Nasconde la mano oltre il fianco e si piega sulle ginocchia.",
  "Rivela il dorso degli artigli con un rovescio e si raddrizza guardando il varco."
 ],[[0,{}],[.12,{head:-.6,lean:.13,arms:.35}],
  [.26,{arms:1.6,head:-.25,feet:-.35}],
  [.43,{crouch:.28,arms:2.1,lean:-.08}],
  [.52,{arms:-2.4,head:.45,lean:-.26,stretch:.06}],
  [.65,{arms:-1.1,feet:.6,head:.25}],[.84,{arms:.2,head:-.1}],[1,{}]]);
 add(587,"emolga-membrane-fold-slice","Taglio a membrana raccolta",[
  "Allarga le braccia per tendere il patagio e fissa il punto di taglio.",
  "Raccoglie il patagio da un lato, piegando le zampe.",
  "Fende con gli artigli anteriori senza planare e riapre il patagio per frenare."
 ],[[0,{}],[.1,{arms:-1.5,tail:.6,head:-.15}],
  [.25,{arms:.7,crouch:.2,feet:.5,tail:-.45}],
  [.42,{arms:1.6,lean:.18,head:.3}],
  [.52,{arms:-2.2,lean:-.2,tail:1.2,feet:-.5}],
  [.64,{arms:-1.65,head:-.25,crouch:.13}],
  [.83,{arms:-.35,tail:.25}],[1,{}]]);
 add(613,"cubchoo-nose-clear-little-claw","Zampata dopo il naso",[
  "Porta la zampetta al naso e scuote appena il capo.",
  "Si siede sulle anche e solleva l'altra linea di artigli vicino alla guancia.",
  "Dà una corta zampata discendente e controlla il varco con un cenno del capo."
 ],[[0,{}],[.11,{arms:.55,head:.35}],
  [.23,{head:-.35,arms:-.15}],[.35,{crouch:.3,feet:-.3,squash:.07}],
  [.45,{arms:-1.5,head:.2,stretch:.03}],
  [.52,{arms:1.85,lean:-.18,crouch:.1}],
  [.67,{arms:.2,head:-.55,feet:.4}],[.84,{head:.15}],[1,{}]]);
 add(614,"beartic-wide-stance-claw-press","Pressa dell'orso",[
  "Allarga gli appoggi e solleva le grosse zampe davanti al torace.",
  "Arretra il busto lasciando gli artigli puntati verso il basso.",
  "Preme il taglio con tutto il peso, resta basso e poi rialza le spalle."
 ],[[0,{}],[.14,{feet:.9,arms:.6,crouch:.1}],
  [.29,{arms:-1.3,lean:.23,head:.25}],
  [.44,{arms:-2.05,stretch:.08,head:-.25}],
  [.52,{arms:2.3,lean:-.3,crouch:.3,squash:.08}],
  [.68,{arms:1.2,crouch:.28,head:-.4}],
  [.85,{arms:.25,head:.15,feet:.25}],[1,{}]]);
 add(621,"druddigon-wing-braced-cleave","Fendente fra le ali",[
  "Tende la coda e abbassa il capo fra le spalle alate.",
  "Fa salire gli artigli davanti al muso con gli appoggi piantati.",
  "Abbatte un fendente diagonale e lascia smorzare prima il capo, poi la coda."
 ],[[0,{}],[.12,{tail:1.1,head:-.5,feet:.4}],
  [.25,{arms:.7,crouch:.18,head:-.25}],
  [.42,{arms:-1.95,lean:.18,tail:-.5}],
  [.52,{arms:2.4,lean:-.28,head:.55,tail:.85}],
  [.65,{arms:.8,head:-.2,crouch:.16}],
  [.83,{tail:-.35,feet:-.2,head:.1}],[1,{}]]);
 add(631,"heatmor-pipe-tail-raking-draw","Rastrello del formichiere",[
  "Avvicina il lungo muso al punto da tagliare e mantiene chiusa la bocca.",
  "Appoggia il corpo indietro con la coda tubolare come contrappeso.",
  "Trae gli artigli verso il petto in un taglio a rastrello e abbassa infine il muso."
 ],[[0,{}],[.12,{head:-.75,arms:.25}],
  [.27,{tail:1.25,lean:.18,feet:-.35}],
  [.43,{arms:1.8,head:-.35,crouch:.14}],
  [.52,{arms:-2.2,lean:-.24,tail:-.65,head:.2}],
  [.64,{arms:-.6,tail:.35,feet:.55}],
  [.82,{head:-.4,arms:.15}],[1,{}]]);
 add(643,"reshiram-feather-hand-ceremonial","Fendente della piuma bianca",[
  "Solleva il collo e presenta le mani alari davanti al petto.",
  "Apre lentamente le grandi ali e tende il corpo senza staccare i piedi.",
  "Chiude il bordo artigliato in un fendente obliquo e ripiega le ali dal basso."
 ],[[0,{}],[.15,{head:.55,arms:.65,tail:.25}],
  [.29,{arms:-1.65,stretch:.1,feet:.35}],
  [.43,{arms:-2.15,head:-.35,lean:.12}],
  [.52,{arms:2.25,lean:-.28,head:-.6,tail:-.65}],
  [.67,{arms:1.25,crouch:.14,head:.15}],
  [.85,{arms:-.35,tail:.3,head:.25}],[1,{}]]);
 add(644,"zekrom-locked-shoulder-power-shear","Cesura della spalla nera",[
  "Blocca gli appoggi e porta le braccia ai fianchi con il collo retratto.",
  "Carica una torsione corta con le mani artigliate davanti alla spalla.",
  "Sblocca la torsione nel taglio orizzontale, trattiene il corpo e richiama le mani."
 ],[[0,{}],[.12,{feet:.85,arms:-.45,head:-.35}],
  [.26,{arms:1.35,lean:.24,tail:.7,crouch:.12}],
  [.42,{arms:1.9,head:.25,lean:.28,squash:.06}],
  [.52,{arms:-2.4,lean:-.3,head:-.5,tail:-.9}],
  [.63,{arms:-2,lean:-.22,feet:.55}],
  [.79,{arms:-.65,head:.3,tail:.25}],[.9,{arms:.2}],[1,{}]]);

 // Segmented and mandibular bodies use head/legs, never invented hands.
 add(545,"scolipede-segmented-neck-sickle","Falce del collo segmentato",[
  "Abbassa i segmenti anteriori e allarga gli appoggi della parte posteriore.",
  "Porta le appendici del capo dal lato esterno con una controcurva del corpo.",
  "Taglia con un arco del collo e rialza i segmenti uno dopo l'altro."
 ],[[0,{}],[.13,{crouch:.23,feet:.65,head:-.25}],
  [.28,{lean:.18,head:.85,tail:-.45}],
  [.43,{head:.45,lean:-.12,feet:-.4,squash:.06}],
  [.52,{head:-1.15,lean:.28,tail:.65,stretch:.07}],
  [.65,{head:-.35,crouch:.16,feet:.35}],
  [.83,{head:.2,lean:-.06,tail:-.15}],[1,{}]]);
 add(595,"joltik-four-foot-jaw-tug","Strappo del piccolo ragno",[
  "Fa due brevi riassetti delle zampe tenendo il capo basso.",
  "Si schiaccia vicino al fusto e allinea le mandibole.",
  "Recide con un rapido strappo del capo all'indietro, poi riprende tutti gli appoggi."
 ],[[0,{}],[.1,{feet:.65,head:-.25}],
  [.2,{feet:-.65,head:.15}],[.34,{crouch:.3,squash:.1,head:-.5}],
  [.45,{head:.35,lean:-.13,feet:.25}],
  [.52,{head:-1,lean:.24,stretch:.06,feet:-.35}],
  [.65,{crouch:.2,head:.25,feet:.5}],[.83,{feet:-.2,head:-.1}],[1,{}]]);
 add(596,"galvantula-front-leg-jaw-scissor","Forbice fra le zampe",[
  "Solleva gli appoggi anteriori per aprire spazio alle mandibole.",
  "Abbassa il torace e inclina il capo sotto la linea delle zampe.",
  "Chiude le mandibole con una rotazione bassa del collo e torna largo sugli appoggi."
 ],[[0,{}],[.12,{feet:-.8,head:.2,stretch:.05}],
  [.26,{feet:.45,crouch:.24,head:-.35}],
  [.42,{head:.95,lean:.16,feet:-.3}],
  [.52,{head:-1.2,lean:-.23,feet:.8,crouch:.12}],
  [.66,{head:-.25,feet:.55,squash:.05}],
  [.84,{head:.15,feet:-.15}],[1,{}]]);
 add(632,"durant-mandible-clamp-twist","Morsa d'acciaio",[
  "Assesta le sei zampe e porta le mandibole in linea col fusto.",
  "Stringe senza recidere, fermando il capo mentre il corpo si carica di lato.",
  "Completa il taglio ruotando la morsa e sfila le mandibole prima di muovere le zampe."
 ],[[0,{}],[.12,{feet:.6,head:-.35}],
  [.25,{head:.2,lean:-.08,feet:-.35}],
  [.39,{head:.2,lean:.24,crouch:.18}],
  [.52,{head:-1.05,lean:-.29,stretch:.06}],
  [.64,{head:.65,lean:-.06,feet:0}],
  [.82,{feet:.45,crouch:.08,head:.1}],[1,{}]]);

 // Red and blue Basculin have different complete caudal manoeuvres.
 add(550,"basculin-red-caudad-reverse","Rovescio della pinna rossa",[
  "Incava il fianco e piega la coda verso il capo.",
  "Raddrizza il corpo lasciando la pinna caudale caricata di lato.",
  "Recide con un rovescio della pinna e smorza il ritorno con una controcurva corta."
 ],[[0,{}],[.13,{lean:.2,tail:.9,head:-.25,squash:.05}],
  [.28,{lean:-.1,tail:1.65,head:.35}],
  [.44,{tail:1.4,head:-.2,stretch:.07}],
  [.52,{tail:-1.8,lean:-.28,head:.5}],
  [.65,{tail:.7,lean:.16,head:-.35}],
  [.83,{tail:-.3,lean:-.06}],[1,{}]]);
 add(699,"basculin-blue-dorsal-underpass","Passaggio basso della pinna blu",[
  "Abbassa il muso e piega la coda sotto la linea del corpo.",
  "Accorcia il corpo, poi alza il capo lasciando la pinna arretrata.",
  "Porta il bordo della pinna in un arco ascendente e si distende senza contraccolpi."
 ],[[0,{}],[.11,{head:-.65,tail:-.45,lean:.1}],
  [.25,{tail:-1.3,crouch:.2,squash:.1}],
  [.4,{head:.65,tail:-1.65,lean:-.17}],
  [.52,{tail:1.8,head:-.35,lean:.28,stretch:.1}],
  [.66,{tail:.95,head:.15,lean:.12}],
  [.84,{tail:.2,head:-.1,stretch:.03}],[1,{}]]);
 add(604,"eelektross-tail-anchor-fin-rip","Pinna con coda in ancora",[
  "Ripiega la lunga coda sotto il corpo come un'ancora.",
  "Allunga il collo e porta le pinne artigliate davanti al muso.",
  "Strappa il fusto con il bordo della pinna e srotola la coda durante il recupero."
 ],[[0,{}],[.14,{tail:1.4,head:-.3,crouch:.16}],
  [.29,{tail:1.7,head:.55,stretch:.1,arms:.6}],
  [.43,{arms:-1.5,head:.2,lean:.17}],
  [.52,{arms:2.2,lean:-.29,head:-.7,tail:.75}],
  [.65,{arms:.4,tail:-.8,head:.25}],
  [.84,{tail:.35,arms:-.2,lean:.07}],[1,{}]]);

 // Each Sawsbuck season has its own antler path and footwork.
 add(586,"sawsbuck-spring-flower-hook","Uncino dei palchi in fiore",[
  "Inclina il palco fiorito come per far passare un ramo fra le corna.",
  "Flette le zampe anteriori e raccoglie il mento vicino al petto.",
  "Recide risalendo con un uncino del palco e rialza delicatamente i fiori."
 ],[[0,{}],[.12,{head:.65,lean:.08,feet:.25}],
  [.27,{crouch:.24,head:-.55,feet:-.45}],
  [.42,{head:-.9,lean:.15,tail:.2}],
  [.52,{head:1.1,lean:-.22,stretch:.06,feet:.4}],
  [.65,{head:.45,crouch:.12,tail:-.2}],
  [.83,{head:-.15,feet:.15}],[1,{}]]);
 add(704,"sawsbuck-summer-canopy-side-rake","Rastrello del palco estivo",[
  "Punta gli appoggi e sposta il folto palco di lato mantenendo alto il collo.",
  "Allarga il fianco per liberare il margine esterno delle corna.",
  "Rastrella trasversalmente col palco e lo riporta al centro con una curva larga."
 ],[[0,{}],[.13,{feet:.65,head:.25,stretch:.07}],
  [.28,{head:1,lean:-.14,tail:-.3}],
  [.43,{head:.8,lean:.24,feet:-.35}],
  [.52,{head:-1.2,lean:-.28,tail:.7}],
  [.66,{head:-.7,lean:.13,feet:.3}],
  [.84,{head:.2,tail:-.15}],[1,{}]]);
 add(705,"sawsbuck-autumn-branch-lower-cleave","Fendente dei rami autunnali",[
  "Solleva il palco ramificato e arretra sulle zampe posteriori.",
  "Tiene il capo alto mentre il petto si abbassa e gli appoggi si stringono.",
  "Abbassa il palco in un fendente e lo sfila prima di riaprire le zampe."
 ],[[0,{}],[.1,{head:.85,feet:-.3,stretch:.05}],
  [.25,{lean:.21,head:.6,tail:.4}],
  [.42,{crouch:.25,head:.9,feet:.4,squash:.04}],
  [.52,{head:-1.15,lean:-.3,crouch:.12}],
  [.65,{head:-.65,lean:.05,tail:-.3}],
  [.82,{feet:.7,head:.25,stretch:.04}],[1,{}]]);
 add(706,"sawsbuck-winter-bare-antler-lever","Leva del palco invernale",[
  "Avvicina il palco spoglio dal basso tenendo il collo raccolto nel pelo.",
  "Infila un ramo della corna sotto il fusto e pianta gli appoggi anteriori.",
  "Fa leva con collo e spalla in un taglio corto, poi sfila il palco all'indietro."
 ],[[0,{}],[.14,{head:-.6,crouch:.2,squash:.05}],
  [.28,{head:-.95,lean:-.1,feet:.4}],
  [.43,{head:-.3,lean:.23,feet:.8,tail:.2}],
  [.52,{head:.95,lean:-.27,stretch:.09}],
  [.64,{head:.4,lean:.16,feet:-.45}],
  [.83,{head:-.25,crouch:.08,tail:-.15}],[1,{}]]);
 add(610,"axew-tusk-side-peck","Piccolo taglio della zanna",[
  "Guarda il lato del fusto e presenta una sola zanna.",
  "Punta le zampe e ritrae il mento per caricare il collo.",
  "Recide con una breve beccata laterale della zanna e controlla la linea rimasta."
 ],[[0,{}],[.12,{head:.65,tail:.3}],
  [.26,{feet:.6,head:.25,arms:.2}],
  [.43,{head:-.7,crouch:.2,lean:.1}],
  [.52,{head:1.1,lean:-.21,tail:-.65}],
  [.64,{head:-.2,arms:-.2,feet:-.3}],
  [.83,{head:.4,crouch:.05}],[1,{}]]);
 add(611,"fraxure-tusk-low-pendulum","Pendolo delle zanne",[
  "Abbassa il collo e lascia le lunghe zanne davanti al petto.",
  "Disegna un pendolo preparatorio sotto il mento con la coda opposta.",
  "Completa il pendolo tagliando dal basso di lato e resta in guardia sulle zampe."
 ],[[0,{}],[.11,{head:-.55,crouch:.2,arms:.3}],
  [.25,{head:.6,lean:.14,tail:-.7}],
  [.38,{head:-.8,lean:-.13,tail:.8}],
  [.46,{head:-1,feet:.55,crouch:.12}],
  [.52,{head:1.2,lean:.28,tail:-1.1,stretch:.06}],
  [.68,{head:.45,feet:-.2,arms:.55}],
  [.85,{head:-.2,arms:.25}],[1,{}]]);
 add(612,"haxorus-axe-neck-crossguard","Ascia con guardia incrociata",[
  "Incrocia gli artigli davanti al torace e apre gli appoggi.",
  "Solleva la testa ad ascia sopra la guardia prima di caricare il fianco.",
  "Passa la lama della zanna con un giro del collo e apre la guardia dopo il contatto."
 ],[[0,{}],[.13,{arms:1.2,feet:.8,head:-.15}],
  [.28,{head:.85,stretch:.1,tail:.5}],
  [.43,{head:1.1,lean:.25,arms:.9,tail:-.4}],
  [.52,{head:-1.2,lean:-.3,tail:1.15,feet:-.4}],
  [.65,{arms:-1.1,head:-.4,crouch:.14}],
  [.83,{arms:.2,head:.2,tail:-.2}],[1,{}]]);
 add(624,"pawniard-brow-pin-arm-draw","Lama sotto la fronte",[
  "Avvicina la lama della fronte per fissare la linea senza ancora recidere.",
  "Ripiega le braccia a lama accanto al corpo e piega un appoggio.",
  "Estrae il taglio dal basso con il braccio e ritira la fronte per ultima."
 ],[[0,{}],[.1,{head:-.75,lean:-.08}],
  [.24,{arms:1.1,crouch:.18,feet:-.45}],
  [.42,{arms:1.85,head:-.5,lean:.16}],
  [.52,{arms:-2.2,head:.2,lean:-.23,feet:.55}],
  [.65,{arms:-.4,head:-.3,crouch:.08}],
  [.83,{head:.45,arms:.2}],[1,{}]]);
 add(625,"bisharp-forehead-sabre-salute","Sciabola dopo il saluto",[
  "Alza una guardia di lame davanti al volto in un saluto rigido.",
  "Abbassa le mani e porta avanti la lama della fronte con il corpo eretto.",
  "Recide dall'alto con la fronte e riapre la guardia soltanto durante la risalita."
 ],[[0,{}],[.12,{arms:-1.25,head:.25,stretch:.06}],
  [.26,{arms:.55,head:.75,feet:.4}],
  [.43,{arms:.15,head:1.05,lean:.19}],
  [.52,{head:-1.2,lean:-.3,crouch:.2,arms:-.25}],
  [.65,{head:-.35,arms:1.5,feet:-.35}],
  [.84,{arms:.5,head:.2,stretch:.03}],[1,{}]]);
 add(626,"bouffalant-horn-shoulder-scrape","Rasatura del corno",[
  "Scava un solo riassetto degli zoccoli e abbassa il collo sotto il grande ciuffo.",
  "Avvicina un corno di lato con il peso fermo sulle spalle.",
  "Rasa il fusto facendo scorrere il corno e ritira il capo lungo la medesima apertura."
 ],[[0,{}],[.11,{feet:.9,head:-.3}],
  [.23,{feet:-.35,crouch:.2,head:-.65,tail:.4}],
  [.41,{head:.85,lean:.22,feet:.25}],
  [.52,{head:-1.1,lean:-.29,tail:-.7}],
  [.65,{head:-.65,lean:.09,feet:.45}],
  [.84,{head:.3,tail:.2,crouch:.06}],[1,{}]]);

 // Beak cutters: Vullaby tests the line; Mandibuzz braces with its wings.
 add(629,"vullaby-tested-beak-nick","Intaglio del piccolo becco",[
  "Tocca il fusto con la punta del becco per sceglierne il margine.",
  "Ritrae il capo e si assesta nella conchiglia con le ali strette.",
  "Chiude un intaglio obliquo del becco e controlla il risultato con due cenni."
 ],[[0,{}],[.1,{head:-.45,lean:-.08}],
  [.22,{head:.55,arms:.3,crouch:.16}],
  [.4,{head:.9,feet:.45,arms:.15}],
  [.52,{head:-1.15,lean:-.2,arms:-.3}],
  [.64,{head:.35,feet:-.2}],[.76,{head:-.25}],
  [.88,{head:.15}],[1,{}]]);
 add(630,"mandibuzz-wing-braced-beak-shear","Cesura col becco in guardia",[
  "Allarga le ali per fermare il corpo e abbassa il collo fra le spalle.",
  "Sposta gli artigli dei piedi e porta il becco sotto la linea del fusto.",
  "Trancia risalendo col becco, quindi ripiega prima le ali e infine il collo."
 ],[[0,{}],[.13,{arms:-1.5,head:-.25,tail:.35}],
  [.28,{feet:.7,crouch:.18,head:-.65}],
  [.43,{head:-1,arms:-.8,lean:.17}],
  [.52,{head:1.15,lean:-.28,feet:-.4,arms:.55}],
  [.65,{arms:.15,head:.7,crouch:.1}],
  [.83,{arms:-.15,head:.2,tail:-.15}],[1,{}]]);

 root.FieldHMCutChoreographies=catalog;
 if(typeof module!=='undefined')module.exports=catalog;
})(typeof window==='undefined'?globalThis:window);
