const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function environment(){
 const nodes=[],messages=[],calls=[];const el=()=>({style:{},children:[],classList:{toggle(){}},append(...v){this.children.push(...v)},addEventListener(){},setAttribute(){},getContext(){return {}},remove(){this.removed=true}});
 const cell={src:'cell.png'},group={cells:[cell,cell,cell,cell,cell]};const c={console:{warn(){}},queueMicrotask,broken:false,jsonBroken:false,battling:false,menuOpen:()=>false,resetInput(){},Journey:{state:{starter:'Snivy'}},NativeTextLayout:{resource:x=>x},NativeText:{load:async()=>({})},MENU_ASSETS:{images:{background:'bg.png'},groups:{bagMale:group,bagPockets:group,bagButton:group},pokemonIcons:{}},FIELD_POPUP_ASSETS:{images:{},fonts:{variants:{normal:cell,highlight:cell}},groups:{quantityControls:{cells:[]},readyMarkers:{cells:[]}}},PARTY_DETAIL_ASSETS:{images:{},itemMap:{},groups:{partyNavigationBlue:{cells:[]}}},PARTY_POPUP_ASSETS:{images:{},font:cell},DEX_BROWSER_ASSETS:{groups:{detailCommon:group}},COMMON_DIALOGUE_ASSETS:{images:{partyPrompt:cell,fieldDialogue:cell}},POKEDEX_ASSETS:{revision:'test'},document:{body:{append(n){nodes.push(n)}},createElement:el},toast:s=>messages.push(s)};c.window=c;
 c.Image=class{set src(url){calls.push(url);queueMicrotask(()=>c.broken?this.onerror?.():this.onload?.());}};
 const catalogue={images:{},font:{path:'bagfont.png'}};c.RuntimeAssets={image:async src=>{calls.push(src);if(c.broken)throw Error('temporary image failure');return {width:16,height:16}},json:async()=>{c.jsonCalls=(c.jsonCalls||0)+1;if(c.jsonBroken)throw Error('temporary JSON failure');return catalogue}};c.fetch=async()=>{c.jsonCalls=(c.jsonCalls||0)+1;return{ok:!c.jsonBroken,json:async()=>catalogue}};
 vm.createContext(c);const source=fs.readFileSync(require.resolve('../src/native-ui.js'),'utf8').replace('root.NativeUI={','root.testFieldBag=prepareFieldBag;root.NativeUI={');vm.runInContext(source,c);return {c,nodes,messages,calls};
}
test('a failed native menu preparation releases its cached error and orphan dialog',async()=>{
 const {c,nodes,calls}=environment();c.broken=true;await assert.rejects(c.NativeUI.prepare());c.broken=false;await assert.doesNotReject(c.NativeUI.prepare());assert.equal(nodes.filter(n=>n.id==='nativeMenu'&&!n.removed).length,1);assert.equal(calls.filter(src=>src==='bg.png').length,2);await c.NativeUI.prepare();assert.equal(calls.filter(src=>src==='bg.png').length,2);
});
test('the shared bitmap font can recover instead of poisoning all native menus',async()=>{
 const {c,calls}=environment();vm.runInContext(fs.readFileSync(require.resolve('../src/pokedex.js'),'utf8'),c);c.broken=true;await assert.rejects(c.NativeText.load());c.broken=false;await assert.doesNotReject(c.NativeText.load());const before=calls.length;await c.NativeText.load();assert.equal(calls.length,before);
});
test('the field bag catalogue can be retried after a transient network failure',async()=>{
 const {c}=environment();c.jsonBroken=true;await assert.rejects(c.testFieldBag());c.jsonBroken=false;await assert.doesNotReject(c.testFieldBag());assert.equal(c.jsonCalls,2);await c.testFieldBag();assert.equal(c.jsonCalls,2);
});
test('opening an unavailable menu remains recoverable without an unhandled rejection',async()=>{
 const {c,nodes,messages}=environment();c.broken=true;assert.equal(await c.NativeUI.open(),false);assert.equal(nodes.filter(n=>n.id==='nativeMenu'&&!n.removed).length,0);assert.equal(messages.length,1);
});
