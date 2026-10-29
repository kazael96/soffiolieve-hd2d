/* Executes decoded IRBI field instructions. Unimplemented instructions fail closed. */
(function(root){
  const cmp=(kind,a,b)=>[a<b,a===b,a>b,a<=b,a>=b,a!==b,!!a||!!b,!!a&&!!b][kind];
  class FieldEventVM {
    constructor(data,state,host){this.data=data;this.state=state;this.host=host;this.stack=[];this.words={};this.trace=[];this.running=false;}
    value(v){return v>=0x4000&&v<0xc000?(this.state.vars[v]||0):v;}
    set(v,n){this.state.vars[v]=n;}
    async run(bank,entry,{offset=false}={}){
      if(this.running)throw Error('An original event is already running');
      const program=this.data.scripts[bank];
      if(!program||(!offset&&program.supportedEntries&&!program.supportedEntries.includes(entry)))throw Error('Event outside the extracted opening');
      this.running=true;this.bank=bank;this.pc=offset?entry:program.entries[entry];this.calls=[];this.stack=[];
      let count=0;
      try{
        while(this.pc!==null){
          if(++count>20000)throw Error('Original event exceeded instruction limit');
          const at=this.pc,c=this.data.scripts[bank].code[at];
          if(!c)throw Error(`Missing IRBI instruction ${bank}:${at}`);
          this.pc=c.end;this.trace.push([bank,at,c.op]);if(this.trace.length>3000)this.trace.shift();
          const a=c.args,v=a.map(x=>this.value(x));
          switch(c.name){
            case 'VMNop':case 'VMNop2':break;
            case 'RTEndGlobal':case 'VMHalt':this.pc=null;break;
            case 'VMReturn':this.pc=this.calls.length?this.calls.pop():null;break;
            case 'VMCall':this.calls.push(this.pc);this.pc=a[0];break;
            case 'VMJump':this.pc=a[0];break;
            case 'VMJumpIf':if(a[0]===255?!this.stack.pop():cmp(a[0],...this.comparison))this.pc=a[1];break;
            case 'StackPush':this.stack.push(v[0]);break;
            case 'StackPushConst':this.stack.push(a[0]);break;
            case 'StackPushFlag':this.stack.push(this.state.flags.includes(v[0])?1:0);break;
            case 'StackPop':this.set(a[0],this.stack.pop());break;
            case 'StackCmp':{const b=this.stack.pop(),x=this.stack.pop();this.stack.push(cmp(a[0],x,b)?1:0);break;}
            case 'WorkGet':case 'WorkSet':this.set(a[0],v[1]);break;
            case 'WorkSetConst':this.set(a[0],a[1]);break;
            case 'WorkAdd':this.set(a[0],v[0]+v[1]);break;
            case 'WorkSub':this.set(a[0],v[0]-v[1]);break;
            case 'WorkCmpConst':this.comparison=[v[0],v[1]];break;
            case 'FlagSet':if(!this.state.flags.includes(v[0]))this.state.flags.push(v[0]);break;
            case 'FlagReset':this.state.flags=this.state.flags.filter(f=>f!==v[0]);break;
            case 'WordSetPlayerName':this.words[a[0]]=this.host.playerName();break;
            case 'WordSetPokeSpecies':this.words[a[0]]=this.host.speciesName(v[1]);break;
            case 'WordSetNumber':this.words[a[0]]=String(v[1]);break;
            case 'WordSetPartyPokeName':this.words[a[0]]=this.host.party(v[1]).nickname||this.host.party(v[1]).name;break;
            case 'WordSetPartyPokeSpecies':this.words[a[0]]=this.host.party(v[1]).name;break;
            default:if(await this.host.command(c,a,v,this)!==true)throw Error(`Unsupported IRBI instruction ${bank}:${at} ${c.name} (${c.op})`);
          }
        }
      }finally{this.running=false;}
    }
  }
  function messagePages(text,words){
    return text.replace(/\{(?:0100|0101|0102|0103|0107|0109|010c|0112|0200|0201|0202|0204|0206):([0-9]+)\}/g,(_,i)=>words[i]??'')
      .replace(/\{(?:ff00|bd02)(?::[^}]*)?\}/g,'').replace(/\\n/g,'\n')
      .split(/\{be0[01]\}/).map(p=>p.replace(/^\n+|\n+$/g,'')).filter(Boolean);
  }
  const api={FieldEventVM,messagePages,cmp};Object.assign(root,api);if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
