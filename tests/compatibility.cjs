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
  const dictionary=(await import(pathToFileURL(path.join(captured,'chunk-M5GYIUVK.js')).href)).a;
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
  const itemCatalogCapture=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/item-catalog-observed-current.json'),'utf8'));
  assert.equal(itemCatalogCapture.completeness.complete,true);
  assert.equal(itemCatalogCapture.records.length,1070);
  assert.equal(itemCatalogCapture.completeness.capturedPages,134);
  assert.deepEqual(itemCatalogCapture.completeness.pages,Array.from({length:134},(_,index)=>index+1));
  assert.deepEqual(itemCatalogCapture.completeness.missingPages,[]);
  const observedItems=new Map(itemCatalogCapture.records.map(record=>[record.itemId,record]));
  assert.equal(observedItems.size,1070,'The source must contain 1070 unique item IDs');
  const catalogItems=new Map(backend.cyclopediaCatalog.items.map(record=>[record.itemId,record]));
  assert.equal(backend.cyclopediaCatalog.items.length,1070,'The full item source replaces the catalog without adding hunt or species loot IDs');
  assert.deepEqual(new Set(catalogItems.keys()),new Set(observedItems.keys()));
  const fieldsByItem=new Map(backend.catalogEvidence.itemCatalogFields.map(record=>[record.itemId,record]));
  assert.equal(backend.catalogEvidence.itemCatalogFields.length,1070);
  assert.equal(fieldsByItem.size,1070);
  const captureEvidence=backend.catalogEvidence.itemCatalogCapture;
  assert.equal(captureEvidence.file,'item-catalog-observed-current.json');
  assert.equal(captureEvidence.complete,true);
  assert.equal(captureEvidence.expectedItems,1070);
  assert.equal(captureEvidence.capturedItems,1070);
  assert.equal(captureEvidence.expectedPages,134);
  assert.equal(captureEvidence.capturedPages,134);
  assert.deepEqual(captureEvidence.reasons,[]);
  assert.deepEqual(backend.catalogEvidence.invalidItemCatalogRecords,[]);
  const categoryByLabel=new Map();
  for(const [id,label] of Object.entries(protocol.Jb))for(const displayed of [label,dictionary[label]??label]){
    assert(!categoryByLabel.has(displayed)||categoryByLabel.get(displayed)===Number(id),'Original category labels must not be ambiguous');
    categoryByLabel.set(displayed,Number(id));
  }
  const slotByLabel=new Map();
  for(const slot of ['helmet','amulet','weapon','armor','shield','ring','legs','boots','ammo','backpack'])for(const label of [slot,dictionary[slot]??slot])slotByLabel.set(label,slot);
  const priorTooltips=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/equipment-observed.json'),'utf8'));
  const priorByName=new Map(priorTooltips.map(record=>[record.name.toLowerCase(),record]));
  function priorTooltipFields(name){
    const prior=priorByName.get(name.toLowerCase());
    if(!prior)return null;
    const firstCard=(prior.tooltip||'').split(/\btext EQUIPADO\b/u)[0],result={};
    assert(firstCard.split('\n').includes('text '+prior.name),'Historical tooltip must identify its own first card');
    for(const [field,label] of Object.entries({attack:'Ataque',defense:'Defesa',armor:'Armadura',range:'Alcance',speedBonus:'Velocidade',classification:'Classificação'})){
      const match=firstCard.match(new RegExp('(?:^|\\n)text '+label+': ([+-]?[0-9]+)(?:\\n|$)','u'));
      if(match)result[field]=Number(match[1]);
    }
    const weight=firstCard.match(/(?:^|\n)text ([0-9]+(?:\.[0-9]+)?) oz(?:\n|$)/u);
    if(weight)result.weight=Math.round(Number(weight[1])*100);
    if(firstCard.includes('text Duas mãos'))result.twoHanded=true;
    else if(firstCard.includes('text Uma mão'))result.twoHanded=false;
    return result;
  }
  const requiredStats=['attack','defense','armor'];
  const nullableWireFields={attack:'attack',defense:'defense',armor:'armor',range:'range',speedBonus:'speedBonus',elementalDamage:'elementalDamage',elementalType:'elementalTypeLabel',weight:'weightHundredths',classification:'classification',twoHanded:'twoHanded',protection:'protections'};
  const expectedObservedCounts={},expectedListCounts={},retainedTooltipIds=new Set();
  let oneHandedDisplayed=0,twoHandedDisplayed=0;
  for(const observed of itemCatalogCapture.records){
    const actual=catalogItems.get(observed.itemId),fields=fieldsByItem.get(observed.itemId),context=`item ${observed.itemId} (${observed.name})`;
    assert.equal(fields.sourcePage,observed.sourcePage,'Keep the visible page for '+context);
    assert(Array.isArray(fields.unknownFields)&&Array.isArray(fields.neutralTransportFields));
    assert.equal(new Set(fields.unknownFields).size,fields.unknownFields.length,'Unknown fields are not duplicated for '+context);
    assert(fields.provenance&&typeof fields.provenance==='object');
    assert([null,'one-handed','two-handed'].includes(fields.handednessDisplayed),'Displayed handedness has an explicit observed/unknown state for '+context);
    if(fields.handednessDisplayed==='one-handed'){
      oneHandedDisplayed++;
      assert.equal(priorTooltipFields(observed.name)?.twoHanded,false,'One-handed evidence comes from the historical first-card label for '+context);
      assert(!Object.hasOwn(actual,'twoHanded'),'One-handed display is also an absent-source fallback, so it must not fabricate twoHanded:false for '+context);
      assert(!Object.hasOwn(fields.provenance,'twoHanded'),'One-handed fallback display is not known boolean provenance for '+context);
      assert(fields.unknownFields.includes('twoHanded'),'One-handed display leaves the source boolean unknown for '+context);
    }else if(fields.handednessDisplayed==='two-handed'){
      twoHandedDisplayed++;
      assert.equal(priorTooltipFields(observed.name)?.twoHanded,true,'Two-handed evidence comes from the historical first-card label for '+context);
      assert.equal(actual.twoHanded,true,'The explicit two-handed label supports true for '+context);
    }
    assert(categoryByLabel.has(observed.categoryLabel),'Source category must resolve through the pinned original labels for '+context);
    const domValues={itemId:observed.itemId,name:observed.name,category:categoryByLabel.get(observed.categoryLabel)};
    if(observed.slotLabel!==null){
      assert(slotByLabel.has(observed.slotLabel),'Source slot must resolve through the original translation for '+context);
      domValues.slot=slotByLabel.get(observed.slotLabel);
    }
    for(const [wireField,sourceField] of Object.entries(nullableWireFields))if(observed[sourceField]!==null)domValues[wireField]=observed[sourceField];
    for(const [field,value] of Object.entries(domValues)){
      assert.deepEqual(actual[field],value,'Current rendered value wins for '+context+', '+field);
      if(field!=='itemId')assert.equal(fields.provenance[field],'item-list-dom','Current rendered provenance for '+context+', '+field);
      assert(!fields.unknownFields.includes(field),'Observed value must not remain unknown for '+context+', '+field);
    }
    if(observed.slotLabel===null){
      assert.equal(actual.slot,null,'Absent slot label uses only the required null wire shape for '+context);
      assert(fields.unknownFields.includes('slot'),'Absent slot remains unknown for '+context);
      assert(!Object.hasOwn(fields.provenance,'slot'));
    }
    for(const [field,sourceField] of Object.entries(nullableWireFields))if(observed[sourceField]===null){
      if(fields.provenance[field]==='prior-tooltip'){
        const previous=priorTooltipFields(observed.name);
        assert(previous&&Object.hasOwn(previous,field),'Historical supplement needs an explicitly rendered first-card field for '+context+', '+field);
        if(field==='twoHanded')assert.equal(previous[field],true,'A historical one-handed fallback cannot establish twoHanded:false for '+context);
        assert.deepEqual(actual[field],previous[field],'Historical supplement retains its observed value for '+context+', '+field);
        assert(!fields.unknownFields.includes(field));
        retainedTooltipIds.add(observed.itemId);
      }else{
        assert(fields.unknownFields.includes(field),'Unobserved value remains unknown for '+context+', '+field);
        assert(!Object.hasOwn(fields.provenance,field),'An unknown field has no recovered provenance for '+context+', '+field);
        if(requiredStats.includes(field))assert.equal(actual[field],0,'Required numeric wire placeholder for '+context+', '+field);
        else assert(!Object.hasOwn(actual,field),'Unknown optional field must be omitted for '+context+', '+field);
      }
    }
    assert.deepEqual([...fields.neutralTransportFields].sort(),requiredStats.filter(field=>fields.unknownFields.includes(field)).sort(),'Only the three unknown required stats need neutral wire numbers for '+context);
    for(const [field,source] of Object.entries(fields.provenance)){
      assert(['item-list-dom','prior-tooltip'].includes(source),'Every field has a documented provenance for '+context+', '+field);
      assert(!fields.unknownFields.includes(field));
      expectedObservedCounts[field]=(expectedObservedCounts[field]??0)+1;
      if(source==='item-list-dom'){
        assert(Object.hasOwn(domValues,field),'DOM provenance needs a current observed value for '+context+', '+field);
        assert.deepEqual(actual[field],domValues[field]);
        expectedListCounts[field]=(expectedListCounts[field]??0)+1;
      }else retainedTooltipIds.add(observed.itemId);
    }
  }
  assert(oneHandedDisplayed>0,'Regression fixture must exercise the ambiguous historical one-handed label');
  assert(twoHandedDisplayed>0,'Regression fixture must retain explicitly observed two-handed weapons');
  assert.deepEqual(captureEvidence.observedFields,expectedObservedCounts,'Evidence counts every known final field and excludes transport placeholders');
  assert.deepEqual(captureEvidence.listObservedFields,expectedListCounts,'List coverage counts only current DOM fields');
  assert.equal(captureEvidence.retainedTooltips,retainedTooltipIds.size);
  const lootItemIds=new Set([...backend.hunts.flatMap(hunt=>hunt.loot.map(item=>item.itemId)),...backend.cyclopediaCatalog.monsters.flatMap(monster=>monster.loot.map(item=>item.itemId))]);
  const expectedUnknownStats=[...lootItemIds].filter(itemId=>!fieldsByItem.has(itemId)||requiredStats.some(field=>fieldsByItem.get(itemId).unknownFields.includes(field)));
  assert.deepEqual(new Set(backend.catalogEvidence.unknownLootItemStats),new Set(expectedUnknownStats),'Unknown combat values are derived exactly from observed field evidence');
  const expectedOutsideHunts=[];
  for(const hunt of backend.hunts)for(const item of hunt.loot)if(!observedItems.has(item.itemId))expectedOutsideHunts.push({huntId:hunt.id,itemId:item.itemId,name:item.name});
  const outsideKey=entry=>JSON.stringify([entry.huntId,entry.itemId,entry.name]);
  assert.deepEqual(new Set(backend.catalogEvidence.huntLootItemsOutsideItemCatalog.map(outsideKey)),new Set(expectedOutsideHunts.map(outsideKey)),'Hunt loot outside the exact source stays in diagnostics without expanding the catalog');
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
  assert.deepEqual(evidence.itemCatalogCapture,backend.catalogEvidence.itemCatalogCapture,'HTTP exposes complete item-catalog provenance and coverage');
  assert.deepEqual(evidence.itemCatalogFields,backend.catalogEvidence.itemCatalogFields);
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
    assert.equal(received.find(m=>m.type==='cyclopedia-catalog').items.length,1070);
    assert.deepEqual(received.find(m=>m.type==='cyclopedia-catalog').items,backend.cyclopediaCatalog.items,'Binary transport preserves every current item value and omitted unknown optional field');
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
  const catalogFixtureFiles=['game-data.json','bestiary.json','new-hunts-normalized-20261019.json','bestiary-records.json','equipment-observed.json','hunts-observed-current.json','bestiary-loot-observed-current.json','item-catalog-observed-current.json'];
  const copyCatalogFixture=(target,{includeItems=true}={})=>{
    fs.mkdirSync(target);
    for(const name of catalogFixtureFiles)if(includeItems||name!=='item-catalog-observed-current.json')fs.copyFileSync(path.resolve(__dirname,'../data',name),path.join(target,name));
  };
  const missingItemsDir=path.join(fixtureDir,'missing-items');
  copyCatalogFixture(missingItemsDir,{includeItems:false});
  const legacy=backendModule.createBackend({memory:true,dataDir:missingItemsDir});
  const cleanupLegacy=own(()=>legacy.close());
  assert.equal(legacy.catalogEvidence.itemCatalogCapture.complete,false);
  assert(legacy.catalogEvidence.itemCatalogCapture.reasons.length>0,'Missing source must have an explicit fallback reason');
  assert.equal(legacy.cyclopediaCatalog.items.length,811,'Missing full source preserves the existing legacy catalog');
  assert(protocol.Gc(legacy.cyclopediaCatalog),'Legacy fallback still passes the original validator');
  const legacyItems=new Map(legacy.cyclopediaCatalog.items.map(record=>[record.itemId,record]));
  for(const itemId of retainedTooltipIds){
    const previous=legacyItems.get(itemId),current=catalogItems.get(itemId);
    assert(previous,'Historical supplement must have exactly the same legacy item ID: '+itemId);
    assert.equal(previous.name.toLowerCase(),current.name.toLowerCase(),'Historical supplement name must agree for item '+itemId);
    assert.equal(previous.category,current.category,'Historical supplement category must agree for item '+itemId);
  }
  await cleanupLegacy();
  const invalidItemCases=[
    {name:'wrong-total',mutate:source=>{source.completeness.expectedItems=1069;}},
    {name:'partial-source',mutate:source=>{source.completeness.complete=false;}},
    {name:'conflicting-duplicate-id',recordError:true,mutate:source=>{source.records[1].itemId=source.records[0].itemId;source.records[1].raw.itemId=source.records[0].itemId;}},
    {name:'numeric-string',recordError:true,mutate:source=>{const row=source.records.find(record=>record.attack!==null);row.attack=String(row.attack);}},
    {name:'unknown-category',recordError:true,mutate:source=>{const row=source.records[0];row.categoryLabel='Category absent from pinned client';row.raw.identityRaw=row.categoryLabel+(row.slotLabel===null?'':' — '+row.slotLabel);}}
  ];
  for(const testCase of invalidItemCases){
    const target=path.join(fixtureDir,'invalid-items-'+testCase.name);
    copyCatalogFixture(target);
    const invalidItems=structuredClone(itemCatalogCapture);
    testCase.mutate(invalidItems);
    fs.writeFileSync(path.join(target,'item-catalog-observed-current.json'),JSON.stringify(invalidItems));
    const rejectedCatalog=backendModule.createBackend({memory:true,dataDir:target});
    const dispose=own(()=>rejectedCatalog.close());
    assert.equal(rejectedCatalog.catalogEvidence.itemCatalogCapture.complete,false,'Reject the complete source atomically for '+testCase.name);
    assert(rejectedCatalog.catalogEvidence.itemCatalogCapture.reasons.length>0,'Explain the source rejection for '+testCase.name);
    if(testCase.recordError)assert(rejectedCatalog.catalogEvidence.invalidItemCatalogRecords.length>0,'Identify invalid records for '+testCase.name);
    assert.equal(rejectedCatalog.cyclopediaCatalog.items.length,811,'Rejected source must not partially replace or expand legacy catalog for '+testCase.name);
    assert.deepEqual(rejectedCatalog.cyclopediaCatalog.items,legacy.cyclopediaCatalog.items,'Fallback is the unchanged legacy catalog for '+testCase.name);
    assert(protocol.Gc(rejectedCatalog.cyclopediaCatalog),'Fallback passes original validator for '+testCase.name);
    await dispose();
  }
  const invalidDataDir=path.join(fixtureDir,'invalid-catalog');
  copyCatalogFixture(invalidDataDir);
  const invalidCapture=structuredClone(bestiaryLootCapture);
  invalidCapture.records.find(record=>record.name==='Ripper Spectre').loot[0].max=null;
  Object.assign(invalidCapture.records.find(record=>record.name==='Amazon'),{loot:[],emptyMessage:null});
  fs.writeFileSync(path.join(invalidDataDir,'bestiary-loot-observed-current.json'),JSON.stringify(invalidCapture));
  const invalidCatalog=backendModule.createBackend({memory:true,dataDir:invalidDataDir});
  const cleanupInvalidCatalog=own(()=>invalidCatalog.close());
  assert.equal(invalidCatalog.catalogEvidence.bestiaryLootCapture.complete,false);
  assert.equal(invalidCatalog.catalogEvidence.itemCatalogCapture.complete,true,'Invalid species loot does not invalidate the independent complete item source');
  assert.equal(invalidCatalog.cyclopediaCatalog.items.length,1070);
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
  // Preferences use the captured codecs and a real state file. A fresh server
  // instance and a new socket must restore the same character's saved snapshot.
  const preferenceFile=path.join(fixtureDir,'preferences-state.json');
  const servePreferences=async()=>{
    const instance=backendModule.createBackend({dataDir:path.resolve(__dirname,'../data'),stateFile:preferenceFile});
    const disposeBackend=own(()=>instance.close());
    const httpServer=http.createServer((req,res)=>{if(!instance.handleHttp(req,res)){res.writeHead(404);res.end();}});
    const dispose=own(async()=>{await disposeBackend();await new Promise(resolve=>httpServer.close(()=>resolve()));});
    httpServer.on('upgrade',instance.handleUpgrade);
    await new Promise(resolve=>httpServer.listen(0,'127.0.0.1',resolve));
    const address=`http://127.0.0.1:${httpServer.address().port}`;
    const connect=async(characterId=1)=>{
      const ws=new WebSocket(address.replace('http:','ws:')+'/game-socket');ws.binaryType='arraybuffer';
      const disposeSocket=own(()=>ws.close()),events=[],invalid=[];
      ws.addEventListener('message',event=>{
        const raw=backendModule.decodeMessage(event.data,new Map(Object.entries(backendModule.SERVER_CODES).map(([name,code])=>[code,name])));
        if(raw&&!protocol.Gc(raw))invalid.push(raw.type);
        events.push(...original.decodeServer(event.data));
      });
      await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
      const write=message=>ws.send(original.encodeClient(message));
      write({type:'authenticate',clientVersion:'0.3.0+e0',ticket:'local-'+characterId});
      await until(()=>events.some(message=>message.type==='system-message'));
      return {events,invalid,write,dispose:disposeSocket,latest:type=>events.findLast(message=>message.type===type)};
    };
    return {instance,address,connect,dispose};
  };
  const preferenceServer=await servePreferences();
  const preferences=await preferenceServer.connect();
  assert.deepEqual(preferences.latest('window-layout'),{type:'window-layout',windows:{}},'Bootstrap must activate the captured layout UI with an empty snapshot');
  assert.deepEqual(preferences.latest('hunt-favorites'),{type:'hunt-favorites',huntIds:[]});
  const windowNames=['inventory','loot','analyzer','dps-analyzer','character','cyclopedia','friends','hunt','prey','chat','debug','highscores','guild','expeditions','bestiary','proficiency','imbuements','boss-route'];
  const layout=Object.fromEntries(windowNames.map(name=>[name,{open:false}]));
  layout.inventory={open:true,size:{width:320.26,height:-10001.7,a:0.24,b:0.25,c:99999,d:7.74,seventh:3},pos:{x:-10.3,y:30000.4},picks:['sword','',17,'x'.repeat(65),...Array.from({length:12},(_,i)=>'pick-'+i)],unrecognized:19};
  layout.loot={open:'yes',size:{'':1,['x'.repeat(25)]:2,width:'400'},pos:{x:4,y:'5'},picks:['',null]};
  layout.hunt={open:false,picks:[]};layout.unknownWindow={open:true};
  const expectedLayout=protocol.Gc({type:'window-layout',windows:layout}).windows;
  assert.deepEqual(expectedLayout.inventory.size,{width:320.5,height:-10000,a:0,b:0.5,c:10000,d:7.5});
  assert.deepEqual(expectedLayout.inventory.pos,{x:0,y:20000});
  assert.equal(expectedLayout.inventory.picks.length,10);
  assert(!Object.hasOwn(expectedLayout,'loot'));assert(!Object.hasOwn(expectedLayout,'unknownWindow'));
  assert.deepEqual(expectedLayout.hunt.picks,[]);
  const favorites=[preferenceServer.instance.hunts[1].id,'rat-hunt'];
  assert(preferenceServer.instance.hunts.every(hunt=>protocol.P(hunt.id)),'Local favorite IDs must belong to the captured hunt enum');
  preferences.write({type:'set-window-layout',windows:layout});
  preferences.write({type:'set-hunt-favorites',huntIds:favorites});
  preferences.write({type:'ping',t:2026102601});
  await until(()=>preferences.events.some(message=>message.type==='pong'&&message.t===2026102601));
  assert.deepEqual(preferences.latest('hunt-favorites'),{type:'hunt-favorites',huntIds:favorites});
  let savedPreferences=JSON.parse(fs.readFileSync(preferenceFile,'utf8')).characters[0];
  assert.deepEqual(savedPreferences.windowLayout,expectedLayout,'Persist the same bounded layout as the original normalizer');
  assert.deepEqual(savedPreferences.huntFavorites,favorites,'Persist order without inventing a favorite');
  for(const windows of [undefined,null,[],1,'inventory'])preferences.write({type:'set-window-layout',windows});
  for(const huntIds of [undefined,null,{},'rat-hunt',['rat-hunt','rat-hunt'],['unknown-hunt'],['rat-hunt',17]])preferences.write({type:'set-hunt-favorites',huntIds});
  preferences.write({type:'ping',t:2026102602});
  await until(()=>preferences.events.some(message=>message.type==='pong'&&message.t===2026102602));
  savedPreferences=JSON.parse(fs.readFileSync(preferenceFile,'utf8')).characters[0];
  assert.deepEqual(savedPreferences.windowLayout,expectedLayout,'Malformed layout envelopes cannot erase a valid saved layout');
  assert.deepEqual(savedPreferences.huntFavorites,favorites,'Invalid or duplicate hunt IDs cannot replace valid favorites');
  assert.deepEqual(preferences.invalid,[],'Preference replies pass original validators');
  await preferences.dispose();
  const reconnected=await preferenceServer.connect();
  assert.deepEqual(reconnected.latest('window-layout').windows,expectedLayout,'A second session restores the layout');
  assert.deepEqual(reconnected.latest('hunt-favorites').huntIds,favorites,'A second session restores favorites');
  await reconnected.dispose();
  const otherCharacter=await fetch(preferenceServer.address+'/api/characters',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Preferences Other'})}).then(response=>response.json());
  const otherPreferences=await preferenceServer.connect(otherCharacter.character.id);
  assert.deepEqual(otherPreferences.latest('window-layout').windows,{},'The local per-character layout is isolated');
  assert.deepEqual(otherPreferences.latest('hunt-favorites').huntIds,[],'The local per-character favorites are isolated');
  await otherPreferences.dispose();await preferenceServer.dispose();
  const preferenceRestart=await servePreferences();
  const restoredPreferences=await preferenceRestart.connect();
  assert.deepEqual(restoredPreferences.latest('window-layout').windows,expectedLayout,'Restart restores the exact normalized layout through the original codec');
  assert.deepEqual(restoredPreferences.latest('hunt-favorites').huntIds,favorites,'Restart restores ordered favorites through the original codec');
  restoredPreferences.write({type:'set-window-layout',windows:{}});
  restoredPreferences.write({type:'set-hunt-favorites',huntIds:[]});
  restoredPreferences.write({type:'ping',t:2026102603});
  await until(()=>restoredPreferences.events.some(message=>message.type==='pong'&&message.t===2026102603));
  assert.deepEqual(restoredPreferences.invalid,[]);
  await restoredPreferences.dispose();await preferenceRestart.dispose();
  const clearedServer=await servePreferences(),cleared=await clearedServer.connect();
  assert.deepEqual(cleared.latest('window-layout').windows,{},'An explicit empty object clears the layout after restart');
  assert.deepEqual(cleared.latest('hunt-favorites').huntIds,[],'An explicit empty list clears favorites after restart');
  assert.deepEqual(cleared.invalid,[]);
  await cleared.dispose();await clearedServer.dispose();
  console.log(JSON.stringify({ok:true,preferences:['original layout normalization and all 18 window keys','favorite enum, uniqueness and order','malformed commands preserve valid saved preferences','new-session and backend-restart restoration through original codecs','per-character isolation','explicit empty snapshot clears preferences']}));
  }finally{for(const dispose of cleanupStack.reverse())await dispose();}
})().catch(error=>{console.error(error);process.exitCode=1;});
