# Pokédex native scrolling model (IRBI)

`tools/extract-dex-scroll.py` exports `DEX_SCROLL_DATA` in src/dex-scroll-data.js. No runtime edits or new images. The source is shared overlay67 frame_list, used by list209 and search210.

## Three coordinates

Use firstIndex (native0x62), selectedVisibleRow (0x5C), and pixel motion separately. Selection callbacks receive firstIndex+selectedVisibleRow. maxFirstIndex is0x64, normally max(0,total-visibleRows). Original tilemap recycling advances firstIndex at the **start** of a row motion and compensates in its tilemap/pixel offset. A browser can render an equivalent continuous position; preserve row-start selection callback timing. Do not reset the selection to row0 on every drag.

## Discrete row motion

Native start0x021B8334 stores signed pixel step0x67, row budget0x68, resets framesLeft0x69, and switches state1. Update0x021B8360..0x021B887E applies constant step per frame. At each row start, framesLeft=rowHeight/abs(step), rowsLeft--, firstIndex changes by sign(step), and sources are recycled; each frame scrollOffset+=step, both active BGs receive the new Y offset, and a callback receives signed step. There is **no per-pixel exponential friction/easing**. All native scoped speeds divide row heights exactly.

24px lists: tiers0..5 steps24,12,8,6,4,3 =>1,2,3,4,6,8 frames per row. Sagoma40px:40,20,10,8,5,4 =>1,2,4,5,8,10 frames. Native config addresses and six exact records are in the catalog.

## Dragging rows and release

Row dragging is based on the native hit-region row index and sampled Y history, not browser pointer timestamp velocity. Init0x021B8B14 remembers originVisibleRow and touchY; delta remains a signed byte0x85. On a changed row (0x021B8C0C), reset stableSampleCount, set pending row and direction. Same-row polls increment the counter; at5 stable samples0x021B8C8E calls0x021B8CF0. For absolute row difference1,2,3,4+, use speed tier3,2,1,0 respectively. Move that many rows, clipped to the edge. Stale/invalid touch or a direction reversal can end the gesture; native gates in0x021B8CF0 and0x021B8DA0 are recorded.

On release, olderY-newerY is the measured displacement; direction must agree with the stored signed-byte gesture. Clamp stableSampleCount to0..5 and select the corresponding threshold row from the original table0x021B93FE:

| Stable samples | Thresholds for first matching tier0..5 |
|---|---|
|0|16,8,6,4,4,4|
|1|32,16,8,6,4,1|
|2|64,40,32,16,8,1|
|3|96,80,64,48,32,1|
|4|112,96,80,64,48,1|
|5|128,112,96,80,64,1|

Choose the first tier whose threshold <=abs(raw displacement). No match means stop. Native0x021B8DA0..0x021B8E96 sets speed from config[11+tier], row budget from0x021B93F8=[32,24,16,10,6,4], and inertiaEnabled1. Clip the batch to available rows. During movement the native sampler can replace the pending momentum batch if new consistent touch input arrives;0x021B8378..0x021B846C handles that path.

**Counter ordering matters.** At a row boundary with inertiaEnabled and rowsLeft==1, increment tier. If tier<6, replace speed and row budget with the next tier's values, clip budget to distance to edge. Then decrement rowsLeft and start the row. If tier==6, keep the existing final budget/speed and consume its last row. Therefore an unbounded release starting at tier0 yields31,23,15,9,5,4 actual rows per stage (87 total), not92. Tier1..5 total56,33,18,9,4. Real scoped lists end much earlier at boundaries. No overscroll or bounce.

Implementable per-frame motion skeleton (gesture detection and tilemap recycling remain separate):

```
if framesLeft == 0:
    if rowsLeft == 0: finishBatch()
    if inertia and rowsLeft == 1:
        tier += 1
        if tier < 6:
            step = direction * speed[tier]
            rowsLeft = min(budget[tier], rowsAvailable(direction))
    framesLeft = rowHeight / abs(step)
    rowsLeft -= 1
    firstIndex += direction
    notifySelectionAtRowStart()
scrollPixels += step
framesLeft -= 1
```

Follow the native stop/bounds gates before starting a zero-row batch. The skeleton expresses verified counter order, not a full replacement implementation.

## Scrollbar and page

Scrollbar target uses ARM9 0x0202ED64 via0x021B8944:

`target=floor(maxFirst*(clamp(y,12,156)-12)/144)`.

Inverse0x0202ED8C via0x021B89B8:

`thumbY=12+floor(144*first/maxFirst)`.

Track touch range8..160 and thumb height8 give center12..156. Handle maxFirst0 explicitly without division. During strip dragging, touch region expands32px each way inY and clips0..191 (0x021B8890..893C). Native0x021B8A74 caps each target batch to currently rendered MAIN-buffer row count and uses maximum speed; repeated batches converge to target. Releasing the strip ends target following without row-gesture momentum.

PageUp/Down (touch actions4/5, D-pad left/right) use min(visibleRows,distance to edge), tier0: seven rows in7frames for normal lists, four in4 for Sagoma, clipped. Source0x021B807C onward. At an already-reached edge, move selection to first/last visible row rather than overscroll.

## Input cadence

Up/down first move the highlight within visible rows, and scroll only at corresponding edge (0x021B7D70..7E62). Native sets post-selection lock0x96=8 and decrements it in state4 (0x021B7A2E..7A64). Edge-scroll processing increments a hold counter capped20 (0x021B82A0), selecting tiers5,4,3,2,1,0 at counters1..3,4..7,8..11,12..15,16..19,20. This counter advances on processed edge-scroll requests, **not every wall-clock frame**. No-direction input resets counter0/selector6; config byte17 supplies the initial selector6 value3. The shared input service0x0203628C supplies directional state; global repeat/debounce initialization and hardware touch filtering have not been traced here.

## Third selected type

Verified original behavior: [A,B]+C ->[B,C]. Native2100x021BE0E0 stores oldB into criteria.byte3, then0x021BE0E6 stores clicked into byte4. ClickA removesA and shiftsB intoA; clickB clearsB; with one type, click that type clears it. Example Grass11,Fire9 plus Water10 yields Fire9,Water10. A runtime retaining Grass11 for this case is incorrect. Full interaction truth table is exported as typeSelection.

## Verification and limits

Exporter asserts IRBI, source overlay base, table addresses and exact six budgets. Every speed divides its native row height. Numerical checks exercise six momentum tiers, scrollbar bounds/inverse and the third-type transition. Native movement uses engine frames; browser implementation should step60Hz. Full gesture-state port, global input service repeat and hardware sampling remain separate integration work; no pixel-perfect claim for an approximation.
