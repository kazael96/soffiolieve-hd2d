const {test} = require('node:test');
const assert = require('node:assert/strict');
const Input = require('../src/input.js');

test('Shift+WASD works regardless of modifier release order', () => {
  const input=Input.create();
  input.keyDown({code:'ShiftLeft',key:'Shift'});
  input.keyDown({code:'KeyW',key:'W'});
  assert.deepEqual(input.state(),{Shift:true,w:true});
  input.keyUp({code:'ShiftLeft',key:'Shift'});
  input.keyUp({code:'KeyW',key:'w'});
  assert.deepEqual(input.state(),{});
});
test('arrow, keyboard and two pointers release independently', () => {
  const input=Input.create();
  input.pointerDown(1,'ArrowRight'); input.pointerDown(2,'Shift');
  input.keyDown({code:'ArrowRight',key:'ArrowRight'});
  input.pointerUp(1);
  assert.deepEqual(input.state(),{ArrowRight:true,Shift:true});
  input.keyUp({code:'ArrowRight',key:'ArrowRight'});
  assert.deepEqual(input.state(),{Shift:true});
  input.pointerUp(2); assert.deepEqual(input.state(),{});
});
test('both Shift keys can be held and fallback key names normalize uppercase', () => {
  const input=Input.create();
  input.keyDown({code:'ShiftLeft',key:'Shift'});input.keyDown({code:'ShiftRight',key:'Shift'});
  input.keyUp({code:'ShiftLeft',key:'Shift'});assert.equal(input.state().Shift,true);
  input.keyDown({key:'D'});input.keyUp({key:'d'});assert.equal(input.state().d,undefined);
  input.reset();assert.deepEqual(input.state(),{});
});
class Surface {
  constructor(){this.events={};this.hidden=false;}
  addEventListener(name,handler){(this.events[name]??=[]).push(handler);}
  emit(name,event={}){for(const handler of this.events[name]||[])handler(event);}
}
test('real handlers release cancelled pointers, blur and hidden-page input', () => {
  const target=new Surface(),document=new Surface(),button=new Surface();
  const classes=new Set();button.classList={add:x=>classes.add(x),remove:x=>classes.delete(x)};
  button.dataset={key:'ArrowUp'};button.setPointerCapture=()=>{};
  const input=Input.attach({target,document,buttons:[button],enabled:()=>true});
  for(const event of ['pointerup','pointercancel','lostpointercapture']){
    button.emit('pointerdown',{pointerId:5,preventDefault(){}});
    assert.equal(input.state().ArrowUp,true);button.emit(event,{pointerId:5});
    assert.deepEqual(input.state(),{});assert.equal(classes.size,0);
  }
  for(const name of ['blur','visibilitychange']){
    button.emit('pointerdown',{pointerId:5,preventDefault(){}});
    if(name==='blur')target.emit(name);else {document.hidden=true;document.emit(name);}
    assert.deepEqual(input.state(),{});assert.equal(classes.size,0);
  }
});
test('dialogs, text fields and browser shortcuts do not start movement', () => {
  const target=new Surface(),document=new Surface();let enabled=false;
  const input=Input.attach({target,document,buttons:[],enabled:()=>enabled});
  const event={code:'KeyW',key:'w',preventDefault(){},target:{closest:()=>false}};
  target.emit('keydown',event);assert.deepEqual(input.state(),{});
  enabled=true;
  target.emit('keydown',{...event,ctrlKey:true});assert.deepEqual(input.state(),{});
  target.emit('keydown',{...event,target:{closest:()=>true}});assert.deepEqual(input.state(),{});
  target.emit('keydown',event);assert.equal(input.state().w,true);
});
