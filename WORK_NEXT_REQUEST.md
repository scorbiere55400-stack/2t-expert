# Mission Work — implémentation complète du cahier technique OEM 2T Expert

Travaille directement sur le dépôt GitHub `scorbiere55400-stack/2t-expert`. Commence par auditer l'état réel du dépôt et le dernier commit. Une première fondation du schéma OEM a déjà été ajoutée dans `db/schema.ts`; conserve-la, corrige-la si nécessaire et poursuis l'implémentation.

## Source de vérité fonctionnelle
Implémenter le cahier technique "2T Expert — Bibliothèque véhicules, pièces OEM, éclatés interactifs et monétisation — v1.0 du 20 septembre 2026". Objectif : architecture indépendante des catalogues tiers reliant recherche de pièces, diagnostic IA, configurateur, éclatés SVG/3D et partenaires.

## Résultat attendu
Ne te limite pas à produire un plan. Modifie réellement le code, les migrations, les routes API, les composants UI, les tests/validations et la documentation. Exécute lint/build/tests disponibles et corrige les erreurs. Crée une branche de travail et une PR claire vers main, sauf si l'environnement Work impose un autre flux sûr.

## Architecture à mettre en place
- Vehicle Core : manufacturers, vehicle_models, vehicle_variants, engines, vehicle_engines.
- Parts Core : parts, oem_refs, part_oem_refs, supersessions.
- Fitment : compatibilités pièce/OEM vers véhicule et moteur, versionnées, avec source/preuve et niveau de confiance.
- Assembly : arborescence d'ensembles indépendante des marchands.
- Media : SVG/GLB/photos uniquement avec droits explicites.
- Source/Rights : sources, rights, evidence ; aucune publication média sans rights_status compatible.
- Commerce : merchants, offers, affiliate_clicks, conversions, données volatiles séparées du Core.
- AI/Diagnosis : symptômes, causes, contrôles et diagnostic/configurateur doivent référencer les IDs Core/part_id.

## Identifiants et règles
UUID internes stables. Ne jamais utiliser une référence OEM comme PK. Conserver reference brute et normalized_ref. Normalisation contrôlée (uppercase/trim/séparateurs pour recherche sans altérer la valeur source). Moteur distinct des véhicules. Unités SI. Conserver source, tolérance et confiance pour les valeurs importantes.

## API minimale
Implémenter :
GET /v1/vehicles
GET /v1/vehicles/{id}
GET /v1/vehicles/{id}/assemblies
GET /v1/assemblies/{id}/parts
GET /v1/parts/{id}
GET /v1/oem/{reference}
GET /v1/parts/{id}/offers
GET /v1/diagrams/{id}
POST /v1/fitment-feedback
POST /v1/affiliate/click
Les réponses doivent exposer source/confiance/droits quand pertinent. Ajouter validation, erreurs propres, pagination/rate-limit si compatible avec la stack.

## Éclatés
V1 SVG responsive avec viewBox stable, chaque groupe cliquable lié à part_id, survol/surbrillance, clic ouvrant le panneau pièce sans rechargement. V2 préparer glTF/GLB : mesh avec part_id dans extras, manifest léger, transformations d'explosion propriétaires par assembly, LOD et chargement à la demande. Ne pas copier un dessin constructeur protégé. Le panneau pièce regroupe specs, compatibilités, diagnostic lié, alternatives et offres.

## Ingestion / qualité / droits
Pipeline : véhicule+moteur -> source -> champs autorisés -> evidence -> normalisation/doublons/supersessions -> fitments+confiance -> validation humaine des modifications sensibles -> publication seulement si rights_status l'autorise -> revalidation périodique.
Confiances : manufacturer_verified, partner_verified, 2te_verified, community_supported, unverified, conflicting.
Droits : owned, licensed, public_domain, facts_only, link_only, permission_pending, prohibited. link_only n'est jamais recopié au CDN ; permission_pending/prohibited bloquent publication.
Ajouter contrôles automatiques : doublons OEM, années incohérentes, moteur absent, fitment orphelin, média sans rights_id, historique/audit et possibilité de rollback si réalisable.

## Données initiales
Commencer par un corpus AM6 réellement sourcé, puis préparer D50B0/EBE/EBS. Ne jamais inventer de références OEM ni de compatibilités. Les données non vérifiées restent explicitement unverified/UNKNOWN. Pour toute acquisition externe, vérifier licence/droits avant import et conserver la preuve/provenance. Un PDF gratuit n'implique pas un droit de republication.

## Commerce
Créer une interface d'adaptateur : searchByOEM(), getOffer(), getStock(), buildAffiliateLink(), createOrder() optionnel. Préparer BKarrazAdapter, AwinFeedAdapter, MerchantCsvAdapter sans fausses clés/API. Prix/stock TTL, déduplication merchant+SKU, last_success_at/last_error_at. Compatibilité avant disponibilité/prix/délai ; sponsorisé explicitement signalé. Ne jamais exposer de secret navigateur.

## Performance / sécurité
Conserver la stack actuelle lorsqu'elle est imposée par ChatGPT Sites/Cloudflare ; adapter intelligemment la cible PostgreSQL du cahier au runtime existant (D1 actuellement) et documenter le chemin de migration PostgreSQL plutôt que casser le déploiement. Indexer normalized_ref, engine_code, années/recherche. Cache lorsque pertinent. RBAC user/pro/contributor/moderator/data_editor/admin, audit des changements sensibles, validation stricte imports/URLs, rate limiting, secrets serveur, minimisation des données click/conversion, takedown.

## Critères d'acceptation
- Recherche OEM -> pièce canonique + compatibilités + source + confiance.
- Navigation pilote AM6 véhicule -> moteur -> assemblage -> pièce.
- SVG interactif cliquable -> fiche pièce sans reload.
- Aucun média publié sans rights_status.
- Architecture connecteur commercial fonctionnelle avec au moins un adaptateur de démonstration local/non trompeur si aucun contrat/API réel n'est disponible.
- Une panne externe ne casse pas le catalogue.
- Admin peut corriger une compatibilité avec preuve et historique.
- Diagnostic/configurateur pointe vers part_id.
- pnpm lint et pnpm build passent.

## Important
Ne prétends jamais qu'un catalogue, média, API ou partenariat est autorisé sans preuve. N'intègre pas de contenu constructeur protégé en le copiant. Utilise des assets propriétaires 2T Expert ou dûment licenciés. À la fin, fournis : fichiers modifiés, migrations, données réellement intégrées avec provenance, droits restant à obtenir, résultats lint/build/tests, limites restantes et URL/numéro de PR.