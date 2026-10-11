import {getRawDb} from '@/db';
import {ADVERTISER_ID,SNAPSHOT_ID,parseFeed} from '@/lib/affiliate-feed';
import {configured} from '@/lib/affiliate-server';
export const dynamic='force-dynamic';
async function authorized(request:Request){
 const expected=process.env.AWIN_SYNC_TOKEN||'',given=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 if(expected.length<32||given.length>256)return false;
 const a=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(expected))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(given)));
 return a.reduce((diff,v,i)=>diff|(v^b[i]),0)===0;
}
export async function POST(request:Request){
 if(!await authorized(request))return Response.json({error:'Accès réservé à la synchronisation.'},{status:401});
 if(!configured())return Response.json({error:'Accès Awin non configuré.'},{status:503});
 const db=getRawDb(),now=Math.floor(Date.now()/1000),lock=now+300;
 await db.prepare('INSERT OR IGNORE INTO affiliate_snapshots (id) VALUES (?)').bind(SNAPSHOT_ID).run();
 const acquired=await db.prepare('UPDATE affiliate_snapshots SET locked_until=? WHERE id=? AND locked_until<=?').bind(lock,SNAPSHOT_ID,now).run();
 if(!acquired.meta.changes)return Response.json({error:'Synchronisation en cours ou délai de cinq minutes non écoulé.'},{status:429});
 let response:Response|undefined;
 try{
  const standard=process.env.AWIN_PRODUCT_FEED_URL;
  const url=new URL(standard||'https://api.awin.com/publishers/'+process.env.AWIN_PUBLISHER_ID+'/awinfeeds/download/'+ADVERTISER_ID+'-retail-fr_FR.jsonl');
  if(url.protocol!=='https:'||url.username||url.password||url.port||standard&&url.hostname!=='productdata.awin.com'||!standard&&url.hostname!=='api.awin.com')throw Error('Configuration refusée');
  response=await fetch(url.href,{redirect:'error',headers:standard?{}:{Authorization:'Bearer '+process.env.AWIN_API_TOKEN},signal:AbortSignal.timeout(45000)});
  if(!response.ok||!response.body)throw Error('Accès fournisseur refusé');
  // Create-a-Feed : sélectionner CSV UTF-8, compression « none ».
  const contentType=response.headers.get('content-type')||'';
  if(/text\/html|application\/zip|gzip/i.test(contentType))throw Error('Utiliser un flux non compressé');
  const {products,limited}=await parseFeed(response.body,standard?'csv':'jsonl',process.env.AWIN_CSV_DELIMITER===';'?';':',');
  const payload=JSON.stringify(products);if(payload.length>800000)throw Error('Instantané trop volumineux');
  const written=await db.prepare('UPDATE affiliate_snapshots SET payload=?,synced_at=?,limited=? WHERE id=? AND locked_until=?').bind(payload,Math.floor(Date.now()/1000),limited?1:0,SNAPSHOT_ID,lock).run();
  if(!written.meta.changes)throw Error('Synchronisation expirée');
  return Response.json({saved:products.length,limited},{headers:{'Cache-Control':'no-store'}});
 }catch{
  await response?.body?.cancel().catch(()=>{});
  return Response.json({error:'Synchronisation impossible. Vérifiez l’acceptation du programme, la clé et le format du flux. Le dernier catalogue valide est conservé.'},{status:502});
 }
}
