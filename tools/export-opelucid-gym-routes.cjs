/* Derive directional ice entries from native event228 and rail point identities. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src'),read=name=>{const raw=fs.readFileSync(path.join(root,name+'.js'),'utf8');return JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));};
const rails=read('opelucid-rails'),events=read('opelucid-events'),zone=events.zones[114],program=events.scripts[zone.script],table=rails[114],context={PINWHEEL_RAILS:rails};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'native-rails.js'),'utf8'),context);
const directions=[[0,-1],[0,1],[-1,0],[1,0]],entries=[];
function chain(start){const result=[],seen=new Set();let index=start;while(index!==undefined){if(seen.has(index))throw Error('Cyclic native ice rail');seen.add(index);result.push(index);const next=table.lines.map((line,i)=>({line,i})).filter(row=>row.line.a===table.lines[index].b);if(next.length>1)throw Error('Ambiguous native rail branch');index=next[0]?.i;}return result;}
for(const trigger of zone.triggers){
 const entry=program.entries[trigger.script-1];let pc=entry,gate=null;const visited=new Set();
 while(pc!==undefined&&!visited.has(pc)){visited.add(pc);const op=program.code[pc];if(!op)throw Error('Missing native gym instruction');if(op.op===405)gate=op.args[0];if(op.op===2)break;pc=op.end;}
 if(gate===null)continue;
 const [dx,dz]=directions[trigger.type-1]||[];if(dx===undefined)throw Error('Missing directional entry');const matches=[];
 for(let line=0;line<table.lines.length;line++)for(let sample=0;sample<=table.lines[line].length*16;sample++){
  const front=sample/16,p=context.NativeRails.position(114,line,front),q=context.NativeRails.position(114,line,Math.min(front+.01,table.lines[line].length));
  if(Math.hypot(p.x-trigger.x-.5,p.z-trigger.z-.5,p.height-trigger.y/16)<1e-5&&(q.x-p.x)*dx+(q.z-p.z)*dz>0)matches.push({line,front});
 }
 if(matches.length!==1)throw Error('Ambiguous directional gate '+gate+': '+JSON.stringify(matches));
 entries.push({gate,script:trigger.script,direction:trigger.type-1,tile:[trigger.x,trigger.y/16,trigger.z],...matches[0],lines:chain(matches[0].line)});
}
entries.sort((a,b)=>a.gate-b.gate);if(entries.length!==8||entries.some((entry,index)=>entry.gate!==index))throw Error('Incomplete native ramp gate set');
const roots=table.lines.map((line,i)=>({line,i})).filter(row=>!table.lines.some(other=>other.b===row.line.a)),automatic=roots.filter(row=>!entries.some(entry=>entry.line===row.i)).map(row=>({line:row.i,lines:chain(row.i)}));
// Each component contains paired native163 mode-boundary cells. The line
// endpoints include blocked padding and are not the playable landing points.
for(const route of [...entries,...automatic]){
 const boundaries=route.lines.flatMap(id=>{const line=table.lines[id],tiles=line.tiles;return Array.from({length:tiles.length},(_,front)=>({line:id,front,value:tiles.values[front*tiles.width+Math.floor(tiles.width/2)]})).filter(p=>(p.value&65535)===163);});
 if(boundaries.length!==2||boundaries.some(p=>p.value&0x10000))throw Error('Invalid native ice boundaries');
 const [entry,exit]=boundaries,last=table.lines[exit.line];
 if(entry.line!==route.line||exit.line!==route.lines.at(-1)||!(last.tiles.values[(exit.front+1)*last.tiles.width+Math.floor(last.tiles.width/2)]&0x10000))throw Error('Native ice boundary/padding mismatch');
 if(route.front!==undefined&&route.front!==entry.front)throw Error('Directional trigger differs from native entry boundary');
 route.entry={line:entry.line,front:entry.front,behavior:163};route.exit={line:exit.line,front:exit.front,behavior:163};
}
const data={source:'IRBI event228 directional triggers/opcode405 + native Gym114 rail point connectivity',zone:114,entries,automatic,timing:'HD-2D movement adapter; native curves and line parameterization, no DS frame timing claim'};
fs.writeFileSync(path.join(root,'opelucid-gym-routes.js'),'window.OPELUCID_GYM_ROUTES='+JSON.stringify(data)+';\n');
process.stdout.write(JSON.stringify(data,null,2)+'\n');
