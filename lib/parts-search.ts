export type PartsMode='reference'|'machine'|'catalogue'|'offers';
export const referenceKey=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function matchesPartsMode(entry:{ref:string;sellerRefs:string[];machines:string[]},mode:PartsMode,query:string,machine:string,searchText:string){
 if(mode==='offers')return false;
 if(mode==='machine'&&(!machine||!entry.machines.includes(machine)))return false;
 if(mode==='reference'){const key=referenceKey(query);return key.length>=2&&[entry.ref,...entry.sellerRefs].some(ref=>referenceKey(ref).includes(key))}
 const terms=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(' ').filter(Boolean);
 return terms.every(t=>searchText.includes(t));
}
