# MécaBot — demandes et préparation de l’apprentissage

Version : 11 octobre 2026. Branche cible : `2t-expert-master`.

Le bouton Diagnostic de l’Atelier et l’onglet MécaBot ouvrent maintenant un formulaire de triage. L’API `/api/mecabot/triage` recueille les symptômes et la configuration réelle, propose jusqu’à trois questions et affiche les fiches documentaires applicables. Les signes de danger suspendent les essais et masquent les procédures actives.

Le moteur actuel utilise des règles de routage, sans fournisseur d’IA, GPU ni entraînement des poids. Les 80 fiches sont des synthèses documentaires non validées en atelier. Les références de carburateur, de lubrification et de modèle doivent correspondre à la machine. L’injection TPI/TBI requiert sa documentation spécifique. L’export d’un cas reste local et marqué `proposed`, `training_eligible: false` : il ne modifie aucune connaissance automatiquement.

## Étude

230 expressions éditoriales sont proposées dans sept langues ; elles restent à mesurer. Le corpus de demande contient 13 fils distincts, 11 sites et six langues. Il s’agit d’un échantillon raisonné non représentatif, sélectionné par symptômes. Compter un fil une seule fois et une intention principale par fil ; ni les réponses ni les pages ne sont des demandes indépendantes. Les réponses de forum ne sont pas des preuves techniques.

Les priorités sont éditoriales : démarrage, calage, puissance et signes de dommage ; puis carburation et lubrification ; puis contrôles spécialisés et documentation. Les volumes mensuels sont `null`. Une collecte française a donné dix suggestions publiques le 10 octobre ; une nouvelle collecte de 35 amorces multilingues a retourné HTTP 403 le 11 octobre. Trends a retourné HTTP 429. Ces erreurs ne signifient pas zéro recherche. Aucun « premier besoin mondial » n’est affirmé.

## Corpus et évaluation

`data/mecabot/training_curated.jsonl` contient 58 exemples synthétiques français, pédagogiques et à revoir avant apprentissage. `evaluation_rubrics.jsonl` contient 15 scénarios distincts avec critères humains. Le corpus présente des gabarits répétés ; ne pas l’assimiler à des réparations validées. Il enseigne la conduite du triage et les limites des conclusions. Les mots-clés étrangers servent au routage ; aucun entraînement multilingue complet n’est annoncé.

Avant un entraînement : relire/sourcer les exemples, enrichir avec des dialogues multi-tours validés, séparer les groupes de scénarios entre entraînement et test, choisir le modèle et son format d’import. Évaluer l’applicabilité et la fidélité des citations, l’absence de valeurs inventées, la gestion des dangers et le choix du prochain contrôle. La validation du routage ne vaut pas validation mécanique.

## Vérification

- `node scripts/test-mecabot.mjs` : 33 contrôles de routage, limites, sources et corpus.
- `node_modules/.bin/tsc --noEmit` : typage.
- ESLint ciblé sur les nouveaux modules : qualité du code.
- `node_modules/.bin/vinext build` : compilation du site et de l’API.

Le site officiel reste à publier séparément après vérification du rendu ; cette adaptation du dépôt ne prétend pas à un déploiement ni à un apprentissage exécuté.
