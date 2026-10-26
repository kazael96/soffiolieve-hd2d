# X menu progress and Trainer card final predicates (IRBI)

## X menu reflow

Overlay21 field_menu.c initializer021a8270 calls021a8a18 for progress mode.
The latter tests flag0x961 and0x962 via020142e8 after special map/save modes.
No0x961 =>mode3;0x961 set but no0x962 =>mode2; both set =>mode0.
The seven-word rows at021d8c0c are:

- mode0:1,2,3,4,5,6,0
- mode1:1,2,3,4,6,7,0
- mode2:1,3,4,5,6,7,0
- mode3:3,4,5,6,7,7,0
- mode4:1,2,3,4,6,7,0
- mode5:1,2,3,4,6,7,0

IDs are1 Pokemon,2 Pokedex,3 Bag,4 Trainer,5 Save,6 Options,7 blank.
The create loop021a8ab8 uses the actual sequential slot, not the original
ID as coordinate index.021a8b5a..8b7a computes x64/192,y44/92/140.
Therefore before Pokedex, the order is Pokemon/Bag;Trainer/Save;Options/blank.
Before first Pokemon it is Bag/Trainer;Save/Options;blank/blank. Do not draw
an unavailable gray Dex placeholder and retain the later slots.

NSCR table021d8a2c=(16,18,18,17,18,18), used021a880a..8818. Thus existing
provisional exporter names buttons1(screen18) and buttons2(screen17) mean
five-button and four-button layouts; those names did not certify counts.
Default mode0 uses screen16 with six outlines. The original backgrounds have
not been redrawn or guessed.

## Trainer Pokedex row

Factory overlay10:0216f2fc assembles trainer context.0216f650..65a calls
ARM9:0200d0ac and writes context+0x24.0200d0ac checks national-Dex status and
chooses0200d0cc(national) or0200d0f8(regional). Both count0200d064 seen,
not0200ced4 caught. The opening card's Dex row is therefore Unova SEEN count.

## Trainer reverse side

Native D-pad mask0x30(left/right) in021c4f5a returns action3. Dispatcher
021c55ce maps action3 to021c55e4, state5 invokes021c4a3c card flip. Touch
arrow object6 sits at100,168 from table021c862c, uses animation22 which
selects NCER cell25. Cell25 original origin2,2 and size60x20 are preserved;
paint its trimmed PNG at102,170. Do not use unverified invented button art.

At mid-flip021c4af0 toggles the side and calls021c463c. The reverse-side
selector021c45f4 uses table021c8460=(39,36,38,37). Normal profile bit4=0
chooses NSCR39 male /36 female, with existing NCGR32/28 and rank0 NCLR15/5.
Exported backMaleRank0/backFemaleRank0 are original native reverse backgrounds.
Window6 is BG7[16,16,224,64], row step16; formatter021c6714 draws the current
scroll block from native field renderer021c6258. Its first three fields use
bank187 labels5(ID),6(play time),7(adventure start); later unlocked records
include Hall of Fame and link records. Saved ID, time and start date are
player data, not constants extracted from the ROM. Front window5 is the
EasyChat phrase populated from context+0x6c through202dbc8.

## Native shortcut registration

`src/shortcut-native-meta.js` records the verified page IDs and checkbox
anchors. X-grid handler021a8dec and touch handler021a8efc register nothing:
there is no SELECT/Y/drag path there. The [official Nintendo manual](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/DS_Pokemon_Black),
page16, describes registering from a supported screen's checkbox. Native
Trainer input021c4f7a checks Y(mask0x800), then021c4fdc toggles the current
side's registered flag via02012be0. The checkbox is object7 at180,172,
common NARC83 NCGR20/NCER21/NANR24/NCLR19, animations6(off)/7(on).

Page IDs: summary Info7/Moves8/Ribbons9; Bag Items10/TMHM11/Berries12/
Medicine13/KeyItems14; Dex List15/Search16/Info17/Area18/Cry19/Forms20;
Trainer Front21/Back22/Badges23;Options24. Setter/getter call-site evidence
is recorded in the catalogue. Bag's mapper021bb25c maps pocket0..4 to
[10,13,11,12,14]. Do not confuse these with X-grid entry IDs1..6.
Options checkbox is logicalcontrol6 at48,172, from overlay68 table021bb4d4
(second32-byte record); detail-Dex checkbox is logicalcontrol6 at184,172
from overlay208 table021c8340. The first Options record isConfirm at80,168.

No registration path/ID was found for generic Party or Save in their native
screens. A generic whitelist of Pokemon/Dex/Bag/Trainer/Save/Options therefore
must not be represented as fully native behavior: native shortcuts target
specific supported pages. Key items use separate encoded item mappings.

## Discard quantity and multiple Ready shortcuts (0.16)

`tools/extract-field-popups.py` emits `FIELD_POPUP_ASSETS`, original tilemaps,
Ready marker cells/animations, original Italian bank173 labels and bank3
discard messages. No browser UI/runtime is modified by this exporter.

