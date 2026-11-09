import {getChatGPTUser} from '@/app/chatgpt-auth';
import {getRawDb} from '@/db';
import {mutationUser,unavailable} from '@/lib/api';
export const dynamic='force-dynamic';
const validId=(id:string)=>/^2TE-DIAG-[0-9]{4}-[A-F0-9]{10}$/.test(id);

export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Connexion requise.'},{status:401});
 const id=new URL(request.url).searchParams.get('id');if(id&&!validId(id))return Response.json({error:'Identifiant invalide.'},{status:400});
 try{
  if(id){const row=await getRawDb().prepare('SELECT payload FROM diagnostic_cases WHERE id = ? AND user_id = ?').bind(id,user.userId).first<{payload:string}>();return row?Response.json({caseFile:JSON.parse(row.payload)},{headers:{'Cache-Control':'no-store'}}):Response.json({error:'Dossier introuvable.'},{status:404});}
  const rows=await getRawDb().prepare('SELECT id,machine_id,updated_at FROM diagnostic_cases WHERE user_id = ? ORDER BY updated_at DESC LIMIT 30').bind(user.userId).all();
  return Response.json({cases:rows.results},{headers:{'Cache-Control':'no-store'}});
 }catch{return unavailable()}
}
export async function PUT(request:Request){
 const auth=await mutationUser(request);if(auth.error)return auth.error;
 let data:Record<string,any>;try{const body=await request.text();if(body.length>60_000)throw Error();data=JSON.parse(body);if(!data||!validId(data.id)||!data.input||!Array.isArray(data.input.symptoms)||!Array.isArray(data.input.observations)||data.input.observations.length>80||typeof data.input.context!=='string'||data.input.context.length>2000||typeof data.input.recentChange!=='string'||data.input.recentChange.length>500||typeof data.revision!=='number'||data.revision<1||data.revision>10000||data.machine&&typeof data.machine.id!=='string')throw Error();}catch{return Response.json({error:'Dossier invalide ou trop volumineux.'},{status:400})}
 try{const saved=await getRawDb().prepare('INSERT INTO diagnostic_cases (id,user_id,machine_id,payload,updated_at) VALUES (?,?,?,?,unixepoch()) ON CONFLICT(id) DO UPDATE SET machine_id=excluded.machine_id,payload=excluded.payload,updated_at=unixepoch() WHERE diagnostic_cases.user_id=excluded.user_id RETURNING id').bind(data.id,auth.user.userId,data.machine?.id||null,JSON.stringify(data)).first();if(!saved)return Response.json({error:'Dossier introuvable.'},{status:404,headers:{'Cache-Control':'no-store'}});return Response.json({saved:true},{headers:{'Cache-Control':'no-store'}})}catch{return unavailable()}
}
export async function DELETE(request:Request){
 const auth=await mutationUser(request);if(auth.error)return auth.error;const id=new URL(request.url).searchParams.get('id')||'';if(!validId(id))return Response.json({error:'Identifiant invalide.'},{status:400});
 try{await getRawDb().prepare('DELETE FROM diagnostic_cases WHERE id = ? AND user_id = ?').bind(id,auth.user.userId).run();return Response.json({deleted:true},{headers:{'Cache-Control':'no-store'}})}catch{return unavailable()}
}
