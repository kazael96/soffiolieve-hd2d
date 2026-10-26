# IRBI field effect scope, 26 October 2026

Only two authored `PlayFieldEffect` instructions occur in the extracted opening:
script792 PC741 arg50, PC751 arg51. The branch is TrainerCardGetSex; native
message435:19 says the player obtains the Pokédex. These are not Interpoké effects.

## Native command and resources

- EVCMD_TABLE overlay10 offset1b4bc; entry415 points021c8011.
- Handler overlay21 021c8010 reads one u16 using02011330, truncates to8bits,
  calls021c1b94, registers its returned task with0215887c. It blocks script
  continuation until the returned task is finished.
- Task021c1d60 performs display preparation, resource loading, animation and
  restoration. Resource loader021c23d4 reads enum117 descriptor; actual ARM9
  path table begins020a6b58. Enums115/117 resolve a/1/1/5 and a/1/1/7.
- Descriptor50 (36bytes, little-endian u16):
  8,0,0,0,9,180,0,0,11,12,65535,65535,13,14,65535,65535,0,0.
  Descriptor51 differs only in model180→181.
- a/1/1/5 resources:8 SPA;9 BMD get1_bg;11 BCA get1_bg;12 BMA get1_bg;
  180/181 BMD get1_zukan_m/w;13 BCA get1_item;14 BMA get1_item.
- Both BMA tracks have71frames; BCA headers have54(background)/70(item).
  ARM9 02047838 increments animations by one FX32 unit/tick and clamps to
  last frame on completion. Task waits for model tracks AND SPL completion;
  71frames is animation length, not a verified total wall-clock duration.

## Camera and particles

Model camera initializer021c19d8:
eye[0,0,128], target[0,0,0], up[0,1,0], perspective sin1398/4096,
cos3850/4096, aspect0x1555/4096, near1, far1024. Native struct0xc defaults0
and selects this perspective camera (021c1b30). An alternative orthographic
camera exists but has no verified selection for effects50/51.

Descriptor first word8 is an SPA index, NOT a camera curve. SPA8 contains
one emitter and one A3I5 32×32 texture. Resource loader021c2204 loads it;
021c2098 starts emitter0 when delay0 expires on the first animation update,
using021c238c→ARM9 0205154c. Emitter callback021c23a0 copies the original
resource position and adds raw FX32 64 to Z, i.e.64/4096 world units.
The resource emits3particles per interval for4ticks, particle lifetime32
with attenuation calculation in SPL, no randomized lifetime. Scale, alpha,
rotation and gravity originate from the SPA. Whole task checks SPL active
emitter count via021c1998→02051594 before restoration.

## Verified limits

- Native model perspective is established. SPL owns a separate render camera;
  its precise projection relative to the model camera was not established here.
- Display preparation includes screen capture and GPU state changes. No
  verified literal fade-in/out duration for these two effects was found.
- Scheduling/display startup/restore ticks and30Hz vs60Hz wall-clock timing
  need an emulator frame comparison. Do not label71 animationframes an exact
  total duration, or introduce an invented fade to conceal the transition.
- Independent JS SPL RNG remains an adaptation, not the console global RNG.
- Runtime field-effects.js plays the exported BCA/BMA tracks and SPA emitter on
  the existing 30Hz web field clock. It blocks the event until playback ends.
  The 4:3 transparent overlay preserves the HD-2D scene underneath. Its SPL
  projection uses the verified model camera as an adaptation; this is not a
  verified recreation of the separate console SPL camera. No invented fade.
- The exporter writes only converted GLBs/textures, decoded metadata and hashes.

## Deliverables

Repository: tools/extract-field-effects.py; src/field-effect-assets.js;
src/assets/field-effects/{background,dexM,dexF}/ and particle-8-0.png.
Research descriptors.json records resource SHA256/size; it includes duplicate
member0 entries because its raw scan did not distinguish descriptor delay slots.
The exporter uses the verified layout and does not treat those zeros as assets.
