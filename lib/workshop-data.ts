import directory from '@/data/spec-directory.json';
import parts from '@/lib/sherco-parts.json';

export type Transmission='gearbox'|'cvt'|'moped'|'unknown';
export type Machine={id:string;brand:string;model:string;year:string;version:string;market:string;engine:string;transmission:Transmission;induction:'carb'|'injection'|'unknown';photo?:string;source:string;verified:boolean;catalog?:{vehicleId:string;variant:number}};
export const pilotMachines:Machine[]=[
 {id:'yam-dt50x-2011-workshop',brand:'Yamaha',model:'DT 50 X',year:'2011',version:'à confirmer',market:'France — à confirmer',engine:'Minarelli AM6 (famille à vérifier sur la machine)',transmission:'gearbox',induction:'carb',photo:'/assets/carousel-authentic/yamaha-dt50x.jpg',source:'Répertoire 2T Expert, famille DT50X ; millésime et montage à confirmer',verified:false},
 {id:'sherco-sm50-2024',brand:'Sherco',model:'50 RS SM',year:'2024',version:'SM',market:'France — à confirmer',engine:'Code moteur à relever',transmission:'gearbox',induction:'carb',source:'Catalogue pièces Sherco 50 RS SM / END 2024',verified:true},
 {id:'yam-aerox-2011-workshop',brand:'Yamaha',model:'Aerox 50 2T',year:'2011',version:'à préciser',market:'à préciser',engine:'Code moteur à relever',transmission:'cvt',induction:'carb',photo:'/assets/models/yam-aerox.jpg',source:'Répertoire 2T Expert, famille Aerox/Nitro ; montage non confirmé',verified:false},
 {id:'peugeot-103-spx-lc-1988',brand:'Peugeot',model:'103 SPX-LC',year:'1988',version:'série 1 — à vérifier',market:'France — à confirmer',engine:'Code moteur à relever',transmission:'moped',induction:'carb',photo:'/assets/carousel-authentic/peugeot-103-spx-lc.jpg',source:'Répertoire 2T Expert, famille 103 ; moteur et montage à vérifier',verified:false},
];
export const families=directory.vehicles.map(v=>({id:`family:${v.id}`,brand:v.brand,model:v.models,source:`Répertoire véhicules 2T Expert · entrée ${v.id}, page ${v.page}`,description:v.description,photo:v.photos?.[0]?.src}));
export const modelOptions=directory.vehicles.flatMap(v=>v.models.split(';').map((name,variant)=>({id:`directory:${v.id}:${variant}`,vehicleId:v.id,variant,brand:v.brand,model:v.id==='v055'&&variant>0?'103 '+name.trim():name.trim(),group:v.models,category:v.category,description:v.description})));
export const modelBrands=[...new Set(directory.vehicles.map(v=>v.brand))].sort((a,b)=>a.localeCompare(b,'fr'));
export function catalogBaseline(machine:Machine){
 if(!machine.catalog)return null;
 const vehicle=directory.vehicles.find(v=>v.id===machine.catalog?.vehicleId);
 if(!vehicle)return null;
 const selected=vehicle.models.split(';')[machine.catalog.variant]?.trim()||vehicle.models;
 const aliases=selected.toLocaleLowerCase('fr-FR').split('/').map(x=>x.trim()).filter(x=>x.length>=3);
 const applicable=vehicle.engines.filter(ref=>aliases.length>0&&!/à vérifier|selon version/i.test(ref.appliesTo)&&aliases.every(alias=>new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}($|[^a-z0-9])`,'i').test(ref.appliesTo)));
 const engines=applicable.map(ref=>({ref,entry:directory.engines.find(e=>e.id===ref.id)})).filter(x=>x.entry);
 return {vehicle,selected,engines,photo:vehicle.photos.find(p=>p.src===machine.photo),vehicleSource:`${vehicle.sourceDocument}#page=${vehicle.page}`};
}
export function fromCatalogModel(item:typeof modelOptions[number]):Machine{
 const source=directory.vehicles.find(v=>v.id===item.vehicleId)!;
 const aliases=item.model.toLocaleLowerCase('fr-FR').split('/').map(x=>x.trim()).filter(x=>x.length>=3);
 const photo=source.photos.find(p=>aliases.some(alias=>p.label.toLocaleLowerCase('fr-FR').includes(alias)));
 const machine:Machine={id:item.id,brand:item.brand,model:item.model,year:'',version:'à préciser',market:'à préciser',engine:'Code moteur à relever',transmission:'unknown',induction:'unknown',photo:photo?.src,source:`Répertoire véhicules · ${source.id}, page ${source.page}`,verified:false,catalog:{vehicleId:item.vehicleId,variant:item.variant}};
 const base=catalogBaseline(machine);
 if(base?.engines.length===1){
  const architecture=base.engines[0].entry!.architecture.toLocaleLowerCase('fr-FR');
  machine.engine=`${base.engines[0].entry!.id} · ${base.engines[0].entry!.name} (famille documentaire)`;
  if(architecture.includes('carburateur'))machine.induction='carb';
  if(architecture.includes('injection'))machine.induction='injection';
  if(architecture.includes('boîte mécanique'))machine.transmission='gearbox';
  if(architecture.includes('cvt'))machine.transmission='cvt';
  if(architecture.includes('variateur'))machine.transmission='moped';
 }
 return machine;
}
export const shercoParts=parts;
export const WORKSHOP_VERSION='atelier-2t/1.1.0';
export const CATALOG_VERSION='Sherco 2024 · relevé 22/09/2026 / répertoires 23/09/2026';
