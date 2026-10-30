"""Scoped native Pokédex habitat masks and verified animation constants (IRBI)."""
from pathlib import Path
import argparse,importlib.util,json,struct,math
import ndspy.rom,ndspy.narc,ndspy.lz10,ndspy.codeCompression

def extract(rom,out,species_ids=None):
 assert rom.idCode==b'IRBI'
 s=importlib.util.spec_from_file_location('gfx',Path(__file__).with_name('extract-menu.py'));g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
 def files(path):return[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(path)).files]
 f=files('a/1/5/9');rows=list(struct.iter_unpack('<27H',files('a/0/8/6')[0]));hab=files('a/1/7/8');assert len(rows)==61 and len(hab)==649
 anim=g.animations(f[45]);cells=g.cells(f,15,28,5);dest=out/'assets/dex-effects';dest.mkdir(parents=True,exist_ok=True)
 species_ids=species_ids or [495,498,501,504,506]
 area_rows=sorted({i for sid in species_ids for season in range(4) for i in range(61) if hab[sid-1][2+season*62+i]})
 areas={};export={}
 for rowIndex in area_rows:
  row=rows[rowIndex];animation=row[24];cell=anim[animation]['frames'][0][0];im,box=cells[cell]
  if str(cell)not in export:
   name=f'habitat-mask-{cell}.png';im.save(dest/name);export[str(cell)]={'src':'assets/dex-effects/'+name,'origin':box[:2],'size':box[2:],'nativeCell':cell}
  areas[str(rowIndex)]={'zone':row[0],'townmapRow':rowIndex,'animation':animation,'cell':cell,'anchor':list(row[25:27]),'sourceRow':list(row)}
 species={}
 for sid in species_ids:
  b=hab[sid-1];assert len(b)==249
  seasons=[]
  for season in range(4):
   active=[{'row':i,'flags':b[2+season*62+i]}for i in range(61)if b[2+season*62+i]];assert all(str(v['row'])in areas for v in active)
   seasons.append({'noArea':bool(b[1+season*62]),'areas':active})
  species[str(sid)]={'member':sid-1,'header':b[0],'seasonalUI':not bool(b[0]),'seasons':seasons}
 # Exact native sine is table-based; export its full source LUT samples, not math.sin.
 arm=ndspy.codeCompression.decompress(rom.arm9);ov=rom.loadArm9Overlays([208])[208];b=bytes(ov.data);base=ov.ramAddress
 lut=struct.unpack_from('<I',b,0x21c232c-base)[0];samples=[]
 for phase in range(0,65536,1024):
  index=((phase>>4)*2+1)*2;sine=struct.unpack_from('<h',arm,lut-rom.arm9RamAddress+index)[0];blend=(sine+4096)//2;samples.append(1+((14*blend)>>12))
 assert min(samples)==1 and max(samples)==15
 data={'source':'Italian Black IRBI overlay208','habitat':{'mapSrc':'assets/townmap/map.png','areas':areas,'cells':export,'animations':{str(i):anim[i]for i in [1,8,12]},'source':{'char':15,'cells':28,'animation':45,'palette':5,'archive':'a/1/5/9','distributionArchive':'a/1/7/8','townmapRows':'a/0/8/6:0'},'species':species,'alphaPulse':{'periodFrames':64,'initialPhase':32768,'phaseIncrement':1024,'alphaDenominator':16,'alphaSamplesPhaseZero':samples,'initialAlpha':1,'applicationOrder':'apply previous alpha, increment phase, compute next alpha','formula':'1 + ((14 * ((cosFx12(phase)+4096)/2)) >> 12)','native':'overlay208 0x021C22BC..0x021C2350','sineLut':hex(lut)},'provenance':{'maskResourceLoader':'0x021C0114..0x021C015E','maskActors':'0x021C0350..0x021C041C','visibleHabitatRows':'0x021C2076..0x021C20AE tests species byte2 + season*62 + row','distributionLoader':'0x021C1E28 member species-1','positions':'townmap columns24 animation,25 x,26 y'}},'brightness':{'minimum':0,'maximum':16,'step':2,'frames':8,'nativeUpdate':'overlay208 0x021BC36C..0x021BC3C6','enterInitializer':'0x021BC3D8','exitInitializer':'0x021BC3E4','nativeOutput':'0x021BC420 -> 0x0207D5FC brightness=value-16','verified':'Helper semantics and duration; full transition routing between list/search/detail is not yet certified'},'limits':['Native habitat-mask geometry, distribution and sine samples are verified. Hardware layer blend priorities may require renderer integration.','List/search/detail cross-module transition choreography and exact wait boundaries are not fully traced. Do not label a generic fade a complete original transition.']}
 data['moduleTransitions']={'palette':{'buffers':[1,2,4,8],'targetColorRGB555':0,'coefficientRange':[0,16],'nativeSpeed':-14,'coefficientStep':16,'delay':0,'updatesForFullRange':1,'nativeSpeedDecoder':'ARM9 0x02021944..0x02021992: negative -> min(abs(speed)+2,16), delay0','listWrapper':'overlay209 0x021BC630','searchWrapper':'overlay210 0x021BC72C'},'list':{'distancePx':48,'stepPx':8,'movementFrames':6,'entranceSignedStep':-8,'exitSignedStep':8,'navigationActorIndices':[3,4,5,6,7,8,9],'actorAxis':'y','BGOperations':[{'layer':5,'op':4,'meaning':'add Y scroll offset'},{'layer':1,'op':5,'meaning':'subtract Y scroll offset'}],'init':'0x021BC80C','update':'0x021BC81C','entranceCall':'0x021BCD64..0x021BCD6A','exitCall':'0x021BD168..0x021BD178'},'search':{'distancePx':48,'stepPx':8,'movementFrames':6,'entranceSignedStep':-8,'exitSignedStep':8,'navigationActorIndices':[2,3,4],'actorAxis':'y','BGOperations':[{'layer':4,'op':4,'meaning':'add Y scroll offset'},{'layer':7,'op':4,'meaning':'add Y scroll offset'}],'init':'0x021BCD0C','update':'0x021BCD58','entranceCall':'0x021BD06C..0x021BD07C','exitCall':'0x021BDFCC..0x021BDFDA','additionalController':'0x0202CCE4 initialized for48/abs(step) frames'},'limits':'Component timings and native callers are verified. Module teardown/load/state waits add variable time; no fixed total cross-module duration claimed.'}
 # Original common navigation footer: source palette0 transferred to BG bank14.
 common=files('a/0/8/3');sc=bytearray(common[29]);remap=list(common)
 for off in range(36,len(sc),2):
  tile=struct.unpack_from('<H',sc,off)[0];struct.pack_into('<H',sc,off,tile&4095)
 remap[29]=bytes(sc);footer=g.layer(remap,28,29,27).crop((0,168,256,192));assert footer.getextrema()[3]==(255,255);footer.save(dest/'list-footer.png')
 data['images']={'listFooter':{'src':'assets/dex-effects/list-footer.png','size':[256,24],'position':[0,168],'opaque':True,'source':{'archive':'a/0/8/3','char':28,'screen':29,'palette':27,'sourcePaletteBank':0,'destinationPaletteBank':14,'crop':[0,168,256,192]},'nativeLoader':'overlay209 0x021BC52C..0x021BC596','paletteRect':'0x021BC57A..0x021BC58A -> ARM9 0x02041330 changes palette bank;14 is NOT character tile14'}}
 data['listClipping']={'renderedMainRows':8,'selectableRows':7,'rowHeight':24,'mainVisibleListRect':[96,0,160,168],'footerRect':[0,168,256,24],'subVisibleListRect':[96,0,160,192],'native':'overlay67 config+loop renders24tile-height;overlay209 BG1 opaque footer covers MAIN eighth row'}
 data['brightness'].update({'wholeScreenFade':False,'registers':{'main':'0x04000050','sub':'0x04001050'},'target1Mask':45,'target2Mask':45,'affectedPlanes':['BG0','BG2','BG3','backdrop'],'excludedPlanes':['BG1','OBJ'],'bldalpha':'EVA=value, EVB=0','bldy':'16-value (negative-brightness darken mode)','nativeARMProof':'0x0207D5FC..0x0207D63C','maskInitializer':'overlay208 0x021BC418 sets both masks0x2D','modeCalls':{'info':{'enter':{'engines':['main','sub'],'from':0,'to':16,'step':2,'frames':8,'callers':['0x021BEC68','0x021BEC6E']},'exit':{'engines':['main','sub'],'from':16,'to':0,'step':-2,'frames':8,'callers':['0x021BECB2','0x021BECB8']}},'habitat':{'enter':{'engines':['main'],'from':0,'to':16,'step':2,'frames':8,'callers':['0x021BFA7A']},'subEnter':'instant value16 at0x021BFA60 (no darkening)','exit':{'engines':['main'],'from':16,'to':0,'step':-2,'frames':8,'callers':['0x021BFBB6']}},'cry':{'enter':'both engines instant value16 at0x021C2780/0x021C278C','exit':'both engines instant value0 at0x021C28E8/0x021C28F4','eightFrameHelperCalled':False},'forms':{'enter':'both engines instant value16 at0x021C3E06/0x021C3E10','exit':'both engines instant value0 at0x021C4098/0x021C40A2','eightFrameHelperCalled':False}},'speciesChange':'No blanket8frame brightness effect certified; native pages additionally use palette-controller tasks and OBJ transitions. Apply certified helper only at listed callers.'})
 data['habitat']['text']={'bank':234,'headline':{'messageId':189,'template':'Habitat di {0101:0}','argument0':'species name','BG':6,'physicalScreen':'top','window':[96,168,128,24],'textOffset':[0,5],'native':'0x021C1AFE..0x021C1B50'},'noArea':{'messageId':128,'text':'Zona ignota','BG':0,'physicalScreen':'bottom','window':[64,80,128,16],'align':'center','centerX':128,'y':81,'native':'0x021C1FC0..0x021C2040'},'season':{'messageIds':[190,191,192,193],'window':[72,200,128,16],'unusedInFiveSpeciesScope':True},'windowTable':'0x021C84A4'}
 for state,screen in [('caught',66),('seen',67),('unknown',68)]:
  for endpoint,slot in [('pulseA',2),('pulseB',3)]:
   remap=list(f);sc=bytearray(f[screen])
   for off in range(36,len(sc),2):
    tile=struct.unpack_from('<H',sc,off)[0];struct.pack_into('<H',sc,off,(tile&4095)|(slot<<12))
   remap[screen]=bytes(sc);im=g.layer(remap,58,screen,48).crop((0,0,160,24));name='list-'+state+'-'+endpoint;im.save(dest/(name+'.png'));data['images'][name]={'src':'assets/dex-effects/'+name+'.png','size':[160,24],'source':{'archive':'a/1/5/9','char':58,'screen':screen,'palette':48,'slot':slot}}
 data['listSelection']={'rowX':96,'rowWidth':160,'rowHeight':24,'endpointSourcePalette':48,'paletteSlots':[2,3],'destinationSlot':3,'usesSameNativeCosineAsSearch':True,'blendSamplesPhaseZero':[(struct.unpack_from('<h',arm,lut-rom.arm9RamAddress+((phase>>4)*2+1)*2)[0]+4096)//2 for phase in range(0,65536,1024)],'nativeLoader':'overlay209 0x021BC964..0x021BC972 -> overlay67 0x021B794C','drawRule':'Replace selected row background with RGB555 blend of corresponding pulseA/pulseB source pixels. No additional outline certified.'}
 data['habitat']['text']['font']={'archive':'a/0/2/3','member':0,'paletteMember':5,'packed':'0x3c40','foregroundIndex':15,'shadowIndex':2,'backgroundIndex':0,'foregroundRGB':[255,255,255],'shadowRGB':[164,164,172],'existingVariant':'white','headlineDestinationBGPalette':8,'noAreaDestinationBGPalette':0,'loader':'0x021C06B4..0x021C06E4'}
 # Original NFTR0, scoped Latin/search glyphs, exact common font palette5.
 from PIL import Image
 fontFiles=files('a/0/2/3');font=fontFiles[0];fontPal=g.pal(fontFiles[5]);glyph,widths,off=struct.unpack_from('<3I',font,0x20);mapping={}
 while off and off+12<len(font):
  first,last,kind,_,nxt=struct.unpack_from('<4HI',font,off);at=off+12
  if kind==0:
   start=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
  elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',font,at+(c-first)*2)[0]for c in range(first,last+1)})
  elif kind==2:
   count=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):v for c,v in struct.iter_unpack('<HH',font[at+2:at+2+count*4])})
  off=nxt
 chars=[c for c in sorted(set('♂♀↑↓'+''.join(chr(c)for c in range(32,256))))if c in mapping and mapping[c]!=65535];rows=(len(chars)+15)//16;metrics={};data['fonts']={}
 for label,ink,packed in [('help',1,'0x440'),('white',15,'0x3c40')]:
  atlas=Image.new('RGBA',(192,rows*15))
  for i,ch in enumerate(chars):
   cell=font[glyph+8+mapping[ch]*48:glyph+8+(mapping[ch]+1)*48];left,w,advance=cell[:3];metrics[ch]=[i%16*12,i//16*15,left,advance]
   for y in range(15):
    for x in range(12):
     pos=y*12+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
     if ci in(1,2):atlas.putpixel((i%16*12+x,i//16*15+y),(*fontPal[ink if ci==1 else 2],255))
  name='font-'+label+'.png';atlas.save(dest/name);data['fonts'][label]={'src':'assets/dex-effects/'+name,'height':15,'glyphs':dict(metrics),'source':{'font':'a/0/2/3:0','palette':'a/0/2/3:5','foreground':ink,'shadow':2,'background':0,'packed':packed},'colors':{'foreground':fontPal[ink],'shadow':fontPal[2]}}
 (out/'dex-effects-assets.js').write_text('window.DEX_EFFECTS_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print('Exported',len(export),'native masks;',len(species),'species distributions;64 exact alpha samples;8frame brightness helper')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom');p.add_argument('--output',default=str(Path(__file__).resolve().parents[1]/'src'));p.add_argument('--training',type=Path);a=p.parse_args()
 d=json.loads(a.training.read_text(encoding='utf8').split('window.TRAINING_DATA=',1)[1].strip().removesuffix(';')) if a.training else None
 extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),Path(a.output),sorted(p['id'] for p in d['progression'].values()) if d else None)
