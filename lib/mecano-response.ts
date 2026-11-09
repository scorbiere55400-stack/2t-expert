import {analyzeDescription,decide,type CaseInput,type Symptom,type Hypothesis} from './diagnostic-engine';

export const MECANO_RESPONSE_VERSION='mecano-2t-response/0.2.0';
export type MechanicalAnswer={status:'stop'|'question'|'diagnostic'|'out_of_scope'|'restricted';heading:string;summary:string;causes:{title:string;evidence:string;uncertainty:string}[];next:string;question:string;source:string};
const names:Record<Symptom,string>={demarrage:'démarrage difficile','ratés':'fonctionnement irrégulier',surchauffe:'surchauffe',bruit:'bruit anormal',fuite:'fuite'};
function cause(h:Hypothesis){return {title:h.title,evidence:h.for.length?`Indices : ${h.for.join(' ; ')}.`:'Aucun indice confirmé.',uncertainty:h.against.length?`À confronter à : ${h.against.join(' ; ')}.`:h.missing.length?`À confirmer : ${h.missing.join(' ; ')}.`:'Cause non démontrée.'}}
/** Génération de langage contrôlée par le diagnostic. Aucun fait mécanique libre n'est inventé. */
export function composeMechanicalAnswer(description:string,input:CaseInput,machineName?:string):MechanicalAnswer{
 const intake=analyzeDescription(description);
 if(intake.restricted)return {status:'restricted',heading:'Recherche d’une réparation conforme',summary:intake.message,causes:[],next:'Précisez la panne mécanique observée et l’usage de la machine. Une intervention doit respecter l’homologation et les règles locales.',question:'Quel symptôme souhaitez-vous corriger ?',source:MECANO_RESPONSE_VERSION};
 if(intake.outOfScope)return {status:'out_of_scope',heading:'Ce sujet sort du diagnostic 2T',summary:intake.message,causes:[],next:'Indiquez une machine à moteur deux temps et un symptôme mécanique.',question:'Quel est le modèle de votre machine deux temps ?',source:MECANO_RESPONSE_VERSION};
 const symptoms=[...new Set([...input.symptoms,...intake.symptoms])];
 const context:CaseInput={...input,symptoms,severe:input.severe||intake.severe};
 const result=decide(context);
 const machine=machineName?`Pour ${machineName}, `:'Sans modèle confirmé, ';
 if(result.stop)return {status:'stop',heading:'Arrêtez la machine',summary:`${machine}${symptoms.length?`les signes de ${symptoms.map(s=>names[s]).join(' et ')} nécessitent d’abord une mise en sécurité.`:'un danger immédiat a été signalé.'} Ne redémarrez pas pour reproduire la panne.`,causes:result.hypotheses.slice(0,3).map(cause),next:'Faites examiner la machine à l’arrêt par un atelier compétent. Aucun essai dynamique ne doit être proposé à ce stade.',question:'Où se trouve l’anomalie visible, une fois la machine arrêtée et refroidie ?',source:MECANO_RESPONSE_VERSION};
 if(!symptoms.length)return {status:'question',heading:'Commençons par le symptôme',summary:`${machine}je ne peux pas classer la panne sur cette seule description.`,causes:[],next:'Décrivez ce que vous observez, sans démonter ni rouler pour provoquer le problème.',question:intake.questions[0]||'Qu’arrive-t-il exactement au démarrage ou pendant le fonctionnement ?',source:MECANO_RESPONSE_VERSION};
 const phrase=symptoms.map(s=>names[s]).join(' et ');
 const followUp=!machineName?'Quelle est la marque, le modèle et, si possible, l’année ?':intake.questions[0]||'Quel résultat avez-vous réellement observé lors du contrôle proposé ?';
 return {status:'diagnostic',heading:'Première analyse technique',summary:`${machine}vous décrivez ${phrase}. Ces signes orientent vers plusieurs familles de causes, sans prouver une panne précise. ${result.reason}`,causes:result.hypotheses.slice(0,3).map(cause),next:result.next?`${result.next.title}. ${result.next.purpose} ${result.next.competence==='Atelier'?'Ce contrôle exige un atelier et la notice du modèle exact.':result.next.method}`:'Les contrôles consignés ne suffisent pas à confirmer une cause. Conservez le dossier et demandez un examen adapté si la panne persiste.',question:followUp,source:`${MECANO_RESPONSE_VERSION} · triage 2T Expert ${result.next?'· '+result.next.source:''}`};
}
