/* IRBI Center109 common shop871. Prices and stocks come from the native tables. */
((root)=>{
 const data=()=>root.MISTRALTON_DATA;
 function stock(id,badges=[]){const m=data().market,index=id===255?m.badgeStock[Math.min(8,new Set(badges).size)]:m.fixedStocks[id];if(index===undefined||!m.stocks[index])throw Error('Inventario Market non supportato: '+id);return [...m.stocks[index]];}
 const machine=id=>data().itemPockets[id]===2;
 function purchase(j,id,count,shop=255){
  if(!Number.isInteger(count)||count<1||count>99||!stock(shop,j.state.original?.badges||[]).includes(id))return {ok:false,reason:'stock'};
  if(machine(id)&&(count!==1||j.itemCount(id)))return {ok:false,reason:'owned'};
  const cost=data().itemPrices[id]*count;if(!cost||cost>j.state.money)return {ok:false,reason:'money'};
  if(j.itemCount(id)+count>999)return {ok:false,reason:'space'};
  if(!j.addItem(id,count))return {ok:false,reason:'space'};
  j.state.money-=cost;let bonus=0;
  // In Black/White the clerk gives one Premier Ball for at least ten Poke Balls.
  if(id===4&&count>=10&&j.itemCount(12)<999&&j.addItem(12,1))bonus=12;
  j.update();j.save(true);return {ok:true,cost,count,bonus};
 }
 function salePrice(id){return [2,4].includes(data().itemPockets[id])?0:Math.floor((data().itemPrices[id]||0)/2);}
 function sell(j,id,count){const price=salePrice(id);if(!price||!Number.isInteger(count)||count<1||count>99||j.itemCount(id)<count)return {ok:false,reason:'sale'};if(!j.consumeItem(id,count))return {ok:false,reason:'sale'};const paid=price*count;j.state.money=Math.min(9999999,j.state.money+paid);j.update();j.save(true);return {ok:true,paid,count};}
 const clean=s=>String(s).replace(/\\n/g,'\n').replace(/\{[^}]*\}/g,'');
 async function open({journey:j,native,stock:stockId,type,choice,showPage,playSound=async()=>{}}){
  if(type!==1&&type!==2)throw Error('Tipo Market non supportato: '+type);
  const texts=data().market.texts,say=i=>showPage(clean(texts[i])),name=id=>data().itemNames[id];
  async function select(list,label){let first=0;while(true){const page=list.slice(first,first+6),actions=page.map(id=>({label:label(id),id}));if(first)actions.push({label:'Pagina precedente',delta:-6});if(first+6<list.length)actions.push({label:'Pagina successiva',delta:6});actions.push({label:'Annulla'});const selected=actions[await choice(actions.map(a=>a.label))];if(selected?.id!==undefined)return selected.id;if(selected?.delta){first+=selected.delta;continue;}return null;}}
  async function quantity(id,max,selling){let count=1;while(true){await showPage(`${name(id)} ×${count}\n${selling?'Ricavo':'Prezzo'}: ₽${(selling?salePrice(id):data().itemPrices[id])*count}\nDenaro: ₽${j.state.money}`);const i=await choice(['Conferma','−1','+1','−10','+10','Annulla']);if(i===0)return count;if(i===5)return 0;count=Math.max(1,Math.min(max,count+({1:-1,2:1,3:-10,4:10}[i]||0)));}}
  await say(type===2?1:0);
  while(true){const menu=await choice([clean(texts[5]),clean(texts[6]),clean(texts[7])]);if(menu===2)break;
   if(menu===0){const list=stock(stockId,native.badges||[]).filter(id=>!machine(id)||!j.itemCount(id));
    const id=await select(list,id=>`${name(id)} — ₽${data().itemPrices[id]}`);if(id!==null){const max=Math.min(99,999-j.itemCount(id),Math.floor(j.state.money/data().itemPrices[id]));if(max<1)await showPage(j.itemCount(id)>=999?'La Borsa è piena.':'Non hai abbastanza denaro.');else{const count=machine(id)?1:await quantity(id,max,false);if(count&&await choice(['Acquista','Annulla'])===0){const result=purchase(j,id,count,stockId);if(!result.ok)throw Error('Acquisto non riuscito: '+result.reason);await playSound(1352);await showPage(`Hai acquistato ${name(id)} ×${count}.`);if(result.bonus)await showPage('Hai ricevuto una Premier Ball in omaggio!');}}}
   }else if(menu===1){const list=Object.keys(data().itemPrices).map(Number).filter(id=>j.itemCount(id)>0&&salePrice(id)>0),id=await select(list,id=>`${name(id)} ×${j.itemCount(id)} — ₽${salePrice(id)}`);if(id!==null){const count=await quantity(id,Math.min(99,j.itemCount(id)),true);if(count&&await choice(['Vendi','Annulla'])===0){const result=sell(j,id,count);if(!result.ok)throw Error('Vendita non riuscita');await playSound(1352);await showPage(`Hai venduto ${name(id)} ×${count} per ₽${result.paid}.`);}}}
   await say(2);
  }await say(3);
 }
 function install(events){const p=data()?.receiptProgram;if(!p)return;const target=events.scripts[862];Object.assign(target.code,p.code);target.entries[14]=p.entries[14];if(!target.supportedEntries.includes(14))target.supportedEntries.push(14);Object.assign(events.commands,p.commands||{});}
 root.MistraltonServices={stock,purchase,sell,salePrice,open,install};
 if(typeof module!=='undefined')module.exports=root.MistraltonServices;
})(typeof window!=='undefined'?window:globalThis);
