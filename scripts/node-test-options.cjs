'use strict';
const assert=require('node:assert/strict');
function isolationFlag(version=process.versions.node){
 const parsed=typeof version==='string'&&/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
 if(parsed){const [major,minor,patch]=parsed.slice(1).map(Number);if([major,minor,patch].every(Number.isSafeInteger)){if(major>=24||major===23&&minor>=6)return'--test-isolation=none';if(major===23||major===22&&minor>=8)return'--experimental-test-isolation=none';}}
 const error=Error('Unsupported Node.js version for directly owned tests: '+String(version));error.code='UNSUPPORTED_NODE_TEST_ISOLATION';throw error;
}
function assertDirectTestInvocation(argv=process.execArgv,version=process.versions.node){
 const expected=isolationFlag(version);assert(Array.isArray(argv)&&argv.every(arg=>typeof arg==='string'),'Node test argv must be strings');
 assert.equal(argv.filter(arg=>arg==='--test').length,1,'Direct Node test process must include --test exactly once');
 const isolation=argv.filter(arg=>/^--(?:experimental-)?test-isolation(?:=|$)/.test(arg));assert.equal(isolation.length,1,'Direct Node test process must have one canonical isolation flag');assert.equal(isolation[0],expected,'Direct Node test isolation flag must match the running Node version');return expected;
}
module.exports={isolationFlag,assertDirectTestInvocation};
