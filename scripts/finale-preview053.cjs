/* Private component fixture. Never rewrites the release or grants story victories. */
const fs=require('node:fs'),path=require('node:path');
const metadata=['finale-scenes','finale-map-variants-data','finale-map-variants','finale-parts','finale-events','finale-data','finale-sprites','finale-selector-sprites','finale-actor-motion','finale-completion-data','finale-completion','finale-end','finale-save','finale-legend-party','finale-closeup-motion','finale-closeup','finale-ball-release','finale-credits-motion','finale-credits','field-music-resume','native-object-emotes-data','native-object-emotes','native-field-projection','finale-stone','finale-field-models','finale-initial-state','finale-migration','finale-progression','native-return-location-data','native-return-location','finale-elite-four-animation','finale-camera-data','finale-elite-controls','finale-elite-sound','finale-elite-ambient','finale-elite-task','finale-elite-renderer'];
function inject(input,site){
 let html=require('./gym-preview052.cjs').inject(input,site,{fields:true});
 for(const name of [...metadata,'finale-audio','finale-moves'])if(!fs.existsSync(path.join(site,name+'.js')))throw Error('Missing finale053 component: '+name);
 const bootstrap=/<script src="opelucid-bootstrap\.js(?:\?[^\"]*)?"><\/script>/,audio=/<script src="league-audio\.js(?:\?[^\"]*)?"><\/script>/,motion=/<script src="training-moves\.js(?:\?[^\"]*)?"><\/script>/;
 if(!bootstrap.test(html)||!audio.test(html)||!motion.test(html))throw Error('Finale053 preview requires previous native chapter bootstrap, audio and choreography registration');
 if(html.includes('window.QA053Preview='))throw Error('Finale053 components already installed');
 const installed=[...metadata,'finale-audio','finale-moves','finale-battles','finale-battle-music','finale-cinematics'].map(name=>new RegExp('<script src="'+name+'\\.js(?:\\?[^\"]*)?"><\\/script>').test(html));
 if(installed.some(Boolean)){if(!installed.every(Boolean))throw Error('Incomplete installed053 startup inventory');return html.replace(bootstrap,match=>'<script>window.QA053Preview={scope:"Released first-ending components; isolated prepared prerequisites, no whole-story certification"};</script>'+match);}
 const tags=metadata.map(name=>'<script src="'+name+'.js"></script>').join('');
 html=html.replace(bootstrap,match=>tags+'<script>window.QA053Preview={scope:"Unreleased first-ending field components; explicit Castle-open prerequisites; no whole-story certification"};</script>'+match);
 const battles=/<script src="league-battles\.js(?:\?[^\"]*)?"><\/script>/;
 if(!battles.test(html)||!fs.existsSync(path.join(site,'finale-battles.js')))throw Error('Finale053 native battle scenery unavailable');
 return html.replace(battles,match=>match+'<script src="finale-battles.js"></script>').replace(audio,match=>match+'<script src="finale-audio.js"></script><script src="finale-battle-music.js"></script><script src="finale-cinematics.js"></script>').replace(motion,match=>'<script src="finale-moves.js"></script>'+match);
}
module.exports={inject,metadata};
