import {getChatGPTUser} from '@/app/chatgpt-auth';
const owners=['vchp4k8fnn@privaterelay.appleid.com','coddy34@live.fr'];
export function isAdminEmail(email:string){return owners.includes(email.trim().toLowerCase());}
export async function adminUser(){const user=await getChatGPTUser();return user&&isAdminEmail(user.email)?user:null;}
export async function adminAuth(request:Request,mutation=false){
 if(mutation&&request.headers.get('origin')!==new URL(request.url).origin)return {error:Response.json({error:'Origine refusée.'},{status:403})};
 const user=await adminUser();return user?{user}:{error:Response.json({error:'Accès administrateur requis.'},{status:403})};
}
