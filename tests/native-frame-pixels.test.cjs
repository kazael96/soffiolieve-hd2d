const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'browser-qa.js'),'utf8');
function fixture(){const start=source.indexOf(' function colorCheck('),end=source.indexOf(' function shot(',start),c={check:(ok,message)=>{if(!ok)throw Error(message);}};assert.ok(start>=0&&end>start);vm.runInNewContext(source.slice(start,end)+';this.inspect=nativeFrameCheck;',c);return c.inspect;}
function frame(colors){return Uint8ClampedArray.from(Array.from({length:512},(_,i)=>[...colors[i%colors.length],255]).flat());}
test('original monochrome move frames remain valid only with explicit native background controls',()=>{
 const inspect=fixture(),gray=frame([[0,0,0],[64,64,64],[240,240,240]]);
 assert.throws(()=>inspect(gray,{}),/coloured detail/);
 for(const background of [{visible:true,id:123},{worldTint:.8},{hideGround:true,hideSky:true}])assert.equal(inspect(gray,{background}).nativeMonochrome,true);
});
test('native monochrome allowance still rejects empty, transparent and uniform missing-resource frames',()=>{
 const inspect=fixture(),native={background:{visible:true,id:123}};
 for(const pixels of [new Uint8ClampedArray(2048),frame([[0,0,0]]),frame([[255,255,255]]),frame([[32,32,32],[33,33,33]])])assert.throws(()=>inspect(pixels,native));
 const colored=frame([[0,100,0],[0,140,0],[0,220,0]]);assert.ok(inspect(colored,{}).color>50);
});
