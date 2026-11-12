/* Private component fixture. Never rewrites the release or grants story victories. */
const fs=require('node:fs'),path=require('node:path');
const metadata=['finale-scenes','finale-parts','finale-events','finale-data','finale-sprites','finale-selector-sprites','finale-actor-motion','finale-field-models','finale-initial-state','finale-migration','finale-progression','native-return-location-data','native-return-location','finale-elite-four-animation','finale-camera-data','finale-elite-controls','finale-elite-sound','finale-elite-ambient','finale-elite-task','finale-elite-renderer'];
function inject(input,site){
 let html=require('./gym-preview052.cjs').inject(input,site,{fields:true});
 for(const name of [...metadata,'finale-audio','finale-moves'])if(!fs.existsSync(path.join(site,name+'.js')))throw Error('Missing finale053 component: '+name);
 const bootstrap=/<script src="opelucid-bootstrap\.js(?:\?[^\"]*)?"><\/script>/,audio=/<script src="league-audio\.js(?:\?[^\"]*)?"><\/script>/,motion=/<script src="training-moves\.js(?:\?[^\"]*)?"><\/script>/;
 if(!bootstrap.test(html)||!audio.test(html)||!motion.test(html))throw Error('Finale053 preview requires previous native chapter bootstrap, audio and choreography registration');
 if(/<script src="finale-scenes\.js/.test(html))throw Error('Finale053 components already installed');
 const tags=metadata.map(name=>'<script src="'+name+'.js"></script>').join('');
 html=html.replace(bootstrap,match=>tags+'<script>window.QA053Preview={scope:"Unreleased first-ending field components; explicit Castle-open prerequisites; no whole-story certification"};</script>'+match);
 const battles=/<script src="league-battles\.js(?:\?[^\"]*)?"><\/script>/;
 if(!battles.test(html)||!fs.existsSync(path.join(site,'finale-battles.js')))throw Error('Finale053 native battle scenery unavailable');
 return html.replace(battles,match=>match+'<script src="finale-battles.js"></script>').replace(audio,match=>match+'<script src="finale-audio.js"></script><script src="finale-battle-music.js"></script><script src="finale-cinematics.js"></script>').replace(motion,match=>'<script src="finale-moves.js"></script>'+match);
}
module.exports={inject,metadata};
