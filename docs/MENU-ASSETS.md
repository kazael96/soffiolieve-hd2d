# Original Italian Black menu graphics

`tools/extract-menu.py` reads only the supplied IRBI ROM and emits converted PNG
images and JSON metadata in `src/menu-assets.js`. It does not publish the ROM,
ARM executables or raw NARC members.

Verified resources:

* X menu: `a/0/7/1`, palette0/1, character2, screens14–18. Screen14 is the
  256×192 light grid. Screen16 contains the six native button outlines in two
  columns; the 256×512 tilemap is preserved, not stretched into the game view.
  Outlines start at x4/132 and y24/72/120. Screens17/18 contain alternate
  counts. Icon character/cell/animation indices are recorded per group.
  OAM palette banks are relative resource slots; native runtime remapping
  matters. The Pokémon symbol is rendered using NCLR1 slot3 (red/white),
  trainer card using slot6 (orange), matching the original manual. The raw
  OAM bank alone wrongly yielded purple/pink icons. The general native
  palette-remapping function and all icon identities remain to be traced.
* Party panel atlas: `a/0/7/6`, character12, screen18, palette6. This is an
  atlas of panel states, **not a composed party screen**. The runtime must
  select a panel variant rather than displaying all of these states together.
* Summary detail panels: `a/0/7/8`, character8/screen63 and character10/screen64;
  character9/screen65 is the original Italian header. Palette0.
* Scoped party icons: `a/0/0/7`, character `species*2+7`, shared NCER2/NANR1,
  palette0. Snivy uses palette slot1; Tepig/Oshawott slot0;
  Patrat/Lillipup slot2. These five assignments were checked visually against
  the original colours. The general native palette-selection function has
  not been ported. The three cells retain their original origin offsets.
* Bag: `a/0/8/8`, male blue background character3/screen5/palette4 and
  female red background character0/screen2/palette1. Native bag/pocket-object
  cells and animations use character15/NCER14/NANR13/palette16 (male),
  character11/NCER10/NANR9/palette12 (female). Additional original buttons,
  cursor, pocket markers and TM markers are exported with their resource
  indices in `groups`. These are components; the overlay's exact dynamic
  placement, deformation and transition timing have not been ported.
* Italian original labels: `a/0/0/2` banks29 (options),34 (X menu),157 (party),
  158 (summary),168 (save),36 (save progress/completion),187 (trainer card),
  3 (item actions),55 (pockets).
  Scoped item descriptions are bank53. Text controls are preserved.

NCER OAM size, tile offset, flip, palette and original origin are respected.
NANR exports native duration units and cell selection, plus translation and
SRT values where present. This extraction does not certify the runtime's
screen transitions or animation clock against Nintendo DS hardware.

`a/0/7/0` is **not** the X menu in Italian Black; that commonly quoted index
belongs to Black2/White2. The public resource list was useful for candidates
only; each resource above was decoded directly from IRBI.

Still unverified: complete party composition, full bag composition and item-icon
mapping. A direct item-ID→graphic-member assumption failed visual checks and
no resulting item icons were included. Do not claim those screens are exact
merely because the original font is used.

Main-menu icon identification also needs native call-site verification.
The `pokedex` group currently contains character5's double-screen handheld;
its role may differ from the requested icon. Character11/12 handheld variants
are exposed as `xtransceiverMale/Female` pending native role verification.
Do not claim these provisional names prove their native menu assignments.
