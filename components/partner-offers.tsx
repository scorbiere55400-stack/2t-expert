'use client';
import {useEffect,useState} from 'react';
import {ExternalLink,PackageSearch,Search} from 'lucide-react';
import type {PartnerProduct} from '@/lib/affiliate-feed';
type Result={mode:'demo'|'catalogue'|'pending';configured:boolean;affiliateActive:boolean;syncedAt:string|null;limited:boolean;stale:boolean;total:number;page:number;pages:number;items:(PartnerProduct&{href:string|null})[]};
export default function PartnerOffers({initialQuery=''}:{initialQuery?:string}){
 const [demo,setDemo]=useState(false),[query,setQuery]=useState(initialQuery),[page,setPage]=useState(1),[data,setData]=useState<Result|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[consent,setConsent]=useState(false),[selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{setQuery(initialQuery);setPage(1);setSelected(null)},[initialQuery]);
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');
  const timeout=setTimeout(()=>{const params=new URLSearchParams({q:query,page:String(page)});if(demo)params.set('mode','demo');
   fetch('/api/parts/partners?'+params,{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error();return r.json() as Promise<Result>}).then(result=>{setData(result);setLoading(false)}).catch(e=>{if(e.name!=='AbortError'){setError('Les offres partenaires sont temporairement indisponibles.');setLoading(false)}});
  },250);
  return()=>{clearTimeout(timeout);controller.abort()};
 },[query,page,demo]);
 const toggleDemo=()=>{setDemo(!demo);setQuery('');setPage(1);setSelected(null);setConsent(false);setData(null)};
 return <section className="partner-pilot" aria-label="Offres partenaires de pièces détachées">
  <div className="partner-pilot-head"><div><span>OFFRES PARTENAIRES · PILOTE</span><h2>Maxiscoot France</h2></div><button type="button" onClick={toggleDemo}>{demo?'Revenir aux offres marchandes':'Tester avec des exemples'}</button></div>
  <p className="partner-mode" role="status">{demo?'Démonstration : exemples internes, aucun prix, stock ou lien d’achat réel.':data?.mode==='catalogue'?'Catalogue fourni par Awin · relevé du '+new Date(data.syncedAt!).toLocaleString('fr-FR')+(data.limited?' · sélection pilote de 500 offres maximum':''):data?.configured?'Connexion préparée · premier catalogue en attente de synchronisation.':'Flux marchand en attente d’activation. Vous pouvez déjà tester la recherche et les fiches avec les exemples.'}</p>
  {(demo||data?.mode==='catalogue')&&<>
   <label className="partner-query"><Search size={18}/><span className="sr-only">Rechercher dans les offres partenaires</span><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);setSelected(null)}} placeholder="Pièce, référence fabricant ou marque…"/></label>
   <small>Le résultat de recherche ne certifie aucun montage sur votre machine. Les prix et disponibilités sont ceux du dernier flux reçu, à vérifier chez le vendeur.</small>
   {!demo&&data?.affiliateActive&&<label className="partner-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>J’accepte le suivi Awin pour attribuer mon achat à 2T Expert. Facultatif : le lien fonctionne aussi sans consentement au suivi.</label>}
   {data?.stale&&<p className="partner-stale">Ce relevé a plus de 24 heures : les prix sont masqués jusqu’à sa mise à jour.</p>}
   {loading?<p role="status">Recherche des offres…</p>:<><p className="partner-count" role="status">{data?.total||0} résultat(s){demo?' de démonstration':''}</p><div className="partner-cards">{data?.items.map(p=><article key={p.id}>
    <button type="button" className="partner-product" onClick={()=>setSelected(selected===p.id?null:p.id)} aria-expanded={selected===p.id}>{p.image?<img src={p.image} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display='none'}}/>:<PackageSearch/>}<span><small>{p.category||'Pièce détachée'}</small><strong>{p.name}</strong><span>{p.reference?'Réf. fabricant : '+p.reference:'Référence fabricant non fournie'}</span>{p.price!==null&&<b>{new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(p.price)}</b>}</span></button>
    {selected===p.id&&<div className="partner-product-detail"><p>{p.maker||'Fabricant non indiqué'} · {p.stock}</p><p>{demo?'Cette fiche sert uniquement à vérifier l’interface. Aucun produit commercial ne lui est associé.':'Contrôlez les cotes, le moteur et le millésime sur la fiche du vendeur avant achat.'}</p>{p.href&&<><a href={p.href+(consent?'&consent=1':'')} target="_blank" rel="sponsored nofollow noopener noreferrer">Voir chez Maxiscoot <ExternalLink size={14}/></a><small>{data?.affiliateActive?'Lien affilié : 2T Expert peut recevoir une commission. Le suivi Awin est '+(consent?'accepté.':'refusé par défaut.'):'Lien marchand direct, affiliation non activée.'}</small></>}</div>}
   </article>)}</div>{!data?.items.length&&<p>Aucune offre dans cette sélection pilote. Le catalogue documentaire ci-dessous reste accessible.</p>}{data&&data.pages>1&&<div className="partner-pages"><button type="button" disabled={page<=1} onClick={()=>setPage(page-1)}>Précédent</button><span>Page {data.page} / {data.pages}</span><button type="button" disabled={page>=data.pages} onClick={()=>setPage(page+1)}>Suivant</button></div>}</>}
  </>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
