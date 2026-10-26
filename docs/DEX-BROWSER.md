# Original Italian Black Pokédex list

`tools/extract-dex-browser.py` exports `window.DEX_BROWSER_ASSETS` and 33 scoped
PNGs. These are original converted pixels, not a reconstructed green UI theme.
The browser runtime is not modified by this extraction.

## Verified native loader

The list is **overlay209**, base021BC140,10464 bytes. Overlay208 is the detail
browser (its original filenames are zukan_detail_*);212 is the controller/search
engine;206 is registration. Confusing those modules produced wrong earlier
background/palette combinations.

Overlay209 initializer **021BC474** opens NARC159=`a/1/5/9` and loads:

| Screen component | Character | Screen | Palette | Native BG |
| --- | --- | --- | --- | --- |
| lowerBackground / mainBackground | 56 | 62 | 48 | 3 |
| upperBackground / subBackground | 57 | 63 | 49 | 7 |
| row templates | 58 | 66,67,68 | 48 | 2 / frame_list |
| lowerDecoration | 59 | 69 | 49 | 5 |

The palette loads are021BC492/021BC4A4. Character loads occur021BC4B6,
021BC4C8,021BC4DA,021BC4EC; static screen loads021BC4FE/021BC522.
The 256×256 source maps are cropped to the 256×192 DS viewport; row templates
are separately cropped from **source(0,0),160×24**. Their destination is x96.

Rows66/67/68 are registered as states0/1/2 at021BC930..021BC960.
List construction tests caught predicate0200CED4 first, then seen predicate
0200D064. State0 supplies the Poké Ball; state1 an empty circle; state2 the
unknown entry, whose native text is bank276 index7 `?????`.

## Coordinates and scrolling

Overlay209 copies a40-byte config from **021BE6AC** to overlay67's native
`frame_list` constructor021B7654. Its first8 bytes are
`02 06 0C 00 14 03 07 00`: main/sub BG2/6, row x12 tiles=96px, y0,
width20 tiles=160px and height3 tiles=24px. The remaining bytes are retained.
Overlay67's copying code021B900E/021B9014 confirms x field2, width field4;
021B9090 computes row y from height field5 and base y field3.
The complete config bytes are retained in the catalog rather than inventing
names for every field. Exact text-window placement and scroll easing remain
browser implementation work.

**Physical LCD order is verified.** Overlay209 at021BCBCA sets r0=0 before
021BCBCC calls ARM9 setter020435BC. That setter clears POWCNT1(04000304) bit15,
then inserts value<<15. Bit15clear routes main engine to the bottom LCD and
sub to the top. The upperBackground/lowerBackground catalog names refer
to physical LCDs; mainBackground/subBackground alias their matching engine.

Frame_list initialization021B7AE0 fills main rows from start indexS,Y0 onward.
The sub loop021B7B5E starts with indexS-1 atY168 and works backward before
drawing upward. Thus physical top shows preceding entries S-8..S-1 and physical
bottom S..S+7. WhenS=0 the upper list region is empty. There are eight24px rows
per192px LCD; overlay209 separately limits tracked visible-row objects to seven.

The native thumb position routine021BE488 fixes x=252 and clamps y to12..156.
Native cell origins are retained: thumb(-2,-4),5×8 and track(-2,-76),5×152.

## Objects and text

`groups.listObjects` comes from NCGR55,NCER61,NANR71,NCLR51 in the same NARC.
Native loaders021BD8F0..021BD938 establish that group. Its seven cells are
visually identified as START search button,SELECT order button, thumb, track,
highlighted START,highlighted SELECT and the90×100 portrait brackets. The
catalog's `objectRoles` selects their cell indices; all NANR frames/durations
and original crop origins are retained.

Original Italian labels are **a/0/0/2 bank276**, proven by021BC726 setting
message-bank69×4=276 before021BC734 loads it. They include POKÉDEX DI UNIMA,
POKÉDEX NAZIONALE,VISTI:,PRESI:,TROVATI: and `?????`. Original species names
come from bank70. Regional numbers are the650 uint16 entries in a/0/1/6:668.
Use the existing extracted original font0; this task does not add a font copy.

No alternative palettes, habitat-map research assets, full-ROM binaries or
unused catalogs are shipped. Native loader/config indices are verified; exact
dynamic composition of portrait, name windows and buttons still requires the
runtime to apply them.

## List length and unknown entries

Overlay212 routine021C9188 scans the whole native ordered array. Whenever an
entry is caught(0200CED4) or seen(0200D064), the resulting list length becomes
its index+1. Entries before that point remain present as unknown placeholders;
the list does not automatically extend to all156 regional slots.

