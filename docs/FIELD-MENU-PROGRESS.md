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
