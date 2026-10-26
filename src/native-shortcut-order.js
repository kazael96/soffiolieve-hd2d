/* IRBI 0200C480 insertion boundaries; overlay21 end marker0xff. */
(function(root){
 function insert(list,source,destination){const ids=[...list];if(source<0||source>=ids.length)throw Error('Invalid shortcut source');const [id]=ids.splice(source,1);const index=destination===255?ids.length:Math.max(0,Math.min(ids.length,destination-(source<destination?1:0)));ids.splice(index,0,id);return {ids,index};}
 function step(cursor,after,delta,length){if(delta>0){if(after)return {cursor:0,after:false};if(cursor===length-1)return {cursor,after:true};return {cursor:cursor+1,after:false};}if(after)return {cursor,after:false};if(cursor===0)return {cursor:length-1,after:true};return {cursor:cursor-1,after:false};}
 const api={insert,step};root.NativeShortcutOrder=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
