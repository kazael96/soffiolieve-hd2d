/* IRBI overlay181 staff-roll commands. Pure logical update; no wall clock,
 * storage, victories or postgame transitions. Renderer verification is separate.
 */
(function(root){
 function create(data){
  if(!Array.isArray(data?.rows)||!data.rows.some(r=>r.kind===5)||data.cameraQ12?.length!==7)throw Error('Tabella dei crediti non valida');
  if(data.intro?.leadFrames!==42||data.intro.holdFrames!==166||data.intro.fadeStep!==2||data.intro.maxScale!==8)throw Error('Introduzione originale dei crediti non valida');
  let row=0,frame=0,wait=data.intro.leadFrames,scroll=false,visible=false,phase='leadIn',alpha=0,finished=false,camera=[...data.cameraQ12[0]],cameraTask=null,fadeMask=0,logoVisible=false,logoScale=8,logoAlpha=0;
  const lines=[],visited=[],cameraQueue=[];
  function draw(r,staticPosition=false){if(r.text===65535)return;if(typeof data.texts[r.text]!=='string'||!data.fonts[r.font])throw Error('Testo originale dei crediti non disponibile');const y=staticPosition?(r.y<256?r.y:192+r.y-256):384+(r.font?2:0);lines.push({row:staticPosition?row:row,text:r.text,font:r.font,color:r.color,align:r.align,x:r.x+r.offset,y});}
  function cameraTick(){
   if(!cameraTask&&cameraQueue.length){const task=cameraQueue.shift(),target=data.cameraQ12[task.index];if(!target||task.duration<=0)throw Error('Camera dei crediti non valida');cameraTask={...task,at:0,from:[...camera],target,delta:target.map((v,i)=>Math.trunc((v-camera[i])*256/task.duration))};}
   if(!cameraTask)return;
   const t=cameraTask;if(t.at>=t.duration){camera=[...t.target];cameraTask=null;}else{camera=t.from.map((v,i)=>v+Math.trunc(t.delta[i]*t.at/256));t.at++;}
  }
  function commands(){
   let budget=data.rows.length;
   while(phase==='commands'&&budget-->0){
    const r=data.rows[row];if(!r)throw Error('Crediti senza terminatore');visited.push(row);
    switch(r.kind){
     case 0:if(r.text===65535||wait===0)wait=r.y;draw(r);if(r.text===65535||data.rows[row+1]?.kind!==0||data.rows[row+1]?.y!==0)phase='wait';break;
     case 1:draw(r,true);fadeMask|=r.y<256?1:2;if(data.rows[row+1]?.kind!==1){phase='in';alpha=0;}break;
     case 2:phase='out';alpha=16;break;
     case 3:scroll=true;break;
     case 4:scroll=false;break;
     case 5:phase='finish';alpha=16;break;
     case 6:break;
     case 7:visible=true;break;
     case 8:visible=false;break;
     case 9:cameraQueue.push({index:r.arg,duration:r.y});break;
     case 10:{const selected=data.rows[row+r.arg];if(!selected)throw Error('Titolo dei crediti mancante');draw(selected);wait=selected.y;phase='wait';break;}
     default:throw Error('Comando dei crediti non supportato: '+r.kind);
    }
    row++;
   }
   if(budget<0&&phase==='commands')throw Error('Crediti senza avanzamento');
  }
  function tick(){
   if(finished)return snapshot();frame++;
   if(phase==='leadIn'){if(--wait<=0)phase='logoShow';}
   else if(phase==='logoShow'){logoVisible=true;phase='logoIn';alpha=0;}
   else if(phase==='logoIn'){alpha=Math.min(16,alpha+2);logoAlpha=alpha/16;logoScale=Math.max(1,8-alpha/2);if(alpha===16){phase='logoHold';wait=166;}}
   else if(phase==='logoHold'){if(--wait<=0){phase='logoOut';alpha=0;}}
   else if(phase==='logoOut'){alpha=Math.min(16,alpha+2);logoAlpha=1-alpha/16;logoScale=1+alpha/2;if(alpha===16){logoVisible=false;phase='introCleanup';}}
   else if(phase==='introCleanup')phase='introReady';
   else if(phase==='introReady')phase='commands';
   else if(phase==='wait'){if(wait<=0)phase='commands';else wait--;}
   else if(phase==='in'){alpha=Math.min(16,alpha+4);if(alpha===16)phase='commands';}
   else if(phase==='out'){alpha=Math.max(0,alpha-4);if(alpha===0)phase='outClear';}
   else if(phase==='outClear'){lines.length=0;fadeMask=0;phase='commands';}
   else if(phase==='finish'){alpha=Math.max(0,alpha-1);if(alpha===0)finished=true;}
   if(phase==='commands')commands();
   // Native scrolling and queued camera motion continue during text waits.
   if(scroll)for(const line of lines)line.y--;
   while(lines.length&&lines[0].y<-32)lines.shift();
   cameraTick();return snapshot();
  }
  function snapshot(){return {row,frame,wait,scroll,visible,phase,alpha,fadeMask,finished,logo:{visible:logoVisible,scale:logoScale,alpha:logoAlpha},camera:[...camera],lines:lines.map(l=>({...l})),visited:[...visited]};}
  return {tick,snapshot};
 }
 function projection(camera,p){
  if(camera?.length!==6||!camera.every(Number.isFinite)||!p||p.sin<=0||p.cos<=0)throw Error('Proiezione dei crediti non valida');
  const eye=camera.slice(0,3).map(v=>v/4096),target=camera.slice(3).map(v=>v/4096),norm=v=>{const n=Math.hypot(...v);if(n<1e-9)throw Error('Camera dei crediti degenere');return v.map(x=>x/n);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x),v=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1],f=p.cos/p.sin,n=p.near,far=p.far,a=p.nativeAspectQ12/4096,m=[f/a,0,0,0,0,f,0,0,0,0,(far+n)/(n-far),-1,0,0,2*far*n/(n-far),0];
  return Array.from({length:16},(_,i)=>{const r=i%4,c=i>>2;return m[r]*v[c*4]+m[4+r]*v[c*4+1]+m[8+r]*v[c*4+2]+m[12+r]*v[c*4+3];});
 }
 const api={create,projection};root.FinaleCreditsMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
