/* Pixel-based text layout shared by the original bitmap-font screens. */
(function(root){
  function width(text,font){return [...String(text)].reduce((n,c)=>n+(font.glyphs[c]||font.glyphs['?'])[3],0);}
  function wrap(text,font,maxWidth){
    const lines=[];
    for(const paragraph of String(text).replaceAll('\\n','\n').split('\n')){
      let line='';
      for(const word of paragraph.split(/\s+/).filter(Boolean)){
        line=line.trimEnd();
        if(line&&width(line+' '+word,font)>maxWidth){lines.push(line);line='';}
        else if(line)line+=' ';
        for(const character of word){if(line&&width(line+character,font)>maxWidth){lines.push(line);line='';}line+=character;}
      }
      lines.push(line.trimEnd());
    }
    return lines;
  }
  function format(text,words=[]){return String(text).replace(/\{(?:be[0-9a-f]+|ff00)(?::[^}]*)?\}/gi,'').replace(/\{[0-9a-f]{4}:(\d+)\}/gi,(_,n)=>words[+n]??'').replaceAll('\\n','\n');}
  function resource(path){if(/[?&]v=/.test(path))return path;const revision=typeof document!=='undefined'?document.documentElement?.dataset?.build:null;return path+(path.includes('?')?'&':'?')+'v='+encodeURIComponent(revision||'0.28-dev');}
  const api={width,wrap,format,resource};root.NativeTextLayout=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
