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
