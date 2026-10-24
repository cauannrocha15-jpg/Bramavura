'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function main(){
  const checkOnly=process.argv.includes('--check-only');
  const rootArg=process.argv.indexOf('--root');
  const root=path.resolve(rootArg>=0?process.argv[rootArg+1]:process.cwd());
  const ready=JSON.parse(await fs.readFile(path.join(__dirname,'import-ready.json'),'utf8'));
  const packed=Buffer.from(await fs.readFile(path.join(__dirname,'sources.json.gz.b64'),'utf8'),'base64');
  if(digest(packed)!==ready.sourcePackSha256)throw new Error('Source pack hash mismatch');
  const sources=JSON.parse(zlib.gunzipSync(packed,{maxOutputLength:67108864})).files;
  if(!Array.isArray(sources)||sources.length!==ready.sourceFiles)throw new Error('Source file count mismatch');
  function safePath(relative){
    if(typeof relative!=='string'||!relative||/[\\:\0]/.test(relative)||path.posix.normalize(relative)!==relative||relative.startsWith('/')||relative.split('/').some(p=>p==='..'||p==='.git'||p==='.github'||p==='.capture')||relative==='data/local-state.json')throw new Error('Unsafe target path');
    const target=path.resolve(root,relative);
    if(!target.startsWith(root+path.sep))throw new Error('Path leaves root');
    return target;
  }
  function verify(bytes,record){if(bytes.length!==record.bytes||digest(bytes)!==record.sha256)throw new Error('Captured bytes differ: '+record.path);}
  const seen=new Set(),sourceByPath=new Map();
  let manifest;
  for(const record of sources){
    safePath(record.path);
    if(seen.has(record.path))throw new Error('Duplicate source path');
    seen.add(record.path);
    sourceByPath.set(record.path,record);
    const bytes=Buffer.from(record.base64,'base64');verify(bytes,record);
    if(record.path==='capture-integrity.json')manifest=JSON.parse(bytes);
  }
  if(!manifest||manifest.main!==ready.baseline||manifest.files.length!==ready.capturedFiles||manifest.files.reduce((sum,f)=>sum+f.bytes,0)!==ready.capturedBytes)throw new Error('Capture manifest mismatch');
  const capturedPaths=new Set();
  for(const record of manifest.files){
    const relative='public/'+record.path;safePath(relative);
    if(capturedPaths.has(relative))throw new Error('Duplicate captured path');
    capturedPaths.add(relative);
    const url=new URL(record.sourceUrl);
    if(url.protocol!=='https:'||url.hostname!=='huntera.com.br'||url.port||url.username||url.password||url.hash)throw new Error('Unexpected source host');
    if(seen.has(relative)){
      const embedded=sourceByPath.get(relative);
      if(!embedded||embedded.sha256!==record.sha256||embedded.bytes!==record.bytes)throw new Error('Conflicting embedded capture: '+relative);
    }
    seen.add(relative);
  }
  async function existing(relative,record){
    const target=safePath(relative);
    let current=root;
    for(const part of relative.split('/')){
      current=path.join(current,part);
      try{if((await fs.lstat(current)).isSymbolicLink())throw new Error('Symlink target refused');}catch(error){if(error.code!=='ENOENT')throw error;break;}
    }
    try{const bytes=await fs.readFile(target);verify(bytes,record);return true;}catch(error){if(error.code!=='ENOENT')throw error;return false;}
  }
  async function write(relative,bytes,record){
    verify(bytes,record);
    if(await existing(relative,record))return;
    if(checkOnly)throw new Error('Missing local file: '+relative);
    const target=safePath(relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes,{flag:'wx'});
  }
  for(const record of sources)await write(record.path,Buffer.from(record.base64,'base64'),record);
  let completed=0,next=0;
  async function worker(){while(next<manifest.files.length){
    const record=manifest.files[next++],relative='public/'+record.path;
    if(!await existing(relative,record)){
      if(checkOnly)throw new Error('Missing local capture: '+relative);
      let bytes;
      for(let attempt=0;attempt<3;attempt++){
        try{
          const response=await fetch(record.sourceUrl,{redirect:'error',signal:AbortSignal.timeout(30000)});
          if(!response.ok)throw new Error('HTTP '+response.status);
          const chunks=[];let length=0;
          for await(const chunk of response.body){
            length+=chunk.length;
            if(length>record.bytes)throw new Error('Response exceeds captured size');
            chunks.push(chunk);
          }
          bytes=Buffer.concat(chunks,length);verify(bytes,record);break;
        }catch(error){if(attempt===2)throw new Error(record.path+': '+error.message);}
      }
      await write(relative,bytes,record);
    }
    completed++;
    if(completed%250===0)console.log('Verified captures: '+completed+'/'+manifest.files.length);
  }}
  await Promise.all(Array.from({length:6},worker));
  console.log(JSON.stringify({ok:true,checkOnly,sourceFiles:sources.length,capturedFiles:completed,capturedBytes:ready.capturedBytes,baseline:ready.baseline}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
