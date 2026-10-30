/* Gen V doubles and four-trainer partner battles use the same ROM-backed simulator. */
(function(root){
 function install(G){
  const Single=G.Session,format=G.dex.formats.get('soffiolievenero');
  G.dex.formats.extend([{...format,id:'soffiolievedoubles',name:'Soffiolieve Doubles',gameType:'doubles'},
   {...format,id:'soffiolievemulti',name:'Soffiolieve Multi',gameType:'multi',playerCount:4}]);
  class Session extends Single{
   constructor(p1,p2,options={}){
    super(p1,p2,options);this.focus={p1:0,p2:0};this.selectionSlot=0;this.queued=[];
    if(!options.doubles&&!options.ally)return;
    this.double=true;this.multi=!!options.ally;
    const previous=this.battle,Battle=previous.constructor;
    this.battle=new Battle({formatid:this.multi?'soffiolievemulti':'soffiolievedoubles',seed:options.seed,strictChoices:true},G.dex);
    const run=previous.runAction,session=this;
    this.battle.runAction=function(action){if(action.choice==='event'&&action.event==='DoubleItem'){if(root.BattleMedicine.apply(this,action.item,this.p1.pokemon[action.target-1]))session.onItemUsed?.(action.item);return;}return run.call(this,action);};
    if(this.multi){const win=this.battle.win;this.battle.win=function(side){if(side==='p3'||side?.id==='p3')side=this.p1;if(side==='p4'||side?.id==='p4')side=this.p2;return win.call(this,side);};}
    const teams={p1,p2};if(this.multi){teams.p3=options.ally;teams.p4=options.secondFoe;}
    for(const [side,team]of Object.entries(teams)){
     if(!Array.isArray(team)||!team.length)throw Error('Squadra mancante nella lotta in doppio: '+side);
     this.battle.setPlayer(side,{name:side==='p1'?'Alcide':side==='p3'?'Komor':options.enemyName||'Allenatori',team:team.map(G.set)});
    }
    for(const [side,team]of Object.entries(teams))for(let i=0;i<team.length;i++){
     const mon=this.battle[side].pokemon[i],data=team[i];
     if(data.hp!==undefined)mon.sethp(Math.max(1,Math.min(mon.maxhp,data.hp)));
     if(data.status)mon.setStatus(data.status,mon,null,true);
     for(const slot of mon.moveSlots){const move=G.byMoveKey[slot.id];slot.maxpp=Math.floor(move.pp*(5+(data.ppUps||0))/5);slot.pp=Math.min(slot.maxpp,data.pp?.find(m=>m.key===slot.id)?.left??slot.maxpp);}
     mon.baseMoveSlots=mon.moveSlots.map(m=>({...m}));
    }
    this.cursor=0;
   }
   actualSide(side,slot=this.focus?.[side]||0){return this.multi&&slot===1?(side==='p1'?'p3':side==='p2'?'p4':side):side;}
   active(side='p1',slot=this.focus?.[side]||0){const actual=this.actualSide(side,slot);return this.battle[actual].active[this.multi?0:slot]||this.battle[actual].active[0];}
   request(){const r=this.battle.p1.activeRequest;if(!this.double||this.multi||!r)return r;return {...r,...(r.active?{active:[r.active[this.selectionSlot]]}:{}),...(r.forceSwitch?{forceSwitch:[r.forceSwitch[this.selectionSlot]]}:{})};}
   targetChoices(side,slot,move){
    const actor=this.active(side,slot),foes=[...actor.foes(),...(['normal','any'].includes(move.target)?actor.allies():[])].filter(p=>p.hp>0&&!p.fainted);
    if(['normal','adjacentFoe','any'].includes(move.target))return foes.filter(p=>this.battle.validTargetLoc(actor.getLocOf(p),actor,move.target)).map(p=>({loc:actor.getLocOf(p),mon:p}));
    if(['adjacentAlly','adjacentAllyOrSelf'].includes(move.target))return actor.alliesAndSelf().filter(p=>p.hp>0&&this.battle.validTargetLoc(actor.getLocOf(p),actor,move.target)).map(p=>({loc:actor.getLocOf(p),mon:p}));
    return [];
   }
   aiChoice(side,slot=0){
    const s=this.battle[side],r=s.activeRequest,p=s.active[slot];if(!p||p.fainted)return 'pass';
    const moves=(r?.active?.[slot]?.moves||[]).map((m,i)=>({m,i})).filter(x=>!x.m.disabled&&x.m.pp>0);
    const choice=moves[this.battle.random(Math.max(1,moves.length))],index=choice?choice.i+1:1;
    const move=this.battle.dex.moves.get(choice?.m.id||'struggle'),targets=this.targetChoices(side,slot,move).filter(t=>!['normal','adjacentFoe','any'].includes(move.target)||t.loc>0),target=targets.length?targets[this.battle.random(targets.length)].loc:0;
    return 'move '+index+(target?' '+target:'');
   }
   ai(side='p2'){
    if(!this.double)return super.ai(side);
    const s=this.battle[side],r=s?.activeRequest;if(!r||r.wait)return;
    let choices;
    if(r.forceSwitch){const used=new Set();choices=r.forceSwitch.map(force=>{if(!force)return 'pass';const i=s.pokemon.findIndex((p,i)=>!p.isActive&&!p.fainted&&!used.has(i));if(i<0)return 'pass';used.add(i);return 'switch '+(i+1);});}
    else choices=s.active.map((p,i)=>this.aiChoice(side,i));
    this.battle.choose(side,choices.join(', '));
   }
   act(choice,options={}){
    if(!this.double)return super.act(choice,options);
    if(this.battle.ended)return;const turn=this.battle.turn;
    if(['potion','fleeAttempt'].includes(choice)){
     const side=this.battle.p1;side.clearChoice();
     for(let slot=0;slot<side.active.length;slot++){
      if(slot===this.selectionSlot)side.choice.actions.push({choice:'event',event:choice==='potion'?'DemoPotion':'DemoFlee',pokemon:side.active[slot]||side.active[0],priority:6});
      else side.choice.actions.push({choice:'pass'});
     }
     side.choice.cantUndo=true;
    }else if(choice.split(',').some(c=>c.trim().startsWith('item '))){
     const side=this.battle.p1;side.clearChoice();
     for(const entry of choice.split(',').map(c=>c.trim())){const [kind,n,target]=entry.split(' '),slot=side.choice.actions.length;
      if(kind==='item')side.choice.actions.push({choice:'event',event:'DoubleItem',pokemon:side.active[slot],item:+n,target:+target,priority:6});
      else if(kind==='move')side.chooseMove(n,+target||0);
      else if(kind==='switch')side.chooseSwitch(n);
      else side.choice.actions.push({choice:'pass'});
     }side.choice.cantUndo=true;
    }else if(!this.battle.p1.activeRequest?.wait)this.battle.choose('p1',choice);
    for(let rounds=0;rounds<12&&!this.battle.ended;rounds++){
     const pending=['p2',...(this.multi?['p3','p4']:[])].filter(side=>{const r=this.battle[side]?.activeRequest;return r&&!r.wait&&!this.battle[side].isChoiceDone();});
     if(!pending.length)break;for(const side of pending)this.ai(side);
    }
    return {turn,nextTurn:this.battle.turn,ended:this.battle.ended,winner:this.battle.winner};
   }
  }
  G.Session=Session;return Session;
 }
 root.DoubleRules={install};if(root.GEN5)install(root.GEN5);if(typeof module!=='undefined')module.exports={install};
})(typeof window!=='undefined'?window:globalThis);