The native regional order helper021C966C reads a/0/9/8:4 (649 uint16 species IDs)
and excludes species whose personal regional number is999. The156 remaining
IDs include **Victini494, number000**, before Snivy495, number001. The explicit
regionalOrder is exported. Thus Oshawott007 as highest seen gives eight list
entries including the000 placeholder; do not drop regional number0 as falsey.

## Original detail-navigation buttons

The same exporter now adds twelve useful cells from a/1/5/9 NCGR13,
NCER27,NANR44,NCLR3, loaded by overlay208 at021BDC98. Original Italian
words **Info, Zona, Verso, Forme** are baked into the sprite pixels, with
normal and flashing/pressed variants. START play and SELECT replay cells are
also retained for the cry page. Foreign-language selectors are not exported.

`groups.detailNavigation.cells` is a compact array; each record retains its
nativeCell index. Its exported NANR animations remap cell IDs into that compact
array and retain nativeAnimation for provenance. `detail.tabs` and
`detail.cryControls` supply convenient normal/highlighted indices.

Overlay208's nine-button table is at021C8340 (pointer at021BDE9C). Its logical
IDs7..10 have x48,80,112,144,y168,width32, matching the31×21 original tab cells
whose native origin is(0,2). Records are exported intact. Layout identification
combines the native position table and visible Italian labels; it is not a
claim that every generic button event/availability rule has been emulated.

Overlay206's original filename is zukan_info.c. It supplies the Info panel
used by the detail browser as well as registration; the existing original
Info panel exported by extract-pokedex.py need not be discarded. Replacing
an HTML Continue button with these native navigation cells addresses the
visual command bar. Habitat, cry and alternate-form content remain separate
native modes; merely showing their buttons does not implement those modes.

### Default Info is shifted on the touch LCD

Overlay208 creates206 twice:021BEBE8 passes mode2/engine0(main,bottom);
021BEC34 passes mode2/engine1(sub,top). It immediately hides the secondary
instance with021BEC3A→021BA6C8. Overlay206 at021B9EA4 stores **-24** in field
0x1B4 when mode2/main is selected.021BA17A..021BA1A6 applies that offset to all
three Info BGs;021BA0FA adds it to portrait positioning. This makes the original
description occupy y117..167 instead of141..191, reserving y168..191 for tabs.
The existing converted Info panel, text and portrait should therefore receive
the same -24 translation in detail mode, not be moved to the top LCD merely
to prevent overlapping a browser-authored footer. Registration keeps its own
unshifted layout. The Nintendo manual's Pokédex screenshot on page14 shows the
description and native navigation together on the touch screen.

The secondary top Info instance is hidden initially. Its separate common-header
composition is not completely reconstructed by this extraction; a full native
top-LCD claim would be premature. `detail.info` records this limit explicitly.

### Close, back and previous/next controls

`groups.detailCommon` adds eight normal/highlighted redX,blue return,down/up
cells from **a/0/8/3 NCGR20/NCER23/NANR26/NCLR19**. ARM9 getters02027564,
02027594,02027598,0202759C,020275A0 return that archive/resource set for the
detail module. Native cells0/1/2/3 and8/9/10/11 are preserved through a compact
mapping. `detail.commonButtons` has native touch rectangles: close x208,
back x232,previous(up)x0,next(down)x24; all y168,width24. Draw each cell at its
native origin offset (close/back+5,+5), not centered by its trimmed PNG alone.

## Habitat coverage for the five scoped species

The exporter scans all112 original encounter files in a/1/2/6, including every
active method and each232-byte seasonal block.100 files have one block and12
have four. Snivy,Tepig,Oshawott have no entries in any active wild table.
Patrat appears in encounter members3,77,78,79; Lillipup77,78,79.

Original map-header and town-map data establish:

| Encounter member | Zone | Original Italian place | Map point |
| --- | --- | --- | --- |
| 3 | 152 | Cantiere dei Sogni | 239,118 |
| 77 | 317 | Percorso1 | 232,148 |
| 78 | 319 | Percorso2 | 231,127 |
| 79 | 321 | Percorso3 | 214,118 |

All names,points,full27-halfword town-map rows and encounter slot/season/level
evidence are in `detail.habitat`. The original map already exists as
assets/townmap/map.png; no duplicate map PNG is added. Its archive85 character
7/screen16 and character5/screen17 with extended palette0 match the original
habitat module's map loads. The native area-mask animation has not been
reconstructed; placing markers over these verified original areas is still
a browser adaptation of that effect.
