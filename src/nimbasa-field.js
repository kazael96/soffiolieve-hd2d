/* Native map terrain and Gen V field weather; sand projection is adapted HD-2D. */
(()=>{
 const sandTiles=Object.freeze([11]);
 function context(zone,position,tile){if(zone===62)return {id:'nimbasaTown',label:'Sciroccopoli',terrain:'town'};if(zone!==326)return null;return {id:position.x<400-784?'route4Coast':tile==='sand'?'route4Sand':'route4Road',label:'Percorso 4',terrain:tile==='sand'?'sand':'path',weather:'sandstorm'};}
 function configure(session,location,custom){if(location?.weather==='sandstorm'&&!custom?.weather&&session.battle.field.weather==='sandstorm')session.battle.field.weatherState.duration=0;}
 function sand(c,w,h,time){c.save();c.globalAlpha=.13;c.fillStyle='#dcc58b';c.fillRect(0,0,w,h);c.globalAlpha=.42;c.strokeStyle='#e7d49d';c.lineWidth=Math.max(1,w/1000);for(let i=0;i<45;i++){const x=((i*167.3-time*170)%(w+40)+w+40)%(w+40)-20,y=(i*83.7+time*33)%(h+30)-15;c.beginPath();c.moveTo(x,y);c.lineTo(x+7+(i%4)*3,y-2);c.stroke();}c.restore();}
 const music=zone=>zone===326?[1042,1043,1044,1045][new Date().getMonth()%4]:zone===62?1029:null;
 window.NIMBASA_FIELD={sandTiles,context,configure,sand,music};
})();
