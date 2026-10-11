import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
function load(file,stubs={},globals={}) {
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,process:{env:{}},URL,Response,Request,AbortController,setTimeout,clearTimeout,require:p=>{if(p in stubs)return stubs[p];throw Error(p)},...globals});
 return module.exports;
}
const provider=load('lib/mecabot-provider.ts');
const input={symptoms:['demarrage'],observations:[],context:'',recentChange:'',severe:false};
const guided={status:'diagnostic',summary:'Panne non confirmée',next:'Contrôle externe',question:'Quel modèle ?'};
function chat({user={userId:'owner'},env={OPENAI_API_KEY:'test-only'},answer=guided,fetchResponse,fetchError,limited=false}={}) {
 const calls=[];
 const route=load('app/api/diagnostic/chat/route.ts',{
  '@/app/chatgpt-auth':{getChatGPTUser:async()=>user},
  '@/db':{getRawDb:()=>({prepare:()=>({bind:()=>({})}),batch:async()=>[{results:limited?[]:[{count:1}]},{results:[{count:1}]}]})},
  '@/lib/diagnostic-engine':{analyzeDescription:()=>({severe:false})},
  '@/lib/mecano-response':{composeMechanicalAnswer:()=>answer},
  '@/lib/mecabot-library':{searchLibrary:(q,options)=>{assert.equal(options.generalOnly,true);return [];}},
  '@/lib/mecabot-knowledge':{relevantKnowledge:()=>[]},
  '@/lib/mecabot-provider':{...provider,mecabotProvider:()=>provider.mecabotProvider(env)},
 },{process:{env},fetch:async(url,opts)=>{calls.push({url,...opts});if(fetchError)throw fetchError;return fetchResponse || Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'Hypothèse à vérifier.'}]}]});}});
 const request=(patch={},origin='https://site.example')=>new Request('https://site.example/api/diagnostic/chat',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({question:'Ne démarre pas',machine:'Machine 2T',input,history:[],...patch})});
 return {route,calls,request};
}
test('successful OpenAI response uses private Responses endpoint and controlled next step',async()=>{
 const c=chat();const r=await c.route.POST(c.request());const d=await r.json();assert.equal(d.mode,'openai');assert.equal(d.next,guided.next);assert.equal(d.question,guided.question);assert.equal(c.calls[0].url,'https://api.openai.com/v1/responses');const body=JSON.parse(c.calls[0].body);assert.equal(body.store,false);assert.equal(body.model,'gpt-5.4-mini');assert.equal(JSON.stringify(d).includes('test-only'),false);
});
test('no credit degrades to guided answer with explicit notice, without retry',async()=>{
 const c=chat({fetchResponse:Response.json({error:{code:'credit_balance_exhausted',message:'private detail'}},{status:429})});const d=await(await c.route.POST(c.request())).json();assert.equal(d.mode,'guidé');assert.match(d.notice,/Crédit API/);assert.equal(c.calls.length,1);assert.equal(JSON.stringify(d).includes('private detail'),false);
});
test('anonymous, stopped, limited and unconfigured requests never call provider',async()=>{
 for(const opts of [{user:null},{answer:{...guided,status:'stop'}},{limited:true},{env:{}}]){const c=chat(opts);const d=await(await c.route.POST(c.request())).json();assert.equal(d.mode,'guidé');assert.equal(c.calls.length,0);}
});
test('origin and malformed observations rejected before inference',async()=>{
 const c=chat();assert.equal((await c.route.POST(c.request({},'https://evil.example'))).status,403);for(const patch of [{input:{...input,observations:[null]}},{input:{...input,symptoms:['unknown']}},{history:[null]}])assert.equal((await c.route.POST(c.request(patch))).status,400);assert.equal(c.calls.length,0);
});
test('incomplete responses never masquerade as model answers',async()=>{
 const c=chat({fetchResponse:Response.json({status:'incomplete',output:[{type:'message',content:[{type:'output_text',text:'Fragment'}]}]})});assert.equal((await(await c.route.POST(c.request())).json()).mode,'guidé');
});
test('existing authenticated GPU endpoint remains usable',async()=>{
 const c=chat({env:{MECABOT_INFERENCE_URL:'https://gpu.example/v1/chat/completions',MECABOT_INFERENCE_TOKEN:'gpu-test',MECABOT_MODEL:'existing-model'},fetchResponse:Response.json({choices:[{message:{content:'Piste conditionnelle.'}}]})});assert.equal((await(await c.route.POST(c.request())).json()).mode,'auto-hébergé');assert.equal(JSON.parse(c.calls[0].body).model,'existing-model');
});
test('inference refuses redirects and fails closed without exposing credentials',async()=>{
 const c=chat();const d=await(await c.route.POST(c.request())).json();assert.equal(c.calls[0].redirect,'error');assert.equal(d.mode,'openai');
 const failure=chat({fetchError:new TypeError('redirect refused test-only')});const fallback=await(await failure.route.POST(failure.request())).json();assert.equal(fallback.mode,'guidé');assert.equal(failure.calls.length,1);assert.equal(JSON.stringify(fallback).includes('test-only'),false);
});
