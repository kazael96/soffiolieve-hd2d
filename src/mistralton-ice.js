/* Native ice24, opcode328 camera shake and opcode491 warp-table patches.
 * Sliding speed is an explicit HD-2D timing adaptation; terrain is native.
 */
(function(root){
 const directions=[[0,-1],[0,1],[-1,0],[1,0]],point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<4096&&Math.abs(p.y)<4096,integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
 function createController(options={}){
  const state=options.state||(()=>root.NativeStory?.state),hero=options.player||(()=>typeof player!=='undefined'?player:null),direction=options.direction||(()=>typeof facing==='number'?facing/3:0),resetInput=options.resetInput||(()=>root.resetInput?.()),save=options.save||(()=>root.Journey?.save(true)),canStart=options.canStart||(()=>!root.NativeStory?.locked),speed=options.speed??3.75;
  if(!Number.isFinite(speed)||speed<=0||speed>32)throw Error('Velocità di scivolamento non valida');
  const grids=()=>typeof options.grids==='function'?options.grids(192):options.grids||root.MistraltonChapter?.grids(192)||root.MISTRALTON_SCENES?.[192]?.permissionGrids;
  const events=()=>typeof options.events==='function'?options.events():options.events||root.MISTRALTON_EVENTS;
  let slide=null,shake=null,releaseRequired=false,lastDirection=null;
  function tile(x,y){const all=grids();if(!Array.isArray(all)||!all.length)return null;const grid=all.find(g=>x>=g.x-16&&x<g.x+16&&y>=g.z-16&&y<g.z+16);if(!grid)return {type:-1,blocked:true};if(!grid.bytes||grid.bytes.length<8196)return null;const at=8+((Math.floor(y-grid.z)+16)*32+Math.floor(x-grid.x)+16)*8;return {type:grid.bytes[at],blocked:!!(grid.bytes[at+2]&1)};}
  function blockedAt(x,y){const check=options.blocked||options.baseBlocked,actorBlocked=options.actors?.().some(n=>!n.hidden&&!n.gimmick&&(n.fieldZone===undefined||n.fieldZone===state()?.zone)&&Math.abs(n.x-x)<.55&&Math.abs(n.y-y)<.55);if(check)return !!check(x,y)||!!actorBlocked;return (typeof root.blocked==='function'?!!root.blocked(x,y):tile(x,y)?.blocked!==false)||!!root.NativeStory?.occupied?.(x,y)||!!actorBlocked;}
  function collision(x,y){return [[-.18,-.18],[-.18,.18],[.18,-.18],[.18,.18]].some(([dx,dy])=>blockedAt(x+dx,y+dy));}
  function persistSlide(){const n=state(),p=hero();if(slide&&n&&point(p)){const {dir,phase,target,stopAfter}=slide;n.mistraltonIceSlide={version:1,zone:192,dir,phase,target:{...target},stopAfter:!!stopAfter,x:p.x,y:p.y};}}
  function finishSlide(persist=true){const n=state();if(slide){releaseRequired=true;lastDirection=slide.dir;}slide=null;if(n)delete n.mistraltonIceSlide;resetInput();if(persist)save();}
  function forwardTarget(){const p=hero(),[dx,dy]=directions[slide.dir],horizontal=!!dx;let along=Math.floor((horizontal?p.x:p.y))+.5;const value=horizontal?p.x:p.y,sign=horizontal?dx:dy;if((along-value)*sign< -1e-7)along+=sign;
   slide.phase='travel';slide.target=horizontal?{x:along,y:p.y}:{x:p.x,y:along};const next=tile(slide.target.x,slide.target.y);slide.stopAfter=next?.type!==24;
  }
  function startSlide(){const n=state(),p=hero(),dir=direction();if(!n||n.zone!==192||!point(p)||!integer(dir,0,3)||slide||!canStart())return false;const current=tile(p.x,p.y);if(!current||current.type!==24||current.blocked||releaseRequired&&lastDirection===dir)return false;
   const horizontal=dir>=2;slide={dir,phase:'align',target:horizontal?{x:p.x,y:Math.floor(p.y)+.5}:{x:Math.floor(p.x)+.5,y:p.y},stopAfter:false};releaseRequired=true;lastDirection=dir;persistSlide();resetInput();save();return true;
  }
  function restoreSlide(){const n=state(),p=hero(),r=n?.mistraltonIceSlide;if(!r)return false;if(n.zone!==192){delete n.mistraltonIceSlide;return false;}if(!tile(p?.x,p?.y))return false;
   const horizontal=r.dir>=2,valid=r.version===1&&r.zone===192&&integer(r.dir,0,3)&&['align','travel'].includes(r.phase)&&point(r.target)&&point(p)&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&Math.hypot(r.x-p.x,r.y-p.y)<.001&&Math.hypot(r.target.x-p.x,r.target.y-p.y)<=1.01&&
    (r.phase==='align'?(horizontal?Math.abs(r.target.x-p.x)<1e-6&&Math.abs(r.target.y-(Math.floor(p.y)+.5))<1e-6:Math.abs(r.target.y-p.y)<1e-6&&Math.abs(r.target.x-(Math.floor(p.x)+.5))<1e-6):(horizontal?Math.abs(r.target.y-p.y)<1e-6&&Math.abs(r.target.x-(Math.floor(r.target.x)+.5))<1e-6:Math.abs(r.target.x-p.x)<1e-6&&Math.abs(r.target.y-(Math.floor(r.target.y)+.5))<1e-6));
   if(!valid||r.phase==='align'&&tile(p.x,p.y).type!==24){delete n.mistraltonIceSlide;return false;}const [dx,dy]=directions[r.dir];if(r.phase==='travel'&&((r.target.x-p.x)*dx+(r.target.y-p.y)*dy<-.001)){delete n.mistraltonIceSlide;return false;}
   slide={dir:r.dir,phase:r.phase,target:{...r.target},stopAfter:r.phase==='travel'&&tile(r.target.x,r.target.y)?.type!==24};releaseRequired=true;lastDirection=r.dir;resetInput();return true;
  }
  function advanceSlide(dt){if(!slide)return false;const p=hero();if(!point(p)){finishSlide();return false;}if(!tile(p.x,p.y)||!tile(slide.target.x,slide.target.y))return false;let budget=dt*speed,moved=false,guard=0;
   while(slide&&budget>1e-9&&guard++<2048){const target=slide.target,dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);if(d<1e-8){
     if(slide.phase==='align'){forwardTarget();continue;}
     if(slide.stopAfter){finishSlide();break;}
     const [vx,vy]=directions[slide.dir];slide.target={x:p.x+vx,y:p.y+vy};const next=tile(slide.target.x,slide.target.y);if(!next)break;slide.stopAfter=next.type!==24;if(collision(slide.target.x,slide.target.y)){finishSlide();break;}continue;
    }
    if(collision(target.x,target.y)){finishSlide();break;}const travel=Math.min(d,budget,.08),next={x:p.x+dx/d*travel,y:p.y+dy/d*travel};if(collision(next.x,next.y)){finishSlide();break;}p.x=next.x;p.y=next.y;budget-=travel;moved=true;
   }
   if(guard>=2048)throw Error('Scivolamento non convergente');if(slide)persistSlide();return moved;
  }
  function shakeArguments(values){if(!Array.isArray(values)||values.length!==8||values.some((v,i)=>!integer(v,0,i===2?65535:i===3?255:32767))||values[2]===0||values[3]===0)throw Error('Parametri della scossa di camera non validi');return [...values];}
  function shakeRecord(args,elapsed=0){let resolve;const promise=new Promise(done=>resolve=done);return {zone:state().zone,args,elapsed,resolve,promise};}
  function persistShake(){if(shake)state().mistraltonCameraShake={version:1,zone:shake.zone,args:[...shake.args],elapsed:shake.elapsed};}
  function finishShake(completed,persist=true){const done=shake?.resolve;shake=null;const n=state();if(n)delete n.mistraltonCameraShake;done?.(completed);if(persist)save();}
  function restoreShake(){const n=state(),r=n?.mistraltonCameraShake;if(!r)return false;let args;try{args=shakeArguments(r.args);}catch{delete n.mistraltonCameraShake;return false;}if(r.version!==1||r.zone!==n.zone||!Number.isFinite(r.elapsed)||r.elapsed<0||r.elapsed>=args[2]*args[3]/30){delete n.mistraltonCameraShake;return false;}shake=shakeRecord(args,r.elapsed);return true;}
  function playShake(values){if(!state()||!Number.isInteger(state().zone))throw Error('Campo della scossa non disponibile');const args=shakeArguments(values);if(!shake)restoreShake();if(shake){if(shake.args.some((v,i)=>v!==args[i]))throw Error('Una scossa di camera è già in corso');return shake.promise;}shake=shakeRecord(args);persistShake();resetInput();save();return shake.promise;}
  function cameraOffset(){if(!shake||shake.zone!==state()?.zone)return [0,0];const [x,y,period,,decayX,decayY,delay,interval]=shake.args,frame=Math.floor(shake.elapsed*30+1e-8),eligible=delay?Math.max(0,frame-delay*period):0,updates=delay?Math.floor(eligible/Math.max(1,interval)):0,amp=a=>updates?Math.max(1,a):a;
   const angle=(Math.floor((frame%period)*65536/period)>>4)*Math.PI*2/4096,wave=Math.round(Math.sin(angle)*4096)/4096;return [amp(x-decayX*updates)*wave/16,amp(y-decayY*updates)*wave/16];
  }
  function applyCamera(renderer){const [x,y]=cameraOffset();if(!shake||!renderer?.center||(!x&&!y))return ()=>{};const center=renderer.center,oldX=center[0],hasElevation=Object.hasOwn(renderer,'elevation'),oldElevation=renderer.elevation;center[0]=oldX+x;renderer.elevation=(Number.isFinite(oldElevation)?oldElevation:0)+y;let restored=false;return ()=>{if(restored)return;restored=true;center[0]=oldX;if(hasElevation)renderer.elevation=oldElevation;else delete renderer.elevation;};}
  function patchWarp(values){const n=state(),zone=n?.zone;if(!integer(zone,0,65535)||!Array.isArray(values)||values.length!==4||values.some((v,i)=>!integer(v,0,i===0?65535:4095)))throw Error('Coordinate del varco dinamico non valide');const [index,x,y,z]=values,list=events()?.zones?.[zone]?.warps;if(!Array.isArray(list)||index>=list.length)throw Error('Varco dinamico originale non disponibile');if(list[index].rail)return false;
   if(!n.mistraltonWarpPatches||typeof n.mistraltonWarpPatches!=='object'||Array.isArray(n.mistraltonWarpPatches))n.mistraltonWarpPatches={};n.mistraltonWarpPatches[zone+':'+index]={version:1,zone,index,x:x*16+8,y:y*16,z:z*16+8};save();return true;
  }
  function warps(zone,list=events()?.zones?.[zone]?.warps||[]){const n=state(),patches=n?.mistraltonWarpPatches;if(!Array.isArray(list))throw Error('Tabella dei varchi non valida');if(!patches||typeof patches!=='object'||Array.isArray(patches))return list.map(w=>({...w}));return list.map((w,index)=>{const key=zone+':'+index,r=Object.hasOwn(patches,key)?patches[key]:null;if(!r)return {...w};const valid=r.version===1&&r.zone===zone&&r.index===index&&['x','y','z'].every(k=>integer(r[k],0,65535))&&r.x%16===8&&r.z%16===8&&r.y%16===0&&!w.rail;if(!valid){delete patches[key];return {...w};}return {...w,x:r.x,y:r.y,z:r.z};});}
  function restore(){const a=slide?true:restoreSlide(),b=shake?true:restoreShake();return a||b;}
  function enter(zone){if(slide&&zone!==192)finishSlide();if(shake&&zone!==shake.zone)finishShake(false);if(zone===state()?.zone)restore();}
  function reset(){if(slide||state()?.mistraltonIceSlide)finishSlide(false);if(shake||state()?.mistraltonCameraShake)finishShake(false,false);releaseRequired=false;lastDirection=null;resetInput();save();}
  function tick(dt,moved=false){if(!Number.isFinite(dt)||dt<0||dt>60)return false;const n=state();if(!n)return false;if(slide&&n.zone!==192)finishSlide();if(shake&&n.zone!==shake.zone)finishShake(false);if(!slide&&n.mistraltonIceSlide)restoreSlide();if(!shake&&n.mistraltonCameraShake)restoreShake();
   if(shake){shake.elapsed=Math.min(shake.args[2]*shake.args[3]/30,shake.elapsed+dt);if(shake.elapsed+1e-9>=shake.args[2]*shake.args[3]/30)finishShake(true);else persistShake();}
   if(!slide&&!moved)releaseRequired=false;if(!slide&&moved&&n.zone===192)startSlide();return advanceSlide(dt);
  }
  function command(name,args=[],values=args){if(name==='NativeOpcode328')return playShake(values);if(name==='NativeOpcode491'){patchWarp(values);return true;}return false;}
  const busy=()=>{const n=state();return !!slide||!!shake||!!n?.mistraltonIceSlide&&n.mistraltonIceSlide.zone===n.zone||!!n?.mistraltonCameraShake&&n.mistraltonCameraShake.zone===n.zone;};
  return {prepare:()=>Promise.resolve(true),tick,enter,restore,reset,command,playShake,patchWarp,warps,cameraOffset,applyCamera,tile,blocked:()=>null,canMove:()=>!busy(),get busy(){return busy();},get sliding(){return !!slide;},get slide(){return slide;}};
 }
 const api={createController};Object.defineProperties(api,Object.getOwnPropertyDescriptors(createController()));root.MistraltonIce=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
