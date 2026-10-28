/* Virtual gameplay clock; browser I/O and readable menus keep wall time. */
(function(root){
 let pending=null,rate=1,wall=performance.now(),time=wall;const timers=new Set(),listeners=new Set();
 const publish=()=>listeners.forEach(fn=>fn());
 try{const saved=+localStorage.getItem('soffiolieve-game-speed');if([1,2,4].includes(saved))rate=saved;}catch{}
 function now(){const n=performance.now();time+=(n-wall)*rate;wall=n;return time;}
 function arm(t){clearTimeout(t.handle);t.handle=setTimeout(()=>{if(!timers.has(t))return;if(now()+.5<t.at)return arm(t);timers.delete(t);t.fn();},Math.max(0,(t.at-now())/rate));}
 function schedule(fn,ms){const t={fn,at:now()+Math.max(0,ms)};timers.add(t);arm(t);return t;}
 function cancel(t){if(!t)return;clearTimeout(t.handle);timers.delete(t);}
 function set(value){value=+value;if([1,2,4].includes(value)&&root.MoveFX?.active&&!root.MoveFX.active.preview){pending=value;publish();return rate;}if(![1,2,4].includes(value))return rate;now();rate=value;try{localStorage.setItem('soffiolieve-game-speed',String(rate));}catch{}for(const t of timers)arm(t);root.document?.documentElement?.setAttribute('data-game-speed',String(rate));publish();return rate;}
 const api={now,set,cycle(){const rates=[1,2,4];return set(rates[(rates.indexOf(pending??rate)+1)%3]);},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},schedule,cancel,wait:ms=>new Promise(resolve=>schedule(resolve,ms)),get rate(){return rate;},steps(dt){let rest=Math.min(.25,Math.max(0,dt))*rate,out=[];while(rest>1e-8){const d=Math.min(.04,rest);out.push(d);rest-=d;}return out;}};
 api.flush=()=>{if(pending!==null){const value=pending;pending=null;set(value);}};Object.defineProperty(api,'pending',{get:()=>pending});root.GameSpeed=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
