# Original Save information panel (IRBI)

The original data panel is overlay34, not a DOM card placed over the X menu.
Field caller ov21 `021A13CC–021A13E2` loads overlay34 (0x22) with02034A44,
then calls entry021EFDA0. That entry initializes the sub-engine only; no
POWCNT1 swap occurs, so its physical LCD remains the field X-menu LCD.

Graphics loader `021F0108` reads archive196, **a/1/9/6**: original char1,
screen0, palette2 into BG4. Exported `assets/save-ui/panel.png` preserves
the source image. Original text windows are BG5 and use palette2 bank2;
the eight six-byte records are at021F0940, read by021F017A–021F019A.

| Bank168 message | Window pixel rectangle | Text local origin |
| --- | --- | --- |
|0 Partita di…|8,0,120,24|0,4|
|1 Date|24,56,80,16|0,0|
|2 Clock|112,56,40,16|0,0|
|3 Location|24,72,120,16|0,0|
|4 Medaglie|24,128,96,16|0,0|
|5 Pokédex|128,128,96,16|0,0|
|6 Tempo di gioco|24,144,128,16|0,0|
|7 Ultimo salvataggio|8,168,240,24|0,0|

Font0 is selected at021F01B6–021F01C0, stored manager+4C. Header printer
021F0246 uses packed0x3580: foreground13/shadow12/background0. Body printers
021F02B8,0320,037A,03D8,045C,04D6 use0x3DC0:15/14/0.
The packing follows ARM9 0201C8E6–0201C924, shifts10/5/0 ->0201DD78.
Original colored atlases and metrics are in the dedicated provenance file,
`font-0-header.png` and `font-0-body.png`; no scaling/reconstructed font.

Pokédex line5 is conditional on story flag0x962 at021F03F2–021F0406.
The last-save line7 appears only when save metadata predicates020071F0==0
and020071EC==1 at021F04E6–021F04F8. Name, location, dates, badges, Pokédex
count and elapsed time are runtime state; no ROM identity or timestamp is
invented. Date/time formatting uses the original bank168 templates.

Confirmation is a separate native popup: ov10 `02169FAC` loads bank168
messages8(SÌ)/9(NO), packed0x39E3, and0216A038 invokes020277CC. Progress
and completion strings remain bank36 messages3/4. This extraction does
not read or write game save data and does not invoke native save routines.

Reproduce after battle-UI font export:

```text
python tools/extract-save-ui.py ROM-IRBI.nds src
```

Remaining scope: badge object graphics/animation and full confirmation
helper rendering are not certified by this panel export. The notebook
panel, text coordinates, font/colors and story/save predicates above are.
