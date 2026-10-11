# Catalogue de pièces 2T Expert

Édition du 27 septembre 2026. Import de `bibliotheque_pieces_2T_Expert`, complété par les 77 repères Sherco 50 RS SM / END 2024 préexistants.

- `public/parts-data/index.json.gz` : index de recherche de 14 202 références. Chargé uniquement dans l’onglet Pièces.
- `public/parts-data/details/*.json.gz` : dossiers complets par référence, avec toutes les offres et les 32 479 lignes d’application (dont 77 Sherco).
- `public/parts-data/machines.json.gz` : couverture des 1 251 entrées du répertoire.
- `public/parts-data/sources.json.gz` : les 490 fiches de provenance, dont leur URL, date et empreinte.
- `public/parts-data/meta.json` : comptages et date de l’édition.

La correspondance entre une référence et une machine est **proposée** ; aucune installation n’est marquée vérifiée. Les prix et stocks sont des relevés datés, sans flux temps réel. La référence vendeur reste distincte de la référence fabricant. Les 77 repères Sherco sont conservés avec leur microfiche et ne sont pas fusionnés avec des références marchandes sans identité établie.

Pour actualiser le corpus, exécuter `python scripts/import-parts-library.py CHEMIN_DU_ZIP`. Le script contrôle l’empreinte du fichier source, les identifiants et les liens au répertoire, puis reconstruit les fichiers compressés. Conserver l’ancien corpus dans l’historique Git ; un fournisseur peut retirer une référence qui reste utile pour la recherche.

Aucune image marchande, URL d’affiliation ou compatibilité garantie n’est générée par l’import.
