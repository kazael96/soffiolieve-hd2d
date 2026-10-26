# IRBI name entry, Options and trainer card

All catalogues in this checkpoint contain decoded resources from the supplied
Italian Black ROM. The raw ROM/executables remain local. No runtime code is
changed by the exporters below.

## Name entry

`tools/extract-naming.py` exports `NAMING_ASSETS` and `assets/naming/`.
EVCMD261 points to overlay21 `021b6200`, which creates task `021c5990`.
The task descriptor at `021c5988` selects overlay194 (194/0xc2), descriptor
`021f5480`; initialization is `021f1340`.

Graphics loader `021f1680` and sprite loader `021f1788` use NARC118
(`a/1/1/8`), not Black2's commonly listed `a/1/2/0`:

* Character1, palette2, screen0: name header on the **bottom** display.
* Character1, palette2, screen3: background on the **upper** display.
* Character1, palette2, screen4: frame and original Italian bitmap controls.
* Character1, palette2, screen5: alphabet key rectangles.
* Character1, palette2, screen10: staggered QWERTY key rectangles.
* Character8, NCER7, NANR6, palette9: 12 native cursor/indicator cells.

`021f4c20` loads NARC119 (`a/1/1/9`) members0–4. Each begins with
u16 columns/rows, followed by row-major u16 Unicode characters. Pages0/1 are
13×5 upper/lower Italian alphabets, including `ÀÉÈÌÒÙ`/`àéèìòù`; page2 is
symbols; pages3/4 are 10×3 QWERTY lower/upper. The dedicated NFTR0 atlas
includes all page symbols, gender symbols and accents, using original font
mapping, bearings and advances. Preserve native custom glyphs; do not replace
them with emoji.

Native QWERTY classifier `021f2e8c` treats U+203B placeholder entries as
function-key positions. Row0 column10 is Delete; row1 column9 is OK;
row2 columns0/9 are Shift, with character columns1–8 reading source
columns0–7 (`zxcvbnm-`). Row3 column4 is Space. Alphabet classifier
`021f2e68` treats rows0–4 as characters and row5 columns0–5 as controls
actions2–7 (upper/lower/symbols/QWERTY/Delete/OK).

`021f1d28` creates the name-text window at tile(8,2), size24×2,
pixel(64,16,192,16). Slot sprites at `021f1df0..021f1e44` use y37,
step14 and start `64+max(0,64-floor(14*limit/2))`; limit10 gives x64..190.
The Pokémon icon branch `021f3f54..021f4032` creates its original icon with
centre(30,20). These are source coordinates, not a rescaled web layout.

START (`021f3638`, pad mask8) moves focus to the OK action via
`021f2728`, then updates the cursor; it does **not** immediately confirm.
SELECT (`021f3a4a`, mask4) cycles page actions2–5. A (`021f3a2c`, mask1)
activates the selected key. B is compared directly with2 at `021f3712` and
generates Delete action6; dispatch `021f47e2` calls `021f223c`. It does not
exit on an empty name. Hardware repeat timings were not certified.
The native bitmap has Delete and OK, not an additional Cancel
button. The naming task sets the ten-character nickname limit at `021c5a1a`.

The native return value is1 when the nickname changes,0 when unchanged or
empty: `021f4424..021f44a4` sets the context result, and field task
`021c5a6c..021c5a8c` conditionally writes Pokémon param0x73 and the script
output. An empty confirmed nickname preserves the existing nickname, or the
species/default name when there was no nickname.

The prompt is initially printed: `021f1532..021f154c` calls the species/gender
formatter `021f3ce0`, using bank81 message1. Its BG4 window is tile(1,19),
size30×4, pixel(8,152,240,32), created at `021f3bd0..021f3c10`.

The physical display mapping is essential: initialization `021f13d0` passes0
to `021f49e4`; `021f4a2e` forwards it to ARM9 `020435bc`, which clears
POWCNT1 bit15. The main engine is therefore on the **bottom** LCD. BG0's
name/icon header, BG1's keyboard grid, and BG2's controls frame all belong
on the bottom screen. BG5's dark background and BG4's persistent prompt
belong on the upper screen. The prompt does not overlap keyboard controls.
Catalog names `images.nameHeader` and `images.upperBackground` express the
correct physical assignment; `top`/`lowerBackground` remain legacy aliases.
ARM9 `020452b4`, called after printing completes, copies window character
data to BG VRAM; it does not clear or hide the window. Invalid-name messages8/9
temporarily replace the prompt, restored on subsequent input through
`021f46d6..021f4732`. Do not add an arbitrary timed disappearance.

## Options

