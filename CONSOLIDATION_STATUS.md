# 2T Expert — État de consolidation

Date: 2026-09-25

## Références verrouillées

- Projet maître GitHub: `scorbiere55400-stack/2t-expert`
- Branche de développement maître: `2t-expert-master`
- Site de référence à préserver: `https://deux-temps-expert-officiel.espace-de-tr-7344.chatgpt.site`
- Déploiement Vercel: environnement de test uniquement, non canonique

## État actuel

La branche maître contient désormais:
- l'accueil et la navigation actuels,
- l'Atelier / Configuration,
- le prototype de viewer 3D GLB/WebGL,
- la sélection de pièces et la surveillance par catégorie,
- les jauges calculées,
- les données pilote Yamaha YZ125 2026,
- le catalogue de pièces qualifiées/candidates,
- les fonctions de sauvegarde, duplication, annulation/rétablissement et export,
- le contexte diagnostic Atelier.

Les dépendances d'images ajoutées uniquement pour le test Vercel ont été retirées de la branche maître.
Les médias reviennent à des chemins locaux `/public/assets` afin que le projet reste portable et autonome.

## Ce qui est validé techniquement

- Rotation 360° et zoom du viewer 3D.
- Rotation automatique arrêtable.
- Synchronisation de la catégorie de pièce sélectionnée avec la surveillance visuelle.
- Calcul géométrique de transmission séparé des estimations non vérifiées.
- Références de pièces avec niveaux de preuve.
- Protection contre l'invention de valeurs de puissance ou vitesse réelle.

## Ce qui reste à faire avant migration définitive

1. Comparer visuellement chaque section avec le site ChatGPT officiel.
2. Remplacer les modèles 3D génériques par des modèles fidèles aux machines ciblées.
3. Construire un moteur éclaté composé de sous-objets sélectionnables individuellement.
4. Relier chaque mesh 3D à une référence pièce et à sa fiche technique.
5. Étendre la base véhicules et pièces au-delà du pilote YZ125.
6. Vérifier la chaîne Diagnostic et IA en condition réelle.
7. Tester responsive, performances et erreurs navigateur.
8. Publier une version de validation sur la cible officielle.
9. Supprimer l'ancien projet uniquement après validation fonctionnelle complète.

## Règle de non-régression

Aucune publication ne doit remplacer le site officiel tant qu'une comparaison fonctionnelle et visuelle n'a pas été validée.
