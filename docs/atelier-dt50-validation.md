# Validation Atelier DT50 / AM6

Date: 2026-09-26
Branche: 2t-expert-master

## Référence visuelle

La vue Atelier / Configuration a été reconstruite pour suivre le visuel de référence fourni :
- navigation sombre compacte,
- colonne machine et catégories à gauche,
- double zone 3D machine / moteur éclaté,
- rail horizontal de composants,
- panneau pièce à droite,
- configuration actuelle,
- jauges circulaires et barres qualitatives,
- presets de build,
- budget estimé,
- distinction Mesure / Calcul / Estimation / Qualitatif.

## Base pilote ajoutée

Machine: Yamaha DT 50 X 2011
Moteur: Minarelli AM6

Données intégrées :
- 49,7 cm3 origine,
- alésage/course 40,3 x 39 mm,
- boîte 6 rapports,
- refroidissement liquide,
- puissance homologuée publiée 2,8 ch,
- couple publié 3,3 Nm,
- carburateur 16 mm,
- poids tous pleins faits 104 kg.

Pièces intégrées dans le configurateur pilote :
- Airsal 80 Alu diamètre 50,
- Stage6 R/T PWK 28,
- admission Stage6 R/T / V-Force,
- échappement MOST Racing 70–80 AM6,
- allumage MVT Digital Direct DD21 Yamaha DT,
- transmission configurable.

## Validation du moteur de jauges

10 contrôles automatisés exécutés avec succès :
1. Cylindrée origine ~49,75 cm3.
2. Airsal diamètre 50 / course 39 -> ~76,58 cm3 géométriques.
3. L'indice puissance augmente avec le build Sport.
4. La réactivité augmente avec admission/carburation/allumage.
5. L'indicateur de fiabilité baisse avec une préparation plus poussée.
6. Une démultiplication plus courte augmente le couple géométrique à la roue.
7. Une démultiplication plus courte réduit la vitesse géométrique.
8. Une démultiplication plus longue augmente la vitesse géométrique.
9. Toutes les jauges restent bornées entre 0 et 100.
10. Le régime cible réagit aux composants sélectionnés.

Les valeurs de puissance et vitesse de la configuration Airsal restent affichées comme estimations et non comme mesures.
La feuille de banc Stage6 R/T 70 AM6 est utilisée uniquement comme référence de calibration séparée.
