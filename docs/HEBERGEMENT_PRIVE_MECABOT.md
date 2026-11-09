# 2T Expert : environnement privé

Le site conserve son hébergement Sites et son dépôt source natif, sans activation d'un nouvel abonnement. L'accès est restreint aux comptes de Stéphane déjà autorisés dans la politique du site. Administration : /admin, compte : /espace. Les autorisations du site et les autorisations administrateur des API sont distinctes.

Le catalogue, l'atelier, les dossiers et le mode diagnostic guidé sont conservés. Le laboratoire propose les fiches générales actives du corpus de sources primaires du 10 octobre 2026. Les fiches en quarantaine et les données spécifiques aux modèles ne sont pas incluses dans cette recherche générale.

Le prototype Qwen3-4B et son adaptateur de démonstration restent dans Colab/Drive. L'entraînement de huit étapes confirme la chaîne technique, pas une expertise. Aucun service GPU permanent n'est connecté à ce site. Les variables serveur MECABOT_INFERENCE_URL et MECABOT_INFERENCE_TOKEN existent pour un futur service GPU HTTPS authentifié, après évaluation ; elles ne doivent jamais figurer dans le navigateur.

Les exemples de l'administrateur sont persistés dans D1. Seuls les exemples explicitement validés sont exportés au format JSONL messages, sans identifiants de comptes. Aucun apprentissage automatique n'est lancé lors d'une sauvegarde. Les retours utilisateur restent séparés. Relire les données et retirer les renseignements personnels avant export. Conserver un jeu d'évaluation hors entraînement.

Les modifications de code continuent depuis ChatGPT avec Sites. Un outil MCP de lecture documentaire et de consultation du laboratoire est fourni ; sa connexion demande l'installation du plugin personnel du site. La connexion effective ne peut être annoncée qu'après un appel réel.


## Connexion OpenAI — 11 octobre 2026

Le dialogue prend désormais en charge l’API Responses OpenAI en plus du service GPU existant. `OPENAI_API_KEY` est une configuration serveur secrète ; `MECABOT_OPENAI_MODEL` sélectionne le modèle OpenAI (défaut : `gpt-5.4-mini`). `MECABOT_MODEL` reste réservé au GPU pour préserver sa configuration.

Avec une clé OpenAI serveur, OpenAI est prioritaire. Sans cette clé, le GPU existant reste sélectionné s’il est configuré ; sinon le mode guidé demeure disponible. Les demandes graves, hors périmètre, sans identité et les limites d’usage ne déclenchent pas d’appel au modèle. Les erreurs de crédit API reviennent au mode guidé avec un message explicite ; aucun nouvel essai automatique payant n’est lancé.

Le contexte envoyé contient uniquement les fiches générales admissibles, le dossier courant et les six derniers messages. `store:false` est transmis à Responses ; cela ne prétend pas désactiver tous les journaux du fournisseur. La prochaine vérification déterminée par le moteur est affichée séparément de la reformulation du modèle.

Les dossiers utilisent toujours la base D1 existante et les opérations par `user_id`. Le bouton d’enregistrement sauvegarde les messages avec le dossier dans le compte ; la copie locale reste disponible. Aucun apprentissage des poids ni promotion automatique des retours n’est ajouté.

Une clé dédiée a été vérifiée séparément : accès à la liste des modèles accepté, génération refusée avec `credit_balance_exhausted`. La création d’une clé ne recharge pas le compte API et la présence d’une clé n’atteste pas une génération réussie. Configurer la clé comme secret Sites avant l’activation en production ; ne jamais l’intégrer au dépôt, à l’archive de déploiement ou au navigateur.

Validation : tests de routage OpenAI/GPU, absence de crédit, absence d’identité, arrêt prioritaire, limites d’usage, requêtes malformées et réponses incomplètes ; tests du laboratoire documentaire et du diagnostic existants. Aucun essai mécanique en atelier ni expertise autonome n’est attesté par ces tests.
