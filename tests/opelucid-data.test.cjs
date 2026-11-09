/* Reference records only: these tests do not certify integration or pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../src'),read=name=>{const s=fs.readFileSync(path.join(root,name+'.js'),'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));},d=read('opelucid-data'),old=read('icirrus-data'),events=read('opelucid-events');
test('native Silvestro party, seventh-badge cap and next-gym boundary are explicit',()=>{
 assert.deepEqual(d.trainers[131].party.map(p=>[p.name,p.level]),[['Vanillish',37],['Cryogonal',37],['Beartic',39]]);assert.equal(d.trainers[131].party[1].gender,'N');
 assert.deepEqual(d.trainers[131].party.map(p=>p.moves),[[429,151,524,310],[115,62,524,229],[163,362,556,207]]);
 assert.equal(d.levelCap,43);assert.deepEqual(d.capSteps.slice(-2),[{badge:6,level:39},{badge:7,level:43}]);assert.equal(events.zones[121],undefined,'Eighth Gym belongs to the following chapter');
});
test('051 retains existing species, identities, growth, learned moves and compatible machines',()=>{
 for(const [name,p]of Object.entries(old.progression)){const n=d.progression[name];assert.ok(n,name);assert.equal(n.id,p.id,name);assert.deepEqual(n.abilities,p.abilities,name);assert.deepEqual(n.moves.filter(m=>m.level<=39),p.moves,name);assert.deepEqual(d.pokemonData[name],old.pokemonData[name],name);for(const item of old.compatibility[name])assert.ok(d.compatibility[name].includes(item),name+' '+item);}
 for(const [item,move]of Object.entries(old.machines))assert.equal(d.machines[item],move,item);
 assert.equal(d.machines[406],524);assert.equal(d.machines[357],247);assert.equal(d.machines[363],188);assert.equal(d.genderGraphics.Jellicent.F,'593-female');
});
test('ordinary new encounter sources and seasonal weights remain separate from reference-only phenomena',()=>{
 for(const [zone,table]of Object.entries(d.encounters)){assert.equal(table.seasons.length,4,zone);for(const groups of table.seasons)for(const [kind,g]of Object.entries(groups)){assert.equal(g.slots.reduce((sum,s)=>sum+s.weight,0),100,zone+' '+kind);for(const s of g.slots){assert.equal(s.id,s.sourceRawSpecies&1023);assert.equal(s.form,s.sourceRawSpecies>>>10);assert.ok(s.min>=1&&s.max>=s.min&&s.max<=100);}}}
 for(const sources of Object.values(d.encounterSources))for(const source of sources)assert.ok(['normal','dark','surf'].includes(source.kind));
 for(const name of ['Krookodile','Maractus','Crustle','Cofagrigus','Jellicent','Ferrothorn','Beheeyem','Lampent','Mienfoo','Druddigon','Golurk','Pawniard'])assert.equal(d.progression[name].obtainable,true,name+' catalog source');
 assert.equal(d.progression.Fraxure.obtainable,false);assert.equal(d.progression.Bouffalant.obtainable,false);
});
test('all extracted entries, branch destinations, movement programs and continuations resolve',()=>{
 assert.equal(Object.keys(events.zones).length,48);for(const [bank,p]of Object.entries(events.scripts)){assert.match(p.sourceSha256,/^[a-f0-9]{64}$/);for(const entry of p.supportedEntries)assert.ok(p.code[p.entries[entry]],bank+' entry '+entry);for(const [pc,c]of Object.entries(p.code)){if(['VMJump','VMCall'].includes(c.name))assert.ok(p.code[c.args[0]],bank+':'+pc);if(c.name==='VMJumpIf')assert.ok(p.code[c.args[1]],bank+':'+pc);if(!['VMHalt','VMReturn','VMJump','RTEndGlobal'].includes(c.name))assert.ok(p.code[c.end],bank+':'+pc+' continuation');if(c.name==='ActorCmdExec')assert.equal(p.movements[c.args[1]].at(-1)[0],254);}}
});
