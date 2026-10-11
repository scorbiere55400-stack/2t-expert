# Intégration à MécaBot

La forme recommandée est une base documentaire interrogée avant la réponse (RAG). Importer les documents ne réentraîne pas les paramètres du modèle. Le contenu ne constitue pas un jeu d’exemples de réparations effectivement réussies.

## Import

1. Décompresser l’archive. Pour un outil qui accepte des documents, importer BIBLIOTHEQUE.md et conserver sources.json avec les identifiants. Si Markdown n’est pas accepté, convertir ce texte sans perdre les références.
2. Pour un pipeline RAG, importer rag_chunks.jsonl: un objet par ligne, text comme contenu, id comme identifiant stable et metadata comme filtres. Ce JSONL générique n’est pas garanti compatible avec l’importeur de votre application sans adaptation.
3. Pour une application sur mesure, pannes.jsonl est le corpus canonique structuré. diagnostics.csv est une vue tabulaire. Ne pas indexer simultanément toutes les variantes: cela dupliquerait les mêmes connaissances.
4. Ne pas indexer lacunes_a_documenter.json, evaluation.jsonl ou les journaux comme des faits de réparation. Leur fonction est différente.
5. SQLite est une option locale: `python3 import_sqlite.py`. Recherche: `python3 import_sqlite.py --search "bougie"`. L’index lexical fourni n’est pas un moteur sémantique et ne remplace pas les filtres d’applicabilité.

## Contrat de réponse suggéré

Recueillir marque, modèle, année, alimentation, lubrification, refroidissement, modifications, circonstances et interventions récentes. Un domaine technique de source ne remplace pas l’applicabilité propre à la fiche.

Présenter: observations connues → hypothèses conditionnelles → contrôle discriminant → réparation si confirmée → contrôle final. Citer l’identifiant et l’URL de chaque fiche utilisée. Nommer les incertitudes. Ne pas présenter l’ordre éditorial des tests comme une prescription constructeur.

Si l’applicabilité n’est pas établie, demander l’information manquante. Si une procédure ou une valeur précise est nécessaire, retrouver le manuel du moteur exact avant de la donner. Ne pas inventer compression minimale, jeu, couple, pression de test, résistance, tension, avance, régime ou pourcentage d’huile. Ne jamais transformer une valeur spécifique en règle générale.

Une page indexée dont le PDF est inaccessible a une traçabilité plus faible: le signaler, et vérifier l’OEM avant intervention. Les sources qui traitent aussi de 4T n’autorisent pas la transposition de leurs tableaux automobiles, segments racleurs ou procédures de soupapes.

## Exemple de configuration documentaire

```json
{
  "corpus": "rag_chunks.jsonl",
  "id_field": "id",
  "text_field": "text",
  "metadata_field": "metadata",
  "required_filters": ["applications"],
  "cite_fields": ["source_ids"],
  "exclude_files": ["evaluation.jsonl", "lacunes_a_documenter.json"]
}
```

Cette configuration décrit un contrat d’import; elle n’est pas le fichier de configuration réel d’un logiciel identifié.

## Évolution contrôlée

Enregistrer une observation réelle avec le modèle exact, les conditions, mesures/unités/méthodes, panne confirmée, intervention et résultat. Employer journal_intervention.template.json. Une hypothèse ou une réponse du bot reste non validée. Une observation isolée ne devient pas automatiquement une loi générale.

Proposer chaque nouvelle fiche avec ses sources et sa portée; la garder hors index tant que ses preuves ou son applicabilité sont insuffisantes. Faire relire par une personne compétente. Versionner les corrections, préserver les anciens identifiants et tracer qui a validé quoi. Définir un événement de relecture lors d’une nouvelle révision OEM ou d’une contradiction signalée.

Tester le bot avec evaluation.jsonl avant publication et après toute modification. Ces cas sont synthétiques. Leur correction exige une revue des réponses, pas seulement une comparaison de mots-clés. Les tests livrés valident les fichiers et l’index; ils ne valident pas encore votre MécaBot.

## Critères de publication proposés

- Toutes les fiches récupérées sont compatibles avec le moteur identifié.
- Chaque conclusion technique conserve sa référence et son caractère conditionnel.
- Une donnée chiffrée cite un document applicable avec unité et méthode.
- Aucun essai aggravant n’est conseillé face à grippage, fuite, immersion ou surchauffe.
- Les nouveaux retours réels gardent leur statut de validation.

L’intégration effective dépend de l’architecture de MécaBot, qui n’a pas été fournie ici.
