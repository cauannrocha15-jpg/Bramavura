'use strict';

// Local compatibility server for the captured public browser client.
// Combat, terrain generation, loot and progression below are independent
// approximations. They are not recovered Huntera server algorithms.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const SERVER_CODES = {"action-bar-presets":1,"action-bar-update":2,"ammo-selection":3,"arena-catalog":4,"arena-prize-offer":5,"arena-status":6,"auto-loot-update":7,"battle-settings-update":8,"bestiary-progress":9,"blessings-status":10,broadcast:107,"capacity-overflow":11,"chat-message":12,"coin-transfer-result":13,coins:14,"creature-appear":15,"creature-critical":17,"creature-disappear":18,"creature-health":19,"creature-hit":20,"creature-move":21,"creature-outfit":22,"creature-restore":23,"creature-say":24,"creature-turn":25,"cyclopedia-catalog":26,"daily-reward-claimed":27,"daily-reward-offer":28,"depot-update":29,"experience-gain":30,"ground-item-appear":31,"ground-item-disappear":32,"guild-details":110,"guild-directory":111,"guild-expeditions":33,"guild-info":34,"guild-invite-offer":35,"guild-log":36,"guild-member-status":37,"hazard-zones":38,"header-badge":113,highscores:39,"idle-training":174,"hunt-favorites":176,"hunt-analyzer-session":40,"hunt-analyzer-update":41,"hunt-catalog":42,"hunt-exit-rules":43,"hunt-leader-entered":44,"hunt-leader-invite-cancelled":45,"hunt-leave-pending":46,"hunt-pending":47,"hunt-portal-entered":48,"hunt-quick-sell-state":49,"hunt-start-warning":115,"hunt-team-invite-cancelled":50,"hunt-team-invited":51,"imbuement-result":52,"imbuement-shrine":53,"forge-state":178,"forge-result":179,"instance-enter":54,"inventory-delta":55,"item-requirements":56,"item-values":57,"login-queued":58,"loot-add":59,"loot-drop":60,"loot-remove":61,"loot-update":62,"market-browse-result":63,"market-enter":64,"market-history":65,"market-items":66,"market-own-offers":67,"market-owned":68,"market-result":69,motd:112,epilogue:130,"raid-score":131,"party-finder-config":138,"party-finder-match-closed":134,"party-finder-match-found":135,"party-finder-refused":136,"party-finder-state":137,"party-invite-confirm":70,"party-invited":71,"party-update":72,"player-died":73,"player-inventory":74,"player-mounts":75,"player-outfits":76,"player-stats":77,"player-target":78,"players-online":79,pong:80,"prey-result":81,"prey-state":82,"private-message":83,"projectile-move":84,"quick-sell-update":85,"review-prompt":108,"review-result":109,"rmt-browse-result":160,"rmt-enter":159,"rmt-history":162,"rmt-own-offers":161,"rmt-pix-order":164,"rmt-sign-request":165,"rmt-delivered":166,"rmt-result":163,"dps-breakdown":167,"sandbox-catalog":86,"sandbox-character-results":87,"scenario-terrain":88,"shop-offers":89,"store-history":133,"store-offers":90,"store-result":91,"system-message":92,"trade-closed":93,"trade-requested":94,"trade-session":95,"training-update":96,"transfer-begin":97,"transfer-offer":98,"tutorial-hint":99,"tutorial-update":100,"vip-list":101,"vip-status":102,welcome:103,"window-layout":104,"world-effect":105,"xp-scroll-state":106,"ticket-result":114,"ticket-history":116,"chat-report-result":117,"raid-status":118,"raid-queued":119,"raid-march":120,"raid-victims":121,"feature-flags":122,"poll-offer":123,"poll-result":124,"analyzer-values":125,"hunt-sell-rules":126,"chat-policy":127,"alerts-state":132,"party-costs-offered":139,"party-costs-cancelled":140,"party-costs-settled":141,"imbuement-materials":142,"daily-boss-status":143,"daily-boss-rooms":144,"daily-boss-room":145,"daily-boss-chat":146,"daily-boss-refused":147,"daily-boss-invited":148,"daily-boss-victory":149,"daily-boss-fight":150,"daily-boss-rewards":151,"death-film-offer":152,"death-film":153,"daily-boss-death-state":154,"creature-resync":155,"party-kick-vote":156,"party-kick-vote-ended":157,"quest-status":168,"quest-victory":169,"action-bar-preset-slots":170,"loot-destinations":171,"daily-boss-immunity":172,"death-history":173,"mission-leader-left":175,"ammo-rules":177,"forge-dust-gained":180,"forge-history":181,"guild-my-applications":182,"valuables-offers":183,"player-vitals":184,"jewel-rules":185,"creature-carry":186,"proficiency-state":187,"store-featured":188,"outfit-addon-offer":189,"guild-chat-history":190,"boss-route":191,"account-chest-update":192,"test-window":193,bosstiary:194,"mount-unlock-offer":195,"wheel-state":196};
const CLIENT_CODES = {"arena-prize-pick":1,authenticate:2,"battle-settings":3,"blessing-buy":4,"blessings-open":5,"cancel-hunt":6,"cancel-leave-hunt":7,"choose-vocation":8,"claim-daily-reward":9,"client-ready":10,"coin-transfer":11,"cyclopedia-request":12,"delete-action-bar-preset":13,"depot-close":14,"depot-open":15,"destroy-backpack-item":16,"enter-arena":17,"enter-sandbox":18,"equip-item":19,"guild-create":21,"guild-donate-gold":111,"guild-details-request":109,"guild-directory-request":110,"guild-disband":22,"guild-info-request":115,"guild-invite":23,"guild-invite-respond":24,"guild-kick":25,"guild-leave":26,"guild-log-request":27,"guild-rename-rank":28,"guild-set-rank":29,hello:30,"highscores-request":31,"hunt-analyzer-reset":32,"hunt-leader-respond":33,"hunt-quick-sell":34,"hunt-sell-skip":130,"hunt-team-respond":35,"imbuement-apply":36,"imbuement-clear":37,"imbuement-open":38,"forge-open":177,"forge-convert":178,"forge-fuse":179,"forge-transfer":180,"request-forge-history":181,"leave-hunt":39,"leave-sandbox":40,"leave-training":41,logout:42,"loot-take":43,"market-accept-offer":44,"market-browse":45,"market-cancel-offer":46,"market-close":47,"market-create-offer":48,"market-my-history":49,"market-my-offers":50,"market-open":51,"mount-buy":52,"move-item":53,"party-finder-leave":132,"party-finder-queue":133,"party-finder-respond":134,"party-invite":54,"party-invite-name":55,"party-leave":56,"party-respond":57,ping:58,"prey-bonus-reroll":59,"prey-list-reroll":60,"prey-option":61,"prey-pick":62,"prey-select-mode":63,"private-message":64,"quick-sell-configure":65,"reset-hunt-bests":66,revive:67,"rmt-browse":155,"rmt-buy-offer":157,"rmt-cancel-offer":158,"rmt-close":154,"rmt-create-offer":156,"rmt-my-history":160,"rmt-my-offers":159,"rmt-open":153,"rmt-submit-signed":161,"rmt-withdraw":182,"forge-auto-convert":183,"sandbox-clone-character":68,"sandbox-give-item":69,"sandbox-search-characters":70,"sandbox-set-level":71,"sandbox-spawn-hazard":72,"sandbox-spawn-monsters":73,"save-action-bar-preset":74,say:75,"select-action-bar-preset":76,"select-ammo":77,"set-action-slot":78,"set-auto-loot":79,"set-hunt-exit-rules":80,"set-idle-training":171,"set-hunt-favorites":173,"set-outfit":81,"set-sell-lock":82,"set-window-layout":83,"shop-buy":84,"shop-open":85,"shop-quick-sell":86,"shop-sell":88,"start-hunt":89,"submit-review":108,"store-buy":90,"store-history-request":129,"store-open":91,"trade-add-item":92,"trade-cancel":93,"trade-confirm":94,"trade-ready":95,"trade-remove-item":96,"trade-request":97,"trade-respond":98,"trade-set-gold":99,"transfer-respond":100,"tutorial-hint-seen":101,"tutorial-weapon":102,"vip-add":103,"vip-remove":104,walk:105,"walk-stop":106,"walk-to":107,"submit-ticket":112,"start-training":113,"ticket-history-request":114,"coins-refresh":119,"set-action-bar-managed":116,"sort-action-bar":117,"clear-action-bar":120,"chat-report":118,"raid-enter":121,"poll-answers":122,"buy-stamina":123,"set-analyzer-value":124,"set-hunt-sell-rules":125,"alerts-open":126,"alerts-set":127,"alerts-unlink":128,"change-hunt":131,"party-costs-offer":135,"party-costs-respond":136,"party-costs-cancel":137,"daily-boss-open":138,"daily-boss-create":139,"daily-boss-join":140,"daily-boss-leave":141,"daily-boss-kick":142,"daily-boss-invite":143,"daily-boss-ready":144,"daily-boss-start":145,"daily-boss-say":146,"daily-boss-revive":147,"daily-boss-claim":148,"death-film-request":149,"daily-boss-stand-up":150,"party-kick":151,"party-kick-respond":152,"bestiary-unlock":162,"dps-breakdown-watch":163,"quest-pick":164,"quest-claim":165,"import-action-bar":166,"request-action-bar-preset":167,"daily-boss-presets":168,"set-loot-destination":169,"request-death-history":170,"party-follow-leader":172,"daily-boss-tier":174,"daily-boss-rules":175,"set-ammo-rules":176,"guild-set-recruitment":184,"guild-apply":185,"guild-application-withdraw":186,"guild-application-respond":187,"valuables-open":188,"valuables-buy":189,"set-jewel-rules":190,"proficiency-choose":191,"proficiency-clear":192,"set-offline-training-skill":193,"outfit-addon-inspect":194,"outfit-addon-unlock":195,"guild-chat-history-request":196,"guild-perk-reroll":198,"guild-items-reroll":199,"guild-bank-deposit-gold":200,"guild-bank-deposit-items":201,"guild-slot-fund":203,"guild-altar-commit":204,"guild-altar-unlock":205,"party-pass-leader":206,"boss-route-cancel":207,"account-chest":208,"bosstiary-request":209,"daily-boss-stars":210,"daily-boss-privacy":211,"mount-unlock-inspect":212,"wheel-save":213,"wheel-reset":214,"sandbox-wheel-full":215};
const CLIENT_NAMES = new Map(Object.entries(CLIENT_CODES).map(([name, code]) => [code, name]));
const XOR_KEY = 1213550164;
const SKILLS = ['fist', 'club', 'sword', 'axe', 'distance', 'shielding', 'fishing'];
const EQUIPMENT = ['helmet', 'amulet', 'weapon', 'armor', 'shield', 'ring', 'legs', 'boots', 'ammo', 'backpack'];

