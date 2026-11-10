/* Physical combat places are enabled explicitly, independently of the foe. */
(function(root){
 function context(zone){return zone===121?{id:'draydenGym',label:'Palestra di Aristide',terrain:'interior'}:null;}
 root.LEAGUE_FIELD={context,music:zone=>root.LEAGUE_EVENTS?.zones?.[zone]?.music??null};
})(typeof window==='undefined'?globalThis:window);
