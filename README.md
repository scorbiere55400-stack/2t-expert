# 2T Expert

Plateforme technique dédiée aux moteurs deux temps, construite à partir du cahier des charges Master V10.

## Projet canonique unique

**Source de vérité officielle :** `scorbiere55400-stack/2t-expert`  
**Branche de référence :** `main`

Tous les espaces de travail, collaborateurs, environnements de développement et déploiements doivent partir de ce dépôt et revenir vers cette même branche de référence. Aucun nouveau dépôt « 2T Expert », clone de projet, copie de production ou variante parallèle ne doit être créé pour poursuivre le développement.

Règle de travail :
1. récupérer les dernières modifications de `main` avant de commencer ;
2. travailler dans ce dépôt uniquement ;
3. utiliser une branche temporaire uniquement pour une modification isolée si nécessaire ;
4. réintégrer toute modification validée dans `main` ;
5. considérer `main` comme l'unique version courante du produit ;
6. ne jamais maintenir une seconde copie indépendante de 2T Expert.

Les anciens noms, prototypes ou déploiements parallèles ne constituent pas des projets de référence et doivent rester supprimés ou désactivés lorsqu'ils ne servent plus.

## État fonctionnel actuel

- accueil et recherche universelle ;
- bibliothèque initiale de 63 machines couvrant 50 à 500 cm³ ;
- catalogue pilote de pièces OEM et aftermarket ;
- assistant mécanique explicable avec refus des conclusions insuffisamment étayées ;
- diagnostic guidé ;
- configurateur CURRENT / DRAFT avec compatibilités et budget ;
- atelier de configuration avec sélection de pièces ;
- jauges de tendance et indicateurs calculés/qualitatifs ;
- visualisation interactive de la machine et du moteur 2T ;
- garage et historique de configuration ;
- vue éclatée originale ;
- espace professionnel protégé par connexion ;
- Truth Layer distinguant VERIFIED, CALCULATED, ESTIMATED et UNKNOWN.

## Démarrage

Prérequis : Node.js 22.13 ou plus récent et pnpm 11.

```bash
git clone https://github.com/scorbiere55400-stack/2t-expert.git
cd 2t-expert
git checkout main
git pull origin main
pnpm install
pnpm dev
```

Avant toute nouvelle session de travail :

```bash
git checkout main
git pull origin main
```

Contrôles avant livraison :

```bash
pnpm lint
pnpm build
```

## Données et intelligence artificielle

Les contenus initiaux servent de couverture fonctionnelle et ne sont pas tous certifiés. Toute valeur technique importante doit conserver sa provenance, son niveau de confiance, son marché et sa plage d'application. Les champs inconnus restent inconnus.

L'assistant inclus fonctionne immédiatement en mode sûr à partir des règles et du contexte local. La connexion ultérieure à l'API OpenAI doit rester côté serveur et utiliser une clé stockée comme secret d'hébergement.

## Architecture

- Next.js et TypeScript ;
- configuration de déploiement versionnée avec le projet ;
- architecture prête pour base de données persistante et migrations ;
- source de vérité unique : dépôt GitHub `scorbiere55400-stack/2t-expert`, branche `main`.

Le code, les données structurées et les actifs doivent rester dans cette source de vérité unique. Les médias protégés ne doivent pas être ajoutés sans licence ou autorisation.
