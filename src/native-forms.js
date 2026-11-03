/* Preserve the native blue Basculin form through the simulator's base-species facade. */
(()=>{
 const G=GEN5,Base=G.Session,blue=m=>String(m.name).toLowerCase().replace(/[^a-z0-9]/g,'')==='basculinbluestriped';
 const seasonal=m=>[585,586].includes(window.PokemonVisuals?.speciesId(m));
 const config=m=>seasonal(m)?{...m,name:PokemonVisuals.speciesId(m)===585?'Deerling':'Sawsbuck',speciesId:PokemonVisuals.speciesId(m)}:blue(m)?{...m,name:'Basculin',speciesId:550,abilityId:m.abilityId||69}:m;
 class FormSession extends Base{
  constructor(p1,p2,options={}){
   const original={p1,p2,p3:options.ally,p4:options.secondFoe};
   super(p1.map(config),p2.map(config),{...options,...(options.ally?{ally:options.ally.map(config),secondFoe:options.secondFoe.map(config)}:{})});
   for(const [side,team]of Object.entries(original))for(const [i,data]of (team||[]).entries())if(seasonal(data)){const mon=this.battle[side].pokemon[i];mon.nativeForm=PokemonVisuals.form(data);mon.set.form=mon.nativeForm;}
   for(const [side,team]of Object.entries(original))for(const [i,data]of (team||[]).entries())if(blue(data)){
    const mon=this.battle[side].pokemon[i],ability=mon.ability;mon.formeChange('Basculin-Blue-Striped',null,true);mon.setAbility(ability,mon,{id:'nativeform',effectType:'Condition'},true);mon.baseAbility=ability;mon.name=data.nickname||'Basculin';
   }
  }
  snapshot(side='p1',slot=0){const view=super.snapshot(side,slot),mon=this.active(side,slot);if(mon?.nativeForm!==undefined)view.form=mon.nativeForm;if(mon?.gender)view.gender=mon.gender;return view;}
 }
 G.Session=FormSession;
})();
