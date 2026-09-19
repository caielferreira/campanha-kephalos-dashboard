import {parseLibrary} from './data.mjs';
const clone=x=>JSON.parse(JSON.stringify(x));
const integer=(n,min=0,max=999999)=>Number.isInteger(n)&&n>=min&&n<=max;
export function editLibrary(db,campaignId,table,id,patch){
 const next=clone(db), row=next[table]?.find(r=>r.id===id);
 if(!row||!['participants','spells','inventory','resources','quests','campaigns'].includes(table))throw Error('Registo inexistente.');
 const owner=table==='campaigns'?row.id:row.campaignId||next.participants.find(p=>p.id===row.participantId)?.campaignId;
 if(owner!==campaignId)throw Error('O registo pertence a outra campanha.');
 const fields={participants:['hp','maxHp','tempHp','ac','level','str','dex','con','int','wis','cha','cp','sp','ep','gp','pp','conditions','concentration','inspiration','notes'],spells:['prepared','notes'],inventory:['name','quantity','equipped','notes'],resources:['current','max','notes'],quests:['status','notes'],campaigns:['resume','location','worldTime','notes']}[table];
 if(Object.keys(patch).some(k=>!fields.includes(k)))throw Error('Campo protegido.');
 const before=Object.fromEntries(Object.keys(patch).map(k=>[k,row[k]??'']));Object.assign(row,patch);
 parseLibrary(JSON.stringify(next));
 record(next,campaignId,{table,id,before,after:patch});return next;
}
function record(db,campaignId,change){
 db.localChanges??=[];db.localChanges.push({changeId:globalThis.crypto.randomUUID(),campaignId,date:new Date().toISOString(),baseRevision:db.revision,...change});
 db.localUpdatedAt=new Date().toISOString();
}
export function appendRow(db,campaignId,table,row){
 if(!['inventory','spells','resources','sessions','quests','groups','memberships'].includes(table))throw Error('Lista invÃ¡lida.');
 const next=clone(db);if(next[table].some(r=>r.id===row.id))throw Error('ID duplicado.');
 const owner=row.campaignId||next.participants.find(p=>p.id===row.participantId)?.campaignId||next.groups.find(g=>g.id===row.groupId)?.campaignId;
 if(owner!==campaignId)throw Error('Campanha incompatÃ­vel.');
 next[table].push(row);parseLibrary(JSON.stringify(next));record(next,campaignId,{table,id:row.id,before:null,after:row});return next;
}
export function membership(db,campaignId,groupId,participantId,include){
 const next=clone(db),group=next.groups.find(g=>g.id===groupId),p=next.participants.find(p=>p.id===participantId);
 if(group?.campaignId!==campaignId||p?.campaignId!==campaignId)throw Error('Grupo e personagem incompatÃ­veis.');
 const old=next.memberships.find(m=>m.groupId===groupId&&m.participantId===participantId);
 if(include&&!old)return appendRow(db,campaignId,'memberships',{id:globalThis.crypto.randomUUID(),groupId,participantId});
 if(!include&&old){next.memberships=next.memberships.filter(m=>m.id!==old.id);record(next,campaignId,{table:'memberships',id:old.id,before:old,after:null});}
 return next;
}
export function rollDice(config,random=globalThis.crypto){
 const {count,sides,modifier,mode='normal'}=config;
 if(!integer(count,1,30)||![4,6,8,10,12,20,100].includes(sides)||!integer(modifier,-100,100)||!['normal','advantage','disadvantage'].includes(mode)||mode!=='normal'&&(count!==1||sides!==20))throw Error('Vantagem e desvantagem requerem 1d20; usa 1â€“30 dados e modificador âˆ’100 a +100.');
 const face=()=>{const buffer=new Uint32Array(1),limit=Math.floor(4294967296/sides)*sides;do{random.getRandomValues(buffer);}while(buffer[0]>=limit);return buffer[0]%sides+1;};
 const values=Array.from({length:mode==='normal'?count:2},face);
 const total=(mode==='advantage'?Math.max(...values):mode==='disadvantage'?Math.min(...values):values.reduce((a,b)=>a+b,0))+modifier;
 return {...config,mode,values,total,date:new Date().toISOString()};
}
export function appendRoll(db,campaignId,participantId,config,random){
 if(!db.participants.some(p=>p.id===participantId&&p.campaignId===campaignId))throw Error('Seleciona quem lanÃ§a os dados.');
 const next=clone(db),roll={...rollDice(config,random),id:globalThis.crypto.randomUUID(),campaignId,participantId};
 next.rolls??=[];next.rolls.push(roll);record(next,campaignId,{table:'rolls',id:roll.id,before:null,after:roll});return next;
}
