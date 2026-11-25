'use strict';
const assert=require('node:assert/strict'),entries=[];
function register(name,fn){assert.equal(typeof name,'string');assert.equal(typeof fn,'function');assert(!entries.some(x=>x.name===name),'duplicate registration '+name);entries.push({name,fn});}
module.exports={register,entries};
