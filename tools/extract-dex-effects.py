"""Scoped native Pokédex habitat masks and verified animation constants (IRBI)."""
from pathlib import Path
import argparse,importlib.util,json,struct,math
import ndspy.rom,ndspy.narc,ndspy.lz10,ndspy.codeCompression

def extract(rom,out):
 assert rom.idCode==b'IRBI'
 s=importlib.util.spec_from_file_location('gfx',Path(__file__).with_name('extract-menu.py'));g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
 def files(path):return[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(path)).files]
 f=files('a/1/5/9');rows=list(struct.iter_unpack('<27H',files('a/0/8/6')[0]));hab=files('a/1/7/8');assert len(rows)==61 and len(hab)==649
 anim=g.animations(f[45]);cells=g.cells(f,15,28,5);dest=out/'assets/dex-effects';dest.mkdir(parents=True,exist_ok=True)
 areas={};export={}
 for rowIndex in [18,38,39,40]:
  row=rows[rowIndex];animation=row[24];cell=anim[animation]['frames'][0][0];im,box=cells[cell]
  if str(cell)not in export:
   name=f'habitat-mask-{cell}.png';im.save(dest/name);export[str(cell)]={'src':'assets/dex-effects/'+name,'origin':box[:2],'size':box[2:],'nativeCell':cell}
  areas[str(rowIndex)]={'zone':row[0],'townmapRow':rowIndex,'animation':animation,'cell':cell,'anchor':list(row[25:27]),'sourceRow':list(row)}
 species={}
 for sid in [495,498,501,504,506]:
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
 (out/'dex-effects-assets.js').write_text('window.DEX_EFFECTS_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print('Exported3native masks;5 species distribution;64 exact alpha samples;8frame brightness helper')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom');p.add_argument('--output',default=str(Path(__file__).resolve().parents[1]/'src'));a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),Path(a.output))



