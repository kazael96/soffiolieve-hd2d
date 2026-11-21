'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),site=process.env.SOFFIOLIEVE_TEST_SITE||path.join(root,'_site'),html=fs.readFileSync(path.join(root,'src/index.html'),'utf8'),ordered=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(m=>m[1]);
function sequential(){
 let order=ordered.slice();if(process.env.UNFEZANT064_OLD_INDEX==='1'){order=order.filter(n=>n!=='unfezant-moves.js');order.splice(order.indexOf('emboar-moves.js')+1,0,'unfezant-moves.js');}
 const selected=new Set(['assets/battle-data.js','battle-sim.js','training-data.js','league-data.js','finale-data.js','pokemon-visuals.js','training.js','pokemon-anim.js','battle-reactions.js','move-fx.js','assets/move-fx-data.js']);
 const c={window:null,document:{createElement(){throw Error('Index installation must not decode/create source canvases');}}};c.window=c;vm.createContext(c);const loaded=[];let originalNativeDraw;
 for(const name of order){if(!selected.has(name)&&!name.endsWith('-moves.js'))continue;const source=fs.readFileSync(fs.existsSync(path.join(root,'src',name))?path.join(root,'src',name):path.join(site,name),'utf8');vm.runInContext(source,c,{filename:name});loaded.push(name);if(name==='pokemon-anim.js')originalNativeDraw=c.ROM_SPRITE_ANIM.draw;}
 return{c,loaded,originalNativeDraw};
}
test('current index executes real native API before installing the actual Gust preparation and draw wrappers',()=>{
 const {c,loaded,originalNativeDraw}=sequential();assert.ok(c.ROM_SPRITE_ANIM?.prepare,'Real native API absent');assert.ok(c.UnfezantMoves?.rig?.surface,'Sequential index left the Gust module uninstalled when the native API arrived later');assert.equal(c.SpeciesMoves.prepare,c.UnfezantMoves.prepare,'MoveFX cannot await the actual authored resource barrier');assert.notEqual(c.ROM_SPRITE_ANIM.draw,originalNativeDraw,'The actual native draw was never wrapped for the authored wings');assert.ok(loaded.indexOf('pokemon-anim.js')<loaded.indexOf('unfezant-moves.js'));assert.equal(typeof c.MoveFX.play,'function');assert.equal(c.UnfezantMoves.ready(521),false);assert.equal(c.UnfezantMoves.images.size,0);const installed=c.ROM_SPRITE_ANIM.draw;c.UnfezantMoves.install();assert.equal(c.ROM_SPRITE_ANIM.draw,installed,'Startup needed a second manual install to activate the renderer');
});
test('a contact extension in the actual index is installed after both the Gust wrapper and battle reactions',{skip:!ordered.includes('emboar-contact-moves.js')},()=>{
 const order=ordered,index=order.indexOf('emboar-contact-moves.js');assert.ok(index>order.indexOf('unfezant-moves.js'));assert.ok(index>order.indexOf('battle-reactions.js'));const {c}=sequential();assert.ok(c.EmboarContactMoves?.instance?.installedPoseRef,'Contact module captured an unavailable native/reaction dependency');
});
