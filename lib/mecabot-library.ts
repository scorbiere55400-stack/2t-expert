import baseCards from '@/data/mecabot-reviewed.json';
import faults from '@/data/mecabot-pannes/pannes.json';
import sourceRecords from '@/data/mecabot-pannes/sources.json';
export type LibraryCard={id:string;title:string;text:string;topics:string[];scope:string;url:string;publisher:string;sources:{id:string;title:string;url:string;publisher:string;note:string}[];applications:string[];validation:string;warning:string;automaticEligible:boolean;urgency?:string};
const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const sourceMap=new Map(sourceRecords.map(s=>[s.id,s]));
const genericScopes=new Set(['moteur 2T','moteur essence 2T','allumage par bougie']);
const cards:LibraryCard[]=[...baseCards.map(c=>({...c,sources:[{id:c.id,title:c.title,url:c.url,publisher:c.publisher,note:''}],applications:['principes généraux'],validation:'Synthèse de source primaire ; validation mécanique en atelier non réalisée.',warning:'Aucune valeur spécifique au modèle.',automaticEligible:true})),...faults.map(f=>{
 const sources=f.source_ids.map(id=>{const s=sourceMap.get(id)!;return {id:'PANNES-'+id,title:s.titre,url:s.url,publisher:s.organisation,note:s.note};});
 const weak=f.source_ids.includes('S28');const general=f.applications.every(a=>genericScopes.has(a));
 return {id:'PANNES-'+f.id,title:f.titre,text:[`Symptômes : ${f.symptomes.join(' ')}`,`Hypothèses conditionnelles : ${f.causes_possibles.join(' ')}`,`Contrôles documentaires : ${f.controles.join(' ')}`,`Résolution si confirmée : ${f.resolution_conditionnelle}`,`Après réparation : ${f.controle_apres_reparation}`,`Limites : ${f.limites}`].join('\n\n'),topics:[f.sous_systeme,...f.symptomes],scope:general?'general_2t':'application_specific',url:sources[0].url,publisher:sources.map(s=>s.publisher).filter((x,i,a)=>a.indexOf(x)===i).join(' / '),sources,applications:f.applications,validation:f.validation,warning:weak?'Source S28 accessible seulement par extrait indexé ; fiche exclue des réponses automatiques.':general?'Manuel du modèle requis avant toute procédure ou valeur précise.':'Applicabilité au moteur à confirmer ; exclue des réponses automatiques.',automaticEligible:general&&!weak,urgency:f.urgence};
})];
export const libraryCount=cards.length;
export const faultCount=faults.length;
export const sourceCount=sourceRecords.length;
export const applicationOptions=[...new Set(faults.flatMap(f=>f.applications))].sort();
export function searchLibrary(query:string,options:{generalOnly?:boolean;application?:string}={}){const terms=[...new Set(norm(query).match(/[a-z0-9]{3,}/g)||[])].filter(t=>!['les','des','une','pour','avec','dans','est','mon','mes','sur','que','qui','quoi','moteur'].includes(t));
 return cards.filter(c=>(!options.generalOnly||c.automaticEligible)&&(!options.application||c.applications.includes(options.application))).map(card=>({card,score:terms.reduce((n,t)=>n+(norm(card.id+' '+card.title+' '+card.topics.join(' ')+' '+card.applications.join(' ')).includes(t)?3:0)+(norm(card.text).includes(t)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,options.generalOnly?3:8).map(x=>x.card);}
