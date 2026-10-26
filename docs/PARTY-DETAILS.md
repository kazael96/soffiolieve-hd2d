# Additional IRBI party, summary and bag resources

`tools/extract-party-details.py` reads the supplied Italian Black ROM and emits
`src/party-detail-assets.js` (`window.PARTY_DETAIL_ASSETS`) plus 54 scoped PNGs in
`src/assets/party-details/`. It does not change the runtime, `extract-menu.py`
or `menu-assets.js`.

## Native item-icon mapping resolved

The decompressed IRBI ARM9 table at **0x0209EAEC** contains 627 four-byte rows:
`u16 characterMember; u16 paletteMember`. Row index is the actual item ID.
Both resource indices address NARC **a/0/2/5**, with shared NCER1/NANR0.

Native code confirms the lookup: 0x02020E22 shifts the item ID left by two,
0x02020E24 loads table pointer 0x0209EAEC, and 0x02020E26 reads the character
halfword. The corresponding palette lookup at 0x02020E3E–0x02020E42 uses pointer
0x0209EAEE. Loader code around 0x02020ED8 uses NARC ID25 (`a/0/2/5`).
All 627 rows were checked against the actual NCGR/NCLR magic. The table and its
SHA-256 are retained in `itemTable`; only five useful PNGs are shipped.

| Item ID | Italian name, original bank54 | NCGR | NCLR |
| --- | --- | --- | --- |
| 4 | Poké Ball | 8 | 9 |
| 17 | Pozione | 24 | 25 |
| 442 | Mappa Città | 439 | 440 |
| 621 | Interpoké | 825 | 999 |
| 626 | Interpoké | 825 | 826 |

Use `itemGraphics[String(itemId)].src` or `itemMap`. Each entry preserves the
original NCER crop origin and dimensions. The naive alternating NCGR/NCLR
formula fails because many items share graphics or palettes; for example
Interpoké621 and626 share NCGR825 but have different palettes.

## Party components

The existing `menu-assets.js` party atlas is NCGR12/NSCR18/NCLR6 from a/0/7/6.
Seven original 128×48 crops are now separate `images`: partyPink, partyTeal,
partyRed, partyBlueLeft, partyBlueRight, partyBlueRight2 and partyShadow.
The crop coordinates are recorded per image. Their names identify appearance,
not an untraced runtime state; layout and state selection remain the caller's job.

Additional native cell/animation groups from a/0/7/6:

| Group | Character | NCER | NANR | Palette |
| --- | --- | --- | --- | --- |
| partyNavigationBlue | 7 | 21 | 24 | 1 |
| partyNavigationYellow | 7 | 21 | 24 | 2 |
| partySelection | 11 | 23 | 26 | 6 |

The navigation objects visibly contain the original back arrow and close cross.
Palette1 supplies blue, palette2 yellow. Selection objects retain their full
original origins and native translation/SRT animation records. These choices
were visually inspected; the overlay's palette-remapping routine and exact
dynamic placement were not ported or certified.

## Summary and bag components

`summaryTabs`: a/0/7/8, NCGR11/NCER78/NANR129/NCLR0. These are the original
small summary-tab icons in their cell states. `summaryMovePanels`: the same
archive, NCGR15/NCER81/NANR132/NCLR0, original dark and cyan move-row panels.

`images.bagDescriptionPanel`: a/0/8/8, NCGR33/NSCR35/NCLR34, the original
104×32 dark rounded description panel. Existing `menu-assets.js` already
supplies the male/female bag graphics, bagPockets, bagButton, bagCursor and
bagTms groups; they are not duplicated here.

All images are converted original pixels. These exports supply components,
not proof that the browser reproduces the whole native screen composition,
transitions or timing. Unused ribbon objects and alternative palettes remain
outside `src` in the local research workspace.