function transform(bytes, seed) {
  let state = (seed ^ XOR_KEY) >>> 0;
  if (!state) state = XOR_KEY;
  for (let i = 0; i < bytes.length; i += 4) {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5; state >>>= 0;
    for (let j = 0; j < 4 && i + j < bytes.length; j++) bytes[i + j] ^= (state >>> (j * 8)) & 255;
  }
  return bytes;
}

function encodeMessage(message, codes = SERVER_CODES) {
  if (!Number.isInteger(codes[message.type])) throw new Error(`Unknown message ${message.type}`);
  const {type, ...body} = message;
  const payload = Buffer.from(JSON.stringify([codes[type], body]));
  const seed = crypto.randomBytes(4).readUInt32LE(0);
  const result = Buffer.alloc(5 + payload.length);
  result.writeUInt32LE(seed, 0);
  payload.copy(result, 5);
  transform(result.subarray(4), seed);
  return result;
}

function decodeMessage(input, names = CLIENT_NAMES) {
  const buffer = Buffer.from(input);
  if (buffer.length < 5 || buffer.length > 4 * 1024 * 1024) return null;
  const clear = transform(Buffer.from(buffer.subarray(4)), buffer.readUInt32LE(0));
  if (clear[0] & ~1) return null;
  try {
    const bytes = clear[0] === 1 ? zlib.inflateRawSync(clear.subarray(1), {maxOutputLength:4 * 1024 * 1024}) : clear.subarray(1);
    const [opcode, body] = JSON.parse(bytes.toString('utf8'));
    const type = names.get(opcode);
    return type && body && typeof body === 'object' && !Array.isArray(body) ? {...body, type} : null;
  } catch { return null; }
}

function frame(payload, opcode = 2) {
  const length = payload.length;
  const header = Buffer.alloc(length < 126 ? 2 : length <= 65535 ? 4 : 10);
  header[0] = 0x80 | opcode;
  if (length < 126) header[1] = length;
  else if (length <= 65535) { header[1] = 126; header.writeUInt16BE(length, 2); }
  else { header[1] = 127; header.writeBigUInt64BE(BigInt(length), 2); }
  return Buffer.concat([header, payload]);
}

function attachWebSocket(socket, onMessage, onClose, initial = Buffer.alloc(0)) {
  let pending = Buffer.alloc(0), fragments = [], fragmentOpcode = null, fragmentLength = 0;
  const send = message => { if (!socket.destroyed) socket.write(frame(encodeMessage(message))); };
  const read = chunk => {
    pending = Buffer.concat([pending, chunk]);
    if(pending.length>4194304+14)return socket.destroy();
    while (pending.length >= 2) {
      const first = pending[0], masked = !!(pending[1] & 128);
      let size = pending[1] & 127, cursor = 2;
      if (size === 126) { if (pending.length < 4) return; size = pending.readUInt16BE(2); cursor = 4; }
      else if (size === 127) { if (pending.length < 10) return; const large = pending.readBigUInt64BE(2); if (large > 4194304n) return socket.destroy(); size = Number(large); cursor = 10; }
      if (!masked || (first & 0x70) || size > 4194304) return socket.destroy();
      if (pending.length < cursor + 4 + size) return;
      const mask = pending.subarray(cursor, cursor + 4); cursor += 4;
      const body = Buffer.from(pending.subarray(cursor, cursor + size));
      for (let i = 0; i < size; i++) body[i] ^= mask[i & 3];
      pending = pending.subarray(cursor + size);
      const opcode = first & 15;
      if(opcode>=8&&(!(first&128)||size>125))return socket.destroy();
      if (opcode === 8) { socket.end(frame(body.subarray(0, 125), 8)); return; }
      if (opcode === 9) { socket.write(frame(body, 10)); continue; }
      if (opcode === 10) continue;
      if (opcode === 1 || opcode === 2) { if(fragmentOpcode!==null)return socket.destroy();fragments = [body]; fragmentOpcode = opcode;fragmentLength=size; }
      else if (opcode === 0 && fragmentOpcode !== null) {fragments.push(body);fragmentLength+=size;}
      else return socket.destroy();
      if(fragmentLength>4194304)return socket.destroy();
      if (first & 128) {
        const message = decodeMessage(Buffer.concat(fragments));
        fragments = []; fragmentOpcode = null;fragmentLength=0;
        if (message) onMessage(message, send);
      }
    }
  };
  socket.on('data', read);
  socket.on('close', onClose);
  socket.on('error', () => {});
  if (initial.length) queueMicrotask(() => read(initial));
  return send;
}

const skillObject = value => Object.fromEntries(SKILLS.map(skill => [skill, value]));
function item(uid, itemId, name, slot, extra = {}) {
  return {uid, itemId, name, count:1, attack:0, defense:0, armor:0, slot, weight:0, ...extra};
}
function newCharacter(id, name) {
  return {id, name, level:5, vocation:null, outfitId:128, outfitColors:{head:78,body:88,legs:58,feet:76}, outfitAddons:0, lastSeenAt:Date.now(), experience:340, gold:240, health:170, mana:75};
}

// Read only identifiers/names and the public market category from the protobuf
// appearance metadata. It does not contain authoritative equipment combat stats
// or monster names. No executable source or network access is involved.
function appearanceMetadata(directory) {
  const items=new Map(), byName=new Map();
  function* fields(buffer){
    let position=0;
    const integer=()=>{let result=0,shift=0;for(let count=0;count<5;count++){if(position>=buffer.length)throw new Error('Truncated protobuf');const byte=buffer[position++];result|=(byte&127)<<shift;if(!(byte&128))return result>>>0;shift+=7;}throw new Error('Invalid protobuf varint');};
    while(position<buffer.length){
      const tag=integer(),wire=tag&7,number=tag>>>3;let value;
      if(wire===0)value=integer();
      else if(wire===2){const size=integer();if(position+size>buffer.length)throw new Error('Truncated protobuf field');value=buffer.subarray(position,position+size);position+=size;}
      else if(wire===1)position+=8;
      else if(wire===5)position+=4;
      else throw new Error('Unsupported protobuf field');
      if(position>buffer.length)throw new Error('Truncated protobuf fixed field');
      yield {number,wire,value};
    }
  }
  try{
    const file=fs.readdirSync(directory).find(name=>/^appearances-.*\.dat$/.test(name));
    if(!file)return {items,byName};
    for(const record of fields(fs.readFileSync(path.join(directory,file)))){
      if(record.number!==1||record.wire!==2)continue;
      const item={};
      for(const field of fields(record.value)){
        if(field.number===1&&field.wire===0)item.itemId=field.value;
        else if(field.number===4&&field.wire===2)item.name=field.value.toString('utf8');
        else if(field.number===3&&field.wire===2){
          for(const flag of fields(field.value))if(flag.number===36&&flag.wire===2){
            for(const market of fields(flag.value)){
              if(market.number===1&&market.wire===0)item.category=market.value;
              if(market.number===2&&market.wire===0)item.tradeAs=market.value;
            }
          }
        }
      }
      if(!Number.isInteger(item.itemId)||!item.name)continue;
      items.set(item.itemId,item);
      const key=item.name.toLowerCase(),current=byName.get(key);
      if(!current||(item.category!==undefined&&current.category===undefined))byName.set(key,item);
    }
  }catch(error){console.error('Appearance metadata unavailable:',error.message);}
  return {items,byName};
}

