'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const backendModule=require('../backend.cjs');

(async()=>{
  const cleanupStack=[];
  const own=cleanup=>{let disposed=false;const dispose=async()=>{if(disposed)return;disposed=true;await cleanup();};cleanupStack.push(dispose);return dispose;};
  try{
  const captured=path.resolve(__dirname,'../public');
  const protocol=await import(pathToFileURL(path.join(captured,'chunk-JRE7IT7W.js')).href);
  let wire=fs.readFileSync(path.join(captured,'chunk-L7RK2YWL.js'),'utf8');
  wire=wire.replace(/from"\.\/(.*?)"/g,(_,name)=>'from'+JSON.stringify(pathToFileURL(path.join(captured,name)).href));
  wire=wire.replace('export{Qe as a}', 'export{Qe as a,Ye as encodeClient,Je as decodeServer}');
  const original=await import('data:text/javascript;base64,'+Buffer.from(wire).toString('base64'));
  assert.equal(Object.keys(backendModule.SERVER_CODES).length,192);
  assert.equal(Object.keys(backendModule.CLIENT_CODES).length,211);
  for(const message of [{type:'authenticate',clientVersion:'0.3.0+e0',ticket:'local-1'},{type:'ping',t:1234.5},{type:'start-hunt',huntId:'rat-hunt',tier:0}]){
    assert.deepEqual(backendModule.decodeMessage(original.encodeClient(message)),message);
  }
  for(const message of [{type:'welcome',playerId:1},{type:'pong',t:1234.5},{type:'system-message',text:'Verificação de protocolo: çã.'}]){
    assert.deepEqual(original.decodeServer(backendModule.encodeMessage(message)),[message]);
  }
  const invalidFlags=Buffer.from(original.encodeClient({type:'ping',t:1}));
  const seed=invalidFlags.readUInt32LE(0),clear=backendModule.transform(Buffer.from(invalidFlags.subarray(4)),seed);
  clear[0]=2;backendModule.transform(clear,seed).copy(invalidFlags,4);
  assert.equal(backendModule.decodeMessage(invalidFlags),null,'Reserved wire flags must be rejected');
  const backend=backendModule.createBackend({memory:true});
  const cleanupBackend=own(()=>backend.close());
  assert.equal(backend.observedHuntRecords.length,83,'Current captured hunt catalog must be complete');
  assert.equal(backend.observedHuntRecords.reduce((count,hunt)=>count+(hunt.pulls||[]).length,0),251,'Preserve each observed pull, including hunts with one or four pulls');
  assert.deepEqual(backend.catalogEvidence.missingObservedHunts,[]);
  assert.deepEqual(backend.catalogEvidence.missingObservedPulls,[]);
  assert.deepEqual(backend.catalogEvidence.unresolvedHuntLoot,[]);
  assert(protocol.Gc(backend.cyclopediaCatalog),'Cyclopedia must pass the original validator');
  assert.equal(backend.cyclopediaCatalog.monsters.length,192);
  assert.equal(new Set(backend.cyclopediaCatalog.monsters.map(m=>m.id)).size,192);
  const bestiaryLootCapture=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/bestiary-loot-observed-current.json'),'utf8'));
  assert.equal(bestiaryLootCapture.completeness.complete,true);
  assert.equal(bestiaryLootCapture.records.length,192);
  const capturedSpecies=new Set(bestiaryLootCapture.records.map(record=>record.name));
  assert.equal(capturedSpecies.size,192);
  assert.deepEqual(new Set(backend.cyclopediaCatalog.monsters.map(monster=>monster.name)),capturedSpecies);
  for(const observed of bestiaryLootCapture.records){
    const monster=backend.cyclopediaCatalog.monsters.find(entry=>entry.name===observed.name);
    const expectedLoot=observed.loot.map(entry=>({itemId:entry.itemId,rarity:entry.rarity,...(Object.hasOwn(entry,'max')?{max:entry.max}:{})}));
    assert.deepEqual(monster.loot,expectedLoot,'Direct Bestiary loot must retain every entry, order, rarity and observed maximum for '+observed.name);
  }
  assert.deepEqual(backend.catalogEvidence.unknownLootAssociations,[]);
  assert.deepEqual(backend.catalogEvidence.invalidBestiaryLootRecords,[]);
  assert.deepEqual(backend.catalogEvidence.unusedBestiaryLootRecords,[]);
  assert.deepEqual(backend.catalogEvidence.unknownBestiaryLootAppearances,[]);
  assert.equal(backend.catalogEvidence.observedBestiaryLoot.length,192);
  assert.equal(backend.catalogEvidence.bestiaryLootCapture.complete,true);
  assert.equal(backend.catalogEvidence.bestiaryLootCapture.lootEntries,2779);
  assert.equal(backend.catalogEvidence.bestiaryLootCapture.maxNotes,660);
  assert.equal(backend.cyclopediaCatalog.items.length,811,'Direct species loot must not invent additional item tooltip records');
  assert(backend.catalogEvidence.unknownLootItemStats.length>=731,'Unknown tooltip stats remain explicitly unknown');
  assert.deepEqual(backend.cyclopediaCatalog.monsters.find(monster=>monster.name==='Rat').loot,[{itemId:3031,rarity:'common',max:4},{itemId:3607,rarity:'common'}]);
  assert.deepEqual(backend.cyclopediaCatalog.monsters.find(monster=>monster.name==='Ripper Spectre').loot.filter(entry=>entry.rarity==='uncommon'),[{itemId:7642,rarity:'uncommon',max:2}],'Direct ficha supplies the uncommon loot missing from the mono-species hunt');
  const demonLoot=backend.cyclopediaCatalog.monsters.find(monster=>monster.name==='Demon').loot;
  assert.deepEqual(demonLoot.slice(0,2),[{itemId:3031,rarity:'common',max:100},{itemId:3031,rarity:'common',max:100}],'Identical duplicate loot rows are intentional');
  assert.equal(backend.cyclopediaCatalog.monsters.find(m=>m.name==='Flimsy Lost Soul').elements.death,100);
  // Exercise the captured UI consumer: catalog.elements carries resistance,
  // while the observed bestiary records store the percentage of damage taken.
  const clientSource=fs.readFileSync(path.join(captured,'chunk-3MLTU4OB.js'),'utf8');
  const rendererSource=clientSource.match(/function bc\(i\)\{[\s\S]*?\.join\(""\)\}/)?.[0];
  assert(rendererSource,'Pinned client damage-taken renderer must be present');
  const channels=['physical','fire','earth','energy','ice','holy','death','lifedrain'];
  const identity=Object.fromEntries(channels.map(channel=>[channel,channel]));
  const renderElements=vm.runInNewContext('('+rendererSource+')',{B0:channels,ur:identity,op:identity,t:(label,args={})=>label.replace(/\{(\w+)\}/g,(_,key)=>args[key])});
  const amazon=backend.cyclopediaCatalog.monsters.find(monster=>monster.name==='Amazon');
  assert.equal(amazon.elements.physical,-5);
  assert.equal(amazon.elements.death,-5);
  assert.equal(amazon.elements.fire,0);
  const amazonHtml=renderElements(amazon.elements);
  assert(amazonHtml.includes('physical: takes 105% damage'));
  assert(amazonHtml.includes('fire: takes 100% damage'));
  assert(renderElements(backend.cyclopediaCatalog.monsters.find(m=>m.name==='Flimsy Lost Soul').elements).includes('death: takes 0% damage'));
  assert.equal(backend.cyclopediaCatalog.monsters.find(m=>m.name==='Wardragon').maxHealth,8600);
  assert.equal(backend.cyclopediaCatalog.monsters.find(m=>m.name==='Rat').killsRequired,2500);
  assert.equal(backend.cyclopediaCatalog.items.find(i=>i.itemId===3273).attack,12);
  assert.equal(backend.cyclopediaCatalog.items.find(i=>i.itemId===3607).weight,400);
  assert.deepEqual(backend.catalogEvidence.omittedMonsters,[]);
  const rat=backend.hunts.find(h=>h.id==='rat-hunt');
  assert.deepEqual(rat.tiers.map(t=>t.name),['Cauteloso','Ousado','Agressivo']);
  assert.deepEqual(rat.loot.map(i=>i.itemId),[3607,3031]);
  const rarityNames={Comum:'common',Incomum:'uncommon','Semi-raro':'semi-rare',Raro:'rare','Muito raro':'very-rare'};
  for(const observed of backend.observedHuntRecords){
    const hunt=backend.hunts.find(h=>h.id===observed.id);
    assert.equal(hunt.description,observed.description);
    assert.deepEqual(hunt.tiers.map(t=>t.name),observed.tiers);
    for(const [index,pull] of (observed.pulls||[]).entries()){
      if(!pull)continue;
      const tier=hunt.tiers[index];
      assert.deepEqual(tier.monsterIndexes.map(i=>hunt.monsters[i].name),pull.monsters);
      assert.deepEqual(tier.loot.map(l=>hunt.loot[l.index].name),pull.loot.map(l=>l.name));
      assert.deepEqual(tier.loot.map(l=>l.rarity),pull.loot.map(l=>rarityNames[l.rarity]||l.rarity));
      for(const [lootIndex,entry] of pull.loot.entries())if(Number.isInteger(entry.itemId))assert.equal(hunt.loot[tier.loot[lootIndex].index].itemId,entry.itemId);
      if(!Number.isFinite(pull.monsterCount))assert.equal(tier.monsterCount,0);
    }
  }
  const server=http.createServer((req,res)=>{if(!backend.handleHttp(req,res)){res.writeHead(404);res.end();}});
  const cleanupServer=own(async()=>{await cleanupBackend();await new Promise(resolve=>server.close(()=>resolve()));});
  server.on('upgrade',backend.handleUpgrade);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  if(process.env.HUNTERA_TEST_FAIL_AFTER_LISTEN==='1')throw new Error('Injected setup failure to verify server cleanup');
  const port=server.address().port;
  const base=`http://127.0.0.1:${port}`;
  const count=backend.state.characters.length;
  for(const [headers,body,status] of [
    [{'content-type':'text/plain',origin:'https://unrelated.invalid'},'{"name":"Injected Local"}',415],
    [{'content-type':'application/json',origin:'https://unrelated.invalid'},'{"name":"Injected Local"}',403],
    [{'content-type':'application/json'},'null',400],
    [{'content-type':'application/json'},'[]',400],
    [{'content-type':'application/json'},'true',400],
    [{'content-type':'application/json'},'{"name":{"toString":null}}',400],
    [{'content-type':'application/json'},'{"name":17}',400]
  ]){const response=await fetch(base+'/api/characters',{method:'POST',headers,body});assert.equal(response.status,status);await response.text();}
  assert.equal(backend.state.characters.length,count,'Rejected HTTP mutations must not change state');
  const badRename=await fetch(base+'/api/characters/rename',{method:'POST',headers:{'content-type':'application/json'},body:'{"characterId":1,"name":{"toString":null}}'});
  assert.equal(badRename.status,400);await badRename.text();
  assert.equal(backend.state.characters[0].name,'Chatzinhogp');
  const created=await fetch(base+'/api/characters',{method:'POST',headers:{'content-type':'application/json',origin:base},body:JSON.stringify({name:'Second Local'})}).then(r=>r.json());
  assert.equal(created.character.name,'Second Local');
  const ticket=await fetch(`http://127.0.0.1:${port}/api/game-tickets`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({characterId:1})}).then(r=>r.json());
  assert.equal(ticket.character.name,'Chatzinhogp');
  assert.equal(new URL(ticket.websocketUrl).port,String(port));
  const account=await fetch(`http://127.0.0.1:${port}/api/auth/me`).then(r=>r.json());
  assert.equal(account.account.emailVerified,true);
  const campaigns=await fetch(`http://127.0.0.1:${port}/api/me/campaigns`).then(r=>r.json());
  assert(Array.isArray(campaigns.campaigns));
  assert.equal(campaigns.origin,`http://127.0.0.1:${port}`);
  const evidence=await fetch(base+'/api/local/catalog-evidence').then(response=>response.json());
  assert.deepEqual(evidence.unknownLootAssociations,[]);
  assert.equal(evidence.observedBestiaryLoot.length,192);
  assert.equal(evidence.bestiaryLootCapture.lootEntries,2779);
  const socket=new WebSocket(ticket.websocketUrl);socket.binaryType='arraybuffer';
  const cleanupSocket=own(()=>socket.close());
  const received=[],rejected=[];
  socket.addEventListener('message',event=>{
    const raw=backendModule.decodeMessage(event.data,new Map(Object.entries(backendModule.SERVER_CODES).map(([name,code])=>[code,name])));
    if(raw&&!protocol.Gc(raw))rejected.push(raw.type);
    if(raw)received.push(raw);
  });
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  const send=message=>socket.send(original.encodeClient(message));
  const until=async(predicate)=>{const start=Date.now();while(!predicate()){if(Date.now()-start>5000)throw new Error('Timed out waiting for server events');await new Promise(resolve=>setTimeout(resolve,20));}};
  try{
    send({type:'authenticate',clientVersion:'0.3.0+e0',ticket:ticket.ticket});
    await until(()=>received.some(m=>m.type==='system-message'));
    assert.deepEqual(rejected,[],'All bootstrap messages must pass original client validators');
    for(const type of ['welcome','scenario-terrain','instance-enter','creature-appear','player-stats','player-inventory','hunt-catalog'])assert(received.some(m=>m.type===type),'Missing '+type);
    assert(received.findIndex(m=>m.type==='scenario-terrain')<received.findIndex(m=>m.type==='instance-enter'));
    send({type:'client-ready'});send({type:'set-window-layout',windows:[]});send({type:'coins-refresh'});send({type:'cyclopedia-request'});
    await until(()=>received.some(m=>m.type==='cyclopedia-catalog'));
    assert.equal(received.find(m=>m.type==='cyclopedia-catalog').monsters.length,192);
    assert.deepEqual(received.find(m=>m.type==='cyclopedia-catalog').monsters,backend.cyclopediaCatalog.monsters,'Binary transport preserves all observed species loot tables including duplicates and optional max');
    assert(!received.some(m=>m.type==='system-message'&&m.text.includes('cyclopedia-request')),'Automatic catalog request must return its catalog');
    send({type:'start-hunt',huntId:'rat-hunt',tier:0});
    await until(()=>received.some(m=>m.type==='hunt-analyzer-update'));
    assert(received.some(m=>m.type==='creature-hit'));
    send({type:'leave-hunt'});
    await until(()=>received.filter(m=>m.type==='instance-enter').length>=3);
    send({type:'walk',direction:'north'});
    await until(()=>received.some(m=>m.type==='creature-move'));
    send({type:'shop-open'});
    await until(()=>received.some(m=>m.type==='shop-offers'));
    const slots=backend.state.characters[0].inventory.slots,slotLength=slots.length,firstUid=slots[0].uid,secondUid=slots[1].uid;
    for(const index of [100000,2147483647,-1,1.5])send({type:'move-item',from:{container:'backpack',index:0},to:{container:'backpack',index}});
    send({type:'ping',t:987654321});
    await until(()=>received.some(m=>m.type==='pong'&&m.t===987654321));
    assert.equal(slots.length,slotLength,'Invalid move references must not expand arrays');
    assert.equal(slots[0].uid,firstUid);
    send({type:'move-item',from:{container:'backpack',index:0},to:{container:'backpack',index:1}});
    send({type:'ping',t:987654322});
    await until(()=>received.some(m=>m.type==='pong'&&m.t===987654322));
    assert.equal(slots[0].uid,secondUid);assert.equal(slots[1].uid,firstUid);
    assert.deepEqual(rejected,[],'All gameplay messages must pass original client validators');
  }finally{await cleanupSocket();await cleanupBackend();await cleanupServer();}
  const fixtureRoot=path.resolve(os.tmpdir());
  const fixtureDir=fs.mkdtempSync(path.join(fixtureRoot,'huntera-backend-'));
  own(()=>{const target=path.resolve(fixtureDir);assert.equal(path.dirname(target),fixtureRoot);assert(path.basename(target).startsWith('huntera-backend-'));fs.rmSync(target,{recursive:true,force:true});});
  const invalidDataDir=path.join(fixtureDir,'invalid-catalog');
  fs.mkdirSync(invalidDataDir);
  for(const name of ['game-data.json','bestiary.json','new-hunts-normalized-20261019.json','bestiary-records.json','equipment-observed.json','hunts-observed-current.json'])fs.copyFileSync(path.resolve(__dirname,'../data',name),path.join(invalidDataDir,name));
  const invalidCapture=structuredClone(bestiaryLootCapture);
  invalidCapture.records.find(record=>record.name==='Ripper Spectre').loot[0].max=null;
  Object.assign(invalidCapture.records.find(record=>record.name==='Amazon'),{loot:[],emptyMessage:null});
  fs.writeFileSync(path.join(invalidDataDir,'bestiary-loot-observed-current.json'),JSON.stringify(invalidCapture));
  const invalidCatalog=backendModule.createBackend({memory:true,dataDir:invalidDataDir});
  const cleanupInvalidCatalog=own(()=>invalidCatalog.close());
  assert.equal(invalidCatalog.catalogEvidence.bestiaryLootCapture.complete,false);
  assert.equal(invalidCatalog.catalogEvidence.bestiaryLootCapture.capturedSpecies,190);
  assert.deepEqual(invalidCatalog.catalogEvidence.invalidBestiaryLootRecords.map(record=>record.name).sort(),['Amazon','Ripper Spectre']);
  for(const name of ['Ripper Spectre','Amazon'])assert(invalidCatalog.catalogEvidence.unknownLootAssociations.includes(name),'Invalid source data must not become confirmed empty loot for '+name);
  await cleanupInvalidCatalog();
  const first=backend.state.characters[0],preservedUid=first.inventory.slots[0].uid;
  const second=backend.state.characters[1];
  second.inventory={slots:[{...first.inventory.slots[0],uid:preservedUid,itemId:3577,name:'cheese'}],satchel:[],equipment:{}};
  const stateFile=path.join(fixtureDir,'local-state.json');
  fs.writeFileSync(stateFile,JSON.stringify(backend.state));
  const reloaded=backendModule.createBackend({dataDir:path.resolve(__dirname,'../data'),stateFile});
  const cleanupReloaded=own(()=>reloaded.close());
  assert.equal(reloaded.state.characters[0].inventory.slots[0].uid,preservedUid,'Unique existing UID must survive repair');
  assert.notEqual(reloaded.state.characters[1].inventory.slots[0].uid,preservedUid,'Duplicate UID from saved data must be repaired');
  assert.equal(reloaded.state.characters[1].inventory.slots[0].itemId,3607,'Seed repair must keep the UID allocated to its item');
  const restartServer=http.createServer((req,res)=>{if(!reloaded.handleHttp(req,res)){res.writeHead(404);res.end();}});
  const cleanupRestartServer=own(async()=>{await cleanupReloaded();await new Promise(resolve=>restartServer.close(()=>resolve()));});
  restartServer.on('upgrade',reloaded.handleUpgrade);
  await new Promise(resolve=>restartServer.listen(0,'127.0.0.1',resolve));
  const restartSocket=new WebSocket(`ws://127.0.0.1:${restartServer.address().port}/game-socket`);restartSocket.binaryType='arraybuffer';
  const cleanupRestartSocket=own(()=>restartSocket.close());
  let inventoryMessages=0;
  restartSocket.addEventListener('message',event=>{const messages=original.decodeServer(event.data);if(messages?.some(m=>m.type==='player-inventory'))inventoryMessages++;});
  await new Promise((resolve,reject)=>{restartSocket.addEventListener('open',resolve,{once:true});restartSocket.addEventListener('error',reject,{once:true});});
  try{
    restartSocket.send(original.encodeClient({type:'authenticate',clientVersion:'0.3.0+e0',ticket:'local-1'}));
    await until(()=>inventoryMessages===1);
    restartSocket.send(original.encodeClient({type:'shop-buy',itemId:3273,amount:1}));
    await until(()=>inventoryMessages===2);
    const uids=reloaded.state.characters.flatMap(c=>c.inventory?[...c.inventory.slots,...c.inventory.satchel,...Object.values(c.inventory.equipment)].filter(Boolean).map(i=>i.uid):[]);
    assert.equal(new Set(uids).size,uids.length,'Restart and purchase must retain globally unique UIDs');
    console.log(JSON.stringify({ok:true,serverCodes:192,clientCodes:211,hunts:backend.hunts.length,observedPulls:backend.observedHuntRecords.reduce((count,hunt)=>count+(hunt.pulls||[]).length,0),unresolvedLoot:backend.catalogEvidence.unresolvedHuntLoot.length,cyclopedia:{monsters:backend.cyclopediaCatalog.monsters.length,items:backend.cyclopediaCatalog.items.length,bosses:backend.cyclopediaCatalog.bosses.length},bestiaryLoot:{species:backend.catalogEvidence.observedBestiaryLoot.length,entries:backend.catalogEvidence.bestiaryLootCapture.lootEntries,maxNotes:backend.catalogEvidence.bestiaryLootCapture.maxNotes,unknownAssociations:backend.catalogEvidence.unknownLootAssociations.length},tests:['192 directly observed species loot tables: order, rarity, duplicates and optional max','Bestiary evidence over HTTP and exact tables over binary WebSocket','invalid/null max and unconfirmed empty loot remain unknown','83 observed hunts and 251 pulls','per-pull active species/order/rarity/item IDs','damage-taken percentages rendered by captured client function','original codecs','original validators','reserved flags rejected','HTTP admission and shapes','wrong Origin rejected','text/plain rejected','null/array/boolean bodies rejected','object names rejected without crash','WebSocket bootstrap','automatic catalog request','terrain order','hunt combat','leave hunt','walk','shop','invalid inventory indices rejected; valid swap works','UID preservation and duplicate repair','UID uniqueness after restart and purchase']},null,2));
  }finally{
    await cleanupRestartSocket();
    const stopping=cleanupReloaded();
    // Keep HTTP listening while the backend stops to exercise a late upgrade.
    const lateSocket=new WebSocket(`ws://127.0.0.1:${restartServer.address().port}/game-socket`);
    const lateRejected=new Promise((resolve,reject)=>{
      lateSocket.addEventListener('open',()=>{lateSocket.close();reject(new Error('Backend accepted WebSocket during shutdown'));},{once:true});
      lateSocket.addEventListener('error',resolve,{once:true});
    });
    await stopping;await lateRejected;await cleanupRestartServer();
  }
  }finally{for(const dispose of cleanupStack.reverse())await dispose();}
})().catch(error=>{console.error(error);process.exitCode=1;});
