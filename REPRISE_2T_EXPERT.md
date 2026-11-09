# Reprise 2T Expert — 23 septembre 2026

## Projet canonique
- Site : https://deux-temps-expert-officiel.espace-de-tr-7344.chatgpt.site
- Projet Sites : appgprj_6aaff14bd3a881919331c29c35f07790
- Accès : propriétaire et éditeur partagé ; utiliser le même site, ne pas recréer de projet.
- Le dépôt GitHub scorbiere55400-stack/2t-expert et le site two-stroke-expert sont des copies anciennes. Ne pas écraser cette source avec ces copies.

## Travaux présents
- Catalogue pilote de 77 références factuelles Sherco 50 RS SM/END 2024 ; lib/sherco-parts.json conserve page PDF et repère. Ne pas prétendre avoir récupéré les 82 références de l'autre conversation.
- GLB moteur pédagogique original à 13 groupes, script reproductible scripts/build-engine.mjs ; aucune fidélité OEM ni donnée dimensionnelle certifiée.
- Recherche, filtres, fiches pièces, liens au PDF Sherco, export CSV.
- Authentification plateforme, favoris et communauté via D1 avec migration Drizzle ; vérifications locales et déploiement à terminer.
- Images corrompues remplacées par les originaux valides récupérés du premier site.

## Dernière demande utilisateur
Accueil accueillant et pro avec carrousel motos/marques ; communauté près de connexion ; emplacements publicitaires ; bibliothèque marque/modèle avec visuel à droite et fiche dessous ; cadrage 3D ; accès aux vraies planches constructeur et catalogue pièces ; configurateur moto générique 3D avec caméra centrée sur la pièce sélectionnée ; reprise entre espaces en cas de quota.

## Contraintes
- Ne jamais transformer un visuel IA en photo constructeur vérifiée.
- Les dessins constructeur restent sur le site d'origine tant qu'aucune licence de republication n'est fournie.
- Les pièces sourcées sont applicables au seul modèle et millésime indiqués.
- Supabase de l'autre compte n'est pas accessible via les outils présents. Ne pas inventer une migration de ses données.
- Sauvegarder sources et ce document dans le dépôt Sites avant la fin. Aucun secret dans les fichiers.

## État consolidé — 23/09/2026
- Accueil : trois illustrations originales de motos génériques, carrousel accessible (pause, navigation, mouvement réduit), ruban de marques lié à la bibliothèque.
- Communauté près du compte ; deux emplacements publicitaires réservés, aucune régie ni facturation activée.
- Bibliothèque : sélection marque/modèle, photo à droite, caractéristiques dessous. Cinq photos documentées dans MEDIA_CREDITS.json. Photos absentes : Sherco SM/END2024, KTM300EXC, BetaRR300, HondaCR250. Ne pas remplacer par des images d'autres modèles.
- Planches : PDF Sherco embarqué à la page sélectionnée, lien externe de secours, tableau de repères connecté au catalogue. Aucune reproduction OEM locale.
- Configurateur : GLB moto générique original, 17 zones, cadrage animé sur sélection, rotation libre, peinture modifiable, choix de références, export/import JSON. Ces choix ne substituent pas des géométries OEM. scripts/build-bike.mjs régénère le modèle.
- Moteur : cadrage basé sur les dimensions et le ratio de fenêtre ; recalcul à l'éclatement, à l'isolation et au redimensionnement.
- Compatibilités, prix, stocks, paiement, régie publicitaire, catalogues des autres modèles : non connectés. Ne pas annoncer une couverture exhaustive.

## Vérifications et reprise
- TypeScript sans erreur ; les deux GLB se chargent et possèdent 13 / 17 groupes ; les 77 entrées ont des identifiants uniques, une application explicite et une page officielle.
- Migration D1 initialisée localement (6 instructions réussies).
- L'aperçu supervisé n'a pas démarré après deux tentatives : contrôle visuel et test navigateur final non effectués pour cette révision. Ne pas prétendre un test mobile réel.
- Pour reprendre : ouvrir le Site canonique dans un espace ayant accès éditeur, récupérer sa dernière source Sites, lire ce fichier, inspecter la dernière version et l'état du déploiement. Ne pas utiliser un ancien ZIP ou la copie GitHub comme source principale.
- Le passage entre espaces ne transfère pas automatiquement les conversations ni les connexions Supabase. La source du Site, ce journal et les exports de configuration fournissent le point de reprise.
- Étapes restantes si une interruption survient avant publication : vérifier le build, pousser la source via le workflow Sites, enregistrer l'archive et déployer en conservant l'audience publique actuelle. Consulter les versions pour éviter un double déploiement.

## Correction visuelle — reprise du 23/09/2026
- Base conservée : version publiée 2, commit 4a4b4a30f1ed59cf7235aaa1a7ad52711c52aded. Les travaux non publiés de l'autre checkout ne remplacent pas cette base.
- Accueil : six photographies réelles CC BY-SA (50, scooter, enduro, trial, cross, route), crédits visibles et PHOTO_CREDITS.json.
- 3D : surface de rendu isolée des enfants React pour empêcher son effacement à la fin du chargement. Repli SVGRenderer sur les véritables GLB allégés si WebGL est absent ou perdu ; mêmes sélections et caméra. Rendu à la demande au repos. Rotation interrompue à l'interaction.
- Configurateur : sélection multiple des références par ensemble, stockage local distinct par machine, export/import conservés. Comparaison interactive de démultiplication avec valeurs d'exemple explicitement identifiées, formules consultables. Aucun gain de puissance aftermarket inventé.
- Fiches : les quatre photos libres antérieures sont conservées ; YZ125 illustrée par une photo CC BY-SA ancienne, clairement différente du millésime de la fiche. La photo constructeur réservée n'est plus affichée. Les images générées spécifiques à chaque modèle demandées par l'utilisateur n'ont pas été retrouvées avec des correspondances vérifiables. Les illustrations génériques récupérées restent dans l'atelier et le dépôt.
- Validation navigateur : moto visible sans WebGL, moteur chargé, piston sélectionné et isolé, sélection de deux pièces, comparaison 13/52 vers 13/52 = zéro variation sur les trois indicateurs. Photos locales toutes décodées, image d'accueil chargée, navigation trial contrôlée.
- Limites persistantes : corpus de compatibilités uniquement Sherco 2024 ; pas de courbes de banc ni gains de puissance prouvés ; géométries pédagogiques, non CAD OEM. Aucune garantie de fonctionnement sur tout appareil.
