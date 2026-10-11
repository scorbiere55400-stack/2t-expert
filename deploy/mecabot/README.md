# MécaBot · service d'inférence autonome

Le Site conserve le dossier, les règles de sécurité et les pistes. Un serveur GPU dédié exécute le modèle Qwen3-4B avec vLLM. Aucune API commerciale de génération n'est appelée. Le fichier Compose est un point de départ à déployer sur un serveur GPU sous contrôle de l'éditeur, avec un nom de domaine HTTPS. Il n'est pas lancé par le Site.

1. Préparer un serveur Linux avec Docker, pilote NVIDIA et NVIDIA Container Toolkit, et une capacité GPU suffisante pour le modèle, le contexte et les requêtes concurrentes. Dimensionner et tester avant ouverture publique.
2. Pointer un sous-domaine privé d'usage applicatif vers ce serveur. Définir `MECABOT_DOMAIN` et `MECABOT_INFERENCE_TOKEN` (secret aléatoire long) dans l'environnement du serveur, puis lancer `docker compose up -d` depuis ce dossier. Ne pas commiter de fichier `.env` contenant le jeton.
3. Configurer dans les secrets du Site `MECABOT_INFERENCE_URL=https://<domaine>/v1/chat/completions`, `MECABOT_INFERENCE_TOKEN` avec le même jeton et, facultativement, `MECABOT_MODEL=Qwen/Qwen3-4B`.
4. Vérifier, depuis un compte connecté, un scénario normal puis une surchauffe, une fuite et une requête hors périmètre. Le mode guidé doit rester disponible si le service est indisponible. Vérifier les journaux sans enregistrer les questions ni les données personnelles.

Le Site n'envoie au service que la question, quelques tours de dialogue, le dossier utile et les notes éditoriales retenues. Le service n'est appelé que pour un utilisateur connecté et une demande mécanique ordinaire. La décision technique déterministe reste visible à droite. Ajouter une protection contre les abus et un quota utilisateur avant une montée en charge ; le jeton n'est jamais exposé au navigateur.

Le modèle ouvert et l'image d'inférence ont chacun leurs licences et cycles de mise à jour. Épingler et auditer l'image de production après essai, contrôler le domaine et les secrets, sauvegarder les dossiers applicatifs séparément. Les poids ne sont pas inclus dans ce dépôt.
