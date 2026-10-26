# Battle-only party graphics (IRBI)

Battle party is distinct from the field party archive. Overlay198 loader
02210508–022105A0 opens NARC100 **a/1/0/0**: NCGR18→BG7, NCLR19 via
palette manager, source NSCR16 and17 copied into native component buffers.
This corrects the initial archive76 hypothesis: field panels must not be
treated as certified battle panels.

`tools/extract-battle-party-ui.py ROM src` exports original maps0..17,
eight128×48 panel crops and proven KO palette variants to
`assets/battle-party/`, with dedicated `provenance.json`.
NSCR16/17 are linear32-tile-wide atlases (256×488 and256×504). Native
0220B360 copies exactly32source entries per row; no DS512px screen-block
rearrangement applies here. Map0 is an original red/gray Pokéball background.

The first six button records at02211974 are x,y,w,h in tiles:

|Slot|Pixel rectangle|
|---|---|
|0|0,0,128,48|
|1|128,8,128,48|
|2|0,48,128,48|
|3|128,56,128,48|
|4|0,96,128,48|
|5|128,104,128,48|

0220B4C4 references width/height at02211976/77. Unlike field-party final
positions these begin8pixels higher. Source128×48 crops from NSCR16 use
x0/128 and y0/48/96/144, proven at0220B020–0220B0D2. Visually, rows0/1/2/3
look normal/selected/selected-variant/empty respectively. **These role names
are visual inferences**, recorded separately in `inferredVisualStates`.

Fainted palette logic is stronger evidence: 0220B560–0220B580 checks HP0
and replaces every tile palette with **7+(state&1)** while retaining tiles.
Exports `panel-ko-bank7.png`/`panel-ko-bank8.png` reproduce that operation
on the original left normal source panel. Normal selection phase mapping
is not certified merely by palette appearance.

Text bank18 and creation of NFTRfont3 are proven at02210610–0221063C.
Font3 source atlas already exists at `assets/battle-ui/font-3.png`, but
several slot renderers use root context+0xC font handle. Creation of font3
does not prove its use for names, HP and levels; active font/palette and
per-label text origins remain unverified in this bounded pass. Do not
substitute the field party's typography while labelling it ROM-certified.

No runtime changes, commits, ROM writes or save-state operations performed.

## Resolved in0.16: fonts, labels, states and final composition

The preceding typography and state caveats are superseded by these traces.
Ov93 `021E9920–021E9926` copies battle ctx+B0 (**font0**, proved in the
battle font loader) into partyRoot+C. Ov198 `0220BE44–0220BE48` uses that
handle for names. Main party caller `0220D7CC–0220D7DA` passes x32,y7.

Six text windows come from `02211ADA`: BG5, position matching each slot,
size15×5tiles (120×40), palette bank9. Name printer packed0x3DC0 thus uses
original a/1/0/0:19 bank9 indices15/14/0, RGB238gray/131gray/transparent.
The original bitmap font0 and font3 recolored with that bank are now
`font-0-slot.png` and `font-3-slot.png`; provenance contains full metrics.

Level and numeric HP explicitly use **font3** at manager+1E9C, loaded by
02210638, read by0220C040/0220C090/0220C128. Level caller0220D888–0220D8AC
prints bank18:11 (`L{number}`) at8,32 when status enum8(healthy); otherwise
the original status label occupies this area. HP caller0220D85E–0220D86A
centers the slash at92,32; currentHP is right-aligned to slash left, maxHP
starts after the slash. Font3 width measurements determine these anchors.
The bar starts64,27 and has width48 and height2, drawn as two native lines
by0220C1F8. All positions are local to the respective text window.

Final panel draw0220B61E–0220B62E copies table02211974 positions into **BG6**;
the background alone is BG7. Slot predicate02210A00 returns0 when species0,
1 for active battle slots (02210E4C),2 for reserve. Renderer0220B770–B7B8
selects empty row3/column1, active row0/column0, reserve row0/column1.
0220B400 chooses the atlas column from the active/reserve argument.

Press task0220B6AC selects row1 then restores row0: phase0 draws row1,
phase1 counter0..4 restores at4. That is **five update intervals**, followed
by two recovery updates before unlocking. Row1 is a press flash, not a
permanent keyboard-focus border. Row2 remains unused/unassigned here.
HP0 overrides bank7+(row&1); dedicated PNGs preserve both atlas columns and
normal/pressed row shapes under `fainted.byColumn`.

Original status labels are NARC83 a/0/8/3 char12/cell13/pal11/anim16,
loaded0220E2F0–0220E34A. Actor positions are table02211CCC, used at
0220EA4A–0220EA58; add each exported NCER origin to the actor position.
0220E874 passes status enum directly as NANR sequence;8 skips the label.
ARM9 02027644–0202768E maps sleep1,burn2,poison3,paralysis4,freeze5,KO6.
Toxic uses the same poison label. These source cells replace generic text.

##0.17 native prompts

The main party prompt is distinct from upper battle narrative/command text.
Ov1980220BD52–0220BD7A chooses bank18: mode2→message9
«Quale Pokémon mandi in campo?», mode3→message7 «Su quale Pokémon?»,
otherwise message6 «Scegli un Pokémon.». These map naturally to switch
selection (including forced replacement), item targeting, and normal party.
The native mode values and strings are preserved in provenance.prompt;
browser state names must not overwrite their source meaning.

Window record02211A14 is BG4 x2,y21,w22,h2,palette13: lower-screen
rect16,168,176,16. Printer0220C50C fills index15 white255,255,255 and
prints font0 at local0,0, packed0x440: fg1 RGB90,82,82 and shadow2
RGB164,164,172 from a/0/2/3:5. This palette is loaded into sub bank13 at
022105EA–022105FE. Dedicated original atlas `font-0-prompt.png` and metrics
are in `font.variants.prompt`. The whole original bank18 is also exported
as `messages` for contextual labels such as INFO24, MOSTRA MOSSE25,
Non adesso…26, Già in lotta27, In attesa28 and Compagno29.

