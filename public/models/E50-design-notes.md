# 2T Expert E50 — assemblage CAO original, révision 1

## Nature du livrable
Conception numérique originale sans marque, et non reproduction mesurée d'un
moteur commercial. Solides paramétriques CadQuery/OpenCascade exportés en STEP.
Le GLB interactif est tessellé à partir de ces mêmes solides, sans géométrie de
substitution. L'assemblage est une étude de présentation technique.

## Architecture retenue
Monocylindre deux temps, admission à clapets, refroidissement par air,
alésage nominal 40 mm, course 39,8 mm, cylindrée géométrique 50,01 cm³,
bielle 85 mm. Embrayage centrifuge, sortie par pignon : aucune boîte de vitesses.
Position statique à 60 degrés de vilebrequin. L'animation de l'atelier déplace
les composants pour l'inspection ; elle ne simule pas la combustion.

## Détails réellement modélisés
Demi-carters creux, logements de roulements, passages et fixations ; roulements
à billes séparées ; vilebrequin assemblé ; bielle et aiguilles ; piston creux,
gorges, segments ouverts, axe et circlips ; cylindre à ailettes avec chemise,
lumières et canaux ; chambre de culasse, joints et goujons ; éléments de bougie ;
admission et clapets ; carburateur avec boisseau, aiguille, flotteur et gicleur ;
volant et stator ; embrayage et sortie ; échappement creux et silencieux perforé.

## Limites avant fabrication
Pas de validation de fonctionnement, puissance, fiabilité ou conformité.
Les filetages sont nominaux sans hélice. La denture de chaîne, les ajustements,
les cotes de distribution, la carburation, les masses d'équilibrage, le tarage des
ressorts d'embrayage, le système de démarrage, le faisceau d'allumage, les colliers,
la fixation sur un châssis et les soudures ne sont pas un dossier de fabrication.
Les dimensions de l'échappement sont une étude géométrique, pas un calcul de
résonance pour un régime cible. Un motoriste doit revoir cinématique complète,
jeux, dilatation, résistance, lubrification, étanchéité et dissipation thermique.
Ne pas utiliser ce fichier comme instruction de modification d'un véhicule.

## Fichiers
E50-assembly.step : tous les composants nommés et positionnés (millimètres).
parts/*.step : composants indépendants dans les coordonnées d'assemblage.
parts.json : nomenclature numérotée, familles, enveloppes et volumes.
build-engine-cad.py : source paramétrique reproductible (CadQuery 2.7.0).

## Droits
Géométrie et source originales créées pour 2T Expert. Aucun modèle commercial
ni logo tiers n'est utilisé. La source utilise CadQuery sous ses propres licences.
