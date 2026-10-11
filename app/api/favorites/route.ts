import {z} from 'zod';
import {and,eq} from 'drizzle-orm';
import {getDb} from '@/db';
import {favorites} from '@/db/schema';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {mutationUser,unavailable} from '@/lib/api';
import {parts} from '@/lib/catalog';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser();if(!user)return Response.json({error:'Connexion requise.'},{status:401});try{return Response.json({ids:(await getDb().select({partId:favorites.partId}).from(favorites).where(eq(favorites.userId,user.userId))).map(x=>x.partId)},{headers:{'Cache-Control':'no-store'}});}catch{return unavailable();}}
export async function POST(request:Request){const auth=await mutationUser(request);if(auth.error)return auth.error;let data;try{data=z.object({partId:z.union([z.string().uuid(),z.string().regex(/^2TE-P-[0-9a-f]{16}$/)]),saved:z.boolean()}).parse(await request.json());}catch{return Response.json({error:'Requête invalide.'},{status:400});}if(typeof data?.saved!=='boolean'||(data.partId.includes('-')&&!data.partId.startsWith('2TE-P-')&&!parts.some(p=>p.id===data.partId)))return Response.json({error:'Pièce inconnue.'},{status:400});try{const db=getDb();if(data.saved)await db.insert(favorites).values({id:crypto.randomUUID(),userId:auth.user.userId,partId:data.partId}).onConflictDoNothing();else await db.delete(favorites).where(and(eq(favorites.userId,auth.user.userId),eq(favorites.partId,data.partId)));return Response.json({saved:data.saved});}catch{return unavailable();}}
