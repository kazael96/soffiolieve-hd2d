"""Export IRBI local Mail labels, Easy Chat templates and original paper BGs.

No message is authored here. Native bank/word/template indices are retained.
The browser composer is an explicitly separate HD-2D input adaptation.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,re,struct
try:
    import ndspy.rom,ndspy.narc,ndspy.lz10
except ModuleNotFoundError:
    from irbi_reader import install
    install()
    import ndspy.rom,ndspy.narc,ndspy.lz10

def sibling(name):
    spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'))
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module

def extract(rom,output):
    assert rom.idCode==b'IRBI','Italian Black layout required'
    from irbi_reader import code_decompress
    text=sibling('extract-original-events');gfx=sibling('extract-menu')
    raw=rom.getFileByName('a/0/0/2');banks=ndspy.narc.NARC(raw).files
    cache={}
    def messages(bank):
        if bank not in cache:cache[bank]=text.messages(banks[bank])
        return cache[bank]
    arm9=code_decompress(rom.arm9);base=rom.arm9RamAddress
    phrase_banks=list(struct.unpack_from('<7H',arm9,0x209f6a4-base))
    assert phrase_banks==[94,96,99,93,98,95,97]
    phrases=[{'bank':bank,'templates':messages(bank),'sourceGroup':i}for i,bank in enumerate(phrase_banks)]
    assert [len(p['templates'])for p in phrases]==[20,20,20,20,20,21,2]
    for p in phrases:
        for t in p['templates']:
            assert all(int(n)<2 for n in re.findall(r'\{011c:(\d+)\}',t))
    names=messages(145)
    # These are original display lexicons. Alphabetic banks100..126 contain
    # normalized search keys (e.g.DACCORDO), so are deliberately not displayed.
    grouping=[(70,names[0]),(203,names[2]),(182,'ABILITÀ'),
              (149,names[3]),(150,names[4]),(151,names[5]),
              (152,names[7]),(153,names[8]),(154,names[10]),
              (155,names[11]),(156,names[12])]
    font_path=Path(__file__).resolve().parents[1]/'src/pokedex-assets.js'
    font_text=font_path.read_text(encoding='utf8');font=json.loads(font_text.split('=',1)[1].rstrip(';\n'))['font'];glyphs=set(font['glyphs'])
    groups=[]
    for bank,name in grouping:
        words=messages(bank)
        disabled=[i for i,w in enumerate(words)if not w.strip()or w.strip() in ['-----','―――――','－－－－－－－－－－'] or bank==70 and i>649]
        disabled_font=[i for i,w in enumerate(words)if any(ch not in glyphs for ch in w)]
        groups.append({'name':name,'bank':bank,'words':words,'disabled':sorted(set(disabled+disabled_font)),'disabledFont':disabled_font})
    labels={'mail':messages(59),'composer':messages(60),'editor':messages(146),'groups':names}
    paper_raw=rom.getFileByName('a/1/5/5');paper_files=ndspy.narc.NARC(paper_raw).files
    assert len(paper_files)==48
    f=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in paper_files]
    items={};dest=output/'assets/mistralton/mail';dest.mkdir(parents=True,exist_ok=True)
    for item in range(137,146):
        kind=item-137;char,screen,palette=12+kind,24+kind,kind
        assert [f[i][:4]for i in [char,screen,palette]]==[b'RGCN',b'RCSN',b'RLCN']
        image=gfx.layer(f,char,screen,palette);filename=f'paper-{item}.png';image.save(dest/filename)
        file=dest/filename;source={'archive':'a/1/5/5','nativeArchiveId':155,'type':kind,'char':char,'screen':screen,'palette':palette}
        items[item]={'name':messages(54)[item],'description':messages(53)[item],
                     'paper':{'src':'assets/mistralton/mail/'+filename,'size':list(image.size),'clip':[0,0,256,192],
                              'baseColor':list(gfx.pal(f[palette])[0]),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'source':source}}
    overlay=rom.loadArm9Overlays([136])[136]
    result={'source':'Pokemon Black Italian IRBI; original Mail and Easy Chat',
            'labels':labels,'groups':groups,'phrases':phrases,'items':items,
            'provenance':{'textArchive':'a/0/0/2','textArchiveSha256':hashlib.sha256(raw).hexdigest(),
                          'banks':{str(i):hashlib.sha256(banks[i]).hexdigest()for i in sorted(cache)},
                          'paperArchive':'a/1/5/5','paperArchiveSha256':hashlib.sha256(paper_raw).hexdigest(),
                          'overlay':136,'overlayBase':hex(overlay.ramAddress),'overlaySha256':hashlib.sha256(overlay.data).hexdigest(),
                          'paperSelector':'136:021c4d8c; typebyte+0xb; chars12+type/screens24+type/paletteType',
                          'phraseBankTable':'ARM9:0209f6a4; loader020243a0/02024418',
                          'phraseStorage':'136:021c520c..021c5236: three8bytephrasesatMail+0x16; group,template,twoencodedwords',
                          'nativeLayout':{'screen':[256,192],'lineWindows':[[24,24,208,32],[24,64,208,32],[24,104,208,32]],'footerWindows':[[64,152,88,16],[168,152,64,16]],'source':'136:021c5030/021c5044/021c5058,021c506c/021c5082'},
                          'composerFont':{'catalog':'pokedex-assets.js','sha256':hashlib.sha256(font_text.encode('utf8')).hexdigest(),'glyphs':len(glyphs)}},
            'adaptation':{'composer':'HD-2D local menus; original labels, templates and paper pixels; no network transport',
                          'wordGroups':'Original display lexicons, retaining bank/index. Full lexicons provided; DS unlock gating is not reconstructed.',
                          'fontAvailability':'disabledFont retains original foreign/unsupported words at their native indices but prevents choosing them in the compact173glyph Italian composer. This is a browser-font adaptation, not a native DS unlock rule.',
                          'phraseSlots':2,'phrasesPerMail':3,
                          'search':'Alphabetic search banks100..126 are normalized lookup keys, not replacement display text.',
                          'paper':'Original full NSCR background preserved; visible DS crop256x192 and native palette0 given separately.'}}
    (output/'mistralton-mail-data.js').write_text('window.MISTRALTON_MAIL_DATA='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--report',type=Path);a=p.parse_args()
    result=extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
    if a.report:a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
    print('Exported',len(result['items']),'native papers;',len(result['groups']),'word banks;',sum(len(p['templates'])for p in result['phrases']),'native templates')
