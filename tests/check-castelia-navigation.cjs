const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{const c=environment({castelia:true,sourceRoot:process.env.QA_SOURCE_ROOT}),n=c.NativeStory,j=c.Journey;await c.CasteliaChapter.ensure();n.state.intro=true;n.state.initialized=true;j.state.phase='castelia';j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Servine',25),c.OPENING_DATA.Servine.growth[25])];
 for(const zone of Object.values(c.CASTELIA_EVENTS.zones)){for(const t of [...zone.triggers,...zone.onEnter])n.state.vars[t.var]=100;}
 let count=0;
 for(const [id,zone]of Object.entries(c.CASTELIA_EVENTS.zones))for(const w of zone.warps){if(!c.CASTELIA_EVENTS.zones[w.zone])continue;
  await n.changeZone(+id,15,15);j.step(1,false);let p,out,d=.9;
  if(w.rail){const q=c.NativeRails.warp(+id,w);p={x:q.x-16,y:q.z-16};out={x:q.out.x,y:q.out.z};d=c.NativeRails.landing(+id,w).distance+.05;}
  else{p={x:w.x/16-16,y:w.z/16-16};out=({1:{x:0,y:1},2:{x:0,y:-1},3:{x:1,y:0},4:{x:-1,y:0}})[w.a];}
  c.player={x:p.x-out.x*d,y:p.y-out.y*d};const step=w.rail?.2:.3;
  const task=n.tryWarp(out.x,out.y,c.player.x+out.x*step,c.player.y+out.y*step);assert.ok(task&&typeof task.then==='function',`warp did not start ${id}->${w.zone}: `+JSON.stringify({locked:n.locked,menu:c.menuOpen(),processing:j.processing,zone:n.state.zone,player:c.player,out,p,d,step,vm:n.vm.running,error:c.$('world').dataset.eventError}));await drain(c,task,0,'p1');assert.equal(n.state.zone,w.zone,`warp destination ${id}->${w.zone}`);count++;
 }
 // Entering the dock from a rail must dispatch its original on-enter event.
 n.state.vars[16595]=1;n.state.flags=n.state.flags.filter(f=>![798,800].includes(f));await n.changeZone(28,71,33);j.step(1,false);
 const w=c.CASTELIA_EVENTS.zones[28].warps.find(w=>w.zone===38),q=c.NativeRails.warp(28,w),d=c.NativeRails.landing(28,w).distance+.05;c.player={x:q.x-16-q.out.x*d,y:q.z-16-q.out.z*d};
 await drain(c,n.tryWarp(q.out.x,q.out.z,c.player.x+q.out.x*.2,c.player.y+q.out.z*.2),0,'p1');assert.equal(n.state.zone,38);assert.equal(n.state.vars[16595],2,'dock on-enter did not run');assert.equal(n.state.vars[16557],1);
 // Solve by reachable buttons, rather than calling all eight from outside the maze.
 n.state.vars[16599]=1;n.state.casteliaGymSwitches=Array(8).fill(0);await n.changeZone(29,32,43);let at=[32,43],pressed=[];
 function pathTo(target){const queue=[at],seen=new Set([at.join(':')]),parent=new Map();for(let k=0;k<queue.length;k++){const p=queue[k];if(p[0]===target[0]&&p[1]===target[1]){const path=[];for(let q=p;q;q=parent.get(q.join(':')))path.push(q);return path.reverse();}for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]]){const q=[p[0]+dx,p[1]+dy],key=q.join(':'),x=q[0]+.5-16,y=q[1]+.5-16;if(q[0]<0||q[1]<0||q[0]>63||q[1]>63||seen.has(key)||c.blocked(x-.18,y-.18)||c.blocked(x+.18,y+.18)||n.occupied(x,y))continue;seen.add(key);parent.set(key,p);queue.push(q);}}return null;}
 while(pressed.length<8){let found=null;for(let i=0;i<8;i++){if(pressed.includes(i))continue;const p=c.CASTELIA_GYM_DATA.buttons[i],path=pathTo([Math.floor(p[0]),Math.floor(p[2])]);if(path){found={i,path};break;}}assert.ok(found,'Honey puzzle has no reachable unpressed button after '+pressed);at=found.path.at(-1);c.player={x:at[0]+.5-16,y:at[1]+.5-16};await drain(c,n.run(6+found.i),0,'p1');pressed.push(found.i);}
 assert.ok(pathTo([32,5]),'Burgh cannot be reached after solving honey puzzle');
 console.log(`PASS Castelia navigation: ${count} transitions, dock dispatch, reachable honey-button order ${pressed.join(',')} and route to Burgh.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
