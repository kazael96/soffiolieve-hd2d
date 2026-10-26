/* BW single-battle touchscreen flow; native IRBI art, manual-confirmed command order. */
(() => {
  const panel=document.querySelector('#battle .battle-panel'),stage=document.createElement('div');stage.id='battleTouch';stage.className='native-stage';
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Comandi di lotta');stage.append(canvas);panel.append(stage);
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const resources={},images=new Map();let font,smallFont,fontMetrics,ready=false,mode='main',buttons=[],selected=0,wasBusy=false,notice=null;
  function load(src){if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Grafica lotta non disponibile: '+src));im.src=src;}));return images.get(src);}
  const loading=Promise.all([NativeText.load().then(im=>font=im),load('assets/battle-ui/font-1.png').then(im=>smallFont=im),fetch('assets/battle-ui/provenance.json').then(r=>r.json()).then(data=>fontMetrics=data.fonts['1']),...['command-view-105.png','command-source-105.png','cell-115-117-0.png','cell-115-117-2.png','cell-165-166-0.png','cell-168-169-0.png'].map(async name=>resources[name]=await load('assets/battle-ui/'+name))]).then(()=>{ready=true;if(battling){cards();update();}}).catch(console.error);
  const text=(s,x,y,white=false,align='left')=>NativeText.draw(c,font,String(s),x,y,white,align);
  const rect=(label,x,y,w,h,action,disabled=false)=>({label,x,y,w,h,action,disabled});
  function choose(next){mode=next;notice=null;update();}
  function back(){if(busy)return;if(mode==='main')return;choose('main');}
  function activate(index){const b=buttons[index];if(!b||b.disabled)return;void AudioEngine.playSound(1352);b.action();}
  function renderButtons(next){
    buttons=next;selected=Math.max(0,next.findIndex(b=>!b.disabled));stage.querySelectorAll('button').forEach(b=>b.remove());
    next.forEach((b,i)=>{const el=document.createElement('button');el.className='native-hit';el.setAttribute('aria-label',b.label);el.textContent=b.label;el.disabled=!!b.disabled;Object.assign(el.style,{left:b.x/2.56+'%',top:b.y/1.92+'%',width:b.w/2.56+'%',height:b.h/1.92+'%'});el.onclick=()=>activate(i);el.onfocus=()=>{selected=i;draw();};b.element=el;stage.append(el);});
    if(!busy)next[selected]?.element.focus();draw();
  }
  stage.addEventListener('keydown',e=>{if(e.target.closest('input'))return;const k=e.key.toLowerCase(),directions={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]};if(directions[k]){e.preventDefault();e.stopPropagation();selected=NativeUI.nextButton(buttons,selected,...directions[k]);buttons[selected]?.element.focus();}else if(['enter',' ','z','a'].includes(k)){e.preventDefault();activate(selected);}else if(['escape','b','x'].includes(k)){e.preventDefault();back();}});
  function run(){if(trainer&&!labBattle){notice="Non si può fuggire da una lotta contro un Allenatore!";mode='notice';update();}else $('run').onclick();}
  function update(){
    if(!battling||!ready||!session)return;
    const forced=!!session.request()?.forceSwitch?.[0];if(busy){wasBusy=true;renderButtons([]);return;}
    if(wasBusy){wasBusy=false;mode=forced?'party':'main';}
    if(finished){renderButtons(storyBattle==='tutorial'?[]:[rect('Continua',0,0,256,192,()=>endBattle())]);return;}
    if(forced)mode='party';
    if(mode==='main')renderButtons([rect('LOTTA',0,60,256,64,()=>choose('moves')),rect('BORSA',0,142,84,50,()=>choose('bag')),rect('FUGA',86,154,84,38,run),rect('POKÉMON',172,142,84,50,()=>choose('party'))]);
    else if(mode==='moves'){
      const list=[...$('moves').querySelectorAll(':scope > button')];renderButtons([...list.map((b,i)=>rect(b.textContent,4+i%2*128,24+Math.floor(i/2)*64,120,58,()=>b.onclick(),b.disabled)),rect('Indietro',188,164,64,28,back)]);
    }else if(mode==='bag')renderButtons([rect('Rimedi',4,30,120,58,()=>choose('medicine')),rect('Poké Ball',132,30,120,58,()=>choose('balls')),rect('Indietro',188,164,64,28,back)]);
    else if(mode==='medicine')renderButtons([rect('Pozione ×'+potions,4,40,248,48,()=>{if(potions>0)choose('itemTarget');},!potions),rect('Indietro',188,164,64,28,()=>choose('bag'))]);
    else if(mode==='balls')renderButtons([rect('Poké Ball ×'+(Journey.state.pokeballs||0),4,40,248,48,()=>{
      if(trainer){notice='Non si possono catturare i Pokémon degli altri Allenatori!';mode='notice';update();return;}$('catchBall').onclick();
    },!Journey.state.pokeballs||storyBattle==='tutorial'),rect('Indietro',188,164,64,28,()=>choose('bag'))]);
    else if(mode==='party'||mode==='itemTarget'){
      const item=mode==='itemTarget';renderButtons([...session.party().map((p,i)=>rect(p.name,4+i%2*128,12+Math.floor(i/2)*48,120,43,()=>{
        if(item){session.potionTarget=p.index;turn(null,'potion');}else turn('switch '+p.index);
      },p.hp<=0||(item?p.hp===p.max:p.active))),...(!forced?[rect('Indietro',188,164,64,28,()=>choose(item?'medicine':'main'))]:[])]);
    }else if(mode==='notice')renderButtons([rect('Continua',0,0,256,192,()=>choose('main'))]);
  }
  function draw(){
    if(!ready)return;c.clearRect(0,0,256,192);c.drawImage(resources['command-view-105.png'],0,0);
    if(finished){text('A: Continua',128,138,false,'center');return;}
    if(busy)return;
    if(mode==='main'){
      const source=resources['command-source-105.png'];
      [[0,142,'BORSA'],[86,154,'FUGA'],[172,142,'POKÉMON']].forEach(([x,y,label],i)=>{c.drawImage(source,i===0?256:384,224,128,56,x,y,84,56);text(label,x+42,y+22,true,'center');});
      const own=session.party(),foes=session.battle.p2.pokemon;
      const mark=(pokemon,x,y)=>{c.drawImage(resources[pokemon.hp>0?'cell-115-117-0.png':'cell-115-117-2.png'],x,y);};
      own.forEach((p,i)=>mark(p,84+i*15,126));if(trainer)foes.forEach((p,i)=>mark(p,84+i*15,36));
    }else{
      c.fillStyle='#e6e7ed';c.fillRect(0,0,256,192);
      if(mode==='notice'){notice.match(/.{1,30}(?:\s|$)|.{1,30}/g)?.forEach((line,i)=>text(line.trim(),8,64+i*18));text('A: Continua',128,160,false,'center');return;}
      if(mode==='moves'){
        const list=[...$('moves').querySelectorAll(':scope > button')];list.forEach((b,i)=>{const x=4+i%2*128,y=24+Math.floor(i/2)*64,move=partner.moves[i];c.fillStyle='#fafafa';c.fillRect(x,y,120,58);c.strokeStyle='#404f58';c.strokeRect(x,y,120,58);text(move?.name||b.textContent,x+60,y+7,false,'center');if(move){text(move.type,x+8,y+30);text('PP '+move.left+'/'+move.pp,x+114,y+30,false,'right');}});
      }else if(mode==='party'||mode==='itemTarget'){
        session.party().forEach((p,i)=>{const x=4+i%2*128,y=12+Math.floor(i/2)*48;c.fillStyle='#d5e8ee';c.fillRect(x,y,120,43);text(p.name,x+5,y+3);text(p.hp+'/'+p.max,x+115,y+23,false,'right');});
      }else buttons.filter(b=>b.label!=='Indietro').forEach(b=>{c.fillStyle='#fafafa';c.fillRect(b.x,b.y,b.w,b.h);text(b.label,b.x+b.w/2,b.y+16,false,'center');});
      if(buttons.some(b=>b.label==='Indietro'))text('Indietro',220,171,false,'center');
    }
    const b=buttons[selected];if(b&&!b.disabled){c.strokeStyle='#efb040';c.lineWidth=2;c.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2);}
  }
  function cards(){
    if(!ready)return;
    for(const [id,p,own] of [['enemyCard',enemy,false],['playerCard',partner,true]]){
      const box=$(id);let card=box.querySelector('canvas');if(!card){card=document.createElement('canvas');card.width=128;card.height=own?54:40;box.replaceChildren(card);}const ctx=card.getContext('2d');ctx.clearRect(0,0,128,54);ctx.imageSmoothingEnabled=false;ctx.drawImage(resources[own?'cell-168-169-0.png':'cell-165-166-0.png'],0,15);
      const put=(s,x,y,align='left')=>NativeText.draw(ctx,font,String(s),x,y,false,align);
      put(p.nickname||p.name,8,1);put(p.gender==='F'?'♀':p.gender==='M'?'♂':'',72,1);put(p.level,117,13,'right');const fraction=p.hp/p.max;ctx.fillStyle='#29463e';ctx.fillRect(53,23,50,3);ctx.fillStyle=fraction<=.2?'#d85038':fraction<=.5?'#e8b038':'#58b888';ctx.fillRect(53,23,Math.ceil(50*fraction),3);
      if(p.status)put(STATUS_NAMES[p.status]||p.status,8,33);
      if(own){put(p.hp+'/'+p.max,119,33,'right');const record=Journey.state.party[session.active().storyId],growth=OPENING_DATA[p.name]?.growth,ratio=record&&growth?Math.min(1,(record.xp-growth[p.level])/(growth[p.level+1]-growth[p.level]||1)):0;ctx.fillStyle='#2c343d';ctx.fillRect(36,51,84,2);ctx.fillStyle='#74a6ff';ctx.fillRect(36,51,84*ratio,2);}
      else if(Journey.state.dex.caught.includes(p.name))ctx.drawImage(resources['cell-115-117-0.png'],1,31,8,8);
      card.setAttribute('role','img');card.setAttribute('aria-label',`${p.nickname||p.name}, livello ${p.level}${own?', PS '+p.hp+' su '+p.max:''}${p.status?', '+STATUS_NAMES[p.status]:''}`);
    }
  }
  function itemTarget(s){const original=s.battle.runAction;s.battle.runAction=function(action){if(action.choice==='event'&&action.event==='DemoPotion'&&s.potionTarget){const target=this.p1.pokemon[s.potionTarget-1];s.potionTarget=null;if(target&&target.hp>0)action.pokemon=target;}return original.call(this,action);};}
  window.BattleScreen={update,cards,reset(){mode='main';wasBusy=false;},itemTarget,loading};
})();
