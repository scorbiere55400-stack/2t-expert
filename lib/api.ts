import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function mutationUser(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return {error:Response.json({error:'Origine de la requête refusée.'},{status:403})};const user=await getChatGPTUser();if(!user)return {error:Response.json({error:'Connectez-vous pour enregistrer vos modifications.'},{status:401})};return {user};}
export function unavailable(){return Response.json({error:'Le service de sauvegarde est temporairement indisponible. Réessayez plus tard.'},{status:503});}
