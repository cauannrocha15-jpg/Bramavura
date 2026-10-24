'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'capture-integrity.json'),'utf8'));
const failures=[];
for(const entry of manifest.files){
  try{
    const file=fs.readFileSync(path.join(__dirname,'public',entry.path));
    if(file.length!==entry.bytes||crypto.createHash('sha256').update(file).digest('hex')!==entry.sha256)failures.push(entry.path);
  }catch{failures.push(entry.path);}
}
console.log(JSON.stringify({ok:failures.length===0,files:manifest.files.length,failures},null,2));
if(failures.length)process.exitCode=1;
