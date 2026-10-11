import {demoProducts,normalize} from '@/lib/affiliate-feed';
import {readPartnerSnapshot,configured,affiliateActive} from '@/lib/affiliate-server';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,demo=params.get('mode')==='demo',q=(params.get('q')||'').slice(0,100),ref=(params.get('ref')||'').slice(0,100),page=Math.max(1,Math.min(100,Math.floor(Number(params.get('page')))||1));
 const headers={'Cache-Control':'no-store'};
 try{
  const snapshot=demo?null:await readPartnerSnapshot(),products=demo?demoProducts:snapshot?.products||[];
  const terms=normalize(q).split(' ').filter(Boolean);
  const matches=products.filter(p=>ref?Boolean(p.reference)&&normalize(p.reference)===normalize(ref):terms.every(t=>normalize(p.name+' '+p.reference+' '+p.maker+' '+p.category).includes(t)));
  const pages=Math.max(1,Math.ceil(matches.length/8)),actualPage=Math.min(page,pages),stale=Boolean(snapshot&&Date.now()/1000-snapshot.syncedAt>86400);
  return Response.json({mode:demo?'demo':snapshot?'catalogue':'pending',configured:configured(),affiliateActive:!demo&&affiliateActive(),syncedAt:snapshot?new Date(snapshot.syncedAt*1000).toISOString():null,limited:snapshot?.limited||false,stale,total:matches.length,page:actualPage,pages,items:matches.slice((actualPage-1)*8,actualPage*8).map(p=>({...p,url:undefined,price:stale?null:p.price,stock:stale?'Relevé ancien · vérifier chez le vendeur':p.stock,href:demo?null:'/api/parts/partners/go?id='+encodeURIComponent(p.id)}))},{headers});
 }catch{return Response.json({error:'Offres partenaires temporairement indisponibles.'},{status:503,headers})}
}
