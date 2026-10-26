(function(root){
 const natures=['Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile','Relaxed','Impish','Lax','Timid','Hasty','Serious','Jolly','Naive','Modest','Mild','Quiet','Bashful','Rash','Calm','Gentle','Sassy','Careful','Quirky'];
 function characteristic(ivs,pid){const order=['hp','atk','def','spe','spa','spd'];let best=-1,stat=0;for(let i=0;i<6;i++){const index=((pid>>>0)%6+i)%6,value=ivs[order[index]]||0;if(value>best){best=value;stat=index;}}return 53+stat*5+best%5;}
 function natureId(name){return Math.max(0,natures.indexOf(name));}
 root.SummaryModel={characteristic,natureId};if(typeof module!=='undefined')module.exports={characteristic,natureId};
})(typeof window!=='undefined'?window:globalThis);
