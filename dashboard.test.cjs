const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.existsSync(require('node:path').join(__dirname,'index.html'))?fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8'):'';
const code=html.match(/<script id="data-core">([\s\S]*?)<\/script>/)?.[1]||'function parseCampaign(){return null}';
const ctx=vm.createContext({}); vm.runInContext(code,ctx);
const good={schemaVersion:1,revision:1,title:'Campanha',characters:[{name:'Ana',hp:10,maxHp:10,ac:15,level:1,spells:[],inventory:[]}],quests:[],sessions:[],notes:'Notas',extra:{preserve:true}};
test('importação e exportação preservam campos desconhecidos',()=>assert.equal(JSON.stringify(ctx.parseCampaign(JSON.stringify(good))),JSON.stringify(good)));
test('recusa versões incompatíveis',()=>assert.throws(()=>ctx.parseCampaign(JSON.stringify({...good,schemaVersion:2}))));
test('recusa dados incompletos antes de substituir a campanha',()=>assert.throws(()=>ctx.parseCampaign('{"schemaVersion":1}')));
test('recusa PV inválidos',()=>assert.throws(()=>ctx.parseCampaign(JSON.stringify({...good,characters:[{...good.characters[0],hp:-1}]}))));
test('recusa sessões sem texto',()=>assert.throws(()=>ctx.parseCampaign(JSON.stringify({...good,sessions:[{}]}))));

