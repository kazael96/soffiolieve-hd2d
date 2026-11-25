'use strict';
const fs=require('node:fs'),path=require('node:path');
const repo=path.resolve(process.env.SOFFIOLIEVE_TEST_REPO||path.join(__dirname,'../..'));
const sourceRoot=path.resolve(process.env.SOFFIOLIEVE_TEST_SOURCE||path.join(repo,'src'));
const site=path.resolve(process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site'));
const fixtures=path.resolve(__dirname,'../fixtures/minccino-slap-reference064');
function sourcePath(file){const p=path.join(sourceRoot,file);return fs.existsSync(p)?p:path.join(repo,'src',file);}
const fixturePath=file=>path.join(fixtures,file),read=file=>fs.readFileSync(file.startsWith('assets/')?path.join(site,file):sourcePath(file),'utf8').replace(/\r\n/g,'\n');
const readSourceBytes=file=>Buffer.from(read(file),'utf8'),readFixtureBytes=file=>Buffer.from(fs.readFileSync(fixturePath(file),'utf8').replace(/\r\n/g,'\n'),'utf8');
module.exports={repo,sourceRoot,sourcePath,site,fixtures,fixturePath,read,readSourceBytes,readFixtureBytes};
