# Original IRBI Pokémon Summary

Exporter: tools/extract-summary-details.py. Catalog: src/summary-detail-assets.js (window.SUMMARY_DETAIL_ASSETS). 14 background PNGs plus9 scoped tab cells and6 native move-panel cells. No runtime changes or commits.

## Native module and physical screens

Overlay131, base0x021D4140, source filenames p_status.c, p_sta_sub.c, p_sta_info.c, p_sta_ribbon.c, p_sta_skill.c. Initializer0x021D4864 uses NARC78=a/0/7/8. MAIN palette0/NCGR8, SUB palette1/NCGR10, SUB headers palette1/NCGR9. Background grids NSCR70/71 belong to BG3/7; page backgrounds BG2/6; header first32×3tiles BG5; text BG1/4.

LCD assignment is certified, not inferred:0x021D4636 loads register04000304;0x021D4638 loadsFFFF7FFF;0x021D463A..463E reads/ANDs/writes POWCNT1. Bit15 cleared means MAIN=physicalBOTTOM and SUB=physicalTOP.

Normal dispatch0x021D42BC..42F6 and0x021D5C2E..5C7E:

|State|Tab|Bottom MAIN|Top SUB|Top header|
|---|---|---|---|---|
|0|Info|char8/map63|char10/map64 memo|char9/map65|
|1|Mosse|char8/map72 move list|char10/map73 stats+ability|char9/map75|
|2|Fiocchi|char8/map66|char10/map67|char9/map69|
|3|Move learning variant|021DA594|special move-learning flow|special|

Mosse selection changes top background to74/header76 for move details. Fiocchi alternative68 exists; its complete selection predicate is not traced. Info uses map72 instead of63 for nonzero statefield0x38 (Pokémon property0x4C, egg flag). Normal page changes are disabled for eggs; Fiocchi input requires statefield0x40==1 (ribbon availability predicate).

## Font and text geometry

The font constructor0x021D50EA calls0201D7EC with NARC23=a/0/2/3, member0, caching the font at statefield0x80. Text helpers use this object in0201C724. Reuse POKEDEX_ASSETS.font and assets/pokedex/font.png. Original summary labels come from bank158, loaded at021D50F8.

Info MAIN/BOTTOM window table021DC178 has10 tile rectangles, consumed at021D7B38. All are BG1; catalog exports pixel coordinates. Layout: number y8, species y24, type y40, OT y56, ID y72, experience label y88, experience value y104, next-level label y120, next-level value y136, EXP bar y152. Labels/values use local baseline offsets exported in native.infoText. Type icon anchors are(96,48),(130,48), traced at021D7CBA/021D7D26, with OAM origins applied separately.

Info SUB/TOP window is BG4 x32,y40,width192,height160. Native window extends beyond the192px viewport; preserve wrapping. Nature bank188[natureID0..24] is drawn local(1,1); encounter template local(1,17); characteristic local(1,17+16*encounterLineCount). Original lineHeight16. Nature/location color uses {ff00:2} emphasis and {ff00:0} restore.

Memo banks:188 contains nature phrases, encounter templates and characteristic strings;89 ordinary locations;90 special locations;91 origin people;92 origin regions. These banks are exported in full. Normal own caught non-egg Pokémon use template25, foreign-owner version26. Other arrival/egg/event branches retain original templates without inventing predicates.

Characteristic message is53+statIndex*5+(highestIV%5). Native021D852E..85D8 uses IV orderHP,Attack,Defense,Speed,SpAttack,SpDefense, scans cyclically starting personality%6, and replaces a previous winner only for strictly larger IV. Tables021DC13C (properties70..75),021DC154 (six cyclic permutations) are verified. The native initial winner is index0 and max0, relevant to the all-zero-IV edge case.

