# IRBI field-model animations

The ROM was read locally. `tools/extract-field-models.py` exports converted GLB
geometry/animation and decoded material-alpha samples; no ROM, overlay or NARC
binary is included in the site. The extractor validates the actual IRBI event
command table and class lookup table before exporting. No BW2 archive indices
are assumed.

## Commands and selection

IRBI overlay10, command table offset `0x1b4bc`:

| Command | IRBI overlay21 handler | Meaning |
| --- | --- | --- |
| 295 BMCreateHandleByGPos | 021B2C34 | output variable, class filter, grid X, grid Z |
| 296 BMReleaseHandle | 021B2C98 | release handle, restore original static instance |
| 297 BMHndAudioVisualAnmPlay | 021B2CBC | handle, animation-set index; play and corresponding sound |
| 298 BMHndAnmWait | 021B2D60 | wait until current animation finishes |

The second create argument is a **class filter**, not a model ID. The handler
converts grid coordinates to signed 16.16 coordinates (`<<16`). Selection calls
0218C6D8 → 0218C554 → 0218C538 → 0218C484. The rectangle produced by 0218C8C4
is X±2, Z±3 grid units. Bounds are inclusive. Height is not checked. The native
selector chooses the first matching loaded instance in that rectangle, not
the nearest Euclidean model.

Classification reads the model header's kind at +2 and maps it through
021D3CAC: `[0,1,1,1,2,0,3,4,5,6,7,8,9,1,1,1]`.
Thus kinds 1,2,3,13,14,15 are class1 doors. Kind11 maps to class8.
The renderer temporarily replaces the selected static model (0218C624,
0218C44C), preserves its position/rotation and restores it on release.

## Original resources

| Model | Resource | Clips | Native frames | Sound |
| --- | --- | --- | --- | --- |
| 164 | a/2/2/9 member0, texture a/1/7/6 member0 | door_op / door_cl | 8 / 8 | 1669 / 1670 |
| 165 | same archives/member | door_op / door_cl | 8 / 8 | 1669 / 1670 |
| 140 | a/2/3/0 member5, texture a/1/7/7 member5 | kemuri_event + BMA alpha | 81 | none from this command |

Outdoor parent5 (the three Soffiolieve houses) references child164 with raw
offset `(0,0,20)` Nitro model units, i.e. `(0,0,1.25)` tiles when geometry
uses 16 units/tile. Parent6 (laboratory) references child165, raw `(8,0,16)`.
Parent4 also references164. The exported auxiliary door models93/101/103 are
available for inspection, but their export does not expand the opening scope.
93 is a different kind2 sliding door with sound1671 for both clips.

The bundled metadata keeps original header/model offsets and SHA-256 hashes
of each model and animation resource. Header+16 defines mode2 (explicit sets),
byte+18 gives animations per set and byte+19 the number of sets. Doors have
one BCA per set and two sets; model140 has two resources in one set (BCA+BMA).

**The class8 command in bedroom script782 is not a door or a TV.** At pc1093
the script creates class8 at `(8,1)`, plays set0 at1103, waits at1117 and releases
at1121. This selects model140, the original bedroom smoke/replacement effect.
The GLB preserves its `kemuri_event` joint animation. Four original BMA tracks
(`aa_kemuri_01`, `aa_kemuri_02`, `bb_kemuri_01`, `kemuri_01`) are exported as
81 alpha samples each, in the native 0..31 range. They must be applied by
material name alongside the BCA rather than using a generic opacity fade.

Explicit exterior door commands in script778 create class1 at `(777,740)`:
pc495/play505/wait511; later pc744/play754/wait760, close849/wait857/release861.
These select the laboratory child165. The first handle is not explicitly
released by that script before the next scene transition; world lifecycle
cleanup must prevent an orphaned replacement from persisting across maps.

## Playback and automatic warp transitions

0218C78C stores the animation-set index and dispatches mode2 via0218C2B0.
0218C2E0 selects the set, resets its frame and starts it. The per-field update
0218C0C4 advances a live forward clip by `0x1000`, i.e. one Nitro frame.
0218C7D8/0218C33C check completion and switch to a held end state. An eight
frame door clip is therefore genuinely eight animation steps; it is not a
generic eight-tick wait for every model. Model140 requires81 steps.

The native audio lookup is0218C844, six rows at021D3C70. Kind1 maps opening
to1669 and closing to1670. The sound starts when Play starts, not after Wait.

The automatic warp code reuses the same class1 selector (021A8114), open helper
021A8178, close helper021A81A8 and completion helper021A8144. Two tasks differ:

- **Before leaving the current map through a door**: task021A7D3C (caller
  021BD5FC) computes the position in front of the actor using021A801C. With a
  door, its sequence is `[0,3,1,2,5,6,7,8]`. State3 starts opening, state1 starts
  the actor's movement (021BDC04), state2 polls that movement, then the
  transition proceeds. The completion-helper state4 exists but is not in this
  particular sequence: do not insert an extra blocking door wait on this path.
  This task contains no closing call. Do not add a visible close before fading
  away into a house simply for symmetry.
- **After loading the destination map with a door**: task021A7A20 (caller
  021BD968) selects around the actor's current location through021A800C. The
  usual front/back facing sequence is `[0,1,5,2,3,4,6,7,8]`: state5 starts
  the actor's passage mode, state2 starts opening, state3 waits, state4 starts
  the exit transition, state6 starts closing,
  state7 waits, then state8 releases. For the other facing orientations the
  ordering is `[0,1,2,3,4,5,6,7,8]`. This is relevant when emerging outdoors
  from a house; the visible exterior door opens and closes after the actor
  steps out.

Those numeric state tables are read directly from the stores at021A7AB6 and
021A7AFE (destination), and021A7DC0 (source). The task switches at021A7BE8 and
021A7E38 identify their handlers. Details of black/white fade, actor visibility
and exact passage timing remain separate field-transition work; this document
does not claim a frame-by-frame certification of the complete warp sequence.

## Limits and validation

`tickRate:30` is the current **web field adaptation**, not a newly certified
hardware frame rate. The ROM proves one native animation frame per field
update; conversion from field updates to real seconds still needs comparison
against console/emulator capture. HD-2D camera, lighting and projection remain
intentional adaptations.

Apicula exports the actual Nitro BCA joint curves; CPU skinning must evaluate
them at the requested frame. The exporter currently decodes BMA alpha only
when color channels are constant, and fails on unsupported alpha sampling.
It does not silently invent missing curves. GLB animation indices, frame
counts, material names and source hashes were inspected after export. Browser
integration and visual QA belong to the runtime implementation, not this
research-only extraction.
