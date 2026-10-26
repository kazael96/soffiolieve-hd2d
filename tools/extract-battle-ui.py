"""Extract verified IRBI battle UI resources, without guessing final screen placement.

The archive also contains models. Export only identified 2D resources; no ROM,
overlay, or raw Nitro files are copied to the destination.
"""
from pathlib import Path
import argparse,hashlib,json,struct,importlib.util
import ndspy.rom,ndspy.narc,ndspy.lz10
import ndspy.codeCompression
from PIL import Image

SIZES=[[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]

def extract(rom,output):
 assert rom.idCode==b'IRBI','Italian Pokemon Black (IRBI) required'
 archive=rom.getFileByName('a/0/1/1');files=ndspy.narc.NARC(archive).files
 files=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in files]
 assert len(files)==222 and files[165][:4]==b'RGCN' and files[166][:4]==b'RECN'
 dest=output/'assets/battle-ui';dest.mkdir(parents=True,exist_ok=True)
 def palette(i):
  b=files[i];assert b[:4]==b'RLCN'
  return[tuple(((v>>s)&31)*255//31 for s in(0,5,10))for v, in struct.iter_unpack('<H',b[40:40+struct.unpack_from('<I',b,32)[0]])]
 def pixels(i):
  b=files[i];assert b[:4]==b'RGCN'
  return b[48:48+struct.unpack_from('<I',b,40)[0]]
 def cells(c,p,n):
  raw=pixels(c);cols=palette(p);b=files[n];assert b[:4]==b'RECN'
  count,kind,off,mapping=struct.unpack_from('<HHII',b,24);start=24+off;stride=16 if kind else 8;base=start+count*stride;result=[]
  for i in range(count):
   if c==115 and i>7 and i!=18:continue # only expose a labelled untransformed source for18
   num,flags,offset=struct.unpack_from('<HHI',b,start+i*stride);im=Image.new('RGBA',(512,256))
   for j in reversed(range(num)):
    a0,a1,a2=struct.unpack_from('<HHH',b,base+offset+j*6);assert not a0&0x300 or(c==115 and i==18),(c,i,j,hex(a0))
    x,y=a1&511,a0&255;x=x if x<256 else x-512;y=y if y<128 else y-256
    w,h=SIZES[a0>>14][a1>>14];tile=(a2&1023)*(32<<mapping);pal=(a2>>12)*16;obj=Image.new('RGBA',(w,h));pix=obj.load()
    for yy in range(h):
     for xx in range(w):
      pos=tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2;ci=(raw[pos]>>(4*(xx%2)))&15;pix[xx,yy]=(*cols[pal+ci],255 if ci else 0)
    if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    im.alpha_composite(obj,(256+x,128+y))
   box=im.getbbox()or(256,128,257,129);image=im.crop(box);name=f'cell-{c}-{n}-{i}.png';image.save(dest/name)
   record={'path':'assets/battle-ui/'+name,'cell':i,'bounds':[box[0]-256,box[1]-128,image.width,image.height]}
   if c==115 and i==18:record.update({'untransformedAffineSource':True,'screenPlacementVerified':False,'semanticRoleVerified':False,'note':'Original OBJ texture arrangement only; affine/double-size matrix and origin correction not applied. Not a certified final moves panel.'})
   result.append(record)
  return {'char':c,'palette':p,'cellmap':n,'cells':result}
 groups={}
 # These are native image/cell groupings, not invented semantic screen layouts.
 for c,p,n in[(115,116,117),(119,116,120),(189,190,191),(165,162,166),(168,162,169),(171,162,172),(174,162,175),(177,162,178),(183,162,184),(186,162,187)]:groups[str(c)]=cells(c,p,n)
 # 114 is a 512x512 NSCR image: decoded as a source image, not a DS screenshot.
 raw=pixels(113);cols=palette(92);b=files[114];w,h=struct.unpack_from('<HH',b,24);assert(w,h)==(512,512)
 im=Image.new('RGBA',(w,h));pix=im.load()
 for y in range(h):
  for x in range(w):
   t,=struct.unpack_from('<H',b,36+((y//8)*(w//8)+x//8)*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8;ci=raw[(t&1023)*64+yy*8+xx];pix[x,y]=(*cols[ci],255 if ci else 0)
 im.save(dest/'touchscreen-sphere-source.png')
 # Text BG map uses DS 32x32 screen-block ordering, unlike affine sphere source.
 # Preserve complete maps and first256x192 view; scroll/copy selection is not certified.
 layers=[]
 for screen in range(104,113):
  b=files[screen];w,h=struct.unpack_from('<HH',b,24);raw=pixels(91);cols=palette(92);im=Image.new('RGBA',(w,h));pix=im.load()
  for y in range(h):
   for x in range(w):
    tx,ty=x//8,y//8;idx=((ty//32)*(w//256)+tx//32)*1024+(ty%32)*32+tx%32
    t,=struct.unpack_from('<H',b,36+idx*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8;ci=(raw[(t&1023)*32+yy*4+xx//2]>>(4*(xx%2)))&15
    if ci:pix[x,y]=(*cols[(t>>12)*16+ci],255)
  im.save(dest/f'command-source-{screen}.png');im.crop((0,0,256,192)).save(dest/f'command-view-{screen}.png')
  layers.append({'char':91,'screen':screen,'palette':92,'source':f'assets/battle-ui/command-source-{screen}.png','view':f'assets/battle-ui/command-view-{screen}.png','crop':[0,0,256,192],'sourceSize':[w,h]})
 result={'source':'IRBI a/0/1/1','archiveSHA256':hashlib.sha256(archive).hexdigest(),'groups':groups,'sphere':{'path':'assets/battle-ui/touchscreen-sphere-source.png','char':113,'screen':114,'palette':92,'size':[512,512]},'placementVerified':False,'notes':'Cell bounds are native signed OAM origins relative to the cell; not absolute DS screen positions. Source sphere is not a final 256x192 composite.'}
 result['commandLayers']=layers
 # Native top-screen message window; preserve its original eight source tiles.
 msg_raw=pixels(89);msg_pal=palette(90);strip=Image.new('RGBA',(64,8))
 for y in range(8):
  for x in range(64):
   pos=(x//8)*32+y*4+(x%8)//2;ci=(msg_raw[pos]>>(4*(x%2)))&15
   if ci:strip.putpixel((x,y),(*msg_pal[ci],255))
 strip.save(dest/'message-tiles-89.png')
 result['messageWindow']={'source':'IRBI ov93 021EAF64 palette90;021EAFBE char89;021EB00A–021EB01A WindowCreate;021EB03A fill12','bg':1,'screen':'main/top','tilePosition':[1,19],'tileSize':[30,4],'pixelRect':[8,152,240,32],'palette':90,'paletteBank':0,'fillIndex':12,'fillColor':msg_pal[12],'paletteColors':msg_pal,'tiles':{'path':'assets/battle-ui/message-tiles-89.png','char':89,'size':[64,8]},'font':0,'fontSource':'ov93 021E8EA8 passes ctx+B0 loaded as font0 into021EAE7C controller+24','note':'Window interior and source tiles are certified. Tile-frame assembly, exact glyph color and baseline still require printer trace; do not invent a field-style bevel.'}
 # IRBI ov94 02204BC0 +02204F7E load a/0/1/1 palette by move type,
 # first16 colors into BG palette bank9+i. Source111 is scrolled to256,192.
 overlay=bytes(rom.loadArm9Overlays([94])[94].data);obase=0x21f6460
 type_palettes=list(struct.unpack_from('<17I',overlay,0x220a4f0-obase));assert type_palettes[:3]==[194,200,203]
 source=files[111];raw=pixels(91);panels={}
 for move_type,pal_index in list(enumerate(type_palettes))+[('empty',193)]:
  cols=palette(pal_index);im=Image.new('RGBA',(128,48))
  for y in range(48):
   for x in range(128):
    sx,sy=x+256,y+224;tx,ty=sx//8,sy//8;idx=((ty//32)*2+tx//32)*1024+(ty%32)*32+tx%32;t,=struct.unpack_from('<H',source,36+idx*2)
    xx=7-sx%8 if t&1024 else sx%8;yy=7-sy%8 if t&2048 else sy%8;ci=(raw[(t&1023)*32+yy*4+xx//2]>>(4*(xx%2)))&15
    if ci:im.putpixel((x,y),(*cols[ci],255))
  name=f'move-panel-type-{move_type}.png';im.save(dest/name);panels[str(move_type)]={'path':'assets/battle-ui/'+name,'palette':pal_index,'size':[128,48]}
 result['moves']={'source':'IRBI ov94 02204BC0,02204F7E,0220375C; ARM9 020422E0','char':91,'screen':111,'bg5Offset':[256,192],'panelSourceRect':[256,224,128,48],'panels':panels,'namesLocal':list(struct.iter_unpack('<2I',overlay[0x220a3ac-obase:0x220a3cc-obase])),'ppLabelLocal':list(struct.iter_unpack('<2I',overlay[0x220a4b0-obase:0x220a4d0-obase])),'ppValuesLocal':list(struct.iter_unpack('<2I',overlay[0x220a4d0-obase:0x220a4f0-obase])),'textWindowOffsetVerified':False,'note':'Name X and PP-value X are centered, not left anchors. Tables are local to text window; visual alignment indicates top32px but constructor still to verify. States/focus colors not yet mapped.'}
 Image.open(dest/'command-source-111.png').crop((256,192,512,384)).save(dest/'moves-layer-111.png')
 result['moves']['layerPath']='assets/battle-ui/moves-layer-111.png'
 result['moves']['ppColorIndices']={'source':'IRBI ov94 02205668','normal':[1,2,0],'half':[3,4,0],'quarter':[5,6,0],'zero':[7,8,0],'note':'Index triplets foreground/shadow/background, NOT RGB colors. Native active text palette must be established before assigning colors. MaxPP<=2:1PP uses quarter; MaxPP3..7:1PP quarter,2PP half; otherwise thresholds floor(max/4) and floor(max/2). FullPP always normal.'}
 result['moves'].update({'textWindowOffsetVerified':True,'textWindow':{'source':'IRBI ov94 022021D8–022021EA ->02045070; buffer020456F0 ->manager+22C','bg':6,'tilePosition':[0,4],'tileSize':[32,12],'pixelOffset':[0,32],'paletteBank':13},'namesScreen':[[64,42],[192,42],[64,90],[192,90]],'ppLabelScreen':[[51,58],[179,58],[51,106],[179,106]],'ppValuesScreen':[[90,58],[218,58],[90,106],[218,106]],'panelPositions':[[0,32],[128,32],[0,80],[128,80]],'note':'Name X and PP-value X are centered, not left anchors. Text-window origin0,32 verified from constructor. Focus/pressed state transformation still to complete.'})
 result['moves']['ppColorIndices']['paletteSource']='IRBI a/0/1/1:92 bank13, verified via window paletteBank13'
 result['moves']['ppColorIndices']['colors']={name:{'foreground':palette(92)[13*16+fg],'shadow':palette(92)[13*16+sh]}for name,fg,sh in [('normal',1,2),('half',3,4),('quarter',5,6),('zero',7,8)]}
 result['moves']['ppColorIndices']['note']='Triplets foreground/shadow/background indices in verified palette92 bank13. MaxPP<=2:1PP uses quarter; MaxPP3..7:1PP quarter,2PP half; otherwise thresholds floor(max/4), floor(max/2). FullPP always normal.'
 arm=ndspy.codeCompression.decompress(rom.arm9);type_pals=list(arm[0x209fbf0-rom.arm9RamAddress:0x209fbf0-rom.arm9RamAddress+17]);assert type_pals==[0,0,1,1,0,0,2,1,0,0,1,2,0,1,1,2,0]
 ui=ndspy.narc.NARC(rom.getFileByName('a/0/8/3')).files;pb=ui[33];pc=[tuple(((v>>s)&31)*255//31 for s in(0,5,10))for v, in struct.iter_unpack('<H',pb[40:40+struct.unpack_from('<I',pb,32)[0]])];labels={}
 for move_type,pal_bank in enumerate(type_pals):
  b=ui[34+move_type];raw=b[48:48+struct.unpack_from('<I',b,40)[0]];im=Image.new('RGBA',(32,16))
  for y in range(16):
   for x in range(32):
    pos=((y//8)*4+x//8)*32+(y%8)*4+(x%8)//2;ci=(raw[pos]>>(4*(x%2)))&15
    if ci:im.putpixel((x,y),(*pc[pal_bank*16+ci],255))
  name=f'type-{move_type}.png';im.save(dest/name);labels[str(move_type)]={'path':'assets/battle-ui/'+name,'char':34+move_type,'palette':33,'paletteBank':pal_bank,'size':[32,16]}
 result['moves']['typeLabels']={'source':'IRBI ARM9 02027564 arc83,02027568 pal33,02027578 char34+type; palette bank table0209FBF0','labels':labels}
 # Battle Bag is a distinct archive/app: IRBI ov197, not the field Bag88.
 ms=importlib.util.spec_from_file_location('menu_graphics',Path(__file__).with_name('extract-menu.py'));mg=importlib.util.module_from_spec(ms);ms.loader.exec_module(mg)
 result['moves']['emptyPanel']=panels.pop('empty')
 result['moves']['emptyPanel']['source']='IRBI ov94 02204F48: moveID0 selects palette193; suppresses move name/type/PP'
 result['moves']['pressed']={'source':'IRBI ov94 02206478,0220653C','paletteBanks':[9,10,11,12],'paletteMaskTable':'0220A350','blendColorBGR555':32767,'coefficientSequence':[0,8,0],'coefficientDenominator':16,'note':'Native task fades selected sub-BG palette bank toward white and back. Exact frame duration not yet certified.'}
 result['moves']['keyCursor']={'source':'IRBI ov94 022033E2,022063CC','char':119,'palette':116,'cellmap':120,'animation':121,'cells':groups['119']['cells'],'animations':mg.animations(files[121]),'note':'Original magenta/white corner brackets. Cell OAM origins retained; external actor positioning must use original touch rectangles.'}
 result['moves']['touchRects']={'source':'IRBI ov94 MoveScreenMain02202FF0/02203140 buttonset0220A29C ->rects0220A3CC','encoding':'top,bottom,left,right; right255 is native right-screen sentinel','moves':[[0,32,128,48],[128,32,127,48],[0,80,128,48],[128,80,127,48]],'cancel':[176,144,79,48],'raw':list(struct.iter_unpack('<4B',overlay[0x220a3cc-obase:0x220a3cc-obase+28]))}
 result['moves']['keyCursor']['actorSequences']=list(struct.unpack_from('<6I',overlay,0x220a480-obase))
 result['moves']['keyCursor']['actorSequenceSource']='IRBI ov94 02205D80 copies six u32 from0220A480;02205E18/20 selects sequence per actor'
 bag_arc=rom.getFileByName('a/0/9/9');bf=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(bag_arc).files];assert len(bf)==17 and bf[0][:4]==b'RGCN'
 bd=dest/'bag';bd.mkdir(exist_ok=True);bs=bf[3];bw,bh=struct.unpack_from('<HH',bs,24);assert(bw,bh)==(512,512);raw=bf[0][48:48+struct.unpack_from('<I',bf[0],40)[0]];bc=mg.pal(bf[1]);base=Image.new('RGBA',(bw,bh));px=base.load()
 for y in range(bh):
  for x in range(bw):
   tx,ty=x//8,y//8;idx=((ty//32)*2+tx//32)*1024+(ty%32)*32+tx%32;t,=struct.unpack_from('<H',bs,36+idx*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8;ci=(raw[(t&1023)*32+yy*4+xx//2]>>(4*(xx%2)))&15
   if ci:px[x,y]=(*bc[(t>>12)*16+ci],255)
 base.save(bd/'source-3.png');bag_views={}
 for label,rect in [('categories',[0,0,256,192]),('list',[256,0,256,192]),('detail',[0,256,256,192])]:
  x,y,w,h=rect;base.crop((x,y,x+w,y+h)).save(bd/f'{label}-base.png');bag_views[label]={'path':f'assets/battle-ui/bag/{label}-base.png','sourceRect':rect,'note':'Original512x512BGsource crop; matches native text-window layouts. Animated transition offsets separately unverified.'}
 resources={}
 for screen in range(2,13):
  if screen==3:continue
  im=mg.layer(bf,0,screen,1);im.save(bd/f'layer-{screen}.png');resources[str(screen)]={'path':f'assets/battle-ui/bag/layer-{screen}.png','char':0,'screen':screen,'palette':1,'size':list(im.size)}
 bag_cells=[]
 for i,(im,box)in enumerate(mg.cells(bf,13,15,14)):
  im.save(bd/f'cell-{i}.png');bag_cells.append({'path':f'assets/battle-ui/bag/cell-{i}.png','cell':i,'bounds':box,'note':'Original OBJ source pose; no external affine transform applied.'})
 bo=bytes(rom.loadArm9Overlays([197])[197].data);bb=0x220b020;windows=[{'id':i,'bg':v[0],'tilePosition':v[1:3],'tileSize':v[3:5],'paletteBank':v[5],'pixelRect':[v[1]*8,v[2]*8,v[3]*8,v[4]*8]}for i in range(35)for v in[list(bo[0x220d968-bb+i*6:0x220d968-bb+(i+1)*6])]]
 result['bag']={'source':'IRBI ov197 0220D5DC archive99;0220D968 window table;0220B148 category text;0220D698 bank17','archive':'a/0/9/9','archiveSHA256':hashlib.sha256(bag_arc).hexdigest(),'sourcePath':'assets/battle-ui/bag/source-3.png','views':bag_views,'resources':resources,'cells':bag_cells,'animations':mg.animations(bf[16]),'windows':windows,'screens':'All35textwindows are BG4/5 (DS sub screen); upper battle scene remains visible. Field Bag88 has different layout.','categories':[{'key':'hp_pp','window':0,'messages':[0,1],'panelRect':[0,8,128,64]},{'key':'balls','window':2,'messages':[7],'panelRect':[128,8,128,64]},{'key':'status','window':1,'messages':[2,3],'panelRect':[0,80,128,64]},{'key':'battle','window':3,'messages':[6],'panelRect':[128,80,128,64]}],'lastUsed':{'window':4,'message':8,'showOnlyWithLastItem':True},'textBank':17,'categoryTextCentered':True,'categoryLineOffsets':[0,16],'categoryTextColorIndices':[15,2,0],'textPalette':{'source':'IRBI ov197 0220D67A–0220D68C loads arc23(member5) at bank12','archive':'a/0/2/3','member':5,'bank':12},'fontSelectionVerified':False,'notes':'Category/list/detail backgrounds and windows are original. Focus/pressed transitions and Bag font caller still to trace.'}
 raw=pixels(164);cols=palette(162);b=files[164];h,w=struct.unpack_from('<HH',b,24);w*=8;h*=8;assert(w,h)==(256,16)
 im=Image.new('RGBA',(w,h))
 for y in range(h):
  for x in range(w):
   pos=((y//8)*(w//8)+x//8)*32+(y%8)*4+(x%8)//2;ci=(raw[pos]>>(4*(x%2)))&15
   if ci:im.putpixel((x,y),(*cols[ci],255))
 im.save(dest/'hp-atlas-164.png')
 result['hpAtlas']={'path':'assets/battle-ui/hp-atlas-164.png','char':164,'palette':162,'size':[256,16],'digits':{str(i):[72+i*8,8,8,8]for i in range(10)},'note':'Digit rectangles identified visually in original256x16NCGR; final HUD placement not certified.'}
 fonts=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files;font_groups={}
 pal=fonts[5];cols=[tuple(((v>>s)&31)*255//31 for s in(0,5,10))for v, in struct.iter_unpack('<H',pal[40:40+struct.unpack_from('<I',pal,32)[0]])]
 for index in(0,1,2,3,4):
  b=fonts[index];assert b[:4]==b'RTFN';glyph,widths,off=struct.unpack_from('<3I',b,32);cw,ch,sz=struct.unpack_from('<BBH',b,glyph);mapping={}
  while off and off+12<len(b):
   first,last,kind,_,nxt=struct.unpack_from('<4HI',b,off);data=off+12
   if kind==0:
    start=struct.unpack_from('<H',b,data)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
   elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',b,data+(c-first)*2)[0]for c in range(first,last+1)})
   elif kind==2:
    n=struct.unpack_from('<H',b,data)[0];mapping.update({chr(c):g for c,g in struct.iter_unpack('<HH',b[data+2:data+2+n*4])})
   else:raise ValueError(kind)
   off=nxt
  chars=sorted(c for c,g in mapping.items()if g!=65535 and(ord(c)<384 or c in '♂♀…éÉ'))
  rows=(len(chars)+15)//16;im=Image.new('RGBA',(16*cw,rows*ch*2));metrics={}
  for k,c in enumerate(chars):
   cell=b[glyph+8+mapping[c]*sz:glyph+8+(mapping[c]+1)*sz];left,width,advance=cell[:3];metrics[c]=[k%16*cw,k//16*ch,left,advance]
   for variant,ink in enumerate((1,15)):
    for y in range(ch):
     for x in range(cw):
      pos=y*cw+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
      if ci in(1,2):im.putpixel((k%16*cw+x,k//16*ch+y+variant*rows*ch),(*cols[ink if ci==1 else 2],255))
  im.save(dest/f'font-{index}.png');font_groups[str(index)]={'source':f'IRBI a/0/2/3:{index}, palette5','path':f'assets/battle-ui/font-{index}.png','cellWidth':cw,'height':ch,'cellBytes':sz,'variantOffset':rows*ch,'glyphs':metrics,'battleRoleVerified':False}
  if index==0:
   pc=palette(90);msg=Image.new('RGBA',(16*cw,rows*ch))
   for k,c in enumerate(chars):
    cell=b[glyph+8+mapping[c]*sz:glyph+8+(mapping[c]+1)*sz]
    for y in range(ch):
     for x in range(cw):
      pos=y*cw+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
      if ci in(1,2):msg.putpixel((k%16*cw+x,k//16*ch+y),(*pc[1 if ci==1 else 9],255))
   msg.save(dest/'font-0-message.png');font_groups['0']['messagePalette90']={'path':'assets/battle-ui/font-0-message.png','source':'IRBI ov93 021ECDCC r0=1,r1=9,r2=12 ->0201DD78;021ECDE0 font0;021ECE02/04 printer x0,y0','foreground':pc[1],'shadow':pc[9],'fontSelectionVerified':True,'paletteVerified':True}
   result['messageWindow'].update({'textColorIndices':[1,9,12],'textLocalOrigin':[0,0],'textScreenOrigin':[8,152],'printerSource':'IRBI ov93 021ECDB8–021ECE04','note':'Original text window and font0 colors/origin certified. Frame assembly remains separate from interior; blending hardware changes displayed background intensity.'})
  if index==2:
   pc=palette(162);hp=Image.new('RGBA',(16*cw,rows*ch))
   for k,c in enumerate(chars):
    cell=b[glyph+8+mapping[c]*sz:glyph+8+(mapping[c]+1)*sz]
    for y in range(ch):
     for x in range(cw):
      pos=y*cw+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
      if ci in(1,2):hp.putpixel((k%16*cw+x,k//16*ch+y),(*pc[1 if ci==1 else 4],255))
   hp.save(dest/'font-2-hp.png');font_groups['2'].update({'battleRoleVerified':True,'role':'HP names','hpPalette162':{'path':'assets/battle-ui/font-2-hp.png','source':'IRBI ov93 021E8E7E font2->ctx+B4;021E903A->ov94 021F7454/021F7654->02206AC8+8;02208052 fg1/sh4;pal162','fontSelectionVerified':True,'paletteVerified':True,'foreground':pc[1],'shadow':pc[4],'nameCanvas':[64,16],'localOrigin':{'normal':[8,5],'whenTextWidthOver48':[2,5]},'note':'Coordinates in native64x16namecanvas, not absolute HUD screen coordinates.'}})
  if index in(0,1):
   pc=palette(92)[13*16:14*16];states=[('normal',1,2),('half',3,4),('quarter',5,6),('zero',7,8)];battle=Image.new('RGBA',(16*cw,rows*ch*4));state_meta={}
   for variant,(state,fg,shadow) in enumerate(states):
    state_meta[state]={'offsetY':variant*rows*ch,'foreground':pc[fg],'shadow':pc[shadow]}
    for k,c in enumerate(chars):
     cell=b[glyph+8+mapping[c]*sz:glyph+8+(mapping[c]+1)*sz]
     for y in range(ch):
      for x in range(cw):
       pos=y*cw+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
       if ci in(1,2):battle.putpixel((k%16*cw+x,k//16*ch+y+variant*rows*ch),(*pc[fg if ci==1 else shadow],255))
   battle.save(dest/f'font-{index}-battle.png');font_groups[str(index)]['battlePalette13']={'path':f'assets/battle-ui/font-{index}-battle.png','paletteSource':'IRBI a/0/1/1:92 bank13; window022021D8','paletteVerified':True,'fontSelectionVerified':False,'states':state_meta}
  if index==1:
   pb=fonts[7];pc=[tuple(((v>>s)&31)*255//31 for s in(0,5,10))for v, in struct.iter_unpack('<H',pb[40:40+struct.unpack_from('<I',pb,32)[0]])]
   white=Image.new('RGBA',(16*cw,rows*ch))
   for k,c in enumerate(chars):
    cell=b[glyph+8+mapping[c]*sz:glyph+8+(mapping[c]+1)*sz]
    for y in range(ch):
     for x in range(cw):
      pos=y*cw+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
      if ci in(1,2):white.putpixel((k%16*cw+x,k//16*ch+y),(*pc[ci],255))
   white.save(dest/'font-1-white-pal7.png');font_groups['1']['whitePalette7']={'path':'assets/battle-ui/font-1-white-pal7.png','source':'IRBI a/0/2/3:1,7','foreground':pc[1],'shadow':pc[2],'roleVerified':False,'note':'Native white/dark-shadow palette; no scaling. Unlike palette5-white variant, shadow is90 rather than164.'}
 result['fonts']=font_groups
 result['fonts']['0']['battlePalette13']['fontSelectionVerified']=True
 result['fonts']['0'].update({'battleRoleVerified':True,'role':'Move selection names and PP'})
 result['fonts']['0']['battlePalette13']['fontSource']='IRBI ov93 021E8E6A/6C font0->ctx+B0;021E8ED8/8EDC ->ov95 06899AF0+8;06899C0E/12->ov94 02201FA0+224;02204BC0'
 result['moves']['font']=0
 spec=importlib.util.spec_from_file_location('irbi_messages',Path(__file__).with_name('extract-original-events.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 text_files=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
 banks={str(i):module.messages(text_files[i])for i in(12,15,16,17)}
 assert banks['15'][69]=='Cosa deve fare {010c:0}?' and banks['16'][1]=='FUGA'
 result['battleText']={'source':'IRBI a/0/0/2:12,15,16,17; UI bank12 loader ov94 02202086; Bag bank17 loader ov197 0220D698','banks':banks,'prompt':{'bank':15,'message':69},'moveName':{'bank':12,'message':0},'ppLabel':{'bank':12,'message':1},'ppValues':{'bank':12,'message':2},'note':'Original formatting tokens and line breaks retained; token substitution is required.'}
 (dest/'provenance.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 return result

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();r=extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output);print(json.dumps({'groups':len(r['groups']),'archiveSHA256':r['archiveSHA256']}))

