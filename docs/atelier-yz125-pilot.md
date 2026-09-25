# Atelier Configuration — pilote YZ125 2026

Branche : `feature/atelier-configurator-yz125-pilot`

## Objectif
Implémenter le premier écran fonctionnel de l'Atelier Configuration selon le cahier v2 du 25 septembre 2026, sans inventer de gains.

## Machine pilote
Yamaha YZ125 2026 Europe/France.

Données constructeur utilisées :
- moteur 2T monocylindre liquide ;
- 125 cm³ ;
- alésage x course 54,0 x 54,5 mm ;
- Keihin PWK38S ;
- CDI ;
- boîte 6 rapports ;
- transmission finale par chaîne ;
- 96 kg tous pleins faits ;
- pneus 80/100-21 et 100/90-19 ;
- freins 270/240 mm ;
- empattement 1 445 mm ;
- réservoir 7 L.

Source principale :
https://www.yamaha-motor.eu/fr/fr/motorcycles/competition/pdp/yz125-70th-anniversary-edition/

## Vérité / simulation
Les jauges ne fabriquent pas de puissance, vitesse réelle ou accélération :
- cylindrée : calcul géométrique ;
- démultiplication : calcul géométrique ;
- vitesse en 6e : vitesse géométrique à régime et circonférence imposés ;
- effet pignon/couronne : calcul de rapport uniquement ;
- puissance/accélération/fiabilité universelle : N/D tant que les entrées et validations requises manquent ;
- effets de pots : tendances textuelles sourcées, sans addition de pourcentages publicitaires.

Les rapports primaire et 6e utilisés dans la démo viennent de la documentation Yamaha de la plateforme YZ125 2022. Ils sont traités comme hypothèse de plateforme à revalider pour 2026 :
https://global.yamaha-motor.com/jp/news/2021/0730/yz125.html

## Pièces pilotes
Compatibilités directes validées dans les sources consultées :
- Yamaha B4X-WB033-00-A0/B0/C0/D0 — kits piston 2026 ;
- Yamaha/GYTR BCR-E41C0-V0-00 — filtre à air YZ125 2002–2027 ;
- FMF 024076 Fatty — YZ125 2022–2026 ;
- FMF 024077 Factory Fatty — YZ125 2022–2026 ;
- FMF 024078 Factory Fatty Rev — YZ125 2022–2026 ;
- FMF 011311 — ressorts/joints pot, YZ125 2022–2026.

Candidats visibles mais non activables tant que la plage 2026 n'est pas prouvée :
- Moto Tassinari V4R04 ;
- Wiseco 899M05400 ;
- Works Connection radiator braces.

## Fonctionnalités UI
- états Origine / Actuelle / Projet A / Projet B ;
- sélection de pièces avec statut et source ;
- recherche et filtre catégorie ;
- undo / redo / reset ;
- duplication A/B ;
- export JSON du projet ;
- jauges calculées en temps réel ;
- panneau « Pourquoi ? » ;
- points limitants ;
- responsive desktop/mobile ;
- API GET `/api/atelier/pilot`.

## Limite volontaire du premier test
Le catalogue n'est pas présenté comme exhaustif. L'interface expose explicitement le niveau de preuve et bloque les candidats non suffisamment vérifiés.
