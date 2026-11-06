const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../src/scene-camera.js');

test('Dragonspiral entrance clears a five-tile canopy six tiles in front and restores the previous view',()=>{
 const renderer={scene:{zone:206}},restore=C.applyFieldView(renderer,{z:34.5});
 const [sin,cos]=renderer.cameraPitch;assert.ok(6*sin>5*cos,'Foreground canopy still crosses the body');restore();assert.equal(renderer.cameraPitch,undefined);
 const before=[.423,.906],other={scene:{zone:205},cameraPitch:before};C.applyFieldView(other,{z:34.5})();assert.equal(other.cameraPitch,before);
 const repeated={scene:{zone:206}};for(let i=0;i<120;i++)C.applyFieldView(repeated,{z:34.5});const fixed=[...repeated.cameraPitch];C.applyFieldView(repeated,{z:34.5});assert.deepEqual(repeated.cameraPitch,fixed);repeated.scene={zone:207};C.applyFieldView(repeated,{z:0});assert.equal(repeated.cameraPitch,undefined);
});

test('forest camera transitions are continuous at both ends of the bridge corridor',()=>{
 const sample=z=>{const r={scene:{zone:206}};C.applyFieldView(r,{z});return Math.atan2(...r.cameraPitch);};
 for(const z of [27,32])assert.ok(Math.abs(sample(z-.0001)-sample(z+.0001))<1e-7);
 assert.ok(sample(27)<sample(29)&&sample(29)<sample(32));
});
test('the summit uses its native53degree profile and restores the low field view on exit',()=>{
 const base=[.423,.906],r={scene:{zone:213},cameraPitch:base};C.applyFieldView(r,{z:5.5});assert.ok(Math.abs(Math.atan2(...r.cameraPitch)-9694*Math.PI*2/65536)<1e-12);const first=[...r.cameraPitch];for(let i=0;i<120;i++)C.applyFieldView(r,{z:5.5});assert.deepEqual(r.cameraPitch,first);r.scene={zone:205};C.applyFieldView(r,{z:0});assert.equal(r.cameraPitch,base);
 const steep={scene:{zone:213},cameraPitch:[Math.sin(1.1),Math.cos(1.1)]};C.applyFieldView(steep,{z:0});assert.ok(Math.abs(Math.atan2(...steep.cameraPitch)-1.1)<1e-12);
});
test('native-map chapters and future chapters follow the player without repeated version lists',()=>{for(const chapter of [42,43,46,47,48,49,50,100])assert.equal(C.tracks({['chapter'+String(chapter).padStart(3,'0')]:true}),true);for(const scene of [null,{}, {chapter040:true},{chapter048:false},{chapter048:'true'}])assert.equal(C.tracks(scene),false);});
test('new distant native-map coordinates are centered before the transition is uncovered',()=>{const p={x:-581.5,y:-318.5};assert.deepEqual(C.anchor('zone96',{chapter048:true},96,p),[-581.5,-317]);assert.deepEqual(C.anchor('zone107',{chapter049:true},107,p),[-581.5,-317]);assert.deepEqual(C.anchor('bedroom',{},391,p),[-10,-10]);assert.deepEqual(C.anchor('town',{},397,{x:10,y:20}),[7,21.5]);});
test('camera convergence depends on elapsed game time rather than frame count',()=>{for(const fps of [4,10,15,30,60,120]){let remaining=1;for(let i=0;i<fps*2;i++)remaining*=1-C.followFactor(1/fps);assert.ok(Math.abs(remaining-Math.exp(-4.2))<1e-12,'Frame dependent follow at '+fps);}assert.equal(C.followFactor(-1),0);assert.equal(C.followFactor(NaN),0);assert.ok(C.followFactor(100)<1);});
