const test=require('node:test'),assert=require('node:assert/strict'),{create,normalize}=require('../src/trainer-profile.js');
test('trainer identity is generated once, survives normalization and rejects corrupt IDs',()=>{
 const p=create(Date.UTC(2026,9,26),()=>.5);assert.equal(p.id,32768);assert.deepEqual(normalize({...p,playSeconds:91.5}),{...p,playSeconds:91.5});
 assert.equal(normalize({...p,id:-1}),null);assert.equal(normalize({...p,startedAt:'invalid'}),null);
 assert.equal(normalize({...p,playSeconds:Infinity}).playSeconds,3599999);
});

const identity=require('../src/player-identity.js');
test('player identity preserves legacy names and trainer records while fresh games require the introduction',()=>{
 const saved=Object.freeze({playerName:'ABCDEFGHIJ',trainer:Object.freeze({id:1234}),phase:'opelucid'});
 assert.deepEqual(identity.normalizeState(saved),{playerName:'ABCDEFGHIJ',playerGender:'M',introductionComplete:true});
 assert.equal(saved.trainer.id,1234);assert.equal(saved.phase,'opelucid');
 assert.deepEqual(identity.normalizeState({}, {fresh:true}),{playerName:'Alcide',playerGender:'M',introductionComplete:false});
 assert.deepEqual(identity.normalizeState({playerGender:'F',introductionComplete:false}),{playerName:'Anita',playerGender:'F',introductionComplete:false});
 assert.equal(identity.normalizeState({playerGender:'X',playerName:'Anita'}).playerGender,'M');
 assert.equal(identity.normalizeState({playerGender:'X',playerName:'Anita'}).playerName,'Anita');
});
test('new player names use seven characters without truncating older ten-character saves',()=>{
 assert.equal(identity.normalizeName(' ABCDEFGHIJ ',{maxLength:identity.nameLimit}),'ABCDEFG');
 assert.equal(identity.normalizeName('ABCDEFGHIJ'),'ABCDEFGHIJ');
 assert.equal(identity.normalizeName('A\u0300\nlice'),'Àlice');
 assert.equal(identity.normalizeName('',{gender:'F'}),'Anita');
 assert.equal(identity.battleKey,'Alcide');
});
test('all player visual lookups follow live identity and never fall back to male art for a missing female bank',t=>{
 const keys=['Journey','PLAYER_ASSETS','OPENING_SPRITES','ROM_SPRITES','SURF_FIELD_ASSETS','PHONE_ASSETS'],before=Object.fromEntries(keys.map(k=>[k,global[k]]));
 t.after(()=>{for(const k of keys)if(before[k]===undefined)delete global[k];else global[k]=before[k];});
 global.PLAYER_ASSETS={sprites:{Alcide:['male'],Anita:['female'],AlcideBike:['male-bike'],AnitaBike:['female-bike']},portraits:{Alcide:['male-face'],Anita:['female-face']},intro:{Alcide:'male-intro',Anita:'female-intro'}};
 global.OPENING_SPRITES={Belle:['friend']};global.ROM_SPRITES={};global.SURF_FIELD_ASSETS={sprites:{AlcideSurf:['male-surf'],AnitaSurf:['female-surf']}};
 global.Journey={state:{playerName:'Iris',playerGender:'F'}};
 assert.equal(identity.key,'F');assert.equal(identity.name(),'Iris');assert.deepEqual(identity.frames('Alcide'),['female']);
 assert.deepEqual(identity.frames('AlcideBike'),['female-bike']);assert.deepEqual(identity.frames('AlcideSurf'),['female-surf']);
 assert.deepEqual(identity.portraitFrames('Alcide'),['female-face']);assert.equal(identity.introIcon('F'),'female-intro');
 assert.equal(identity.displayName('Alcide'),'Iris');assert.equal(identity.displayName('Belle'),'Belle');assert.deepEqual(identity.frames('Belle'),['friend']);
 assert.deepEqual(identity.trainerCard(),{front:'frontFemaleRank0',back:'backFemaleRank0',avatar:'avatarFemaleRank0'});
 delete global.PLAYER_ASSETS.sprites.Anita;assert.equal(identity.frames('Alcide'),null);
 global.Journey.state={playerName:'Nico',playerGender:'M'};
 assert.equal(identity.key,'M');assert.deepEqual(identity.frames('Alcide'),['male']);assert.equal(identity.name(),'Nico');
 assert.equal(identity.battleKey,'Alcide');
});

test('native bicycle poses retain each direction through idle and the original pedal sequence',()=>{
 const assets=require('../src/player-assets.js'),mapping=assets.bikeMapping;
 assert.deepEqual(mapping.nativeTextureIndices,[12,1,0,2,13,4,3,5,14,7,6,8,15,10,9,11]);
 for(const name of ['AlcideBike','AnitaBike'])for(let d=0;d<4;d++){
  const indices=[0,1,2,3,2].map(slot=>Number(assets.sprites[name][d*4+slot].match(/(?:bicycle|AnitaBike)-(\d+)\.png/)[1]));
  assert.deepEqual(indices,[12+d,3*d+1,3*d,3*d+2,3*d]);
 }
});
