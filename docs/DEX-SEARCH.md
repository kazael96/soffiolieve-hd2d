# Pokédex search (Italian Black IRBI)

`tools/extract-dex-search.py` exports `src/dex-search-assets.js` (`DEX_SEARCH_ASSETS`) and eleven scoped original PNGs. No runtime code or encounter data is changed.

## The two list commands

The original START button opens **Cerca**. The SELECT button toggles the **Unima/National Pokédex**; it is not an Order command. Order is the first criterion inside search. Original list actor table: overlay209 `0x021BE8F0`; touch table `0x021BE9E0`; input `0x021BE558`. The mode event dispatch `0x021BCF1A` calls `0x0200CA70` and `0x0200CA5C`. SELECT is gated by National unlock and disabled in search-result mode.

START anchor(36,180), hitbox(0,168,72,24); SELECT anchor(104,180), hitbox(72,168,64,24). Apply existing listObjects NCER cell origins to these actor anchors. List X is(208,168), Back(232,168), checkbox(188,172); their hitboxes are in the catalog. Checkbox toggles shortcut registration ID15, **not** portrait orientation (overlay209 `0x021BD254`). Search checkbox similarly registers shortcut ID16 (`0x021BE224`).

## Original search screen

Overlay210 `zknsearch_main.c`, base0x021BC140; resources a/1/5/9 (NARC159). Loader `0x021BC4DC..0x021BC5C0` loads palette73 MAIN, palette74 SUB; char79/mainBG2/map95; char80/subBG4/map94 and subBG6/map96. Shared Pokédex configuration maps MAIN to bottom and SUB to top; this research has not independently traced an LCD setter in overlay210.

Initial MAIN layers: mainBase (BG2), criteriaLabels (BG3, char81/map92), criteriaValues (BG0, char81/map93). SUB layers: subGrid (BG6), subBase (BG4). Dynamic initial maps are loaded by `0x021BC984..0x021BC9BA`. Maps86/87/88/89/90 are original criterion option backgrounds; full animated-object placement in those screens is not certified. PNG transparency is retained.

Sixteen text windows from table0x021C0800 are exported as pixel rectangles, BG IDs and palette indices, constructor `0x021BE268`. Font is original font0, a/0/2/3 member0, already available as POKEDEX_ASSETS.font. All107 Italian messages come from bank277, loaded at `0x021BC844`.

Initial control table0x021C0A60 has10records of12bytes, passed at `0x021BFDC6` to0x02025C50. Its last4bytes are inclusive yMin,yMax,xMin,xMax; exact converted rectangles and complete records are exported as initialControls. Ordina/Nome/Tipo/Colore use right-hand x128..255 rows y0/24/48/72. Sagoma y96..135. Avvia x113..255,y144..167; Azzera x0..50,y144..167. Checkbox/X/Back y168..191. Criterion option-grid hitboxes have not been traced; avoid calling invented grids original coordinates.

## Exact filtering and ordering

Overlay212 `0x021C9368..0x021C9648` opens NARC98, a/0/9/8. Criteria are7bytes: scope, order, initial, typeA, typeB, color, shape; unset255. Scope0 National,1 Unima. Every search candidate must have been seen. **Order2..5 or any type criterion additionally requires caught** (`0x021C9482..0x021C94A6`). Two selected types require an unordered exact pair; one matches either type. Initial letters use file1. Shapes use file2 plus form lookup file0. Color is personal property33. Original order is preserved after filtering.

Sort lookup0x021C9868 is [4,5,8,9,6,7], loader0x021C973C. Enum0 number,1 Italian A-Z,2 weight descending (label↑),3 weight ascending (↓),4 height descending (↑),5 height ascending (↓). Arrow labels are transcribed exactly from the ROM, not reinterpreted. Form IDs in full sort resources encode (form<<10)|species; only existing five species are exported in scopedOrder, with original ordering intact.

Catalog species attributes and sort orders cover Snivy495, Tepig498, Oshawott501, Patrat504, Lillipup506 only. No new encounters are introduced. Initial indices, shape, color, type pair, height dm and weight hg are original ROM values. Filters should use real runtime seen/caught state; attributes alone must not unlock results.

## Verification

Exporter asserts ROM ID IRBI, overlay bases and exact six-member sort lookup. All11 generated PNGs are decoded by Pillow and reopened for integrity; native initial composition and option backgrounds were inspected in `work/dex-search-sheet.png`. Native dumps and alternative research remain under work. Runtime composition, scrolling and option animations still require integration and visual QA.
