# Native Pokédex effects (IRBI)

`extract-dex-effects.py` exports DEX_EFFECTS_ASSETS and three original mask PNGs. No runtime changes.

Habitat uses original pink area silhouettes, not arbitrary squares. Native2080x021C0114..15E loads a/1/5/9 NCGR15, NCER28, NANR45, NCLR5. 0x021C0350..041C creates61 region actors from a/0/8/6:0 town-map records: column24 chooses NANR animation,25/26 set actor x/y. Apply exported NCER origins after anchor placement. Scope needs only cells1,12,7 (animations1,8,12). Dreamyard row18 anchor232,109; Route1 row38 anchor228,144; Route2 row39 anchor227,124; Route3 row40 anchor204,114. Animations are static4-frame sequences.

Original Pokédex distribution is **a/1/7/8**,649members indexed species-1; each249bytes. Byte0 controls seasonal presentation (0 seasonal,1 common); byte1+season*62 says no-area, and byte2+season*62+townmapRow stores method flags. Native loader0x021C1E28; row visibility0x021C2076..20AE. Five scoped species exported: starters none, Patrat rows18/38/39/40 flags1/1/1/3, Lillipup38/39/40 flags1/1/3; allfour seasonal copies agree. This is direct Pokédex distribution data, independently consistent with the existing encounter scan. No encounter dataset is expanded.

The native pulse routine0x021C22BC..2324 writes BLDALPHA before computing next frame alpha. Initial phase32768, alpha1; phase increments1024 modulo65536 eachframe,64-frame period. Alpha=1+((14*((cosFx12(phase)+4096)/2))>>12), ranging1..15. Hardware blend uses alpha/16 for silhouette and (16-alpha)/16 for background. Exporter reads the original ARM9 sine LUT and stores64 integer samples, avoiding approximate sine rounding. Renderer must preserve sourceRGB555 blend behavior and native layer priority to claim pixel identity.

Native208 brightness helper0x021BC36C updates0..16 by±2 perframe; initializers0x021BC3D8 and0x021BC3E4, eight update frames. Output0x021BC420 calls0207D5FC with brightness=value-16. This helper duration is verified, but cross-module Lista/Ricerca/Dettagli routing and full choreography remain under investigation. Do not describe a generic eight-frame fade as the complete original transition.

Validation: masks composited over original town map in work/dex-habitat-masks.png; exact source pixels and anchors checked. Only three scoped PNGs are shipped. Extractor asserts row/member counts, candidate scope, sine range and distribution lengths.

Verified Lista/Ricerca movement components are now `moduleTransitions`:48px total at±8px per update, six movement frames, navigation OBJ inY. List actors3..9, BG5 addY andBG1 subtractY (2090x021BC80C/81C); Search actors2..4, BG4/BG7 addY plus0202CCE4 controller (2100x021BCD0C/58). Entrance uses−8, exit+8. List entrance caller021BCD64, exit021BD168; Search entrance021BD06C, exit021BDFCC. These animate the common header/navigation components; do not translate every screen pixel as one flat surface.

Palette wrapper209021BC630/search210021BC72C calls020216BC for buffers1/2/4/8, targetRGB5550, coefficients0↔16, speed−14. ARM9 decoder02021944 maps negative speed to min(abs(speed)+2,16) withdelay0: coefficient step16, one full-range update. It is not an eight-frame palette fade. Eight-frame brightness applies to the separately traced detail helper only. Teardown/load and state waits prevent claiming one fixed total transition duration without a runtime trace.

