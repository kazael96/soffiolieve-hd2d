# Interface pass 0.14

The X menu uses the IRBI 256×192 background, six original button frames,
selection sprite, native Italian font and original icon shapes. Its order
matches Nintendo's Black manual: Pokémon / Pokédex, Bag / Trainer,
Save / Options. Red handheld character11 is used for Pokédex; character5
is the green Options console. Visually matched palette slots are recorded
in the exporter (Bag10, Save0, Options8, Pokémon3, Trainer6). These are
manual comparisons, not a traced general palette-remapping routine.

A/Z/Enter confirms, B/Escape cancels, X opens/closes the field menu.
Directional keys navigate menu choices. B also runs in the field. Touch
targets follow the drawn buttons. Text speed controls printing; first
confirmation finishes printing, the next advances. Animation and mono/stereo
options affect playback. Their persistence is separate from the story save.

Party reordering persists without requiring the starter to stay in slot1.
Potions heal up to20PS, do not revive, and are consumed only with an effect.
Giving/taking held items exchanges the actual inventory. Discarding consumes
one chosen item. The opening only supplies Potions, Poké Balls and key items.

Battle commands use LOTTA above BORSA / FUGA / POKÉMON, not a four-button
grid. Original command art and HP panel cells are converted from a/0/1/1.
Enemy HP numbers, ability names, type lists and volatile debug text are hidden.
Own HP and EXP remain visible. A Potion can target a healthy, injured reserve
without switching it into battle; healing a reserve does not alter the active
Pokémon's displayed HP. The upper HD-2D view occupies its own canvas area.

## Fidelity limits

This is not a complete byte-for-byte recreation of every DS screen. Party
panel composition, summary, bag actions, trainer card, options, move selection
and message placement are adapted compositions using original resources/text.
The Pokédex list and naming keyboard remain browser adaptations. Main menu
entries unavailable through progress are disabled rather than reflowed.
Some native affine button transforms, exact font selection, cursor movement,
audio mixing, UI animation timings and save-panel details remain unverified.
Font1 was extracted for research but its rendering is not used for battle
labels; the previously verified font0 remains in use.

SCEGLI/TIENI is stored, but every scoped trainer has one Pokémon, so no
post-KO optional switch occurs in this opening. This does not certify that
option for out-of-scope multiple-Pokémon trainer battles. Browser automatic
saves remain, alongside the explicit SALVA command. Existing browser-only
preferences and laboratory controls are not presented as original DS menus.

Validation includes Node rules tests, actual opening-story runtime scenarios,
clean archive-based build checks, and isolated browser fixtures. No ROM,
executable, overlay or raw NARC is published. Physical-phone usability and
complete emulator frame-by-frame comparison are not certified.
