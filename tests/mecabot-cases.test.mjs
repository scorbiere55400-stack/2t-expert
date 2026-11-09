import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
function setup(userId='alice'){
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE diagnostic_cases (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,machine_id TEXT,payload TEXT NOT NULL,updated_at INTEGER NOT NULL)');
 const raw={prepare:sql=>({bind:(...params)=>({first:async()=>db.prepare(sql).get(...params),all:async()=>({results:db.prepare(sql).all(...params)}),run:async()=>db.prepare(sql).run(...params)})})};
 const user=userId?{userId}:null;const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync('app/api/diagnostic/cases/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const imports={'@/app/chatgpt-auth':{getChatGPTUser:async()=>user},'@/db':{getRawDb:()=>raw},'@/lib/api':{mutationUser:async()=>user?{user}:{error:Response.json({error:'Connexion requise'},{status:401})},unavailable:()=>Response.json({error:'Base indisponible'},{status:503})}};
 vm.runInNewContext(code,{module,exports:module.exports,URL,Response,require:p=>imports[p]});
 return {db,route:module.exports};
}
const caseId='2TE-DIAG-2026-ABCDEF0123';
const request=(id=caseId)=>new Request('https://site.example/api/diagnostic/cases?id='+id);
const payload={id:caseId,revision:1,input:{symptoms:['demarrage'],observations:[],context:'Contexte',recentChange:''},messages:[{role:'user',text:'Ne démarre pas',date:'2026-10-11'}]};
test('case and conversation are persisted, listed and restored for their account',async()=>{
 const {db,route}=setup();const put=new Request('https://site.example/api/diagnostic/cases',{method:'PUT',body:JSON.stringify(payload)});
 assert.equal((await route.PUT(put)).status,200);
 const restored=await(await route.GET(request())).json();assert.deepEqual(restored.caseFile,payload);
 const listed=await(await route.GET(new Request('https://site.example/api/diagnostic/cases'))).json();assert.equal(listed.cases[0].id,caseId);db.close();
});
test('other accounts cannot read, list, overwrite or delete a saved case',async()=>{
 const {db,route}=setup();db.prepare('INSERT INTO diagnostic_cases VALUES (?,?,?,?,?)').run(caseId,'bob',null,JSON.stringify(payload),1);
 assert.equal((await route.GET(request())).status,404);
 assert.equal((await(await route.GET(new Request('https://site.example/api/diagnostic/cases'))).json()).cases.length,0);
 const refused=await route.PUT(new Request('https://site.example/api/diagnostic/cases',{method:'PUT',body:JSON.stringify({...payload,messages:[]})}));
 assert.equal(refused.status,404);assert.equal((await refused.json()).saved,undefined);
 await route.DELETE(request());
 assert.equal(db.prepare('SELECT payload FROM diagnostic_cases').get().payload,JSON.stringify(payload));db.close();
});
test('anonymous callers cannot access dossiers',async()=>{const {db,route}=setup(null);for(const method of ['GET','DELETE'])assert.equal((await route[method](request())).status,401);assert.equal((await route.PUT(new Request('https://site.example/api/diagnostic/cases',{method:'PUT',body:JSON.stringify(payload)}))).status,401);db.close();});
