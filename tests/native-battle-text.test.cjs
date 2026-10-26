const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.NativeTextLayout=require('../src/native-text-layout.js');
const c={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../src/battle-narrative-assets.js'),'utf8'),c);
const catalog=c.window.BATTLE_NARRATIVE,{message}=require('../src/native-battle-text.js');
const ctx={catalog,trainer:true,rival:'Belle',playerName:'Alcide',moveId:()=>43},e=(kind,actor,args=[])=>({kind,actor,args});
test('IRBI native stage templates distinguish applied magnitude and own, wild, trainer targets',()=>{
 assert.equal(message(e('-unboost','p2a: Oshawott',['def','1']),ctx),'La Difesa di Oshawott nemico diminuisce!');
 assert.equal(message(e('-unboost','p2a: Patty',['def','1']),{...ctx,trainer:false}),'La Difesa di Patty selvatico diminuisce!');
 assert.equal(message(e('-boost','p1a: Snivy',['atk','1']),ctx),"L'Attacco di Snivy aumenta!");
 assert.notEqual(message(e('-boost','p1a: Snivy',['atk','2']),ctx),message(e('-boost','p1a: Snivy',['atk','3']),ctx));
 assert.equal(message(e('-boost','p1a: Snivy',['atk','0']),ctx),"L'Attacco di Snivy non può aumentare\ndi più!");
});
test('move, KO, miss and switch use original text and the actual named target',()=>{
 assert.equal(message(e('move','p1a: Snivy',['Leer']),ctx),'Snivy usa Fulmisguardo!');
 assert.equal(message(e('faint','p2a: Oshawott'),ctx),'Oshawott nemico è esausto!');
 assert.equal(message(e('-miss','p2a: Oshawott',['p1a: Snivy']),ctx),"Snivy evita l'attacco!");
 assert.equal(message(e('switch','p2a: Oshawott'),ctx),'Belle manda in campo Oshawott!');
 assert.equal(message(e('switch','p1a: Patty'),ctx),'Avanti, Patty!');
});
test('ordinary HP updates and internal turn markers remain silent; statuses retain original messages',()=>{
 assert.equal(message(e('turn','2'),ctx),null);assert.equal(message(e('-damage','p1a: Snivy',['20/26']),ctx),null);
 assert.equal(message(e('-status','p1a: Snivy',['psn']),ctx),'Snivy è stato avvelenato!');
 assert.equal(message(e('-damage','p1a: Snivy',['19/26','[from] psn']),ctx),'Il veleno ha effetto su Snivy!');
 assert.equal(message(e('message','Pozione: +15 PS'),ctx),null);
 assert.equal(message(e('unknown','p1a: Snivy'),ctx,()=> 'unmapped'),'unmapped');
});
