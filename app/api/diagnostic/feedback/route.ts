import {mutationUser,unavailable} from '@/lib/api';
import {getRawDb} from '@/db';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const auth=await mutationUser(request);if(auth.error)return auth.error;
 let body:{caseId:string;outcome:string;note:string;consent:boolean};try{const raw=await request.text();if(raw.length>4000)throw Error();body=JSON.parse(raw);if(!/^2TE-DIAG-[0-9]{4}-[A-F0-9]{10}$/.test(body.caseId)||!['resolu','non_resolu','autre_cause'].includes(body.outcome)||typeof body.note!=='string'||body.note.length>1200||body.consent!==true)throw Error()}catch{return Response.json({error:'Retour invalide. Un consentement explicite est nécessaire.'},{status:400})}
 try{
  const owner=await getRawDb().prepare('SELECT id FROM diagnostic_cases WHERE id = ? AND user_id = ?').bind(body.caseId,auth.user.userId).first();if(!owner)return Response.json({error:'Enregistrez d’abord ce dossier dans votre compte.'},{status:404});
  await getRawDb().prepare('INSERT INTO diagnostic_feedback (id,user_id,case_id,outcome,note,consent,status,created_at) VALUES (?,?,?,?,?,1,?,unixepoch())').bind(crypto.randomUUID(),auth.user.userId,body.caseId,body.outcome,body.note.trim(),'pending_review').run();
  return Response.json({received:true,status:'pending_review'},{headers:{'Cache-Control':'no-store'}});
 }catch{return unavailable()}
}
