/* Explicit isolated component preview. Never changes the release or unlocks Route10. */
const fs=require('node:fs'),path=require('node:path');
function inject(html,site,{fields=false}={}){
 const app=/<script src="app\.js(?:\?[^"]*)?">\s*<\/script>/;
 if(app.test(html)){
  const files=JSON.parse(fs.readFileSync(path.join(site,'build.json'),'utf8')).startup?.scripts;
  if(!Array.isArray(files)||!files.length||files.some(f=>typeof f!=='string'||!/^(?:assets\/)?[a-zA-Z0-9-]+\.js$/.test(f)||!fs.existsSync(path.join(site,f))))throw Error('Invalid preview startup source inventory');
  // A component fixture uses the exact retained source scripts in their build
  // order. It cannot certify startup transport performance of app.js.
  html=html.replace(app,files.map(f=>'<script src="'+f+'"></script>').join(''));
 }
 const metadata=['league-scenes','league-parts','league-events','league-data','league-sprites','league-rails','league-gym-data','league-field-models','league-camera-data','league-slide-data','league-slide-effects-data','league-battle-data'];
 const controllers=['league-geography','league-surfaces','league-seasons','league-graphics','league-camera','league-gates','league-slide-effects','league-slide','league-gym-task','league-gym-jump','league-gym-save','league-gym-renderer','league-gym-rail','league-gym','league-gym-install','trainer-intro-music-data','trainer-intro-music'];
 for(const file of [...metadata,...controllers,'league-audio','league-moves','league-badge-assets','league-field','league-battles','league-menu'])if(!fs.existsSync(path.join(site,file+'.js')))throw Error('Missing Gym052 preview component: '+file);
 const marker=/<script src="opelucid-bootstrap\.js(?:\?[^"]*)?"><\/script>/;
 if(!marker.test(html))throw Error('Gym052 preview requires the shared chapter bootstrap');
 const tags=list=>list.map(name=>'<script src="'+name+'.js"></script>').join('');
 const scope=fields?'<script>window.QA052Preview={scope:"052 native field components; explicit prepared prerequisites; no complete story certification"};</script>':'<script>window.QA052Preview={scope:"Gym121 geometry/controllers only; explicit prepared prerequisites; no story completion"};LEAGUE_SCENES={121:LEAGUE_SCENES[121]};LEAGUE_PARTS={residentLimit:3,families:{drayden:LEAGUE_PARTS.families.drayden},zoneFamily:{121:"drayden"}};LEAGUE_EVENTS.zones={121:LEAGUE_EVENTS.zones[121]};LEAGUE_EVENTS.scripts={242:LEAGUE_EVENTS.scripts[242]};</script>';
 const audio=/<script src="opelucid-audio\.js(?:\?[^"]*)?"><\/script>/;if(!audio.test(html))throw Error('Gym052 preview requires the native audio catalogs');
 const motion=/<script src="training-moves\.js(?:\?[^"]*)?"><\/script>/;if(!motion.test(html))throw Error('Gym052 preview requires choreography registration');
 const badge=/<script src="opelucid-badge-assets\.js(?:\?[^"]*)?"><\/script>/,battles=/<script src="opelucid-battles\.js(?:\?[^"]*)?"><\/script>/,menu=/<script src="opelucid-menu\.js(?:\?[^"]*)?"><\/script>/;if(!badge.test(html)||!battles.test(html)||!menu.test(html))throw Error('Gym052 preview requires the native receipt, menu and geographic battle catalogs');
 return html.replace(marker,match=>tags(metadata)+scope+tags(controllers)+match).replace(audio,match=>match+tags(['league-audio'])).replace(motion,match=>tags(['league-moves'])+match).replace(badge,match=>match+tags(['league-badge-assets'])).replace(battles,match=>match+tags(['league-field','league-battles'])).replace(menu,match=>match+tags(['league-menu']));
}
module.exports={inject};
