# Point de reprise — Atelier & Configuration · 2T Expert

Date : 24 septembre 2026. Projet Sites : `appgprj_6aaff14bd3a881919331c29c35f07790`.
Site : https://deux-temps-expert-officiel.espace-de-tr-7344.chatgpt.site/

## Demande et source

Reconstruire intégralement la page Atelier & Configuration, puis publier. Directives en 11 pages : `directives_configurateur_2_temps.pdf`, document transmis dans la conversation, identifiant de fichier de session `libfile_ca231adc41108191afb7a5730806d10f`. Il faut récupérer la pièce jointe dans l'espace de travail concerné si elle n'est plus disponible. L'accueil et son carrousel doivent rester intacts.

## Réalisation

- La page est ouverte par l'onglet « Atelier & Configuration » du site existant. Ancien configurateur et ancien comparateur de performance retirés du parcours.
- Garage : sélection de trois machines pilotes ou recherche dans 195 entrées de familles documentaires, saisie millésime/version/marché/code moteur/transmission/alimentation, état initial connu ou inconnu, photo personnelle locale JPEG/PNG/WebP recodée sans métadonnées, cadrage et suppression.
- Onglets Vue globale, Moteur & pièces, Carburation, Transmission ; catalogue sourcé de 77 références Sherco SM 2024, pièces personnelles explicitement non vérifiées, journal d'essais, variantes A/B, annulation/rétablissement, retour à la référence.
- Calculs stricts : cylindrée géométrique, vitesse géométrique au régime choisi, variation des rapports et de l'effort relatif à la roue à couple moteur identique. Pas de puissance, couple, accélération ou vitesse maximale estimés sans mesures validées. Les chemins boîte, CVT scooter et variateur cyclomoteur restent séparés.
- Projet enregistré localement, échange JSON, impression/enregistrement PDF via le navigateur, résultats accessibles sur mobile. Photo volontairement privée et absente du JSON.

## Données et limites documentées

- Les 195 entrées `data/spec-directory.json` sont des familles parfois regroupées ; elles ne constituent pas 195 configurations exactes compatibles. Aucune pièce ne leur est associée automatiquement.
- Sherco 50 RS SM 2024 : seules les références constructeur correspondantes sont proposées ; une modification de l'identité enlève les références catalogue déjà ajoutées et demande une nouvelle référence de mesures. Code moteur réel et adéquation physique de chaque montage restent à confirmer.
- Yamaha Aerox 50 2T 2011 et Peugeot 103 SPX-LC 1988 sont des parcours pilotes de transmission ; année, version et moteur doivent être vérifiés sur la machine. Leurs images sont des visuels de famille, pas une preuve d'identification.
- Synchronisation de comptes, administration éditoriale du catalogue, import CSV/JSON de catalogue partagé, puissances et accélérations validées sont des lots futurs dépendant de données vérifiées et de droits d'édition. L'export JSON individuel fonctionne dès maintenant.

## Sources de code

- `components/workshop-configurator.tsx` : interface et persistance locale.
- `lib/workshop-calculations.ts` : calculs purs.
- `lib/workshop-data.ts` : pilotes, familles, catalogue.
- `app/globals.css` : style responsive et impression.
- `app/page.tsx` : insertion dans la navigation existante.

## Vérification et reprise

`npx tsc --noEmit --pretty false` et `node /root/.codex/plugins/cache/openai-curated-remote/sites/0.1.71/scripts/build-site.mjs` ont réussi. Parcours d'aperçu vérifié : boîte 12→13 dents à paramètres identiques, vitesse géométrique 66,5→72,0 km/h (+8,3 %), effort relatif −7,7 %, puissance non estimée. L'édition de l'année vers 2023 retire les références OEM 2024.

Pour reprendre dans un autre espace : ouvrir le site existant par l'ID ci-dessus avec le plugin Sites, récupérer sa source Git, lire ce document et le PDF, continuer depuis `components/workshop-configurator.tsx`. Ne pas recréer un nouveau Site pour le même projet. Vérifier la version déployée et le dernier commit de la branche avant de modifier. Les projets JSON exportés par les utilisateurs sont portables ; le brouillon local et les photos IndexedDB dépendent du navigateur d'origine.