Bag overlay70:021bb0b8 loads a/0/8/8 NSCR35, places it on BG3 at tile16,12
(128,96), and remaps its tiles to palette3. Its matching native resource
triplet is NCGR33/NSCR35/NCLR34. Image width136 extends beyond LCD256 by8px;
clip the original panel rather than rescale it. Quantity window at021b9b0c
is BG3 tile17,13 width11 height2 = [136,104,88,16]. Bank3 message131 is the
original three-digit formatted quantity; messages53/55/54 are prompt,
confirmation and completion.021b7704 initializes count1.021b7ce8 uses UP+1,
DOWN-1, RIGHT+10, LEFT-10, wrapping above maximum to1 and below1 to maximum.
Touch rectangles from021bb854: increase [234,92,22,24], decrease
[234,116,22,24]. Held touch repeats after30 frames and changes by10 after120.
021bb86c defines confirm [128,96,104,48] and cancel [224,168,24,24]. A opens
Yes/No after quantity; B returns to the Bag. These are not invented OK/EXIT
buttons. Quantity arrow graphics reuse the Bag sprite resources, but their
precise object association has not yet been certified.

Ready menu constructor overlay21:021c4e60 opens NARC128=a/1/2/8, uses BG1
NCGR5/NSCR7/NCLR6 and objects NCGR3/NCER2/NANR1/NCLR4. It overlays the field
on the physical TOP LCD; Nintendo manual p16 screenshot confirms the field
behind this panel. BG palette loading021c4ec6..4ed6 copies the first64 bytes
of NCLR0 to offset0x160, banks11 and12.021c4f14..4f26 copies the first32
bytes of NCLR6 to offset0x140, bank10. Header row11 is explicitly remapped
to bank10; normal/highlight window rows use banks11/12. These palette
changes must be composed by the renderer, not replaced by generic buttons.

021c52ce creates BG1 list window [8,96,240,96], palette11. Template021da96c
has visible row count5, itemX13 local (screen21), top margin8 (screen104),
font0 and16px line height. Native SELECT>SPOSTA header is already embedded
in NSCR7. Marker X table021da940 is [128,10,246]; initial Y96 is updated by
021c58dc to the current row. NCER origins and NANR timing are preserved in
the catalogue.021c5660 resets the window to palette11 and remaps the current
selection row to palette12, including during reordering.

Native capacity25. UP/DOWN navigate. A and Y use selected entry; SELECT
toggles reorder when more than one entry is registered. Reordering remembers
source position, allows destination selection, and0200c480 changes the saved
order. A places the entry; B cancels the reorder. B returns native -2 in
ARM9:0202008e..009e, and X explicitly produces -2 in021c5492. Reorder edge
scroll has a special destination0xff path not fully transcribed here.

Ready Font0 correction: packed template byte+0x17=0x18 means foreground1 and topY8; byte+0x18=0x2f means fill15 and shadow2. ARM9:0201ff18..0201ff66 decodes these fields,020204a4..020204c4 passes them to the printer. Both font atlases now use fg1/shadow2 with native normal/highlight banks11/12. Earlier fg14/shadow15 was incorrect and has been replaced. All mapped Font0 glyphs are exported.

## Quantity arrows and Ready end insertion (0.17)

The remaining quantity-arrow mapping is now certified. Bag loader021b9358..
021b939e opens common NARC83 a/0/8/3 and binds NCGR20, NCER23, NANR26,
NCLR19. Constructor021ba6e6..021ba7790 reads tables021bb958=[97,119] and
021bb95c=[3,2], constructing up/down anchors [232,97]/[232,119], initial
animations3/2. Both objects are initially hidden.021b7c90 shows them and
021b7cc4 hides them when quantity selection ends. Exported quantityControls
includes every original cell origin and animation frame. Change animations
11(up)/10(down) each play pressed4frames, idle4frames, pressed4frames,
idle4frames, native mode1 one-shot. The animation is restarted only after
quantity value actually changes (021b7de8..021b7e0a).

Touch counter increments every engine tick while either arrow is touched,
resets0 outside both. Change occurs tick1, then every tick31..120 by1,
then every tick121+ by10. Switching directly between arrows retains the
counter; any touch over either arrow suppresses keyboard adjustment even
during ticks2..30. Source021b7d16..021b7d82. This is frame/tick based, not
an independent millisecond timer. Numeric wrap still applies. If maximum1
causes unchanged quantity, no press-animation restart occurs.

Ready reorder destination0xff is APPEND, not an arbitrary scroll index.
ARM9:0200c480 removes the moved nativeID first via0200c418; if destination
is255, it finds the first empty slot(sentinel25) and writes nativeID there.
Otherwise, if original sourceIndex<destinationIndex, it decrements the
insertion destination once, shifts following entries and inserts. The
returned value is final index. Moving to its own preceding boundary is
therefore unchanged. In overlay21:021c53ac, DOWN on final row while reorder
is active toggles context+0x40 and moves marker below final row; a subsequent
DOWN clears it and wraps first.021c5324 UP from first wraps to final with
end marker; UP from end marker clears marker without changing row. When
context+0x40 is set,021c5520..5536 passes destination255. B/X cancel still
leaves order unchanged until a placement is actually confirmed.
