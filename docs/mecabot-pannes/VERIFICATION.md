# Vérification du paquet

Vérification des données réalisée le 10 octobre 2026.

- 80 fiches et 28 identifiants de source uniques.
- JSON et JSONL lisibles; variantes du corpus cohérentes.
- Toutes les fiches, tous les chunks et tous les cas de test renvoient à des identifiants existants.
- 80 lignes de données dans le CSV; catalogue HTML contenant le même corpus.
- Index SQLite construit et contrôle d’intégrité réussi.
- Recherche SQLite vérifiée avec et sans accent, sur plusieurs termes et avec filtre d’application.
- 24 cas synthétiques préparés, sans résultat MécaBot déclaré.
- Les fichiers de l’archive sont accompagnés d’empreintes SHA-256 dans MANIFEST.json. Le manifeste ne peut pas contenir sa propre empreinte.

Exécuter `python3 verifier.py` après décompression pour vérifier les données, l’index et les empreintes. Exécuter `python3 import_sqlite.py` pour recréer l’index; sa nouvelle représentation binaire peut différer, ce qui nécessite une mise à jour des empreintes.

Le code JavaScript du catalogue a été exécuté avec un DOM de test pour vérifier recherche, accents, filtre, absence de résultat et réinitialisation. Un navigateur graphique n’était pas disponible dans l’environnement; le rendu visuel et les interactions natives n’ont donc pas été vérifiés dans un navigateur réel.

Ces vérifications n’établissent ni la justesse d’une réparation sur un moteur donné, ni la conformité d’une procédure d’atelier, ni la performance de votre MécaBot. L’intégration et l’évaluation de ses réponses restent à réaliser dans votre application. Les liens documentaires ne sont pas garantis disponibles en permanence; la source CDI Electronics a été lue par extrait indexé, avec PDF inaccessible.
