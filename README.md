# 2T Expert — site officiel

Application React/TypeScript Vinext, moteur et moto interactifs Three.js, catalogue pilote Sherco 2024, communauté et favoris D1 avec authentification ChatGPT.

Lire **REPRISE_2T_EXPERT.md** avant toute reprise. Ce dépôt Sites est la source canonique. MEDIA_CREDITS.json contient les attributions photographiques.

## Développement
`npm run dev` utilise le profil d'exécution de l'environnement. `npm run build` produit un Worker Cloudflare et les fichiers client. Les migrations D1 se trouvent dans `drizzle/` et sont appliquées par l'hébergement Sites.

`node scripts/build-engine.mjs` puis `node scripts/build-bike.mjs` régénèrent les deux modèles pédagogiques GLB. Ils ne représentent pas des modèles constructeur certifiés.

## Données
77 références du catalogue officiel Sherco 50 RS END/SM2024, pages PDF25–29. Une application à un autre véhicule ne doit jamais être déduite automatiquement. Pas de prix ni stock marchands connectés.

Les configurations s'exportent en JSON et peuvent être réimportées pour la même machine. Les favoris et publications authentifiés résident dans D1. Aucun historique Supabase de l'autre espace n'a été migré.
