# Pilote d'affiliation Maxiscoot FR / Awin

Recherche vérifiée le 7 octobre 2026. Le programme Maxiscoot FR (annonceur 63576) déclare des flux produits. Awin annonce une inscription gratuite pour les éditeurs et sites éditoriaux. L'acceptation du compte, du site et du programme reste nécessaire ; aucun compte ni accès fournisseur n'a été créé automatiquement.

Sources officielles :
- https://www.awin.com/fr/pricing/affiliate-partners
- https://ui.awin.com/merchant-profile/63576
- https://ui.awin.com/merchant-profile-terms/63576
- https://help.awin.com/developers/docs/product-feed-list-download
- https://help.awin.com/apidocs/retail-publisher-productapidocumentation-1
- https://help.awin.com/developers/docs/consent-framework-for-partners

## Activation

1. Ouvrir un compte **éditeur/site éditorial** Awin et déclarer l'URL du Site existant.
2. Demander l'acceptation Maxiscoot FR, puis récupérer le flux dans Toolbox / Create-a-Feed.
3. Privilégier le flux standard CSV UTF-8 non compressé. Inclure merchant_id, merchant_product_id, product_name, merchant_deep_link, mpn, brand_name, search_price, currency, in_stock, merchant_category et merchant_image_url. Configurer AWIN_PRODUCT_FEED_URL comme secret : l'URL inclut la clé de flux, distincte du jeton de l'API générale.
4. Configurer AWIN_PUBLISHER_ID et, uniquement après acceptation, AWIN_MAXISCOOT_APPROVED=true. Un jeton AWIN_SYNC_TOKEN aléatoire de 32 caractères minimum protège l'actualisation.
5. Si Maxiscoot fournit un flux Enhanced JSONL, AWIN_API_TOKEN et AWIN_PUBLISHER_ID peuvent remplacer AWIN_PRODUCT_FEED_URL. L'existence du flux Enhanced Maxiscoot fr_FR n'est pas confirmée avant accès au compte ; le standard CSV reste la voie principale.
6. Appeler POST /api/parts/partners/sync avec Authorization: Bearer (AWIN_SYNC_TOKEN), depuis un outil serveur sécurisé. Ne pas mettre de clé dans le navigateur ni dans les arguments du shell. Aucun paramètre URL ni corps utilisateur ne détermine le fournisseur à télécharger.

Toutes les valeurs se configurent comme secrets/variables serveur via Sites, jamais dans le manifeste ni le dépôt. Le connecteur n'introduit aucun abonnement payant ni package supplémentaire. Les quotas d'hébergement existants restent ceux du Site.

## Fonctionnement du pilote

Import plafonné à 500 offres valides ; lecture incrémentale, plafond de 16 Mo et délai de téléchargement de 45 s. Sélection partielle signalée à l'écran. Seuls les produits provenant de l'annonceur 63576 avec destination HTTPS Maxiscoot sont acceptés. L'identifiant vendeur n'est jamais utilisé comme référence fabricant ni comme preuve de compatibilité. L'affiliation des liens est activée seulement après configuration explicite d'un éditeur accepté.

Les offres sont stockées dans D1, puis publiées en une seule écriture après validation. Un échec garde l'instantané précédent. Verrou/délai de cinq minutes pour limiter les téléchargements concurrents. Les données de plus de 24 heures masquent prix et stock. Pas de rafraîchissement programmé pour ce premier essai ; actualisation manuelle protégée.

GET /api/parts/partners propose recherche et pagination. GET /api/parts/partners/go accepte uniquement un identifiant déjà présent dans l'instantané, sans redirection libre. Les liens indiquent cons=0 par défaut ; une case facultative permet au visiteur d'accepter le suivi Awin pour le clic concerné. Aucun script publicitaire ni cookie de suivi n'est installé par cette intégration.

Le mode d'essai (?mode=demo) emploie des exemples internes, sans prix, stock ni lien marchand. Il ne constitue pas une réponse réelle de l'API Awin. Il permet de tester recherche, présentation et ouverture des fiches avant acceptation du compte.
