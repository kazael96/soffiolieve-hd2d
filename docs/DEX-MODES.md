# Native detail-Pokedex mode resources (IRBI)

`tools/extract-dex-modes.py` exports `window.DEX_MODES_ASSETS` independently
of the existing list/info exporters. All pages belong to overlay208, which
contains native filenames zukan_detail_voice.c and zukan_detail_form.c.

The cry waveform background is NCGR11/NSCR42/NCLR1 source palette bank5.
The native helper021bc8bc transfers that bank to destination0 and remaps
BG2. The procedural waveform window is BG3[8,16,248,120] (021c34fa..350a).
The species-name window on BG6 is[80,40,96,32], with centered text. Cry panel
is NCGR24/NCER30/NANR47/NCLR8; its object-table record is(128,96,animation0,
priority0,engine3,groups3/4/5,flag1), as kept at021c8604. The other six object
records use native navigation resources already exported separately.

Forms loads its upper BG7 panel from NCGR12/NSCR35/NCLR2 bank0 through
021c3db4. Its panel sprites are char10/NCER26/NANR43/NCLR1; arrows and long
panels char16/NCER29/NANR46/NCLR6. Tables021c86a0 (four8-byte records) and
the five native text-window records referenced by021c493c are preserved.
Bank234 provides general labels and bank244 form names. Pokemon rendering
is 3D/model projection in the original, separate from these interface images.
Do not introduce alternate forms merely because an arrow or a field exists.

Shared background helper021bc744 uses resource records at021c7ff0:
main NCLR1/NCGR11/NSCR41, sub NCLR2/NCGR12/NSCR36. Mode palettes are table
bytes021c7fe0 for body and021c7fe8 for footer; the helper transfers32-byte
ranges into the chosen destination banks and rewrites tilemap banks. Forms
main overrides NSCR41 with32. Exported cryLowerCommon/cryUpperCommon,
formsLowerCommon/formsUpperCommon and habitatUpperCommon apply those exact
source palette mappings rather than retaining meaningless staging NSCR banks.

## Default Info upper LCD

The secondary Info instance is not simply discarded. Overlay206
021b9f72..021ba014, mode2/sub, loads NCGR12/NSCR36 at tile offset1024 on its
third BG (BG6). NCLR2 source banks0/1 are copied into destination banks4/5.
The apparent hide routine021ba6c8 disables the first two BGs but moves the
third BG's Y scroll to-256, exposing the alternate map in its second half.
`infoUpperCommon` exports that exact visible256x192 composition, with source
bank0 for the upper21 tile rows and1 for the bottom3. Main is physical
bottom, Sub top, as in the detail dispatcher. There is no duplicate Info
portrait or description on top in this state.

## Upper mode header

Overlay208021be768 initializes BG5 using char14/screen37, with tilemap palette
bank13.021be828 loads NCLR4 source palette bank from table021c83f4:
[0,2,1,3,3] for Info/Zona/Verso/Forme/the remaining mode, into destination13.
The original blank header images are upperHeader0..4. Caption is bank234
message178+mode, rendered at character-image coordinates24,5 through
021be8ac. The original font0 and its native metrics should be used; arbitrary
HTML text is unnecessary. The image includes the original colored frame and
slanted decorative marks; runtime adds the caption.

All static PNGs were rendered and inspected. Native waveform sampling,
3D form-view transforms, habitat-mask blinking and full mode input handling
remain runtime work. Source-resource certainty does not certify those effects.
