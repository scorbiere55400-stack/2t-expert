# Reprise et audit · Atelier et Diagnostic 2T Expert

Date : 25 septembre 2026. Document de référence : `cahier_atelier_diagnostic_ia_deux_temps_expert.pdf`, version 2.0 du 25 septembre 2026. Site existant `appgprj_6aaff14bd3a881919331c29c35f07790` ; URL : https://deux-temps-expert-officiel.espace-de-tr-7344.chatgpt.site/.

## Résultat livré dans ce lot pilote

- L’Atelier lit le même `data/spec-directory.json` que les fiches techniques : 76 libellés de marques, 195 fiches de groupes et 877 libellés séparés par `;`. Recherche par mots et filtre marque. Les groupes ne sont pas 877 configurations exactes ; l’inventaire n’est pas exhaustif.
- Sélection d’une entrée : identité, classe nominale du groupe, catégorie et éventuelle famille moteur reliée sont repris avec leur source. La boîte, la CVT ou le variateur et l’alimentation ne sont préremplis que si la famille liée décrit explicitement l’architecture et que l’association ne comporte pas une réserve « à vérifier ». Millésime, code moteur effectivement monté, alésage/course, rapports et puissance restent inconnus tant que non documentés.
- Les projets A/B de l’Atelier restent virtuels. Une commande explicite copie la variante vérifiée dans `actual` ; le diagnostic ne lit que cet instantané confirmé. Une modification de l’identité annule la confirmation. L’import d’un projet JSON impose une nouvelle confirmation.
- Onglet Diagnostic IA : logiciel expert interne déterministe, sans appel à une API de modèle externe. Il pose une étape selon symptômes et réponses, affiche indices favorables/contraires et inconnues, accepte contrôle normal/anormal/impossible/incertain, interrompt la démarche si danger déclaré ou surchauffe, conserve dossier/révisions et archive locale sans suppression automatique des anciens dossiers et avec alerte de saturation, exporte JSON et imprime un rapport PDF via le navigateur.
- Les photos, sons et vidéos peuvent être prévisualisés dans le navigateur et assortis d’une observation humaine. Le fichier n’est pas transmis ni interprété automatiquement. Le dossier et son journal résident dans le stockage du navigateur ; l’archive n’est ni synchronisée avec un compte ni chiffrée par l’application.

## Audit contrôleur développeur

| Scénario du cahier | Résultat vérifié | Portée / constat |
| --- | --- | --- |
| A1 pièce sans courbe | Conforme dans ce pilote | Le calcul reste géométrique ; aucune puissance de pièce n’est créée. |
| A2 pignon 12 → 13 | Conforme, test automatique | +8,3 % vitesse géométrique ; −7,7 % effort relatif à couple identique ; aucune puissance simulée. |
| A3 offre importée | Hors périmètre | Aucun connecteur marchand autorisé n’est installé. Une pièce personnelle reste « non vérifiée ». |
| A4 commission | Conforme par absence d’affiliation | Aucun paiement/flux marchand ne participe au moteur de calcul ou de diagnostic. |
| D1 pièce virtuelle ignorée | Conforme, test automatique + parcours UI | `diagnosticSnapshot()` omet `variants`, ne prend que `actualConfirmed` et `actual`. |
| D2 résultats divergents | Conforme, test automatique + parcours UI | Contrôle d’alimentation normal mène à l’allumage ; anormal oriente vers confirmation en atelier. |
| D3 autre millésime | Conforme pour le corpus utilisé | Les documents groupés n’insèrent aucune cote précise ou procédure d’un autre millésime. Aucune recherche web n’est activée. |
| D4 signal grave | Conforme, test automatique + UI | Plus de contrôle proposé et consigne d’arrêt. |
| D5 média faible/contradiction | Partiel | « Incertain » ne confirme aucune piste. Pas d’analyse automatique ni de gestion formelle de contradiction multimodale. |
| I1 accès à un dossier tiers | Partiel | Le pilote n’expose pas d’API de dossier ; stockage local seulement. L’accès privé multiutilisateur reste à réaliser. |
| I2 indépendance | Partiel | Atelier et diagnostic déterministes fonctionnent sans API IA externe. Aucun modèle à poids ouverts ni pipeline local image/son/vidéo n’est encore déployé. |
| I3 cas non confirmé publié | Conforme dans ce pilote | Aucun pipeline de publication ou entraînement automatique. |

Vérifications faites : `npx tsc --noEmit`, `node --experimental-strip-types --test tests/atelier-diagnostic.test.mjs`, compilation de production, sélection MBK Booster/BW’s donnant famille M019 / CVT / carburateur, recherche 103 RCX, transfert explicite du montage réel, branchement après contrôle normal et arrêt d’urgence dans l’aperçu du site. Le PDF imprimable utilise le dialogue natif « enregistrer en PDF » du navigateur ; un export PDF signé/archivé côté serveur n’existe pas.

## Écarts à traiter avant prétention à un service IA autonome complet

1. Choisir et évaluer une version exacte de modèle à poids ouverts avec licence compatible, obtenir une infrastructure d’inférence contrôlée par Deux Temps Expert, puis construire une interface remplaçable et un banc d’essais métier. Le moteur de décision de ce lot n’est pas un LLM auto-hébergé.
2. Définir le compte d’exploitation, la base de dossiers privée, l’authentification par propriétaire et expert, le stockage objet privé et les sauvegardes/restaurations. Les dossiers actuels sont propres au navigateur et ne doivent pas être présentés comme archivage privé du service.
3. Constituer et valider les procédures spécifiques par famille moteur, les données d’essais comparables, les courbes de couple et les domaines de validité. Aucune performance chiffrée autre que les calculs géométriques ne doit être ouverte avant cela.
4. Raccorder une passerelle web isolée et des flux marchands seulement après droits contractuels, comptes et tests de sécurité. Les documents d’un autre millésime ne peuvent pas être validés automatiquement.
5. Faire évaluer localement OCR, image, audio et vidéo avec jeux de test ; signaler chaque modalité non couverte. Installer traitement asynchrone et stockage sous accès privé avant téléversements persistants.
6. Mettre en place la revue humaine des cas, la gestion des consentements et des durées de conservation, les migrations, les journaux d’audit et un vrai processus de révision documentaire.

Les recommandations CNIL concernant la réutilisation des données sont consultables à https://www.cnil.fr/fr/developpement-des-systemes-dia-les-recommandations-de-la-cnil-pour-respecter-le-rgpd ; les droits d’accès aux flux Awin sont décrits à https://help.awin.com/developers/docs/product-feed-publisher-guide-intro ; les licences et capacités de modèles varient selon la version exacte : https://docs.mistral.ai/models. Aucun de ces trois liens ne prouve qu’un partenariat, une licence de corpus ou une infrastructure ont été obtenus.

## Reprise

Source : `lib/workshop-data.ts`, `components/workshop-configurator.tsx`, `lib/diagnostic-snapshot.ts`, `lib/diagnostic-engine.ts`, `components/diagnostic-workspace.tsx`, `tests/atelier-diagnostic.test.mjs`. Ouvrir le Site par son ID, récupérer la branche source, vérifier la dernière version déployée. Le stockage local des visiteurs ne peut pas être extrait depuis le serveur. Garder le PDF source dans l’espace de travail du développeur ou le demander à l’utilisateur si absent.
