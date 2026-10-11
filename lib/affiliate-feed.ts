export const ADVERTISER_ID='63576';
export const SNAPSHOT_ID='awin-maxiscoot-fr';
export const PILOT_LIMIT=500;
export type PartnerProduct={id:string;name:string;reference:string;maker:string;category:string;price:number|null;currency:string;stock:string;url:string;image:string|null;demo?:boolean};
export const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const text=(v:unknown,n=180)=>typeof v==='string'?v.trim().slice(0,n):typeof v==='number'?String(v):'';
export function merchantUrl(value:unknown):string|null{
 try{const u=new URL(text(value,2000));return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname==='maxiscoot.com'||u.hostname.endsWith('.maxiscoot.com'))?u.href:null}catch{return null}
}
export function normalizeProduct(row:Record<string,unknown>):PartnerProduct|null{
 const meta=row.meta as Record<string,unknown>|undefined;
 const sections=Object.entries(row).filter(([key,value])=>key.startsWith('product_')&&value&&typeof value==='object'&&!Array.isArray(value)).map(([,value])=>value as Record<string,unknown>);
 row=Object.assign({},...sections,row);
 if(text(row.merchant_id||meta?.advertiser_id)&&text(row.merchant_id||meta?.advertiser_id)!==ADVERTISER_ID)return null;
 const id=text(row.merchant_product_id||row.id,100),name=text(row.product_name||row.title),url=merchantUrl(row.merchant_deep_link||row.link);
 if(!id||!name||!url)return null;
 const raw=text(row.search_price||row.price,40).replace(',','.'),m=raw.match(/^(\d+(?:\.\d{1,2})?)(?:\s+([A-Z]{3}))?$/);
 const price=m&&Number(m[1])>0?Number(m[1]):null;
 const currency=text(row.currency||m?.[2],3);
 const rawStock=text(row.availability||row.in_stock,60).toLowerCase();
 const stock=['in_stock','1','yes'].includes(rawStock)?'En stock annoncé':['out_of_stock','out_ouf_stock','0','no'].includes(rawStock)?'Indisponible annoncé':['preorder','backorder'].includes(rawStock)?'Sur commande annoncée':'Stock non renseigné';
 return {id,name,reference:text(row.mpn||row.manufacturer_part_number,100),maker:text(row.brand_name||row.brand,80),category:text(row.merchant_category||row.product_type,120),price:currency==='EUR'?price:null,currency:currency==='EUR'?'EUR':'',stock,url,image:merchantUrl(row.merchant_image_url||row.image_link)};
}
export function affiliateLink(destination:string,publisher:string,consent:boolean){
 const target=merchantUrl(destination);
 if(!target)throw Error('Destination refusée');
 if(!/^[1-9][0-9]{0,14}$/.test(publisher))return target;
 const u=new URL('https://www.awin1.com/cread.php');
 u.searchParams.set('awinmid',ADVERTISER_ID);u.searchParams.set('awinaffid',publisher);
 u.searchParams.set('ued',target);u.searchParams.set('clickref','2t-expert-parts');u.searchParams.set('cons',consent?'1':'0');
 return u.href;
}
/** CSV incrémental : conserve les guillemets et retours à la ligne entre blocs. */
export class CsvRows{
 private cell='';private row:string[]=[];private quoted=false;private closing=false;private cr=false;
 private delimiter:string;
 constructor(delimiter=','){this.delimiter=delimiter}
 *push(chunk:string,final=false):Generator<string[]>{
  for(const c of chunk){
   if(this.cr){this.cr=false;if(c==='\n')continue}
   if(this.quoted){
    if(this.closing){if(c==='"'){this.cell+='"';this.closing=false;continue}this.quoted=false;this.closing=false}
    else {if(c==='"')this.closing=true;else this.cell+=c;continue}
   }
   if(c==='"'&&!this.cell)this.quoted=true;
   else if(c===this.delimiter){this.row.push(this.cell);this.cell=''}
   else if(c==='\n'||c==='\r'){this.row.push(this.cell);this.cell='';const row=this.row;this.row=[];this.cr=c==='\r';yield row}
   else this.cell+=c;
   if(this.cell.length>12000)throw Error('Champ trop volumineux');
  }
  if(final){if(this.quoted&&!this.closing)throw Error('CSV incomplet');if(this.cell||this.row.length){this.row.push(this.cell);yield this.row}}
 }
}
export async function parseFeed(body:ReadableStream<Uint8Array>,format:'csv'|'jsonl',delimiter=','){
 const reader=body.getReader(),decoder=new TextDecoder(),csv=new CsvRows(delimiter);
 const products:PartnerProduct[]=[],seen=new Set<string>();let header:string[]|null=null,pending='',bytes=0,limited=false;
 function add(row:Record<string,unknown>){if(row.error)throw Error('Flux incomplet');const p=normalizeProduct(row);if(p&&!seen.has(p.id)){seen.add(p.id);products.push(p)}}
 try{
  while(true){
   const {value,done}=await reader.read();bytes+=value?.byteLength||0;
   if(bytes>16_000_000)throw Error('Flux trop volumineux pour ce pilote');
   const chunk=decoder.decode(value,{stream:!done});
   if(format==='csv'){
    for(const cells of csv.push(chunk,done)){
     if(!header){header=cells.map((x,i)=>(i===0?x.replace(/^\uFEFF/,''):x).trim());if(!header.includes('merchant_deep_link')||!header.includes('product_name'))throw Error('Champs Awin manquants');continue}
     if(cells.length===1&&!cells[0].trim())continue;
     if(cells.length!==header.length)throw Error('Ligne CSV invalide');
     add(Object.fromEntries(header.map((key,i)=>[key,cells[i]])));
     if(products.length>=PILOT_LIMIT){limited=true;break}
    }
   }else{
    pending+=chunk;
    while(pending.includes('\n')||(done&&pending)){
     const i=pending.indexOf('\n'),line=i<0?pending:pending.slice(0,i);pending=i<0?'':pending.slice(i+1);
     if(line.trim())add(JSON.parse(line) as Record<string,unknown>);
     if(products.length>=PILOT_LIMIT){limited=true;break}
    }
    if(pending.length>120000)throw Error('Ligne JSONL trop volumineuse');
   }
   if(limited||done)break;
  }
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
 if(!products.length)throw Error('Aucune offre Maxiscoot exploitable');
 return {products,limited};
}
// Exemples internes sans référence marchande, prix, stock ni lien d'achat.
export const demoProducts:PartnerProduct[]=[
 ['cylindre','Cylindre deux temps · exemple','Moteur','cylindre'],
 ['piston','Piston et axe · exemple','Moteur','piston'],
 ['carburateur','Carburateur · exemple','Carburation','carburateur'],
 ['echappement','Échappement deux temps · exemple','Échappement','echappement'],
].map(([id,name,category,image])=>({id:'demo-'+id,name,reference:'',maker:'Exemple interne 2T Expert',category,price:null,currency:'',stock:'Non applicable · démonstration',url:'',image:'/assets/atelier-parts/'+image+'.webp',demo:true}));
