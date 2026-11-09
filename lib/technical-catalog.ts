import raw from '@/data/technical-catalog.json';
import photos from '@/data/technical-photos.json';

export type Fact={value:string;status:string;source_id:string|null;source_page:number|null};
export type Version={id:string;model_as_documented:string;year_label:string;year:number|null;market:string|null;scope_type:string;source_ids:string[];history:string;facts:Record<string,Fact>;flags:string[];measurements:unknown[]};
export type Source={id:string;title:string;url:string;type:string;consulted_at:string;status:string};
export type Machine={id:string;brand:string;model:string;alias_of:string|null;section:string;status:string;publication_status:string;production_start:number|null;production_end:number|null;versions:Version[];fact_count:number;inventory_note_unverified:string|null;pdf_page:number|null};
export type Photo={src:string;alt:string;caption:string;source?:string;credit?:string;licenseUrl?:string};
export type Summary=Pick<Machine,'id'|'brand'|'model'|'section'|'status'|'fact_count'|'alias_of'> & {version_count:number;photo:Photo|null};
const catalogue=raw as unknown as {edition:string;date:string;coverage:string;stats:Record<string,number>;field_labels:Record<string,string>;sources:Source[];machines:Machine[]};
const photoMap=photos as Record<string,Photo>;
const sourceMap=new Map(catalogue.sources.map(s=>[s.id,s]));
const machineMap=new Map(catalogue.machines.map(m=>[m.id,m]));
const normalized=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr-FR');
const summary=(m:Machine):Summary=>({id:m.id,brand:m.brand,model:m.model,section:m.section,status:m.status,fact_count:m.fact_count,alias_of:m.alias_of,version_count:m.versions.length,photo:photoMap[m.id]??null});
export const metadata={edition:catalogue.edition,date:catalogue.date,coverage:catalogue.coverage,stats:catalogue.stats,brands:[...new Set(catalogue.machines.map(m=>m.brand))].sort((a,b)=>a.localeCompare(b,'fr')),sections:[...new Set(catalogue.machines.map(m=>m.section))],field_labels:catalogue.field_labels};
export function searchSheets(params:URLSearchParams){
 const query=normalized((params.get('q')??'').trim()).split(/\s+/).filter(Boolean);
 const brand=params.get('brand')??'';const section=params.get('section')??'';const coverage=params.get('coverage')??'';
 const page=Math.max(1,Math.min(1000,Number.parseInt(params.get('page')??'1',10)||1));
 const pageSize=18;
 const results=catalogue.machines.filter(m=>{
  if(brand&&m.brand!==brand)return false;
  if(section&&m.section!==section)return false;
  if(coverage==='documented'&&!m.versions.length)return false;
  if(coverage==='pending'&&m.versions.length)return false;
  const haystack=normalized(`${m.id} ${m.brand} ${m.model} ${m.section}`);
  return query.every(word=>haystack.includes(word));
 });
 const totalPages=Math.max(1,Math.ceil(results.length/pageSize));
 const safePage=Math.min(page,totalPages);
 return {items:results.slice((safePage-1)*pageSize,safePage*pageSize).map(summary),total:results.length,page:safePage,totalPages,metadata};
}
export function sheetDetail(id:string){
 const machine=machineMap.get(id);if(!machine)return null;
 const sourceIds=new Set(machine.versions.flatMap(v=>[...v.source_ids,...Object.values(v.facts).map(f=>f.source_id).filter((s):s is string=>!!s)]));
 return {machine,photo:photoMap[id]??null,sources:[...sourceIds].map(id=>sourceMap.get(id)).filter((s):s is Source=>!!s),fieldLabels:catalogue.field_labels,edition:catalogue.edition};
}
