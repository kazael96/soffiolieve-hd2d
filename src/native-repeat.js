/* IRBI itemmenu: held stylus applies frame1,31..120, then accelerates at121. */
(function(root){
 class Hold{
  constructor(){this.frames=0;}
  reset(){this.frames=0;}
  advance(frames=1){const steps=[];for(let i=0;i<Math.max(0,Math.floor(frames));i++){this.frames++;if(this.frames===1||this.frames>=31)steps.push(this.frames>=121?10:1);}return steps;}
 }
 const api={Hold};root.NativeRepeat=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