`tools/extract-options.py` exports `OPTIONS_ASSETS` and `assets/options/`.
Overlay68 loads text bank29 at `021b9542`. Graphics loader `021b98fa`
opens NARC27 (`a/0/2/7`), with character13/screen14/palette1 for the upper
background, character0/screen2/palette1 for the row atlas, and
character7/screen9/palette8 for the lower background. Selector resources are
character5/NCER4/NANR3/palette6; extra resources character12/NCER11/NANR10.
The source row tilemap is256×512, not a full image to shrink into256×192.
`021b9970..021b9980` copies32 palette bytes from NCLR8 offset128 to BG
palette offset480. Exact text positions, row-state palette modifications,
scrolling, repeat and transitions still require runtime tracing.
The physical main engine is on the bottom LCD: `021b9788` sets r0=0 and
`021b978a` calls `020435bc`. Thus the BG0 background and BG2 rows belong on
the bottom, while BG5's pattern belongs on top. Prefer catalogue aliases
`bottomBackground`/`upperBackground`; old `topBackground`/`lowerBackground`
names were provisional and do not identify physical screens correctly.

## Trainer card

`tools/extract-trainer-card.py` exports `TRAINER_CARD_ASSETS` and
`assets/trainer-card/`. Overlay111 loads text187 at `021c4084`, and opens
NARC40 (`a/0/4/0`) at `021c6c38` and `021c6fd4`. Native layers at
`021c719a..021c7244` select character25/screen33/palette0 (badges),
character25/screen34/palette1 (grid), and character26/screen35/palette1
(logo). Sprite loader `021c6c56..021c6c98` selects palette12, character29,
NCER46, NANR48. The shared frame is NARC83 (`a/0/8/3`), character28,
screen29, palette27, selected through ARM9 `020275a4..020275ac` and
overlay111 `021c7248..021c729a`.

Models49/50 plus BCA51/52 are converted reproducibly using official apicula;
the model names are `gym_leader` and `gym_leader_b`. They must not be treated
as the whole card or assigned male/female roles without tracing their calls.
Card-rank/gender palette selection, avatar selection, front/back composition,
text positions and 3D transitions remain unverified. The metadata makes those
limits explicit instead of inventing a complete card.

## Verified runtime layout additions (overlay tracing)

Options overlay68: `021ba634` initializes BG1 text scrollY=12, BG2 panel
scrollY=-8 and spriteYOffset=24 through `021baae0`. The16 native label/value
window records are at `021bb720`;11 selector records at `021bb604`. These
are exported as `OPTIONS_ASSETS.layout` in tile coordinates. Initial labels
are visible at y28,52,76,100,124; panels at y24,48,72,96,120. Font0 is loaded
at `021b9b0e`. The title is BG0 window[0,0,128,24], centered at y4. The
upper description is BG4 window[8,152,240,32]; BG3 has the text preview
window[8,8,240,32]. Overlay`021ba90c` explicitly sets normal row palette
banks[3,1,0,1,3] and focused row bank7. New rowNormal0..4/rowSelected PNGs
apply those native palette remaps. Value palette states are chosen0/other3
normally and chosen7/other12 on the focused row; labels0/7. Selector NANR
animation states are0 normalChosen,1 normalOther,2 focusedOther,3 focusedChosen.
The source row atlas alone does not encode these dynamic states.

Trainer overlay111 has the opposite LCD mapping: `021c428c` loads04000304,
`021c4292` computes0x8000, `021c4296` ORs it and `021c4298` writesPOWCNT1.
Main engine is TOP, Sub BOTTOM. Actual front card is on BG6/BG7, BOTTOM.
`021c43c4` selects character32 for class20 (male protagonist), otherwise28;
`021c43d0` selects screen42 vs41. Palette table`021c8ca0` contains rank pairs
[15,5],[16,6],[17,7],[18,8],[19,9],[20,10],[11,11], male/female respectively.
`021c420c` applies this based on class20/21 and rank. Rank0 fronts are exported
as frontMaleRank0/frontFemaleRank0, plus native grid char30/screen40.

Protagonist avatar is character31, screen43/44 (class-gender flag at context
byte4 bit1), palette15/5 for rank0. `021c5780` copies into BG7 through ARM9
`02041050` and `02042620`: destination tile21,2, width10,height11; source
origin21,2. Cropped avatar PNGs80x88 have native position[168,16]. Raw source
images remain separately identified. These are actual native protagonist
art, not gym_leader models49/50. Eight native text window records from
`021c85fb` are exported in frontLayout.windows, with font0 verified at
`021c4070`. The first5 use bank187 labels0..4 at window-local0,0 through
`021c5f6c`; context byte4 bit2 controls displaying the Pokédex row.
Remaining dynamic value formatting and transitions still require tracing.


Options font atlas variants now use Font0 original glyphs with literal NCLR1
palette banks0/3/7/12, ink index1/shadow2. These are source colors, even where
pink/violet is unexpected. ARM9 loader2049ae8→2049b5c→2049ba8 and parser2062a18
load the NCLR data directly;2062aa0 only resolves its relative pointer. No
palette decryption or subjective recoloring was applied. The found bank15
range transfer cannot affect the row state banks.

Trainer value positions: window0 name right edge128 local, baseline y0;
window1 class right edge128 local (offline bank191[0] Allenatore); window2
nature right edge128 local, bank187[31+nature]; window4 money right edge208
local,7 digits. Windows0..4 begin at x24 so global right edges are152/232.
Original ID, player nature and session time belong to saved player state,
not the ROM resource. Do not fabricate an extracted original save identity.
