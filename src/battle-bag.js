/* Original six-slot battle bag geometry, bounded pages and quantities. */
(function(root){
 const categories={medicine:[17,25,26,28,30,155],balls:[4,3,14],statusItems:[18,21,22,27,150],battleItems:[]},names={medicine:'PS / PP',balls:'BALL',statusItems:'STATO',battleItems:'LOTTA'};
 function inventory(mode,count){return (categories[mode]||[]).map(id=>({id,count:Math.max(0,Math.floor(count(id))||0)})).filter(x=>x.count);}
 function page(items,index=0){const pages=Math.max(1,Math.ceil(items.length/6)),number=Math.max(0,Math.min(pages-1,Math.floor(index)||0));return {number,pages,previous:number>0,next:number+1<pages,items:items.slice(number*6,number*6+6).map((item,i)=>({...item,rect:[4+i%2*128,4+Math.floor(i/2)*48,120,40]}))};}
 root.BattleBag={inventory,page,names};if(typeof module!=='undefined')module.exports=root.BattleBag;
})(typeof window!=='undefined'?window:globalThis);
