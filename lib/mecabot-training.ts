export function validExample(x:unknown):x is {question:string;answer:string;sourceUrl:string;validated:boolean}{
 if(!x||typeof x!=='object')return false;const b=x as Record<string,unknown>;
 if(typeof b.question!=='string'||!b.question.trim()||b.question.length>2000||typeof b.answer!=='string'||!b.answer.trim()||b.answer.length>6000||typeof b.sourceUrl!=='string'||b.sourceUrl.length>1000||typeof b.validated!=='boolean')return false;
 try{const u=new URL(b.sourceUrl);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
export function exportExample(row:{id:string;question:string;answer:string;source_url:string}){return {messages:[{role:'system',content:'Tu es MécaBot, assistant mécanique deux temps. Ne jamais inventer une spécification.'},{role:'user',content:row.question},{role:'assistant',content:row.answer}],metadata:{example_id:row.id,source_url:row.source_url,validation:'human_reviewed'}};}