// Labels come from Wa and the pt-BR dictionary in the captured public client.
// In particular a category never supplies a missing equipment slot.
const ITEM_CATEGORY_LABELS=new Map([
  [1,'Armors'],[2,'Amulets'],[3,'Boots','Botas'],[4,'Containers'],[5,'Decoration'],[6,'Food'],[7,'Helmets & Hats'],[8,'Legs','Pernas'],[9,'Others','Outros'],[10,'Potions','Poções'],[11,'Rings'],[12,'Runes','Runas'],[13,'Shields'],[14,'Tools'],[15,'Valuables','Valiosos'],[16,'Ammunition'],[17,'Axes'],[18,'Clubs'],[19,'Distance Weapons'],[20,'Swords'],[21,'Wands & Rods'],[24,'Creature Products','Produtos de criatura'],[25,'Quivers']
].flatMap(([id,...labels])=>labels.map(label=>[label,id])));
const ITEM_SLOT_LABELS=new Map(EQUIPMENT.flatMap(slot=>[[slot,slot],[({helmet:'elmo',amulet:'amuleto',weapon:'arma',armor:'armadura',shield:'escudo',ring:'anel',legs:'pernas',boots:'botas',ammo:'munição',backpack:'mochila'})[slot],slot]]));
const ITEM_STAT_FIELDS=['attack','defense','armor'];
const ITEM_OPTIONAL_FIELDS=['weight','range','speedBonus','elementalDamage','elementalType','classification','twoHanded','protection'];
const ITEM_CHIP_FIELDS={Atk:'attack',Atq:'attack',Def:'defense',Arm:'armor',Range:'range',Alcance:'range',Speed:'speedBonus',Velocidade:'speedBonus'};
const ITEM_ELEMENTS=new Set(['fire','ice','energy','earth','death','holy','lifedrain','manadrain']);
const sameItemName=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.trim().toLowerCase()===b.trim().toLowerCase();

function priorTooltipFields(record){
  if(typeof record.tooltip!=='string')return null;
  const text=record.tooltip.split(/\btext EQUIPADO\b/)[0],fields={};
  if(!text.split('\n').includes('text '+record.name))return null;
  for(const [field,label] of Object.entries({attack:'Ataque',defense:'Defesa',armor:'Armadura',range:'Alcance',classification:'Classificação'})){
    const match=text.match(new RegExp('(?:^|\\n)text '+label+': ([0-9]+)(?:\\n|$)'));
    if(match)fields[field]=Number(match[1]);
  }
  const weight=text.match(/(?:^|\n)text ([0-9]+)(?:[.,]([0-9]{1,2}))? oz(?:\n|$)/);
  if(weight)fields.weight=Number(weight[1])*100+Number((weight[2]||'').padEnd(2,'0'));
  if(/(?:^|\n)text Duas mãos(?:\n|$)/.test(text))fields.twoHanded=true;
  const elemental=text.match(/(?:^|\n)text Dano de (Terra|Fogo|Gelo|Energia): \+([0-9]+)(?:\n|$)/);
  if(elemental){fields.elementalDamage=Number(elemental[2]);fields.elementalType={Terra:'earth',Fogo:'fire',Gelo:'ice',Energia:'energy'}[elemental[1]];}
  for(const [field,value] of Object.entries(fields))if(typeof value==='number'&&!Number.isSafeInteger(value))delete fields[field];
  if(!Object.hasOwn(fields,'elementalDamage'))delete fields.elementalType;
  return fields;
}

function observedItemCatalog(directory,appearances,priorTooltips){
  const capture={file:'item-catalog-observed-current.json',expectedItems:1070,expectedPages:134,capturedItems:0,capturedPages:0,complete:false,reasons:[],observedFields:{},listObservedFields:{},retainedTooltips:0};
  const result={items:null,fields:[],conflicts:[],invalid:[],capture};
  let currentId=null;
  const check=(condition,reason)=>{if(!condition)throw new Error(reason);};
  try{
    const bytes=fs.readFileSync(path.join(directory,capture.file));
    capture.sha256=crypto.createHash('sha256').update(bytes).digest('hex');
    const source=JSON.parse(bytes.toString('utf8')),records=source.records;
    capture.capturedItems=Array.isArray(records)?records.length:0;
    capture.capturedPages=source.completeness?.capturedPages||0;
    capture.capturedFrom=source.capturedFrom;capture.capturedThrough=source.capturedThrough;
    check(source.captureType==='item-catalog-observed-current'&&source.source?.captureType==='item-catalog-page','Wrong item capture type');
    check(source.completeness?.complete===true&&source.completeness.expectedItems===1070&&source.completeness.capturedItems===1070&&source.completeness.expectedPages===134&&source.completeness.capturedPages===134,'Item capture is incomplete');
    check(Array.isArray(source.completeness.pages)&&source.completeness.pages.length===134&&source.completeness.pages.every((page,index)=>page===index+1)&&Array.isArray(source.completeness.missingPages)&&source.completeness.missingPages.length===0,'Item page coverage is incomplete');
    check(Array.isArray(source.source.blocks)&&source.source.blocks.length>=134&&source.source.blocks.every(block=>Number.isSafeInteger(block.page)&&block.page>=1&&block.page<=134&&typeof block.capturedAt==='string'&&Number.isFinite(Date.parse(block.capturedAt))&&block.url==='https://huntera.com.br/game')&&new Set(source.source.blocks.map(block=>block.page)).size===134,'Item page provenance is incomplete');
    check(Array.isArray(records)&&records.length===1070,'Expected exactly 1070 item records');
    check(Array.isArray(source.validation?.unparsedFields)&&source.validation.unparsedFields.length===0,'Unparsed item fields remain');
    const seen=new Set(),pages=new Map(),observed=[];
    for(const record of records){
      currentId=record?.itemId;
      check(Number.isSafeInteger(currentId)&&currentId>0&&!seen.has(currentId),'Invalid or repeated item ID');seen.add(currentId);
      check(typeof record.name==='string'&&record.name.length>0&&record.name===record.name.trim(),'Invalid item name');
      check(Number.isSafeInteger(record.sourcePage)&&record.sourcePage>=1&&record.sourcePage<=134,'Invalid item source page');
      pages.set(record.sourcePage,(pages.get(record.sourcePage)||0)+1);
      const raw=record.raw;
      check(raw&&raw.itemId===currentId&&raw.name===record.name&&['identityRaw','descriptionRaw','weightRaw','moreRaw'].every(field=>typeof raw[field]==='string')&&Array.isArray(raw.chipsRaw)&&Array.isArray(raw.dropSources),'Invalid raw item evidence');
      check(Array.isArray(record.unparsedFields)&&record.unparsedFields.length===0,'Item contains unparsed fields');
      const identity=raw.identityRaw.trim().split(/\s+—\s+/),label=identity[0],slotLabel=identity.length===2?identity[1]:null;
      check(identity.length<=2&&ITEM_CATEGORY_LABELS.has(label)&&record.categoryLabel===label&&record.slotLabel===slotLabel,'Unknown or inconsistent category/slot label');
      check(slotLabel===null||ITEM_SLOT_LABELS.has(slotLabel),'Unknown equipment slot label');
      const fields={name:record.name,category:ITEM_CATEGORY_LABELS.get(label)};
      if(slotLabel!==null)fields.slot=ITEM_SLOT_LABELS.get(slotLabel);
      const chips=new Set();
      for(const chip of raw.chipsRaw){
        check(chip&&typeof chip.term==='string'&&typeof chip.value==='string','Invalid item chip');
        const field=Object.hasOwn(ITEM_CHIP_FIELDS,chip.term.trim())?ITEM_CHIP_FIELDS[chip.term.trim()]:null;
        check(field&&!chips.has(field),'Unknown or repeated item chip');chips.add(field);
        const value=field==='speedBonus'&&/^\+-[0-9]+$/.test(chip.value.trim())?chip.value.trim().slice(1):chip.value.trim();
        const match=(field==='attack'?/^([+]?[0-9]+)(?:\s+\+([0-9]+)\s+(.+))?$/:field==='speedBonus'?/^([+-]?[0-9]+)$/:/^([+]?[0-9]+)$/).exec(value);
        check(match&&Number.isSafeInteger(Number(match[1])),'Invalid observed item stat');fields[field]=Number(match[1]);
        if(match[2]!==undefined){check(Number.isSafeInteger(Number(match[2]))&&ITEM_ELEMENTS.has(match[3]),'Invalid elemental damage');fields.elementalDamage=Number(match[2]);fields.elementalType=match[3];}
      }
      if(raw.weightRaw.trim()){
        const weight=/(?:^|[^0-9.,])([0-9]+)(?:[.,]([0-9]{1,2}))?\s*oz\s*$/.exec(raw.weightRaw.trim());
        check(weight,'Invalid observed item weight');fields.weight=Number(weight[1])*100+Number((weight[2]||'').padEnd(2,'0'));
        check(Number.isSafeInteger(fields.weight)&&fields.weight>=0,'Invalid observed item weight');
      }
      for(const field of [...ITEM_STAT_FIELDS,'range','speedBonus','elementalDamage'])check(record[field]===(fields[field]??null),'Normalized stat disagrees with raw evidence: '+field);
      check(record.elementalTypeLabel===(fields.elementalType??null)&&record.weightHundredths===(fields.weight??null)&&record.weightOz===(fields.weight===undefined?null:fields.weight/100),'Normalized element/weight disagrees with raw evidence');
      check(record.twoHanded===null&&record.classification===null&&record.protections===null,'List capture contains unobserved tooltip fields');
      check(raw.dropSources.length<=5&&raw.dropSources.every(drop=>drop&&typeof drop.name==='string'&&drop.name.length>0&&(typeof drop.monsterId==='string'&&drop.monsterId.length>0||Number.isSafeInteger(drop.monsterId)&&drop.monsterId>0)),'Invalid visible drop source');
      observed.push({itemId:currentId,sourcePage:record.sourcePage,fields});
    }
    currentId=null;
    check(pages.size===134&&[...pages].every(([page,count])=>count===(page===134?6:8)),'Item records do not cover all page ranges');
    const items=new Map();
    for(const observedItem of observed){
      const {itemId,sourcePage,fields}=observedItem,provenance=Object.fromEntries(Object.keys(fields).map(field=>[field,'item-list-dom']));
      for(const field of Object.keys(fields))capture.listObservedFields[field]=(capture.listObservedFields[field]||0)+1;
      const metadata=appearances.items.get(itemId);
      if(metadata){
        if(!sameItemName(metadata.name,fields.name))result.conflicts.push({itemId,source:'appearance-metadata',field:'name',observed:fields.name,previous:metadata.name});
        if(Number.isFinite(metadata.category)&&metadata.category!==fields.category)result.conflicts.push({itemId,source:'appearance-metadata',field:'category',observed:fields.category,previous:metadata.category});
      }
      const prior=priorTooltips.get(itemId);
      let handednessDisplayed=null;
      if(prior){
        const conflicts=[];
        if(!sameItemName(prior.name,fields.name))conflicts.push({field:'name',observed:fields.name,previous:prior.name});
        if(prior.category!==fields.category)conflicts.push({field:'category',observed:fields.category,previous:prior.category});
        for(const [field,value] of Object.entries(prior.fields))if(Object.hasOwn(fields,field)&&fields[field]!==value)conflicts.push({field,observed:fields[field],previous:value});
        if(conflicts.length)result.conflicts.push(...conflicts.map(conflict=>({itemId,source:'prior-tooltip',...conflict})));
        else{
          handednessDisplayed=prior.handednessDisplayed;
          let supplemented=false;
          for(const [field,value] of Object.entries(prior.fields))if(!Object.hasOwn(fields,field)){fields[field]=value;provenance[field]='prior-tooltip';supplemented=true;}
          if(supplemented)capture.retainedTooltips++;
        }
      }
      const unknownFields=['slot',...ITEM_STAT_FIELDS,...ITEM_OPTIONAL_FIELDS].filter(field=>!Object.hasOwn(fields,field));
      const neutralTransportFields=ITEM_STAT_FIELDS.filter(field=>unknownFields.includes(field));
      const entry={itemId,name:fields.name,category:fields.category,slot:fields.slot??null,attack:fields.attack??0,defense:fields.defense??0,armor:fields.armor??0};
      for(const field of ITEM_OPTIONAL_FIELDS)if(Object.hasOwn(fields,field))entry[field]=fields[field];
      items.set(itemId,entry);result.fields.push({itemId,sourcePage,unknownFields,neutralTransportFields,provenance,handednessDisplayed});
      for(const field of Object.keys(provenance))capture.observedFields[field]=(capture.observedFields[field]||0)+1;
    }
    result.items=items;capture.complete=true;
  }catch(error){capture.reasons.push(error.message);result.invalid.push({itemId:currentId,reason:error.message});}
  return result;
}

