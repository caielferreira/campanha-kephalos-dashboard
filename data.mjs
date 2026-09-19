const keys=['campaigns','characters','participants','groups','memberships','spells','inventory','resources','sessions','quests','images'];
const str=x=>typeof x==='string'&&x.trim().length>0;
const num=x=>Number.isInteger(x)&&x>=0;
const check=(ok,message)=>{if(!ok)throw Error(message);};
function legacy(d){
 check(str(d.title)&&Array.isArray(d.characters)&&Array.isArray(d.quests)&&Array.isArray(d.sessions),'Formato antigo incompleto.');
 const n={schemaVersion:2,revision:d.revision,updatedAt:d.updatedAt,legacySnapshot:d,...Object.fromEntries(keys.map(k=>[k,[]]))};
 n.campaigns=[{id:'legacy-campaign',title:d.title,notes:d.notes}];
 d.characters.forEach((c,i)=>{check(Array.isArray(c.spells)&&c.spells.every(str)&&Array.isArray(c.inventory)&&c.inventory.every(str),'Magias ou inventário inválidos.');const id='legacy-'+i;n.characters.push({id,name:c.name});n.participants.push({...c,id,campaignId:'legacy-campaign',characterId:id});c.spells.forEach((s,j)=>n.spells.push({id:id+'-spell-'+j,participantId:id,name:s}));c.inventory.forEach((s,j)=>n.inventory.push({id:id+'-item-'+j,participantId:id,name:s,quantity:1}));});
 n.quests=d.quests.map((q,i)=>({...q,id:'quest-'+i,campaignId:'legacy-campaign'}));n.sessions=d.sessions.map((s,i)=>({...s,id:'session-'+i,campaignId:'legacy-campaign'}));return n;
}
export function parseLibrary(text){
 check(text.length<=5000000,'O ficheiro excede 5 MB.');let d=JSON.parse(text.replace(/^\uFEFF/,''));
 check(d&&typeof d==='object','JSON inválido.');if(d.schemaVersion===1)d=legacy(d);
 check(d.schemaVersion===2&&num(d.revision),'É necessária schemaVersion 2 e revisão válida.');
 const maps={};for(const k of keys){check(Array.isArray(d[k]),'Falta a lista '+k);maps[k]=new Map();for(const r of d[k]){check(r&&str(r.id)&&!maps[k].has(r.id),'ID inválido ou duplicado em '+k);maps[k].set(r.id,r);}}
 const ref=(r,field,key)=>check(maps[key].has(r[field]),'Referência inválida: '+field+' em '+r.id);
 if(d.rolls!==undefined){check(Array.isArray(d.rolls),'Histórico de dados inválido.');const ids=new Set();for(const r of d.rolls){check(str(r.id)&&!ids.has(r.id),'ID de rolagem duplicado.');ids.add(r.id);ref(r,'campaignId','campaigns');if(r.participantId){ref(r,'participantId','participants');check(maps.participants.get(r.participantId).campaignId===r.campaignId,'Rolagem noutra campanha.');}const mode=r.mode||'normal';check(num(r.count)&&r.count>=1&&r.count<=30&&[4,6,8,10,12,20,100].includes(r.sides)&&Number.isInteger(r.modifier)&&Math.abs(r.modifier)<=100&&['normal','advantage','disadvantage'].includes(mode),'Dados inválidos.');check(mode==='normal'||r.count===1&&r.sides===20,'Vantagem requer 1d20.');check(Array.isArray(r.values)&&r.values.length===(mode==='normal'?r.count:2)&&r.values.every(v=>Number.isInteger(v)&&v>=1&&v<=r.sides),'Faces inválidas.');check(r.total===(mode==='advantage'?Math.max(...r.values):mode==='disadvantage'?Math.min(...r.values):r.values.reduce((a,b)=>a+b,0))+r.modifier,'Total inválido.');check(typeof r.label==='string'&&typeof r.date==='string','Rótulo ou data inválidos.');}}
 for(const c of d.campaigns)check(str(c.title),'Campanha sem título.');for(const c of d.characters)check(str(c.name),'Personagem sem nome.');
 for(const p of d.participants){ref(p,'campaignId','campaigns');ref(p,'characterId','characters');check(['hp','maxHp','level','ac'].every(k=>num(p[k]))&&p.hp<=p.maxHp,'PV, nível ou CA inválidos.');for(const k of ['tempHp','cp','sp','ep','gp','pp','str','dex','con','int','wis','cha'])if(p[k]!==undefined&&p[k]!==''&&p[k]!==null)check(num(p[k]),'Valor inválido: '+k);}
 for(const g of d.groups){ref(g,'campaignId','campaigns');check(str(g.name),'Grupo sem nome.');}
 const pairs=new Set();for(const m of d.memberships){ref(m,'groupId','groups');ref(m,'participantId','participants');check(maps.groups.get(m.groupId).campaignId===maps.participants.get(m.participantId).campaignId,'Grupo e personagem pertencem a campanhas diferentes.');const key=JSON.stringify([m.groupId,m.participantId]);check(!pairs.has(key),'Membro duplicado no grupo.');pairs.add(key);}
 for(const k of ['spells','inventory','resources'])for(const r of d[k]){ref(r,'participantId','participants');check(str(r.name),'Registo sem nome em '+k);}
 for(const r of d.spells){if(r.level!==undefined&&r.level!=='')check(num(r.level),'Nível de magia inválido.');if(r.prepared!==undefined&&r.prepared!=='')check(typeof r.prepared==='boolean','prepared deve ser booleano.');}
 for(const r of d.inventory){check(num(r.quantity),'Quantidade inválida.');if(r.equipped!==undefined&&r.equipped!=='')check(typeof r.equipped==='boolean','equipped deve ser booleano.');}
 for(const r of d.resources)check(num(r.current)&&num(r.max)&&r.current<=r.max,'Recurso inválido.');
 for(const k of ['sessions','quests','images'])for(const r of d[k]){ref(r,'campaignId','campaigns');if(k==='sessions'&&r.groupId){ref(r,'groupId','groups');check(maps.groups.get(r.groupId).campaignId===r.campaignId,'Sessão e grupo incompatíveis.');}if(k==='images'){if(r.characterId)ref(r,'characterId','characters');if(r.sessionId){ref(r,'sessionId','sessions');check(maps.sessions.get(r.sessionId).campaignId===r.campaignId,'Imagem e sessão incompatíveis.');}}}
 return d;
}
export function viewCampaign(d,id,groupId=''){
 const campaign=d.campaigns.find(c=>c.id===id);check(campaign,'Campanha não encontrada.');
 const groups=d.groups.filter(g=>g.campaignId===id);check(!groupId||groups.some(g=>g.id===groupId),'Grupo inválido.');
 const members=new Set(d.memberships.filter(m=>m.groupId===groupId).map(m=>m.participantId));
 const participants=d.participants.filter(p=>p.campaignId===id&&(!groupId||members.has(p.id))).map(p=>({...d.characters.find(c=>c.id===p.characterId),...p}));const ids=new Set(participants.map(p=>p.id));
 return {campaign,groups,participants,...Object.fromEntries(['spells','inventory','resources'].map(k=>[k,d[k].filter(r=>ids.has(r.participantId))])),...Object.fromEntries(['sessions','quests','images'].map(k=>[k,d[k].filter(r=>r.campaignId===id&&(k!=='sessions'||!groupId||r.groupId===groupId))]))};
}
