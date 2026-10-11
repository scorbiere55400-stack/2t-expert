import raw from './sherco-parts.json';
export const parts=raw;
export type Part=(typeof parts)[number];
export const sourceUrl='https://www.sherco.com/wp-content/uploads/Spare-parts-book_END_SM_50-RS_2024.pdf';
export const categories=[...new Set(parts.map(p=>p.category))];
export function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
export function searchParts(query:string,vehicleId:string,category=''){const q=normalize(query);return parts.filter(p=>(!vehicleId||p.vehicleIds.includes(vehicleId))&&(!category||p.category===category)&&(!q||normalize(`${p.ref} ${p.name} ${p.category} Sherco 50 RS 2024`).includes(q)));}
