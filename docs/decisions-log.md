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
