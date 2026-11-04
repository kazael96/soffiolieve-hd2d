/* Render the real composite/pose code on Canvas; battle/viewport QA remains separate. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),site=path.resolve(process.argv[2]),modulePath=process.argv[3],{createCanvas,loadImage}=require(modulePath),out=path.join(root,'outputs/chapter049/moves');
const c={console,Buffer,TextEncoder,TextDecoder,structuredClone,document:{createElement:()=>createCanvas(1,1)}};c.window=c;vm.createContext(c);
for(const f of ['assets/battle-data.js','battle-sim.js'])vm.runInContext(fs.readFileSync(path.join(site,f),'utf8'),c,{filename:f});
for(const f of ['training-data','mistralton-data','pokemon-visuals','training'])vm.runInContext(fs.readFileSync(path.join(root,'src',f+'.js'),'utf8'),c,{filename:f});
for(const key of ['progression','evolutions','compatibility','machines','pokemonData'])Object.assign(c.TRAINING_DATA[key],c.MISTRALTON_DATA[key]);c.TRAINING_DATA.levelCap=35;
for(const f of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','training-moves','battle-reactions','pokemon-anim'])vm.runInContext(fs.readFileSync(path.join(root,'src',f+'.js'),'utf8'),c,{filename:f});
c.RuntimeAssets={json:async p=>JSON.parse(fs.readFileSync(path.join(root,'src',p),'utf8')),image:async p=>loadImage(path.join(root,'src',p))};
const examples=[[508,424],[521,19],[529,232],[530,32],[549,483],[555,359],[564,246],[566,365],[575,473],[581,19],[582,333],[583,429],[585,26],[586,224],[588,31],[590,275],[592,466],[595,527],[597,360],[599,544],[602,451],['521-female',19],['592-female',466],[701,26],[702,26],[703,26],[704,224],[705,224],[706,224]];
(async()=>{
 for(let page=0;page<Math.ceil(examples.length/7);page++){
  const subset=examples.slice(page*7,page*7+7),canvas=createCanvas(1080,subset.length*180),ctx=canvas.getContext('2d');ctx.fillStyle='#e9eee7';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='12px sans-serif';
  for(const [row,[graphic,id]]of subset.entries())for(const [back,side]of [[false,'p2'],[true,'p1']]){
   const key=graphic+'-'+(back?'back':'front'),state=c.ROM_SPRITE_ANIM.load(key);await state.promise;if(!state.ready)throw Error(state.error);const p=c.SpeciesMoves.select(graphic,id);if(!p)throw Error('No profile '+graphic+'/'+id);
   for(const [col,f]of [0,Math.round(p.frames*.38),p.frames].entries()){
    const box=state.groundBounds,height=Math.min(95,140/((box[2]-box[0])/(box[3]-box[1]))),x=(back?3:0)*180+col*180+90,y=row*180+140,layout={p1:{x:0,y:0,height,w:1000,h:650},p2:{x:0,y:0,height,w:1000,h:650}},pose=c.SpeciesMoves.pose(p,f,side,side,false,layout),a=c.SpeciesMoves.sample(p,f,side,false),scale=height/80;
    ctx.save();ctx.translate(x+pose.x,y+pose.y);ctx.rotate(pose.rotation||0);ctx.scale(pose.scaleX||1,pose.scaleY||1);c.ROM_SPRITE_ANIM.draw(ctx,graphic,back,0,0,scale,0,true,a);ctx.restore();ctx.fillStyle='#253126';ctx.fillText(`${graphic}/${id} ${back?'B':'F'} f${f}`,x-85,y+26);
   }
  }
  fs.writeFileSync(path.join(out,`pose-proof-${page+1}.png`),canvas.toBuffer('image/png'));
 }
 console.log('Rendered 29 scoped species/gender/season examples, front/back, windup and recovery.');
})().catch(e=>{console.error(e);process.exitCode=1;});
