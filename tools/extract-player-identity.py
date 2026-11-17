"""Export native IRBI player graphics without recolouring or changing shared catalogs.
Only assets/player-identity and player-assets.js are written in the source tree.
Intro artwork reuses original Interpoke portraits explicitly; it is not claimed
to reproduce the original new-game bitmap layout. Raw ROM resources stay in work.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,shutil,struct,subprocess
from PIL import Image
from irbi_reader import NintendoDSRom,NARC,lz10,install
install()
SIZES=[[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def dictionary(raw,offset):
 count=raw[offset+1];entries=offset+struct.unpack_from("<H",raw,offset+6)[0];size,names=struct.unpack_from("<HH",raw,entries)
 assert entries+names+count*16<=len(raw) and entries+4+count*size<=len(raw)
 return [(raw[entries+names+i*16:entries+names+(i+1)*16].split(b"\0")[0].decode("ascii"),
          raw[entries+4+i*size:entries+4+(i+1)*size]) for i in range(count)]
def texture_names(raw):
 assert raw[:4]==b"BTX0";at=struct.unpack_from("<I",raw,16)[0];tex=raw[at:];assert tex[:4]==b"TEX0"
 return [name for name,_ in dictionary(tex,struct.unpack_from("<H",tex,14)[0])]
def palette(raw):
 return [tuple(((c>>s)&31)*255//31 for s in (0,5,10)) for c, in struct.iter_unpack("<H",raw[40:40+struct.unpack_from("<I",raw,32)[0]])]
def phone_portrait(files,char,pal):
 raw=files[char];h,w,fmt=struct.unpack_from("<HHI",raw,24);size,offset=struct.unpack_from("<II",raw,40)
 assert fmt==4;data=raw[24+offset:24+offset+size];w*=8;h*=8
 if w>4096:w,h=128,192
 colors=palette(files[pal]);image=Image.new("RGBA",(w,h));pixels=[]
 for y in range(h):
  for x in range(w):
   index=data[((y//8)*(w//8)+x//8)*64+(y%8)*8+x%8];pixels.append((*colors[index],255 if index else 0))
 image.putdata(pixels);return image
def phone_cells(files,pal,char,cell):
 colors=palette(files[pal]);raw=files[char];data=raw[48:48+struct.unpack_from("<I",raw,40)[0]]
 raw=files[cell];count,kind,offset,mapping=struct.unpack_from("<HHII",raw,24);start=24+offset;stride=16 if kind else 8;oambase=start+count*stride;out=[]
 for i in range(count):
  entries,flags,offset=struct.unpack_from("<HHI",raw,start+i*stride);image=Image.new("RGBA",(96,96))
  for j in reversed(range(entries)):
   a0,a1,a2=struct.unpack_from("<HHH",raw,oambase+offset+j*6);x=a1&511;x=x if x<256 else x-512;y=a0&255;y=y if y<128 else y-256
   w,h=SIZES[a0>>14][a1>>14];tile=(a2&1023)*(32<<mapping);bank=(a2>>12)*16;obj=Image.new("RGBA",(w,h));pixels=obj.load()
   for yy in range(h):
    for xx in range(w):
     at=tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2;assert at<len(data)
     ci=(data[at]>>(4*(xx%2)))&15;pixels[xx,yy]=(*colors[bank+ci],255 if ci else 0)
   if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
   if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
   image.alpha_composite(obj,(48+x,48+y))
  out.append(image)
 return out
def phone_frames(files,portrait,cell):
 base=phone_portrait(files,24+portrait*2,18+portrait)
 parts=phone_cells(files,39+cell*4,40+cell*4,41+cell*4);out=[]
 for blink in range(3):
  for mouth in range(3):
   image=base.copy();image.alpha_composite(parts[blink],(16,56))
   if len(parts)>3:image.alpha_composite(parts[min(3+mouth,len(parts)-1)],(16,56))
   out.append(image)
 return out
def extract(rom_path,output,baseline,work,apicula):
 assert not work.resolve().is_relative_to(output.resolve()),"Raw work must stay outside published sources"
 rom=NintendoDSRom.fromFile(rom_path);assert rom.idCode==b"IRBI"
 def narc(name):return NARC(rom.getFileByName(name)).files
 dest=output/"assets/player-identity";dest.mkdir(parents=True,exist_ok=True);work.mkdir(parents=True,exist_ok=True)
 images=[];proof=[];sprites={};metrics={}
 def source_file(relative):
  path=output/relative
  if not path.is_file():path=baseline/relative
  assert path.is_file(),relative
  return path
 def record(path,role,source):
  im=Image.open(path).convert("RGBA");box=im.getchannel("A").getbbox()
  assert box or role=="Anita" and source.get("textureIndex",-1)>=24,"An active player frame is unexpectedly empty"
  row={"path":str(path.resolve()),"src":path.relative_to(output).as_posix(),"sha256":sha(path),"size":list(im.size),"alphaBounds":list(box) if box else None,"nativeUnusedPadding":box is None,"role":role,"source":source}
  images.append(row);return row["src"]+"?v="+row["sha256"][:12]
 table=narc("a/0/4/8")[0];graphics=narc("a/0/4/9");fmt=struct.Struct("<HBBBBBBBBBBBbbbHHHHHH")
 for name,actor,expected,count in [("Anita",4,9,32),("AnitaBike",5,10,16)]:
  row=fmt.unpack_from(table,4+actor*fmt.size);member=row[15];assert row[0]==actor and member==expected
  raw=graphics[member];names=texture_names(raw);assert len(names)==count
  raw_file=work/(name+".nsbtx");raw_file.write_bytes(raw);converted=work/(name+"-converted")
  subprocess.run([str(apicula),"convert",str(raw_file),"--more-textures","-o",str(converted),"--overwrite"],check=True,capture_output=True,
                 creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
  proof.append({"role":name,"actor":actor,"descriptorArchive":"a/0/4/8","record":list(row),"textureArchive":"a/0/4/9","member":member,
                "sha256":hashlib.sha256(raw).hexdigest(),"textureNames":names,"paletteCount":1,"decoder":"Apicula convert --more-textures; native single palette, no recolouring"})
  frames=[];frame_metrics=[]
  for i,texture in enumerate(names):
   file=dest/(name+"-"+str(i)+".png");source=converted/(texture.replace(".","_")+".png");assert source.is_file()
   shutil.copyfile(source,file);frames.append(record(file,name,{"archive":"a/0/4/9","member":member,"textureIndex":i,"textureName":texture}))
   frame_metrics.append(images[-1])
  sprites[name]=frames;metrics[name]=frame_metrics
 # Preserve every existing male pixel and source path; these are already shipped.
 sprites["Alcide"]=["assets/characters/Alcide-"+str(i)+".png?v="+sha(source_file("assets/characters/Alcide-"+str(i)+".png"))[:12] for i in range(32)]
 sprites["AlcideBike"]=["assets/nimbasa/bicycle-"+str(i)+".png?v="+sha(source_file("assets/nimbasa/bicycle-"+str(i)+".png"))[:12] for i in range(16)]
 # Native animationSet7 stores all12 pedalling textures before4 idle poses.
 # Resolve the renderer's direction*4 layout from actual native programs, not
 # texture naming. Within each direction the loop is slots1,2,3,2.
 overlay=rom.loadArm9Overlays([21])[21];bike_programs=[]
 pointer,count=struct.unpack_from("<II",overlay.data,327760+7*8);assert count>=8
 for program in range(8):
  address=struct.unpack_from("<I",overlay.data,pointer-overlay.ramAddress+program*4)[0];steps=[]
  for i in range(16):
   frame,hold=struct.unpack_from("<HH",overlay.data,address-overlay.ramAddress+i*4)
   if frame in (0x3fff,0x3ffc):break
   assert frame<16 and hold>0;steps.append([frame,hold])
  else:raise ValueError("Unterminated native bicycle program")
  bike_programs.append({"index":program,"address":hex(address),"steps":steps,"endMarker":frame,"loop":hold})
 bike_map=[]
 for d in range(4):
  idle=bike_programs[d]["steps"];pedal=bike_programs[4+d]["steps"]
  assert idle==[[12+d,1]] and [p[0]for p in pedal]==[3*d+1,3*d,3*d+2,3*d]
  bike_map.extend([idle[0][0],pedal[0][0],pedal[1][0],pedal[2][0]])
 for name in ("AlcideBike","AnitaBike"):sprites[name]=[sprites[name][i]for i in bike_map]
 bike_mapping={"rendererContract":"direction*4 + slot; idle0, native pedal loop1,2,3,2","nativeTextureIndices":bike_map,
               "nativeOverlay":21,"nativeOverlaySHA256":hashlib.sha256(overlay.data).hexdigest(),"animationSet":7,"programs":bike_programs,
               "maleAndFemaleShareAnimationSet":True,"originalPNGBytesUnchanged":True}
 for name,actor,member in [("Alcide",1,6),("AlcideBike",2,7)]:
  row=fmt.unpack_from(table,4+actor*fmt.size);assert row[0]==actor and row[15]==member
  proof.append({"role":name,"actor":actor,"archive":"a/0/4/9","member":member,"sha256":hashlib.sha256(graphics[member]).hexdigest(),
                "existingPathsPreserved":True,"frames":len(sprites[name])})
 phone=[lz10(raw) if raw[:1]==b"\x10" else raw for raw in narc("a/1/3/1")]
 male=phone_frames(phone,2,3);male_equal=[]
 for i,image in enumerate(male):
  path=source_file("assets/phone/Alcide-"+str(i//3)+"-"+str(i%3)+".png")
  old=Image.open(path).convert("RGBA");assert image.size==old.size and image.tobytes()==old.tobytes(), "Native phone decoder differs from shipped male frame"
  male_equal.append({"path":str(path),"sha256":sha(path),"pixelIdentical":True})
 female=phone_frames(phone,1,2);female_paths=[]
 for i,image in enumerate(female):
  path=dest/("Anita-phone-"+str(i//3)+"-"+str(i%3)+".png");image.save(path)
  female_paths.append(record(path,"Anita phone",{"archive":"a/1/3/1","portrait":1,"faceCell":2,"baseChar":26,"basePalette":19,"facePalette":47,"faceChar":48,"faceCells":49,"blink":i//3,"mouth":i%3}))
 portraits={"Alcide":["assets/phone/Alcide-"+str(i//3)+"-"+str(i%3)+".png" for i in range(9)],"Anita":female_paths}
 friends=Image.new("RGBA",(256,192));friend_sources=[]
 for name,x in [("Komor",0),("Belle",128)]:
  file=source_file("assets/phone/"+name+"-0-0.png");image=Image.open(file).convert("RGBA");assert image.size==(128,192)
  friends.alpha_composite(image,(x,0));friend_sources.append({"file":"assets/phone/"+name+"-0-0.png","sha256":sha(file),"position":[x,0]})
 friend_file=dest/"friends.png";friends.save(friend_file)
 friends_url=record(friend_file,"Friends introduction",{"composition":"Two unscaled original Interpoke portraits on a transparent256x192 canvas; not a native grouped intro bitmap","parts":friend_sources})
 minccino=source_file("assets/pokemon/572-front.png")
 intro={"aralia":"assets/phone/Aralia-0-0.png","Alcide":portraits["Alcide"][0],"Anita":portraits["Anita"][0],
        "minccino":"assets/pokemon/572-front.png","friends":friends_url}
 spec=importlib.util.spec_from_file_location("identity_native_text",Path(__file__).with_name("extract-original-events.py"));events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
 banks=narc("a/0/0/2");texts44=events.messages(banks[44]);names=events.messages(banks[11])
 assert names[300:303]==["Alcide"]*3 and names[303:306]==["Anita"]*3
 data={"source":"Original Italian Pokemon Black IRBI; native graphics and text only","sprites":sprites,"portraits":portraits,"intro":intro,"bikeMapping":bike_mapping,
       "texts":{"bank44":texts44,"bank44SHA256":hashlib.sha256(banks[44]).hexdigest(),"bank81":events.messages(banks[81]),
                "defaultNames":{"M":{"bank":11,"messages":[300,301,302],"name":"Alcide"},"F":{"bank":11,"messages":[303,304,305],"name":"Anita"}}},
       "nativeProof":proof,"metrics":metrics,"phoneMaleDecoderChecks":male_equal,
       "introProvenance":{"aralia":"Reused original Interpoke portrait, not a claim of the new-game bitmap/layout",
                          "Alcide":"Reused original male Interpoke portrait","Anita":"Reused newly decoded original female Interpoke portrait",
                          "minccino":{"reuse":"Original retained front sprite572","sha256":sha(minccino)},
                          "friends":"Unscaled composition of original Komor/Belle Interpoke portraits; native pixels unchanged"},
       "trainerCard":{"reuse":"TRAINER_CARD_ASSETS already contains front/back/avatarFemaleRank0 and MaleRank0; no new bitmap required"},
       "surf":{"reuse":"SURF_FIELD_ASSETS.sprites already contains AlcideSurf/AnitaSurf from a/0/4/9 members8/11, including sex-specific footPadding"},
       "limits":["Flow staging is HD-2D adaptation using original art; dedicated native new-game portrait/layout resources are not claimed here",
                 "Player-name input limit7 is the requested new-editor policy; legacy demo names retain10. The native caller length still needs tracing.",
                 "Every generated PNG requires manual image review; extraction/provenance alone is not a visual PASS"]}
 # Raw IRBI ROM and binaries never enter the site.
 script="(function(root){const data="+json.dumps(data,ensure_ascii=False,separators=(",",":"))+";root.PLAYER_ASSETS=data;if(typeof module!=='undefined')module.exports=data;})(typeof window!=='undefined'?window:globalThis);\n"
 (output/"player-assets.js").write_text(script,encoding="utf-8",newline="\n")
 report={"gameCode":"IRBI","romSHA256":hashlib.sha256(rom.raw).hexdigest(),"catalog":str(output/"player-assets.js"),"catalogSHA256":sha(output/"player-assets.js"),
         "newPNGCount":len(images),"images":images,"nativeProof":proof,"bikeMapping":bike_mapping,"phoneMaleDecoderChecks":male_equal,"introProvenance":data["introProvenance"],
         "nativeIntroTexts":{"bank":44,"sha256":data["texts"]["bank44SHA256"],"messages":texts44},"reviewed":False}
 (work/"player-assets-extraction.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 (work/"intro-text-bank44.json").write_text(json.dumps(report["nativeIntroTexts"],ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print(json.dumps({"catalog":str(output/"player-assets.js"),"sprites":{k:len(v) for k,v in sprites.items()},"phoneFemale":len(female_paths),"intro":intro,
                   "newPNGs":len(images),"malePhonePixelChecks":len(male_equal),"report":str(work/"player-assets-extraction.json")},ensure_ascii=False))
if __name__=="__main__":
 p=argparse.ArgumentParser()
 for key in ("rom","output","baseline","work","apicula"):p.add_argument("--"+key,type=Path,required=True)
 a=p.parse_args();extract(a.rom,a.output,a.baseline,a.work,a.apicula)

