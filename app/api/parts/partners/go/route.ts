import {affiliateLink} from '@/lib/affiliate-feed';
import {readPartnerSnapshot,affiliateActive} from '@/lib/affiliate-server';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 try{const snapshot=await readPartnerSnapshot(),p=snapshot?.products.find(x=>x.id===params.get('id'));if(!p)return Response.json({error:'Offre introuvable.'},{status:404});
  const target=affiliateLink(p.url,affiliateActive()?process.env.AWIN_PUBLISHER_ID||'':'',params.get('consent')==='1');
  return new Response(null,{status:302,headers:{Location:target,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 }catch{return Response.json({error:'Lien marchand indisponible.'},{status:503})}
}
