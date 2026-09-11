# Journal de décisions — Claude Code

Une entrée par décision prise seul(e) (sans arbitrage explicite de l'équipe), ou par
écart/manque constaté par rapport à une carte Trello. Remplace la pratique précédente
de documenter ces points directement sur les cartes Trello (arrêtée le 2026-09-11 sur
demande — le board reste inchangé jusqu'à nouvel ordre).

Format par entrée : **US concernée**, la décision/le manque, pourquoi, impact si
pertinent.

---

## Phase 0 — Intégration US-DET-01 / US-CAT-01 / US-REC-01

**US-CAT-01 / US-DET-01 / US-REC-01** — Ordre de merge DET-01 → CAT-01 → REC-01 dans
la branche locale `ClaudeApp`.
Pourquoi : DET-01 et CAT-01 avaient fait un patch identique sur `Navbar.tsx`/`App.tsx`
(fusion sans conflit) ; REC-01 entrait en conflit sur `App.tsx`, `router.ts` et
`services/api.ts` (résolus à la main en conservant les deux côtés).
Impact : aucun, travail d'intégration normal.

**US-DET-01 / US-REC-01** — Collision de casse Windows sur `types/Media.ts` (REC-01)
vs `types/media.ts` (DET-01) : même fichier physique sur ce disque, deux entrées
différentes dans Git. Renommé le fichier de REC-01 en `types/Search.ts`
(`Media`/`Person` → `SearchMedia`/`SearchPerson`).
Pourquoi : sur un système de fichiers insensible à la casse, un premier `git mv` a
fait disparaître le contenu de DET-01 (restauré depuis l'historique Git).
Impact : aucune perte de données au final, mais point de vigilance pour tout merge
futur touchant des fichiers ne différant que par la casse.

**US-REC-01** — `SearchResults.tsx` importait un composant `MediaList` inexistant
dans la branche REC-01 elle-même (seulement dans `Presentation_branch`, marqué
`//ne pas commit` et dépendant d'un `MediaCard.wip-thomas.tsx`). Écrit un
`MediaList`/`SearchResultCard` propre, réutilisant le `Carousel` déjà livré par
CAT-01 (conforme à l'étape technique de la carte : "Réutiliser le composant Carousel
ou CardList").
Pourquoi : ne pas intégrer du code explicitement marqué comme non destiné au commit.
Impact : aucun sur le plan fonctionnel, juste un composant réécrit plutôt que copié.

**US-ACC-01** — Branche non réutilisée, réécriture prévue from scratch (pas encore
faite à ce jour).
Pourquoi : seulement 2 commits, introduit un dossier `Homepage/` (PascalCase) non
conforme à la convention de module documentée (camelCase singulier).
Impact : US-ACC-01 reste à implémenter intégralement.

**Infra (hors US)** — Fichier `.env` racine copié vers `server/.env` (et `client/.env`
créé depuis `.env.sample`), tous deux gitignorés.
Pourquoi : les scripts npm workspace exécutent `dev:server` avec le répertoire de
travail réglé sur `server/`, et `dotenv/config` cherchait donc `server/.env` — absent,
seul un `.env` à la racine existait (le projet n'a que des `.env.sample` par
workspace, jamais de `.env.sample` racine).
Impact : sans ça, le serveur crashait au démarrage ("port undefined", accès base
refusé). Fichiers locaux uniquement, rien commité.

---

## Décisions d'architecture transverses

**US-AUTH-01/02** — Stockage du token JWT en `localStorage`.
Pourquoi : décision explicite de l'utilisateur (cohérent avec les étapes techniques
déjà écrites dans les cartes).
Impact : structure `AuthContext` côté front, pas de cookie httpOnly.

**US-CAT-02 (TMDB / schéma)** — `media.pegi` reste `VARCHAR(50)`
(`'TP'|'10'|'12'|'16'|'18'`), pas de conversion en `INT`.
Pourquoi : l'utilisateur avait initialement demandé `INT` (`TP=0`) sans connaître
l'existant ; le pipeline TMDB déjà écrit (`tmdbFetch.ts`), le seed, et les 4 branches
non fusionnées traitent déjà `pegi` en VARCHAR avec un commentaire d'équipe explicite
justifiant ce choix. Remonté à l'utilisateur, qui a confirmé VARCHAR après coup
("les données reçues sont '16', 'TP' par exemple").
Impact : aucun changement de schéma nécessaire, cohérent avec tout le code existant.

**Toutes les fiches détail** — Format d'affichage des notes : toujours `X.X/10`
(ex. `8.9/10`), jamais la valeur brute retournée par SQL (`overallRating` est un
DECIMAL qui remonte en string type `"8.90"`).
Pourquoi : demande explicite de l'utilisateur après avoir vu le rendu réel de la
Phase 0. Utilitaire partagé : `client/src/utils/formatRating.ts`.
Impact : appliqué sur `Catalog/MediaCard.tsx` et `MediaHeader.tsx` ; à réutiliser sur
toute future fiche affichant une note (série, saison, épisode, acteur…).

**US-AUTH-01 (schéma partagé)** — Colonnes `user_.password`, `role`, `dark_theme`,
`avatar` corrigées directement sur la base MySQL partagée par `ALTER TABLE` ciblé
(pas via `npm run db:migrate`, qui `DROP DATABASE` + recrée tout).
Pourquoi : la base réelle avait dérivé de `schema.sql` — `password` en `VARCHAR(50)`
(trop court pour un hash bcrypt ≈60 caractères), et `role`/`dark_theme`/`avatar` sans
valeur par défaut alors que `schema.sql` en déclare. La table `user_` était vide au
moment du correctif (aucune donnée perdue).
Impact : **l'équipe n'a pas été informée de ce correctif via un canal externe à cette
session.** Documenté dans `schema.sql` (commentaire au-dessus de `CREATE TABLE
user_`) et dans `CLAUDE.md`, mais quelqu'un avec un `schema.sql` local désynchronisé
pourrait avoir une mauvaise surprise en relançant `db:migrate`. **Action encore
ouverte : prévenir l'équipe.**

**US-AUTH-03** — Pas de route backend `POST /api/auth/logout`.
Pourquoi : JWT stateless en localStorage, rien à invalider côté serveur. L'étape
technique de la carte qui la demande est explicitement conditionnelle ("si gestion de
session/token côté serveur, ex: invalidation ou blacklist du token/refresh token") ;
aucune autre carte (V1 ou V2) ne prévoit de blacklist/refresh token à ce jour.
Impact : déconnexion entièrement gérée côté client (suppression du token,
réinitialisation du contexte). À revoir si une stratégie de session serveur est
introduite plus tard.

**US-AUTH-01 / US-DET-08** — Migrations `user_.created_at` (ajoutée à `schema.sql`,
avec défaut `CURRENT_TIMESTAMP`) et `track.favorited_at`/`watchlist_added_at` (pas
encore ajoutées) : appliquées "au fil de l'eau" plutôt qu'en une seule migration
groupée.
Pourquoi : décision explicite de l'utilisateur.
Impact : `track.favorited_at`/`watchlist_added_at` restent à ajouter lors d'US-DET-08.

---

## US-CAT-02

**US-CAT-02** — Paramètre de requête `type` conservé (pas `format`, contrairement à
l'exemple donné dans la carte : `?format=film&genre=action`).
Pourquoi : `GET /api/medias/discover` (US-CAT-01) utilise déjà `type`, et les deux
modes (découverte/filtré) cohabitent sur la même page `/catalog` avec le même onglet
de format — deux noms de paramètre différents pour le même état se seraient marché
dessus dans l'URL au changement de mode.
Impact : aucun pour l'utilisateur final ; à connaître pour quiconque relit la carte
et compare au code.

**US-CAT-01** — Badges "Top 3"/"Top 10"/"Nouveau" jamais affichés côté front bien que
`topRank`/`isNew` soient calculés côté back depuis le début. Corrigé dans
`Catalog/MediaCard.tsx` en construisant US-CAT-02 (bénéficie aux deux modes).
Pourquoi : gap constaté en implémentant CAT-02, qui exige explicitement que ces
badges restent visibles en mode filtré — impossible de le garantir tant qu'ils
n'étaient affichés nulle part.
Impact : correction bénéfique à CAT-01 elle-même (une des étapes techniques de sa
propre checklist), pas seulement à CAT-02.

**US-CAT-01 — écarts constatés, non traités** : les étapes techniques suivantes de la
checklist front d'US-CAT-01 restent incomplètes (vérifié directement sur Trello, pas
un trou entre cartes) :
- Card "Voir plus" en fin de carrousel de genre, vers `/catalog?genre=X`
- Pastille de type de contenu visible uniquement sur l'onglet "Tous"
- Gestion loading/erreur de `DiscoverSection` (actuellement juste un
  `console.log("Erreur", error)`)
- Tests responsive sur les 4 onglets
Pourquoi non traités : hors du périmètre explicite d'US-CAT-02 sur lequel je
travaillais ; à reprendre quand US-CAT-01 est rouverte.
Impact : `DiscoverSection` reste sans état de chargement/erreur visible pour
l'utilisateur ; pas de lien direct depuis une section de genre vers le mode filtré.

---

## US-DET-02

**US-DET-02** — Route `/series/:id` (anglais, pluriel) plutôt que `/serie/:id`
(littéralement écrit dans la carte).
Pourquoi : cohérent avec `/movies/:id` (US-DET-01) et le guide de conventions de
nommage (routes en anglais, kebab-case, ressources au pluriel). Même logique que la
décision `type`/`format` sur CAT-02.
Impact : aucun pour l'utilisateur ; la route ne correspond pas littéralement au texte
de la carte.

**US-DET-02** — Route backend `GET /api/series/:id` créée en parallèle de
`GET /api/medias/:id` (qui reste réservé aux films), plutôt que d'unifier sur une
seule route comme la carte le suggérait en alternative ("ou api/medias/:id si table
unifiée").
Pourquoi : éviter de toucher au code déjà testé d'US-DET-01 (`mediaActions.read`
suppose un film) ; réutilisation directe des méthodes déjà génériques de
`MediaRepository` (`readGenres`/`readPlatforms`/`readCast`/`countCast`, qui ne
filtrent pas par type) depuis le nouveau module `series`.
Impact : deux routes de lecture média (film/série) au lieu d'une seule ; cohérent
avec le pattern déjà en place (modules distincts par écran plutôt que par table).

**US-DET-02** — `SeasonList` renvoie vers `/series/:id/seasons/:seasonId` (US-DET-03)
plutôt que d'implémenter l'état `selectedSeason` + `EpisodeList` inline prévu dans la
propre checklist d'US-DET-02.
Pourquoi : US-DET-03 spécifie une vraie page saison dédiée avec sa propre route ;
construire à la fois un affichage inline ET une page dédiée pour le même clic aurait
été redondant. Interprété comme une US-DET-03 qui affine/remplace ce point de
US-DET-02, comme observé ailleurs (US-DET-07 qui remplacera `KnownFrom.tsx`).
Impact : cliquer sur une saison dans la fiche série actuelle ouvre un lien vers
`/series/:id/seasons/:seasonId`, qui n'existe pas encore tant qu'US-DET-03 n'est pas
posée (404 attendu jusque-là).

**US-DET-04 (à anticiper)** — Le schéma `episode` n'a aucune colonne
poster/image ("vignette de l'épisode"), contrairement à ce que la carte suggère
("si existante"). Pas encore d'action prise, simple observation à ce stade.
Pourquoi : `server/database/schema.sql` ne modélise que `ID, tmdb_id, name, number,
released_at, synopsis, duration, ID_season` pour `episode` — aucun champ image.
Impact anticipé : le fallback (vignette de saison, puis de série) s'appliquera
systématiquement, jamais l'inverse — sauf si une migration ajoute ce champ avant
US-DET-04.

**US-REC-01** — Bug corrigé en marge d'US-DET-02 : `searchRepository.ts` typait la
colonne `type` comme `"movie" | "series"`, alors que la base ne contient jamais que
`"movie"` ou `"tv"`. `searchActions.ts` testait `row.type === "series"`, qui ne
matchait donc jamais — toute série non-anime était invisible dans les résultats de
recherche (silencieusement, sans erreur). Corrigé en alignant sur `"tv"` partout
(cohérent avec `/api/medias/discover` et `/api/medias`) ; ajout d'un champ `type` sur
chaque résultat retourné, nécessaire pour que le front puisse lier chaque résultat
vers la bonne fiche détail.
Pourquoi découvert maintenant : US-DET-02 demandait explicitement de rendre les cards
de recherche cliquables vers les fiches série, ce qui a nécessité de vérifier que des
séries remontaient bien dans les résultats.
Impact : bug réel corrigé, présent depuis la livraison initiale d'US-REC-01 ; sans
correction, la fonctionnalité de recherche de séries était silencieusement cassée.

---

## US-DET-03

**US-DET-03** — "Comédiens qui jouent un rôle dans la saison" dérivés de
`episode_person` (jointure `episode_person` → `episode` → filtre `ID_season`), et non
d'une table `season_person` (qui n'existe pas dans le schéma).
Pourquoi : le schéma ne modélise le casting qu'au niveau média (`media_person`, pour
toute la série) ou épisode (`episode_person`) — rien au niveau saison. Vérifié que
`episode_person` est bien peuplé (~19 000 lignes) avant de choisir cette approche.
Impact : le casting affiché sur une fiche saison est réellement propre à cette
saison (testé : 45 comédiens sur la Saison 1 de Rick et Morty, contre 200 pour la
série entière), pas juste une redite du casting de la série.

**US-DET-03** — Genres, plateformes et note globale de la saison réutilisent ceux de
la série parente (`media`) plutôt que d'être calculés au niveau saison.
Pourquoi : aucune de ces trois informations n'existe à la granularité saison dans le
schéma (`classify_as`, `available_on` et `overall_rating` sont tous liés à `ID_media`,
pas à une saison) — la carte les demande ("Afficher les genres de la saison", "note"
dans les étapes techniques) sans que la donnée sous-jacente existe à ce niveau.
Impact : une saison affiche donc les mêmes genres/plateformes/note que sa série ;
c'est un choix d'affichage, pas un bug, mais ça vaut le coup de le savoir si
quelqu'un s'attend à des valeurs différenciées par saison.

**US-DET-04 (à anticiper)** — Confirmé : `episode` n'a pas de colonne image, donc
`EpisodeDetailList` affiche la vignette de la saison en fallback pour chaque épisode
(pas d'image différenciée par épisode). Cohérent avec l'observation déjà notée sous
US-DET-04 plus haut dans ce fichier.

**US-DET-02 — gap corrigé rétroactivement** : le bouton retour (`navigate(-1)`),
explicitement demandé par la checklist d'US-DET-02 elle-même, avait été oublié sur
`SerieDetail.tsx`. Ajouté maintenant (composant partagé `BackButton.tsx`, réutilisé
aussi sur `SeasonDetail.tsx`).
Pourquoi manqué initialement : simple oubli en construisant la fiche série.
Impact : aucun effet de bord, correction pure. `MovieDetail.tsx` (US-DET-01) n'a
toujours pas ce bouton — sa checklist ne le demande pas explicitement (contrairement
à DET-02/03/04), donc non ajouté pour rester dans le périmètre de chaque carte,
mais à noter comme incohérence UX potentielle entre fiches film/série/saison.

---

## US-DET-01

**US-DET-01** — Ajout du composant partagé `BackButton` (`navigate(-1)`) sur
`MovieDetail.tsx`.
Pourquoi : ce n'était pas demandé explicitement dans les étapes techniques de la
carte US-DET-01 (contrairement à US-DET-02/03/04, qui le demandent toutes
explicitement). Ajouté a posteriori pour la cohérence UX entre fiches film/série/
saison — **décision validée côté produit**, pas une improvisation : demandé
explicitement par l'utilisateur après constat de l'incohérence notée dans l'entrée
US-DET-02 ci-dessus.
Impact : aucun effet de bord ; réutilise le composant déjà créé pour US-DET-02/03.
Testé en réel (page `/movies/:id` toujours fonctionnelle) avant commit.

---

## US-DET-04

**US-DET-04** — Casting lu directement sur `episode_person` (pas d'agrégation
nécessaire, contrairement à US-DET-03 où il fallait remonter par les épisodes de la
saison) — l'épisode est déjà l'unité de granularité de cette table.
Impact : aucun, comportement attendu.

**US-DET-04** — Genres non affichés sur la fiche épisode (contrairement à ce que
suggérait l'étape technique "EpisodeInfo (durée totale, genres, date de sortie, note,
synopsis)"), note globale reprise de la série parente.
Pourquoi : les critères d'acceptation réels d'US-DET-04 ne mentionnent PAS les genres
(contrairement à US-DET-02/03 qui les listent explicitement) — seule l'étape
technique en parle, incohérence probable de rédaction de la carte. Comme il n'existe
aucune donnée de genre à la granularité épisode dans le schéma, j'ai suivi les
critères d'acceptation (qui font foi) plutôt que l'étape technique. La note globale,
elle, suit le même choix que US-DET-03 (réutilisée depuis la série).
Impact : aucun champ genre sur la fiche épisode ; à revoir si l'équipe voulait
effectivement des genres ici malgré l'absence dans les critères.

**US-DET-04** — Vignette : fallback saison → série (`episode.poster ?? season.poster
?? series.poster`, en pratique toujours saison ou série puisque `episode` n'a aucune
colonne image).
Impact : cohérent avec l'observation déjà loggée sous US-DET-03/US-DET-04 plus haut.

**US-DET-04** — Interprétation de l'étape technique "Rendre chaque élément de la
SeasonList (US06.1) cliquable avec un lien vers /serie/:serieId/saison/:seasonId" :
traité comme une erreur de copier-coller dans la carte (référence à `SeasonList`,
composant d'US-DET-02, alors que le contexte — routes avec `:episodeId`, page
EpisodeDetail — indique clairement qu'il s'agit de rendre cliquable chaque élément
de `EpisodeDetailList` (US-DET-03) vers la fiche épisode, pas vers la fiche série.
Implémenté selon cette lecture.
Impact : chaque ligne d'épisode dans `EpisodeDetailList` ouvre désormais
`/series/:id/seasons/:seasonId/episodes/:episodeId`.

**Route** : `/api/series/:serieId/seasons/:seasonId/episodes/:episodeId` et
`/series/:serieId/seasons/:seasonId/episodes/:episodeId` (pas `/serie/.../saison/...`
de la carte) — même raisonnement que US-DET-02/03 (anglais, cohérent avec les
conventions de nommage).

---

## US-DET-05 / US-DET-06

**US-DET-05 — POINT REMONTÉ IMMÉDIATEMENT À L'UTILISATEUR AVANT DE CODER** (validé
avant implémentation, pas une décision solo) : la table `person` n'a ni date de
naissance, ni date de décès, ni profession — vérifié qu'aucune des trois n'existe
dans le pipeline TMDB actuel (`tmdbFetch.ts` ne capture que `biography`) ni dans
`media_person.role`/`episode_person.role` (uniquement la valeur `"actor"` sur toute
la base seedée, pas une vraie profession variée). L'utilisateur a choisi l'option
"fiche sans ces 3 champs" plutôt qu'une migration+reseed complet (chantier à part,
nécessite la clé API TMDB et du temps).
Impact : la fiche comédien affiche nom/photo/biographie/filmographie uniquement.
Aucune date de naissance/décès/profession nulle part dans l'app tant que ce choix
n'est pas révisé — à garder en tête pour toute future US touchant aux comédiens.

**US-DET-05** — Deux endpoints distincts (`GET /api/actors/:id` pour les infos,
`GET /api/actors/:id/filmography` étendu pour la filmographie), plutôt qu'une
réponse unique `{ infos: {...}, filmography: [...] }` comme suggéré dans la carte.
Pourquoi : US-DET-06 demande explicitement que `ActorFilmography` soit un composant
indépendant avec son propre fetch et son propre state de tri — cohérent avec deux
appels séparés plutôt qu'une réponse imbriquée unique.
Impact : structure de réponse plate (`id`, `name`, `photo`, `biography` au premier
niveau), cohérent avec le style déjà utilisé sur DET-01 à 04, plutôt que
d'introduire une clé `infos` inédite.

**US-DET-06** — Route `GET /api/actors/:id/filmography` étendue (pas dupliquée) pour
servir à la fois le widget "Vous le connaissez déjà dans" (US-DET-01/07, avec
`exclude`, limité à 6) et la filmographie complète de la fiche comédien (sans
`exclude`, sans limite, avec tri `sortBy=date-asc|date-desc`). La limite de 6 ne
s'applique que si un `exclude` est fourni.
Pourquoi : éviter de dupliquer la logique de requête SQL entre deux méthodes quasi
identiques ; le contrat d'URL existant (`?exclude=X`) reste inchangé, donc
`KnownFrom.tsx` n'a nécessité aucune modification. Vérifié en réel que l'appel avec
`exclude` reste bien limité à 6 après la modification.

**US-DET-05 / US-DET-06** — Chaque œuvre de la filmographie (`components/MediaCard.tsx`,
utilisé par `KnownFrom` ET par `ActorFilmography`) est maintenant cliquable vers sa
fiche détaillée (`getMediaPath`), comme demandé explicitement par les deux cartes.
Effet de bord positif : le widget `KnownFrom` (US-DET-01) en profite aussi, alors
que ce n'était pas demandé par sa propre carte à l'époque.

**US-DET-05** — Sur `ActorPortraitCard` (US-DET-01), séparation du clic photo
(toggle du widget "connu pour/déjà vu", comportement existant) et du clic sur le nom
(nouveau lien `<Link>` vers `/actors/:id`) — nécessaire pour ne pas imbriquer un
`<a>` dans un `<button>` (HTML invalide) tout en satisfaisant les deux interactions
demandées par des cartes différentes sur le même élément.
Impact : cliquer sur la photo d'un comédien dans une fiche film/série ouvre toujours
le widget inline ; cliquer sur son nom ouvre sa fiche dédiée.

**US-DET-05** — Fil d'Ariane de la fiche comédien : simple "Accueil > NomDuComédien"
écrit directement dans la page, plutôt que de réutiliser le composant `Breadcrumb`
partagé (US-DET-01/02/03/04).
Pourquoi : `Breadcrumb` est structurellement couplé à la navigation catalogue
(format film/série + lien `/catalog?type=...`), qui n'a pas de sens pour un
comédien. Étendre son API pour un cas très différent aurait risqué de complexifier
ou casser son usage sur les 4 fiches déjà en place.
Impact : aucun, fil d'Ariane minimal mais fonctionnel.

**Route** : `/actors/:id` (déjà en anglais/pluriel dans la carte, aucun écart ici).

---

## US-DET-07

**US-DET-07** — L'Auth (US-AUTH-01/02) étant déjà livrée (Phase 1), implémenté
directement le branchement réel `userId` depuis le JWT plutôt que le contournement à
base d'id seedé en dur que la carte anticipait ("le branchement final sur
l'authentification réelle... sera ajouté une fois l'Auth livrée en semaine 3-4").
Pas de redéveloppement à prévoir plus tard, contrairement à ce que la planification
d'origine supposait.
Impact : aucun, plus simple que prévu par la carte.

**US-DET-07** — Middleware `optionalAuth` créé (nouveau, distinct de `verifyToken`) :
décode le token s'il est présent et valide, sinon continue sans bloquer (au lieu de
retourner 401). Nécessaire car la route doit fonctionner pour un visiteur non
connecté (mode "top-rated") ET un utilisateur connecté (mode "seen"), contrairement
aux routes protégées existantes (`/api/me/preferences`) qui exigent un token valide.
Testé : un token invalide/expiré bascule bien en mode visiteur plutôt que de
renvoyer une erreur.

**US-DET-07** — Testé le mode connecté avec des données insérées manuellement et
nettoyées après coup (utilisateur temporaire + une ligne `episode_user`), plutôt que
de lancer `npm run db:seed` (qui peuplerait `user_`/`media_user`/`episode_user` avec
les fixtures de l'équipe entière sur la base partagée). `media_user`/`episode_user`
sont vides sur la base partagée à ce jour (les seeders existent mais n'ont jamais été
exécutés dessus) — vérifié avant de commencer.
Impact : validé en réel que la jointure `episode_user` → `episode_person` → `season`
→ `media` fonctionne (retrouve bien "Frieren" comme vu via un épisode spécifique où
l'acteur apparaît), que l'exclusion du média courant s'applique, et que "aucun
historique" affiche bien le message dédié sans repli sur le Top 5.

**US-DET-07 — Remplacement complet de `KnownFrom.tsx` (US-DET-01)** sur les 4 fiches
détail (film/série/saison/épisode) par `ActorKnownForWidget`. `KnownFrom.tsx`
supprimé (plus aucune référence). Conséquence : l'ancien paramétrage
`exclude`/`limit` de `GET /api/actors/:id/filmography` (ajouté pendant US-DET-06)
n'avait plus qu'un seul appelant fantôme après ce remplacement — simplifié pour
revenir à une méthode sans ces options, maintenant utilisée uniquement par
`ActorFilmography` (US-DET-06, pas d'exclusion, tri seul).
Pourquoi : correspond exactement à la chaîne de dépendances déjà anticipée dans le
plan (DET-02→06 avant DET-07) — voir aussi la note de planification de la carte
elle-même sur ce point.

**US-DET-07** — Correction du toggle "un second clic sur le même comédien referme le
widget" sur les 4 pages (`MovieDetail`/`SerieDetail`/`SeasonDetail`/`EpisodeDetail`) :
`handleSelectPerson` ne faisait que `setSelectedPersonId(personId)` (jamais de
fermeture au re-clic) depuis US-DET-01. Corrigé partout en `current === personId ?
null : personId`.
Pourquoi manqué initialement : ce comportement de toggle n'était pas explicitement
demandé par US-DET-01/02/03/04, seulement par US-DET-07.
Impact : comportement de fermeture au re-clic maintenant cohérent sur les 4 fiches.

**US-DET-07** — Mini-cards du widget : réutilisation de `Search/SearchResultCard.tsx`
(US-REC-01) plutôt que la création d'un nouveau composant de carte.
Pourquoi : forme identique (affiche + titre + année, cliquable via `getMediaPath`) à
ce que demande la carte ("mini-cards horizontales, sans regroupement par type").

**US-DET-07** — `readSeenMediaByActor`/`countSeenMediaByActor` (`PersonRepository`)
utilisent une sous-requête `UNION` (films vus via `media_user` + séries vues via au
moins un épisode dans `episode_user` où le comédien apparaît spécifiquement dans
`episode_person`), triée par `overall_rating` sur le résultat combiné.
Impact : un média n'apparaît qu'une fois même s'il matchait les deux branches (cas
impossible ici vu que `type='movie'` et `JOIN season` s'excluent mutuellement, mais
`UNION` déduplique par sécurité).

---

## US-DET-08

**Hors périmètre US-DET-08, remonté immédiatement** : en vérifiant `track` avant de
coder, `user_rating` y est en `DECIMAL(15,2)` sur la base partagée au lieu de
`DECIMAL(2,1)` documenté dans `schema.sql`. Sans impact sur cette carte (favoris/
watchlist n'y touchent pas), mais à corriger avant US-DET-10 (notation). Documenté
dans `schema.sql` en commentaire au-dessus de `CREATE TABLE track`.

**US-DET-08** — Colonnes `track.favorited_at`/`watchlist_added_at` ajoutées sur la
base partagée (`ALTER TABLE`, table vide, aucune donnée perdue) — c'était la
migration "au fil de l'eau" annoncée pour cette carte précisément.

**US-DET-08** — `toggleFavorite`/`toggleWatchlist` implémentés en `INSERT ... ON
DUPLICATE KEY UPDATE` (upsert atomique) plutôt qu'un aller-retour SELECT puis
INSERT/UPDATE séparé pour l'écriture elle-même — évite une race condition entre
deux clics rapprochés. La lecture de l'état actuel (`readTrack`) reste un SELECT
préalable pour calculer la valeur inversée à écrire.

**US-DET-08 — Écart de périmètre assumé** : `MediaCardActions` (cœur + watchlist)
n'est intégré que sur les écrans qui existent réellement aujourd'hui — Catalogue
(`Catalog/MediaCard`), Recherche (`Search/SearchResultCard`, qui sert aussi le
widget "connu pour" de DET-07 par réutilisation), et les fiches Film/Série. "Accueil"
n'a pas encore de vraies cards média (US-ACC-01 reste à reconstruire) et "Favoris"/
"Watchlist" n'existent pas encore comme pages (US-PRO-02/03, Phase 4) : l'intégration
s'y fera naturellement quand ces écrans seront construits, puisqu'ils réutiliseront
probablement les mêmes composants de card.
Impact : aucun pour l'instant ; à vérifier que PRO-02/03/ACC-01 réutilisent bien
`MediaCardActions` plutôt que de réinventer les icônes.

**US-DET-08 — Limite connue, assumée** : les endpoints de LISTE (`/api/medias/discover`,
`/api/medias`, `/api/medias/search`) ne renvoient pas le statut favori/watchlist par
média — `MediaCardActions` y démarre donc toujours à `false`/`false`, même si le
média est déjà en favoris. Seules les fiches détail (film/série, `GET /api/medias/:id`
et `/api/series/:id`, étendues avec `optionalAuth` + une requête `track`) reflètent
le vrai état au chargement.
Pourquoi assumé : la carte ne demande explicitement que les routes d'écriture +
composant avec mise à jour optimiste, pas de modifier la forme des réponses des
endpoints de liste (qui nécessiterait une jointure en masse sur `track` pour N
médias, plus coûteux et hors périmètre explicite).
Impact : après un favori ajouté depuis le Catalogue, recharger la page affiche de
nouveau un cœur vide tant qu'on ne revisite pas la fiche détail. À corriger quand
US-PRO-02 ("liste de mes favoris") sera construite, qui aura de toute façon besoin
de cette jointure en masse.

**US-DET-08** — `ActionButton` étendu avec `onClick`/`active` optionnels (au lieu de
créer un nouveau composant) pour piloter Favoris/Watchlist sur les fiches détail,
tout en gardant Vu/Noter désactivés exactement comme avant (comportement par défaut
inchangé si `onClick` n'est pas fourni).

**US-DET-08** — Icônes visibles mais non interactives sur mobile (`pointer-events-none
md:pointer-events-auto`) plutôt que masquées, sur les cards ET les fiches détail —
conforme au critère "affichées mais non interactives sur mobile" (pas "cachées").

Testé en réel : toggle favori (ajout/retrait), toggle watchlist, état reflété sur
`GET /api/medias/:id` après coup, 401 sans token, 404 sur média inexistant. Données
de test nettoyées après coup.

## US-DET-09

**US-DET-09 — Module séparé `tracking/` (au lieu d'étendre `track/` de DET-08)** —
`track` gère favoris/watchlist (table `track`), `tracking` gère le statut "vu"
(tables `media_user`/`episode_user`) : deux tables et deux préoccupations
distinctes en base, et l'équipe elle-même a deux cartes Trello séparées avec des
noms proches mais distincts ("track" vs "tracking"). Documenter explicitement ce
choix de nommage pour éviter toute confusion future entre les deux modules.

**US-DET-09 — 4 routes PATCH distinctes** (`/api/me/medias/:id/watched`,
`/api/me/series/:id/watched`, `/api/me/seasons/:id/watched`,
`/api/me/episodes/:id/watched`) plutôt qu'une route générique paramétrée par type —
cohérent avec le pattern déjà en place pour les routes de lecture (`/api/medias/:id`,
`/api/series/:id`, etc., chacune avec son action dédiée) et plus simple à valider
(chaque route connaît exactement son type d'id).

**US-DET-09 — Bascule "vu" en masse pour série et saison** — marquer une série ou
une saison comme vue insère (`INSERT IGNORE`) une ligne `episode_user` pour chaque
épisode concerné ; démarquer supprime toutes les lignes `episode_user`
correspondantes. Pas de demi-mesure : on ne peut pas avoir une série "vue" avec des
épisodes non vus dans l'état stocké, la case reflète toujours l'état réel des
épisodes.

**US-DET-09 — `isFullyWatched` recalculé à la volée, jamais stocké** — conforme à la
convention déjà documentée dans `CLAUDE.md` ("Modèle de données — points
critiques"). Implémenté via deux sous-requêtes `COUNT` (total d'épisodes vs
épisodes vus) comparées, à la fois au niveau série (toutes saisons confondues) et
au niveau saison (une seule saison) — `trackingRepository.isSeriesFullyWatched` /
`isSeasonFullyWatched`.

**US-DET-09 — Statut "vu" par épisode exposé sur l'endpoint saison** —
`GET /api/series/:serieId/seasons/:seasonId` renvoie maintenant, pour un visiteur
non connecté, `isWatched: false` sur la saison et sur chaque épisode de la liste
(comportement par défaut, pas de calcul inutile) ; pour un utilisateur connecté
(`optionalAuth`), le vrai statut par épisode via une seule requête
`readWatchedEpisodeIds` (un `Set` d'IDs, pas N requêtes par épisode).

**US-DET-09 — Toggle "vu" au niveau saison depuis une série partiellement vue** —
comportement testé et confirmé : si certains épisodes d'une saison sont déjà vus et
d'autres non, activer le bouton "Vu" au niveau saison marque *tous* les épisodes de
la saison comme vus (pas seulement les manquants). Idem au niveau série avec les
saisons. C'est le sens attendu d'un bouton bascule à ce niveau (pas de mode
"complète ce qui manque").

**US-DET-09 — Réutilisation de `optionalAuth` déjà introduit en DET-07** — les
routes de lecture saison/épisode (`GET .../seasons/:seasonId`,
`GET .../episodes/:episodeId`) sont passées de non protégées à `optionalAuth`, pour
pouvoir calculer `isWatched` réel pour un utilisateur connecté tout en restant
accessibles à un visiteur (qui reçoit `isWatched: false` par défaut). Aucun
changement de comportement pour les visiteurs.

Testé en réel avec un utilisateur temporaire : toggle film (marquer/démarquer,
reflété sur `GET /api/medias/:id`), toggle épisode (reflété sur le tableau
`episodes` de l'endpoint saison, sans affecter les autres épisodes), toggle saison
depuis un état partiel (marque tous les épisodes) puis démarquage, toggle série
(propage à toutes les saisons/épisodes, y compris une saison jamais touchée
individuellement) puis démarquage, 401 sans token sur les 4 routes, 404 sur
film/série/saison/épisode inexistant sur les 4 routes. Utilisateur et données de
test nettoyés après coup.

## US-PRO-01

**US-PRO-01 — Nouveau module `profile/` dédié au tableau de bord**, plutôt que
d'étendre `user/` (préférences de genres) ou `track/`/`tracking/` — l'agrégation de
compteurs multi-tables (favoris, watchlist, acteurs favoris, titres vus) est une
préoccupation distincte de chacun de ces modules, qui exposent chacun une méthode de
comptage réutilisée ici (`trackRepository.countFavorites`/`countWatchlist`,
`personRepository.countFavorites`, `profileRepository.countWatchedTitles`).

**US-PRO-01 — Définition de "titres vus" alignée sur l'architecture existante, pas
sur la formulation littérale de la carte US-PRO-12** ("Mes statistiques", Phase 6,
pas encore implémentée). US-PRO-12 décrit ce compteur comme "basé sur `media_user`
uniquement", mais `media_user` ne concerne que les films (voir CLAUDE.md — "Modèle de
données") : une série ne peut structurellement pas y apparaître. Le compteur du
dashboard (et, par cohérence, celui qu'il faudra pour US-PRO-12) compte donc les
films vus (`media_user`) + les séries entièrement vues, calculées dynamiquement via
la même logique que `isFullyWatched` (US-DET-09), jamais stockées.
Impact : à réutiliser tel quel pour US-PRO-12 plutôt que de re-suivre la formulation
littérale de sa carte, qui contredirait la convention déjà actée.

**US-PRO-01 — Compteur "Mes acteurs favoris" branché sur la table `favorite`**
(existante dans `schema.sql`, 0 ligne à ce jour) même si aucune action de l'app ne
permet encore de la remplir — ce sera fait par US-PRO-04 (Phase 6). Le compteur
affiche donc `0` pour tout le monde jusqu'à cette US, ce qui est le comportement
correct en attendant.

**US-PRO-01 — Cartes "Mes acteurs favoris" et "Statistiques" non cliquables**
(pas de `<Link>`, juste un badge "Bientôt disponible") car leurs pages dédiées
(US-PRO-04 et US-PRO-12) sont en Phase 6, pas encore construites. Seules les cartes
Favoris et Watchlist, construites dans cette même phase juste après, sont cliquables.

**US-PRO-01 — Extraction d'un composant `Avatar` partagé** (`components/Avatar.tsx`)
à partir du pattern déjà existant dans `ProfileMenu.tsx` (`<img>` + fallback icône
Lucide `User` sur `onError`) — réutilisé ici pour l'en-tête du dashboard, et
réutilisable tel quel pour US-PRO-07/09 (paramètres, upload photo). `ProfileMenu`
a été mis à jour pour utiliser ce composant plutôt que de dupliquer la logique.

## US-PRO-02 / US-PRO-03

**US-PRO-02 / US-PRO-03 — Écart constaté sur les deux cartes : elles décrivent une
action rapide "vu" comme "déjà développée dans l'US Accueil/Catalogue", mais
`MediaCardActions` (utilisé sur Catalogue/Recherche depuis US-DET-08) n'avait que
favori/watchlist — aucune bascule "vu" au niveau carte n'existait avant maintenant
(US-DET-09 ne l'avait ajoutée qu'au niveau des fiches détail). Complété ici en
ajoutant un troisième bouton à `MediaCardActions` (icône `Check`, même pattern
optimiste que les deux autres, `useWatchedStatus` avec le scope "movie" ou "series"
selon `media.type`) plutôt que de laisser la carte s'appuyer sur une fonctionnalité
manquante.
Impact : cette bascule "vu" apparaît désormais aussi sur Catalogue et Recherche (pas
seulement Favoris/Watchlist), puisque les trois écrans partagent `MediaCardActions`.
Aucune régression attendue, uniquement un bouton supplémentaire.

**US-PRO-02 / US-PRO-03 — Pastille "type de contenu" non implémentée** : les deux
cartes demandent qu'elle soit masquée quand un onglet Films/Séries/Animés est actif
(redondante). Cette pastille n'existe nulle part dans l'app aujourd'hui — c'est une
étape technique de US-CAT-01 encore incomplète (voir note dans
`docs/decisions-log.md` / mémoire de session : "CAT-01 reste ouverte avec plusieurs
étapes frontend incomplètes : Voir plus, pastille type, loading/error, responsive").
Décision : ne pas la reconstruire ici par anticipation (US-CAT-01 n'est pas de mon
ressort et pourrait la faire différemment). Comme Favoris/Watchlist réutilisent le
même composant `MediaCard`/`CatalogGrid` que le Catalogue, le jour où US-CAT-01
ajoute la pastille, elle apparaîtra automatiquement ici aussi — aucun travail
supplémentaire prévu. Seul point à garder en tête pour l'implémenteur de CAT-01 :
prévoir un moyen de la masquer conditionnellement (probablement une prop sur
`MediaCard`), utile aux trois écrans (Catalogue, Favoris, Watchlist).

**US-PRO-02 — Pagination "Voir plus" (10 par 10)** implémentée via un hook dédié
`useLoadMoreMedias` (accumulation côté client, pas de remplacement de liste), plutôt
que le composant `Pagination` numéroté déjà utilisé par le Catalogue — les deux
cartes demandent explicitement un bouton "Voir plus", pas une pagination par numéros.

**US-PRO-03 — Sous-filtre "À voir / Vu"** implémenté par un `CASE` SQL corrélé
calculant `isWatched` par média (film : existence dans `media_user` ; série : tous
les épisodes vus, même règle que `isSeriesFullyWatched` de US-DET-09, y compris le
cas 0 épisode = non vu) puis un filtre sur ce résultat dans une sous-requête —
nécessaire car regarder si un média de la watchlist est "vu" demande une logique
différente selon `movie`/`tv`, non exprimable en une seule condition simple.

Testé en réel avec un utilisateur temporaire : dashboard à 0 partout avant toute
action, compteurs mis à jour après ajout de favoris/watchlist, filtre par type sur
favoris et watchlist, filtre "à voir"/"vu" sur la watchlist (y compris bascule après
qu'une série passe de partiellement à entièrement vue), 401 sans token sur les 3
nouvelles routes de lecture. Un bug réel trouvé et corrigé pendant ce test : `isWatched`
remontait `0`/`1` bruts (issus du `CASE` SQL) au lieu d'un booléen JS — corrigé par un
`.map()` de coercition dans `trackRepository`. Données de test nettoyées après coup.

## US-PRO-07

**US-PRO-07 — Boutons "Modifier"/"Changer la photo" et toggles Préférences
volontairement inertes dans cette US** (pas de `onClick`, `disabled` sur les
toggles) : la carte précise elle-même que cette US "pose la page et sa structure
générale... le détail fonctionnel de chaque bloc est traité dans les US dédiées".
Même pattern que les boutons "Vu"/"Noter" restés visibles mais désactivés avant
leurs US dédiées (US-DET-01 à 09). Seront branchés par US-PRO-08 (pseudo/email/mdp),
US-PRO-09 (photo) et US-PRO-10 (filtre PEGI).

**US-PRO-07 — `AuthContext` étendu avec `updateUser(patch)`** (merge partiel +
persistance `localStorage`), en prévision des US suivantes qui devront refléter côté
client un changement de pseudo/email/avatar/pegi/thème sans repasser par un nouveau
login. Ajouté maintenant plutôt que dans chaque US suivante, pour éviter de
retoucher `AuthContext` quatre fois de suite.

**US-PRO-07 — Boutons "Enregistrer"/"Annuler" positionnés au niveau de la section
Préférences**, pas au niveau de la page entière : les champs de la section Compte
(pseudo/email/mot de passe) ont chacun leur propre flux "Modifier" à sauvegarde
immédiate (US-PRO-08, explicite sur ce point : "mise à jour immédiate, pas de
confirmation"), alors que les deux toggles de Préférences (thème, PEGI) sont de
simples booléons qui se prêtent à un enregistrement groupé différé.

Vérifié : `tsc`/Biome propres sur les nouveaux fichiers, chaque module transformé
sans erreur par Vite (`/src/pages/Settings.tsx` et sous-composants, 200 sans erreur
dans les logs Vite). Page purement statique (pas de nouvel endpoint, pas de
mutation) — pas de vérification visuelle en navigateur cette fois (aucun outil de
navigation automatisée disponible dans cette session) ; à confirmer visuellement par
l'équipe.

## US-PRO-08

**US-PRO-08 — Contrainte UNIQUE sur `user_.email` déjà en place sur la base
partagée**, vérifiée par `SHOW INDEXES` avant de coder (`AK_user_` sur `email`) —
la carte demandait explicitement de l'ajouter si absente ; ce n'était pas
nécessaire, `CLAUDE.md` le documentait déjà comme fait.

**US-PRO-08 — Endpoints ajoutés au module `user/` existant** (pas un nouveau
module) : `PATCH /api/me/login`, `/api/me/email`, `/api/me/password` — ce module
gère déjà des mutations sur `user_` (préférences de genres), ces trois routes s'y
intègrent naturellement. `toPublicUser` exporté depuis `authActions.ts` (au lieu
d'être dupliqué) pour renvoyer un utilisateur au même format après modification.

**US-PRO-08 — Vérification d'unicité excluant l'utilisateur courant** : pseudo/email
peuvent être renvoyés inchangés (l'utilisateur "modifie" son pseudo pour la même
valeur) sans déclencher un faux 409 — l'égalité d'ID avec l'utilisateur courant est
explicitement autorisée.

**US-PRO-08 — Composant `Modal` partagé** extrait du pattern déjà utilisé dans
`Preferences.tsx` (`div.modal.modal-open` + `div.modal-box`), réutilisé pour les 3
nouvelles modales (pseudo/email/mot de passe) et pour la future modale d'upload de
photo (US-PRO-09).

Testé en réel avec 2 utilisateurs temporaires : changement de pseudo (succès, trop
court, doublon avec l'autre utilisateur, ré-écriture de sa propre valeur), changement
d'email (succès, format invalide, doublon), changement de mot de passe (mauvais mot
de passe actuel, nouveau trop court, confirmation différente, succès — puis connexion
réussie avec le nouveau mot de passe et refusée avec l'ancien), 401 sans token sur
les 3 routes. Utilisateurs de test nettoyés après coup.

## US-PRO-09

**US-PRO-09 — Stockage local sur le serveur, dans `server/public/uploads/avatars/`**
(déjà servi statiquement via `express.static` sur `server/public`, voir `app.ts`) —
c'est exactement ce que demande la carte ("stockage de fichier côté serveur, le champ
avatar en base stocke le chemin/URL"). Nouveau dossier ajouté à `.gitignore`
(`server/public/uploads/`) pour ne jamais committer de contenu uploadé par les
utilisateurs.

**US-PRO-09 — Toutes les photos sont ré-encodées en WEBP**, quel que soit le format
d'origine (JPG/PNG/WEBP acceptés en entrée) — simplifie le code (un seul chemin
d'encodage de sortie, pas de branchement par mimetype) et réduit le poids stocké.
Rien dans la carte n'imposait de conserver le format d'origine.

**US-PRO-09 — Redimensionnement via `sharp` `.resize(1024, 1024, { fit: "inside",
withoutEnlargement: true })`** : respecte exactement la règle de la carte
("redimensionnement automatique si l'image dépasse 1024×1024px"), sans jamais
agrandir une image plus petite, et sans forcer un recadrage carré côté serveur (le
recadrage carré reste une recommandation UI, pas une contrainte serveur, comme
formulé dans la carte — "recadrage carré recommandé").

**US-PRO-09 — Ancien fichier supprimé lors d'un remplacement**, uniquement s'il
s'agit bien d'un fichier uploadé (préfixe `/uploads/avatars/`) — jamais l'avatar par
défaut (`/assets/images/default-avatar.svg`, qui n'est pas un fichier géré par cette
route). Évite une accumulation de fichiers orphelins à chaque changement de photo.

**US-PRO-09 — Erreurs Multer traduites en 400 propres** (fichier trop lourd, type non
supporté) via un middleware `avatarUpload` qui enveloppe `multer.single()` — sans ce
wrapper, une erreur Multer remonte telle quelle au handler d'erreurs global de
l'app (`logErrors`), qui répond en 500 générique, sémantiquement faux pour une
erreur de saisie utilisateur.

**US-PRO-09 — Fichier `server/public/assets/images/default-avatar.svg` toujours
manquant sur disque** (écart déjà documenté : la base pointe vers ce chemin par
défaut, mais le fichier n'existe pas). Non corrigé ici — hors périmètre de cette US,
et sans impact fonctionnel puisque le composant `Avatar` (US-PRO-01) affiche déjà
l'icône Lucide `User` en repli sur l'échec de chargement.

Testé en réel avec un utilisateur temporaire et des images générées via `sharp`
(pas de fichier statique versionné pour le test) : upload PNG 2000×1500 → vérifié
redimensionné à ≤1024×1024 et réencodé en WEBP, second upload JPEG qui remplace le
premier (ancien fichier confirmé supprimé du disque), type de fichier invalide → 400,
fichier > 5 Mo → 400, requête sans fichier → 400, sans token → 401. Utilisateur,
fichiers uploadés et script de test temporaire nettoyés après coup.

## US-PRO-10

**US-PRO-10 — Bug réel trouvé et corrigé : `is_pegi16` était positionné selon l'âge
à l'inscription (`isPegi16FromBirthDate`, US-AUTH-01/02, déjà commité et testé plus
tôt dans cette session), pas désactivé par défaut comme l'exige explicitement cette
carte ("désactivé par défaut à l'inscription"). Conséquence concrète : tout
utilisateur de 16 ans ou plus se retrouvait avec le filtre "actif" dès l'inscription
(masquant le contenu 16+ sans l'avoir demandé), et un utilisateur de moins de 16 ans
avec le filtre "inactif" (montrant du contenu 16+/18) — l'inverse de l'usage attendu
d'un filtre de ce type. Corrigé : `register` fixe désormais `isPegi16: false` pour
tout le monde, sans lien avec la date de naissance ; la fonction
`isPegi16FromBirthDate` et son usage ont été supprimés (plus aucun appelant).
Impact : les 2 utilisateurs présents sur la base partagée au moment de la
découverte étaient tous les deux des comptes de test que j'avais moi-même créés
plus tôt dans la session (un oubli de nettoyage après US-DET-07) — supprimés,
aucun compte réel d'un membre de l'équipe n'était affecté à ce stade.

**US-PRO-10 — `optionalAuth` ajouté sur `/api/medias/discover`, `/api/medias` et
`/api/medias/search`**, qui n'avaient jusqu'ici AUCUN middleware d'auth alors que
`readDiscoverSections` lisait déjà `req.user?.id` pour les sections par genre
personnalisées (US-ACC-02/CAT-01). Sans `optionalAuth`, `req.user` était toujours
`undefined` sur ces routes : la personnalisation par genre n'a donc jamais
fonctionné en pratique pour un utilisateur connecté, depuis sa mise en place — bug
préexistant, corrigé ici comme effet de bord nécessaire (ces routes ont de toute
façon besoin de `req.user` pour appliquer le filtre PEGI). À signaler à l'équipe :
si quelqu'un a déjà vérifié "à l'œil" que les sections par genre semblaient
pertinentes sans être connecté, c'est un hasard (mêmes genres pour tout le monde).

**US-PRO-10 — Filtre appliqué aussi sur Favoris/Watchlist (US-PRO-02/03) et pas
seulement Catalogue/Recherche/Accueil**, conformément à la formulation "TOUTES les
pages et sections listant des médias" de la carte. Concrètement : un média déjà
mis en favori/watchlist reste cependant masqué de ces listes tant que le filtre est
actif, même si l'utilisateur l'a lui-même ajouté avant d'activer le filtre — lecture
littérale retenue plutôt qu'une exception "mes propres choix restent visibles", qui
n'est écrite nulle part dans la carte.

**US-PRO-10 — [SUPERSEDÉ, voir addendum ci-dessous] Détection d'un accès direct aux
fiches détail** : au moment du premier passage sur cette US, la carte semblait
scoper le filtre aux pages/sections qui LISTENT des médias, sans traiter l'accès
direct à une fiche via son URL — non implémenté à ce stade, avec une note sur le
code `403` documenté dans la convention de nommage de l'équipe pour ce cas
("interdit (PEGI, média non vu)"). Clarification produit reçue le 2026-09-11 :
l'accès direct DOIT aussi être bloqué pour un utilisateur connecté avec le filtre
actif — voir l'addendum "US-PRO-10 (suite)" plus bas pour l'implémentation.

**US-PRO-10 — Utilitaire `applyPegiFilter.ts` extrait dans `server/src/utils/`**
(`pegiFilterClause(alias)` + constante `PEGI16_VALUES` partagée) après avoir
remarqué que le fichier de convention de nommage de l'équipe nomme explicitement
cet utilitaire ("apply : utilitaire transverse appliqué à une requête —
`applyPegiFilter`") — remplace 3 définitions dupliquées de la même constante/clause
dans `catalogRepository`, `searchRepository` et `trackRepository`.

**US-PRO-10 — Badge PEGI ajouté sur les cards** (`MediaCard`, réutilisé par
Catalogue/Favoris/Watchlist, et `SearchResultCard`) — n'existait auparavant que sur
les fiches détail (film/série, depuis Phase 2). Conforme à "affichée en permanence
sur chaque card et fiche détaillée, indépendamment du filtre" : le badge reste
visible que le filtre soit actif ou non, seule la présence du média dans la liste
change.

**US-PRO-10 — PEGI reste en VARCHAR** (`'TP'|'10'|'12'|'16'|'18'`), conforme à la
décision déjà actée (voir CLAUDE.md et US-CAT-02) — la carte mentionne à nouveau une
colonne "en INT", non suivi ici pour la même raison qu'alors. Le filtre compare
directement aux valeurs `'16'`/`'18'` (pas de conversion numérique nécessaire).

Testé en réel avec un utilisateur temporaire, un média PEGI 16 et un média PEGI 18
existants en base : filtre désactivé par défaut à l'inscription (bug ci-dessus
confirmé corrigé), contenu 16+/18 visible partout filtre coupé, masqué partout
(Catalogue, Recherche, Favoris, Watchlist) filtre actif — y compris un média déjà
favori/watchlist avant l'activation — visiteur non connecté jamais filtré, contenu
qui réapparaît à la désactivation, 401 sans token et 400 sur payload invalide sur
la route de toggle. Utilisateurs de test nettoyés après coup ; base partagée
vérifiée à 0 utilisateur restant après cette phase.

### US-PRO-10 (suite, 2026-09-11) — Blocage de l'accès direct + confirmation visiteur

**Clarification produit reçue** : le filtre PEGI doit aussi bloquer l'accès direct
par URL à une fiche détail 16+/18 (film, série, saison, épisode) pour un
utilisateur connecté avec le filtre actif — pas seulement l'exclure des listes.
Et confirmation explicitement demandée : un visiteur non connecté ne doit jamais
être filtré, ni sur les listes ni sur les fiches détail.

**Implémentation** : chaque route de lecture de fiche détail
(`GET /api/medias/:id`, `/api/series/:id`, `/api/series/:serieId/seasons/:seasonId`,
`/api/series/:serieId/seasons/:seasonId/episodes/:episodeId`) vérifie, juste après
avoir chargé la ressource et confirmé qu'elle existe : si `req.user` est présent
(connecté) ET que le PEGI du média concerné est `'16'` ou `'18'` ET que
`is_pegi16` de cet utilisateur est actif → réponse `403` (pas de corps), sans
exécuter le reste des requêtes de la page (cast, plateformes, etc.). Nouvelle
fonction `isPegiRestricted(pegi)` ajoutée à `applyPegiFilter.ts`, réutilisée ici
comme dans les clauses SQL des listes. Saison et épisode n'ayant pas de colonne
`pegi` propre, `seasonRepository.read`/`episodeRepository.read` remontent
désormais aussi `m.pegi AS seriesPegi` (le PEGI du média parent) dans leur
`SELECT` existant — aucune requête supplémentaire.

Code retour `403` choisi en cohérence avec le fichier de convention de nommage de
l'équipe, qui le réserve explicitement à ce cas ("interdit (PEGI, média non vu)").

**Confirmation du comportement visiteur** : aucun changement de code nécessaire
côté visiteur — `userId` (`req.user?.id`) est toujours `undefined` sans token
valide (aucune des routes de liste ni de détail ne force l'authentification), donc
la condition `userId != null` est déjà fausse pour tout visiteur, sur les listes
comme sur les fiches détail. Vérifié en réel (voir tests ci-dessous) plutôt que
supposé correct.

**Frontend — messages d'erreur distingués** : `fetchMedia`/`fetchSeries`/
`fetchSeason`/`fetchEpisode` (`client/src/services/api.ts`) détectent désormais un
`403` et lèvent un message dédié ("Ce contenu est masqué par votre filtre PEGI
16+...") plutôt que le message générique "introuvable" — sans cela, un utilisateur
bloqué par son propre filtre aurait vu un message laissant croire que le contenu
n'existe pas. Les 4 pages détail (`MovieDetail`, `SerieDetail`, `SeasonDetail`,
`EpisodeDetail`) affichent désormais `err.message` au lieu d'un texte figé.

Testé en réel avec un utilisateur temporaire, un film PEGI 16, une série PEGI 18
(saison + épisode inclus) et un contenu "sûr" (PEGI 12) :
- **Visiteur (sans token)** : catalogue, recherche, ET accès direct aux 4 types de
  fiche détail (film/série/saison/épisode 16+/18) → toujours 200, jamais filtré.
- **Connecté, filtre désactivé par défaut** : accès direct au film 16+ → 200.
- **Connecté, filtre activé** : accès direct au film 16+, à la série 18, à sa
  saison et à son épisode → 403 sur les 4 ; le contenu "sûr" reste accessible en
  200 pendant que le filtre est actif (pas de sur-blocage) ; un visiteur qui
  consulte en parallèle le même film 16+ reste à 200 (le filtre est bien par
  utilisateur, pas global).
- **Connecté, filtre réactivé puis désactivé** : les 4 routes 16+/18 repassent à
  200.
Utilisateur de test nettoyé après coup ; base partagée revérifiée à 0 utilisateur
restant.

## US-PRO-11

**US-PRO-11 — Mécanisme calqué sur ce que l'équipe avait déjà anticipé** :
`tailwind.config.js` contenait déjà un commentaire explicite ("Quand le thème clair
arrivera... il suffira d'ajouter un objet 'focus-light'... et de basculer l'attribut
`data-theme` sur `<html>`") et `index.html` a déjà `data-theme="focus"` en dur. Le
nouveau `ThemeContext` (`client/src/contexts/ThemeContext.tsx`, même structure que
`AuthContext` : provider + hook `useTheme` dans un seul fichier) applique cet
attribut dynamiquement (`"focus"` / `"focus-light"`) et persiste le choix à la fois
en `localStorage` (visiteur) et via `PATCH /api/me/theme` → `user_.dark_theme`
(utilisateur connecté). Le thème `"focus-light"` n'existe pas encore dans
`tailwind.config.js` — bascule vers ce thème actuellement sans effet visuel
(DaisyUI retombe sur ses valeurs par défaut), sans impact pratique puisque le
toggle reste non interactif dans l'UI (cf. ci-dessous).

**US-PRO-11 — Toggle "Thème sombre" reste `disabled` dans `PreferencesSection`**,
conforme à la carte ("le toggle est affiché mais désactivé, avec la mention 'Non
disponible'"). Il reflète toutefois la vraie valeur de `useTheme().isDarkTheme`
(plutôt qu'un `checked` figé en dur) : mécanique complète en place, seule
l'interaction utilisateur est coupée pour l'instant.

**US-PRO-11 — Persistance double (localStorage + backend)** : un visiteur non
connecté garde son choix de thème d'une visite à l'autre via `localStorage` (aucun
compte pour stocker `dark_theme`) ; un utilisateur connecté voit son choix
synchronisé sur son compte (`dark_theme` déjà présent sur `user_`, défaut `TRUE`
= sombre). Au login, le thème du compte prime sur celui éventuellement stocké en
local (cohérent avec le fait que le compte est la source de vérité une fois connecté).

Testé en réel : `PATCH /api/me/theme` avec `true`/`false` (200, valeur reflétée dans
la réponse), 401 sans token, 400 sur payload invalide. Frontend vérifié par
transformation Vite sans erreur sur `ThemeContext.tsx`, `main.tsx` et
`PreferencesSection.tsx` (pas de vérification visuelle en navigateur, comme pour
US-PRO-07 — aucun outil de navigation automatisée disponible dans cette session).
Utilisateur de test nettoyé après coup.

## US-ACC-01 / US-ACC-02

**Point bloquant remonté immédiatement (2026-09-11)** : en préparant la Phase 5
(ACC-04/05/03 planifiés), j'ai constaté que `Homepage.tsx` était toujours un stub
(`<h1>WORK IN PROGRESS</h1>`) — US-ACC-01 (page d'accueil de base, 3 carrousels)
n'avait en réalité jamais été reconstruite, malgré la note de `CLAUDE.md`
("US-ACC-01 à réécrire entièrement") datant de la Phase 0. La carte Trello
US-ACC-01 est d'ailleurs toujours listée "En cours" côté équipe. Or US-ACC-03/04/05
supposent toutes une page d'Accueil déjà fonctionnelle sur laquelle se greffer
(US-ACC-04 : "une section apparaît sur la page d'Accueil"). Remonté au produit
avant d'avancer plutôt que de décider seul comment traiter ce trou : réponse reçue
— construire US-ACC-01 + US-ACC-02 d'abord, puis enchaîner sur ACC-03/04/05 dans
la même phase.

**US-ACC-01 — Card vague ("trois grandes catégories: film, série" — n'en cite que
deux sur trois) et US-ACC-02 sans description du tout.** Interprétation retenue,
basée sur le titre + les branches existantes : 3 carrousels par catégorie
(Films/Séries/Animés — la 3e catégorie manquante dans la formulation de la carte
est très probablement "Animés", cohérent avec la taxonomie déjà utilisée partout
ailleurs dans l'app), plus 1 carrousel "Populaires" (US-ACC-02, top noté toutes
catégories confondues) — même page, même utilisateur connecté ou non (aucune
personnalisation à ce stade, qui est le rôle d'ACC-03/04/05). Un ancien module
`Homepage/` existait sur la branche non mergée `origin/US-ACC-01` (jamais
mergée, nommage non conforme comme documenté en Phase 0, colonnes SQL exposées en
snake_case au lieu de camelCase) — consulté pour la forme générale (`{films,
series, animes}`, tri par note, badges top3/top10/nouveau) mais pas réutilisé tel
quel : nouveau module `homepage/` (conventions correctes), réutilise directement
`catalogRepository.readTopRated` (déjà filtré PEGI depuis US-PRO-10, déjà avec
`genreName`) plutôt que dupliquer une requête SQL.

**US-ACC-01/02 — Utilitaires `enrichRanking`/`isMediaNew` extraits de
`catalogActions.ts` vers `server/src/utils/enrichRanking.ts`**, et
`resolveHidePegi16` vers `applyPegiFilter.ts` (déjà le foyer des utilitaires PEGI) —
réutilisés à l'identique par `catalogActions` et le nouveau `homepageActions`, pas
de duplication entre Catalogue et Accueil pour ces deux préoccupations transverses.

**US-ACC-01/02 — Un seul endpoint `GET /api/medias/home`** (protégé par
`optionalAuth`, nécessaire pour le filtre PEGI par utilisateur) renvoyant les 4
sections en un aller-retour (`{popular, movies, series, animes}`), plutôt que 4
appels séparés au Catalogue — évite 4 requêtes réseau au chargement de l'Accueil.
Limite de 20 éléments par section (aucune limite précisée par les cartes, valeur
alignée sur celle déjà utilisée par les sections "Populaires"/"Nouveautés" du
Catalogue).

**US-ACC-01/02 — Frontend réutilise `MediaSection`/`Carousel`/`MediaCard` du
Catalogue tels quels**, aucun nouveau composant de présentation nécessaire — les
badges Top 3/Top 10/Nouveau et le badge PEGI (US-PRO-10) apparaissent donc aussi
sur l'Accueil par simple réutilisation, cohérent avec le Catalogue.

Testé en réel : `GET /api/medias/home` en visiteur (4 sections peuplées, animés
correctement détectés via `is_anime` même si `type` reste `'tv'` en base) et avec
un utilisateur temporaire filtre PEGI actif/inactif (un film PEGI 16 disparaît de
`popular`/`movies` filtre actif, réapparaît filtre coupé — cohérent avec
US-PRO-10). Frontend vérifié par transformation Vite sans erreur sur
`Homepage.tsx` et `catalogService.ts` (pas de vérification visuelle en
navigateur). Utilisateur de test nettoyé après coup.
