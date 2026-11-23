# Native Tynamo framing · revision 064

The single-battle `BattleGround.setActorFraming({owner, actors})` API now prepares
one common actor scale when either current native actor is Tynamo (602). Native
idle CELL alpha, positive-duration parent and track transformations, and every
integer native camera state from both actual move sets determine that scale.
Struggle (165) is included without adding a move or changing PP.

Only actor `height` and `size` change. Ground anchors, world coordinates,
projection, pixels per unit and viewport dimensions remain unchanged. Shadows
and effect anchors continue to consume the shared layout. The factor is cached
for the owner and layout, so transient visibility, Substitute, Minimize and faint
presentation cannot resize an already registered body. Those representations
are not covered by the native-idle envelope proof and cannot initialize a plan.

The compact original-alpha CELL hulls for 495 and 602 include source JSON and
texture hashes. Existing 500 metadata remains unchanged. A different prepared
native opponent uses one bounded cold alpha read; only its envelope is cached,
with no retained canvas or RGBA copy. Image/data/owner/move-set and ground-bound
changes invalidate preparation. An unsupported unchanged input is cached to
avoid repeatedly reading pixels or compiling camera timelines.

CPU verification uses the original candidate-04 PNG/JSON files without editing
their pixels, anatomy, CEL indices or motion. The original opaque Tynamo-back
portrait witness crosses the viewport before registration and fits afterwards.
The 602 mirror at 390×490 has factor `0.37262035947449457`, covering 116 distinct
camera states and 3270 evaluated camera times for moves 33/86/209/451 plus 165.
The same tests cover 602/500 and 602/495 in both roles, three viewport formats,
native pixel samples, source hashes/hulls, owner invalidation and warm caches.
The previous 500 mirror factor remains `0.9255532955407648`.

This is a framing fix. It does not certify authored move-pose bounds, contact,
grounding aesthetics, audiovisual synchronization or GPU output. In particular,
602 back track 1/CEL 6 is a whole fish and has not been relabeled as a tail.
Double and multi battles remain explicitly unsupported by this preparation API.
Their slot projector needs separate work. Full native rendering, move poses and
mixed-slot acceptance must be checked on the new built candidate before release.

The later ×4 command replay exposed skipped motion windows independently of
framing. [TYNAMO-PRESENTATION-064.md](TYNAMO-PRESENTATION-064.md) describes that
separate correction and preserves the failed replay; its CPU pass is not a
transfer of the earlier ×1 visual evidence to the new timing controller.

Run with `SOFFIOLIEVE_TEST_SITE` pointing to the preserved prepared asset build:

```text
node --test --test-isolation=none tests/battle-tynamo-framing064.test.cjs tests/battle-actor-framing064.test.cjs
```

The baseline failure, source-data generator, measurements and CPU logs are under
`outputs/animation-review064-resume-20261123/tynamo` in the workspace.
