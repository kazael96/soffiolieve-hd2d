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