Mosse SUB/TOP has13 BG4 windows from table021DC1B2, exported in native.statsSubWindows. First8 form the normal statistics/ability pane. Labels110..116 are PS, ATTACCO, DIFESA, ATT.SP., DIF.SP., VELOCITÀ, ABILITÀ. native.statsText exports label and value offsets. HP has separate current/max values and native bar window1. Ability name bank182 is local(65,1) of window7; description bank183 local(5,17). Move-detail windows8..11, labels149/147/148 and description bank202 are described in native.moveDetailsText. Original bank202 descriptions are now included in SUMMARY_DETAIL_ASSETS.messages[202].

## Bottom controls

Touch table021DC004 is consumed by021D5180/02035B88. All rectangles y168..192:

|ID|Role|x range|
|---|---|---|
|0|Info|0..40|
|1|Mosse|40..80|
|2|Fiocchi|80..120|
|3|Toggle current page setting|120..144|
|4|Previous Pokémon|144..168|
|5|Next Pokémon|168..192|
|6|Close|200..224|
|7|Back|232..256|

Byte0 in endpoint means256. Sprite anchors are separately exported. Tab objects use char11/NCER78/NANR129 with NCLR3, loaded natively021D4910..4924; use groups.tabs instead of the older experimental palette0 party-detail export. The other five controls use a separate common-object group; do not assign tab cells to these IDs.

## Portrait and precise remaining limit

Native021D77B0..77C4 calls02017270 to create a front render object with fx12 position(216,72,0);021D77EE..7802 creates a back object at the same anchor. The API forwards coordinates unchanged to020159C8. Catalog stores raw and decoded position. Native uses a 3D quad/render object, additional scale and transform matrices, and animated front/back transitions; its final projection has not been reproduced as pixel-perfect browser geometry. The anchor is verified, but a browser sprite size matched to the right-hand portrait area is still an adaptation until those transforms are emulated. Full portrait projection and party action popup are the precise remaining research limits.

Validation: all14 backgrounds and9 tab PNGs open successfully;13 stats windows,8 touch rectangles, physical LCD mapping and memo bank contents checked. Research previews and dumps remain outside src under work/summary-research and work/summary-*.py/txt.

Move row geometry certified021DB5F0/021DB6C4: anchors(8,16),(8,48),(8,80),(8,112), hitbox136×32. Rowtext window starts40px right of actor,88×32. Window-local name(3,2);PP label(13,17),currentPP right57,slash(57,17),maxPP(61,17). Type actor is rowanchor+(26,9), plus NCER origin. Font0, packed textcolor0x440. Correct panels NCGR15/NCER81/NANR132 use NCLR5, loaded to spritepalette slots11..12; groups.movePanels replaces the older unverified palette0 variant. Native selectedcell5;normalcells0..3. Full data in native.moveRows. Tab state mapping verified: Info0normal/3selected/6disabled;Mosse1/4/7;Fiocchi2/5/8, origins(3,2).


Final checkbox semantics certified: register/unregister the current Summary page in the shortcut menu. Click action3 at021D5434 toggles rootstate[0x60+4*page]. Exit021D4384..4390 saves ID7+page via02012BE0→0200C418. The underlying save list holds25 ID slots with sentinel25; setter inserts/removes the ID and getter02012BF8→0200C44C checks membership. Consumer is overlay10 event_shortcut_menu.c:0215FE32/FE5C uses0200C468 to count registered shortcuts and0216018C reads0200C464. IDs7Info,8Mosse,9Fiocchi. The checkbox never flips the portrait; native portrait front/back gesture belongs to p_sta_sub. Four source checkbox cells6/7/20/21 now live in groups.toggle with anchor(124,172) and hitbox(120,168,24,24).

Info Number value correction: native formatted helper uses stackX65, messageID9; the earlier x22 metadata was a transcription error. native.infoText[1].x is now65. Common nickname/Lv header is MAIN/BOTTOM BG1window(152,0,104,32), nickname local(25,1),gender(89,1),level(9,17). Top Info header DatiPokémon is baked into SUBheader65; do not add nickname/Lv text on top of it.