function createBackend(options = {}) {
  const dataDir = options.dataDir || path.join(__dirname, 'data');
  const stateFile = options.stateFile || path.join(dataDir, 'local-state.json');
  const readJson = (name, fallback) => { try { return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8')); } catch { return fallback; } };
  const facts = readJson('game-data.json', {});
  const additions = readJson('new-hunts-normalized-20261019.json', {});
  const observedMonsters = [...readJson('bestiary.json', []),...(additions.creatures||[])];
  const bestiaryRecords=readJson('bestiary-records.json',[]);
  const equipmentRecords=readJson('equipment-observed.json',[]);
  const currentHuntCapture=readJson('hunts-observed-current.json',{});
  const currentHuntRecords=currentHuntCapture.records||[];
  const currentBestiaryLootCapture=readJson('bestiary-loot-observed-current.json',{});
  const appearances=appearanceMetadata(path.join(__dirname,'public','things','1332'));
  // This is the public gate preview terrain, not a capture of the server's
  // main-city terrain. Reuse its original coordinates and declared eye.
  const publicCityTerrain=(()=>{try{return JSON.parse(fs.readFileSync(path.join(__dirname,'public','assets','gate','temple-terrain.json'),'utf8'));}catch{return null;}})();
  const saved = options.memory ? null : (() => { try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return null; } })();
  const state = saved && Array.isArray(saved.characters) ? saved : {characters:[newCharacter(1, 'Chatzinhogp')], nextId:2};
  const sessions = new Set();
  let nextUid = Number.isSafeInteger(state.nextUid)&&state.nextUid>=1000?state.nextUid:1000;
  const allItems=[];
  for(const character of state.characters){
    const inv=character.inventory;
    if(inv)allItems.push(...(inv.slots||[]),...(inv.satchel||[]),...Object.values(inv.equipment||{}));
  }
  for(const entry of allItems)if(Number.isSafeInteger(entry?.uid))nextUid=Math.max(nextUid,entry.uid+1);
  function allocateUid(){state.nextUid=nextUid+1;return nextUid++;}
  const seenUids=new Set();
  for(const entry of allItems){
    if(!entry)continue;
    if(!Number.isSafeInteger(entry.uid)||seenUids.has(entry.uid))entry.uid=allocateUid();
    seenUids.add(entry.uid);
    // Repair only the known initial local seed IDs; retain the assigned uid.
    if(entry.name==='cheese'&&entry.itemId===3577)entry.itemId=3607;
    if(entry.name==='sabre'&&entry.itemId===3274)entry.itemId=3273;
  }
  function persist() { if (options.memory) return; fs.mkdirSync(dataDir, {recursive:true}); fs.writeFileSync(stateFile, JSON.stringify(state, null, 2)); }
  function inventory(character) {
    if (!character.inventory) character.inventory = {
      slots:[item(allocateUid(), 3607, 'cheese', null, {count:23}), item(allocateUid(), 3031, 'gold coin', null, {count:240})],
      satchel:[], equipment:{...Object.fromEntries(EQUIPMENT.map(slot => [slot, null])), weapon:item(allocateUid(), 3273, 'sabre', 'weapon', {attack:12, defense:10, attackSkill:'sword'}), armor:item(allocateUid(), 3361, 'leather armor', 'armor', {armor:4}), backpack:item(allocateUid(), 2854, 'backpack', 'backpack', {weight:18})}
    };
    return character.inventory;
  }
  const observedByName = new Map(observedMonsters.map(monster => [monster.name.toLowerCase(), monster]));
  // Outfit IDs for the first hunt are public Tibia-compatible appearance IDs.
  const earlyOutfits = {'rat':21,'spider':30,'troll':15,'swamp troll':76,'orc':5,'skeleton':33,'rotworm':26,'dwarf':69,'minotaur':25,'dragon':34};
  const huntFacts = Array.isArray(facts.hunts) && facts.hunts.length ? facts.hunts : [{id:'rat-hunt',name:'Rat Cellars',monsters:['Rat']}];
  for(const extra of additions.hunts||[]){
    const id=extra.name==='Netherworld'?'netherworld-hunt':extra.name==='Nimmersatt Dragons'?'nimmersatt-dragons-hunt':null;
    if(!id||huntFacts.some(hunt=>hunt.id===id))continue;
    const before=extra.name==='Netherworld'?'summer-court-hunt':'energy-library-hunt';
    const index=huntFacts.findIndex(hunt=>hunt.id===before);
    huntFacts.splice(index<0?huntFacts.length:index,0,{id,name:extra.name,monsters:extra.catalogCreatureNames});
  }
  const hunts = huntFacts.map(hunt => ({id:hunt.id,name:hunt.name,description:'',monsters:(hunt.monsters||['Rat']).map(name => ({name,outfitId:earlyOutfits[name.toLowerCase()]||0,bestiaryId:name.toLowerCase().replace(/[^a-z0-9]+/g,'-')})),loot:[],tiers:['Não observado'].map(name=>({name,monsterCount:0,monsterIndexes:[],loot:[]}))}));
  const ratHunt=hunts.find(hunt=>hunt.id==='rat-hunt');
  if(ratHunt){
    ratHunt.description='Porões úmidos cheios de ratos. A clássica primeira caçada.';
    ratHunt.loot=[{...item(0,3607,'cheese',null),rarity:'common'},{...item(0,3031,'gold coin',null),rarity:'common'}];
    ratHunt.tiers=['Cauteloso','Ousado','Agressivo'].map(name=>({name,monsterCount:0,monsterIndexes:[],loot:[]}));
  }
  const speciesId=name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const killsRequired=new Map();
  for(const record of bestiaryRecords){const match=record.text?.match(/PROGRESSO DA FASE ATUAL\s*\d[\d.]* \/ ([\d.]+) abates/);if(match)killsRequired.set(record.name,Number(match[1].replace(/\./g,'')));}
  // Each of these six observed 19 October snapshots explicitly displayed the
  // same 0 / 2.500 first-stage requirement; do not apply it to unknown species.
  for(const name of ['Flimsy Lost Soul','Mean Lost Soul','Freakish Lost Soul','Dragolisk','Mega Dragon','Wardragon'])killsRequired.set(name,2500);
  const classNames={ANFIBIO:'Amphibic',AQUATICO:'Aquatic',AVE:'Bird',CONSTRUCTO:'Construct',DEMONIO:'Demon',DRAGAO:'Dragon',ELEMENTAL:'Elemental',FADA:'Fey',GIGANTE:'Giant',HUMANO:'Human',HUMANOIDE:'Humanoid',LICANTROPO:'Lycanthrope',MAGICO:'Magical',MAMIFERO:'Mammal',PLANTA:'Plant',REPTIL:'Reptile',GOSMA:'Slime','MORTO-VIVO':'Undead',VERME:'Vermin','EXTRA DIMENSIONAL':'Extra Dimensional'};
  const catalogEvidence={unknownOutfits:[],unknownLootAssociations:[],omittedMonsters:[],omittedItems:[],unresolvedHuntLoot:[],unknownLootItemStats:[],unknownLootItemCategories:[],observedHunts:[],missingObservedHunts:[],missingObservedPulls:[],unknownTierCounts:[],huntCapture:{observedAt:currentHuntCapture.observedAt,clientObserved:currentHuntCapture.clientObserved,method:currentHuntCapture.method},equipmentStatSource:'Captured tooltip before EQUIPADO comparison; omitted positive tooltip stats represented by neutral zero, matching captured display.',monsterStatSource:'bestiary.json + six observed additions',outfitZero:'Unknown appearance; placeholder 0 is not a recovered monster outfit.',lootStatsZero:'For observed loot without a captured tooltip, combat zeros are neutral transport placeholders required by the original schema, not recovered item stats.',tierCountZero:'Unknown monsterCount uses 0 only to satisfy the original numeric wire schema; no visible client code consumes this field.'};
  Object.assign(catalogEvidence,{
    observedBestiaryLoot:[],invalidBestiaryLootRecords:[],unusedBestiaryLootRecords:[],unknownBestiaryLootAppearances:[],bestiaryLootItemsOutsideItemCatalog:[],
    bestiaryLootCapture:{file:'bestiary-loot-observed-current.json',observedAt:currentBestiaryLootCapture.observedAt,clientObserved:currentBestiaryLootCapture.clientObserved,method:currentBestiaryLootCapture.method,complete:false,lootEntries:0,maxNotes:0},
    monsterLootSource:'Direct rendered Bestiary loot per species, preserving visual order, repeated items, rarity and optional observed maximum. No association inferred from hunt loot and no drop formula recovered.'
  });
  const bestiaryLootByName=new Map(),conflictingLootNames=new Set();
  const bestiaryRarities=new Set(['common','uncommon','semi-rare','rare','very-rare']);
  for(const record of Array.isArray(currentBestiaryLootCapture.records)?currentBestiaryLootCapture.records:[]){
    const valid=record&&typeof record.name==='string'&&record.name.length>0&&Array.isArray(record.loot)&&(record.loot.length>0?record.emptyMessage===null:typeof record.emptyMessage==='string'&&record.emptyMessage.trim().length>0)&&record.loot.every(entry=>entry&&Number.isSafeInteger(entry.itemId)&&entry.itemId>0&&bestiaryRarities.has(entry.rarity)&&(!Object.hasOwn(entry,'max')||(Number.isSafeInteger(entry.max)&&entry.max>0)));
    if(!valid){catalogEvidence.invalidBestiaryLootRecords.push({name:record?.name??null,reason:'Invalid name, loot identity, rarity or maximum'});continue;}
    if(bestiaryLootByName.has(record.name)||conflictingLootNames.has(record.name)){
      bestiaryLootByName.delete(record.name);conflictingLootNames.add(record.name);
      catalogEvidence.invalidBestiaryLootRecords.push({name:record.name,reason:'Repeated species record; no version selected'});continue;
    }
    bestiaryLootByName.set(record.name,record);
  }
  const catalogMonsters=[];
  for(const record of observedMonsters){
    const bestiaryClass=classNames[record.category?.normalize('NFD').replace(/[\u0300-\u036f]/g,'')];
    const required=killsRequired.get(record.name);
    if(!bestiaryClass||![record.hp,record.experience,record.speed,record.meleeMin,record.meleeMax,record.attackIntervalMs,required].every(Number.isFinite)){catalogEvidence.omittedMonsters.push(record.name);continue;}
    const specific=(facts.creatures||[]).find(creature=>creature.name===record.name);
    const directLoot=bestiaryLootByName.get(record.name);
    const loot=directLoot?directLoot.loot.map(entry=>({itemId:entry.itemId,rarity:entry.rarity,...(Object.hasOwn(entry,'max')?{max:entry.max}:{})})):(specific?.loot||[]).map(entry=>{const appearance=appearances.byName.get(entry.name.toLowerCase());return appearance?{itemId:appearance.itemId,rarity:entry.rarity}:null;}).filter(Boolean);
    if(directLoot)catalogEvidence.observedBestiaryLoot.push(record.name);
    // Captured bestiary values are damage taken (%). The original UI's bc()
    // renders 100 - elements[channel], so the wire field is resistance (%).
    const elements=Object.fromEntries(Object.entries(record.resistances||{}).map(([channel,value])=>[channel.toLowerCase(),100-value]));
    // The 1,280 public outfit records have no names. Use a visibly absent
    // appearance for unobserved matches rather than assigning rat portraits.
    const outfitId=record.name==='Rat'?21:0;
    if(!outfitId)catalogEvidence.unknownOutfits.push(record.name);
    if(!directLoot&&!specific?.loot)catalogEvidence.unknownLootAssociations.push(record.name);
    catalogMonsters.push({id:speciesId(record.name),name:record.name,bestiaryClass,outfitId,maxHealth:record.hp,experience:record.experience,speed:record.speed,attack:{min:record.meleeMin,max:record.meleeMax,intervalMs:record.attackIntervalMs},elements,loot,killsRequired:required});
  }
  const catalogMonsterNames=new Set(catalogMonsters.map(record=>record.name));
  catalogEvidence.unusedBestiaryLootRecords=[...bestiaryLootByName.keys()].filter(name=>!catalogMonsterNames.has(name));
  catalogEvidence.bestiaryLootCapture.complete=currentBestiaryLootCapture.completeness?.complete===true&&catalogEvidence.observedBestiaryLoot.length===catalogMonsters.length&&catalogMonsters.length===192&&catalogEvidence.invalidBestiaryLootRecords.length===0&&catalogEvidence.unusedBestiaryLootRecords.length===0;
  const directlyObservedMonsters=catalogMonsters.filter(record=>bestiaryLootByName.has(record.name));
  catalogEvidence.bestiaryLootCapture.capturedSpecies=directlyObservedMonsters.length;
  catalogEvidence.bestiaryLootCapture.lootEntries=directlyObservedMonsters.reduce((sum,record)=>sum+record.loot.length,0);
  catalogEvidence.bestiaryLootCapture.maxNotes=directlyObservedMonsters.reduce((sum,record)=>sum+record.loot.filter(entry=>Object.hasOwn(entry,'max')).length,0);
  let catalogItems=new Map();
  const priorTooltips=new Map();
  const categorySlots={1:'armor',2:'amulet',3:'boots',4:'backpack',7:'helmet',8:'legs',11:'ring',13:'shield',16:'ammo',17:'weapon',18:'weapon',19:'weapon',20:'weapon',21:'weapon',25:'shield'};
  for(const record of equipmentRecords){
    const metadata=appearances.byName.get(record.name.toLowerCase());
    if(!metadata||!Number.isFinite(metadata.category)){catalogEvidence.omittedItems.push(record.name);continue;}
    const text=(record.tooltip||'').split(/\btext EQUIPADO\b/)[0];
    const number=label=>{const match=text.match(new RegExp(label+': ([0-9]+)'));return match?Number(match[1]):0;};
    const entry={itemId:metadata.itemId,name:record.name,category:metadata.category,attack:number('Ataque'),defense:number('Defesa'),armor:number('Armadura'),slot:categorySlots[metadata.category]||null};
    const range=number('Alcance');if(range)entry.range=range;
    const weight=text.match(/(?:text )([0-9]+(?:\.[0-9]+)?) oz/);if(weight)entry.weight=Math.round(Number(weight[1])*100);
    const classification=number('Classifica\u00e7\u00e3o');if(classification)entry.classification=classification;
    if(text.includes('Duas mãos'))entry.twoHanded=true;
    else if(text.includes('Uma mão'))entry.twoHanded=false;
    const explicitFields=priorTooltipFields(record);
    if(explicitFields&&Object.keys(explicitFields).length)priorTooltips.set(entry.itemId,{name:record.name,category:entry.category,fields:explicitFields,handednessDisplayed:/(?:^|\n)text Duas mãos(?:\n|$)/.test(text)?'two-handed':/(?:^|\n)text Uma mão(?:\n|$)/.test(text)?'one-handed':null});
    catalogItems.set(entry.itemId,entry);
  }
  for(const entry of facts.ammunition||[])catalogItems.set(entry.itemId,{itemId:entry.itemId,name:entry.name,category:16,attack:entry.attack,defense:0,armor:0,slot:'ammo'});
  // Potions and runes have no direct weapon/armour stats in this schema. Their
  // restoration/spell formulas stay in game-data; no inferred spell damage is
  // inserted into attack/defense/armor.
  for(const [key,category] of [['potions',10],['runes',12]])for(const entry of facts[key]||[]){const metadata=appearances.items.get(entry.itemId);if(metadata)catalogItems.set(entry.itemId,{itemId:entry.itemId,name:entry.name||metadata.name,category,attack:0,defense:0,armor:0,slot:null});}
  for(const entry of facts.npcShop?.sellCatalog||[]){const metadata=appearances.byName.get(entry.name.toLowerCase());if(metadata&&Number.isFinite(metadata.category)&&!catalogItems.has(metadata.itemId))catalogItems.set(metadata.itemId,{itemId:metadata.itemId,name:entry.name,category:metadata.category,attack:0,defense:0,armor:0,slot:null,...(Number.isFinite(entry.weightOz)?{weight:Math.round(entry.weightOz*100)}:{}),shopBuys:true});}
  const directItems=observedItemCatalog(dataDir,appearances,priorTooltips);
  Object.assign(catalogEvidence,{itemCatalogCapture:directItems.capture,itemCatalogFields:directItems.fields,itemCatalogConflicts:directItems.conflicts,invalidItemCatalogRecords:directItems.invalid,huntLootItemsOutsideItemCatalog:[]});
  if(directItems.items){
    catalogItems=directItems.items;
    catalogEvidence.equipmentStatSource='Complete rendered item list; coherent earlier tooltip fields supplement only the same ID/name/category. Missing required combat fields use neutral wire zero and remain unknown in itemCatalogFields.';
  }
  const rarityNames={'common':'common','comum':'common','uncommon':'uncommon','incomum':'uncommon','semi-rare':'semi-rare','semi-raro':'semi-rare','rare':'rare','raro':'rare','very-rare':'very-rare','very rare':'very-rare','muito raro':'very-rare','muito-raro':'very-rare'};
  function observedLoot(raw,huntId){
    const metadata=Number.isInteger(raw.itemId)?appearances.items.get(raw.itemId):appearances.byName.get(String(raw.name||'').toLowerCase());
    const itemId=Number.isInteger(raw.itemId)?raw.itemId:metadata?.itemId;
    const rarity=rarityNames[String(raw.rarity||'').toLowerCase()];
    if(!Number.isInteger(itemId)||!rarity){catalogEvidence.unresolvedHuntLoot.push({huntId,name:raw.name,itemId:raw.itemId,rarity:raw.rarity});return null;}
    const known=catalogItems.get(itemId);
    if(!known&&!catalogEvidence.unknownLootItemStats.includes(itemId))catalogEvidence.unknownLootItemStats.push(itemId);
    if(!known&&!Number.isFinite(metadata?.category)&&!catalogEvidence.unknownLootItemCategories.includes(itemId))catalogEvidence.unknownLootItemCategories.push(itemId);
    const entry={...(known||{}),itemId,name:raw.name||metadata?.name||String(itemId),attack:known?.attack??0,defense:known?.defense??0,armor:known?.armor??0,slot:known?.slot??null,rarity};
    // The DOM supplies this item's identity, name, order and rarity. Add it to
    // the item catalogue only when its real public category is available.
    if(!known&&directItems.capture.complete){
      if(!catalogEvidence.huntLootItemsOutsideItemCatalog.some(value=>value.huntId===huntId&&value.itemId===itemId))catalogEvidence.huntLootItemsOutsideItemCatalog.push({huntId,itemId,name:entry.name});
    }else if(!known&&Number.isFinite(metadata?.category))catalogItems.set(itemId,{...entry,category:metadata.category});
    return entry;
  }
  for(const record of currentHuntRecords){
    const hunt=hunts.find(hunt=>hunt.id===record.id);
    if(!hunt)continue;
    catalogEvidence.observedHunts.push(record.id);
    if(typeof record.name==='string')hunt.name=record.name;
    if(typeof record.description==='string')hunt.description=record.description;
    const pulls=Array.isArray(record.pulls)?record.pulls:[];
    const monsterNames=[];
    for(const value of [...(record.monsters||[]),...pulls.flatMap(pull=>pull?.monsters||[])]){const name=typeof value==='string'?value:value.name;if(name&&!monsterNames.includes(name))monsterNames.push(name);}
    hunt.monsters=monsterNames.map(name=>({name,outfitId:name==='Rat'?21:0,bestiaryId:speciesId(name)}));
    const loot=[],lootIndexes=new Map();
    const addLoot=raw=>{const entry=observedLoot(raw,record.id);if(!entry)return null;let index=lootIndexes.get(entry.itemId);if(index===undefined){index=loot.length;lootIndexes.set(entry.itemId,index);loot.push(entry);}return {index,rarity:entry.rarity};};
    for(const entry of record.loot||[])addLoot(entry);
    const names=record.tiers||pulls.map(pull=>pull.name);
    hunt.tiers=names.map((value,index)=>{
      const name=typeof value==='string'?value:value.name;
      const pull=pulls[index];
      if(!pull)catalogEvidence.missingObservedPulls.push({huntId:record.id,tier:index,name});
      const composition=(pull?.monsters||[]).map(value=>typeof value==='string'?value:value.name);
      const monsterCount=Number.isFinite(pull?.monsterCount)?pull.monsterCount:0;
      if(!Number.isFinite(pull?.monsterCount))catalogEvidence.unknownTierCounts.push({huntId:record.id,tier:index});
      return {name,monsterCount,monsterIndexes:composition.map(monster=>monsterNames.indexOf(monster)).filter(index=>index>=0),loot:(pull?.loot||[]).map(addLoot).filter(Boolean)};
    });
    hunt.loot=loot;
  }
  for(const hunt of hunts)if(!catalogEvidence.observedHunts.includes(hunt.id))catalogEvidence.missingObservedHunts.push(hunt.id);
  // A visible species loot association does not establish an item's tooltip
  // stats or category. Keep the existing item catalogue and expose its gaps.
  for(const itemId of new Set(catalogMonsters.flatMap(record=>record.loot.map(entry=>entry.itemId)))){
    const metadata=appearances.items.get(itemId);
    if(!metadata)catalogEvidence.unknownBestiaryLootAppearances.push(itemId);
    if(!catalogItems.has(itemId)){
      catalogEvidence.bestiaryLootItemsOutsideItemCatalog.push({itemId,name:metadata?.name??null});
      if(!catalogEvidence.unknownLootItemStats.includes(itemId))catalogEvidence.unknownLootItemStats.push(itemId);
      if(!Number.isFinite(metadata?.category)&&!catalogEvidence.unknownLootItemCategories.includes(itemId))catalogEvidence.unknownLootItemCategories.push(itemId);
    }
  }
  if(directItems.capture.complete){
    const evidenceById=new Map(directItems.fields.map(record=>[record.itemId,record]));
    const lootIds=[...new Set([...hunts.flatMap(hunt=>(hunt.loot||[]).map(entry=>entry.itemId)),...catalogMonsters.flatMap(monster=>monster.loot.map(entry=>entry.itemId))])];
    // This list means at least one required combat field is unknown, even
    // though its neutral wire zero is needed by the original validator.
    catalogEvidence.unknownLootItemStats=lootIds.filter(itemId=>!evidenceById.has(itemId)||ITEM_STAT_FIELDS.some(field=>evidenceById.get(itemId).unknownFields.includes(field)));
    catalogEvidence.unknownLootItemCategories=lootIds.filter(itemId=>!catalogItems.has(itemId)&&!Number.isFinite(appearances.items.get(itemId)?.category));
  }
  const cyclopediaCatalog={type:'cyclopedia-catalog',items:[...catalogItems.values()],monsters:catalogMonsters,summons:[],bosses:Object.values(facts.dailyBosses||{}).map(boss=>({id:boss.id,name:boss.name}))};
  function stats(character, hunting = false) {
    const level = character.level, maxHealth = 150 + (level - 1) * 5, maxMana = 55 + (level - 1) * 5;
    return {type:'player-stats',health:Math.min(character.health,maxHealth),maxHealth,mana:Math.min(character.mana,maxMana),maxMana,healthRegen:10,manaRegen:5,manaShield:0,manaShieldMax:0,manaShieldMs:0,level,speed:220+(level-1)*2,speedBonus:0,speedSpellBonus:0,magicLevel:1,experience:character.experience,experienceNeeded:Math.max(100,level*140),skills:skillObject(10),skillProgress:skillObject(0),skillProgressNeeded:skillObject(100),skillBonuses:{},magicLevelBonus:0,magicProgress:0,magicProgressNeeded:100,capacity:135829,levelBonusPercent:195,scrollBonusPercent:0,xpScrollMs:0,guildBonusPercent:0,premiumBonusPercent:0,vocation:character.vocation,combat:{armor:4,defense:10,attackMin:5,attackMax:15,criticalChance:0,criticalExtra:0,lifeLeech:0,manaLeech:0,protection:{},weaponAttack:12,attackSkill:'sword'},cooldowns:{attack:0,heal:0,support:0,item:0,spells:{}},staminaMs:43200000,staminaDraining:hunting,huntSessionRemainingMs:hunting?14400000:null,staminaRefillCost:100,staminaRefillGainMs:3600000,staminaRefillsLeft:3,forgeDust:0,forgeDustCap:100,statuses:[]};
  }
  function sendInventory(session) {
    const inv=inventory(session.character);
    const validItem=entry=>{if(!entry)return null;const result={...entry};if(result.slot===null)delete result.slot;return result;};
    session.send({type:'player-inventory',slots:inv.slots.map(validItem),satchel:inv.satchel.map(validItem),equipment:Object.fromEntries(Object.entries(inv.equipment).map(([slot,entry])=>[slot,validItem(entry)])),gold:session.character.gold});
  }
  function terrain(hunting) {
    if(!hunting&&publicCityTerrain?.tiles)return publicCityTerrain.tiles;
    const tiles = [];
    for (let y = -14; y <= 14; y++) for (let x = -18; x <= 18; x++) {
      const edge = Math.abs(x) === 18 || Math.abs(y) === 14;
      tiles.push({position:{x,y,z:7},ground:{uid:200000+(y+14)*37+x+18,appearanceId:hunting?351:4526},items:[],blocked:edge});
    }
    return tiles;
  }
  function player(session) { const c=session.character; return {id:c.id,kind:'player',name:c.name,position:session.position,direction:'south',healthPercent:100,outfitId:c.outfitId,outfitColors:c.outfitColors,outfitAddons:c.outfitAddons||0,speed:228,level:c.level,vocation:c.vocation}; }
  function enterWorld(session, huntId = null, tier = 0) {
    clearInterval(session.walkTimer);session.walkTimer=null;
    session.huntId = huntId;session.tier=Number.isInteger(tier)&&tier>=0?tier:0; session.position = !huntId&&publicCityTerrain?.eye?{...publicCityTerrain.eye}:{x:0,y:0,z:7}; session.monsters=[];
    const terrainId = huntId ? 'local-cave' : 'local-city';
    const tiles=terrain(!!huntId);session.walkable=new Map(tiles.map(tile=>[`${tile.position.x},${tile.position.y},${tile.position.z}`,tile]));
    session.send({type:'scenario-terrain',terrainId,tiles});
    session.send({type:'instance-enter',instanceId:huntId||'local-city',scenarioId:huntId||'main-city',terrainId,ambience:huntId?'cavern':'surface',groundItems:[]});
    session.send({type:'creature-appear',creature:player(session)});
    session.send(stats(session.character,!!huntId));
    session.send({type:'hunt-pending',hunt:null,arenaId:null});
    if (huntId) { session.startedAt=Date.now(); session.kills=0; session.earned=0; spawnMonster(session); }
  }
  function spawnMonster(session) {
    const hunt = hunts.find(entry=>entry.id===session.huntId)||hunts[0];
    const indexes=hunt.tiers[session.tier]?.monsterIndexes||[];
    const pool=indexes.length?indexes.map(index=>hunt.monsters[index]):hunt.monsters;
    const species = pool[session.kills%pool.length];
    if(!species)return;
    const record = observedByName.get(species.name.toLowerCase());
    const monster = {id:allocateUid(),kind:'monster',name:species.name,position:{x:2,y:0,z:7},direction:'west',healthPercent:100,outfitId:species.outfitId,speed:record?.speed||100,maxHealth:record?.hp||20,health:record?.hp||20,xp:record?.experience||5};
    session.monsters=[monster]; session.send({type:'creature-appear',creature:monster});session.send({type:'player-target',targetId:monster.id});
  }
  function bootstrap(session) {
    session.send({type:'welcome',playerId:session.character.id});
    enterWorld(session);
    sendInventory(session);
    for (const message of [
      {type:'players-online',count:sessions.size}, {type:'coins',balance:0},
      {type:'player-outfits',outfitIds:[128,136],addonUnlocks:[]},{type:'player-mounts',mountIds:[]},
      {type:'hunt-catalog',hunts}, {type:'action-bar-update',slots:Array(20).fill(null)},
      {type:'action-bar-presets',names:['Default'],active:0},
      {type:'battle-settings-update',settings:{stance:'balanced',movement:'chase',keepDistance:2,targetStrategy:'nearest'}},
      {type:'bestiary-progress',kills:session.character.bestiaryKills||{},stages:{},bonusPercent:0,damagePercent:0,completed:0,total:catalogMonsters.length,killsRequired:2500},
      {type:'guild-info',guild:null},{type:'vip-list',entries:[]},{type:'hunt-favorites',huntIds:[]},
      {type:'quick-sell-update',itemIds:[]},{type:'auto-loot-update',disabledItemIds:[]},
      {type:'blessings-status',owned:[],cost:2000,freeUntilLevel:20,lossReductionPercent:0,equipmentLossPercent:10},
      {type:'item-values',npc:[],auction:[]},{type:'item-requirements',items:[]},
      {type:'tutorial-update',step:'done'},{type:'feature-flags',disabled:[]},
      {type:'system-message',text:'Sessão local iniciada. Simulação independente; regras e mapas do servidor original ainda não foram recuperados.'}
    ]) session.send(message);
  }
  function tick(session) {
    if (!session.huntId || !session.character || !session.monsters.length) return;
    const monster=session.monsters[0], damage=8+Math.floor(Math.random()*8);
    monster.health=Math.max(0,monster.health-damage);
    session.send({type:'creature-hit',attackerId:session.character.id,targetId:monster.id,value:damage,effect:'blood'});
    session.send({type:'creature-health',id:monster.id,healthPercent:monster.health/monster.maxHealth*100});
    if (!monster.health) {
      session.kills++; const xp=monster.xp*3;session.earned+=xp;session.character.experience+=xp;session.character.gold+=Math.floor(1+Math.random()*4);
      session.send({type:'creature-disappear',id:monster.id}); session.send({type:'experience-gain',playerId:session.character.id,value:xp});
      if(session.character.experience>=session.character.level*140){session.character.experience-=session.character.level*140;session.character.level++;session.character.health+=5;session.character.mana+=5;}
      session.send(stats(session.character,true));sendInventory(session);spawnMonster(session);persist();
    }
    session.send({type:'hunt-analyzer-update',startedAt:session.startedAt,durationMs:Date.now()-session.startedAt,kills:session.kills,experience:session.earned,rawExperience:session.earned/3,lootValue:session.kills*2,waste:0,supplies:[],loot:[],damageInput:[]});
  }
  function command(session, message) {
    const send=session.send, c=session.character;
    if(message.type==='ping') return send({type:'pong',t:message.t});
    if(message.type==='authenticate') {const id=Number(String(message.ticket).replace('local-',''));session.character=state.characters.find(c=>c.id===id)||state.characters[0];if(!session.character)return;bootstrap(session);return;}
    if(!c) return;
    switch(message.type) {
      case 'client-ready': break;
      case 'cyclopedia-request':send(cyclopediaCatalog);break;
      case 'start-hunt': case 'change-hunt': if(hunts.some(h=>h.id===message.huntId)) enterWorld(session,message.huntId,message.tier); break;
      case 'leave-hunt': case 'cancel-hunt': case 'leave-training': enterWorld(session);break;
      case 'walk': case 'walk-to': {
        if(session.huntId) break;
        const offsets={north:[0,-1],south:[0,1],east:[1,0],west:[-1,0]}, shift=offsets[message.direction]||[0,0], from={...session.position};
        const to=message.type==='walk-to'&&message.target?{x:Number(message.target.x),y:Number(message.target.y),z:7}:{x:from.x+shift[0],y:from.y+shift[1],z:7};
        const targetTile=session.walkable.get(`${to.x},${to.y},${to.z}`);
        if(!Number.isInteger(to.x)||!Number.isInteger(to.y)||!targetTile?.ground||targetTile.blocked)break;
        session.position=to;send({type:'creature-move',id:c.id,from,to,durationMs:200});break;
      }
      case 'battle-settings':send({type:'battle-settings-update',settings:message.settings});break;
      case 'set-action-slot':if(Number.isInteger(message.slot)&&message.slot>=0&&message.slot<20){session.actions[message.slot]=message.rule;send({type:'action-bar-update',slots:session.actions});}break;
      case 'clear-action-bar':session.actions=Array(20).fill(null);send({type:'action-bar-update',slots:session.actions});break;
      case 'set-hunt-favorites':send({type:'hunt-favorites',huntIds:message.huntIds||[]});break;
      case 'depot-open':send({type:'depot-update',slots:session.depot});break;
      case 'shop-open':send({type:'shop-offers',shopName:'Mercador',offers:[{...item(0,3607,'cheese',null),buyPrice:5,sellPrice:2,minLevel:0},{...item(0,3273,'sabre','weapon',{attack:12,defense:10}),buyPrice:9,sellPrice:3,minLevel:0}],quickSellItemIds:[3607]});break;
      case 'shop-buy': {if(![3607,3273].includes(message.itemId)||!Number.isFinite(message.amount)||message.amount<=0)break;const amount=Math.max(1,Math.min(100,Math.floor(message.amount))),cost=message.itemId===3607?5:9;if(c.gold<cost*amount)break;c.gold-=cost*amount;inventory(c).slots.push(item(allocateUid(),message.itemId,message.itemId===3607?'cheese':'sabre',message.itemId===3607?null:'weapon',{count:amount}));sendInventory(session);persist();break;}
      case 'shop-sell': {const entry=inventory(c).slots.find(i=>i&&i.itemId===message.itemId);if(!entry)break;const amount=Math.min(entry.count,Math.max(1,Math.floor(message.amount)||1));entry.count-=amount;c.gold+=amount*2;if(!entry.count)inventory(c).slots=inventory(c).slots.filter(i=>i!==entry);sendInventory(session);persist();break;}
      case 'equip-item': {const ref=message.ref,inv=inventory(c);const source=ref?.container==='satchel'?inv.satchel:inv.slots;const entry=source[ref?.index];if(entry?.slot&&EQUIPMENT.includes(entry.slot)){source[ref.index]=inv.equipment[entry.slot];inv.equipment[entry.slot]=entry;sendInventory(session);persist();}break;}
      case 'move-item': {
        const inv=inventory(c);
        const resolve=(ref,append)=>{
          if(!ref||typeof ref!=='object'||Array.isArray(ref))return null;
          if(ref.container==='equipment')return EQUIPMENT.includes(ref.slot)?{container:inv.equipment,key:ref.slot}:null;
          const container=ref.container==='backpack'?inv.slots:ref.container==='satchel'?inv.satchel:ref.container==='depot'?session.depot:null;
          if(!container||!Number.isInteger(ref.index)||ref.index<0||ref.index>=container.length+(append?1:0)||ref.index>=1024)return null;
          return {container,key:ref.index};
        };
        const from=resolve(message.from,false),to=resolve(message.to,true);
        if(!from||!to||!from.container[from.key])break;
        const entry=from.container[from.key],other=to.container[to.key]||null;
        if(message.to.container==='equipment'&&entry.slot!==message.to.slot)break;
        if(message.from.container==='equipment'&&other&&other.slot!==message.from.slot)break;
        [from.container[from.key],to.container[to.key]]=[other,entry];sendInventory(session);
        if(message.from.container==='depot'||message.to.container==='depot')send({type:'depot-update',slots:session.depot});
        persist();break;
      }
      case 'set-outfit': if(Number.isInteger(message.outfitId)){c.outfitId=message.outfitId;if(message.colors)c.outfitColors=message.colors;send({type:'creature-outfit',id:c.id,outfitId:c.outfitId,colors:c.outfitColors,addons:0,mountId:null});persist();}break;
      case 'say':send({type:'chat-message',channel:message.channel||'local',author:c.name,authorLevel:c.level,authorVocation:c.vocation,text:String(message.text||'').slice(0,500)});break;
      case 'highscores-request':send({type:'highscores',category:message.category||'level',vocation:null,page:0,pageCount:1,entries:state.characters.map((c,i)=>({rank:i+1,name:c.name,level:c.level,vocation:c.vocation,value:c.level}))});break;
      case 'guild-info-request':send({type:'guild-info',guild:null});break;
      case 'forge-open':send({type:'forge-state',dust:0,dustCap:100,slivers:0,cores:0});break;
      case 'coins-refresh':send({type:'coins',balance:0});break;
      case 'store-open':send({type:'store-offers',categories:[],offers:[]});break;
      case 'market-open':send({type:'market-enter',ownedCounts:[],sellOfferKeys:[],buyOfferKeys:[],myOfferCount:0,offerLimit:10,feePercent:1,feeMinimum:20});break;
      case 'blessings-open':send({type:'blessings-status',owned:[],cost:2000,freeUntilLevel:20,lossReductionPercent:0,equipmentLossPercent:10});break;
      case 'logout':persist();session.socket.end(frame(Buffer.alloc(0),8));break;
      case 'walk-stop':clearInterval(session.walkTimer);session.walkTimer=null;break;
      case 'tutorial-hint-seen':case 'set-window-layout':case 'depot-close':case 'market-close':break;
      default:send({type:'system-message',text:`O comando ${message.type} ainda não possui implementação local.`});
    }
  }
  function handleUpgrade(req, socket, head) {
    if(closing){socket.destroy();return;}
    if(!/^\/game-socket(?:\?|$)/.test(req.url||'')||req.headers.upgrade?.toLowerCase()!=='websocket'||typeof req.headers['sec-websocket-key']!=='string'){socket.destroy();return;}
    if(req.headers['sec-websocket-version']!=='13'||Buffer.from(req.headers['sec-websocket-key'],'base64').length!==16){socket.destroy();return;}
    if(req.headers.origin){try{const origin=new URL(req.headers.origin);if(!['http:','https:'].includes(origin.protocol)||!['localhost','127.0.0.1','[::1]'].includes(origin.hostname)||Number(origin.port||(origin.protocol==='https:'?443:80))!==req.socket.localPort){socket.destroy();return;}}catch{socket.destroy();return;}}
    const accept=crypto.createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
    const session={socket,character:null,actions:Array(20).fill(null),depot:[],position:{x:0,y:0,z:7},monsters:[],huntId:null};
    session.send=attachWebSocket(socket,message=>{try{command(session,message);}catch(error){console.error('Local command failed:',message.type,error.message);}},()=>{sessions.delete(session);clearInterval(session.timer);clearInterval(session.walkTimer);persist();},head);
    sessions.add(session);session.timer=setInterval(()=>tick(session),1200);session.timer.unref();
  }
  function handleHttp(req,res) {
    const url=new URL(req.url,'http://localhost'); if(!url.pathname.startsWith('/api/'))return false;
    const json=(value,status=200)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value));};
    if(!['GET','POST'].includes(req.method)){json({error:'Método não suportado'},405);return true;}
    if(req.method==='POST'){
      if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')){json({error:'O corpo deve usar application/json'},415);return true;}
      if(req.headers.origin){try{const origin=new URL(req.headers.origin);if(origin.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(origin.hostname)||origin.host!==(req.headers.host||'').toLowerCase()){json({error:'Origem não permitida'},403);return true;}}catch{json({error:'Origem inválida'},403);return true;}}
    }
    let body='';req.on('data',chunk=>{body+=chunk;if(body.length>65536)req.destroy();});
    req.on('end',()=>{let input={};try{input=body?JSON.parse(body):{};}catch{return json({error:'JSON inválido'},400);}
      if(input===null||typeof input!=='object'||Array.isArray(input))return json({error:'O corpo JSON deve ser um objeto'},400);
      const route=url.pathname;
      if(route==='/api/auth/me')return json({account:{id:1,email:'jogador@local.invalid',language:'pt-BR',emailVerified:true,emailConfirmed:true,hasPassword:true,mustConfirmEmail:false,mustAcceptRules:false,createdAt:Date.now()}});
      if(route==='/api/status')return json({maintenance:false});
      if(route==='/api/local/catalog-evidence')return json(catalogEvidence);
      if(route==='/api/auth/providers')return json({google:null,turnstile:null,gtm:null});
      if(route==='/api/tag-container')return json({containerId:null});
      if(route==='/api/characters'&&req.method==='GET')return json({characters:state.characters.map(c=>({...c,lastOnlineAt:c.lastOnlineAt||c.lastSeenAt})),premiumEndsAt:null,mustConfirmEmail:false,mustAcceptRules:false,nameChangeCredits:0});
      if(route==='/api/characters'&&req.method==='POST'){if(typeof input.name!=='string')return json({error:'Nome deve ser um texto'},400);const name=input.name.trim().slice(0,29);if(name.length<3)return json({error:'Nome muito curto'},400);const character=newCharacter(state.nextId++,name);state.characters.push(character);persist();return json({character});}
      if(route==='/api/characters/rename'){if(typeof input.name!=='string')return json({error:'Nome deve ser um texto'},400);const name=input.name.trim().slice(0,29);if(name.length<3)return json({error:'Nome muito curto'},400);const c=state.characters.find(c=>c.id===input.characterId);if(!c)return json({error:'Personagem não encontrado'},404);c.name=name;persist();return json({name:c.name,nameChangeCredits:1});}
      if(route==='/api/characters/delete'){state.characters=state.characters.filter(c=>!(c.id===input.characterId&&c.name===input.confirmName));persist();return json({ok:true});}
      if(route==='/api/game-tickets'){const character=state.characters.find(c=>c.id===input.characterId);if(!character)return json({error:'Personagem não encontrado'},404);return json({character,ticket:'local-'+character.id,websocketUrl:'ws://127.0.0.1:'+req.socket.localPort+'/game-socket'});}
      if(route==='/api/me/campaigns')return json({origin:'http://127.0.0.1:'+req.socket.localPort,campaigns:[],pix:null});
      if(route==='/api/me/campaigns/pix')return json({pix:null});
      if(route.includes('alerts'))return json({enabled:false,linked:false,connected:false,linkCode:null,linkCodeExpiresAt:null,settings:{}});
      if(route==='/api/referrals')return json({code:'LOCAL',invited:0,rewards:[],campaign:null});
      if(route==='/api/coin-packs')return json({packs:[]});
      if(route==='/api/auth/logout'||route==='/api/auth/language')return json({ok:true});
      return json({error:'Recurso local não implementado'},501);
    });return true;
  }
  let closePromise,closing=false;
  function close(){
    if(closePromise)return closePromise;
    closing=true;
    const pending=[...sessions].map(session=>new Promise(resolve=>{
      clearInterval(session.timer);clearInterval(session.walkTimer);
      session.socket.once('close',resolve);session.socket.destroy();
    }));
    persist();
    // Socket close handlers persist state too. Await them before callers may
    // remove temporary state directories or finish shutting down the server.
    closePromise=Promise.all(pending).then(()=>{});
    return closePromise;
  }
  return {handleHttp,handleUpgrade,close,state,stats,hunts,cyclopediaCatalog,catalogEvidence,observedHuntRecords:currentHuntRecords};
}

module.exports={createBackend,encodeMessage,decodeMessage,transform,SERVER_CODES,CLIENT_CODES,frame};
