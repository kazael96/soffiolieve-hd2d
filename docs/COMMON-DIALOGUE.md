# Native common dialogue frames and field window

Exporter tools/extract-common-dialogue.py produces src/common-dialogue-assets.js (COMMON_DIALOGUE_ASSETS) and6 small PNGs. No runtime changes or commits.

ARM9 APIs0201F53C/0201F55C use NARC5=a/0/0/5. Tables0209E848 and0209E84A select style0→NCGR9/NCLR3, style1→NCGR11/NCLR0. Common border0201F5A8 uses tiles0/1/2,3/4/5,6/7/8 and draws the8px perimeter OUTSIDE a text window. These are exported as24×24 atlases. Transparent source index0 is preserved, including corner transparency.

Party prompt style0 is explicitly loaded at021BB954. Its text window(16,152,112,32) becomes outerframe(8,144,128,48). partyPrompt.png is the128×48 composition with white opaque interior matching native window fill. It is separate from the vertical action-button frame in PARTY_POPUP_ASSETS.

Normal field dialogue has a distinct18-tile border source NCGR10/NCLR3. Native021928E8 loads char10 into BG1 at tile31;02192904..2A12 draws non-contiguous indices relative to31:

|Position|Left|Repeat|Right|
|---|---:|---:|---:|
|Top|0|1|5|
|Middle|6|white text window|11|
|Bottom|12|14|17|

Do not treat char10 as the generic nine consecutive tiles0..8. fieldAtlas.png is the24×24 usable nine-slice with those native source indices, and white center. fieldDialogue.png is the native256×48 composition.

Field default geometry is certified through021B0356→02190EA0/02190ED4: window x1tile,y19tiles,width30tiles,height4tiles on BG2. Therefore pixel interior(8,152,240,32), outer border(0,144,256,48) on BG1. Native02192A42 fills window bytesFF, equivalent to 4bpp color15, opaque white. No green HTML panel or invented outline is part of this resource.

Font0 comes from a/0/2/3 member0; its palette is member5. Packed field color0x440 maps foreground1 RGB(90,82,82), shadow2 RGB(164,164,172), background0 transparent glyph pixels. Window fill15 RGB(255,255,255). Existing POKEDEX_ASSETS.font holds these actual glyph pixels and metrics; use normal variant. Text atlas pixels retain their source opacity. Native field font/context placement should preserve glyph left bearings and15px cell height,16px line spacing.

The shared native advance bitmap is8×8,4bpp ARM9@0209E84C, loaded02020D48→0204367C,32bytes. advanceArrow.png preserves source foreground colors from font palette5; background index15 is exported transparent for compositing over the white window. The field arrow animation itself is certified021927C0: phase advances every4frames modulo3, offsets[0,1,2] from the literal table consumed02192702. Position is window-local(width-8,height-8-offset[phase]), i.e. for the standard window global(240,176-offset). Exact provenance of the field-specific buffer created021926C0 has not yet been linked to that shared bitmap, so catalog fieldBitmapIdentityFullyTraced=false is deliberate. Movement/position are verified; only that bitmap identity remains limited.

Confirmation SÌ/NO frames and native popup font live in PARTY_POPUP_ASSETS. Important correction from earlier research: action popup text does NOT use field color0x440. Literal021BBC94 is0x39E0, foreground14 white and shadow15 RGB139gray from NCLR31 ofa/0/8/3. Field-move text literal021BBC90 is0x35E0, foreground13 cyan with the same shadow. The separate popup font atlas is exported there; no visual guessing was used.
