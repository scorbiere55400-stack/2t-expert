# Point de reprise — bibliothèque de fiches 2T Expert

Mise en œuvre à partir des documents transmis le 24 septembre 2026 :

- `public/docs/repertoire_deux_roues_2_temps.pdf` : 195 entrées (32 C, 1 A, 67 D, 95 R), pages 3 à 14. Les entrées sont souvent des *familles* avec plusieurs modèles, pas 195 fiches d'exemplaires précisément identifiés.
- `public/docs/repertoire_moteurs_2_temps_deux_roues.pdf` : 114 entrées M001–M114 (30 C, 67 H, 15 H*, 1 A, 1 P), pages 4 à 17.
- `data/spec-directory.json` : transcription structurée, statuts, catégories, cylindrées nominales, descriptions, architecture moteur, identifiants bibliographiques, pages, quelques correspondances explicites et médias photographiques vérifiés.
- `components/spec-directory.tsx` et `app/globals.css` : recherche, filtres, pagination, fiches imprimables, liens vers les PDF et navigation véhicule/moteur. L'onglet « Fiches techniques » ouvre ce répertoire ; les anciennes fiches enrichies restent dans un panneau repliable.
- 9 entrées véhicules ont une ou plusieurs photos d'exemples identifiés ; 4 moteurs ont un détail photographique visible sur un véhicule authentique. Les autres signalent l'absence de photo plutôt que d'afficher un autre modèle. Les crédits et liens des photos sont portés dans le JSON. Les photos d'exemple ne prouvent pas toutes les variantes de la ligne.
- 18 liens véhicule–moteur ont été retenus avec portée textuelle (par exemple Booster → M019, Aerox → M018 ; 103 → M003). Ils ne garantissent pas la compatibilité d'une pièce ou d'un millésime. Les correspondances non établies restent ouvertes.

## À poursuivre

1. Identifier année, sous-version et code moteur de chaque modèle avant de transformer une famille du PDF en fiche propre à une variante.
2. Ajouter des photos de véhicules et de moteurs à licence vérifiée, avec source et millésime, uniquement pour le modèle correspondant ; les deux PDF fournis n'intègrent pas ces images.
3. Vérifier les caractéristiques absentes des PDF (alésage, course, puissance, boîte, huile, etc.) dans les manuels constructeur pertinents avant de les publier.
4. Ajouter de nouveaux liens moteur seulement quand le code et la variante sont confirmés ; ne pas généraliser une association de famille à toute la gamme.

Le site héberge les PDF d'origine et toutes les données structurées dans son dépôt source. La version du site publiée à l'issue de cette modification constitue le point de reprise dans tout espace connecté à ce même Site.
