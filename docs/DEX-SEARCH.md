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

## Revision 0.16: native criterion lists

The earlier generic-grid limitation is resolved for layout/resources. These are **vertical frame_list menus**, not grids. Configs in overlay210: Ordina0x021C0B20, Nome0x021C0B70, Tipi0x021C0B48, Colore0x021C0B98, Sagoma0x021C0BC0. Constructor0x021B7654 belongs to shared overlay67. Forty-byte config records and native eight-byte control records are retained in `submenus`.

The row starts x128,y0; its width128. Ordina6 options, Nome26, Tipi17, Colore10 use24px rows with source NSCR97/NCGR81. Sagoma14 uses40px rows, NSCR98/NCGR81. MAIN BG1 displays current/following entries; SUB BG5 displays preceding entries: subY=192+(entryIndex-mainFirstIndex)*rowHeight, clipped to LCD. Previous SUB history therefore includes8 full24px rows, or four full40px rows plus a clipped row. The lower selection capacity is6 for Ordina,7 for other24px lists,4 for Sagoma. Native control rectangles only cover x152..231 of each row, despite128px-wide graphics. Exported controls include dragstrip x232..255,y8..160 and native PageUp/PageDown bottom buttons. Action4/5 are PageUp/PageDown, verified overlay67 0x021B7CE4/0x021B7D08. Ordina uses action8 and returns immediately; other criteria toggle while staying in the same screen.

Each submenu retains its already-exported left background (orderChoice/nameChoice/typeChoice/colorChoice/shapeChoice). `mainBase` remains underneath. Left criterion title is native window12, localcenter40 (global64), y64; selected criterion value window13, localcenter48 (global64), y88. Subtop title/help use windows0/1, with correct bank277 help IDs in the catalog. Native title/value packed color is0x3C40; do not automatically apply the row font palette to these windows.

Option text is original font0 with packed0x39E0, foreground14 and shadow15; native literal0x021BEBA8. NCLR73 slot1 colors are gray222/gray131. `optionFont` includes all supported actual bank277 glyphs, including sort arrows. Row text window offset24,0 withsize88×24, centered local44, y4: globalcenter196, rowY+4. Rows source palette1 are normal. Focused row uses palettes2 and3 and a native64-frame RGB555 cosine blend, manager0x0202E9C0. `optionRow-normal/pulseA/pulseB` and equivalent shapeRow endpoints are original source pixels. Pulse metadata includes phase increment1024 over65536 and fixed-point blend formula. Exact drag inertia/page easing has not been ported.

Seventeen scoped OBJ cells are exported:14 `shapes` from char82/NCER85/NANR101/NCLR76, and3 `optionObjects` fromchar78/NCER84/NANR100/NCLR75. Their NCER origins and NANR timings are retained. All shape animations are static cell sequences, duration4. Shape actor anchor x204,rowY+20 (0x021BFA8C). Red selected checkmark is optionObjects cell2 atx140,rowY+rowHeight/2 (0x021BF6B0/0x021BF914). Thumb cell0 anchorx252,y12..156; track cell1 anchor252,84, source actor table0x021C08AC. Apply NCER origins when painting every OBJ.

**Correction:** Sagoma criteria values are **0..13**, not1..14. Native0x021BE190 stores row+scrollStart directly; these match a/0/9/8 member2 values. Sprite cell equals criterion value. No textual numeric shape label should replace the original silhouettes. No extra unset row exists in any original option list: click an already-selected criterion to clear it. Tipi is one17-option list, not successive TypeA/TypeB screens. Native0x021BE0B0..0x021BE104 adds/removes the clicked type and retains up to two; selecting a third shifts second->first and stores the new second.

Integration limitation remains native easing/touch inertia and precise full transition blending. Native geometry, source palettes, row state endpoints, button rectangles, selection interaction and static OBJ sequences are now available to replace the generic grid.

Sagoma left-value exception: original selected silhouette actor7 anchor(64,104), visible only if set, routine0x021BF518..550. It replaces the textual value window used by other criteria.



Final help-layer proof: helpLayout is BG7 window1 [8,24,240,24], textorigin8,28, packed0x440, no wrapping. Italian Nome help measures151px with original metrics; width is not112. BG7template0x021C0694 has priority0; rowBG5template0x021C06D4 priority2. Draw help **after** SUB row backgrounds so they cannot erase its last letters. NativeNome printer0x021BE7F8..82E. Exactfont0/palette5 help atlas is now DEX_EFFECTS_ASSETS.fonts.help. This ordering is native; wrapping to a left-width invented column is not.
