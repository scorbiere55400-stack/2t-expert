# 2T Expert

Plateforme technique dédiée aux moteurs deux temps, construite à partir du cahier des charges Master V10.

## Fonctions disponibles

- accueil et recherche universelle ;
- bibliothèque initiale de 63 machines couvrant 50 à 500 cm³ ;
- catalogue pilote de pièces OEM et aftermarket ;
- assistant mécanique explicable avec refus des conclusions insuffisamment étayées ;
- diagnostic guidé ;
- configurateur CURRENT / DRAFT avec compatibilités et budget ;
- garage et historique de configuration ;
- vue éclatée originale ;
- espace professionnel protégé par connexion ;
- Truth Layer distinguant VERIFIED, CALCULATED, ESTIMATED et UNKNOWN.

## Démarrage

Prérequis : Node.js 22.13 ou plus récent et pnpm 11.

```bash
pnpm install
pnpm dev
```

## Données et intelligence artificielle

Les contenus initiaux servent de couverture fonctionnelle et ne sont pas tous certifiés. Toute valeur technique importante doit conserver sa provenance, son niveau de confiance, son marché et sa plage d'application. Les champs inconnus restent inconnus.

L'assistant inclus fonctionne immédiatement en mode sûr à partir des règles et du contexte local. La connexion ultérieure à l'API OpenAI doit rester côté serveur et utiliser une clé stockée comme secret d'hébergement.