Initialization0220F49E creates windows and0220F4A6 selects the prompt after
slot composition. There is no independent arbitrary prompt delay. The
native font queue handles print completion. Upper «Cosa deve fare…»
(bank15:69) belongs to command selection and must not serve as the active
forced-switch or item-target prompt; the lower selection prompt is separate.
The upper last-event narrative, such as fainting, need not be replaced by
a duplicate of this lower prompt.

### Contextual page after selecting a reserve (IRBI ov198)

A reserve tap does not commit a switch. `0220F676–0220F6A4` starts the slot press, sets pending state12 and waits through state29. `0220F78C` then handles the contextual page: action0 is Scambia (button7), action1 INFO (button8), action2 MOSTRA MOSSE (button10), action3 or B returns to the six slots with arrow button6. Only the Scambia branch writes the chosen slot at `0220F82C`. Item-target mode3 takes a separate path directly from the slot handler; forced-replacement mode2 retains the contextual Scambia validation path.

The original Italian labels are bank18 messages21,24,25. Availability result2/3/4/1 substitutes messages26/27/28/29: Non adesso..., Già in lotta, In attesa, Compagno. Eggs suppress INFO and MOSTRA MOSSE. There is no textual ESCI entry: the lower right arrow returns.

`provenance.json.context` now supplies original atlas crops, four text windows and button geometry. Context uses original BG6 map15 and BG7 map14 (`02210C4C`, table022120D4), plus atlas17 panel240×136 at0,8; atlas16 INFO/MOSSE104×40 at0/104,152 and arrow40×40 at216,152. Text uses font0 with slot bank9 palette indices15/14/0. Name is centered at localY7; labels are horizontally centered at localY5 (`0220C594`). Button7's drawing rectangle is the whole detail panel; its exact touch hit area is not certified here and must not be presented as traced.

INFO and MOSTRA MOSSE are internal ov198 pages2/3 rather than the field Summary application. `provenance.json.detailPages` provides native backgrounds, text windows and button rectangles: INFO BG6/BG7 maps5/4 with22 windows; MOSSE maps3/2 with6 windows. These resources are certified by page dispatch at0220BB70 and background table022120D4. Individual text roles, selected Pokémon sprite anchors and detailed contents still need tracing; using the field Summary app is an explicit adaptation, not a claim of original battle UI fidelity.

### Certified internal INFO, MOSTRA MOSSE and move detail contents

The preceding limitation on individual text roles and sprite anchors is resolved by tracing `0220DBA8`, `0220DB04`, `0220DC78` and their printer calls. The catalog `detailPages` now names every native text window. INFO uses22 windows: name; ability name; ability description; held item name; current/maxHP; Attack; Defense; Speed; SpecialAttack; SpecialDefense; HPbar; level; EXP to next level; then the matching PS/stat labels, level prefix, next-level label and MOSTRA MOSSE action. Ability descriptions come from text bank183, indexed by abilityID. The zero held-item branch prints bank18:30 Senza strumento. Level100 displays zero EXP to next level. Numeric values in INFO use font0 packed0x2120 (bank9 foreground8/shadow9); headings and level use0x3DC0. Dedicated `detailNumber`, `male` and `female` font variants are exported.

MOSTRA MOSSE has six windows: header name; four move names and their PP line; INFO action. Names are centered at localY7 and use bank18 messages71/74/77/80; PP is at localY24, labelX40, slashX80, current right-aligned before slash and maximum after it. Original128×48 panel states are exported from map17. Absent moveID uses variant3, not the normal frame.

Touching a move opens native page4, not the field Summary app: BG6 map7, BG7 map6, eleven text windows. These are move name, PP numbers, accuracy value, power value, description, category value, Pokémon name, PP label, accuracy label, power label, category label. Descriptions use bank202 indexed by moveID. Accuracy0 and power0/1 print message60 '--'. Native category0/1/2 maps messages65/64/66 (DI STATO/FISICO/SPECIALE). Four40×16 page tabs use source atlas16 row59, normal/pressed/selected variants; active tab selection is proved at0220B990.

All three detail pages use the original small Pokémon party icon anchored24,12, status198,20, types130,16 and164,16. Context instead anchors the Pokémon icon128,72. INFO has a generic held-item badge at20,132, rather than the individual item's Bag icon: `0220E930` chooses normal/mail sequence based on020212EC. The same generic badge can appear beside the Pokémon icon at anchor+8,+8. Status uses the existing original label enum, including6=KO and8=hidden. Header gender glyphs are bank18:22/23 at the header window's right edge, with dedicated native palette10/11 or12/13; eggs/genderless suppress them. See catalog sprite anchors and source addresses for move type/category anchors on page4.

The final OBJ resources are exported with NCER signed bounds and NANR data: `heldItemBadge` uses a/0/8/3 NCGR65/NCER67/NCLR66/NANR70. `moveCategoryIcons` uses NCGR56+category, NCER59, NANR62 and NCLR33; original ARM9 palette selector02027584 reads0209FBE4 `[0,0,1]` for status/physical/special. A visual check of the physical icon confirms the orange burst source artwork.

The shared native press controller0220B6AC does not branch on buttonID: all buttons passed to0220B660, including6–13 and28–31, display variant1 for five update intervals, restore variant0, then wait two recovery updates. Selected-tab variant2 is reapplied by page composition. Tick counts describe native update calls, not arbitrary wall-clock milliseconds.
