"""Catalog original existing IRBI textures for explicit HD-2D battle environments."""
from pathlib import Path
import argparse,json,collections,hashlib,math,sys
from PIL import Image

def readjs(path):return json.loads(path.read_text(encoding='utf-8-sig').split('=',1)[1].strip().removesuffix(';'))
def build(root,base):
 opening=readjs(root/'src/opening-assets.js');field=readjs(base/'assets/scene.js');textures={}
 def texture(key,kind='opening'):
  lookup=opening['textures']if kind=='opening'else field['textures'];meta=lookup[key];src=meta['src'];p=root/'src'/src
  if not p.exists():p=base/src
  assert p.exists(),src
  im=Image.open(p).convert('RGBA');colors=collections.Counter(px[:3]for px in im.getdata()if px[3]>=128);top=[{'rgb':list(c),'pixels':n}for c,n in colors.most_common(6)]
  name=(kind+':'+key);textures[name]={'src':src,'size':list(im.size),'originalTextureName':key,'catalog':'OPENING_ASSETS.textures'if kind=='opening'else'ROM_SCENE.textures','paletteDominant':top,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'existingAsset':True};return name
 def surfaceProof(model,key):
  area=0
  for g in opening['models'][model]['groups']:
   if g['texture']!=key:continue
   v=g['verts']
   for i in range(0,len(v)-32,33):
    a,b,c=v[i:i+3],v[i+11:i+14],v[i+22:i+25];u=[b[j]-a[j]for j in range(3)];w=[c[j]-a[j]for j in range(3)];area+=abs(u[2]*w[0]-u[0]*w[2])/2
  return round(area,5)
 profiles={}
 specs=[('bedroom',505,'fhyuka','fhkabe','fhkabe2',[('window','idr_win01'),('bed','hh_bed01'),('rug','hh_shiki'),('desk','pc_desk02')]),('bedroomMess',633,'fhyuka','fhkabe','fhkabe2',[('window','idr_win01'),('bed','hh_bed01'),('footprints','hh_ashiato')]),('home',504,'fhyuka','fhkabe','fhkabe2',[('rug','carpet01_1'),('entrance','fhgenkan')]),('bianca',502,'fhyuka','fhkabe','fhkabe2',[('rug','carpet01_1'),('entrance','fhgenkan')]),('biancaRoom',503,'fhyuka','fhkabe','fhkabe2',[('window','idr_win01'),('curtain','fh_wcurtain'),('bed','fh_wbed01'),('rug','fh_wshiki2')]),('komorHome',500,'fhyuka','fhkabe','fhkabe2',[('entrance','fhgenkan')]),('komorRoom',501,'fhyuka','fhkabe','fhkabe2',[('window','idr_win01'),('bed','fh_bbed01'),('rug','fh_bshiki'),('bookshelf','fh_bshelf')]),('lab',506,'m_lab01_01','m_lab01_04','m_lab01_03',[('floorInset','m_lab01_02'),('window','h_mado'),('cabinet','m_lab01_05'),('monitor','m_lab01_08')])]
 for scene,member,floor,wall,trim,decors in specs:
  model='map-'+str(member);prefix=model+'-';f=texture(prefix+floor);w=texture(prefix+wall);t=texture(prefix+trim);d={role:texture(prefix+key)for role,key in decors};floorarea=surfaceProof(model,prefix+floor);assert floorarea>50
  profiles[scene]={'kind':'interior','sourceScene':scene,'sourceModel':model,'source':{'game':'IRBI','landArchive':'a/0/0/8','landMember':member,'terrainArchive':'a/0/1/4','terrainMember':213 if scene=='lab'else 212},'surfaces':{'floor':f,'backWall':w,'wallTrim':t},'decorations':d,'palette':{'floor':textures[f]['paletteDominant'],'wall':textures[w]['paletteDominant'],'trim':textures[t]['paletteDominant']},'proof':{'floorHorizontalTriangleArea':floorarea,'modelMaterialKeysVerified':True},'composition':{'kind':'perspectiveRoom','requiresFloorAndWall':True,'recommendedFloorTileRepeat':[8,10],'recommendedWallTileRepeat':[12,3],'lighting':'Use original window position as motivated key light; grading is HD-2D adaptation','props':'Texture atlas faces are not complete item sprites. Use model geometry for complete props, or map faces onto explicit furniture boxes.'}}
 profiles['route1']={'kind':'outdoor','sourceScene':'north','sourceModel':'map-4','source':{'game':'IRBI','landArchive':'a/0/0/8','landMember':4,'terrainArchive':'a/0/1/4','terrainMember':2},'surfaces':{'ground':texture('map-4-grass01ax'),'path':texture('map-4-michi01a')},'decorations':{'grass':texture('map-4-ue_grass00'),'tree':texture('map-4-ki02ax'),'treeCanopy':texture('map-4-ki02c'),'fence':texture('map-4-saku01a')},'composition':{'kind':'perspectiveOutdoor','ground':'Real grass texture on entire battlefield with path variant only if context terrain path','horizon':'Original layered trees and fence; sky/light are explicit HD-2D adaptation'}}
 profiles['nuvema']={'kind':'outdoor','sourceScene':'village','source':'ROM_SCENE.source (a/0/0/8 members0..3, a/0/1/4 member2)','surfaces':{'ground':texture('grass01ax','field'),'path':texture('michi_isi','field')},'decorations':{'grass':texture('ue_grass00','field'),'tree':texture('ki02ax','field'),'houseFacade':texture('t2_house01_01','field'),'houseSide':texture('t2_house01_02','field')},'composition':{'kind':'perspectiveVillage','ground':'Use context-appropriate stone path/grass, with original building and tree textures','facade':'Full texture is a material atlas; preserve model UV or use appropriate faces, not a stretched complete house billboard'}}
 data={'source':'Existing original Italian Black IRBI field assets, catalog for adapted HD-2D battle compositions','textures':textures,'environments':profiles,'aliases':{'cameraAlcide':'bedroom','casaAlcide':'home','casaBelle':'bianca','cameraBelle':'biancaRoom','casaKomor':'komorHome','cameraKomor':'komorRoom','laboratorio':'lab','Soffiolieve':'nuvema','Percorso1':'route1'},'integrationRules':{'snapshotAtBattleStart':True,'noSilentRouteFallback':True,'requireExplicitProfile':True,'sourceTexturesUnmodified':True,'battleComposition':'Adaptation: these are original field materials, not original Black battle backgrounds. Perspective, room geometry, prop arrangement and HD-2D lighting require deliberate composition and visual QA.','newPNGCount':0},'limitations':['Texture choices and source scene/material identity are verified; this catalog alone does not implement or visually certify the battle scenes.','Village textures are supplied by the retained base build; other textures already live in src/assets/opening. Packaging must keep these existing resources.','No encounter/species coverage is added. Each new battle location needs an explicit environment profile.']}
 (root/'src/battle-environment-assets.js').write_text('window.BATTLE_ENVIRONMENT_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print('Cataloged',len(profiles),'profiles;',len(textures),'existing textures; zero newPNGs')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[1]);p.add_argument('--base',type=Path,required=True);a=p.parse_args();build(a.repo,a.base)

