/** 2T Expert · moteur de décision local, révision 1. Aucun modèle génératif ou service externe. */
export const DIAGNOSTIC_VERSION='mecano-2t-local/1.1.0';
export type Symptom='demarrage'|'ratés'|'surchauffe'|'bruit'|'fuite';
export type Result='normal'|'anormal'|'impossible'|'incertain';
export type Observation={controlId:string;result:Result;note:string;date:string};
export type CaseInput={symptoms:Symptom[];context:string;recentChange:string;severe:boolean;observations:Observation[]};
export type Hypothesis={id:string;title:string;for:string[];against:string[];missing:string[];level:'Piste à vérifier'|'Prioritaire à vérifier'|'Moins probable selon ce contrôle';source:string};
export type Control={id:string;title:string;purpose:string;method:string;tools:string;competence:string;source:string;stop:string};
export type Decision={stop:boolean;message:string;hypotheses:Hypothesis[];next:Control|null;reason:string};
export type Intake={symptoms:Symptom[];severe:boolean;outOfScope:boolean;restricted:boolean;message:string;questions:string[]};
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
/** Analyse locale et conservatrice. Le texte ne devient une observation qu'après confirmation. */
export function analyzeDescription(raw:string):Intake{
 const text=normalize(raw.slice(0,2000));
 const observed=text.replace(/\b(?:pas de|ni de|aucun(?:e)?|sans)\s+(?:fuite|bruit|rate|surchauffe|chauffe|fumee)\b/g,'').replace(/\bne\s+(?:fuit|chauffe|cale)\s+pas\b/g,'').replace(/\bdemarre bien\b/g,'');
 const patterns:Record<Symptom,RegExp>={
  demarrage:/demarr|ne part pas|ne se lance|ne veut pas partir|difficile a lancer/,
  'ratés':/rate|broute|trou a l.acceleration|cale|ralenti instable|coupe en roulant|perte de puissance/,
  surchauffe:/surchauff|chauffe trop|temperature elevee|bouill|serrage|serre|serr[ée]/,
  bruit:/bruit|claqu|cogn|grinc|siffle|vibrations? anorm/,
  fuite:/fuite|coule|goutte|odeur d.essence|carburant au sol/,
 };
 const symptoms=(Object.keys(patterns) as Symptom[]).filter(key=>patterns[key].test(observed));
 const severe=/incendie|flamme|fumee epaisse|fuite importante|essence au sol|carburant au sol|frein.*(panne|ne marche|bloqu)|roue.*bloqu|moteur.*emball|emball.*moteur|serrage|moteur serre|bruit brutal|claquement violent|plus d.huile|sans huile/.test(observed);
 const outOfScope=/\b(4 temps|quatre temps|diesel|voiture electrique|moteur electrique)\b/.test(text);
 const restricted=/debrid|retirer (le )?(limiteur|bridage)|supprimer (le )?(catalyseur|antipollution)|shunter (la )?(securite|sonde)|falsifi|effacer (le )?numero de serie/.test(text);
 const questions:string[]=[];
 if(!symptoms.length&&!outOfScope)questions.push('Quel symptôme observez-vous : démarrage, ratés, chaleur, bruit ou fuite ?');
 if(!/a froid|a chaud|au ralenti|en charge/.test(text))questions.push('Cela se produit-il à froid, à chaud, au ralenti ou en charge ?');
 if(!/depuis|apres|change|monte|remplace/.test(text))questions.push('Une pièce ou un réglage a-t-il réellement changé avant l’apparition du problème ?');
 return {symptoms,severe,outOfScope,restricted,message:restricted?'Je ne peux pas guider une neutralisation de sécurité, une falsification ou une modification routière potentiellement interdite. Décrivez le symptôme pour rechercher une réparation conforme.':outOfScope?'MécaBot traite uniquement les machines à moteur deux temps.':severe?'Signal d’alerte possible : arrêtez la machine et ne la redémarrez pas pour reproduire le problème.':symptoms.length?`J’ai repéré ${symptoms.length} famille${symptoms.length>1?'s':''} de symptômes. Vérifiez les cases proposées avant de les ajouter au dossier.`:'Je n’ai pas assez d’indices pour classer le problème sans vous poser une question.',questions:questions.slice(0,2)};
}
const source='Moteur de triage 2T Expert v1 · hypothèses générales, procédure de mesure non validée';
export const controls:Control[]=[
 {id:'visual',title:'Inspection visuelle moteur arrêté',purpose:'Rechercher une anomalie visible et relever les modifications récentes.',method:'Moteur arrêté et refroidi : noter seulement les fuites visibles, raccords débranchés, dommages ou traces externes. Ne pas démonter.',tools:'Aucun',competence:'Observation sans démontage',source,stop:'Fuite importante, chaleur, odeur forte de carburant ou pièce endommagée : arrêt et atelier.'},
 {id:'fuel',title:'Vérifier le circuit d’alimentation',purpose:'Distinguer une alimentation insuffisante d’une autre famille de causes.',method:'Contrôle à confier à un professionnel selon la notice du moteur exact ; consigner uniquement son résultat.',tools:'Selon notice du modèle',competence:'Atelier',source,stop:'Ne pas ouvrir un circuit de carburant chaud ou sous pression.'},
 {id:'ignition',title:'Vérifier le circuit d’allumage',purpose:'Chercher une cause électrique selon la procédure du modèle.',method:'Contrôle à réaliser en atelier selon la notice exacte ; consigner uniquement le résultat.',tools:'Selon notice du modèle',competence:'Atelier',source,stop:'Ne pas manipuler les hautes tensions ou les organes en mouvement.'},
 {id:'cooling',title:'Contrôler la cause de surchauffe',purpose:'Évaluer le refroidissement et la lubrification sans redémarrer.',method:'Laisser refroidir ; faire contrôler en atelier la configuration réelle et la notice applicable.',tools:'Selon notice du modèle',competence:'Atelier',source,stop:'Ne pas ouvrir un circuit de refroidissement chaud ni redémarrer pour provoquer le symptôme.'},
 {id:'change',title:'Comparer au dernier état fonctionnel',purpose:'Isoler les différences depuis le dernier fonctionnement normal.',method:'Lister les pièces réellement montées et les réglages modifiés ; ne pas conclure à une causalité sur la seule chronologie.',tools:'Historique du propriétaire',competence:'Observation',source,stop:'Si le symptôme est grave, arrêter avant toute comparaison dynamique.'},
 {id:'intake',title:'Faire contrôler l’admission et son étanchéité',purpose:'Départager alimentation, prise d’air ou défaut de montage sur un moteur deux temps.',method:'Contrôle en atelier avec la méthode et les valeurs de la notice correspondant au moteur exact. Ne pas improviser de pulvérisation sur un moteur chaud.',tools:'Selon notice du modèle',competence:'Atelier',source,stop:'Arrêt immédiat en cas de fuite de carburant ou de régime qui s’emballe.'},
 {id:'compression',title:'Faire contrôler l’état mécanique du haut moteur',purpose:'Vérifier si la compression et l’état du haut moteur expliquent un démarrage difficile persistant.',method:'Mesure et interprétation en atelier selon la notice et la méthode propres à la variante identifiée.',tools:'Selon notice du modèle',competence:'Atelier',source,stop:'Ne pas redémarrer après surchauffe, serrage ou bruit brutal.'},
];
const result=(c:CaseInput,id:string)=>c.observations.findLast(x=>x.controlId===id)?.result;
export function decide(c:CaseInput):Decision{
 const s=new Set(c.symptoms),visual=result(c,'visual'),fuel=result(c,'fuel'),ignition=result(c,'ignition'),cooling=result(c,'cooling'),change=result(c,'change'),intake=result(c,'intake'),compression=result(c,'compression');
 const urgent=c.severe||s.has('surchauffe');
 const hypotheses:Hypothesis[]=[];
 if(s.has('demarrage')||s.has('ratés')){
  hypotheses.push({id:'alimentation',title:'Alimentation à contrôler',for:[...(s.has('demarrage')?['Démarrage difficile']:[]),...(s.has('ratés')?['Ratés déclarés']:[]),...(fuel==='anormal'?['Contrôle d’alimentation signalé anormal']:[])],against:fuel==='normal'?['Contrôle d’alimentation déclaré normal, à confirmer selon la méthode utilisée']:[],missing:fuel?[]:['Résultat d’un contrôle adapté au modèle'],level:fuel==='anormal'?'Prioritaire à vérifier':fuel==='normal'?'Moins probable selon ce contrôle':'Piste à vérifier',source});
  hypotheses.push({id:'allumage',title:'Allumage à contrôler',for:[...(s.has('demarrage')?['Démarrage difficile']:[]),...(ignition==='anormal'?['Contrôle d’allumage signalé anormal']:[])],against:ignition==='normal'?['Contrôle d’allumage déclaré normal, à confirmer selon la méthode utilisée']:[],missing:ignition?[]:['Résultat d’un contrôle adapté au modèle'],level:ignition==='anormal'?'Prioritaire à vérifier':ignition==='normal'?'Moins probable selon ce contrôle':'Piste à vérifier',source});
  if(s.has('ratés'))hypotheses.push({id:'admission',title:'Admission ou prise d’air à examiner',for:['Fonctionnement irrégulier déclaré',...(c.recentChange.trim()?['Modification récente déclarée']:[]),...(intake==='anormal'?['Contrôle d’admission signalé anormal']:[])],against:intake==='normal'?['Contrôle déclaré normal, sans exclure un défaut intermittent']:[],missing:intake?[]:['Contrôle d’étanchéité adapté au moteur exact'],level:intake==='anormal'?'Prioritaire à vérifier':'Piste à vérifier',source});
  if(s.has('demarrage')&&fuel==='normal'&&ignition==='normal')hypotheses.push({id:'haut_moteur',title:'État du haut moteur à vérifier',for:['Démarrage difficile malgré deux contrôles déclarés normaux',...(compression==='anormal'?['Contrôle mécanique signalé anormal']:[])],against:compression==='normal'?['Contrôle mécanique déclaré normal']:[],missing:compression?[]:['Mesure de compression selon la notice exacte'],level:compression==='anormal'?'Prioritaire à vérifier':'Piste à vérifier',source});
 }
 if(s.has('surchauffe'))hypotheses.unshift({id:'refroidissement',title:'Refroidissement ou lubrification à examiner',for:['Surchauffe déclarée',...(cooling==='anormal'?['Contrôle signalé anormal']:[])],against:cooling==='normal'?['Contrôle déclaré normal']:[],missing:cooling?[]:['Examen par un atelier, moteur froid'],level:cooling==='anormal'?'Prioritaire à vérifier':'Piste à vérifier',source});
 if(s.has('bruit')||s.has('fuite'))hypotheses.unshift({id:'inspection',title:'Anomalie visible ou mécanique à localiser',for:[s.has('bruit')?'Bruit déclaré':'Fuite déclarée',...(visual==='anormal'?['Inspection visuelle signalée anormale']:[])],against:visual==='normal'?['Inspection extérieure déclarée normale, sans exclure une fuite cachée']:[],missing:visual?[]:['Localisation par un professionnel si nécessaire'],level:visual==='anormal'?'Prioritaire à vérifier':'Piste à vérifier',source});
 if(c.recentChange.trim())hypotheses.push({id:'changement',title:'Lien avec le changement récent à vérifier',for:['Modification déclarée : '+c.recentChange.trim().slice(0,160)],against:change==='normal'?['Comparaison sans anomalie déclarée']:[],missing:change?[]:['Comparer au dernier état fonctionnel'],level:'Piste à vérifier',source});
 if(urgent)return {stop:true,message:'Arrêtez la machine. Ne la redémarrez pas pour reproduire la panne ; faites-la examiner dans des conditions adaptées.',hypotheses,next:null,reason:'Signal de gravité déclaré par le propriétaire. Les contrôles dynamiques sont suspendus.'};
 if(fuel==='anormal'||ignition==='anormal'||cooling==='anormal'||visual==='anormal'&&(s.has('fuite')||s.has('bruit'))){
  return {stop:false,message:'Un contrôle a été signalé anormal. Faites confirmer l’anomalie et la réparation par un atelier avant de poursuivre les essais.',hypotheses,next:null,reason:'Une observation anormale réoriente le parcours ; elle ne prouve pas à elle seule la cause racine.'};
 }
 const sequence=c.recentChange.trim()?['visual','change','fuel','ignition','intake','compression']:['visual','fuel','ignition','intake','compression'];
 if(s.has('surchauffe'))sequence.splice(1,0,'cooling');
 if(!s.has('demarrage')&&!s.has('ratés')){for(const id of ['fuel','ignition']){const n=sequence.indexOf(id);if(n>=0)sequence.splice(n,1)}}
 if(!s.has('ratés')){const n=sequence.indexOf('intake');if(n>=0)sequence.splice(n,1)}
 if(!s.has('demarrage')||fuel!=='normal'||ignition!=='normal'){const n=sequence.indexOf('compression');if(n>=0)sequence.splice(n,1)}
 const nextId=sequence.find(id=>!result(c,id));
 const next=controls.find(x=>x.id===nextId)||null;
 const unresolved=c.observations.some(x=>x.result==='impossible'||x.result==='incertain');
 return {stop:false,message:next?'Un contrôle utile est proposé. Son résultat réel permettra de réévaluer les pistes.':'Aucun autre contrôle validé dans ce parcours pilote. Conservez les incertitudes et sollicitez un atelier si la panne persiste.',hypotheses,next,reason:next?`Choisi selon les symptômes et les ${c.observations.length} contrôle(s) déjà enregistrés.`:unresolved?'Un contrôle impossible ou incertain ne prouve ni panne ni absence de panne.':'Ce parcours ne suffit pas à établir une cause certaine.'};
}
