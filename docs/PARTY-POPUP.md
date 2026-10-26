# Original Italian Black party action popup

Files: tools/extract-party-popup.py, src/party-popup-assets.js, src/assets/party-popup/. Six scoped frame/background PNGs plus one native font atlas, no runtime modifications or commits.

Overlay91, base021B6140. Native background loader021B7198 opens NARC76=a/0/7/6: MAIN BG3 uses NCGR15/NSCR20/NCLR6; SUB BG7 uses NCGR14/NSCR19/NCLR5. MAIN BG2 uses NCGR12 and panel-atlas NSCR18. Native021B6CF6..6CFE writes POWCNT1 &=FFFF7FFF, so MAIN is physicalBOTTOM, SUB physicalTOP. Exports retain256×192 visible pixels, transparent color0.

Final party-card rectangles from table021BEB74: (0,8,128,48),(128,16,128,48),(0,56,128,48),(128,64,128,48),(0,104,128,48),(128,112,128,48). Native021BA5A0 initially copies panels128px to the right during entrance animation; final layout uses these table positions. Original panels already exist in PARTY_DETAIL_ASSETS; use the original full-screen backgrounds below them.

The action popup is a native vertical button column on BG0 over the party screen. It does not open another full-screen X menu. Caller021BB9F8 creates020276F8 with anchor32,24tiles, width13tiles,height3tiles, backward alignment1. Generic020279A4 calculates x=32-13=19tiles=152px, y=24-3*counttiles=192-24*countpx. Each button is104×24. Text uses font0, local(10,6). For four normal actions the y positions are96,120,144,168. Field moves can increase the count.

Frame constructor02028258 copies NCGR32 of NARC83=a/0/8/3 as a9-slice of8×8 tiles:0/1/2 top,3/4/5 middle,6/7/8 bottom. No invented bevels or borders. NCLR31 first2palettes are loaded into MAIN BG slots1,2 at02027F32. The normal frame uses source palette1 (slot2); selected source palette0 (slot1). The exported104×24 and64×24 frames exactly repeat the native center/edge tiles. Selection changes the tilemap palette; text remains unchanged. The native selection palette also supports pulsing a color at02027AE0, not included as a time sequence PNG.

Label table021BEB8C maps action IDs to bank157. Default non-egg party flow021B80F6 constructs selectors[0,1,3,4,6,16], where16 is sentinel and1 expands usable field moves. With none usable: INFO(id0,msg109),ORDINA(id3,msg108),STRUMENTI(id4,msg110),ESCI(id6,msg115). Mail replaces STRUMENTI with MESSAGGIO(id5,msg111). ESCI is the original Italian cancellation text, not ANNULLA. B explicitly selects the final row at02027D6C. The catalog exports22 direct action-label slots; action IDs16..19 resolve move names via bank203, not this table.

The compact confirmation021BBA40 has anchor32,18,width8,height3tiles and selectors[14,15,16], where16 is sentinel. It displays action14SÌ(msg177),15NO(msg178). Position x192,y144-24*count; two rows start96,120. Source rectangle covers64×48. It is not the held-item submenu; that separate menu flow is not yet traced.

The adjacent original prompt is a separate BG0 window at(16,152),112×32, native021BB65E..686, palette slot14 for text and frame slot12. Normal selected Pokémon flow021B813C..8154 sets message18: Hai selezionato\\n{0102:0}. Its popup frame is the common message-window frame via0201F6BC, not the action-button9-slice. Geometry/text are exported; no speculative message-frame PNG was added.

The popup context021B66A8 calls02027EE0 with BG0,palette1,font0. Constructor021B70E4 also creates font3 for other party content, so do not globally replace all party text with one font. This popup itself uses font0, matching the existing POKEDEX_ASSETS.font atlas. Normal packed label color is0x39E0 (literal021BBC94): foreground14 white, shadow15 RGB139gray in NCLR31. Field-move label color is0x35E0 (literal021BBC90): foreground13 cyan, same shadow15. PARTY_POPUP_ASSETS.font includes exact NFTR0 pixels recolored through these verified palette indices; variant0 normal/selected,variant1 field moves. The earlier0x440 claim was wrong for this popup; it belongs to field/common text with a different palette.

Proof data and diagnostic frame compositor are outside src under work/party-popup-arm9.txt, work/party-popup-*.py and work/party-popup-proof.png. All exported assets are derived locally from the supplied IRBI ROM.


